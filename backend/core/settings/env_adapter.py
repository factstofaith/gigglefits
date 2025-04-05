"""
Environment Variable Adapter for TAP Integration Platform

This module provides compatibility with the standardized SERVICE_* environment variables
while maintaining support for the existing environment variable formats.

Example usage:
    from core.settings.env_adapter import adapt_environment_variables

    # Call at application startup
    adapt_environment_variables()
"""

import os
import logging
from typing import Dict, Optional

# Configure logging
logger = logging.getLogger(__name__)

# Environment variable mapping between standardized SERVICE_* and legacy format
VARIABLE_MAPPING = {
    # Service identification
    'SERVICE_NAME': None,  # No direct mapping
    'SERVICE_ENV': 'APP_ENVIRONMENT',
    'SERVICE_VERSION': 'APP_VERSION',
    
    # Environment configuration
    'SERVICE_LOG_LEVEL': 'LOG_LEVEL',
    'SERVICE_DEBUG': 'DEBUG',
    
    # Application configuration  
    'SERVICE_CORS_ORIGINS': 'CORS_ORIGINS',
    'SERVICE_DATABASE_URL': 'DATABASE_URL',
    'SERVICE_SECRET_KEY': 'JWT_SECRET_KEY',
    
    # Feature flags
    'SERVICE_ENABLE_INVITATIONS': 'SETUP_INVITATION_SYSTEM',
    'SERVICE_ENABLE_MFA': None,  # No direct mapping
    
    # Database configuration
    'SERVICE_DB_SSL_REQUIRED': 'DB_SSL_REQUIRED',
    'SERVICE_DB_AUTOMIGRATE': 'AUTOMIGRATE',
    'SERVICE_DB_AUTOSEED': 'AUTO_SEED',
    
    # Performance tuning
    'SERVICE_WORKERS': 'WORKERS',
    
    # Authentication settings
    'SERVICE_AUTH_TOKEN_EXPIRY': 'ACCESS_TOKEN_EXPIRE_MINUTES',
    'SERVICE_AUTH_REFRESH_TOKEN_EXPIRY': 'REFRESH_TOKEN_EXPIRE_DAYS',
    'SERVICE_AUTH_COOKIE_DOMAIN': None,  # No direct mapping
    'SERVICE_AUTH_COOKIE_PATH': None,    # No direct mapping
    'SERVICE_AUTH_COOKIE_SECURE': None,  # No direct mapping
    'SERVICE_AUTH_COOKIE_HTTPONLY': None, # No direct mapping
    'SERVICE_AUTH_COOKIE_SAMESITE': None, # No direct mapping
    
    # CORS configuration
    'SERVICE_CORS_ALLOW_CREDENTIALS': None, # No direct mapping
    'SERVICE_CORS_ALLOW_METHODS': None,     # No direct mapping
    'SERVICE_CORS_ALLOW_HEADERS': None,     # No direct mapping
}

def adapt_environment_variables():
    """
    Adapts environment variables by checking for standardized SERVICE_* variables
    and creating corresponding legacy variables for backward compatibility
    """
    # Track which variables were adapted
    adapted_variables = []
    
    # Process each mapping
    for standard_key, legacy_key in VARIABLE_MAPPING.items():
        # Skip if no legacy mapping exists
        if legacy_key is None:
            continue
        
        # Check if the standardized variable exists
        if standard_key in os.environ:
            standard_value = os.environ[standard_key]
            
            # Set the legacy variable if it doesn't exist
            if legacy_key not in os.environ:
                os.environ[legacy_key] = standard_value
                adapted_variables.append(f"{standard_key} -> {legacy_key}")
    
    # Special cases for complex mappings
    
    # SERVICE_ENV -> multiple legacy variables
    if 'SERVICE_ENV' in os.environ:
        env_value = os.environ['SERVICE_ENV']
        for legacy_env_var in ['APP_ENVIRONMENT', 'ENVIRONMENT', 'NODE_ENV']:
            if legacy_env_var not in os.environ:
                os.environ[legacy_env_var] = env_value
                adapted_variables.append(f"SERVICE_ENV -> {legacy_env_var}")
    
    # SERVICE_DEBUG -> multiple debug flags
    if 'SERVICE_DEBUG' in os.environ:
        debug_value = os.environ['SERVICE_DEBUG']
        for legacy_debug_var in ['DEBUG', 'DEBUG_MODE']:
            if legacy_debug_var not in os.environ:
                os.environ[legacy_debug_var] = debug_value
                adapted_variables.append(f"SERVICE_DEBUG -> {legacy_debug_var}")
    
    # Handle authentication settings
    if 'SERVICE_AUTH_TOKEN_EXPIRY' in os.environ:
        os.environ['ACCESS_TOKEN_EXPIRE_MINUTES'] = os.environ['SERVICE_AUTH_TOKEN_EXPIRY']
        adapted_variables.append(f"SERVICE_AUTH_TOKEN_EXPIRY -> ACCESS_TOKEN_EXPIRE_MINUTES")
    
    if 'SERVICE_AUTH_REFRESH_TOKEN_EXPIRY' in os.environ:
        os.environ['REFRESH_TOKEN_EXPIRE_DAYS'] = os.environ['SERVICE_AUTH_REFRESH_TOKEN_EXPIRY']
        adapted_variables.append(f"SERVICE_AUTH_REFRESH_TOKEN_EXPIRY -> REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Set default values for cookie settings if not already defined
    if 'SERVICE_AUTH_COOKIE_DOMAIN' in os.environ:
        os.environ['AUTH_COOKIE_DOMAIN'] = os.environ['SERVICE_AUTH_COOKIE_DOMAIN']
        adapted_variables.append(f"SERVICE_AUTH_COOKIE_DOMAIN -> AUTH_COOKIE_DOMAIN")
    
    if 'SERVICE_AUTH_COOKIE_PATH' in os.environ:
        os.environ['AUTH_COOKIE_PATH'] = os.environ['SERVICE_AUTH_COOKIE_PATH']
        adapted_variables.append(f"SERVICE_AUTH_COOKIE_PATH -> AUTH_COOKIE_PATH")
    
    if 'SERVICE_AUTH_COOKIE_SECURE' in os.environ:
        os.environ['AUTH_COOKIE_SECURE'] = os.environ['SERVICE_AUTH_COOKIE_SECURE']
        adapted_variables.append(f"SERVICE_AUTH_COOKIE_SECURE -> AUTH_COOKIE_SECURE")
    
    if 'SERVICE_AUTH_COOKIE_HTTPONLY' in os.environ:
        os.environ['AUTH_COOKIE_HTTPONLY'] = os.environ['SERVICE_AUTH_COOKIE_HTTPONLY']
        adapted_variables.append(f"SERVICE_AUTH_COOKIE_HTTPONLY -> AUTH_COOKIE_HTTPONLY")
    
    if 'SERVICE_AUTH_COOKIE_SAMESITE' in os.environ:
        os.environ['AUTH_COOKIE_SAMESITE'] = os.environ['SERVICE_AUTH_COOKIE_SAMESITE']
        adapted_variables.append(f"SERVICE_AUTH_COOKIE_SAMESITE -> AUTH_COOKIE_SAMESITE")
    
    # Handle CORS specific settings for credentials
    if 'SERVICE_CORS_ALLOW_CREDENTIALS' in os.environ:
        os.environ['CORS_ALLOW_CREDENTIALS'] = os.environ['SERVICE_CORS_ALLOW_CREDENTIALS']
        adapted_variables.append(f"SERVICE_CORS_ALLOW_CREDENTIALS -> CORS_ALLOW_CREDENTIALS")
    
    # Log adapted variables in debug mode
    if adapted_variables and os.environ.get('LOG_LEVEL', '').lower() == 'debug':
        logger.debug(f"Adapted {len(adapted_variables)} environment variables: {', '.join(adapted_variables)}")

def get_standardized_env(key: str, default: Optional[str] = None) -> str:
    """
    Gets an environment variable with preference for the standardized format
    
    Args:
        key: The legacy environment variable name
        default: Default value if not found
        
    Returns:
        The environment variable value
    """
    # Find the standardized key if it exists
    standard_key = None
    for std_key, legacy_key in VARIABLE_MAPPING.items():
        if legacy_key == key:
            standard_key = std_key
            break
    
    # Check standardized key first
    if standard_key and standard_key in os.environ:
        return os.environ[standard_key]
    
    # Then check legacy key
    if key in os.environ:
        return os.environ[key]
    
    # Finally return default
    return default

# Function to initialize the adapter
def initialize():
    """Initialize the environment variable adapter"""
    adapt_environment_variables()
    return True