import path from 'node:path';
import { defineConfig,normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// Development serves shared original assets; production uses ../images and ../sounds.
export default defineConfig({root:'phaser',base:'./',publicDir:false,server:{host:'0.0.0.0',port:5173},
 build:{outDir:path.resolve(import.meta.dirname,'engine'),emptyOutDir:true,modulePreload:false,rollupOptions:{output:{format:'iife',inlineDynamicImports:true}}},
 plugins:[...viteStaticCopy({targets:[{src:normalizePath(path.resolve(import.meta.dirname,'images/**/*')),dest:'images'},{src:normalizePath(path.resolve(import.meta.dirname,'sounds/**/*')),dest:'sounds'},{src:normalizePath(path.resolve(import.meta.dirname,'biome-config.json')),dest:'.'}]}).filter(plugin=>plugin.apply==='serve'),
  {name:'classic-bundled-entry',apply:'build',enforce:'post',generateBundle(options,bundle){for(const file of Object.values(bundle)){if(file.type==='asset'&&file.fileName.endsWith('.html'))file.source=String(file.source).replace(/type="module"\s*(?:crossorigin\s*)?/g,'defer ');}}
  }]});
