// Draft Academy, careers and partner content (SRS §6.8–6.9, CNT-03). For UB review.
type L = { en: string; fr?: string; rw?: string };
const cta = (en: string, fr: string, rw: string, href: string) => ({ label: { en, fr, rw }, href });

const lines = (...xs: string[]) => xs.join("\n");

export const programs = [
  {
    slug: "full-stack-web-development",
    order: 10,
    category: "coding",
    mode: "hybrid",
    level: "beginner",
    icon: "code",
    durationWeeks: 12,
    hoursPerWeek: 8,
    title: {
      en: "Full-Stack Web Development",
      fr: "Développement web full-stack",
      rw: "Gukora imbuga za interineti",
    },
    summary: {
      en: "Ship real web apps with React and Node.",
      fr: "Créez et déployez de vraies applications web avec React et Node.js.",
      rw: "Kubaka no gushyira ku murongo imbuga nyazo ukoresheje React na Node.js.",
    },
    schedule: {
      en: "Tue & Thu evenings + Saturday morning",
      fr: "Mardi et jeudi soir + samedi matin",
    },
    location: {
      en: "Online and at UB, Maison Voisin Building, Kigali",
      fr: "En ligne et chez UB, Maison Voisin Building, Kigali",
    },
    fee: { isFree: false, currency: "RWF" },
    outcomes: [
      {
        text: {
          en: "Build responsive, accessible websites",
          fr: "Créer des sites accessibles et responsives",
        },
      },
      {
        text: {
          en: "Create interactive interfaces with React",
          fr: "Créer des interfaces interactives avec React",
        },
      },
      {
        text: {
          en: "Write APIs with Node.js and a database",
          fr: "Écrire des API avec Node.js et une base de données",
        },
      },
      {
        text: {
          en: "Deploy and present a portfolio project",
          fr: "Déployer et présenter un projet de portfolio",
        },
      },
    ],
    prerequisites: [
      {
        text: {
          en: "Comfortable using a computer and the internet",
          fr: "À l'aise avec un ordinateur et Internet",
        },
      },
      {
        text: { en: "A laptop for practice at home", fr: "Un ordinateur portable pour pratiquer" },
      },
    ],
    curriculum: [
      {
        module: { en: "Web foundations: HTML, CSS and accessibility" },
        weeks: "Weeks 1–3",
        topics: {
          en: lines(
            "How the web works",
            "Semantic HTML",
            "CSS layout with flexbox and grid",
            "Accessibility basics",
          ),
        },
      },
      {
        module: { en: "JavaScript" },
        weeks: "Weeks 4–6",
        topics: {
          en: lines(
            "Variables, functions and objects",
            "The DOM and events",
            "Fetching data from APIs",
          ),
        },
      },
      {
        module: { en: "React" },
        weeks: "Weeks 7–9",
        topics: { en: lines("Components and props", "State and forms", "Routing") },
      },
      {
        module: { en: "Back end and deployment" },
        weeks: "Weeks 10–12",
        topics: {
          en: lines(
            "Node.js and Express",
            "PostgreSQL basics",
            "Deploying to the cloud",
            "Final project demo",
          ),
        },
      },
    ],
  },
  {
    slug: "ui-ux-graphic-design",
    order: 20,
    category: "design",
    mode: "online",
    level: "beginner",
    icon: "palette",
    durationWeeks: 8,
    hoursPerWeek: 6,
    title: {
      en: "UI/UX & Graphic Design",
      fr: "UI/UX et design graphique",
      rw: "Igishushanyo cya UI/UX",
    },
    summary: {
      en: "Design interfaces in Figma.",
      fr: "Concevez des interfaces dans Figma.",
    },
    schedule: { en: "Online, Mon & Wed evenings", fr: "En ligne, lundi et mercredi soir" },
    location: { en: "Online", fr: "En ligne" },
    fee: { isFree: false, currency: "RWF" },
    outcomes: [
      { text: { en: "Run simple user research" } },
      { text: { en: "Design and prototype in Figma" } },
      { text: { en: "Create logos and brand assets" } },
    ],
    prerequisites: [{ text: { en: "No design experience needed" } }],
    curriculum: [
      {
        module: { en: "Design principles and typography" },
        weeks: "Weeks 1–2",
        topics: { en: lines("Layout and hierarchy", "Colour and contrast", "Type") },
      },
      {
        module: { en: "UX research and wireframes" },
        weeks: "Weeks 3–4",
        topics: { en: lines("Interviews", "User flows", "Wireframes") },
      },
      {
        module: { en: "UI and prototyping in Figma" },
        weeks: "Weeks 5–6",
        topics: { en: lines("Components", "Auto layout", "Prototypes") },
      },
      {
        module: { en: "Brand design and portfolio" },
        weeks: "Weeks 7–8",
        topics: { en: lines("Logos", "Brand guidelines", "Portfolio review") },
      },
    ],
  },
  {
    slug: "computer-maintenance-networking",
    order: 30,
    category: "it-support",
    mode: "in-person",
    level: "beginner",
    icon: "life-buoy",
    durationWeeks: 6,
    hoursPerWeek: 10,
    title: {
      en: "Computer Maintenance & Networking",
      fr: "Maintenance informatique et réseaux",
      rw: "Gusana mudasobwa n'imiyoboro",
    },
    summary: {
      en: "Hardware, systems and networks.",
      fr: "Réparation matérielle, systèmes d'exploitation et réseaux de petits bureaux.",
    },
    schedule: { en: "Weekdays, 9:00–11:00", fr: "En semaine, 9 h 00–11 h 00" },
    location: {
      en: "UB, Maison Voisin Building, Kigali",
      fr: "UB, Maison Voisin Building, Kigali",
    },
    fee: { isFree: false, currency: "RWF" },
    outcomes: [
      { text: { en: "Diagnose and repair common hardware faults" } },
      { text: { en: "Install and secure Windows and Linux" } },
      { text: { en: "Set up and troubleshoot a small network" } },
    ],
    prerequisites: [{ text: { en: "Basic computer use" } }],
    curriculum: [
      {
        module: { en: "Hardware" },
        weeks: "Weeks 1–2",
        topics: { en: lines("Components", "Assembly", "Diagnostics") },
      },
      {
        module: { en: "Operating systems" },
        weeks: "Weeks 3–4",
        topics: { en: lines("Installation", "Updates and security", "Backups") },
      },
      {
        module: { en: "Networking" },
        weeks: "Weeks 5–6",
        topics: { en: lines("IP addressing", "Wi-Fi and routers", "Troubleshooting") },
      },
    ],
  },
  {
    slug: "ai-robotics-foundations",
    order: 40,
    category: "ai-robotics",
    mode: "in-person",
    level: "intermediate",
    icon: "cpu",
    durationWeeks: 10,
    hoursPerWeek: 6,
    title: {
      en: "AI & Robotics Foundations",
      fr: "Fondamentaux de l'IA et de la robotique",
      rw: "Ishingiro rya AI na robotike",
    },
    summary: {
      en: "Sensors, robots and machine learning.",
      fr: "Capteurs, robots et apprentissage automatique.",
    },
    schedule: { en: "Saturdays, 9:00–15:00", fr: "Le samedi, 9 h 00–15 h 00" },
    location: { en: "Embedded Systems Hub, Kigali", fr: "Embedded Systems Hub, Kigali" },
    fee: { isFree: false, currency: "RWF" },
    outcomes: [
      { text: { en: "Program microcontrollers and sensors" } },
      { text: { en: "Build and control a small robot" } },
      { text: { en: "Train a simple image classifier" } },
    ],
    prerequisites: [{ text: { en: "Basic programming in any language" } }],
    curriculum: [
      {
        module: { en: "Electronics and Arduino" },
        weeks: "Weeks 1–3",
        topics: { en: lines("Circuits", "Sensors", "Actuators") },
      },
      {
        module: { en: "Robotics" },
        weeks: "Weeks 4–6",
        topics: { en: lines("Motors and control", "Line-following robot") },
      },
      {
        module: { en: "Machine learning" },
        weeks: "Weeks 7–10",
        topics: { en: lines("Python for ML", "Image classification", "Robot + vision demo") },
      },
    ],
  },
];

/** Sample intakes for development/staging only — never seeded in production. */
export function sampleIntakes(now = new Date()) {
  const d = (days: number) =>
    new Date(now.getTime() + days * 86_400_000).toISOString().slice(0, 10);
  return [
    {
      program: "full-stack-web-development",
      label: "Sample intake — evening cohort",
      startDate: d(60),
      endDate: d(144),
      applicationDeadline: d(45),
      capacity: 25,
      accepted: 13,
    },
    {
      program: "ui-ux-graphic-design",
      label: "Sample intake — online cohort",
      startDate: d(75),
      endDate: d(131),
      applicationDeadline: d(10),
      capacity: 30,
      accepted: 4,
    },
    {
      program: "computer-maintenance-networking",
      label: "Sample intake — morning cohort",
      startDate: d(40),
      endDate: d(82),
      applicationDeadline: d(30),
      capacity: 16,
      accepted: 2,
    },
    // Deliberately full: exercises the waitlist (FR-ACA-06).
    {
      program: "ai-robotics-foundations",
      label: "Sample intake — weekend cohort",
      startDate: d(50),
      endDate: d(120),
      applicationDeadline: d(35),
      capacity: 12,
      accepted: 12,
    },
  ];
}

const card = (icon: string, title: L, body: L) => ({ icon, title, body });

export const academyPages = {
  academy: {
    title: { en: "UB Academy", fr: "UB Academy", rw: "UB Academy" },
    seo: {
      description: {
        en: "Hands-on courses and internships in coding, AI, robotics, design and IT — online and in Kigali.",
        fr: "Formations pratiques et stages en code, IA, robotique, design et informatique — en ligne et à Kigali.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "day",
        eyebrow: { en: "UB ACADEMY", fr: "UB ACADEMY", rw: "UB ACADEMY" },
        title: {
          en: "Learn. Innovate. *Lead.*",
          fr: "Apprendre. Innover. *Diriger.*",
          rw: "Iga. Hanga. *Yobora.*",
        },
        lead: {
          en: "Learn from engineers. Earn a verifiable certificate.",
          fr: "Apprenez avec des ingénieurs. Certificat vérifiable.",
          rw: "Iga ku bahanga. Icyemezo kigenzurwa.",
        },
        primary: cta(
          "Find your program",
          "Trouver votre programme",
          "Shaka isomo ryawe",
          "/academy/programs",
        ),
        secondary: cta("Internships", "Stages", "Imenyerezamwuga", "/academy/internships"),
        media: "academy-hub",
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "LEARNING AREAS", fr: "DOMAINES", rw: "IBYIGWA" },
        title: {
          en: "What you can learn",
          fr: "Ce que vous pouvez apprendre",
          rw: "Ibyo ushobora kwiga",
        },
        cards: [
          card(
            "code",
            {
              en: "Coding & Software Development",
              fr: "Code et développement logiciel",
              rw: "Gukora porogaramu",
            },
            { en: "Web, mobile and back-end development.", fr: "Web, mobile et back-end." },
          ),
          card(
            "brain",
            { en: "AI & Robotics", fr: "IA et robotique", rw: "AI na robotike" },
            {
              en: "Machine learning, sensors and robots.",
              fr: "Apprentissage automatique, capteurs et robots.",
            },
          ),
          card(
            "rocket",
            { en: "Drones & IoT", fr: "Drones et IoT", rw: "Drones na IoT" },
            { en: "Connected devices and flight.", fr: "Objets connectés et vol." },
          ),
          card(
            "palette",
            { en: "Graphic & UI Design", fr: "Design graphique et UI", rw: "Igishushanyo" },
            { en: "Interfaces, brands and visuals.", fr: "Interfaces, marques et visuels." },
          ),
          card(
            "life-buoy",
            {
              en: "Computer Maintenance & Networking",
              fr: "Maintenance et réseaux",
              rw: "Gusana mudasobwa n'imiyoboro",
            },
            { en: "Hardware, systems and networks.", fr: "Matériel, systèmes et réseaux." },
          ),
          card(
            "flask-conical",
            { en: "Science & Innovation", fr: "Science et innovation", rw: "Ubumenyi n'udushya" },
            {
              en: "Experiments that become products.",
              fr: "Des expériences qui deviennent des produits.",
            },
          ),
          card(
            "users",
            { en: "Leadership & Career", fr: "Leadership et carrière", rw: "Ubuyobozi n'umwuga" },
            {
              en: "Communication, teamwork and interviews.",
              fr: "Communication, travail d'équipe et entretiens.",
            },
          ),
          card(
            "badge-check",
            {
              en: "Verifiable certificates",
              fr: "Certificats vérifiables",
              rw: "Ibyemezo bigenzurwa",
            },
            {
              en: "Employers check them online in seconds.",
              fr: "Les employeurs les vérifient en ligne.",
            },
          ),
        ],
      },
      {
        blockType: "process",
        eyebrow: { en: "HOW IT WORKS", fr: "COMMENT ÇA MARCHE", rw: "UKO BIKORWA" },
        title: {
          en: "From application to certificate",
          fr: "De la candidature au certificat",
          rw: "Kuva ku busabe kugeza ku cyemezo",
        },
        steps: [
          {
            title: { en: "Apply online", fr: "Postulez en ligne", rw: "Iyandikishe" },
            body: { en: "About 5 minutes, saved as you go.", fr: "Environ 5 minutes." },
          },
          {
            title: { en: "Short conversation", fr: "Court échange", rw: "Ikiganiro gito" },
            body: {
              en: "We check the program fits your goals.",
              fr: "Nous vérifions que le programme vous convient.",
            },
          },
          {
            title: { en: "Learn by building", fr: "Apprendre en construisant", rw: "Iga wubaka" },
            body: { en: "Weekly projects with feedback.", fr: "Des projets hebdomadaires." },
          },
          {
            title: {
              en: "Present your project",
              fr: "Présentez votre projet",
              rw: "Erekana umushinga",
            },
            body: { en: "Demo day with mentors.", fr: "Journée de démonstration." },
          },
          {
            title: { en: "Certificate", fr: "Certificat", rw: "Icyemezo" },
            body: { en: "With a QR code employers can verify.", fr: "Avec un QR code vérifiable." },
          },
        ],
      },
    ],
  },
  internships: {
    title: { en: "Internships", fr: "Stages", rw: "Imenyerezamwuga" },
    seo: {
      description: {
        en: "Internships at Universal Bridge: real projects with our engineers in software, design, marketing, hardware and data.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: { en: "INTERNSHIPS", fr: "STAGES", rw: "IMENYEREZAMWUGA" },
        title: {
          en: "Learn on *real* projects.",
          fr: "Apprenez sur de *vrais* projets.",
          rw: "Iga ku mishinga *nyayo*.",
        },
        lead: {
          en: "Real projects. Real experience.",
          fr: "De vrais projets. Une vraie expérience.",
        },
        primary: cta("Apply now", "Postuler", "Saba", "/academy/internships#apply"),
        media: "coding-hub",
      },
      {
        blockType: "cardsGrid",
        title: { en: "Internship tracks", fr: "Parcours de stage", rw: "Ibyiciro" },
        cards: [
          card(
            "code",
            { en: "Software engineering", fr: "Génie logiciel" },
            { en: "Web, mobile and APIs." },
          ),
          card(
            "palette",
            { en: "UI/UX & graphic design", fr: "UI/UX et design graphique" },
            { en: "Research, interfaces and brand." },
          ),
          card(
            "newspaper",
            { en: "Digital marketing", fr: "Marketing digital" },
            { en: "Content, social and analytics." },
          ),
          card(
            "cpu",
            { en: "Hardware & embedded", fr: "Matériel et embarqué" },
            { en: "IoT prototypes and repair." },
          ),
        ],
      },
      {
        blockType: "process",
        title: { en: "How internships work", fr: "Déroulement", rw: "Uko bigenda" },
        steps: [
          {
            title: { en: "Apply with your CV" },
            body: { en: "Choose a track and tell us your goals." },
          },
          { title: { en: "Interview" }, body: { en: "A friendly conversation and a small task." } },
          { title: { en: "Onboarding" }, body: { en: "A mentor, a team and a project." } },
          { title: { en: "Deliver" }, body: { en: "Weekly goals and reviews." } },
          { title: { en: "Certificate" }, body: { en: "Verifiable online by any employer." } },
        ],
      },
    ],
  },
  careers: {
    title: { en: "Careers", fr: "Carrières", rw: "Akazi" },
    seo: {
      description: {
        en: "Work at Universal Bridge in Kigali: engineering, design and academy roles, and open applications.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: { en: "CAREERS", fr: "CARRIÈRES", rw: "AKAZI" },
        title: {
          en: "Build what's *next* with us.",
          fr: "Construisez la *suite* avec nous.",
          rw: "Twubakane *ejo hazaza*.",
        },
        lead: {
          en: "Build software. Train the next generation.",
          fr: "Créez des logiciels. Formez la relève.",
        },
        primary: cta("See open roles", "Voir les postes", "Reba imyanya", "/company/careers#roles"),
        media: "office-reception",
      },
      {
        blockType: "process",
        eyebrow: { en: "HOW WE HIRE", fr: "NOTRE RECRUTEMENT", rw: "UKO DUTORANYA" },
        title: {
          en: "A clear, respectful process",
          fr: "Un processus clair et respectueux",
          rw: "Inzira isobanutse",
        },
        steps: [
          { title: { en: "Apply" }, body: { en: "CV and a short note." } },
          { title: { en: "Conversation" }, body: { en: "30 minutes with the team lead." } },
          { title: { en: "Practical task" }, body: { en: "Short and paid for senior roles." } },
          { title: { en: "Meet the team" }, body: { en: "Ask us anything." } },
          { title: { en: "Offer" }, body: { en: "Clear terms, quick decision." } },
        ],
      },
    ],
  },
  partners: {
    title: { en: "Partners & agents", fr: "Partenaires et agents", rw: "Abafatanyabikorwa" },
    seo: {
      description: {
        en: "Partner with Universal Bridge: refer clients through our agent programme and earn a commission.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: { en: "PARTNERS & AGENTS", fr: "PARTENAIRES ET AGENTS", rw: "ABAFATANYABIKORWA" },
        title: {
          en: "Grow with *Universal Bridge*.",
          fr: "Grandissez avec *Universal Bridge*.",
          rw: "Kurana na *Universal Bridge*.",
        },
        lead: {
          en: "Introduce clients. Earn a commission.",
          fr: "Présentez des clients. Touchez une commission.",
        },
        primary: cta(
          "Become an agent",
          "Devenir agent",
          "Ba uhagarariye",
          "/company/partners#apply",
        ),
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "AGENT PROGRAMME", fr: "PROGRAMME D'AGENTS", rw: "UBUFATANYE" },
        title: {
          en: "Three ways to partner",
          fr: "Trois façons de collaborer",
          rw: "Inzira eshatu",
        },
        cards: [
          card(
            "handshake",
            { en: "Associate agent", fr: "Agent associé", rw: "Uhagarariye" },
            {
              en: "Refer now and then. We handle the rest.",
              fr: "Recommandez. Nous gérons le reste.",
            },
          ),
          card(
            "users",
            { en: "Partner agent", fr: "Agent partenaire", rw: "Umufatanyabikorwa" },
            {
              en: "Sell with our team in your sector.",
              fr: "Travaillez avec notre équipe commerciale.",
            },
          ),
          card(
            "rocket",
            {
              en: "Strategic partner",
              fr: "Partenaire stratégique",
              rw: "Umufatanyabikorwa w'ingenzi",
            },
            {
              en: "Co-sell and co-deliver larger programmes with us.",
              fr: "Co-vendez et co-réalisez de grands programmes.",
            },
          ),
        ],
      },
      {
        blockType: "process",
        title: { en: "How it works", fr: "Comment ça marche", rw: "Uko bikorwa" },
        steps: [
          { title: { en: "Apply" }, body: { en: "Tell us about your network." } },
          { title: { en: "Agreement" }, body: { en: "Clear terms and commission rates." } },
          { title: { en: "Introduce" }, body: { en: "Share a lead through your agent link." } },
          { title: { en: "We deliver" }, body: { en: "Our team runs the project." } },
          { title: { en: "You earn" }, body: { en: "Commission when the client pays." } },
        ],
      },
    ],
  },
};
