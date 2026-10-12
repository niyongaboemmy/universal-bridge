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
      en: "Digital public services that are secure, work on any phone and keep citizens' data in Rwanda, so people spend less time in queues and more time getting on with their lives.",
      fr: "Des services publics numériques sûrs, utilisables sur n'importe quel téléphone et qui gardent les données des citoyens au Rwanda, pour moins de files d'attente.",
    },
    challenges: [
      {
        en: "Paper forms, manual approvals and long queues at service counters",
        fr: "Formulaires papier, validations manuelles et longues files aux guichets",
      },
      {
        en: "Citizen data that must stay in-country under Law No. 058/2021",
        fr: "Des données de citoyens qui doivent rester au Rwanda (loi n° 058/2021)",
      },
      {
        en: "Citizens on low-end phones, slow networks or with limited digital skills",
        fr: "Des citoyens sur téléphones d'entrée de gamme, réseaux lents ou peu familiers du numérique",
      },
      {
        en: "Separate systems across agencies that cannot share information",
        fr: "Des systèmes cloisonnés entre administrations qui ne partagent pas l'information",
      },
    ],
    solutions: [
      {
        title: { en: "E-services and citizen portals", fr: "E-services et portails citoyens" },
        body: {
          en: "Online applications, fee payment by mobile money and status updates by SMS, so routine requests no longer need a trip to an office.",
          fr: "Demandes en ligne, paiement par mobile money et suivi par SMS : les démarches courantes ne demandent plus de se déplacer.",
        },
      },
      {
        title: { en: "Records and MIS", fr: "Registres et SIG" },
        body: {
          en: "Management information systems with role-based access, a full audit trail and reports that managers can run themselves.",
          fr: "Des systèmes d'information de gestion avec accès par rôle, piste d'audit complète et rapports que les responsables génèrent eux-mêmes.",
        },
      },
      {
        title: { en: "Interoperability and APIs", fr: "Interopérabilité et API" },
        body: {
          en: "Documented, logged APIs that let institutions exchange data safely instead of re-typing it from one system into another.",
          fr: "Des API documentées et journalisées pour échanger les données en toute sécurité, au lieu de les ressaisir d'un système à l'autre.",
        },
      },
      {
        title: { en: "In-country hosting", fr: "Hébergement au Rwanda" },
        body: {
          en: "Hosting, backups and monitoring designed around Rwanda's data protection law, with restores tested before they are ever needed.",
          fr: "Hébergement, sauvegardes et supervision conçus selon la loi rwandaise sur les données, avec des restaurations testées à l'avance.",
        },
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
      en: "School management systems, e-learning and hands-on digital skills training that work with the devices and connectivity schools really have.",
      fr: "Gestion scolaire, e-learning et formation pratique au numérique, adaptés aux appareils et à la connexion dont les écoles disposent vraiment.",
    },
    challenges: [
      {
        en: "Marks, fees and attendance kept in paper registers and spreadsheets",
        fr: "Notes, frais et présences tenus sur registres papier et tableurs",
      },
      {
        en: "Few devices per learner and unreliable connectivity",
        fr: "Peu d'appareils par élève et une connexion instable",
      },
      {
        en: "Teachers who need practical, hands-on digital training",
        fr: "Des enseignants qui ont besoin d'une formation numérique concrète",
      },
      {
        en: "Parents who hear about fees and results too late",
        fr: "Des parents informés trop tard des frais et des résultats",
      },
    ],
    solutions: [
      {
        title: { en: "School MIS", fr: "Logiciel de gestion scolaire" },
        body: {
          en: "Students, classes, marks, fees and attendance in one system, with report cards produced automatically at the end of each term.",
          fr: "Élèves, classes, notes, frais et présences dans un seul système, avec des bulletins générés automatiquement chaque trimestre.",
        },
      },
      {
        title: { en: "Offline-friendly e-learning", fr: "E-learning hors connexion" },
        body: {
          en: "Lessons and quizzes that download once and keep working offline, then sync progress when a connection returns.",
          fr: "Des cours et quiz téléchargés une fois, utilisables hors ligne, qui synchronisent la progression dès le retour du réseau.",
        },
      },
      {
        title: { en: "Parent communication", fr: "Communication avec les parents" },
        body: {
          en: "SMS updates on results and attendance, and school fees paid by MTN MoMo or Airtel Money with automatic receipts.",
          fr: "Résultats et absences par SMS, frais scolaires payés par MTN MoMo ou Airtel Money avec reçu automatique.",
        },
      },
      {
        title: { en: "Training through UB Academy", fr: "Formation avec UB Academy" },
        body: {
          en: "Practical coding, robotics, design and IT courses for students and teachers, taught by engineers who build software every day.",
          fr: "Des cours pratiques de code, robotique, design et informatique pour élèves et enseignants, donnés par des ingénieurs en activité.",
        },
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
      en: "Secure platforms, mobile money integrations and risk analytics for banks, microfinance institutions, SACCOs and fintech start-ups.",
      fr: "Plateformes sécurisées, intégrations mobile money et analyse des risques pour banques, microfinances, SACCO et start-up fintech.",
    },
    challenges: [
      {
        en: "Connecting mobile money, cards and bank APIs reliably",
        fr: "Connecter de façon fiable mobile money, cartes et API bancaires",
      },
      {
        en: "Strict security, audit and regulatory expectations",
        fr: "Des exigences strictes de sécurité, d'audit et de conformité",
      },
      {
        en: "Fraud and credit risk to monitor with limited historical data",
        fr: "Fraude et risque de crédit à surveiller avec peu d'historique",
      },
      {
        en: "Month-end reconciliation still done by hand",
        fr: "Des rapprochements de fin de mois encore faits à la main",
      },
    ],
    solutions: [
      {
        title: { en: "Payment integrations", fr: "Intégrations de paiement" },
        body: {
          en: "MTN MoMo, Airtel Money and card gateways, with retries, callbacks and automatic reconciliation built in from day one.",
          fr: "MTN MoMo, Airtel Money et passerelles carte, avec relances, notifications et rapprochement automatique dès le départ.",
        },
      },
      {
        title: { en: "Lending and member platforms", fr: "Plateformes de crédit et d'adhérents" },
        body: {
          en: "Loan applications, approvals, repayments and member records for microfinance institutions and SACCOs, with a clear audit trail.",
          fr: "Demandes de prêt, validations, remboursements et fichiers d'adhérents pour microfinances et SACCO, avec piste d'audit.",
        },
      },
      {
        title: { en: "Risk analytics", fr: "Analyse des risques" },
        body: {
          en: "Dashboards, early-warning indicators and repayment forecasts that help credit teams act before a loan goes bad.",
          fr: "Tableaux de bord, signaux d'alerte et prévisions de remboursement pour agir avant qu'un prêt ne se dégrade.",
        },
      },
      {
        title: { en: "Security reviews", fr: "Revues de sécurité" },
        body: {
          en: "Architecture and code reviews, access controls and logging designed so your auditors find answers, not surprises.",
          fr: "Revues d'architecture et de code, contrôle des accès et journalisation pensés pour rassurer vos auditeurs.",
        },
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
      en: "Secure systems for clinics, pharmacies and health programmes that protect patient data, keep medicines in stock and make reporting quick.",
      fr: "Des systèmes sûrs pour cliniques, pharmacies et programmes de santé : données patients protégées, stocks suivis, rapports rapides.",
    },
    challenges: [
      {
        en: "Sensitive patient data that needs strict, logged access",
        fr: "Des données patients sensibles qui exigent un accès strict et tracé",
      },
      {
        en: "Medicine stock-outs and manual stock counts",
        fr: "Ruptures de médicaments et inventaires manuels",
      },
      {
        en: "Monthly reports compiled by hand from paper registers",
        fr: "Des rapports mensuels compilés à la main depuis des registres papier",
      },
      {
        en: "Facilities with intermittent power and connectivity",
        fr: "Des structures où l'électricité et la connexion sont intermittentes",
      },
    ],
    solutions: [
      {
        title: { en: "Clinic and pharmacy systems", fr: "Systèmes pour cliniques et pharmacies" },
        body: {
          en: "Appointments, patient records, prescriptions and billing in one system, with role-based access and an audit log of every view.",
          fr: "Rendez-vous, dossiers, ordonnances et facturation dans un seul système, avec accès par rôle et journal de chaque consultation.",
        },
      },
      {
        title: { en: "Stock and supply tracking", fr: "Suivi des stocks" },
        body: {
          en: "Live stock levels, expiry dates and reorder alerts across sites, so the medicines patients need are on the shelf.",
          fr: "Niveaux de stock, dates de péremption et alertes de réapprovisionnement sur tous les sites.",
        },
      },
      {
        title: { en: "Reporting dashboards", fr: "Tableaux de bord" },
        body: {
          en: "Routine indicators calculated automatically from daily records, with exports for national reporting tools such as DHIS2.",
          fr: "Indicateurs calculés automatiquement à partir des saisies quotidiennes, avec exports vers les outils nationaux comme DHIS2.",
        },
      },
      {
        title: { en: "Offline-first data capture", fr: "Saisie hors ligne d'abord" },
        body: {
          en: "Forms that keep working during power or network cuts and sync safely afterwards, without losing a single entry.",
          fr: "Des formulaires qui fonctionnent pendant les coupures et se synchronisent ensuite, sans perdre une saisie.",
        },
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
      en: "Field sensors, cooperative platforms and simple data tools that help farmers and cooperatives plan better and get paid on time.",
      fr: "Capteurs de terrain, plateformes coopératives et outils de données simples pour mieux planifier et être payé à temps.",
    },
    challenges: [
      {
        en: "Uncertain rainfall and little data on soil conditions",
        fr: "Des pluies incertaines et peu de données sur les sols",
      },
      {
        en: "Cooperatives managing members and deliveries on paper",
        fr: "Des coopératives qui gèrent membres et livraisons sur papier",
      },
      {
        en: "Farmers paid late because records do not match",
        fr: "Des agriculteurs payés en retard parce que les registres ne concordent pas",
      },
      {
        en: "Weak connectivity and basic phones in rural areas",
        fr: "Une connexion faible et des téléphones simples en zone rurale",
      },
    ],
    solutions: [
      {
        title: { en: "Field sensors", fr: "Capteurs de terrain" },
        body: {
          en: "Low-power soil-moisture and weather nodes that send readings and SMS alerts, so irrigation and planting follow real conditions.",
          fr: "Des capteurs basse consommation d'humidité du sol et de météo qui envoient mesures et alertes SMS.",
        },
      },
      {
        title: { en: "Cooperative platforms", fr: "Plateformes coopératives" },
        body: {
          en: "Members, deliveries, weights and payments recorded in one app, with mobile money payouts and a statement for every farmer.",
          fr: "Membres, livraisons, pesées et paiements dans une seule application, avec versements mobile money et relevé pour chaque agriculteur.",
        },
      },
      {
        title: { en: "SMS and USSD channels", fr: "Canaux SMS et USSD" },
        body: {
          en: "Services that work on any basic phone, so farmers without smartphones can check balances, prices and alerts.",
          fr: "Des services accessibles depuis n'importe quel téléphone simple pour consulter soldes, prix et alertes.",
        },
      },
      {
        title: { en: "Data for planning", fr: "Des données pour planifier" },
        body: {
          en: "Dashboards on yields, deliveries and prices that help cooperatives and programmes plan the next season with evidence.",
          fr: "Des tableaux de bord sur rendements, livraisons et prix pour préparer la saison suivante sur des faits.",
        },
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
      en: "Online stores, marketplaces and inventory systems that take local payments and keep stock accurate across every shop.",
      fr: "Boutiques en ligne, places de marché et gestion des stocks qui acceptent les paiements locaux et restent justes dans chaque magasin.",
    },
    challenges: [
      {
        en: "Selling online with local payments and delivery",
        fr: "Vendre en ligne avec paiements et livraison locaux",
      },
      {
        en: "Stock spread across shops and a warehouse",
        fr: "Des stocks répartis entre magasins et entrepôt",
      },
      {
        en: "Orders arriving by WhatsApp, phone and in person",
        fr: "Des commandes qui arrivent par WhatsApp, téléphone et en boutique",
      },
      {
        en: "Little visibility on what sells, where and when",
        fr: "Peu de visibilité sur ce qui se vend, où et quand",
      },
    ],
    solutions: [
      {
        title: { en: "Marketplaces", fr: "Places de marché" },
        body: {
          en: "Buyers, makers and agents on one platform: the same model we run ourselves with Nyambika Design.",
          fr: "Acheteurs, fabricants et agents sur une même plateforme : le modèle que nous exploitons nous-mêmes avec Nyambika Design.",
        },
      },
      {
        title: { en: "Online stores", fr: "Boutiques en ligne" },
        body: {
          en: "Fast storefronts that work on mid-range phones, with MTN MoMo, Airtel Money and card checkout.",
          fr: "Des boutiques rapides sur téléphones de milieu de gamme, avec paiement MTN MoMo, Airtel Money et carte.",
        },
      },
      {
        title: { en: "Inventory and point of sale", fr: "Stocks et caisse" },
        body: {
          en: "One stock count shared by every shop and the online store, updated with each sale and transfer.",
          fr: "Un stock unique partagé par chaque magasin et la boutique en ligne, mis à jour à chaque vente et transfert.",
        },
      },
      {
        title: { en: "Sales dashboards", fr: "Tableaux de bord des ventes" },
        body: {
          en: "Clear reports on best-sellers, slow movers and margins, so buying decisions are based on data rather than guesswork.",
          fr: "Meilleures ventes, invendus et marges en un coup d'œil, pour acheter sur des données et non au hasard.",
        },
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
      en: "Offline data collection, monitoring and evaluation platforms and donor dashboards that turn field work into reports in days, not weeks.",
      fr: "Collecte de données hors ligne, plateformes de suivi-évaluation et tableaux de bord bailleurs : des rapports en jours, pas en semaines.",
    },
    challenges: [
      {
        en: "Collecting field data where there is no network",
        fr: "Collecter des données là où il n'y a pas de réseau",
      },
      {
        en: "Donor reports that take weeks to compile",
        fr: "Des rapports aux bailleurs qui demandent des semaines",
      },
      {
        en: "Data from many partners in different formats",
        fr: "Des données de nombreux partenaires dans des formats différents",
      },
      {
        en: "Protecting beneficiaries' personal data",
        fr: "Protéger les données personnelles des bénéficiaires",
      },
    ],
    solutions: [
      {
        title: { en: "Offline data collection", fr: "Collecte hors ligne" },
        body: {
          en: "Mobile forms with validation, photos and GPS that work without signal and sync when the team is back in range.",
          fr: "Des formulaires mobiles avec contrôles, photos et GPS qui fonctionnent sans réseau et se synchronisent au retour.",
        },
      },
      {
        title: { en: "M&E platforms", fr: "Plateformes de suivi-évaluation" },
        body: {
          en: "Indicators, targets and results frameworks in one place, calculated from the data your teams already collect.",
          fr: "Indicateurs, cibles et cadres de résultats au même endroit, calculés à partir des données déjà collectées.",
        },
      },
      {
        title: { en: "Donor dashboards", fr: "Tableaux de bord bailleurs" },
        body: {
          en: "Live dashboards and one-click exports that turn weeks of report writing into a quick review.",
          fr: "Des tableaux de bord en direct et des exports en un clic : la rédaction des rapports devient une simple relecture.",
        },
      },
      {
        title: { en: "Responsible data handling", fr: "Données traitées avec soin" },
        body: {
          en: "Consent records, role-based access and anonymised exports, designed around Rwanda's Law No. 058/2021.",
          fr: "Consentements enregistrés, accès par rôle et exports anonymisés, conçus selon la loi rwandaise n° 058/2021.",
        },
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
      en: "Nyambika Design connects customers with Rwandan tailors, cooperatives and producers for custom sewing and bulk orders, all in one place.",
      fr: "Nyambika Design met en relation les clients avec des tailleurs, coopératives et producteurs rwandais, pour le sur-mesure comme pour les commandes en gros.",
    },
    audience: {
      en: "Customers who want clothes made to measure, tailors and producers looking for new orders, cooperatives, and businesses or schools buying uniforms.",
      fr: "Les clients qui veulent des vêtements sur mesure, les tailleurs et producteurs en quête de commandes, les coopératives, et les entreprises ou écoles qui achètent des uniformes.",
    },
    features: [
      {
        icon: "shopping-bag",
        title: { en: "Custom sewing orders", fr: "Commandes sur mesure" },
        body: {
          en: "Share a design or an idea, agree the details with a maker and follow the order until it is ready.",
          fr: "Partagez un modèle ou une idée, convenez des détails avec un artisan et suivez la commande jusqu'à la livraison.",
        },
      },
      {
        icon: "users",
        title: { en: "Bulk orders", fr: "Commandes en gros" },
        body: {
          en: "Uniforms and large orders for schools, companies and events, produced by verified cooperatives.",
          fr: "Uniformes et grandes commandes pour écoles, entreprises et événements, réalisés par des coopératives vérifiées.",
        },
      },
      {
        icon: "palette",
        title: { en: "Find the right maker", fr: "Trouver le bon artisan" },
        body: {
          en: "Discover tailors, cooperatives and producers and choose the one that matches your style and budget.",
          fr: "Découvrez tailleurs, coopératives et producteurs et choisissez celui qui correspond à votre style et à votre budget.",
        },
      },
      {
        icon: "newspaper",
        title: { en: "Business advertising", fr: "Publicité pour les entreprises" },
        body: {
          en: "Fashion and textile businesses can advertise to customers who are already looking for clothing.",
          fr: "Les entreprises de mode et de textile peuvent se faire connaître auprès de clients déjà à la recherche de vêtements.",
        },
      },
      {
        icon: "handshake",
        title: { en: "Agent network", fr: "Réseau d'agents" },
        body: {
          en: "Local agents help customers place orders and help makers get set up and start selling.",
          fr: "Des agents locaux aident les clients à commander et les artisans à s'installer et à vendre.",
        },
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
          en: "We design, build and run software, AI and connected devices for companies, public institutions and NGOs, from the first idea to a system people rely on every day.",
          fr: "Nous concevons, développons et exploitons logiciels, IA et objets connectés pour les entreprises, les institutions publiques et les ONG, de la première idée au système utilisé chaque jour.",
          rw: "Dukora porogaramu, AI n'ibikoresho bihujwe na interineti ku bigo, inzego za Leta n'imiryango, kuva ku gitekerezo kugeza kuri sisitemu ikoreshwa buri munsi.",
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
            body: {
              en: "We begin with your users and the problem they face, then agree goals, scope and a clear plan before any code is written.",
              fr: "Nous partons de vos utilisateurs et de leur problème, puis fixons objectifs, périmètre et plan clair avant d'écrire la moindre ligne de code.",
            },
          },
          {
            eyebrow: { en: "02 · CODE", fr: "02 · CODE", rw: "02 · KODE" },
            title: {
              en: "Ship every two weeks.",
              fr: "Livrer toutes les deux semaines.",
              rw: "Buri byumweru bibiri.",
            },
            body: {
              en: "Every two-week sprint ends with a demo of working software, so you see progress early and can steer it while change is still cheap.",
              fr: "Chaque sprint de deux semaines se termine par une démo d'un logiciel qui fonctionne : vous voyez l'avancement tôt et pouvez l'orienter à moindre coût.",
            },
          },
          {
            eyebrow: { en: "03 · IMPACT", fr: "03 · IMPACT", rw: "03 · IMPINDUKA" },
            title: {
              en: "Measure what matters.",
              fr: "Mesurer ce qui compte.",
              rw: "Gupima ibifite akamaro.",
            },
            body: {
              en: "We agree how success will be measured at the start, then track it after launch, so the conversation is about results, not features.",
              fr: "Nous définissons dès le départ comment mesurer le succès, puis le suivons après le lancement : on parle de résultats, pas de fonctionnalités.",
            },
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
              en: "Web platforms, mobile apps and cloud infrastructure, built and tested for real phones on real networks.",
              fr: "Plateformes web, applications mobiles et infrastructure cloud, conçues et testées pour de vrais téléphones sur de vrais réseaux.",
              rw: "Imbuga, porogaramu za telefoni na cloud, bigeragezwa kuri telefoni nyazo no ku miyoboro nyayo.",
            },
          },
          {
            icon: "brain",
            href: "/labs/ai-innovations-hub",
            media: "ai-hub",
            title: { en: "AI Innovations Hub", fr: "AI Innovations Hub", rw: "AI Innovations Hub" },
            body: {
              en: "Assistants grounded in your own documents, computer vision and forecasting, built responsibly and with consent.",
              fr: "Assistants fondés sur vos propres documents, vision par ordinateur et prévisions, développés de façon responsable et avec consentement.",
              rw: "Abafasha ba AI bashingiye ku nyandiko zawe, AI ireba n'iteganyagihe ry'amakuru, byubakwa mu buryo bwizewe.",
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
              en: "Sensors, drones, robots and IoT prototypes, taken from the breadboard to field tests.",
              fr: "Capteurs, drones, robots et prototypes IoT, du circuit d'essai jusqu'aux tests sur le terrain.",
              rw: "Sensors, drones, robots n'ibikoresho bya IoT, kuva ku igerageza kugeza ku murima.",
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
            body: {
              en: "No daylight-saving changes: a full working-day overlap with Europe.",
              fr: "Pas de changement d'heure : une journée de travail commune avec l'Europe.",
            },
          },
          {
            title: {
              en: "EN · FR · RW",
              fr: "Anglais, français, kinyarwanda",
              rw: "Icyongereza, Igifaransa, Ikinyarwanda",
            },
            body: {
              en: "Workshops, documents and support in English, French or Kinyarwanda.",
              fr: "Ateliers, documents et support en anglais, français ou kinyarwanda.",
            },
          },
          {
            title: {
              en: "Privacy by design",
              fr: "Protection des données intégrée",
              rw: "Kurinda amakuru",
            },
            body: {
              en: "Built around Rwanda's Law No. 058/2021, with GDPR in mind for EU users.",
              fr: "Conçu selon la loi rwandaise n° 058/2021, en tenant compte du RGPD.",
            },
          },
          {
            title: {
              en: "Kigali Innovation City",
              fr: "Kigali Innovation City",
              rw: "Kigali Innovation City",
            },
            body: {
              en: "Part of a fast-growing tech ecosystem in one of Africa's best-connected capitals.",
              fr: "Au cœur d'un écosystème tech en plein essor, dans une capitale africaine très connectée.",
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
          en: "Hands-on courses and internships in coding, AI, robotics and design, taught by working engineers online and in Kigali. Every certificate can be verified online.",
          fr: "Des formations pratiques et des stages en code, IA, robotique et design, animés par des ingénieurs en activité, en ligne et à Kigali. Chaque certificat est vérifiable en ligne.",
          rw: "Amasomo ngiro n'imenyerezamwuga muri porogaramu, AI, robotike n'igishushanyo, yigishwa n'abahanga, kuri interineti n'i Kigali. Buri cyemezo kigenzurwa kuri interineti.",
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
          en: "Tell us what you want to build or fix. We reply within one working day with honest advice and clear next steps.",
          fr: "Dites-nous ce que vous voulez créer ou améliorer. Nous répondons sous un jour ouvré avec un avis franc et des prochaines étapes claires.",
          rw: "Tubwire icyo ushaka kubaka cyangwa gukosora. Tugusubiza mu munsi umwe w'akazi, tukakugira inama.",
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
          en: "Engineering, technology, innovation and consulting: four pillars delivered by one team that stays accountable for the result, from the first workshop to long after launch.",
          fr: "Ingénierie, technologie, innovation et conseil : quatre piliers portés par une seule équipe, responsable du résultat du premier atelier jusqu'à bien après le lancement.",
          rw: "Inkingi enye: ubwubatsi, ikoranabuhanga, udushya n'ubujyanama, n'itsinda rimwe ryishingira ibivamo kuva ku ntangiriro kugeza nyuma yo gutangiza.",
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
              en: "A clearly defined scope, timeline and price agreed up front. Best for well-understood projects and first engagements.",
              fr: "Un périmètre, un calendrier et un prix fixés dès le départ. Idéal pour les projets bien cadrés et une première collaboration.",
            },
          },
          {
            icon: "users",
            title: { en: "Dedicated team", fr: "Équipe dédiée", rw: "Itsinda ryihariye" },
            body: {
              en: "A cross-functional team of engineers, a designer and a delivery lead working only on your product, at a predictable monthly rate.",
              fr: "Une équipe pluridisciplinaire (ingénieurs, designer, responsable de livraison) dédiée à votre produit, pour un tarif mensuel prévisible.",
            },
          },
          {
            icon: "handshake",
            title: { en: "Staff augmentation", fr: "Renfort d'équipe", rw: "Kongera abakozi" },
            body: {
              en: "Our engineers join your team, your tools and your rituals to add capacity or a skill you are missing, without a long hiring process.",
              fr: "Nos ingénieurs rejoignent votre équipe, vos outils et vos rituels pour renforcer vos capacités ou combler une compétence, sans long recrutement.",
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
              en: "Ongoing support, fixes and small improvements every month, with agreed response times and a clear monthly report.",
              fr: "Support, corrections et petites évolutions chaque mois, avec des délais de réponse convenus et un rapport mensuel clair.",
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
          en: "Book a free 30-minute call. We will listen, ask the right questions and suggest the simplest way forward, even if that is not us.",
          fr: "Réservez un appel gratuit de 30 minutes. Nous écoutons, posons les bonnes questions et proposons la voie la plus simple, même si ce n'est pas nous.",
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
          en: "Every sector has its own rules, users and constraints. We bring proven engineering patterns and adapt them to yours, from data residency to mobile money and offline field work.",
          fr: "Chaque secteur a ses règles, ses utilisateurs et ses contraintes. Nous adaptons des pratiques éprouvées au vôtre, de la résidence des données au mobile money et au travail de terrain hors ligne.",
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
        lead: {
          en: "Tell us about your users and constraints. We will share how we would approach it and what a sensible first step looks like.",
          fr: "Parlez-nous de vos utilisateurs et de vos contraintes. Nous vous dirons comment nous l'aborderions et quelle serait une première étape raisonnable.",
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
          en: "Every case study we publish names the challenge, what we built and results the client has approved. Nothing invented, nothing inflated.",
          fr: "Chaque étude de cas publiée présente le défi, ce que nous avons construit et des résultats validés par le client. Rien d'inventé, rien d'exagéré.",
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
          en: "Alongside client work, we build and operate our own platforms. Running them every day keeps us honest about what it takes to keep software useful.",
          fr: "En plus des projets clients, nous créons et exploitons nos propres plateformes. Les faire tourner chaque jour nous rappelle ce qu'exige un logiciel vraiment utile.",
        },
      },
      {
        blockType: "productsShowcase",
        title: { en: "All products", fr: "Tous les produits", rw: "Ibicuruzwa byose" },
      },
    ],
  },
};
