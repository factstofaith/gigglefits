"""
Admin Module Models

This module defines the models for the admin functionality in the TAP platform.
"""

from enum import Enum
from typing import Optional, List, Dict, Any, Union, Literal
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, HttpUrl, constr, SecretStr

class AdminUser(BaseModel):
    """Admin user model for administrative operations"""
    id: str = Field(..., description="Admin user identifier")
    username: str = Field(..., description="Admin username")
    email: str = Field(..., description="Admin email address")
    role: str = Field(..., description="Administrator role")
    is_active: bool = Field(True, description="Whether the admin user is active")
    created_at: datetime = Field(..., description="When the admin user was created")
    last_login: Optional[datetime] = Field(None, description="When the admin user last logged in")
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "admin-12345",
                "username": "admin",
                "email": "admin@example.com",
                "role": "super_admin",
                "is_active": True,
                "created_at": "2025-01-01T00:00:00Z",
                "last_login": "2025-04-01T12:00:00Z"
            }
        }
    }

class SuperUserRole(str, Enum):
    """Extended user role enum for super admin functionality"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"

class ApplicationStatus(str, Enum):
    """Status of an application in the platform"""
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"

class DatasetStatus(str, Enum):
    """Status of a dataset in the platform"""
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"

class DataType(str, Enum):
    """Data types for dataset fields"""
    STRING = "string"
    NUMBER = "number"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    ARRAY = "array"
    OBJECT = "object"
    BINARY = "binary"

class ReleaseStatus(str, Enum):
    """Status of a release of applications/datasets to tenants"""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

class ApplicationType(str, Enum):
    """Type of application"""
    API = "api"
    FILE = "file"
    DATABASE = "database"
    CUSTOM = "custom"

class AuthType(str, Enum):
    """Authentication type for applications"""
    NONE = "none"
    API_KEY = "api_key"
    OAUTH2 = "oauth2"
    BASIC = "basic"
    CUSTOM = "custom"
    
class SchemaDiscoveryMethod(str, Enum):
    """Method for discovering the application's schema"""
    MANUAL = "manual"         # Manually defined schema
    API_ENDPOINT = "api"      # Use an API endpoint to discover schema
    SWAGGER = "swagger"       # Use Swagger/OpenAPI specification
    DATABASE = "database"     # Use database introspection
    FILE_SAMPLE = "file"      # Use file sample
    AI_INFERENCE = "ai"       # Use AI to infer schema from samples

class ConnectionParameter(BaseModel):
    """
    Parameter definition for application or dataset connection configuration.
    
    Connection parameters define the required and optional configuration 
    values needed to establish a connection to an external system.
    """
    name: str = Field(
        ..., 
        description="The name of the parameter, used as the key in configuration",
        example="api_url"
    )
    description: Optional[str] = Field(
        None, 
        description="Human-readable description of the parameter's purpose and usage",
        example="The base URL for the API including protocol and version path"
    )
    required: bool = Field(
        False, 
        description="Whether this parameter is required for a successful connection",
        example=True
    )
    default_value: Optional[Any] = Field(
        None, 
        description="Default value to use if not explicitly provided",
        example="https://api.example.com/v2"
    )
    type: DataType = Field(
        DataType.STRING, 
        description="Data type of the parameter value",
        example=DataType.STRING
    )
    sensitive: bool = Field(
        False, 
        description="Whether this parameter contains sensitive information that should be masked",
        example=True
    )
    options: Optional[List[str]] = Field(
        None, 
        description="List of valid options if the parameter accepts a limited set of values",
        example=["option1", "option2", "option3"]
    )

class ApplicationBase(BaseModel):
    """
    Base model for application data in the TAP platform.
    
    An application represents an external system that can be integrated with
    the platform, such as an API, database, or file-based system. The application
    definition includes connection details, authentication method, and metadata.
    """
    name: str = Field(
        ..., 
        description="Name of the application",
        example="Customer Relationship Management API",
        min_length=3,
        max_length=100
    )
    type: ApplicationType = Field(
        ..., 
        description="Type of application (API, file, database, etc.)",
        example=ApplicationType.API
    )
    description: Optional[str] = Field(
        None, 
        description="Detailed description of the application, its purpose and features",
        example="Enterprise CRM system with customer data and interaction history"
    )
    logo_url: Optional[str] = Field(
        None, 
        description="URL to the application's logo image",
        example="https://example.com/logos/crm-logo.png"
    )
    auth_type: AuthType = Field(
        AuthType.NONE, 
        description="Authentication method required for this application",
        example=AuthType.OAUTH2
    )
    connection_parameters: List[ConnectionParameter] = Field(
        [], 
        description="Configuration parameters required to connect to this application",
        example=[{
            "name": "api_url",
            "description": "Base API URL",
            "required": True,
            "type": "string",
            "sensitive": False
        }]
    )
    documentation_url: Optional[str] = Field(
        None, 
        description="URL to the application's documentation",
        example="https://docs.example.com/crm-api"
    )
    support_url: Optional[str] = Field(
        None, 
        description="URL to the application's support resources",
        example="https://support.example.com/crm-api"
    )
    status: ApplicationStatus = Field(
        ApplicationStatus.DRAFT, 
        description="Current status of the application in the platform lifecycle",
        example=ApplicationStatus.ACTIVE
    )
    is_public: bool = Field(
        False, 
        description="Whether this application is available to all tenants (true) or requires explicit association (false)",
        example=False
    )

class ApplicationCreate(ApplicationBase):
    """
    Model for creating a new application in the system.
    
    This model extends the ApplicationBase with the same fields,
    all of which are required for application creation except those with defaults.
    """
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "ERP Integration API",
                "type": "api",
                "description": "Enterprise Resource Planning API for financial data",
                "auth_type": "oauth2",
                "status": "draft",
                "is_public": False,
                "connection_parameters": [
                    {
                        "name": "api_url",
                        "description": "Base API URL",
                        "required": True,
                        "type": "string"
                    },
                    {
                        "name": "client_id",
                        "description": "OAuth2 client ID",
                        "required": True,
                        "type": "string",
                        "sensitive": True
                    }
                ]
            }
        }
    }

class ApplicationUpdate(BaseModel):
    """
    Model for updating an existing application.
    
    All fields are optional, allowing partial updates. Only the fields
    that are provided will be updated in the application record.
    """
    name: Optional[str] = Field(
        None, 
        description="Updated name of the application",
        example="ERP Integration API v2",
        min_length=3,
        max_length=100
    )
    type: Optional[ApplicationType] = Field(
        None, 
        description="Updated type of application",
        example=ApplicationType.API
    )
    description: Optional[str] = Field(
        None, 
        description="Updated description of the application",
        example="Enterprise Resource Planning API with enhanced financial data access"
    )
    logo_url: Optional[str] = Field(
        None, 
        description="Updated URL to the application's logo",
        example="https://example.com/logos/erp-logo-v2.png"
    )
    auth_type: Optional[AuthType] = Field(
        None, 
        description="Updated authentication method",
        example=AuthType.OAUTH2
    )
    connection_parameters: Optional[List[ConnectionParameter]] = Field(
        None, 
        description="Updated connection parameters",
        example=[
            {
                "name": "api_url",
                "description": "Base API URL",
                "required": True,
                "type": "string"
            },
            {
                "name": "client_id",
                "description": "OAuth2 client ID",
                "required": True,
                "type": "string",
                "sensitive": True
            }
        ]
    )
    documentation_url: Optional[str] = Field(
        None, 
        description="Updated URL to documentation",
        example="https://docs.example.com/erp-api-v2"
    )
    support_url: Optional[str] = Field(
        None, 
        description="Updated URL to support resources",
        example="https://support.example.com/erp-api-v2"
    )
    status: Optional[ApplicationStatus] = Field(
        None, 
        description="Updated application status",
        example=ApplicationStatus.ACTIVE
    )
    is_public: Optional[bool] = Field(
        None, 
        description="Updated public availability flag",
        example=True
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "ERP Integration API v2",
                "description": "Enterprise Resource Planning API with enhanced financial data access",
                "status": "active"
            }
        }
    }

class Application(ApplicationBase):
    """
    Complete application model with system fields.
    
    This model represents an application as stored in the database,
    including system-managed fields like ID and timestamps.
    """
    id: int = Field(
        ..., 
        description="Unique identifier for the application",
        example=42
    )
    created_at: datetime = Field(
        ..., 
        description="Timestamp when the application was created",
        example="2025-01-15T10:30:00Z"
    )
    updated_at: datetime = Field(
        ..., 
        description="Timestamp when the application was last updated",
        example="2025-03-20T14:45:00Z"
    )
    created_by: str = Field(
        ..., 
        description="ID of the user who created the application",
        example="user-uuid-12345"
    )
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 42,
                "name": "ERP Integration API",
                "type": "api",
                "description": "Enterprise Resource Planning API for financial data",
                "logo_url": "https://example.com/logos/erp-logo.png",
                "auth_type": "oauth2",
                "connection_parameters": [
                    {
                        "name": "api_url",
                        "description": "Base API URL",
                        "required": True,
                        "type": "string"
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
        }
    }

class DatasetField(BaseModel):
    """
    Field definition in a dataset schema.
    
    A DatasetField represents a single field or column in a dataset,
    including its data type, constraints, and metadata for validation
    and documentation purposes.
    """
    name: str = Field(
        ..., 
        description="Name of the field/column in the dataset",
        example="customer_id",
        min_length=1,
        max_length=100
    )
    description: Optional[str] = Field(
        None, 
        description="Human-readable description of the field",
        example="Unique identifier for the customer record"
    )
    type: DataType = Field(
        ..., 
        description="Data type of the field",
        example=DataType.STRING
    )
    required: bool = Field(
        False, 
        description="Whether this field is required (cannot be null)",
        example=True
    )
    is_primary_key: bool = Field(
        False, 
        description="Whether this field is a primary key or part of a primary key",
        example=True
    )
    example_value: Optional[Any] = Field(
        None, 
        description="Example value for documentation purposes",
        example="CUST-12345"
    )
    format: Optional[str] = Field(
        None, 
        description="Format specification for the field value",
        example="uuid"
    )
    validation_pattern: Optional[str] = Field(
        None, 
        description="Regular expression pattern for validating field values",
        example="^CUST-[0-9]{5}$"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "customer_id",
                "description": "Unique identifier for the customer record",
                "type": "string",
                "required": True,
                "is_primary_key": True,
                "example_value": "CUST-12345",
                "validation_pattern": "^CUST-[0-9]{5}$"
            }
        }
    }

class DatasetBase(BaseModel):
    """Base model for dataset data"""
    name: str
    description: Optional[str] = None
    source_application_id: Optional[int] = None
    fields: List[DatasetField] = []
    connection_parameters: List[ConnectionParameter] = []
    sample_data: Optional[str] = None
    documentation_url: Optional[str] = None
    status: DatasetStatus = DatasetStatus.DRAFT
    is_public: bool = False

class DatasetCreate(DatasetBase):
    """Model for creating a new dataset"""
    pass

class DatasetUpdate(BaseModel):
    """Model for updating a dataset"""
    name: Optional[str] = None
    description: Optional[str] = None
    source_application_id: Optional[int] = None
    fields: Optional[List[DatasetField]] = None
    connection_parameters: Optional[List[ConnectionParameter]] = None
    sample_data: Optional[str] = None
    documentation_url: Optional[str] = None
    status: Optional[DatasetStatus] = None
    is_public: Optional[bool] = None

class Dataset(DatasetBase):
    """Complete dataset model with system fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class ReleaseItem(BaseModel):
    """Item in a release"""
    item_type: Literal["application", "dataset"]
    item_id: int
    action: Literal["add", "update", "remove"]
    version: Optional[str] = None
    notes: Optional[str] = None

class ReleaseBase(BaseModel):
    """Base model for release data"""
    name: str
    description: Optional[str] = None
    release_date: Optional[datetime] = None
    items: List[ReleaseItem] = []
    tenants: List[str] = []  # List of tenant IDs to release to
    status: ReleaseStatus = ReleaseStatus.DRAFT
    version: str  # Semantic version

class ReleaseCreate(ReleaseBase):
    """Model for creating a new release"""
    pass

class ReleaseUpdate(BaseModel):
    """Model for updating a release"""
    name: Optional[str] = None
    description: Optional[str] = None
    release_date: Optional[datetime] = None
    items: Optional[List[ReleaseItem]] = None
    tenants: Optional[List[str]] = None
    status: Optional[ReleaseStatus] = None
    version: Optional[str] = None

class Release(ReleaseBase):
    """Complete release model with system fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    completed_at: Optional[datetime] = None
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class TenantApplicationAssociation(BaseModel):
    """Association between a tenant and an application"""
    tenant_id: str
    application_id: int
    is_active: bool = True
    granted_at: datetime
    granted_by: str
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class TenantDatasetAssociation(BaseModel):
    """Association between a tenant and a dataset"""
    tenant_id: str
    dataset_id: int
    is_active: bool = True
    granted_at: datetime
    granted_by: str
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        
        
# Webhook models

class WebhookAuthType(str, Enum):
    """Authentication type for webhooks"""
    NONE = "none"
    BASIC = "basic"
    BEARER = "bearer"
    CUSTOM = "custom"


class WebhookEventType(str, Enum):
    """Event types that can trigger a webhook"""
    # Integration events
    INTEGRATION_CREATED = "integration.created"
    INTEGRATION_UPDATED = "integration.updated"
    INTEGRATION_DELETED = "integration.deleted"
    INTEGRATION_RUN_STARTED = "integration.run.started"
    INTEGRATION_RUN_COMPLETED = "integration.run.completed"
    INTEGRATION_RUN_FAILED = "integration.run.failed"
    INTEGRATION_HEALTH_CHANGED = "integration.health.changed"
    
    # Application events
    APPLICATION_CREATED = "application.created"
    APPLICATION_UPDATED = "application.updated"
    APPLICATION_DELETED = "application.deleted"
    
    # Dataset events
    DATASET_CREATED = "dataset.created"
    DATASET_UPDATED = "dataset.updated"
    DATASET_DELETED = "dataset.deleted"
    
    # User events
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    
    # Tenant events
    TENANT_CREATED = "tenant.created"
    TENANT_UPDATED = "tenant.updated"


class WebhookStatus(str, Enum):
    """Status of a webhook"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    FAILED = "failed"  # Multiple delivery failures


class WebhookBasicAuth(BaseModel):
    """Basic authentication for webhooks"""
    username: str
    password: str


class WebhookBearerAuth(BaseModel):
    """Bearer token authentication for webhooks"""
    token: str


class WebhookCustomAuth(BaseModel):
    """Custom authentication for webhooks"""
    scheme: str
    token: str


class WebhookFilter(BaseModel):
    """Filter criteria for webhooks"""
    field: str
    operator: str  # eq, ne, gt, lt, contains, in
    value: Any


class WebhookBase(BaseModel):
    """Base model for webhook data"""
    name: str
    url: HttpUrl
    description: Optional[str] = None
    
    # Authentication
    auth_type: WebhookAuthType = WebhookAuthType.NONE
    auth_credentials: Optional[Union[WebhookBasicAuth, WebhookBearerAuth, WebhookCustomAuth]] = None
    
    # Headers
    headers: Optional[Dict[str, str]] = None
    
    # Events and filtering
    events: List[WebhookEventType]
    filters: Optional[List[WebhookFilter]] = None
    
    # Related resources
    integration_id: Optional[int] = None
    tenant_id: Optional[str] = None
    
    # Security
    secret_key: Optional[str] = None
    is_secure: bool = True
    
    # Configuration
    timeout_seconds: int = Field(5, ge=1, le=30)
    retry_count: int = Field(3, ge=0, le=10)
    retry_interval_seconds: int = Field(60, ge=5, le=3600)
    
    @field_validator('url')
    @classmethod
    def validate_url_scheme(cls, v, info):
        """Validate URL scheme based on is_secure flag"""
        is_secure = info.data.get('is_secure', True)
        if is_secure and v.scheme != 'https':
            raise ValueError('URL must use HTTPS when is_secure is True')
        return v
    
    @field_validator('auth_credentials')
    @classmethod
    def validate_auth_credentials(cls, v, info):
        """Validate auth credentials based on auth_type"""
        auth_type = info.data.get('auth_type')
        if auth_type == WebhookAuthType.NONE:
            if v is not None:
                raise ValueError('auth_credentials must be None when auth_type is none')
        elif auth_type == WebhookAuthType.BASIC:
            if not isinstance(v, WebhookBasicAuth):
                raise ValueError('auth_credentials must be WebhookBasicAuth when auth_type is basic')
        elif auth_type == WebhookAuthType.BEARER:
            if not isinstance(v, WebhookBearerAuth):
                raise ValueError('auth_credentials must be WebhookBearerAuth when auth_type is bearer')
        elif auth_type == WebhookAuthType.CUSTOM:
            if not isinstance(v, WebhookCustomAuth):
                raise ValueError('auth_credentials must be WebhookCustomAuth when auth_type is custom')
        return v


class WebhookCreate(WebhookBase):
    """Model for creating a new webhook"""
    pass


class WebhookUpdate(BaseModel):
    """Model for updating a webhook"""
    name: Optional[str] = None
    url: Optional[HttpUrl] = None
    description: Optional[str] = None
    auth_type: Optional[WebhookAuthType] = None
    auth_credentials: Optional[Union[WebhookBasicAuth, WebhookBearerAuth, WebhookCustomAuth]] = None
    headers: Optional[Dict[str, str]] = None
    events: Optional[List[WebhookEventType]] = None
    filters: Optional[List[WebhookFilter]] = None
    secret_key: Optional[str] = None
    status: Optional[WebhookStatus] = None
    is_secure: Optional[bool] = None
    timeout_seconds: Optional[int] = None
    retry_count: Optional[int] = None
    retry_interval_seconds: Optional[int] = None
    
    @field_validator('url')
    @classmethod
    def validate_url_scheme(cls, v, info):
        """Validate URL scheme based on is_secure flag"""
        if v is None:
            return v
        is_secure = info.data.get('is_secure')
        if is_secure is not None and is_secure and v.scheme != 'https':
            raise ValueError('URL must use HTTPS when is_secure is True')
        return v


class Webhook(WebhookBase):
    """Complete webhook model with system fields"""
    id: int
    status: WebhookStatus
    owner_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_triggered_at: Optional[datetime] = None
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class WebhookLogBase(BaseModel):
    """Base model for webhook log data"""
    webhook_id: int
    event_type: str
    payload: Dict[str, Any]
    
    
class WebhookLog(WebhookLogBase):
    """Complete webhook log model with system fields"""
    id: int
    response_status_code: Optional[int] = None
    response_body: Optional[str] = None
    is_success: bool = False
    error_message: Optional[str] = None
    attempt_count: int = 1
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class WebhookTestRequest(BaseModel):
    """Request model for testing a webhook"""
    url: HttpUrl
    auth_type: WebhookAuthType = WebhookAuthType.NONE
    auth_credentials: Optional[Union[WebhookBasicAuth, WebhookBearerAuth, WebhookCustomAuth]] = None
    headers: Optional[Dict[str, str]] = None
    payload: Dict[str, Any]
    event_type: WebhookEventType
    
    @field_validator('url')
    @classmethod
    def validate_url(cls, v):
        """Validate URL"""
        return v


class WebhookTestResponse(BaseModel):
    """Response model for testing a webhook"""
    success: bool
    status_code: Optional[int] = None
    response_body: Optional[str] = None
    error_message: Optional[str] = None
    request_duration_ms: int


# Tenant models
class TenantStatus(str, Enum):
    """Status of a tenant"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class TenantTier(str, Enum):
    """Tier of a tenant"""
    STANDARD = "standard"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class TenantBase(BaseModel):
    """Base model for tenant data"""
    name: str
    description: Optional[str] = None
    status: TenantStatus = TenantStatus.ACTIVE
    tier: TenantTier = TenantTier.STANDARD
    settings: Optional[Dict[str, Any]] = None

class TenantCreate(TenantBase):
    """Model for creating a new tenant"""
    id: Optional[str] = None  # Optional custom ID, will be generated if not provided

class TenantUpdate(BaseModel):
    """Model for updating a tenant"""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TenantStatus] = None
    tier: Optional[TenantTier] = None
    settings: Optional[Dict[str, Any]] = None

class Tenant(TenantBase):
    """Complete tenant model with system fields"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


# Azure Monitoring Models

class AzureAuthMethod(str, Enum):
    """Authentication method for Azure"""
    SERVICE_PRINCIPAL = "servicePrincipal"
    MANAGED_IDENTITY = "managedIdentity"


class AzureConfigBase(BaseModel):
    """Base model for Azure configuration"""
    tenant_id: str = Field(..., 
        description="Azure tenant ID", 
        example="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
    subscription_id: str = Field(..., 
        description="Azure subscription ID", 
        example="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
    resource_group: str = Field(..., 
        description="Azure resource group name", 
        example="tapint-dev-rg")
    auth_method: AzureAuthMethod = Field(
        AzureAuthMethod.SERVICE_PRINCIPAL, 
        description="Authentication method for Azure")
    refresh_interval: int = Field(
        60, ge=30, le=3600, 
        description="Refresh interval in seconds")


class AzureConfigCreate(AzureConfigBase):
    """Model for creating Azure configuration with sensitive data"""
    client_id: Optional[str] = Field(
        None, 
        description="Azure client ID (app registration)")
    client_secret: Optional[SecretStr] = Field(
        None, 
        description="Azure client secret")
    
    @field_validator('client_id', 'client_secret')
    @classmethod
    def validate_service_principal(cls, v, info):
        """Validate service principal credentials"""
        auth_method = info.data.get('auth_method')
        field_name = info.field_name
        
        if auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            if v is None:
                raise ValueError(f"{field_name} is required when auth_method is servicePrincipal")
        return v


class AzureConfigUpdate(BaseModel):
    """Model for updating Azure configuration"""
    tenant_id: Optional[str] = None
    subscription_id: Optional[str] = None
    resource_group: Optional[str] = None
    auth_method: Optional[AzureAuthMethod] = None
    client_id: Optional[str] = None
    client_secret: Optional[SecretStr] = None
    refresh_interval: Optional[int] = None


class AzureConfig(AzureConfigBase):
    """Complete Azure configuration model with system fields"""
    id: int
    client_id: Optional[str] = None
    is_connected: bool = False
    created_at: datetime
    updated_at: datetime
    last_connected_at: Optional[datetime] = None
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class AzureResource(BaseModel):
    """Azure resource model"""
    id: str = Field(..., description="Azure resource ID")
    name: str = Field(..., description="Resource name")
    type: str = Field(..., description="Resource type")
    location: str = Field(..., description="Resource location")
    properties: Dict[str, Any] = Field(default_factory=dict, 
        description="Resource properties")
    tags: Dict[str, str] = Field(default_factory=dict, 
        description="Resource tags")
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class AzureResourceHealth(BaseModel):
    """Azure resource health model"""
    resource_id: str
    status: str  # Available, Unavailable, Degraded, Unknown
    details: Optional[str] = None
    reason: Optional[str] = None
    last_checked: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class AzureConnectionTest(BaseModel):
    """Azure connection test model"""
    success: bool
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AzureMetric(BaseModel):
    """Azure metric model"""
    resource_id: str
    metric_name: str
    metric_values: List[Dict[str, Any]]
    time_grain: str
    start_time: datetime
    end_time: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class AzureDiscoveryResult(BaseModel):
    """Azure resource discovery result"""
    subscription_id: str
    resource_group: str
    resource_count: int
    discovered_types: List[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Error Log Models

class LogSeverity(str, Enum):
    """Error log severity levels"""
    CRITICAL = "critical"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    DEBUG = "debug"
    TRACE = "trace"


class ErrorLog(BaseModel):
    """Error log model for list view"""
    id: str = Field(..., description="Unique identifier for the log entry")
    severity: LogSeverity = Field(..., description="Severity level of the log")
    component: str = Field(..., description="Component or module that generated the log")
    message: str = Field(..., description="Log message text")
    timestamp: datetime = Field(..., description="When the log was created")
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class ErrorLogDetail(ErrorLog):
    """Detailed error log model with additional information"""
    stack_trace: Optional[str] = Field(None, description="Stack trace for error logs")
    context: Optional[Dict[str, Any]] = Field(None, description="Contextual information about the error")
    additional_data: Optional[Dict[str, Any]] = Field(None, description="Additional data related to the error")
    user_id: Optional[str] = Field(None, description="ID of the user that experienced the error, if applicable")
    tenant_id: Optional[str] = Field(None, description="ID of the tenant where the error occurred, if applicable")
    request_id: Optional[str] = Field(None, description="ID of the request that generated the error, if applicable")
    request_method: Optional[str] = Field(None, description="HTTP method of the request, if applicable")
    request_path: Optional[str] = Field(None, description="Path of the request, if applicable")
    ip_address: Optional[str] = Field(None, description="IP address where the error originated, if applicable")
    user_agent: Optional[str] = Field(None, description="User agent that generated the error, if applicable")
    session_id: Optional[str] = Field(None, description="Session ID where the error occurred, if applicable")
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class ErrorLogResponse(BaseModel):
    """Response model for error logs"""
    logs: List[ErrorLog] = Field(..., description="List of error logs")
    total: int = Field(..., description="Total count of logs matching the criteria")
    page: Optional[int] = Field(None, description="Current page number")
    page_size: Optional[int] = Field(None, description="Number of logs per page")
    next_page: Optional[int] = Field(None, description="Next page number, if available")
    prev_page: Optional[int] = Field(None, description="Previous page number, if available")


# Alert Configuration Models

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class AlertStatus(str, Enum):
    """Alert status"""
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    MUTED = "muted"


class AlertConditionOperator(str, Enum):
    """Operators for alert conditions"""
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    EQUAL_TO = "equal_to"
    NOT_EQUAL_TO = "not_equal_to"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"


class AlertNotificationChannel(str, Enum):
    """Notification channels for alerts"""
    EMAIL = "email"
    WEBHOOK = "webhook"
    SYSTEM = "system"
    SMS = "sms"
    TEAMS = "teams"
    SLACK = "slack"


class AlertCondition(BaseModel):
    """Condition for triggering an alert"""
    metric_id: str = Field(..., description="ID of the metric to monitor")
    metric_name: str = Field(..., description="Display name of the metric")
    resource_type: str = Field(..., description="Type of resource being monitored")
    operator: AlertConditionOperator = Field(..., description="Comparison operator")
    threshold_value: float = Field(..., description="Threshold value for comparison")
    evaluation_periods: int = Field(1, description="Number of periods the condition must be true")
    evaluation_period_minutes: int = Field(5, description="Period length in minutes")
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class AlertNotificationConfig(BaseModel):
    """Configuration for alert notifications"""
    channel: AlertNotificationChannel = Field(..., description="Notification channel")
    recipients: List[str] = Field(..., description="Recipients (email addresses, webhook URLs, etc.)")
    include_details: bool = Field(True, description="Whether to include detailed information")
    cooldown_minutes: int = Field(15, description="Cooldown period between notifications in minutes")
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class AlertBase(BaseModel):
    """Base model for alert configuration"""
    name: str = Field(..., description="Alert name")
    description: Optional[str] = Field(None, description="Alert description")
    resource_id: Optional[str] = Field(None, description="ID of the specific resource to monitor (or all if None)")
    resource_type: str = Field(..., description="Type of resource to monitor")
    condition: AlertCondition = Field(..., description="Alert trigger condition")
    severity: AlertSeverity = Field(AlertSeverity.MEDIUM, description="Alert severity level")
    enabled: bool = Field(True, description="Whether the alert is enabled")
    notification_config: List[AlertNotificationConfig] = Field(..., description="Notification configuration")
    auto_resolve: bool = Field(False, description="Whether to auto-resolve when condition is no longer met")
    tags: Optional[Dict[str, str]] = Field(None, description="Custom tags for categorization")


class AlertCreate(AlertBase):
    """Model for creating a new alert"""
    pass


class AlertUpdate(BaseModel):
    """Model for updating an alert configuration"""
    name: Optional[str] = None
    description: Optional[str] = None
    resource_id: Optional[str] = None
    resource_type: Optional[str] = None
    condition: Optional[AlertCondition] = None
    severity: Optional[AlertSeverity] = None
    enabled: Optional[bool] = None
    notification_config: Optional[List[AlertNotificationConfig]] = None
    auto_resolve: Optional[bool] = None
    tags: Optional[Dict[str, str]] = None
    status: Optional[AlertStatus] = None


class Alert(AlertBase):
    """Complete alert model with system fields"""
    id: str = Field(..., description="Alert ID")
    status: AlertStatus = Field(AlertStatus.ACTIVE, description="Current alert status")
    created_at: datetime = Field(..., description="When the alert was created")
    updated_at: datetime = Field(..., description="When the alert was last updated")
    created_by: str = Field(..., description="ID of the user who created the alert")
    last_triggered_at: Optional[datetime] = Field(None, description="When the alert was last triggered")
    resolved_at: Optional[datetime] = Field(None, description="When the alert was resolved")
    resolved_by: Optional[str] = Field(None, description="ID of the user who resolved the alert")
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class AlertHistoryAction(str, Enum):
    """Actions in alert history"""
    CREATED = "created"
    UPDATED = "updated"
    TRIGGERED = "triggered"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    MUTED = "muted"
    UNMUTED = "unmuted"


class AlertHistoryEntry(BaseModel):
    """Alert history entry"""
    id: str = Field(..., description="History entry ID")
    alert_id: str = Field(..., description="Alert ID")
    action: AlertHistoryAction = Field(..., description="Action performed")
    timestamp: datetime = Field(..., description="When the action occurred")
    user_id: Optional[str] = Field(None, description="ID of the user who performed the action")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional details about the action")
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class AlertListResponse(BaseModel):
    """Response model for alert lists"""
    alerts: List[Alert] = Field(..., description="List of alerts")
    total: int = Field(..., description="Total count of alerts matching the criteria")
    page: Optional[int] = Field(None, description="Current page number")
    page_size: Optional[int] = Field(None, description="Number of alerts per page")
    next_page: Optional[int] = Field(None, description="Next page number, if available")
    prev_page: Optional[int] = Field(None, description="Previous page number, if available")


class AlertHistoryResponse(BaseModel):
    """Response model for alert history"""
    history: List[AlertHistoryEntry] = Field(..., description="List of history entries")
    total: int = Field(..., description="Total count of history entries")
    alert_id: str = Field(..., description="Alert ID")
    page: Optional[int] = Field(None, description="Current page number")
    page_size: Optional[int] = Field(None, description="Number of entries per page")
    next_page: Optional[int] = Field(None, description="Next page number, if available")
    prev_page: Optional[int] = Field(None, description="Previous page number, if available")


# Admin-specific models
class AdminModel(BaseModel):
    """Base model for admin operations"""
    action: str = Field(..., description="Administrative action")
    resource_type: str = Field(..., description="Type of resource")
    resource_id: Optional[str] = Field(None, description="ID of the resource")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional action details")
    performed_by: Optional[str] = Field(None, description="User who performed the action")