# API Documentation with OpenAPI

This document outlines the implementation of comprehensive API documentation using OpenAPI specifications for the TAP Integration Platform.

## Architecture Overview

The OpenAPI documentation system is designed to provide comprehensive, up-to-date API documentation that integrates with the platform's code:

```
┌───────────────────────────────────────────────────────────┐
│                 OpenAPI Documentation System               │
├───────────────────────────────────────────────────────────┤
│                  Documentation Manager                     │
├─────────────┬──────────────┬───────────────┬──────────────┤
│ Schema      │ Path         │ Security      │ Example      │
│ Registry    │ Documentation│ Specifications│ Generator    │
└─────────────┴──────────────┴───────────────┴──────────────┘
         ▲              ▲              ▲             ▲
         │              │              │             │
┌────────┴──────────────┴──────────────┴─────────────┴─────┐
│                   API Implementation                      │
├─────────────┬──────────────┬───────────────┬─────────────┤
│ Controller  │ Input        │ Response      │ Security    │
│ Routes      │ Validation   │ Models        │ Middleware  │
└─────────────┴──────────────┴───────────────┴─────────────┘
```

## Core Principles

The OpenAPI documentation implementation follows these principles:

1. **Code-First Approach**: Documentation generated from code annotations
2. **Single Source of Truth**: API models serve as both validation and documentation
3. **Complete Coverage**: All endpoints, parameters, and responses documented
4. **Interactive Documentation**: Live API testing through Swagger UI
5. **Version Control**: Documentation versioned alongside code
6. **Machine and Human Readability**: Both developer and machine-friendly

## Implementation Approach

### 1. FastAPI Integration

Leveraging FastAPI's built-in OpenAPI support with enhanced customization:

```python
from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.models import (
    OpenAPI, Info, License, Contact, Tag, ExternalDocumentation,
    Server, Components, SecurityScheme, SecuritySchemeType
)

app = FastAPI(
    title="TAP Integration Platform API",
    description="Backend API for the TAP Integration Platform",
    version="1.0.0",
    docs_url=None,  # Disable default docs to use custom OpenAPI schema
    redoc_url=None  # Disable ReDoc to use custom documentation
)

def custom_openapi():
    """Generate custom OpenAPI schema with enhanced documentation"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="TAP Integration Platform API",
        version="1.0.0",
        description="""
        # TAP Integration Platform API Documentation
        
        This API provides comprehensive integration capabilities for managing 
        applications, datasets, and data transformations.
        
        ## Authentication
        
        All API requests require authentication using one of the following methods:
        
        - **OAuth2**: For user authentication
        - **API Key**: For service-to-service communication
        
        ## Rate Limiting
        
        API requests are subject to rate limiting based on tenant configuration.
        
        ## Environments
        
        - Production: https://api.tap-platform.com/v1
        - Staging: https://api-staging.tap-platform.com/v1
        - Development: https://api-dev.tap-platform.com/v1
        """,
        routes=app.routes,
    )
    
    # Add custom branding and info
    openapi_schema["info"]["license"] = {
        "name": "Proprietary",
        "url": "https://tap-platform.com/terms"
    }
    
    openapi_schema["info"]["contact"] = {
        "name": "TAP Integration Platform Support",
        "url": "https://tap-platform.com/support",
        "email": "support@tap-platform.com"
    }
    
    # Add server information
    openapi_schema["servers"] = [
        {
            "url": "https://api.tap-platform.com/v1",
            "description": "Production environment"
        },
        {
            "url": "https://api-staging.tap-platform.com/v1",
            "description": "Staging environment"
        },
        {
            "url": "https://api-dev.tap-platform.com/v1",
            "description": "Development environment"
        }
    ]
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2Auth": {
            "type": "oauth2",
            "flows": {
                "authorizationCode": {
                    "authorizationUrl": "https://auth.tap-platform.com/oauth/authorize",
                    "tokenUrl": "https://auth.tap-platform.com/oauth/token",
                    "scopes": {
                        "read": "Read access",
                        "write": "Write access",
                        "admin": "Admin access"
                    }
                }
            }
        },
        "APIKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key"
        }
    }
    
    # Add global security requirement
    openapi_schema["security"] = [
        {"OAuth2Auth": ["read", "write"]},
        {"APIKeyAuth": []}
    ]
    
    # Add response examples to all paths
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            if "responses" in operation:
                for response in operation["responses"].values():
                    if "content" in response and "application/json" in response["content"]:
                        schema_ref = response["content"]["application/json"].get("schema", {}).get("$ref")
                        if schema_ref:
                            # Generate example from schema reference
                            # This would be more complex in a real implementation
                            pass
    
    # Add tags with additional metadata
    openapi_schema["tags"] = [
        {
            "name": "Admin",
            "description": "Administrative endpoints",
            "externalDocs": {
                "description": "Admin documentation",
                "url": "https://docs.tap-platform.com/admin"
            }
        },
        {
            "name": "Applications",
            "description": "Application management endpoints",
            "externalDocs": {
                "description": "Application documentation",
                "url": "https://docs.tap-platform.com/applications"
            }
        },
        {
            "name": "Integrations",
            "description": "Integration management endpoints",
            "externalDocs": {
                "description": "Integration documentation",
                "url": "https://docs.tap-platform.com/integrations"
            }
        },
        {
            "name": "Nodes",
            "description": "Node management endpoints",
            "externalDocs": {
                "description": "Node documentation",
                "url": "https://docs.tap-platform.com/nodes"
            }
        }
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

# Replace default OpenAPI schema with custom version
app.openapi = custom_openapi

@app.get("/api/docs", include_in_schema=False)
async def get_documentation():
    """Serve custom Swagger UI documentation"""
    return get_swagger_ui_html(
        openapi_url="/api/openapi.json",
        title="TAP Integration Platform API Documentation",
        swagger_ui_parameters={
            "docExpansion": "none",
            "defaultModelsExpandDepth": 0,
            "persistAuthorization": True,
            "displayRequestDuration": True,
            "syntaxHighlight": {
                "activate": True,
                "theme": "agate"
            }
        }
    )

@app.get("/api/openapi.json", include_in_schema=False)
async def get_openapi_schema():
    """Serve OpenAPI schema"""
    return app.openapi()
```

### 2. Pydantic Model Documentation

Enhancing Pydantic models with comprehensive documentation:

```python
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator

class NodeCategory(str, Enum):
    """Top-level node categories"""
    SOURCE = "source"
    TRANSFORM = "transform"
    PROCESSING = "processing"
    DESTINATION = "destination"

class NodeType(BaseModel):
    """
    Definition of a node type in the integration platform.
    
    Node types represent the building blocks that can be used
    to create integration flows, including sources, transformations,
    processing steps, and destinations.
    """
    id: str = Field(
        ..., 
        description="Unique identifier for the node type",
        example="node_f83c724a-8b34-4f35-b531-58434fa6a569",
        json_schema_extra={
            "format": "uuid",
            "pattern": "^node_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"
        }
    )
    type_id: str = Field(
        ..., 
        description="Unique identifier for the node type",
        example="http_api_source",
        json_schema_extra={
            "min_length": 3,
            "max_length": 64,
            "pattern": "^[a-z][a-z0-9_]*$"
        }
    )
    display_name: str = Field(
        ..., 
        description="Human-readable name for UI display",
        example="HTTP API Source",
        json_schema_extra={
            "min_length": 1,
            "max_length": 100
        }
    )
    description: str = Field(
        ..., 
        description="Detailed description of the node type",
        example="Fetches data from a HTTP/HTTPS API endpoint",
        json_schema_extra={
            "min_length": 10,
            "max_length": 500
        }
    )
    category: NodeCategory = Field(
        ..., 
        description="Top-level category of the node",
        example=NodeCategory.SOURCE
    )
    created_at: datetime = Field(
        ..., 
        description="When this node type was registered",
        example="2025-03-15T10:30:00Z"
    )
    
    class Config:
        """Pydantic config with JSON schema customization"""
        json_schema_extra = {
            "examples": [
                {
                    "id": "node_f83c724a-8b34-4f35-b531-58434fa6a569",
                    "type_id": "http_api_source",
                    "display_name": "HTTP API Source",
                    "description": "Fetches data from a HTTP/HTTPS API endpoint",
                    "category": "source",
                    "created_at": "2025-03-15T10:30:00Z"
                }
            ]
        }
```

### 3. Route Documentation

Detailed endpoint documentation with FastAPI:

```python
@app.get(
    "/api/admin/nodes/registry",
    response_model=List[NodeType],
    summary="Get Node Types",
    description="""
    Retrieves all registered node types with filtering options.
    
    Use query parameters to filter the results by category, search terms, or other criteria.
    Results are paginated for performance.
    """,
    response_description="List of node types matching the filter criteria",
    tags=["Nodes"],
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "List of node types",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": "node_f83c724a-8b34-4f35-b531-58434fa6a569",
                            "type_id": "http_api_source",
                            "display_name": "HTTP API Source",
                            "description": "Fetches data from a HTTP/HTTPS API endpoint",
                            "category": "source",
                            "created_at": "2025-03-15T10:30:00Z"
                        }
                    ]
                }
            }
        },
        400: {
            "description": "Bad request parameters",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid filter parameters"
                    }
                }
            }
        },
        401: {
            "description": "Authentication error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Not authenticated"
                    }
                }
            }
        },
        403: {
            "description": "Permission error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Not authorized to access node registry"
                    }
                }
            }
        }
    }
)
async def get_node_types(
    category: Optional[NodeCategory] = Query(
        None,
        description="Filter by node category",
        example=NodeCategory.SOURCE
    ),
    search: Optional[str] = Query(
        None,
        description="Search text in name and description",
        min_length=3,
        example="api"
    ),
    page: int = Query(
        1,
        description="Page number for pagination",
        ge=1,
        example=1
    ),
    page_size: int = Query(
        20,
        description="Number of items per page",
        ge=1,
        le=100,
        example=20
    ),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves all registered node types with filtering options.
    
    This endpoint returns a paginated list of node types that can be used
    in integration flows. The results can be filtered by category, search
    terms, and other criteria.
    
    The endpoint requires authentication and appropriate permissions to access.
    """
    # Implementation would go here
    pass
```

### 4. Security Documentation

Comprehensive security documentation:

```python
from fastapi.security import OAuth2AuthorizationCodeBearer, APIKeyHeader

# Define security schemes
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://auth.tap-platform.com/oauth/authorize",
    tokenUrl="https://auth.tap-platform.com/oauth/token",
    scopes={
        "read": "Read access to the API",
        "write": "Write access to the API",
        "admin": "Administrative access to the API"
    },
    description="""
    OAuth2 authentication for user access.
    
    Use the authorization code flow to authenticate users and obtain an access token.
    This is the preferred authentication method for user-facing applications.
    """
)

api_key_scheme = APIKeyHeader(
    name="X-API-Key",
    description="""
    API Key authentication for service-to-service communication.
    
    Include the API key in the X-API-Key header for each request.
    This is recommended for automated processes and backend services.
    """
)

# Security dependency with documentation
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    api_key: Optional[str] = Security(api_key_scheme)
) -> User:
    """
    Authenticates the current user using either OAuth2 or API Key.
    
    This dependency provides the current authenticated user for API endpoints.
    It supports both OAuth2 token-based authentication and API Key authentication.
    
    Raises:
        HTTPException(401): If authentication fails
        HTTPException(403): If the user does not have sufficient permissions
        
    Returns:
        User: The authenticated user object
    """
    if token:
        # Validate OAuth2 token
        pass
    elif api_key:
        # Validate API key
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
```

### 5. Parameter Documentation

Detailed documentation for request parameters:

```python
from fastapi import Path, Query, Body, Header

@app.get(
    "/api/admin/applications/{application_id}/versions/{version}",
    response_model=ApplicationVersion,
    tags=["Applications"]
)
async def get_application_version(
    application_id: int = Path(
        ...,
        description="Unique identifier of the application",
        example=42,
        gt=0
    ),
    version: str = Path(
        ...,
        description="Semantic version string (e.g., 1.0.0)",
        example="1.0.0",
        regex=r"^\d+\.\d+\.\d+$"
    ),
    include_changelog: bool = Query(
        False,
        description="Whether to include the version changelog",
        example=True
    ),
    include_dependencies: bool = Query(
        False,
        description="Whether to include dependency information",
        example=True
    ),
    x_tenant_id: str = Header(
        ...,
        description="ID of the tenant making the request",
        example="tenant-123456"
    ),
    current_user: User = Depends(get_current_user)
):
    """Get a specific version of an application"""
    # Implementation would go here
    pass
```

### 6. Response Documentation

Detailed documentation for API responses:

```python
from fastapi import status
from fastapi.responses import JSONResponse, Response

@app.post(
    "/api/admin/applications/{application_id}/publish",
    response_model=ApplicationPublishResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Application successfully published",
            "content": {
                "application/json": {
                    "example": {
                        "id": 42,
                        "name": "ERP Integration API",
                        "status": "active",
                        "version": "1.0.0",
                        "published_at": "2025-03-30T14:45:00Z",
                        "published_by": "user-uuid-12345",
                        "validation_results": [
                            {
                                "check": "required_fields",
                                "status": "passed",
                                "message": "All required fields are present"
                            }
                        ]
                    }
                }
            }
        },
        400: {
            "description": "Validation failed",
            "content": {
                "application/json": {
                    "example": {
                        "status": "validation_failed",
                        "message": "Application cannot be published due to validation errors",
                        "validation_results": [
                            {
                                "check": "required_fields",
                                "status": "failed",
                                "message": "Missing required connection parameters: api_key"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Application not found",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Application with ID 42 not found"
                    }
                }
            }
        }
    },
    tags=["Applications"]
)
async def publish_application(
    application_id: int,
    publish_request: ApplicationPublishRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Publishes an application, making it available to end users.
    
    This endpoint changes the application status from DRAFT to ACTIVE
    and validates that all required configuration is complete.
    
    Applications must pass validation before they can be published.
    """
    # Implementation would go here
    pass
```

## API Documentation Structure

The OpenAPI documentation follows this hierarchical structure:

### Top-Level Sections

1. **Admin API**
   - Application Management
   - User Management
   - Tenant Management
   - System Configuration

2. **Integration API**
   - Integration Management
   - Flow Execution
   - Node Configuration
   - Data Transformation

3. **Data API**
   - Dataset Management
   - Schema Management
   - Data Validation
   - Data Preview

4. **Monitoring API**
   - Health Metrics
   - Execution Logs
   - Performance Analytics
   - Audit Trails

### Documentation Elements

Each endpoint includes:

1. **Basic Information**
   - HTTP method
   - URL path
   - Summary
   - Detailed description
   - Tags for categorization

2. **Request Details**
   - Path parameters
   - Query parameters
   - Request body schema
   - Header parameters
   - Security requirements

3. **Response Details**
   - Success response schema
   - Error response schemas
   - Examples for each response
   - Response headers
   - Status codes

4. **Usage Examples**
   - cURL examples
   - Request/response samples
   - Code snippets in multiple languages
   - Use case scenarios

## Documentation Portal Integration

The OpenAPI documentation is integrated with a documentation portal for enhanced usability:

### Interactive Documentation

```html
<!DOCTYPE html>
<html>
<head>
  <title>TAP Integration Platform API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
  <link rel="stylesheet" type="text/css" href="/styles/custom-swagger.css" />
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/api/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        syntaxHighlight: {
          activated: true,
          theme: "agate"
        },
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "none",
        defaultModelsExpandDepth: 0,
        filter: true,
        tryItOutEnabled: true,
        requestInterceptor: (request) => {
          // Add custom headers or modify requests
          request.headers['X-Documentation-Request'] = 'true';
          return request;
        },
        responseInterceptor: (response) => {
          // Process responses before displaying
          console.log("Response received", response);
          return response;
        }
      });
      
      // Add custom branding elements
      ui.initOAuth({
        clientId: "documentation-client",
        appName: "API Documentation Portal",
        scopeSeparator: " ",
        scopes: "read write admin",
        additionalQueryStringParams: {}
      });
      
      window.ui = ui;
    }
  </script>
</body>
</html>
```

### Custom CSS for Documentation Portal

```css
/* Custom styling for Swagger UI */
:root {
  --primary-color: #1976d2;
  --secondary-color: #424242;
  --success-color: #4caf50;
  --error-color: #f44336;
  --warning-color: #ff9800;
  --info-color: #2196f3;
}

.swagger-ui .topbar {
  background-color: var(--primary-color);
  padding: 10px 0;
}

.swagger-ui .topbar .download-url-wrapper .select-label {
  color: white;
}

.swagger-ui .info {
  margin: 30px 0;
}

.swagger-ui .info h2.title {
  font-size: 36px;
  color: var(--secondary-color);
}

.swagger-ui .info .description {
  font-size: 16px;
  line-height: 1.6;
}

.swagger-ui .opblock.opblock-get {
  border-color: var(--info-color);
}

.swagger-ui .opblock.opblock-post {
  border-color: var(--success-color);
}

.swagger-ui .opblock.opblock-put {
  border-color: var(--warning-color);
}

.swagger-ui .opblock.opblock-delete {
  border-color: var(--error-color);
}

.swagger-ui .opblock .opblock-summary-method {
  font-weight: bold;
}

.swagger-ui .parameters-container {
  padding: 15px;
}

.swagger-ui table tbody tr td {
  padding: 10px 0;
}

.swagger-ui .btn.execute {
  background-color: var(--success-color);
}

.swagger-ui .scheme-container {
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 0 0 20px;
  padding: 15px;
}

/* Custom badges for response codes */
.swagger-ui .responses-table .response-col_status {
  font-weight: bold;
}

.swagger-ui .response-col_status[data-code^="2"] {
  color: var(--success-color);
}

.swagger-ui .response-col_status[data-code^="4"],
.swagger-ui .response-col_status[data-code^="5"] {
  color: var(--error-color);
}

/* Custom sections for API documentation */
.api-section {
  border-left: 4px solid var(--primary-color);
  margin: 20px 0;
  padding-left: 15px;
}

.api-section h3 {
  color: var(--primary-color);
  font-size: 20px;
  margin-top: 0;
}

.api-section p {
  margin-bottom: 15px;
}

.api-info-box {
  background-color: #e3f2fd;
  border-radius: 4px;
  padding: 15px;
  margin: 15px 0;
}

.api-warning-box {
  background-color: #fff3e0;
  border-radius: 4px;
  padding: 15px;
  margin: 15px 0;
}
```

## Benefits of This Approach

1. **Developer Experience**
   - Interactive API testing directly from documentation
   - Clear examples for each endpoint
   - Comprehensive request and response details
   - Language-specific code samples

2. **Maintainability**
   - Single source of truth for API contracts
   - Documentation automatically stays in sync with code
   - Version-controlled alongside application code
   - Schema validation and documentation unified

3. **Standards Compliance**
   - OpenAPI 3.0/3.1 specification compatible
   - Machine-readable API definitions
   - Support for tooling ecosystem
   - Industry standard approach

4. **Comprehensive Coverage**
   - All endpoints documented
   - Error scenarios explicitly defined
   - Security requirements clearly specified
   - Examples for all data structures

5. **Client Generation**
   - Automatic SDK generation capability
   - Type-safe client libraries
   - Consistent client behavior
   - Reduced integration errors

This OpenAPI documentation approach ensures that the TAP Integration Platform has comprehensive, accurate, and user-friendly API documentation that evolves alongside the application code, making it easy for developers to understand and use the API effectively.