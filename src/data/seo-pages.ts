interface ComparisonRow {
  criterion: string;
  left: string;
  right: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface SeoPageConfig {
  slug: string;
  category: "alternative" | "use-case";
  badge: string;
  title: string;
  metaDescription: string;
  h1: string;
  subheadline: string;
  targetAudience: string;
  sampleUrl: string;
  painPoints: string[];
  comparisonHeaderLeft: string;
  comparisonHeaderRight: string;
  comparisonRows: ComparisonRow[];
  comparisonSource?: string;
  faqs: FaqItem[];
}

const linear = "https://linear.app/pricing";
const notion = "https://www.notion.so/pricing";
const stripe = "https://stripe.com/pricing";
const allbirds = "https://www.allbirds.com/products/mens-tree-runners-mist";
const hubspot = "https://www.hubspot.com/pricing/marketing";
const shopify = "https://www.shopify.com/pricing";
const freeFaq = {
  q: "Can I try this with a competitor's URL?",
  a: "Yes. Paste a public pricing, product or offer page into the tool above. The snapshot uses the text served by the page, including publicly listed prices and promotions.",
};

interface AlternativeInput {
  slug: string;
  name: string;
  url: string;
  sample: string;
  vendor: string;
  audience: string;
  workflow: string;
  decision: string;
}

const alternatives: AlternativeInput[] = [
  {
    slug: "visualping-alternative", name: "Visualping",
    url: "https://help.visualping.io/en/articles/4438913", sample: linear,
    vendor: "Visual, text and code change detection with AI-assisted interpretation",
    audience: "competitive intelligence teams",
    workflow: "Compare tier prices, annual discounts and plan boundaries on a SaaS pricing page.",
    decision: "Check which paid tier now includes a feature before you update a sales comparison.",
  },
  {
    slug: "prisync-alternative", name: "Prisync",
    url: "https://prisync.com/for/retailers/", sample: allbirds,
    vendor: "Catalog-level competitor price and stock tracking with repricing rules",
    audience: "e-commerce pricing teams",
    workflow: "Summarize the public price, markdown, bundle and offer copy for one comparable product.",
    decision: "Decide whether a rival changed the base price or introduced a temporary product offer.",
  },
  {
    slug: "changetower-alternative", name: "ChangeTower",
    url: "https://help.changetower.com/en/articles/17014984-how-can-i-monitor-my-own-website-for-unauthorized-changes",
    sample: "https://vercel.com/pricing",
    vendor: "Page and selected content monitoring for website updates",
    audience: "B2B product marketers",
    workflow: "Review new price points, plan descriptions and the language on purchase buttons.",
    decision: "Determine whether a copy change is a packaging change that sales should know about.",
  },
  {
    slug: "wachete-alternative", name: "Wachete",
    url: "https://www.wachete.com/", sample: notion,
    vendor: "Scheduled page checks with configurable alerts and change history",
    audience: "SaaS research teams",
    workflow: "Turn a public pricing page into an inventory of plans, included features and trial terms.",
    decision: "Record the first visible move from self-serve signup to a sales-led plan.",
  },
  {
    slug: "distill-io-alternative", name: "Distill.io",
    url: "https://distill.io/docs/web-monitor/what-is-distill/", sample: stripe,
    vendor: "Local browser and cloud monitors for selected webpage changes",
    audience: "pricing and operations analysts",
    workflow: "Read public rates, billing units and add-ons from one fee schedule.",
    decision: "Compare mandatory base fees and optional add-ons before updating your cost model.",
  },
  {
    slug: "browse-ai-alternative", name: "Browse AI",
    url: "https://www.browse.ai/monitor", sample: "https://www.figma.com/pricing/",
    vendor: "Trainable no-code robots that extract fields and keep a history of changes",
    audience: "market research teams",
    workflow: "Get a ready-to-read breakdown of public seat prices and promotional copy.",
    decision: "Use the snapshot to decide which three commercial fields deserve ongoing monitoring.",
  },
  {
    slug: "klue-alternative", name: "Klue",
    url: "https://klue.com/", sample: "https://slack.com/pricing",
    vendor: "Competitive research, deal support and buyer win-loss insights",
    audience: "sales enablement teams",
    workflow: "Pull the public plan names, seat prices and key differentiators for a single competitor.",
    decision: "Use the public plan evidence to correct a specific pricing objection in a battlecard.",
  },
  {
    slug: "crayon-alternative", name: "Crayon",
    url: "https://www.crayon.co/sparks", sample: hubspot,
    vendor: "Competitive enablement with AI research and sales content such as battlecards",
    audience: "small product marketing teams",
    workflow: "Summarize a public offer page for a focused pricing or positioning review.",
    decision: "Separate a revised entry price from a more prominent sales message in your weekly brief.",
  },
  {
    slug: "kompyte-alternative", name: "Kompyte",
    url: "https://www.kompyte.com/", sample: "https://asana.com/pricing",
    vendor: "Multi-source competitor tracking, sales battlecards and win-loss reporting",
    audience: "revenue and enablement teams",
    workflow: "Inspect a public pricing page for plan limits, audience promises and purchase paths.",
    decision: "Verify the plan and limits a rep can quote before the next competitive demo.",
  },
  {
    slug: "hexowatch-alternative", name: "Hexowatch",
    url: "https://hexowatch.com/", sample: shopify,
    vendor: "Website change detection and archiving across visual, content and availability signals",
    audience: "commercial research teams",
    workflow: "Extract the visible buying terms, promotions and plan differentiators of one public offer.",
    decision: "Focus a review on edits that change what buyers pay or receive.",
  },
];

function alternative(input: AlternativeInput): SeoPageConfig {
  const heading = `${input.name} Alternative for Competitor Pricing`;
  return {
    slug: input.slug,
    category: "alternative",
    badge: `${input.name} Alternative`,
    title: heading,
    metaDescription: `Compare ${input.name} and PricePulse AI for B2B research. ${input.workflow} Try a free snapshot.`,
    h1: heading,
    subheadline: input.workflow,
    targetAudience: input.audience,
    sampleUrl: input.sample,
    painPoints: [input.workflow, input.decision],
    comparisonHeaderLeft: input.name,
    comparisonHeaderRight: "PricePulse AI",
    comparisonSource: input.url,
    comparisonRows: [
      { criterion: "Primary workflow", left: input.vendor, right: "On-demand analysis of one public pricing, product or offer page." },
      { criterion: "Pricing research", left: "See the vendor’s workflow and supported sources below.", right: input.workflow },
      { criterion: "First step", left: "Explore the official product documentation below.", right: "Run a free snapshot from this page without an account." },
    ],
    faqs: [
      { q: `When should I try this ${input.name} alternative?`, a: input.decision },
      freeFaq,
    ],
  };
}

interface ScenarioInput {
  slug: string;
  heading: string;
  audience: string;
  sample?: string;
  signals: string;
  decision: string;
}

function scenario(group: string, defaultSample: string, entries: ScenarioInput[]): SeoPageConfig[] {
  return entries.map((entry) => {
    const description = `Track ${entry.signals}. ${entry.decision}`;
    return {
      slug: entry.slug,
      category: "use-case",
      badge: group,
      title: entry.heading,
      metaDescription: description,
      h1: entry.heading,
      subheadline: description,
      targetAudience: entry.audience,
      sampleUrl: entry.sample || defaultSample,
      painPoints: [`Record ${entry.signals} from the same public URL to build a comparable baseline.`, entry.decision],
      comparisonHeaderLeft: "Manual page review",
      comparisonHeaderRight: "PricePulse snapshot",
      comparisonRows: [
        { criterion: "Baseline", left: "Transcribe the offer and save the source page.", right: `Summarize ${entry.signals} and retain the source URL.` },
        { criterion: "Review", left: "Compare screenshots or notes by hand.", right: "Preview an example change with its baseline, potential impact and next action." },
        { criterion: "Team decision", left: "Turn observations into a task for the team.", right: entry.decision },
      ],
      faqs: [
        { q: "What should I capture in the first snapshot?", a: `Use a page that publicly shows ${entry.signals}. Record the billing unit and any restrictions that change the effective offer.` },
        freeFaq,
      ],
    };
  });
}

export const SEO_PAGES = [
  ...alternatives.map(alternative),
  ...scenario("E-commerce & DTC", allbirds, [
    {
      slug: "shopify-competitor-price-monitoring", heading: "Shopify Competitor Price Monitoring",
      audience: "Shopify store owners and merchandisers",
      signals: "variant prices, compare-at prices and product page discounts",
      decision: "Match the same size, color and region before reacting to a price drop.",
    },
    {
      slug: "dtc-brand-promo-banner-tracker", heading: "DTC Brand Promo Banner & Offer Tracker",
      audience: "DTC founders and retention marketers", sample: "https://www.allbirds.com/collections/bfcm-mens",
      signals: "banner copy, coupon codes and offer exclusions",
      decision: "Check whether the promotion applies storewide before shifting your own campaign.",
    },
    {
      slug: "woocommerce-competitor-price-alerts", heading: "WooCommerce Competitor Price Alerts",
      audience: "WooCommerce merchants", sample: "https://woocommerce.com/products/woocommerce-subscriptions/",
      signals: "regular and sale prices, add-on fees and renewal terms",
      decision: "Compare the effective total for the same configuration before matching a sale.",
    },
    {
      slug: "amazon-brand-website-price-monitor", heading: "Amazon Brand DTC Website Price Monitor",
      audience: "omnichannel e-commerce operators",
      signals: "direct storefront prices, exclusive bundles and warranty offers",
      decision: "Identify when a brand uses its own store to undercut or distinguish its marketplace offer.",
    },
    {
      slug: "ecommerce-bundle-discount-tracker", heading: "E-commerce Bundle & Tiered Discount Tracker",
      audience: "e-commerce growth managers",
      signals: "pack sizes, quantity breaks and bundle incentives",
      decision: "Calculate the effective per-item price at each published quantity.",
    },
    {
      slug: "shopify-plus-competitor-spy-tool", heading: "Shopify Plus Competitor Pricing & Copy Monitor",
      audience: "Shopify Plus merchandising teams",
      signals: "product page pricing, value claims and purchase incentives",
      decision: "Separate a merchandising edit from a change to the price or promo.",
    },
    {
      slug: "dropshipping-supplier-price-change-alerts", heading: "Dropshipping Supplier Price Change Alerts",
      audience: "sourcing and margin managers",
      signals: "public supplier unit costs, quantity breaks and shipping fees",
      decision: "Recalculate expected gross margin on the matching SKU and order quantity.",
    },
    {
      slug: "flash-sale-competitor-alert-tool", heading: "Competitor Flash Sale & Holiday Promo Tracker",
      audience: "e-commerce trading teams", sample: "https://www.allbirds.com/collections/bfcm-mens",
      signals: "temporary markdowns, sale end dates and excluded products",
      decision: "Identify the campaign window before changing paid spend or extending a discount.",
    },
    {
      slug: "ecommerce-shipping-threshold-monitor", heading: "E-commerce Free-Shipping Threshold Monitor",
      audience: "DTC conversion specialists",
      signals: "published shipping thresholds, eligible regions and delivery fees",
      decision: "Compare the delivered basket total for a typical order.",
    },
    {
      slug: "dtc-subscription-pricing-tracker", heading: "DTC Subscribe-and-Save Pricing Tracker",
      audience: "subscription e-commerce teams", sample: "https://www.huel.com/products/huel",
      signals: "one-time prices, subscription discounts and order frequency",
      decision: "Distinguish an introductory discount from the recurring order price.",
    },
  ]),
  ...scenario("B2B SaaS & PMM", linear, [
    {
      slug: "saas-pricing-page-change-monitor", heading: "SaaS Pricing Page Change Monitor",
      audience: "SaaS founders and product marketers",
      signals: "plan prices, billing cycles and tier names",
      decision: "Check whether the cheapest plan still serves the same buyer and use case.",
    },
    {
      slug: "b2b-saas-tier-restructuring-alerts", heading: "B2B SaaS Tier Restructuring Alerts",
      audience: "product marketing and revenue operations teams", sample: notion,
      signals: "renamed plans, new minimums and features moved between tiers",
      decision: "Update the plan mapping in your comparison sheets when a feature changes tiers.",
    },
    {
      slug: "product-marketing-battlecard-updater", heading: "Competitive Pricing Research for Sales Battlecards",
      audience: "product marketing managers", sample: "https://asana.com/pricing",
      signals: "entry pricing, paid features and plan-specific sales claims",
      decision: "Refresh the pricing and objection-handling sections with details reps can verify.",
    },
    {
      slug: "saas-free-trial-change-tracker", heading: "SaaS Free Trial & Freemium Offer Tracker",
      audience: "product-led growth and acquisition teams", sample: "https://www.figma.com/pricing/",
      signals: "trial length, credit-card requirements and free-plan caps",
      decision: "Review whether new signup friction creates an opening for your own self-serve plan.",
    },
    {
      slug: "enterprise-pricing-packaging-monitor", heading: "Enterprise SaaS Packaging & CTA Monitor",
      audience: "enterprise sales enablement teams", sample: "https://slack.com/pricing",
      signals: "enterprise feature gates, sales CTAs and published deployment terms",
      decision: "Verify which controls still require an enterprise quote.",
    },
    {
      slug: "ai-tool-pricing-page-tracker", heading: "AI SaaS Credit & Token Pricing Tracker",
      audience: "AI product founders and pricing teams", sample: "https://openai.com/api/pricing/",
      signals: "credit allowances, token rates and model-specific usage charges",
      decision: "Compare one representative workload using the same input and output assumptions.",
    },
    {
      slug: "usage-based-pricing-competitor-monitor", heading: "Usage-Based & Metered Pricing Monitor",
      audience: "FinOps and SaaS monetization teams", sample: "https://vercel.com/pricing",
      signals: "metered rates, included usage and overage charges",
      decision: "Estimate effective cost for light, typical and high-usage accounts.",
    },
    {
      slug: "saas-homepage-headline-change-alerts", heading: "SaaS Homepage Positioning & Copy Change Alerts",
      audience: "B2B brand and messaging teams", sample: "https://linear.app/",
      signals: "hero headlines, named customer segments and primary calls to action",
      decision: "Look for a change in target audience before revising your positioning brief.",
    },
    {
      slug: "b2b-feature-matrix-change-tracker", heading: "B2B Feature Matrix & Plan Limit Tracker",
      audience: "competitive intelligence analysts", sample: hubspot,
      signals: "plan limits, feature entitlements and add-on requirements",
      decision: "Flag a package change when a previously included capability becomes a paid add-on.",
    },
    {
      slug: "annual-vs-monthly-saas-discount-monitor", heading: "SaaS Annual vs. Monthly Discount Monitor",
      audience: "SaaS pricing and finance teams", sample: notion,
      signals: "monthly list prices, annual commitments and savings claims",
      decision: "Convert both options to the same billing period before comparing the discount.",
    },
  ]),
  ...scenario("Marketing Agencies", hubspot, [
    {
      slug: "marketing-agency-client-page-monitor", heading: "Marketing Agency Client & Competitor Page Monitor",
      audience: "agency founders and account directors",
      signals: "client and competitor offers, positioning and calls to action",
      decision: "Bring one verified market change and an actionable response to each client review.",
    },
    {
      slug: "ppc-agency-competitor-landing-page-tracker", heading: "PPC Agency Competitor Landing Page Tracker",
      audience: "paid search and paid social managers", sample: "https://vercel.com/pricing",
      signals: "landing-page headlines, offer terms and purchase paths",
      decision: "Decide which competitor promise the next test should address for the same keyword.",
    },
    {
      slug: "seo-agency-client-website-change-alerts", heading: "SEO Agency Client Webpage Change Alerts",
      audience: "technical SEO consultants", sample: shopify,
      signals: "page titles, visible headings and commercial copy",
      decision: "Record a change to search intent alongside the date of a traffic or conversion shift.",
    },
    {
      slug: "cro-agency-competitor-offer-monitor", heading: "CRO Agency Competitor Offer & Pricing Monitor",
      audience: "conversion rate optimization teams", sample: "https://www.figma.com/pricing/",
      signals: "guarantees, pricing anchors and trial calls to action",
      decision: "Use what rivals changed to shape one measurable conversion hypothesis.",
    },
    {
      slug: "growth-agency-competitor-copy-alerts", heading: "B2B Growth Agency Competitor Copy Alerts",
      audience: "growth strategists", sample: "https://linear.app/",
      signals: "hero claims, proof points and audience language",
      decision: "Check whether the category is converging on a promise your client could differentiate.",
    },
    {
      slug: "digital-agency-pricing-audit-tool", heading: "Digital Agency Competitor Pricing Audit",
      audience: "agency new-business teams",
      signals: "public service packages, starting fees and engagement terms",
      decision: "Compare deliverables and commitments before revising a retainer proposal.",
    },
    {
      slug: "performance-marketing-promo-monitor", heading: "Performance Marketing Promo & Offer Monitor",
      audience: "media buyers and creative strategists", sample: allbirds,
      signals: "promotional hooks, time limits and product sale terms",
      decision: "Check whether a new offer should change your next creative brief or spend window.",
    },
    {
      slug: "b2b-demand-gen-competitor-tracker", heading: "B2B Demand Gen Competitor Funnel Tracker",
      audience: "demand generation teams",
      signals: "demo paths, free-tier CTAs and lead magnet promises",
      decision: "Track whether a rival is moving prospects from self-serve signup into sales.",
    },
    {
      slug: "ecommerce-agency-price-watch-tool", heading: "E-commerce Agency Competitor Price Watch",
      audience: "retention and e-commerce agencies", sample: allbirds,
      signals: "key SKU prices, bundle incentives and retention offers",
      decision: "Group observed changes by client and prioritize offers with margin impact.",
    },
    {
      slug: "fractional-cmo-competitor-briefing-tool", heading: "Fractional CMO Competitor Briefing Tool",
      audience: "fractional CMOs and advisers", sample: "https://slack.com/pricing",
      signals: "public offer changes, new positioning and pricing objections",
      decision: "Summarize the market signal, commercial consequence and owner in the client brief.",
    },
  ]),
  ...scenario("Procurement & Vertical B2B", stripe, [
    {
      slug: "b2b-distributor-catalog-price-monitor", heading: "B2B Distributor Catalog Price Monitor",
      audience: "distribution and category managers", sample: "https://www.uline.com/",
      signals: "public catalog prices, pack sizes and quantity breaks",
      decision: "Normalize the pack price to a unit price before comparing distributors.",
    },
    {
      slug: "wholesale-supplier-price-list-tracker", heading: "Wholesale Supplier Public Price List Tracker",
      audience: "procurement and purchasing teams", sample: "https://www.uline.com/",
      signals: "case prices, minimum orders and bulk discounts",
      decision: "Estimate landed cost at your normal purchasing volume before asking for a quote.",
    },
    {
      slug: "vendor-terms-and-pricing-change-alerts", heading: "SaaS Vendor Pricing & Renewal Change Alerts",
      audience: "IT procurement and SaaS buyers", sample: "https://slack.com/pricing",
      signals: "list prices, public renewal terms and add-on charges",
      decision: "Use the public baseline to prepare renewal questions for your contract owner.",
    },
    {
      slug: "cloud-infrastructure-pricing-monitor", heading: "Cloud & API Infrastructure Pricing Monitor",
      audience: "DevOps and FinOps teams", sample: "https://aws.amazon.com/s3/pricing/",
      signals: "request prices, regional rate differences and egress fees",
      decision: "Reprice a known workload using identical regions and usage units.",
    },
    {
      slug: "logistics-freight-rate-page-tracker", heading: "Logistics & 3PL Rate Page Change Tracker",
      audience: "supply chain and operations managers", sample: "https://www.shipbob.com/pricing/",
      signals: "published fulfillment fees, storage terms and fuel surcharges",
      decision: "Check a change against the typical warehouse volume and shipping mix.",
    },
    {
      slug: "recruiting-agency-competitor-fee-monitor", heading: "Staffing & Recruiting Competitor Offer Monitor",
      audience: "recruiting agency owners", sample: "https://www.upwork.com/pricing",
      signals: "flat fees, service fees and placement guarantee language",
      decision: "Compare placement terms before updating your proposal or replacement policy.",
    },
    {
      slug: "b2b-marketplace-competitor-offer-tracker", heading: "B2B Marketplace Take-Rate & Fee Monitor",
      audience: "marketplace strategy teams", sample: "https://www.upwork.com/pricing",
      signals: "transaction fees, seller commissions and buyer subscription tiers",
      decision: "Calculate the effective take rate for a typical order on each marketplace.",
    },
    {
      slug: "fintech-fee-schedule-change-monitor", heading: "Fintech & Payment Fee Schedule Monitor",
      audience: "fintech product and pricing managers",
      signals: "transaction fees, FX surcharges and fixed platform costs",
      decision: "Calculate blended cost across your domestic, international and recurring transactions.",
    },
    {
      slug: "edtech-course-pricing-change-alerts", heading: "EdTech & B2B Training Pricing Change Alerts",
      audience: "course platforms and L&D vendors", sample: "https://www.coursera.org/business/",
      signals: "cohort bundles, per-seat terms and certification fees",
      decision: "Compare the effective cost per learner at the same cohort size.",
    },
    {
      slug: "travel-hospitality-competitor-package-monitor", heading: "B2B Travel & Hospitality Package Monitor",
      audience: "revenue and package managers", sample: "https://www.hilton.com/en/meetings/",
      signals: "corporate package inclusions, seasonal terms and paid add-ons",
      decision: "Check which inclusions or restrictions change the effective package price.",
    },
  ]),
];

export function getSeoPageBySlug(slug: string): SeoPageConfig | undefined {
  return SEO_PAGES.find((page) => page.slug === slug);
}

export function getRelatedSeoPages(currentSlug: string, limit = 6): SeoPageConfig[] {
  const current = getSeoPageBySlug(currentSlug);
  const others = SEO_PAGES.filter((page) => page.slug !== currentSlug);
  return [
    ...others.filter((page) => page.badge === current?.badge),
    ...others.filter((page) => page.badge !== current?.badge && page.category === current?.category),
    ...others.filter((page) => page.category !== current?.category),
  ].slice(0, limit);
}
