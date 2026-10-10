import { describe, expect, it } from "vitest";
import { pick, withIds } from "../../scripts/seed-data/localize";

describe("seed localisation helpers", () => {
  const tree = { items: [{ label: { en: "Work", fr: "Réalisations" }, href: "/work" }] };
  it("picks a locale and falls back to English only for en", () => {
    expect(pick(tree, "fr")).toEqual({ items: [{ label: "Réalisations", href: "/work" }] });
    expect(pick(tree, "rw")).toEqual({ items: [{ label: undefined, href: "/work" }] });
  });
  it("copies array row ids from the saved English document", () => {
    const saved = { items: [{ id: "row1", label: "Work", href: "/work" }] };
    expect(withIds(pick(tree, "fr"), saved)).toEqual({
      items: [{ id: "row1", label: "Réalisations", href: "/work" }],
    });
  });
});
