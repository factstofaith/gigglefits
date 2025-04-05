# TAP Integration Platform Environment

This document provides a comprehensive overview of the TAP Integration Platform environment, including architecture, configuration, standards, dependencies, Docker setup, and operational guidelines.

## System Architecture

The TAP Integration Platform consists of these core components:

### Frontend
- **Technology Stack**: React 18.x, Node.js 18.x
- **Container**: Node 18 Alpine
- **Package Manager**: npm
- **Development Server**: Webpack Dev Server
- **Build Tool**: Webpack 5.x

### Backend
- **Technology Stack**: Python 3.10, FastAPI
- **Container**: Python 3.10 Slim
- **Package Manager**: pip
- **Database**: SQLAlchemy with SQLite (development)
- **API Framework**: FastAPI with Pydantic

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Networking**: Bridge Network
- **Volume Management**: Named Docker volumes
- **Health Monitoring**: Custom health check scripts

## Environment Standardization Principles

The platform follows these key standardization principles:

1. **Single Source of Truth**: Master configuration files are the single source of truth
2. **Standardized Naming**: All standardized files follow the `.master.*` naming convention
3. **Docker Integration**: Seamless integration with containerized environments
4. **Legacy Compatibility**: Maintained backward compatibility with existing systems
5. **Minimalist Approach**: Only necessary files are kept; duplicative configurations are removed

## Dependency Matrix

### Frontend Dependencies

* **UI Framework**
  - React 18.x - Component-based UI development
  - React DOM 18.x - DOM manipulation for React
  - React Router 6.x - Client-side routing
  - Material UI 5.x - UI component library

* **State Management & API**
  - Context API 18.x - Application state management
  - Axios 0.27.x - HTTP client for API requests
  - SWR 2.x - React Hooks for data fetching

* **Forms & Utilities**
  - React Hook Form 7.x - Form state management
  - Yup 0.32.x - Schema validation
  - date-fns 2.x - Date manipulation
  - lodash 4.x - Utility functions

* **Build Tools**
  - Webpack 5.x - Module bundling
  - Babel 7.x - JavaScript transpilation
  - TypeScript 4.x - Static type checking

* **Testing**
  - Jest 27.x - Unit/integration testing
  - Cypress 10.x - End-to-end testing

* **Native Modules**
  - canvas 2.x - 2D graphics rendering
  - node-sass 7.x - SASS preprocessing

### Backend Dependencies

* **Web Framework**
  - FastAPI 0.95.x - API framework
  - Uvicorn 0.17.x - ASGI server
  - Starlette 0.27.x - ASGI toolkit
  - Pydantic 2.x - Data validation
  - email-validator 1.x - Email validation
  - python-multipart 0.0.5 - Form parsing

* **Database**
  - SQLAlchemy 2.0.x - ORM
  - Alembic 1.10.x - Migrations
  - psycopg2-binary 2.9.x - PostgreSQL adapter

* **Authentication**
  - PyJWT 2.6.x - JWT handling
  - passlib 1.7.x - Password hashing
  - python-jose 3.3.x - JWE/JWS
  - bcrypt 4.0.x - Password hashing

* **Storage**
  - boto3 1.26.x - AWS S3 client
  - azure-storage-blob 12.16.x - Azure Blob Storage

* **Testing**
  - pytest 7.3.x - Testing framework
  - pytest-cov 4.1.x - Coverage
  - httpx 0.24.x - HTTP client

* **Utilities**
  - pydantic-settings 2.0.x - Settings management
  - psutil 5.9.x - Process utilities
  - python-dotenv 1.0.x - Env variables

## Docker Configuration

### Docker Environment Architecture

The platform uses a standardized Docker environment with the following components:

1. **Services**
   - Frontend service (Node.js 18 with Alpine)
   - Backend service (Python 3.10 with Debian Slim)

2. **Configuration Files**
   - `docker-compose.master.yml` - Main service orchestration
   - `frontend/Dockerfile.master` - Frontend container definition
   - `backend/Dockerfile.master` - Backend container definition

3. **Management Scripts**
   - `start-dev-env.master.sh` - Primary environment startup
   - `check-docker-status.master.sh` - Container status verification

4. **Validation Scripts**
   - `validate-docker-build.master.sh` - Build process validation
   - `validate-docker-env.master.sh` - Environment configuration validation
   - `verify-docker-startup.master.sh` - Startup sequence verification
   - `test-service-integration.master.sh` - Service communication testing
   - `validation.master.sh` - Comprehensive system validation

5. **Support Scripts**
   - `frontend/docker/healthcheck.master.sh` - Frontend health monitoring
   - `frontend/docker/inject-env.master.sh` - Environment variable injection
   - `backend/healthcheck.master.sh` - Backend health monitoring
   - `backend/entrypoint.master.sh` - Backend initialization

### Frontend Container

```yaml
# Base Image
FROM node:18-alpine

# Key Installed Dependencies
- Python 3
- Build tools (make, g++, etc.)
- Cairo and other graphics libraries
- Webpack tools

# Exposed Ports
- 3000 (internal)
- 3456 (external)

# Volume Mounts
- ./frontend/src:/app/src
- ./frontend/public:/app/public
- ./frontend/config:/app/config
- ./frontend/package.master.json:/app/package.json
- ./frontend/package-lock.json:/app/package-lock.json
- ./frontend/docker:/app/docker
- ./frontend/.env.master:/app/.env.master
- frontend_node_modules:/app/node_modules

# Health Check
- HTTP check on port 3000/health
- Interval: 15s
- Timeout: 10s
- Retries: 3
- Start period: 30s

# Environment Variables
- Loaded from .env.master file at runtime
- ENV_MASTER_FILE=/app/.env.master
```

### Backend Container

```yaml
# Base Image
FROM python:3.10-slim

# Key Installed Dependencies
- Build essentials
- PostgreSQL client
- Curl for health checks
- SSL development libraries

# Exposed Ports
- 8000 (internal/external)

# Volume Mounts
- ./backend:/app
- backend_data:/app/data

# Health Check
- HTTP check on port 8000/health
- Interval: 10s
- Timeout: 5s
- Retries: 3
- Start period: 15s
```

### Docker Compose Configuration Standards

The Docker Compose file (`docker-compose.master.yml`) follows these standards:

1. **Service Naming**
   - Use descriptive service names with `tap-` prefix
   - Example: `tap-frontend`, `tap-backend`

2. **Container Naming**
   - Use consistent container naming with `-dev` suffix
   - Example: `tap-frontend-dev`, `tap-backend-dev`

3. **Image Tagging**
   - Use clear image tags with purpose indication
   - Example: `tap-frontend:local-dev`

4. **Network Configuration**
   - Use named networks with `tap-` prefix and `-dev` suffix
   - Example: `tap-network-dev`

5. **Volume Configuration**
   - Use named volumes with clear purpose indication
   - Example: `tap-frontend-node-modules-dev`

6. **Environment Variables**
   - Use `SERVICE_*` prefix for standardized variables
   - Group variables by purpose with comments
   - Include legacy variables for backward compatibility

7. **Health Checks**
   - Define comprehensive health checks for all services
   - Include appropriate intervals, timeouts, and retries

### Dockerfile Configuration Standards

Dockerfiles (`frontend/Dockerfile.master` and `backend/Dockerfile.master`) follow these standards:

1. **Base Images**
   - Frontend: `node:18-alpine`
   - Backend: `python:3.10-slim`

2. **Metadata**
   - Include standardized labels for identification and documentation
   - Format: `org.opencontainers.image.*` and `com.tap.*`

3. **Security**
   - Run services as non-root users
   - Set appropriate permissions on files and directories

4. **Dependencies**
   - Frontend: Include Python and build tools for native modules
   - Backend: Include necessary system dependencies

5. **Entrypoints**
   - Use shell scripts for entrypoints to handle initialization logic
   - Include proper error handling and logging

6. **Health Checks**
   - Implement health checks using appropriate commands
   - Set realistic intervals and timeout values

## Environment Variables

### Environment Variable Standards

Environment variables follow a structured pattern:

1. **Naming Convention**
   - Use `SERVICE_*` prefix for all variables
   - Use uppercase with underscores as separators
   - Example: `SERVICE_API_URL`, `SERVICE_DEBUG`

2. **Variable Categories**
   - Service identification: `SERVICE_NAME`, `SERVICE_ENV`, `SERVICE_VERSION`
   - API configuration: `SERVICE_API_URL`, `SERVICE_CORS_ORIGINS`
   - Development settings: `SERVICE_DEV_MODE`, `SERVICE_HOT_RELOAD`
   - Health monitoring: `SERVICE_HEALTH_CHECK_INTERVAL`, `SERVICE_HEALTH_CHECK_PATH`
   - Error handling: `SERVICE_ERROR_REPORTING`, `SERVICE_ERROR_LEVEL`
   - Database configuration: `SERVICE_DATABASE_URL`, `SERVICE_DB_SSL_REQUIRED`
   - Feature flags: `SERVICE_ENABLE_INVITATIONS`, `SERVICE_ENABLE_MFA`

3. **Legacy Compatibility**
   - Include legacy variables for backward compatibility
   - Frontend: `REACT_APP_*`, `NODE_ENV`
   - Backend: `DEBUG`, `LOG_LEVEL`, `ENVIRONMENT`

### Frontend Environment Variables

All frontend environment variables are defined in the `.env.master` file, which serves as the single source of truth for environment configuration.

**Master Environment File Location**: `/frontend/.env.master`

**Environment Loading Process**:
1. The `.env.master` file is mounted into the Docker container
2. `generate-runtime-env.master.sh` reads the variables and creates runtime-env.js
3. `inject-env.master.sh` injects the variables into index.html
4. The application accesses environment through window.runtimeEnv

**Key Environment Variables**:

* **Service Identity**
  - SERVICE_NAME: "frontend" - Container name
  - SERVICE_ENV: "development" - Environment
  - SERVICE_VERSION: "1.0.0" - Version
  - SERVICE_API_URL: "http://tap-backend:8000" - Backend API URL

* **Development Settings**
  - SERVICE_DEV_MODE: "true" - Development mode
  - SERVICE_HOT_RELOAD: "true" - Hot reloading
  - SERVICE_HOT_RELOAD_HOST: "localhost" - Hot reload host
  - SERVICE_HOT_RELOAD_PORT: "3456" - Hot reload port
  - CHOKIDAR_USEPOLLING: "true" - File watching in Docker
  - WDS_SOCKET_HOST: "localhost" - WebSocket host
  - WDS_SOCKET_PORT: "3456" - WebSocket port
  - WEBPACK_DEV_SERVER: "true" - Enable dev server

* **Health & Error Handling**
  - SERVICE_HEALTH_CHECK_INTERVAL: "60000" - Check interval
  - SERVICE_HEALTH_CHECK_PATH: "/health" - Health endpoint
  - SERVICE_ERROR_REPORTING: "true" - Error reporting
  - SERVICE_ERROR_LEVEL: "debug" - Log level
  - SERVICE_MAX_ERRORS: "100" - Max errors stored
  - REACT_APP_ERROR_REPORTING_URL: "/api/errors" - Error API endpoint
  - REACT_APP_ERROR_LOGGING_ENABLED: "true" - Enable error logging
  - REACT_APP_ERROR_LOG_LEVEL: "debug" - Error log level

* **Legacy Variables** (maintained for backward compatibility)
  - NODE_ENV: "development" - Node environment
  - REACT_APP_API_URL: "http://tap-backend:8000" - API URL (legacy)
  - REACT_APP_VERSION: "1.0.0" - App version (legacy)
  - REACT_APP_ENVIRONMENT: "development" - Environment (legacy)

### Backend Environment Variables

* **Service Identity**
  - SERVICE_NAME: "backend" - Container name
  - SERVICE_ENV: "development" - Environment
  - SERVICE_VERSION: "1.0.0" - Version

* **Python Configuration**
  - PYTHONUNBUFFERED: "1" - Unbuffered output
  - PYTHONDONTWRITEBYTECODE: "1" - Don't write bytecode

* **Application Configuration**
  - SERVICE_CORS_ORIGINS: '["http://localhost:3456","http://tap-frontend:3000"]' - CORS origins
  - SERVICE_DATABASE_URL: "sqlite:///data/local_dev.sqlite" - Database URL
  - SERVICE_SECRET_KEY: "local_development_secret_change_in_production" - Secret key
  - SERVICE_LOG_LEVEL: "debug" - Log level
  - SERVICE_DEBUG: "true" - Debug mode

* **Feature Flags**
  - SERVICE_ENABLE_INVITATIONS: "false" - Enable invitations
  - SERVICE_ENABLE_MFA: "false" - Enable MFA

* **Database Configuration**
  - SERVICE_DB_SSL_REQUIRED: "false" - SSL required
  - SERVICE_DB_AUTOMIGRATE: "true" - Auto migration
  - SERVICE_DB_AUTOSEED: "true" - Auto seeding

* **Performance**
  - SERVICE_WORKERS: "1" - Worker count

* **Legacy Variables**
  - DEBUG: "true" - Debug mode (legacy)
  - DEBUG_MODE: "true" - Debug mode (legacy)
  - LOG_LEVEL: "debug" - Log level (legacy)
  - ENVIRONMENT: "development" - Environment (legacy)
  - APP_ENVIRONMENT: "development" - App environment (legacy)
  - DB_SSL_REQUIRED: "false" - DB SSL (legacy)
  - RUNNING_IN_DOCKER: "true" - Docker flag (legacy)

## Standardized Environment Structure

The TAP Integration Platform uses a standardized environment structure with the `.master.*` naming pattern:

### Environment Setup Tools

1. **Backend Environment Setup**:
   ```bash
   ./setup-backend-env.master.sh
   ```
   - Creates standardized Python environment at `backend/venv.master`
   - Installs dependencies from `backend/requirements.master.txt`
   - Provides consistent activation method

2. **Frontend Environment Setup**:
   ```bash
   ./setup-frontend-env.master.sh
   ```
   - Verifies Node.js version against `frontend/.nvmrc.master`
   - Installs dependencies from `frontend/package.master.json`
   - Configures development tools

3. **Combined Environment Setup**:
   ```bash
   ./setup-dev-env.master.sh
   ```
   - Sets up both backend and frontend environments
   - Ensures proper integration between components
   - Prepares for Docker environment

### Master Environment Files

1. **Backend Environment**:
   - `backend/requirements.master.txt` - Python dependencies
   - `backend/venv.master/` - Standardized virtual environment
   - `backend/entrypoint.master.sh` - Docker container initialization

2. **Frontend Environment**:
   - `frontend/.env.master` - Environment variables
   - `frontend/.nvmrc.master` - Node.js version
   - `frontend/package.master.json` - Dependency management
   - `frontend/docker/generate-runtime-env.master.sh` - Runtime configuration
   - `frontend/docker/inject-env.master.sh` - Environment injection

## Component Interoperability

### Frontend-Backend Communication

* **Frontend to Backend**
  - Protocol: HTTP/REST
  - Port: 8000
  - Authentication: JWT token in headers
  - Data Format: JSON

* **Backend to Frontend (Optional)**
  - Protocol: HTTP/SSE
  - Port: 3000
  - Authentication: None
  - Data Format: JSON events

### Authentication Flow

1. Frontend calls `/api/v1/auth/login` with credentials
2. Backend validates and issues JWT token with issue_at timestamp
3. Token stored in HttpOnly cookies with security settings (httpOnly, secure, samesite)
4. Frontend includes cookie in subsequent requests
5. Backend validates token on protected endpoints
6. Token refresh handled via `/api/v1/auth/refresh` endpoint
7. Logout invalidates tokens via `/api/v1/auth/logout` endpoint

#### Authentication Environment Variables

* **Backend Authentication**
  - SERVICE_AUTH_TOKEN_EXPIRY: "86400" - Access token expiry in seconds
  - SERVICE_AUTH_REFRESH_TOKEN_EXPIRY: "604800" - Refresh token expiry in seconds
  - SERVICE_AUTH_COOKIE_DOMAIN: "localhost" - Cookie domain
  - SERVICE_AUTH_COOKIE_PATH: "/" - Cookie path
  - SERVICE_AUTH_COOKIE_SECURE: "false" - Secure cookie (HTTPS only)
  - SERVICE_AUTH_COOKIE_HTTPONLY: "true" - HttpOnly cookie (not accessible via JavaScript)
  - SERVICE_AUTH_COOKIE_SAMESITE: "lax" - SameSite cookie policy

* **Frontend Authentication**
  - SERVICE_AUTH_COOKIES_ENABLED: "true" - Enable cookie-based auth
  - SERVICE_AUTH_COOKIES_SECURE: "false" - Secure cookie setting
  - SERVICE_AUTH_COOKIES_SAMESITE: "lax" - SameSite cookie policy
  - SERVICE_AUTH_COOKIES_HTTP_ONLY: "true" - HttpOnly cookie setting
  - SERVICE_AUTH_URL: "http://tap-backend:8000/api/v1/auth" - Auth API URL

#### Authentication Testing

The authentication flow can be tested using the `test-auth-integration.sh` script which:
1. Verifies container health
2. Tests CORS configuration
3. Tests login endpoint
4. Validates JWT token handling
5. Tests cookie-based authentication
6. Verifies token validation endpoints
7. Tests token refresh functionality
8. Validates logout process

### Data Flow

1. Frontend fetches data via REST API calls
2. Backend processes requests through controller layer
3. Service layer handles business logic
4. Data access layer interacts with database
5. Response returns through service→controller→API layers
6. Frontend processes and displays response data

## Networking Configuration

### Docker Networks

* **tap-network-dev**
  - Type: bridge
  - Purpose: Inter-service communication
  - Connected Services: tap-frontend, tap-backend

### Network Rules

* **tap-frontend**
  - Exposed Ports: 3456:3000
  - Accessible From: Host, tap-backend
  - Protocol: HTTP

* **tap-backend**
  - Exposed Ports: 8000:8000
  - Accessible From: Host, tap-frontend
  - Protocol: HTTP

## Storage Configuration

### Docker Volumes

* **frontend_node_modules**
  - Type: named
  - Purpose: npm dependencies
  - Connected Service: tap-frontend

* **backend_data**
  - Type: named
  - Purpose: Database and files
  - Connected Service: tap-backend

### Volume Mount Standards

Volume mounts follow these standards:

1. **Source Code**
   - Mount source directories directly for live development
   - Example: `./frontend/src:/app/src`

2. **Dependencies**
   - Use named volumes for dependencies to avoid host conflicts
   - Example: `frontend_node_modules:/app/node_modules`

3. **Configuration**
   - Mount configuration files directly
   - Example: `./frontend/config:/app/config`

4. **Persistent Data**
   - Use named volumes for persistent data
   - Example: `backend_data:/app/data`

### Database Configuration

- **Development**: SQLite file-based database
- **Storage Location**: `/app/data/local_dev.sqlite`
- **Connection Pooling**: Enabled with SQLAlchemy
- **Auto Migration**: Enabled in development
- **Auto Seeding**: Enabled in development

## Build Process

### Frontend Build

1. **Development**:
   - `npm ci` for dependency installation
   - Webpack dev server for hot reloading
   - Source mounted directly from host

2. **Production**:
   - `npm ci` for dependency installation
   - `npm run build` for production bundle
   - Static files served through web server

### Backend Build

1. **Development**:
   - `pip install -r requirements.txt` for dependencies
   - Uvicorn with reload for development server
   - Source mounted directly from host

2. **Production**:
   - `pip install -r requirements.txt` for dependencies
   - Uvicorn with multiple workers
   - Optimized for production use

## Startup Sequence

1. Backend container starts first
2. Database initialization and migration runs
3. Backend API becomes available
4. Frontend container starts with depends_on condition
5. Frontend waits for backend health check
6. Frontend connects to backend API
7. System becomes fully operational

## Health Checks

### Frontend Health Check

- **Endpoint**: `/health`
- **Method**: HTTP GET
- **Check Command**: `wget -q --spider http://localhost:3000/health || exit 1`
- **Success Response**: 200 OK
- **Failure Action**: Container restart

### Backend Health Check

- **Endpoint**: `/health`
- **Method**: HTTP GET
- **Check Command**: `curl -f http://localhost:8000/health || exit 1`
- **Success Response**: 200 OK with status information
- **Failure Action**: Container restart

## Validation Process

The following validation sequence ensures system integrity:

1. **Environment Setup**:
   ```bash
   ./setup-dev-env.master.sh
   ./start-dev-env.master.sh
   ```

2. **Container Health**:
   ```bash
   ./check-docker-status.master.sh
   ```

3. **Service Communication**:
   ```bash
   ./test-service-integration.master.sh
   ```

4. **Environment Validation**:
   ```bash
   ./validation.master.sh
   ```

5. **Database Migration Validation**:
   ```bash
   ./validate-db-migrations.master.sh
   ```

## Development Workflow

1. **Start Environment**:
   ```bash
   ./start-dev-env.master.sh
   ```

2. **Frontend Development**:
   - Edit files in `frontend/src/`
   - Changes automatically reflected through hot reload
   - View at `http://localhost:3456`

3. **Backend Development**:
   - Edit files in `backend/`
   - Restart container to apply changes:
     ```bash
     docker restart tap-backend-dev
     ```
   - Access API at `http://localhost:8000`
   - API docs at `http://localhost:8000/docs`

## Docker Script Development Guidelines

When creating new Docker-related scripts, follow these standards:

1. **Naming Conventions**
   - Use the `.master.sh` suffix for all scripts
   - Follow the pattern: `<function>-<purpose>.master.sh`
   - Be descriptive but concise in naming

2. **Script Structure**
   - Include comprehensive header with purpose and usage
   - Add strict error handling with `set -e`
   - Implement custom error handlers
   - Use color-coded output for better readability
   - Add verbose output options
   - Implement cleanup functions for graceful exit

3. **Script Organization**
   - Define reusable functions at the top
   - Group related functionality together
   - Use consistent indentation and formatting
   - Include validation checks for prerequisites
   - Add usage instructions with examples

4. **Environment Validation**
   - Verify Docker is running
   - Check Docker Compose availability
   - Validate required files exist
   - Verify network connectivity

5. **Container Management**
   - Clean up existing containers before starting
   - Remove unused networks to prevent conflicts
   - Set environment variables consistently
   - Monitor container health during startup

## Troubleshooting

### Common Issues and Solutions

* **Frontend Build Failure**
  - Diagnosis: Check container logs for build errors
  - Solution: Ensure Python and build tools are installed

* **Backend Startup Failure**
  - Diagnosis: Check container logs for Python errors
  - Solution: Verify database configuration and migrations

* **API Connection Issues**
  - Diagnosis: Test connectivity with test-service-integration.sh
  - Solution: Check network configuration and CORS settings

* **Database Errors**
  - Diagnosis: Check backend logs for SQLAlchemy errors
  - Solution: Verify connection string and permissions

* **Container Health Failure**
  - Diagnosis: Run check-docker-status.master.sh
  - Solution: Check individual container logs for details

### Diagnostic Commands

* **Container Status**
  - Command: `docker ps -a`
  - Output: List of all containers and their status

* **View Logs**
  - Command: `docker logs tap-frontend-dev`
  - Output: Container logs

* **Inspect Network**
  - Command: `docker network inspect tap-network-dev`
  - Output: Network configuration details

* **Check Volumes**
  - Command: `docker volume ls`
  - Output: List of all volumes

* **Enter Container**
  - Command: `docker exec -it tap-backend-dev bash`
  - Output: Interactive shell in container

## Master Utilities Reference

All platform utilities follow the `.master.*` naming convention for standardization:

* **docker-compose.master.yml**
  - Purpose: Service orchestration
  - Usage: Referenced by start-dev-env.master.sh

* **start-dev-env.master.sh**
  - Purpose: Environment startup
  - Usage: `./start-dev-env.master.sh`

* **check-docker-status.master.sh**
  - Purpose: Status verification
  - Usage: `./check-docker-status.master.sh`

* **validate-docker-env.master.sh**
  - Purpose: Configuration validation
  - Usage: `./validate-docker-env.master.sh [--verbose]`

* **verify-docker-startup.master.sh**
  - Purpose: Startup verification
  - Usage: `./verify-docker-startup.master.sh`

* **test-service-integration.master.sh**
  - Purpose: Service communication
  - Usage: `./test-service-integration.master.sh`

* **validation.master.sh**
  - Purpose: System validation
  - Usage: `./validation.master.sh`

## Best Practices

1. **Always use `.master` versions** of files and scripts to ensure consistency
2. **Start the environment** with `start-dev-env.master.sh`
3. **Validate health** with `check-docker-status.master.sh`
4. **Test communication** with `test-service-integration.master.sh`
5. **Run comprehensive validation** with `validation.master.sh`
6. **Consult documentation** in `DOCKER-README.master.md` for details
7. **Troubleshoot systematically** using the validation tools in sequence
8. **Add new utilities** to the `utilities.md` reference document
9. **Follow naming conventions** for consistency
10. **Test changes thoroughly** before committing

## Documentation Resources

* **DOCKER-README.master.md**
  - Purpose: Docker configuration
  - Location: `/DOCKER-README.master.md`

* **utilities.md**
  - Purpose: Utilities reference
  - Location: `/code-blue/utilities.md`

* **validation-approach.md**
  - Purpose: Validation methodology
  - Location: `/code-blue/validation-approach.md`

* **master.log**
  - Purpose: Project progress
  - Location: `/code-blue/master.log`