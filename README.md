# TAP Integration Platform

## Overview

TAP Integration Platform is a comprehensive solution for building, managing, and monitoring data integrations. The platform features a visual flow builder, robust data transformation capabilities, and enterprise-grade security.

## Project Structure

The project is organized into two main components:

### Frontend

The frontend is a React application with a custom design system that provides the user interface for the platform. Key features include:

- Visual integration flow builder
- Data preview and transformation tools
- Admin dashboard for monitoring and management
- User management and security controls

### Backend

The backend is a Python FastAPI application that provides the API services for the platform. Key features include:

- RESTful API for integration management
- Authentication and authorization
- Data transformation engine
- Scheduling and execution services

## Development Setup

### Prerequisites

- Node.js 16+
- Python 3.10+
- Docker and Docker Compose
- Git

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start development server:

   ```bash
   python main.py
   ```

### Docker Setup

For a complete development environment:

```bash
docker-compose -f docker-compose.development.yml up
```

## Testing

### Frontend Testing

```bash
cd frontend

# Run all tests
npm run test:all

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Backend Testing

```bash
cd backend

# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=.
```

## Build

### Frontend Build

```bash
cd frontend

# Production build
npm run build:production

# Development build
npm run build:development

# Quick build for development
npm run build:quick
```

### Backend Build

```bash
cd backend

# Build Docker image
docker build -t tap-backend .
```

## Documentation

Comprehensive documentation is available in the docs directory:

- [Frontend Coding Standards](Documentation/FrontendCodingStandards.md)
- [Backend Coding Standards](Documentation/BackendCodingStandards.md)
- [Testing Best Practices](Documentation/TestingBestPractices.md)
- [Security Best Practices](Documentation/SecurityBestPractices.md)
- [Comprehensive Development Guide](Documentation/ComprehensiveDevelopmentGuide.md)

## Current Project Status

### High Priority: Design System Completion

We are currently focusing on completing the design system migration:

1. **Renaming Components**: Changing misleadingly named "legacy" components to "adapted" components
2. **Architecture Cleanup**: Standardizing directory structure and API patterns
3. **Performance Optimization**: Enhancing component performance and implementing virtualization
4. **API Standardization**: Creating consistent APIs across all components
5. **Documentation**: Creating comprehensive component documentation

For detailed information, see:
- [Design System Migration Phase](project/final_npm_test/design_system_migration_phase.md)
- [Design System Technical Specification](project/final_npm_test/design_system_technical_spec.md)
- [Design System Implementation Guide](project/final_npm_test/design_system_implementation_guide.md)

## Contributing

See the [Comprehensive Development Guide](Documentation/ComprehensiveDevelopmentGuide.md) for contribution guidelines and workflow information.

## License

[MIT License](LICENSE)