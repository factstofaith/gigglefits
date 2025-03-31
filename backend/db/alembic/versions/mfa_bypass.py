"""MFA bypass feature

Revision ID: mfa_bypass
Revises: initial_schema
Create Date: 2025-03-26

This migration corresponds to the legacy migration: 06_mfa_bypass.py
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'mfa_bypass'
down_revision = 'initial_schema'
branch_labels = None
depends_on = None

def upgrade():
    """
    Add bypass_mfa field to User model.
    This allows administrators to bypass MFA for development and testing purposes.
    """
    # Check if bypass_mfa column already exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'bypass_mfa' not in columns:
        op.add_column('users', sa.Column('bypass_mfa', sa.Boolean(), default=False))
        print("✅ Added 'bypass_mfa' column to 'users' table")
    else:
        print("➡️ 'bypass_mfa' column already exists in 'users' table")

def downgrade():
    """
    Remove bypass_mfa field from User model.
    """
    # Check if bypass_mfa column exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'bypass_mfa' in columns:
        op.drop_column('users', 'bypass_mfa')
        print("✅ Removed 'bypass_mfa' column from 'users' table")
    else:
        print("➡️ 'bypass_mfa' column doesn't exist in 'users' table")