---
name: backend
description: Build or review Eudora Physio server-side workflows, validation, data handling, notifications, and service architecture.
---

# Eudora Physio Backend

Use this skill for APIs, form submission, storage, validation, authentication, notifications, error handling, logging, and service architecture.

## Project context

Read `PROJECT_CONTEXT.md` before changing backend behavior. The existing `server.js` only serves static files. The intended V1 backend scope centers on booking requests, practitioner notifications, patient acknowledgement, the exercise-chart workflow, consultation summaries, and a feedback form.

## Safety and scope

- Collect only the data needed for the stated workflow. Booking fields are name, age, contact number, location, consultation type, and preferred date/time, with explicit consent to the Privacy Policy and Terms of Use.
- Treat form submissions and test data as confidential patient information. Avoid logging raw personal or health data; redact or minimize it when operational logging is necessary.
- Use server-side validation in addition to browser validation. Return clear, safe errors without revealing secrets, internal paths, or implementation details.
- Restrict administrative/practitioner access to exercise charts, consultation summaries, feedback records, and submitted data. Do not add authentication or a patient portal unless the request explicitly expands scope.
- Use secure transport, least-privilege credentials, environment-based secrets, and restricted access to stored submissions.
- Do not build online payments, built-in video calling, automated appointment scheduling, or a patient records portal for V1 unless explicitly authorized.

## Implementation guidance

- Make notification delivery reliable: validate before sending, avoid duplicate sends where feasible, capture a privacy-safe delivery status, and provide a useful fallback when a third-party notification provider fails.
- Send only an acknowledgement to the patient; appointment confirmation, changes, cancellations, follow-ups, and payments remain practitioner-managed in V1.
- Define error handling and logging proportionately for the current lightweight Node architecture. Do not introduce a database, framework, or external platform without a concrete need and user authorization.
- Before adding third-party services, identify the data they receive, their cost/account dependency, and the required configuration. Never hard-code credentials.
- Test success, invalid input, consent omission, duplicate/retry behavior, notification failure, unauthorized access, and non-sensitive log output.
