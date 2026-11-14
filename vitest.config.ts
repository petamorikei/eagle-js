import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
    // The integration tests share the "Testing" library in Eagle, so test files must not run at the same time.
    fileParallelism: false,
  },
});
