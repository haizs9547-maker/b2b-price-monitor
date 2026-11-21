"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import type { CompetitorSnapshot } from "@/lib/deepseek";
import { captureAttribution, trackFunnelEvent } from "@/lib/funnel";

interface SnapshotWidgetProps {
  defaultUrl?: string;
  sourceSlug?: string;
}

interface AnalyzeApiResponse {
  ok?: boolean;
  error?: string;
  page?: {
    url: string;
    hostname: string;
    title: string;
    fetchedAt: string;
    priceSignalsFound: number;
  };
  snapshot?: CompetitorSnapshot;
  rateLimit?: {
    remaining: number;
    limit: number;
    resetAt: number;
    backend: string;
  };
}

const SAMPLE_URLS = [
  { label: "Linear Pricing", url: "https://linear.app/pricing" },
  { label: "Vercel Pricing", url: "https://vercel.com/pricing" },
  { label: "Shopify Pricing", url: "https://www.shopify.com/pricing" },
  { label: "Allbirds Product", url: "https://www.allbirds.com/products/mens-tree-runners-mist" },
];

function getCheckoutLink() {
  const configured = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim();
  if (!configured) return "";
  try {
    const link = new URL(configured);
    return link.protocol === "https:" && !link.username && !link.password ? link.href : "";
  } catch {
    return "";
  }
}

const checkoutLink = getCheckoutLink();

function targetHostname(input: string) {
  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).hostname;
  } catch {
    return "";
  }
}

export function SnapshotWidget({
  defaultUrl = "",
  sourceSlug = "home",
}: SnapshotWidgetProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeApiResponse | null>(null);
  const [quota, setQuota] = useState<AnalyzeApiResponse["rateLimit"]>();
  const resultHeading = useRef<HTMLHeadingElement>(null);

  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const cleaned = url.trim();
    if (!cleaned) {
      setError("Enter a public competitor URL (e.g. https://linear.app/pricing).");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    const attribution = captureAttribution();
    trackFunnelEvent("url_submitted", { sourceSlug, hostname: targetHostname(cleaned) }, attribution);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleaned }),
      });

      const data = (await res.json()) as AnalyzeApiResponse;
      if (data.rateLimit) setQuota(data.rateLimit);
      if (!res.ok || !data.snapshot) {
        setError(data.error || "Unable to analyze this URL. Try another public pricing page.");
        return;
      }

      setResult(data);

      trackFunnelEvent("snapshot_generated", {
        sourceSlug,
        hostname: data.page?.hostname || "",
        tiersFound: data.snapshot.pricingTiers.length,
      }, attribution);
    } catch {
      setError("Network error while analyzing the webpage. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (leadSubmitting) return;
    setLeadError(null);
    setLeadSuccess(null);

    if (!leadEmail.trim()) {
      setLeadError("Please enter your work email.");
      return;
    }

    setLeadSubmitting(true);
    const attribution = captureAttribution();
    trackFunnelEvent("upgrade_clicked", { sourceSlug, channel: "early_bird_email" }, attribution);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail.trim(),
          monitoredUrl: result?.page?.url || url.trim(),
          sourceSlug,
          attribution,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        setLeadError(data.error || "Could not submit your email.");
        return;
      }

      trackFunnelEvent("lead_submitted", {
        sourceSlug,
        hostname: result?.page?.hostname,
        channel: "early_bird_email",
      }, attribution);

      setLeadSuccess(data.message || "You're on the early-access list.");
      setLeadEmail("");
    } catch {
      setLeadError("Network error. Please retry.");
    } finally {
      setLeadSubmitting(false);
    }
  }

  function handleDirectCheckoutClick() {
    trackFunnelEvent("upgrade_clicked", {
      sourceSlug,
      hostname: result?.page?.hostname,
      channel: "stripe_checkout",
    });
  }

  const snapshot = result?.snapshot;
  const samples = defaultUrl
    ? [{ label: "Guide example", url: defaultUrl }, ...SAMPLE_URLS.filter((sample) => sample.url !== defaultUrl)]
    : SAMPLE_URLS;

  return (
    <div id="free-tool" className="w-full">
      {/* Input Card */}
      <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-xl shadow-slate-950/15 sm:p-7">
        <label htmlFor="competitor-url" className="mb-2 block text-sm font-semibold text-slate-800">
          Competitor webpage URL
        </label>
        <form onSubmit={handleAnalyze} aria-busy={loading} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="competitor-url"
              inputMode="url"
              enterKeyHint="go"
              maxLength={2048}
              required
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://competitor.com/pricing or Shopify product URL..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                Generating snapshot…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get free snapshot
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>Try an example:</span>
            {samples.map((sample) => (
              <button
                key={sample.url}
                type="button"
                onClick={() => setUrl(sample.url)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {sample.label}
              </button>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            No login required · 5 free snapshots/hr
          </span>
        </div>

        {loading && <p className="mt-3 text-xs text-slate-600" role="status">Reading the public page and preparing your analysis. Allow about 30 seconds.</p>}
        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {quota && !loading && (
          <p className="mt-3 text-xs text-slate-600">
            {quota.remaining} of {quota.limit} free requests left. Quota resets at{" "}
            {new Date(quota.resetAt * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.
          </p>
        )}
      </div>

      {/* Snapshot Results */}
      {snapshot && result?.page && (
        <section aria-labelledby="snapshot-heading" className="mt-8 space-y-6 break-words">
          {/* Header Banner */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  {snapshot.pageCategory}
                </span>
                <h2 id="snapshot-heading" tabIndex={-1} ref={resultHeading} className="mt-2 text-2xl font-bold text-slate-900">
                  {snapshot.competitorName} — Pricing &amp; Positioning Snapshot
                </h2>
                <p className="mt-1 break-all text-xs text-slate-600">
                  Source: {result.page.url} · Pricing model:{" "}
                  <strong className="text-slate-700">{snapshot.pricingModel}</strong>
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              {snapshot.executiveSummary}
            </p>
          </div>

          {/* Pricing Tiers Grid */}
          {snapshot.pricingTiers.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Tag className="h-5 w-5 text-blue-600" />
                Detected Pricing Tiers &amp; Packaging
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {snapshot.pricingTiers.map((tier, idx) => (
                  <div
                    key={`${tier.name}-${idx}`}
                    className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-bold text-slate-900">{tier.name}</h4>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                        {tier.billingCycle}
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      {tier.price}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{tier.targetBuyer}</p>
                    {tier.keyHighlights.length > 0 && (
                      <ul className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-700">
                        {tier.keyHighlights.map((item, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!snapshot.pricingTiers.length && (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              The page text did not show identifiable pricing tiers.
            </p>
          )}

          {/* Value Props & Promo Hooks */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">
                Core Value Propositions
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
                {snapshot.coreValueProps.map((prop, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span>{prop}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">
                Promo Hooks &amp; Watch Triggers
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
                {snapshot.promoHooks.map((hook, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <span>{hook}</span>
                  </li>
                ))}
              </ul>
              {snapshot.watchTriggers.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Recommended Daily Watch Triggers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {snapshot.watchTriggers.map((trigger, i) => (
                      <li key={i}>• {trigger}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* AI Price-Change Alert Email Preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-900 px-5 py-3.5 text-white">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="h-4 w-4 text-blue-400" />
                Competitor Price-Change AI Alert Email Preview
              </div>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                Urgency: {snapshot.alertEmailPreview.urgency} · Simulated Alert Preview
              </span>
            </div>

            <div className="space-y-4 p-6 text-sm">
              <div className="space-y-1 border-b border-slate-200 pb-3 text-xs text-slate-500">
                <p>
                  <strong className="text-slate-700">From:</strong>{" "}
                  {snapshot.alertEmailPreview.from}
                </p>
                <p>
                  <strong className="text-slate-700">Subject:</strong>{" "}
                  <span className="font-semibold text-slate-900">
                    {snapshot.alertEmailPreview.subject}
                  </span>
                </p>
              </div>

              <p className="leading-relaxed text-slate-700">
                {snapshot.alertEmailPreview.detectedChangeExample}
              </p>

              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Before (Current Live Baseline)
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-700">
                    {snapshot.alertEmailPreview.previousValue}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-rose-600">
                    Detected Change (Example Trigger)
                  </p>
                  <p className="mt-1 font-mono text-xs font-semibold text-rose-700">
                    {snapshot.alertEmailPreview.newValue}
                  </p>
                </div>
              </div>
              <p className="leading-relaxed text-slate-700">{snapshot.alertEmailPreview.bodySummary}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50/70 p-3.5">
                  <p className="text-xs font-bold uppercase text-blue-800">
                    Strategic Impact
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    {snapshot.alertEmailPreview.strategicImpact}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50/70 p-3.5">
                  <p className="text-xs font-bold uppercase text-emerald-800">
                    Recommended Counter-Move
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    {snapshot.alertEmailPreview.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step 4: Bottom Pro Upgrade Card ($29/mo) */}
      <div
        id="pro-plan"
        className="mt-8 rounded-2xl border-2 border-slate-900 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-xl sm:p-8"
      >
        <div className="grid items-center gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
              <Bell className="h-3.5 w-3.5" />
              Early access · $29/month
            </span>
            <h3 className="mt-3 text-2xl font-bold tracking-tight">
              Auto-Monitor Pro
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Get daily checks on up to 10 competitor pages and an email as soon as
              a check detects a price, promotion or copy change.
            </p>
            <ul className="mt-4 grid gap-2 text-xs text-slate-200 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Before-and-after pricing and copy
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                AI summary of what changed and what to do
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur lg:col-span-5">
            {checkoutLink && (
              <a
                href={checkoutLink}
                onClick={handleDirectCheckoutClick}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Continue to Stripe · $29/month
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <form onSubmit={handleLeadSubmit} aria-busy={leadSubmitting} className="space-y-3">
              <label
                htmlFor="early-bird-email"
                className="block text-xs font-semibold uppercase tracking-wide text-blue-200"
              >
                {checkoutLink ? "Or join early access by email" : "Join early access"}
              </label>
              <input
                id="early-bird-email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-white/20 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={leadSubmitting}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${checkoutLink ? "border border-white/25 hover:bg-white/10" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {leadSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    Join the early-access list
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {leadSuccess && (
              <p role="status" className="mt-3 rounded-lg bg-emerald-500/20 p-2.5 text-xs text-emerald-200">
                {leadSuccess}
              </p>
            )}
            {leadError && (
              <p role="alert" className="mt-3 rounded-lg bg-rose-500/20 p-2.5 text-xs text-rose-200">
                {leadError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
