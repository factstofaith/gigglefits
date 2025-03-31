"""
TenantModel Migration

Tenant model with multi-tenancy support
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime

# revision identifiers
revision = '8fc022f0d79c'
down_revision = 'initial_schema'
branch_labels = None
depends_on = None

def upgrade():
    """
    Creates tables and relationships for the TenantModel component.
    """
    # Create tables
    op.create_table(
        'tenantmodel',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow),
        sa.Column('tenant_id', sa.String(50), sa.ForeignKey('tenants.id'), nullable=True)
    )
    
    # Add additional tables and relationships as needed
    # ...

def downgrade():
    """
    Removes all tables created in the upgrade method.
    """
    op.drop_table('tenantmodel')
    # Drop additional tables if needed
    # ...
