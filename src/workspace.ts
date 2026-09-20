import { appointmentStatuses, appointmentStatusLabels } from './appointment-status';

const appointmentStatusOptions = appointmentStatuses
  .map(
    (status) =>
      `<option value="${status}">${appointmentStatusLabels[status]}</option>`,
  )
  .join('');

export const workspaceHtml = `
  <div class="workspace-heading">
    <div>
      <h2>Practitioner tools</h2>
      <p class="small">Manage appointments, patients, invoices, PAR-Q forms, exercise charts and consultation summaries. Details stay protected behind practitioner access.</p>
    </div>
    <button class="signout">Sign out</button>
  </div>

  <div class="workspace-tabs" role="tablist" aria-label="Workspace sections">
    <button role="tab" aria-selected="true" data-mode="appointments">Appointments</button>
    <button role="tab" aria-selected="false" data-mode="patients">Patients</button>
    <button role="tab" aria-selected="false" data-mode="invoices">Invoices</button>
    <button role="tab" aria-selected="false" data-mode="assessments">PAR-Q forms</button>
    <button role="tab" aria-selected="false" data-mode="exercise">Exercise chart</button>
    <button role="tab" aria-selected="false" data-mode="summary">Consultation summary</button>
  </div>

  <section class="admin-panel" data-panel="appointments">
    <div class="admin-toolbar">
      <input name="appointment-search" placeholder="Search appointments">
      <select name="appointment-type"><option value="">All types</option><option value="home">Home visit</option><option value="online">Online</option></select>
      <select name="appointment-status"><option value="">All statuses</option>${appointmentStatusOptions}</select>
      <select name="appointment-active"><option value="">Active</option><option value="inactive">Inactive</option><option value="all">All</option></select>
      <button type="button" class="button-light export-appointments">Export filtered</button>
    </div>
    <div class="admin-table" data-list="appointments"></div>
    <form id="appointment-form" class="assessment-form compact-form" hidden>
      <input type="hidden" name="id">
      <h3>Appointment details</h3>
      <div class="form-grid">
        <label>Consultation type <span class="required">*</span><select name="type" required><option value="home">Home visit</option><option value="online">Online</option></select></label>
        <label>Preferred date <span class="required">*</span><input name="date" type="date" required></label>
        <label>Preferred time <span class="required">*</span><input name="time" required maxlength="30"></label>
      </div>
      <div class="form-actions">
        <button class="button" type="submit">Save appointment <span class="arrow" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.2 11.8 11.8 4.2M6.5 4.2H11.8V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        <button class="button-light cancel-appointment" type="button">Cancel</button>
      </div>
      <div class="form-status" role="status" tabindex="-1"></div>
    </form>
  </section>

  <section class="admin-panel" data-panel="patients" hidden>
    <div class="admin-toolbar">
      <input name="patient-search" placeholder="Search patients">
      <select name="patient-active"><option value="">Active</option><option value="inactive">Inactive</option><option value="all">All</option></select>
      <button type="button" class="button-light new-patient">New patient</button>
      <button type="button" class="button-light export-patients">Export filtered</button>
    </div>
    <div class="admin-table" data-list="patients"></div>
    <form id="patient-form" class="assessment-form compact-form" hidden>
      <input type="hidden" name="id">
      <h3>Patient details</h3>
      <div class="form-grid">
        <label>Full name <span class="required">*</span><input name="full_name" required maxlength="120"></label>
        <label>Age<input name="age" type="number" min="1" max="120"></label>
        <label>Gender<select name="gender"><option value=""></option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
        <label>Date of birth<input name="date_of_birth" type="date"></label>
        <label>Mobile number <span class="required">*</span><input name="phone" required maxlength="20"></label>
        <label>Email address<input name="email" type="email" maxlength="160"></label>
        <label class="full">Full residential address<textarea name="address" rows="2"></textarea></label>
        <label>Emergency contact full name<input name="emergency_contact_name" maxlength="120"></label>
        <label>Emergency contact phone number<input name="emergency_contact_phone" maxlength="20"></label>
      </div>
      <div class="form-actions">
        <button class="button" type="submit">Save patient <span class="arrow" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.2 11.8 11.8 4.2M6.5 4.2H11.8V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        <button class="button-light cancel-patient" type="button">Cancel</button>
      </div>
      <div class="form-status" role="status" tabindex="-1"></div>
    </form>
  </section>

  <section class="admin-panel" data-panel="invoices" hidden>
    <div class="admin-toolbar">
      <input name="invoice-search" placeholder="Search invoices">
      <select name="invoice-status"><option value="">All payment statuses</option><option value="PAYMENT_DUE">Payment due</option><option value="PARTIALLY_PAID">Partially paid</option><option value="PAID">Paid</option></select>
      <select name="invoice-active"><option value="">Active</option><option value="inactive">Inactive</option><option value="all">All</option></select>
      <button type="button" class="button-light new-invoice">New invoice</button>
      <button type="button" class="button-light export-invoices">Export filtered</button>
    </div>
    <div class="admin-table" data-list="invoices"></div>
    <div class="invoice-editor" hidden>
      <form id="invoice-form" class="assessment-form compact-form">
        <input type="hidden" name="id">
        <h3>Invoice details</h3>
        <div class="form-grid">
          <label>Invoice number<input name="invoice_number" readonly placeholder="Assigned when you save"></label>
          <label class="patient-map-field">Map to existing patient<select name="invoice_patient_id"><option value="">Select patient</option></select></label>
          <label>Invoice date <span class="required">*</span><input name="invoice_date" type="date" required></label>
          <label>Due date<input name="due_date" type="date"></label>
          <div class="invoice-period full">
            <label>From<input name="from_date" type="date" autocomplete="off"></label>
            <label>To<input name="to_date" type="date" autocomplete="off"></label>
          </div>
          <label>Client / patient name <span class="required">*</span><input name="bill_to_name" required maxlength="120"></label>
          <label>Phone number <span class="required">*</span><input name="bill_to_phone" required maxlength="20"></label>
          <label class="full">Location<input name="bill_to_location" maxlength="200"></label>
        </div>
        <h3>Services</h3>
        <p class="small">Add each service for this invoice. Amount is calculated from quantity × rate.</p>
        <div class="invoice-items" data-invoice-items></div>
        <button type="button" class="button button-light add-invoice-item">Add service line <span aria-hidden="true">+</span></button>
        <div class="form-grid">
          <label>Amount paid (₹)<input name="amount_paid" type="number" min="0" max="1000000" step="0.01" value="0"></label>
          <label class="full">Notes<textarea name="notes" rows="2" maxlength="2000" placeholder="Optional payment or service notes."></textarea></label>
        </div>
        <div class="form-actions">
          <button class="button" type="submit">Save invoice <span class="arrow" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.2 11.8 11.8 4.2M6.5 4.2H11.8V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
          <button class="button-light download-invoice-form" type="button">Download PDF <span class="arrow" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.2 11.8 11.8 4.2M6.5 4.2H11.8V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
          <button class="button-light cancel-invoice" type="button">Cancel</button>
        </div>
        <div class="form-status" role="status" tabindex="-1"></div>
      </form>
      <article class="invoice-preview" aria-label="Invoice preview"></article>
    </div>
  </section>

  <section class="admin-panel" data-panel="assessments" hidden>
    <div class="admin-toolbar">
      <input name="assessment-search" placeholder="Search PAR-Q forms">
      <select name="assessment-type"><option value="">All types</option><option>Home Visit</option><option>Online Physiotherapy</option><option>Teleconsultation</option><option>Follow-up</option></select>
      <select name="assessment-active"><option value="">Active</option><option value="inactive">Inactive</option><option value="all">All</option></select>
      <button type="button" class="button-light new-assessment">New PAR-Q</button>
      <button type="button" class="button-light export-assessments">Export filtered</button>
    </div>
    <div class="admin-table" data-list="assessments"></div>
    <form id="assessment-form" class="assessment-form" hidden>
      <input type="hidden" name="id">
      <input type="hidden" name="appointment_id">
      <h3>Patient details</h3>
      <label class="full patient-map-field">Map to existing patient <span class="required">*</span><select name="patient_id" required><option value="">Select patient</option></select></label>
      <div class="form-grid">
        <label>Full name <span class="required">*</span><input name="full_name" required maxlength="120"></label>
        <label>Age <span class="required">*</span><input name="age" type="number" min="1" max="120" required></label>
        <label>Gender <span class="required">*</span><select name="gender" required><option value="">Select gender</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
        <label>Date of birth <span class="required">*</span><input name="date_of_birth" type="date" required></label>
        <label>Mobile number <span class="required">*</span><input name="phone" required maxlength="20"></label>
        <label>Email address<input name="email" type="email" maxlength="160"></label>
        <label class="full">Full residential address <span class="required">*</span><textarea name="address" rows="2" required></textarea></label>
        <label>Emergency contact full name <span class="required">*</span><input name="emergency_contact_name" required maxlength="120"></label>
        <label>Emergency contact phone number <span class="required">*</span><input name="emergency_contact_phone" required maxlength="20"></label>
        <label>Consultation type <span class="required">*</span><select name="consultation_type" required><option>Home Visit</option><option>Online Physiotherapy</option><option>Teleconsultation</option><option>Follow-up</option></select></label>
        <label>Preferred day and time <span class="required">*</span><input name="preferred_day_time" type="datetime-local" required></label>
        <label>How did you hear about Eudora?<select name="referral_source"><option></option><option>Doctor referral</option><option>Friend/family</option><option>Self</option><option>WhatsApp</option><option>Other</option></select></label>
      </div>

      <h3>Current concern</h3>
      <div class="form-grid">
        <label class="full">Main problem / reason for consultation <span class="required">*</span><textarea name="main_problem" rows="3" required></textarea></label>
        <label>Duration of complaint <span class="required">*</span><input name="duration_of_complaint" required></label>
        <label>Region/location of symptoms <span class="required">*</span><input name="symptom_region" required></label>
        <label>Side <span class="required">*</span><select name="symptom_side" required><option>Right</option><option>Left</option><option>Both/Bilateral</option><option>Central</option><option>N/A</option></select></label>
        <label>Range <span class="required">*</span><select name="movement_range" required><option>Full/No restriction</option><option>Restricted</option><option>Painful</option><option>Not assessed</option></select></label>
        <label>Pain presentation <span class="required">*</span><select name="pain_presentation" required><option>Continuous or Constant Pain</option><option>Intermittent Pain (on/off)</option><option>Pain associated with movement</option></select></label>
        <label>Onset <span class="required">*</span><select name="complaint_onset" required><option>Gradual</option><option>Sudden</option><option>Insidious</option></select></label>
        <label>Pain severity 0-10 <span class="required">*</span><input name="pain_severity" type="number" min="0" max="10" required></label>
        <label class="full">Activities that aggravate symptoms <span class="required">*</span><textarea name="aggravating_activities" rows="2" required></textarea></label>
        <label class="full">Factors that relieve symptoms <span class="required">*</span><textarea name="relieving_factors" rows="2" required></textarea></label>
      </div>

      <h3>Medical history</h3>
      <fieldset>
        <legend>Medical conditions <span class="required">*</span></legend>
        <div class="checkbox-grid" data-name="medical_conditions">
          <label><input type="checkbox" value="Diabetes">Diabetes</label><label><input type="checkbox" value="Thyroid/Lipid disorder">Thyroid/Lipid disorder</label><label><input type="checkbox" value="Hypertension">Hypertension</label><label><input type="checkbox" value="Hypotension">Hypotension</label><label><input type="checkbox" value="Cardiac condition">Cardiac condition</label><label><input type="checkbox" value="DVT">DVT</label><label><input type="checkbox" value="Varicose veins">Varicose veins</label><label><input type="checkbox" value="Neurological condition">Neurological condition</label><label><input type="checkbox" value="Osteoporosis">Osteoporosis</label><label><input type="checkbox" value="Arthritis">Arthritis</label><label><input type="checkbox" value="Kidney disease">Kidney disease</label><label><input type="checkbox" value="Liver disease">Liver disease</label><label><input type="checkbox" value="Respiratory condition">Respiratory condition</label><label><input type="checkbox" value="Any other medical condition">Any other medical condition</label><label><input type="checkbox" value="None of the above">None of the above</label>
        </div>
      </fieldset>
      <label>Please specify other medical condition<textarea name="other_medical_condition" rows="2"></textarea></label>
      <label>Surgery/procedure history <span class="required">*</span><select name="surgery_status" required><option>No</option><option>Yes</option><option>Currently scheduled for surgery/Advised for surgery</option></select></label>
      <label>What surgery/procedure did you undergo, any complication post surgery<textarea name="surgery_details" rows="2"></textarea></label>
      <label>Current medications <span class="required">*</span><textarea name="current_medications" rows="2" required></textarea></label>
      <fieldset>
        <legend>Previous investigations <span class="required">*</span></legend>
        <div class="checkbox-grid" data-name="investigations">
          <label><input type="checkbox" value="X-ray">X-ray</label><label><input type="checkbox" value="MRI">MRI</label><label><input type="checkbox" value="CT">CT</label><label><input type="checkbox" value="Blood investigations">Blood investigations</label><label><input type="checkbox" value="Other">Other</label><label><input type="checkbox" value="None of the above">None of the above</label>
        </div>
      </fieldset>

      <h3>PAR-Q</h3>
      <div class="parq-grid"></div>
      <label>If YES to any PAR-Q question, add details<textarea name="parq_details" rows="3"></textarea></label>
      <h3>Consent</h3>
      <p class="small">I understand that physiotherapy involves assessment, clinical advice, therapeutic interventions and/or exercise prescription based on the individual condition and information provided. For online/tele-physiotherapy, I understand that a physical examination, hands-on assessment and certain clinical tests may not be possible remotely. I understand that outcomes are not guaranteed and progress may vary.</p>
      <label class="consent"><input type="checkbox" name="consent_confirmed" required> Patient has read, understood and voluntarily consents to physiotherapy assessment and treatment.</label>
      <label>Electronic signature - Patient/client full name <span class="required">*</span><input name="electronic_signature" required maxlength="120"></label>
      <div class="form-actions">
        <button class="button" type="submit">Save PAR-Q <span class="arrow" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.2 11.8 11.8 4.2M6.5 4.2H11.8V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        <button class="button-light cancel-assessment" type="button">Cancel</button>
      </div>
      <div class="form-status" role="status" tabindex="-1"></div>
    </form>
  </section>

  <section class="tool-grid" data-panel="documents" hidden>
    <form id="tool-form" class="tool-form">
      <label>Name<input name="patient" required maxlength="100" autocomplete="off"></label>
      <label>Date of consultation<input name="date" type="date"></label>
      <fieldset id="exercise-fields">
        <legend>Exercise chart</legend>
        <p class="small">Add each exercise prescribed for this visit. Only this list is printed.</p>
        <div class="exercise-list" data-exercise-list></div>
        <button type="button" class="button button-light add-exercise">Add exercise <span aria-hidden="true">+</span></button>
        <label>General precautions<textarea name="instructions" rows="3" maxlength="2000" placeholder="Optional notes that apply to the whole programme."></textarea></label>
      </fieldset>
      <fieldset id="summary-fields" hidden>
        <legend>Consultation summary</legend>
        <label>Summary<textarea name="summary" rows="8" maxlength="4000" placeholder="Key findings, clinical impression and discussion from this consultation."></textarea></label>
        <label>Plan of action<textarea name="plan" rows="6" maxlength="4000" placeholder="Treatment, home programme, reviews and next steps."></textarea></label>
        <label>Sign<input name="sign" maxlength="120" placeholder="Varshini Balamurugan PT"></label>
        <p class="small">Dos and Don'ts, urgent-care guidance and evidence notes are included automatically on the document.</p>
      </fieldset>
      <button class="button print-button" type="button">Download PDF <span class="arrow" aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.2 11.8 11.8 4.2M6.5 4.2H11.8V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
    </form>
    <article class="chart-preview" aria-label="Document preview"></article>
  </section>
`;
