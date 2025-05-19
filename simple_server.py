import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = '.'

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.path = '/new_landing_page.html'
        elif self.path == '/client-portal':
            self.path = '/client-portal.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

os.chdir(DIRECTORY)
with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
