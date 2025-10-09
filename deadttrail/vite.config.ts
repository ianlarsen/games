
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Change base to '/<repo>/' if deploying to GitHub Pages under a repo path
export default defineConfig({
  plugins: [svelte()],
  base: '/', 
  server: { port: 5173 }
});
