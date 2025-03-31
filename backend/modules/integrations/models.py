"""
Integration Models

This module defines the database models for integrations in the TAP platform.
"""

from enum import Enum
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class DataType(str, Enum):
    """Data types for dataset fields"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    OBJECT = "object"
    ARRAY = "array"


class DatasetStatus(str, Enum):
    """Status of a dataset"""
    DRAFT = "draft"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"

# User response model
class UserResponseModel(BaseModel):
    """Response model for user data"""
    id: str
    username: str
    email: str
    name: str
    role: str
    tenant_id: Optional[str] = None
    provider: Optional[str] = None
    created_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class IntegrationType(str, Enum):
    """Enum for integration types"""
    API = "API-based"
    FILE = "File-based"
    DATABASE = "Database"


class IntegrationHealth(str, Enum):
    """Enum for integration health status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    ERROR = "error"


class ScheduleType(str, Enum):
    """Enum for schedule types"""
    ON_DEMAND = "onDemand"
    DAILY_2AM = "daily2am"
    DAILY_6AM = "daily6am"
    HOURLY = "hourly"
    WEEKLY_FRIDAY = "weeklyFriday"
    MONTHLY_1ST = "monthly1st"
    CUSTOM = "custom"


class AzureBlobConfig(BaseModel):
    """Configuration for Azure Blob Storage integration"""
    # Match the frontend field naming for consistency
    authMethod: str = "connectionString"
    connectionString: Optional[str] = None
    accountName: Optional[str] = None
    accountKey: Optional[str] = None
    sasToken: Optional[str] = None
    useManagedIdentity: bool = False
    containerName: str
    filePattern: str = "*.csv"
    path: Optional[str] = None
    createContainerIfNotExists: bool = False
    
    class Config:
        """Allow field aliasing for compatibility with snake_case backends"""
        allow_population_by_field_name = True
        alias_generator = lambda field_name: field_name.lower()


class ScheduleConfig(BaseModel):
    """Configuration for integration schedules"""
    type: ScheduleType = ScheduleType.ON_DEMAND
    cronExpression: Optional[str] = None
    timezone: str = "UTC"
    effectiveDate: Optional[datetime] = None
    description: Optional[str] = None
    
    @field_validator('cronExpression')
    @classmethod
    def validate_cron_expression(cls, v, info):
        """Validate cron expression if schedule type is custom"""
        if info.data.get('type') == ScheduleType.CUSTOM and not v:
            raise ValueError('Cron expression is required for custom schedules')
        return v
        
    class Config:
        """Allow field aliasing for compatibility with snake_case backends"""
        allow_population_by_field_name = True
        alias_generator = lambda field_name: field_name.lower()


class IntegrationBase(BaseModel):
    """Base model for integration data"""
    name: str
    type: IntegrationType
    source: str
    destination: str
    description: Optional[str] = None
    tenant_id: Optional[str] = None
    owner_id: Optional[str] = None
    tags: Optional[List[str]] = None


class IntegrationCreate(IntegrationBase):
    """Model for creating a new integration"""
    schedule: Optional[Union[str, ScheduleConfig]] = None
    azure_blob_config: Optional[AzureBlobConfig] = None


class IntegrationUpdate(BaseModel):
    """Model for updating an integration"""
    name: Optional[str] = None
    type: Optional[IntegrationType] = None
    source: Optional[str] = None
    destination: Optional[str] = None
    description: Optional[str] = None
    schedule: Optional[Union[str, ScheduleConfig]] = None
    azure_blob_config: Optional[AzureBlobConfig] = None
    health: Optional[IntegrationHealth] = None
    tags: Optional[List[str]] = None


class Integration(IntegrationBase):
    """Complete integration model with system fields"""
    id: int
    health: IntegrationHealth = IntegrationHealth.HEALTHY
    schedule: Union[str, ScheduleConfig] = Field(default_factory=lambda: {"type": "onDemand"})
    azureBlobConfig: Optional[AzureBlobConfig] = Field(None, alias="azure_blob_config")
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")
    lastRunAt: Optional[datetime] = Field(None, alias="last_run_at")
    application_id: Optional[int] = None
    datasets: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        allow_population_by_field_name = True


class FieldMappingBase(BaseModel):
    """Base model for field mapping data"""
    integration_id: int
    source_field: str
    destination_field: str
    transformation: Optional[str] = "direct"
    transform_params: Optional[Dict[str, Any]] = None
    required: bool = False
    description: Optional[str] = None


class FieldMappingCreate(FieldMappingBase):
    """Model for creating a new field mapping"""
    pass


class FieldMappingUpdate(BaseModel):
    """Model for updating a field mapping"""
    source_field: Optional[str] = None
    destination_field: Optional[str] = None
    transformation: Optional[str] = None
    transform_params: Optional[Dict[str, Any]] = None
    required: Optional[bool] = None
    description: Optional[str] = None


class FieldMapping(FieldMappingBase):
    """Complete field mapping model with system fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class UserRole(str, Enum):
    """Enum for user roles"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"


class User(BaseModel):
    """User model"""
    id: str
    username: str
    email: str
    name: str
    role: UserRole
    tenant_id: Optional[str] = None
    provider: Optional[str] = None
    created_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class IntegrationRunStatus(str, Enum):
    """Enum for integration run status"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class IntegrationRun(BaseModel):
    """Model for integration run details"""
    id: int
    integrationId: int = Field(..., alias="integration_id")
    status: IntegrationRunStatus
    startTime: datetime = Field(..., alias="start_time")
    endTime: Optional[datetime] = Field(None, alias="end_time")
    recordsProcessed: Optional[int] = Field(None, alias="records_processed")
    warnings: Optional[List[str]] = None
    error: Optional[str] = None
    
    class Config:
        """Pydantic config"""
        from_attributes = True
        allow_population_by_field_name = True


# Dataset Models
class DatasetFieldBase(BaseModel):
    """Base model for dataset fields"""
    name: str
    description: Optional[str] = None
    data_type: DataType
    is_required: bool = False
    is_primary_key: bool = False
    format: Optional[str] = None
    constraints: Optional[Dict[str, Any]] = None


class DatasetField(DatasetFieldBase):
    """Complete dataset field model"""
    id: int
    dataset_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class DatasetBase(BaseModel):
    """Base model for datasets"""
    name: str
    description: Optional[str] = None
    status: DatasetStatus = DatasetStatus.DRAFT
    schema: Optional[Dict[str, Any]] = None
    sample_data: Optional[Dict[str, Any]] = None


class DatasetCreate(DatasetBase):
    """Model for creating a new dataset"""
    fields: Optional[List[DatasetFieldBase]] = None


class DatasetUpdate(BaseModel):
    """Model for updating a dataset"""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DatasetStatus] = None
    schema: Optional[Dict[str, Any]] = None
    sample_data: Optional[Dict[str, Any]] = None


class Dataset(DatasetBase):
    """Complete dataset model"""
    id: int
    tenant_id: Optional[str] = None
    fields: List[DatasetField] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


# Earnings Mapping Models
class EarningsCodeBase(BaseModel):
    """Base model for earnings codes"""
    code: str
    name: str
    description: Optional[str] = None
    destination_system: str
    is_overtime: bool = False
    attributes: Optional[Dict[str, Any]] = None


class EarningsCodeCreate(EarningsCodeBase):
    """Model for creating a new earnings code"""
    pass


class EarningsCodeUpdate(BaseModel):
    """Model for updating an earnings code"""
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    destination_system: Optional[str] = None
    is_overtime: Optional[bool] = None
    attributes: Optional[Dict[str, Any]] = None


class EarningsCode(EarningsCodeBase):
    """Complete earnings code model"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True


class EarningsMappingBase(BaseModel):
    """Base model for earnings mappings"""
    integration_id: int
    source_type: str
    earnings_code_id: int
    default_map: bool = False
    condition: Optional[str] = None
    dataset_id: Optional[int] = None


class EarningsMappingCreate(EarningsMappingBase):
    """Model for creating a new earnings mapping"""
    pass


class EarningsMappingUpdate(BaseModel):
    """Model for updating an earnings mapping"""
    source_type: Optional[str] = None
    earnings_code_id: Optional[int] = None
    default_map: Optional[bool] = None
    condition: Optional[str] = None
    dataset_id: Optional[int] = None


class EarningsMapping(EarningsMappingBase):
    """Complete earnings mapping model"""
    id: int
    created_at: datetime
    updated_at: datetime
    earnings_code: EarningsCode
    
    class Config:
        """Pydantic config"""
        from_attributes = True