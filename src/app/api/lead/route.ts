import { NextResponse } from "next/server";
import { JsonBodyError, readJsonObject } from "@/lib/request-json";
import { enforceRateLimit, extractClientIp } from "@/lib/rate-limit";
import { publicPageLabel } from "@/lib/funnel";
import { normalizeAttribution, normalizeSource, sendTelemetryWebhook } from "@/lib/telemetry";

export async function POST(request: Request) {
  try {
    const payload = await readJsonObject(request, 8 * 1024);
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid work email address." }, { status: 400 });
    }
    const rate = await enforceRateLimit(`lead:${extractClientIp(request)}`, 10);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 });
    }
    const record = {
      event: "early_bird_lead",
      email,
      plan: "auto_monitor_pro_29_mo",
      monitoredUrl: publicPageLabel(payload.monitoredUrl),
      sourceSlug: normalizeSource(payload.sourceSlug),
      attribution: normalizeAttribution(payload.attribution ?? payload.utm),
      createdAt: new Date().toISOString(),
    };
    console.info("[LEAD]", JSON.stringify(record));
    await sendTelemetryWebhook("LEAD_WEBHOOK_URL", {
      ...record,
      text: "New PricePulse AI early-access signup",
    });
    return NextResponse.json({ ok: true, message: "You're on the early-access list." });
  } catch (error) {
    if (error instanceof JsonBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not save the signup. Please try again." }, { status: 500 });
  }
}
