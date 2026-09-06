---
name: seo
description: Improve Eudora Physio search discovery through metadata, structured data, crawl controls, and locally relevant content signals.
---

# Eudora Physio SEO

Use this skill for technical SEO, metadata, Open Graph/social tags, structured data, sitemap/robots files, indexing, and local-search improvements.

## Project context

Read `PROJECT_CONTEXT.md` first. Eudora Physio offers home-visit physiotherapy in specified Bangalore localities and online consultations. Search work must support qualified local discovery and booking, not make unverified performance or medical claims.

## Rules for implementation

- Keep business name, practitioner name, qualifications, contact details, operating hours, and service areas identical across page content, footer, metadata, schema, and Google Business Profile integrations.
- Give each public page one clear, unique title, meta description, canonical URL, and Open Graph representation that matches its visible page content.
- Follow the project page map and URL slugs in `PROJECT_CONTEXT.md`; do not create thin or duplicate locality pages. Use meaningful locality content within the Areas We Serve page instead.
- Use `ProfessionalService` or `LocalBusiness`, `Person`, `Service`, `FAQPage`, `WebSite`, and `BreadcrumbList` structured data only when the corresponding visible content is approved and present on the page.
- Ensure FAQ schema exactly matches visible FAQ questions and answers. Never place unpublished, speculative, or promotional-only content in schema.
- Generate a sitemap for canonical public URLs and a conservative `robots.txt`; do not block production pages that should be discoverable.
- Preserve the site’s static-serving model unless explicitly asked to introduce build tooling or server-side rendering.

## Content integrity and validation

- Do not claim rankings, outcomes, patient totals, ratings, testimonials, or clinical outcomes that are not verifiable and approved.
- Keep the tele-consultation limitation visible on the relevant page; metadata and schema must not imply that remote care includes a full hands-on examination.
- Validate rendered head tags, JSON-LD syntax, canonical URLs, internal links, sitemap entries, and robots rules after changes.
- Treat domain and production URL as pending until supplied; do not invent a canonical production hostname.
