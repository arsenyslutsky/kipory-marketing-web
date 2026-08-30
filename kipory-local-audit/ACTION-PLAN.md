# Kipory SEO Action Plan

## Phase 1 — launch eligibility and trust (week 1)

1. Confirm the canonical HTTPS hostname and www/non-www policy.
2. Add `metadataBase`, absolute canonicals, `robots.ts`, and `sitemap.ts`; verify the static host publishes them at the root.
3. Add favicon and approved Open Graph/Twitter image metadata.
4. Rename “Sign-in” to the true action or connect it to a real authentication destination.
5. Remove or replace the homepage illustration placeholder.

Success gate: all canonical routes return 200; robots and sitemap return 200; each route has exactly one intended absolute canonical; the sitemap is accepted by Search Console; no misleading header action or placeholder remains.

## Phase 2 — relevance and evaluation depth (weeks 2–3)

1. Approve a primary ICP, problem/workflow, outcome, and terminology set.
2. Rewrite route titles/descriptions around unique intent.
3. Expand Product with verified inputs, setup, outputs, governance/auditability, integrations, security/limitations, and decision criteria.
4. Add truthful company/team/legal details and a clear privacy/contact path.
5. Add approved use cases and proof; create new pages only when each has unique evidence and a distinct search/buyer intent.

Success gate: each page answers its buyer’s core questions, title/description presentation is stable, and user tests can explain who Kipory is for and why it is credible without sales assistance.

## Phase 3 — entities, conversion, and information architecture (month 2)

1. Add Organization/WebSite JSON-LD after entity facts and canonical origin are confirmed.
2. Add page/breadcrumb schema where content/navigation supports it; add software/app schema only with verified visible facts.
3. Replace or instrument the `mailto:` contact flow and publish response-time/privacy expectations.
4. Create a real mobile navigation path and contextual links from Home → Product/use cases/proof → Contact.

Success gate: schema validates without errors or content mismatches; mobile visitors can reach all primary destinations; contact start-to-completion improves.

## Phase 4 — performance and growth measurement (ongoing)

1. Measure deployed mobile Lighthouse and CrUX; trace initial WebGL work on representative mobile hardware.
2. Set page-level JavaScript/rendering budgets and introduce deferred/conditional rendering only if the measurements fail.
3. Monitor Search Console impressions/CTR by route and approved topic; monitor qualified contact conversions and multi-page journeys.
4. Re-audit after the first SEO release and quarterly thereafter.

Success gate: p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; canonical and sitemap coverage remain clean; non-branded impressions and qualified conversions trend upward.
