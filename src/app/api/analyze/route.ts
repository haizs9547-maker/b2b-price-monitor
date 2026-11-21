import { NextResponse } from "next/server";
import { enforceRateLimit, extractClientIp } from "@/lib/rate-limit";
import { fetchCompetitorPage, PageFetchError } from "@/lib/scraper";
import { analyzeCompetitorWithAI, getSnapshotProvider, SnapshotProviderError } from "@/lib/deepseek";
import { JsonBodyError, readJsonObject } from "@/lib/request-json";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit(`analyze:${extractClientIp(request)}`);
  const headers = {
    "Cache-Control": "no-store",
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(rateLimit.resetAt),
    "X-RateLimit-Backend": rateLimit.backend,
  };
  const fail = (error: string, status: number) => NextResponse.json(
    { error, rateLimit },
    {
      status,
      headers: status === 429
        ? { ...headers, "Retry-After": String(Math.max(1, rateLimit.resetAt - Math.floor(Date.now() / 1000))) }
        : headers,
    },
  );

  if (!rateLimit.allowed) return fail("Free snapshot limit reached (5 requests per hour). Check back after your quota resets.", 429);

  try {
    const { url } = await readJsonObject(request, 8 * 1024);
    if (typeof url !== "string" || !url.trim()) {
      return fail("Enter a public competitor webpage URL.", 400);
    }
    const provider = getSnapshotProvider();
    const page = await fetchCompetitorPage(url);
    const snapshot = await analyzeCompetitorWithAI(page, provider);
    return NextResponse.json({
      ok: true,
      page: {
        url: page.normalizedUrl,
        hostname: page.hostname,
        title: page.title,
        fetchedAt: page.fetchedAt,
        priceSignalsFound: page.priceSnippets.length,
      },
      snapshot,
      rateLimit,
    }, { headers });
  } catch (error) {
    if (error instanceof JsonBodyError || error instanceof SnapshotProviderError) return fail(error.message, error.status);
    if (error instanceof PageFetchError) return fail(error.message, 422);
    console.error("[ANALYZE] Unexpected snapshot failure.");
    return fail("Could not generate the snapshot. Please try again.", 500);
  }
}
