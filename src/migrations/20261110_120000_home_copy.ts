import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

// Data only: shorter home page copy (hero, story steps, Labs hubs, global reach,
// Academy teaser, closing call to action). Per locale, a text changes only while it
// still holds the seeded wording, so anything an editor has rewritten is kept.
const LOCALES = ["en", "fr", "rw"] as const;
type Locale = (typeof LOCALES)[number];

const COPY: Record<Locale, [old: string, next: string][]> = {
  en: [
    ["Software, AI and devices — *engineered* in Kigali.",
     "Software & AI, *engineered* in Kigali."],
    ["We design, build and run software, AI and connected devices for companies, public institutions and NGOs, from the first idea to a system people rely on every day.",
     "Apps, AI and smart devices for companies, institutions and NGOs, from idea to launch."],
    ["We begin with your users and the problem they face, then agree goals, scope and a clear plan before any code is written.",
     "We agree on users, goals and a clear plan before writing code."],
    ["Every two-week sprint ends with a demo of working software, so you see progress early and can steer it while change is still cheap.",
     "A working demo every two weeks, so you can steer early."],
    ["We agree how success will be measured at the start, then track it after launch, so the conversation is about results, not features.",
     "We set success measures up front and track them after launch."],
    ["Web platforms, mobile apps and cloud infrastructure, built and tested for real phones on real networks.",
     "Web, mobile and cloud, tested on real phones and networks."],
    ["Assistants grounded in your own documents, computer vision and forecasting, built responsibly and with consent.",
     "AI assistants, computer vision and forecasting, built responsibly."],
    ["Sensors, drones, robots and IoT prototypes, taken from the breadboard to field tests.",
     "Sensors, drones and robots, from breadboard to field."],
    ["No daylight-saving changes: a full working-day overlap with Europe.",
     "A full working-day overlap with Europe."],
    ["Workshops, documents and support in English, French or Kinyarwanda.",
     "Support in English, French or Kinyarwanda."],
    ["Built around Rwanda's Law No. 058/2021, with GDPR in mind for EU users.",
     "Designed for Rwanda's data law and the GDPR."],
    ["Part of a fast-growing tech ecosystem in one of Africa's best-connected capitals.",
     "In one of Africa's best-connected capitals."],
    ["Hands-on courses and internships in coding, AI, robotics and design, taught by working engineers online and in Kigali. Every certificate can be verified online.",
     "Courses and internships in coding, AI, robotics and design, taught by working engineers."],
    ["Tell us what you want to build or fix. We reply within one working day with honest advice and clear next steps.",
     "Tell us what you need. We reply within one working day."],
  ],
  fr: [
    ["Logiciels, IA et objets connectés — *conçus* à Kigali.",
     "Logiciels et IA, *conçus* à Kigali."],
    ["Nous concevons, développons et exploitons logiciels, IA et objets connectés pour les entreprises, les institutions publiques et les ONG, de la première idée au système utilisé chaque jour.",
     "Applications, IA et objets connectés pour entreprises, institutions et ONG, de l'idée au lancement."],
    ["Nous partons de vos utilisateurs et de leur problème, puis fixons objectifs, périmètre et plan clair avant d'écrire la moindre ligne de code.",
     "Utilisateurs, objectifs et plan clair, avant d'écrire du code."],
    ["Chaque sprint de deux semaines se termine par une démo d'un logiciel qui fonctionne : vous voyez l'avancement tôt et pouvez l'orienter à moindre coût.",
     "Une démo fonctionnelle toutes les deux semaines, pour ajuster tôt."],
    ["Nous définissons dès le départ comment mesurer le succès, puis le suivons après le lancement : on parle de résultats, pas de fonctionnalités.",
     "Des indicateurs fixés dès le départ, suivis après le lancement."],
    ["Plateformes web, applications mobiles et infrastructure cloud, conçues et testées pour de vrais téléphones sur de vrais réseaux.",
     "Web, mobile et cloud, testés sur de vrais téléphones et réseaux."],
    ["Assistants fondés sur vos propres documents, vision par ordinateur et prévisions, développés de façon responsable et avec consentement.",
     "Assistants IA, vision par ordinateur et prévisions, de façon responsable."],
    ["Capteurs, drones, robots et prototypes IoT, du circuit d'essai jusqu'aux tests sur le terrain.",
     "Capteurs, drones et robots, du prototype au terrain."],
    ["Pas de changement d'heure : une journée de travail commune avec l'Europe.",
     "Une journée de travail commune avec l'Europe."],
    ["Ateliers, documents et support en anglais, français ou kinyarwanda.",
     "Support en anglais, français ou kinyarwanda."],
    ["Conçu selon la loi rwandaise n° 058/2021, en tenant compte du RGPD.",
     "Conçu pour la loi rwandaise sur les données et le RGPD."],
    ["Au cœur d'un écosystème tech en plein essor, dans une capitale africaine très connectée.",
     "Dans l'une des capitales les plus connectées d'Afrique."],
    ["Des formations pratiques et des stages en code, IA, robotique et design, animés par des ingénieurs en activité, en ligne et à Kigali. Chaque certificat est vérifiable en ligne.",
     "Formations et stages en code, IA, robotique et design, animés par des ingénieurs."],
    ["Dites-nous ce que vous voulez créer ou améliorer. Nous répondons sous un jour ouvré avec un avis franc et des prochaines étapes claires.",
     "Dites-nous ce dont vous avez besoin. Réponse sous un jour ouvré."],
  ],
  rw: [
    ["Porogaramu, AI n'ibikoresho — *byakorewe* i Kigali.",
     "Porogaramu na AI, *byakorewe* i Kigali."],
    ["Dukora porogaramu, AI n'ibikoresho bihujwe na interineti ku bigo, inzego za Leta n'imiryango, kuva ku gitekerezo kugeza kuri sisitemu ikoreshwa buri munsi.",
     "Porogaramu, AI n'ibikoresho bigezweho ku bigo, inzego n'imiryango, kuva ku gitekerezo kugeza bitangiye gukoreshwa."],
    ["Imbuga, porogaramu za telefoni na cloud, bigeragezwa kuri telefoni nyazo no ku miyoboro nyayo.",
     "Imbuga, telefoni na cloud, bigeragezwa ku miyoboro nyayo."],
    ["Abafasha ba AI bashingiye ku nyandiko zawe, AI ireba n'iteganyagihe ry'amakuru, byubakwa mu buryo bwizewe.",
     "Abafasha ba AI, AI ireba n'iteganyamakuru, byubakwa neza."],
    ["Sensors, drones, robots n'ibikoresho bya IoT, kuva ku igerageza kugeza ku murima.",
     "Sensors, drones na robots, kuva ku igerageza kugeza ku murima."],
    ["Amasomo ngiro n'imenyerezamwuga muri porogaramu, AI, robotike n'igishushanyo, yigishwa n'abahanga, kuri interineti n'i Kigali. Buri cyemezo kigenzurwa kuri interineti.",
     "Amasomo n'imenyerezamwuga muri porogaramu, AI, robotike n'igishushanyo, yigishwa n'abahanga."],
    ["Tubwire icyo ushaka kubaka cyangwa gukosora. Tugusubiza mu munsi umwe w'akazi, tukakugira inama.",
     "Tubwire icyo ukeneye. Tugusubiza mu munsi umwe w'akazi."],
  ],
};

/** Swap every string in the tree that equals a key of `map`; reports whether anything changed. */
function swapStrings(node: unknown, map: Map<string, string>): [unknown, boolean] {
  if (typeof node === "string") {
    const next = map.get(node);
    return next === undefined ? [node, false] : [next, true];
  }
  if (Array.isArray(node)) {
    let changed = false;
    const out = node.map((v) => {
      const [nv, c] = swapStrings(v, map);
      changed ||= c;
      return nv;
    });
    return [out, changed];
  }
  if (node && typeof node === "object") {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      const [nv, c] = swapStrings(v, map);
      changed ||= c;
      out[k] = nv;
    }
    return [out, changed];
  }
  return [node, false];
}

async function apply({ payload, req }: MigrateUpArgs, forward: boolean) {
  for (const locale of LOCALES) {
    // A text with no translation holds the English wording in every locale.
    const pairs = locale === "en" ? COPY.en : [...COPY.en, ...COPY[locale]];
    const map = new Map(pairs.map(([a, b]) => (forward ? [a, b] : [b, a])));
    const { docs } = await payload.find({
      collection: "pages",
      where: { slug: { equals: "home" } },
      locale,
      fallbackLocale: false,
      depth: 0,
      limit: 1,
      req,
    });
    const page = docs[0] as { id: number | string; layout?: unknown[] | null } | undefined;
    if (!page?.layout?.length) continue;
    const [layout, changed] = swapStrings(page.layout, map);
    if (!changed) continue;
    await payload.update({
      collection: "pages",
      id: page.id,
      locale,
      data: { layout } as never,
      depth: 0,
      req,
    });
  }
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await apply(args, true);
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await apply(args as unknown as MigrateUpArgs, false);
}
