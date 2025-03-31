# Multi-Tenant Support with Isolation Guarantees

This document outlines the design for implementing robust multi-tenant support with strong isolation guarantees for the TAP Integration Platform.

## Design Principles

1. **Complete Tenant Isolation**
   - Each tenant's data and workflows must be completely isolated from other tenants
   - No possibility of cross-tenant data leakage
   - Strong security boundaries between tenants

2. **Resource Partitioning**
   - Clear separation of resources (applications, datasets, integrations)
   - Independent resource allocation and usage tracking
   - Configurable resource limits per tenant

3. **Permission Boundaries**
   - Tenant-specific roles and permissions
   - Cross-tenant access requires explicit grants
   - Hierarchical access control

4. **Performance Isolation**
   - Tenant-specific rate limiting
   - Fair resource allocation
   - Protection from "noisy neighbor" problems

5. **Audit Traceability**
   - All tenant-specific actions are logged and attributable
   - Complete audit trail for cross-tenant operations
   - Tenant-level compliance reporting

## Architecture

### Tenant Isolation Model

We'll implement a full isolation model where tenant data is logically separated at all levels:

```
┌─────────────────────────────────────────────────────────┐
│                      API Gateway                         │
├─────────────────────────────────────────────────────────┤
│                  Tenant Authentication                   │
├─────────────────────────────────────────────────────────┤
│                    Tenant Context                        │
├─────────┬──────────────┬──────────────┬─────────────────┤
│ Tenant A │   Tenant B   │   Tenant C   │    Tenant D     │
│         │              │              │                 │
│ ┌─────┐ │  ┌─────┐     │  ┌─────┐     │  ┌─────┐        │
│ │App A│ │  │App B│     │  │App C│     │  │App D│        │
│ └─────┘ │  └─────┘     │  └─────┘     │  └─────┘        │
│         │              │              │                 │
│ ┌─────┐ │  ┌─────┐     │  ┌─────┐     │  ┌─────┐        │
│ │Data │ │  │Data │     │  │Data │     │  │Data │        │
│ └─────┘ │  └─────┘     │  └─────┘     │  └─────┘        │
│         │              │              │                 │
│ ┌─────┐ │  ┌─────┐     │  ┌─────┐     │  ┌─────┐        │
│ │Integ│ │  │Integ│     │  │Integ│     │  │Integ│        │
│ └─────┘ │  └─────┘     │  └─────┘     │  └─────┘        │
└─────────┴──────────────┴──────────────┴─────────────────┘
```

### Implementation Approach

1. **Database-Level Isolation**
   - Tenant ID as a required field in all tables
   - Database-enforced constraints that prevent cross-tenant access
   - Row-level security policies for all tables

2. **Service-Level Isolation**
   - Tenant context enforced in all service methods
   - Mandatory tenant scope for all queries
   - Request validation that ensures tenant boundary enforcement

3. **API-Level Isolation**
   - Tenant context extraction and validation for all API endpoints
   - Tenant-specific rate limiting and quotas
   - Clear error messages for isolation violations without data leakage

## New Models and API Endpoints

### Tenant Management

#### TenantConfiguration
```python
class TenantResourceLimits(BaseModel):
    """Resource limits for a tenant"""
    max_applications: int = Field(
        10, 
        description="Maximum number of applications the tenant can create",
        ge=1,
        example=20
    )
    max_integrations: int = Field(
        50, 
        description="Maximum number of integrations the tenant can create",
        ge=1,
        example=100
    )
    max_datasets: int = Field(
        30, 
        description="Maximum number of datasets the tenant can create",
        ge=1,
        example=50
    )
    max_concurrent_runs: int = Field(
        5, 
        description="Maximum number of concurrent integration runs",
        ge=1,
        example=10
    )
    storage_limit_mb: int = Field(
        1024, 
        description="Storage limit in megabytes",
        ge=1,
        example=5120
    )
    api_rate_limit: int = Field(
        100, 
        description="API requests per minute",
        ge=1,
        example=200
    )

class TenantIsolationLevel(str, Enum):
    """Isolation level for tenant data and operations"""
    STANDARD = "standard"     # Logical separation with shared resources
    HIGH = "high"             # Enhanced isolation with resource allocation
    COMPLETE = "complete"     # Full isolation with dedicated resources

class TenantConfiguration(BaseModel):
    """Configuration for tenant isolation and resource allocation"""
    tenant_id: str = Field(
        ..., 
        description="ID of the tenant",
        example="tenant-123456"
    )
    isolation_level: TenantIsolationLevel = Field(
        TenantIsolationLevel.STANDARD, 
        description="Level of isolation for tenant data and operations",
        example=TenantIsolationLevel.HIGH
    )
    resource_limits: TenantResourceLimits = Field(
        default_factory=TenantResourceLimits, 
        description="Resource limits for the tenant"
    )
    data_retention_days: int = Field(
        90, 
        description="Days to retain tenant data",
        ge=1,
        le=3650,
        example=180
    )
    custom_domain: Optional[str] = Field(
        None, 
        description="Custom domain for tenant access",
        example="integration.example.com"
    )
    allowed_ip_ranges: List[str] = Field(
        [], 
        description="IP ranges allowed to access tenant resources",
        example=["192.168.1.0/24", "10.0.0.0/16"]
    )
    encryption_key_id: Optional[str] = Field(
        None, 
        description="ID of customer-managed encryption key",
        example="key-987654"
    )
```

### Application Sharing

#### ApplicationSharingModel
```python
class SharingPermission(str, Enum):
    """Permission level for shared applications"""
    VIEW = "view"             # Can only view and use
    USE = "use"               # Can use in integrations
    EXTEND = "extend"         # Can create extensions
    ADMIN = "admin"           # Full administrative access

class ApplicationSharingConfig(BaseModel):
    """Configuration for application sharing between tenants"""
    application_id: int = Field(
        ..., 
        description="ID of the application to share",
        example=42
    )
    source_tenant_id: str = Field(
        ..., 
        description="ID of the tenant sharing the application",
        example="tenant-123456"
    )
    target_tenant_id: str = Field(
        ..., 
        description="ID of the tenant receiving access",
        example="tenant-789012"
    )
    permission_level: SharingPermission = Field(
        SharingPermission.USE, 
        description="Permission level granted to target tenant",
        example=SharingPermission.USE
    )
    is_active: bool = Field(
        True, 
        description="Whether the sharing is currently active",
        example=True
    )
    share_datasets: bool = Field(
        False, 
        description="Whether to share associated datasets",
        example=False
    )
    expiration_date: Optional[datetime] = Field(
        None, 
        description="Date when sharing expires",
        example="2025-12-31T23:59:59Z"
    )
    restrictions: Optional[Dict[str, Any]] = Field(
        None, 
        description="Additional restrictions on usage",
        example={
            "max_usage_per_day": 1000,
            "allowed_regions": ["us-east", "eu-west"]
        }
    )
```

### Resource Usage Tracking

#### TenantResourceUsage
```python
class ResourceType(str, Enum):
    """Types of resources that can be tracked"""
    APPLICATION = "application"
    INTEGRATION = "integration"
    DATASET = "dataset"
    STORAGE = "storage"
    API_CALL = "api_call"
    COMPUTATION = "computation"

class ResourceUsageMetric(BaseModel):
    """Usage metric for a specific resource type"""
    resource_type: ResourceType = Field(
        ..., 
        description="Type of resource being tracked",
        example=ResourceType.INTEGRATION
    )
    current_usage: int = Field(
        ..., 
        description="Current usage amount",
        example=27
    )
    limit: int = Field(
        ..., 
        description="Maximum allowed usage",
        example=100
    )
    unit: str = Field(
        "count", 
        description="Unit of measurement",
        example="count"
    )

class TenantResourceUsage(BaseModel):
    """Current resource usage for a tenant"""
    tenant_id: str = Field(
        ..., 
        description="ID of the tenant",
        example="tenant-123456"
    )
    last_updated: datetime = Field(
        ..., 
        description="When the usage was last updated",
        example="2025-03-30T15:45:00Z"
    )
    metrics: List[ResourceUsageMetric] = Field(
        ..., 
        description="Usage metrics for different resource types",
        example=[
            {
                "resource_type": "integration",
                "current_usage": 27,
                "limit": 100,
                "unit": "count"
            },
            {
                "resource_type": "storage",
                "current_usage": 512,
                "limit": 1024,
                "unit": "MB"
            }
        ]
    )
    usage_trending: Optional[Dict[str, Any]] = Field(
        None, 
        description="Usage trends over time",
        example={
            "integration": {
                "30d_growth": 15,
                "trend": "increasing"
            }
        }
    )
```

## API Endpoints

### 1. Tenant Configuration

#### GET /api/admin/tenants/{tenant_id}/configuration

Retrieves the isolation configuration for a specific tenant.

##### Response (200 OK)
```json
{
  "tenant_id": "tenant-123456",
  "name": "Acme Corp",
  "isolation_level": "high",
  "resource_limits": {
    "max_applications": 20,
    "max_integrations": 100,
    "max_datasets": 50,
    "max_concurrent_runs": 10,
    "storage_limit_mb": 5120,
    "api_rate_limit": 200
  },
  "data_retention_days": 180,
  "custom_domain": "integration.acmecorp.com",
  "allowed_ip_ranges": ["192.168.1.0/24", "10.0.0.0/16"],
  "encryption_key_id": "key-987654"
}
```

#### PUT /api/admin/tenants/{tenant_id}/configuration

Updates the isolation configuration for a specific tenant.

##### Request Body
```json
{
  "isolation_level": "complete",
  "resource_limits": {
    "max_applications": 50,
    "max_integrations": 200,
    "storage_limit_mb": 10240
  },
  "allowed_ip_ranges": ["192.168.1.0/24", "10.0.0.0/16", "172.16.0.0/16"]
}
```

##### Response (200 OK)
```json
{
  "tenant_id": "tenant-123456",
  "name": "Acme Corp",
  "isolation_level": "complete",
  "resource_limits": {
    "max_applications": 50,
    "max_integrations": 200,
    "max_datasets": 50,
    "max_concurrent_runs": 10,
    "storage_limit_mb": 10240,
    "api_rate_limit": 200
  },
  "data_retention_days": 180,
  "custom_domain": "integration.acmecorp.com",
  "allowed_ip_ranges": ["192.168.1.0/24", "10.0.0.0/16", "172.16.0.0/16"],
  "encryption_key_id": "key-987654",
  "updated_at": "2025-03-30T16:00:00Z",
  "updated_by": "user-uuid-12345"
}
```

### 2. Application Sharing

#### POST /api/admin/applications/{application_id}/share

Shares an application with another tenant.

##### Request Body
```json
{
  "target_tenant_id": "tenant-789012",
  "permission_level": "use",
  "share_datasets": false,
  "expiration_date": "2025-12-31T23:59:59Z",
  "restrictions": {
    "max_usage_per_day": 1000,
    "allowed_regions": ["us-east", "eu-west"]
  }
}
```

##### Response (201 Created)
```json
{
  "application_id": 42,
  "application_name": "ERP Integration API",
  "source_tenant_id": "tenant-123456",
  "source_tenant_name": "Acme Corp",
  "target_tenant_id": "tenant-789012",
  "target_tenant_name": "Beta LLC",
  "permission_level": "use",
  "is_active": true,
  "share_datasets": false,
  "expiration_date": "2025-12-31T23:59:59Z",
  "restrictions": {
    "max_usage_per_day": 1000,
    "allowed_regions": ["us-east", "eu-west"]
  },
  "shared_at": "2025-03-30T16:15:00Z",
  "shared_by": "user-uuid-12345"
}
```

#### GET /api/admin/applications/{application_id}/sharing

Gets the sharing configuration for an application.

##### Response (200 OK)
```json
{
  "application_id": 42,
  "application_name": "ERP Integration API",
  "owner_tenant_id": "tenant-123456",
  "owner_tenant_name": "Acme Corp",
  "shared_with": [
    {
      "tenant_id": "tenant-789012",
      "tenant_name": "Beta LLC",
      "permission_level": "use",
      "is_active": true,
      "share_datasets": false,
      "expiration_date": "2025-12-31T23:59:59Z",
      "shared_at": "2025-03-30T16:15:00Z"
    }
  ]
}
```

#### DELETE /api/admin/applications/{application_id}/sharing/{tenant_id}

Removes application sharing with a specific tenant.

##### Response (204 No Content)

### 3. Resource Usage

#### GET /api/admin/tenants/{tenant_id}/resource-usage

Gets the current resource usage for a tenant.

##### Response (200 OK)
```json
{
  "tenant_id": "tenant-123456",
  "tenant_name": "Acme Corp",
  "last_updated": "2025-03-30T16:30:00Z",
  "metrics": [
    {
      "resource_type": "application",
      "current_usage": 12,
      "limit": 20,
      "unit": "count",
      "percentage": 60
    },
    {
      "resource_type": "integration",
      "current_usage": 45,
      "limit": 100,
      "unit": "count",
      "percentage": 45
    },
    {
      "resource_type": "dataset",
      "current_usage": 22,
      "limit": 50,
      "unit": "count",
      "percentage": 44
    },
    {
      "resource_type": "storage",
      "current_usage": 3584,
      "limit": 5120,
      "unit": "MB",
      "percentage": 70
    },
    {
      "resource_type": "api_call",
      "current_usage": 12500,
      "limit": 20000,
      "unit": "count/day",
      "percentage": 62.5
    }
  ],
  "usage_trending": {
    "integration": {
      "30d_growth": 15,
      "trend": "increasing"
    },
    "storage": {
      "30d_growth": 22,
      "trend": "increasing"
    }
  }
}
```

## Database Schema Changes

### 1. tenant_configurations
New table for tenant isolation settings:
- `id`: Primary key
- `tenant_id`: Foreign key to tenants table
- `isolation_level`: Enum (STANDARD, HIGH, COMPLETE)
- `resource_limits`: JSONB object with resource limits
- `data_retention_days`: Integer
- `custom_domain`: String (nullable)
- `allowed_ip_ranges`: Array of CIDR strings
- `encryption_key_id`: String (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `created_by`: User ID
- `updated_by`: User ID

### 2. application_sharing
New table for application sharing between tenants:
- `id`: Primary key
- `application_id`: Foreign key to applications table
- `source_tenant_id`: Foreign key to tenants table
- `target_tenant_id`: Foreign key to tenants table
- `permission_level`: Enum (VIEW, USE, EXTEND, ADMIN)
- `is_active`: Boolean
- `share_datasets`: Boolean
- `expiration_date`: Timestamp (nullable)
- `restrictions`: JSONB object
- `shared_at`: Timestamp
- `shared_by`: User ID
- `created_at`: Timestamp
- `updated_at`: Timestamp

### 3. tenant_resource_usage
New table for tracking tenant resource usage:
- `id`: Primary key
- `tenant_id`: Foreign key to tenants table
- `resource_type`: Enum (APPLICATION, INTEGRATION, DATASET, STORAGE, API_CALL, COMPUTATION)
- `current_usage`: Integer
- `limit`: Integer
- `unit`: String
- `last_updated`: Timestamp

### 4. tenant_resource_usage_history
New table for historical resource usage:
- `id`: Primary key
- `tenant_id`: Foreign key to tenants table
- `resource_type`: Enum (same as above)
- `usage_amount`: Integer
- `timestamp`: Timestamp
- `period`: String (HOURLY, DAILY, WEEKLY, MONTHLY)

## Row-Level Security Implementation

For strong tenant isolation, we'll implement row-level security in the database:

```sql
-- Create a function to check tenant access
CREATE OR REPLACE FUNCTION check_tenant_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Get current tenant context from session variable
  RETURN (current_setting('app.current_tenant_id') = tenant_id::text);
END;
$$ LANGUAGE plpgsql;

-- Apply RLS policies to tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_applications ON applications
    USING (check_tenant_access() OR 
           tenant_id IN (SELECT target_tenant_id FROM application_sharing 
                         WHERE application_id = applications.id AND is_active = true));

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_integrations ON integrations
    USING (check_tenant_access());

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_datasets ON datasets
    USING (check_tenant_access() OR 
           id IN (SELECT dataset_id FROM shared_datasets 
                  WHERE target_tenant_id = current_setting('app.current_tenant_id')::text));
```

## Middleware Implementation

To enforce tenant context in all API requests, we'll implement middleware:

```python
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import APIKeyHeader
from starlette.middleware.base import BaseHTTPMiddleware

class TenantContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract tenant_id from the request
        tenant_id = request.headers.get("X-Tenant-ID")
        
        # Validate tenant existence and access
        if tenant_id:
            # Set tenant context for this request
            request.state.tenant_id = tenant_id
            
            # Set session-level variable for database RLS
            await self._set_tenant_context_in_db(request, tenant_id)
            
            # Continue with the request
            response = await call_next(request)
            
            # Clear context after request
            await self._clear_tenant_context_in_db(request)
            
            return response
        else:
            # For routes that don't require tenant context
            if request.url.path.startswith("/api/admin/"):
                return await call_next(request)
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tenant ID is required for this endpoint"
                )
    
    async def _set_tenant_context_in_db(self, request: Request, tenant_id: str):
        # Get database connection from request state
        db = request.state.db
        
        # Set session variable for RLS
        await db.execute("SET app.current_tenant_id = $1", tenant_id)
    
    async def _clear_tenant_context_in_db(self, request: Request):
        # Get database connection from request state
        db = request.state.db
        
        # Clear session variable
        await db.execute("RESET app.current_tenant_id")
```

## Service Layer Implementation

Each service method will enforce tenant isolation:

```python
class BaseService:
    def __init__(self, db, tenant_id=None):
        self.db = db
        self.tenant_id = tenant_id
    
    def validate_tenant_access(self, resource_id, resource_type):
        """
        Validate tenant has access to the resource
        
        Args:
            resource_id: ID of the resource
            resource_type: Type of resource (application, integration, etc.)
            
        Returns:
            True if access is allowed, False otherwise
            
        Note: This is enforced at database level through RLS, but we add
        service-level validation for defense in depth
        """
        if resource_type == "application":
            # Check direct ownership
            result = self.db.query(
                "SELECT tenant_id FROM applications WHERE id = $1", 
                resource_id
            )
            
            if not result or result[0]["tenant_id"] != self.tenant_id:
                # Check shared access
                shared = self.db.query(
                    """
                    SELECT permission_level 
                    FROM application_sharing 
                    WHERE application_id = $1 AND target_tenant_id = $2 AND is_active = true
                    """,
                    resource_id, self.tenant_id
                )
                
                if not shared:
                    return False
        
        elif resource_type == "integration":
            # Integrations are never shared, check direct ownership
            result = self.db.query(
                "SELECT tenant_id FROM integrations WHERE id = $1", 
                resource_id
            )
            
            if not result or result[0]["tenant_id"] != self.tenant_id:
                return False
        
        # Add other resource types as needed
        
        return True
```

## Benefits of This Approach

1. **Security by Default**
   - Multi-layered isolation (database, service, API)
   - Defense in depth with overlapping protection mechanisms
   - Explicit sharing model for cross-tenant collaboration

2. **Flexible Isolation Levels**
   - Configurable isolation to balance security and functionality
   - Graduated sharing permissions for different use cases
   - Fine-grained control over resource access

3. **Comprehensive Resource Management**
   - Detailed resource usage tracking and limitations
   - Historic usage patterns for capacity planning
   - Clear visibility into tenant resource consumption

4. **Performance Optimization**
   - Resource isolation prevents tenant activities from affecting each other
   - Tenant-specific rate limiting and throttling
   - Usage analysis for identifying optimization opportunities

5. **Compliance and Auditability**
   - Complete audit trail of all tenant operations
   - Clear record of cross-tenant interactions
   - Detailed resource usage records for billing and compliance

6. **Scalability**
   - Independent scaling for individual tenants
   - Resource allocation based on tenant needs
   - Efficient use of shared infrastructure with isolation guarantees

This implementation provides enterprise-grade tenant isolation with the flexibility needed for real-world multi-tenant scenarios, ensuring data security while enabling collaboration when necessary.