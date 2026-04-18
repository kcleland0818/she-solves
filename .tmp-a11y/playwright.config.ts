import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  timeout: 180_000,
  reporter: "line",
  use: {
    baseURL: "https://id-preview--9a8541b2-62cb-4417-8870-2485831e6b18.lovable.app",
  },
});
