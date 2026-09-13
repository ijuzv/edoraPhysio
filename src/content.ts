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

const icon = (name: string): string => {
  const paths: Record<string, string> = {
    phone:
      '<path d="M6.6 3.7 4.4 5.9c-.6.6-.7 1.5-.3 2.3 2.4 4.8 6.2 8.6 11 11 .8.4 1.7.3 2.3-.3l2.2-2.2-4.1-3-1.3 1.3c-2.2-1.1-4-2.9-5.1-5.1l1.3-1.3-3.8-4.9Z"/>',
    message:
      '<path d="M4 5.8c0-1 .8-1.8 1.8-1.8h12.4c1 0 1.8.8 1.8 1.8v8.4c0 1-.8 1.8-1.8 1.8H9.4L5 20v-4.2H5.8A1.8 1.8 0 0 1 4 14V5.8Z"/><path d="M8 8.5h8M8 12h5"/>',
    calendar:
      '<path d="M6 4v3M18 4v3M4.5 8h15M6.2 5.5h11.6c1 0 1.7.7 1.7 1.7v10.6c0 1-.7 1.7-1.7 1.7H6.2c-1 0-1.7-.7-1.7-1.7V7.2c0-1 .7-1.7 1.7-1.7Z"/><path d="M8 12h3v3H8z"/>',
    shield:
      '<path d="M12 3.8 18.5 6v5.3c0 4-2.6 7.4-6.5 9-3.9-1.6-6.5-5-6.5-9V6L12 3.8Z"/><path d="m8.7 12.2 2.1 2.1 4.5-4.8"/>',
    video:
      '<path d="M5.8 7h8.5c1 0 1.7.7 1.7 1.7v6.6c0 1-.7 1.7-1.7 1.7H5.8c-1 0-1.8-.7-1.8-1.7V8.7c0-1 .8-1.7 1.8-1.7Z"/><path d="m16 10 4-2.2v8.4L16 14"/>',
    plan:
      '<path d="M7 4h10v16H7z"/><path d="M9.5 8h5M9.5 12h5M9.5 16h2.5"/>',
    heart:
      '<path d="M12 20s-7-4.3-7-10.2A3.8 3.8 0 0 1 12 7.7a3.8 3.8 0 0 1 7 2.1C19 15.7 12 20 12 20Z"/>',
    home:
      '<path d="m4 11 8-7 8 7"/><path d="M6.5 10v9h11v-9"/><path d="M10 19v-5h4v5"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
};

const iconCard = (name: string, title: string, text: string): string =>
  `<article class="icon-card"><span class="icon-mark">${icon(
    name,
  )}</span><h3>${title}</h3><p>${text}</p></article>`;

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
    'Our online services go beyond a one-time consultation. Through live video sessions, we support pain management, mobility, strength and better quality of life from the comfort of your home.',
  ],
  [
    'What should I have ready for my first session?',
    'Keep any relevant reports or previous treatment notes available. For online sessions, choose a quiet space with a stable internet connection and room to move safely.',
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
    'Pain management',
    'Understand the pain, address what contributes to it, and move forward with more confidence.',
    'pain',
  ],
  [
    '02',
    'Conditions we treat',
    'Support for concerns affecting the neck, back, shoulder, limbs, joints and everyday movement.',
    'conditions',
  ],
  [
    '03',
    'Injury, sports & post-surgical rehab',
    'Structured rehabilitation to recover, rebuild and return to daily activity, work or sport.',
    'rehabilitation',
  ],
  [
    '04',
    'Movement & strength',
    'Personalised programmes to build mobility, strength, balance and functional capacity.',
    'movement',
  ],
];

const homeCare: Array<[string, string, string, string]> = [
  [
    '01',
    'Musculoskeletal care',
    'Evidence-informed assessment and treatment for muscle, joint and spine conditions, helping reduce pain, restore mobility and improve everyday function.',
    'musculoskeletal',
  ],
  [
    '02',
    'Injury & sports rehabilitation',
    'Structured, progressive rehabilitation following injury or surgery, designed to rebuild strength and support a confident return to activity or sport.',
    'rehabilitation',
  ],
  [
    '03',
    'Movement & strength',
    'Personalised exercise programmes to improve mobility, stability, strength, balance and movement control for daily life, work, fitness or sport.',
    'movement',
  ],
  [
    '04',
    'Online physiotherapy',
    'One-to-one video sessions offering movement assessment, guided exercise, personalised recovery plans and regular progress reviews, wherever you are.',
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

const nav = `<header class="site-header"><div class="wrap header-inner"><a class="brand" href="/" aria-label="Eudora Movement House home">${brand}</a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">Menu <span aria-hidden="true">☰</span></button><nav id="main-nav" aria-label="Main navigation"><div class="nav-group"><a href="/services/">Our care</a><div class="nav-submenu"><a href="/services/#pain">Pain management</a><a href="/services/#conditions">Conditions we treat</a><a href="/services/#rehabilitation">Injury, sports & post-surgical rehabilitation</a><a href="/services/#movement">Movement & strength</a></div></div><a href="/about/">About</a><a href="/online-physiotherapy/">Online care</a><a href="/contact/" class="nav-book">Book a consultation ${arrow}</a></nav></div></header>`;

const footer = `<footer class="site-footer wrap"><div class="footer-top"><a class="brand" href="/" aria-label="Eudora Movement House home">${brand}</a><p class="footer-tagline">This is The Light After Recovery.</p><p class="footer-therapist"><strong>Varshini Balamurugan (PT)</strong><span>Musculoskeletal Physiotherapist</span></p><div><a href="tel:+917418158876">+91 74181 58876</a><a href="mailto:${email}">${email}</a></div></div><div class="footer-links"><a href="/why-eudora/">Why Eudora</a><a href="/areas/">Areas we serve</a><a href="/faq/">FAQs</a><a href="/feedback/">Share feedback</a></div><div class="footer-bottom"><p>© ${new Date().getFullYear()} Eudora Movement House</p><div><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/practitioner/">Practitioner</a></div><p>Bengaluru, India</p></div></footer><a class="whatsapp" href="${wa}" target="_blank" rel="noopener noreferrer" aria-label="Chat with Eudora on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8 7.5c-.9.7-.7 2.2.6 4s3.3 3.1 4.8 3.3c1.1.1 1.8-.5 2-1.3l-2-1.2-1 1c-1.5-.6-2.7-1.8-3.2-3l.8-.8-1-2Z"/></svg><span>Let's talk</span></a><div class="mobile-book">${button(
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

const pillarVisual = (src: string, alt: string): string =>
  `<figure class="pillar-visual"><img src="/assets/photos/${src}" alt="${alt}" loading="lazy"></figure>`;

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
  )}<h1>Move with<br><em>more ease.</em></h1></div><div class="hero-aside"><p class="hero-description">Personalised physiotherapy for pain relief, stronger movement and confident recovery—<strong>at home or online.</strong></p><div class="actions">${button(
    'Begin your recovery',
  )}<a class="text-link" href="/services/">Explore our care <span aria-hidden="true">↓</span></a></div><p class="hero-location"><span>${icon(
    'home',
  )}Bengaluru</span><span>${icon('heart')}Home visits</span><span>${icon(
    'video',
  )}Online consultations</span></p></div><div class="hero-bottom"><span>Care that begins with you.</span><a class="therapist-highlight" href="/about/"><strong>Varshini Balamurugan (PT)</strong><span>Musculoskeletal Physiotherapist</span>${arrow}</a></div></div></section>
<section class="wrap philosophy section"><div>${eyebrow(
    'A little more than treatment',
  )}<h2>Recovery is not<br><em>one-size-fits-all.</em></h2><div class="recovery-path-mark" aria-hidden="true"><svg viewBox="0 0 120 92"><path d="M12 74c23 0 22-55 48-55 24 0 21 55 48 55"/><path d="M60 19v52"/><path d="M47 33 60 19l13 14"/><circle cx="12" cy="74" r="4"/><circle cx="108" cy="74" r="4"/></svg></div></div><div class="body-copy"><p>At Eudora, physiotherapy is a conversation between where you are now and how you want to move next.</p><p>We believe recovery begins with feeling heard and grows through understanding, purposeful movement and consistent support.</p><p>By combining clinical expertise, evidence-informed care and personalised guidance, we help individuals rebuild strength, restore confidence and take an active role in their recovery.</p><p>For us, success is more than short-term relief. It is helping people move forward with greater freedom, independence and trust in their bodies.</p><p><strong>This is The Light After Recovery.</strong></p><a class="text-link" href="/why-eudora/">Find your way forward ${arrow}</a></div></section>
<section class="care-section section"><div class="wrap"><div class="section-heading"><div>${eyebrow(
    'How we can help',
  )}<h2>Care with<br><em>intention.</em></h2></div></div><div class="service-grid">${homeCare
    .map(
      ([n, title, desc, id]) => {
        const imageMap: Record<string, string> = {
          'musculoskeletal': 'photos/care-03.jpg',
          'rehabilitation': 'photos/care-02.jpg',
          'movement': 'photos/care-12.jpg',
          'online': 'photos/care-12.jpg',
        };
        const imageSrc = imageMap[id];
        const hrefMap: Record<string, string> = {
          'musculoskeletal': '/services/#conditions',
          'rehabilitation': '/services/#rehabilitation',
          'movement': '/services/#movement',
          'online': '/online-physiotherapy/',
        };
        return `<a class="service" href="${
          hrefMap[id]
        }"><img src="/assets/${imageSrc}" alt="${title}" class="service-image"><span class="service-number">${n}</span><h3>${title}</h3><p>${desc}</p><span class="service-arrow" aria-hidden="true">↗</span></a>`;
      }
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
  )}<h3>Bengaluru</h3><p>Home visits by appointment.<br>Online care, wherever you are.</p><a class="text-link" href="/areas/">Our neighbourhoods ${arrow}</a></aside></div></div></section>
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
    'Care that meets<br><em>you where you are.</em>',
    'Every plan begins with understanding what you are experiencing, what movement asks of your body, and what you want to return to with confidence.',
  )}<section class="wrap section image-story"><img src="/assets/photos/care-11.jpg" alt="Physiotherapist supporting a patient during a clinical assessment" class="story-image"><div>${eyebrow(
    'Care in practice',
  )}<h2>Guided with care.<br><em>Built around you.</em></h2><p>Real movement, careful assessment and practical rehabilitation shape the way Eudora supports pain, injury recovery and strength.</p></div></section><section class="wrap care-pillars section"><article id="pain" class="pillar-card"><span class="service-number">01 / Pain management</span><div><h2>Understand the pain.<br><em>Address what contributes.</em></h2><p>Pain is more than a symptom. We look at what may be contributing to it, address the factors we can influence, and help you move forward with confidence.</p>${pillarVisual(
    'care-24.jpg',
    'Hands-on physiotherapy support around the neck and upper body',
  )}<details><summary>Why addressing pain at the right time matters<span class="plus" aria-hidden="true"></span></summary><div class="pillar-more"><p>Injury, inflammation, tissue sensitivity, joint or muscle loading, sleep, stress, previous experiences and the way we move can all influence how pain is experienced.</p><p>This is why two people with similar conditions may experience pain very differently, and why effective pain management should look beyond the painful area alone.</p><p>Acute pain often serves a protective role after injury or irritation. When pain continues, movement may reduce, muscles can lose capacity, confidence can fall and everyday activities may gradually become harder.</p><p>At Eudora, the goal is not simply to temporarily reduce pain, but to understand what may be contributing to it and help you return to comfortable, confident movement.</p></div></details><details><summary>What can contribute to pain?<span class="plus" aria-hidden="true"></span></summary><div class="pillar-more"><ul class="condition-list compact-list"><li>Biological and biochemical factors</li><li>Biomechanical factors</li><li>Psychosocial factors</li></ul><p>These factors interact rather than existing separately, forming the basis of a modern biopsychosocial approach to pain management.</p></div></details><details><summary>How physiotherapy can help<span class="plus" aria-hidden="true"></span></summary><div class="pillar-more"><div class="therapy-list"><p><strong>Manual Therapy</strong> - hands-on techniques including joint and soft-tissue mobilisation to help improve movement and provide short-term symptom relief.</p><p><strong>Myofascial & Trigger-Point Release</strong> - targeted soft-tissue techniques used where muscle and myofascial sensitivity or restriction may be contributing to pain and movement limitations.</p><p><strong>Osteopathic Manipulative Techniques</strong> - selected mobilisation and manipulation techniques used to address musculoskeletal restrictions and improve movement where clinically appropriate.</p><p><strong>Dry Needling</strong> - when indicated, dry needling may be incorporated to address myofascial pain and trigger-point-related symptoms as part of a broader rehabilitation programme.</p><p><strong>Mobility & Stretching</strong> - individually selected movements can help restore comfortable range of motion, flexibility and movement confidence.</p><p><strong>Strengthening & Progressive Loading</strong> - gradually rebuilding muscle strength and tissue capacity helps prepare your body for the demands of everyday life, work and sport.</p></div><p>The emphasis is on combining symptom management with active rehabilitation, rather than depending on passive treatment alone.</p></div></details><details><summary>The Eudora approach<span class="plus" aria-hidden="true"></span></summary><div class="pillar-more"><ol class="approach-list"><li>We begin by understanding your pain, movement and goals.</li><li>We use appropriate hands-on treatment and pain-management strategies when they can help.</li><li>We restore movement and gradually build strength and capacity.</li><li>We give you the knowledge and tools to continue progressing beyond your sessions.</li></ol></div></details><details><summary>Pain management online<span class="plus" aria-hidden="true"></span></summary><div class="pillar-more"><p>Your recovery does not have to depend on distance. Through online sessions, we can provide movement assessment, pain education, guided mobility, personalised exercise, progressive strengthening and professionally guided self-release techniques.</p><p>Where appropriate, we can teach safe self-release strategies or guide simple assisted-release techniques with the help of a caregiver or family member.</p></div></details>${button(
    'Ask about pain',
  )}</div></article><article id="conditions" class="pillar-card"><span class="service-number">02 / Conditions we treat</span><div><h2>Care for the areas<br><em>that need attention.</em></h2><p>We support a wide range of musculoskeletal concerns affecting the spine, joints, muscles, tendons and everyday movement.</p>${pillarVisual(
    'care-17.jpg',
    'Physiotherapist assessing neck and upper back movement',
  )}<div class="condition-groups"><details open><summary>Neck pain<span class="plus" aria-hidden="true"></span></summary><p>Mechanical neck pain, cervical stiffness, muscle and myofascial pain, cervicogenic headache, postural or work-related neck pain, cervical degenerative disc disease, whiplash and thoracic outlet syndrome.</p></details><details><summary>Shoulder pain<span class="plus" aria-hidden="true"></span></summary><p>Rotator cuff tear, tendinopathy, frozen shoulder, impingement, shoulder instability, muscle strains, bicipital tendinitis and post-operative rehabilitation.</p></details><details><summary>Elbow, wrist & hand pain<span class="plus" aria-hidden="true"></span></summary><p>Tennis elbow, golfer's elbow, tendon-related pain, wrist sprain, De Quervain's tenosynovitis, carpal tunnel related symptoms, joint stiffness, sprains, strains and post-fracture rehabilitation.</p></details><details><summary>Back pain<span class="plus" aria-hidden="true"></span></summary><p>Upper and mid-back pain, thoracic stiffness, spondylolisthesis, low-back pain, osteoporosis-related concerns, sciatica or radiculopathy, disc herniation, coccydynia and degenerative conditions.</p></details><details><summary>Hip pain<span class="plus" aria-hidden="true"></span></summary><p>Hip osteoarthritis, gluteal tendinopathy, greater trochanteric pain, muscle strains, bursitis, piriformis syndrome and post-operative rehabilitation.</p></details><details><summary>Knee pain<span class="plus" aria-hidden="true"></span></summary><p>Knee osteoarthritis, patellofemoral pain, ACL and other ligament injuries, meniscal injuries, patellar tendinopathy, muscle and tendon injuries, post-operative knee rehabilitation and IT band syndrome.</p></details><details><summary>Foot & ankle pain<span class="plus" aria-hidden="true"></span></summary><p>Ankle sprains, Achilles tendinopathy, plantar fasciitis, foot and ankle stiffness, muscle and tendon injuries, post-fracture rehabilitation and return-to-running rehabilitation.</p></details></div>${button(
    'Ask about your condition',
  )}</div></article><article id="rehabilitation" class="pillar-card"><span class="service-number">03 / Injury, sports & post-surgical rehabilitation</span><div><h2>Recover. Rebuild.<br><em>Return.</em></h2><p>Recovery does not end when the pain settles. Rehabilitation helps restore the mobility, strength, control and physical capacity required for everyday life or sport.</p>${pillarVisual(
    'care-19.jpg',
    'Supported lower-limb rehabilitation on a treatment table',
  )}<details><summary>More about rehabilitation<span class="plus" aria-hidden="true"></span></summary><div class="pillar-more"><p>At Eudora, rehabilitation progresses according to your condition, stage of healing and individual goals, from early movement and symptom management through progressive strengthening and functional training.</p><p>For athletes and active individuals, rehabilitation can progress towards sport-specific strength, movement, balance, agility and graded return to training or sport.</p><p>Following surgery, rehabilitation is coordinated with your surgeon's precautions and recovery protocol where applicable.</p></div></details>${button(
    'Discuss your recovery',
  )}</div></article><article id="movement" class="pillar-card"><span class="service-number">04 / Movement and strength</span><div><h2>Move better.<br><em>Build capacity. Stay capable.</em></h2><p>Movement and strength are fundamental to maintaining independence, managing physical demands and returning to the activities you value.</p>${pillarVisual(
    'care-12.jpg',
    'Guided lower-limb mobility and stretching work',
  )}<details><summary>More about movement and strength<span class="plus" aria-hidden="true"></span></summary><div class="pillar-more"><p>Pain, injury, surgery or periods of reduced activity can lead to changes in mobility, muscle strength, balance, coordination, endurance and confidence in movement.</p><ul class="condition-list"><li>Mobility and flexibility</li><li>Strength</li><li>Balance and stability</li><li>Movement control</li><li>Endurance</li><li>Functional capacity</li><li>Exercise confidence</li><li>Return to everyday activity and sport</li></ul><p>Rather than exercising simply for the sake of exercising, we focus on building the physical capacity your life requires.</p></div></details>${button(
    'Find your starting point',
  )}</div></article></section><section class="soft-section section"><div class="wrap two-col"><h2>Your plan.<br><em>Your pace.</em></h2><div class="body-copy"><p>We begin with an assessment and explain the proposed approach in plain language. Your care may include movement education, exercises and appropriate hands-on treatment during home visits.</p><p>Online consultations offer guided assessment and exercise support when care from a distance is suitable for your needs.</p><div class="mini-actions">${iconCard(
    'calendar',
    'Appointment-led',
    'Every visit or video session is scheduled and confirmed personally.',
  )}${iconCard(
    'video',
    'Distance support',
    'Online care is used when guided assessment and exercise support are suitable.',
  )}</div><a href="/online-physiotherapy/" class="text-link">Explore online care ${arrow}</a></div></div></section>`,
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
  )}<h2>Varshini<br><em>Balamurugan.</em></h2><p class="qualification">MPT (Musculoskeletal Science) · BPT</p><div class="body-copy"><p>Varshini founded Eudora Movement House to offer physiotherapy that feels considered, personal and practical.</p><p>Her approach begins with listening: understanding how your concerns affect daily life and what you hope to do with greater ease. Assessment and movement guidance are shaped around those priorities.</p><p>She offers home visits across selected Bengaluru neighbourhoods and online consultations by appointment.</p></div><div class="mini-actions">${iconCard(
    'heart',
    'Personal care',
    'Time is given to understand your daily life, not just the painful area.',
  )}${iconCard(
    'shield',
    'Professional clarity',
    'Assessment, limits and next steps are explained before you begin.',
  )}</div><p class="membership">Member, Indian Association of Physiotherapists (IAP)</p>${button(
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
  )}<section class="wrap section two-col"><h2>Understood.<br><em>Not rushed.</em></h2><div class="body-copy"><p>We believe care should make room for the whole person: your questions, your routines and the things you want to return to.</p><p>Movement House reflects that idea—a practice centred on how you move through your life, with guidance you can understand and use.</p></div></section><section class="soft-section section"><div class="wrap"><div class="section-heading"><h2>What that looks like<br><em>in practice.</em></h2></div><div class="trust-strip in-section">${iconCard(
    'heart',
    'Space to be heard',
    'We start by understanding what brings you here and what matters to you.',
  )}${iconCard(
    'plan',
    'Clarity in your care',
    'Your assessment and proposed plan are explained in accessible, everyday language.',
  )}${iconCard(
    'shield',
    'Comprehensive care',
    'Support for pain, posture, injuries, sports and post-surgical rehabilitation.',
  )}${iconCard(
    'home',
    'Personalised care',
    'Each plan is shaped around your needs, setting and healthy goals.',
  )}</div></div></section>`,
);

add(
  '/online-physiotherapy/',
  'Online physiotherapy',
  'Understand online physiotherapy with Eudora Movement House, from video assessment to personalised exercise guidance.',
  `<section class="page-hero wrap online-hero"><div>${eyebrow(
    'Care, wherever you are',
  )}<h1>Your recovery doesn't have to<br><em>depend on distance.</em></h1><p class="lead">Whether you're managing pain, rebuilding after an injury or working towards moving with greater confidence, Eudora brings personalised physiotherapy guidance to wherever you are. The distance may be different. The attention to your recovery isn't.</p></div><img src="/assets/photos/care-18.jpg" alt="Physiotherapist supporting a patient during a guided movement review" class="story-image"></section><section class="soft-section section online-flow"><div class="wrap"><div class="section-heading"><div>${eyebrow(
    'How online care works',
  )}<h2>Guided care,<br><em>step by step.</em></h2></div><p>Each session is shaped around your symptoms, goals and the kind of support that can be offered safely through live video.</p></div><ol class="steps online-steps"><li><span>01</span><h3>Assessment</h3><p>We begin by understanding your symptoms, medical history, movement concerns and recovery goals, followed by a guided virtual movement assessment where appropriate.</p></li><li><span>02</span><h3>Pain & movement support</h3><p>Your session may include guided mobility, movement strategies and self-release techniques to help manage pain, stiffness and muscle tension.</p></li><li><span>03</span><h3>Personalised rehabilitation</h3><p>You receive an individualised programme that may include mobility, strengthening, flexibility, movement retraining and functional exercises based on your assessment and goals.</p></li><li><span>04</span><h3>Guided sessions</h3><p>Your physiotherapist observes your movement, guides exercise technique and helps you understand how to perform your programme safely and effectively.</p></li><li><span>05</span><h3>Progress & follow-up</h3><p>Your progress is reviewed over time, with exercises and strategies adjusted as you improve—providing continued guidance beyond a single consultation.</p></li></ol></div></section><section class="wrap section two-col online-panel online-benefit-panel"><div>${eyebrow(
    'Who can benefit',
  )}<h2>Who can<br><em>benefit?</em></h2></div><div class="body-copy"><p>Online physiotherapy can be helpful for people managing musculoskeletal pain or stiffness, sports injuries, reduced mobility or strength, post-operative rehabilitation, persistent pain, arthritis-related movement difficulties, or continued rehabilitation when regular travel is difficult.</p></div></section><section class="soft-section section online-why-panel"><div class="wrap two-col"><div class="body-copy"><p>Receive personalised care from your own space, with professional assessment, pain-management strategies, guided self-release, individualised exercises and ongoing rehabilitation support.</p><div class="mini-actions">${iconCard(
    'video',
    'Live video',
    'Your movement can be reviewed and guided in real time.',
  )}${iconCard(
    'plan',
    'Exercise plan',
    'Your programme is progressed based on symptoms and goals.',
  )}</div><a href="/services/" class="text-link">Explore all care options ${arrow}</a></div><div><h2>Why online<br><em>physiotherapy?</em></h2></div></div></section>`,
);

add(
  '/areas/',
  'Home physiotherapy areas in Bengaluru',
  'Home physiotherapy in selected Bengaluru localities, including KR Puram, Indiranagar, Koramangala and surrounding areas.',
  `${intro(
    'Close to home',
    'Your neighbourhood.<br><em>Your familiar space.</em>',
    'Home physiotherapy across selected Bengaluru neighbourhoods, with appointments arranged personally.',
  )}<section class="wrap two-col section"><div><h2>Home visits<br><em>in Bengaluru.</em></h2><p>Tell us your locality when you get in touch. We'll confirm availability before scheduling your visit.</p><a href="https://www.google.com/maps/search/Bengaluru/" class="text-link" target="_blank" rel="noopener noreferrer">View Bengaluru on Google Maps ${arrow}</a><iframe class="area-map" title="Map of Bengaluru, the home-visit service city" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248067.50598690342!2d77.50961057910156!3d13.193488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae173662d799cd%3A0x3e6537cdfb28db49!2sBengaluru!5e0!3m2!1sen!2sin!4v1234567890" loading="lazy" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe></div><ul class="area-list">${locations
    .map((x) => `<li><a href="https://www.google.com/maps/search/${encodeURIComponent(x)}+Bengaluru/" target="_blank" rel="noopener noreferrer">${x}<span aria-hidden="true">↗</span></a></li>`)
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
  '/contact/',
  'Book a consultation',
  'Request a home or online physiotherapy consultation with Eudora Movement House. Appointments are confirmed personally.',
  `${intro(
    'Your next step',
    "Let's start with<br><em>a conversation.</em>",
    "Tell us a little about you. We'll get in touch to discuss your needs and confirm a suitable time.",
  )}<section class="wrap booking-section section"><aside class="contact-details">${eyebrow(
    'A direct line to us',
  )}<h3>Here when<br><em>you're ready.</em></h3><div class="contact-methods"><a href="tel:+917418158876"><span class="icon-mark">${icon(
    'phone',
  )}</span><strong>Call</strong><small>+91 74181 58876</small></a><a href="${wa}" target="_blank" rel="noopener noreferrer"><span class="icon-mark">${icon(
    'message',
  )}</span><strong>WhatsApp</strong><small>Message Eudora directly</small></a><a href="mailto:${email}"><span class="icon-mark">${icon(
    'calendar',
  )}</span><strong>Email</strong><small>${email}</small></a></div><div class="hours">${eyebrow(
    'By appointment',
  )}<p>Monday–Saturday<br>7:00 AM–7:30 PM IST<br><span>Closed on Sundays</span></p></div><div class="contact-note"><span class="icon-mark">${icon(
    'shield',
  )}</span><p class="small">Home visits in Bengaluru. Online consultations available. We confirm requests personally before an appointment is set.</p></div></aside><form id="booking-form" class="booking-form"><div class="form-heading"><h2>A little <em>about you.</em></h2><p>All fields are required. Your preferred time is a request, not a confirmed appointment.</p></div><div class="form-grid"><label>Full name<input name="name" autocomplete="name" minlength="2" maxlength="100" required placeholder="Your name"></label><label>Age<input name="age" type="number" min="1" max="120" required placeholder="Age in years"></label><label>Contact number<input name="phone" type="tel" autocomplete="tel" maxlength="20" required placeholder="+91"></label><label>Locality / city<input name="location" autocomplete="address-level2" maxlength="120" minlength="2" required placeholder="Where are you based?"></label><fieldset class="full"><legend>How would you like to meet?</legend><div class="radio-options"><label><input type="radio" name="type" value="home" required checked> Home visit</label><label><input type="radio" name="type" value="online"> Online consultation</label></div></fieldset><label>Preferred date<input name="date" type="date" required></label><label>Preferred time <span class="muted">(IST)</span><select name="time" required><option value="">Choose a time</option><option>7:00 AM–10:00 AM</option><option>10:00 AM–1:00 PM</option><option>1:00 PM–4:00 PM</option><option>4:00 PM–7:30 PM</option></select></label></div><label class="consent"><input type="checkbox" name="consent" required><span>I agree to the <a href="/privacy/">Privacy Policy</a> and <a href="/terms/">Terms</a>, and consent to being contacted about this request.</span></label><div class="form-actions"><button class="button" type="submit">Request a consultation ${arrow}</button><p class="small">We'll confirm your appointment personally.</p></div><div class="form-status" role="status" aria-live="polite" tabindex="-1"></div><div class="request-fallback" hidden><p>Online requests are not available yet. You can prepare a WhatsApp message with these details, review it, and send it yourself.</p><a class="text-link" id="whatsapp-request" target="_blank" rel="noopener noreferrer">Review request in WhatsApp ${arrow}</a></div></form></section>`,
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
