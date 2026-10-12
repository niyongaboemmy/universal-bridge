// UB-supplied renders (brand/source/images). All are AI-generated, so every one
// is flagged as a concept and shows a visible "Concept" label (OI-06, UI/UX §14.4).
// Not used: AI portraits of people, HQ/fleet renders, UB Smart phone (OI-05),
// business-card mockups (placeholder contacts, OI-11), posters with baked-in text.
type L = { en: string; fr?: string };

export const conceptImages: { key: string; file: string; alt: L }[] = [
  {
    key: "lobby-signage",
    file: "Futuristic Universal Bridge Lobby Signage.png",
    alt: {
      en: "Concept render of an illuminated Universal Bridge sign reading “Building smart solutions. Connecting the future.” beside a circuit-patterned wall",
      fr: "Rendu conceptuel d'une enseigne lumineuse Universal Bridge « Building smart solutions. Connecting the future. » près d'un mur à motif de circuits",
    },
  },
  {
    key: "lobby-backlit",
    file: "Futuristic Universal Bridge Office Lobby.png",
    alt: {
      en: "Concept render of a dark, backlit 3D “UB Universal Bridge Ltd” sign on a textured wall, with the line “Building smart solutions. Connecting the future.”, a plant and warm wall-wash lighting",
      fr: "Rendu conceptuel d'une enseigne 3D rétroéclairée « UB Universal Bridge Ltd » sur un mur texturé, avec la phrase « Building smart solutions. Connecting the future. », une plante et un éclairage chaud",
    },
  },
  {
    key: "lobby-corridor",
    file: "Futuristic Universal Bridge Lobby.png",
    alt: {
      en: "Concept render of a glass-walled corridor leading to a glowing Universal Bridge logo wall",
      fr: "Rendu conceptuel d'un couloir vitré menant à un mur lumineux au logo Universal Bridge",
    },
  },
  {
    key: "office-reception",
    file: "Universal Bridge Tech Office Lobby.png",
    alt: {
      en: "Concept render of a Universal Bridge reception with a logo wall and an open-plan office behind it",
      fr: "Rendu conceptuel d'un accueil Universal Bridge avec un mur logo et un bureau ouvert",
    },
  },
  {
    key: "office-workspace",
    file: "Universal Bridge Tech Workspace.png",
    alt: {
      en: "Concept render of a bright Universal Bridge workspace with desks, meeting room and “Code. Connect. Create impact.” on the wall",
      fr: "Rendu conceptuel d'un espace de travail lumineux Universal Bridge",
    },
  },
  {
    key: "coding-hub",
    file: "Modern Universal Bridge Coding Hub.png",
    alt: {
      en: "Concept render of the Coding Hub: developers working at rows of screens",
      fr: "Rendu conceptuel du Coding Hub : des développeurs devant des rangées d'écrans",
    },
  },
  {
    key: "ai-hub",
    file: "Universal Bridge AI Innovation Hub.png",
    alt: {
      en: "Concept render of the AI Innovations Hub with engineers at workstations and AI dashboards on the walls",
      fr: "Rendu conceptuel de l'AI Innovations Hub avec des ingénieurs et des tableaux de bord d'IA",
    },
  },
  {
    key: "robotics-hub",
    file: "Universal Bridge Robotics Hub.png",
    alt: {
      en: "Concept render of the Embedded Systems Hub: engineers building circuits, drones and a small robot",
      fr: "Rendu conceptuel de l'Embedded Systems Hub : circuits, drones et petit robot",
    },
  },
  {
    key: "academy-hub",
    file: "Universal Bridge Academy Tech Hub.png",
    alt: {
      en: "Concept render of a UB Academy learning space with students working on laptops",
      fr: "Rendu conceptuel d'un espace d'apprentissage UB Academy avec des étudiants sur ordinateur",
    },
  },
  {
    key: "hackathon",
    file: "Universal Bridge Hackathon Demo Day.png",
    alt: {
      en: "Concept render of a UB Hackathon demo day: a team presenting the BridgeMart concept to an audience",
      fr: "Rendu conceptuel d'une journée de démonstration du UB Hackathon : une équipe présente devant le public",
    },
  },
];
