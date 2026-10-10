/**
 * NFR-MNT-06: configuration check at server start. In production a missing
 * required value stops the server with a clear message instead of failing on
 * the first request; recommended values only warn.
 */
const REQUIRED = [
  "DATABASE_URL",
  "PAYLOAD_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "REVALIDATE_SECRET",
  "CRON_SECRET",
  "RATE_LIMIT_SALT",
];
const RECOMMENDED = [
  ["UPSTASH_REDIS_REST_URL", "rate limits are per server instance only"],
  ["S3_BUCKET", "uploads are stored on the server's local disk"],
  ["CLAMAV_HOST", "uploaded CVs stay 'pending' until a virus scanner is configured"],
  ["CERT_SIGNING_KEY", "certificate QR codes are not signed"],
  ["SENTRY_DSN", "server errors are only logged"],
] as const;

const WEAK = new Set(["", "change-me", "change-me-to-a-long-random-string", "dev"]);

export function checkEnv(env: NodeJS.ProcessEnv = process.env): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const key of REQUIRED) {
    if (!env[key] || WEAK.has(env[key]!))
      errors.push(`${key} is missing or still the example value`);
  }
  if (env.PAYLOAD_SECRET && env.PAYLOAD_SECRET.length < 32)
    errors.push("PAYLOAD_SECRET must be at least 32 characters");
  if (env.NEXT_PUBLIC_SITE_URL && !env.NEXT_PUBLIC_SITE_URL.startsWith("https://"))
    errors.push("NEXT_PUBLIC_SITE_URL must use https");
  if (env.S3_BUCKET && (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY))
    errors.push("S3_BUCKET is set without S3 credentials");
  if (env.UPSTASH_REDIS_REST_URL && !env.UPSTASH_REDIS_REST_TOKEN)
    errors.push("UPSTASH_REDIS_REST_TOKEN is missing");
  if (env.RATE_LIMIT_SCALE && env.RATE_LIMIT_SCALE !== "1")
    warnings.push("RATE_LIMIT_SCALE is ignored in production");
  if (!env.RESEND_API_KEY && !env.SMTP_HOST)
    warnings.push(
      "RESEND_API_KEY / SMTP_HOST is not set: emails are written to disk instead of being sent",
    );
  if (env.SMTP_HOST && env.SMTP_USER && !env.SMTP_PASSWORD)
    errors.push("SMTP_USER is set without SMTP_PASSWORD");
  for (const [key, effect] of RECOMMENDED)
    if (!env[key]) warnings.push(`${key} is not set: ${effect}`);
  return { errors, warnings };
}
