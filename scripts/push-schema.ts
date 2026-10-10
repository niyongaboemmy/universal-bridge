/**
 * Creates the schema the collections describe by starting Payload in dev mode
 * (schema push) against DATABASE_URL. Used by scripts/check-migrations.sh;
 * point it at an empty, throwaway database only.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

if (process.env.NODE_ENV === "production")
  throw new Error("push-schema runs in development mode only");
await getPayload({ config });
process.exit(0);
