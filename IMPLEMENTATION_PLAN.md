# WhatsApp Notifications & Supabase Appointments - Implementation Plan

## Overview
Integrate WhatsApp notifications with a Supabase database to manage consultation appointments, replacing the current webhook-based system with a persistent database solution.

---

## 1. SUPABASE DATABASE SETUP

### 1.1 Database Schema

#### Table: `appointments`
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Patient Information
  patient_name VARCHAR(100) NOT NULL,
  patient_age INTEGER NOT NULL CHECK (patient_age >= 1 AND patient_age <= 120),
  patient_phone VARCHAR(20) NOT NULL,
  patient_location VARCHAR(120) NOT NULL,
  
  -- Appointment Details
  consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('home', 'online')),
  preferred_date DATE NOT NULL,
  preferred_time VARCHAR(20) NOT NULL,
  
  -- Status & Tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  idempotency_key VARCHAR(100) UNIQUE,
  
  -- Notifications
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  confirmation_sent BOOLEAN DEFAULT false,
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT,
  
  -- Consent
  privacy_consent BOOLEAN NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_phone ON appointments(patient_phone);
CREATE INDEX idx_appointments_date ON appointments(preferred_date);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);
```

#### Table: `feedback`
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL,
  
  -- Optional: Link to appointment
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  idempotency_key VARCHAR(100) UNIQUE,
  whatsapp_sent BOOLEAN DEFAULT false
);

CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
```

### 1.2 Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WhatsApp Integration
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_PHONE_NUMBER=+917418158876
WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id (if using official API)
```

---

## 2. WHATSAPP NOTIFICATION STRATEGY

### 2.1 Integration Options (Ranked by Feasibility)

#### Option A: WhatsApp Business API (Official)
**Pros:**
- Official, reliable, supports media
- Better delivery rates
- Can track message status
- Supports templates

**Cons:**
- Requires business account verification
- Setup takes time
- Costs per message

**Implementation:** Use Twilio or Meta's official WhatsApp Business API

#### Option B: WhatsApp Cloud API via Twilio
**Pros:**
- Simpler setup than direct Meta API
- Integrated rate limiting & retry logic
- Good documentation

**Cons:**
- Twilio costs
- Still needs business account approval

#### Option C: wa.me URL-based (Current - Limited)
**Current State:** Users manually message via `wa.me/917418158876?text=...`

**Limitation:** No server-side automation

### 2.2 Recommended Approach: Twilio WhatsApp API

**Why:**
- Fastest to implement
- Handles reliability and retries
- Can track delivery
- Supports templates for consistency

**Message Flow:**
```
User Submits Form → API validates → Save to Supabase → Send WhatsApp via Twilio → Record status
```

---

## 3. DATA FLOW & WORKFLOW

### 3.1 Appointment Creation Flow
```
User fills /contact/ form
    ↓
POST /api/bookings
    ↓
Backend validates (existing logic in backend.ts)
    ↓
Save to Supabase: appointments table
    ↓
Generate WhatsApp message template
    ↓
Send via Twilio WhatsApp API
    ↓
Update: whatsapp_sent = true, whatsapp_sent_at = now()
    ↓
Return success/error response to client
```

### 3.2 Feedback Flow
```
User submits feedback at /feedback/
    ↓
POST /api/feedback
    ↓
Backend validates
    ↓
Save to Supabase: feedback table
    ↓
Send confirmation WhatsApp
    ↓
Return response
```

### 3.3 Appointment Status Lifecycle
```
pending → (admin confirms) → confirmed → (after date) → completed
       ↘ (admin cancels) → cancelled
```

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Supabase Setup (No Code Changes)
- [ ] Create Supabase project
- [ ] Run migrations (create tables)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Generate API keys
- [ ] Add environment variables

**Time:** 30 minutes
**Files to Create:** `supabase/migrations/001_init.sql`

### Phase 2: Backend API Updates
**Files to Modify:**
- `src/backend.ts` - Update `handleApi()` function
  - Replace webhook call with Supabase insert
  - Add Twilio WhatsApp API call
  - Handle errors gracefully
  
- `src/supabase.ts` (NEW) - Create Supabase client
  - Initialize Supabase client
  - Define query functions
  
- `src/whatsapp.ts` (NEW) - WhatsApp message handling
  - Message templates (appointment, feedback)
  - Twilio integration
  - Error handling & retry logic

**Dependencies to Add:**
- `@supabase/supabase-js` - Supabase client
- `twilio` - WhatsApp API (optional, or use fetch)

**Time:** 2-3 hours

### Phase 3: Frontend Updates
**Files to Modify:**
- `app/interactions.tsx` - Update form submission
  - Keep existing UX (no visible changes to user)
  - Maybe add "Message sent via WhatsApp" feedback
  - Handle new error scenarios

**Time:** 30 minutes

### Phase 4: Admin Dashboard (Future)
- Create `/admin/` route for appointment management
- View, confirm, or cancel appointments
- See WhatsApp delivery status
- Analytics dashboard

**Time:** Future phase (out of scope for now)

---

## 5. CODE STRUCTURE

### New Files
```
src/
├── supabase.ts          # Supabase client & queries
├── whatsapp.ts          # WhatsApp message templates & Twilio
└── types.ts             # Shared TypeScript types

supabase/
└── migrations/
    └── 001_init.sql     # Table definitions
```

### Modified Files
```
src/backend.ts    # Update API handlers
app/interactions.tsx  # Update form handling (minor)
package.json      # Add dependencies
.env.example      # Document new env vars
```

---

## 6. WHATSAPP MESSAGE TEMPLATES

### Template 1: Appointment Confirmation
```
Hi {patient_name},

Thank you for requesting a consultation at Eudora Movement House! 📋

📅 Preferred Date: {date}
🕐 Preferred Time: {time}
📍 Type: {type} (Home visit / Online)

We'll confirm your appointment personally at {phone} within 24 hours.

Questions? Reply to this message or call +91 74181 58876.

Eudora Movement House
The light after recovery.
```

### Template 2: Feedback Confirmation
```
Hi {patient_name},

Thank you for sharing your feedback! We really appreciate your insights and will use them to improve our service.

Your feedback helps us serve you better.

Take care! 💚
Eudora Movement House
```

### Template 3: Appointment Reminder (Future)
```
Hi {patient_name},

Reminder: Your consultation with Varshini is scheduled for tomorrow at {time}.

{address for home visits}

See you then! 📍
Eudora Movement House
```

---

## 7. ERROR HANDLING & EDGE CASES

### Scenarios to Handle
```
1. Supabase down
   → Fall back to email notification to admin
   → Alert user that "We'll contact you shortly"

2. WhatsApp delivery fails
   → Record failure in database
   → Retry with exponential backoff
   → Send SMS or email as fallback

3. Invalid phone number
   → Validate format before sending
   → Return friendly error to user
   → Store for manual follow-up

4. Rate limiting
   → Implement queue system using Supabase
   → Track submissions per IP/phone
   → Prevent spam submissions

5. Duplicate submissions (same idempotency_key)
   → Return cached response (idempotent)
   → Don't send WhatsApp twice
```

---

## 8. SECURITY & PRIVACY

### Row Level Security (RLS)
```sql
-- Only allow service role to insert/update
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role only"
  ON appointments
  FOR ALL
  USING (auth.role() = 'service_role');
```

### API Key Management
- Use `SUPABASE_SERVICE_ROLE_KEY` server-side only (never expose)
- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` with RLS restrictions
- Store Twilio credentials in `.env.local` (never commit)

### Data Privacy
- Don't log phone numbers in plain text
- Mask phone in error messages
- Implement data retention policy (delete after 90 days)
- GDPR compliance (right to deletion)

---

## 9. TESTING STRATEGY

### Unit Tests (Test-Driven)
```typescript
// src/__tests__/whatsapp.test.ts
- Test message template formatting
- Test phone number validation

// src/__tests__/supabase.test.ts
- Test database queries
- Test error handling
```

### Integration Tests
```typescript
// test/appointments.test.ts
- Test full appointment submission flow
- Mock Supabase & Twilio
- Verify database state
```

### Manual Testing
1. Submit test form with valid data
2. Verify message in Twilio logs
3. Check Supabase for new record
4. Test error scenarios (network down, invalid phone)

---

## 10. DEPLOYMENT CHECKLIST

### Before Production
- [ ] Supabase project created & secured
- [ ] Twilio account set up & funded
- [ ] WhatsApp templates approved by Meta
- [ ] Environment variables configured
- [ ] RLS policies enabled
- [ ] Database backups enabled
- [ ] Error monitoring set up (Sentry)
- [ ] Rate limiting configured
- [ ] Tests passing

### Gradual Rollout
- [ ] Deploy to staging first
- [ ] Test with team members
- [ ] Monitor WhatsApp delivery rates
- [ ] Gather user feedback
- [ ] Fix any issues
- [ ] Deploy to production

---

## 11. FUTURE ENHANCEMENTS

### Phase 2 (After launch)
- [ ] Admin dashboard at `/admin/appointments`
- [ ] Appointment reminders (24h before)
- [ ] SMS fallback for failed WhatsApp
- [ ] Email notifications to admin
- [ ] Automatic status updates
- [ ] Analytics & reporting

### Phase 3 (Long-term)
- [ ] Calendar integration (Google Calendar sync)
- [ ] Automated confirmation workflow
- [ ] Video call link generation
- [ ] Patient portal
- [ ] Appointment rescheduling via WhatsApp

---

## 12. COST ESTIMATE

### Monthly Costs
```
Supabase:     $25/month (starter + storage)
Twilio:       $0.01-0.05 per WhatsApp message
              (est. 100-200 messages/month = $1-10)
Total:        ~$35-40/month
```

### Time Investment
```
Supabase setup:     1 hour
Backend integration: 3 hours
Frontend updates:   1 hour
Testing:           2 hours
Deployment:        1 hour
TOTAL:            ~8 hours
```

---

## 13. DECISION POINTS FOR USER

**Q1: WhatsApp API Provider?**
- Option A: Use Twilio (recommended, simpler)
- Option B: Use Meta's official API (cheaper long-term)
- Option C: Manual wa.me links only (current, no DB)

**Q2: Store all data or just active appointments?**
- Store all (compliance, analytics)
- Store only current/active (less storage)

**Q3: Admin notification channel?**
- WhatsApp to practitioner phone
- Email notifications
- Both

---

## Next Steps

1. **Confirm you want to proceed** with this plan
2. **Choose WhatsApp provider** (Twilio vs Meta API)
3. **Set up Supabase project** and provide credentials
4. **Get Twilio account** if going that route
5. **Start Phase 1** implementation

Would you like me to proceed with any of these phases, or adjust the plan first?
