#!/usr/bin/env python3
"""
Database Management Script for TAP Integration Platform

This script provides commands for database management:
- init: Initialize the database (create tables)
- migrate: Run migrations
- reset: Reset the database
- validate: Validate the database schema
- seed: Seed the database with initial data
"""

import os
import sys
import argparse
import logging
import subprocess
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("manage_db")

def run_command(cmd, cwd=None):
    """Run a command and log its output"""
    logger.info(f"Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True
        )
        logger.info(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False

def init_database(args):
    """Initialize the database"""
    from db.base import initialize_db
    from core.config_factory import ConfigFactory, EnvironmentType
    
    # Set environment
    os.environ["APP_ENVIRONMENT"] = args.environment
    env_type = EnvironmentType[args.environment.upper()]
    config = ConfigFactory.create_config(env_type)
    
    logger.info(f"Initializing database for {args.environment} environment")
    
    try:
        # Initialize database (create tables)
        initialize_db()
        logger.info("Database initialization completed successfully")
        return True
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

def run_migrations(args):
    """Run database migrations"""
    try:
        # Set environment
        os.environ["APP_ENVIRONMENT"] = args.environment
        
        # Run migrations
        project_dir = Path(__file__).resolve().parent.parent
        if args.revision:
            cmd = ["alembic", "upgrade", args.revision]
        else:
            cmd = ["alembic", "upgrade", "head"]
        
        return run_command(cmd, cwd=project_dir)
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False

def reset_database(args):
    """Reset the database"""
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from core.config_factory import ConfigFactory, EnvironmentType
    from db.base import Base
    
    # Set environment
    os.environ["APP_ENVIRONMENT"] = args.environment
    env_type = EnvironmentType[args.environment.upper()]
    config = ConfigFactory.create_config(env_type)
    
    logger.info(f"Resetting database for {args.environment} environment")
    
    if args.environment == "production" and not args.confirm:
        logger.error("Cannot reset production database without confirmation")
        logger.error("Use --confirm flag to reset production database")
        return False
    
    try:
        # Connect to database
        engine = create_engine(config.DATABASE_URL)
        
        if args.hard:
            # Drop all tables
            logger.info("Dropping all tables...")
            Base.metadata.drop_all(engine)
            logger.info("All tables dropped")
        
        # Create all tables
        logger.info("Creating all tables...")
        Base.metadata.create_all(engine)
        logger.info("All tables created")
        
        if args.run_migrations:
            # Run migrations
            logger.info("Running migrations...")
            project_dir = Path(__file__).resolve().parent.parent
            if not run_command(["alembic", "upgrade", "head"], cwd=project_dir):
                logger.error("Migration failed")
                return False
            logger.info("Migrations completed")
        
        logger.info("Database reset completed successfully")
        return True
    except Exception as e:
        logger.error(f"Database reset failed: {e}")
        return False

def validate_database(args):
    """Validate the database schema"""
    from sqlalchemy import create_engine, inspect, text
    from alembic.config import Config
    from alembic.script import ScriptDirectory
    from alembic.migration import MigrationContext
    from core.config_factory import ConfigFactory, EnvironmentType
    
    # Set environment
    os.environ["APP_ENVIRONMENT"] = args.environment
    env_type = EnvironmentType[args.environment.upper()]
    config = ConfigFactory.create_config(env_type)
    
    logger.info(f"Validating database for {args.environment} environment")
    
    try:
        # Connect to database
        engine = create_engine(config.DATABASE_URL)
        conn = engine.connect()
        
        # Check connection
        try:
            result = conn.execute(text("SELECT 1")).scalar()
            if result != 1:
                logger.error("Database connection test failed")
                return False
            logger.info("Database connection successful")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
        
        # Check migration status
        if args.check_migrations:
            logger.info("Checking migration status...")
            context = MigrationContext.configure(conn)
            current_rev = context.get_current_revision()
            
            # Get latest available revision
            alembic_cfg = Config(str(Path(__file__).resolve().parent.parent / "alembic.ini"))
            script = ScriptDirectory.from_config(alembic_cfg)
            head_rev = script.get_current_head()
            
            if current_rev != head_rev:
                logger.warning(f"Database is not at latest migration")
                logger.warning(f"Current revision: {current_rev}")
                logger.warning(f"Latest revision: {head_rev}")
                logger.warning("Run migrations to update database schema")
                # Don't return False here, just warn
            else:
                logger.info("Database schema is up to date")
        
        # Check required tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = [
            "users",
            "integrations",
            "applications",
            "datasets",
            "field_mappings",
            "integration_runs",
            "tags",
            "webhooks",
            "webhook_logs"
        ]
        
        missing_tables = [table for table in required_tables if table not in tables]
        if missing_tables:
            logger.error(f"Missing required tables: {', '.join(missing_tables)}")
            if not args.ignore_missing:
                return False
        else:
            logger.info("All required tables exist")
        
        # Close connection
        conn.close()
        
        logger.info("Database validation completed successfully")
        return True
    except Exception as e:
        logger.error(f"Database validation failed: {e}")
        return False

def seed_database(args):
    """Seed the database with initial data"""
    # You can implement this based on your specific requirements
    logger.info(f"Seeding database for {args.environment} environment")
    logger.warning("Database seeding not yet implemented")
    return True

def main():
    parser = argparse.ArgumentParser(description="Database management for TAP Integration Platform")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Common arguments
    environment_arg = lambda p: p.add_argument(
        "--environment", 
        choices=["development", "test", "production"],
        default="development",
        help="Environment to use"
    )
    
    # Init command
    init_parser = subparsers.add_parser("init", help="Initialize the database")
    environment_arg(init_parser)
    init_parser.set_defaults(func=init_database)
    
    # Migrate command
    migrate_parser = subparsers.add_parser("migrate", help="Run database migrations")
    environment_arg(migrate_parser)
    migrate_parser.add_argument(
        "--revision", 
        default=None,
        help="Revision to migrate to (default: head)"
    )
    migrate_parser.set_defaults(func=run_migrations)
    
    # Reset command
    reset_parser = subparsers.add_parser("reset", help="Reset the database")
    environment_arg(reset_parser)
    reset_parser.add_argument(
        "--hard", 
        action="store_true",
        help="Perform a hard reset (drop all tables)"
    )
    reset_parser.add_argument(
        "--run-migrations", 
        action="store_true",
        help="Run migrations after reset"
    )
    reset_parser.add_argument(
        "--confirm", 
        action="store_true",
        help="Confirm reset of production database"
    )
    reset_parser.set_defaults(func=reset_database)
    
    # Validate command
    validate_parser = subparsers.add_parser("validate", help="Validate the database schema")
    environment_arg(validate_parser)
    validate_parser.add_argument(
        "--check-migrations", 
        action="store_true",
        help="Check if database is at latest migration"
    )
    validate_parser.add_argument(
        "--ignore-missing", 
        action="store_true",
        help="Ignore missing tables"
    )
    validate_parser.set_defaults(func=validate_database)
    
    # Seed command
    seed_parser = subparsers.add_parser("seed", help="Seed the database with initial data")
    environment_arg(seed_parser)
    seed_parser.set_defaults(func=seed_database)
    
    # Parse arguments
    args = parser.parse_args()
    
    # Execute command
    if hasattr(args, "func"):
        success = args.func(args)
        return 0 if success else 1
    else:
        parser.print_help()
        return 0

if __name__ == "__main__":
    sys.exit(main())