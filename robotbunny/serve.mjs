import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.argv[2]||8000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.mp3':'audio/mpeg','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 let filename=path.resolve(root,'.'+pathname);
 if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{if(fs.statSync(filename).isDirectory())filename=path.join(filename,'index.html');if(!fs.statSync(filename).isFile())throw new Error();}catch{res.writeHead(404).end('Not found');return;}
 res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache'});
 fs.createReadStream(filename).on('error',()=>res.destroy()).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log('Robot Bunny: http://localhost:'+port+'/engine/ (Ctrl+C to stop)'));
