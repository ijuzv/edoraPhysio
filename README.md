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

The former Snake starter has been replaced. The site contains Home, Services, About, Why Eudora, Online Physiotherapy, Areas, FAQ, Patient Voices, Contact, Feedback, Privacy, Terms and Practitioner pages.

## Current preview versus launch

The visual site and workflows are implemented. The preview is intentionally unindexed and does not report a successful consultation request until a configured notification endpoint accepts it. WhatsApp links are functional; the form can prepare a message for the visitor to review and send. Preparing a message does not send it.

Before enabling public submissions:

1. Confirm clinical copy, credentials, contact information, hours and service areas. The business name is **Eudora Movement House**, confirmed by the user. The existing email remains `connect@eudoraphysio.com`.
2. Replace the marked draft Privacy and Terms pages with client-approved policies. Identify notification providers, handling of patient information and retention arrangements.
3. Finalise feedback questions and the practitioner’s exercise-list requirements.
4. Supply the approved practitioner portrait and optional genuine patient stories. No fabricated portrait, review or patient statistics are used.
5. Configure the notification delivery endpoint, practitioner access key, production origin and HTTPS hosting.
6. Connect approved analytics and the verified Google Business Profile. Neither is fabricated or linked to an unknown account.

## Configuration

Copy `.env.example` to `.env` and supply values. Never commit `.env`.

- Development and start scripts bind to `127.0.0.1:3000`. Set `PORT` or pass `--port` to change the port. For hosting, run `next start --hostname 0.0.0.0` behind your HTTPS reverse proxy. Next.js loads `.env` automatically.
- `TRUST_PROXY=true`: use client IPs from `X-Forwarded-For` only when the hosting proxy overwrites that header. Otherwise rate limiting uses a shared bucket.
- `SITE_URL`: final HTTPS origin. Produces canonical URLs, Open Graph URLs and a sitemap. The domain is not inferred from the email address.
- `PUBLIC_INDEXING=true`: enable indexing only after approved content is live. Practitioner, feedback and draft legal pages remain noindex in this version.
- `BOOKING_ENABLED=true`: opt in to actual booking/feedback delivery once approved policies and the provider are ready.
- `NOTIFICATION_WEBHOOK_URL`: HTTPS endpoint for the selected notification integration. No paid provider or account has been created.
- `NOTIFICATION_WEBHOOK_TOKEN`: optional bearer credential for that endpoint.
- `PRACTITIONER_KEY`: at least 24 characters. Use a strong unique secret shared only with the practitioner. Access is disabled until configured. HTTPS production uses Secure, HttpOnly, SameSite=Strict session cookies.

## Notification integration contract

The backend sends JSON to the configured endpoint:

```json
{
  "event": "consultation.requested",
  "id": "a-client-generated-idempotency-key",
  "receivedAt": "an-ISO-timestamp",
  "data": {
    "name": "Example person",
    "age": 30,
    "phone": "+919999999999",
    "location": "Example locality",
    "type": "home",
    "date": "2026-10-01",
    "time": "10:00 AM–1:00 PM",
    "consent": true
  }
}
```

Feedback uses `feedback.received` with `rating`, `message` and `consent`.

The provider must durably accept the request before returning 2xx, deduplicate using the `Idempotency-Key` header / event ID, notify the practitioner, and send the patient an acknowledgement through the configured messaging channel. Patient acknowledgement is **not appointment confirmation**. The website also displays an on-screen acknowledgement after successful acceptance.

The integration receives personal booking data and private feedback. Account costs, processing location and retention depend on the selected provider and need to be agreed before launch. No raw patient data or credentials are logged by the app. This implementation does not store booking records in a database. Failed or ambiguous delivery returns an error and offers direct contact; retries reuse the event ID. In-memory deduplication lasts 24 hours and resets on restart, so provider-side deduplication is required in production.

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
