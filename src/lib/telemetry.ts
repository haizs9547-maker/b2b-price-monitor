import { publicPageLabel, safePagePath, UTM_KEYS } from "./funnel";
import { isRecord } from "./request-json";

export function normalizeAttribution(value: unknown) {
  const input = isRecord(value) ? value : {};
  const sessionId = typeof input.sessionId === "string" && /^[a-f0-9]{32}$/.test(input.sessionId)
    ? input.sessionId : "";
  return {
    ...Object.fromEntries(UTM_KEYS.map((key) => [key, typeof input[key] === "string" ? input[key].slice(0, 160) : ""])),
    sessionId,
    landingPage: safePagePath(input.landingPage ?? input.landing_path),
    referrer: publicPageLabel(input.referrer),
  };
}

export function normalizeSource(value: unknown): string {
  return typeof value === "string" && /^[a-z\d-]{1,120}$/.test(value) ? value : "home";
}

export async function sendTelemetryWebhook(
  env: "LEAD_WEBHOOK_URL" | "FUNNEL_WEBHOOK_URL",
  record: object,
) {
  const url = process.env[env]?.trim();
  if (!url) return;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      redirect: "error",
      signal: AbortSignal.timeout(2_000),
    });
    void response.body?.cancel().catch(() => {});
    if (!response.ok) console.warn(`[${env}] HTTP ${response.status}`);
  } catch {
    console.warn(`[${env}] Delivery failed`);
  }
}
