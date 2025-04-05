# Multi-stage build for TAP Integration Platform Frontend
# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app
RUN chown -R node:node /app
USER node

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies with clean install for more consistent builds
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Ensure webpack config directory exists
RUN mkdir -p /app/config

# Set production environment
ENV NODE_ENV=production

# Create a production build using webpack
RUN npm run build

# Stage 2: Create the production image with NGINX
FROM nginx:alpine AS production

# Copy compiled app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Create config template for environment variable substitution
RUN cat /etc/nginx/conf.d/default.conf | \
    sed 's|\${BACKEND_URL}|http://backend:8000|g' > /etc/nginx/conf.d/default.conf.template

# Setup entrypoint script to replace environment variables in nginx config
RUN echo '#!/bin/sh\n\
# Replace environment variables in nginx configuration\n\
BACKEND_URL=${BACKEND_URL:-http://backend:8000}\n\
envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf\n\
exec "$@"\n\
' > /docker-entrypoint.d/20-config-setup.sh && chmod +x /docker-entrypoint.d/20-config-setup.sh

# Add a script for environment variable injection at runtime
COPY --from=builder /app/scripts/inject-env.js /docker-entrypoint.d/30-inject-env.js
RUN chmod +x /docker-entrypoint.d/30-inject-env.js

# Create a health check script
RUN echo '#!/bin/sh\n\
curl -f http://localhost:80/ || exit 1\n\
' > /usr/local/bin/healthcheck.sh && chmod +x /usr/local/bin/healthcheck.sh

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["/usr/local/bin/healthcheck.sh"]

# Expose the NGINX port
EXPOSE 80

# NGINX container automatically starts nginx when the container is run