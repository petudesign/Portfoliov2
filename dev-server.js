const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = __dirname;
const caseRoutes = new Set([
  'helsinki-sports-map',
  'korisiq',
  'spire-coach-mod',
  'brio',
  'peluutin',
  's-havikki',
  'tahti',
]);
const contentTypes = {
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.otf': 'font/otf',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const route = pathname.split('/').filter(Boolean);
  if (route.length && caseRoutes.has(route[0])) pathname = '/index.html';

  let filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  if (pathname.endsWith('/')) filePath = path.join(filePath, 'index.html');

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Length': stats.size,
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filePath).pipe(response);
  });
});

const port = Number(process.argv[process.argv.indexOf('--port') + 1]) || 8092;
server.listen(port, '127.0.0.1', () => {
  console.log(`Portfolio preview: http://127.0.0.1:${port}/`);
});
