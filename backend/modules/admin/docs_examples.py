"""
Admin API Documentation Examples

This module contains example objects for use in API documentation.
These examples help create consistent, realistic examples in the OpenAPI documentation.
"""

from datetime import datetime

# Application examples
APPLICATION_EXAMPLE = {
    "id": 1,
    "name": "ERP System",
    "type": "api",
    "description": "Enterprise Resource Planning System",
    "logo_url": "https://example.com/logos/erp-logo.png",
    "auth_type": "oauth2",
    "connection_parameters": [
        {
            "name": "api_url",
            "description": "Base API URL",
            "required": True,
            "type": "string",
            "sensitive": False
        },
        {
            "name": "client_id",
            "description": "OAuth2 client ID",
            "required": True,
            "type": "string",
            "sensitive": True
        }
    ],
    "documentation_url": "https://docs.example.com/erp-api",
    "support_url": "https://support.example.com/erp-api",
    "status": "active",
    "is_public": False,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-03-20T14:45:00Z",
    "created_by": "user-uuid-12345"
}

APPLICATION_LIST_EXAMPLE = [
    APPLICATION_EXAMPLE,
    {
        "id": 2,
        "name": "HRIS Platform",
        "type": "api",
        "description": "Human Resources Information System",
        "logo_url": "https://example.com/logos/hris-logo.png",
        "auth_type": "api_key",
        "connection_parameters": [
            {
                "name": "api_url",
                "description": "Base API URL",
                "required": True,
                "type": "string",
                "sensitive": False
            },
            {
                "name": "api_key",
                "description": "API Key for authentication",
                "required": True,
                "type": "string",
                "sensitive": True
            }
        ],
        "documentation_url": "https://docs.example.com/hris-api",
        "support_url": "https://support.example.com/hris-api",
        "status": "active",
        "is_public": True,
        "created_at": "2025-02-10T09:15:00Z",
        "updated_at": "2025-03-15T11:20:00Z",
        "created_by": "user-uuid-12345"
    }
]

APPLICATION_CREATE_EXAMPLE = {
    "name": "CRM System",
    "type": "api",
    "description": "Customer Relationship Management System",
    "logo_url": "https://example.com/logos/crm-logo.png",
    "auth_type": "oauth2",
    "connection_parameters": [
        {
            "name": "api_url",
            "description": "Base API URL",
            "required": True,
            "type": "string",
            "sensitive": False
        },
        {
            "name": "client_id",
            "description": "OAuth2 client ID",
            "required": True,
            "type": "string",
            "sensitive": True
        },
        {
            "name": "client_secret",
            "description": "OAuth2 client secret",
            "required": True,
            "type": "string",
            "sensitive": True
        }
    ],
    "status": "draft"
}

APPLICATION_UPDATE_EXAMPLE = {
    "name": "CRM System Pro",
    "description": "Enhanced Customer Relationship Management System",
    "status": "active"
}

# Dataset examples
DATASET_EXAMPLE = {
    "id": 1,
    "name": "Customer Data",
    "description": "Core customer data with personal and contact information",
    "schema": [
        {
            "name": "customer_id",
            "description": "Unique identifier for the customer",
            "type": "string",
            "required": True,
            "is_primary_key": True,
            "example_value": "CUST-12345",
            "validation_pattern": "^CUST-[0-9]{5}$"
        },
        {
            "name": "first_name",
            "description": "Customer's first name",
            "type": "string",
            "required": True
        },
        {
            "name": "last_name",
            "description": "Customer's last name",
            "type": "string",
            "required": True
        },
        {
            "name": "email",
            "description": "Customer's email address",
            "type": "string",
            "required": True,
            "format": "email"
        },
        {
            "name": "date_of_birth",
            "description": "Customer's date of birth",
            "type": "date",
            "required": False
        }
    ],
    "status": "active",
    "discovery_method": "manual",
    "source_application_id": 1,
    "created_at": "2025-01-20T14:30:00Z",
    "updated_at": "2025-03-10T09:45:00Z",
    "created_by": "user-uuid-12345"
}

DATASET_LIST_EXAMPLE = [
    DATASET_EXAMPLE,
    {
        "id": 2,
        "name": "Order Data",
        "description": "Customer order history and details",
        "schema": [
            {
                "name": "order_id",
                "description": "Unique identifier for the order",
                "type": "string",
                "required": True,
                "is_primary_key": True,
                "example_value": "ORD-98765",
                "validation_pattern": "^ORD-[0-9]{5}$"
            },
            {
                "name": "customer_id",
                "description": "Reference to the customer",
                "type": "string",
                "required": True,
                "validation_pattern": "^CUST-[0-9]{5}$"
            },
            {
                "name": "order_date",
                "description": "Date the order was placed",
                "type": "datetime",
                "required": True
            },
            {
                "name": "total_amount",
                "description": "Total order amount",
                "type": "number",
                "required": True
            }
        ],
        "status": "active",
        "discovery_method": "api",
        "source_application_id": 1,
        "created_at": "2025-02-05T11:20:00Z",
        "updated_at": "2025-03-15T13:40:00Z",
        "created_by": "user-uuid-12345"
    }
]

# Tenant examples
TENANT_EXAMPLE = {
    "id": 1,
    "name": "Acme Corporation",
    "subdomain": "acme",
    "status": "active",
    "tier": "enterprise",
    "settings": {
        "max_integrations": 100,
        "max_users": 50,
        "features": {
            "advanced_transformations": True,
            "custom_connectors": True,
            "premium_support": True
        },
        "branding": {
            "logo_url": "https://acme.example.com/logo.png",
            "primary_color": "#336699"
        }
    },
    "contact_info": {
        "admin_email": "admin@acme.example.com",
        "support_email": "support@acme.example.com",
        "phone": "+1-555-123-4567"
    },
    "created_at": "2025-01-10T09:00:00Z",
    "updated_at": "2025-03-15T14:30:00Z"
}

TENANT_LIST_EXAMPLE = [
    TENANT_EXAMPLE,
    {
        "id": 2,
        "name": "Beta Innovations",
        "subdomain": "beta",
        "status": "active",
        "tier": "professional",
        "settings": {
            "max_integrations": 25,
            "max_users": 20,
            "features": {
                "advanced_transformations": True,
                "custom_connectors": False,
                "premium_support": False
            },
            "branding": {
                "logo_url": "https://beta.example.com/logo.png",
                "primary_color": "#993366"
            }
        },
        "contact_info": {
            "admin_email": "admin@beta.example.com",
            "support_email": "support@beta.example.com",
            "phone": "+1-555-987-6543"
        },
        "created_at": "2025-02-15T10:30:00Z",
        "updated_at": "2025-03-20T11:15:00Z"
    }
]

# Error examples
ERROR_EXAMPLES = {
    "not_found": {
        "detail": "Resource not found"
    },
    "validation_error": {
        "detail": [
            {
                "loc": ["body", "name"],
                "msg": "field required",
                "type": "value_error.missing"
            }
        ]
    },
    "forbidden": {
        "detail": "Not enough permissions to access this resource"
    },
    "unauthorized": {
        "detail": "Not authenticated"
    },
    "conflict": {
        "detail": "Resource already exists with the provided name"
    }
}

# Success messages
SUCCESS_MESSAGES = {
    "created": {
        "message": "Resource created successfully",
        "id": 42
    },
    "updated": {
        "message": "Resource updated successfully"
    },
    "deleted": {
        "message": "Resource deleted successfully"
    }
}