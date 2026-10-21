"""Local preview server for machines without Node: mirrors dev-server.js.

Case routes such as /peluutin/ serve the portfolio shell, every response is sent with
no-store so edits show up on reload, and PUT /__capture/<name> saves an image rendered in
the page (used to refresh the Behind the screen widget) into the system temp folder.
Run: python3 tools/serve.py [port]
"""
import functools
import http.server
import os
import sys
import tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8093
CAPTURES = os.path.join(tempfile.gettempdir(), 'portfolio-captures')
CASE_ROUTES = {
    'helsinki-sports-map', 'korislab', 'korisiq', 'spire-coach-mod',
    'openslot', 'brio', 'peluutin', 's-havikki', 'tahti',
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        route = path.split('?', 1)[0].split('#', 1)[0].strip('/').split('/')
        if route and route[0] in CASE_ROUTES:
            path = '/index.html'
        return super().translate_path(path)

    def do_PUT(self):
        if not self.path.startswith('/__capture/'):
            self.send_error(404); return
        name = os.path.basename(self.path)
        os.makedirs(CAPTURES, exist_ok=True)
        data = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        with open(os.path.join(CAPTURES, name), 'wb') as out:
            out.write(data)
        self.send_response(204); self.end_headers()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


handler = functools.partial(Handler, directory=ROOT)
print(f'Serving {ROOT} on http://127.0.0.1:{PORT} (captures go to {CAPTURES})', flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler).serve_forever()
