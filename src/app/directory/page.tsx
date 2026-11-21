import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SEO_PAGES } from "@/data/seo-pages";

export const metadata: Metadata = {
  title: "Competitor Monitoring Directory · 50 B2B Guides",
  description:
    "Browse 10 competitor monitoring alternatives and 40 pricing and webpage monitoring guides for SaaS, Shopify, agencies and procurement.",
  alternates: { canonical: "/directory" },
};

export default function DirectoryPage() {
  const alternatives = SEO_PAGES.filter((page) => page.category === "alternative");
  const groups = Map.groupBy(SEO_PAGES.filter((page) => page.category === "use-case"), (page) => page.badge);
  const sections = [["Tool alternatives", alternatives] as const, ...groups];

  return (
    <div>
      <div className="hero-surface py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            B2B competitor monitoring guides
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-300">
            Compare tools or find a workflow for your team. Run a free pricing snapshot from any guide.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
        <nav aria-label="Guide categories" className="flex flex-wrap gap-2">
          {sections.map(([label], index) => (
            <a key={label} href={`#guides-${index}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-800 hover:border-blue-400">
              {label}
            </a>
          ))}
        </nav>
        {sections.map(([label, pages], index) => (
          <section key={label} aria-labelledby={`guides-${index}`}>
            <h2 id={`guides-${index}`} className="text-xl font-bold text-slate-900">{label}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <Link key={page.slug} href={`/${page.slug}`} className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-400 hover:bg-blue-50/40">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800">{page.h1}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{page.metaDescription}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
