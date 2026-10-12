// Navigation from SRS §5.1/§5.2. Labels as { en, fr, rw }; rw falls back to en where missing.
type L = { en: string; fr?: string; rw?: string };
type Child = { label: L; href: string; description?: L; icon?: string };
type Item = {
  label: L;
  href: string;
  children?: Child[];
  feature?: { eyebrow?: L; title?: L; body?: L; href?: string; cta?: L };
};

export const navItems: Item[] = [
  {
    label: { en: "Services", fr: "Services", rw: "Serivisi" },
    href: "/services",
    children: [
      {
        href: "/services/custom-software",
        icon: "code",
        label: { en: "Custom Software", fr: "Logiciels sur mesure", rw: "Porogaramu zihariye" },
        description: {
          en: "Systems built around how you work",
          fr: "Des systèmes conçus autour de votre façon de travailler",
        },
      },
      {
        href: "/services/web-mobile",
        icon: "smartphone",
        label: {
          en: "Web & Mobile Apps",
          fr: "Applications web et mobiles",
          rw: "Imbuga na porogaramu za telefoni",
        },
        description: {
          en: "Fast, accessible apps for every screen",
          fr: "Des applications rapides et accessibles sur tous les écrans",
        },
      },
      {
        href: "/services/cloud-devops",
        icon: "cloud",
        label: { en: "Cloud & DevOps", fr: "Cloud et DevOps", rw: "Cloud na DevOps" },
        description: {
          en: "Reliable infrastructure that scales",
          fr: "Une infrastructure fiable qui évolue",
        },
      },
      {
        href: "/services/ai-data",
        icon: "brain",
        label: { en: "AI, ML & Data", fr: "IA, ML et données", rw: "AI, ML n'amakuru" },
        description: { en: "Turn data into decisions", fr: "Transformer les données en décisions" },
      },
      {
        href: "/services/embedded-iot",
        icon: "cpu",
        label: {
          en: "Embedded, IoT & Robotics",
          fr: "Embarqué, IoT et robotique",
          rw: "Embedded, IoT na robotike",
        },
        description: {
          en: "Sensors, drones and connected devices",
          fr: "Capteurs, drones et objets connectés",
        },
      },
      {
        href: "/services/ui-ux-design",
        icon: "palette",
        label: {
          en: "UI/UX & Graphic Design",
          fr: "UI/UX et design graphique",
          rw: "Igishushanyo cya UI/UX",
        },
        description: { en: "Products people enjoy using", fr: "Des produits agréables à utiliser" },
      },
      {
        href: "/services/it-consulting",
        icon: "compass",
        label: {
          en: "IT Consulting",
          fr: "Conseil informatique",
          rw: "Ubujyanama mu ikoranabuhanga",
        },
        description: {
          en: "Analysis, architecture and planning",
          fr: "Analyse, architecture et planification",
        },
      },
      {
        href: "/services/managed-it",
        icon: "life-buoy",
        label: { en: "Managed IT & Support", fr: "Infogérance et support", rw: "Ubufasha bwa IT" },
        description: {
          en: "Maintenance and support you can count on",
          fr: "Une maintenance et un support fiables",
        },
      },
    ],
    feature: {
      eyebrow: { en: "HOW WE ENGAGE", fr: "NOS MODES D'ENGAGEMENT" },
      title: {
        en: "Fixed scope, dedicated team or retainer",
        fr: "Forfait, équipe dédiée ou abonnement",
      },
      body: {
        en: "Pick the model that fits your project and budget.",
        fr: "Choisissez le modèle adapté à votre projet et à votre budget.",
      },
      href: "/services#engagement",
      cta: { en: "Compare models", fr: "Comparer les modèles" },
    },
  },
  {
    label: { en: "Solutions", fr: "Solutions", rw: "Ibisubizo" },
    href: "/solutions",
    children: [
      {
        href: "/solutions/government",
        icon: "landmark",
        label: { en: "Government & Public Sector", fr: "Secteur public", rw: "Inzego za Leta" },
        description: {
          en: "Secure, accessible public services",
          fr: "Des services publics sûrs et accessibles",
        },
      },
      {
        href: "/solutions/education",
        icon: "graduation-cap",
        label: { en: "Education", fr: "Éducation", rw: "Uburezi" },
        description: { en: "School systems and e-learning", fr: "Gestion scolaire et e-learning" },
      },
      {
        href: "/solutions/finance",
        icon: "banknote",
        label: { en: "Finance & Fintech", fr: "Finance et fintech", rw: "Imari na fintech" },
        description: {
          en: "Secure platforms and mobile money",
          fr: "Plateformes sécurisées et mobile money",
        },
      },
      {
        href: "/solutions/health",
        icon: "heart-pulse",
        label: { en: "Health", fr: "Santé", rw: "Ubuzima" },
        description: {
          en: "Systems for clinics and pharmacies",
          fr: "Des systèmes pour cliniques et pharmacies",
        },
      },
      {
        href: "/solutions/agriculture",
        icon: "sprout",
        label: { en: "Agriculture", fr: "Agriculture", rw: "Ubuhinzi" },
        description: {
          en: "Sensors and data for better harvests",
          fr: "Capteurs et données pour de meilleures récoltes",
        },
      },
      {
        href: "/solutions/retail",
        icon: "shopping-bag",
        label: { en: "Retail & E-commerce", fr: "Commerce et e-commerce", rw: "Ubucuruzi" },
        description: {
          en: "Online stores and accurate inventory",
          fr: "Boutiques en ligne et stocks fiables",
        },
      },
      {
        href: "/solutions/ngos",
        icon: "hand-heart",
        label: {
          en: "NGOs & Development",
          fr: "ONG et développement",
          rw: "Imiryango itegamiye kuri Leta",
        },
        description: {
          en: "Data collection and M&E dashboards",
          fr: "Collecte de données et suivi-évaluation",
        },
      },
    ],
  },
  { label: { en: "Work", fr: "Réalisations", rw: "Ibyo twakoze" }, href: "/work" },
  {
    label: { en: "Academy", fr: "Académie", rw: "Ishuri" },
    href: "/academy",
    children: [
      {
        href: "/academy/programs",
        icon: "book-open",
        label: { en: "Programs", fr: "Programmes", rw: "Amasomo" },
        description: {
          en: "Online, in-person and hybrid courses",
          fr: "Cours en ligne, en présentiel et hybrides",
        },
      },
      {
        href: "/academy/internships",
        icon: "briefcase",
        label: { en: "Internships", fr: "Stages", rw: "Imenyerezamwuga" },
        description: {
          en: "Real projects with our engineers",
          fr: "De vrais projets avec nos ingénieurs",
        },
      },
      {
        href: "/academy/apply",
        icon: "rocket",
        label: { en: "Apply", fr: "Postuler", rw: "Iyandikishe" },
        description: { en: "Join the next intake", fr: "Rejoignez la prochaine promotion" },
      },
      {
        href: "/academy/verify",
        icon: "badge-check",
        label: { en: "Verify a certificate", fr: "Vérifier un certificat", rw: "Genzura icyemezo" },
        description: {
          en: "Check a UB certificate by ID or QR code",
          fr: "Vérifier un certificat UB par identifiant ou QR code",
        },
      },
    ],
    feature: {
      eyebrow: { en: "UB ACADEMY", fr: "UB ACADEMY" },
      title: {
        en: "Learn. Innovate. Lead.",
        fr: "Apprendre. Innover. Diriger.",
        rw: "Iga. Hanga. Yobora.",
      },
      body: {
        en: "Hands-on courses and internships taught by working engineers, with certificates anyone can verify.",
        fr: "Formations pratiques et stages animés par des ingénieurs en activité, avec des certificats vérifiables par tous.",
      },
      href: "/academy",
      cta: { en: "Explore the Academy", fr: "Découvrir l'Académie" },
    },
  },
  {
    label: { en: "Company", fr: "Entreprise", rw: "Ikigo" },
    href: "/company/about",
    children: [
      {
        href: "/company/about",
        icon: "building",
        label: { en: "About", fr: "À propos", rw: "Abo turi bo" },
      },
      {
        href: "/company/leadership",
        icon: "users",
        label: { en: "Leadership", fr: "Direction", rw: "Ubuyobozi" },
      },
      {
        href: "/company/careers",
        icon: "briefcase",
        label: { en: "Careers", fr: "Carrières", rw: "Akazi" },
      },
      {
        href: "/company/partners",
        icon: "handshake",
        label: { en: "Partners & agents", fr: "Partenaires et agents", rw: "Abafatanyabikorwa" },
      },
      {
        href: "/labs",
        icon: "flask-conical",
        label: { en: "Labs", fr: "Labs", rw: "Laboratwari" },
      },
      {
        href: "/company/events",
        icon: "calendar",
        label: {
          en: "Events & hackathons",
          fr: "Événements et hackathons",
          rw: "Ibirori na hackathon",
        },
      },
      {
        href: "/company/press",
        icon: "newspaper",
        label: { en: "Press", fr: "Presse", rw: "Itangazamakuru" },
      },
    ],
  },
  { label: { en: "Insights", fr: "Ressources", rw: "Inyandiko" }, href: "/insights" },
];

export const footerColumns: { title: L; links: { label: L; href: string }[] }[] = [
  {
    title: { en: "Services", fr: "Services", rw: "Serivisi" },
    links: navItems[0]!.children!.slice(0, 6).map((c) => ({ label: c.label, href: c.href })),
  },
  {
    title: { en: "Company", fr: "Entreprise", rw: "Ikigo" },
    links: [
      ...navItems[4]!.children!.slice(0, 4).map((c) => ({ label: c.label, href: c.href })),
      { label: { en: "Products", fr: "Produits", rw: "Ibicuruzwa" }, href: "/products" },
      { label: { en: "Insights", fr: "Ressources", rw: "Inyandiko" }, href: "/insights" },
    ],
  },
  {
    title: { en: "Academy", fr: "Académie", rw: "Ishuri" },
    links: navItems[3]!.children!.map((c) => ({ label: c.label, href: c.href })),
  },
];
