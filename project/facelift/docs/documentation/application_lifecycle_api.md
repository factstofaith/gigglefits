# Application Lifecycle Management API

This document outlines the design of new API endpoints for application lifecycle management, specifically for publishing and unpublishing applications with proper schema validation.

## New API Endpoints

### 1. POST /api/admin/applications/{application_id}/publish

#### Description
Publishes an application, making it available to end users. This changes the application status from DRAFT to ACTIVE and validates that all required configuration is complete.

#### Request Body
```json
{
  "version": "1.0.0",
  "release_notes": "Initial release of the application",
  "publish_to_tenants": ["tenant-id-1", "tenant-id-2"],
  "validate_only": false
}
```

#### Parameters
- `version` (string, required): Semantic version for this publication
- `release_notes` (string, optional): Notes describing the changes in this publication
- `publish_to_tenants` (array, optional): List of tenant IDs to publish to (if empty, publishes globally)
- `validate_only` (boolean, optional): If true, only validates but doesn't actually publish

#### Response (200 OK)
```json
{
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
    },
    {
      "check": "connection_parameters",
      "status": "passed",
      "message": "Connection parameters are valid"
    }
  ],
  "tenant_access": [
    {
      "tenant_id": "tenant-id-1",
      "name": "Acme Corp",
      "granted_at": "2025-03-30T14:45:00Z"
    }
  ]
}
```

#### Response (400 Bad Request)
```json
{
  "status": "validation_failed",
  "message": "Application cannot be published due to validation errors",
  "validation_results": [
    {
      "check": "required_fields",
      "status": "failed",
      "message": "Missing required connection parameters: api_key"
    },
    {
      "check": "connection_test",
      "status": "failed",
      "message": "Unable to connect to API endpoint"
    }
  ]
}
```

### 2. POST /api/admin/applications/{application_id}/unpublish

#### Description
Unpublishes an application, making it unavailable to end users. This changes the application status from ACTIVE to INACTIVE.

#### Request Body
```json
{
  "reason": "Maintenance required",
  "notify_tenants": true,
  "maintenance_window": {
    "start_time": "2025-04-01T00:00:00Z",
    "end_time": "2025-04-01T03:00:00Z"
  }
}
```

#### Parameters
- `reason` (string, optional): Reason for unpublishing
- `notify_tenants` (boolean, optional): Whether to notify affected tenants
- `maintenance_window` (object, optional): Planned maintenance window information

#### Response (200 OK)
```json
{
  "id": 42,
  "name": "ERP Integration API",
  "status": "inactive",
  "unpublished_at": "2025-03-30T15:00:00Z",
  "unpublished_by": "user-uuid-12345",
  "affected_tenants": 2,
  "affected_integrations": 5
}
```

### 3. GET /api/admin/applications/{application_id}/publication-history

#### Description
Returns the publication history for an application, including all versions, status changes, and timestamps.

#### Response (200 OK)
```json
{
  "application_id": 42,
  "application_name": "ERP Integration API",
  "current_status": "active",
  "current_version": "1.0.1",
  "publications": [
    {
      "version": "1.0.0",
      "status": "active",
      "published_at": "2025-03-15T10:30:00Z",
      "published_by": "user-uuid-12345",
      "release_notes": "Initial release",
      "published_to_tenants": ["tenant-id-1"]
    },
    {
      "version": "1.0.1",
      "status": "active",
      "published_at": "2025-03-30T14:45:00Z",
      "published_by": "user-uuid-12345",
      "release_notes": "Bug fixes and performance improvements",
      "published_to_tenants": ["tenant-id-1", "tenant-id-2"]
    }
  ],
  "status_changes": [
    {
      "from_status": "draft",
      "to_status": "active",
      "changed_at": "2025-03-15T10:30:00Z",
      "changed_by": "user-uuid-12345",
      "reason": "Initial publication"
    },
    {
      "from_status": "active",
      "to_status": "inactive",
      "changed_at": "2025-03-20T08:15:00Z",
      "changed_by": "user-uuid-12345",
      "reason": "Maintenance"
    },
    {
      "from_status": "inactive",
      "to_status": "active",
      "changed_at": "2025-03-21T12:30:00Z",
      "changed_by": "user-uuid-12345",
      "reason": "Maintenance complete"
    }
  ]
}
```

## New Pydantic Models

### ApplicationPublishRequest
```python
class ApplicationPublishRequest(BaseModel):
    """Request model for publishing an application"""
    version: str = Field(
        ..., 
        description="Semantic version for this publication",
        pattern=r"^\d+\.\d+\.\d+$",
        example="1.0.0"
    )
    release_notes: Optional[str] = Field(
        None, 
        description="Notes describing the changes in this publication",
        example="Initial release with core functionality"
    )
    publish_to_tenants: Optional[List[str]] = Field(
        None, 
        description="List of tenant IDs to publish to (if empty, publishes globally)",
        example=["tenant-id-1", "tenant-id-2"]
    )
    validate_only: bool = Field(
        False, 
        description="If true, only validates but doesn't actually publish",
        example=False
    )
```

### ValidationResult
```python
class ValidationResultStatus(str, Enum):
    """Status of a validation check"""
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"

class ValidationResult(BaseModel):
    """Result of a validation check"""
    check: str = Field(
        ..., 
        description="Name of the validation check",
        example="required_fields"
    )
    status: ValidationResultStatus = Field(
        ..., 
        description="Status of the validation check",
        example=ValidationResultStatus.PASSED
    )
    message: str = Field(
        ..., 
        description="Message describing the validation result",
        example="All required fields are present"
    )
```

### PublicationValidationResponse
```python
class PublicationValidationResponse(BaseModel):
    """Response model for application publication validation"""
    status: Literal["valid", "validation_failed"] = Field(
        ..., 
        description="Overall validation status",
        example="valid"
    )
    message: str = Field(
        ..., 
        description="Summary message",
        example="Application is valid for publication"
    )
    validation_results: List[ValidationResult] = Field(
        ..., 
        description="Detailed validation results",
        example=[
            {
                "check": "required_fields",
                "status": "passed",
                "message": "All required fields are present"
            }
        ]
    )
```

### TenantAccess
```python
class TenantAccess(BaseModel):
    """Model for tenant access to an application"""
    tenant_id: str = Field(
        ..., 
        description="ID of the tenant",
        example="tenant-id-1"
    )
    name: str = Field(
        ..., 
        description="Name of the tenant",
        example="Acme Corp"
    )
    granted_at: datetime = Field(
        ..., 
        description="When access was granted",
        example="2025-03-30T14:45:00Z"
    )
```

### ApplicationPublishResponse
```python
class ApplicationPublishResponse(BaseModel):
    """Response model for application publication"""
    id: int = Field(
        ..., 
        description="Application ID",
        example=42
    )
    name: str = Field(
        ..., 
        description="Application name",
        example="ERP Integration API"
    )
    status: ApplicationStatus = Field(
        ..., 
        description="Application status after publication",
        example=ApplicationStatus.ACTIVE
    )
    version: str = Field(
        ..., 
        description="Published version",
        example="1.0.0"
    )
    published_at: datetime = Field(
        ..., 
        description="Publication timestamp",
        example="2025-03-30T14:45:00Z"
    )
    published_by: str = Field(
        ..., 
        description="ID of the user who published the application",
        example="user-uuid-12345"
    )
    validation_results: List[ValidationResult] = Field(
        ..., 
        description="Validation results",
        example=[
            {
                "check": "required_fields",
                "status": "passed",
                "message": "All required fields are present"
            }
        ]
    )
    tenant_access: List[TenantAccess] = Field(
        [], 
        description="Tenants with access to this application",
        example=[
            {
                "tenant_id": "tenant-id-1",
                "name": "Acme Corp",
                "granted_at": "2025-03-30T14:45:00Z"
            }
        ]
    )
```

### ApplicationUnpublishRequest
```python
class MaintenanceWindow(BaseModel):
    """Model for maintenance window information"""
    start_time: datetime = Field(
        ..., 
        description="Start time of maintenance window",
        example="2025-04-01T00:00:00Z"
    )
    end_time: datetime = Field(
        ..., 
        description="End time of maintenance window",
        example="2025-04-01T03:00:00Z"
    )
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        """Validate end_time is after start_time"""
        start_time = info.data.get('start_time')
        if start_time and v <= start_time:
            raise ValueError('end_time must be after start_time')
        return v

class ApplicationUnpublishRequest(BaseModel):
    """Request model for unpublishing an application"""
    reason: Optional[str] = Field(
        None, 
        description="Reason for unpublishing",
        example="Maintenance required"
    )
    notify_tenants: bool = Field(
        True, 
        description="Whether to notify affected tenants",
        example=True
    )
    maintenance_window: Optional[MaintenanceWindow] = Field(
        None, 
        description="Planned maintenance window information",
        example={
            "start_time": "2025-04-01T00:00:00Z",
            "end_time": "2025-04-01T03:00:00Z"
        }
    )
```

### ApplicationUnpublishResponse
```python
class ApplicationUnpublishResponse(BaseModel):
    """Response model for application unpublication"""
    id: int = Field(
        ..., 
        description="Application ID",
        example=42
    )
    name: str = Field(
        ..., 
        description="Application name",
        example="ERP Integration API"
    )
    status: ApplicationStatus = Field(
        ..., 
        description="Application status after unpublication",
        example=ApplicationStatus.INACTIVE
    )
    unpublished_at: datetime = Field(
        ..., 
        description="Unpublication timestamp",
        example="2025-03-30T15:00:00Z"
    )
    unpublished_by: str = Field(
        ..., 
        description="ID of the user who unpublished the application",
        example="user-uuid-12345"
    )
    affected_tenants: int = Field(
        0, 
        description="Number of affected tenants",
        example=2
    )
    affected_integrations: int = Field(
        0, 
        description="Number of affected integrations",
        example=5
    )
```

### PublicationHistoryEntry
```python
class PublicationHistoryEntry(BaseModel):
    """Model for publication history entry"""
    version: str = Field(
        ..., 
        description="Published version",
        example="1.0.0"
    )
    status: ApplicationStatus = Field(
        ..., 
        description="Application status after publication",
        example=ApplicationStatus.ACTIVE
    )
    published_at: datetime = Field(
        ..., 
        description="Publication timestamp",
        example="2025-03-15T10:30:00Z"
    )
    published_by: str = Field(
        ..., 
        description="ID of the user who published the application",
        example="user-uuid-12345"
    )
    release_notes: Optional[str] = Field(
        None, 
        description="Release notes",
        example="Initial release"
    )
    published_to_tenants: List[str] = Field(
        [], 
        description="Tenant IDs the application was published to",
        example=["tenant-id-1"]
    )
```

### StatusChangeEntry
```python
class StatusChangeEntry(BaseModel):
    """Model for status change history entry"""
    from_status: ApplicationStatus = Field(
        ..., 
        description="Previous status",
        example=ApplicationStatus.DRAFT
    )
    to_status: ApplicationStatus = Field(
        ..., 
        description="New status",
        example=ApplicationStatus.ACTIVE
    )
    changed_at: datetime = Field(
        ..., 
        description="Change timestamp",
        example="2025-03-15T10:30:00Z"
    )
    changed_by: str = Field(
        ..., 
        description="ID of the user who changed the status",
        example="user-uuid-12345"
    )
    reason: Optional[str] = Field(
        None, 
        description="Reason for the status change",
        example="Initial publication"
    )
```

### PublicationHistoryResponse
```python
class PublicationHistoryResponse(BaseModel):
    """Response model for application publication history"""
    application_id: int = Field(
        ..., 
        description="Application ID",
        example=42
    )
    application_name: str = Field(
        ..., 
        description="Application name",
        example="ERP Integration API"
    )
    current_status: ApplicationStatus = Field(
        ..., 
        description="Current application status",
        example=ApplicationStatus.ACTIVE
    )
    current_version: Optional[str] = Field(
        None, 
        description="Current published version",
        example="1.0.1"
    )
    publications: List[PublicationHistoryEntry] = Field(
        [], 
        description="Publication history",
        example=[
            {
                "version": "1.0.0",
                "status": "active",
                "published_at": "2025-03-15T10:30:00Z",
                "published_by": "user-uuid-12345",
                "release_notes": "Initial release",
                "published_to_tenants": ["tenant-id-1"]
            }
        ]
    )
    status_changes: List[StatusChangeEntry] = Field(
        [], 
        description="Status change history",
        example=[
            {
                "from_status": "draft",
                "to_status": "active",
                "changed_at": "2025-03-15T10:30:00Z",
                "changed_by": "user-uuid-12345",
                "reason": "Initial publication"
            }
        ]
    )
```

## Required Database Schema Changes

We'll need to add new tables and fields to support application lifecycle management:

### New Fields for Applications Table
- `version`: Current published version (VARCHAR)
- `last_published_at`: Timestamp of last publication (TIMESTAMP)
- `last_published_by`: User ID who last published (VARCHAR)

### New Tables

#### application_publications
Stores the publication history for applications:
- `id`: Primary key
- `application_id`: Foreign key to applications table
- `version`: Semantic version string
- `status`: Application status after publication
- `published_at`: Publication timestamp
- `published_by`: User ID who published
- `release_notes`: Notes for this publication
- `created_at`: Record creation timestamp

#### application_status_changes
Tracks status changes for applications:
- `id`: Primary key
- `application_id`: Foreign key to applications table
- `from_status`: Previous status
- `to_status`: New status
- `changed_at`: Change timestamp
- `changed_by`: User ID who made the change
- `reason`: Reason for the change
- `created_at`: Record creation timestamp

#### tenant_application_access
Maps which tenants have access to which applications:
- `id`: Primary key
- `tenant_id`: Foreign key to tenants table
- `application_id`: Foreign key to applications table
- `granted_at`: Timestamp when access was granted
- `granted_by`: User ID who granted access
- `is_active`: Boolean indicating if access is currently active
- `created_at`: Record creation timestamp

## Validation Rules

The following validations will be performed before an application can be published:

1. **Required Fields Check**
   - Application name and type are required
   - All required connection parameters must be provided
   - If authentication is required, auth parameters must be provided

2. **Connection Parameters Validation**
   - All connection parameters follow their defined schema
   - Parameters marked as sensitive are properly secured
   - No configuration secrets are stored in plain text

3. **Connection Test (Optional)**
   - If the application is API-based, attempt to connect to verify configuration
   - For file-based applications, verify access to storage locations
   - For database applications, test connection to the database

4. **Tenant Access Check**
   - If publishing to specific tenants, verify those tenants exist
   - Check if the tenants have necessary permissions for the application

5. **Semantic Version Check**
   - Ensure the provided version follows semantic versioning (MAJOR.MINOR.PATCH)
   - If updating an existing published application, verify the new version is higher

6. **Integration Impact Assessment**
   - Identify any active integrations that will be affected by the publication
   - Provide warnings about potential disruptions to existing integrations

These robust validations ensure that only properly configured applications can be published, reducing the risk of integration failures.