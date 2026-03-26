import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/calendar/' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
