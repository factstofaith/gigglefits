"""
MFA bypass feature

Revision ID: mfa_bypass
Revises: None
Create Date: 2025-04-03 01:02:38

Generated with docker-alembic-standardizer
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Table, Float
from sqlalchemy.sql import func
from datetime import datetime, timezone
import uuid
import enum

from db.base import Base
from utils.encryption.crypto import EncryptedString, EncryptedJSON

# revision identifiers, used by Alembic.
revision = '$REVISION'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
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
    

def downgrade() -> None:
    """
    Remove bypass_mfa field from User model.
    """
    # Drop the bypass_mfa column
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'bypass_mfa' in columns:
        op.drop_column('users', 'bypass_mfa')
        print("✅ Removed 'bypass_mfa' column from 'users' table")
    else:
        print("➡️ 'bypass_mfa' column does not exist in 'users' table")
