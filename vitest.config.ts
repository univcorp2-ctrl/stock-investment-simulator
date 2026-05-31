import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/strategyAdvisor.test.ts", "test/execution.test.ts"],
    exclude: ["test/**/*.legacy.test.ts", "test/stooq.test.ts", "test/**/*.old.test.ts", "node_modules", "dist"]
  }
});
