import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { adminToken, loginStaff, staffHeaders, stubGoogleAnalytics, uniqueEmail } from "./helpers";

// Company dashboard (/office): access, pipelines, records, projects, people, analytics.

const SITE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

async function asStaff(page: Page, token: string) {
  await page.context().addCookies([{ name: "payload-token", value: token, url: SITE }]);
}

/** The sidebar folds its sections; open them all. */
async function openNav(page: Page) {
  const nav = page.getByRole("navigation", { name: "Company dashboard" });
  const closed = nav.locator("button[aria-expanded=false]");
  while ((await closed.count()) > 0) await closed.first().click();
  return nav;
}

async function staffAccount(request: APIRequestContext, roles: string[]) {
  const email = uniqueEmail(roles.join("-"));
  const password = "quiet harbour lantern 26";
  const created = await request.post("/api/users", {
    headers: await staffHeaders(request),
    data: { name: `Test ${roles.join("+")}`, email, password, roles },
  });
  expect(created.ok(), await created.text()).toBeTruthy();
  const id = (await created.json()).doc.id as number;
  const token = await loginStaff(request, email, password);
  return { id, token: token as string };
}

test.describe("Company dashboard", () => {
  test.skip(({ isMobile }) => isMobile, "staff dashboard runs on desktop");

  test("signed-out visitors are sent to sign in", async ({ request }) => {
    const res = await request.get("/office", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers().location).toContain("/login");
  });

  test("overview shows the numbers and every section for a super admin", async ({
    page,
    request,
  }) => {
    await asStaff(page, await adminToken(request));
    await page.goto("/office");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Good (morning|afternoon|evening)/,
    );
    const nav = await openNav(page);
    for (const label of [
      "Overview",
      "Service requests",
      "Demo requests",
      "Messages",
      "Applicants",
      "Employees",
      "Projects & tools",
      "Website analytics",
    ]) {
      await expect(nav.getByRole("link", { name: new RegExp(label) })).toBeVisible();
    }
    await expect(page.getByText("Incoming, last 30 days")).toBeVisible();
  });

  test("roles only see their areas", async ({ page, request }) => {
    const hr = await staffAccount(request, ["hr"]);
    const sales = await staffAccount(request, ["sales"]);
    try {
      await asStaff(page, hr.token);
      await page.goto("/office");
      const nav = await openNav(page);
      await expect(nav.getByRole("link", { name: /Employees/ })).toBeVisible();
      await expect(nav.getByRole("link", { name: /Service requests/ })).toHaveCount(0);
      await page.goto("/office/requests");
      await expect(page).toHaveURL(/\/office\?denied=requests/);
      await expect(page.locator("main").getByRole("alert")).toContainText(
        "Your role doesn't include Requests",
      );

      await page.context().clearCookies();
      await asStaff(page, sales.token);
      await page.goto("/office/people");
      await expect(page).toHaveURL(/denied=people/);
      await page.goto("/office/requests");
      await expect(page.getByRole("heading", { name: "Service requests" })).toBeVisible();
    } finally {
      const headers = await staffHeaders(request);
      await request.delete(`/api/users/${hr.id}`, { headers });
      await request.delete(`/api/users/${sales.id}`, { headers });
    }
  });

  test("requests: move through the pipeline, value, follow-up and notes", async ({
    page,
    request,
  }) => {
    const headers = await staffHeaders(request);
    const lead = (
      await (
        await request.get(
          "/api/leads?where[department][equals]=sales&where[product][exists]=false&limit=1&sort=-createdAt&depth=0",
          { headers },
        )
      ).json()
    ).docs[0];
    test.skip(!lead, "needs a service request");
    const before = {
      status: lead.status,
      value: lead.value ?? null,
      nextFollowUpAt: lead.nextFollowUpAt ?? null,
    };
    await asStaff(page, await adminToken(request));
    try {
      await page.goto(`/office/requests/${lead.id}`);
      await expect(page.getByRole("heading", { name: lead.name })).toBeVisible();
      await page.getByRole("combobox", { name: /^Stage/ }).selectOption("qualified");
      await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
      await page.getByLabel("Estimated value").fill("2500000");
      await page.getByLabel("Estimated value").blur();
      await page.getByLabel("Next follow-up").fill("2030-01-15");
      await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
      const note = `Called, sending a proposal ${Date.now()}`;
      await page.getByLabel("Add a note").fill(note);
      await page.getByRole("button", { name: "Add note" }).click();
      // Wait for the save itself (the text alone is still in the textarea while saving).
      await expect(page.getByRole("status").filter({ hasText: "Note added" })).toBeVisible();
      await expect(page.getByRole("paragraph").filter({ hasText: note })).toBeVisible();

      const saved = await (await request.get(`/api/leads/${lead.id}?depth=0`, { headers })).json();
      expect(saved.status).toBe("qualified");
      expect(saved.value).toBe(2500000);
      expect(saved.nextFollowUpAt).toContain("2030-01-15");
      expect(saved.notes.at(-1).author).toBeTruthy(); // signed by the person who wrote it

      // The board moves it too (menu = keyboard/touch alternative to dragging).
      await page.goto("/office/requests");
      const card = page.locator("li", {
        has: page.locator(`a[href="/office/requests/${lead.id}"]`),
      });
      await card.getByLabel(/Move .* to another stage/).selectOption("proposal");
      await expect(page.getByRole("status").filter({ hasText: "→ proposal" })).toBeVisible();
      await expect
        .poll(
          async () =>
            (await (await request.get(`/api/leads/${lead.id}?depth=0`, { headers })).json()).status,
        )
        .toBe("proposal");
    } finally {
      await request.patch(`/api/leads/${lead.id}`, {
        headers,
        data: { ...before, notes: lead.notes ?? [] },
      });
    }
  });

  test("applicants: stage, rating and the applicant email toggle", async ({ page, request }) => {
    const headers = await staffHeaders(request);
    const app = (
      await (
        await request.get(
          "/api/applications?where[type][equals]=academy&where[status][equals]=received&limit=1&depth=0",
          { headers },
        )
      ).json()
    ).docs[0];
    test.skip(!app, "needs an academy application");
    await asStaff(page, await adminToken(request));
    try {
      await page.goto(`/office/applicants?type=academy`);
      await expect(page.getByRole("link", { name: /Trainees/ })).toBeVisible();
      await page.goto(`/office/applicants/${app.id}`);
      await page.getByRole("checkbox", { name: /Email the applicant/ }).uncheck();
      await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
      await page.getByRole("radio", { name: "4 of 5" }).click();
      await page.getByRole("combobox", { name: /^Stage/ }).selectOption("review");
      await expect(page.getByRole("status").filter({ hasText: "Status updated" })).toBeVisible();
      const saved = await (
        await request.get(`/api/applications/${app.id}?depth=0`, { headers })
      ).json();
      expect(saved).toMatchObject({ status: "review", rating: 4, notifyApplicant: false });
    } finally {
      await request.patch(`/api/applications/${app.id}`, {
        headers,
        data: { status: "received", rating: null, notifyApplicant: true },
      });
    }
  });

  test("projects: create, milestones drive progress", async ({ page, request }) => {
    const headers = await staffHeaders(request);
    await asStaff(page, await adminToken(request));
    const name = `E2E project ${Date.now() % 100000}`;
    await page.goto("/office/projects/new");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Type").selectOption("internal-tool");
    await page.getByLabel("Status").selectOption("active");
    await page.getByRole("button", { name: "Create project" }).click();
    await page.waitForURL(/\/office\/projects$/);
    // Open it from the board (the card links to the project page).
    const card = page.getByRole("link", { name: new RegExp(name) });
    await page.goto((await card.getAttribute("href"))!);
    for (const m of ["Design", "Build"]) {
      await page.getByLabel("New milestone").fill(m);
      await page.getByRole("button", { name: "Add" }).click();
    }
    await page.getByRole("checkbox", { name: "Design" }).click();
    await expect(page.getByText("1 of 2 done")).toBeVisible();
    const id = Number(page.url().split("/").pop());
    await expect
      .poll(
        async () =>
          (await (await request.get(`/api/projects/${id}?depth=0`, { headers })).json()).progress,
      )
      .toBe(50);
    await request.delete(`/api/projects/${id}`, { headers });
  });

  test("people: add an employee and see them in the directory", async ({ page, request }) => {
    const headers = await staffHeaders(request);
    await asStaff(page, await adminToken(request));
    const email = uniqueEmail("emp");
    await page.goto("/office/people/new");
    await page.getByLabel("Full name").fill("Test Employee");
    await page.getByLabel("Job title").fill("QA Engineer");
    await page.getByLabel("Department").selectOption("engineering");
    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Start date").fill("2026-01-05");
    await page.getByRole("button", { name: "Add employee" }).click();
    await page.waitForURL(/\/office\/people$/);
    await page.getByRole("searchbox").fill("QA Engineer");
    await page.waitForURL(/q=QA/);
    await expect(page.getByRole("link", { name: /Test Employee/ })).toBeVisible();
    const emp = (
      await (
        await request.get(`/api/employees?where[email][equals]=${encodeURIComponent(email)}`, {
          headers,
        })
      ).json()
    ).docs[0];
    await request.delete(`/api/employees/${emp.id}`, { headers });
  });

  test("analytics: only with consent, never bots or staff", async ({ browser, request }) => {
    const headers = await staffHeaders(request);
    const count = async () =>
      (
        await (
          await request.get("/api/page-views?limit=1&where[path][equals]=/labs", { headers })
        ).json()
      ).totalDocs as number;
    const start = await count();

    const declined = await browser.newContext();
    await declined.addInitScript(() =>
      localStorage.setItem(
        "ub-consent",
        JSON.stringify({ v: 1, analytics: false, at: new Date().toISOString() }),
      ),
    );
    await (await declined.newPage()).goto(`${SITE}/labs`);
    await new Promise((r) => setTimeout(r, 1500));
    expect(await count()).toBe(start);
    await declined.close();

    const consented = await browser.newContext();
    await stubGoogleAnalytics(consented);
    await consented.addInitScript(() =>
      localStorage.setItem(
        "ub-consent",
        JSON.stringify({ v: 1, analytics: true, at: new Date().toISOString() }),
      ),
    );
    await (await consented.newPage()).goto(`${SITE}/labs?utm_source=e2e`);
    await expect.poll(count).toBe(start + 1);
    await consented.close();

    const bot = await request.post("/api/collect", {
      headers: { "user-agent": "Googlebot/2.1" },
      data: { p: "/labs" },
    });
    expect(bot.status()).toBe(204);
    expect(await count()).toBe(start + 1);

    const latest = (
      await (
        await request.get("/api/page-views?limit=1&sort=-createdAt&where[path][equals]=/labs", {
          headers,
        })
      ).json()
    ).docs[0];
    expect(latest.utmSource).toBe("e2e");
    expect(latest.visitor).toMatch(/^[0-9a-f]{16}$/); // a daily hash, not an IP
    expect(JSON.stringify(latest)).not.toMatch(/\d+\.\d+\.\d+\.\d+/);
  });

  test("lists: search, filters, sort, page size, pagination and clear (URL-driven)", async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);
    await asStaff(page, await adminToken(request));
    await page.goto("/office/requests?view=list");
    await page.waitForLoadState("networkidle"); // filters work once the page is interactive
    const showing = page.getByRole("navigation", { name: "Pages" }).locator("p");
    const total = Number((await showing.textContent())!.match(/of (\d+)/)![1]);
    test.skip(total < 12, "needs a dozen service requests");
    await page.getByLabel("Rows per page").selectOption("10");
    await page.waitForURL(/per=10/);
    await expect(showing).toContainText(`1–10 of ${total}`);
    await expect(page.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      /per=10&page=2/,
    );
    await page.getByRole("link", { name: "Next page" }).click();
    await page.waitForURL(/page=2/);
    await expect(showing).toContainText(`11–20 of ${total}`);
    // Changing a filter returns to page 1.
    await page.getByLabel("Stage").selectOption("new");
    await page.waitForURL(
      (u) => u.searchParams.get("stage") === "new" && !u.searchParams.has("page"),
    );
    await page.getByLabel("Sort by").selectOption("oldest");
    await page.waitForURL(/sort=oldest/);
    await page.getByRole("searchbox").fill("zz-no-such-person-zz");
    await page.waitForURL(/q=zz-no-such/);
    await expect(page.getByText("No requests match")).toBeVisible();
    await page.getByRole("button", { name: /Clear \d filters/ }).click();
    await page.waitForURL((u) => u.search === "?view=list");
    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(showing).toContainText(`of ${total}`);
  });

  test("demo requests: product dashboard → product pipeline → move a request", async ({
    page,
    request,
  }) => {
    const headers = await staffHeaders(request);
    const lead = (
      await (
        await request.get(
          "/api/leads?where[product][exists]=true&limit=1&sort=-createdAt&depth=0",
          { headers },
        )
      ).json()
    ).docs[0];
    test.skip(!lead?.product, "needs a demo request");
    await asStaff(page, await adminToken(request));
    try {
      await page.goto("/office/demos");
      await expect(page.getByText("All demo requests")).toBeVisible();
      await page.locator(`a[href="/office/demos/${lead.product}"]`).first().click();
      await page.waitForURL(new RegExp(`/office/demos/${lead.product}$`));
      for (const stage of ["new", "contacted", "qualified", "proposal", "won", "lost"]) {
        await expect(page.getByRole("region", { name: stage, exact: true })).toBeVisible();
      }
      const card = page.locator("li", {
        has: page.locator(`a[href="/office/requests/${lead.id}"]`),
      });
      await card.getByLabel(/Move .* to another stage/).selectOption("contacted");
      await expect(page.getByRole("status").filter({ hasText: "→ contacted" })).toBeVisible();
      await expect
        .poll(
          async () =>
            (await (await request.get(`/api/leads/${lead.id}?depth=0`, { headers })).json()).status,
        )
        .toBe("contacted");
      // The request page links back to this product's pipeline.
      await page.goto(`/office/requests/${lead.id}`);
      await expect(page.getByRole("link", { name: /demos$/ })).toHaveAttribute(
        "href",
        `/office/demos/${lead.product}`,
      );
    } finally {
      await request.patch(`/api/leads/${lead.id}`, { headers, data: { status: lead.status } });
    }
  });

  test("projects hide finished work unless a status is picked", async ({ page, request }) => {
    const headers = await staffHeaders(request);
    const name = `E2E done project ${Date.now() % 100000}`;
    const created = await (
      await request.post("/api/projects", {
        headers,
        data: { name, kind: "client", status: "done", health: "on-track" },
      })
    ).json();
    await asStaff(page, await adminToken(request));
    try {
      await page.goto(`/office/projects?view=cards&q=${encodeURIComponent(name)}`);
      await expect(page.getByText("No projects match")).toBeVisible();
      // Let the filter bar hydrate before using it (slow dev compiles).
      await page.waitForLoadState("networkidle");
      await page.getByLabel("Status").selectOption("done");
      await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
    } finally {
      await request.delete(`/api/projects/${created.doc.id}`, { headers });
    }
  });
});
