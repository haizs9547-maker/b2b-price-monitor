"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackLandingVisit } from "@/lib/funnel";

export function FunnelVisit() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => trackLandingVisit(pathname, search), [pathname, search]);
  return null;
}
