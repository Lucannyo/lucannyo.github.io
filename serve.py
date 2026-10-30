"""Serve only the public site files, with gzip and conditional caching."""
import argparse
import gzip
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
PUBLIC = {
    'index.html': 'text/html; charset=utf-8',
    'styles.css': 'text/css; charset=utf-8',
    'app.js': 'text/javascript; charset=utf-8',
    'assets/metal.svg': 'image/svg+xml',
    'assets/blood.svg': 'image/svg+xml',
}


def accepts_gzip(header):
    for item in header.lower().split(','):
        coding, *parameters = item.strip().split(';')
        if coding != 'gzip':
            continue
        quality = '1'
        for parameter in parameters:
            key, _, value = parameter.strip().partition('=')
            if key == 'q':
                quality = value
        try:
            return 0 < float(quality) <= 1
        except ValueError:
            return False
    return False


class SiteHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        name = urlsplit(self.path).path.lstrip('/') or 'index.html'
        if name not in PUBLIC:
            self.send_error(404)
            return
        path = ROOT / name
        if path.is_symlink() or not path.is_file():
            self.send_error(404)
            return
        body = path.read_bytes()
        compressed = accepts_gzip(self.headers.get('Accept-Encoding', ''))
        if compressed:
            body = gzip.compress(body, mtime=0)
        etag = '"' + hashlib.sha256(body).hexdigest() + '"'
        unchanged = etag in self.headers.get('If-None-Match', '').split(', ')
        self.send_response(304 if unchanged else 200)
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('ETag', etag)
        self.send_header('Vary', 'Accept-Encoding')
        if not unchanged:
            self.send_header('Content-Type', PUBLIC[name])
            self.send_header('Content-Length', str(len(body)))
            if compressed:
                self.send_header('Content-Encoding', 'gzip')
        self.end_headers()
        if not unchanged and self.command != 'HEAD':
            self.wfile.write(body)

    do_HEAD = do_GET


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bind', default='127.0.0.1')
    parser.add_argument('--port', default=3000, type=int)
    args = parser.parse_args()
    with ThreadingHTTPServer((args.bind, args.port), SiteHandler) as server:
        print(f'Serving public site files on {args.bind}:{args.port}', flush=True)
        server.serve_forever()
