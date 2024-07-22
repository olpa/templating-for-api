from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import os


class MyHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        root = os.getcwd()
        path2 = path.lstrip("/")
        if path2.startswith("js/"):
            path2 = path2[3:]
            hostpath = os.path.join(root, "../../jsonnet-js-ts/dist", path2)
        else:
            hostpath = os.path.join(root, path2)

        print("translate_path:", {"path": path, "hostpath": hostpath})

        return hostpath


PORT = 8000
server = TCPServer(("", PORT), MyHandler)
print(f"Server running on port {PORT}")
server.serve_forever()
