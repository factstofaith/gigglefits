# TAP Integration Platform

A comprehensive middleware UI that enables users to build integrations between various applications, connecting APIs and file storage locations through an intuitive interface.

## Features

- **Integration Builder**: Visual canvas for building API and file-based integrations
- **Source/Destination Selection**: Select API types for both source and destination
- **Field Mapping**: Map fields between different systems with transformations
- **Multi-tenant Environment**: Support for enterprise users with proper authentication
- **Authentication**: Login with username/password, Office 365, or Gmail credentials
- **Role-based Access**: Super admin and regular user roles with different permissions

## Getting Started

### Using Docker Compose (Recommended)

1. Clone the repository
2. Run `docker-compose up`
3. Navigate to http://localhost:3000 in your browser

### Manual Setup

#### Frontend

1. Navigate to the `frontend` directory
2. Run `npm install`
3. Run `npm start`
4. Navigate to http://localhost:3000 in your browser

#### Backend

1. Navigate to the `backend` directory
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn main:app --reload`
6. API will be available at http://localhost:8000

## Project Structure

### Frontend

The frontend is organized into a clean, modular structure:

```
frontend/
├── public/               # Static assets
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/           # Images and other assets
│   │   └── logo.png
│   ├── components/       # React components
│   │   ├── common/       # Shared UI components
│   │   └── integration/  # Integration-specific components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main App component
│   └── index.js          # Entry point
└── package.json          # Dependencies
```

### Backend

The backend follows a modular FastAPI structure:

```
backend/
├── adapters/             # External service adapters
├── core/                 # Core functionality
├── db/                   # Database models and migrations
├── modules/              # Feature modules
│   └── integrations/
├── utils/                # Utility functions
└── main.py               # Entry point
```

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Authentication

The platform supports three authentication methods:

1. **Username/Password**: Traditional login
2. **Office 365**: For enterprise Microsoft environments
3. **Gmail**: For Google Workspace environments

## Frontend-Backend Integration

The frontend and backend are integrated in the following ways:

1. **API Service Layer**: The frontend uses axios-based service modules (`integrationService.js`, `authService.js`) to communicate with the backend API endpoints.

2. **Adapter Factory Pattern**: The backend uses a factory pattern to dynamically create adapters for different integration types. This allows the UI to discover and use new adapters without code changes.

3. **Field Discovery**: Integration sources and destinations can dynamically expose their field structures through the `/integrations/{id}/discover-fields` endpoint, which is used by the FieldMappingEditor component.

4. **Authentication Flow**: JWT-based authentication with automatic token handling and refresh is implemented in the API client.

5. **Error Handling**: Consistent error handling ensures that authentication failures, network issues, and server errors are properly displayed to the user.

The integration between frontend and backend uses RESTful APIs with the following endpoints:

- `/api/integrations` - CRUD operations for integrations
- `/api/integrations/{id}/mappings` - Field mapping operations
- `/api/integrations/{id}/discover-fields` - Dynamic field discovery
- `/api/integrations/{id}/run` - Execute an integration
- `/api/integrations/{id}/history` - Get execution history
- `/api/sources` and `/api/destinations` - Get available sources/destinations

## License

[MIT License](LICENSE)