import Link from "next/link";
import { Activity } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Activity className="h-4 w-4" />
          </span>
          <span className="whitespace-nowrap text-base tracking-tight sm:text-lg">PricePulse AI</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-3 text-sm font-medium text-slate-600 sm:gap-5">
          <Link href="/#free-tool" className="hidden hover:text-slate-900 md:inline">
            Free snapshot
          </Link>
          <Link href="/visualping-alternative" className="hidden hover:text-slate-900 sm:inline">
            vs. Visualping
          </Link>
          <Link href="/directory" className="whitespace-nowrap hover:text-slate-900">
            Guides
          </Link>
          <Link
            href="/#pro-plan"
            className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <span className="hidden sm:inline">Auto-Monitor · </span>$29/mo
          </Link>
        </nav>
      </div>
    </header>
  );
}
