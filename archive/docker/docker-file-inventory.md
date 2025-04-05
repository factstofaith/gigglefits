# TAP Integration Platform Docker File Inventory

This document provides a comprehensive inventory of all Docker-related files in the project, their purposes, and relationships.

## Dockerfiles

### Backend Dockerfiles

| File | Purpose | Key Features |
|------|---------|--------------|
| `/backend/Dockerfile` | Production Docker image | Multi-stage build for optimized size, Python 3.12 |
| `/backend/Dockerfile.dev` | Development environment | Python 3.10, includes dev tools, appuser for security |
| `/backend/Dockerfile.optimized` | Optimized production build | Likely performance-optimized version |
| `/backend/Dockerfile.test` | Testing environment | Focused on running tests |
| `/backend/Dockerfile.dev-report.md` | Documentation | Analysis report of dev Dockerfile |
| `/backend/Dockerfile-report.md` | Documentation | Analysis report of production Dockerfile |

### Frontend Dockerfiles

| File | Purpose | Key Features |
|------|---------|--------------|
| `/frontend/Dockerfile` | Production Docker image | Multi-stage build with Node.js and NGINX |
| `/frontend/Dockerfile.dev` | Development environment | Node.js with dev server, includes all build deps |
| `/frontend/Dockerfile.optimized` | Optimized production build | Likely performance-optimized version |
| `/frontend/Dockerfile.dev.optimized` | Optimized dev environment | Streamlined development version |
| `/frontend/Dockerfile-report.md` | Documentation | Analysis report of production Dockerfile |

## Docker Compose Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `/docker-compose.yml` | Main compose file | Defines both frontend and backend services |
| `/frontend/docker-compose.yml` | Frontend-specific | Focused on frontend development only |

## Scripts

### Startup Scripts

| File | Purpose | Key Features |
|------|---------|--------------|
| `/start-containers.sh` | Start all containers | Uses docker-compose.yml |
| `/restart-standardized-env.sh` | Restart with standardized env vars | Uses standardized SERVICE_* variables |
| `/start-docker-env.sh` | Start Docker environment | Similar to start-containers.sh |
| `/start-frontend.sh` | Start frontend container only | Focused on frontend development |
| `/restart-frontend-container.sh` | Restart frontend container | Without restarting backend |

### Validation Scripts

| File | Purpose | Key Features |
|------|---------|--------------|
| `/check-container-status.sh` | Check container health | Reports on running containers |
| `/check-docker-status.sh` | Check Docker service | Validates Docker daemon status |
| `/validate-docker-build.sh` | Validate Docker build | Tests build process |
| `/validate-docker-env.sh` | Validate Docker environment | Checks environment setup |
| `/verify-docker-startup.sh` | Verify startup sequence | Validates container initialization |
| `/test-service-integration.sh` | Test service communication | Validates network connectivity |
| `/test-frontend-container.sh` | Test frontend container | Specific frontend tests |

### Utility Scripts

| File | Purpose | Key Features |
|------|---------|--------------|
| `/debug-frontend-container.sh` | Debug frontend issues | Provides detailed logs |
| `/frontend/docker/inject-env.sh` | Inject environment variables | For frontend container |
| `/frontend/docker/generate-runtime-env.sh` | Generate runtime env | For frontend at runtime |
| `/frontend/docker/healthcheck.sh` | Frontend health check | For Docker health monitoring |
| `/backend/healthcheck.sh` | Backend health check | For Docker health monitoring |
| `/backend/entrypoint.sh` | Backend container entrypoint | Startup logic for backend |

## Key Dependencies

### Frontend Dependencies
- Node.js 18
- Alpine Linux
- Python 3 (for native module builds)
- Build tools (make, g++, etc.)
- Webpack and related tooling
- NGINX (for production builds)

### Backend Dependencies
- Python 3.10/3.12
- Slim Debian
- FastAPI and Uvicorn
- Build tools for Python packages
- Database libraries

## Volume Configuration

### Frontend Volumes
- Source code mounted to container
- Node modules in a named volume

### Backend Volumes
- Source code mounted to container
- Python virtual environment in a named volume
- Data directory in a named volume

## Network Configuration
- Single bridge network for service communication
- Named with environment-specific suffix