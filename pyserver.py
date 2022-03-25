import os
from http.server import HTTPServer, CGIHTTPRequestHandler

os.chdir('.')

# Create server object listening the port 80
server_object = HTTPServer(server_address=('', 8888), RequestHandlerClass=CGIHTTPRequestHandler)

# Start the web server
server_object.serve_forever()
