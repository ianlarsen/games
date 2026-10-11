import path from 'node:path';
import { defineConfig } from 'vite';
export default defineConfig({
  root: 'phaser', base: './', publicDir: path.resolve(import.meta.dirname, 'public'),
  server: { host: '127.0.0.1', port: 5174 },
  build: { outDir: path.resolve(import.meta.dirname, 'dist'), emptyOutDir: true }
});
