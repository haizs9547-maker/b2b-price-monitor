import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellRing, Layers, Zap } from "lucide-react";
import { SnapshotWidget } from "@/components/SnapshotWidget";
import { SEO_PAGES } from "@/data/seo-pages";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const featuredAlternatives = SEO_PAGES.filter(
    (p) => p.category === "alternative"
  ).slice(0, 6);
  const featuredUseCases = SEO_PAGES.filter(
    (p) => p.category === "use-case"
  ).slice(0, 6);

  return (
    <div>
      {/* Hero + Free Snapshot Tool */}
      <section className="hero-surface border-b border-blue-950 pb-12 pt-12 sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-balance text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-6xl">
              See how competitors<br className="hidden sm:block" /> price and sell.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              Paste a public pricing or product page. Get a free AI snapshot of its
              plans, selling points and promotions, plus a preview of a price-change email.
            </p>
          </div>

          <div className="mt-10">
            <SnapshotWidget sourceSlug="home" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Layers className="h-6 w-6 text-blue-600" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">
              Compare pricing and packaging
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              See public prices, billing terms and the features competitors use to distinguish plans.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <BellRing className="h-6 w-6 text-blue-600" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">
              Preview a change alert
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              See a sample before-and-after comparison, the potential impact and a next step for your team.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Zap className="h-6 w-6 text-blue-600" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">
              Get early access to Auto-Monitor
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The $29/month plan covers daily checks on 10 pages and email alerts when a check detects a price or copy change.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Hub Links */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Competitor monitoring guides
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Compare monitoring tools and find specific signals to track in your market.
              </p>
            </div>
            <Link
              href="/directory"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
            >
              Browse all 50 pages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...featuredAlternatives, ...featuredUseCases].map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-400 hover:bg-blue-50/40"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  {page.badge}
                </span>
                <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  {page.h1}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                  {page.metaDescription}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
