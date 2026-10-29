# Broken Link Checker

A small self-hosted service that crawls a website and tells you which links are
dead — internal and external — with status codes and an export you can hand to
whoever has to fix them.

**Deployed:** https://broken-link-checker-sepia.vercel.app

## Why

Broken links are the cheapest SEO win available and the least glamorous work on
any site, which is exactly why they stay broken for years. This crawls the site,
checks every link in parallel, and produces a list instead of a bad feeling.

## What it does

- Crawls from a start URL, following internal links
- Checks links in parallel instead of one at a time
- Separates internal from external, so you know who to ask
- Reports HTTP status code and error message per link
- Live progress while the crawl runs
- Export results as JSON or CSV

## Stack

Node + Express, with `axios` for requests, `cheerio` for parsing, and `url-parse`
for normalising. No database — results live in memory for the length of the job.

## Run locally

```bash
npm install
npm start          # http://localhost:3000
```

`PORT` is read from `.env` if present.

## Deploy

`vercel.json` is included, so the API runs as a serverless function.

## Limits

- No persistence: restart the process, lose the report
- No auth: it's a local tool, don't expose it publicly as-is
- JavaScript-heavy sites will under-report, because the crawl only sees HTML
