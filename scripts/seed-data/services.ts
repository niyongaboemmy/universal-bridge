// Draft launch copy for the 8 services (SRS §5.2, CNT-03). For UB review (CNT-01).
type L = { en: string; fr?: string; rw?: string };

export type ServiceSeed = {
  slug: string;
  pillar: "engineering" | "technology" | "innovation" | "consulting";
  icon: string;
  order: number;
  title: L;
  summary: L;
  outcome: L;
  problem: L;
  deliverables: { title: L; body?: L }[];
  process: { title: L; body?: L }[];
  engagementModels: ("fixed-scope" | "dedicated-team" | "staff-augmentation" | "retainer")[];
  technologies: string[];
  faqs: string[];
};

type Step = { title: L; body?: L };
const step = (en: string, fr: string, bodyEn: string, bodyFr: string): Step => ({
  title: { en, fr },
  body: { en: bodyEn, fr: bodyFr },
});

export const services: ServiceSeed[] = [
  {
    slug: "custom-software",
    pillar: "engineering",
    icon: "code",
    order: 10,
    title: {
      en: "Custom Software Development",
      fr: "Développement de logiciels sur mesure",
      rw: "Gukora porogaramu zihariye",
    },
    summary: {
      en: "Business systems designed around the way your organisation actually works, not the other way round.",
      fr: "Des systèmes de gestion conçus autour de la façon dont votre organisation travaille réellement, et non l'inverse.",
    },
    outcome: {
      en: "Software that fits how your teams work, connects to the tools you already use and is fully yours to keep.",
      fr: "Un logiciel adapté à vos équipes, connecté à vos outils existants et qui vous appartient entièrement.",
    },
    problem: {
      en: "Off-the-shelf tools force teams into workarounds: data typed twice, spreadsheets passed around by email, and reports nobody fully trusts. Every workaround costs time and introduces errors.",
      fr: "Les logiciels standard imposent des contournements : données saisies deux fois, tableurs échangés par e-mail, rapports auxquels personne ne se fie vraiment. Chaque contournement coûte du temps et crée des erreurs.",
    },
    deliverables: [
      {
        title: { en: "Business systems", fr: "Systèmes de gestion" },
        body: {
          en: "ERP, MIS and CRM modules shaped around your real workflows, approvals and reports.",
          fr: "Modules ERP, SIG et CRM adaptés à vos processus, validations et rapports réels.",
        },
      },
      {
        title: { en: "APIs and integrations", fr: "API et intégrations" },
        body: {
          en: "Connections to mobile money, banks, SMS gateways and the systems you already run.",
          fr: "Connexions au mobile money, aux banques, aux passerelles SMS et à vos systèmes existants.",
        },
      },
      {
        title: { en: "Modernisation", fr: "Modernisation" },
        body: {
          en: "Legacy desktop or spreadsheet systems moved to secure web platforms, step by step and without losing data.",
          fr: "Anciennes applications ou tableurs migrés vers des plateformes web sécurisées, par étapes et sans perte de données.",
        },
      },
      {
        title: { en: "Reporting and dashboards", fr: "Rapports et tableaux de bord" },
        body: {
          en: "Live reports built into the system, so managers stop waiting for month-end spreadsheets.",
          fr: "Des rapports en direct intégrés au système, sans attendre les tableurs de fin de mois.",
        },
      },
      {
        title: { en: "Documentation and handover", fr: "Documentation et transfert" },
        body: {
          en: "Clean, tested, documented code in your repository, plus training for your team.",
          fr: "Un code propre, testé et documenté dans votre dépôt, et une formation pour votre équipe.",
        },
      },
    ],
    process: [
      step(
        "Discover",
        "Découvrir",
        "Workshops with the people who will use the system to map today's process, pain points and what success looks like.",
        "Des ateliers avec les futurs utilisateurs pour cartographier le processus actuel, ses difficultés et la définition du succès.",
      ),
      step(
        "Design",
        "Concevoir",
        "Clickable prototypes of the key screens and a data model, reviewed with real users before development starts.",
        "Des prototypes cliquables des écrans clés et un modèle de données, validés avec de vrais utilisateurs avant le développement.",
      ),
      step(
        "Build",
        "Développer",
        "Two-week sprints, each ending in a demo of working software, with automated tests and code reviews throughout.",
        "Des sprints de deux semaines, chacun conclu par une démo d'un logiciel qui fonctionne, avec tests automatisés et revues de code.",
      ),
      step(
        "Launch & support",
        "Lancer et accompagner",
        "Data migration, user training and a planned go-live, followed by support with agreed response times.",
        "Migration des données, formation des utilisateurs et mise en service planifiée, puis support avec délais convenus.",
      ),
    ],
    engagementModels: ["fixed-scope", "dedicated-team", "retainer"],
    technologies: ["nextjs", "react", "nodejs", "python", "laravel", "postgresql", "docker"],
    faqs: ["faq-own-code", "faq-cost", "faq-timezone", "faq-existing-system"],
  },
  {
    slug: "web-mobile",
    pillar: "engineering",
    icon: "smartphone",
    order: 20,
    title: {
      en: "Web & Mobile Applications",
      fr: "Applications web et mobiles",
      rw: "Imbuga na porogaramu za telefoni",
    },
    summary: {
      en: "Fast, accessible web and mobile apps that work on the phones and networks your users actually have.",
      fr: "Des applications web et mobiles rapides et accessibles, qui fonctionnent sur les téléphones et réseaux de vos utilisateurs.",
    },
    outcome: {
      en: "Apps that load in seconds on a mid-range Android, keep working offline and are usable by everyone.",
      fr: "Des applications qui se chargent en quelques secondes sur un Android de milieu de gamme, fonctionnent hors ligne et sont accessibles à tous.",
    },
    problem: {
      en: "Heavy apps built on fast office Wi-Fi lose users on 3G and mid-range phones. Every extra second of loading, every lost form and every unreadable screen means people give up.",
      fr: "Les applications lourdes conçues sur le Wi-Fi du bureau perdent leurs utilisateurs en 3G et sur téléphones modestes. Chaque seconde de chargement, chaque formulaire perdu, chaque écran illisible fait abandonner.",
    },
    deliverables: [
      {
        title: { en: "Web applications", fr: "Applications web" },
        body: {
          en: "Server-rendered web apps that are readable and usable before any JavaScript loads.",
          fr: "Des applications web rendues côté serveur, lisibles et utilisables avant même le chargement du JavaScript.",
        },
      },
      {
        title: { en: "Mobile apps", fr: "Applications mobiles" },
        body: {
          en: "iOS and Android apps from one codebase with React Native or Flutter.",
          fr: "Des applications iOS et Android à partir d'une seule base de code, en React Native ou Flutter.",
        },
      },
      {
        title: { en: "Offline-first features", fr: "Fonctions hors ligne" },
        body: {
          en: "Forms and data that keep working without a signal and sync safely later.",
          fr: "Des formulaires et données qui fonctionnent sans réseau et se synchronisent ensuite.",
        },
      },
      {
        title: { en: "Payments and messaging", fr: "Paiements et messages" },
        body: {
          en: "MTN MoMo, Airtel Money, card payments, SMS and WhatsApp notifications.",
          fr: "MTN MoMo, Airtel Money, paiement par carte, notifications SMS et WhatsApp.",
        },
      },
      {
        title: { en: "Accessibility", fr: "Accessibilité" },
        body: {
          en: "Designed and tested to WCAG 2.2 AA, in English, French and Kinyarwanda.",
          fr: "Conçu et testé selon les WCAG 2.2 AA, en anglais, français et kinyarwanda.",
        },
      },
    ],
    process: [
      step(
        "Discover",
        "Découvrir",
        "We agree who the users are, which devices and networks they use, and the few journeys that matter most.",
        "Nous identifions les utilisateurs, leurs appareils et réseaux, et les quelques parcours qui comptent le plus.",
      ),
      step(
        "Design",
        "Concevoir",
        "Mobile-first prototypes tested with real users, plus a performance budget for every page.",
        "Des prototypes pensés d'abord pour le mobile, testés avec de vrais utilisateurs, et un budget de performance pour chaque page.",
      ),
      step(
        "Build",
        "Développer",
        "Two-week sprints with demos, tested on real mid-range phones and throttled networks, not just emulators.",
        "Des sprints de deux semaines avec démo, testés sur de vrais téléphones de milieu de gamme et des réseaux bridés.",
      ),
      step(
        "Launch & support",
        "Lancer et accompagner",
        "App store and web releases, analytics that respect consent, and ongoing updates as operating systems change.",
        "Publication sur les stores et le web, mesure d'audience respectueuse du consentement et mises à jour continues.",
      ),
    ],
    engagementModels: ["fixed-scope", "dedicated-team"],
    technologies: ["nextjs", "react", "react-native", "flutter", "nodejs", "postgresql"],
    faqs: ["faq-own-code", "faq-cost", "faq-low-end-phones"],
  },
  {
    slug: "cloud-devops",
    pillar: "technology",
    icon: "cloud",
    order: 30,
    title: { en: "Cloud & DevOps", fr: "Cloud et DevOps", rw: "Cloud na DevOps" },
    summary: {
      en: "Reliable infrastructure, automated deployments and cloud costs you can predict, in the cloud or in-country.",
      fr: "Une infrastructure fiable, des déploiements automatisés et des coûts cloud prévisibles, dans le cloud ou au Rwanda.",
    },
    outcome: {
      en: "Releases become routine, outages become rare, and backups are proven to restore.",
      fr: "Les mises en production deviennent routinières, les pannes rares, et les sauvegardes ont fait leurs preuves.",
    },
    problem: {
      en: "Manual deployments, backups nobody has tested and a cloud bill that grows every month. When something breaks at night, it depends on one person remembering how the server was set up.",
      fr: "Des déploiements manuels, des sauvegardes jamais testées et une facture cloud qui grimpe chaque mois. Quand une panne survient la nuit, tout repose sur une seule personne qui se souvient de la configuration.",
    },
    deliverables: [
      {
        title: { en: "Cloud architecture", fr: "Architecture cloud" },
        body: {
          en: "Secure, right-sized set-ups on AWS, Azure, Google Cloud or in-country data centres.",
          fr: "Des architectures sûres et bien dimensionnées sur AWS, Azure, Google Cloud ou au Rwanda.",
        },
      },
      {
        title: { en: "CI/CD pipelines", fr: "Pipelines CI/CD" },
        body: {
          en: "Automated tests and one-click releases that can be rolled back in minutes.",
          fr: "Tests automatisés et mises en production en un clic, réversibles en quelques minutes.",
        },
      },
      {
        title: { en: "Infrastructure as code", fr: "Infrastructure as code" },
        body: {
          en: "Servers and settings described in version-controlled code, so environments can be rebuilt.",
          fr: "Serveurs et réglages décrits dans du code versionné, pour pouvoir reconstruire chaque environnement.",
        },
      },
      {
        title: { en: "Monitoring and backups", fr: "Supervision et sauvegardes" },
        body: {
          en: "Alerts before users notice, plus scheduled restore tests that prove backups work.",
          fr: "Des alertes avant que les utilisateurs ne remarquent un problème, et des tests de restauration réguliers.",
        },
      },
      {
        title: { en: "Cost reviews", fr: "Revues des coûts" },
        body: {
          en: "Right-sized resources and a plain-language monthly cost report.",
          fr: "Des ressources bien dimensionnées et un rapport mensuel des coûts en langage clair.",
        },
      },
    ],
    process: [
      step(
        "Assess",
        "Évaluer",
        "We review your current set-up, costs, risks and data-residency needs, and share findings in plain language.",
        "Nous examinons votre configuration, vos coûts, vos risques et vos besoins de résidence des données, et partageons un constat clair.",
      ),
      step(
        "Design",
        "Concevoir",
        "A target architecture with security, backups, monitoring and a realistic monthly budget.",
        "Une architecture cible avec sécurité, sauvegardes, supervision et un budget mensuel réaliste.",
      ),
      step(
        "Automate",
        "Automatiser",
        "Pipelines, infrastructure as code and a careful migration with a tested rollback plan.",
        "Pipelines, infrastructure as code et une migration prudente avec un plan de retour arrière testé.",
      ),
      step(
        "Run & improve",
        "Exploiter et améliorer",
        "Monitoring, restore tests, patching and a monthly review of reliability and cost.",
        "Supervision, tests de restauration, correctifs et revue mensuelle de la fiabilité et des coûts.",
      ),
    ],
    engagementModels: ["fixed-scope", "retainer"],
    technologies: ["aws", "azure", "gcp", "docker", "postgresql"],
    faqs: ["faq-data-residency", "faq-support"],
  },
  {
    slug: "ai-data",
    pillar: "innovation",
    icon: "brain",
    order: 40,
    title: {
      en: "AI, Machine Learning & Data",
      fr: "IA, apprentissage automatique et données",
      rw: "AI, ML n'amakuru",
    },
    summary: {
      en: "Turn scattered data into dashboards, forecasts and practical AI tools that help your team decide faster.",
      fr: "Transformez des données éparses en tableaux de bord, prévisions et outils d'IA concrets pour décider plus vite.",
    },
    outcome: {
      en: "One trusted source of data, and practical AI that saves your team hours every week.",
      fr: "Une source de données fiable et une IA concrète qui fait gagner des heures chaque semaine.",
    },
    problem: {
      en: "Data sits in spreadsheets, apps and inboxes, so reports take days and numbers disagree. Many teams want to use AI but have no clear, safe place to start.",
      fr: "Les données dorment dans des tableurs, des applications et des boîtes mail : les rapports prennent des jours et les chiffres se contredisent. Beaucoup veulent utiliser l'IA sans savoir par où commencer en toute sécurité.",
    },
    deliverables: [
      {
        title: {
          en: "Data platforms and dashboards",
          fr: "Plateformes de données et tableaux de bord",
        },
        body: {
          en: "Data from your systems cleaned and combined into one source of truth.",
          fr: "Les données de vos systèmes nettoyées et réunies en une source unique et fiable.",
        },
      },
      {
        title: { en: "Forecasting", fr: "Prévisions" },
        body: {
          en: "Demand, sales and cash-flow forecasts with clear confidence ranges.",
          fr: "Prévisions de demande, de ventes et de trésorerie avec des marges d'incertitude claires.",
        },
      },
      {
        title: { en: "AI assistants", fr: "Assistants IA" },
        body: {
          en: "Assistants grounded in your own documents, which cite their sources.",
          fr: "Des assistants fondés sur vos propres documents, qui citent leurs sources.",
        },
      },
      {
        title: { en: "Computer vision", fr: "Vision par ordinateur" },
        body: {
          en: "Counting, inspection and recognition from photos and video.",
          fr: "Comptage, inspection et reconnaissance à partir de photos et de vidéos.",
        },
      },
      {
        title: { en: "Document automation", fr: "Automatisation documentaire" },
        body: {
          en: "Data extracted from forms, invoices and reports, with a person reviewing edge cases.",
          fr: "Extraction des données de formulaires, factures et rapports, avec une personne pour les cas particuliers.",
        },
      },
    ],
    process: [
      step(
        "Find the use case",
        "Trouver le cas d'usage",
        "We identify the decision or task where data or AI can save the most time, and how we will measure it.",
        "Nous repérons la décision ou la tâche où les données ou l'IA feront gagner le plus de temps, et comment le mesurer.",
      ),
      step(
        "Prepare the data",
        "Préparer les données",
        "We audit, clean and connect the data you have, with consent and access rules agreed up front.",
        "Nous auditons, nettoyons et relions vos données, avec consentement et règles d'accès définis dès le départ.",
      ),
      step(
        "Prototype and test",
        "Prototyper et tester",
        "A working prototype tested on real cases, with honest accuracy figures before anyone relies on it.",
        "Un prototype fonctionnel testé sur des cas réels, avec des taux de précision honnêtes avant toute mise en service.",
      ),
      step(
        "Deploy and monitor",
        "Déployer et surveiller",
        "Integration into daily tools, staff training and ongoing monitoring of quality and drift.",
        "Intégration aux outils du quotidien, formation des équipes et suivi continu de la qualité.",
      ),
    ],
    engagementModels: ["fixed-scope", "dedicated-team"],
    technologies: ["python", "tensorflow", "pytorch", "postgresql", "aws"],
    faqs: ["faq-ai-data", "faq-own-code"],
  },
  {
    slug: "embedded-iot",
    pillar: "innovation",
    icon: "cpu",
    order: 50,
    title: {
      en: "Embedded Systems, IoT, Drones & Robotics",
      fr: "Systèmes embarqués, IoT, drones et robotique",
      rw: "Embedded, IoT, drones na robotike",
    },
    summary: {
      en: "Connected devices, sensors and robotics taken from first idea to a prototype that survives real field conditions.",
      fr: "Objets connectés, capteurs et robotique, de la première idée à un prototype qui résiste aux conditions réelles du terrain.",
    },
    outcome: {
      en: "Working prototypes tested in the field, with the data, dashboards and alerts to prove they work.",
      fr: "Des prototypes testés sur le terrain, avec les données, tableaux de bord et alertes qui prouvent leur efficacité.",
    },
    problem: {
      en: "Hardware ideas often stall between the workbench and the field. Batteries drain, connectivity drops, enclosures fail in the rain, and nobody looks at the data the device sends.",
      fr: "Les projets matériels calent souvent entre l'atelier et le terrain : batteries vides, réseau perdu, boîtiers qui prennent l'eau, et des données que personne ne consulte.",
    },
    deliverables: [
      {
        title: { en: "IoT prototypes", fr: "Prototypes IoT" },
        body: {
          en: "Sensor nodes for agriculture, energy, water and logistics.",
          fr: "Des capteurs connectés pour l'agriculture, l'énergie, l'eau et la logistique.",
        },
      },
      {
        title: { en: "Firmware", fr: "Firmware" },
        body: {
          en: "Low-power firmware for ESP32, Arduino and Raspberry Pi, with remote updates.",
          fr: "Un firmware basse consommation pour ESP32, Arduino et Raspberry Pi, avec mises à jour à distance.",
        },
      },
      {
        title: { en: "Connectivity", fr: "Connectivité" },
        body: {
          en: "Wi-Fi, GSM or LoRa, chosen for the site, with buffering when the network drops.",
          fr: "Wi-Fi, GSM ou LoRa selon le site, avec mise en mémoire tampon en cas de coupure.",
        },
      },
      {
        title: { en: "Dashboards and alerts", fr: "Tableaux de bord et alertes" },
        body: {
          en: "Live readings on a web dashboard, with SMS alerts when a threshold is crossed.",
          fr: "Mesures en direct sur un tableau de bord web, avec alertes SMS en cas de dépassement de seuil.",
        },
      },
      {
        title: { en: "Drone and robotics projects", fr: "Projets drones et robotique" },
        body: {
          en: "Research and prototypes developed with our Embedded Systems Hub.",
          fr: "Recherche et prototypes menés avec notre Embedded Systems Hub.",
        },
      },
    ],
    process: [
      step(
        "Define",
        "Définir",
        "We agree what the device must measure or do, where it will live, how it is powered and who acts on its data.",
        "Nous définissons ce que l'appareil doit mesurer ou faire, où il sera installé, son alimentation et qui exploitera ses données.",
      ),
      step(
        "Prototype",
        "Prototyper",
        "Breadboard and first enclosure in our lab, with firmware and a simple dashboard to see data early.",
        "Montage d'essai et premier boîtier en atelier, avec firmware et tableau de bord simple pour voir les données tôt.",
      ),
      step(
        "Field test",
        "Tester sur le terrain",
        "A small pilot in real conditions to test battery life, connectivity and durability, and fix what breaks.",
        "Un petit pilote en conditions réelles pour éprouver autonomie, connectivité et robustesse, puis corriger.",
      ),
      step(
        "Hand over or scale",
        "Transférer ou déployer",
        "Documentation, a parts list and training, or a plan to move from a few units to many.",
        "Documentation, liste de composants et formation, ou un plan pour passer de quelques unités à un déploiement.",
      ),
    ],
    engagementModels: ["fixed-scope", "dedicated-team"],
    technologies: ["esp32", "arduino", "raspberry-pi", "python", "nodejs"],
    faqs: ["faq-own-code"],
  },
  {
    slug: "ui-ux-design",
    pillar: "technology",
    icon: "palette",
    order: 60,
    title: {
      en: "UI/UX & Graphic Design",
      fr: "UI/UX et design graphique",
      rw: "Igishushanyo cya UI/UX",
    },
    summary: {
      en: "Research-led product design and brand identity that make your product easy to understand at first glance.",
      fr: "Un design produit fondé sur la recherche et une identité de marque que l'on comprend au premier regard.",
    },
    outcome: {
      en: "Clear, consistent interfaces that users understand without training, and a brand people recognise.",
      fr: "Des interfaces claires et cohérentes, comprises sans formation, et une marque que l'on reconnaît.",
    },
    problem: {
      en: "When users get lost, they call support, make mistakes or stop using the product. Inconsistent screens and branding make even good software feel unreliable.",
      fr: "Quand les utilisateurs se perdent, ils appellent le support, se trompent ou abandonnent. Des écrans et une image incohérents rendent peu fiable même un bon logiciel.",
    },
    deliverables: [
      {
        title: { en: "User research and testing", fr: "Recherche et tests utilisateurs" },
        body: {
          en: "Interviews and usability tests with your real users, in their language.",
          fr: "Entretiens et tests d'utilisabilité avec vos vrais utilisateurs, dans leur langue.",
        },
      },
      {
        title: { en: "UX and UI design", fr: "Design UX et UI" },
        body: {
          en: "User flows, wireframes, clickable prototypes and polished interfaces in Figma.",
          fr: "Parcours, wireframes, prototypes cliquables et interfaces finalisées dans Figma.",
        },
      },
      {
        title: { en: "Design systems", fr: "Design systems" },
        body: {
          en: "Tokens and components your developers can reuse, documented with usage rules.",
          fr: "Tokens et composants réutilisables par vos développeurs, documentés avec leurs règles d'usage.",
        },
      },
      {
        title: { en: "Accessibility reviews", fr: "Audits d'accessibilité" },
        body: {
          en: "Contrast, keyboard and screen-reader checks against WCAG 2.2.",
          fr: "Vérification des contrastes, du clavier et des lecteurs d'écran selon les WCAG 2.2.",
        },
      },
      {
        title: { en: "Brand and graphic design", fr: "Identité et design graphique" },
        body: {
          en: "Logos, brand guidelines and marketing materials for print and screen.",
          fr: "Logos, chartes graphiques et supports marketing pour l'imprimé et l'écran.",
        },
      },
    ],
    process: [
      step(
        "Research",
        "Rechercher",
        "Interviews, analytics and a review of your current product to find where users struggle.",
        "Entretiens, données d'usage et revue du produit actuel pour repérer où les utilisateurs bloquent.",
      ),
      step(
        "Explore",
        "Explorer",
        "User flows and wireframes for the key journeys, compared and refined with your team.",
        "Parcours et wireframes des parcours clés, comparés et affinés avec votre équipe.",
      ),
      step(
        "Prototype and test",
        "Prototyper et tester",
        "Clickable prototypes tested with real users, then polished visual design.",
        "Des prototypes cliquables testés avec de vrais utilisateurs, puis un design visuel finalisé.",
      ),
      step(
        "Hand over",
        "Transmettre",
        "Developer-ready files, a design system and support during the build.",
        "Des fichiers prêts pour le développement, un design system et un accompagnement pendant le développement.",
      ),
    ],
    engagementModels: ["fixed-scope", "staff-augmentation"],
    technologies: ["figma"],
    faqs: ["faq-cost", "faq-own-code"],
  },
  {
    slug: "it-consulting",
    pillar: "consulting",
    icon: "compass",
    order: 70,
    title: {
      en: "IT Consulting, System Analysis & Project Planning",
      fr: "Conseil informatique, analyse et planification",
      rw: "Ubujyanama mu ikoranabuhanga",
    },
    summary: {
      en: "Independent analysis, clear requirements and realistic plans before you commit budget to a major IT project.",
      fr: "Une analyse indépendante, des besoins clairs et des plans réalistes avant d'engager le budget d'un grand projet informatique.",
    },
    outcome: {
      en: "A roadmap, requirements and budget you can trust, and vendors who can price the work accurately.",
      fr: "Une feuille de route, des exigences et un budget fiables, et des prestataires capables de chiffrer juste.",
    },
    problem: {
      en: "Vague requirements sink big IT projects: budgets overrun, vendors deliver the wrong thing and teams lose trust in technology. Most of these failures are decided before a line of code is written.",
      fr: "Des besoins flous font échouer les grands projets : budgets dépassés, livrables à côté de la plaque, équipes découragées. La plupart de ces échecs se jouent avant la première ligne de code.",
    },
    deliverables: [
      {
        title: { en: "System analysis", fr: "Analyse des systèmes" },
        body: {
          en: "Current processes, systems and data mapped before anything new is built.",
          fr: "Processus, systèmes et données actuels cartographiés avant toute nouvelle construction.",
        },
      },
      {
        title: { en: "Requirements and tenders", fr: "Cahiers des charges et appels d'offres" },
        body: {
          en: "Specifications and RFPs that vendors can price accurately and compare fairly.",
          fr: "Des spécifications et appels d'offres que les prestataires peuvent chiffrer et comparer équitablement.",
        },
      },
      {
        title: { en: "Architecture reviews", fr: "Revues d'architecture" },
        body: {
          en: "Security, scalability and running costs reviewed by senior engineers.",
          fr: "Sécurité, montée en charge et coûts d'exploitation examinés par des ingénieurs seniors.",
        },
      },
      {
        title: { en: "Project planning", fr: "Planification de projet" },
        body: {
          en: "Phased plans with milestones, risks, budgets and clear decision points.",
          fr: "Des plans par phases avec jalons, risques, budgets et points de décision clairs.",
        },
      },
      {
        title: { en: "Vendor and delivery oversight", fr: "Suivi des prestataires" },
        body: {
          en: "An independent check on progress and quality while another team builds.",
          fr: "Un regard indépendant sur l'avancement et la qualité pendant qu'une autre équipe développe.",
        },
      },
    ],
    process: [
      step(
        "Listen",
        "Écouter",
        "Interviews with leadership, users and IT to understand goals, constraints and what has been tried before.",
        "Entretiens avec la direction, les utilisateurs et l'informatique pour comprendre objectifs, contraintes et historique.",
      ),
      step(
        "Analyse",
        "Analyser",
        "We map processes, systems and data, and compare the options with their costs and risks.",
        "Nous cartographions processus, systèmes et données, et comparons les options avec leurs coûts et risques.",
      ),
      step(
        "Recommend",
        "Recommander",
        "A written recommendation, requirements and a phased roadmap, presented to decision-makers.",
        "Une recommandation écrite, un cahier des charges et une feuille de route par phases, présentés aux décideurs.",
      ),
      step(
        "Support delivery",
        "Accompagner la réalisation",
        "Help with tenders, vendor selection and checkpoints, or delivery by our own team if you prefer.",
        "Appui aux appels d'offres, au choix des prestataires et aux points de contrôle, ou réalisation par notre équipe.",
      ),
    ],
    engagementModels: ["fixed-scope", "retainer"],
    technologies: [],
    faqs: ["faq-cost", "faq-timezone", "faq-start"],
  },
  {
    slug: "managed-it",
    pillar: "consulting",
    icon: "life-buoy",
    order: 80,
    title: {
      en: "Managed IT, Support & Maintenance",
      fr: "Infogérance, support et maintenance",
      rw: "Ubufasha bwa IT no kubungabunga",
    },
    summary: {
      en: "Ongoing support, maintenance and security updates for your applications, computers and networks.",
      fr: "Support, maintenance et mises à jour de sécurité continus pour vos applications, ordinateurs et réseaux.",
    },
    outcome: {
      en: "Fewer outages, faster fixes and systems that stay secure, documented and up to date.",
      fr: "Moins de pannes, des corrections plus rapides et des systèmes sûrs, documentés et à jour.",
    },
    problem: {
      en: "Systems age quietly: updates slip, licences expire and the one person who understood the set-up has moved on. Problems then surface at the worst possible moment.",
      fr: "Les systèmes vieillissent sans bruit : mises à jour reportées, licences expirées, et la seule personne qui connaissait la configuration est partie. Les problèmes surgissent alors au pire moment.",
    },
    deliverables: [
      {
        title: { en: "Application support", fr: "Support applicatif" },
        body: {
          en: "Bug fixes, small improvements and updates for systems we built or inherited.",
          fr: "Corrections, petites évolutions et mises à jour des systèmes que nous avons créés ou repris.",
        },
      },
      {
        title: { en: "Computer and network maintenance", fr: "Maintenance des postes et réseaux" },
        body: {
          en: "Hardware, software and network maintenance for offices and schools.",
          fr: "Maintenance matérielle, logicielle et réseau pour bureaux et écoles.",
        },
      },
      {
        title: { en: "Security updates", fr: "Mises à jour de sécurité" },
        body: {
          en: "Regular patching, dependency updates and access reviews.",
          fr: "Correctifs réguliers, mises à jour des dépendances et revue des accès.",
        },
      },
      {
        title: { en: "Backups and recovery", fr: "Sauvegardes et reprise" },
        body: {
          en: "Scheduled backups with restore tests, so recovery is proven before it is needed.",
          fr: "Des sauvegardes planifiées et des tests de restauration, pour une reprise éprouvée.",
        },
      },
      {
        title: { en: "Service levels", fr: "Niveaux de service" },
        body: {
          en: "Agreed response times, one ticket channel and a clear monthly report.",
          fr: "Des délais de réponse convenus, un canal de tickets unique et un rapport mensuel clair.",
        },
      },
    ],
    process: [
      step(
        "Audit",
        "Auditer",
        "We review your systems, devices, documentation and risks, and agree what is in scope.",
        "Nous passons en revue systèmes, équipements, documentation et risques, et fixons le périmètre.",
      ),
      step(
        "Onboard",
        "Prendre en main",
        "Access, monitoring and documentation are set up, and urgent fixes are handled first.",
        "Accès, supervision et documentation sont mis en place, et les urgences traitées en priorité.",
      ),
      step(
        "Support",
        "Assister",
        "Requests handled through one channel within the agreed response times.",
        "Les demandes passent par un canal unique et sont traitées dans les délais convenus.",
      ),
      step(
        "Report and improve",
        "Rendre compte et améliorer",
        "A monthly report on incidents, updates and risks, with recommendations for what to improve next.",
        "Un rapport mensuel sur incidents, mises à jour et risques, avec des recommandations d'amélioration.",
      ),
    ],
    engagementModels: ["retainer"],
    technologies: ["docker", "postgresql"],
    faqs: ["faq-support", "faq-existing-system"],
  },
];

export const technologies: { slug: string; name: string; category: string; order: number }[] = [
  ["nextjs", "Next.js", "frontend"],
  ["react", "React", "frontend"],
  ["react-native", "React Native", "mobile"],
  ["flutter", "Flutter", "mobile"],
  ["nodejs", "Node.js", "backend"],
  ["python", "Python", "backend"],
  ["laravel", "Laravel", "backend"],
  ["postgresql", "PostgreSQL", "data"],
  ["aws", "AWS", "cloud"],
  ["azure", "Azure", "cloud"],
  ["gcp", "Google Cloud", "cloud"],
  ["docker", "Docker", "cloud"],
  ["tensorflow", "TensorFlow", "ai"],
  ["pytorch", "PyTorch", "ai"],
  ["esp32", "ESP32", "hardware"],
  ["arduino", "Arduino", "hardware"],
  ["raspberry-pi", "Raspberry Pi", "hardware"],
  ["figma", "Figma", "design"],
].map(([slug, name, category], i) => ({
  slug: slug!,
  name: name!,
  category: category!,
  order: i * 10,
}));

export const faqs: { key: string; topic: string; question: L; answer: L }[] = [
  {
    key: "faq-own-code",
    topic: "engagement",
    question: {
      en: "Do we own the code and designs?",
      fr: "Sommes-nous propriétaires du code et des designs ?",
    },
    answer: {
      en: "Yes. Once the work is paid for, the code, designs and documentation are yours. We work in repositories and design files you can access throughout the project, so there is never a lock-in.",
      fr: "Oui. Une fois les travaux payés, le code source, les maquettes et la documentation vous appartiennent. Nous travaillons dans des dépôts et des fichiers auxquels vous avez accès tout au long du projet : aucune dépendance forcée.",
    },
  },
  {
    key: "faq-cost",
    topic: "engagement",
    question: { en: "How do you price projects?", fr: "Comment fixez-vous vos prix ?" },
    answer: {
      en: "Either a fixed price for a clearly defined scope, or a monthly rate for a dedicated team. Both are agreed in writing before you commit, and if the scope is still unclear we suggest a short paid discovery phase first.",
      fr: "Soit un prix fixe pour un périmètre bien défini, soit un tarif mensuel pour une équipe dédiée. Les deux sont validés par écrit avant tout engagement ; si le périmètre reste flou, nous proposons d'abord une courte phase de cadrage.",
    },
  },
  {
    key: "faq-timezone",
    topic: "engagement",
    question: {
      en: "Can we work together from Europe or the US?",
      fr: "Pouvons-nous travailler ensemble depuis l'Europe ou les États-Unis ?",
    },
    answer: {
      en: "Yes. Kigali is on UTC+2 all year with no daylight-saving changes, which gives a full working-day overlap with Europe and a good overlap with the Gulf. With the US East Coast we share the morning there and the afternoon here.",
      fr: "Oui. Kigali est à UTC+2 toute l'année, sans changement d'heure : une journée de travail commune avec l'Europe et un bon recouvrement avec le Golfe. Avec la côte Est des États-Unis, nous partageons leur matinée et notre après-midi.",
    },
  },
  {
    key: "faq-data-residency",
    topic: "services",
    question: {
      en: "Can our data stay in Rwanda?",
      fr: "Nos données peuvent-elles rester au Rwanda ?",
    },
    answer: {
      en: "Yes. We design systems around Rwanda's Law No. 058/2021 on personal data protection and can host databases and files in-country. Where storage abroad is needed, we help you plan for the authorisation the law requires.",
      fr: "Oui. Nous concevons les systèmes selon la loi rwandaise n° 058/2021 sur la protection des données et pouvons héberger bases et fichiers au Rwanda. Si un stockage à l'étranger est nécessaire, nous vous aidons à préparer l'autorisation requise.",
    },
  },
  {
    key: "faq-support",
    topic: "services",
    question: { en: "What happens after launch?", fr: "Que se passe-t-il après le lancement ?" },
    answer: {
      en: "You choose. We offer support plans with agreed response times, monitoring and regular updates, or we train your team and hand over everything they need to run the system themselves.",
      fr: "C'est vous qui choisissez : un contrat de support avec délais de réponse convenus, supervision et mises à jour, ou une formation de votre équipe avec tout ce qu'il faut pour reprendre le système.",
    },
  },
  {
    key: "faq-ai-data",
    topic: "services",
    question: {
      en: "Is our data used to train public AI models?",
      fr: "Nos données servent-elles à entraîner des modèles d'IA publics ?",
    },
    answer: {
      en: "No. Your data is used only for your project and never to train public models. We choose AI providers and settings that do not retain or train on your data, and we can run models on your own infrastructure when needed.",
      fr: "Non. Vos données servent uniquement à votre projet, jamais à entraîner des modèles publics. Nous choisissons des fournisseurs et des réglages qui ne conservent pas vos données, et pouvons faire tourner les modèles sur votre propre infrastructure.",
    },
  },
  {
    key: "faq-existing-system",
    topic: "services",
    question: {
      en: "Can you take over or improve a system someone else built?",
      fr: "Pouvez-vous reprendre ou améliorer un système développé par quelqu'un d'autre ?",
    },
    answer: {
      en: "Yes. We start with a short audit of the code, infrastructure and documentation, tell you honestly what we find, and then agree whether to stabilise, extend or gradually replace it.",
      fr: "Oui. Nous commençons par un court audit du code, de l'infrastructure et de la documentation, partageons un constat franc, puis décidons ensemble s'il faut stabiliser, faire évoluer ou remplacer progressivement.",
    },
  },
  {
    key: "faq-low-end-phones",
    topic: "services",
    question: {
      en: "Will the app work on low-end phones and slow networks?",
      fr: "L'application fonctionnera-t-elle sur des téléphones modestes et des réseaux lents ?",
    },
    answer: {
      en: "That is how we design by default. We set a performance budget for every page, render on the server, support offline use where it matters and test on real mid-range Android phones.",
      fr: "C'est notre façon de concevoir par défaut : budget de performance par page, rendu côté serveur, usage hors ligne là où c'est utile et tests sur de vrais Android de milieu de gamme.",
    },
  },
  {
    key: "faq-start",
    topic: "engagement",
    question: {
      en: "What do you need from us to get started?",
      fr: "De quoi avez-vous besoin pour commencer ?",
    },
    answer: {
      en: "A short description of the problem, who the users are and any deadline or budget range. From there we suggest a first call, then a written proposal with scope, timeline and price.",
      fr: "Une courte description du problème, des utilisateurs et, le cas échéant, d'une échéance ou d'une fourchette de budget. Ensuite, un premier appel, puis une proposition écrite avec périmètre, calendrier et prix.",
    },
  },
];
