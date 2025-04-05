"""
SQLAlchemy database models
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Table, Float, Sequence, UniqueConstraint, ForeignKeyConstraint, event
from sqlalchemy.orm import relationship, backref, validates
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
from datetime import datetime, timezone
import enum
import uuid
import sqlalchemy as sa

from db.base import Base
from utils.encryption.crypto import EncryptedString, EncryptedJSON
from utils.helpers import generate_uid
from utils.error_handling.exceptions import ValidationError

# Many-to-many relationship table for tags
integration_tags = Table(
    'integration_tags',
    Base.metadata,
    Column('integration_id', Integer, ForeignKey('integrations.id', ondelete="CASCADE"), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete="CASCADE"), primary_key=True)
)

# Many-to-many relationship between applications and datasets
application_datasets = Table(
    'application_datasets',
    Base.metadata,
    Column('application_id', Integer, ForeignKey('applications.id', ondelete="CASCADE"), primary_key=True),
    Column('dataset_id', Integer, ForeignKey('datasets.id', ondelete="CASCADE"), primary_key=True)
)

# Many-to-many relationship between integrations and datasets
integration_datasets = Table(
    'integration_datasets',
    Base.metadata,
    Column('integration_id', Integer, ForeignKey('integrations.id', ondelete="CASCADE"), primary_key=True),
    Column('dataset_id', Integer, ForeignKey('datasets.id', ondelete="CASCADE"), primary_key=True)
)
class IntegrationType(str, enum.Enum):
    API = "API-based"
    FILE = "File-based"
    DATABASE = "Database"

class IntegrationHealth(str, enum.Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    ERROR = "error"

# Auth-related models
class LoginAttempt(Base):
    """Tracks login attempts for security monitoring and brute force protection"""
    __tablename__ = 'login_attempts'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(255), nullable=False, index=True)
    success = Column(Boolean, nullable=False, default=False)
    message = Column(String(255))
    timestamp = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    ip_address = Column(String(45))  # IPv6 addresses can be up to 45 chars

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class InvitationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted" 
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class UserAccountStatus(str, enum.Enum):
    ACTIVE = "active"
    DISABLED = "disabled"
    PENDING = "pending"

class AuthProvider(str, enum.Enum):
    LOCAL = "local"
    OFFICE365 = "office365"
    GMAIL = "gmail"

class IntegrationRunStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"

class DataType(str, enum.Enum):
    """Data types for dataset fields"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    OBJECT = "object"
    ARRAY = "array"

class DatasetStatus(str, enum.Enum):
    """Status of a dataset"""
    DRAFT = "draft"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"

class ApplicationType(str, enum.Enum):
    """Types of applications that can be integrated"""
    API = "api"
    FILE = "file"
    DATABASE = "database"
    CUSTOM = "custom"

class ApplicationStatus(str, enum.Enum):
    """Status of an application"""
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"

class Integration(Base):
    __tablename__ = "integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(Enum(IntegrationType), nullable=False)
    source = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    tenant_id = Column(String(50), nullable=True)
    owner_id = Column(String(50), nullable=True)
    health = Column(Enum(IntegrationHealth), nullable=False, default=IntegrationHealth.HEALTHY)
    schedule = Column(JSON, nullable=True)
    azure_blob_config = Column(EncryptedJSON, nullable=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_run_at = Column(DateTime, nullable=True)
    
    # Relationships
    field_mappings = relationship("FieldMapping", back_populates="integration", cascade="all, delete-orphan")
    runs = relationship("IntegrationRun", back_populates="integration", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=integration_tags, backref="integrations")
    webhooks = relationship("Webhook", back_populates="integration", cascade="all, delete-orphan")
    datasets = relationship("Dataset", secondary=integration_datasets, backref="integrations")
    application = relationship("Application", back_populates="integrations", cascade="all, delete-orphan")
    earnings_maps = relationship("IntegrationEarningsMap", back_populates="integration", cascade="all, delete-orphan")
    rosters = relationship("EmployeeRoster", back_populates="integration", cascade="all, delete-orphan")

    # Validation methods
    @validates('name')
    def validate_name(self, key, value):
        """Validate name field"""
        if value is None:
            raise ValidationError(f"{key} cannot be None")
        return value
    
    @validates('type')
    def validate_type(self, key, value):
        """Validate type field"""
        if value is None:
            raise ValidationError(f"{key} cannot be None")
        return value
    
    @validates('source')
    def validate_source(self, key, value):
        """Validate source field"""
        if value is None:
            raise ValidationError(f"{key} cannot be None")
        return value
    
    @validates('destination')
    def validate_destination(self, key, value):
        """Validate destination field"""
        if value is None:
            raise ValidationError(f"{key} cannot be None")
        return value
    
    @validates('health')
    def validate_health(self, key, value):
        """Validate health field"""
        if value is None:
            raise ValidationError(f"{key} cannot be None")
        return value
    
class Application(Base):
    """Applications that can be integrated with the platform"""
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(Enum(ApplicationType), nullable=False)
    description = Column(Text, nullable=True)
    auth_type = Column(String(50), default="none")  # none, api_key, oauth2, basic, custom
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.DRAFT)
    is_public = Column(Boolean, default=False)
    connection_parameters = Column(EncryptedJSON, nullable=True)  # Configuration parameters (encrypted)
    documentation_url = Column(String(255), nullable=True)
    support_url = Column(String(255), nullable=True)
    tenant_id = Column(String(50), nullable=True)  # Creator tenant
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    datasets = relationship("Dataset", secondary=application_datasets, backref="applications")
    integrations = relationship("Integration", back_populates="application", cascade="all, delete-orphan")
    webhooks = relationship("Webhook", back_populates="application", cascade="all, delete-orphan")
    tenants = relationship("Tenant", secondary="tenant_application_associations", 
                         back_populates="applications")

class Dataset(Base):
    """Datasets represent data structures that can be mapped between applications"""
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(DatasetStatus), nullable=False, default=DatasetStatus.DRAFT)
    schema = Column(JSON, nullable=True)  # JSON Schema definition
    sample_data = Column(JSON, nullable=True)  # Sample data for preview
    tenant_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    fields = relationship("DatasetField", back_populates="dataset", cascade="all, delete-orphan")
    tenants = relationship("Tenant", secondary="tenant_dataset_associations", 
                         back_populates="datasets")

class DatasetField(Base):
    """Fields within a dataset"""
    __tablename__ = "dataset_fields"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    data_type = Column(Enum(DataType), nullable=False, default=DataType.STRING)
    is_required = Column(Boolean, default=False)
    is_primary_key = Column(Boolean, default=False)
    format = Column(String(50), nullable=True)  # Format specification for the field
    constraints = Column(JSON, nullable=True)  # Validation constraints
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    dataset = relationship("Dataset", back_populates="fields", cascade="all, delete-orphan")

class FieldMapping(Base):
    __tablename__ = "field_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    source_field = Column(String(100), nullable=False)
    destination_field = Column(String(100), nullable=False)
    transformation = Column(String(50), default="direct")
    transform_params = Column(JSON, nullable=True)
    required = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    integration = relationship("Integration", back_populates="field_mappings", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    tenant_id = Column(String(50), nullable=True)
    provider = Column(String(50), nullable=True)
    hashed_password = Column(EncryptedString, nullable=True)  # NULL for external auth (encrypted)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # New fields for the invitation system
    zoho_account = Column(String(100), nullable=True)
    client_company = Column(String(100), nullable=True)
    contact_information = Column(JSON, nullable=True)
    invite_id = Column(String(36), ForeignKey("invitations.id"), nullable=True)
    account_status = Column(Enum(UserAccountStatus), default=UserAccountStatus.ACTIVE)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.LOCAL)
    last_login = Column(DateTime, nullable=True)
    login_attempts = Column(Integer, default=0)
    bypass_mfa = Column(Boolean, default=False)  # Added for admin accounts to bypass MFA
    
    # Relationships
    mfa = relationship("UserMFA", back_populates="user", uselist=False, cascade="all, delete-orphan")
    login_history = relationship("UserLoginHistory", back_populates="user", cascade="all, delete-orphan")
    created_invitations = relationship("Invitation", foreign_keys="Invitation.created_by", backref="creator")
    document_views = relationship("DocumentView", back_populates="user", cascade="all, delete-orphan")

class IntegrationRun(Base):
    __tablename__ = "integration_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    status = Column(Enum(IntegrationRunStatus), nullable=False)
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)
    records_processed = Column(Integer, nullable=True)
    warnings = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    
    # Relationships
    integration = relationship("Integration", back_populates="runs", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200), nullable=True)


class WebhookEventType(str, enum.Enum):
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


class WebhookStatus(str, enum.Enum):
    """Status of a webhook"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    FAILED = "failed"  # Multiple delivery failures


class Webhook(Base):
    """Webhook configuration for sending notifications to external systems"""
    __tablename__ = "webhooks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    
    # Authentication
    auth_type = Column(String(50), default="none")  # none, basic, bearer, custom
    auth_credentials = Column(EncryptedJSON, nullable=True)  # Encrypted auth credentials
    
    # Headers
    headers = Column(JSON, nullable=True)  # Custom HTTP headers
    
    # Events and filtering
    events = Column(JSON, nullable=False)  # List of WebhookEventType values
    filters = Column(JSON, nullable=True)  # JSON object with filter criteria
    
    # Related resources
    integration_id = Column(Integer, ForeignKey("integrations.id", ondelete="CASCADE"), nullable=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True)
    tenant_id = Column(String(50), nullable=True)
    owner_id = Column(String(50), nullable=True)
    
    # Security
    secret_key = Column(EncryptedString, nullable=True)  # For signature verification
    
    # Status and configuration
    status = Column(Enum(WebhookStatus), nullable=False, default=WebhookStatus.ACTIVE)
    is_secure = Column(Boolean, default=True)  # Use HTTPS only
    timeout_seconds = Column(Integer, default=5)
    retry_count = Column(Integer, default=3)
    retry_interval_seconds = Column(Integer, default=60)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_triggered_at = Column(DateTime, nullable=True)
    
    # Relationships
    integration = relationship("Integration", back_populates="webhooks", cascade="all, delete-orphan")
    application = relationship("Application", back_populates="webhooks", cascade="all, delete-orphan")
    webhook_logs = relationship("WebhookLog", back_populates="webhook", cascade="all, delete-orphan")


class WebhookLog(Base):
    """Log of webhook delivery attempts"""
    __tablename__ = "webhook_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    webhook_id = Column(Integer, ForeignKey("webhooks.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)
    payload = Column(JSON, nullable=False)
    response_status_code = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    is_success = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    attempt_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    webhook = relationship("Webhook", back_populates="webhook_logs", cascade="all, delete-orphan")


# Employee Earnings Mapping Models

class EmployeeRoster(Base):
    """Employee roster for earnings mapping"""
    __tablename__ = "employee_rosters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    source_id = Column(String(50), nullable=True)  # ID of the source system
    destination_id = Column(String(50), nullable=True)  # ID of the destination HCM system
    description = Column(Text, nullable=True)
    tenant_id = Column(String(50), nullable=True)
    owner_id = Column(String(50), nullable=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=True)  # Optional integration association
    last_sync_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    employees = relationship("Employee", back_populates="roster", cascade="all, delete-orphan")
    earnings_maps = relationship("EarningsMap", back_populates="roster", cascade="all, delete-orphan")
    business_rules = relationship("BusinessRule", back_populates="roster", cascade="all, delete-orphan")
    integration = relationship("Integration", back_populates="rosters", cascade="all, delete-orphan")

class Employee(Base):
    """Employee record for earnings mapping"""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    roster_id = Column(Integer, ForeignKey("employee_rosters.id", ondelete="CASCADE"), nullable=False)
    external_id = Column(String(50), nullable=False)  # External employee ID from source system
    source_id = Column(String(50), nullable=False)  # ID in source system
    destination_id = Column(String(50), nullable=True)  # ID in destination system
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    attributes = Column(JSON, nullable=True)  # Additional employee attributes
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    roster = relationship("EmployeeRoster", back_populates="employees", cascade="all, delete-orphan")
    earnings = relationship("EmployeeEarnings", back_populates="employee", cascade="all, delete-orphan")

class EmployeeEarnings(Base):
    """Employee earnings record"""
    __tablename__ = "employee_earnings"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), nullable=False)  # Source earnings type
    amount = Column(String(50), nullable=True)  # Amount as string to preserve precision
    hours = Column(String(50), nullable=True)  # Hours as string to preserve precision
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    attributes = Column(JSON, nullable=True)  # Additional earnings attributes
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    employee = relationship("Employee", back_populates="earnings", cascade="all, delete-orphan")

class EarningsCode(Base):
    """Earnings code definition"""
    __tablename__ = "earnings_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    destination_system = Column(String(50), nullable=False)  # HCM system identifier
    is_overtime = Column(Boolean, default=False)
    attributes = Column(JSON, nullable=True)  # Additional code attributes
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    earnings_maps = relationship("EarningsMap", back_populates="earnings_code", cascade="all, delete-orphan")
    integration_earnings_maps = relationship("IntegrationEarningsMap", back_populates="earnings_code", cascade="all, delete-orphan")

class EarningsMap(Base):
    """Mapping between source earnings and destination earnings codes for employee rosters"""
    __tablename__ = "earnings_maps"
    
    id = Column(Integer, primary_key=True, index=True)
    roster_id = Column(Integer, ForeignKey("employee_rosters.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), nullable=False)  # Source earnings type
    earnings_code_id = Column(Integer, ForeignKey("earnings_codes.id"), nullable=False)
    default_map = Column(Boolean, default=False)  # Is this the default mapping
    condition = Column(Text, nullable=True)  # Condition expression for conditional mapping
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    roster = relationship("EmployeeRoster", back_populates="earnings_maps", cascade="all, delete-orphan")
    earnings_code = relationship("EarningsCode", back_populates="earnings_maps", cascade="all, delete-orphan")

class IntegrationEarningsMap(Base):
    """Mapping between source earnings and destination earnings codes for integrations"""
    __tablename__ = "integration_earnings_maps"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), nullable=False)  # Source earnings type
    earnings_code_id = Column(Integer, ForeignKey("earnings_codes.id"), nullable=False)
    default_map = Column(Boolean, default=False)  # Is this the default mapping
    condition = Column(Text, nullable=True)  # Condition expression for conditional mapping
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)  # Optional dataset association
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    integration = relationship("Integration", back_populates="earnings_maps", cascade="all, delete-orphan")
    earnings_code = relationship("EarningsCode", back_populates="integration_earnings_maps", cascade="all, delete-orphan")
    dataset = relationship("Dataset", back_populates="", cascade="all, delete-orphan")


class Tenant(Base):
    """Tenant model for multi-tenancy support"""
    __tablename__ = "tenants"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="active")  # active, inactive, suspended
    tier = Column(String(20), default="standard")  # standard, premium, enterprise
    settings = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    applications = relationship("Application", secondary="tenant_application_associations", 
                               back_populates="tenants")
    datasets = relationship("Dataset", secondary="tenant_dataset_associations", 
                          back_populates="tenants")


class TenantApplicationAssociation(Base):
    """Association between tenants and applications"""
    __tablename__ = "tenant_application_associations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    is_active = Column(Boolean, default=True)
    granted_at = Column(DateTime, nullable=False)
    granted_by = Column(String(50), nullable=False)
    
    # Ensure unique constraint
    __table_args__ = (
        sa.UniqueConstraint('tenant_id', 'application_id', name='uq_tenant_application'),
    )


class TenantDatasetAssociation(Base):
    """Association between tenants and datasets"""
    __tablename__ = "tenant_dataset_associations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    is_active = Column(Boolean, default=True)
    granted_at = Column(DateTime, nullable=False)
    granted_by = Column(String(50), nullable=False)
    
    # Ensure unique constraint
    __table_args__ = (
        sa.UniqueConstraint('tenant_id', 'dataset_id', name='uq_tenant_dataset'),
    )

class BusinessRule(Base):
    """Business logic rules for custom earnings calculations"""
    __tablename__ = "business_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    roster_id = Column(Integer, ForeignKey("employee_rosters.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    rule_type = Column(String(50), nullable=False)  # Type of rule: overtime, premium, etc.
    rule_definition = Column(JSON, nullable=False)  # Definition of the rule in structured format
    earnings_code_id = Column(Integer, ForeignKey("earnings_codes.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    roster = relationship("EmployeeRoster", back_populates="business_rules", cascade="all, delete-orphan")
    earnings_code = relationship("EarningsCode", back_populates="", cascade="all, delete-orphan")


# User Invitation System Models

class Invitation(Base):
    """User invitation model"""
    __tablename__ = "invitations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(100), nullable=False)
    token = Column(String(100), nullable=False, unique=True)
    expiration_date = Column(DateTime, nullable=False)
    created_by = Column(String(50), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(InvitationStatus), nullable=False, default=InvitationStatus.PENDING)
    role = Column(String(20), nullable=False)  # ADMIN or USER
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    accepted_at = Column(DateTime, nullable=True)
    reminder_sent_at = Column(DateTime, nullable=True)
    reminder_count = Column(Integer, default=0)
    custom_message = Column(Text, nullable=True)
    
    # Relationship to user who accepted invitation
    accepted_by = relationship("User", foreign_keys=[User.invite_id], backref="invitation", uselist=False)


class UserMFA(Base):
    """User MFA settings"""
    __tablename__ = "user_mfa"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    mfa_enabled = Column(Boolean, default=False)
    mfa_verified = Column(Boolean, default=False)
    mfa_secret = Column(EncryptedString, nullable=True)  # Encrypted MFA secret
    mfa_recovery_codes = Column(EncryptedJSON, nullable=True)  # Encrypted recovery codes
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_verified = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="mfa", cascade="all, delete-orphan")


class UserLoginHistory(Base):
    """User login history"""
    __tablename__ = "user_login_history"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String(45), nullable=True)  # IPv6 can be up to 45 chars
    user_agent = Column(String(255), nullable=True)
    login_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    success = Column(Boolean, default=True)
    failure_reason = Column(String(100), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="login_history", cascade="all, delete-orphan")


class EmailConfiguration(Base):
    """Email configuration settings"""
    __tablename__ = "email_configuration"
    
    id = Column(Integer, primary_key=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, unique=True)
    provider = Column(String(50), nullable=False, default="office365")  # office365, smtp
    settings = Column(EncryptedJSON, nullable=False)  # Connection settings (encrypted)
    from_email = Column(String(100), nullable=False)
    from_name = Column(String(100), nullable=False)
    reply_to = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    tenant = relationship("Tenant", backref="email_configuration")


class EmailTemplate(Base):
    """Email template model"""
    __tablename__ = "email_templates"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    html_content = Column(Text, nullable=False)
    text_content = Column(Text, nullable=False)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    tenant = relationship("Tenant", backref="email_templates")


class MFASettings(Base):
    """MFA settings for tenants"""
    __tablename__ = "mfa_settings"
    
    id = Column(Integer, primary_key=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, unique=True)
    enforcement_type = Column(String(20), nullable=False, default="optional")  # 'optional', 'required', 'required_for_admins'
    grace_period_days = Column(Integer, default=7)
    totp_enabled = Column(Boolean, default=True)
    email_enabled = Column(Boolean, default=False)
    sms_enabled = Column(Boolean, default=False)
    recovery_codes_enabled = Column(Boolean, default=True)
    recovery_codes_count = Column(Integer, default=10)
    recovery_code_length = Column(Integer, default=8)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    tenant = relationship("Tenant", backref="mfa_settings")


class DocumentView(Base):
    """Records of document views for analytics"""
    __tablename__ = "document_views"
    
    id = Column(Integer, primary_key=True)
    document_id = Column(String(255), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    feedback = Column(String(50), nullable=True)  # 'helpful', 'not-helpful', etc.
    doc_metadata = Column(JSON, nullable=True)  # Renamed from 'metadata' to avoid SQLAlchemy reserved name
    
    # Relationships
    user = relationship("User", back_populates="document_views", cascade="all, delete-orphan")