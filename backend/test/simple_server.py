#\!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import os

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, content_type="application/json"):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
        
    def do_GET(self):
        path = self.path
        
        # Health endpoint
        if path == "/api/health":
            self._set_headers()
            response = {"status": "healthy", "version": "0.1.0"}
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Auth endpoints for user info
        elif path == "/api/auth/me":
            self._set_headers()
            # Return the admin user as the default authenticated user
            response = {
                "id": "1",
                "email": "admin@example.com",
                "name": "Admin User",
                "role": "ADMIN",
                "bypass_mfa": True
            }
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Default 404 for unknown endpoints
        else:
            self.send_error(404, "Endpoint not found")
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}
        
        # Auth login endpoint
        if self.path == "/api/auth/login":
            username = data.get("username", "")
            
            if username == "admin@example.com":
                self._set_headers()
                response = {
                    "access_token": "mock_token_for_admin",
                    "token_type": "bearer",
                    "user": {
                        "id": "1",
                        "email": "admin@example.com",
                        "name": "Admin User",
                        "role": "ADMIN",
                        "bypass_mfa": True
                    }
                }
                self.wfile.write(json.dumps(response).encode())
            elif username == "user@example.com":
                self._set_headers()
                response = {
                    "access_token": "mock_token_for_user",
                    "token_type": "bearer",
                    "user": {
                        "id": "2",
                        "email": "user@example.com",
                        "name": "Regular User",
                        "role": "USER",
                        "bypass_mfa": False
                    }
                }
                self.wfile.write(json.dumps(response).encode())
            else:
                self.send_error(401, "Invalid credentials")
            return
            
        # Default 404 for unknown endpoints
        else:
            self.send_error(404, "Endpoint not found")
    
    def do_PUT(self):
        self.send_error(404, "Endpoint not found")
    
    def do_DELETE(self):
        self.send_error(404, "Endpoint not found")

def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Simple API server for TAP Integration Platform')
    parser.add_argument('--port', type=int, default=8000, help='Port to run the server on')
    
    args = parser.parse_args()
    run(port=args.port)
