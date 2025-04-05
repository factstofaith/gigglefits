"""
Migration 06 - Add bypass_mfa field to User model
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import from the parent module
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import Table, Column, Boolean, MetaData, inspect
from db.base import get_engine

def run_migration(db_url=None):
    """
    Add bypass_mfa field to User model.
    This allows administrators to bypass MFA for development and testing purposes.
    
    Args:
        db_url: Optional database URL (ignored, we use get_engine instead)
    """
    engine = get_engine()
    metadata = MetaData()
    
    # Check if users table exists
    try:
        inspector = inspect(engine)
        if 'users' not in inspector.get_table_names():
            print("⚠️ 'users' table does not exist, skipping migration")
            return
            
        # Table exists, check if bypass_mfa column already exists
        users = Table('users', metadata, autoload_with=engine)
        
        if 'bypass_mfa' not in [c.name for c in users.columns]:
            print("Adding 'bypass_mfa' column to 'users' table...")
            # Add bypass_mfa column
            conn = engine.connect()
            conn.execute(f"ALTER TABLE users ADD COLUMN bypass_mfa BOOLEAN DEFAULT FALSE")
            conn.close()
            print("✅ Added 'bypass_mfa' column to 'users' table")
        else:
            print("➡️ 'bypass_mfa' column already exists in 'users' table")
    except Exception as e:
        print(f"⚠️ Error checking or modifying 'users' table: {e}")
        # Don't raise the exception to allow other migrations to proceed

if __name__ == "__main__":
    run_migration()