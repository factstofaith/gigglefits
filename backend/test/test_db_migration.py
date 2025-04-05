#!/usr/bin/env python3
"""
Test script for database migrations.

This script tests running the database migrations using run_migrations.py.
It creates a temporary database file and runs the migrations against it.
"""

import os
import sys
import logging
import tempfile
import unittest
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TestDatabaseMigrations(unittest.TestCase):
    """Test class for database migrations."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary database file
        self.temp_db_fd, self.temp_db_path = tempfile.mkstemp(suffix='.db')
        self.db_url = f"sqlite:///{self.temp_db_path}"
        
        # Store original DATABASE_URL environment variable
        self.original_db_url = os.environ.get('DATABASE_URL')
        
        # Set DATABASE_URL to temporary database
        os.environ['DATABASE_URL'] = self.db_url
        
        logger.info(f"Using temporary database at {self.temp_db_path}")
    
    def tearDown(self):
        """Clean up after tests."""
        # Remove temporary database file
        os.close(self.temp_db_fd)
        os.unlink(self.temp_db_path)
        
        # Restore original DATABASE_URL
        if self.original_db_url:
            os.environ['DATABASE_URL'] = self.original_db_url
        else:
            del os.environ['DATABASE_URL']
        
        logger.info("Temporary database removed")
    
    def test_run_migrations(self):
        """Test running migrations."""
        logger.info("Testing run_migrations.py...")
        
        # Import run_migrations module
        from db.run_migrations import run_migrations
        
        try:
            # Run migrations
            run_migrations()
            logger.info("Migrations ran successfully!")
            self.assertTrue(True)  # If we get here, migrations worked
        except Exception as e:
            logger.error(f"Error running migrations: {str(e)}")
            self.fail(f"Migrations failed with error: {str(e)}")
    
    def test_database_tables(self):
        """Test that all expected tables are created."""
        logger.info("Testing database tables creation...")
        
        # Import sqlalchemy and run migrations
        from sqlalchemy import create_engine, inspect
        from db.run_migrations import run_migrations
        
        # Run migrations
        run_migrations()
        
        # Connect to database and inspect tables
        engine = create_engine(self.db_url)
        inspector = inspect(engine)
        
        # Get all table names
        tables = inspector.get_table_names()
        
        # Check for essential tables from our schema
        essential_tables = [
            'users', 
            'integrations', 
            'applications',
            'datasets',
            'tenants',
            'webhooks'
        ]
        
        for table in essential_tables:
            self.assertIn(table, tables, f"Table {table} not found in database")
            logger.info(f"Table {table} found in database")
        
        # Log all tables for informational purposes
        logger.info(f"All tables created: {', '.join(tables)}")

if __name__ == '__main__':
    unittest.main()