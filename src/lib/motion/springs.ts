// Spring tokens (UI/UX §9.1). Bounce (`playful`) only on elements < 120 px.
export const springs = {
  spatialFast: { type: "spring", stiffness: 600, damping: 38 },
  spatial: { type: "spring", stiffness: 380, damping: 32 },
  spatialSlow: { type: "spring", stiffness: 200, damping: 28 },
  playful: { type: "spring", stiffness: 500, damping: 18 },
  effects: { type: "spring", stiffness: 300, damping: 40 },
} as const;
