import path from 'node:path';
import { defineConfig,normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// Development serves shared original assets; production uses ../images and ../sounds.
export default defineConfig({root:'phaser',base:'./',publicDir:false,server:{host:'0.0.0.0',port:5173},
 build:{outDir:path.resolve(import.meta.dirname,'engine'),emptyOutDir:true},
 plugins:viteStaticCopy({targets:[{src:normalizePath(path.resolve(import.meta.dirname,'images/**/*')),dest:'images'},{src:normalizePath(path.resolve(import.meta.dirname,'sounds/**/*')),dest:'sounds'},{src:normalizePath(path.resolve(import.meta.dirname,'biome-config.json')),dest:'.'}]}).filter(plugin=>plugin.apply==='serve')});