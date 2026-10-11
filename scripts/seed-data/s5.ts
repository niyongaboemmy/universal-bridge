// S5 draft content: labs, insights, events, leadership, about, legal. For UB review.
import { lexical } from "./lexical";

type L = { en: string; fr?: string; rw?: string };
const cta = (en: string, fr: string, rw: string, href: string) => ({ label: { en, fr, rw }, href });

export const hubs = [
  {
    slug: "coding-hub",
    order: 10,
    icon: "code",
    cover: "coding-hub",
    name: { en: "Coding Hub", fr: "Coding Hub", rw: "Coding Hub" },
    tagline: { en: "Web, mobile and cloud.", fr: "Web, mobile et cloud." },
    summary: { en: "Web, mobile and cloud software.", fr: "Logiciels web, mobile et cloud." },
    focusAreas: [
      {
        icon: "code",
        title: { en: "Web platforms" },
        body: { en: "Fast, accessible web apps with Next.js and Node.js." },
      },
      {
        icon: "smartphone",
        title: { en: "Mobile apps" },
        body: { en: "Apps for low-end Android." },
      },
      {
        icon: "cloud",
        title: { en: "Cloud & DevOps" },
        body: { en: "CI/CD, monitoring and in-country hosting." },
      },
    ],
    equipment: [
      { text: { en: "Pair-programming stations" } },
      { text: { en: "Device lab of Android and iOS phones" } },
      { text: { en: "Staging cloud environment" } },
    ],
    projects: [
      {
        title: { en: "Nyambika Design marketplace" },
        body: { en: "Our live clothing marketplace." },
        status: "live",
      },
    ],
  },
  {
    slug: "ai-innovations-hub",
    order: 20,
    icon: "brain",
    cover: "ai-hub",
    name: { en: "AI Innovations Hub", fr: "AI Innovations Hub", rw: "AI Innovations Hub" },
    tagline: {
      en: "Assistants, computer vision and analytics, built responsibly.",
      fr: "Assistants, vision par ordinateur et analytique, de façon responsable.",
    },
    summary: {
      en: "AI that genuinely saves time.",
      fr: "Une IA qui fait vraiment gagner du temps.",
    },
    focusAreas: [
      {
        icon: "brain",
        title: { en: "Assistants" },
        body: { en: "Assistants grounded in your content." },
      },
      {
        icon: "badge-check",
        title: { en: "Computer vision" },
        body: { en: "Counting, inspection and recognition from photos." },
      },
      {
        icon: "rocket",
        title: { en: "Forecasting" },
        body: { en: "Demand and cash-flow forecasts for SMEs and co-ops." },
      },
    ],
    equipment: [
      { text: { en: "GPU workstations" } },
      { text: { en: "Labelled local datasets (with consent)" } },
    ],
    projects: [
      {
        title: { en: "Document assistant prototype" },
        body: { en: "Answers questions from an organisation's policies and manuals." },
        status: "prototype",
      },
      {
        title: { en: "Crop price forecasting" },
        body: { en: "Exploring weekly price forecasts for cooperatives." },
        status: "exploring",
      },
    ],
  },
  {
    slug: "embedded-systems-hub",
    order: 30,
    icon: "cpu",
    cover: "robotics-hub",
    name: { en: "Embedded Systems Hub", fr: "Embedded Systems Hub", rw: "Embedded Systems Hub" },
    tagline: {
      en: "Sensors, drones, robots and IoT prototypes.",
      fr: "Capteurs, drones, robots et prototypes IoT.",
    },
    summary: { en: "Hardware, from breadboard to field.", fr: "Du prototype au terrain." },
    focusAreas: [
      {
        icon: "sprout",
        title: { en: "Field sensors" },
        body: { en: "Soil, water and weather monitoring with SMS alerts." },
      },
      {
        icon: "rocket",
        title: { en: "Drones" },
        body: { en: "Mapping and inspection experiments." },
      },
      {
        icon: "cpu",
        title: { en: "Robotics" },
        body: { en: "Small robots for teaching and research." },
      },
    ],
    equipment: [
      { text: { en: "ESP32 and Arduino kits" } },
      { text: { en: "Raspberry Pi cluster" } },
      { text: { en: "Soldering and test bench" } },
      { text: { en: "3D printer" } },
    ],
    projects: [
      {
        title: { en: "Soil-moisture node" },
        body: { en: "Low-power sensor with SMS alerts for small farms." },
        status: "pilot",
      },
    ],
  },
];

export const categories = [
  {
    slug: "engineering",
    order: 10,
    title: { en: "Engineering", fr: "Ingénierie", rw: "Ubwubatsi" },
  },
  { slug: "business", order: 20, title: { en: "Business", fr: "Entreprise", rw: "Ubucuruzi" } },
  { slug: "academy", order: 30, title: { en: "Academy", fr: "Académie", rw: "Ishuri" } },
];

export const posts = [
  {
    slug: "building-web-apps-for-3g",
    category: "engineering",
    featured: true,
    publishedAt: "2026-09-18",
    title: { en: "Building web apps that work on 3G and a mid-range Android" },
    excerpt: {
      en: "Most of our users are on mid-range phones and patchy networks. Here is the checklist we use so every page loads in seconds.",
    },
    body: {
      en: `Most people who use the software we build in Rwanda are on a mid-range Android phone, often on 3G or a busy 4G network. If a page needs ten seconds to become usable, many of them simply leave. So we design for that phone first.
## Start with a budget
Every page has a JavaScript budget, measured in CI on the production build. If a change pushes a page over the limit, the build fails. It is much easier to stay fast than to become fast later.
## Render on the server
Text, images and buttons arrive as HTML. The page is readable and usable before any JavaScript runs. Interactive parts load as small islands.
## Forms that survive bad networks
- Forms submit even if JavaScript has not loaded yet.
- Drafts are saved on the device, so a dropped connection does not lose an application.
- Errors are shown next to each field and summarised at the top.
## Test on the real phone
Emulators help, but nothing replaces a real mid-range phone on a real network. We keep a small device lab in the Coding Hub and test every release on it.`,
    },
  },
  {
    slug: "rwanda-data-protection-law-software",
    category: "business",
    publishedAt: "2026-08-27",
    title: { en: "What Rwanda's data protection law means for your software" },
    excerpt: {
      en: "Law No. 058/2021 changes how organisations collect, store and share personal data. A practical summary for product owners — not legal advice.",
    },
    body: {
      en: `Rwanda's Law No. 058/2021 on the protection of personal data and privacy applies to any organisation that processes personal data of people in Rwanda. This is a practical summary for product teams; always confirm details with a legal adviser.
## Register as a data controller
Organisations that process personal data register with the National Cyber Security Authority (NCSA).
## Keep data in Rwanda — or get authorisation
Personal data must be stored in Rwanda unless the NCSA authorises storage abroad. This affects where your database and file storage live.
## Collect less, and ask clearly
- Only collect what you need for a stated purpose.
- Ask for consent in plain language, with an unticked box.
- Record what people agreed to, and when.
## Be ready for requests and incidents
People can ask to see, correct or delete their data. And a personal-data breach must be reported to the NCSA within 48 hours of becoming aware of it. Build the tools for both before you launch, not after.`,
    },
  },
  {
    slug: "kigali-nearshore-software-teams",
    category: "business",
    publishedAt: "2026-07-30",
    title: { en: "Why Kigali works for European and Gulf software teams" },
    excerpt: {
      en: "Full working-day overlap with Europe, three working languages and a fast-growing tech ecosystem.",
    },
    body: {
      en: `When companies in Europe and the Gulf look for a delivery partner, time zone and communication matter as much as price.
## The same working day
Kigali is UTC+2 all year, with no daylight-saving changes. That means a full overlap with central European working hours and a large overlap with the Gulf. Stand-ups, reviews and demos happen in normal hours on both sides.
## Three working languages
Our teams work in English and French, and in Kinyarwanda with local users.
## An ecosystem that is growing
Rwanda has invested heavily in connectivity and in Kigali Innovation City, and new engineers graduate every year. Through UB Academy we train some of them ourselves.
## How to start
The best first step is a small, well-defined project. You see how we work, and we learn your product, before anyone commits to a larger team.`,
    },
  },
  {
    slug: "hiring-your-first-junior-developer",
    category: "academy",
    publishedAt: "2026-06-19",
    title: { en: "Hiring your first junior developer: lessons from UB Academy" },
    excerpt: {
      en: "What we look for when interns join our teams, and how small companies can help juniors succeed in their first months.",
    },
    body: {
      en: `Many of the developers we work with started as interns. Here is what we have learned about helping juniors succeed.
## Look for learning, not just knowledge
A portfolio project that the candidate can explain line by line tells you more than a list of frameworks.
## Give them a real project and a mentor
- One clear project with a real user.
- A named mentor and a weekly check-in.
- Small, frequent reviews instead of one big one at the end.
## Make progress visible
We ask interns to demo every two weeks. It builds confidence and catches problems early.
## Verify certificates
Every UB internship and training certificate has a code and a QR code. Employers can check it in seconds at universalbridge.rw/academy/verify.`,
    },
  },
];

/** The 2024 hackathon (SRS §2.1). The exact dates are not in the brief: published in development only until UB confirms them. */
export const events = [
  {
    slug: "ub-hackathon-2024",
    kind: "hackathon",
    cover: "hackathon",
    startAt: "2024-11-16T07:00:00.000Z",
    endAt: "2024-11-17T15:00:00.000Z",
    title: { en: "UB Hackathon 2024", fr: "UB Hackathon 2024", rw: "UB Hackathon 2024" },
    summary: {
      en: "Students built and demoed projects.",
      fr: "Des étudiants ont créé et présenté des projets.",
    },
    venue: { online: false, name: "Universal Bridge", address: "Maison Voisin Building, Kigali" },
    registration: { open: false, teams: true },
  },
];

/** Development-only upcoming event, so registration can be tested. */
export function sampleEvent(now = new Date()) {
  const start = new Date(now.getTime() + 21 * 86_400_000);
  start.setUTCHours(7, 0, 0, 0);
  return {
    slug: "sample-build-night",
    kind: "meetup",
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3 * 3_600_000).toISOString(),
    title: { en: "Sample event — Build Night" },
    summary: { en: "Development sample event used to test registration. Not shown in production." },
    venue: { online: false, name: "Universal Bridge", address: "Maison Voisin Building, Kigali" },
    agenda: [
      { time: "09:00", title: { en: "Welcome" } },
      { time: "09:30", title: { en: "Build" } },
      { time: "11:30", title: { en: "Demos" } },
    ],
    registration: { open: true, teams: true, capacity: 60 },
  };
}

/** From the current website (SRS §2.1). Confirm before launch (OI-11). */
export const leadership = [
  {
    name: "Emmanuel Niyongabo",
    order: 10,
    title: { en: "Managing Director", fr: "Directeur général", rw: "Umuyobozi Mukuru" },
  },
  {
    name: "Joseph Shyirambere",
    order: 20,
    title: {
      en: "Chief Technology Officer",
      fr: "Directeur technique",
      rw: "Umuyobozi w'Ikoranabuhanga",
    },
  },
  {
    name: "Aristide Tuyisenge",
    order: 30,
    title: { en: "Product Manager", fr: "Chef de produit", rw: "Umuyobozi w'Ibicuruzwa" },
  },
  {
    name: "Jeanne Beula Nzabihimana",
    order: 40,
    title: { en: "Marketing Officer", fr: "Responsable marketing", rw: "Ushinzwe Kwamamaza" },
  },
  {
    name: "Patrick Ishimwe",
    order: 50,
    title: { en: "HR Manager", fr: "Responsable RH", rw: "Umuyobozi w'Abakozi" },
  },
];

export const s5Pages = {
  labs: {
    title: { en: "Labs", fr: "Labs", rw: "Laboratwari" },
    seo: {
      description: {
        en: "Universal Bridge innovation hubs: Coding, AI Innovations and Embedded Systems.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: { en: "OUR LABS", fr: "NOS LABS", rw: "LABORATWARI ZACU" },
        title: {
          en: "Where new ideas get *built*.",
          fr: "Là où les idées *prennent forme*.",
          rw: "Aho ibitekerezo bishya *byubakirwa*.",
        },
        lead: {
          en: "Three hubs where we prototype what's next.",
          fr: "Trois hubs où nous prototypons l'avenir.",
        },
        primary: cta(
          "Collaborate with us",
          "Collaborer avec nous",
          "Korana natwe",
          "/contact?topic=partnerships",
        ),
        media: "robotics-hub",
      },
    ],
  },
  about: {
    title: { en: "About", fr: "À propos", rw: "Abo turi bo" },
    seo: {
      description: {
        en: "Universal Bridge Ltd: a software and technology company founded in Kigali in 2019. Our story, mission and values.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: { en: "ABOUT US", fr: "À PROPOS", rw: "ABO TURI BO" },
        title: {
          en: "Technology that connects people and *opportunities*.",
          fr: "Une technologie qui relie les personnes et les *opportunités*.",
          rw: "Ikoranabuhanga rihuza abantu n'*amahirwe*.",
        },
        lead: {
          en: "Real problems, solved with software. Since 2019.",
          fr: "De vrais problèmes, résolus par le logiciel. Depuis 2019.",
        },
        media: "office-reception",
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "WHAT DRIVES US", fr: "CE QUI NOUS ANIME", rw: "IBITUYOBORA" },
        title: { en: "Mission and values", fr: "Mission et valeurs", rw: "Intego n'indangagaciro" },
        cards: [
          {
            icon: "compass",
            title: { en: "Mission", fr: "Mission", rw: "Intego" },
            body: { en: "Technology people can use.", fr: "Une technologie utilisable par tous." },
          },
          {
            icon: "badge-check",
            title: { en: "Proof over promises", fr: "Des preuves, pas des promesses" },
            body: { en: "Verified results only.", fr: "Des résultats vérifiés uniquement." },
          },
          {
            icon: "users",
            title: { en: "People first", fr: "L'humain d'abord" },
            body: { en: "Accessible, clear, private.", fr: "Accessible, clair, respectueux." },
          },
          {
            icon: "graduation-cap",
            title: { en: "Always learning", fr: "Toujours apprendre" },
            body: {
              en: "We teach what we practise.",
              fr: "Nous enseignons ce que nous pratiquons.",
            },
          },
        ],
      },
      {
        blockType: "timeline",
        eyebrow: { en: "OUR STORY", fr: "NOTRE HISTOIRE", rw: "AMATEKA YACU" },
        title: {
          en: "From a Kigali office to a regional partner",
          fr: "D'un bureau à Kigali à un partenaire régional",
        },
        items: [
          {
            year: "2019",
            title: {
              en: "Universal Bridge is founded in Kigali",
              fr: "Création d'Universal Bridge à Kigali",
            },
            body: { en: "Software, IT support and training." },
          },
          {
            year: "2024",
            title: { en: "UB Hackathon", fr: "UB Hackathon" },
            body: { en: "Students build and demo projects." },
          },
          {
            year: "2026",
            title: { en: "Labs and a new platform", fr: "Labs et nouvelle plateforme" },
            body: { en: "Three hubs and this website." },
          },
        ],
      },
      {
        blockType: "globalReach",
        eyebrow: { en: "WHY RWANDA", fr: "POURQUOI LE RWANDA", rw: "KUKI U RWANDA" },
        title: {
          en: "Built in Kigali. *Delivering* worldwide.",
          fr: "Conçu à Kigali. *Livré* dans le monde entier.",
          rw: "Byubakiwe i Kigali. *Bigera* ku isi yose.",
        },
        lead: {
          en: "Africa's connected tech hub, in your time zone.",
          fr: "Un hub tech africain, à votre heure.",
        },
        points: [
          { title: { en: "UTC+2, all year" }, body: { en: "Full overlap with Europe." } },
          { title: { en: "Three languages" }, body: { en: "English, French, Kinyarwanda." } },
          { title: { en: "Data protection" }, body: { en: "Rwanda's Law 058/2021 and GDPR." } },
          { title: { en: "Kigali Innovation City" }, body: { en: "A fast-growing ecosystem." } },
        ],
      },
      {
        blockType: "ctaBand",
        title: {
          en: "Meet the people behind Universal Bridge.",
          fr: "Rencontrez l'équipe d'Universal Bridge.",
        },
        primary: cta("Leadership", "Direction", "Ubuyobozi", "/company/leadership"),
        secondary: cta("Careers", "Carrières", "Akazi", "/company/careers"),
      },
    ],
  },
};

const legal = (title: L, en: string) => ({
  title,
  layout: [{ blockType: "richText", content: { en: lexical(en) } }],
});

/** Drafts for review by a Rwandan legal adviser (SRS §13.4) — not legal advice. */
export const legalPages = {
  "legal-privacy": legal(
    { en: "Privacy policy", fr: "Politique de confidentialité", rw: "Politiki y'ibanga" },
    `This policy explains how Universal Bridge Ltd ("we") collects and uses personal data through universalbridge.rw. We follow Rwanda's Law No. 058/2021 on the protection of personal data and privacy, and the GDPR for visitors in the European Union.
## Who we are
Universal Bridge Ltd, 1st floor, Maison Voisin Building, 11 KN 89 St, Kigali, Rwanda. Contact us about privacy at hello@universalbridge.rw.
## What we collect and why
- **Enquiries** (contact and demo forms): your name, email, company, country, optional phone and your message, to reply to you. Legal basis: your consent.
- **Applications** (Academy, internships, jobs, partners, events): the answers and documents you send, to assess your application. Legal basis: your consent and steps before a contract.
- **Newsletter**: your email and language, only after you confirm your subscription.
- **Analytics**: visit statistics (Google Analytics, and Plausible where enabled), only if you agree in the cookie banner. Google Analytics uses cookies and a pseudonymous identifier; we turn off its advertising features and Google signals.
We store the wording and version of the consent you gave, and when.
## How long we keep it
- Enquiries: 24 months after our last contact.
- Unsuccessful applications and CVs: 12 months.
- Certificates: permanently, so they can be verified.
Expired records are deleted automatically every month.
## Who processes data for us
These providers process data on our behalf under contract: Vercel (website hosting), Google (Google Analytics, only with your consent), Resend (email delivery), Sentry (error monitoring) and Cloudflare Turnstile (bot protection). Where data leaves Rwanda, we rely on NCSA authorisation and contractual safeguards. Personal data is stored in Rwanda unless the National Cyber Security Authority (NCSA) authorises storage elsewhere.
## Your rights
You can ask to access, correct or delete your data, or object to how we use it. Email hello@universalbridge.rw and we will reply within the legal deadline. You can also complain to the NCSA.
## Security
Uploads are stored privately and checked for viruses; staff access is limited by role and logged. If a breach affects your data, we notify the NCSA within 48 hours and inform you where required.`,
  ),
  "legal-cookies": legal(
    { en: "Cookie policy", fr: "Politique relative aux cookies", rw: "Politiki ya cookies" },
    `We keep cookies and similar storage to a minimum.
## Essential
- **Language** (UB_LOCALE): remembers the language you chose.
- **Theme and preferences**: stored on your device (local storage).
- **Security**: bot protection on forms (Cloudflare Turnstile).
These are needed for the site to work and are always on.
## Optional
- **Google Analytics** (_ga, _ga_*): counts visits and the pages people read, for up to 2 years. Advertising features and Google signals are off.
- **Plausible** (where enabled): counts visits without cookies and without identifying you.
Both load only if you choose "Accept" in the cookie banner. If you later reject, Google Analytics stops at once and its cookies are deleted.
## Changing your choice
Use "Cookie settings" at the bottom of any page. Rejecting is as easy as accepting.`,
  ),
  "legal-terms": legal(
    { en: "Terms of use", fr: "Conditions d'utilisation", rw: "Amabwiriza y'ikoreshwa" },
    `These terms apply to your use of universalbridge.rw.
## Content
The content on this site is for general information. We work to keep it accurate; figures show the date they were verified.
## Acceptable use
Don't misuse the site: no attempts to break security, overload forms or send unlawful content.
## Intellectual property
The Universal Bridge name and logo, and the site's content, belong to Universal Bridge Ltd. Press may use the logo files from the press page without changing them.
## Links
We link to other sites, such as our products. We are not responsible for their content.
## Law
These terms are governed by the laws of Rwanda.`,
  ),
  "legal-accessibility": legal(
    {
      en: "Accessibility statement",
      fr: "Déclaration d'accessibilité",
      rw: "Uburyo bworohereza bose",
    },
    `We want everyone to be able to use this website, including people who use a screen reader, a keyboard, magnification or reduced motion.
## Our standard
We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. Every page is checked automatically before release, in light and dark themes.
## What you can expect
- Full keyboard use, with visible focus.
- Forms that work without JavaScript and explain errors clearly.
- Reduced motion and reduced transparency are respected.
- English, French and Kinyarwanda versions of core pages.
## Known limitations
Some decorative animations and the globe are not available to screen readers; the same information is provided as text next to them.
## Feedback
If something doesn't work for you, email hello@universalbridge.rw and we will help you get the information another way.`,
  ),
  "legal-academy-terms": legal(
    { en: "Academy terms", fr: "Conditions de l'Académie", rw: "Amabwiriza y'Ishuri" },
    `These terms apply to UB Academy programs and internships.
## Applications and places
Places are limited. When an intake is full, new applicants join a waitlist and are contacted if a place opens.
## Fees and refunds
Fees are shown on each program page. Payment terms and any refunds are confirmed in writing when you are accepted.
## Conduct
We expect respect for fellow learners, staff and equipment. Serious misconduct can lead to removal from a program.
## Certificates
Certificates are issued when you complete a program's requirements. Each has a unique code and QR code that anyone can verify. Certificates issued in error may be revoked.
## Minors
Applicants under 18 need the agreement of a parent or guardian.`,
  ),
};
