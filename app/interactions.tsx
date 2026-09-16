'use client';

import { useEffect } from 'react';
import {
  appointmentStatuses,
  appointmentStatusLabels,
  isFinalAppointmentStatus,
} from '../src/appointment-status';
import {
  formatMoney,
  invoicePaymentStatusLabels,
  invoicePaymentStatusPrint,
  invoiceTotals,
  lineAmount,
  type InvoiceLineItem,
  type InvoicePaymentStatus,
} from '../src/invoice';

interface FormState {
  fingerprint: string;
  key: string;
}

const summaryDos = [
  'Follow the exercise dose, technique and activity plan agreed with your physiotherapist.',
  'Stay gently active within your advised limits. Build activity gradually rather than waiting for all discomfort to disappear.',
  'Use pacing: break demanding tasks into shorter periods, change position regularly and allow planned recovery time.',
  'Tell your physiotherapist about new symptoms, falls, illness, pregnancy, medication changes, surgery or changes in your medical condition.',
  'Use supportive footwear and a clear, stable exercise area. Keep a chair or wall nearby if balance support was advised.',
  'Expect that mild, short-lived muscle soreness can occur after unfamiliar exercise. Record the response and discuss symptoms that are strong, worsening or prolonged.',
  'Use heat or cold only if advised and comfortable: wrap the pack, check the skin often and keep sessions brief.',
  'Take prescribed medicines exactly as directed by your doctor and keep scheduled medical and physiotherapy reviews.',
];

const summaryDonts = [
  'Do not increase resistance, repetitions, stretching force or treatment frequency on your own.',
  'Do not push through sharp, severe or rapidly increasing pain, new weakness, new numbness or loss of coordination.',
  'Do not perform self-manipulation, forceful neck or back movements, or copy exercises that were not assessed for you.',
  'Do not stay in one position for long periods when regular movement has been advised. There is no single “perfect posture”; comfort and position changes matter.',
  'Do not place heat or ice directly on the skin, use it over areas with poor sensation or circulation, or fall asleep with a pack in place.',
  'Do not exercise when acutely unwell, feverish or unusually breathless. Seek advice before restarting.',
  'Do not stop, start or change prescribed medication or post-surgical precautions without the relevant medical professional.',
  'Do not miss repeated sessions without discussing barriers; the plan can often be adjusted safely.',
];

const summaryUrgent =
  'chest pressure or pain; severe or unusual shortness of breath; fainting; sudden severe headache; new facial droop, speech difficulty or one-sided weakness; sudden loss of balance or coordination; new loss of bladder or bowel control; numbness around the groin or saddle area; or rapidly worsening weakness.';

const summaryEvidence =
  'WHO Guidelines on Physical Activity and Sedentary Behaviour (2020); NICE NG59 Low Back Pain and Sciatica (updated 2020); George et al., JOSPT Clinical Practice Guideline for Acute and Chronic Low Back Pain (2021); ACSM Guidelines for Exercise Testing and Prescription, 12th ed. (2025); American Heart Association warning signs for heart attack and stroke.';

export default function Interactions(): null {
  useEffect(() => {
    const controller = new AbortController();

    const listen = (
      target: EventTarget | null | undefined,
      type: string,
      handler: EventListener,
      options: Partial<AddEventListenerOptions> = {},
    ): void => {
      target?.addEventListener(type, handler, {
        ...options,
        signal: controller.signal,
      });
    };

    // Menu toggle
    const menu = document.querySelector(
      '.menu-toggle',
    ) as HTMLButtonElement | null;
    const nav = document.querySelector('#main-nav') as HTMLElement | null;

    listen(menu, 'click', () => {
      const open = menu?.getAttribute('aria-expanded') !== 'true';
      menu?.setAttribute('aria-expanded', String(open));
      nav?.classList.toggle('open', open);
    });

    listen(document, 'keydown', (e) => {
      const event = e as KeyboardEvent;
      if (
        event.key === 'Escape' &&
        menu?.getAttribute('aria-expanded') === 'true'
      ) {
        menu.click();
        menu.focus();
      }
    });

    nav?.querySelectorAll('a').forEach((a) => {
      const link = a as HTMLAnchorElement;
      if (link.pathname === location.pathname) {
        link.setAttribute('aria-current', 'page');
      }
    });

    // Header scroll effect
    const header = document.querySelector('.site-header') as HTMLElement | null;
    listen(
      window,
      'scroll',
      () => {
        header?.classList.toggle('scrolled', scrollY > 10);
      },
      { passive: true },
    );

    // Subtle reveal motion for content sections.
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let revealObserver: IntersectionObserver | null = null;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const revealItems = document.querySelectorAll(
        '.section, .page-hero, .trust-strip, .contact-banner, .service, .steps li, .pillar-card',
      );

      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '0px 0px -12% 0px',
          threshold: 0.08,
        },
      );

      revealItems.forEach((item) => {
        item.classList.add('reveal-ready');
        revealObserver?.observe(item);
      });
    }

    // Form handling helpers
    const booking = document.querySelector(
      '#booking-form',
    ) as HTMLFormElement | null;
    const status = (
      form: HTMLFormElement,
      message: string,
      error = false,
    ): void => {
      const el = form.querySelector('.form-status') as HTMLElement | null;
      if (el) {
        el.textContent = message;
        el.classList.toggle('error', error);
        el.focus();
        if (error) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    const withButtonLoading = async <T,>(
      button: HTMLButtonElement | null | undefined,
      label: string,
      task: () => Promise<T>,
    ): Promise<T> => {
      if (!button) {
        return task();
      }
      if (button.disabled) {
        throw new Error('Please wait for the current action to finish.');
      }
      const original = button.innerHTML;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      button.dataset.loading = 'true';
      button.innerHTML = `${label}<span aria-hidden="true">...</span>`;
      try {
        return await task();
      } finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        delete button.dataset.loading;
        button.innerHTML = original;
      }
    };

    const showLinkLoading = (link: HTMLAnchorElement, label = 'Opening') => {
      if (link.dataset.loading === 'true') return;
      const original = link.innerHTML;
      link.setAttribute('aria-busy', 'true');
      link.dataset.loading = 'true';
      link.innerHTML = `${label}<span aria-hidden="true">...</span>`;
      if (link.target === '_blank') {
        window.setTimeout(() => {
          link.removeAttribute('aria-busy');
          delete link.dataset.loading;
          link.innerHTML = original;
        }, 1200);
      }
    };

    listen(document, 'click', (event) => {
      const link = (event.target as HTMLElement).closest(
        'a.button, a.nav-book, a.whatsapp',
      ) as HTMLAnchorElement | null;
      if (!link || !link.href || link.dataset.loading === 'true') return;
      showLinkLoading(link);
    });

    const requestKeys = new WeakMap<HTMLFormElement, FormState>();

    async function submitForm(
      form: HTMLFormElement,
      path: string,
      data: Record<string, unknown>,
    ): Promise<Record<string, unknown>> {
      let state = requestKeys.get(form);
      const fingerprint = JSON.stringify(data);

      if (!state || state.fingerprint !== fingerprint) {
        state = {
          fingerprint,
          key: crypto.randomUUID(),
        };
        requestKeys.set(form, state);
      }

      const response = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': state.key,
        },
        body: JSON.stringify(data),
      });

      let result: Record<string, unknown>;
      try {
        result = await response.json();
      } catch {
        throw new Error(
          "We couldn't complete this request. Please try again or contact us directly.",
        );
      }

      if (!response.ok) {
        const err = new Error((result.error as string) || 'Please try again.');
        (err as unknown as { code?: string }).code = result.code as string;
        throw err;
      }

      return result;
    }

    // Booking form
    if (booking) {
      const date = booking.elements.namedItem('date') as HTMLInputElement;

      date.min = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
      });

      if (new URLSearchParams(location.search).get('type') === 'online') {
        const typeSelect = booking.elements.namedItem(
          'type',
        ) as HTMLInputElement;
        typeSelect.value = 'online';
      }

      listen(date, 'input', () => {
        const dateValue = date.value;
        const dayOfWeek = new Date(dateValue + 'T12:00:00+05:30').getUTCDay();
        date.setCustomValidity(
          dateValue && dayOfWeek === 0
            ? 'Please choose Monday to Saturday.'
            : '',
        );
      });

      listen(booking, 'submit', async (e) => {
        e.preventDefault();

        if (!booking.reportValidity()) {
          return;
        }

        const formData = new FormData(booking);
        const data = Object.fromEntries(formData) as Record<string, unknown>;
        const consentCheckbox = booking.elements.namedItem(
          'consent',
        ) as HTMLInputElement;
        data.consent = consentCheckbox.checked;

        const phone = data.phone as string;
        if (
          !/^\+?[\d\s()-]{8,20}$/.test(phone) ||
          phone.replace(/\D/g, '').length < 8
        ) {
          status(
            booking,
            'Please enter a valid contact number, including the country code if outside India.',
            true,
          );
          (booking.elements.namedItem('phone') as HTMLInputElement).focus();
          return;
        }

        const button = booking.querySelector(
          'button[type=submit]',
        ) as HTMLButtonElement;

        const fallback = booking.querySelector(
          '.request-fallback',
        ) as HTMLElement | null;
        if (fallback) {
          fallback.hidden = true;
        }

        await withButtonLoading(button, 'Sending', async () => {
          try {
            await submitForm(booking, '/api/bookings', data);
            status(
              booking,
              "Thank you. Your consultation request has been received. We'll contact you to discuss availability; your appointment is not yet confirmed.",
            );
            booking.reset();
            requestKeys.delete(booking);
          } catch (error) {
            const err = error as Error & { code?: string };
            status(booking, err.message, true);

            const fallbackDiv = booking.querySelector(
              '.request-fallback',
            ) as HTMLElement | null;
            if (fallbackDiv) {
              fallbackDiv.hidden = false;

              const message = `Hello Eudora Movement House, I would like to request a consultation.\nName: ${
                data.name
              }\nAge: ${data.age}\nPhone: ${data.phone}\nLocation: ${
                data.location
              }\nConsultation: ${
                data.type === 'online' ? 'Online' : 'Home visit'
              }\nPreferred date: ${
                data.date
              }\nPreferred time: ${data.time} IST\nI understand the appointment will be confirmed separately.`;

              const whatsappLink = booking.querySelector(
                '#whatsapp-request',
              ) as HTMLAnchorElement | null;
              if (whatsappLink) {
                whatsappLink.href =
                  'https://wa.me/917418158876?text=' +
                  encodeURIComponent(message);
              }
            }
          }
        });
      });
    }

    // Feedback form
    const feedback = document.querySelector(
      '#feedback-form',
    ) as HTMLFormElement | null;
    listen(feedback, 'submit', async (e) => {
      e.preventDefault();

      if (!feedback || !feedback.reportValidity()) {
        return;
      }

      const button = feedback.querySelector('button') as HTMLButtonElement;

      await withButtonLoading(button, 'Sending', async () => {
        try {
          const formData = new FormData(feedback);
          const data = Object.fromEntries(formData) as Record<string, unknown>;
          const consentCheckbox = feedback.elements.namedItem(
            'consent',
          ) as HTMLInputElement;
          data.consent = consentCheckbox.checked;

          await submitForm(feedback, '/api/feedback', data);
          status(
            feedback,
            'Thank you for sharing your feedback. It has been received privately.',
          );
          feedback.reset();
          requestKeys.delete(feedback);
        } catch (error) {
          const err = error as Error;
          status(feedback, err.message, true);
        }
      });
    });

    // Practitioner workspace
    const login = document.querySelector(
      '#login-form',
    ) as HTMLFormElement | null;
    let csrf = '';

    async function openWorkspace(): Promise<boolean> {
      try {
        const r = await fetch('/api/practitioner/workspace', {
          signal: controller.signal,
        });

        if (!r.ok) {
          return false;
        }

        const responseData = (await r.json()) as {
          csrf: string;
          html: string;
        };

        if (controller.signal.aborted) {
          return false;
        }

        csrf = responseData.csrf;

        const loginSection = document.querySelector(
          '#practitioner-login',
        ) as HTMLElement | null;
        if (loginSection) {
          loginSection.hidden = true;
        }

        const container = document.querySelector(
          '#practitioner-workspace',
        ) as HTMLElement | null;
        if (container) {
          container.hidden = false;
          container.innerHTML = responseData.html;
          setupWorkspace(container);
        }

        return true;
      } catch {
        return false;
      }
    }

    if (login) {
      openWorkspace().catch(() => {});

      listen(login, 'submit', async (e) => {
        e.preventDefault();

        const button = login.querySelector('button') as HTMLButtonElement;

        await withButtonLoading(button, 'Opening', async () => {
          try {
            const keyInput = login.elements.namedItem('key') as HTMLInputElement;
            const r = await fetch('/api/practitioner/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ key: keyInput.value }),
            });

            const data = (await r.json()) as {
              error?: string;
            };

            if (!r.ok) {
              throw Error(data.error);
            }

            login.reset();
            await openWorkspace();
          } catch (error) {
            const err = error as Error;
            status(login, err.message, true);
          }
        });
      });
    }

    function setupWorkspace(container: HTMLElement): void {
      const esc = (s: unknown): string => {
        return String(s).replace(/[&<>"']/g, (c) => {
          const escapeMap: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          };
          return escapeMap[c] || c;
        });
      };

      const chart = container.querySelector(
        '.chart-preview',
      ) as HTMLElement | null;
      const form = container.querySelector(
        '#tool-form',
      ) as HTMLFormElement | null;

      if (!chart || !form) {
        return;
      }

      let mode = 'exercise';
      const adminState = {
        appointments: [] as any[],
        patients: [] as any[],
        invoicePatients: [] as any[],
        invoices: [] as any[],
        assessments: [] as any[],
        currentAssessment: null as any,
      };
      const parqQuestions = [
        ['heart_condition', 'Has your doctor ever said that you have a heart condition and should only do physical activity recommended by a doctor?'],
        ['chest_pain_activity', 'Do you experience chest pain during physical activity?'],
        ['chest_pain_rest', 'Have you experienced chest pain during the last month when not exercising?'],
        ['dizziness', 'Do you lose balance because of dizziness or ever lose consciousness?'],
        ['bone_joint_problem', 'Do you have a bone or joint problem that could worsen with exercise?'],
        ['blood_pressure_meds', 'Is your doctor currently prescribing medication for blood pressure or a heart condition?'],
        ['other_reason', 'Do you know of any other reason why you should not participate in exercise?'],
      ];

      const api = async (
        path: string,
        options: RequestInit = {},
      ): Promise<any> => {
        const headers = new Headers(options.headers || {});
        if (options.method && options.method !== 'GET') {
          headers.set('Content-Type', 'application/json');
          headers.set('X-CSRF-Token', csrf);
        }
        const response = await fetch(path, { ...options, headers });
        const data = await response.json();
        if (!response.ok) {
          throw Error(data.error || 'Request failed.');
        }
        return data;
      };

      const download = (filename: string, content: string, type: string): void => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      };

      const csv = (rows: any[], keys: string[]): string => {
        const cell = (value: unknown) =>
          `"${String(value ?? '').replace(/"/g, '""')}"`;
        return [keys.join(','), ...rows.map((row) => keys.map((key) => cell(row[key])).join(','))].join('\n');
      };

      const valueText = (value: unknown): string => {
        if (Array.isArray(value)) return value.filter(Boolean).join(', ');
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (value && typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value ?? '').trim();
      };

      const hasValue = (value: unknown): boolean => {
        if (Array.isArray(value)) return value.filter(Boolean).length > 0;
        if (value && typeof value === 'object') return Object.keys(value).length > 0;
        return valueText(value).length > 0;
      };

      const patientDetailPairs = (patient: any): Array<[string, unknown]> => [
        ['Full name', patient.full_name],
        ['Age', patient.age],
        ['Gender', patient.gender],
        ['Date of birth', patient.date_of_birth],
        ['Mobile number', patient.phone],
        ['Email address', patient.email],
        ['Full residential address', patient.address],
        ['Emergency contact full name', patient.emergency_contact_name],
        ['Emergency contact phone number', patient.emergency_contact_phone],
        ['Status', patient.is_active === false ? 'Inactive' : 'Active'],
      ];

      const patientCsvRow = (patient: any): Record<string, unknown> => ({
        full_name: patient.full_name,
        age: patient.age,
        gender: patient.gender,
        date_of_birth: patient.date_of_birth,
        mobile_number: patient.phone,
        email_address: patient.email,
        full_residential_address: patient.address,
        emergency_contact_full_name: patient.emergency_contact_name,
        emergency_contact_phone_number: patient.emergency_contact_phone,
        status: patient.is_active === false ? 'Inactive' : 'Active',
      });

      const patientCsvKeys = [
        'full_name',
        'age',
        'gender',
        'date_of_birth',
        'mobile_number',
        'email_address',
        'full_residential_address',
        'emergency_contact_full_name',
        'emergency_contact_phone_number',
        'status',
      ];

      const invoiceCsvRow = (invoice: any): Record<string, unknown> => ({
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        bill_to_name: invoice.bill_to_name,
        bill_to_phone: invoice.bill_to_phone,
        bill_to_location: invoice.bill_to_location,
        total_amount: invoice.total_amount,
        amount_paid: invoice.amount_paid,
        payment_status: invoice.payment_status,
        notes: invoice.notes,
        status: invoice.is_active === false ? 'Inactive' : 'Active',
      });

      const invoiceCsvKeys = [
        'invoice_number',
        'invoice_date',
        'due_date',
        'bill_to_name',
        'bill_to_phone',
        'bill_to_location',
        'total_amount',
        'amount_paid',
        'payment_status',
        'notes',
        'status',
      ];

      const appointmentCsvRow = (appointment: any): Record<string, unknown> => ({
        patient_name: appointment.patient_name,
        patient_age: appointment.patient_age,
        patient_phone: appointment.patient_phone,
        patient_location: appointment.patient_location,
        consultation_type: appointment.consultation_type,
        preferred_date: appointment.preferred_date,
        preferred_time: appointment.preferred_time,
        appointment_status: appointment.status,
        request_received_at: appointment.created_at,
        notification_sent: valueText(appointment.whatsapp_sent),
        notification_sent_at: appointment.whatsapp_sent_at,
        notification_message_id: appointment.whatsapp_message_id,
        notification_error: appointment.whatsapp_error,
        privacy_consent: valueText(appointment.privacy_consent),
        status: appointment.is_active === false ? 'Inactive' : 'Active',
      });

      const appointmentCsvKeys = [
        'patient_name',
        'patient_age',
        'patient_phone',
        'patient_location',
        'consultation_type',
        'preferred_date',
        'preferred_time',
        'appointment_status',
        'request_received_at',
        'notification_sent',
        'notification_sent_at',
        'notification_message_id',
        'notification_error',
        'privacy_consent',
        'status',
      ];

      const assessmentPatient = (assessment: any): any =>
        assessment.patients || assessment.form_data?.patient || {};

      const assessmentValue = (assessment: any, key: string): unknown =>
        assessment.form_data?.[key] ?? assessment[key];

      const assessmentDetailPairs = (
        assessment: any,
      ): Array<[string, unknown]> => {
        const patient = assessmentPatient(assessment);
        const parq = assessmentValue(assessment, 'parq_answers') || {};
        return [
          ...patientDetailPairs(patient).filter(([label]) => label !== 'Status'),
          ['Consultation type', assessmentValue(assessment, 'consultation_type')],
          ['Preferred day and time', assessmentValue(assessment, 'preferred_day_time')],
          ['How did you hear about Eudora?', assessmentValue(assessment, 'referral_source')],
          ['Main problem / reason for consultation', assessmentValue(assessment, 'main_problem')],
          ['Duration of complaint', assessmentValue(assessment, 'duration_of_complaint')],
          ['Region/location of symptoms', assessmentValue(assessment, 'symptom_region')],
          ['Side', assessmentValue(assessment, 'symptom_side')],
          ['Range', assessmentValue(assessment, 'movement_range')],
          ['Pain presentation', assessmentValue(assessment, 'pain_presentation')],
          ['Onset', assessmentValue(assessment, 'complaint_onset')],
          ['Pain severity 0-10', assessmentValue(assessment, 'pain_severity')],
          ['Activities that aggravate symptoms', assessmentValue(assessment, 'aggravating_activities')],
          ['Factors that relieve symptoms', assessmentValue(assessment, 'relieving_factors')],
          ['Medical conditions', assessmentValue(assessment, 'medical_conditions')],
          ['Other medical condition', assessmentValue(assessment, 'other_medical_condition')],
          ['Surgery/procedure history', assessmentValue(assessment, 'surgery_status')],
          ['Surgery/procedure details', assessmentValue(assessment, 'surgery_details')],
          ['Current medications', assessmentValue(assessment, 'current_medications')],
          ['Previous investigations', assessmentValue(assessment, 'investigations')],
          ...parqQuestions.map(
            ([key, question]) =>
              [`PAR-Q - ${question}`, (parq as Record<string, unknown>)[key]] as [
                string,
                unknown,
              ],
          ),
          ['PAR-Q additional details', assessmentValue(assessment, 'parq_details')],
          ['Consent confirmed', assessmentValue(assessment, 'consent_confirmed')],
          ['Electronic signature', assessmentValue(assessment, 'electronic_signature')],
          ['Status', assessment.is_active === false ? 'Inactive' : 'Active'],
        ];
      };

      const assessmentCsvRow = (assessment: any): Record<string, unknown> => {
        const patient = assessmentPatient(assessment);
        const parq = assessmentValue(assessment, 'parq_answers') || {};
        return {
          full_name: patient.full_name,
          age: patient.age,
          gender: patient.gender,
          date_of_birth: patient.date_of_birth,
          mobile_number: patient.phone,
          email_address: patient.email,
          full_residential_address: patient.address,
          emergency_contact_full_name: patient.emergency_contact_name,
          emergency_contact_phone_number: patient.emergency_contact_phone,
          consultation_type: assessmentValue(assessment, 'consultation_type'),
          preferred_day_time: assessmentValue(assessment, 'preferred_day_time'),
          heard_about_eudora: assessmentValue(assessment, 'referral_source'),
          main_problem: assessmentValue(assessment, 'main_problem'),
          duration_of_complaint: assessmentValue(assessment, 'duration_of_complaint'),
          symptom_region: assessmentValue(assessment, 'symptom_region'),
          side: assessmentValue(assessment, 'symptom_side'),
          range: assessmentValue(assessment, 'movement_range'),
          pain_presentation: assessmentValue(assessment, 'pain_presentation'),
          onset: assessmentValue(assessment, 'complaint_onset'),
          pain_severity: assessmentValue(assessment, 'pain_severity'),
          aggravating_activities: assessmentValue(assessment, 'aggravating_activities'),
          relieving_factors: assessmentValue(assessment, 'relieving_factors'),
          medical_conditions: valueText(assessmentValue(assessment, 'medical_conditions')),
          other_medical_condition: assessmentValue(assessment, 'other_medical_condition'),
          surgery_status: assessmentValue(assessment, 'surgery_status'),
          surgery_details: assessmentValue(assessment, 'surgery_details'),
          current_medications: assessmentValue(assessment, 'current_medications'),
          investigations: valueText(assessmentValue(assessment, 'investigations')),
          ...Object.fromEntries(
            parqQuestions.map(([key]) => [
              `parq_${key}`,
              (parq as Record<string, unknown>)[key],
            ]),
          ),
          parq_details: assessmentValue(assessment, 'parq_details'),
          consent_confirmed: valueText(assessmentValue(assessment, 'consent_confirmed')),
          electronic_signature: assessmentValue(assessment, 'electronic_signature'),
          status: assessment.is_active === false ? 'Inactive' : 'Active',
        };
      };

      const assessmentCsvKeys = [
        'full_name',
        'age',
        'gender',
        'date_of_birth',
        'mobile_number',
        'email_address',
        'full_residential_address',
        'emergency_contact_full_name',
        'emergency_contact_phone_number',
        'consultation_type',
        'preferred_day_time',
        'heard_about_eudora',
        'main_problem',
        'duration_of_complaint',
        'symptom_region',
        'side',
        'range',
        'pain_presentation',
        'onset',
        'pain_severity',
        'aggravating_activities',
        'relieving_factors',
        'medical_conditions',
        'other_medical_condition',
        'surgery_status',
        'surgery_details',
        'current_medications',
        'investigations',
        ...parqQuestions.map(([key]) => `parq_${key}`),
        'parq_details',
        'consent_confirmed',
        'electronic_signature',
        'status',
      ];

      const detailHtml = (title: string, pairs: Array<[string, unknown]>): string => {
        const rows = pairs.filter(([, value]) => hasValue(value));
        return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;padding:32px;line-height:1.6;color:#173e3b}h1{font-family:Georgia,serif}dt{font-weight:700;margin-top:12px}dd{margin:0 0 8px;white-space:pre-wrap}</style></head><body><h1>${esc(title)}</h1><dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(valueText(v))}</dd>`).join('')}</dl></body></html>`;
      };

      const renderPager = (
        target: HTMLElement,
        total: number,
        page: number,
        load: (next: number) => Promise<void>,
      ): void => {
        const pages = Math.max(1, Math.ceil(total / 10));
        const pager = document.createElement('div');
        pager.className = 'admin-pager';
        pager.innerHTML = `<button ${page <= 1 ? 'disabled' : ''}>Previous</button><span>Page ${page} of ${pages}</span><button ${page >= pages ? 'disabled' : ''}>Next</button>`;
        const buttons = pager.querySelectorAll('button');
        listen(buttons[0], 'click', async () => {
          await withButtonLoading(buttons[0] as HTMLButtonElement, 'Loading', () =>
            load(page - 1),
          );
        });
        listen(buttons[1], 'click', async () => {
          await withButtonLoading(buttons[1] as HTMLButtonElement, 'Loading', () =>
            load(page + 1),
          );
        });
        target.appendChild(pager);
      };

      const loadAppointments = async (page = 1): Promise<void> => {
        const q = new URLSearchParams({
          page: String(page),
          pageSize: '10',
          search: (container.querySelector('[name=appointment-search]') as HTMLInputElement)?.value || '',
          type: (container.querySelector('[name=appointment-type]') as HTMLSelectElement)?.value || '',
          status: (container.querySelector('[name=appointment-status]') as HTMLSelectElement)?.value || '',
          active: (container.querySelector('[name=appointment-active]') as HTMLSelectElement)?.value || '',
        });
        const result = await api('/api/practitioner/appointments?' + q);
        adminState.appointments = result.data || [];
        const target = container.querySelector('[data-list=appointments]') as HTMLElement;
        const statuses = appointmentStatuses;
        target.innerHTML = `<table><thead><tr><th>Patient</th><th>Phone</th><th>Type</th><th>Preferred</th><th>Status</th></tr></thead><tbody>${adminState.appointments.map((x) => {
          const currentStatus = String(x.status || '').toUpperCase();
          const locked =
            isFinalAppointmentStatus(currentStatus) || x.is_active === false;
          return `<tr class="${x.is_active === false ? 'is-inactive' : ''}"><td><strong>${esc(x.patient_name)}</strong>${x.is_active === false ? '<span class="admin-chip muted-chip">Inactive</span>' : ''}</td><td>${esc(x.patient_phone)}</td><td><span class="admin-chip">${esc(x.consultation_type)}</span></td><td>${esc(x.preferred_date)}<br><span class="muted">${esc(x.preferred_time)}</span></td><td><select class="status-select" data-status="${esc(currentStatus)}" data-appointment-status="${esc(x.id)}" ${locked ? 'disabled title="Final status cannot be changed"' : ''}>${statuses.map((status) => `<option value="${esc(status)}" ${currentStatus === status ? 'selected' : ''}>${esc(appointmentStatusLabels[status])}</option>`).join('')}</select></td><td><button type="button" data-edit-appointment="${esc(x.id)}" ${locked ? 'disabled' : ''}>Edit</button></td></tr>`;
        }).join('')}</tbody></table>`;
        renderPager(target, result.count || 0, page, loadAppointments);
      };

      const syncPatientSelect = (): void => {
        const select = container.querySelector(
          '[name="patient_id"]',
        ) as HTMLSelectElement | null;
        if (!select) return;
        const current = select.value;
        select.innerHTML = `<option value="">Select patient</option>${adminState.patients
          .map(
            (patient) =>
              `<option value="${esc(patient.id)}">${esc(patient.full_name)} - ${esc(patient.phone || '')}</option>`,
          )
          .join('')}`;
        select.value = current;
      };

      const loadPatients = async (page = 1): Promise<void> => {
        const q = new URLSearchParams({
          page: String(page),
          pageSize: '10',
          search: (container.querySelector('[name=patient-search]') as HTMLInputElement)?.value || '',
          active: (container.querySelector('[name=patient-active]') as HTMLSelectElement)?.value || '',
        });
        const result = await api('/api/practitioner/patients?' + q);
        adminState.patients = result.data || [];
        syncPatientSelect();
        const target = container.querySelector('[data-list=patients]') as HTMLElement;
        target.innerHTML = `<table><thead><tr><th>Name</th><th>Phone</th><th>Age</th><th>Email</th><th></th></tr></thead><tbody>${adminState.patients.map((x) => `<tr class="${x.is_active === false ? 'is-inactive' : ''}"><td><strong>${esc(x.full_name)}</strong>${x.is_active === false ? '<span class="admin-chip muted-chip">Inactive</span>' : ''}</td><td>${esc(x.phone)}</td><td>${esc(x.age || '')}</td><td>${esc(x.email || '')}</td><td><button type="button" data-edit-patient="${esc(x.id)}" ${x.is_active === false ? 'disabled' : ''}>Edit</button><button type="button" data-download-patient="${esc(x.id)}">Download</button><button type="button" data-delete-patient="${esc(x.id)}" ${x.is_active === false ? 'disabled' : ''}>Make inactive</button></td></tr>`).join('')}</tbody></table>`;
        renderPager(target, result.count || 0, page, loadPatients);
      };

      const loadAssessments = async (page = 1): Promise<void> => {
        const q = new URLSearchParams({
          page: String(page),
          pageSize: '10',
          search: (container.querySelector('[name=assessment-search]') as HTMLInputElement)?.value || '',
          type: (container.querySelector('[name=assessment-type]') as HTMLSelectElement)?.value || '',
          active: (container.querySelector('[name=assessment-active]') as HTMLSelectElement)?.value || '',
        });
        const result = await api('/api/practitioner/assessments?' + q);
        adminState.assessments = result.data || [];
        const target = container.querySelector('[data-list=assessments]') as HTMLElement;
        target.innerHTML = `<table><thead><tr><th>Patient</th><th>Problem</th><th>Type</th><th>Date</th><th></th></tr></thead><tbody>${adminState.assessments.map((x) => `<tr class="${x.is_active === false ? 'is-inactive' : ''}"><td>${esc(x.patients?.full_name || '')}${x.is_active === false ? '<span class="admin-chip muted-chip">Inactive</span>' : ''}</td><td>${esc(x.main_problem)}</td><td>${esc(x.consultation_type || '')}</td><td>${esc(String(x.created_at || '').slice(0, 10))}</td><td><button type="button" data-edit-assessment="${esc(x.id)}" ${x.is_active === false ? 'disabled' : ''}>Edit</button><button type="button" data-download-assessment="${esc(x.id)}">Download</button><button type="button" data-delete-assessment="${esc(x.id)}" ${x.is_active === false ? 'disabled' : ''}>Delete</button></td></tr>`).join('')}</tbody></table>`;
        renderPager(target, result.count || 0, page, loadAssessments);
      };

      const formatInvoiceDate = (value: unknown): string => {
        const text = String(value || '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
        const [year, month, day] = text.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
          'en-GB',
          {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          },
        );
      };

      const todayIso = (): string =>
        new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(
          new Date(),
        );

      const invoiceForm = container.querySelector(
        '#invoice-form',
      ) as HTMLFormElement | null;
      const invoiceEditor = container.querySelector(
        '.invoice-editor',
      ) as HTMLElement | null;
      const invoicePreview = container.querySelector(
        '.invoice-preview',
      ) as HTMLElement | null;
      const invoiceItems = container.querySelector(
        '[data-invoice-items]',
      ) as HTMLElement | null;
      let invoiceItemSeq = 0;

      const invoiceValue = (name: string): string =>
        (
          (
            invoiceForm?.querySelector(`[name="${name}"]`) as
              | HTMLInputElement
              | HTMLTextAreaElement
              | HTMLSelectElement
              | null
          )?.value || ''
        ).trim();

      const numberInvoiceItems = (): void => {
        if (!invoiceItems) return;
        const rows = [...invoiceItems.querySelectorAll('.invoice-item')];
        for (const [index, row] of rows.entries()) {
          const number = row.querySelector('.invoice-item-number');
          if (number) number.textContent = String(index + 1);
          const amount = row.querySelector('[data-line-amount]') as HTMLElement | null;
          const qty = Number(
            (row.querySelector('[name=item_qty]') as HTMLInputElement | null)
              ?.value || 0,
          );
          const rate = Number(
            (row.querySelector('[name=item_rate]') as HTMLInputElement | null)
              ?.value || 0,
          );
          if (amount) amount.textContent = formatMoney(lineAmount({ qty, rate }));
          const remove = row.querySelector(
            '.remove-invoice-item',
          ) as HTMLButtonElement | null;
          if (remove) remove.disabled = rows.length === 1;
        }
      };

      const addInvoiceItem = (
        item?: Partial<InvoiceLineItem>,
        focus = false,
      ): void => {
        if (!invoiceItems) return;
        invoiceItemSeq += 1;
        const id = `inv-item-${invoiceItemSeq}`;
        invoiceItems.insertAdjacentHTML(
          'beforeend',
          `<div class="invoice-item">
            <p class="exercise-row-heading"><span>Service line <span class="invoice-item-number"></span></span><button type="button" class="remove-invoice-item">Remove</button></p>
            <div class="form-grid">
              <label class="full">Service description <span class="required">*</span><input id="${id}-desc" name="item_description" maxlength="200" required placeholder="e.g. Home physiotherapy session" value="${esc(item?.description || '')}"></label>
              <label>Service date<input name="item_service_date" type="date" value="${esc(item?.service_date || '')}"></label>
              <label>Qty<input name="item_qty" type="number" min="1" max="999" step="1" value="${esc(item?.qty || 1)}" required></label>
              <label>Rate (₹)<input name="item_rate" type="number" min="0" max="1000000" step="0.01" value="${esc(item?.rate ?? '')}" required></label>
              <p class="invoice-line-amount">Amount <strong data-line-amount>₹0.00</strong></p>
            </div>
          </div>`,
        );
        numberInvoiceItems();
        if (focus) {
          (invoiceItems.querySelector(`#${id}-desc`) as HTMLInputElement | null)?.focus();
        }
      };

      const readInvoiceItems = (): InvoiceLineItem[] => {
        if (!invoiceItems) return [];
        return [...invoiceItems.querySelectorAll('.invoice-item')]
          .map((row) => ({
            description: (
              row.querySelector(
                '[name=item_description]',
              ) as HTMLInputElement | null
            )?.value.trim() || '',
            service_date: (
              row.querySelector(
                '[name=item_service_date]',
              ) as HTMLInputElement | null
            )?.value.trim() || '',
            qty: Number(
              (
                row.querySelector('[name=item_qty]') as HTMLInputElement | null
              )?.value || 0,
            ),
            rate: Number(
              (
                row.querySelector('[name=item_rate]') as HTMLInputElement | null
              )?.value || 0,
            ),
          }))
          .filter((item) => item.description);
      };

      const invoiceDocumentHtml = (data: {
        invoice_number?: string;
        invoice_date?: string;
        due_date?: string;
        bill_to_name?: string;
        bill_to_phone?: string;
        bill_to_location?: string;
        line_items: InvoiceLineItem[];
        amount_paid?: number;
        notes?: string;
      }): string => {
        const totals = invoiceTotals(data.line_items, Number(data.amount_paid || 0));
        const status = invoicePaymentStatusPrint[totals.status];
        const rows = data.line_items.length
          ? data.line_items
              .map(
                (item) =>
                  `<tr><td>${esc(item.description)}</td><td>${esc(formatInvoiceDate(item.service_date))}</td><td>${esc(item.qty)}</td><td>${esc(formatMoney(item.rate))}</td><td>${esc(formatMoney(lineAmount(item)))}</td></tr>`,
              )
              .join('')
          : '<tr><td colspan="5">Add a service line to this invoice.</td></tr>';
        return `<div class="invoice-doc">
          <header class="invoice-brand"><img src="/assets/eduro-logo.png" alt="Eudora Movement House"><h1>Invoice</h1></header>
          <div class="invoice-meta">
            <p><span>Invoice number</span><strong>${esc(data.invoice_number || 'Assigned on save')}</strong></p>
            <p><span>Invoice date</span><strong>${esc(formatInvoiceDate(data.invoice_date))}</strong></p>
            <p><span>Due date</span><strong>${esc(formatInvoiceDate(data.due_date))}</strong></p>
            <p><span>Payment status</span><strong class="invoice-status" data-status="${esc(totals.status)}">${esc(status)}</strong></p>
          </div>
          <div class="invoice-parties">
            <section><h2>From</h2><p><strong>Eudora Movement House</strong><br>Varshini Balamurugan, MPT<br>connect@eudoraphysio.com | Bengaluru</p></section>
            <section><h2>Bill to</h2><p><strong>${esc(data.bill_to_name || 'Client / Patient name')}</strong><br>${esc(data.bill_to_phone || 'Phone number')}<br>${esc(data.bill_to_location || 'Location')}</p></section>
          </div>
          <table class="invoice-lines">
            <thead><tr><th>Service description</th><th>Service date</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="invoice-totals">
            <p><span>Total</span><strong>${esc(formatMoney(totals.total))}</strong></p>
            <p><span>Amount paid</span><strong>${esc(formatMoney(totals.paid))}</strong></p>
            <p><span>Balance due</span><strong>${esc(formatMoney(totals.balance))}</strong></p>
          </div>
          ${data.notes ? `<p class="invoice-notes">${esc(data.notes)}</p>` : ''}
        </div>`;
      };

      const currentInvoiceData = () => ({
        invoice_number: invoiceValue('invoice_number'),
        invoice_date: invoiceValue('invoice_date'),
        due_date: invoiceValue('due_date'),
        bill_to_name: invoiceValue('bill_to_name'),
        bill_to_phone: invoiceValue('bill_to_phone'),
        bill_to_location: invoiceValue('bill_to_location'),
        line_items: readInvoiceItems(),
        amount_paid: Number(invoiceValue('amount_paid') || 0),
        notes: invoiceValue('notes'),
      });

      const renderInvoicePreview = (): void => {
        if (!invoicePreview) return;
        numberInvoiceItems();
        invoicePreview.innerHTML = invoiceDocumentHtml(currentInvoiceData());
      };

      const printInvoiceHtml = (inner: string, title: string): void => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          window.print();
          return;
        }
        const styles = Array.from(
          document.querySelectorAll('style, link[rel="stylesheet"]'),
        )
          .map((node) => node.outerHTML)
          .join('');
        printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>${styles}<style>
          body { background: #fff; margin: 0; padding: 14mm; }
          .invoice-preview, .invoice-doc { border: 0 !important; width: 100% !important; max-width: none !important; padding: 0 !important; box-shadow: none !important; }
          @page { size: A4; margin: 12mm; }
        </style></head><body>${inner}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };

      const syncInvoicePatientSelect = (): void => {
        const select = invoiceForm?.querySelector(
          '[name="invoice_patient_id"]',
        ) as HTMLSelectElement | null;
        if (!select) return;
        const current = select.value;
        select.innerHTML = `<option value="">Select patient</option>${adminState.invoicePatients
          .map(
            (patient) =>
              `<option value="${esc(patient.id)}">${esc(patient.full_name)} - ${esc(patient.phone || '')}</option>`,
          )
          .join('')}`;
        select.value = current;
      };

      const loadInvoicePatientOptions = async (): Promise<void> => {
        const result = await api(
          '/api/practitioner/patients?page=1&pageSize=100&active=',
        );
        adminState.invoicePatients = result.data || [];
        syncInvoicePatientSelect();
      };

      const loadInvoices = async (page = 1): Promise<void> => {
        const q = new URLSearchParams({
          page: String(page),
          pageSize: '10',
          search:
            (
              container.querySelector(
                '[name=invoice-search]',
              ) as HTMLInputElement | null
            )?.value || '',
          status:
            (
              container.querySelector(
                '[name=invoice-status]',
              ) as HTMLSelectElement | null
            )?.value || '',
          active:
            (
              container.querySelector(
                '[name=invoice-active]',
              ) as HTMLSelectElement | null
            )?.value || '',
        });
        const result = await api(`/api/practitioner/invoices?${q}`);
        adminState.invoices = result.data || [];
        const target = container.querySelector(
          '[data-list=invoices]',
        ) as HTMLElement;
        target.innerHTML = `<table><thead><tr><th>Invoice</th><th>Bill to</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${adminState.invoices
          .map((x) => {
            const status = String(x.payment_status || 'PAYMENT_DUE') as InvoicePaymentStatus;
            return `<tr class="${x.is_active === false ? 'is-inactive' : ''}"><td><strong>${esc(x.invoice_number)}</strong>${x.is_active === false ? '<span class="admin-chip muted-chip">Inactive</span>' : ''}</td><td>${esc(x.bill_to_name)}<br><span class="muted">${esc(x.bill_to_phone || '')}</span></td><td>${esc(x.invoice_date || '')}</td><td>${esc(formatMoney(Number(x.total_amount || 0)))}</td><td><span class="admin-chip invoice-status-chip" data-status="${esc(status)}">${esc(invoicePaymentStatusLabels[status] || status)}</span></td><td><button type="button" data-edit-invoice="${esc(x.id)}" ${x.is_active === false ? 'disabled' : ''}>Edit</button><button type="button" data-download-invoice="${esc(x.id)}">Download</button><button type="button" data-delete-invoice="${esc(x.id)}" ${x.is_active === false ? 'disabled' : ''}>Make inactive</button></td></tr>`;
          })
          .join('')}</tbody></table>`;
        renderPager(target, result.count || 0, page, loadInvoices);
      };

      const showInvoiceForm = (record?: any): void => {
        if (!invoiceForm || !invoiceEditor || !invoiceItems) return;
        invoiceForm.reset();
        invoiceEditor.hidden = false;
        invoiceItems.innerHTML = '';
        invoiceItemSeq = 0;
        const set = (name: string, value: unknown) => {
          const field = invoiceForm.elements.namedItem(name) as
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement
            | null;
          if (field) field.value = String(value ?? '');
        };
        set('id', record?.id || '');
        set('invoice_number', record?.invoice_number || '');
        set('invoice_patient_id', record?.patient_id || '');
        set('invoice_date', record?.invoice_date || todayIso());
        set('due_date', record?.due_date || '');
        set('bill_to_name', record?.bill_to_name || '');
        set('bill_to_phone', record?.bill_to_phone || '');
        set('bill_to_location', record?.bill_to_location || '');
        set('amount_paid', record?.amount_paid ?? 0);
        set('notes', record?.notes || '');
        const items = Array.isArray(record?.line_items) ? record.line_items : [];
        if (items.length) {
          for (const item of items) addInvoiceItem(item);
        } else {
          addInvoiceItem({ qty: 1, rate: 0, description: '', service_date: '' });
        }
        invoiceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        renderInvoicePreview();
      };

      const setPanel = (nextMode: string): void => {
        container.querySelectorAll('[data-panel]').forEach((panel) => {
          const value = (panel as HTMLElement).dataset.panel;
          (panel as HTMLElement).hidden =
            nextMode === 'exercise' || nextMode === 'summary'
              ? value !== 'documents'
              : value !== nextMode;
        });
        if (nextMode === 'appointments') loadAppointments().catch(() => {});
        if (nextMode === 'patients') loadPatients().catch(() => {});
        if (nextMode === 'invoices') {
          Promise.all([
            loadInvoicePatientOptions().catch(() => {}),
            loadInvoices().catch(() => {}),
          ]).catch(() => {});
        }
        if (nextMode === 'assessments') {
          Promise.all([
            loadPatients(1).catch(() => {}),
            loadAssessments().catch(() => {}),
          ]).catch(() => {});
        }
      };

      const assessmentForm = container.querySelector(
        '#assessment-form',
      ) as HTMLFormElement | null;
      const patientForm = container.querySelector(
        '#patient-form',
      ) as HTMLFormElement | null;
      const appointmentForm = container.querySelector(
        '#appointment-form',
      ) as HTMLFormElement | null;

      const fieldValue = (
        root: ParentNode,
        name: string,
      ): string => {
        const radio = root.querySelector(
          `[name="${name}"]:checked`,
        ) as HTMLInputElement | null;
        if (radio) {
          return radio.value.trim();
        }
        return (
          (
            root.querySelector(`[name="${name}"]`) as
              | HTMLInputElement
              | HTMLTextAreaElement
              | HTMLSelectElement
              | null
          )?.value || ''
        ).trim();
      };

      const formValue = (name: string): string =>
        assessmentForm ? fieldValue(assessmentForm, name) : '';

      const checkedValues = (name: string): string[] =>
        assessmentForm
          ? Array.from(
              assessmentForm.querySelectorAll(
                `[data-name="${name}"] input:checked`,
              ),
            ).map((x) => (x as HTMLInputElement).value)
          : [];

      const showAssessmentStatus = (message: string, error = false): void => {
        if (!assessmentForm) return;
        status(assessmentForm, message, error);
        const el = assessmentForm.querySelector(
          '.form-status',
        ) as HTMLElement | null;
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      const toDateTimeLocal = (date?: string, time?: string): string => {
        if (!date) return '';
        const cleanTime = (time || '09:00').match(/\d{1,2}:\d{2}/)?.[0] || '09:00';
        return `${date}T${cleanTime.padStart(5, '0')}`;
      };

      const setAssessmentValue = (name: string, value: unknown): void => {
        if (!assessmentForm) return;
        const field = assessmentForm.elements.namedItem(name) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement
          | null;
        if (field) field.value = String(value ?? '');
      };

      const fillAssessmentPatient = (patient: any): void => {
        for (const key of [
          'full_name',
          'age',
          'gender',
          'date_of_birth',
          'phone',
          'email',
          'address',
          'emergency_contact_name',
          'emergency_contact_phone',
        ]) {
          setAssessmentValue(key, patient?.[key] || '');
        }
      };

      const patientValue = (name: string): string =>
        patientForm ? fieldValue(patientForm, name) : '';

      const appointmentValue = (name: string): string =>
        appointmentForm ? fieldValue(appointmentForm, name) : '';

      const showAppointmentForm = (record: any): void => {
        if (!appointmentForm) return;
        appointmentForm.reset();
        appointmentForm.hidden = false;
        appointmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const set = (name: string, value: unknown) => {
          const field = appointmentForm.elements.namedItem(name) as
            | HTMLInputElement
            | HTMLSelectElement
            | null;
          if (field) field.value = String(value ?? '');
        };
        set('id', record.id);
        set('type', record.consultation_type);
        set('date', record.preferred_date);
        set('time', record.preferred_time);
      };

      const collectPatient = (): Record<string, unknown> => ({
        full_name: patientValue('full_name'),
        age: patientValue('age'),
        gender: patientValue('gender'),
        date_of_birth: patientValue('date_of_birth'),
        phone: patientValue('phone'),
        email: patientValue('email'),
        address: patientValue('address'),
        emergency_contact_name: patientValue('emergency_contact_name'),
        emergency_contact_phone: patientValue('emergency_contact_phone'),
      });

      const showPatientForm = (record?: any): void => {
        if (!patientForm) return;
        patientForm.reset();
        patientForm.hidden = false;
        patientForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const set = (name: string, value: unknown) => {
          const field = patientForm.elements.namedItem(name) as
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement
            | null;
          if (field) field.value = String(value ?? '');
        };
        for (const key of [
          'id',
          'full_name',
          'age',
          'gender',
          'date_of_birth',
          'phone',
          'email',
          'address',
          'emergency_contact_name',
          'emergency_contact_phone',
        ]) {
          set(key, record?.[key] || '');
        }
      };

      const collectAssessment = (): Record<string, unknown> => {
        const parq_answers = Object.fromEntries(
          parqQuestions.map(([key]) => [key, formValue(`parq_${key}`)]),
        );
        return {
          patient_id: formValue('patient_id'),
          appointment_id: formValue('appointment_id') || null,
          patient: {
            full_name: formValue('full_name'),
            age: formValue('age'),
            gender: formValue('gender'),
            date_of_birth: formValue('date_of_birth'),
            phone: formValue('phone'),
            email: formValue('email'),
            address: formValue('address'),
            emergency_contact_name: formValue('emergency_contact_name'),
            emergency_contact_phone: formValue('emergency_contact_phone'),
          },
          consultation_type: formValue('consultation_type'),
          preferred_day_time: formValue('preferred_day_time'),
          referral_source: formValue('referral_source'),
          main_problem: formValue('main_problem'),
          duration_of_complaint: formValue('duration_of_complaint'),
          symptom_region: formValue('symptom_region'),
          symptom_side: formValue('symptom_side'),
          movement_range: formValue('movement_range'),
          pain_presentation: formValue('pain_presentation'),
          complaint_onset: formValue('complaint_onset'),
          pain_severity: formValue('pain_severity'),
          aggravating_activities: formValue('aggravating_activities'),
          relieving_factors: formValue('relieving_factors'),
          medical_conditions: checkedValues('medical_conditions'),
          other_medical_condition: formValue('other_medical_condition'),
          surgery_status: formValue('surgery_status'),
          surgery_details: formValue('surgery_details'),
          current_medications: formValue('current_medications'),
          investigations: checkedValues('investigations'),
          parq_answers,
          parq_details: formValue('parq_details'),
          consent_confirmed: (assessmentForm?.querySelector('[name=consent_confirmed]') as HTMLInputElement | null)?.checked || false,
          electronic_signature: formValue('electronic_signature'),
        };
      };

      const exerciseList = form.querySelector(
        '[data-exercise-list]',
      ) as HTMLElement | null;
      let exerciseSeq = 0;

      const numberExerciseRows = (): void => {
        if (!exerciseList) return;
        const rows = [...exerciseList.querySelectorAll('.exercise-row')];
        for (const [index, row] of rows.entries()) {
          const number = row.querySelector('.exercise-number');
          if (number) number.textContent = String(index + 1);
          const remove = row.querySelector(
            '.remove-exercise',
          ) as HTMLButtonElement | null;
          if (remove) remove.disabled = rows.length === 1;
        }
      };

      const addExerciseRow = (focus = false): void => {
        if (!exerciseList) return;
        exerciseSeq += 1;
        const id = `ex-${exerciseSeq}`;
        exerciseList.insertAdjacentHTML(
          'beforeend',
          `<div class="exercise-row">
            <p class="exercise-row-heading"><span>Exercise <span class="exercise-number"></span></span><button type="button" class="remove-exercise">Remove</button></p>
            <label>Exercise name<input id="${id}-name" name="exercise_name" maxlength="120" placeholder="Name of the prescribed exercise"></label>
            <label>Instructions<textarea id="${id}-dose" name="exercise_dose" rows="2" maxlength="800" placeholder="Repetitions, sets, frequency, technique and any precautions."></textarea></label>
          </div>`,
        );
        numberExerciseRows();
        if (focus) {
          (
            exerciseList.querySelector(
              `#${id}-name`,
            ) as HTMLInputElement | null
          )?.focus();
        }
      };

      const readExercises = (): Array<{ name: string; dose: string }> => {
        if (!exerciseList) return [];
        return [...exerciseList.querySelectorAll('.exercise-row')]
          .map((row) => ({
            name: (
              row.querySelector(
                '[name=exercise_name]',
              ) as HTMLInputElement | null
            )?.value.trim() || '',
            dose: (
              row.querySelector(
                '[name=exercise_dose]',
              ) as HTMLTextAreaElement | null
            )?.value.trim() || '',
          }))
          .filter((exercise) => exercise.name);
      };

      if (exerciseList && exerciseList.children.length === 0) {
        addExerciseRow();
      }

      listen(form, 'click', (event) => {
        const target = event.target as HTMLElement;
        if (target.closest('.add-exercise')) {
          addExerciseRow(true);
          render();
          return;
        }
        const remove = target.closest('.remove-exercise') as HTMLButtonElement | null;
        if (!remove || remove.disabled) return;
        remove.closest('.exercise-row')?.remove();
        numberExerciseRows();
        render();
      });

      const formatConsultDate = (value: unknown): string => {
        const text = String(value || '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
        const [year, month, day] = text.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
          'en-GB',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          },
        );
      };

      const markedList = (items: string[], marker: string): string =>
        `<ul>${items
          .map(
            (item) =>
              `<li><span aria-hidden="true">${marker}</span><span>${esc(item)}</span></li>`,
          )
          .join('')}</ul>`;

      const render = (): void => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData) as Record<string, unknown>;

        if (mode === 'exercise') {
          const exercises = readExercises();
          const exerciseMarkup = exercises.length
            ? `<ol class="exercise-plan">${exercises
                .map(
                  (exercise) =>
                    `<li><h3>${esc(exercise.name)}</h3>${
                      exercise.dose
                        ? `<p>${esc(exercise.dose)}</p>`
                        : ''
                    }</li>`,
                )
                .join('')}</ol>`
            : '<p>Add the exercises prescribed for this visit.</p>';
          const precautions = String(data.instructions || '').trim();
          const consultDate = formatConsultDate(data.date);

          chart.innerHTML = `<div class="exercise-doc">
            <div class="exercise-doc-brand"><img src="/assets/eduro-logo.png" alt="Eudora Movement House"></div>
            <h2 class="exercise-doc-title">Your movement plan</h2>
            <p class="exercise-doc-meta"><span>${esc(consultDate)}</span><span>Varshini Balamurugan, MPT, BPT</span></p>
            <h3 class="exercise-doc-name">${esc(data.patient || 'Patient name')}</h3>
            ${exerciseMarkup}${
              precautions
                ? `<h3>General precautions</h3><p style="white-space:pre-wrap">${esc(precautions)}</p>`
                : ''
            }<p class="chart-footer">Prepared by your physiotherapist for your individual care.<br>Eudora Movement House · +91 74181 58876</p>
          </div>`;
          return;
        }

        chart.innerHTML = `<div class="summary-doc">
          <div class="summary-page-one">
          <header class="summary-letterhead">
            <div class="summary-letterhead-brand"><img src="/assets/eduro-logo.png" alt="Eudora Movement House"></div>
            <h2 class="summary-letterhead-title">Consultation summary</h2>
            <p class="summary-letterhead-clinician"><strong>Varshini Balamurugan PT, MIAP</strong><span>Musculoskeletal physiotherapist</span></p>
          </header>
          <ol class="summary-fields">
            <li><strong>Name</strong><p class="summary-line">${esc(data.patient || '')}</p></li>
            <li><strong>Date of Consultation</strong><p class="summary-line">${esc(formatConsultDate(data.date))}</p></li>
            <li><strong>Summary</strong><p class="summary-block">${esc(data.summary || '')}</p></li>
            <li><strong>Plan of action</strong><p class="summary-block">${esc(data.plan || '')}</p></li>
            <li><strong>Sign</strong><div class="summary-sign"><p class="summary-sign-name">${esc(data.sign || '')}</p></div></li>
          </ol>
          <p class="chart-footer">Prepared by your physiotherapist for your individual care.<br>Eudora Movement House · +91 74181 58876</p>
          </div>
          <section class="summary-page-two">
            <h3 class="summary-guidance-heading">Dos and Don'ts</h3>
            <div class="summary-guidance-grid">
              <section>
                <h3>Do</h3>
                ${markedList(summaryDos, '✓')}
              </section>
              <section>
                <h3>Do Not</h3>
                ${markedList(summaryDonts, '×')}
              </section>
            </div>
            <aside class="summary-urgent">
              <h3><span aria-hidden="true">!</span> Stop activity and seek urgent medical care for</h3>
              <p>${esc(summaryUrgent)}</p>
            </aside>
            <p class="summary-note"><strong>Important</strong> This guidance is general and does not replace your individual physiotherapy plan, medical advice or emergency care.</p>
            <p class="summary-note"><strong>Evidence base</strong> ${esc(summaryEvidence)}</p>
          </section>
        </div>`;
      };

      listen(form, 'input', render);

      const parqGrid = container.querySelector('.parq-grid') as HTMLElement | null;
      if (parqGrid) {
        parqGrid.innerHTML = parqQuestions
          .map(
            ([key, question]) =>
              `<fieldset><legend>${esc(question)}</legend><label><input type="radio" name="parq_${esc(key)}" value="yes" required> Yes</label><label><input type="radio" name="parq_${esc(key)}" value="no" required> No</label></fieldset>`,
          )
          .join('');
      }

      container.querySelectorAll('[role=tab]').forEach((tab) => {
        listen(tab, 'click', () => {
          const tabElement = tab as HTMLButtonElement;
          const nextMode = tabElement.dataset.mode || 'appointments';
          if (nextMode === 'exercise' || nextMode === 'summary') {
            mode = nextMode;
          }

          container.querySelectorAll('[role=tab]').forEach((x) => {
            (x as HTMLButtonElement).setAttribute(
              'aria-selected',
              String(x === tab),
            );
          });

          const exerciseFields = container.querySelector(
            '#exercise-fields',
          ) as HTMLElement | null;
          const summaryFields = container.querySelector(
            '#summary-fields',
          ) as HTMLElement | null;

          if (exerciseFields) {
            exerciseFields.hidden = mode !== 'exercise';
          }
          if (summaryFields) {
            summaryFields.hidden = mode !== 'summary';
          }

          setPanel(nextMode);
          render();
        });
      });

      const showAssessmentForm = (record?: any): void => {
        if (!assessmentForm) return;
        assessmentForm.hidden = false;
        assessmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        assessmentForm.reset();
        adminState.currentAssessment = record || null;
        const values = record?.form_data || {};
        const patient = values.patient || record?.patients || {};
        const set = (name: string, value: unknown) => {
          const field = assessmentForm.elements.namedItem(name) as
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement
            | null;
          if (field) field.value = String(value ?? '');
        };
        set('id', record?.id || '');
        set('patient_id', record?.patient_id || values.patient_id || patient.id || '');
        set('appointment_id', record?.appointment_id || values.appointment_id || '');
        fillAssessmentPatient(patient);
        for (const key of [
          'consultation_type',
          'preferred_day_time',
          'referral_source',
          'main_problem',
          'duration_of_complaint',
          'symptom_region',
          'symptom_side',
          'movement_range',
          'pain_presentation',
          'complaint_onset',
          'pain_severity',
          'aggravating_activities',
          'relieving_factors',
          'other_medical_condition',
          'surgery_status',
          'surgery_details',
          'current_medications',
          'parq_details',
          'electronic_signature',
        ]) {
          set(key, values[key] ?? record?.[key] ?? '');
        }
        const checks = (name: string, list: unknown[]) => {
          assessmentForm
            .querySelectorAll(`[data-name="${name}"] input`)
            .forEach((x) => {
              (x as HTMLInputElement).checked = list.includes(
                (x as HTMLInputElement).value,
              );
            });
        };
        checks('medical_conditions', values.medical_conditions || record?.medical_conditions || []);
        checks('investigations', values.investigations || record?.investigations || []);
        const parq = values.parq_answers || record?.parq_answers || {};
        for (const [key] of parqQuestions) {
          const radio = assessmentForm.querySelector(
            `[name="parq_${key}"][value="${parq[key]}"]`,
          ) as HTMLInputElement | null;
          if (radio) radio.checked = true;
        }
        const consent = assessmentForm.elements.namedItem(
          'consent_confirmed',
        ) as HTMLInputElement;
        consent.checked = Boolean(values.consent_confirmed || record?.consent_confirmed);
      };

      listen(container.querySelector('.new-assessment'), 'click', async () => {
        if (adminState.patients.length === 0) {
          await loadPatients();
        }
        showAssessmentForm();
      });
      listen(container.querySelector('.cancel-assessment'), 'click', () => {
        const assessmentForm = container.querySelector(
          '#assessment-form',
        ) as HTMLFormElement | null;
        if (assessmentForm) assessmentForm.hidden = true;
      });

      listen(container.querySelector('.new-patient'), 'click', () =>
        showPatientForm(),
      );
      listen(container.querySelector('.cancel-patient'), 'click', () => {
        if (patientForm) patientForm.hidden = true;
      });
      listen(container.querySelector('.new-invoice'), 'click', async () => {
        await loadInvoicePatientOptions().catch(() => {});
        showInvoiceForm();
      });
      listen(container.querySelector('.cancel-invoice'), 'click', () => {
        if (invoiceEditor) invoiceEditor.hidden = true;
      });
      listen(container.querySelector('.cancel-appointment'), 'click', () => {
        if (appointmentForm) appointmentForm.hidden = true;
      });

      listen(appointmentForm, 'submit', async (event) => {
        event.preventDefault();
        if (!appointmentForm || !appointmentForm.reportValidity()) return;
        const id = appointmentValue('id');
        const button = appointmentForm.querySelector(
          'button[type=submit]',
        ) as HTMLButtonElement | null;
        await withButtonLoading(button, 'Saving', async () => {
          try {
            await api(`/api/practitioner/appointments/${encodeURIComponent(id)}`, {
              method: 'PUT',
              body: JSON.stringify({
                type: appointmentValue('type'),
                date: appointmentValue('date'),
                time: appointmentValue('time'),
              }),
            });
            status(appointmentForm, 'Appointment saved.');
            appointmentForm.hidden = true;
            await loadAppointments();
          } catch (error) {
            status(appointmentForm, (error as Error).message, true);
          }
        });
      });

      listen(patientForm, 'submit', async (event) => {
        event.preventDefault();
        if (!patientForm || !patientForm.reportValidity()) return;
        const id = patientValue('id');
        const button = patientForm.querySelector(
          'button[type=submit]',
        ) as HTMLButtonElement | null;
        await withButtonLoading(button, 'Saving', async () => {
          try {
            await api(
              id
                ? `/api/practitioner/patients/${encodeURIComponent(id)}`
                : '/api/practitioner/patients',
              {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify(collectPatient()),
              },
            );
            status(patientForm, 'Patient saved.');
            patientForm.hidden = true;
            await loadPatients();
          } catch (error) {
            status(patientForm, (error as Error).message, true);
          }
        });
      });

      const collectInvoice = () => ({
        patient_id: invoiceValue('invoice_patient_id') || null,
        invoice_date: invoiceValue('invoice_date'),
        due_date: invoiceValue('due_date') || null,
        bill_to_name: invoiceValue('bill_to_name'),
        bill_to_phone: invoiceValue('bill_to_phone'),
        bill_to_location: invoiceValue('bill_to_location'),
        line_items: readInvoiceItems(),
        amount_paid: Number(invoiceValue('amount_paid') || 0),
        notes: invoiceValue('notes'),
      });

      listen(invoiceForm, 'input', () => renderInvoicePreview());
      listen(invoiceForm, 'click', (event) => {
        const target = event.target as HTMLElement;
        if (target.closest('.add-invoice-item')) {
          addInvoiceItem({ qty: 1, rate: 0, description: '', service_date: '' }, true);
          renderInvoicePreview();
          return;
        }
        const remove = target.closest(
          '.remove-invoice-item',
        ) as HTMLButtonElement | null;
        if (!remove || remove.disabled) return;
        remove.closest('.invoice-item')?.remove();
        numberInvoiceItems();
        renderInvoicePreview();
      });
      listen(invoiceForm, 'submit', async (event) => {
        event.preventDefault();
        if (!invoiceForm || !invoiceForm.reportValidity()) return;
        const payload = collectInvoice();
        if (payload.line_items.length === 0) {
          status(invoiceForm, 'Please add at least one service line.', true);
          return;
        }
        const id = invoiceValue('id');
        const button = invoiceForm.querySelector(
          'button[type=submit]',
        ) as HTMLButtonElement | null;
        await withButtonLoading(button, 'Saving', async () => {
          try {
            const result = await api(
              id
                ? `/api/practitioner/invoices/${encodeURIComponent(id)}`
                : '/api/practitioner/invoices',
              {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify(payload),
              },
            );
            if (result?.data?.invoice_number) {
              const numberField = invoiceForm.elements.namedItem(
                'invoice_number',
              ) as HTMLInputElement | null;
              if (numberField) numberField.value = result.data.invoice_number;
            }
            if (result?.id) {
              const idField = invoiceForm.elements.namedItem(
                'id',
              ) as HTMLInputElement | null;
              if (idField) idField.value = result.id;
            }
            status(invoiceForm, 'Invoice saved.');
            renderInvoicePreview();
            await loadInvoices();
          } catch (error) {
            status(invoiceForm, (error as Error).message, true);
          }
        });
      });
      listen(
        container.querySelector('.download-invoice-form'),
        'click',
        async (event) => {
          const button = event.currentTarget as HTMLButtonElement;
          await withButtonLoading(button, 'Preparing', async () => {
            if (!invoiceForm?.reportValidity()) return;
            const data = currentInvoiceData();
            if (data.line_items.length === 0) {
              status(invoiceForm, 'Please add at least one service line.', true);
              return;
            }
            printInvoiceHtml(
              invoiceDocumentHtml(data),
              data.invoice_number || 'Eudora invoice',
            );
          });
        },
      );

      listen(assessmentForm, 'submit', async (event) => {
        event.preventDefault();
        if (!assessmentForm || !assessmentForm.reportValidity()) return;
        if (checkedValues('medical_conditions').length === 0) {
          showAssessmentStatus(
            'Please select at least one medical condition option.',
            true,
          );
          assessmentForm
            .querySelector('[data-name="medical_conditions"]')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (checkedValues('investigations').length === 0) {
          showAssessmentStatus(
            'Please select at least one previous investigation option.',
            true,
          );
          assessmentForm
            .querySelector('[data-name="investigations"]')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        const id = formValue('id');
        const payload = collectAssessment();
        const button = assessmentForm.querySelector(
          'button[type=submit]',
        ) as HTMLButtonElement | null;
        await withButtonLoading(button, 'Saving', async () => {
          try {
            await api(
              id
                ? `/api/practitioner/assessments/${encodeURIComponent(id)}`
                : '/api/practitioner/assessments',
              {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify(payload),
              },
            );
            showAssessmentStatus('PAR-Q form saved.');
            assessmentForm.hidden = true;
            await loadAssessments();
            await loadPatients();
          } catch (error) {
            showAssessmentStatus((error as Error).message, true);
          }
        });
      });

      listen(container, 'click', async (event) => {
        const target = event.target as HTMLElement;
        const button = target.closest('button') as HTMLButtonElement | null;
        if (!button) return;
        const editAppointmentId = button.dataset.editAppointment;
        if (editAppointmentId) {
          const record = adminState.appointments.find(
            (x) => x.id === editAppointmentId,
          );
          if (record) showAppointmentForm(record);
        }
        const editId = button.dataset.editAssessment;
        if (editId) {
          const record = adminState.assessments.find((x) => x.id === editId);
          showAssessmentForm(record);
        }
        const deleteId = button.dataset.deleteAssessment;
        if (deleteId && confirm('Delete this PAR-Q form?')) {
          await withButtonLoading(button, 'Deleting', async () => {
            await api(`/api/practitioner/assessments/${deleteId}`, {
              method: 'DELETE',
            });
            await loadAssessments();
          });
        }
        const editPatientId = button.dataset.editPatient;
        if (editPatientId) {
          const row = adminState.patients.find((x) => x.id === editPatientId);
          showPatientForm(row);
        }
        const deletePatientId = button.dataset.deletePatient;
        if (
          deletePatientId &&
          confirm(
            'This will make the patient inactive and also hide linked PAR-Q forms and mapped appointments from active lists. Continue?',
          )
        ) {
          try {
            await withButtonLoading(button, 'Updating', async () => {
              await api(`/api/practitioner/patients/${deletePatientId}`, {
                method: 'DELETE',
              });
              await loadPatients();
              await loadAssessments();
            });
          } catch (error) {
            alert((error as Error).message);
          }
        }
        const patientId = button.dataset.downloadPatient;
        if (patientId) {
          const row = adminState.patients.find((x) => x.id === patientId);
          await withButtonLoading(button, 'Preparing', async () => {
            download(
              `patient-${row.full_name || 'details'}.html`,
              detailHtml('Patient details', patientDetailPairs(row)),
              'text/html',
            );
          });
        }
        const assessmentId = button.dataset.downloadAssessment;
        if (assessmentId) {
          const row = adminState.assessments.find((x) => x.id === assessmentId);
          await withButtonLoading(button, 'Preparing', async () => {
            download(
              `parq-${assessmentPatient(row).full_name || 'details'}.html`,
              detailHtml('PAR-Q / Assessment details', assessmentDetailPairs(row)),
              'text/html',
            );
          });
        }
        const editInvoiceId = button.dataset.editInvoice;
        if (editInvoiceId) {
          const row = adminState.invoices.find((x) => x.id === editInvoiceId);
          await loadInvoicePatientOptions().catch(() => {});
          showInvoiceForm(row);
        }
        const deleteInvoiceId = button.dataset.deleteInvoice;
        if (
          deleteInvoiceId &&
          confirm('This will make the invoice inactive. Continue?')
        ) {
          try {
            await withButtonLoading(button, 'Updating', async () => {
              await api(`/api/practitioner/invoices/${deleteInvoiceId}`, {
                method: 'DELETE',
              });
              await loadInvoices();
              if (invoiceEditor) invoiceEditor.hidden = true;
            });
          } catch (error) {
            alert((error as Error).message);
          }
        }
        const downloadInvoiceId = button.dataset.downloadInvoice;
        if (downloadInvoiceId) {
          const row = adminState.invoices.find((x) => x.id === downloadInvoiceId);
          if (!row) return;
          await withButtonLoading(button, 'Preparing', async () => {
            printInvoiceHtml(
              invoiceDocumentHtml({
                invoice_number: row.invoice_number,
                invoice_date: row.invoice_date,
                due_date: row.due_date,
                bill_to_name: row.bill_to_name,
                bill_to_phone: row.bill_to_phone,
                bill_to_location: row.bill_to_location,
                line_items: Array.isArray(row.line_items) ? row.line_items : [],
                amount_paid: Number(row.amount_paid || 0),
                notes: row.notes || '',
              }),
              row.invoice_number || 'Eudora invoice',
            );
          });
        }
      });

      listen(container, 'change', async (event) => {
        const target = event.target as HTMLSelectElement;
        if (target.name === 'patient_id') {
          const patient = adminState.patients.find((x) => x.id === target.value);
          if (patient) {
            fillAssessmentPatient(patient);
          }
          return;
        }
        if (target.name === 'invoice_patient_id') {
          const patient = adminState.invoicePatients.find(
            (x) => x.id === target.value,
          );
          if (patient && invoiceForm) {
            const set = (name: string, value: unknown) => {
              const field = invoiceForm.elements.namedItem(name) as
                | HTMLInputElement
                | HTMLTextAreaElement
                | null;
              if (field) field.value = String(value ?? '');
            };
            set('bill_to_name', patient.full_name);
            set('bill_to_phone', patient.phone);
            set('bill_to_location', patient.address || '');
            renderInvoicePreview();
          }
          return;
        }
        const appointmentId = target.dataset.appointmentStatus;
        if (!appointmentId) return;
        const row = adminState.appointments.find((x) => x.id === appointmentId);
        const previousStatus = String(row?.status || '').toUpperCase();
        if (
          isFinalAppointmentStatus(target.value) &&
          !confirm(
            `${appointmentStatusLabels[target.value as keyof typeof appointmentStatusLabels] || target.value} is final. You will not be able to change this appointment status again. Continue?`,
          )
        ) {
          target.value = previousStatus;
          return;
        }
        try {
          target.disabled = true;
          target.setAttribute('aria-busy', 'true');
          await api(`/api/practitioner/appointments/${appointmentId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: target.value }),
          });
          if (row) row.status = target.value;
          target.dataset.status = target.value;
          if (isFinalAppointmentStatus(target.value)) {
            target.disabled = true;
            target.title = 'Final status cannot be changed';
          }
        } catch (error) {
          target.value = previousStatus;
          alert((error as Error).message);
        } finally {
          if (!isFinalAppointmentStatus(target.value)) {
            target.disabled = false;
          }
          target.removeAttribute('aria-busy');
        }
      });

      for (const selector of [
        '[name=appointment-search]',
        '[name=appointment-type]',
        '[name=appointment-status]',
        '[name=appointment-active]',
      ]) {
        listen(container.querySelector(selector), 'input', () =>
          loadAppointments().catch(() => {}),
        );
      }
      for (const selector of ['[name=patient-search]', '[name=patient-active]']) {
        listen(container.querySelector(selector), 'input', () =>
          loadPatients().catch(() => {}),
        );
      }
      for (const selector of [
        '[name=invoice-search]',
        '[name=invoice-status]',
        '[name=invoice-active]',
      ]) {
        listen(container.querySelector(selector), 'input', () =>
          loadInvoices().catch(() => {}),
        );
      }
      for (const selector of [
        '[name=assessment-search]',
        '[name=assessment-type]',
        '[name=assessment-active]',
      ]) {
        listen(container.querySelector(selector), 'input', () =>
          loadAssessments().catch(() => {}),
        );
      }
      listen(container.querySelector('.export-appointments'), 'click', async (event) => {
        const button = event.currentTarget as HTMLButtonElement;
        await withButtonLoading(button, 'Exporting', async () => {
        const q = new URLSearchParams({
          page: '1',
          pageSize: '100',
          search: (container.querySelector('[name=appointment-search]') as HTMLInputElement)?.value || '',
          type: (container.querySelector('[name=appointment-type]') as HTMLSelectElement)?.value || '',
          status: (container.querySelector('[name=appointment-status]') as HTMLSelectElement)?.value || '',
          active: (container.querySelector('[name=appointment-active]') as HTMLSelectElement)?.value || '',
        });
        const result = await api('/api/practitioner/appointments?' + q);
        download(
          'appointments.csv',
          csv((result.data || []).map(appointmentCsvRow), appointmentCsvKeys),
          'text/csv',
        );
        });
      });
      listen(container.querySelector('.export-patients'), 'click', async (event) => {
        const button = event.currentTarget as HTMLButtonElement;
        await withButtonLoading(button, 'Exporting', async () => {
        const q = new URLSearchParams({
          page: '1',
          pageSize: '100',
          search: (container.querySelector('[name=patient-search]') as HTMLInputElement)?.value || '',
          active: (container.querySelector('[name=patient-active]') as HTMLSelectElement)?.value || '',
        });
        const result = await api('/api/practitioner/patients?' + q);
        download(
          'patients.csv',
          csv((result.data || []).map(patientCsvRow), patientCsvKeys),
          'text/csv',
        );
        });
      });
      listen(container.querySelector('.export-invoices'), 'click', async (event) => {
        const button = event.currentTarget as HTMLButtonElement;
        await withButtonLoading(button, 'Exporting', async () => {
        const q = new URLSearchParams({
          page: '1',
          pageSize: '100',
          search: (container.querySelector('[name=invoice-search]') as HTMLInputElement)?.value || '',
          status: (container.querySelector('[name=invoice-status]') as HTMLSelectElement)?.value || '',
          active: (container.querySelector('[name=invoice-active]') as HTMLSelectElement)?.value || '',
        });
        const result = await api(`/api/practitioner/invoices?${q}`);
        download(
          'invoices.csv',
          csv((result.data || []).map(invoiceCsvRow), invoiceCsvKeys),
          'text/csv',
        );
        });
      });
      listen(container.querySelector('.export-assessments'), 'click', async (event) => {
        const button = event.currentTarget as HTMLButtonElement;
        await withButtonLoading(button, 'Exporting', async () => {
        const q = new URLSearchParams({
          page: '1',
          pageSize: '100',
          search: (container.querySelector('[name=assessment-search]') as HTMLInputElement)?.value || '',
          type: (container.querySelector('[name=assessment-type]') as HTMLSelectElement)?.value || '',
          active: (container.querySelector('[name=assessment-active]') as HTMLSelectElement)?.value || '',
        });
        const result = await api('/api/practitioner/assessments?' + q);
        download(
          'parq-forms.csv',
          csv((result.data || []).map(assessmentCsvRow), assessmentCsvKeys),
          'text/csv',
        );
        });
      });

      const printButton = container.querySelector(
        '.print-button',
      ) as HTMLButtonElement | null;
      listen(printButton, 'click', async () => {
        await withButtonLoading(printButton, 'Preparing', async () => {
        const patientInput = form.elements.namedItem(
          'patient',
        ) as HTMLInputElement;
        if (!patientInput.value.trim()) {
          patientInput.focus();
          patientInput.reportValidity();
          return;
        }

        if (mode === 'exercise' && readExercises().length === 0) {
          const firstName = form.querySelector(
            '[name=exercise_name]',
          ) as HTMLInputElement | null;
          firstName?.setCustomValidity(
            'Add at least one exercise before printing.',
          );
          firstName?.reportValidity();
          firstName?.setCustomValidity('');
          firstName?.focus();
          return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          window.print();
          return;
        }

        const styles = Array.from(
          document.querySelectorAll('style, link[rel="stylesheet"]'),
        )
          .map((node) => node.outerHTML)
          .join('');
        printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Eudora document</title>${styles}<style>
          body { background: #fff; margin: 0; padding: 18mm; }
          .chart-preview { border: 0 !important; width: 100% !important; max-width: none !important; padding: 0 !important; container-type: normal !important; }
          .summary-page-one { break-after: page !important; page-break-after: always !important; }
          .chart-preview h2 { font-size: 30px; }
          .chart-preview .summary-letterhead-title { font-size: 22px; }
          .chart-preview .summary-letterhead-brand,
          .chart-preview .summary-letterhead-brand img { width: 210px; margin: 0 auto; }
          .chart-preview .exercise-doc-title { font-size: 22px; }
          .chart-preview .exercise-doc-name { font-size: 18px; }
          .chart-preview .exercise-doc-brand { width: 210px; margin: 0 auto 12px; }
          .chart-preview p, .chart-preview li { font-size: 12px; }
          .summary-guidance-grid { grid-template-columns: 1fr 1fr; }
          .summary-block { min-height: 64px; border: 0; padding: 0; }
          .summary-page-two { break-before: page !important; page-break-before: always !important; margin-top: 0; padding-top: 0; border-top: 0; }
          @page { size: A4; margin: 15mm; }
        </style></head><body><article class="chart-preview">${chart.innerHTML}</article></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
        });
      });

      const signoutButton = container.querySelector(
        '.signout',
      ) as HTMLButtonElement | null;
      listen(signoutButton, 'click', async () => {
        await withButtonLoading(signoutButton, 'Signing out', async () => {
          await fetch('/api/practitioner/logout', {
            method: 'POST',
            headers: {
              'X-CSRF-Token': csrf,
            },
          });
          location.reload();
        });
      });

      render();
    }

    return () => {
      revealObserver?.disconnect();
      controller.abort();
    };
  }, []);

  return null;
}
