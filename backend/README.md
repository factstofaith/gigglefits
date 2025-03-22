# TAP Integration Platform Backend

The backend API for the TAP Integration Platform, built with FastAPI.

## Project Structure

```
backend/
├── adapters/             # External service adapters
│   ├── __init__.py
│   └── api_adapter.py   
├── core/                 # Core functionality
│   ├── __init__.py
│   └── config.py
├── db/                   # Database models and migration utilities
│   ├── __init__.py
│   ├── base.py
│   └── migrations/       # Database migration scripts
│       └── README.md
├── modules/              # API modules
│   └── integrations/     # Integration management module
│       ├── __init__.py
│       ├── controller.py # API routes
│       ├── models.py     # Data models
│       └── service.py    # Business logic
├── utils/                # Utility functions
│   ├── __init__.py
│   └── helpers.py
├── Dockerfile            # Docker configuration
├── main.py               # Application entry point
├── README.md             # This file
└── requirements.txt      # Python dependencies
```

## Setup and Running

### Prerequisites

- Python 3.10+
- pip

### Local Development Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

5. The API will be available at http://localhost:8000

### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t tap-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 tap-backend
   ```

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Authentication

The API uses JWT token-based authentication. To authenticate:

1. Obtain an access token from the `/token` endpoint
2. Include the token in the Authorization header for protected endpoints:
   ```
   Authorization: Bearer <token>
   ```

## Development Guidelines

1. **Modular Structure**: Keep the codebase modular by organizing related functionality into modules
2. **Type Hints**: Use type hints for better code readability and IDE support
3. **Documentation**: Document your code using docstrings and keep the API documentation up to date
4. **Testing**: Write tests for your code to ensure it works as expected