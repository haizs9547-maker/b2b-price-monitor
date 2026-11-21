import { NextResponse } from "next/server";
import { FUNNEL_STEPS, type FunnelStep, safePagePath } from "@/lib/funnel";
import { isRecord, JsonBodyError, readJsonObject } from "@/lib/request-json";
import { enforceRateLimit, extractClientIp } from "@/lib/rate-limit";
import { normalizeAttribution, normalizeSource, sendTelemetryWebhook } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

const state = globalThis as typeof globalThis & { pricePulseFunnelCounts?: Record<FunnelStep, number> };
const counts = state.pricePulseFunnelCounts ??= {
  page_view_utm: 0,
  url_submitted: 0,
  snapshot_generated: 0,
  upgrade_clicked: 0,
  lead_submitted: 0,
};

export function GET() {
  return NextResponse.json({ ok: true, note: "Counts for this process only.", counts }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const payload = await readJsonObject(request, 8 * 1024);
    const step = FUNNEL_STEPS.find((candidate) => candidate === payload.step);
    if (!step) return NextResponse.json({ error: "Unknown funnel step." }, { status: 400 });
    const rate = await enforceRateLimit(`funnel:${extractClientIp(request)}`, 120);
    if (!rate.allowed) return NextResponse.json({ error: "Funnel event limit reached." }, { status: 429 });
    const meta = isRecord(payload.meta) ? payload.meta : {};
    const channel = ["early_bird_email", "stripe_checkout"].find((item) => item === meta.channel);
    const hostname = typeof meta.hostname === "string" && /^[\w.:[\]-]{1,253}$/.test(meta.hostname)
      ? meta.hostname : undefined;
    const tiersFound = typeof meta.tiersFound === "number" && Number.isInteger(meta.tiersFound) &&
      meta.tiersFound >= 0 && meta.tiersFound <= 6 ? meta.tiersFound : undefined;
    const record = {
      event: "funnel_step",
      step,
      timestamp: new Date().toISOString(),
      path: safePagePath(payload.path),
      attribution: normalizeAttribution(payload.attribution ?? payload.utm),
      meta: { sourceSlug: normalizeSource(meta.sourceSlug), channel, hostname, tiersFound },
    };
    counts[step]++;
    console.info("[FUNNEL]", JSON.stringify(record));
    await sendTelemetryWebhook("FUNNEL_WEBHOOK_URL", record);
    return NextResponse.json({ ok: true, step });
  } catch (error) {
    if (error instanceof JsonBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not record the event." }, { status: 500 });
  }
}
