from enum import Enum
from typing import Dict, Type, Optional, Any
import os
import logging
import socket

# Import settings classes
from .settings import BaseSettings, DevelopmentSettings, TestSettings, ProductionSettings
from .settings.base import DockerSettings

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
            
            # Create instance with environment variables
            cls._instance = config_class()
            
            # Ensure environment is properly set
            if hasattr(cls._instance, "APP_ENVIRONMENT"):
                cls._instance.APP_ENVIRONMENT = env
            if hasattr(cls._instance, "ENVIRONMENT"):
                cls._instance.ENVIRONMENT = env
            
            # Log environment information
            is_docker = cls._instance.is_docker()
            logger.info(f"Created configuration for environment: {env}")
            
            # Log Docker-specific information if running in container
            if is_docker:
                docker_info = cls._instance.get_docker_info()
                container_name = docker_info.get("container_name", "unknown")
                container_id = docker_info.get("container_id", "unknown")
                logger.info(f"Running in Docker container: {container_name} (ID: {container_id})")
        
        return cls._instance
    
    @classmethod
    def create_config(cls, environment: EnvironmentType) -> BaseSettings:
        """Create a new configuration instance for the specified environment."""
        config_class = cls._config_map.get(environment, DevelopmentSettings)
        config = config_class()
        
        # Ensure environment is properly set
        if hasattr(config, "APP_ENVIRONMENT"):
            config.APP_ENVIRONMENT = environment
        if hasattr(config, "ENVIRONMENT"):
            config.ENVIRONMENT = environment
        
        # Log environment and Docker information
        is_docker = config.is_docker()
        logger.info(f"Created configuration for environment: {environment}")
        
        if is_docker:
            docker_info = config.get_docker_info()
            container_name = docker_info.get("container_name", "unknown")
            container_id = docker_info.get("container_id", "unknown")
            logger.info(f"Running in Docker container: {container_name} (ID: {container_id})")
            
        return config
    
    @classmethod
    def reset(cls) -> None:
        """Reset the singleton instance (primarily for testing)."""
        cls._instance = None
    
    @classmethod
    def is_docker(cls) -> bool:
        """Check if running in Docker container."""
        config = cls.get_config()
        return config.is_docker()
    
    @classmethod
    def get_docker_settings(cls) -> Optional[DockerSettings]:
        """Get Docker-specific settings if running in Docker container."""
        config = cls.get_config()
        if config.is_docker():
            return config.docker
        return None

# For backward compatibility
def get_config() -> BaseSettings:
    """Get the configuration singleton for the current environment."""
    return ConfigFactory.get_config()