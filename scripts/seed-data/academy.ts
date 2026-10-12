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
      en: "Go from your first HTML page to a deployed web application built with React, Node.js and PostgreSQL, guided by engineers who build web apps every day.",
      fr: "De votre première page HTML à une application web en ligne avec React, Node.js et PostgreSQL, accompagné par des ingénieurs qui en développent chaque jour.",
      rw: "Kuva ku rupapuro rwawe rwa mbere rwa HTML kugeza ku rubuga rukora rwubakishijwe React, Node.js na PostgreSQL, uyobowe n'abahanga bubaka imbuga buri munsi.",
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
      {
        text: {
          en: "Work with Git and code reviews like a professional team",
          fr: "Travailler avec Git et les revues de code comme une équipe professionnelle",
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
      {
        text: {
          en: "Around 8 hours a week for classes and practice",
          fr: "Environ 8 heures par semaine pour les cours et la pratique",
        },
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
      en: "Learn to research, design and prototype clear digital products in Figma, and build the brand skills to finish with a portfolio you can show employers.",
      fr: "Apprenez à étudier les besoins, concevoir et prototyper des produits numériques clairs dans Figma, et terminez avec un portfolio à montrer aux employeurs.",
    },
    schedule: { en: "Online, Mon & Wed evenings", fr: "En ligne, lundi et mercredi soir" },
    location: { en: "Online", fr: "En ligne" },
    fee: { isFree: false, currency: "RWF" },
    outcomes: [
      { text: { en: "Run simple user research", fr: "Mener une recherche utilisateur simple" } },
      { text: { en: "Design and prototype in Figma", fr: "Concevoir et prototyper dans Figma" } },
      {
        text: {
          en: "Apply layout, colour, typography and accessibility principles",
          fr: "Appliquer les principes de mise en page, couleur, typographie et accessibilité",
        },
      },
      {
        text: {
          en: "Create logos and brand assets",
          fr: "Créer des logos et des éléments de marque",
        },
      },
      {
        text: {
          en: "Present a design portfolio with real case studies",
          fr: "Présenter un portfolio avec de vraies études de cas",
        },
      },
    ],
    prerequisites: [
      { text: { en: "No design experience needed", fr: "Aucune expérience en design requise" } },
      {
        text: {
          en: "A computer and a stable internet connection for live online sessions",
          fr: "Un ordinateur et une connexion stable pour les sessions en ligne",
        },
      },
    ],
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
      en: "Learn to diagnose and repair computers, install and secure operating systems, and set up the networks small offices and schools depend on.",
      fr: "Apprenez à diagnostiquer et réparer les ordinateurs, installer et sécuriser les systèmes d'exploitation, et mettre en place les réseaux des petits bureaux et écoles.",
    },
    schedule: { en: "Weekdays, 9:00–11:00", fr: "En semaine, 9 h 00–11 h 00" },
    location: {
      en: "UB, Maison Voisin Building, Kigali",
      fr: "UB, Maison Voisin Building, Kigali",
    },
    fee: { isFree: false, currency: "RWF" },
    outcomes: [
      {
        text: {
          en: "Diagnose and repair common hardware faults",
          fr: "Diagnostiquer et réparer les pannes matérielles courantes",
        },
      },
      {
        text: {
          en: "Install and secure Windows and Linux",
          fr: "Installer et sécuriser Windows et Linux",
        },
      },
      {
        text: {
          en: "Set up backups and protect data from loss",
          fr: "Mettre en place des sauvegardes et protéger les données",
        },
      },
      {
        text: {
          en: "Set up and troubleshoot a small network",
          fr: "Installer et dépanner un petit réseau",
        },
      },
    ],
    prerequisites: [
      { text: { en: "Basic computer use", fr: "Savoir utiliser un ordinateur" } },
      {
        text: {
          en: "Curiosity about how machines work, no prior technical training needed",
          fr: "De la curiosité pour le fonctionnement des machines, sans formation technique préalable",
        },
      },
    ],
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
      en: "Program microcontrollers and sensors, build a small robot and train your first image classifier in hands-on Saturday sessions at our Embedded Systems Hub.",
      fr: "Programmez microcontrôleurs et capteurs, construisez un petit robot et entraînez votre premier classifieur d'images lors d'ateliers pratiques le samedi à l'Embedded Systems Hub.",
    },
    schedule: { en: "Saturdays, 9:00–15:00", fr: "Le samedi, 9 h 00–15 h 00" },
    location: { en: "Embedded Systems Hub, Kigali", fr: "Embedded Systems Hub, Kigali" },
    fee: { isFree: false, currency: "RWF" },
    outcomes: [
      {
        text: {
          en: "Program microcontrollers and sensors",
          fr: "Programmer des microcontrôleurs et des capteurs",
        },
      },
      {
        text: { en: "Build and control a small robot", fr: "Construire et piloter un petit robot" },
      },
      {
        text: {
          en: "Train a simple image classifier",
          fr: "Entraîner un classifieur d'images simple",
        },
      },
      {
        text: {
          en: "Combine a robot and computer vision in a final demo",
          fr: "Associer robot et vision par ordinateur dans une démo finale",
        },
      },
    ],
    prerequisites: [
      {
        text: {
          en: "Basic programming in any language",
          fr: "Des bases de programmation, quel que soit le langage",
        },
      },
    ],
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
          en: "Practical courses and internships taught by the engineers who build our software. Learn by building real projects, then earn a certificate any employer can verify online.",
          fr: "Des formations pratiques et des stages animés par les ingénieurs qui développent nos logiciels. Apprenez en construisant de vrais projets et obtenez un certificat vérifiable en ligne.",
          rw: "Amasomo ngiro n'imenyerezamwuga bitangwa n'abahanga bubaka porogaramu zacu. Iga wubaka imishinga nyayo, ubone icyemezo umukoresha wese ashobora kugenzura kuri interineti.",
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
            {
              en: "Web, mobile and back-end development, from your first line of code to a deployed application.",
              fr: "Développement web, mobile et back-end, de la première ligne de code à une application en ligne.",
            },
          ),
          card(
            "brain",
            { en: "AI & Robotics", fr: "IA et robotique", rw: "AI na robotike" },
            {
              en: "Machine learning, sensors and robots, learned hands-on in our Embedded Systems Hub.",
              fr: "Apprentissage automatique, capteurs et robots, appris par la pratique dans notre Embedded Systems Hub.",
            },
          ),
          card(
            "rocket",
            { en: "Drones & IoT", fr: "Drones et IoT", rw: "Drones na IoT" },
            {
              en: "Connected devices, sensors and the basics of flight, with projects that leave the classroom.",
              fr: "Objets connectés, capteurs et bases du vol, avec des projets qui sortent de la salle de classe.",
            },
          ),
          card(
            "palette",
            { en: "Graphic & UI Design", fr: "Design graphique et UI", rw: "Igishushanyo" },
            {
              en: "Interfaces, brands and visuals designed in Figma, with a portfolio to show for it.",
              fr: "Interfaces, marques et visuels conçus dans Figma, avec un portfolio à la clé.",
            },
          ),
          card(
            "life-buoy",
            {
              en: "Computer Maintenance & Networking",
              fr: "Maintenance et réseaux",
              rw: "Gusana mudasobwa n'imiyoboro",
            },
            {
              en: "Hardware repair, operating systems and small networks: skills every office and school needs.",
              fr: "Réparation, systèmes d'exploitation et petits réseaux : des compétences utiles à chaque bureau et école.",
            },
          ),
          card(
            "flask-conical",
            { en: "Science & Innovation", fr: "Science et innovation", rw: "Ubumenyi n'udushya" },
            {
              en: "Experiments and prototypes that turn curiosity into ideas worth building.",
              fr: "Expériences et prototypes qui transforment la curiosité en idées à concrétiser.",
            },
          ),
          card(
            "users",
            { en: "Leadership & Career", fr: "Leadership et carrière", rw: "Ubuyobozi n'umwuga" },
            {
              en: "Communication, teamwork, presenting your work and preparing for interviews.",
              fr: "Communication, travail d'équipe, présentation de son travail et préparation aux entretiens.",
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
              en: "Each certificate has a unique code and QR code that employers can check online in seconds.",
              fr: "Chaque certificat porte un code unique et un QR code que les employeurs vérifient en ligne en quelques secondes.",
            },
          ),
        ],
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "WHY UB ACADEMY", fr: "POURQUOI UB ACADEMY", rw: "KUKI UB ACADEMY" },
        title: {
          en: "Learn from people who build",
          fr: "Apprendre avec ceux qui construisent",
        },
        cards: [
          card(
            "code",
            { en: "Taught by working engineers", fr: "Des ingénieurs en activité" },
            {
              en: "Your instructors build software, AI and devices for clients, so you learn how the work is really done.",
              fr: "Vos formateurs développent logiciels, IA et objets connectés pour des clients : vous apprenez le métier tel qu'il se pratique.",
            },
          ),
          card(
            "rocket",
            { en: "Learn by building", fr: "Apprendre en construisant" },
            {
              en: "Every program is built around projects, with feedback each week and a final demo.",
              fr: "Chaque programme repose sur des projets, avec des retours chaque semaine et une démo finale.",
            },
          ),
          card(
            "calendar",
            { en: "Formats that fit your life", fr: "Des formats adaptés à votre vie" },
            {
              en: "Online, in-person and hybrid programs, with daytime, evening and weekend schedules.",
              fr: "Des programmes en ligne, en présentiel et hybrides, en journée, en soirée et le week-end.",
            },
          ),
          card(
            "briefcase",
            { en: "A path into work", fr: "Un pas vers l'emploi" },
            {
              en: "After a program, you can apply for an internship on real projects with our teams.",
              fr: "Après un programme, vous pouvez postuler à un stage sur de vrais projets avec nos équipes.",
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
            body: {
              en: "The form takes about 5 minutes and saves as you go, so a dropped connection does not lose your answers.",
              fr: "Le formulaire prend environ 5 minutes et s'enregistre au fur et à mesure : une coupure ne fait pas perdre vos réponses.",
            },
          },
          {
            title: { en: "Short conversation", fr: "Court échange", rw: "Ikiganiro gito" },
            body: {
              en: "We talk about your goals and experience to make sure the program is the right fit for you.",
              fr: "Nous parlons de vos objectifs et de votre expérience pour vérifier que le programme vous correspond.",
            },
          },
          {
            title: { en: "Learn by building", fr: "Apprendre en construisant", rw: "Iga wubaka" },
            body: {
              en: "Weekly projects with feedback from instructors, so you practise every new skill straight away.",
              fr: "Des projets chaque semaine avec les retours des formateurs, pour mettre chaque compétence en pratique.",
            },
          },
          {
            title: {
              en: "Present your project",
              fr: "Présentez votre projet",
              rw: "Erekana umushinga",
            },
            body: {
              en: "Finish with a demo day where you present your final project to mentors and fellow learners.",
              fr: "Terminez par une journée de démonstration où vous présentez votre projet final aux mentors et aux autres apprenants.",
            },
          },
          {
            title: { en: "Certificate", fr: "Certificat", rw: "Icyemezo" },
            body: {
              en: "Receive a certificate with a unique code and QR code that any employer can verify online.",
              fr: "Recevez un certificat avec un code unique et un QR code que tout employeur peut vérifier en ligne.",
            },
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
          en: "Join our teams on real projects for real users, with a mentor who reviews your work every week. Leave with experience, a portfolio and a verifiable certificate.",
          fr: "Rejoignez nos équipes sur de vrais projets pour de vrais utilisateurs, avec un mentor qui relit votre travail chaque semaine. Repartez avec de l'expérience, un portfolio et un certificat vérifiable.",
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
            {
              en: "Build features for web and mobile apps and APIs, with code reviews from our engineers.",
              fr: "Développez des fonctionnalités pour applications web, mobiles et API, avec les revues de code de nos ingénieurs.",
            },
          ),
          card(
            "palette",
            { en: "UI/UX & graphic design", fr: "UI/UX et design graphique" },
            {
              en: "Research, interface design and brand work for client projects and our own products.",
              fr: "Recherche, conception d'interfaces et identité visuelle pour nos clients et nos produits.",
            },
          ),
          card(
            "newspaper",
            { en: "Digital marketing", fr: "Marketing digital" },
            {
              en: "Content, social media and analytics for our services, products and UB Academy.",
              fr: "Contenus, réseaux sociaux et analyse d'audience pour nos services, produits et UB Academy.",
            },
          ),
          card(
            "cpu",
            { en: "Hardware & embedded", fr: "Matériel et embarqué" },
            {
              en: "IoT prototypes, sensors and computer repair, alongside our Embedded Systems Hub team.",
              fr: "Prototypes IoT, capteurs et réparation informatique, aux côtés de l'équipe de l'Embedded Systems Hub.",
            },
          ),
        ],
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "WHAT YOU GAIN", fr: "CE QUE VOUS Y GAGNEZ", rw: "ICYO WUNGUKA" },
        title: { en: "More than a line on your CV", fr: "Plus qu'une ligne sur votre CV" },
        cards: [
          card(
            "users",
            { en: "A mentor", fr: "Un mentor" },
            {
              en: "A named mentor, a weekly check-in and honest feedback on your work.",
              fr: "Un mentor attitré, un point chaque semaine et des retours francs sur votre travail.",
            },
          ),
          card(
            "rocket",
            { en: "Real work", fr: "Du vrai travail" },
            {
              en: "Tasks that ship to real users, not exercises that end up in a drawer.",
              fr: "Des tâches livrées à de vrais utilisateurs, pas des exercices qui finissent dans un tiroir.",
            },
          ),
          card(
            "book-open",
            { en: "A portfolio", fr: "Un portfolio" },
            {
              en: "Work you can show and explain in your next interview.",
              fr: "Des réalisations à montrer et à expliquer lors de votre prochain entretien.",
            },
          ),
          card(
            "badge-check",
            { en: "A verifiable certificate", fr: "Un certificat vérifiable" },
            {
              en: "Employers can confirm it online in seconds with its code or QR code.",
              fr: "Les employeurs le vérifient en ligne en quelques secondes grâce à son code ou à son QR code.",
            },
          ),
        ],
      },
      {
        blockType: "process",
        title: { en: "How internships work", fr: "Déroulement", rw: "Uko bigenda" },
        steps: [
          {
            title: { en: "Apply with your CV", fr: "Postulez avec votre CV" },
            body: {
              en: "Choose a track and tell us what you want to learn and what you have built so far.",
              fr: "Choisissez un parcours et dites-nous ce que vous voulez apprendre et ce que vous avez déjà réalisé.",
            },
          },
          {
            title: { en: "Interview", fr: "Entretien" },
            body: {
              en: "A friendly conversation and a small practical task related to your track.",
              fr: "Un échange bienveillant et une petite tâche pratique liée à votre parcours.",
            },
          },
          {
            title: { en: "Onboarding", fr: "Intégration" },
            body: {
              en: "You meet your mentor and team, set up your tools and pick up your first task.",
              fr: "Vous rencontrez votre mentor et votre équipe, installez vos outils et prenez votre première tâche.",
            },
          },
          {
            title: { en: "Deliver", fr: "Réaliser" },
            body: {
              en: "Weekly goals, regular reviews and demos with the team every two weeks.",
              fr: "Des objectifs hebdomadaires, des revues régulières et une démo avec l'équipe toutes les deux semaines.",
            },
          },
          {
            title: { en: "Certificate", fr: "Certificat" },
            body: {
              en: "A certificate any employer can verify online, plus feedback on your next steps.",
              fr: "Un certificat vérifiable en ligne par tout employeur, et des conseils pour la suite.",
            },
          },
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
          en: "Build software, AI and devices that solve real problems, and help train the next generation of engineers through UB Academy.",
          fr: "Créez des logiciels, de l'IA et des objets connectés qui résolvent de vrais problèmes, et aidez à former la relève avec UB Academy.",
        },
        primary: cta("See open roles", "Voir les postes", "Reba imyanya", "/company/careers#roles"),
        media: "lobby-backlit",
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "HOW WE WORK", fr: "NOTRE FAÇON DE TRAVAILLER", rw: "UKO DUKORA" },
        title: {
          en: "What working at Universal Bridge is like",
          fr: "Travailler chez Universal Bridge",
        },
        cards: [
          card(
            "rocket",
            { en: "Work that matters", fr: "Un travail qui compte" },
            {
              en: "Systems for schools, clinics, cooperatives and businesses, used by real people every day.",
              fr: "Des systèmes pour écoles, cliniques, coopératives et entreprises, utilisés chaque jour par de vraies personnes.",
            },
          ),
          card(
            "users",
            { en: "Small teams, real ownership", fr: "Petites équipes, vraie responsabilité" },
            {
              en: "You own your work from the first conversation with users to the release and beyond.",
              fr: "Vous portez votre travail de la première discussion avec les utilisateurs jusqu'à la mise en production et au-delà.",
            },
          ),
          card(
            "calendar",
            { en: "A steady rhythm", fr: "Un rythme régulier" },
            {
              en: "Two-week sprints, a demo at the end of each one, and code reviews that help everyone improve.",
              fr: "Des sprints de deux semaines, une démo à la fin de chacun et des revues de code qui font progresser chacun.",
            },
          ),
          card(
            "graduation-cap",
            { en: "Learn and teach", fr: "Apprendre et transmettre" },
            {
              en: "Work alongside our labs on new technology, and mentor interns and Academy learners.",
              fr: "Travaillez avec nos labs sur les nouvelles technologies et encadrez stagiaires et apprenants.",
            },
          ),
        ],
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
          {
            title: { en: "Apply", fr: "Postulez" },
            body: {
              en: "Send your CV and a short note about what you want to work on. No cover-letter essays needed.",
              fr: "Envoyez votre CV et quelques lignes sur ce qui vous intéresse. Pas besoin de longue lettre de motivation.",
            },
          },
          {
            title: { en: "Conversation", fr: "Échange" },
            body: {
              en: "A 30-minute call with the team lead about your experience and the role.",
              fr: "Un appel de 30 minutes avec le responsable d'équipe sur votre parcours et le poste.",
            },
          },
          {
            title: { en: "Practical task", fr: "Exercice pratique" },
            body: {
              en: "A short task close to the real work. It is paid for senior roles.",
              fr: "Un exercice court, proche du travail réel. Il est rémunéré pour les postes seniors.",
            },
          },
          {
            title: { en: "Meet the team", fr: "Rencontrez l'équipe" },
            body: {
              en: "Meet the people you would work with, and ask us anything about how we work.",
              fr: "Rencontrez vos futurs collègues et posez-nous toutes vos questions sur notre façon de travailler.",
            },
          },
          {
            title: { en: "Offer", fr: "Proposition" },
            body: {
              en: "Clear terms in writing and a quick decision, whatever the outcome.",
              fr: "Des conditions claires par écrit et une décision rapide, quelle que soit l'issue.",
            },
          },
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
          en: "Know an organisation that needs software, AI or IT support? Introduce them to us, and earn a commission when the project goes ahead. Our team handles the delivery.",
          fr: "Vous connaissez une organisation qui a besoin de logiciels, d'IA ou de support informatique ? Présentez-la-nous et touchez une commission si le projet se concrétise. Notre équipe s'occupe de la réalisation.",
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
              en: "Refer clients now and then through your network. We handle the proposal, delivery and support.",
              fr: "Recommandez des clients de temps en temps via votre réseau. Nous gérons la proposition, la réalisation et le support.",
            },
          ),
          card(
            "users",
            { en: "Partner agent", fr: "Agent partenaire", rw: "Umufatanyabikorwa" },
            {
              en: "Work alongside our sales team in your sector or region, with regular contact and shared targets.",
              fr: "Travaillez avec notre équipe commerciale dans votre secteur ou votre région, avec un contact régulier et des objectifs communs.",
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
              en: "Co-sell and co-deliver larger programmes with us, combining your expertise with our engineering teams.",
              fr: "Co-vendez et co-réalisez de grands programmes avec nous, en associant votre expertise à nos équipes d'ingénierie.",
            },
          ),
        ],
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "WHO WE PARTNER WITH", fr: "AVEC QUI NOUS COLLABORONS", rw: "ABO DUKORANA" },
        title: { en: "Good partners come in many forms", fr: "Les bons partenaires sont variés" },
        cards: [
          card(
            "briefcase",
            { en: "Consultants and freelancers", fr: "Consultants et indépendants" },
            {
              en: "Advisers whose clients need a reliable team to build or support their systems.",
              fr: "Des conseillers dont les clients ont besoin d'une équipe fiable pour développer ou maintenir leurs systèmes.",
            },
          ),
          card(
            "building",
            { en: "Technology companies", fr: "Entreprises technologiques" },
            {
              en: "Firms abroad looking for a delivery partner in Kigali, in their working hours.",
              fr: "Des entreprises à l'étranger qui cherchent un partenaire de réalisation à Kigali, à leurs horaires.",
            },
          ),
          card(
            "hand-heart",
            { en: "NGOs and programmes", fr: "ONG et programmes" },
            {
              en: "Organisations that need digital, data or training partners for their projects.",
              fr: "Des organisations qui recherchent des partenaires numériques, data ou formation pour leurs projets.",
            },
          ),
          card(
            "graduation-cap",
            { en: "Schools and training partners", fr: "Écoles et organismes de formation" },
            {
              en: "Institutions that want to offer practical tech skills with UB Academy.",
              fr: "Des établissements qui souhaitent proposer des compétences tech pratiques avec UB Academy.",
            },
          ),
        ],
      },
      {
        blockType: "process",
        title: { en: "How it works", fr: "Comment ça marche", rw: "Uko bikorwa" },
        steps: [
          {
            title: { en: "Apply", fr: "Postulez" },
            body: {
              en: "Tell us about yourself, your network and the sectors you know best.",
              fr: "Présentez-vous, ainsi que votre réseau et les secteurs que vous connaissez le mieux.",
            },
          },
          {
            title: { en: "Agreement", fr: "Accord" },
            body: {
              en: "We agree clear terms and commission rates in writing before you make any introduction.",
              fr: "Nous convenons par écrit de conditions et de taux de commission clairs avant toute mise en relation.",
            },
          },
          {
            title: { en: "Introduce", fr: "Présentez" },
            body: {
              en: "Share a lead through your agent link, and we follow up quickly and professionally.",
              fr: "Transmettez un contact via votre lien d'agent ; nous le recontactons rapidement et professionnellement.",
            },
          },
          {
            title: { en: "We deliver", fr: "Nous réalisons" },
            body: {
              en: "Our team scopes, delivers and supports the project, and keeps you informed.",
              fr: "Notre équipe cadre, réalise et accompagne le projet, et vous tient informé.",
            },
          },
          {
            title: { en: "You earn", fr: "Vous êtes rémunéré" },
            body: {
              en: "You receive your commission when the client pays, as set out in your agreement.",
              fr: "Vous percevez votre commission lorsque le client paie, selon les termes de votre accord.",
            },
          },
        ],
      },
    ],
  },
};
