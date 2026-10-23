import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // Vercel corre en UTC: las fechas 'YYYY-MM-DD' se interpretan igual que en producción
    env: { TZ: "UTC" },
    setupFiles: ["tests/setup.ts"],
  },
});
