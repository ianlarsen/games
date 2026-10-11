import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=import.meta.dirname;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg','.json':'application/json'};
http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const data=fs.readFileSync(filename);res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(5176,'127.0.0.1',()=>console.log('Robot Bunny Easy: http://localhost:5176/'));
