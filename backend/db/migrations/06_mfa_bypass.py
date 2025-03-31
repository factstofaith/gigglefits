"""
Migration 06 - Add bypass_mfa field to User model
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import from the parent module
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import Table, Column, Boolean, MetaData
from db.base import engine

def run_migration():
    """
    Add bypass_mfa field to User model.
    This allows administrators to bypass MFA for development and testing purposes.
    """
    metadata = MetaData()
    users = Table('users', metadata, autoload_with=engine)
    
    # Check if bypass_mfa column already exists
    if 'bypass_mfa' not in [c.name for c in users.columns]:
        print("Adding 'bypass_mfa' column to 'users' table...")
        # Add bypass_mfa column
        conn = engine.connect()
        conn.execute(f"ALTER TABLE users ADD COLUMN bypass_mfa BOOLEAN DEFAULT FALSE")
        conn.close()
        print("✅ Added 'bypass_mfa' column to 'users' table")
    else:
        print("➡️ 'bypass_mfa' column already exists in 'users' table")

if __name__ == "__main__":
    run_migration()