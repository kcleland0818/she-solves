import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  timeout: 180_000,
  reporter: "line",
  use: {
    baseURL: "https://she-solves.lovable.app",
  },
  projects: [
    {
      name: "chromium",
      use: {
        channel: undefined,
        launchOptions: {
          executablePath: process.env.CHROMIUM_BIN,
        },
      },
    },
  ],
});
