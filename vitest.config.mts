import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/integration/**/*.test.ts",
      "src/**/*.test.{ts,tsx}",
    ],
    fileParallelism: false,
    testTimeout: 30_000,
    setupFiles: ["tests/unit/setup.ts"],
    coverage: {
      include: ["src/lib/**", "src/features/**/actions.ts", "src/features/**/schema.ts"],
    },
  },
});
