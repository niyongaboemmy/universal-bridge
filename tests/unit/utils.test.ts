import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps colour and custom font size together", () => {
    expect(cn("text-on-accent", "text-body-sm")).toBe("text-on-accent text-body-sm");
  });
  it("still dedupes conflicting sizes", () => {
    expect(cn("text-body-sm", "text-body-lg")).toBe("text-body-lg");
  });
});

import { mediaSrc } from "@/lib/cms/media-src";

describe("mediaSrc", () => {
  it("makes our own media URLs relative for next/image", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://universalbridge.rw";
    expect(mediaSrc("https://universalbridge.rw/api/media/file/a.webp")).toBe(
      "/api/media/file/a.webp",
    );
    expect(mediaSrc("http://localhost:3000/api/media/file/b.webp?2")).toBe(
      "/api/media/file/b.webp?2",
    );
    expect(mediaSrc("https://cdn.example.com/x.webp")).toBe("https://cdn.example.com/x.webp");
    expect(mediaSrc("/api/media/file/c.webp")).toBe("/api/media/file/c.webp");
  });
});
