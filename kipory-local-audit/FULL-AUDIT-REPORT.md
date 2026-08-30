# Kipory Local SEO Audit

Audit date: 2026-08-30
Scope: local Next.js 16.3.2 production export, four public routes
Detected business type: early-stage B2B SaaS / data-and-analysis platform
SEO Health Score: **48/100**

## Executive summary

Kipory has a sound crawlable foundation: the production build succeeds, every public route is statically prerendered, important copy is present without depending on client-side JavaScript, each page has one H1, page titles and descriptions are unique, internal navigation reaches every route, and desktop/mobile rendering showed no horizontal overflow.

The site is not launch-ready from an SEO acquisition standpoint. It lacks crawl-discovery and canonicalization infrastructure, structured data, social metadata, icons, and the trust/proof content expected from a B2B product. Three route titles are too generic, every substantive page is thin relative to the decision questions it must answer, and the mobile header removes the primary navigation while retaining a misleading “Sign-in” link that opens the contact page. The WebGL-led homepage is visually distinctive but adds a material JavaScript/performance risk that needs measurement on the real deployment.

There are **no source-confirmed Critical issues**: the pages are indexable static HTML and no `noindex` or crawler block was found. The highest priorities are classified High because they materially impair discovery, canonical consistency, relevance, trust, or conversion rather than absolutely preventing indexing.

## Scorecard

| Category | Weight | Score | Weighted contribution |
|---|---:|---:|---:|
| Technical SEO | 22% | 55 | 12.10 |
| Content quality | 23% | 42 | 9.66 |
| On-page SEO | 20% | 51 | 10.20 |
| Schema / structured data | 10% | 12 | 1.20 |
| Performance / CWV readiness | 10% | 68 | 6.80 |
| AI-search readiness | 10% | 43 | 4.30 |
| Images | 5% | 74 | 3.70 |
| **Overall** | **100%** |  | **47.96 → 48** |

Scores are implementation heuristics, not Google scores. No deployed URL, Search Console, CrUX, analytics, backlink, live SERP, or crawl-log data was available.

## What works

- `npm run build` succeeds and emits static HTML for `/`, `/product/`, `/about/`, and `/contact/`.
- Root metadata and unique page metadata are present in `src/app/layout.tsx` and each route page.
- Every route has one H1 and generally logical H2/H3 nesting.
- Core content is server-rendered; the decorative WebGL visual is not the sole carrier of meaning.
- All routes are reachable from persistent header/footer navigation.
- The document language, skip link, labelled navigation, labelled contact fields, focus styling, and reduced-motion support establish a good accessibility baseline.
- Desktop and 390×844 mobile browser checks showed no horizontal overflow.
- Animation code pauses when hidden/offscreen and limits DPR/frame rate, reducing the WebGL performance cost.

## Page inventory

Rendered `#main-content` word counts exclude the persistent header/footer and are intentionally approximate.

| Route | Page type | Rendered main words | Title | Assessment |
|---|---|---:|---|---|
| `/` | Product-led landing page | 188 | 51 chars | Strong hero and CTAs; insufficient proof, use-case specificity, and evaluation depth. |
| `/product/` | Product / feature page | 168 | 16 chars | Clear capability hierarchy; too generic and thin for commercial evaluation. |
| `/about/` | Company / trust page | 158 | 14 chars | Clear philosophy; lacks team, history, credentials, and concrete company facts. |
| `/contact/` | Lead-generation page | 79 | 16 chars | Accessible fields; `mailto:` handoff and missing trust/privacy details add friction. |

## Prioritized findings

### High — publish a canonical crawl-discovery layer

**Observation:** `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, and `/opengraph-image.png` returned 404 from the production export. Root metadata has no `metadataBase`, canonical alternates, Open Graph, Twitter, or icon definitions. `trailingSlash: true` increases the value of declaring one absolute preferred URL per route.

**First principle:** crawlers need a discoverable URL inventory and one authoritative origin/URL representation before content optimization can compound reliably.

**Dependency:** confirm the canonical HTTPS hostname and www/non-www policy first. The repository only proves an email at `kipory.com`; that is not sufficient authority to invent the production origin.

**Recommendation:** once the hostname is approved, add Next metadata routes for robots and sitemap, set `metadataBase`, declare route canonicals, and add favicon/Open Graph/Twitter assets and metadata. Ensure the static host publishes the generated root files.

**How this could fail:** the deployment platform may already inject valid files and canonical tags outside this repository. Test the deployed endpoints and rendered `<head>` before shipping duplicate rules.

**Leading indicator:** Search Console accepts the sitemap and discovers four canonical 200 URLs; Google-selected canonicals match declarations; share debuggers extract the intended image/title.

### High — make positioning match a specific buyer problem

**Observation:** copy repeatedly uses broad terms such as “signals,” “flow,” “system view,” and “where your business runs,” but does not define a priority workflow, industry, integration surface, deployment model, measurable outcome, or buyer role. No live SERP or keyword target was supplied, so this is a buyer-clarity finding rather than a ranking forecast.

**First principle:** non-branded relevance and conversion require the page to answer who the product is for, what concrete job it performs, how it works, and why the claim is credible.

**Dependency:** ICP/buyer research and product messaging approval. Do not manufacture specificity that the product cannot substantiate.

**Recommendation:** rewrite each hero around one audience, one workflow/problem, one outcome, and one next step. Expand Product with inputs, setup, outputs, governance/auditability, integrations, security/limitations, and decision criteria. Create focused use-case pages only where real differentiated evidence exists.

**How this could fail:** if acquisition is intentionally almost entirely branded/invite-only, broader category language may be sufficient. Verify against actual query and sales-call data.

**Leading indicator:** growth in non-branded impressions for approved workflow terms, higher Home→Product continuation, and more qualified contact submissions.

### High — repair trust and conversion mismatches

**Observation:** the header label “Sign-in” links to `/contact/`; the contact form submits through `mailto:`; no privacy, terms, direct company identity, expected response time, customer proof, case study, team/credentials, or testimonial is present in the repository.

**First principle:** users must understand the consequence of a click and have enough evidence to trust a high-consideration B2B product.

**Dependency:** product decision on whether a real authentication destination exists; approved legal/company/customer content; a chosen form-processing/privacy approach.

**Recommendation:** rename the header CTA to “Request access” or point it to the real sign-in flow. Add truthful proof and company/legal details. Replace or measure the `mailto:` flow; at minimum expose a plain email fallback, response-time expectation, and privacy notice.

**How this could fail:** existing analytics could show intentional high-performing contact conversion from the “Sign-in” label or a target audience that reliably uses configured mail clients. Test rather than assume.

**Leading indicator:** lower immediate exits on Contact, improved header CTA→contact completion, fewer support questions about access/privacy, and sales calls referencing published proof.

### High — strengthen titles, descriptions, and page depth

**Observation:** effective titles are `Product — Kipory` (16 characters), `About — Kipory` (14), and `Contact — Kipory` (16). Homepage description is 113 characters, About 99, and Contact 103. Each main page also lacks decision-critical depth; word count is not itself a ranking factor, but here it corroborates missing coverage.

**First principle:** metadata should identify the page’s unique intent, and the page must satisfy the buyer questions promised by that intent.

**Dependency:** final positioning and keyword choices, then post-launch query validation.

**Recommendation:** write unique intent-led titles that name the solution/audience and remain concise; expand descriptions naturally with a useful action. Add content only where it resolves real objections, explains mechanisms, or supplies evidence.

**How this could fail:** Google may rewrite titles/descriptions or production may override metadata. Validate the deployed head and monitor actual SERP presentation.

**Leading indicator:** improved CTR on pages with stable impressions, fewer title rewrites, and increased assisted conversions from Product/About.

### Medium — add truthful entity and page schema

**Observation:** no JSON-LD, Microdata, or RDFa exists. The site provides enough static copy for basic entity markup but not enough verified commercial data to safely invent detailed product/offers claims.

**First principle:** structured data should clarify facts already visible on the page; it is not a substitute for indexability, proof, or content.

**Dependency:** confirmed canonical origin, organization identity/logo/social profiles, and verified product facts.

**Recommendation:** add `Organization` and `WebSite` JSON-LD at the site level, then `WebPage`/`BreadcrumbList` where supported. Consider `SoftwareApplication` or `WebApplication` only after category, operating-system/browser, offers, and claims are accurate and visible. Never add HowTo schema; do not add FAQPage for Google rich-result benefit.

**How this could fail:** markup can be syntactically valid but inconsistent with visible facts or ineligible for any enhanced result. Validate both syntax and content parity.

**Leading indicator:** zero errors in Schema Markup Validator/Rich Results Test and consistent entity extraction; no guaranteed ranking or AI-citation uplift is assumed.

### Medium — measure and budget the WebGL homepage

**Observation:** the homepage references about 1,288,303 bytes of uncompressed JavaScript (about 304,451 bytes under a local Brotli estimate), compared with 574,102/152,391 bytes on secondary pages. It renders two canvases. Existing code mitigates load with visibility pausing, mobile 30fps, and DPR caps, but LCP/INP/energy impact is unmeasured.

**First principle:** decorative rendering must not delay the primary textual LCP or block initial interaction.

**Dependency:** a deployed URL, representative mid/low-tier mobile devices, and a static/low-motion fallback design.

**Recommendation:** establish JS and rendering budgets; measure mobile Lighthouse and real-user CWV; defer/conditionally load the Three/WebGL scene when it improves the metrics; preserve the text-first hero and reduced-motion path.

**How this could fail:** the local byte estimate does not prove poor CWV, and modern caching/compression may make the experience acceptable. Only trace/field data should trigger a costly redesign.

**Leading indicator:** p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; no initial long tasks; hero text remains the LCP element.

### Medium — finish the visual/content placeholders and mobile information architecture

**Observation:** the homepage source exposes an `aria-label="Illustration placeholder"` on a lower section. At 390px the primary navigation is hidden, while the misleading Sign-in CTA remains. The page does not overflow horizontally, and the primary hero CTAs remain visible.

**First principle:** unfinished or unavailable interface affordances reduce perceived credibility and block users from exploring the site.

**Dependency:** a finished visual/semantic replacement and an approved mobile navigation design.

**Recommendation:** remove or replace the placeholder with meaningful content; add a mobile navigation path rather than hiding the primary links; keep decorative visuals hidden from assistive technology and explain meaningful ones accurately.

**How this could fail:** if the placeholder is excluded by the real deployment or the four-page footer-only navigation is intentional and validated, urgency falls.

**Leading indicator:** no placeholder language in accessibility scans, improved mobile multi-page journeys, and lower header/contact confusion.

### Low — plan image handling before raster assets arrive

**Observation:** current visual assets are small SVGs and no raster `<img>`/`next/image` content appears on public pages. `images.unoptimized: true` is harmless for this inventory but means future raster media will not receive Next image optimization.

**Recommendation:** keep current SVGs direct. Before publishing hero/customer/product raster media, choose a static-host/CDN image loader or build-time responsive AVIF/WebP process with explicit dimensions.

**Failure check:** representative images select size-appropriate sources without visible degradation.
**Leading indicator:** no “properly size images” audit failures and stable image transfer bytes/CLS.

## AI-search / GEO assessment

Core page copy is server-rendered, headings are semantic, and the homepage answers “what is Kipory?” in its lead. These are useful eligibility foundations. AI-search readiness remains limited by generic claims, absent organization/product entities, no primary evidence, no named expertise, no citations, and no deep answer pages. There is no evidence in the repository that AI crawlers are blocked, but the deployed CDN policy is unknown because no robots file exists locally.

Do not treat `llms.txt` as a ranking or citation lever. It may be added later as low-cost documentation, but it should not displace canonical/indexing, content, evidence, and entity work.

## Measurement evidence

- Build: Next.js 16.3.2 production build completed successfully; all four public routes are static.
- Local endpoint checks: four public routes returned 200; robots, sitemap, favicon, and OG image returned 404.
- Rendered HTML/browser: unique titles/descriptions; one H1 per route; zero canonicals, Open Graph tags, and JSON-LD; desktop and 390px mobile visually rendered.
- Mobile: viewport width matched body scroll width (390px); primary nav computed to `display: none`; header CTA remained visible.
- Performance bytes: script references were summed from the static HTML and build artifacts; Brotli values are local compression estimates, not network measurements.
- SEO renderer: unavailable because the skill’s isolated runtime is not set up. Per skill policy, setup was not performed without an explicit `/seo setup` request.

## What this audit could not establish

- Whether the deployed site or CDN injects robots, sitemap, canonicals, security headers, redirects, compression, or schema.
- Google indexation, selected canonicals, queries, impressions, CTR, or organic conversions.
- CrUX field LCP/INP/CLS, live Lighthouse lab data, device energy impact, or CDN transfer sizes.
- Backlinks, unlinked mentions, live AI citations, competitor/SERP page-type consensus, or actual target keywords.
- Business-approved product claims, ICP, customer evidence, legal identity, or the canonical production hostname.

## Next audit loop

After deployment, rerun against the canonical HTTPS URL and add Search Console/CrUX data. The next audit should test: sitemap processing and selected canonicals; mobile p75 LCP/INP/CLS; non-branded impressions for the approved workflow/category terms; Home→Product→Contact progression; and whether published proof/use-case content improves qualified conversions. Capture this report as the source baseline and compare after the first launch SEO release.
