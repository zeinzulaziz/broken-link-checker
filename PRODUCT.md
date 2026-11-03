# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mixed audience, tool is public: website owners/managers (non-technical or semi-technical) checking their own site, developers/agencies auditing client sites, and SEO/content specialists exporting results to hand off. No single primary; copy must stay legible to all three.

## Product Purpose

A free, no-signup broken link checker. Crawls a site from a start URL, checks internal and external links in parallel, reports HTTP status per link with live progress, and exports the result as JSON or CSV. Success = a dead link list the user can act on, in one pass, without creating an account.

## Positioning

Free and accountless, in contrast to paid or gated tooling (Ahrefs, Screaming Frog, similar SaaS checkers). Self-hostable open source as a secondary trait: the deployed public instance works without signup.

## Operating Context

User pastes a URL, watches a batched scan (serverless, 100 pages per batch), reviews broken vs working counts, filters the broken list by internal/external and status code, hides noisy rows, exports JSON/CSV for fixing. Interface language is English.

## Capabilities and Constraints

- Crawls from start URL, follows internal links; JS-heavy sites under-report (HTML-only crawl)
- Parallel link checking; batches of 100 pages to fit serverless timeouts
- No database; results live in memory for the length of a job
- No auth; intended as a local/self-hosted tool — not hardened for public abuse
- Export: JSON and CSV (BOM-prefixed for Excel)
- Stack: Node + Express, axios, cheerio, url-parse; static frontend in `public/`; deployed on Vercel as serverless functions
- Name "Broken Link Checker", free tier positioning, export formats: all to be preserved
- Repo is public; do not fabricate metrics, uptime, or user counts

## Product Principles

1. One job per visit: paste URL, get the list, leave.
2. No invented proof: no fake user counts, testimonials, or certifications.
3. Free and accountless is the product; signup walls or paywalls are off-limits.
4. Honest limits: surface crawl constraints instead of hiding them.
5. Exports are the hand-off artifact; they must stay complete and parseable.

## Accessibility & Inclusion

WCAG AA contrast; keyboard operable; visible focus; responsive down to 390px. No product-specific requirements beyond that were established.
