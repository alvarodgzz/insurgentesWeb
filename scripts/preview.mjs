import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { build } from './build.mjs';

const root = fileURLToPath(new URL('..',import.meta.url));
const allowed = new Set(['assets','css','js','images','content','admin','templates']);
const types = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.otf':'font/otf','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8' };
await build();
const server = createServer(async (request,response) => {
  try {
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const url = new URL(request.url,'http://localhost');
    let path = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (!path) path = 'index.html';
    if (path.endsWith('/')) path += 'index.html';
    if (path !== 'index.html' && !allowed.has(path.split('/')[0])) throw new Error('Not found');
    const target = await realpath(resolve(root,path));
    const local = relative(root,target);
    if (local === '..' || local.startsWith(`..${sep}`) || local.split(sep).some(part => part.startsWith('.'))) throw new Error('Not found');
    if (!(await stat(target)).isFile()) throw new Error('Not found');
    response.writeHead(200,{'Content-Type':types[extname(target)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    response.end(request.method === 'HEAD' ? undefined : await readFile(target));
  } catch { response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}); response.end('No encontrado'); }
});
server.on('error',error => { console.error(`No se pudo abrir la vista previa: ${error.message}`); process.exitCode = 1; });
server.listen(8000,'127.0.0.1',() => {
  console.log('Sitio: http://127.0.0.1:8000/\nEditor: http://127.0.0.1:8000/admin/\nCtrl+C para detener.');
  if (process.argv.includes('--open') && process.platform === 'darwin') spawn('open',['http://127.0.0.1:8000/admin/'],{stdio:'ignore'}).on('error',() => {});
});
