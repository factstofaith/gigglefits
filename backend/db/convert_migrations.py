#!/usr/bin/env python3
"""
Migration Conversion Script

This script analyzes existing migrations and creates Alembic migrations
that represent the current database schema.
"""

import os
import sys
import argparse
import logging
import importlib.util
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

# Add the parent directory to the path for imports
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("convert_migrations")

def load_migration(file_path: str) -> Any:
    """Load a migration module from file path"""
    spec = importlib.util.spec_from_file_location("migration", file_path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    return migration

def analyze_migrations(migrations_dir: str) -> List[Dict[str, Any]]:
    """Analyze existing migrations and return information about them"""
    migrations = []
    
    # Get migration files
    migration_files = []
    for f in os.listdir(migrations_dir):
        if f.endswith('.py') and not f.startswith('__'):
            migration_files.append(f)
    
    # Sort migration files - we expect them to have numeric prefixes
    migration_files.sort()
    
    # Load and analyze each migration
    for migration_file in migration_files:
        migration_path = os.path.join(migrations_dir, migration_file)
        logger.info(f"Analyzing migration: {migration_file}")
        
        try:
            # Load the migration
            migration = load_migration(migration_path)
            
            # Determine the migration type
            migration_type = None
            if hasattr(migration, 'upgrade'):
                migration_type = "upgrade"
            elif hasattr(migration, 'run_migration'):
                migration_type = "run_migration"
            elif hasattr(migration, 'migrate'):
                migration_type = "migrate"
            else:
                logger.warning(f"Migration {migration_file} has no valid migration method")
                continue
            
            # Extract migration name from the file name
            # Assuming format like "01_initial_schema.py"
            name_parts = migration_file.split('_', 1)
            if len(name_parts) > 1:
                sequence = name_parts[0]
                name = name_parts[1].replace('.py', '')
            else:
                sequence = "00"
                name = migration_file.replace('.py', '')
            
            # Extract the migration function
            migration_func = None
            if migration_type == "upgrade":
                migration_func = migration.upgrade
            elif migration_type == "run_migration":
                migration_func = migration.run_migration
            elif migration_type == "migrate":
                migration_func = migration.migrate
            
            # Add migration information
            migrations.append({
                "file": migration_file,
                "path": migration_path,
                "type": migration_type,
                "sequence": sequence,
                "name": name,
                "module": migration,
                "function": migration_func,
                "has_downgrade": hasattr(migration, 'downgrade')
            })
            
            logger.info(f"Successfully analyzed migration: {sequence}_{name} ({migration_type})")
        except Exception as e:
            logger.error(f"Error analyzing migration {migration_file}: {str(e)}")
    
    return migrations

def create_alembic_migration(migrations: List[Dict[str, Any]], output_dir: str):
    """Create an Alembic migration from the analyzed migrations"""
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Get the latest migration file in the output directory
    migration_files = []
    for f in os.listdir(output_dir):
        if f.endswith('.py') and not f.startswith('__'):
            migration_files.append(f)
    
    # If no migrations exist, create the initial migration
    if not migration_files:
        # Generate a template for the initial migration
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        migration_name = "initial_schema"
        migration_file = f"{timestamp}_{migration_name}.py"
        migration_path = os.path.join(output_dir, migration_file)
        
        with open(migration_path, "w") as f:
            f.write(f"""\"\"\"
{migration_name}

Revision ID: {timestamp}
Revises: 
Create Date: {datetime.now().isoformat()}

This migration represents the initial schema created from legacy migrations.
\"\"\"
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime
import uuid
import enum

# Add any custom types or imports needed for your models
from utils.encryption.crypto import EncryptedString, EncryptedJSON

# revision identifiers
revision = '{timestamp}'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    \"\"\"
    Creates the initial database schema based on the existing models.
    
    This migration combines all previous migrations from the legacy system:
    - 01_initial_schema.py
    - 02_schema_updates.py
    - etc.
    \"\"\"
    # TODO: Implement the upgrade method to create all tables
    # Copy the schema creation code from your models
    # Include all table creation operations
    
    # Example:
    # op.create_table('users',
    #     sa.Column('id', sa.String(50), primary_key=True),
    #     sa.Column('username', sa.String(50), unique=True, nullable=False),
    #     sa.Column('email', sa.String(100), unique=True, nullable=False),
    #     # ... more columns
    # )

def downgrade():
    \"\"\"
    Removes all tables created in the upgrade method.
    
    This should drop all tables in the reverse order of their creation
    to handle foreign key dependencies properly.
    \"\"\"
    # TODO: Implement the downgrade method to drop all tables
    # Include all table drop operations in reverse order
    
    # Example:
    # op.drop_table('users')
""")
        
        logger.info(f"Created initial migration template: {migration_path}")
        logger.info("Please update the migration file with the actual schema creation code")
        
        # Create templates for subsequent migrations
        seq = 1
        for migration in migrations[1:]:
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            migration_name = migration["name"]
            migration_file = f"{timestamp}_{migration_name}.py"
            migration_path = os.path.join(output_dir, migration_file)
            
            with open(migration_path, "w") as f:
                f.write(f"""\"\"\"
{migration_name}

Revision ID: {timestamp}
Revises: {{previous_revision}}
Create Date: {datetime.now().isoformat()}

This migration corresponds to the legacy migration: {migration["file"]}
\"\"\"
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime
import uuid
import enum

# revision identifiers
revision = '{timestamp}'
down_revision = '{{previous_revision}}'  # TODO: Replace with previous revision ID
branch_labels = None
depends_on = None

def upgrade():
    \"\"\"
    Implements migration {migration["sequence"]}_{migration["name"]}
    
    Migration type: {migration["type"]}
    \"\"\"
    # TODO: Implement the upgrade method based on the legacy migration
    pass

def downgrade():
    \"\"\"
    Reverses changes made in the upgrade method.
    \"\"\"
    # TODO: Implement the downgrade method to reverse the changes
    pass
""")
            
            logger.info(f"Created migration template: {migration_path}")
            seq += 1
    
    logger.info("Migration templates created successfully!")
    logger.info("You need to update the migration files with the actual schema changes.")
    logger.info("Don't forget to update the down_revision values to maintain the correct migration sequence.")

def main():
    parser = argparse.ArgumentParser(description="Convert existing migrations to Alembic format")
    parser.add_argument(
        "--migrations-dir", 
        default=None,
        help="Directory containing existing migrations"
    )
    parser.add_argument(
        "--output-dir", 
        default=None,
        help="Directory to write Alembic migrations"
    )
    args = parser.parse_args()
    
    # Determine migration directories
    project_dir = Path(__file__).resolve().parent.parent
    
    if args.migrations_dir:
        migrations_dir = args.migrations_dir
    else:
        migrations_dir = os.path.join(project_dir, "db", "migrations")
    
    if args.output_dir:
        output_dir = args.output_dir
    else:
        output_dir = os.path.join(project_dir, "db", "alembic", "versions")
    
    logger.info(f"Analyzing migrations in: {migrations_dir}")
    logger.info(f"Output directory: {output_dir}")
    
    # Analyze migrations
    migrations = analyze_migrations(migrations_dir)
    
    if not migrations:
        logger.error("No migrations found to convert")
        return 1
    
    logger.info(f"Found {len(migrations)} migrations")
    
    # Create Alembic migrations
    create_alembic_migration(migrations, output_dir)
    
    logger.info("Migration conversion completed")
    return 0

if __name__ == "__main__":
    sys.exit(main())