// Draft launch content: industries, products, stats and page layouts. For UB review.
type L = { en: string; fr?: string; rw?: string };

export const industries: {
  slug: string;
  icon: string;
  order: number;
  title: L;
  summary: L;
  challenges: L[];
  solutions: { title: L; body: L }[];
  services: string[];
}[] = [
  {
    slug: "government",
    icon: "landmark",
    order: 10,
    title: { en: "Government & Public Sector", fr: "Secteur public", rw: "Inzego za Leta" },
    summary: {
      en: "Secure, accessible public services.",
      fr: "Des services publics sûrs et accessibles.",
    },
    challenges: [
      { en: "Paper-based processes and long queues" },
      { en: "Data that must stay in-country" },
      { en: "Citizens on low-end phones and slow networks" },
    ],
    solutions: [
      {
        title: { en: "E-services and portals" },
        body: { en: "Online applications, payments and tracking." },
      },
      {
        title: { en: "Records and MIS" },
        body: { en: "Secure management information systems with audit trails." },
      },
    ],
    services: ["custom-software", "it-consulting", "cloud-devops"],
  },
  {
    slug: "education",
    icon: "graduation-cap",
    order: 20,
    title: { en: "Education", fr: "Éducation", rw: "Uburezi" },
    summary: {
      en: "School systems and e-learning.",
      fr: "Gestion scolaire et e-learning.",
    },
    challenges: [
      { en: "Manual records for marks, fees and attendance" },
      { en: "Limited devices and connectivity" },
      { en: "Teachers who need practical digital training" },
    ],
    solutions: [
      {
        title: { en: "School MIS" },
        body: { en: "Students, marks, fees and parents in one system." },
      },
      {
        title: { en: "Training programmes" },
        body: { en: "Coding, robotics and IT courses through UB Academy." },
      },
    ],
    services: ["custom-software", "web-mobile", "managed-it"],
  },
  {
    slug: "finance",
    icon: "banknote",
    order: 30,
    title: { en: "Finance & Fintech", fr: "Finance et fintech", rw: "Imari na fintech" },
    summary: {
      en: "Secure platforms and mobile money.",
      fr: "Plateformes sécurisées et mobile money.",
    },
    challenges: [
      { en: "Integrating mobile money, cards and banks" },
      { en: "Strict security and compliance" },
      { en: "Fraud and risk monitoring" },
    ],
    solutions: [
      {
        title: { en: "Payment integrations" },
        body: { en: "MTN MoMo, Airtel Money and card gateways." },
      },
      {
        title: { en: "Risk analytics" },
        body: { en: "Dashboards and forecasting for lenders and SACCOs." },
      },
    ],
    services: ["custom-software", "ai-data", "cloud-devops"],
  },
  {
    slug: "health",
    icon: "heart-pulse",
    order: 40,
    title: { en: "Health", fr: "Santé", rw: "Ubuzima" },
    summary: {
      en: "Systems for clinics, pharmacies and health programmes.",
      fr: "Des systèmes pour cliniques, pharmacies et programmes de santé.",
    },
    challenges: [{ en: "Sensitive patient data" }, { en: "Stock-outs and manual reporting" }],
    solutions: [
      {
        title: { en: "Clinic and pharmacy systems" },
        body: { en: "Appointments, records and stock — secured." },
      },
    ],
    services: ["custom-software", "ai-data"],
  },
  {
    slug: "agriculture",
    icon: "sprout",
    order: 50,
    title: { en: "Agriculture", fr: "Agriculture", rw: "Ubuhinzi" },
    summary: {
      en: "Sensors and data for better harvests.",
      fr: "Capteurs et données pour de meilleures récoltes.",
    },
    challenges: [
      { en: "Weather and soil uncertainty" },
      { en: "Cooperatives managing members on paper" },
    ],
    solutions: [
      {
        title: { en: "Field sensors" },
        body: { en: "Soil moisture and weather nodes with SMS alerts." },
      },
      {
        title: { en: "Cooperative platforms" },
        body: { en: "Members, deliveries and payments in one app." },
      },
    ],
    services: ["embedded-iot", "web-mobile", "ai-data"],
  },
  {
    slug: "retail",
    icon: "shopping-bag",
    order: 60,
    title: { en: "Retail & E-commerce", fr: "Commerce et e-commerce", rw: "Ubucuruzi" },
    summary: {
      en: "Online stores, marketplaces and inventory that stays accurate.",
      fr: "Boutiques en ligne, places de marché et stocks fiables.",
    },
    challenges: [{ en: "Selling online with local payments" }, { en: "Stock spread across shops" }],
    solutions: [
      {
        title: { en: "Marketplaces" },
        body: { en: "Buyers, makers and agents on one platform." },
      },
    ],
    services: ["web-mobile", "custom-software"],
  },
  {
    slug: "ngos",
    icon: "hand-heart",
    order: 70,
    title: {
      en: "NGOs & Development",
      fr: "ONG et développement",
      rw: "Imiryango itegamiye kuri Leta",
    },
    summary: {
      en: "Data collection and M&E dashboards.",
      fr: "Collecte de données et suivi-évaluation.",
    },
    challenges: [
      { en: "Field data collection offline" },
      { en: "Donor reporting that takes weeks" },
    ],
    solutions: [
      {
        title: { en: "M&E platforms" },
        body: { en: "Offline data collection with live dashboards for donors." },
      },
    ],
    services: ["ai-data", "web-mobile", "it-consulting"],
  },
];

export const products = [
  {
    slug: "nyambika-design",
    name: "Nyambika Design",
    status: "live" as const,
    order: 10,
    externalUrl: "https://nyambika.com",
    tagline: {
      en: "Rwanda's marketplace for tailor-made clothing.",
      fr: "La place de marché rwandaise du sur-mesure.",
    },
    summary: {
      en: "Custom and bulk clothing, one place.",
      fr: "Sur mesure et en gros, au même endroit.",
    },
    audience: {
      en: "Customers, tailors, cooperatives and businesses buying uniforms.",
    },
    features: [
      {
        icon: "shopping-bag",
        title: { en: "Custom sewing orders" },
        body: { en: "Send a design, track the order." },
      },
      {
        icon: "users",
        title: { en: "Bulk orders" },
        body: { en: "Uniforms and large orders from verified cooperatives." },
      },
      {
        icon: "handshake",
        title: { en: "Agent network" },
        body: { en: "Local agents help customers and makers get started." },
      },
    ],
    ctas: [
      {
        label: { en: "Join as a tailor or producer", fr: "Rejoindre en tant que tailleur" },
        href: "https://nyambika.com",
      },
    ],
  },
];

// IX-01 Proof Ledger. Only facts we can verify are public (OI-02).
export const stats = [
  {
    key: "years-in-business",
    value: 7,
    suffix: "",
    label: {
      en: "Years building software in Kigali",
      fr: "Années à créer des logiciels à Kigali",
      rw: "Imyaka dukora porogaramu i Kigali",
    },
    icon: "calendar",
    asOf: "2026-10-01",
    verifiedBy: "Company registration, founded 2019 (SRS §2.1)",
    source: "Founded 2019; counted in full years to Oct 2026.",
    public: true,
    order: 10,
  },
  {
    key: "languages",
    value: 3,
    suffix: "",
    label: {
      en: "Languages we work in: EN · FR · RW",
      fr: "Langues de travail : anglais, français, kinyarwanda",
      rw: "Indimi dukoresha: Icyongereza, Igifaransa, Ikinyarwanda",
    },
    icon: "users",
    asOf: "2026-10-01",
    verifiedBy: "Engineering team",
    source: "Site and support languages.",
    public: true,
    order: 20,
  },
  // OI-02: conflicting figures (274 vs 30+ clients). Kept private until the MD confirms.
  {
    key: "clients",
    value: 274,
    suffix: "",
    label: { en: "Clients served" },
    icon: "users",
    asOf: "2026-10-01",
    verifiedBy: "Unverified — OI-02",
    source: "Old website claim; conflicts with the hero concept (30+).",
    public: false,
    order: 30,
  },
  {
    key: "projects",
    value: 421,
    suffix: "",
    label: { en: "Projects delivered" },
    icon: "rocket",
    asOf: "2026-10-01",
    verifiedBy: "Unverified — OI-02",
    source: "Old website claim; conflicts with the hero concept (50+).",
    public: false,
    order: 40,
  },
];

const cta = (en: string, fr: string, rw: string, href: string) => ({ label: { en, fr, rw }, href });

export const pages = {
  home: {
    title: { en: "Home", fr: "Accueil", rw: "Ahabanza" },
    seo: {
      title: {
        en: "Universal Bridge Ltd — Software & AI company in Kigali",
        fr: "Universal Bridge Ltd — Logiciels et IA à Kigali",
        rw: "Universal Bridge Ltd — Porogaramu na AI i Kigali",
      },
      description: {
        en: "Custom software, web and mobile apps, AI and IoT for enterprises, governments and NGOs. Built in Kigali, delivering worldwide.",
        fr: "Logiciels sur mesure, applications web et mobiles, IA et IoT pour entreprises, gouvernements et ONG. Conçu à Kigali, livré dans le monde entier.",
        rw: "Porogaramu zihariye, imbuga na porogaramu za telefoni, AI na IoT ku bigo, Leta n'imiryango. Byubakiwe i Kigali.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: {
          en: "SINCE 2019 · KIGALI",
          fr: "DEPUIS 2019 · KIGALI",
          rw: "KUVA 2019 · KIGALI",
        },
        title: {
          en: "Software, AI and devices\u00a0— *engineered* in Kigali.",
          fr: "Logiciels, IA et objets connectés\u00a0— *conçus* à Kigali.",
          rw: "Porogaramu, AI n'ibikoresho\u00a0— *byakorewe* i Kigali.",
        },
        lead: {
          en: "For companies, governments and NGOs.",
          fr: "Pour les entreprises, les États et les ONG.",
          rw: "Ku bigo, Leta n'imiryango.",
        },
        primary: cta("Start a project", "Démarrer un projet", "Tangira umushinga", "/contact"),
        secondary: cta(
          "Explore our services",
          "Découvrir nos services",
          "Reba serivisi zacu",
          "/services",
        ),
        chip: {
          en: "Built in Kigali · Delivering worldwide",
          fr: "Conçu à Kigali · Livré partout",
          rw: "Byubakiwe i Kigali · Bigera ku isi yose",
        },
        // UI/UX audit v2 V-1: show what we build (live product, Labs sensor, dashboard), not our sign.
        visual: "showcase",
      },
      {
        blockType: "logoCloud",
        title: {
          en: "Trusted by organisations across East Africa and beyond",
          fr: "Ils nous font confiance",
        },
      },
      {
        blockType: "servicesGrid",
        eyebrow: { en: "WHAT WE DO", fr: "CE QUE NOUS FAISONS", rw: "ICYO DUKORA" },
        title: {
          en: "From first idea to *running* system.",
          fr: "De la première idée au système *en production*.",
          rw: "Kuva ku gitekerezo kugeza kuri sisitemu *ikora*.",
        },
      },
      {
        // IX-02 story. No impact metric until a case study is verified (OI-02).
        blockType: "story",
        eyebrow: {
          en: "HOW IDEAS BECOME IMPACT",
          fr: "DE L'IDÉE À L'IMPACT",
          rw: "UKO IGITEKEREZO KIBA IGIKORWA",
        },
        title: {
          en: "Ideas → Code → *Impact*",
          fr: "Idées → Code → *Impact*",
          rw: "Igitekerezo → Kode → *Impinduka*",
        },
        steps: [
          {
            eyebrow: { en: "01 · IDEAS", fr: "01 · IDÉES", rw: "01 · IBITEKEREZO" },
            title: {
              en: "Start with the problem.",
              fr: "Partir du problème.",
              rw: "Duhera ku kibazo.",
            },
            body: { en: "Idea in, clear plan out.", fr: "Une idée, un plan clair." },
          },
          {
            eyebrow: { en: "02 · CODE", fr: "02 · CODE", rw: "02 · KODE" },
            title: {
              en: "Ship every two weeks.",
              fr: "Livrer toutes les deux semaines.",
              rw: "Buri byumweru bibiri.",
            },
            body: { en: "See it early. Steer it.", fr: "Voyez tôt. Orientez." },
          },
          {
            eyebrow: { en: "03 · IMPACT", fr: "03 · IMPACT", rw: "03 · IMPINDUKA" },
            title: {
              en: "Measure what matters.",
              fr: "Mesurer ce qui compte.",
              rw: "Gupima ibifite akamaro.",
            },
            body: { en: "Defined first, then measured.", fr: "Défini, puis mesuré." },
          },
        ],
      },
      {
        blockType: "statsBand",
        eyebrow: {
          en: "PROOF, NOT PROMISES",
          fr: "DES PREUVES, PAS DES PROMESSES",
          rw: "IBIMENYETSO",
        },
        title: {
          en: "Numbers we can stand behind.",
          fr: "Des chiffres vérifiés.",
          rw: "Imibare twizeye.",
        },
      },
      {
        blockType: "featuredWork",
        eyebrow: { en: "OUR WORK", fr: "NOS RÉALISATIONS", rw: "IBYO TWAKOZE" },
        title: { en: "Results our clients can measure.", fr: "Des résultats mesurables." },
      },
      {
        blockType: "labs",
        eyebrow: { en: "OUR LABS", fr: "NOS LABS", rw: "LABORATWARI ZACU" },
        title: {
          en: "Where new ideas get *built*.",
          fr: "Là où les idées *prennent forme*.",
          rw: "Aho ibitekerezo bishya *byubakirwa*.",
        },
        hubs: [
          {
            icon: "code",
            href: "/labs/coding-hub",
            media: "coding-hub",
            title: { en: "Coding Hub", fr: "Coding Hub", rw: "Coding Hub" },
            body: {
              en: "Web, mobile, cloud.",
              fr: "Web, mobile, cloud.",
              rw: "Imbuga, telefoni na cloud.",
            },
          },
          {
            icon: "brain",
            href: "/labs/ai-innovations-hub",
            media: "ai-hub",
            title: { en: "AI Innovations Hub", fr: "AI Innovations Hub", rw: "AI Innovations Hub" },
            body: {
              en: "Assistants, vision, analytics.",
              fr: "Assistants, vision, analytique.",
              rw: "Abafasha, AI ireba n'isesengura ry'amakuru.",
            },
          },
          {
            icon: "cpu",
            href: "/labs/embedded-systems-hub",
            media: "robotics-hub",
            title: {
              en: "Embedded Systems Hub",
              fr: "Embedded Systems Hub",
              rw: "Embedded Systems Hub",
            },
            body: {
              en: "Sensors, drones, robots.",
              fr: "Capteurs, drones, robots et prototypes IoT.",
              rw: "Sensors, drones, robots n'ibikoresho bya IoT.",
            },
          },
        ],
      },
      {
        blockType: "productsShowcase",
        eyebrow: { en: "OUR PRODUCTS", fr: "NOS PRODUITS", rw: "IBICURUZWA BYACU" },
        title: {
          en: "Products we build and run.",
          fr: "Des produits que nous créons et exploitons.",
          rw: "Ibicuruzwa twubaka tukanabikoresha.",
        },
      },
      {
        blockType: "globalReach",
        eyebrow: { en: "KIGALI → WORLD", fr: "KIGALI → MONDE", rw: "KIGALI → ISI" },
        title: {
          en: "Built in Kigali. *Delivering* worldwide.",
          fr: "Conçu à Kigali. *Livré* dans le monde entier.",
          rw: "Byubakiwe i Kigali. *Bigera* ku isi yose.",
        },
        points: [
          {
            title: { en: "UTC+2, all year", fr: "UTC+2, toute l'année", rw: "UTC+2, umwaka wose" },
          },
          {
            title: {
              en: "EN · FR · RW",
              fr: "Anglais, français, kinyarwanda",
              rw: "Icyongereza, Igifaransa, Ikinyarwanda",
            },
          },
          {
            title: {
              en: "Privacy by design",
              fr: "Protection des données intégrée",
              rw: "Kurinda amakuru",
            },
          },
          {
            title: {
              en: "Kigali Innovation City",
              fr: "Kigali Innovation City",
              rw: "Kigali Innovation City",
            },
          },
        ],
      },
      {
        blockType: "testimonials",
        eyebrow: { en: "CLIENTS", fr: "CLIENTS" },
        title: { en: "What our clients say.", fr: "Ce que disent nos clients." },
      },
      {
        // FR-HOME-11: hidden until posts are published.
        blockType: "latestPosts",
        eyebrow: { en: "INSIGHTS", fr: "ARTICLES", rw: "INKURU" },
        title: { en: "Latest insights.", fr: "Derniers articles.", rw: "Inkuru ziheruka." },
      },
      {
        blockType: "academyTeaser",
        eyebrow: { en: "UB ACADEMY", fr: "UB ACADEMY", rw: "UB ACADEMY" },
        title: {
          en: "Learn. Innovate. *Lead.*",
          fr: "Apprendre. Innover. *Diriger.*",
          rw: "Iga. Hanga. *Yobora.*",
        },
        lead: {
          en: "Coding, AI, robotics, design.",
          fr: "Code, IA, robotique, design.",
          rw: "Porogaramu, AI, robotike n'igishushanyo.",
        },
        cta: cta("Find your program", "Trouver votre programme", "Shaka isomo ryawe", "/academy"),
        media: "academy-hub",
      },
      {
        blockType: "ctaBand",
        eyebrow: { en: "LET'S TALK", fr: "PARLONS-EN", rw: "TUGANIRE" },
        title: {
          en: "Let's build what's *next*.",
          fr: "Construisons la *suite*.",
          rw: "Twubake ibizaza *ejo*.",
        },
        lead: {
          en: "We reply within a day.",
          fr: "Réponse sous un jour.",
          rw: "Tugusubiza mu munsi umwe.",
        },
        primary: cta("Start a project", "Démarrer un projet", "Tangira umushinga", "/contact"),
        secondary: cta("Book a call", "Réserver un appel", "Saba ikiganiro", "/book"),
      },
    ],
  },
  services: {
    title: { en: "Services", fr: "Services", rw: "Serivisi" },
    seo: {
      description: {
        en: "Custom software, web and mobile apps, cloud, AI, IoT, design, consulting and managed IT from Kigali.",
        fr: "Logiciels sur mesure, web et mobile, cloud, IA, IoT, design, conseil et infogérance depuis Kigali.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: { en: "SERVICES", fr: "SERVICES", rw: "SERIVISI" },
        title: {
          en: "Everything you need to build, run and *grow* software.",
          fr: "Tout pour concevoir, exploiter et *faire grandir* vos logiciels.",
          rw: "Ibyo ukeneye byose kugira ngo wubake kandi *ukure*.",
        },
        lead: {
          en: "Four pillars. One team accountable for the result.",
          fr: "Quatre piliers. Une équipe responsable du résultat.",
          rw: "Inkingi enye n'itsinda rimwe ryishingira ibivamo.",
        },
        primary: cta("Start a project", "Démarrer un projet", "Tangira umushinga", "/contact"),
        media: "office-workspace",
      },
      {
        blockType: "servicesGrid",
        showFilter: true,
        title: { en: "Our services", fr: "Nos services", rw: "Serivisi zacu" },
      },
      {
        blockType: "cardsGrid",
        anchor: "engagement",
        eyebrow: { en: "ENGAGEMENT MODELS", fr: "MODES D'ENGAGEMENT", rw: "UBURYO BWO GUKORANA" },
        title: {
          en: "Work with us the way that suits you.",
          fr: "Travaillez avec nous comme il vous convient.",
          rw: "Korana natwe uko bikunogeye.",
        },
        cards: [
          {
            icon: "rocket",
            title: {
              en: "Fixed-scope project",
              fr: "Projet au forfait",
              rw: "Umushinga ufite imbibi",
            },
            body: {
              en: "Clear scope. Fixed price.",
              fr: "Périmètre clair. Prix fixe.",
            },
          },
          {
            icon: "users",
            title: { en: "Dedicated team", fr: "Équipe dédiée", rw: "Itsinda ryihariye" },
            body: {
              en: "A cross-functional team working only on your product.",
              fr: "Une équipe pluridisciplinaire dédiée à votre produit.",
            },
          },
          {
            icon: "handshake",
            title: { en: "Staff augmentation", fr: "Renfort d'équipe", rw: "Kongera abakozi" },
            body: {
              en: "Our engineers join your team and your rituals.",
              fr: "Nos ingénieurs rejoignent votre équipe.",
            },
          },
          {
            icon: "life-buoy",
            title: {
              en: "Retainer & support",
              fr: "Abonnement et support",
              rw: "Ubufasha buhoraho",
            },
            body: {
              en: "Monthly support with agreed response times.",
              fr: "Un support mensuel avec délais garantis.",
            },
          },
        ],
      },
      {
        blockType: "ctaBand",
        title: {
          en: "Not sure which service you need?",
          fr: "Vous ne savez pas quel service choisir ?",
          rw: "Ntuzi serivisi ukeneye?",
        },
        lead: {
          en: "A free 30-minute call.",
          fr: "Un appel gratuit de 30 minutes.",
        },
        primary: cta("Book a call", "Réserver un appel", "Saba ikiganiro", "/book"),
      },
    ],
  },
  solutions: {
    title: { en: "Solutions", fr: "Solutions", rw: "Ibisubizo" },
    seo: {
      description: {
        en: "Technology for government, education, finance, health, agriculture, retail and NGOs.",
      },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: {
          en: "INDUSTRY SOLUTIONS",
          fr: "SOLUTIONS SECTORIELLES",
          rw: "IBISUBIZO MU NZEGO",
        },
        title: {
          en: "Technology that understands your *sector*.",
          fr: "Une technologie qui comprend votre *secteur*.",
          rw: "Ikoranabuhanga ryumva *urwego* rwawe.",
        },
        lead: {
          en: "Proven patterns, adapted to your sector.",
          fr: "Des solutions éprouvées, adaptées à votre secteur.",
        },
        primary: cta("Talk to us", "Parlons-en", "Tuganire", "/contact"),
        media: "lobby-corridor",
      },
      {
        blockType: "industriesGrid",
        title: {
          en: "Industries we serve",
          fr: "Les secteurs que nous servons",
          rw: "Inzego dukorera",
        },
      },
      {
        blockType: "ctaBand",
        title: {
          en: "Let's talk about your sector.",
          fr: "Parlons de votre secteur.",
          rw: "Tuganire ku rwego rwawe.",
        },
        primary: cta("Start a project", "Démarrer un projet", "Tangira umushinga", "/contact"),
      },
    ],
  },
  work: {
    title: { en: "Our work", fr: "Nos réalisations", rw: "Ibyo twakoze" },
    seo: {
      description: { en: "Case studies: the challenge, what we built and the measurable results." },
    },
    layout: [
      {
        blockType: "hero",
        mood: "day",
        eyebrow: { en: "CASE STUDIES", fr: "ÉTUDES DE CAS", rw: "IBYO TWAKOZE" },
        title: {
          en: "Proof, not *promises*.",
          fr: "Des preuves, pas des *promesses*.",
          rw: "Ibimenyetso, si *amasezerano*.",
        },
        lead: {
          en: "Real projects, real numbers.",
          fr: "De vrais projets, de vrais chiffres.",
        },
      },
    ],
  },
  products: {
    title: { en: "Products", fr: "Produits", rw: "Ibicuruzwa" },
    seo: {
      description: { en: "Products built and run by Universal Bridge, including Nyambika Design." },
    },
    layout: [
      {
        blockType: "hero",
        mood: "night",
        eyebrow: { en: "PRODUCTS", fr: "PRODUITS", rw: "IBICURUZWA" },
        title: {
          en: "Products we *build* and run.",
          fr: "Des produits que nous *créons* et exploitons.",
          rw: "Ibicuruzwa *twubaka* tukanabikoresha.",
        },
        lead: {
          en: "Platforms we build and run ourselves.",
          fr: "Nos propres plateformes.",
        },
      },
      {
        blockType: "productsShowcase",
        title: { en: "All products", fr: "Tous les produits", rw: "Ibicuruzwa byose" },
      },
    ],
  },
};
