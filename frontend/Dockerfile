# Standardized Frontend Dockerfile
# Multi-stage build for efficient container size

# ===== Build Stage =====
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

# ===== Runtime Stage =====
FROM nginx:alpine AS runtime

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Add health check script
COPY healthcheck.sh /usr/share/nginx/healthcheck.sh
RUN chmod +x /usr/share/nginx/healthcheck.sh

# Copy runtime environment script
COPY docker/generate-runtime-env.sh /docker-entrypoint.d/40-generate-runtime-env.sh
RUN chmod +x /docker-entrypoint.d/40-generate-runtime-env.sh

# Set working directory
WORKDIR /usr/share/nginx/html

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD /usr/share/nginx/healthcheck.sh

# Runtime environment variables
ENV NGINX_PORT=80 \
    SERVICE_NAME=tap-frontend \
    SERVICE_ENVIRONMENT=development

EXPOSE 80

# Nginx will start automatically through Docker's entrypoint