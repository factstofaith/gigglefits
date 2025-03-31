from enum import Enum
from typing import Dict, Type, Optional
import os
import logging

# Import settings classes
from .settings import BaseSettings, DevelopmentSettings, TestSettings, ProductionSettings

logger = logging.getLogger(__name__)

class EnvironmentType(str, Enum):
    """Environment types for configuration."""
    DEVELOPMENT = "development"
    TEST = "test"
    PRODUCTION = "production"

class ConfigFactory:
    """Factory for creating environment-specific configuration."""
    
    # Mapping of environment types to configuration classes
    _config_map: Dict[EnvironmentType, Type[BaseSettings]] = {
        EnvironmentType.DEVELOPMENT: DevelopmentSettings,
        EnvironmentType.TEST: TestSettings,
        EnvironmentType.PRODUCTION: ProductionSettings,
    }
    
    # Singleton instance
    _instance: Optional[BaseSettings] = None
    
    @classmethod
    def get_config(cls) -> BaseSettings:
        """Get or create the configuration singleton for the current environment."""
        if cls._instance is None:
            # Determine environment from APP_ENVIRONMENT variable or default to development
            env_str = os.getenv("APP_ENVIRONMENT", "development").lower()
            
            # Convert to enum value or default to development if invalid
            try:
                env = EnvironmentType(env_str)
            except ValueError:
                logger.warning(f"Invalid environment '{env_str}', using development instead")
                env = EnvironmentType.DEVELOPMENT
            
            # Get appropriate settings class from mapping
            config_class = cls._config_map.get(env, DevelopmentSettings)
            
            # Create instance
            cls._instance = config_class()
            
            logger.info(f"Created configuration for environment: {env}")
        
        return cls._instance
    
    @classmethod
    def create_config(cls, environment: EnvironmentType) -> BaseSettings:
        """Create a new configuration instance for the specified environment."""
        config_class = cls._config_map.get(environment, DevelopmentSettings)
        return config_class()
    
    @classmethod
    def reset(cls) -> None:
        """Reset the singleton instance (primarily for testing)."""
        cls._instance = None