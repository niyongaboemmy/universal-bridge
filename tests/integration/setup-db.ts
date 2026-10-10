import type { Payload } from "payload";

/**
 * Boots Payload against the test database (TEST_DATABASE_URL, default
 * universal_bridge_test). Schema is pushed on first boot.
 */
export async function bootPayload(): Promise<Payload> {
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ?? "postgres://localhost:5432/universal_bridge_test";
  process.env.PAYLOAD_SECRET ??= "test-secret";
  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("@/payload.config"),
  ]);
  return getPayload({ config });
}
