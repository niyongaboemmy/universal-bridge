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

const discover = {
  title: { en: "Discover", fr: "Découvrir" },
  body: {
    en: "Agree goals, users and what success looks like.",
  },
};
const design = {
  title: { en: "Design", fr: "Concevoir" },
  body: { en: "Prototypes tested with real users." },
};
const build = {
  title: { en: "Build", fr: "Développer" },
  body: {
    en: "Two-week sprints, each ending in a demo.",
  },
};
const support = {
  title: { en: "Launch & support", fr: "Lancer et accompagner" },
  body: { en: "Launch, training and support." },
};

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
      en: "Systems built around how you work.",
      fr: "Des systèmes conçus autour de votre façon réelle de travailler.",
    },
    outcome: {
      en: "Software that fits how you work.",
      fr: "Un logiciel adapté à vous.",
    },
    problem: {
      en: "Off-the-shelf tools force workarounds: spreadsheets and double entry.",
    },
    deliverables: [
      {
        title: { en: "Business systems" },
        body: { en: "ERP, MIS and CRM, shaped to you." },
      },
      {
        title: { en: "APIs and integrations" },
        body: { en: "Payments, SMS and mobile money." },
      },
      {
        title: { en: "Modernisation" },
        body: { en: "Legacy systems, made modern." },
      },
      {
        title: { en: "Documentation and handover" },
        body: { en: "Clean, tested, documented code." },
      },
    ],
    process: [discover, design, build, support],
    engagementModels: ["fixed-scope", "dedicated-team", "retainer"],
    technologies: ["nextjs", "react", "nodejs", "python", "laravel", "postgresql", "docker"],
    faqs: ["faq-own-code", "faq-cost", "faq-timezone"],
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
      en: "Fast apps for every screen.",
      fr: "Des applications rapides sur tous les écrans.",
    },
    outcome: {
      en: "Fast on real phones and networks.",
      fr: "Rapides sur les vrais téléphones.",
    },
    problem: {
      en: "Heavy apps lose users on 3G.",
    },
    deliverables: [
      {
        title: { en: "Web applications" },
        body: { en: "Web apps that load fast anywhere." },
      },
      {
        title: { en: "Mobile apps" },
        body: { en: "iOS and Android, one codebase." },
      },
      {
        title: { en: "Offline-first features" },
        body: { en: "Works offline, syncs later." },
      },
      {
        title: { en: "Accessibility" },
        body: { en: "Usable by everyone (WCAG 2.2 AA)." },
      },
    ],
    process: [discover, design, build, support],
    engagementModels: ["fixed-scope", "dedicated-team"],
    technologies: ["nextjs", "react", "react-native", "flutter", "nodejs", "postgresql"],
    faqs: ["faq-own-code", "faq-cost"],
  },
  {
    slug: "cloud-devops",
    pillar: "technology",
    icon: "cloud",
    order: 30,
    title: { en: "Cloud & DevOps", fr: "Cloud et DevOps", rw: "Cloud na DevOps" },
    summary: {
      en: "Reliable, automated, cost-aware.",
      fr: "Une infrastructure fiable, des déploiements automatisés et des coûts maîtrisés.",
    },
    outcome: {
      en: "Routine releases. Rare outages.",
      fr: "Mises en production simples. Pannes rares.",
    },
    problem: {
      en: "Manual deploys, untested backups and a growing cloud bill.",
    },
    deliverables: [
      {
        title: { en: "Cloud architecture" },
        body: { en: "AWS, Azure, GCP or in-country." },
      },
      {
        title: { en: "CI/CD pipelines" },
        body: { en: "Automated tests and one-click, reversible releases." },
      },
      {
        title: { en: "Monitoring and backups" },
        body: { en: "Alerts first. Tested restores." },
      },
      {
        title: { en: "Cost reviews" },
        body: { en: "Right-sized infrastructure and a clear monthly report." },
      },
    ],
    process: [discover, design, build, support],
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
      en: "Data into decisions and forecasts.",
      fr: "Vos données en décisions et prévisions.",
    },
    outcome: {
      en: "Practical AI that saves hours.",
      fr: "Une IA pratique qui fait gagner du temps.",
    },
    problem: {
      en: "Scattered data, slow reports, and no clear place for AI.",
    },
    deliverables: [
      {
        title: { en: "Data platforms and dashboards" },
        body: { en: "One source of truth." },
      },
      {
        title: { en: "Forecasting" },
        body: { en: "Forecasts you can act on." },
      },
      {
        title: { en: "AI assistants" },
        body: { en: "Assistants grounded in your content." },
      },
      {
        title: { en: "Computer vision" },
        body: { en: "Counting, inspection and recognition from photos and video." },
      },
    ],
    process: [discover, design, build, support],
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
      en: "Connected devices, idea to field.",
      fr: "Objets connectés, de l'idée au terrain.",
    },
    outcome: {
      en: "Prototypes tested in the field.",
      fr: "Des prototypes testés sur le terrain.",
    },
    problem: {
      en: "Prototypes stall before the field.",
    },
    deliverables: [
      {
        title: { en: "IoT prototypes" },
        body: { en: "Sensor nodes for agriculture, energy, water and logistics." },
      },
      {
        title: { en: "Firmware" },
        body: { en: "Reliable firmware for ESP32, Arduino and Raspberry Pi." },
      },
      {
        title: { en: "Dashboards and alerts" },
        body: { en: "Live data, SMS alerts." },
      },
      {
        title: { en: "Drone and robotics projects" },
        body: { en: "Research with our Embedded Systems Hub." },
      },
    ],
    process: [discover, design, build, support],
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
      en: "Clear products and brands.",
      fr: "Des produits et des marques que l'on comprend au premier regard.",
    },
    outcome: {
      en: "Clear, consistent interfaces.",
      fr: "Des interfaces claires et cohérentes.",
    },
    problem: {
      en: "Users get lost; support calls pile up.",
    },
    deliverables: [
      {
        title: { en: "User research and testing" },
        body: { en: "Interviews and usability tests with your real users." },
      },
      {
        title: { en: "UX and UI design" },
        body: { en: "Wireframes, prototypes and polished interfaces in Figma." },
      },
      {
        title: { en: "Design systems" },
        body: { en: "Tokens and components your developers can reuse." },
      },
      {
        title: { en: "Brand and graphic design" },
        body: { en: "Logos, guidelines and marketing materials." },
      },
    ],
    process: [discover, design, build, support],
    engagementModels: ["fixed-scope", "staff-augmentation"],
    technologies: ["figma"],
    faqs: ["faq-cost"],
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
      en: "Clear plans before big decisions.",
      fr: "Des plans clairs avant de décider.",
    },
    outcome: {
      en: "A roadmap and budget you can trust.",
      fr: "Une feuille de route et un budget fiables.",
    },
    problem: {
      en: "Vague requirements sink big projects.",
    },
    deliverables: [
      {
        title: { en: "System analysis" },
        body: { en: "Map it before building it." },
      },
      {
        title: { en: "Requirements and tenders" },
        body: { en: "Specifications and RFPs that vendors can price accurately." },
      },
      {
        title: { en: "Architecture reviews" },
        body: { en: "Security, scalability and cost reviewed by senior engineers." },
      },
      {
        title: { en: "Project planning" },
        body: { en: "Phased plans with milestones, risks and budgets." },
      },
    ],
    process: [discover, design, build, support],
    engagementModels: ["fixed-scope", "retainer"],
    technologies: [],
    faqs: ["faq-cost", "faq-timezone"],
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
      en: "Support you can count on.",
      fr: "Un support fiable.",
    },
    outcome: {
      en: "Fewer outages, faster fixes.",
      fr: "Moins de pannes, des corrections rapides.",
    },
    problem: {
      en: "Systems age, updates slip, and the one expert has left.",
    },
    deliverables: [
      {
        title: { en: "Application support" },
        body: { en: "Fixes and updates on retainer." },
      },
      {
        title: { en: "Computer maintenance" },
        body: { en: "Hardware and software maintenance for offices and schools." },
      },
      {
        title: { en: "Security updates" },
        body: { en: "Regular patching and dependency updates." },
      },
      {
        title: { en: "Service levels" },
        body: { en: "Agreed response times and a monthly report." },
      },
    ],
    process: [discover, design, build, support],
    engagementModels: ["retainer"],
    technologies: ["docker", "postgresql"],
    faqs: ["faq-support"],
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
      en: "Yes. On payment, the code, designs and documentation are yours.",
      fr: "Oui. Après paiement, le code, les designs et la documentation sont à vous.",
    },
  },
  {
    key: "faq-cost",
    topic: "engagement",
    question: { en: "How do you price projects?", fr: "Comment fixez-vous vos prix ?" },
    answer: {
      en: "A fixed price for a clear scope, or a monthly team rate — agreed before you commit.",
      fr: "Un prix fixe pour un périmètre clair, ou un tarif mensuel d'équipe — validé avant tout engagement.",
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
      en: "Yes. Kigali is UTC+2 all year — a full overlap with European hours.",
      fr: "Oui. Kigali est à UTC+2 toute l'année — en phase avec l'Europe.",
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
      en: "Yes. We follow Rwanda's Law No. 058/2021 and can host data in-country.",
      fr: "Oui. Nous respectons la loi n° 058/2021 et pouvons héberger les données au Rwanda.",
    },
  },
  {
    key: "faq-support",
    topic: "services",
    question: { en: "What happens after launch?", fr: "Que se passe-t-il après le lancement ?" },
    answer: {
      en: "Support plans with agreed response times — or we train your team to take over.",
      fr: "Des contrats de support avec délais garantis — ou nous formons votre équipe.",
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
      en: "No. Your data is used only for your project — never to train public models.",
      fr: "Non. Vos données servent uniquement à votre projet — jamais à entraîner des modèles publics.",
    },
  },
];
