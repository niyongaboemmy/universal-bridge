"use client";

import { useState } from "react";

type Summary = {
  email: string;
  leads: { id: number; ref?: string; createdAt: string; status?: string }[];
  applications: { id: number; ref?: string; type?: string; createdAt: string; status?: string }[];
  subscribers: number;
  files: number;
  outbox: number;
  certificates: number;
};

const box: React.CSSProperties = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: 8,
  padding: "1.25rem",
  marginTop: "1.25rem",
};

/** ADM-09 / PRV-05: find, export and erase one person's data (super admins). */
export function PrivacyTool() {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setSummary(null);
    const res = await fetch(`/api/staff/privacy?email=${encodeURIComponent(email)}`);
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMessage(json.error ?? "Lookup failed");
    setSummary(json);
  }

  async function erase() {
    setBusy(true);
    const res = await fetch("/api/staff/privacy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, confirm }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMessage(json.error ?? "Erase failed");
    setSummary(null);
    setConfirm("");
    setMessage(
      `Erased: ${json.leads} leads, ${json.applications} applications, ${json.files} files, ${json.subscribers} newsletter records, ${json.outbox} queued emails.` +
        (json.certificatesKept
          ? ` ${json.certificatesKept} certificates kept (proof of qualification; tell the person).`
          : ""),
    );
  }

  const total = summary
    ? summary.leads.length +
      summary.applications.length +
      summary.subscribers +
      summary.files +
      summary.outbox
    : 0;

  return (
    <div style={{ maxWidth: 720 }}>
      <p>
        Answer access and deletion requests (Rwanda Law N° 058/2021). Every lookup, export and erase
        is recorded in the audit log with a hashed reference, not the email.
      </p>
      <form onSubmit={lookup} style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <input
          type="email"
          required
          aria-label="Email address"
          placeholder="person@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            padding: "0.6rem 0.8rem",
            borderRadius: 6,
            border: "1px solid var(--theme-elevation-250)",
            background: "var(--theme-input-bg)",
            color: "inherit",
          }}
        />
        <button
          type="submit"
          className="btn btn--style-primary btn--size-medium"
          style={{ margin: 0 }}
          disabled={busy}
        >
          Find
        </button>
      </form>
      {message && (
        <p role="status" style={{ ...box, background: "var(--theme-elevation-50)" }}>
          {message}
        </p>
      )}
      {summary && (
        <section style={box} aria-label="What we hold">
          <h3 style={{ marginTop: 0 }}>
            {total ? `Data held for ${summary.email}` : `Nothing held for ${summary.email}`}
          </h3>
          <ul>
            <li>
              Leads: {summary.leads.length}
              {summary.leads.length > 0 && ` (${summary.leads.map((l) => l.ref).join(", ")})`}
            </li>
            <li>
              Applications: {summary.applications.length}
              {summary.applications.length > 0 &&
                ` (${summary.applications.map((a) => `${a.ref} ${a.type}`).join(", ")})`}
            </li>
            <li>CVs and files: {summary.files}</li>
            <li>Newsletter: {summary.subscribers}</li>
            <li>Queued or sent emails: {summary.outbox}</li>
            <li>Certificates (kept): {summary.certificates}</li>
          </ul>
          <a
            className="btn btn--style-secondary btn--size-small"
            style={{ margin: 0 }}
            href={`/api/staff/privacy?email=${encodeURIComponent(summary.email)}&download=1`}
          >
            Download everything (JSON)
          </a>
          {total > 0 && (
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--theme-elevation-150)",
              }}
            >
              <p style={{ marginTop: 0 }}>
                <strong>Erase</strong> deletes the records above for good. Type the email again to
                confirm.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <input
                  aria-label="Confirm email"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0.8rem",
                    borderRadius: 6,
                    border: "1px solid var(--theme-elevation-250)",
                    background: "var(--theme-input-bg)",
                    color: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={erase}
                  disabled={busy || confirm.trim().toLowerCase() !== summary.email}
                  className="btn btn--style-primary btn--size-medium"
                  style={{ margin: 0, background: "var(--theme-error-500)" }}
                >
                  Erase
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
