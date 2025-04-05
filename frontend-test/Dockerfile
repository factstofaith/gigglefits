FROM node:18-alpine

WORKDIR /app

# Install basic utilities
RUN apk add --no-cache curl bash

# Create basic test file
RUN echo "console.log('Frontend test container is running')" > server.js

# Create health check script
RUN echo '#!/bin/sh' > healthcheck.sh && \
    echo 'echo "Health check running..."' >> healthcheck.sh && \
    echo 'exit 0' >> healthcheck.sh && \
    chmod +x healthcheck.sh

# Expose port for test server
EXPOSE 3000

# Simple health check
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 CMD ["./healthcheck.sh"]

# Start with simple test server
CMD ["node", "-e", "const http = require('http'); http.createServer((req, res) => { res.writeHead(200, {'Content-Type': 'text/plain'}); res.end('TAP Frontend Test Container\\n'); }).listen(3000, () => console.log('Server running on port 3000'));"]