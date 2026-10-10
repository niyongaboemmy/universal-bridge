import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { getFieldsToSign, jwtSign } from "payload";
import { payload } from "@/lib/cms/payload";
import { ssoEnabled } from "./mfa-proof";

/**
 * ADM-01: staff single sign-on with Google Workspace or Microsoft Entra ID
 * (OpenID Connect, authorization code + PKCE, state and nonce). A provider is
 * on only when its client id and secret are set. SSO never creates accounts:
 * the email must belong to an existing staff user (optionally limited to
 * SSO_ALLOWED_DOMAINS). The new session still goes through MFA.
 */
export type ProviderId = "google" | "microsoft";

type Provider = {
  id: ProviderId;
  label: string;
  clientId?: string;
  clientSecret?: string;
  discovery: string;
  issuerOk: (iss: string, claims: JWTPayload) => boolean;
};

const tenant = () => process.env.MICROSOFT_TENANT_ID || "organizations";

export const PROVIDERS: Record<ProviderId, Provider> = {
  google: {
    id: "google",
    label: "Google",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    discovery: "https://accounts.google.com/.well-known/openid-configuration",
    issuerOk: (iss) => iss === "https://accounts.google.com" || iss === "accounts.google.com",
  },
  microsoft: {
    id: "microsoft",
    label: "Microsoft",
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    discovery: `https://login.microsoftonline.com/${tenant()}/v2.0/.well-known/openid-configuration`,
    // Multi-tenant discovery publishes "{tenantid}" in the issuer; check it against the token's tid.
    issuerOk: (iss, claims) =>
      typeof claims.tid === "string" &&
      iss === `https://login.microsoftonline.com/${claims.tid}/v2.0` &&
      (tenant() === "organizations" || tenant() === "common" || tenant() === claims.tid),
  },
};

export function enabledProviders(): Provider[] {
  if (!ssoEnabled()) return [];
  return Object.values(PROVIDERS).filter((p) => p.clientId && p.clientSecret);
}

export function provider(id: string): Provider | null {
  if (!ssoEnabled()) return null;
  const p = PROVIDERS[id as ProviderId];
  return p && p.clientId && p.clientSecret ? p : null;
}

type Discovery = { authorization_endpoint: string; token_endpoint: string; jwks_uri: string };
const discoveries = new Map<string, Promise<Discovery>>();
const jwks = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function discover(p: Provider): Promise<Discovery> {
  if (!discoveries.has(p.id)) {
    discoveries.set(
      p.id,
      fetch(p.discovery, { cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error(`OIDC discovery failed for ${p.id}: ${r.status}`);
        return r.json() as Promise<Discovery>;
      }),
    );
  }
  return discoveries.get(p.id)!.catch((e) => {
    discoveries.delete(p.id);
    throw e;
  });
}

export const callbackUrl = (id: ProviderId) =>
  `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}/api/sso/${id}/callback`;

const b64url = (b: Buffer) => b.toString("base64url");

/** Start: returns the provider URL and the values to keep in a short-lived cookie. */
export async function beginSignIn(p: Provider) {
  const d = await discover(p);
  const state = b64url(randomBytes(24));
  const nonce = b64url(randomBytes(24));
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  const url = new URL(d.authorization_endpoint);
  url.search = new URLSearchParams({
    client_id: p.clientId!,
    response_type: "code",
    redirect_uri: callbackUrl(p.id),
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url: url.toString(), cookie: JSON.stringify({ state, nonce, verifier }) };
}

/** Callback: exchange the code and return the verified, lower-cased email. */
export async function finishSignIn(
  p: Provider,
  code: string,
  saved: { nonce: string; verifier: string },
) {
  const d = await discover(p);
  const res = await fetch(d.token_endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl(p.id),
      client_id: p.clientId!,
      client_secret: p.clientSecret!,
      code_verifier: saved.verifier,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`);
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("No id_token");
  if (!jwks.has(p.id)) jwks.set(p.id, createRemoteJWKSet(new URL(d.jwks_uri)));
  const { payload: claims } = await jwtVerify(id_token, jwks.get(p.id)!, { audience: p.clientId });
  return emailFromClaims(p, claims, saved.nonce);
}

/** Exported for tests: the identity checks applied to a verified id token. */
export function emailFromClaims(p: Provider, claims: JWTPayload, nonce: string): string {
  if (!claims.iss || !p.issuerOk(claims.iss, claims)) throw new Error("Unexpected issuer");
  if (claims.nonce !== nonce) throw new Error("Nonce mismatch");
  const email = String(
    (p.id === "google" ? claims.email : (claims.email ?? claims.preferred_username)) ?? "",
  ).toLowerCase();
  if (!email.includes("@")) throw new Error("No email in token");
  if (p.id === "google" && claims.email_verified !== true) throw new Error("Email not verified");
  const allowed = (process.env.SSO_ALLOWED_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length && !allowed.includes(email.split("@")[1]!))
    throw new Error("Domain not allowed");
  return email;
}

/** Sign in an existing staff user: a Payload session and token, like a password login. */
export async function createStaffSession(email: string) {
  const p = await payload();
  const found = await p.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
    showHiddenFields: true,
  });
  const user = found.docs[0] as
    | (Record<string, unknown> & {
        id: number | string;
        email: string;
        sessions?: unknown[];
        lockUntil?: string | null;
      })
    | undefined;
  if (!user) return null;
  if (user.lockUntil && new Date(user.lockUntil) > new Date()) return null;
  const collection = p.collections.users.config;
  const auth = collection.auth;
  const sid = crypto.randomUUID();
  const now = new Date();
  const sessions = ((user.sessions ?? []) as { expiresAt: string }[]).filter(
    (s) => new Date(s.expiresAt) > now,
  );
  sessions.push({
    id: sid,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + auth.tokenExpiration * 1000).toISOString(),
  } as never);
  await p.db.updateOne({
    collection: "users",
    id: user.id,
    data: { sessions },
    returning: false,
  } as Parameters<typeof p.db.updateOne>[0]);
  const fieldsToSign = getFieldsToSign({
    collectionConfig: collection,
    email: user.email,
    sid,
    user: user as never,
  });
  const { token } = await jwtSign({
    fieldsToSign,
    secret: p.secret,
    tokenExpiration: auth.tokenExpiration,
  });
  return { user, token, maxAge: auth.tokenExpiration, secure: Boolean(auth.cookies.secure) };
}
