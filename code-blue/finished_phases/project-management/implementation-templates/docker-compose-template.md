# Docker Compose Implementation Template

This document provides a template for the updated `docker-compose.yml` file with standardized Docker configuration for the TAP Integration Platform.

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: ${FRONTEND_DOCKERFILE:-Dockerfile.dev}
      args:
        - NPM_INSTALL_FLAGS=--legacy-peer-deps
    image: tap-frontend:${ENV:-local}
    container_name: tap-frontend-${ENV:-dev}
    ports:
      - ${FRONTEND_PORT:-3456}:3000
    volumes:
      - ./frontend:/app
      - frontend_node_modules:/app/node_modules
    environment:
      # Core environment variables
      - NODE_ENV=${NODE_ENV:-development}
      - REACT_APP_API_URL=${REACT_APP_API_URL:-http://backend:8000}
      - REACT_APP_VERSION=${REACT_APP_VERSION:-1.0.0}
      - REACT_APP_ENVIRONMENT=${NODE_ENV:-development}
      
      # Development environment variables
      - CHOKIDAR_USEPOLLING=true
      - WDS_SOCKET_HOST=${WDS_SOCKET_HOST:-localhost}
      - WDS_SOCKET_PORT=${FRONTEND_PORT:-3456}
      - WEBPACK_DEV_SERVER=true
      
      # Docker error handling variables
      - REACT_APP_RUNNING_IN_DOCKER=true
      - REACT_APP_CONTAINER_ID=tap-frontend-${ENV:-dev}
      - REACT_APP_CONTAINER_VERSION=${REACT_APP_VERSION:-1.0.0}
      - REACT_APP_DOCKER_ENVIRONMENT=${NODE_ENV:-development}
      - REACT_APP_HEALTH_CHECK_INTERVAL=60000
      - REACT_APP_DOCKER_VERBOSE_LOGGING=${REACT_APP_DOCKER_VERBOSE_LOGGING:-false}
      - REACT_APP_ERROR_REPORTING_URL=${REACT_APP_ERROR_REPORTING_URL:-/api/errors}
      - REACT_APP_ERROR_LOGGING_ENABLED=true
      - REACT_APP_ERROR_LOG_LEVEL=${REACT_APP_ERROR_LOG_LEVEL:-warn}
      - REACT_APP_DOCKER_ERROR_HANDLING=enabled
      - REACT_APP_MAX_ERRORS_PER_SESSION=100
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "sh", "/app/healthcheck.sh"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - tap-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: ${BACKEND_DOCKERFILE:-Dockerfile.dev}
      args:
        - EXTRA_PACKAGES=${BACKEND_EXTRA_PACKAGES:-pydantic-settings psutil httpx}
    image: tap-backend:${ENV:-local}
    container_name: tap-backend-${ENV:-dev}
    ports:
      - ${BACKEND_PORT:-8000}:8000
    volumes:
      - ./backend:/app
      - backend_venv:/app/.venv
      - backend_data:/app/data
    environment:
      # Core environment variables
      - PYTHONUNBUFFERED=1
      - PYTHONDONTWRITEBYTECODE=1
      - ENVIRONMENT=${NODE_ENV:-development}
      - APP_ENVIRONMENT=${NODE_ENV:-development}
      - LOG_LEVEL=${LOG_LEVEL:-debug}
      
      # Application configuration
      - CORS_ORIGINS=${CORS_ORIGINS:-["http://localhost:3000","http://localhost:3456"]}
      - DATABASE_URL=${DATABASE_URL:-sqlite:///data/local_dev.sqlite}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY:-local_development_secret_change_in_production}
      
      # Development options
      - DEBUG=true
      - DEBUG_MODE=true
      - SETUP_INVITATION_SYSTEM=${SETUP_INVITATION_SYSTEM:-false}
      - DB_SSL_REQUIRED=${DB_SSL_REQUIRED:-false}
      - WORKERS=${BACKEND_WORKERS:-1}
      - AUTOMIGRATE=${AUTOMIGRATE:-false}
      - AUTO_SEED=${AUTO_SEED:-true}
      
      # Docker-specific configuration
      - RUNNING_IN_DOCKER=true
      - CONTAINER_NAME=tap-backend-${ENV:-dev}
      - GRACEFUL_SHUTDOWN_TIMEOUT=30
    healthcheck:
      test: ["CMD", "sh", "/app/healthcheck.sh"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
    networks:
      - tap-network
    restart: unless-stopped

networks:
  tap-network:
    name: tap-network-${ENV:-dev}
    driver: bridge

volumes:
  frontend_node_modules:
    name: tap-frontend-node-modules-${ENV:-dev}
  backend_venv:
    name: tap-backend-venv-${ENV:-dev}
  backend_data:
    name: tap-backend-data-${ENV:-dev}
```

## Key Improvements:

1. **Standardized Environment Variables**:
   - Grouped environment variables by purpose
   - Added descriptive comments
   - Ensured consistent naming conventions

2. **Health Check Configuration**:
   - Changed curl healthcheck to use the CMD form for better compatibility
   - Added appropriate intervals and timeouts
   - Set reasonable start periods to allow for service initialization

3. **Dependencies and Orchestration**:
   - Used condition: service_healthy for dependencies
   - Ensured proper restart policies
   - Added container names for better identification

4. **Docker-Specific Configuration**:
   - Added Docker-specific environment variables
   - Configured file watching for Docker environments
   - Added graceful shutdown timeout

## Implementation Notes:

1. This template standardizes the Docker Compose configuration while maintaining compatibility with existing services.
2. All environment variables have sensible defaults for local development.
3. Health checks are properly configured for both services.
4. Restart policies ensure services recover from failures.
5. Volume mounts are standardized for development environments.