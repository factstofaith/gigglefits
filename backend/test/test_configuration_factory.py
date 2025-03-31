"""
Configuration factory test module for the TAP Integration Platform.

This module provides test cases for verifying the configuration factory functionality.
It follows the standardized Pytest testing patterns established for the platform.

Author: TAP Integration Platform Team
"""

import os
import sys
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

# Import configuration modules
from core.config_factory import ConfigFactory
from core.settings.base import BaseSettings
from core.settings.development import DevelopmentSettings
from core.settings.production import ProductionSettings
from core.settings.test import TestSettings


# Fixtures for configuration testing
@pytest.fixture
def mock_env_vars():
    """Fixture to create mock environment variables for testing."""
    return {
        "APP_ENVIRONMENT": "development",
        "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/tap_dev",
        "SECRET_KEY": "test_secret_key",
        "DEBUG": "true",
        "LOG_LEVEL": "debug",
        "API_BASE_URL": "http://localhost:8000/api",
        "FRONTEND_URL": "http://localhost:3000"
    }


@pytest.fixture
def config_factory():
    """Fixture to create a ConfigFactory instance."""
    return ConfigFactory()


@pytest.mark.unit
class TestConfigFactory:
    """Test cases for the ConfigFactory class."""
    
    def test_create_config_development(self, config_factory, mock_env_vars):
        """Test creating a development configuration."""
        # Set up environment variables
        with patch('os.environ', mock_env_vars):
            # Create configuration
            config = config_factory.create_config("development")
            
            # Assertions
            assert config is not None
            assert isinstance(config, DevelopmentSettings)
            assert config.debug is True
            assert config.database_url == mock_env_vars["DATABASE_URL"]
            assert config.secret_key == mock_env_vars["SECRET_KEY"]
    
    def test_create_config_production(self, config_factory):
        """Test creating a production configuration."""
        # Set up environment variables for production
        prod_env_vars = {
            "APP_ENVIRONMENT": "production",
            "DATABASE_URL": "postgresql://postgres:postgres@db:5432/tap_prod",
            "SECRET_KEY": "prod_secret_key",
            "DEBUG": "false",
            "LOG_LEVEL": "info",
            "API_BASE_URL": "https://api.example.com",
            "FRONTEND_URL": "https://app.example.com"
        }
        
        # Set up environment variables
        with patch('os.environ', prod_env_vars):
            # Create configuration
            config = config_factory.create_config("production")
            
            # Assertions
            assert config is not None
            assert isinstance(config, ProductionSettings)
            assert config.debug is False
            assert config.database_url == prod_env_vars["DATABASE_URL"]
            assert config.secret_key == prod_env_vars["SECRET_KEY"]
    
    def test_create_config_test(self, config_factory):
        """Test creating a test configuration."""
        # Set up environment variables for test
        test_env_vars = {
            "APP_ENVIRONMENT": "test",
            "DATABASE_URL": "sqlite:///test_db.sqlite",
            "SECRET_KEY": "test_secret_key",
            "DEBUG": "true",
            "LOG_LEVEL": "debug",
            "API_BASE_URL": "http://localhost:8000/api",
            "FRONTEND_URL": "http://localhost:3000"
        }
        
        # Set up environment variables
        with patch('os.environ', test_env_vars):
            # Create configuration
            config = config_factory.create_config("test")
            
            # Assertions
            assert config is not None
            assert isinstance(config, TestSettings)
            assert config.debug is True
            assert config.database_url == test_env_vars["DATABASE_URL"]
            assert config.secret_key == test_env_vars["SECRET_KEY"]
    
    def test_create_config_invalid_environment(self, config_factory, mock_env_vars):
        """Test creating a configuration with an invalid environment name."""
        # Set up environment variables
        with patch('os.environ', mock_env_vars):
            # Create configuration with invalid environment
            with pytest.raises(ValueError):
                config_factory.create_config("invalid")
    
    def test_create_config_from_environment_variable(self, config_factory):
        """Test creating a configuration from the APP_ENVIRONMENT environment variable."""
        # Set up environment variables
        env_vars = {
            "APP_ENVIRONMENT": "development",
            "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/tap_dev",
            "SECRET_KEY": "test_secret_key"
        }
        
        # Set up environment variables
        with patch('os.environ', env_vars):
            # Create configuration without specifying environment
            config = config_factory.create_config()
            
            # Assertions
            assert config is not None
            assert isinstance(config, DevelopmentSettings)
    
    def test_create_config_default_fallback(self, config_factory):
        """Test fallback to development when APP_ENVIRONMENT is not set."""
        # Set up environment variables without APP_ENVIRONMENT
        env_vars = {
            "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/tap_dev",
            "SECRET_KEY": "test_secret_key"
        }
        
        # Set up environment variables
        with patch('os.environ', env_vars):
            # Create configuration without specifying environment
            config = config_factory.create_config()
            
            # Assertions
            assert config is not None
            assert isinstance(config, DevelopmentSettings)


@pytest.mark.unit
class TestSettings:
    """Test cases for the Settings classes."""
    
    def test_base_settings_validation(self):
        """Test validation in BaseSettings."""
        # Create settings with missing required field
        with pytest.raises(ValueError):
            BaseSettings(
                # Missing database_url
                secret_key="test",
                debug=True,
                log_level="debug"
            )
    
    def test_development_settings_defaults(self, mock_env_vars):
        """Test default values in DevelopmentSettings."""
        # Set up environment variables
        with patch('os.environ', mock_env_vars):
            # Create settings
            settings = DevelopmentSettings()
            
            # Assertions for development-specific defaults
            assert settings.debug is True
            assert settings.log_level == "debug"
            assert settings.enable_docs is True
    
    def test_production_settings_defaults(self):
        """Test default values in ProductionSettings."""
        # Set up environment variables for production
        prod_env_vars = {
            "DATABASE_URL": "postgresql://postgres:postgres@db:5432/tap_prod",
            "SECRET_KEY": "prod_secret_key"
        }
        
        # Set up environment variables
        with patch('os.environ', prod_env_vars):
            # Create settings
            settings = ProductionSettings()
            
            # Assertions for production-specific defaults
            assert settings.debug is False
            assert settings.log_level == "info"
            assert settings.enable_docs is False
    
    def test_test_settings_defaults(self):
        """Test default values in TestSettings."""
        # Set up environment variables for test
        test_env_vars = {
            "DATABASE_URL": "sqlite:///test_db.sqlite",
            "SECRET_KEY": "test_secret_key"
        }
        
        # Set up environment variables
        with patch('os.environ', test_env_vars):
            # Create settings
            settings = TestSettings()
            
            # Assertions for test-specific defaults
            assert settings.debug is True
            assert settings.log_level == "debug"
            assert settings.enable_docs is True
            assert settings.testing is True


@pytest.mark.integration
class TestConfigIntegration:
    """Integration tests for configuration functionality."""
    
    def test_config_factory_with_real_env_vars(self):
        """Test ConfigFactory with real environment variables."""
        # Save original environment variables
        original_env = os.environ.copy()
        
        try:
            # Set test environment variables
            os.environ["APP_ENVIRONMENT"] = "test"
            os.environ["DATABASE_URL"] = "sqlite:///test_integration.sqlite"
            os.environ["SECRET_KEY"] = "test_integration_secret"
            os.environ["DEBUG"] = "true"
            os.environ["LOG_LEVEL"] = "debug"
            
            # Create factory and configuration
            factory = ConfigFactory()
            config = factory.create_config()
            
            # Assertions
            assert config is not None
            assert isinstance(config, TestSettings)
            assert config.database_url == "sqlite:///test_integration.sqlite"
            assert config.secret_key == "test_integration_secret"
            assert config.debug is True
            assert config.log_level == "debug"
            
        finally:
            # Restore original environment variables
            os.environ.clear()
            os.environ.update(original_env)
    
    def test_environment_specific_behavior(self):
        """Test environment-specific behavior for configuration."""
        # Save original environment variables
        original_env = os.environ.copy()
        
        try:
            # Set up common environment variables
            os.environ["DATABASE_URL"] = "sqlite:///test_env_behavior.sqlite"
            os.environ["SECRET_KEY"] = "test_env_behavior_secret"
            
            # Create factory
            factory = ConfigFactory()
            
            # Test development config
            os.environ["APP_ENVIRONMENT"] = "development"
            dev_config = factory.create_config()
            
            # Test production config
            os.environ["APP_ENVIRONMENT"] = "production"
            prod_config = factory.create_config()
            
            # Test test config
            os.environ["APP_ENVIRONMENT"] = "test"
            test_config = factory.create_config()
            
            # Assertions for environment differences
            assert dev_config.debug is True
            assert prod_config.debug is False
            assert test_config.debug is True
            
            assert dev_config.enable_docs is True
            assert prod_config.enable_docs is False
            assert test_config.enable_docs is True
            
            assert not hasattr(dev_config, "testing") or dev_config.testing is False
            assert not hasattr(prod_config, "testing") or prod_config.testing is False
            assert test_config.testing is True
            
        finally:
            # Restore original environment variables
            os.environ.clear()
            os.environ.update(original_env)