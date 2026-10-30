import gzip
import io
import unittest
from serve import ROOT, SiteHandler, accepts_gzip


def response(path, headers=None, command='GET'):
    handler = object.__new__(SiteHandler)
    handler.path, handler.headers, handler.command = path, headers or {}, command
    handler.wfile = io.BytesIO()
    result = {'headers': {}}
    handler.send_response = lambda code: result.update(status=code)
    handler.send_error = handler.send_response
    handler.send_header = lambda key, value: result['headers'].update({key: value})
    handler.end_headers = lambda: None
    handler.do_GET()
    result['body'] = handler.wfile.getvalue()
    return result


class DeliveryTest(unittest.TestCase):
    def test_compression_and_revalidation(self):
        result = response('/app.js', {'Accept-Encoding': 'gzip'})
        self.assertEqual(result['status'], 200)
        self.assertEqual(gzip.decompress(result['body']), (ROOT / 'app.js').read_bytes())
        cached = response('/app.js', {'Accept-Encoding': 'gzip', 'If-None-Match': result['headers']['ETag']})
        self.assertEqual(cached['status'], 304)
        self.assertEqual(cached['body'], b'')

    def test_private_files_are_not_served(self):
        for path in ('/.git/config', '/serve.py', '/PRODUCT.md', '/assets/../PRODUCT.md'):
            self.assertEqual(response(path)['status'], 404)

    def test_uncompressed_and_head(self):
        self.assertFalse(accepts_gzip('gzip;q=0'))
        self.assertFalse(accepts_gzip('gzip;q=invalid'))
        result = response('/styles.css', {'Accept-Encoding': 'gzip;q=0'})
        self.assertEqual(result['body'], (ROOT / 'styles.css').read_bytes())
        head = response('/styles.css', command='HEAD')
        self.assertEqual(head['body'], b'')
        self.assertEqual(int(head['headers']['Content-Length']), len(result['body']))


if __name__ == '__main__':
    unittest.main()
