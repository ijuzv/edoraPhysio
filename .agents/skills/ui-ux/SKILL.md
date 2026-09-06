---
name: ui-ux
description: Build or review the Eudora Physio frontend for layout, responsive behavior, accessibility, and patient booking flows.
---

# Eudora Physio UI/UX

Use this skill for frontend implementation or review affecting layout, navigation, visual hierarchy, responsive behavior, accessibility, forms, and the visitor journey.

## Project context

Read `PROJECT_CONTEXT.md` before making decisions. This is a mobile-first lead-generation website for a Bangalore physiotherapy practice. The primary visitor actions are booking a consultation and starting a WhatsApp conversation.

## Implementation guidance

- Preserve the existing lightweight stack unless the task explicitly authorizes an architectural change: root `index.html`, `styles.css`, client JavaScript, and the Node static server.
- Design for a phone viewport first. Make the booking and WhatsApp actions easy to reach, visible without excessive scrolling, and usable with one hand where practical.
- Keep persistent Book Consultation and WhatsApp calls to action available across public pages.
- Make qualification, service-area, and consultation-type information easy to scan on the home page.
- Use semantic landmarks, a logical heading hierarchy, visible focus states, keyboard-operable controls, associated labels, useful error messages, and sufficient contrast.
- Respect `prefers-reduced-motion`; do not make animation essential to comprehension or task completion.
- Treat older and less technical users as a core audience: keep forms short, instructions plain, and errors specific.
- Build honest empty states, particularly for testimonials. Do not substitute invented patient reviews or claims.

## Review checklist

- Test at narrow mobile, tablet, and desktop widths.
- Confirm navigation, CTAs, form completion, validation, and keyboard navigation work without a mouse.
- Confirm tele-physiotherapy prominently states its remote-assessment limitation.
- Do not change approved content, legal wording, medical claims, or project scope as part of a UI-only task.
