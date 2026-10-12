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
    tagline: {
      en: "Web, mobile and cloud software, built for real phones and real networks.",
      fr: "Logiciels web, mobile et cloud, conçus pour de vrais téléphones et de vrais réseaux.",
    },
    summary: {
      en: "The Coding Hub is where our engineers build and test web platforms, mobile apps and cloud infrastructure. It is also where Academy learners and interns pair with them on live projects.",
      fr: "Le Coding Hub est l'endroit où nos ingénieurs développent et testent plateformes web, applications mobiles et infrastructure cloud. Apprenants et stagiaires de l'Académie y travaillent avec eux sur de vrais projets.",
    },
    focusAreas: [
      {
        icon: "code",
        title: { en: "Web platforms", fr: "Plateformes web" },
        body: {
          en: "Fast, accessible web apps with Next.js and Node.js, rendered on the server so they work on slow connections.",
          fr: "Des applications web rapides et accessibles avec Next.js et Node.js, rendues côté serveur pour les connexions lentes.",
        },
      },
      {
        icon: "smartphone",
        title: { en: "Mobile apps", fr: "Applications mobiles" },
        body: {
          en: "Android and iOS apps that stay light on mid-range phones and keep working offline.",
          fr: "Des applications Android et iOS légères sur les téléphones de milieu de gamme, qui fonctionnent hors ligne.",
        },
      },
      {
        icon: "cloud",
        title: { en: "Cloud & DevOps", fr: "Cloud et DevOps" },
        body: {
          en: "CI/CD pipelines, monitoring and in-country hosting options, so releases are routine and reversible.",
          fr: "Pipelines CI/CD, supervision et hébergement possible au Rwanda, pour des mises en production simples et réversibles.",
        },
      },
      {
        icon: "badge-check",
        title: { en: "Quality and accessibility", fr: "Qualité et accessibilité" },
        body: {
          en: "Automated tests, performance budgets and WCAG 2.2 checks built into every release.",
          fr: "Tests automatisés, budgets de performance et contrôles WCAG 2.2 intégrés à chaque version.",
        },
      },
    ],
    equipment: [
      {
        text: {
          en: "Pair-programming stations for engineers, interns and learners",
          fr: "Postes de programmation en binôme pour ingénieurs, stagiaires et apprenants",
        },
      },
      {
        text: {
          en: "Device lab of Android and iOS phones for real-world testing",
          fr: "Parc de téléphones Android et iOS pour des tests en conditions réelles",
        },
      },
      {
        text: {
          en: "Staging cloud environment that mirrors production",
          fr: "Environnement cloud de préproduction identique à la production",
        },
      },
    ],
    projects: [
      {
        title: { en: "Nyambika Design marketplace", fr: "Place de marché Nyambika Design" },
        body: {
          en: "Our live marketplace connecting customers with Rwandan tailors, cooperatives and producers for custom and bulk clothing orders.",
          fr: "Notre place de marché en ligne qui relie les clients aux tailleurs, coopératives et producteurs rwandais pour le sur-mesure et les commandes en gros.",
        },
        status: "live",
      },
      {
        title: { en: "universalbridge.rw platform", fr: "Plateforme universalbridge.rw" },
        body: {
          en: "This website: trilingual content, online Academy applications and certificate verification, built to load fast on mid-range phones.",
          fr: "Ce site : contenus en trois langues, candidatures en ligne à l'Académie et vérification des certificats, conçu pour être rapide sur mobile.",
        },
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
      en: "The AI Innovations Hub explores practical AI that genuinely saves time for organisations in Rwanda and beyond. We test ideas on real, consented data and only recommend what we can show working.",
      fr: "L'AI Innovations Hub explore une IA concrète qui fait vraiment gagner du temps aux organisations, au Rwanda et ailleurs. Nous testons les idées sur des données réelles et consenties, et ne recommandons que ce qui fonctionne.",
    },
    focusAreas: [
      {
        icon: "brain",
        title: { en: "Assistants", fr: "Assistants" },
        body: {
          en: "Assistants grounded in an organisation's own documents, which answer with sources and know when to hand over to a person.",
          fr: "Des assistants fondés sur les documents de l'organisation, qui citent leurs sources et savent passer la main à une personne.",
        },
      },
      {
        icon: "badge-check",
        title: { en: "Computer vision", fr: "Vision par ordinateur" },
        body: {
          en: "Counting, inspection and recognition from photos and video, tuned for local conditions and ordinary phone cameras.",
          fr: "Comptage, inspection et reconnaissance à partir de photos et vidéos, adaptés aux conditions locales et aux caméras de téléphone.",
        },
      },
      {
        icon: "rocket",
        title: { en: "Forecasting", fr: "Prévisions" },
        body: {
          en: "Demand, price and cash-flow forecasts for SMEs and cooperatives, with honest confidence ranges.",
          fr: "Prévisions de demande, de prix et de trésorerie pour PME et coopératives, avec des marges d'incertitude honnêtes.",
        },
      },
      {
        icon: "users",
        title: { en: "Responsible AI", fr: "IA responsable" },
        body: {
          en: "Consent, privacy and human review built into every prototype, in line with Rwanda's data protection law.",
          fr: "Consentement, confidentialité et contrôle humain intégrés à chaque prototype, conformément à la loi rwandaise sur les données.",
        },
      },
    ],
    equipment: [
      {
        text: {
          en: "GPU workstations for training and evaluating models",
          fr: "Stations de travail GPU pour entraîner et évaluer les modèles",
        },
      },
      {
        text: {
          en: "Labelled local datasets, collected with consent",
          fr: "Jeux de données locaux annotés, collectés avec consentement",
        },
      },
    ],
    projects: [
      {
        title: { en: "Document assistant prototype", fr: "Prototype d'assistant documentaire" },
        body: {
          en: "An assistant that answers staff questions from an organisation's policies and manuals and cites the paragraph it used.",
          fr: "Un assistant qui répond aux questions du personnel à partir des politiques et manuels de l'organisation, en citant le passage utilisé.",
        },
        status: "prototype",
      },
      {
        title: { en: "Crop price forecasting", fr: "Prévision des prix agricoles" },
        body: {
          en: "Exploring weekly price forecasts that could help cooperatives decide when to sell.",
          fr: "Exploration de prévisions hebdomadaires de prix pour aider les coopératives à choisir quand vendre.",
        },
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
    summary: {
      en: "The Embedded Systems Hub takes hardware ideas from the breadboard to the field. We design sensors, firmware and small robots, test them in real conditions and teach the same skills through UB Academy.",
      fr: "L'Embedded Systems Hub mène les idées matérielles du circuit d'essai jusqu'au terrain. Nous concevons capteurs, firmware et petits robots, les testons en conditions réelles et enseignons ces compétences à UB Academy.",
    },
    focusAreas: [
      {
        icon: "sprout",
        title: { en: "Field sensors", fr: "Capteurs de terrain" },
        body: {
          en: "Low-power soil, water and weather monitoring with SMS alerts, designed for sites with weak connectivity.",
          fr: "Surveillance basse consommation des sols, de l'eau et de la météo avec alertes SMS, pour les sites mal connectés.",
        },
      },
      {
        icon: "rocket",
        title: { en: "Drones", fr: "Drones" },
        body: {
          en: "Mapping and inspection experiments, carried out within Rwanda's rules for drone use.",
          fr: "Expériences de cartographie et d'inspection, menées dans le respect des règles rwandaises sur les drones.",
        },
      },
      {
        icon: "cpu",
        title: { en: "Robotics", fr: "Robotique" },
        body: {
          en: "Small robots for teaching and research, from line-followers to robots that use a camera to see.",
          fr: "Des petits robots pour l'enseignement et la recherche, du suiveur de ligne au robot équipé d'une caméra.",
        },
      },
      {
        icon: "cloud",
        title: { en: "Connected devices", fr: "Objets connectés" },
        body: {
          en: "Firmware, connectivity and dashboards that turn a device's readings into decisions.",
          fr: "Firmware, connectivité et tableaux de bord qui transforment les mesures en décisions.",
        },
      },
    ],
    equipment: [
      {
        text: {
          en: "ESP32 and Arduino kits for prototyping and teaching",
          fr: "Kits ESP32 et Arduino pour le prototypage et l'enseignement",
        },
      },
      {
        text: {
          en: "Raspberry Pi cluster for edge computing experiments",
          fr: "Cluster Raspberry Pi pour les expériences de calcul en périphérie",
        },
      },
      {
        text: {
          en: "Soldering and test bench",
          fr: "Poste de soudure et banc de test",
        },
      },
      {
        text: {
          en: "3D printer for enclosures and mechanical parts",
          fr: "Imprimante 3D pour boîtiers et pièces mécaniques",
        },
      },
    ],
    projects: [
      {
        title: { en: "Soil-moisture node", fr: "Capteur d'humidité du sol" },
        body: {
          en: "A low-power sensor that sends soil-moisture readings and SMS alerts so small farms can irrigate at the right time.",
          fr: "Un capteur basse consommation qui envoie l'humidité du sol et des alertes SMS pour irriguer au bon moment.",
        },
        status: "pilot",
      },
      {
        title: { en: "Drone mapping experiments", fr: "Expériences de cartographie par drone" },
        body: {
          en: "Testing how aerial images can support mapping and inspection work.",
          fr: "Tester comment les images aériennes peuvent appuyer la cartographie et l'inspection.",
        },
        status: "exploring",
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
      en: `Most people who use the software we build in Rwanda are on a mid-range Android phone, often on 3G or a busy 4G network. They pay for data by the megabyte, and their phone has a fraction of the processing power of the laptop the app was built on. If a page needs ten seconds to become usable, many of them simply leave. So we design for that phone first, and everything else gets easier.
This is the checklist our teams use on every web project. None of it is exotic. The hard part is applying it consistently, from the first sprint to the last.
## Start with a budget
Every page has a performance budget: a maximum amount of JavaScript, a maximum page weight and a target time until the page is usable. The budget is checked automatically in our CI pipeline against the production build. If a change pushes a page over the limit, the build fails and the team has to make a choice, rather than letting the app slowly get heavier.
It is much easier to stay fast than to become fast later. Retro-fitting performance onto a finished app usually means rewriting parts of it. A budget agreed in week one costs almost nothing.
## Render on the server
Text, images and buttons should arrive as HTML. That way the page is readable, and its main links and forms work, before any JavaScript runs. Interactive parts such as a date picker, a map or a live search load afterwards as small, separate pieces, often called islands.
This matters more than any other single decision. On a slow phone, downloading, parsing and running a large JavaScript bundle can take longer than the network transfer itself. Server rendering removes most of that work from the critical path.
## Be careful with images and fonts
- Serve modern formats (AVIF or WebP) in several sizes, and let the browser pick the right one for the screen.
- Give every image a width and height, so the page does not jump while it loads.
- Lazy-load images below the fold. Only the first, most important image should load immediately.
- Use one or two font files at most, and show text in a system font until they arrive.
A single unoptimised hero photo can weigh more than the rest of the page combined. Image discipline is often the quickest win on an existing site.
## Forms that survive bad networks
Forms are where slow networks cost real money: a lost job application, an abandoned payment, a field report that has to be re-typed. Our rules:
- Forms submit even if JavaScript has not loaded yet, using plain HTML as the fallback.
- Long forms save drafts on the device, so a dropped connection does not lose an application.
- Errors are shown next to each field and summarised at the top, in plain language.
- Submissions are safe to retry. If the network drops after the user taps Send, sending again must not create a duplicate.
Where people work in the field with no signal at all, we go further and build offline-first: data is stored on the device and synchronised when a connection returns.
## Cache what does not change
Logos, scripts and stylesheets should be cached for a long time, with a new file name whenever they change. Repeat visits then load almost instantly and use very little data. For pages that change rarely, a content delivery network can serve them from a location close to the user.
## Test on the real phone
Emulators and browser developer tools are useful, and we throttle the network in every test run. But nothing replaces a real mid-range phone on a real network. We keep a small device lab in the Coding Hub and test every release on it before it goes live. It regularly finds problems that a fast laptop hides: a menu that stutters, a keyboard that covers the Submit button, a page that heats the phone.
## Measure in production
Lab tests tell you how fast the app could be. Real-user monitoring tells you how fast it actually is, for the people using it, on their devices and networks. We track the Core Web Vitals for real visits, with consent, and review them during each sprint.
## The payoff
Fast pages are not only a technical achievement. They reach more people, cost users less data, and are usually more accessible too, because the same discipline that keeps pages light also keeps them simple. If you are planning a new web app for users in East Africa, put the mid-range Android phone at the centre of the brief. Everyone else will benefit as well.`,
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
      en: `Rwanda's Law No. 058/2021 on the protection of personal data and privacy applies to any organisation that processes the personal data of people in Rwanda, whether the organisation is based in Kigali or abroad. For product teams it changes real design decisions: where the database lives, what a sign-up form asks for, and what happens when something goes wrong.
This is a practical summary from a software team's point of view. It is not legal advice. Always confirm the details for your situation with a qualified legal adviser and with the National Cyber Security Authority (NCSA), which supervises the law.
## Register as a data controller or processor
Organisations that decide why and how personal data is processed (controllers), and those that process it on their behalf (processors), register with the NCSA. If you are commissioning a new system, check your registration status early. It affects your launch plan, and some of the information you will be asked for, such as where data is stored, comes straight from your technical design.
## Keep data in Rwanda, or get authorisation
Personal data is to be stored in Rwanda unless the NCSA authorises storage outside the country. This is the point that most often surprises teams used to choosing any cloud region they like.
In practice, you have two options:
- Host the database and file storage in-country, with a local data centre or cloud provider.
- Apply for authorisation to store data abroad, and make sure your contracts with providers include the safeguards the law expects.
Either way, decide before you build. Moving a live system between countries is far harder than choosing the right location at the start. Remember backups, logs and analytics tools too: they often contain personal data and are easy to overlook.
## Collect less, and ask clearly
The simplest way to reduce risk is to hold less data.
- Only collect what you need for a stated purpose, and say what that purpose is.
- Ask for consent in plain language, with an unticked box, separately for each purpose such as newsletters or analytics.
- Record what each person agreed to, the wording they saw and when.
- Set retention periods, and delete data automatically when they end.
Children need particular care. Processing a child's data generally requires the consent of a parent or guardian, so school, education and youth projects should plan for that from the first workshop.
## Build in people's rights
People have the right to know what data you hold about them, to get a copy, to have it corrected or deleted, and to object to certain uses. These requests are much easier to handle if the system was designed for them.
Useful features to plan from the start:
- An admin tool to find everything held about one person, across all modules.
- Export of that data in a readable format.
- Deletion or anonymisation that also reaches attachments and secondary copies.
- An audit log showing who accessed sensitive records and when.
## Be ready for requests and incidents
If a personal-data breach happens, the law requires the controller to notify the NCSA within 48 hours of becoming aware of it, and in some cases to inform the people affected. Forty-eight hours is short. Teams that have never practised usually spend most of it working out what happened.
Prepare before launch:
- Logging and monitoring good enough to tell what was accessed.
- A short incident plan naming who decides, who investigates and who communicates.
- Contact details for your hosting provider and any processors.
## Security by default
The law expects appropriate technical and organisational measures. For most systems that means encryption in transit and at rest, strong authentication for staff, access limited by role, regular updates and tested backups. None of these are new ideas; the law simply makes them an obligation rather than a good intention.
## What this means for your next project
Treat data protection as a requirement, not a final check. Put data location, consent, retention and incident response into the specification, and ask your development partner how each will be handled. At Universal Bridge we design systems around Law No. 058/2021 by default, and we are always happy to walk through what it means for a specific project. For legal questions, though, talk to a lawyer.`,
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
      en: `When companies in Europe and the Gulf look for a software delivery partner, the conversation usually starts with price. It rarely ends there. Teams that have worked with distant vendors know that time zones, communication and trust decide whether a partnership succeeds. This is where Kigali has quiet advantages that are worth a closer look.
## The same working day
Kigali is on UTC+2 all year, with no daylight-saving changes. In the European summer, that is the same time as Paris, Berlin and Brussels; in winter, we are one hour ahead. London is one or two hours behind. The Gulf is one or two hours ahead.
That means stand-ups, sprint reviews and quick calls happen in normal office hours on both sides. Nobody has to join a demo at midnight, and a question asked in the morning gets an answer the same morning. For teams used to a full day's delay on every decision, this changes the pace of a project.
With the US East Coast the overlap is smaller but still useful: their morning is our afternoon, which leaves time for a daily check-in.
## Three working languages
Our teams work in English and French, and in Kinyarwanda with local users. Rwanda's official languages also include Swahili, and many professionals move easily between several. For European companies with francophone markets, or programmes that span East and Central Africa, being able to run workshops, write documentation and support users in French as well as English is a practical advantage.
## An ecosystem that is growing
Rwanda has invested heavily in connectivity, digital public services and its tech sector. Kigali Innovation City is being developed as a hub for universities, technology companies and start-ups, and Smart Africa, the alliance of African governments working on digital transformation, has its headquarters in Kigali. Business registration is quick, and the city is known for being safe, clean and easy to work in.
New engineers graduate every year, and many of them are keen to work on international products. Through UB Academy and our internship programme we train some of them ourselves, which also gives us a direct view of emerging talent.
## Data protection that you can explain to your board
Rwanda's Law No. 058/2021 on personal data protection is modern and closely aligned with principles that European teams will recognise from the GDPR: purpose limitation, consent, people's rights and breach notification. That makes it easier to explain your data-handling approach to customers and auditors, whether the data stays in Rwanda or not.
## What to look for in a partner
Location helps, but the partner matters more. Questions we would ask any vendor, including ourselves:
- Who exactly will work on our product, and how much of their time will it get?
- How often will we see working software? (Our answer: every two weeks, at a demo.)
- Who owns the code, and where does it live during the project?
- How are security, testing and documentation handled?
- What happens after launch?
Good answers are specific. Vague ones are a warning sign.
## How to start
The best first step is usually a small, well-defined project: a prototype, an integration, or a feature your own team does not have time for. You see how we communicate, plan and deliver, and we learn your product and standards, before anyone commits to a larger team. If it works, a dedicated team or staff augmentation can follow. If it does not, both sides have learned something at a modest cost.
Built in Kigali, delivering worldwide is more than a slogan for us. It is a working arrangement that suits teams who value overlap, clear communication and steady progress over the lowest possible hourly rate.`,
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
      en: `Many of the developers we work with started as interns or Academy learners. Watching people grow from their first pull request to leading features has taught us a lot about what helps juniors succeed, and about what quietly makes them fail. If you are a small company about to hire your first junior developer, here is what we have learned.
## Look for learning, not just knowledge
A junior developer's CV will list frameworks. Most of those lists look the same. What separates candidates is how they learn.
A portfolio project that the candidate can explain line by line tells you more than a long list of technologies. Ask them to walk you through something they built: why they made a choice, what went wrong, what they would do differently now. Strong juniors are curious about their own mistakes. They say "I don't know yet, but here is how I would find out" without embarrassment.
A short practical task helps too, as long as it is small, relevant and respectful of the candidate's time. Pairing on a small bug for half an hour often reveals more than a take-home assignment.
## Prepare before they arrive
The first week sets the tone. Before a junior starts:
- Make sure they will have a working laptop, accounts and access on day one.
- Write down how to run the project locally, and ask the junior to fix the instructions wherever they are wrong. It is a useful first contribution.
- Choose a first task that is small, real and can be finished within a few days.
A junior who ships something real in their first week gains confidence that no welcome meeting can provide.
## Give them a real project and a mentor
Juniors learn fastest on real work with a real user, not on exercises nobody will use. At the same time, they need someone to turn to.
- One clear project or feature area with a real user.
- A named mentor and a weekly check-in, even when things are going well.
- Small, frequent code reviews instead of one big review at the end.
- Permission to ask questions, stated explicitly. Many juniors stay stuck for hours because they are afraid of looking slow.
The mentor does not need to be a senior architect. A developer one or two years ahead often remembers the obstacles best. Mentoring is also one of the best ways for that developer to grow.
## Make progress visible
We ask interns to demo their work every two weeks, alongside the rest of the team. It builds confidence, gives them practice explaining technical work to non-technical people, and catches misunderstandings early, while they are still cheap to fix.
Keep a simple record of what the junior has learned and delivered. After three months it becomes the basis of an honest conversation about the next step.
## Review code kindly and clearly
Code review is where most learning happens, and where it is easiest to discourage someone. Explain the why behind a comment, separate must-fix issues from preferences, and point out what was done well. Link to examples or documentation rather than just writing "wrong".
## Avoid the common traps
- Leaving a junior alone on a critical system with no review.
- Giving only maintenance chores and never a feature they can own.
- Judging them on speed in the first month, when they are mostly learning your codebase.
- Hiring a junior because the team is too busy to help them. They will need time from someone.
## Verify certificates
Every UB internship and training certificate has a unique code and a QR code. Employers can check it in seconds at universalbridge.rw/academy/verify, which confirms whether the certificate is genuine and what it was issued for.
## A good investment
A junior developer is not a cheaper senior. They are an investment that, with the right support, becomes a capable engineer who knows your product, your users and your way of working. For small companies, that can be one of the best hires they make.`,
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
      en: "The UB Hackathon brought student teams together to turn ideas into working prototypes, then present them live at a closing demo session.",
      fr: "Le UB Hackathon a réuni des équipes d'étudiants pour transformer leurs idées en prototypes fonctionnels, présentés en direct lors d'une séance de démonstration.",
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
    bio: {
      en: "Leads Universal Bridge's strategy, client relationships and partnerships, and is accountable for the quality of everything the company delivers, from client projects to UB Academy.",
      fr: "Dirige la stratégie, les relations clients et les partenariats d'Universal Bridge, et répond de la qualité de tout ce que l'entreprise livre, des projets clients à UB Academy.",
    },
  },
  {
    name: "Joseph Shyirambere",
    order: 20,
    title: {
      en: "Chief Technology Officer",
      fr: "Directeur technique",
      rw: "Umuyobozi w'Ikoranabuhanga",
    },
    bio: {
      en: "Owns technical direction across our engineering teams and labs: architecture, security, engineering standards and the tools and practices our developers use every day.",
      fr: "Porte la direction technique des équipes d'ingénierie et des labs : architecture, sécurité, standards d'ingénierie, outils et pratiques de nos développeurs.",
    },
  },
  {
    name: "Aristide Tuyisenge",
    order: 30,
    title: { en: "Product Manager", fr: "Chef de produit", rw: "Umuyobozi w'Ibicuruzwa" },
    bio: {
      en: "Shapes what we build and why. Turns user needs into clear priorities and roadmaps for our own products, including Nyambika Design, and works with clients to define what success looks like.",
      fr: "Définit ce que nous construisons et pourquoi. Traduit les besoins des utilisateurs en priorités et feuilles de route pour nos produits, dont Nyambika Design, et aide les clients à définir le succès.",
    },
  },
  {
    name: "Jeanne Beula Nzabihimana",
    order: 40,
    title: { en: "Marketing Officer", fr: "Responsable marketing", rw: "Ushinzwe Kwamamaza" },
    bio: {
      en: "Leads how Universal Bridge presents itself: brand, communications, events and outreach for our services, products and UB Academy.",
      fr: "Pilote l'image d'Universal Bridge : marque, communication, événements et promotion de nos services, produits et de UB Academy.",
    },
  },
  {
    name: "Patrick Ishimwe",
    order: 50,
    title: { en: "HR Manager", fr: "Responsable RH", rw: "Umuyobozi w'Abakozi" },
    bio: {
      en: "Looks after our people: recruitment, onboarding, internships and team development, so everyone at Universal Bridge has the support to do their best work.",
      fr: "Prend soin de nos équipes : recrutement, intégration, stages et développement, pour que chacun chez Universal Bridge ait le soutien nécessaire pour donner le meilleur.",
    },
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
          en: "Our three hubs are where engineers, interns and Academy learners prototype what comes next: new software, practical AI and connected devices, tested before they reach a client.",
          fr: "Nos trois hubs sont l'endroit où ingénieurs, stagiaires et apprenants prototypent la suite : nouveaux logiciels, IA concrète et objets connectés, testés avant d'arriver chez un client.",
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
          en: "Since 2019, Universal Bridge has helped organisations solve real problems with software, from its first projects in Kigali to a company with three labs, an Academy and its own products.",
          fr: "Depuis 2019, Universal Bridge aide les organisations à résoudre de vrais problèmes grâce au logiciel : de ses premiers projets à Kigali à une entreprise dotée de trois labs, d'une académie et de ses propres produits.",
        },
        media: "office-reception",
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "WHAT DRIVES US", fr: "CE QUI NOUS ANIME", rw: "IBITUYOBORA" },
        title: { en: "Mission and values", fr: "Mission et valeurs", rw: "Intego n'indangagaciro" },
        lead: {
          en: "Building Smart Solutions. Connecting the Future. These are the principles behind that promise.",
          fr: "Building Smart Solutions. Connecting the Future. Voici les principes derrière cette promesse.",
        },
        cards: [
          {
            icon: "compass",
            title: { en: "Mission", fr: "Mission", rw: "Intego" },
            body: {
              en: "To identify real problems in society and solve them with practical technology that people can actually use, whatever their device, language or connection.",
              fr: "Identifier les vrais problèmes de la société et les résoudre avec une technologie pratique, utilisable par chacun, quels que soient son appareil, sa langue ou sa connexion.",
            },
          },
          {
            icon: "rocket",
            title: { en: "Vision", fr: "Vision", rw: "Icyerekezo" },
            body: {
              en: "A technology partner built in Kigali that organisations anywhere can rely on, and a place where the next generation of African engineers learns to lead.",
              fr: "Un partenaire technologique né à Kigali sur lequel les organisations du monde entier peuvent compter, et un lieu où la prochaine génération d'ingénieurs africains apprend à diriger.",
            },
          },
          {
            icon: "badge-check",
            title: { en: "Proof over promises", fr: "Des preuves, pas des promesses" },
            body: {
              en: "We only publish results we can verify. Every figure on this site is dated and sourced, and case studies appear only with the client's approval.",
              fr: "Nous ne publions que des résultats vérifiables. Chaque chiffre de ce site est daté et sourcé, et les études de cas ne paraissent qu'avec l'accord du client.",
            },
          },
          {
            icon: "users",
            title: { en: "People first", fr: "L'humain d'abord" },
            body: {
              en: "We design for the person on the other side of the screen: accessible, clear, in their language, and respectful of their privacy.",
              fr: "Nous concevons pour la personne de l'autre côté de l'écran : accessible, clair, dans sa langue et respectueux de sa vie privée.",
            },
          },
          {
            icon: "handshake",
            title: { en: "Ownership", fr: "Responsabilité" },
            body: {
              en: "We take responsibility for outcomes, not just tasks. You own your code and data, and we stay accountable long after launch.",
              fr: "Nous assumons les résultats, pas seulement les tâches. Votre code et vos données vous appartiennent, et nous restons responsables bien après le lancement.",
            },
          },
          {
            icon: "graduation-cap",
            title: { en: "Always learning", fr: "Toujours apprendre" },
            body: {
              en: "We teach what we practise. Our engineers mentor interns and Academy learners, and everyone keeps learning from the projects we deliver.",
              fr: "Nous enseignons ce que nous pratiquons. Nos ingénieurs encadrent stagiaires et apprenants, et chacun continue d'apprendre de nos projets.",
            },
          },
        ],
      },
      {
        blockType: "cardsGrid",
        eyebrow: { en: "WHAT WE DO", fr: "CE QUE NOUS FAISONS", rw: "ICYO DUKORA" },
        title: {
          en: "Four pillars, one team",
          fr: "Quatre piliers, une équipe",
          rw: "Inkingi enye, itsinda rimwe",
        },
        cards: [
          {
            icon: "code",
            title: { en: "Engineering", fr: "Ingénierie", rw: "Ubwubatsi" },
            body: {
              en: "Custom software, web and mobile applications designed around how organisations really work.",
              fr: "Logiciels sur mesure et applications web et mobiles conçus autour du fonctionnement réel des organisations.",
            },
            href: "/services/custom-software",
          },
          {
            icon: "cloud",
            title: { en: "Technology", fr: "Technologie", rw: "Ikoranabuhanga" },
            body: {
              en: "Cloud infrastructure, DevOps and design that keep products reliable, fast and easy to use.",
              fr: "Infrastructure cloud, DevOps et design pour des produits fiables, rapides et simples à utiliser.",
            },
            href: "/services/cloud-devops",
          },
          {
            icon: "brain",
            title: { en: "Innovation", fr: "Innovation", rw: "Udushya" },
            body: {
              en: "AI, data, embedded systems and IoT, explored in our labs and brought into real projects.",
              fr: "IA, données, systèmes embarqués et IoT, explorés dans nos labs et mis en œuvre dans de vrais projets.",
            },
            href: "/labs",
          },
          {
            icon: "compass",
            title: { en: "Consulting", fr: "Conseil", rw: "Ubujyanama" },
            body: {
              en: "System analysis, project planning and managed IT support that keep technology working for the business.",
              fr: "Analyse des systèmes, planification de projets et infogérance pour que la technologie serve l'activité.",
            },
            href: "/services/it-consulting",
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
            body: {
              en: "We start with software development, IT support and training, and a simple mission: find real problems in society and solve them with practical technology.",
              fr: "Nous commençons par le développement logiciel, le support informatique et la formation, avec une mission simple : repérer les vrais problèmes de la société et les résoudre par la technologie.",
            },
          },
          {
            year: "2024",
            title: { en: "UB Hackathon", fr: "UB Hackathon" },
            body: {
              en: "Student teams turn ideas into working prototypes and demo them live, a first step in building a community around our labs and Academy.",
              fr: "Des équipes d'étudiants transforment leurs idées en prototypes et les présentent en direct : un premier pas vers une communauté autour de nos labs et de l'Académie.",
            },
          },
          {
            year: "2026",
            title: { en: "Labs and a new platform", fr: "Labs et nouvelle plateforme" },
            body: {
              en: "We organise our research into three hubs (Coding, AI Innovations and Embedded Systems) and launch this trilingual website with online Academy applications and verifiable certificates.",
              fr: "Nous structurons notre recherche en trois hubs (Coding, AI Innovations et Embedded Systems) et lançons ce site trilingue avec candidatures en ligne à l'Académie et certificats vérifiables.",
            },
          },
          {
            year: { en: "Today", fr: "Aujourd'hui", rw: "Ubu" },
            title: {
              en: "Services, products and an Academy",
              fr: "Services, produits et académie",
            },
            body: {
              en: "We deliver client projects across four pillars, run our own marketplace, Nyambika Design, and train the next generation of engineers through UB Academy and internships.",
              fr: "Nous menons des projets clients sur quatre piliers, exploitons notre propre place de marché, Nyambika Design, et formons la relève via UB Academy et nos stages.",
            },
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
          en: "Kigali is one of Africa's best-connected tech hubs, and it shares your working day if you are in Europe or the Gulf.",
          fr: "Kigali est l'un des hubs tech les mieux connectés d'Afrique, et partage votre journée de travail si vous êtes en Europe ou dans le Golfe.",
        },
        points: [
          {
            title: { en: "UTC+2, all year", fr: "UTC+2, toute l'année" },
            body: {
              en: "No daylight-saving changes: full overlap with European working hours.",
              fr: "Pas de changement d'heure : une journée de travail commune avec l'Europe.",
            },
          },
          {
            title: { en: "Three languages", fr: "Trois langues" },
            body: {
              en: "We work in English, French and Kinyarwanda.",
              fr: "Nous travaillons en anglais, en français et en kinyarwanda.",
            },
          },
          {
            title: { en: "Data protection", fr: "Protection des données" },
            body: {
              en: "Designed around Rwanda's Law No. 058/2021, with GDPR in mind.",
              fr: "Conçu selon la loi rwandaise n° 058/2021, en tenant compte du RGPD.",
            },
          },
          {
            title: { en: "Kigali Innovation City", fr: "Kigali Innovation City" },
            body: {
              en: "A fast-growing ecosystem of universities, start-ups and tech companies.",
              fr: "Un écosystème en plein essor d'universités, de start-up et d'entreprises tech.",
            },
          },
        ],
      },
      {
        blockType: "ctaBand",
        title: {
          en: "Meet the people behind Universal Bridge.",
          fr: "Rencontrez l'équipe d'Universal Bridge.",
        },
        lead: {
          en: "Get to know our leadership team, or explore open roles if you would like to build with us.",
          fr: "Découvrez notre équipe de direction, ou consultez nos offres si vous souhaitez construire avec nous.",
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
