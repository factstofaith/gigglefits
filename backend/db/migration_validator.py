#!/usr/bin/env python3
"""
Database Migration Validator

This script validates database migrations to ensure they run properly in a Docker environment.
It includes verification of both run_migrations.py and alembic-based migrations.

Features:
- Creates temporary test database for safe validation
- Verifies schema creation through SQLAlchemy model reflection
- Tests both legacy migration approach and Alembic migrations
- Provides detailed reporting on migration success and schema validation
"""

import os
import sys
import logging
import tempfile
import importlib
import argparse
from pathlib import Path
from datetime import datetime, timezone
from contextlib import contextmanager

# Setup logging with proper formatting
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("migration_validator")

# Try importing SQLAlchemy dependencies
try:
    from sqlalchemy import create_engine, inspect, text
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy_utils import database_exists, create_database
except ImportError:
    logger.error("Required dependencies not found. Installing dependencies...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "sqlalchemy", "sqlalchemy_utils", "alembic"])
    from sqlalchemy import create_engine, inspect, text
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy_utils import database_exists, create_database

# Import local modules
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Color codes for terminal output
class TermColors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    ERROR = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class MigrationValidator:
    """Validates database migrations for TAP Integration Platform"""
    
    def __init__(self, db_url=None, test_alembic=True, test_legacy=True):
        """Initialize the migration validator"""
        self.original_db_url = os.environ.get('DATABASE_URL')
        
        # Create temporary database file for testing if SQLite
        if not db_url:
            self.temp_db_fd, self.temp_db_path = tempfile.mkstemp(suffix='.db')
            self.db_url = f"sqlite:///{self.temp_db_path}"
        else:
            self.temp_db_fd = None
            self.temp_db_path = None
            self.db_url = db_url
        
        # Set environment variables
        os.environ['DATABASE_URL'] = self.db_url
        
        # Test configuration
        self.test_alembic = test_alembic
        self.test_legacy = test_legacy
        
        logger.info(f"{TermColors.HEADER}Migration Validator initialized with database URL: {self.db_url}{TermColors.ENDC}")
        
    def __enter__(self):
        """Context manager entry"""
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit, cleanup resources"""
        self.cleanup()
        
    def cleanup(self):
        """Clean up temporary database and environment variables"""
        # Restore original DATABASE_URL
        if self.original_db_url:
            os.environ['DATABASE_URL'] = self.original_db_url
        else:
            if 'DATABASE_URL' in os.environ:
                del os.environ['DATABASE_URL']
        
        # Remove temporary database file
        if self.temp_db_fd is not None:
            try:
                os.close(self.temp_db_fd)
                if os.path.exists(self.temp_db_path):
                    os.unlink(self.temp_db_path)
                logger.info(f"{TermColors.OKBLUE}Temporary database removed{TermColors.ENDC}")
            except Exception as e:
                logger.error(f"Error removing temporary database: {str(e)}")
    
    def validate_all(self):
        """Run all validation tests"""
        results = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "database_url": self.db_url,
            "tests": {}
        }
        
        # Test legacy migrations if requested
        if self.test_legacy:
            legacy_result = self.test_legacy_migrations()
            results["tests"]["legacy_migrations"] = legacy_result
            
        # Test Alembic migrations if requested
        if self.test_alembic:
            alembic_result = self.test_alembic_migrations()
            results["tests"]["alembic_migrations"] = alembic_result
            
        # Validate schemas match after migrations
        if self.test_legacy and self.test_alembic:
            schema_comparison = self.compare_schemas()
            results["tests"]["schema_comparison"] = schema_comparison
            
        # Print summary
        self.print_summary(results)
        
        return results
    
    def test_legacy_migrations(self):
        """Test the run_migrations.py script"""
        logger.info(f"{TermColors.HEADER}Testing legacy migrations with run_migrations.py...{TermColors.ENDC}")
        
        # Create clean database for testing
        self.reset_database()
        
        try:
            # Import run_migrations module
            from db.run_migrations import run_migrations
            
            # Run migrations
            start_time = datetime.now(timezone.utc)
            run_migrations()
            end_time = datetime.now(timezone.utc)
            duration = (end_time - start_time).total_seconds()
            
            # Validate the schema
            schema_validation = self.validate_schema("legacy")
            
            logger.info(f"{TermColors.OKGREEN}Legacy migrations completed successfully in {duration:.2f} seconds!{TermColors.ENDC}")
            
            return {
                "success": True,
                "duration": duration,
                "schema_validation": schema_validation
            }
        except Exception as e:
            logger.error(f"{TermColors.ERROR}Error running legacy migrations: {str(e)}{TermColors.ENDC}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
    
    def test_alembic_migrations(self):
        """Test Alembic migrations"""
        logger.info(f"{TermColors.HEADER}Testing Alembic migrations...{TermColors.ENDC}")
        
        # Create clean database for testing
        self.reset_database()
        
        try:
            # Check for alembic command
            try:
                import alembic
                from alembic import command
                from alembic.config import Config
            except ImportError:
                logger.error(f"{TermColors.ERROR}Alembic not installed. Installing...{TermColors.ENDC}")
                import subprocess
                subprocess.run([sys.executable, "-m", "pip", "install", "alembic"])
                import alembic
                from alembic import command
                from alembic.config import Config
            
            # Set up alembic configuration
            alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
            
            # Run migrations
            start_time = datetime.now(timezone.utc)
            command.upgrade(alembic_cfg, "head")
            end_time = datetime.now(timezone.utc)
            duration = (end_time - start_time).total_seconds()
            
            # Validate the schema
            schema_validation = self.validate_schema("alembic")
            
            logger.info(f"{TermColors.OKGREEN}Alembic migrations completed successfully in {duration:.2f} seconds!{TermColors.ENDC}")
            
            return {
                "success": True,
                "duration": duration,
                "schema_validation": schema_validation
            }
        except Exception as e:
            logger.error(f"{TermColors.ERROR}Error running Alembic migrations: {str(e)}{TermColors.ENDC}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
    
    def reset_database(self):
        """Reset the database to a clean state"""
        logger.info(f"{TermColors.OKBLUE}Resetting database for new test...{TermColors.ENDC}")
        
        engine = create_engine(self.db_url)
        
        # Drop database if it exists
        if database_exists(engine.url):
            inspector = inspect(engine)
            for table_name in inspector.get_table_names():
                engine.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
            logger.info(f"{TermColors.OKBLUE}Existing database tables dropped{TermColors.ENDC}")
        else:
            # Create database if it doesn't exist
            create_database(engine.url)
            logger.info(f"{TermColors.OKBLUE}Created new database{TermColors.ENDC}")
    
    def validate_schema(self, migration_type):
        """Validate the database schema after migrations"""
        logger.info(f"{TermColors.HEADER}Validating database schema after {migration_type} migrations...{TermColors.ENDC}")
        
        engine = create_engine(self.db_url)
        inspector = inspect(engine)
        
        # Get all table names
        tables = inspector.get_table_names()
        
        # Check for essential tables
        essential_tables = [
            'users', 
            'integrations', 
            'applications',
            'datasets',
            'tenants',
            'webhooks'
        ]
        
        missing_tables = [table for table in essential_tables if table not in tables]
        
        if missing_tables:
            logger.error(f"{TermColors.ERROR}Missing essential tables: {', '.join(missing_tables)}{TermColors.ENDC}")
            return {
                "success": False,
                "tables_found": tables,
                "missing_tables": missing_tables
            }
        else:
            logger.info(f"{TermColors.OKGREEN}All essential tables found{TermColors.ENDC}")
            
            # Check column details for each essential table
            table_schemas = {}
            for table in essential_tables:
                columns = inspector.get_columns(table)
                column_names = [col['name'] for col in columns]
                table_schemas[table] = {
                    "columns": column_names,
                    "column_count": len(column_names)
                }
                logger.info(f"{TermColors.OKBLUE}Table {table} has {len(column_names)} columns{TermColors.ENDC}")
            
            return {
                "success": True,
                "tables_found": tables,
                "table_count": len(tables),
                "essential_tables": table_schemas
            }
    
    def compare_schemas(self):
        """Compare schemas between legacy and Alembic migrations"""
        logger.info(f"{TermColors.HEADER}Comparing schemas between legacy and Alembic migrations...{TermColors.ENDC}")
        
        # First run legacy migrations
        self.reset_database()
        try:
            from db.run_migrations import run_migrations
            run_migrations()
            legacy_schema = self.capture_schema()
        except Exception as e:
            logger.error(f"{TermColors.ERROR}Error capturing legacy schema: {str(e)}{TermColors.ENDC}")
            return {
                "success": False,
                "error": str(e)
            }
        
        # Then run Alembic migrations on a clean database
        self.reset_database()
        try:
            from alembic import command
            from alembic.config import Config
            alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
            command.upgrade(alembic_cfg, "head")
            alembic_schema = self.capture_schema()
        except Exception as e:
            logger.error(f"{TermColors.ERROR}Error capturing Alembic schema: {str(e)}{TermColors.ENDC}")
            return {
                "success": False,
                "error": str(e)
            }
        
        # Compare the schemas
        differences = self.find_schema_differences(legacy_schema, alembic_schema)
        
        if differences:
            logger.warning(f"{TermColors.WARNING}Found {len(differences)} differences between legacy and Alembic schemas{TermColors.ENDC}")
            for diff in differences:
                logger.warning(f"{TermColors.WARNING}- {diff}{TermColors.ENDC}")
            return {
                "success": False,
                "differences": differences
            }
        else:
            logger.info(f"{TermColors.OKGREEN}Legacy and Alembic schemas match perfectly!{TermColors.ENDC}")
            return {
                "success": True,
                "message": "Schemas match"
            }
    
    def capture_schema(self):
        """Capture the current database schema"""
        engine = create_engine(self.db_url)
        inspector = inspect(engine)
        
        schema = {}
        
        # Get all tables
        tables = inspector.get_table_names()
        
        for table in tables:
            columns = inspector.get_columns(table)
            column_details = {}
            for col in columns:
                column_details[col['name']] = {
                    'type': str(col['type']),
                    'nullable': col.get('nullable', True)
                }
            
            # Get primary key constraints
            pk_constraint = inspector.get_pk_constraint(table)
            
            # Get foreign key constraints
            fk_constraints = inspector.get_foreign_keys(table)
            
            # Get indexes
            indexes = inspector.get_indexes(table)
            
            schema[table] = {
                'columns': column_details,
                'primary_key': pk_constraint,
                'foreign_keys': fk_constraints,
                'indexes': indexes
            }
        
        return schema
    
    def find_schema_differences(self, schema1, schema2):
        """Find differences between two database schemas"""
        differences = []
        
        # Check tables in schema1 that are not in schema2
        for table in schema1:
            if table not in schema2:
                differences.append(f"Table '{table}' exists in legacy schema but not in Alembic schema")
        
        # Check tables in schema2 that are not in schema1
        for table in schema2:
            if table not in schema1:
                differences.append(f"Table '{table}' exists in Alembic schema but not in legacy schema")
        
        # Check tables that exist in both schemas
        for table in schema1:
            if table in schema2:
                # Check columns
                for col in schema1[table]['columns']:
                    if col not in schema2[table]['columns']:
                        differences.append(f"Column '{col}' in table '{table}' exists in legacy schema but not in Alembic schema")
                    elif schema1[table]['columns'][col] != schema2[table]['columns'][col]:
                        differences.append(f"Column '{col}' in table '{table}' has different definitions between schemas")
                
                for col in schema2[table]['columns']:
                    if col not in schema1[table]['columns']:
                        differences.append(f"Column '{col}' in table '{table}' exists in Alembic schema but not in legacy schema")
                
                # Check primary keys
                if schema1[table]['primary_key']['constrained_columns'] != schema2[table]['primary_key']['constrained_columns']:
                    differences.append(f"Primary key differs for table '{table}'")
                
                # Check foreign keys
                if len(schema1[table]['foreign_keys']) != len(schema2[table]['foreign_keys']):
                    differences.append(f"Number of foreign keys differs for table '{table}'")
        
        return differences
    
    def print_summary(self, results):
        """Print a summary of validation results"""
        logger.info(f"\n{TermColors.HEADER}======= Migration Validation Summary ======={TermColors.ENDC}")
        logger.info(f"Timestamp: {results['timestamp']}")
        logger.info(f"Database URL: {results['database_url']}")
        
        for test_name, test_result in results['tests'].items():
            if test_result.get('success', False):
                logger.info(f"{TermColors.OKGREEN}✓ {test_name} - Success{TermColors.ENDC}")
                if 'duration' in test_result:
                    logger.info(f"  Duration: {test_result['duration']:.2f} seconds")
                if 'schema_validation' in test_result and test_result['schema_validation'].get('success'):
                    logger.info(f"  Tables: {test_result['schema_validation'].get('table_count', 0)} total tables found")
            else:
                logger.info(f"{TermColors.ERROR}✗ {test_name} - Failed{TermColors.ENDC}")
                if 'error' in test_result:
                    logger.info(f"  Error: {test_result['error']}")
                if 'missing_tables' in test_result.get('schema_validation', {}):
                    missing = test_result['schema_validation']['missing_tables']
                    logger.info(f"  Missing tables: {', '.join(missing)}")
        
        logger.info(f"{TermColors.HEADER}======================================={TermColors.ENDC}")


def main():
    """Main function for migration validation"""
    parser = argparse.ArgumentParser(description="Validate database migrations for TAP Integration Platform")
    parser.add_argument("--db-url", default=None, help="Database URL to use (default: temporary SQLite database)")
    parser.add_argument("--legacy-only", action="store_true", help="Test only legacy migrations")
    parser.add_argument("--alembic-only", action="store_true", help="Test only Alembic migrations")
    args = parser.parse_args()
    
    # Determine which tests to run
    test_legacy = not args.alembic_only
    test_alembic = not args.legacy_only
    
    # Run the validator
    with MigrationValidator(db_url=args.db_url, test_legacy=test_legacy, test_alembic=test_alembic) as validator:
        results = validator.validate_all()
        
        # Return exit code based on success
        all_success = all(test.get('success', False) for test in results['tests'].values())
        return 0 if all_success else 1


if __name__ == "__main__":
    sys.exit(main())