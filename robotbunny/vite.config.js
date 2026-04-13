import path from 'node:path';
import { defineConfig, loadEnv, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  return {
    root: 'phaser',
    base,
    publicDir: false,
    server: {
      host: '0.0.0.0',
      port: 5173
    },
    build: {
      outDir: path.resolve(__dirname, 'docs'),
      emptyOutDir: true
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(path.resolve(__dirname, 'images/**/*')),
            dest: 'images'
          },
          {
            src: normalizePath(path.resolve(__dirname, 'sounds/**/*')),
            dest: 'sounds'
          },
          {
            src: normalizePath(path.resolve(__dirname, 'biome-config.json')),
            dest: '.'
          }
        ]
      })
    ]
  };
});
