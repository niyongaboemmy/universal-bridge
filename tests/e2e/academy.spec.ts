import { expect, test, type Page } from "@playwright/test";
import {
  expectAccessible,
  mailTo,
  presetConsent,
  SAMPLE_PDF,
  staffHeaders,
  stubTurnstile,
  uniqueEmail,
  visitorIp,
} from "./helpers";

const field = (page: Page, name: string) => page.getByRole("textbox", { name, exact: true });

test.describe("S4 academy pages", () => {
  test.beforeEach(async ({ page }) => presetConsent(page));

  test("programs filter by mode from the legacy URL (FR-ACA-02, SRS §5.3)", async ({ page }) => {
    await page.goto("/online_trainings");
    await expect(page).toHaveURL(/\/academy\/programs\?mode=online$/);
    await expect(page.locator("[data-program]").filter({ visible: true })).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "UI/UX & Graphic Design" })).toBeVisible();
    await page.getByLabel("Mode").selectOption("");
    await expect(page.locator("[data-program]").filter({ visible: true })).toHaveCount(4);
    await expectAccessible(page);
  });

  test("program page shows live seats, Course JSON-LD and links to the intake (FR-ACA-03, IX-12)", async ({
    page,
  }) => {
    await page.goto("/academy/programs/full-stack-web-development");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Full-Stack Web Development");
    await expect(page.getByText("12 seats left").filter({ visible: true }).first()).toBeVisible();
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (t) => JSON.parse(t),
    );
    const course = ld.find((j) => j["@type"] === "Course");
    expect(course.hasCourseInstance.courseMode).toBe("blended");
    await expect(page.getByRole("link", { name: "Apply now" }).first()).toHaveAttribute(
      "href",
      /\/academy\/apply\?intake=\d+$/,
    );
    await expectAccessible(page);
  });

  test("a full intake offers the waitlist", async ({ page }) => {
    await page.goto("/academy/programs/ai-robotics-foundations");
    await expect(
      page.getByText("Full — join the waitlist").filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Join the waitlist" }).first()).toBeVisible();
  });

  test("academy landing and internships render accessibly", async ({ page }) => {
    for (const path of ["/academy", "/academy/internships", "/fr/academy", "/academy/verify"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expectAccessible(page);
    }
  });
});

test.describe("S4 application journeys", () => {
  test.use({ extraHTTPHeaders: { "x-real-ip": visitorIp() } });
  test.beforeEach(async ({ page }) => {
    await presetConsent(page);
    await stubTurnstile(page);
  });

  test("student applies in steps, reviews and submits (journey 3)", async ({ page, request }) => {
    const email = uniqueEmail("academy");
    await page.goto("/academy/programs/full-stack-web-development");
    await page.getByRole("link", { name: "Apply now" }).first().click();
    await expect(page).toHaveURL(/\/academy\/apply\?intake=/);

    // Step 1 validates before moving on.
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Full name");
    await field(page, "Full name").fill("Aline Uwimana");
    await field(page, "Email").fill(email);
    await page.getByLabel("Date of birth").fill("2001-05-20");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2
    await expect(page.getByRole("heading", { name: /Background/ })).toBeFocused();
    await page.getByLabel("Highest education level").selectOption("bachelor");
    await page.getByRole("radio", { name: "Looking for work" }).check();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3: intake was preselected from the URL.
    await expect(page.getByLabel("Program and intake")).toHaveValue(/\d+/);
    await page.getByRole("radio", { name: "Hybrid" }).check();
    await page
      .getByLabel("Why do you want to join?")
      .fill(
        "I want to build web apps for cooperatives in my district and get my first developer job.",
      );
    await page.getByRole("button", { name: "Continue" }).click();

    // Review
    await expect(page.getByRole("heading", { name: "Review your answers" })).toBeFocused();
    await expect(page.getByText("Aline Uwimana")).toBeVisible();
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("heading", { name: "Application received." })).toBeFocused();

    await expect.poll(() => mailTo(email).length, { timeout: 15_000 }).toBe(1);
    expect(mailTo(email)[0]!.subject).toMatch(/We've received your application \(A-/);
    const headers = await staffHeaders(request);
    const app = (
      await (
        await request.get(
          `/api/applications?where[email][equals]=${encodeURIComponent(email)}&depth=1`,
          { headers },
        )
      ).json()
    ).docs[0];
    expect(app).toMatchObject({ type: "academy", status: "received" });
    expect(app.program.slug).toBe("full-stack-web-development");
    expect(app.data.dateOfBirth).toBe("2001-05-20");
    expect(app.data.consent).toBeUndefined();
  });

  test("under-18 applicants need a guardian (PRV-08)", async ({ page }) => {
    await page.goto("/academy/apply");
    await field(page, "Full name").fill("Young Applicant");
    await field(page, "Email").fill(uniqueEmail("minor"));
    await page.getByLabel("Date of birth").fill("2012-01-10");
    await expect(page.getByText("You're under 18")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText(
      "A parent or guardian must agree",
    );
    await page.getByRole("textbox", { name: /Parent or guardian/ }).fill("Jeanne Mukeshimana");
    await page.getByRole("checkbox", { name: /parent or guardian and I agree/ }).check();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: /Background/ })).toBeVisible();
  });

  test("a full intake puts the applicant on the waitlist (FR-ACA-06)", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("waitlist");
    await page.goto("/academy/programs/ai-robotics-foundations");
    await page.getByRole("link", { name: "Join the waitlist" }).first().click();
    await field(page, "Full name").fill("Waitlist Person");
    await field(page, "Email").fill(email);
    await page.getByLabel("Date of birth").fill("1999-09-09");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Highest education level").selectOption("diploma");
    await page.getByRole("radio", { name: "Working" }).check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("radio", { name: "In person (Kigali)" }).check();
    await page
      .getByLabel("Why do you want to join?")
      .fill("Robotics fascinates me and I want to build a farm-monitoring robot for my village.");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("heading", { name: "You're on the waitlist." })).toBeVisible();
    const app = (
      await (
        await request.get(`/api/applications?where[email][equals]=${encodeURIComponent(email)}`, {
          headers: await staffHeaders(request),
        })
      ).json()
    ).docs[0];
    expect(app.status).toBe("waitlisted");
  });

  test("text typed before the page finishes loading is kept (slow connections)", async ({
    page,
  }) => {
    // Block the JS briefly so the visitor types into the server-rendered form first.
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    await page.route(/\/_next\/static\/chunks\/.*\.js$/, async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto("/academy/apply", { waitUntil: "commit" });
    await field(page, "Full name").fill("Typed Before Hydration");
    release();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(field(page, "Full name")).toHaveValue("Typed Before Hydration");
  });

  test("drafts are saved on the device and can be restored", async ({ page }) => {
    await page.goto("/academy/apply");
    await field(page, "Full name").fill("Draft Person");
    await page.waitForTimeout(900);
    await page.reload();
    await page.getByRole("button", { name: "Restore it" }).click();
    await expect(field(page, "Full name")).toHaveValue("Draft Person");
  });

  test("intern applies with a CV that is stored privately (journey 4, FR-FORM-08)", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("intern");
    await page.goto("/academy/internships#apply");
    await page.getByRole("radio", { name: "Software engineering" }).check();
    await field(page, "Full name").fill("Eric Habimana");
    await field(page, "Email").fill(email);
    await page.getByLabel("School or university").fill("University of Rwanda");
    await page.getByLabel("Field of study").fill("Computer Science");
    await page.getByLabel("Year of study").selectOption("3");
    await page.getByLabel("When can you start?").fill("2027-01-15");
    await page
      .locator('input[type="file"][name="cv"]')
      .setInputFiles({ name: "eric-cv.pdf", mimeType: "application/pdf", buffer: SAMPLE_PDF });
    await expect(page.getByText("Selected: eric-cv.pdf")).toBeVisible();
    await page
      .getByLabel("Why do you want to join?")
      .fill("I want real project experience with a team that ships software to clients.");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();

    const headers = await staffHeaders(request);
    const app = (
      await (
        await request.get(
          `/api/applications?where[email][equals]=${encodeURIComponent(email)}&depth=1`,
          { headers },
        )
      ).json()
    ).docs[0];
    expect(app.type).toBe("internship");
    const file = app.files[0];
    expect(file.mimeType).toBe("application/pdf");
    // Staff can download; the public cannot (ADR-004).
    expect((await request.get(file.url, { headers })).status()).toBe(200);
    const anon = await page.context().browser()!.newContext();
    expect(
      (
        await anon.request.get(
          new URL(file.url, "http://localhost").pathname.replace(
            /^/,
            process.env.E2E_BASE_URL ?? "http://localhost:3000",
          ),
        )
      ).status(),
    ).toBe(403);
    await anon.close();
    await expect
      .poll(
        async () =>
          (await (await request.get(`/api/private-files/${file.id}`, { headers })).json())
            .scanStatus,
      )
      .toMatch(process.env.E2E_BASE_URL ? /^(pending|clean)$/ : /^skipped$/); // prod: waits for clamd (ADR-004)
  });

  test("a file that only pretends to be a PDF is rejected (NFR-SEC-06)", async ({ page }) => {
    await page.goto("/academy/internships#apply");
    await page.getByRole("radio", { name: "Data & AI" }).check();
    await field(page, "Full name").fill("Fake File");
    await field(page, "Email").fill(uniqueEmail("fake"));
    await page.getByLabel("School or university").fill("Somewhere");
    await page.getByLabel("Field of study").fill("Data");
    await page.getByLabel("Year of study").selectOption("2");
    await page.getByLabel("When can you start?").fill("2027-02-01");
    await page.locator('input[type="file"][name="cv"]').setInputFiles({
      name: "cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("MZ this is really an executable"),
    });
    await page
      .getByLabel("Why do you want to join?")
      .fill("Testing that the server checks the real file type and not the name.");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText(
      "Upload a PDF, DOC or DOCX file.",
    );
    await expect(page.locator('input[type="file"][name="cv"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    // Right magic bytes, broken structure: rejected by storage, shown on the same field.
    await page.locator('input[type="file"][name="cv"]').setInputFiles({
      name: "cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 not really a pdf"),
    });
    // Wait for this submission's answer: the alert from the first try is still on screen.
    const answered = page.waitForResponse(
      (r) => r.request().method() === "POST" && new URL(r.url()).pathname.includes("/internships"),
    );
    await page.getByRole("button", { name: "Send" }).click();
    await answered;
    await expect(page.locator("form").getByRole("alert")).not.toContainText("went wrong");
    await expect(page.locator("form").getByRole("alert")).toContainText(
      "Upload a PDF, DOC or DOCX file.",
    );
  });

  test("partner applies to the agent programme (FR-PRT-01)", async ({ page, request }) => {
    const email = uniqueEmail("partner");
    await page.goto("/agents");
    await expect(page).toHaveURL(/\/company\/partners$/);
    await page.getByRole("radio", { name: "Partner agent" }).check();
    await field(page, "Full name").fill("Patrick Ndayishimiye");
    await field(page, "Email").fill(email);
    await page.getByLabel("Where do you live?").fill("Musanze");
    await page.getByLabel("Your profession").fill("Sales consultant");
    await page
      .getByLabel("Who is in your network?")
      .fill("SACCOs, cooperatives and private schools in the Northern Province.");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Please tick this box");
    await page.getByRole("checkbox", { name: /agent programme conditions/ }).check();
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();
    const app = (
      await (
        await request.get(`/api/applications?where[email][equals]=${encodeURIComponent(email)}`, {
          headers: await staffHeaders(request),
        })
      ).json()
    ).docs[0];
    expect(app).toMatchObject({ type: "partner", subject: "Agent programme — partner" });
  });
});

test.describe("S4 careers (journey 6)", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ extraHTTPHeaders: { "x-real-ip": visitorIp() } });

  test("job seeker applies to an open role with a CV", async ({ page, request }) => {
    const headers = await staffHeaders(request);
    const created = await request.post("/api/jobs", {
      headers,
      data: {
        title: `Junior Frontend Engineer ${Date.now()}`,
        _status: "published",
        department: "engineering",
        employmentType: "FULL_TIME",
        remotePolicy: "hybrid",
        location: "Kigali, Rwanda",
        summary: "Build fast, accessible interfaces for our clients and products.",
        responsibilities: [{ text: "Build React components" }],
        requirements: [{ text: "Solid HTML, CSS and JavaScript" }],
        validThrough: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const job = (await created.json()).doc;
    try {
      await presetConsent(page);
      await stubTurnstile(page);
      await expect(async () => {
        await page.goto("/company/careers");
        await expect(page.getByRole("link", { name: job.title })).toBeVisible({ timeout: 2000 });
      }).toPass({ timeout: 60_000 });
      await page.getByRole("link", { name: job.title }).click();
      await expect(page).toHaveURL(/\/company\/careers\/[a-z0-9-]+$/);
      await expect
        .poll(async () =>
          (await page.locator('script[type="application/ld+json"]').allTextContents())
            .map((t) => JSON.parse(t))
            .find((j) => j["@type"] === "JobPosting"),
        )
        .toMatchObject({ title: job.title, employmentType: "FULL_TIME" });

      const email = uniqueEmail("job");
      const form = page.locator("#apply form");
      await form.getByRole("textbox", { name: "Full name", exact: true }).fill("Grace Ingabire");
      await form.getByRole("textbox", { name: "Email", exact: true }).fill(email);
      await form.getByLabel("Where do you live?").fill("Kigali");
      await form.getByLabel("LinkedIn profile").fill("https://www.linkedin.com/in/grace-example");
      await form
        .locator('input[type="file"]')
        .setInputFiles({ name: "grace.pdf", mimeType: "application/pdf", buffer: SAMPLE_PDF });
      await form
        .getByLabel("Why this role?")
        .fill(
          "I love building accessible interfaces and want to grow with a product team in Kigali.",
        );
      await form.getByRole("checkbox", { name: /I agree/ }).check();
      await form.getByRole("button", { name: "Send" }).click();
      await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();
      const app = (
        await (
          await request.get(
            `/api/applications?where[email][equals]=${encodeURIComponent(email)}&depth=0`,
            { headers },
          )
        ).json()
      ).docs[0];
      expect(app).toMatchObject({ type: "job", job: job.id, subject: job.title });
    } finally {
      await request.delete(`/api/jobs/${job.id}`, { headers });
    }
  });

  test("open application asks what role you want (FR-CAR-03)", async ({ page }) => {
    await presetConsent(page);
    await page.goto("/company/careers#open-application");
    await expect(page.getByLabel("What kind of role are you looking for?")).toBeVisible();
    await expectAccessible(page);
  });
});

test.describe("S4 forms without JavaScript (FR-FORM-10)", () => {
  test.use({ javaScriptEnabled: false, extraHTTPHeaders: { "x-real-ip": visitorIp() } });

  test("the academy application shows every step and still submits", async ({ page, request }) => {
    const email = uniqueEmail("nojs-academy");
    await page.goto("/academy/apply");
    await field(page, "Full name").fill("No Script Student");
    await field(page, "Email").fill(email);
    await page.getByLabel("Date of birth").fill("2000-02-02");
    await page.getByLabel("Highest education level").selectOption("secondary");
    await page.getByRole("radio", { name: "Studying" }).check();
    await page.getByLabel("Program and intake").selectOption({ index: 1 });
    await page.getByRole("radio", { name: "Online", exact: true }).check();
    await page
      .getByLabel("Why do you want to join?")
      .fill("I have no JavaScript but I still want to learn to code with UB Academy.");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(
      page.getByRole("heading", { name: /Application received\.|You're on the waitlist\./ }),
    ).toBeVisible();
    const app = (
      await (
        await request.get(`/api/applications?where[email][equals]=${encodeURIComponent(email)}`, {
          headers: await staffHeaders(request),
        })
      ).json()
    ).docs[0];
    expect(app.botCheck).toBe("missing");
  });
});
