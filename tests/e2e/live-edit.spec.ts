import { expect, test, type Page } from "@playwright/test";
import { adminToken, presetConsent } from "./helpers";

// CMS-07 live editing: edit on the page, save a draft (visitors don't see it),
// publish (visitors do), undo, conflicts, images, access and validation.

const SITE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

async function startEditing(page: Page, path: string, token: string) {
  await page.context().addCookies([{ name: "payload-token", value: token, url: SITE }]);
  await presetConsent(page);
  await page.goto(`/api/live-edit/enable?path=${encodeURIComponent(path)}`);
  await expect(page.getByRole("toolbar", { name: "Live editing" })).toBeVisible();
}

async function editText(page: Page, el: ReturnType<Page["locator"]>, text: string) {
  await el.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(text);
  await page.keyboard.press("Enter");
}

test.describe("Live editing", () => {
  test.skip(({ isMobile }) => isMobile, "staff edit on desktop");
  // These tests edit and publish the same live page. Running them in several browsers
  // at once (CI runs all projects in parallel) makes the runs overwrite each other.
  test.skip(({ browserName }) => browserName !== "chromium", "edits shared content: one browser");
  test.describe.configure({ mode: "serial" });

  test("visitors get no editor and no edit markers", async ({ page }) => {
    await presetConsent(page);
    await page.goto("/services");
    await expect(page.locator("[data-edit]")).toHaveCount(0);
    await expect(page.locator("[data-fx=liveedit]")).toHaveCount(0);
    // Without a staff session the switch sends people to sign in.
    const res = await page.request.get("/api/live-edit/enable?path=/services", { maxRedirects: 0 });
    expect(res.headers().location).toContain("/login");
  });

  test("edit a heading → draft is private → publish → visitors see it", async ({
    page,
    browser,
    request,
  }) => {
    const token = await adminToken(request);
    await startEditing(page, "/services", token);
    const eyebrow = page.locator("main p.eyebrow[data-edit]").first();
    const original = (await eyebrow.getAttribute("data-edit-raw"))!;
    const changed = `${original} · LIVE ${Date.now() % 10000}`;

    await editText(page, eyebrow, changed);
    await expect(eyebrow).toHaveText(changed);
    await expect(page.getByRole("toolbar")).toContainText("1 unsaved change");

    // Undo and redo the change from the toolbar.
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(eyebrow).toHaveText(original);
    await editText(page, eyebrow, changed);

    await page.keyboard.press("ControlOrMeta+S");
    await expect(page.getByRole("toolbar")).toContainText("Draft saved");
    await expect(page.getByRole("toolbar")).toContainText("Draft not published yet");

    // Reloading in edit mode shows the draft …
    await page.reload();
    await expect(page.locator("main p.eyebrow[data-edit]").first()).toHaveText(changed);
    // … while visitors still see the published page.
    const visitor = await browser.newPage();
    await presetConsent(visitor);
    await visitor.goto(`${SITE}/services`);
    await expect(visitor.locator("main p.eyebrow").first()).toHaveText(original);

    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByRole("toolbar")).toContainText("Published at");
    await expect
      .poll(
        async () => {
          await visitor.goto(`${SITE}/services`);
          return visitor.locator("main p.eyebrow").first().textContent();
        },
        { timeout: 30_000 },
      )
      .toBe(changed);

    // Put it back.
    await page.reload();
    const again = page.locator("main p.eyebrow[data-edit]").first();
    await expect(again).toHaveText(changed);
    await editText(page, again, original);
    await expect(page.getByRole("toolbar")).toContainText("1 unsaved change");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByRole("toolbar")).toContainText("Published at");
    await visitor.close();
  });

  test("accent titles edit with *markers* and render the orange word", async ({
    page,
    request,
  }) => {
    await startEditing(page, "/services", await adminToken(request));
    const h1 = page.locator("h1[data-edit]").first();
    const raw = (await h1.getAttribute("data-edit-raw"))!;
    await h1.click();
    await expect(h1).toHaveText(raw); // markers visible while editing
    await page.keyboard.press("Escape");
    await expect(h1.locator(".accent-word")).toHaveCount(raw.includes("*") ? 1 : 0);
    await expect(page.getByRole("toolbar")).toContainText("Up to date");
  });

  test("a stale save is refused, with the choice to keep mine or load theirs", async ({
    page,
    request,
  }) => {
    const token = await adminToken(request);
    await startEditing(page, "/company/about", token);
    const target = page.locator("main [data-edit]").first();
    const meta = JSON.parse((await target.getAttribute("data-edit"))!);
    // Someone else saves the same page (in the admin) after it was opened.
    await new Promise((r) => setTimeout(r, 1100));
    await request.patch(`/api/pages/${meta.id}?draft=true&locale=en`, {
      headers: { Authorization: `JWT ${token}` },
      data: {},
    });
    await editText(page, target, `${await target.getAttribute("data-edit-raw")} x`);
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByRole("toolbar")).toContainText("Someone else saved this page");
    await expect(page.getByRole("button", { name: "Keep mine" })).toBeVisible();
    await page.getByRole("button", { name: "Load theirs" }).click();
    // Their save is a draft: nothing unsaved here, and Publish is offered.
    await expect(page.getByRole("toolbar")).toContainText("Draft not published yet");
    await expect(page.getByRole("button", { name: "Publish" })).toBeEnabled();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByRole("toolbar")).toContainText("Published at");
  });

  test("replace an image from the media library", async ({ page, request }) => {
    const token = await adminToken(request);
    const headers = { Authorization: `JWT ${token}` };
    await startEditing(page, "/services", token);
    const image = page.locator('[data-edit*=\'"k":"image"\']').first();
    const meta = JSON.parse((await image.getAttribute("data-edit"))!);
    const originalId = Number(await image.getAttribute("data-edit-raw"));
    await image.click();
    const dialog = page.getByRole("dialog", { name: "Choose an image" });
    await expect(dialog).toBeVisible();
    const choices = dialog.locator(".le-grid button");
    await expect(choices.first()).toBeVisible();
    // Pick an image that isn't the current one.
    const count = await choices.count();
    let picked = false;
    for (let i = 0; i < count && !picked; i++) {
      await choices.nth(i).click();
      picked = !(await dialog.isVisible());
      if (!picked) break;
    }
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByRole("toolbar")).toContainText("Draft saved");
    const draft = (await (
      await request.get(`/api/pages/${meta.id}?draft=true&depth=0&locale=en`, { headers })
    ).json()) as {
      layout: { id: string; media?: number }[];
    };
    const blockId = meta.p.split(".")[1];
    expect(typeof draft.layout.find((b) => b.id === blockId)?.media).toBe("number");
    // Restore the original image and publish.
    const restore = await request.post("/api/live-edit/save", {
      headers,
      data: {
        changes: [{ ...meta, k: "image", v: originalId }],
        publish: [`pages|${meta.id}|en`],
        force: true,
      },
    });
    expect(restore.ok(), await restore.text()).toBeTruthy();
  });

  test("editing in French leaves the English page alone", async ({ page, request }) => {
    const token = await adminToken(request);
    await startEditing(page, "/fr/services", token);
    await expect(page.getByRole("toolbar")).toContainText("Editing · FR");
    const lead = page.locator('main p[data-edit*=\'"k":"textarea"\']').first();
    const meta = JSON.parse((await lead.getAttribute("data-edit"))!);
    expect(meta.l).toBe("fr");
    const original = (await lead.getAttribute("data-edit-raw"))!;
    await editText(page, lead, `${original} (FR)`);
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByRole("toolbar")).toContainText("Draft saved");
    const headers = { Authorization: `JWT ${token}` };
    const en = await (
      await request.get(`/api/pages/${meta.id}?draft=true&depth=0&locale=en`, { headers })
    ).json();
    expect(JSON.stringify(en.layout)).not.toContain(`${original} (FR)`);
    const fr = await (
      await request.get(`/api/pages/${meta.id}?draft=true&depth=0&locale=fr`, { headers })
    ).json();
    expect(JSON.stringify(fr.layout)).toContain(`${original} (FR)`);
    // Restore and publish.
    await page.reload();
    await editText(page, page.locator('main p[data-edit*=\'"k":"textarea"\']').first(), original);
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByRole("toolbar")).toContainText("Published at");
  });

  test("the save endpoint rejects paths outside editable fields, bad values and visitors", async ({
    request,
  }) => {
    const token = await adminToken(request);
    const headers = { Authorization: `JWT ${token}` };
    const page = (
      await (
        await request.get("/api/pages?where[slug][equals]=services&limit=1&depth=0", { headers })
      ).json()
    ).docs[0];
    const save = (changes: unknown[]) =>
      request.post("/api/live-edit/save", { headers, data: { changes } });
    const ch = (p: string, v: unknown, c = "pages") => ({
      c,
      id: page.id,
      l: "en",
      p,
      k: "text",
      v,
    });

    expect((await request.post("/api/live-edit/save", { data: { changes: [] } })).status()).toBe(
      401,
    );
    expect((await save([ch("slug", "hacked")])).status()).toBe(400); // technical fields stay in the admin
    expect((await save([ch("seo.title", "x")])).status()).toBe(400);
    expect((await save([ch("title", "x", "users")])).status()).toBe(400); // collection not editable
    expect((await save([ch("layout.does-not-exist.title", "x")])).status()).toBe(409);
    expect((await save([ch("_status", "published")])).status()).toBe(400);
    const block = page.layout.find((b: { blockType: string }) => b.blockType === "hero");
    expect((await save([ch(`layout.${block.id}.title`, "x".repeat(401))])).status()).toBe(400);
    expect((await save([ch(`layout.${block.id}.media`, 99999999)])).status()).toBe(400);
  });
});
