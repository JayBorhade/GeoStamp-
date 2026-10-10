import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const runtime = globalThis as unknown as {
  process?: { env?: Record<string, string | undefined> };
};
const isGitHubPages = runtime.process?.env?.GITHUB_ACTIONS === 'true';

export default defineConfig({
  base: isGitHubPages ? '/GeoStamp-/' : '/',
  plugins: [react()],
  server: { host: '0.0.0.0' },
});
