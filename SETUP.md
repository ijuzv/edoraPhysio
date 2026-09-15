# Setup Guide: Supabase + Twilio WhatsApp

## Prerequisites

- Supabase account
- Twilio account with WhatsApp messaging enabled
- A Twilio WhatsApp sender, for example `whatsapp:+14155238886` for sandbox testing

## 1. Supabase Setup

1. Go to https://supabase.com and create/open the project.
2. Open Settings -> API Keys.
3. Copy:
   - Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - Service role key -> `SUPABASE_SERVICE_ROLE_KEY`
4. Open SQL Editor.
5. Run `supabase/migrations/001_init.sql`.
6. Confirm the `appointments` and `feedback` tables exist.

The existing database columns still use `whatsapp_*` names for delivery status. They are now populated by Twilio delivery attempts.

## 2. Twilio WhatsApp Setup

1. Open the Twilio Console.
2. Copy your Account SID -> `TWILIO_ACCOUNT_SID`.
3. Copy your Auth Token -> `TWILIO_AUTH_TOKEN`.
4. Set your WhatsApp sender -> `TWILIO_WHATSAPP_FROM`.

For sandbox testing, the sender is usually:

```bash
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

For production, use your approved Twilio WhatsApp sender.

## 3. Environment Variables

Create/update `.env` or the hosting provider environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

BOOKING_ENABLED=true
PRACTITIONER_KEY=use-a-strong-secret-with-at-least-24-characters
SITE_URL=https://your-domain.com
PUBLIC_INDEXING=false
TRUST_PROXY=false
```

Do not use the old Meta variables:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

## 4. Local Test

```bash
npm install
npm run dev
```

1. Open http://127.0.0.1:3000/contact/
2. Submit a test consultation request.
3. Confirm a new row appears in Supabase `appointments`.
4. Confirm `whatsapp_sent`, `whatsapp_message_id`, or `whatsapp_error` is updated.
5. Check Twilio logs for the message attempt.

## 5. Deployment

Add the same environment variables in Vercel or the chosen hosting provider.

Important launch values:

- `BOOKING_ENABLED=true`
- `SITE_URL=https://edoraphysio.com` or the final production domain
- `PUBLIC_INDEXING=true` only after final content approval
- `TRUST_PROXY=true` only if the host safely overwrites `X-Forwarded-For`

## Troubleshooting

### Message Not Sending

- Check `whatsapp_error` in Supabase.
- Check Twilio Messaging logs.
- Confirm `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_FROM` are set.
- Confirm the recipient joined the Twilio sandbox, if using sandbox.
- Confirm the recipient phone includes a country code, for example `+91`.

### Form Submission Fails

- Confirm `BOOKING_ENABLED=true`.
- Confirm Supabase keys are present.
- Confirm the Supabase migration has been run.

## Security Notes

Never commit:

- `.env`
- `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_AUTH_TOKEN`

The booking workflow sends personal contact/request details to Supabase and Twilio. Retention, compliance and provider approvals must be reviewed before production launch.
