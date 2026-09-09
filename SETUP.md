# Setup Guide: Supabase + WhatsApp Cloud API Integration

## Prerequisites
- Supabase account (free tier available)
- Meta Business Account
- WhatsApp Business Account (linked to Meta)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: eudora-movement-house (or your choice)
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to India (Singapore or Mumbai if available)
5. Click "Create new project" and wait 1-2 minutes

### 1.2 Get API Keys
1. Go to Settings → API Keys
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)
3. Add these to `.env.local`

### 1.3 Create Database Tables
1. Go to SQL Editor
2. Click "New query"
3. Copy entire contents of `supabase/migrations/001_init.sql`
4. Paste into the SQL editor
5. Click "Run"
6. Verify tables appear in "Database" → "Tables"

**Tables created:**
- `appointments` - Stores consultation requests
- `feedback` - Stores patient feedback

### 1.4 Verify RLS Policies
1. Go to "Authentication" → "Policies"
2. Verify "Service role access only" exists on both tables
3. Note: Client-side access is blocked (good security)

---

## Step 2: WhatsApp Cloud API Setup

### 2.1 Create Meta Business Account
1. Go to [business.facebook.com](https://business.facebook.com)
2. Create account or sign in
3. Go to Business Settings → Accounts

### 2.2 Create WhatsApp Business App
1. Go to [Meta App Dashboard](https://developers.facebook.com/apps)
2. Click "Create App"
3. Choose "Business" app type
4. Fill in app name: "Eudora Movement House"
5. Accept terms and create app

### 2.3 Add WhatsApp Product
1. In app dashboard, find "Products"
2. Click "+" next to WhatsApp
3. Choose "WhatsApp Business Platform"
4. Follow setup wizard

### 2.4 Create Message Template
1. Go to WhatsApp Manager (inside app)
2. Click "Message Templates"
3. Create template: `appointment_confirmation`
   - **Category**: Health/Medical
   - **Body**:
   ```
   Hi {{1}},

   Thank you for requesting a consultation! 📋
   
   📅 Date: {{2}}
   🕐 Time: {{3}}
   📍 Type: {{4}}
   
   We'll confirm shortly.
   
   Eudora Movement House
   ```

4. Create template: `feedback_acknowledgment`
   - **Category**: Feedback/Review
   - **Body**:
   ```
   Hi {{1}},

   Thank you for your feedback! We appreciate your insights. 💚
   
   Eudora Movement House
   ```

Both templates take ~1 hour for Meta approval.

### 2.5 Generate Access Token
1. Go to App Settings → Basic
2. Find "App ID" and "App Secret"
3. Click "Generate Access Token"
4. Choose your WhatsApp Business Account
5. Copy the token → `WHATSAPP_ACCESS_TOKEN`

### 2.6 Get Phone Number ID
1. Go to WhatsApp Business Platform → Phone Numbers
2. Click your phone number (+91 74181 58876)
3. Copy "Phone Number ID" → `WHATSAPP_PHONE_NUMBER_ID`
4. Go to Business Settings → Accounts → WhatsApp Accounts
5. Copy "Account ID" → `WHATSAPP_BUSINESS_ACCOUNT_ID`

### 2.7 Add Environment Variables
Create/update `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
WHATSAPP_ACCESS_TOKEN=EAADt...
WHATSAPP_PHONE_NUMBER_ID=102012345678901
WHATSAPP_BUSINESS_ACCOUNT_ID=102012345678902
```

---

## Step 3: Install Dependencies

```bash
npm install
```

This installs `@supabase/supabase-js` which is required for the integration.

---

## Step 4: Test the Integration

### 4.1 Local Testing
```bash
npm run dev
```

1. Navigate to http://localhost:3000/contact/
2. Fill in the form with test data:
   - Name: Test User
   - Phone: +91 74181 58876 (or your test phone)
   - Other fields as required
3. Submit the form

### 4.2 Verify Booking
1. Go to Supabase Dashboard
2. Click "appointments" table
3. Should see new row with:
   - `patient_name: "Test User"`
   - `whatsapp_sent: true` (if templates approved)
   - `whatsapp_message_id: "..."`

### 4.3 Check WhatsApp
- Look for WhatsApp message at the phone number provided
- Message should contain appointment details

### 4.4 Check Logs
If WhatsApp message fails:
1. Check `whatsapp_error` field in Supabase
2. Common issues:
   - Template not approved yet (wait 1 hour)
   - Phone number not in E.164 format
   - Access token expired

---

## Step 5: Deployment

### 5.1 Add Secrets to Hosting
If using Vercel/Netlify:
1. Go to project settings
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - `PRACTITIONER_KEY`
   - `SITE_URL`
   - `PUBLIC_INDEXING=true` (after verification)

### 5.2 Test in Production
1. Deploy to staging/production
2. Submit a test booking
3. Verify in Supabase and WhatsApp

---

## Troubleshooting

### WhatsApp Message Not Sending
**Issue:** `whatsapp_error: "Template not approved"`
- **Solution**: Meta templates take 1-2 hours to approve. Check meta.com after 1 hour.

**Issue:** `whatsapp_error: "Invalid recipient phone"`
- **Solution**: Ensure phone number includes country code (e.g., +91)

**Issue:** `whatsapp_error: "Invalid access token"`
- **Solution**: Token expired. Regenerate from Meta dashboard.

### Database Errors
**Issue:** "NEXT_PUBLIC_SUPABASE_URL not configured"
- **Solution**: Set `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

**Issue:** "Row not inserted" with duplicate key error
- **Solution**: Idempotency key collision. This is actually OK - means same request already processed.

### Form Submission Fails
**Issue:** 503 error "Online requests not available"
- **Solution**: Set `BOOKING_ENABLED=true` in `.env.local` (or `.env` on server)

---

## Environment Variables Summary

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From Supabase Settings |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Keep secret! Server-side only |
| `WHATSAPP_ACCESS_TOKEN` | ✅ | From Meta App Dashboard |
| `WHATSAPP_PHONE_NUMBER_ID` | ✅ | From WhatsApp Manager |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | ✅ | From Business Settings |
| `PRACTITIONER_KEY` | ✅ | Min 24 chars for workspace access |
| `SITE_URL` | ✅ (prod) | For SEO/canonical URLs |
| `PUBLIC_INDEXING` | ❌ | false (default), true for production |
| `BOOKING_ENABLED` | ❌ | false (default), enable after setup |

---

## What's Working Now

✅ Appointments saved to Supabase database  
✅ Feedback saved to Supabase database  
✅ WhatsApp messages sent automatically  
✅ Message delivery tracking  
✅ Idempotency (no duplicate submissions)  
✅ Rate limiting per IP  
✅ Practitioner workspace (existing functionality)

---

## Next Steps (Future)

- [ ] Admin dashboard to view/manage appointments
- [ ] Appointment reminders via WhatsApp
- [ ] SMS fallback for failed WhatsApp
- [ ] Email notifications to practitioner
- [ ] Calendar sync (Google Calendar)
- [ ] Patient portal

---

## Support

For issues:
1. Check troubleshooting section above
2. Check Supabase logs: Logs → Edge Functions
3. Check Meta logs: App Dashboard → Logs
4. Check browser console (F12) for client-side errors

---

## Security Notes

⚠️ **Never commit:**
- `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_ACCESS_TOKEN`

✅ **Use:**
- `.env.example` as template
- Environment variables on hosting platform
- Secret management tools (Vercel Secrets, etc.)

---

## Pricing

**Supabase:**
- Free: Up to 500 MB storage (plenty for start)
- Pro: $25/month for more

**WhatsApp:**
- First 1,000 conversations/month: Free
- After: $0.0079-$0.125 per message (depending on conversation type)

**Estimate:** $0-25/month until you scale

---

## Questions?

Refer to:
- Supabase Docs: https://supabase.com/docs
- Meta WhatsApp API: https://developers.facebook.com/docs/whatsapp/cloud-api
- This project's GitHub issues
