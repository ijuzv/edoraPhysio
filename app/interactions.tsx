'use client';

import { useEffect } from 'react';

interface FormState {
  fingerprint: string;
  key: string;
}

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
      }
    };

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
        button.disabled = true;

        const fallback = booking.querySelector(
          '.request-fallback',
        ) as HTMLElement | null;
        if (fallback) {
          fallback.hidden = true;
        }

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
        } finally {
          button.disabled = false;
        }
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
      button.disabled = true;

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
      } finally {
        button.disabled = false;
      }
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
        button.disabled = true;

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
        } finally {
          button.disabled = false;
        }
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

      const render = (): void => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData) as Record<string, unknown>;
        const chosen = [
          ...form.querySelectorAll('[name=exercise]:checked'),
        ].map((x) => (x as HTMLInputElement).value);

        const modeContent =
          mode === 'exercise'
            ? `<ol>${chosen
                .map((x) => `<li><h3>${esc(x)}</h3></li>`)
                .join(
                  '',
                )}</ol><h3>Individual instructions</h3><p style="white-space:pre-wrap">${esc(
                data.instructions ||
                  'Add the prescribed dosage, frequency and individual guidance before sharing.',
              )}</p>`
            : `<dl><dt>Reason for consultation</dt><dd>${esc(
                data.reason || '—',
              )}</dd><dt>Assessment / findings</dt><dd>${esc(
                data.findings || '—',
              )}</dd><dt>Plan and advice</dt><dd>${esc(
                data.plan || '—',
              )}</dd><dt>Follow-up</dt><dd>${esc(
                data.followup || '—',
              )}</dd></dl>`;

        chart.innerHTML = `<div class="brand"><img src="/assets/eduro-logo.png" alt="Eudora Movement House"></div><p class="eyebrow">${
          mode === 'exercise' ? 'Your movement plan' : 'Consultation summary'
        }</p><h2>${esc(data.patient || 'Patient name')}</h2><p>${esc(
          data.date || '',
        )} · Varshini Balamurugan, MPT, BPT</p>${modeContent}<p class="chart-footer">Prepared by your physiotherapist for your individual care.<br>Eudora Movement House · +91 74181 58876</p>`;
      };

      listen(form, 'input', render);

      container.querySelectorAll('[role=tab]').forEach((tab) => {
        listen(tab, 'click', () => {
          const tabElement = tab as HTMLButtonElement;
          mode = tabElement.dataset.mode || 'exercise';

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

          render();
        });
      });

      const printButton = container.querySelector(
        '.print-button',
      ) as HTMLButtonElement | null;
      listen(printButton, 'click', () => {
        const patientInput = form.elements.namedItem(
          'patient',
        ) as HTMLInputElement;
        if (!patientInput.value.trim()) {
          patientInput.focus();
          patientInput.reportValidity();
          return;
        }
        window.print();
      });

      const signoutButton = container.querySelector(
        '.signout',
      ) as HTMLButtonElement | null;
      listen(signoutButton, 'click', async () => {
        await fetch('/api/practitioner/logout', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': csrf,
          },
        });
        location.reload();
      });

      render();
    }

    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
