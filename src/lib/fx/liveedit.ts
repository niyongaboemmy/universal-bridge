/**
 * CMS-07 live (on-page) editor. Loaded only when the server renders the page in
 * live-edit mode (draft mode + staff), so visitors never download it.
 *
 * - Text: click any outlined text and type. Enter (or click away) keeps the
 *   change, Esc cancels. Titles show their *accent* markers while editing.
 * - Images: click an outlined image to pick another from the media library or
 *   upload a new one.
 * - Changes collect in the toolbar: Save draft (Ctrl/Cmd+S), Publish, Undo,
 *   Discard, Exit. Nothing goes live until Publish.
 */
type Kind = "text" | "textarea" | "accent" | "image";
type Meta = {
  c: string;
  id: string | number;
  l: string;
  p: string;
  k: Kind;
  v?: string;
  s?: string;
};
type Change = {
  c: string;
  id: string | number;
  l: string;
  p: string;
  k: Kind;
  v: string | number | null;
};
type MediaDoc = {
  id: number;
  alt?: string;
  url?: string;
  sizes?: { thumb?: { url?: string } };
  mimeType?: string;
};

const docKey = (m: { c: string; id: string | number; l: string }) => `${m.c}|${m.id}|${m.l}`;
const changeKey = (m: Meta) => `${docKey(m)}|${m.p}`;

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, string>> = {},
  ...children: (Node | string | null | false)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) if (v !== undefined) el.setAttribute(k, v);
  for (const c of children) if (c) el.append(c);
  return el;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
/** Same rendering as components/ui/AccentText. */
const accentHtml = (s: string) =>
  escapeHtml(s).replace(/\*([^*]+)\*/g, '<span class="accent-word">$1</span>');

export function attach(root: HTMLElement) {
  const locale = root.dataset.locale ?? "en";
  const editables = [...document.querySelectorAll<HTMLElement>("[data-edit]")];
  const metaOf = (el: HTMLElement) => JSON.parse(el.dataset.edit!) as Meta;

  // Documents on this page, with the version each one was loaded at.
  const docs = new Map<string, Meta>();
  for (const el of editables) {
    const m = metaOf(el);
    if (!docs.has(docKey(m))) docs.set(docKey(m), m);
  }
  const base = new Map([...docs].map(([k, m]) => [k, m.v ?? ""]));
  const status = new Map([...docs].map(([k, m]) => [k, m.s ?? "published"]));

  const pending = new Map<string, Change>();
  const history: { key: string; el: HTMLElement; before: Change | undefined; html: string }[] = [];
  const original = new Map<HTMLElement, { html: string; raw: string }>();
  for (const el of editables)
    original.set(el, { html: el.innerHTML, raw: el.dataset.editRaw ?? el.textContent ?? "" });

  document.documentElement.classList.add("ub-live-edit");

  // ---- Toolbar -------------------------------------------------------------
  const count = h("span", { class: "le-count" });
  const message = h("span", { class: "le-msg", role: "status", "aria-live": "polite" });
  const undoBtn = h(
    "button",
    { type: "button", class: "le-btn", title: "Undo the last change" },
    "Undo",
  );
  const saveBtn = h(
    "button",
    { type: "button", class: "le-btn", title: "Save as draft (Ctrl/Cmd + S)" },
    "Save draft",
  );
  const publishBtn = h(
    "button",
    {
      type: "button",
      class: "le-btn le-btn--primary",
      title: "Make the latest draft visible to everyone",
    },
    "Publish",
  );
  const moreBtn = h(
    "button",
    {
      type: "button",
      class: "le-btn le-btn--ghost",
      "aria-haspopup": "menu",
      "aria-expanded": "false",
    },
    "⋯",
  );
  const first = [...docs.values()][0];
  const menu = h(
    "div",
    { class: "le-menu", role: "menu", hidden: "" },
    first
      ? h(
          "a",
          {
            role: "menuitem",
            href: `/admin/collections/${first.c}/${first.id}?locale=${first.l}`,
            target: "_blank",
          },
          "Open in admin",
        )
      : null,
    h("button", { type: "button", role: "menuitem", "data-act": "outlines" }, "Hide outlines"),
    h(
      "button",
      { type: "button", role: "menuitem", "data-act": "discard" },
      "Discard unsaved changes",
    ),
    h("button", { type: "button", role: "menuitem", "data-act": "exit" }, "Exit live editing"),
  );
  const bar = h(
    "div",
    { class: "le-bar", role: "toolbar", "aria-label": "Live editing" },
    h("span", { class: "le-dot", "aria-hidden": "true" }),
    h("strong", {}, `Editing · ${locale.toUpperCase()}`),
    count,
    message,
    h("span", { class: "le-spacer" }),
    undoBtn,
    saveBtn,
    publishBtn,
    h("span", { class: "le-more" }, moreBtn, menu),
  );
  document.body.append(bar);

  function refresh() {
    const n = pending.size;
    const unpublished = [...status.values()].some((s) => s === "draft");
    count.textContent = n
      ? `${n} unsaved change${n === 1 ? "" : "s"}`
      : unpublished
        ? "Draft not published yet"
        : "Up to date";
    count.dataset.state = n ? "dirty" : unpublished ? "draft" : "clean";
    undoBtn.disabled = !history.length;
    saveBtn.disabled = !n;
    publishBtn.disabled = !n && !unpublished;
  }
  function say(text: string, tone: "ok" | "error" | "info" = "info") {
    message.textContent = text;
    message.dataset.tone = tone;
  }
  refresh();
  say(
    editables.length
      ? "Click any outlined text or image to edit it."
      : "Nothing on this page can be edited here. Use Open in admin.",
  );

  // ---- Text editing ---------------------------------------------------------
  let active: HTMLElement | null = null;
  const valueOf = (el: HTMLElement) => {
    const m = metaOf(el);
    const p = pending.get(changeKey(m));
    return p ? String(p.v ?? "") : (original.get(el)?.raw ?? "");
  };
  const render = (el: HTMLElement, value: string) => {
    if (metaOf(el).k === "accent") el.innerHTML = accentHtml(value);
    else el.textContent = value;
  };

  function begin(el: HTMLElement, point?: { x: number; y: number }) {
    if (active === el) return;
    if (active) commit(active);
    active = el;
    const m = metaOf(el);
    el.dataset.editing = "";
    el.textContent = valueOf(el);
    el.contentEditable = "plaintext-only";
    if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
    el.spellcheck = true;
    el.focus({ preventScroll: true });
    // Caret where the person clicked (falls back to the end of the text).
    const doc = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    };
    let range = point && doc.caretRangeFromPoint ? doc.caretRangeFromPoint(point.x, point.y) : null;
    if (!range || !el.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
    }
    getSelection()?.removeAllRanges();
    getSelection()?.addRange(range);
    say(
      m.k === "accent"
        ? "Wrap a word in *asterisks* to colour it orange. Enter to keep, Esc to cancel."
        : m.k === "textarea"
          ? "Shift + Enter for a new line. Enter to keep, Esc to cancel."
          : "Enter to keep, Esc to cancel.",
    );
  }

  function finish(el: HTMLElement) {
    el.removeAttribute("contenteditable");
    delete el.dataset.editing;
    if (active === el) active = null;
  }

  function commit(el: HTMLElement) {
    const m = metaOf(el);
    const value = (el.innerText ?? el.textContent ?? "")
      .replace(/ /g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    finish(el);
    const key = changeKey(m);
    const before = pending.get(key);
    const prev = valueOf(el);
    if (value === prev) {
      render(el, prev);
      return;
    }
    if (!value && m.k !== "textarea") {
      render(el, prev);
      say("This text can't be empty.", "error");
      return;
    }
    history.push({ key, el, before, html: el.innerHTML });
    if (value === original.get(el)?.raw) {
      pending.delete(key);
      el.removeAttribute("data-edit-dirty");
    } else {
      pending.set(key, { c: m.c, id: m.id, l: m.l, p: m.p, k: m.k, v: value });
      el.dataset.editDirty = "";
    }
    // The same field can appear twice on a page (e.g. a title in hero and menu).
    for (const other of editables)
      if (other !== el && other.dataset.edit === el.dataset.edit) render(other, value);
    render(el, value);
    say("Change kept. Save when you're ready.");
    refresh();
  }

  function cancel(el: HTMLElement) {
    finish(el);
    render(el, valueOf(el));
    say("Change cancelled.");
  }

  // ---- Images ---------------------------------------------------------------
  let panel: HTMLElement | null = null;
  async function pickImage(el: HTMLElement) {
    panel?.remove();
    const m = metaOf(el);
    const grid = h("ul", { class: "le-grid" });
    const search = h("input", {
      type: "search",
      placeholder: "Search images by description",
      "aria-label": "Search images",
    });
    const alt = h("input", {
      type: "text",
      placeholder: "Describe the new image (required)",
      "aria-label": "Image description",
    });
    const file = h("input", { type: "file", accept: "image/*", "aria-label": "Upload an image" });
    const status = h("p", { class: "le-panel-msg", role: "status" });
    const close = h(
      "button",
      { type: "button", class: "le-btn le-btn--ghost", "aria-label": "Close" },
      "✕",
    );
    panel = h(
      "aside",
      { class: "le-panel", role: "dialog", "aria-label": "Choose an image" },
      h("header", {}, h("strong", {}, "Choose an image"), close),
      search,
      grid,
      h("details", {}, h("summary", {}, "Upload a new image"), alt, file),
      status,
    );
    document.body.append(panel);
    close.onclick = () => panel?.remove();

    const choose = (doc: MediaDoc) => {
      const key = changeKey(m);
      history.push({ key, el, before: pending.get(key), html: el.innerHTML });
      pending.set(key, { c: m.c, id: m.id, l: m.l, p: m.p, k: "image", v: doc.id });
      const img = el.querySelector("img");
      if (img && doc.url) {
        img.removeAttribute("srcset");
        img.src = doc.url;
        img.alt = doc.alt ?? "";
      }
      el.dataset.editDirty = "";
      panel?.remove();
      say("Image replaced. Save when you're ready.");
      refresh();
    };

    async function load(q = "") {
      status.textContent = "Loading…";
      const params = new URLSearchParams({
        limit: "40",
        depth: "0",
        sort: "-createdAt",
        "where[mimeType][like]": "image",
      });
      if (q) params.set("where[alt][like]", q);
      const res = await fetch(`/api/media?${params}`, { credentials: "same-origin" });
      const docs = res.ok ? ((await res.json()).docs as MediaDoc[]) : [];
      grid.replaceChildren(
        ...docs.map((d) => {
          const b = h(
            "button",
            { type: "button", title: d.alt ?? "" },
            h("img", {
              src: d.sizes?.thumb?.url ?? d.url ?? "",
              alt: d.alt ?? "",
              loading: "lazy",
            }),
          );
          b.onclick = () => choose(d);
          return h("li", {}, b);
        }),
      );
      status.textContent = docs.length ? "" : "No images found.";
    }
    let timer = 0;
    search.oninput = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => void load(search.value.trim()), 250);
    };
    file.onchange = async () => {
      const f = file.files?.[0];
      if (!f) return;
      if (!alt.value.trim()) {
        status.textContent = "Describe the image first (it helps screen-reader users and search).";
        file.value = "";
        alt.focus();
        return;
      }
      status.textContent = "Uploading…";
      const form = new FormData();
      form.append("file", f);
      form.append("_payload", JSON.stringify({ alt: alt.value.trim() }));
      const res = await fetch("/api/media", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      if (!res.ok) {
        status.textContent = "Upload failed. Check the file type and size.";
        return;
      }
      choose((await res.json()).doc as MediaDoc);
    };
    await load();
  }

  // ---- Events ---------------------------------------------------------------
  const onClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-edit]");
    if (!el || bar.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();
    if (metaOf(el).k === "image") void pickImage(el);
    else begin(el, { x: e.clientX, y: e.clientY });
  };
  // A press on not-yet-editable text would start a native text selection whose
  // drag keeps auto-scrolling the page as the edited text grows: cancel it.
  const onMouseDown = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-edit]");
    if (el && el !== active && !bar.contains(el)) e.preventDefault();
  };
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (active) commit(active);
      void save();
      return;
    }
    if (!active) return;
    const kind = metaOf(active).k;
    if (e.key === "Escape") {
      e.preventDefault();
      cancel(active);
    } else if (e.key === "Enter" && !(kind === "textarea" && e.shiftKey)) {
      e.preventDefault();
      commit(active);
    }
  };
  // Typing must never move the page. Browsers sometimes scroll when the edited
  // text grows under the pointer; undo that while the caret is still on screen.
  let heldY = 0;
  const onBeforeInput = () => {
    heldY = scrollY;
  };
  const onKeyHold = (e: KeyboardEvent) => {
    if (active && e.type === "keydown") heldY = scrollY;
    if (active && e.type === "keyup") onInput();
  };
  const onInput = () => {
    if (!active) return;
    requestAnimationFrame(() => {
      if (scrollY === heldY) return;
      const caret = getSelection()?.rangeCount
        ? getSelection()!.getRangeAt(0).getBoundingClientRect()
        : null;
      const shift = heldY - scrollY;
      if (caret && caret.top + shift > 80 && caret.bottom + shift < innerHeight - 80)
        scrollTo({ top: heldY, behavior: "instant" });
    });
  };
  const onFocusOut = (e: FocusEvent) => {
    if (active && e.target === active) commit(active);
  };
  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (pending.size) e.preventDefault();
  };
  document.addEventListener("click", onClick, true);
  document.addEventListener("mousedown", onMouseDown, true);
  document.addEventListener("keydown", onKey);
  document.addEventListener("focusout", onFocusOut);
  document.addEventListener("beforeinput", onBeforeInput, true);
  document.addEventListener("input", onInput, true);
  document.addEventListener("keydown", onKeyHold, true);
  document.addEventListener("keyup", onKeyHold, true);
  window.addEventListener("beforeunload", onBeforeUnload);

  // ---- Save / publish -------------------------------------------------------
  let busy = false;
  async function send(publish: string[], force = false) {
    const res = await fetch("/api/live-edit/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        changes: [...pending.values()],
        base: Object.fromEntries(base),
        publish,
        force,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      docs?: Record<string, { updatedAt: string; status: string }>;
      reload?: boolean;
    };
    return { res, json };
  }

  async function save(publish = false, force = false): Promise<void> {
    if (busy) return;
    if (active) commit(active);
    const toPublish = publish ? [...docs.keys()] : [];
    if (!pending.size && !toPublish.length) return;
    busy = true;
    bar.dataset.busy = "";
    say(publish ? "Publishing…" : "Saving…");
    try {
      const { res, json } = await send(toPublish, force);
      if (res.status === 409 && json.code === "stale") {
        say("Someone else saved this page after you opened it.", "error");
        const overwrite = h("button", { type: "button", class: "le-link" }, "Keep mine");
        const reload = h("button", { type: "button", class: "le-link" }, "Load theirs");
        overwrite.onclick = () => void save(publish, true);
        reload.onclick = () => location.reload();
        message.append(" ", overwrite, " · ", reload);
        return;
      }
      if (!res.ok) {
        say(json.error ?? "Saving failed. Try again.", "error");
        return;
      }
      for (const [key, d] of Object.entries(json.docs ?? {})) {
        base.set(key, d.updatedAt);
        status.set(key, d.status);
      }
      for (const el of editables) {
        if (el.hasAttribute("data-edit-dirty")) {
          original.set(el, { html: el.innerHTML, raw: valueOf(el) });
          el.removeAttribute("data-edit-dirty");
        }
      }
      pending.clear();
      history.length = 0;
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      say(
        publish
          ? `Published at ${time}. Visitors see it now.`
          : `Draft saved at ${time}. Publish to make it live.`,
        "ok",
      );
      if (json.reload) location.reload();
    } catch {
      say("No connection. Your changes are still here; try again.", "error");
    } finally {
      busy = false;
      delete bar.dataset.busy;
      refresh();
    }
  }

  undoBtn.onclick = () => {
    const last = history.pop();
    if (!last) return;
    if (last.before) pending.set(last.key, last.before);
    else pending.delete(last.key);
    const value = last.before ? String(last.before.v ?? "") : (original.get(last.el)?.raw ?? "");
    if (metaOf(last.el).k === "image")
      last.el.innerHTML = last.before
        ? last.el.innerHTML
        : (original.get(last.el)?.html ?? last.el.innerHTML);
    else render(last.el, value);
    if (!pending.has(last.key)) last.el.removeAttribute("data-edit-dirty");
    say("Undone.");
    refresh();
  };
  saveBtn.onclick = () => void save();
  publishBtn.onclick = () => void save(true);
  moreBtn.onclick = () => {
    const open = menu.hidden;
    menu.hidden = !open;
    moreBtn.setAttribute("aria-expanded", String(open));
  };
  menu.onclick = (e) => {
    const act = (e.target as HTMLElement).dataset.act;
    if (!act) return;
    menu.hidden = true;
    if (act === "outlines") {
      const off = document.documentElement.classList.toggle("ub-live-edit--quiet");
      (e.target as HTMLElement).textContent = off ? "Show outlines" : "Hide outlines";
    } else if (act === "discard") {
      if (!pending.size || confirm(`Discard ${pending.size} unsaved change(s)?`)) {
        pending.clear();
        location.reload();
      }
    } else if (act === "exit") {
      if (pending.size && !confirm("You have unsaved changes. Leave without saving?")) return;
      pending.clear();
      location.href = `/api/live-edit/exit?path=${encodeURIComponent(location.pathname)}`;
    }
  };

  return () => {
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("mousedown", onMouseDown, true);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("focusout", onFocusOut);
    document.removeEventListener("beforeinput", onBeforeInput, true);
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("keydown", onKeyHold, true);
    document.removeEventListener("keyup", onKeyHold, true);
    window.removeEventListener("beforeunload", onBeforeUnload);
    document.documentElement.classList.remove("ub-live-edit", "ub-live-edit--quiet");
    bar.remove();
    panel?.remove();
  };
}
