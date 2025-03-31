"""Initial schema migration

Revision ID: initial_schema
Revises: 
Create Date: 2025-03-26

This migration represents the initial schema created from legacy migrations.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime
import enum

# Add custom types or imports needed for models
try:
    from utils.encryption.crypto import EncryptedString, EncryptedJSON
except ImportError:
    # Create stub classes for migration
    class EncryptedString(sa.TypeDecorator):
        impl = sa.String
        cache_ok = True
    
    class EncryptedJSON(sa.TypeDecorator):
        impl = sa.JSON
        cache_ok = True

# revision identifiers
revision = 'initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    """
    Creates the initial database schema based on the existing models.
    
    This migration combines all previous migrations from the legacy system:
    - 01_initial_schema.py
    - 02_schema_updates.py
    - And others
    """
    # Create tables
    
    # Integration tags association table
    op.create_table(
        'integration_tags',
        sa.Column('integration_id', sa.Integer(), sa.ForeignKey('integrations.id', ondelete="CASCADE"), primary_key=True),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('tags.id', ondelete="CASCADE"), primary_key=True)
    )
    
    # Application datasets association table
    op.create_table(
        'application_datasets',
        sa.Column('application_id', sa.Integer(), sa.ForeignKey('applications.id', ondelete="CASCADE"), primary_key=True),
        sa.Column('dataset_id', sa.Integer(), sa.ForeignKey('datasets.id', ondelete="CASCADE"), primary_key=True)
    )
    
    # Integration datasets association table
    op.create_table(
        'integration_datasets',
        sa.Column('integration_id', sa.Integer(), sa.ForeignKey('integrations.id', ondelete="CASCADE"), primary_key=True),
        sa.Column('dataset_id', sa.Integer(), sa.ForeignKey('datasets.id', ondelete="CASCADE"), primary_key=True)
    )
    
    # Tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(50), unique=True, nullable=False),
        sa.Column('description', sa.String(200), nullable=True)
    )
    
    # Tenants table
    op.create_table(
        'tenants',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), default="active"),
        sa.Column('tier', sa.String(20), default="standard"),
        sa.Column('settings', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    )
    
    # Applications table
    op.create_table(
        'applications',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('auth_type', sa.String(50), default="none"),
        sa.Column('status', sa.String(50), nullable=False, default="draft"),
        sa.Column('is_public', sa.Boolean(), default=False),
        sa.Column('connection_parameters', sa.JSON(), nullable=True),
        sa.Column('documentation_url', sa.String(255), nullable=True),
        sa.Column('support_url', sa.String(255), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    )
    
    # Datasets table
    op.create_table(
        'datasets',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, default="draft"),
        sa.Column('schema', sa.JSON(), nullable=True),
        sa.Column('sample_data', sa.JSON(), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    )
    
    # Dataset fields table
    op.create_table(
        'dataset_fields',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('dataset_id', sa.Integer(), sa.ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('data_type', sa.String(50), nullable=False, default="string"),
        sa.Column('is_required', sa.Boolean(), default=False),
        sa.Column('is_primary_key', sa.Boolean(), default=False),
        sa.Column('format', sa.String(50), nullable=True),
        sa.Column('constraints', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    )
    
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('username', sa.String(50), unique=True, nullable=False),
        sa.Column('email', sa.String(100), unique=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, default="user"),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('provider', sa.String(50), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('zoho_account', sa.String(100), nullable=True),
        sa.Column('client_company', sa.String(100), nullable=True),
        sa.Column('contact_information', sa.JSON(), nullable=True),
        sa.Column('invite_id', sa.String(36), sa.ForeignKey("invitations.id"), nullable=True),
        sa.Column('account_status', sa.String(50), default="active"),
        sa.Column('auth_provider', sa.String(50), default="local"),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('login_attempts', sa.Integer(), default=0),
        sa.Column('bypass_mfa', sa.Boolean(), default=False)
    )
    
    # Integrations table
    op.create_table(
        'integrations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('source', sa.String(200), nullable=False),
        sa.Column('destination', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('owner_id', sa.String(50), nullable=True),
        sa.Column('health', sa.String(50), nullable=False, default="healthy"),
        sa.Column('schedule', sa.JSON(), nullable=True),
        sa.Column('azure_blob_config', sa.JSON(), nullable=True),
        sa.Column('application_id', sa.Integer(), sa.ForeignKey("applications.id"), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow),
        sa.Column('last_run_at', sa.DateTime(), nullable=True)
    )
    
    # Field mappings table
    op.create_table(
        'field_mappings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('integration_id', sa.Integer(), sa.ForeignKey("integrations.id"), nullable=False),
        sa.Column('source_field', sa.String(100), nullable=False),
        sa.Column('destination_field', sa.String(100), nullable=False),
        sa.Column('transformation', sa.String(50), default="direct"),
        sa.Column('transform_params', sa.JSON(), nullable=True),
        sa.Column('required', sa.Boolean(), default=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    )
    
    # Integration runs table
    op.create_table(
        'integration_runs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('integration_id', sa.Integer(), sa.ForeignKey("integrations.id"), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('start_time', sa.DateTime(), default=datetime.utcnow),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('records_processed', sa.Integer(), nullable=True),
        sa.Column('warnings', sa.JSON(), nullable=True),
        sa.Column('error', sa.Text(), nullable=True)
    )
    
    # Webhooks table
    op.create_table(
        'webhooks',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('auth_type', sa.String(50), default="none"),
        sa.Column('auth_credentials', sa.JSON(), nullable=True),
        sa.Column('headers', sa.JSON(), nullable=True),
        sa.Column('events', sa.JSON(), nullable=False),
        sa.Column('filters', sa.JSON(), nullable=True),
        sa.Column('integration_id', sa.Integer(), sa.ForeignKey("integrations.id", ondelete="CASCADE"), nullable=True),
        sa.Column('application_id', sa.Integer(), sa.ForeignKey("applications.id", ondelete="CASCADE"), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('owner_id', sa.String(50), nullable=True),
        sa.Column('secret_key', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, default="active"),
        sa.Column('is_secure', sa.Boolean(), default=True),
        sa.Column('timeout_seconds', sa.Integer(), default=5),
        sa.Column('retry_count', sa.Integer(), default=3),
        sa.Column('retry_interval_seconds', sa.Integer(), default=60),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow),
        sa.Column('last_triggered_at', sa.DateTime(), nullable=True)
    )
    
    # Webhook logs table
    op.create_table(
        'webhook_logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('webhook_id', sa.Integer(), sa.ForeignKey("webhooks.id", ondelete="CASCADE"), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('response_status_code', sa.Integer(), nullable=True),
        sa.Column('response_body', sa.Text(), nullable=True),
        sa.Column('is_success', sa.Boolean(), default=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('attempt_count', sa.Integer(), default=1),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('completed_at', sa.DateTime(), nullable=True)
    )
    
    # Add additional tables and relationships as needed

def downgrade():
    """
    Removes all tables created in the upgrade method.
    
    This drops all tables in the reverse order of their creation
    to handle foreign key dependencies properly.
    """
    # Drop tables in reverse order to handle dependencies
    op.drop_table('webhook_logs')
    op.drop_table('webhooks')
    op.drop_table('integration_runs')
    op.drop_table('field_mappings')
    op.drop_table('integration_datasets')
    op.drop_table('integration_tags')
    op.drop_table('integrations')
    op.drop_table('users')
    op.drop_table('dataset_fields')
    op.drop_table('application_datasets')
    op.drop_table('datasets')
    op.drop_table('applications')
    op.drop_table('tenants')
    op.drop_table('tags')