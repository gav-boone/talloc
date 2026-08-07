import { defineConfig } from 'vite';

export default defineConfig({
  base: '/talloc/',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
