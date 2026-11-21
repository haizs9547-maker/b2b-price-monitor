function siteOrigin(): string {
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  const supplied = process.env.NEXT_PUBLIC_SITE_URL?.trim() || (vercelDomain && `https://${vercelDomain}`);
  if (supplied) {
    const url = new URL(supplied);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
      throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) site origin.");
    }
    return url.origin;
  }
  return "http://localhost:3000";
}

export const SITE_ORIGIN = siteOrigin();
