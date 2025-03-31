#!/usr/bin/env python
"""
Database Migration Runner

This script runs database migrations in sequence to ensure
the database schema is up to date.
"""

import os
import importlib.util
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get database URL from environment or use default for local development
# Use SQLite for local testing
DB_URL = os.environ.get('DATABASE_URL', 'sqlite:///./tap_integration.db')

def load_migration(file_path):
    """Load a migration module from file path"""
    spec = importlib.util.spec_from_file_location("migration", file_path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    return migration

def run_migrations():
    """Run all migrations in sequence"""
    engine = create_engine(DB_URL)
    
    # Create database if it doesn't exist
    if not database_exists(engine.url):
        create_database(engine.url)
        logger.info(f"Created database at {DB_URL}")
    
    # Create session
    Session = sessionmaker(bind=engine)
    db_session = Session()
    
    # Get migration directory
    migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    
    # Get migration files and sort them
    migration_files = [f for f in os.listdir(migrations_dir) 
                     if f.endswith('.py') and not f.startswith('__')]
    migration_files.sort()
    
    # Apply each migration
    for migration_file in migration_files:
        migration_path = os.path.join(migrations_dir, migration_file)
        logger.info(f"Running migration: {migration_file}")
        
        try:
            migration = load_migration(migration_path)
            # Check if the migration has an upgrade method (older format)
            if hasattr(migration, 'upgrade'):
                migration.upgrade(engine)
            # Check if it has run_migration method (newer format)
            elif hasattr(migration, 'run_migration'):
                migration.run_migration(DB_URL)
            # Check if it has migrate method (newest format)
            elif hasattr(migration, 'migrate'):
                migration.migrate(db_session)
            else:
                logger.error(f"Migration {migration_file} has no valid migration method")
                raise ValueError(f"Invalid migration format in {migration_file}")
            
            logger.info(f"Successfully applied migration: {migration_file}")
        except Exception as e:
            logger.error(f"Error applying migration {migration_file}: {str(e)}")
            raise
    
    # Close the session
    db_session.close()
    
    logger.info("All migrations applied successfully!")

if __name__ == "__main__":
    run_migrations()