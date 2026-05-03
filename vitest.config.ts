import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    environmentMatchGlobs: [
      ["**/*-actions.test.ts", "node"],
      ["**/*.integration.test.ts", "node"],
    ],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "tests/e2e/**", ".next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
