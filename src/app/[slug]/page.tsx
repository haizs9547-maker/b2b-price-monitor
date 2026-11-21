import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import {
  SEO_PAGES,
  getRelatedSeoPages,
  getSeoPageBySlug,
} from "@/data/seo-pages";
import { SnapshotWidget } from "@/components/SnapshotWidget";

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = getSeoPageBySlug((await params).slug);
  if (!page) {
    return { title: "Page Not Found" };
  }
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      siteName: "PricePulse AI",
      url: `/${page.slug}`,
      type: "website",
    },
  };
}

export default async function SeoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = getSeoPageBySlug((await params).slug);
  if (!page) {
    notFound();
  }

  const related = getRelatedSeoPages(page.slug, 6);

  return (
    <div>
      {/* Hero + Embedded Free Snapshot Tool */}
      <section className="hero-surface border-b border-blue-950 py-10 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <Link href="/directory" className="text-sm font-semibold text-blue-200 hover:underline">Monitoring guides</Link>
            <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              {page.subheadline}
            </p>
          </div>

          <div className="mt-8">
            <SnapshotWidget defaultUrl={page.sampleUrl} sourceSlug={page.slug} />
          </div>
        </div>
      </section>

      {/* Pain Points + Comparison Table */}
      <section className="mx-auto max-w-5xl space-y-12 px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            What {page.targetAudience} should watch for
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {page.painPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Comparing {page.comparisonHeaderLeft} and {page.comparisonHeaderRight}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[35rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-semibold">Criterion</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">
                    {page.comparisonHeaderLeft}
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-blue-700">
                    {page.comparisonHeaderRight}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {page.comparisonRows.map((row, idx) => (
                  <tr key={idx}>
                    <th scope="row" className="px-6 py-4 font-semibold text-slate-900">
                      {row.criterion}
                    </th>
                    <td className="px-6 py-4 text-slate-600">{row.left}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.right}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {page.comparisonSource && (
            <p className="border-t border-slate-200 px-6 py-4 text-sm">
              <a href={page.comparisonSource} className="font-medium text-blue-700 underline underline-offset-2">
                {page.comparisonHeaderLeft} product documentation
              </a>
            </p>
          )}
        </div>

        {/* FAQs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="mt-5 space-y-5">
            {page.faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Related SEO Pages */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Related Competitor Monitoring Guides
            </h2>
            <Link
              href="/directory"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              All 50 pages <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-400"
              >
                <span className="text-xs font-semibold text-blue-600">
                  {item.badge}
                </span>
                <p className="mt-1 text-sm font-bold text-slate-900">{item.h1}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
