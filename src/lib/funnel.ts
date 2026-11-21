export const FUNNEL_STEPS = [
  "page_view_utm", "url_submitted", "snapshot_generated", "upgrade_clicked", "lead_submitted",
] as const;
export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type Attribution = Record<(typeof UTM_KEYS)[number], string> & {
  landingPage: string;
  referrer: string;
  sessionId: string;
};

export function safePagePath(value: unknown): string {
  return typeof value === "string" && /^\/[a-z\d/-]{0,180}$/i.test(value) && !value.startsWith("//")
    ? value : "/";
}

export function publicPageLabel(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password ||
        (!url.hostname.includes(".") && !url.hostname.startsWith("["))) return "";
    return (url.origin + url.pathname).slice(0, 500);
  } catch {
    return "";
  }
}

type Visit = { attribution: Attribution; viewSent: boolean };
const STORAGE_KEY = "pricepulse_attribution_v2";
let currentVisit: Visit | undefined;

function saveVisit(visit: Visit) {
  currentVisit = visit;
  try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visit)); }
  catch { /* The in-memory visit works when storage is blocked. */ }
}

function visitFor(path = window.location.pathname, search = window.location.search): Visit {
  if (!currentVisit) {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) currentVisit = JSON.parse(saved) as Visit;
    } catch { /* Start a fresh visit. */ }
  }
  const params = new URLSearchParams(search);
  const campaign = {
    utm_source: params.get("utm_source")?.slice(0, 160) || "",
    utm_medium: params.get("utm_medium")?.slice(0, 160) || "",
    utm_campaign: params.get("utm_campaign")?.slice(0, 160) || "",
    utm_content: params.get("utm_content")?.slice(0, 160) || "",
    utm_term: params.get("utm_term")?.slice(0, 160) || "",
  };
  const previous = currentVisit?.attribution;
  const newCampaign = UTM_KEYS.some((key) => campaign[key]) &&
    (previous?.landingPage !== path || UTM_KEYS.some((key) => campaign[key] !== previous?.[key]));
  if (currentVisit && previous?.sessionId && !newCampaign) return currentVisit;

  const sessionId = Array.from(crypto.getRandomValues(new Uint8Array(16)),
    (byte) => byte.toString(16).padStart(2, "0")).join("");
  const visit = {
    viewSent: false,
    attribution: {
      ...campaign,
      sessionId,
      landingPage: safePagePath(path),
      referrer: publicPageLabel(document.referrer),
    },
  };
  saveVisit(visit);
  return visit;
}

export function captureAttribution(): Attribution {
  return visitFor().attribution;
}

export function trackFunnelEvent(
  step: FunnelStep,
  meta: { sourceSlug?: string; hostname?: string; tiersFound?: number; channel?: string } = {},
  attribution = captureAttribution(),
): void {
  void fetch("/api/funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, path: window.location.pathname, attribution, meta }),
    keepalive: true,
  }).catch(() => {});
}

export function trackLandingVisit(path: string, search: string) {
  const visit = visitFor(path, search);
  if (!visit.viewSent) {
    saveVisit({ ...visit, viewSent: true });
    const sourceSlug = safePagePath(path).slice(1) || "home";
    trackFunnelEvent("page_view_utm", { sourceSlug }, visit.attribution);
  }
}
