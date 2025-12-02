import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load .env file for integration tests
  const env = loadEnv(mode, process.cwd(), "");

  return {
    test: {
      globals: true,
      environment: "node",
      include: ["tests/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        include: ["src/**/*.ts"],
        exclude: ["src/**/*.d.ts", "src/abis/**", "src/examples/**"],
      },
      testTimeout: 10000,
      // Make environment variables available to tests
      env,
    },
  };
});
