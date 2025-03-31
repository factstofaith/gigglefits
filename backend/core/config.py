"""
Configuration module for the TAP Integration Platform.
This module uses a factory pattern to create the appropriate configuration
for the current environment (development, test, or production).
"""
import logging
from .config_factory import ConfigFactory, EnvironmentType

# Create logger for this module
logger = logging.getLogger(__name__)

# Create configuration singleton for current environment
settings = ConfigFactory.get_config()

# Log the loaded configuration
logger.info(f"Loaded configuration for environment: {settings.APP_ENVIRONMENT}")

# Helper function to get module-specific log level
def get_log_level_for_module(module_name: str) -> str:
    """
    Get the configured log level for a specific module
    
    Args:
        module_name: Name of the module
        
    Returns:
        Log level string (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # First check if there's a specific level for this exact module
    if module_name in settings.MODULE_LOG_LEVELS:
        return settings.MODULE_LOG_LEVELS[module_name]
    
    # Then check for parent modules (e.g., "adapters.api_adapter" should match "adapters")
    for prefix, level in settings.MODULE_LOG_LEVELS.items():
        if module_name.startswith(f"{prefix}."):
            return level
    
    # Default to the global log level
    return settings.LOG_LEVEL