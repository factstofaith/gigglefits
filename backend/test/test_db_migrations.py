"""
Tests for the database migration system using Alembic.

This module provides test cases for verifying the database migration functionality.
It follows the standardized Pytest testing patterns established for the platform.

Author: TAP Integration Platform Team
"""

import os
import sys
import pytest
import tempfile
import shutil
import sqlite3
from pathlib import Path
from unittest.mock import patch, MagicMock, call
import alembic.config
import alembic.command
from alembic.script import ScriptDirectory

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

# Import migration modules
from db.run_migrations import run_migrations, get_migration_files
from db.base import Base, engine, get_db


# Fixtures for migration testing
@pytest.fixture
def temp_db_dir():
    """Create a temporary directory for database testing."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def temp_db_path(temp_db_dir):
    """Create a temporary database path."""
    return f"sqlite:///{temp_db_dir}/test_migrations.db"


@pytest.fixture
def alembic_config():
    """Create an Alembic configuration for testing."""
    config_path = Path(__file__).parent.parent / "alembic.ini"
    
    # Create a config object
    cfg = alembic.config.Config(str(config_path))
    
    # Set non-interactive mode
    cfg.set_main_option("cmd_opts", "revision")
    
    return cfg


@pytest.fixture
def setup_alembic_mock():
    """Setup mocks for Alembic commands."""
    with patch("alembic.command.upgrade") as mock_upgrade, \
         patch("alembic.command.downgrade") as mock_downgrade, \
         patch("alembic.command.history") as mock_history, \
         patch("alembic.command.current") as mock_current:
        
        yield {
            "upgrade": mock_upgrade,
            "downgrade": mock_downgrade,
            "history": mock_history,
            "current": mock_current
        }


@pytest.mark.db
class TestMigrations:
    """Test cases for database migrations."""
    
    def test_run_migrations(self, temp_db_path, setup_alembic_mock):
        """Test running migrations with Alembic."""
        # Setup environment for test
        with patch.dict(os.environ, {"DATABASE_URL": temp_db_path}):
            # Run migrations
            result = run_migrations()
            
            # Assertions
            assert result is True
            # Check if upgrade was called
            setup_alembic_mock["upgrade"].assert_called_once()
    
    def test_run_migrations_with_target(self, temp_db_path, setup_alembic_mock):
        """Test running migrations with a specific target."""
        # Setup environment for test
        with patch.dict(os.environ, {"DATABASE_URL": temp_db_path}):
            # Run migrations with target
            result = run_migrations(target="head")
            
            # Assertions
            assert result is True
            # Check if upgrade was called with correct target
            setup_alembic_mock["upgrade"].assert_called_once()
            args, kwargs = setup_alembic_mock["upgrade"].call_args
            assert args[1] == "head"
    
    def test_run_migrations_with_downgrade(self, temp_db_path, setup_alembic_mock):
        """Test downgrading migrations."""
        # Setup environment for test
        with patch.dict(os.environ, {"DATABASE_URL": temp_db_path}):
            # Run downgrade
            result = run_migrations(target="base", downgrade=True)
            
            # Assertions
            assert result is True
            # Check if downgrade was called with correct target
            setup_alembic_mock["downgrade"].assert_called_once()
            args, kwargs = setup_alembic_mock["downgrade"].call_args
            assert args[1] == "base"
    
    def test_get_migration_files(self):
        """Test getting migration files."""
        # Setup mock for ScriptDirectory
        script_dir_mock = MagicMock(spec=ScriptDirectory)
        
        # Mock revisions to return
        mock_revisions = [
            MagicMock(revision="rev1", doc="First migration"),
            MagicMock(revision="rev2", doc="Second migration")
        ]
        
        # Mock script directory's get_revisions method
        script_dir_mock.walk_revisions.return_value = mock_revisions
        
        with patch("alembic.script.ScriptDirectory.from_config", return_value=script_dir_mock):
            # Get migration files
            migrations = get_migration_files(MagicMock())
            
            # Assertions
            assert len(migrations) == 2
            assert "rev1" in migrations
            assert "rev2" in migrations


@pytest.mark.integration
@pytest.mark.db
class TestMigrationsIntegration:
    """Integration tests for database migrations."""
    
    def test_migration_creates_tables(self, temp_db_path):
        """Test that migrations create the expected tables."""
        # Setup environment for test
        with patch.dict(os.environ, {"DATABASE_URL": temp_db_path}):
            # Run migrations
            run_migrations()
            
            # Connect to the database and check tables
            db_path = temp_db_path.replace("sqlite:///", "")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Query for all tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [table[0] for table in cursor.fetchall()]
            
            # Assertions - check for expected tables
            assert "alembic_version" in tables  # Check if alembic version table exists
            
            # Check for our model tables
            # The actual table names will depend on your models
            # Below are examples, adjust as needed for your application
            expected_tables = [
                "users",
                "tenants",
                "applications",
                "datasets"
            ]
            
            for table in expected_tables:
                assert table in tables, f"Table {table} not created by migrations"
            
            # Close connection
            conn.close()
    
    def test_migration_upgrade_downgrade_cycle(self, temp_db_path):
        """Test full upgrade and downgrade cycle."""
        # Setup environment for test
        with patch.dict(os.environ, {"DATABASE_URL": temp_db_path}):
            # Run upgrade to head
            run_migrations(target="head")
            
            # Connect to the database and check version
            db_path = temp_db_path.replace("sqlite:///", "")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Get current version
            cursor.execute("SELECT version_num FROM alembic_version;")
            version_after_upgrade = cursor.fetchone()[0]
            conn.close()
            
            # Run downgrade to base
            run_migrations(target="base", downgrade=True)
            
            # Check if tables were removed
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Query for alembic_version table
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version';")
            alembic_table = cursor.fetchone()
            
            # Alembic version table should still exist
            assert alembic_table is not None
            
            # Check version is empty or different
            cursor.execute("SELECT version_num FROM alembic_version;")
            version_after_downgrade = cursor.fetchone()
            
            # Version should be different after downgrade
            assert version_after_downgrade is None or version_after_downgrade[0] != version_after_upgrade
            
            conn.close()
            
            # Run upgrade again to confirm it works
            run_migrations(target="head")
            
            # Check if tables were recreated
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Query for all tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables_after_reupgrade = [table[0] for table in cursor.fetchall()]
            
            # Check if tables exist again
            assert "alembic_version" in tables_after_reupgrade
            assert len(tables_after_reupgrade) > 1  # Should have more tables than just alembic_version
            
            conn.close()