"""
Integration Models

This module defines the database models for integrations in the TAP platform.
"""

from enum import Enum
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator


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
    auth_method: str = "connectionString"
    connection_string: Optional[str] = None
    account_name: Optional[str] = None
    account_key: Optional[str] = None
    sas_token: Optional[str] = None
    use_managed_identity: bool = False
    container_name: str
    file_pattern: str = "*.csv"
    path: Optional[str] = None
    create_container_if_not_exists: bool = False


class ScheduleConfig(BaseModel):
    """Configuration for integration schedules"""
    type: ScheduleType = ScheduleType.ON_DEMAND
    cron_expression: Optional[str] = None
    timezone: str = "UTC"
    effective_date: Optional[datetime] = None
    description: Optional[str] = None
    
    @validator('cron_expression')
    def validate_cron_expression(cls, v, values):
        """Validate cron expression if schedule type is custom"""
        if values.get('type') == ScheduleType.CUSTOM and not v:
            raise ValueError('Cron expression is required for custom schedules')
        return v


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
    azure_blob_config: Optional[AzureBlobConfig] = None
    created_at: datetime
    updated_at: datetime
    last_run_at: Optional[datetime] = None
    
    class Config:
        """Pydantic config"""
        orm_mode = True


class FieldMappingBase(BaseModel):
    """Base model for field mapping data"""
    integration_id: int
    source_field: str
    destination_field: str
    transformation: Optional[str] = "direct"
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
    required: Optional[bool] = None
    description: Optional[str] = None


class FieldMapping(FieldMappingBase):
    """Complete field mapping model with system fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        orm_mode = True


class UserRole(str, Enum):
    """Enum for user roles"""
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
        orm_mode = True


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
    integration_id: int
    status: IntegrationRunStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    records_processed: Optional[int] = None
    warnings: Optional[List[str]] = None
    error: Optional[str] = None
    
    class Config:
        """Pydantic config"""
        orm_mode = True