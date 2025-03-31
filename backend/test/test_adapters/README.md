# Test Adapters

This directory contains test adapter modules for mocking REST API endpoints needed for tests.

These adapters help create consistent test environments for various components of the system.

## Available Adapters:

1. **auth_adapter.py** - Provides authentication endpoints for testing
2. **user_adapter.py** - Provides user management endpoints for testing

## Usage:

These adapters can be imported and used in test files to create mock endpoints that match
the expected API interfaces without having to create real backend implementations.

```python
# Import adapters
from test_adapters.auth_adapter import auth_router
from test_adapters.user_adapter import user_router

# Include them in your FastAPI app
app.include_router(auth_router)
app.include_router(user_router)
```