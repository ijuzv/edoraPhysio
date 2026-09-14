# Eudora Movement House

Full-stack Next.js App Router website with React server-rendered pages and Node.js route handlers. The design follows the client’s supplied logo and website reference: teal, sage, generous spacing, serif headings and restrained interaction.

## Run locally

Use Node 22 or later. Install dependencies with `npm install`.

```powershell
npm run build
npm start
```

Open http://127.0.0.1:3000. `npm run dev` starts the development server with hot reload. Run `npm run build` before `npm test`; the tests exercise the production Next.js app and API validation.

## Editing

- `app/[[...slug]]/page.jsx`: React page rendering and per-page metadata.
- `app/layout.jsx`: shared header, footer and page layout.
- `src/content.js`: existing page copy and markup, rendered as React elements on the server.
- `app/globals.css`: responsive design and print styles.
- `app/interactions.jsx`: client component for menus, forms and document preview.
- `app/api/[...path]/route.js`: Next.js backend route handlers.
- `src/backend.js`: validation, notification delivery, rate limits and sessions.
- `src/workspace.js`: practitioner document editor, returned only after sign-in.
- `app/robots.txt/route.js`, `app/sitemap.xml/route.js`: search engine controls.
- `public/assets/eduro-logo.png`: supplied client logo, unmodified.

The former Snake starter has been replaced. The site contains Home, Services, About, Why Eudora, Online Physiotherapy, Areas, FAQ, Contact, Feedback, Privacy, Terms and Practitioner pages.

## Current preview versus launch

The visual site and workflows are implemented. The preview is intentionally unindexed. Booking requests are stored in Supabase and Twilio can send a WhatsApp acknowledgement when configured. WhatsApp click-to-chat links are still functional.

Before enabling public submissions:

1. Confirm clinical copy, credentials, contact information, hours and service areas. The business name is **Eudora Movement House**, confirmed by the user. The existing email remains `connect@eudoraphysio.com`.
2. Replace the marked draft Privacy and Terms pages with client-approved policies. Identify notification providers, handling of patient information and retention arrangements.
3. Finalise feedback questions and the practitioner’s exercise-list requirements.
4. Supply the approved practitioner portrait and optional genuine patient stories. No fabricated portrait, review or patient statistics are used.
5. Configure Supabase, Twilio WhatsApp, practitioner access key, production origin and HTTPS hosting.
6. Connect approved analytics and the verified Google Business Profile. Neither is fabricated or linked to an unknown account.

## Configuration

Copy `.env.example` to `.env` and supply values. Never commit `.env`.

- Development and start scripts bind to `127.0.0.1:3000`. Set `PORT` or pass `--port` to change the port. For hosting, run `next start --hostname 0.0.0.0` behind your HTTPS reverse proxy. Next.js loads `.env` automatically.
- `TRUST_PROXY=true`: use client IPs from `X-Forwarded-For` only when the hosting proxy overwrites that header. Otherwise rate limiting uses a shared bucket.
- `SITE_URL`: final HTTPS origin. Produces canonical URLs, Open Graph URLs and a sitemap. The domain is not inferred from the email address.
- `PUBLIC_INDEXING=true`: enable indexing only after approved content is live. Practitioner, feedback and draft legal pages remain noindex in this version.
- `BOOKING_ENABLED=true`: opt in to actual booking/feedback delivery once approved policies and provider settings are ready.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key. Keep server-side only.
- `TWILIO_ACCOUNT_SID`: Twilio account SID.
- `TWILIO_AUTH_TOKEN`: Twilio auth token. Keep secret.
- `TWILIO_WHATSAPP_FROM`: Twilio WhatsApp sender, for example `whatsapp:+14155238886` for sandbox.
- `PRACTITIONER_KEY`: at least 24 characters. Use a strong unique secret shared only with the practitioner. Access is disabled until configured. HTTPS production uses Secure, HttpOnly, SameSite=Strict session cookies.

## Notification integration

The backend stores consultation requests in Supabase, then attempts to send a Twilio WhatsApp acknowledgement to the submitted contact number. The acknowledgement is **not appointment confirmation**; the site copy still tells patients that the appointment will be confirmed personally.

Delivery status is written back to the existing `whatsapp_*` columns in Supabase for compatibility with the current migration. Failed delivery does not expose secrets or raw provider responses to the visitor.

The integration sends personal booking details to Supabase and Twilio. Account costs, processing location, retention and compliance choices depend on those providers and need to be agreed before launch.

## Practitioner workflow

Open `/practitioner/` and use the configured access key. Select clinician-prescribed exercises, enter individual dosage/precautions, or switch to a consultation summary. Print / Save as PDF uses the browser print dialogue. There is no generic medical dosage and no patient portal. Entered details stay in the current tab and are lost on reload; save the PDF before leaving. Review each document before sharing it manually.

## Design references

- Client logo and supplied page screenshot: primary art direction.
- https://sixphysio.com/: service discovery and clear booking actions.
- https://puresportsmed.com/: services and practitioner information.
- https://appiclinics.com/physiotherapy/: explanation of in-person and online care.

## Verification

`npm test` covers public routes, blocked private/source files, server-side validation, consent, provider failures, duplicate submissions, feedback, cross-origin rejection, protected practitioner sessions, logout CSRF and production canonical/sitemap behaviour. Notification tests use a mock transport and do not contact patients or third-party providers.

Migration browser checks cover desktop/mobile rendering, menu navigation, booking fallback, practitioner sign-in and exercise-preview updates. Production build and all 11 automated tests passed. No production delivery, analytics, business-profile ownership or hosting has been verified because those accounts are not yet configured.

## Hosting architecture

Run one long-lived Next.js Node process for this release. Sessions, rate limits and request deduplication remain in memory and reset on restart. Multiple replicas or serverless hosting require a shared session/rate-limit store before launch. No database or external account was added by this migration.
