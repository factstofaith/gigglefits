#!/usr/bin/env python3
"""
Simple HTTP server to serve the static demo file
"""

import http.server
import socketserver
import os
import webbrowser
from urllib.parse import unquote
import sys

# Configuration
PORT = 8080
STATIC_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                          "frontend", "static-demo.html")

class DemoHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Serve the static demo file for any path
        self.path = STATIC_FILE
        
        # Check if file exists
        if not os.path.exists(self.path):
            self.send_error(404, "File not found")
            return
            
        # Determine content type
        content_type = "text/html"
        
        # Send headers
        self.send_response(200)
        self.send_header("Content-type", content_type)
        self.end_headers()
        
        # Send file content
        with open(self.path, 'rb') as file:
            self.wfile.write(file.read())

# Create server
Handler = DemoHandler
httpd = socketserver.TCPServer(("", PORT), Handler)

print(f"Serving TAP Integration Platform demo at http://localhost:{PORT}")
print("Login credentials:")
print("Username: ai-dev")
print("Password: TAPintoAI!")
print("Press Ctrl+C to stop the server")

# Open browser
try:
    webbrowser.open(f"http://localhost:{PORT}")
except:
    print(f"Please open a browser and go to http://localhost:{PORT}")

# Start server
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nShutting down server...")
    httpd.server_close()
    sys.exit(0)