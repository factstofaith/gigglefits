# TAP Integration Platform Docker Setup

This document provides comprehensive documentation for the Docker setup of the TAP Integration Platform.

## Overview

The TAP Integration Platform uses Docker for containerized development and deployment. The setup consists of:

- A frontend service (React, webpack dev server for development)
- A backend service (Python, FastAPI)
- A standardized environment configuration

## Quick Start

To start the development environment:

```bash
# Start the complete development environment
./start-dev-env.sh
```

This will:
1. Build the Docker images
2. Start the containers
3. Set up the network
4. Wait for health checks to pass
5. Display access information

## Container Structure

### Frontend Container

The frontend development container:
- Uses Node.js 18 with Alpine Linux
- Includes Python and build tools for native npm modules
- Mounts source code as volumes for live development
- Runs on port 3456 (host) → 3000 (container)
- Includes webpack dev server for hot reloading

### Backend Container

The backend container:
- Uses Python 3.10 with Debian Slim
- Mounts source code as volumes for live development
- Runs on port 8000
- Uses SQLite database stored in a named volume

## Environment Variables

The environment uses standardized variables with consistent naming patterns.

### Frontend Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| SERVICE_NAME | Container name | frontend |
| SERVICE_ENV | Environment | development |
| SERVICE_VERSION | App version | 1.0.0 |
| SERVICE_API_URL | Backend API URL | http://tap-backend:8000 |
| SERVICE_DEV_MODE | Development mode | true |
| SERVICE_HOT_RELOAD | Hot reloading | true |
| SERVICE_ERROR_REPORTING | Error reporting | true |
| SERVICE_ERROR_LEVEL | Log level | debug |

### Backend Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| SERVICE_NAME | Container name | backend |
| SERVICE_ENV | Environment | development |
| SERVICE_VERSION | App version | 1.0.0 |
| SERVICE_DATABASE_URL | Database connection | sqlite:///data/local_dev.sqlite |
| SERVICE_SECRET_KEY | Security key | local_development_secret_change_in_production |
| SERVICE_LOG_LEVEL | Log level | debug |
| SERVICE_DEBUG | Debug mode | true |
| SERVICE_WORKERS | Worker count | 1 |

## Volume Configuration

The setup uses named volumes for persistent data:

- `frontend_node_modules`: npm dependencies
- `backend_data`: Database and persistent files

## Docker Files

### Primary Configuration Files

- `docker-compose.yml`: Main compose file
- `frontend/Dockerfile.dev`: Frontend development image
- `backend/Dockerfile.dev`: Backend development image

### Scripts

- `start-dev-env.sh`: Main development startup script

## Customization

### Adding Environment Variables

To add custom environment variables, edit `docker-compose.yml` and add them under the appropriate service's `environment` section.

### Modifying Build Arguments

Build arguments can be modified in `docker-compose.yml` in the service's `build.args` section.

## Troubleshooting

### Container Health Checks

Both containers implement health checks:
- Frontend: `http://localhost:3000/health`
- Backend: `http://localhost:8000/health`

### Common Issues

1. **Frontend build failures**: Often related to npm dependencies requiring Python or build tools. The Dockerfile.dev includes all necessary dependencies.

2. **Backend startup issues**: Check logs with `docker logs tap-backend-dev`.

3. **Network connectivity**: Ensure containers can communicate by checking the Docker network with `docker network inspect tap-network-dev`.

4. **Volume permissions**: If you experience permission issues, check that volumes have correct permissions.

## Development Workflow

1. Start the environment with `./start-dev-env.sh`
2. Edit code in your IDE - changes are reflected immediately due to volume mounts
3. Frontend changes trigger hot reloading
4. Backend changes require manual restart: `docker restart tap-backend-dev`

## Architecture Notes

The development environment uses direct volume mounts to enable live code editing. This approach allows for rapid development while maintaining container isolation.

For the frontend, node_modules are stored in a named volume to prevent overwriting by the host's mounted directory and ensure consistent dependencies.