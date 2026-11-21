import Link from "next/link";
import { SEO_PAGES } from "@/data/seo-pages";

export function Footer() {
  const alternatives = SEO_PAGES.filter((p) => p.category === "alternative").slice(0, 6);
  const useCases = SEO_PAGES.filter((p) => p.category === "use-case").slice(0, 6);

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-base font-bold text-slate-900">PricePulse AI</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            AI competitor pricing, positioning, and promotional hook monitoring for B2B SaaS,
            Shopify brands, and agencies. Instant snapshots with zero login.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Competitor Alternatives
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {alternatives.map((item) => (
              <li key={item.slug}>
                <Link href={`/${item.slug}`} className="hover:text-blue-600">
                  {item.badge}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Popular B2B Monitoring Workflows
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {useCases.map((item) => (
              <li key={item.slug}>
                <Link href={`/${item.slug}`} className="hover:text-blue-600">
                  {item.h1}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/directory" className="font-semibold text-blue-600 hover:underline">
                View all 50 B2B monitoring pages →
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} PricePulse AI. Public webpage intelligence & automated change alerts.
      </div>
    </footer>
  );
}
