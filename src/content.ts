interface PageConfig {
  ctaShow?: boolean;
  privatePage?: boolean;
}

interface Page {
  path: string;
  title: string;
  description: string;
  body: string;
  ctaShow: boolean;
  privatePage: boolean;
}

const arrow = '<span aria-hidden="true">↗</span>';
const wa = 'https://wa.me/917418158876';
const email = 'connect@eudoraphysio.com';

const locations = [
  'KR Puram',
  'Battarahalli',
  'Kithaganur',
  'Ramamurthy Nagar',
  'New Thippasandra',
  'Indiranagar',
  'Tin Factory',
  'Baiyappanahalli',
  'Koramangala',
];

const faq: Array<[string, string]> = [
  [
    'How do I book a consultation?',
    'Use the consultation form or message us on WhatsApp with your preferred timing. Varshini will get in touch to discuss availability and confirm your appointment. Submitting a request does not reserve a time slot.',
  ],
  [
    'Can I have physiotherapy at home?',
    'Home visits are available in selected Bengaluru neighbourhoods. Share your locality when requesting a consultation so we can confirm whether a visit is available in your area.',
  ],
  [
    'How does an online consultation work?',
    'You meet your physiotherapist by video to discuss your concerns and receive movement and exercise guidance. A full physical examination and certain hands-on tests cannot be performed remotely; an in-person assessment may be recommended.',
  ],
  [
    'What should I have ready for my first session?',
    'Wear comfortable clothing that allows you to move, and keep any relevant reports or previous treatment notes available. For online sessions, choose a quiet space with a stable internet connection and room to move safely.',
  ],
  [
    'When are appointments available?',
    'Consultations are by appointment, Monday to Saturday, between 7:00 AM and 7:30 PM IST. We are closed on Sundays. Your preferred time will be confirmed separately.',
  ],
  [
    'Can I ask a question before booking?',
    'Yes. Message us on WhatsApp or email us with a general question about our services. We can help you understand the next step before you request a consultation.',
  ],
];

const services: Array<[string, string, string, string]> = [
  [
    '01',
    'Musculoskeletal care',
    'Support for back, neck, joint and postural concerns that affect everyday movement.',
    'musculoskeletal',
  ],
  [
    '02',
    'Injury & sports rehabilitation',
    'An individual approach to rebuilding movement after an injury or surgery.',
    'rehabilitation',
  ],
  [
    '03',
    'Movement & strength',
    'Exercise guidance shaped around your mobility, daily activities and personal goals.',
    'movement',
  ],
  [
    '04',
    'Online physiotherapy',
    'Professional guidance, movement assessment and follow-up wherever you are.',
    'online',
  ],
];

const button = (
  text: string,
  href: string = '/contact/',
  secondary: boolean = false,
): string => {
  return `<a class="button ${
    secondary ? 'button-light' : ''
  }" href="${href}">${text}${arrow}</a>`;
};

const eyebrow = (text: string): string => {
  return `<p class="eyebrow">${text}</p>`;
};

const brand = `<img src="/assets/eduro-logo.png" width="1880" height="1074" alt="Eudora Movement House — The light after recovery">`;

const nav = `<header class="site-header"><div class="wrap header-inner"><a class="brand" href="/" aria-label="Eudora Movement House home">${brand}</a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">Menu <span aria-hidden="true">☰</span></button><nav id="main-nav" aria-label="Main navigation"><a href="/services/">Our care</a><a href="/about/">About</a><a href="/online-physiotherapy/">Online care</a><a href="/contact/" class="nav-book">Book a consultation ${arrow}</a></nav></div></header>`;

const footer = `<footer class="site-footer wrap"><div class="footer-top"><a class="brand" href="/" aria-label="Eudora Movement House home">${brand}</a><p class="footer-tagline">The light after recovery.</p><div><a href="tel:+917418158876">+91 74181 58876</a><a href="mailto:${email}">${email}</a></div></div><div class="footer-links"><a href="/why-eudora/">Why Eudora</a><a href="/areas/">Areas we serve</a><a href="/faq/">FAQs</a><a href="/testimonials/">Patient voices</a><a href="/feedback/">Share feedback</a></div><div class="footer-bottom"><p>© ${new Date().getFullYear()} Eudora Movement House</p><div><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/practitioner/">Practitioner</a></div><p>Bengaluru, India</p></div></footer><a class="whatsapp" href="${wa}" target="_blank" rel="noopener noreferrer" aria-label="Chat with Eudora on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8 7.5c-.9.7-.7 2.2.6 4s3.3 3.1 4.8 3.3c1.1.1 1.8-.5 2-1.3l-2-1.2-1 1c-1.5-.6-2.7-1.8-3.2-3l.8-.8-1-2Z"/></svg><span>Let's talk</span></a><div class="mobile-book">${button(
  'Book a consultation',
)}</div>`;

const cta = `<section class="wrap cta-wrap"><div class="contact-banner"><div>${eyebrow(
  'Your next step can be simple',
)}<h2>Let's find a way<br><em>forward.</em></h2><p>Tell us a little about what you're experiencing.<br>We'll help you understand the next step.</p><div class="actions">${button(
  'Book a consultation',
  '/contact/',
  true,
)}<a class="text-link light" href="${wa}" target="_blank" rel="noopener noreferrer">Message on WhatsApp ${arrow}</a></div></div><div class="banner-note">Home visits · Bengaluru<br>Online consultations<br><a href="tel:+917418158876">+91 74181 58876</a></div><div class="orbit" aria-hidden="true"></div></div></section>`;

const faqMarkup = (count: number): string => {
  return `<div class="faq-list">${faq
    .slice(0, count)
    .map(
      ([q, a], i) =>
        `<details><summary><span class="faq-number">0${
          i + 1
        }</span>${q}<span class="plus" aria-hidden="true"></span></summary><p>${a}</p></details>`,
    )
    .join('')}</div>`;
};

const intro = (label: string, title: string, description: string): string => {
  return `<section class="page-hero wrap">${eyebrow(
    label,
  )}<h1>${title}</h1><p class="lead">${description}</p></section>`;
};

const pages: Page[] = [];

function add(
  path: string,
  title: string,
  description: string,
  body: string,
  config: PageConfig = {},
): void {
  const { ctaShow = true, privatePage = false } = config;
  pages.push({
    path,
    title,
    description,
    body,
    ctaShow,
    privatePage,
  });
}

add(
  '/',
  'Home physiotherapy in Bengaluru',
  'Personalised physiotherapy with Varshini Balamurugan. Home visits in Bengaluru and online consultations with Eudora Movement House.',
  `
<section class="hero"><div class="wrap hero-inner"><div class="hero-title">${eyebrow(
    'Physiotherapy for considered recovery',
  )}<h1>Move with<br><em>more ease.</em></h1></div><div class="hero-aside"><p class="hero-description">Personalised physiotherapy for pain relief, stronger movement and confident recovery—at home or online.</p><div class="actions">${button(
    'Begin your recovery',
  )}<a class="text-link" href="/services/">Explore our care <span aria-hidden="true">↓</span></a></div><p class="hero-location">Bengaluru <span>·</span> Home visits <span>·</span> Online consultations</p></div><div class="hero-bottom"><span>Care that begins with you.</span><a href="/about/">Varshini Balamurugan · MPT, BPT ${arrow}</a></div></div></section>
<section class="wrap philosophy section"><div>${eyebrow(
    'A little more than treatment',
  )}<h2>Recovery is not<br><em>one-size-fits-all.</em></h2></div><div class="body-copy"><p>At Eudora Movement House, physiotherapy is a conversation between where you are now and how you want to move next.</p><p>We bring clinical reasoning together with calm, practical guidance—so your care feels personal and fits into everyday life.</p><a class="text-link" href="/why-eudora/">Find your way forward ${arrow}</a></div></section>
<section class="care-section section"><div class="wrap"><div class="section-heading"><div>${eyebrow(
    'How we can help',
  )}<h2>Care with<br><em>intention.</em></h2></div><p>Support for the moments when movement feels difficult, unfamiliar or ready for a new beginning.</p></div><div class="service-grid">${services
    .map(
      ([n, title, desc, id]) =>
        `<a class="service" href="${
          id === 'online' ? '/online-physiotherapy/' : '/services/#' + id
        }"><span class="service-number">${n}</span><h3>${title}</h3><p>${desc}</p><span class="service-arrow" aria-hidden="true">↗</span></a>`,
    )
    .join(
      '',
    )}</div><a class="text-link care-link" href="/services/">Explore services & conditions ${arrow}</a></div></section>
<section class="about-section section"><div class="wrap"><div class="about-grid"><aside class="margin-note">${eyebrow(
    'Why Eudora?',
  )}<p>Because recovery should feel understood,<br>not rushed.</p><div class="botanical-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></div></aside><div>${eyebrow(
    'The house behind the name',
  )}<h2>Made for the<br><em>human body.</em></h2><div class="body-copy"><p>Eudora Movement House was founded by Varshini Balamurugan, a physiotherapist offering care that feels personal, unhurried and practical.</p><p>Every plan starts with understanding you—your work, your home, your movement and your goals.</p></div><a class="text-link" href="/about/">Meet Varshini ${arrow}</a></div><aside class="location-note">${eyebrow(
    'Rooted in',
  )}<h3>Bengaluru</h3><p>Home visits by appointment.<br>Online care, wherever you are.</p><a class="text-link" href="/areas/">Our neighbourhoods ${arrow}</a></aside></div><div class="credentials"><div>${eyebrow(
    'Professional profile',
  )}<h3>Qualified care.<br><em>A personal approach.</em></h3></div><dl><div><dt>Academic qualifications</dt><dd>MPT · Musculoskeletal Science<br>Bachelor of Physiotherapy</dd></div><div><dt>Professional membership</dt><dd>Indian Association of Physiotherapists (IAP)</dd></div><div><dt>Care that fits your life</dt><dd>Home visits in Bengaluru · Online consultations</dd></div></dl></div></div></section>
<section class="wrap section"><div class="section-heading"><div>${eyebrow(
    'From first hello to your next step',
  )}<h2>A little clarity.<br><em>A way forward.</em></h2></div><p>You don't need to have all the answers before you reach out. We'll start with a conversation.</p></div><ol class="steps"><li><span>01</span><h3>Tell us about you</h3><p>Share what brings you here and whether you prefer a home visit or online care.</p></li><li><span>02</span><h3>Find a time together</h3><p>We'll discuss availability and confirm your consultation personally.</p></li><li><span>03</span><h3>Make a considered start</h3><p>Your assessment helps shape practical guidance and a plan around your goals.</p></li></ol></section>
<section class="faq-section wrap section"><div>${eyebrow(
    'Before we begin',
  )}<h2>A few things<br><em>you may wonder.</em></h2><a class="text-link" href="/faq/">All your questions ${arrow}</a></div>${faqMarkup(
    3,
  )}</section>`,
);

add(
  '/services/',
  'Services & conditions treated',
  'Explore physiotherapy for back, neck and joint concerns, injury rehabilitation, movement and strength in Bengaluru.',
  `${intro(
    'Our care',
    'Room for better<br><em>movement.</em>',
    'Care starts with what matters to you. We consider your concerns, your daily routine and what you want to get back to doing.',
  )}<section class="wrap service-details"><article id="musculoskeletal"><span class="service-number">01 / Everyday movement</span><div><h2>Musculoskeletal <em>care.</em></h2><p>Assessment and individual guidance for concerns affecting muscles, joints and everyday movement.</p><ul class="condition-list"><li>Back and neck concerns</li><li>Postural and work-related discomfort</li><li>Shoulder, elbow and wrist concerns</li><li>Hip, knee, ankle and foot concerns</li></ul>${button(
    'Ask about your concern',
  )}</div></article><article id="rehabilitation"><span class="service-number">02 / Returning to what you love</span><div><h2>Injury & sports<br><em>rehabilitation.</em></h2><p>A considered approach to movement after an injury or surgery, shaped around your assessment and any relevant clinical advice.</p><ul class="condition-list"><li>Sports and activity-related injuries</li><li>Recovery after surgery</li><li>Rebuilding movement after injury</li><li>Guidance for a return to daily activity</li></ul>${button(
    'Discuss your recovery',
  )}</div></article><article id="movement"><span class="service-number">03 / Confidence in everyday life</span><div><h2>Movement & <em>strength.</em></h2><p>Personalised exercise guidance that considers your starting point, mobility and goals.</p><ul class="condition-list"><li>Mobility and flexibility</li><li>Strength and movement confidence</li><li>Support for everyday independence</li><li>Practical home exercise guidance</li></ul>${button(
    'Find your starting point',
  )}</div></article></section><section class="soft-section section"><div class="wrap two-col"><h2>Your plan.<br><em>Your pace.</em></h2><div class="body-copy"><p>We begin with an assessment and explain the proposed approach in plain language. Your care may include movement education, exercises and appropriate hands-on treatment during home visits.</p><p>Online consultations offer guided assessment and exercise support. They cannot include a full physical examination or certain hands-on tests.</p><a href="/online-physiotherapy/" class="text-link">Explore online care ${arrow}</a></div></div></section>`,
);

add(
  '/about/',
  'About Varshini',
  'Meet Varshini Balamurugan, MPT, BPT, founder of Eudora Movement House in Bengaluru.',
  `${intro(
    'Meet your physiotherapist',
    'Personal care.<br><em>A human connection.</em>',
    'Physiotherapy is personal. Knowing the person guiding your care is a good place to start.',
  )}<section class="wrap section about-profile"><div class="brand-panel">${brand}<p>Care that begins with understanding.</p></div><div>${eyebrow(
    'Founder · Physiotherapist',
  )}<h2>Varshini<br><em>Balamurugan.</em></h2><p class="qualification">MPT (Musculoskeletal Science) · BPT</p><div class="body-copy"><p>Varshini founded Eudora Movement House to offer physiotherapy that feels considered, personal and practical.</p><p>Her approach begins with listening: understanding how your concerns affect daily life and what you hope to do with greater ease. Assessment and movement guidance are shaped around those priorities.</p><p>She offers home visits across selected Bengaluru neighbourhoods and online consultations by appointment.</p></div><p class="membership">Member, Indian Association of Physiotherapists (IAP)</p>${button(
    'Book with Varshini',
  )}</div></section>`,
);

add(
  '/why-eudora/',
  'Why Eudora',
  'The story and approach behind Eudora Movement House: personalised physiotherapy and practical guidance.',
  `${intro(
    'The meaning behind our care',
    'A place to begin<br><em>moving forward.</em>',
    'The light after recovery. A reminder of the everyday moments that make movement meaningful.',
  )}<section class="wrap section two-col"><h2>Understood.<br><em>Not rushed.</em></h2><div class="body-copy"><p>We believe care should make room for the whole person: your questions, your routines and the things you want to return to.</p><p>Movement House reflects that idea—a practice centred on how you move through your life, with guidance you can understand and use.</p></div></section><section class="soft-section section"><div class="wrap"><div class="section-heading"><h2>What that looks like<br><em>in practice.</em></h2></div><ol class="steps"><li><span>01</span><h3>Space to be heard</h3><p>We start by understanding what brings you here and what matters to you.</p></li><li><span>02</span><h3>Clarity in your care</h3><p>Your assessment and proposed plan are explained in accessible, everyday language.</p></li><li><span>03</span><h3>Guidance for real life</h3><p>Practical movement support that considers your routine, environment and goals.</p></li></ol></div></section>`,
);

add(
  '/online-physiotherapy/',
  'Online physiotherapy',
  'Understand online physiotherapy with Eudora Movement House, from video assessment to personalised exercise guidance.',
  `${intro(
    'Care, wherever you are',
    'A little distance.<br><em>The same attention.</em>',
    'Online physiotherapy brings a conversation, guided movement assessment and practical exercise support to your own space.',
  )}<section class="wrap two-col section"><h2>Make room<br><em>for your care.</em></h2><div class="body-copy"><p>After your appointment is confirmed, we'll share instructions for joining your video consultation. Choose a quiet space with a stable connection, comfortable clothing and enough room to move.</p><p>You'll discuss your concerns, be guided through appropriate movements and receive advice tailored to your assessment.</p><div class="notice"><h3>What online care can't do</h3><p>A full physical examination and certain hands-on tests cannot be performed remotely. If your needs require an in-person assessment, we'll discuss that next step.</p></div>${button(
    'Request online care',
    '/contact/?type=online',
  )}</div></section>`,
);

add(
  '/areas/',
  'Home physiotherapy areas in Bengaluru',
  'Home physiotherapy in selected Bengaluru localities, including KR Puram, Indiranagar, Koramangala and surrounding areas.',
  `${intro(
    'Close to home',
    'Your neighbourhood.<br><em>Your familiar space.</em>',
    'Home physiotherapy across selected Bengaluru neighbourhoods, with appointments arranged personally.',
  )}<section class="wrap two-col section"><div><h2>Home visits<br><em>in Bengaluru.</em></h2><p>Tell us your locality when you get in touch. We'll confirm availability before scheduling your visit.</p><a href="https://www.google.com/maps/search/Bengaluru/" class="text-link" target="_blank" rel="noopener noreferrer">View Bengaluru on Google Maps ${arrow}</a><iframe class="area-map" title="Map of Bengaluru, the home-visit service city" src="https://maps.google.com/maps?q=Bengaluru&amp;z=11&amp;output=embed" loading="lazy" referrerpolicy="no-referrer"></iframe></div><ul class="area-list">${locations
    .map((x) => `<li>${x}<span aria-hidden="true">↗</span></li>`)
    .join(
      '',
    )}</ul></section><section class="soft-section section"><div class="wrap two-col"><h2>A different<br><em>postcode?</em></h2><div class="body-copy"><p>Ask us about your location, or explore online physiotherapy. Online care may be an option depending on your assessment and needs.</p><a href="/online-physiotherapy/" class="text-link">Explore online consultations ${arrow}</a></div></div></section>`,
);

add(
  '/faq/',
  'Frequently asked questions',
  'Answers to questions about home visits, online physiotherapy and booking at Eudora Movement House.',
  `${intro(
    'A little clarity',
    'Good questions.<br><em>Thoughtful answers.</em>',
    'A few practical things to know before your first consultation.',
  )}<section class="wrap faq-page section">${faqMarkup(faq.length)}</section>`,
);

add(
  '/testimonials/',
  'Patient voices',
  'Patient experiences at Eudora Movement House.',
  `${intro(
    'Patient voices',
    'Every journey<br><em>is personal.</em>',
    'This space is reserved for real experiences, shared with permission.',
  )}<section class="wrap section empty-state"><span class="quote-mark" aria-hidden="true">"</span><h2>Stories, <em>in time.</em></h2><p>Patient stories will appear here once they are ready to be shared. For now, get to know our approach and the person behind your care.</p><a class="text-link" href="/about/">Meet Varshini ${arrow}</a></section>`,
);

add(
  '/contact/',
  'Book a consultation',
  'Request a home or online physiotherapy consultation with Eudora Movement House. Appointments are confirmed personally.',
  `${intro(
    'Your next step',
    "Let's start with<br><em>a conversation.</em>",
    "Tell us a little about you. We'll get in touch to discuss your needs and confirm a suitable time.",
  )}<section class="wrap booking-section section"><aside class="contact-details">${eyebrow(
    'A direct line to us',
  )}<h3>Here when<br><em>you're ready.</em></h3><a href="tel:+917418158876">+91 74181 58876</a><a href="mailto:${email}">${email}</a><a class="text-link" href="${wa}" target="_blank" rel="noopener noreferrer">Message on WhatsApp ${arrow}</a><div class="hours">${eyebrow(
    'By appointment',
  )}<p>Monday–Saturday<br>7:00 AM–7:30 PM IST<br><span>Closed on Sundays</span></p></div><p class="small">Home visits in Bengaluru.<br>Online consultations available.</p></aside><form id="booking-form" class="booking-form"><div class="form-heading"><h2>A little <em>about you.</em></h2><p>All fields are required. Your preferred time is a request, not a confirmed appointment.</p></div><div class="form-grid"><label>Full name<input name="name" autocomplete="name" minlength="2" maxlength="100" required placeholder="Your name"></label><label>Age<input name="age" type="number" min="1" max="120" required placeholder="Age in years"></label><label>Contact number<input name="phone" type="tel" autocomplete="tel" maxlength="20" required placeholder="+91"></label><label>Locality / city<input name="location" autocomplete="address-level2" maxlength="120" minlength="2" required placeholder="Where are you based?"></label><fieldset class="full"><legend>How would you like to meet?</legend><div class="radio-options"><label><input type="radio" name="type" value="home" required checked> Home visit</label><label><input type="radio" name="type" value="online"> Online consultation</label></div></fieldset><label>Preferred date<input name="date" type="date" required></label><label>Preferred time <span class="muted">(IST)</span><select name="time" required><option value="">Choose a time</option><option>7:00 AM–10:00 AM</option><option>10:00 AM–1:00 PM</option><option>1:00 PM–4:00 PM</option><option>4:00 PM–7:30 PM</option></select></label></div><label class="consent"><input type="checkbox" name="consent" required><span>I agree to the <a href="/privacy/">Privacy Policy</a> and <a href="/terms/">Terms</a>, and consent to being contacted about this request.</span></label><div class="form-actions"><button class="button" type="submit">Request a consultation ${arrow}</button><p class="small">We'll confirm your appointment personally.</p></div><div class="form-status" role="status" aria-live="polite" tabindex="-1"></div><div class="request-fallback" hidden><p>Online requests are not available yet. You can prepare a WhatsApp message with these details, review it, and send it yourself.</p><a class="text-link" id="whatsapp-request" target="_blank" rel="noopener noreferrer">Review request in WhatsApp ${arrow}</a></div></form></section>`,
  { ctaShow: false },
);

add(
  '/feedback/',
  'Share your feedback',
  'Share feedback about your experience with Eudora Movement House.',
  `${intro(
    'After your session',
    'Your experience<br><em>matters.</em>',
    'Help us understand what felt useful and what we could do better. Feedback is private and is not published as a testimonial.',
  )}<section class="wrap section narrow"><form id="feedback-form" class="booking-form"><label>How was your experience?<select name="rating" required><option value="">Choose an option</option><option value="5">Very good</option><option value="4">Good</option><option value="3">Okay</option><option value="2">Could be better</option><option value="1">Poor</option></select></label><label>Your feedback<textarea name="message" rows="5" maxlength="2000" minlength="5" required placeholder="Please avoid including private medical details."></textarea></label><label class="consent"><input type="checkbox" name="consent" required><span>I consent to Eudora using this feedback to improve its service, as described in the <a href="/privacy/">Privacy Policy</a>.</span></label><button class="button" type="submit">Send feedback ${arrow}</button><div class="form-status" role="status" tabindex="-1"></div></form></section>`,
  { ctaShow: false },
);

add(
  '/privacy/',
  'Privacy Policy — review draft',
  'Draft privacy information for Eudora Movement House.',
  `${intro(
    'Privacy',
    'Your information.<br><em>Handled thoughtfully.</em>',
    'Review draft — final provider details, retention arrangements and policy approval are required before online requests are enabled.',
  )}<article class="wrap section prose"><h2>Information in consultation requests</h2><p>The planned request form collects your name, age, contact number, location, consultation preference and preferred date and time, together with your consent. Please do not include medical records or detailed health history in a general enquiry.</p><h2>Purpose and delivery</h2><p>Request details are intended to help Eudora respond and arrange a consultation. Once configured, a notification provider will receive those details to deliver them to the practitioner. The provider and its retention arrangements must be identified here before this form goes live.</p><h2>WhatsApp and email</h2><p>Choosing WhatsApp or email opens a separate service. You decide whether to send your message. Those services handle your information under their own policies.</p><h2>Feedback</h2><p>Feedback is intended for service improvement. It will not be displayed as a patient testimonial without separate permission.</p><h2>Contact</h2><p>For questions about your information, contact <a href="mailto:${email}">${email}</a>. Retention periods, deletion procedures and any additional production service providers remain to be finalised.</p></article>`,
  { ctaShow: false },
);

add(
  '/terms/',
  'Terms — review draft',
  'Draft consultation request terms for Eudora Movement House.',
  `${intro(
    'Terms',
    'A clear<br><em>starting point.</em>',
    'Review draft — service terms require final approval before online requests are enabled.',
  )}<article class="wrap section prose"><h2>Consultation requests</h2><p>Submitting a request does not confirm an appointment. Availability and timing are confirmed separately by the practitioner. Fees, cancellation and rescheduling arrangements should be discussed before confirming your appointment.</p><h2>Website information</h2><p>The website describes available services and is not an individual assessment or treatment plan. Recommendations depend on a consultation and your circumstances.</p><h2>Online consultations</h2><p>A full physical examination and certain hands-on tests cannot be performed remotely. An in-person assessment may be recommended.</p><h2>Contact</h2><p>For service questions, contact <a href="mailto:${email}">${email}</a> or call <a href="tel:+917418158876">+91 74181 58876</a>.</p></article>`,
  { ctaShow: false },
);

add(
  '/practitioner/',
  'Practitioner workspace',
  'Private practitioner tools for Eudora Movement House.',
  `${intro(
    'Practitioner workspace',
    'Care, put<br><em>into practice.</em>',
    'Create exercise charts and consultation summaries for your patients.',
  )}<section class="wrap section narrow" id="practitioner-login"><form id="login-form" class="booking-form"><label>Practitioner access key<input name="key" type="password" autocomplete="current-password" required></label><button class="button" type="submit">Open workspace ${arrow}</button><div class="form-status" role="status"></div></form></section><section id="practitioner-workspace" class="wrap section" hidden></section>`,
  { ctaShow: false, privatePage: true },
);

export { pages, nav, footer, cta };
