/**
 * Passenger startup file for cPanel "Setup Node.js App" (docs/DEPLOYMENT.md).
 *
 * Lives in the application root, outside the releases, and is never replaced by
 * a deploy. It loads the environment file, then starts the standalone Next.js
 * server of the release that `current` points to. CommonJS on purpose: older
 * Passenger versions `require()` the startup file, and server.js is ESM.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS by design (see above) */
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = __dirname;
const envFile = path.join(root, ".env.production");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

// Pending database migrations run when Payload connects (src/payload.config.ts).
process.env.PAYLOAD_MIGRATE_ON_START = "1";

// CloudLinux sets HOSTNAME to the server's name; Next.js would try to bind to it.
// Passenger ignores the address anyway; this matters for `node app.cjs` by hand.
process.env.HOSTNAME = "127.0.0.1";

const server = path.join(fs.realpathSync(path.join(root, "current")), "server.js");
import(pathToFileURL(server).href).catch((err) => {
  console.error("[app.cjs] Could not start", server, err);
  process.exit(1);
});
