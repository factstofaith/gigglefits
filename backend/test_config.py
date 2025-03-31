"""
Simple test for configuration factory - manual implementation
without dependencies
"""
import os
import sys

# Define environment type enum
class EnvironmentType:
    DEVELOPMENT = "development"
    TEST = "test"
    PRODUCTION = "production"

# Define base settings class (simplified)
class BaseSettings:
    """Base settings class with common configuration values."""
    API_V1_STR = "/api"
    DEBUG = False
    LOG_LEVEL = "info"
    DATABASE_URL = "postgresql://postgres:postgres@db:5432/tap"
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

# Define environment-specific settings classes
class DevelopmentSettings(BaseSettings):
    """Development environment settings."""
    DEBUG = True
    LOG_LEVEL = "debug"
    DATABASE_URL = "postgresql://postgres:postgres@db:5432/tap_dev"
    
class TestSettings(BaseSettings):
    """Test environment settings."""
    DEBUG = True
    LOG_LEVEL = "debug"
    DATABASE_URL = "postgresql://postgres:postgres@db:5432/tap_test"
    TESTING = True
    
class ProductionSettings(BaseSettings):
    """Production environment settings."""
    DEBUG = False
    LOG_LEVEL = "warning"
    DATABASE_URL = "postgresql://postgres:postgres@db:5432/tap_prod"

# Define config factory class
class ConfigFactory:
    """Factory for creating environment-specific configuration."""
    
    # Mapping of environment types to configuration classes
    _config_map = {
        EnvironmentType.DEVELOPMENT: DevelopmentSettings,
        EnvironmentType.TEST: TestSettings,
        EnvironmentType.PRODUCTION: ProductionSettings,
    }
    
    # Singleton instance
    _instance = None
    
    @classmethod
    def get_config(cls):
        """Get or create the configuration singleton for the current environment."""
        if cls._instance is None:
            # Determine environment from APP_ENVIRONMENT variable or default to development
            env_str = os.getenv("APP_ENVIRONMENT", "development").lower()
            
            # Convert to enum value or default to development if invalid
            if env_str == EnvironmentType.DEVELOPMENT:
                env = EnvironmentType.DEVELOPMENT
            elif env_str == EnvironmentType.TEST:
                env = EnvironmentType.TEST
            elif env_str == EnvironmentType.PRODUCTION:
                env = EnvironmentType.PRODUCTION
            else:
                print(f"Warning: Invalid environment '{env_str}', using development instead")
                env = EnvironmentType.DEVELOPMENT
            
            # Get appropriate settings class from mapping
            config_class = cls._config_map.get(env, DevelopmentSettings)
            
            # Create instance
            cls._instance = config_class()
            
            print(f"Created configuration for environment: {env}")
        
        return cls._instance
    
    @classmethod
    def create_config(cls, environment):
        """Create a new configuration instance for the specified environment."""
        config_class = cls._config_map.get(environment, DevelopmentSettings)
        return config_class()
    
    @classmethod
    def reset(cls):
        """Reset the singleton instance (primarily for testing)."""
        cls._instance = None

# Function to test the configuration factory
def test_config_factory():
    print("Testing configuration factory...")
    
    # Test development environment
    os.environ["APP_ENVIRONMENT"] = "development"
    ConfigFactory.reset()
    config = ConfigFactory.get_config()
    print(f"Development config type: {type(config).__name__}")
    print(f"DEBUG: {config.DEBUG}")
    print(f"LOG_LEVEL: {config.LOG_LEVEL}")
    print(f"DATABASE_URL: {config.DATABASE_URL}")
    assert isinstance(config, DevelopmentSettings)
    assert config.DEBUG is True
    assert config.LOG_LEVEL == "debug"
    
    # Test test environment
    os.environ["APP_ENVIRONMENT"] = "test"
    ConfigFactory.reset()
    config = ConfigFactory.get_config()
    print(f"\nTest config type: {type(config).__name__}")
    print(f"DEBUG: {config.DEBUG}")
    print(f"LOG_LEVEL: {config.LOG_LEVEL}")
    print(f"DATABASE_URL: {config.DATABASE_URL}")
    assert isinstance(config, TestSettings)
    assert config.TESTING is True
    
    # Test production environment
    os.environ["APP_ENVIRONMENT"] = "production"
    ConfigFactory.reset()
    config = ConfigFactory.get_config()
    print(f"\nProduction config type: {type(config).__name__}")
    print(f"DEBUG: {config.DEBUG}")
    print(f"LOG_LEVEL: {config.LOG_LEVEL}")
    print(f"DATABASE_URL: {config.DATABASE_URL}")
    assert isinstance(config, ProductionSettings)
    assert config.DEBUG is False
    assert config.LOG_LEVEL == "warning"
    
    # Test invalid environment
    os.environ["APP_ENVIRONMENT"] = "invalid"
    ConfigFactory.reset()
    config = ConfigFactory.get_config()
    print(f"\nInvalid environment config type: {type(config).__name__}")
    assert isinstance(config, DevelopmentSettings)
    
    # Test create_config method
    dev_config = ConfigFactory.create_config(EnvironmentType.DEVELOPMENT)
    test_config = ConfigFactory.create_config(EnvironmentType.TEST)
    prod_config = ConfigFactory.create_config(EnvironmentType.PRODUCTION)
    
    print("\nTesting create_config method...")
    assert isinstance(dev_config, DevelopmentSettings)
    assert isinstance(test_config, TestSettings)
    assert isinstance(prod_config, ProductionSettings)
    
    print("All backend configuration tests passed!")
    return True

if __name__ == "__main__":
    test_config_factory()