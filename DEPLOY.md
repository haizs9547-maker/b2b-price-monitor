# Deploy PricePulse AI

Import the repository into Vercel, add `OPENAI_API_KEY`, and deploy. The project uses Next.js App Router, TypeScript, Tailwind CSS and the Node.js runtime.

## Vercel setup

1. Push the source to a Git repository supported by Vercel. In Vercel, choose **Add New → Project → Import** and select the repository.
2. Keep the **Next.js** framework preset and the repository root. Choose Node.js 22.x or 24.x.
3. Under **Environment Variables**, set **`OPENAI_API_KEY`** to your DeepSeek API key for Production. Add the same key to Preview if you want preview deployments to run snapshots.
4. Click **Deploy**. Open the deployment, choose an example on the home page, and run a free snapshot.

The default provider is `https://api.deepseek.com/chat/completions` with `deepseek-flash`. The production project domain supplies the site origin when Vercel system variables are exposed. For a custom domain or deployments without those variables, set `NEXT_PUBLIC_SITE_URL`. Build and live deployment use the same commands. To roll back a production deployment, promote the previous known-good deployment in the Vercel dashboard.

| Optional variable | Effect |
| --- | --- |
| `OPENAI_BASE_URL`, `OPENAI_MODEL` | Use a different OpenAI-compatible Chat Completions provider and compatible model. Include any version prefix in the base URL, such as `https://api.openai.com/v1`. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Share the five-request hourly IP quota across Vercel instances. Use a write-capable token with Redis `EVAL` access. Without Redis or during an error, each warm instance enforces its own quota. |
| `NEXT_PUBLIC_SITE_URL` | Set the production origin used by canonical metadata, sitemap and robots. |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Show a direct checkout CTA. Create a recurring USD $29/month Price and Payment Link in Stripe first. Use a test-mode link for preview, and redeploy after changes to public variables. |
| `LEAD_WEBHOOK_URL`, `FUNNEL_WEBHOOK_URL` | Receive JSON events over HTTPS. Use your own ingestion endpoint or automation service to store records durably. Lead events include the signup email. |

The checkout CTA records an outbound click. Set up Stripe fulfillment before accepting live payments. This smoke site runs a free single-page snapshot and displays a simulated alert. Recurring scans, email alert delivery, payment verification and subscription fulfillment require a separate backend and operations setup.

## Local development and build on Windows

Run from `E:\b2b-price-monitor`. Keep npm cache, npm config lookups, and temporary files inside the project.

```powershell
Set-Location E:\b2b-price-monitor
New-Item -ItemType Directory -Force -Path ".work/npm-cache", ".work/tmp" | Out-Null
$env:npm_config_cache = Join-Path $PWD ".work/npm-cache"
$env:npm_config_userconfig = Join-Path $PWD ".work/user.npmrc"
$env:npm_config_globalconfig = Join-Path $PWD ".work/global.npmrc"
$env:TEMP = $env:TMP = Join-Path $PWD ".work/tmp"
$env:NEXT_TELEMETRY_DISABLED = "1"

npm.cmd ci
npm.cmd run build
npm.cmd run lint
npx.cmd tsc --noEmit
```

For a live snapshot, copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`. Run `npm.cmd run dev` and open `http://localhost:3000`. The key is needed at runtime and can be omitted when building static pages.

The scraper accepts public HTTP(S) pages and follows up to four validated redirects. It reads server-provided HTML or text within eight seconds, with a 2 MiB limit on both transferred and decoded content. A login wall, bot block or page whose commercial information loads exclusively in JavaScript may need a different public source URL.

## Smoke test

1. Start from `/?utm_source=reddit&utm_medium=post&utm_campaign=b2b_smoke&utm_content=pricing&utm_term=competitor`. Check for `page_view_utm`.
2. Choose a sample URL, submit the form and check for `url_submitted`.
3. Verify a snapshot and a clearly simulated price-change email with the live baseline, a hypothetical change, impact and next action. Check for `snapshot_generated`.
4. Leave Stripe unconfigured and submit an early-access email. Check `[LEAD]`, `upgrade_clicked` and `lead_submitted`. With a Stripe test link configured, also verify an `upgrade_clicked` event with channel `stripe_checkout`.

Funnel records include a common session ID, all five UTM fields, `referrer` and `landingPage`. Referrers and watched URLs in telemetry omit query strings and fragments. View `[LEAD]` and `[FUNNEL]` in Vercel logs. `GET /api/funnel` shows per-process aggregates for smoke testing. Logs and memory counters are subject to platform retention and instance restarts.

For `POST /api/analyze`, verify the JSON `rateLimit` fields `limit`, `remaining`, `resetAt` (Unix seconds) and `backend` (`upstash` or `memory`). From one IP on the same backend, request six returns HTTP 429 and a `Retry-After` header.

## SEO checks

- Verify the build lists `/[slug]` as SSG with all 50 routes. Each guide has a canonical URL, an embedded snapshot form and links back to the directory and other guides.
- Open `/sitemap.xml` on the production domain. It contains 52 unique URLs across the home page, directory, 10 comparison guides and 40 use cases.
- Verify that `/robots.txt` points to the same production sitemap and keeps `/api/` out of crawl traffic. Submit the sitemap to Google Search Console and Bing Webmaster Tools after setting the production domain.
