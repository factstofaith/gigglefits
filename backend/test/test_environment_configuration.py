"""
Tests for environment-specific configuration profiles.

This module tests that the environment-specific configuration
profiles are correctly loaded based on the APP_ENVIRONMENT variable.
"""

import os
import pytest
import tempfile
from unittest.mock import patch, MagicMock

# Set up paths for importing backend modules
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Import the configuration factory
from core.config_factory import ConfigFactory, EnvironmentType
from core.settings.base import BaseSettings
from core.settings.development import DevelopmentSettings
from core.settings.test import TestSettings
from core.settings.production import ProductionSettings

@pytest.fixture(scope="function")
def env_config_setup():
    """Set up a clean environment for configuration tests."""
    # Store original environment
    original_env = os.environ.copy()
    
    # Create test environment with all required variables
    test_env = {
        "APP_ENVIRONMENT": "development",
        "ENVIRONMENT": "development",
        # Don't set DATABASE_URL to allow the environment-specific settings to use their defaults
        "SECRET_KEY": "test_secret_key",
        "JWT_SECRET_KEY": "test_jwt_key",
        # The validators need to handle the CORS settings properly
        "CORS_ORIGINS": '["*"]',  # JSON string array for testing
        "BACKEND_CORS_ORIGINS": '["*"]',  # JSON string array for testing
        "MODULE_LOG_LEVELS": "{}"  # Empty JSON object as string
    }
    
    # Apply test environment
    for key, value in test_env.items():
        os.environ[key] = value
    
    # Reset any existing configuration
    ConfigFactory.reset()
    
    yield
    
    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env)
    
    # Reset configuration again
    ConfigFactory.reset()


class TestEnvironmentConfiguration:
    """Tests for environment-specific configuration profiles."""
    
    def test_environment_specific_classes_exist(self):
        """Test that environment-specific configuration classes exist."""
        assert issubclass(DevelopmentSettings, BaseSettings)
        assert issubclass(TestSettings, BaseSettings)
        assert issubclass(ProductionSettings, BaseSettings)
    
    def test_environment_type_enum(self):
        """Test that the EnvironmentType enum contains all expected values."""
        assert EnvironmentType.DEVELOPMENT == "development"
        assert EnvironmentType.TEST == "test"
        assert EnvironmentType.PRODUCTION == "production"
    
    def test_config_map_contains_all_environments(self):
        """Test that the config map contains all environments."""
        config_map = ConfigFactory._config_map
        assert EnvironmentType.DEVELOPMENT in config_map
        assert EnvironmentType.TEST in config_map
        assert EnvironmentType.PRODUCTION in config_map
        
        assert config_map[EnvironmentType.DEVELOPMENT] == DevelopmentSettings
        assert config_map[EnvironmentType.TEST] == TestSettings
        assert config_map[EnvironmentType.PRODUCTION] == ProductionSettings
    
    def test_development_environment_loading(self, env_config_setup):
        """Test that the development environment is correctly loaded."""
        # The env_config_setup fixture has set APP_ENVIRONMENT to development
        
        # Get configuration
        config = ConfigFactory.get_config()
        
        # Assert it's a development configuration
        assert isinstance(config, DevelopmentSettings)
        assert config.APP_ENVIRONMENT == "development"
        assert config.DEBUG is True
        assert config.LOG_LEVEL == "debug"
        assert config.ENABLE_SQL_LOGGING is True
    
    def test_test_environment_loading(self, env_config_setup):
        """Test that the test environment is correctly loaded."""
        # Override to test environment
        os.environ["APP_ENVIRONMENT"] = "test"
        
        # Reset singleton to force reload
        ConfigFactory.reset()
        
        # Get configuration
        config = ConfigFactory.get_config()
        
        # Assert it's a test configuration
        assert isinstance(config, TestSettings)
        assert config.APP_ENVIRONMENT == "test"
        assert config.TESTING is True
        assert config.DEBUG is True
        assert config.LOG_LEVEL == "debug"
        assert config.ENABLE_SQL_LOGGING is False
    
    def test_production_environment_loading(self, env_config_setup):
        """Test that the production environment is correctly loaded."""
        # Override to production environment
        os.environ["APP_ENVIRONMENT"] = "production"
        
        # Reset singleton to force reload
        ConfigFactory.reset()
        
        # Get configuration
        config = ConfigFactory.get_config()
        
        # Assert it's a production configuration
        assert isinstance(config, ProductionSettings)
        assert config.APP_ENVIRONMENT == "production"
        assert config.DEBUG is False
        assert config.LOG_LEVEL == "warning"
        assert config.ENABLE_SQL_LOGGING is False
        assert config.ENABLE_DOCS is False
    
    def test_invalid_environment_falls_back_to_development(self, env_config_setup):
        """Test that an invalid environment falls back to development."""
        # Set an invalid environment
        os.environ["APP_ENVIRONMENT"] = "invalid"
        
        # Reset singleton to force reload
        ConfigFactory.reset()
        
        # Get configuration
        config = ConfigFactory.get_config()
        
        # Assert it's a development configuration
        assert isinstance(config, DevelopmentSettings)
        assert config.APP_ENVIRONMENT == "development"
    
    def test_environment_specific_db_configs(self, env_config_setup):
        """Test that each environment has its own database configuration."""
        dev_config = ConfigFactory.create_config(EnvironmentType.DEVELOPMENT)
        test_config = ConfigFactory.create_config(EnvironmentType.TEST)
        prod_config = ConfigFactory.create_config(EnvironmentType.PRODUCTION)
        
        # Assert database URLs are different
        assert dev_config.DATABASE_URL != test_config.DATABASE_URL
        assert dev_config.DATABASE_URL != prod_config.DATABASE_URL
        assert test_config.DATABASE_URL != prod_config.DATABASE_URL
    
    def test_create_config_creates_new_instance(self, env_config_setup):
        """Test that create_config creates a new instance each time."""
        config1 = ConfigFactory.create_config(EnvironmentType.DEVELOPMENT)
        config2 = ConfigFactory.create_config(EnvironmentType.DEVELOPMENT)
        
        # Assert they're different instances
        assert config1 is not config2
    
    def test_environment_specific_features(self, env_config_setup):
        """Test that each environment has specific feature flags."""
        dev_config = ConfigFactory.create_config(EnvironmentType.DEVELOPMENT)
        test_config = ConfigFactory.create_config(EnvironmentType.TEST)
        prod_config = ConfigFactory.create_config(EnvironmentType.PRODUCTION)
        
        # Development-specific features
        assert dev_config.ENABLE_DOCS is True
        assert dev_config.ENABLE_SQL_LOGGING is True
        assert dev_config.ENABLE_TRACE_REQUESTS is True
        assert hasattr(dev_config, "RELOAD")
        assert dev_config.RELOAD is True
        
        # Test-specific features
        assert test_config.ENABLE_DOCS is True
        assert test_config.ENABLE_SQL_LOGGING is False
        assert hasattr(test_config, "TESTING")
        assert test_config.TESTING is True
        
        # Production-specific features
        assert prod_config.ENABLE_DOCS is False
        assert prod_config.ENABLE_SQL_LOGGING is False
        assert prod_config.ENABLE_TRACE_REQUESTS is False
        
        # Production has stricter rate limiting
        assert prod_config.RATE_LIMIT_REQUESTS > dev_config.RATE_LIMIT_REQUESTS


if __name__ == "__main__":
    pytest.main(["-xvs", __file__])