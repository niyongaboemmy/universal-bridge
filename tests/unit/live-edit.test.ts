import { describe, expect, it, vi } from "vitest";
import type { Field } from "payload";

vi.mock("server-only", () => ({}));
const { resolvePath, LiveEditError } = await import("@/lib/live-edit/apply");
const { child, editable, safePath } = await import("@/lib/live-edit/attrs");

const fields: Field[] = [
  { name: "title", type: "text" },
  { name: "slug", type: "text" },
  { name: "secret", type: "text", admin: { readOnly: true } },
  {
    name: "layout",
    type: "blocks",
    blocks: [
      {
        slug: "hero",
        fields: [
          { name: "title", type: "text" },
          { name: "media", type: "upload", relationTo: "media" },
          {
            name: "primary",
            type: "group",
            fields: [
              { name: "label", type: "text" },
              { name: "href", type: "text" },
            ],
          },
          { name: "flag", type: "checkbox" },
        ],
      },
      {
        slug: "cardsGrid",
        fields: [
          {
            type: "row",
            fields: [
              { name: "cards", type: "array", fields: [{ name: "body", type: "textarea" }] },
            ],
          },
        ],
      },
    ],
  },
];
const data = () => ({
  title: "Page",
  layout: [
    { id: "h1", blockType: "hero", title: "Hi", primary: { label: "Go", href: "/x" } },
    { id: "g1", blockType: "cardsGrid", cards: [{ id: "c1", body: "Card" }] },
  ],
});

describe("live edit path resolution (CMS-07)", () => {
  it("finds text in blocks, groups and arrays by row id", () => {
    const d = data();
    expect(resolvePath(fields, d, ["title"]).holder).toBe(d);
    expect(resolvePath(fields, d, ["layout", "h1", "title"]).holder).toBe(d.layout[0]);
    expect(resolvePath(fields, d, ["layout", "h1", "primary", "label"]).key).toBe("label");
    expect(resolvePath(fields, d, ["layout", "g1", "cards", "c1", "body"]).field.type).toBe(
      "textarea",
    );
    expect(resolvePath(fields, d, ["layout", "h1", "media"]).field.type).toBe("upload");
  });

  it("refuses technical, read-only and non-text fields", () => {
    for (const p of [
      ["slug"],
      ["secret"],
      ["layout", "h1", "primary", "href"],
      ["layout", "h1", "flag"],
      ["layout"],
      ["nope"],
    ]) {
      expect(() => resolvePath(fields, data(), p)).toThrow(LiveEditError);
    }
  });

  it("reports a missing row as a conflict", () => {
    try {
      resolvePath(fields, data(), ["layout", "gone", "title"]);
      expect.unreachable();
    } catch (e) {
      expect((e as InstanceType<typeof LiveEditError>).status).toBe(409);
    }
  });
});

describe("live edit markup", () => {
  it("adds nothing for visitors", () => {
    expect(editable(undefined, "title", "text", "x")).toEqual({});
    expect(child(undefined, "layout", "a")).toBeUndefined();
    expect(
      child({ collection: "pages", id: 1, locale: "en", path: "" }, "layout", null),
    ).toBeUndefined();
  });

  it("describes where a value lives", () => {
    const ref = child(
      { collection: "pages", id: 7, locale: "fr", path: "", version: "v1", status: "draft" },
      "layout",
      "b1",
    );
    const attrs = editable(ref, "title", "accent", "Hello *world*");
    expect(JSON.parse(attrs["data-edit"]!)).toMatchObject({
      c: "pages",
      id: 7,
      l: "fr",
      p: "layout.b1.title",
      k: "accent",
      v: "v1",
      s: "draft",
    });
    expect(attrs["data-edit-raw"]).toBe("Hello *world*");
  });

  it("only redirects to site pages", () => {
    expect(safePath("/services")).toBe("/services");
    expect(safePath("//evil.com")).toBe("/");
    expect(safePath("https://evil.com")).toBe("/");
    expect(safePath("/admin")).toBe("/");
    expect(safePath("/api/x")).toBe("/");
  });
});
