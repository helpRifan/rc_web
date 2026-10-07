import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000', channel: 'chrome' },
  webServer: process.env.E2E_BASE_URL ? undefined : { command: 'npm run start', port: 3000, reuseExistingServer: true },
});
