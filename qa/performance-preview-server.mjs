import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { brotliCompressSync, gzipSync, constants as zlibConstants } from 'node:zlib';

const root = path.resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4173);
if (!fs.existsSync(root)) throw new Error('dist/ is missing; run npm run build:dist first.');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf'
};
const compressible = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt', '.webmanifest']);

function resolveFile(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  if (decoded.includes('\0')) return null;
  const candidate = path.resolve(root, '.' + decoded);
  if (candidate !== root && !candidate.startsWith(root + path.sep)) return null;
  let file = candidate;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) && !path.extname(file)) file = path.join(file, 'index.html');
  return file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}

const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  let pathname;
  try { pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname; }
  catch { res.writeHead(400).end(); return; }
  const file = resolveFile(pathname);
  if (!file) {
    const notFound = path.join(root, '404.html');
    if (fs.existsSync(notFound)) {
      const body = fs.readFileSync(notFound);
      res.writeHead(404, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-cache' });
      if (req.method === 'HEAD') res.end(); else res.end(body);
    } else res.writeHead(404).end();
    return;
  }

  const ext = path.extname(file).toLowerCase();
  const original = fs.readFileSync(file);
  const headers = {
    'Content-Type': mime[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Accept-Encoding'
  };
  if (path.basename(file) === 'sw.js') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  else if (ext === '.html') headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  else if (/\.[a-f0-9]{12}\.(?:js|css)$/i.test(path.basename(file))) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  else headers['Cache-Control'] = 'public, max-age=3600, stale-while-revalidate=86400';

  let body = original;
  const accept = req.headers['accept-encoding'] || '';
  if (compressible.has(ext) && /\bbr\b/.test(accept)) {
    body = brotliCompressSync(original, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } });
    headers['Content-Encoding'] = 'br';
  } else if (compressible.has(ext) && /\bgzip\b/.test(accept)) {
    body = gzipSync(original, { level: 6 });
    headers['Content-Encoding'] = 'gzip';
  }
  headers['Content-Length'] = String(body.length);
  res.writeHead(200, headers);
  if (req.method === 'HEAD') res.end(); else res.end(body);
});

server.listen(port, '0.0.0.0', () => {
  process.stdout.write('Wealth Arrays Brotli preview server listening on ' + port + '\n');
});
