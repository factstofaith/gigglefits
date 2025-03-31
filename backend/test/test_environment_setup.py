"""
Environment setup test module for the TAP Integration Platform.

This module provides test cases for verifying the environment setup functionality.
It follows the standardized Pytest testing patterns established for the platform.

Author: TAP Integration Platform Team
"""

import os
import sys
import pytest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

# Import the environment setup module (adjust import path as needed)
from utils.environment import setup_environment, validate_environment, reset_environment


# Fixtures for environment testing
@pytest.fixture
def mock_env_vars():
    """Fixture to create mock environment variables for testing."""
    return {
        "TAP_DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/tap_dev",
        "TAP_SECRET_KEY": "test_secret_key",
        "TAP_DEBUG": "true",
        "TAP_LOG_LEVEL": "debug",
        "TAP_API_BASE_URL": "http://localhost:8000/api",
        "TAP_FRONTEND_URL": "http://localhost:3000"
    }


@pytest.fixture
def temp_config_dir():
    """Fixture to create a temporary configuration directory."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def mock_dependency_check():
    """Fixture to mock dependency checks."""
    with patch('utils.environment.check_dependencies') as mock:
        mock.return_value = True
        yield mock


@pytest.mark.unit
class TestEnvironmentSetup:
    """Test cases for environment setup functionality."""
    
    def test_setup_environment_creates_config_files(self, temp_config_dir, mock_env_vars, mock_dependency_check):
        """Test that setup_environment creates all required configuration files."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists, \
             patch('utils.environment.Path.mkdir') as mock_mkdir, \
             patch('utils.environment.Path.open') as mock_open, \
             patch('utils.environment.os.environ', mock_env_vars):
            
            # Configure mocks
            mock_exists.return_value = False
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            
            # Call the function to test
            result = setup_environment(config_dir=temp_config_dir, environment="development")
            
            # Assertions
            assert result is True
            mock_mkdir.assert_called()
            assert mock_open.call_count > 0
            mock_file.write.assert_called()
    
    def test_setup_environment_with_existing_config(self, temp_config_dir, mock_env_vars, mock_dependency_check):
        """Test setup_environment when configuration already exists."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists, \
             patch('utils.environment.Path.open') as mock_open, \
             patch('utils.environment.os.environ', mock_env_vars):
            
            # Configure mocks to simulate existing configuration
            mock_exists.return_value = True
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            
            # Call the function to test
            result = setup_environment(config_dir=temp_config_dir, environment="development", force=False)
            
            # Assertions
            assert result is False  # Should not overwrite without force
            assert mock_open.call_count == 0  # Should not create config files
    
    def test_setup_environment_with_force_option(self, temp_config_dir, mock_env_vars, mock_dependency_check):
        """Test setup_environment with force option to overwrite existing configuration."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists, \
             patch('utils.environment.Path.open') as mock_open, \
             patch('utils.environment.os.environ', mock_env_vars):
            
            # Configure mocks to simulate existing configuration
            mock_exists.return_value = True
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            
            # Call the function to test
            result = setup_environment(config_dir=temp_config_dir, environment="development", force=True)
            
            # Assertions
            assert result is True  # Should overwrite with force
            assert mock_open.call_count > 0  # Should create config files
            mock_file.write.assert_called()
    
    def test_setup_environment_creates_docker_compose_override(self, temp_config_dir, mock_env_vars, mock_dependency_check):
        """Test that setup_environment creates docker-compose.override.yml."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists, \
             patch('utils.environment.Path.mkdir') as mock_mkdir, \
             patch('utils.environment.Path.open') as mock_open, \
             patch('utils.environment.os.environ', mock_env_vars):
            
            # Configure mocks
            mock_exists.return_value = False
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            
            # Call the function to test
            result = setup_environment(config_dir=temp_config_dir, environment="development", with_docker=True)
            
            # Assertions
            assert result is True
            # Check if docker-compose.override.yml was created
            docker_compose_calls = [
                call for call in mock_open.call_args_list 
                if "docker-compose.override.yml" in str(call)
            ]
            assert len(docker_compose_calls) > 0
    
    def test_setup_environment_with_invalid_environment(self, temp_config_dir, mock_env_vars, mock_dependency_check):
        """Test setup_environment with an invalid environment name."""
        # Call the function with an invalid environment
        with pytest.raises(ValueError):
            setup_environment(config_dir=temp_config_dir, environment="invalid")


@pytest.mark.unit
class TestEnvironmentValidation:
    """Test cases for environment validation functionality."""
    
    def test_validate_environment_with_valid_config(self, temp_config_dir, mock_env_vars):
        """Test validate_environment with valid configuration."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists, \
             patch('utils.environment.Path.is_file') as mock_is_file, \
             patch('utils.environment.Path.open') as mock_open, \
             patch('utils.environment.os.environ', mock_env_vars):
            
            # Configure mocks
            mock_exists.return_value = True
            mock_is_file.return_value = True
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            mock_file.read.return_value = "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tap_dev\n"
            
            # Call the function to test
            result, issues = validate_environment(config_dir=temp_config_dir)
            
            # Assertions
            assert result is True
            assert len(issues) == 0
    
    def test_validate_environment_with_missing_files(self, temp_config_dir, mock_env_vars):
        """Test validate_environment with missing configuration files."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists, \
             patch('utils.environment.os.environ', mock_env_vars):
            
            # Configure mocks to simulate missing files
            mock_exists.return_value = False
            
            # Call the function to test
            result, issues = validate_environment(config_dir=temp_config_dir)
            
            # Assertions
            assert result is False
            assert len(issues) > 0
            assert any("missing" in issue.lower() for issue in issues)
    
    def test_validate_environment_with_missing_required_values(self, temp_config_dir, mock_env_vars):
        """Test validate_environment with configuration missing required values."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists, \
             patch('utils.environment.Path.is_file') as mock_is_file, \
             patch('utils.environment.Path.open') as mock_open, \
             patch('utils.environment.os.environ', mock_env_vars):
            
            # Configure mocks
            mock_exists.return_value = True
            mock_is_file.return_value = True
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            # Missing required DATABASE_URL
            mock_file.read.return_value = "DEBUG=true\n"
            
            # Call the function to test
            result, issues = validate_environment(config_dir=temp_config_dir)
            
            # Assertions
            assert result is False
            assert len(issues) > 0
            assert any("required" in issue.lower() for issue in issues)


@pytest.mark.unit
class TestEnvironmentReset:
    """Test cases for environment reset functionality."""
    
    def test_reset_environment_removes_config_files(self, temp_config_dir):
        """Test that reset_environment removes configuration files."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists, \
             patch('utils.environment.Path.is_file') as mock_is_file, \
             patch('utils.environment.Path.unlink') as mock_unlink:
            
            # Configure mocks
            mock_exists.return_value = True
            mock_is_file.return_value = True
            
            # Call the function to test
            result = reset_environment(config_dir=temp_config_dir)
            
            # Assertions
            assert result is True
            assert mock_unlink.call_count > 0
    
    def test_reset_environment_with_nonexistent_directory(self, temp_config_dir):
        """Test reset_environment with a non-existent directory."""
        # Set up mock for file operations
        with patch('utils.environment.Path.exists') as mock_exists:
            
            # Configure mocks
            mock_exists.return_value = False
            
            # Call the function to test
            result = reset_environment(config_dir=temp_config_dir)
            
            # Assertions
            assert result is False


@pytest.mark.integration
class TestEnvironmentSetupIntegration:
    """Integration tests for environment setup functionality."""
    
    def test_end_to_end_environment_setup_and_validation(self, temp_config_dir, mock_dependency_check):
        """Test the end-to-end flow of setting up and validating the environment."""
        # Use actual functions rather than mocks for integration test
        
        # Set up test environment variables
        test_env_vars = {
            "TAP_DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/tap_test_integration",
            "TAP_SECRET_KEY": "test_integration_secret",
            "TAP_DEBUG": "true",
            "TAP_LOG_LEVEL": "debug"
        }
        
        # Save original environment variables
        original_env = os.environ.copy()
        
        try:
            # Set test environment variables
            for key, value in test_env_vars.items():
                os.environ[key] = value
            
            # Run setup
            setup_result = setup_environment(config_dir=temp_config_dir, environment="test")
            
            # Run validation
            validation_result, issues = validate_environment(config_dir=temp_config_dir)
            
            # Run reset
            reset_result = reset_environment(config_dir=temp_config_dir)
            
            # Assertions
            assert setup_result is True
            assert validation_result is True
            assert len(issues) == 0
            assert reset_result is True
            
        finally:
            # Restore original environment variables
            os.environ.clear()
            os.environ.update(original_env)