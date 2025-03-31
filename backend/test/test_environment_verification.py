"""
Environment verification test module for the TAP Integration Platform.

This module provides test cases for verifying the complete environment setup.
It follows the standardized Pytest testing patterns established for the platform.

Author: TAP Integration Platform Team
"""

import os
import sys
import pytest
import subprocess
import tempfile
import shutil
import platform
import socket
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

# Import environment utility modules
try:
    from utils.environment import validate_environment, reset_environment
except ImportError:
    # Mock implementation for testing
    def validate_environment(*args, **kwargs):
        return True, []
    
    def reset_environment(*args, **kwargs):
        return True


# Fixtures for environment verification
@pytest.fixture
def check_docker_availability():
    """Check if Docker is available for testing."""
    try:
        result = subprocess.run(
            ["docker", "--version"],
            check=False,
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


@pytest.fixture
def check_postgres_availability():
    """Check if PostgreSQL is available for testing."""
    try:
        # Try connecting to PostgreSQL
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        result = s.connect_ex(('localhost', 5432))
        s.close()
        return result == 0
    except Exception:
        return False


@pytest.fixture
def environment_variables():
    """Setup test environment variables."""
    original_env = os.environ.copy()
    
    # Set test environment variables
    os.environ["APP_ENVIRONMENT"] = "test"
    os.environ["DATABASE_URL"] = "sqlite:///test_env_verification.sqlite"
    os.environ["SECRET_KEY"] = "test_verification_secret"
    os.environ["DEBUG"] = "true"
    os.environ["LOG_LEVEL"] = "debug"
    
    yield os.environ
    
    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env)


@pytest.mark.unit
class TestEnvironmentBasics:
    """Basic environment verification tests."""
    
    def test_python_version(self):
        """Test Python version meets requirements."""
        python_version = sys.version_info
        
        # Check Python version (should be 3.10+ for this project)
        assert python_version.major == 3
        assert python_version.minor >= 10, "Python version should be 3.10 or higher"
    
    def test_required_modules(self):
        """Test that required modules are available."""
        required_modules = [
            "fastapi",
            "sqlalchemy",
            "alembic",
            "pytest",
            "pydantic"
        ]
        
        for module in required_modules:
            try:
                __import__(module)
            except ImportError:
                pytest.fail(f"Required module '{module}' is not installed")
    
    def test_environment_variables_processing(self, environment_variables):
        """Test that environment variables are processed correctly."""
        from core.config import get_settings
        
        # Get settings using environment variables
        settings = get_settings()
        
        # Check that settings reflect environment variables
        assert settings.debug is True
        assert settings.log_level == "debug"
        assert settings.database_url == "sqlite:///test_env_verification.sqlite"
        assert settings.secret_key == "test_verification_secret"
    
    def test_directories_exist(self):
        """Test that required directories exist in the project."""
        root_dir = Path(__file__).parent.parent.parent
        
        required_dirs = [
            root_dir / "backend",
            root_dir / "frontend",
            root_dir / "docs",
            root_dir / "scripts",
            root_dir / "terraform"
        ]
        
        for directory in required_dirs:
            assert directory.exists(), f"Required directory {directory} does not exist"
            assert directory.is_dir(), f"{directory} is not a directory"


@pytest.mark.integration
class TestEnvironmentIntegration:
    """Integration tests for environment verification."""
    
    def test_database_connection(self):
        """Test database connection using SQLAlchemy."""
        from sqlalchemy import create_engine, text
        
        # Create a test database URL
        test_db_url = "sqlite:///test_integration.sqlite"
        
        # Create engine
        engine = create_engine(test_db_url)
        
        # Try to connect and execute a simple query
        try:
            with engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                row = result.fetchone()
                assert row[0] == 1
        except Exception as e:
            pytest.fail(f"Database connection failed: {e}")
    
    def test_alembic_configuration(self):
        """Test Alembic configuration is valid."""
        import alembic.config
        
        # Find alembic.ini
        alembic_ini = Path(__file__).parent.parent / "alembic.ini"
        
        # Check if alembic.ini exists
        assert alembic_ini.exists(), "alembic.ini file not found"
        
        # Try to load alembic config
        try:
            alembic_cfg = alembic.config.Config(str(alembic_ini))
            # Check if alembic config has required sections
            assert alembic_cfg.get_section("alembic") is not None
        except Exception as e:
            pytest.fail(f"Alembic configuration is invalid: {e}")
    
    @pytest.mark.skipif(
        platform.system() == "Windows",
        reason="Docker-based test not supported on Windows in this test suite"
    )
    def test_docker_compose_configuration(self, check_docker_availability):
        """Test Docker Compose configuration is valid."""
        if not check_docker_availability:
            pytest.skip("Docker not available")
        
        # Find docker-compose.yml
        docker_compose_yml = Path(__file__).parent.parent.parent / "docker-compose.yml"
        
        # Check if docker-compose.yml exists
        assert docker_compose_yml.exists(), "docker-compose.yml file not found"
        
        # Try to validate docker-compose config
        try:
            result = subprocess.run(
                ["docker-compose", "-f", str(docker_compose_yml), "config", "--quiet"],
                check=False,
                capture_output=True,
                text=True
            )
            assert result.returncode == 0, f"Docker Compose configuration is invalid: {result.stderr}"
        except Exception as e:
            pytest.fail(f"Docker Compose validation failed: {e}")


@pytest.mark.system
class TestCrossEnvironmentCompatibility:
    """Tests for cross-environment compatibility."""
    
    def test_path_handling(self):
        """Test path handling is platform-independent."""
        from pathlib import Path
        
        # Create paths using different methods
        path1 = Path("dir1") / "dir2" / "file.txt"
        path2 = Path("dir1", "dir2", "file.txt")
        
        # Paths should be equivalent
        assert path1 == path2
        
        # Test path rendering is platform-appropriate
        if platform.system() == "Windows":
            assert "\\" in str(path1)
        else:
            assert "/" in str(path1)
    
    def test_environment_specific_code(self, environment_variables):
        """Test environment-specific code paths."""
        # This test checks that the code handles different environments correctly
        # Import here to use the patched environment
        from core.config import get_settings
        
        # Test development environment
        os.environ["APP_ENVIRONMENT"] = "development"
        dev_settings = get_settings()
        assert dev_settings.debug is True
        
        # Test production environment
        os.environ["APP_ENVIRONMENT"] = "production"
        prod_settings = get_settings()
        assert prod_settings.debug is False
        
        # Test test environment
        os.environ["APP_ENVIRONMENT"] = "test"
        test_settings = get_settings()
        assert hasattr(test_settings, "testing")
        assert test_settings.testing is True
    
    def test_database_url_parsing(self):
        """Test database URL parsing works across environments."""
        from sqlalchemy.engine.url import make_url
        
        # Test different database URL formats
        urls = [
            "sqlite:///local.db",
            "postgresql://user:pass@localhost:5432/dbname",
            "mysql://user:pass@localhost:3306/dbname"
        ]
        
        for url in urls:
            try:
                parsed = make_url(url)
                # Basic validation of parsed URL
                assert parsed.drivername is not None
            except Exception as e:
                pytest.fail(f"Failed to parse database URL '{url}': {e}")


@pytest.mark.edge
class TestEdgeCases:
    """Tests for edge cases in environment handling."""
    
    def test_missing_environment_variables(self):
        """Test handling of missing environment variables."""
        # Save original environment
        original_env = os.environ.copy()
        
        try:
            # Clear all environment variables
            os.environ.clear()
            
            # Import settings with missing variables
            from core.config import get_settings
            
            # Should use default values or fail gracefully
            try:
                settings = get_settings()
                # If we get here, settings has defaults
                assert hasattr(settings, "database_url"), "Missing database_url in settings"
            except Exception as e:
                # Expected failure due to missing required variables
                assert "database_url" in str(e).lower() or "secret_key" in str(e).lower()
        
        finally:
            # Restore original environment
            os.environ.clear()
            os.environ.update(original_env)
    
    def test_invalid_database_url(self):
        """Test handling of invalid database URL."""
        # Save original environment
        original_env = os.environ.copy()
        
        try:
            # Set invalid database URL
            os.environ["DATABASE_URL"] = "invalid://user:pass@host:port/db"
            
            # Try to create engine with invalid URL
            from sqlalchemy import create_engine
            
            # Should raise a clear error about invalid URL
            with pytest.raises(Exception) as excinfo:
                engine = create_engine(os.environ["DATABASE_URL"])
                connection = engine.connect()
            
            # Check error message
            assert "database_url" in str(excinfo.value).lower() or "dialect" in str(excinfo.value).lower()
        
        finally:
            # Restore original environment
            os.environ.clear()
            os.environ.update(original_env)
    
    def test_environment_reset(self):
        """Test environment reset functionality."""
        # Create a temporary directory for testing
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test files
            test_files = [
                Path(temp_dir) / ".env",
                Path(temp_dir) / "config.json",
                Path(temp_dir) / "logs" / "test.log"
            ]
            
            # Create parent directories
            for file_path in test_files:
                file_path.parent.mkdir(exist_ok=True, parents=True)
                file_path.touch()
            
            # Verify files exist
            for file_path in test_files:
                assert file_path.exists(), f"Test file {file_path} does not exist"
            
            # Call reset_environment with the temp directory
            with patch('pathlib.Path.unlink') as mock_unlink:
                mock_unlink.return_value = None
                result = reset_environment(config_dir=temp_dir)
                
                # Reset should succeed
                assert result is True
                
                # Should have attempted to remove files
                assert mock_unlink.call_count > 0