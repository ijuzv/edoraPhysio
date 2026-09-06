---
document_type: project-context
project: Eudora Movement House Website
version: 1.0
status: baseline-draft
source_documents:
  - Eudora Cnt.pdf
  - Eudora Development Agreement.pdf
  - Eudora Website Scope Confirmation.pdf
last_updated: 2026-09-06
---

# Eudora Movement House Website - Project Context

## 1. Purpose

Build a mobile-first, lead-generation website for Eudora Movement House, a solo physiotherapy practice in Bangalore. The website must build trust and convert visitors and referrals into consultation requests through a booking form and WhatsApp.

## 2. Product and Audience

| Item | Context |
| --- | --- |
| Business | Eudora Movement House |
| Tagline | The Light After Recovery |
| Practitioner | Varshini Balamurugan, MPT (Musculoskeletal Science), BPT, IAP member |
| Services | Home visits in Bangalore and online/tele-physiotherapy consultations |
| Primary users | Bangalore residents seeking physiotherapy for pain, injury, mobility, rehabilitation, or sports recovery |
| Secondary users | Post-surgery/post-injury patients and people who prefer home or remote care |
| Primary conversion | Consultation request submitted or WhatsApp conversation started |

## 3. Functional Scope

### Public pages

- Home
- Why Eudora
- About Varshini
- Services and Conditions Treated
- Tele-Physiotherapy
- Areas We Serve
- Testimonials
- FAQ
- Contact / Book Now
- Privacy Policy and Terms of Use (standard legal pages and consent mechanism)

### Booking and communication

- Provide a consultation/registration form with: full name, age, contact number, location, consultation type (home visit or online), and preferred date and time.
- Require consent to the Privacy Policy and Terms of Use before form submission.
- On submission, notify the practitioner through WhatsApp and/or email, as configured.
- Send the patient an automatic acknowledgement that the request was received and the appointment will be confirmed separately.
- Keep appointment confirmations, rescheduling, cancellations, follow-ups, and payment confirmations manual for this release.
- Provide site-wide, click-to-chat WhatsApp access and clear phone/email contact details.

### Practitioner tools

- Exercise prescription tool: select exercises and stretches for an individual patient, then create a clean, shareable exercise chart.
- Consultation summary: provide a standard ready-to-fill consultation-summary format.
- Patient feedback form: provide a short configurable post-session feedback form; exact questions are pending.

## 4. Content and Information Architecture

### Site-wide requirements

- Use one H1 per page; use H2 for sections and H3 for individual conditions/subtopics.
- Keep the business name, practitioner name, qualifications, service area, working hours, and contact details consistent across visible pages, footer, structured data, and Google Business Profile.
- Place persistent **Book Consultation** and WhatsApp calls to action on every public page.
- State qualifications, service area, and a WhatsApp CTA above the fold on the home page.
- Do not publish invented testimonials, patient counts, review counts, statistics, or treatment claims.

### Page requirements

| Page | Required content / behaviour |
| --- | --- |
| Home | Value proposition; home/online care; “How it works” flow; service teaser; Why Eudora teaser; testimonial placeholder; booking and WhatsApp CTAs. |
| Why Eudora | Practice philosophy and meaning of the brand. Brand name confirmed as Eudora Movement House; final narrative copy remains subject to review. |
| About | Professional bio, qualifications, clinical experience, areas of focus, and approved professional photograph. |
| Services | Condition-led groups first, then an “Our Approach” techniques section. Include back/neck/postural pain; upper-limb conditions; lower-limb conditions; sports/injury rehabilitation; recovery after surgery/injury; movement, strength, and independence. |
| Tele-Physiotherapy | Explain video-consultation process, services, exercise guidance, and progress monitoring. Prominently disclose that a full physical examination and some hands-on tests cannot be performed remotely. |
| Areas We Serve | List KR Puram, Battarahalli, Kithaganur, Ramamurthy Nagar, New Thippasandra, Indiranagar, Tin Factory, Baiyappanahalli, and Koramangala; include a map. Online consultations are available more broadly. |
| Testimonials | Until genuine testimonials are approved, show an honest “coming soon” state; never use fabricated reviews. |
| FAQ | Answer common booking, home-visit, tele-consultation, conditions-treated, and working-hours questions. Referral-policy answer is pending. |
| Contact | Booking form, consent checkbox, email, phone, hours, and WhatsApp CTA. |

### Contact and operating details

- Email: `connect@eudoraphysio.com`
- Phone: `7418158876`
- Hours: Monday-Saturday, 7:00 AM-7:30 PM; closed Sundays.

## 5. Quality Attributes and Technical Requirements

### Responsive, accessible UX

- Support phones, tablets, and desktop browsers; prioritize mobile use and thumb-reachable CTAs.
- Use semantic, properly associated form labels and clear validation/error states.
- Provide meaningful alt text for service and condition images.
- Meet appropriate color-contrast requirements after brand colors are finalized.
- Respect `prefers-reduced-motion` for animation.

### Security and patient data

- Use HTTPS.
- Handle forms securely and restrict access to submissions and uploaded/test data.
- Treat any patient information used for testing or submitted through the site as confidential.
- Collect only data required for the stated booking and practitioner workflows.
- The healthcare provider remains responsible for data retention, storage, security, use, and legal-compliance decisions. Legal content requires client/legal review; implementation is not legal certification.

### Discoverability and analytics

- Implement basic visitor/source tracking.
- Connect the site with the Google Business Profile.
- Optimize visible content and metadata for local physiotherapy searches, especially Bangalore, home physiotherapy, and locality-based searches.
- Avoid thin duplicate location pages; use locality-focused blocks on the Areas We Serve page.
- Implement structured data only after the matching visible content is final: `ProfessionalService` (or `LocalBusiness`), `Person`, `Service`, `FAQPage`, `WebSite`, and `BreadcrumbList`.

## 6. Explicit Exclusions for This Release

- Online payment collection.
- Patient login, portal, or self-service access to records/history.
- Built-in video calling; consultations can use an external service such as Google Meet.
- Multiple-language support.
- Automated appointment management beyond request acknowledgement.
- Features, pages, or functionality not listed in this document unless explicitly approved as a change request.

## 7. Delivery and Acceptance Baseline

The release is ready for review when:

- All scoped public pages, booking workflow, notifications, practitioner tools, feedback form, mobile layouts, HTTPS, analytics, and Google Business Profile connection are working.
- Form consent, validation, submission handling, and notification paths are tested.
- No fabricated testimonials or unapproved medical content are present.
- Tele-physiotherapy limitations are visibly disclosed.
- Content, contact details, credentials, and service areas are consistent across the site and structured data.
- The site meets the accessibility and responsive requirements in Section 5.

Two revision rounds are included after the first working version. Ongoing maintenance is outside this development baseline, except for the included 30-day defect-fix window for defects in the delivered scope.

## 8. Dependencies and Client Inputs

- Approved professional bio, qualifications, clinical/service descriptions, treatment claims, and final service list.
- Licensed/consented photographs and patient testimonials, if used.
- Professional photograph for the About page.
- Final wording for the brand-story page and legal pages.
- Notification destination and configuration preferences (WhatsApp and/or email).
- Feedback-form questions.
- Domain, hosting, business email, and any paid third-party-service accounts/costs.

## 9. Open Decisions and Source Conflicts

| ID | Decision needed | Source context |
| --- | --- | --- |
| OD-01 | RESOLVED: Eudora Movement House, confirmed by the user on 2026-09-06. | User confirmation; supersedes earlier wording |
| OD-02 | Confirm the first-working-version timeline: one week or two weeks after prerequisites are received. | Development agreement vs. scope confirmation |
| OD-03 | Confirm whether referrals are required for any patient/condition. | FAQ placeholder |
| OD-04 | Confirm whether the general medical-history assessment form is included in V1 or removed. | Content plan |
| OD-05 | Confirm approved professional photo and whether genuine testimonials will be available before launch. | Content plan |
| OD-06 | Finalize patient-feedback questions and the practitioner exercise/chart workflow details. | Scope confirmation |

## 10. Governance Notes

- Content accuracy, medical claims, photo/testimonial rights, and healthcare/legal compliance require client approval.
- New pages, features, or functionality outside this baseline are change requests and require written approval before implementation.
- The website is an information and lead-generation tool; it does not guarantee patient volume, revenue, or search rankings.

## Implemented architecture update

The user requested Next.js for both frontend and backend. The application now uses the Next.js App Router, React server-rendered pages and client interactions, and Node.js route handlers for booking, feedback and practitioner authentication. The original visual design and business scope are retained. See README.md for launch configuration and single-process hosting limitations.
