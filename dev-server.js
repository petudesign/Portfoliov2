const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = fs.realpathSync(__dirname);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function sendFile(response, method, filePath, statusCode = 200) {
  fs.realpath(filePath, (realErr, resolved) => {
    if (realErr || (resolved !== root && !resolved.startsWith(`${root}${path.sep}`))) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    fs.stat(resolved, (statErr, stats) => {
      if (statErr || !stats.isFile()) {
        response.writeHead(404).end('Not found');
        return;
      }

      response.writeHead(statusCode, {
        'Cache-Control': 'no-cache',
        'Content-Length': stats.size,
        'Content-Type':
          contentTypes[path.extname(resolved).toLowerCase()] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      });

      if (method === 'HEAD') {
        response.end();
        return;
      }

      const stream = fs.createReadStream(resolved);
      stream.on('error', () => {
        if (!response.headersSent) response.writeHead(500);
        response.end('Internal server error');
      });
      stream.pipe(response);
    });
  });
}

function send404(response, method) {
  const notFoundPage = path.join(root, '404.html');
  fs.stat(notFoundPage, (err, stats) => {
    if (!err && stats.isFile()) sendFile(response, method, notFoundPage, 404);
    else response.writeHead(404).end('Not found');
  });
}

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const candidate = path.resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(candidate, (err, stats) => {
    if (!err && stats.isDirectory()) {
      const indexFile = path.join(candidate, 'index.html');
      fs.stat(indexFile, (idxErr, idxStats) => {
        if (!idxErr && idxStats.isFile()) sendFile(response, request.method, indexFile);
        else send404(response, request.method);
      });
      return;
    }

    if (!err && stats.isFile()) {
      sendFile(response, request.method, candidate);
      return;
    }

    // Mirror Vercel cleanUrls: /foo -> /foo.html
    const cleanHtml = `${candidate}.html`;
    fs.stat(cleanHtml, (htmlErr, htmlStats) => {
      if (!htmlErr && htmlStats.isFile()) sendFile(response, request.method, cleanHtml);
      else send404(response, request.method);
    });
  });
});

function parsePort(argv) {
  const idx = argv.indexOf('--port');
  if (idx === -1) return 8092;
  const parsed = Number(argv[idx + 1]);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    console.error(`Invalid port: ${argv[idx + 1]}`);
    process.exit(1);
  }
  return parsed;
}

const port = parsePort(process.argv.slice(2));
server.on('error', (error) => {
  console.error(`Server failed on port ${port}: ${error.message}`);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Portfolio preview: http://127.0.0.1:${port}/`);
});
