import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import { request as httpRequest, type IncomingMessage, type RequestOptions } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";
import { brotliDecompressSync, gunzipSync, inflateSync } from "node:zlib";
import { DomUtils, parseDocument } from "htmlparser2";

export interface ExtractedPageData {
  normalizedUrl: string;
  hostname: string;
  title: string;
  metaDescription: string;
  headings: string[];
  priceSnippets: string[];
  visibleText: string;
  fetchedAt: string;
}

export class PageFetchError extends Error {}

const MAX_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 4;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const PUBLIC_IPV6 = new BlockList();
PUBLIC_IPV6.addSubnet("2000::", 3, "ipv6");

const NON_PUBLIC = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10],
  ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
  ["203.0.113.0", 24], ["224.0.0.0", 3],
] as const) NON_PUBLIC.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [
  ["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20],
] as const) NON_PUBLIC.addSubnet(address, prefix, "ipv6");

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !NON_PUBLIC.check(address, "ipv4");
  // Global unicast only. This also excludes mapped IPv4, NAT64, ULA and link-local.
  return family === 6 && PUBLIC_IPV6.check(address, "ipv6") &&
    !NON_PUBLIC.check(address, "ipv6");
}

function hostnameOf(url: URL): string {
  return url.hostname.replace(/^\[|\]$|\.$/g, "");
}

export function validatePublicUrl(input: string): URL {
  const value = input.trim();
  if (!value || value.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(value)) {
    throw new PageFetchError("Enter a valid public webpage URL (up to 2,048 characters).");
  }
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value) && !/^[^/?#]*:\d+(?:[/?#]|$)/.test(value);
  let url: URL;
  try {
    url = new URL(hasScheme ? value : `https://${value}`);
  } catch {
    throw new PageFetchError("Invalid URL. Example: https://linear.app/pricing");
  }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    throw new PageFetchError("Use an HTTP or HTTPS URL without credentials.");
  }
  const host = hostnameOf(url);
  const family = isIP(host);
  const isLocalName = !host.includes(".") ||
    /(?:^|\.)(?:localhost|local|internal|lan|onion|test|invalid|example)$|(?:^|\.)home\.arpa$/.test(host);
  if (family ? !isPublicAddress(host) : isLocalName) {
    throw new PageFetchError("Private, local, and reserved network URLs are blocked.");
  }
  url.hash = "";
  return url;
}

async function resolvePublic(host: string, signal: AbortSignal): Promise<LookupAddress[]> {
  signal.throwIfAborted();
  const family = isIP(host);
  if (family) return [{ address: host, family }];

  const addresses = await new Promise<LookupAddress[]>((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    void lookup(host, { all: true }).then(resolve, reject).finally(() => {
      signal.removeEventListener("abort", onAbort);
    });
  });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new PageFetchError("The webpage hostname must resolve only to public IP addresses.");
  }
  return addresses;
}

async function requestPage(url: URL, signal: AbortSignal): Promise<IncomingMessage> {
  const hostname = hostnameOf(url);
  const addresses = await resolvePublic(hostname, signal);
  // Keep the original hostname for HTTP Host and TLS, but never resolve it again.
  const pinnedLookup: LookupFunction = (_host, options, done) => {
    if (options.all) done(null, addresses);
    else done(null, addresses[0].address, addresses[0].family);
  };
  const request = url.protocol === "https:" ? httpsRequest : httpRequest;
  const options: RequestOptions & { autoSelectFamily: boolean } = {
    hostname,
    port: url.port || undefined,
    path: url.pathname + url.search,
    agent: false,
    autoSelectFamily: true,
    lookup: pinnedLookup,
    signal,
    maxHeaderSize: 16 * 1024,
    headers: {
      "User-Agent": "PricePulseBot/1.0 (public competitor pricing snapshot)",
      Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    },
  };
  return new Promise((resolve, reject) => {
    request(options, resolve).once("error", reject).end();
  });
}

async function readPage(response: IncomingMessage): Promise<{ text: string; plain: boolean }> {
  const type = response.headers["content-type"] || "";
  const mime = type.split(";")[0].trim().toLowerCase();
  if (!["text/html", "application/xhtml+xml", "text/plain"].includes(mime)) {
    throw new PageFetchError("The target did not return an HTML or plain-text webpage.");
  }
  const tooLarge = () => new PageFetchError("The webpage exceeds the 2 MiB response limit.");
  if (Number(response.headers["content-length"]) > MAX_BYTES) throw tooLarge();
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of response) {
    size += chunk.length;
    if (size > MAX_BYTES) throw tooLarge();
    chunks.push(chunk);
  }
  let bytes = Buffer.concat(chunks, size);
  const encoding = response.headers["content-encoding"]?.trim().toLowerCase();
  const options = { maxOutputLength: MAX_BYTES };
  try {
    if (encoding === "gzip") bytes = gunzipSync(bytes, options);
    else if (encoding === "deflate") bytes = inflateSync(bytes, options);
    else if (encoding === "br") bytes = brotliDecompressSync(bytes, options);
    else if (encoding && encoding !== "identity") {
      throw new PageFetchError("The webpage uses an unsupported content encoding.");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ERR_BUFFER_TOO_LARGE") throw tooLarge();
    if (error instanceof PageFetchError) throw error;
    throw new PageFetchError("Could not decode the compressed webpage.");
  }
  const charset = type.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1] ||
    (mime === "text/plain" ? undefined : bytes.toString("latin1", 0, 1024)
      .match(/<meta\b[^>]*\bcharset\s*=\s*["']?([\w-]+)/i)?.[1]);
  let decoder = new TextDecoder();
  if (charset) {
    try { decoder = new TextDecoder(charset); } catch { /* Fall back to UTF-8. */ }
  }
  return { text: decoder.decode(bytes), plain: mime === "text/plain" };
}

const OMIT = new Set(["script", "style", "noscript", "template", "svg", "iframe", "textarea"]);
const BLOCK = new Set([
  "article", "aside", "blockquote", "br", "dd", "div", "dl", "dt", "footer", "header",
  "li", "main", "nav", "ol", "p", "section", "table", "td", "th", "tr", "ul",
]);

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractHtml(html: string) {
  const doc = parseDocument(html);
  const parts: string[] = [];
  const headings: string[] = [];
  let title = "";
  let description = "";
  let ogDescription = "";
  type Node = (typeof doc.children)[number];
  const stack: Array<{ node: Node; inHead: boolean; end?: number }> = [];
  for (let index = doc.children.length - 1; index >= 0; index--) {
    stack.push({ node: doc.children[index], inHead: false });
  }
  while (stack.length) {
    const { node, inHead, end } = stack.pop()!;
    if (DomUtils.isText(node)) {
      if (!inHead) parts.push(node.data);
      continue;
    }
    if (!DomUtils.isTag(node)) continue;
    const { name, attribs, children } = node;
    const heading = /^h[1-6]$/.test(name);
    if (end !== undefined) {
      if (heading && headings.length < 18) {
        const text = collapse(parts.slice(end).join("")).slice(0, 160);
        if (text && !headings.includes(text)) headings.push(text);
      }
      parts.push("\n");
      continue;
    }
    if (name === "title") {
      title ||= collapse(children.filter(DomUtils.isText).map((child) => child.data).join("")).slice(0, 180);
      continue;
    }
    if (name === "meta") {
      if (attribs.name?.toLowerCase() === "description") description ||= attribs.content || "";
      if (attribs.property?.toLowerCase() === "og:description") ogDescription ||= attribs.content || "";
      continue;
    }
    if (OMIT.has(name) || "hidden" in attribs || /^true$/i.test(attribs["aria-hidden"] || "") ||
        /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\b/i.test(attribs.style || "")) {
      continue;
    }
    if (!inHead && (BLOCK.has(name) || heading)) {
      parts.push("\n");
      stack.push({ node, inHead, end: parts.length });
    }
    for (let index = children.length - 1; index >= 0; index--) {
      stack.push({ node: children[index], inHead: inHead || name === "head" });
    }
  }
  return { title, metaDescription: collapse(description || ogDescription).slice(0, 300), headings, text: parts.join("") };
}

function extractPriceSnippets(text: string): string[] {
  const amount = String.raw`\d(?:[\d,. ]{0,18}\d)?`;
  const pattern = new RegExp([
    String.raw`(?:[$€£¥₹]\s?|\b(?:USD|EUR|GBP|CAD|AUD|JPY|INR)\s)${amount}`,
    String.raw`\b${amount}\s?(?:€|USD\b|EUR\b|GBP\b)`,
    String.raw`\b\d{1,3}%\s?(?:off|discount|savings)\b|\bsave\s\d{1,3}%`,
    String.raw`\b(?:free trial|free plan|contact sales|custom pricing)\b`,
  ].join("|"), "gi");
  const snippets = new Set<string>();
  for (const match of text.matchAll(pattern)) {
    const index = match.index!;
    snippets.add(collapse(text.slice(Math.max(0, index - 54), index + match[0].length + 70)));
    if (snippets.size >= 30) break;
  }
  return [...snippets];
}

export async function fetchCompetitorPage(rawUrl: string): Promise<ExtractedPageData> {
  let url = validatePublicUrl(rawUrl);
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const response = await requestPage(url, signal);
      try {
        const status = response.statusCode || 0;
        if (REDIRECT_STATUSES.has(status)) {
          if (!response.headers.location || hop === MAX_REDIRECTS) {
            throw new PageFetchError("The target returned an invalid or excessive redirect chain.");
          }
          let next: URL;
          try { next = new URL(response.headers.location, url); }
          catch { throw new PageFetchError("The target returned an invalid redirect URL."); }
          url = validatePublicUrl(next.href);
          continue;
        }
        if (status < 200 || status >= 300) {
          throw new PageFetchError(`The target returned HTTP ${status}. Try a public webpage that permits automated requests.`);
        }
        const body = await readPage(response);
        const extracted = body.plain
          ? { text: body.text, title: "", metaDescription: "", headings: [] }
          : extractHtml(body.text);
        const visibleText = extracted.text.split("\n").map(collapse).filter(Boolean).join("\n");
        if (visibleText.length < 40) {
          throw new PageFetchError("Too little public text was found. Try a page that shows its offers without a login or JavaScript.");
        }
        return {
          normalizedUrl: url.href,
          hostname: hostnameOf(url),
          title: extracted.title || hostnameOf(url),
          metaDescription: extracted.metaDescription,
          headings: extracted.headings,
          priceSnippets: extractPriceSnippets(visibleText),
          visibleText: visibleText.slice(0, 12_000),
          fetchedAt: new Date().toISOString(),
        };
      } finally {
        response.destroy();
      }
    }
  } catch (error) {
    if (signal.aborted) throw new PageFetchError("The webpage took too long to respond (8-second limit).");
    if (error instanceof PageFetchError) throw error;
    throw new PageFetchError("Could not connect to the target webpage. Check the URL and try again.");
  }
  throw new PageFetchError("Too many redirects.");
}
