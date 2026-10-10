import { enabledProviders } from "@/lib/auth/sso";

const MESSAGES: Record<string, string> = {
  "no-account": "No staff account uses that email. Ask a super admin to invite you.",
  rejected: "That sign-in couldn't be verified. Try again.",
  expired: "The sign-in took too long. Try again.",
  cancelled: "Sign-in was cancelled.",
};

/** ADM-01: "Continue with Google / Microsoft" under the admin login form, when configured. */
export function SsoButtons({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const providers = enabledProviders();
  const reason = typeof searchParams?.sso === "string" ? MESSAGES[searchParams.sso] : undefined;
  if (!providers.length && !reason) return null;
  return (
    <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.5rem" }}>
      {reason && (
        <p role="alert" style={{ color: "var(--theme-error-500)", margin: 0 }}>
          {reason}
        </p>
      )}
      {providers.length > 0 && <p style={{ margin: 0, textAlign: "center", opacity: 0.7 }}>or</p>}
      {providers.map((p) => (
        <a
          key={p.id}
          href={`/api/sso/${p.id}/start`}
          className="btn btn--style-secondary btn--size-large"
          style={{ margin: 0, width: "100%", justifyContent: "center" }}
        >
          Continue with {p.label}
        </a>
      ))}
    </div>
  );
}
