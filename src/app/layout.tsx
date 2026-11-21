import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FunnelVisit } from "@/components/FunnelVisit";
import { SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: true } : undefined,
  title: {
    default: "PricePulse AI — B2B Competitor Pricing & Webpage Change Monitor",
    template: "%s | PricePulse AI",
  },
  description:
    "Get a free competitor pricing snapshot. See public prices, sales messages and promotions, with a preview of a price-change alert.",
  openGraph: {
    type: "website",
    siteName: "PricePulse AI",
    title: "PricePulse AI — B2B Competitor Pricing & Webpage Change Monitor",
    description:
      "Free AI snapshots for public pricing and product pages, with a preview of automated price-change emails.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <a className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:p-3" href="#main-content">
          Skip to content
        </a>
        <Suspense fallback={null}><FunnelVisit /></Suspense>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
