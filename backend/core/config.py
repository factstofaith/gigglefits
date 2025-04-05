"""
Configuration module for the TAP Integration Platform.
Provides a simplified configuration interface for Docker development.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator

# Import the environment variable adapter
from core.settings.env_adapter import initialize as initialize_env_adapter

# Initialize the adapter to ensure compatibility with standardized variables
initialize_env_adapter()

# Configure logging
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables with defaults
    """
    # Base configuration
    APP_NAME: str = "TAP Integration Platform"
    APP_VERSION: str = "1.0.0"
    APP_ENVIRONMENT: str = os.environ.get("APP_ENVIRONMENT", "development")
    API_V1_STR: str = "/api/v1"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "debug")
    WORKERS: int = int(os.environ.get("WORKERS", "1"))
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3456"]
    CORS_ALLOW_CREDENTIALS: bool = os.environ.get("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # Database settings
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///data/local_dev.sqlite")
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO: bool = os.environ.get("DB_ECHO", "false").lower() == "true"
    DB_SSL_REQUIRED: bool = os.environ.get("DB_SSL_REQUIRED", "false").lower() == "true"
    
    # Security settings
    SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "local_development_secret_change_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Authentication cookie settings
    AUTH_COOKIE_DOMAIN: Optional[str] = os.environ.get("AUTH_COOKIE_DOMAIN")
    AUTH_COOKIE_PATH: str = os.environ.get("AUTH_COOKIE_PATH", "/")
    AUTH_COOKIE_SECURE: bool = os.environ.get("AUTH_COOKIE_SECURE", "true").lower() == "true"
    AUTH_COOKIE_HTTPONLY: bool = os.environ.get("AUTH_COOKIE_HTTPONLY", "true").lower() == "true"
    AUTH_COOKIE_SAMESITE: str = os.environ.get("AUTH_COOKIE_SAMESITE", "lax")
    
    # Feature flags
    DEBUG_MODE: bool = os.environ.get("DEBUG_MODE", "true").lower() == "true"
    DEBUG: bool = os.environ.get("DEBUG", "true").lower() == "true"
    DEMO_MODE: bool = os.environ.get("DEMO_MODE", "false").lower() == "true"
    SETUP_INVITATION_SYSTEM: bool = os.environ.get("SETUP_INVITATION_SYSTEM", "false").lower() == "true"
    MONITOR_MEMORY_USAGE: bool = os.environ.get("MONITOR_MEMORY_USAGE", "false").lower() == "true"
    MEMORY_WARNING_THRESHOLD_MB: int = 1024  # 1GB warning threshold
    
    # Docker settings
    RUNNING_IN_DOCKER: bool = os.environ.get("RUNNING_IN_DOCKER", "false").lower() == "true"
    CONTAINER_NAME: Optional[str] = os.environ.get("CONTAINER_NAME")
    GRACEFUL_SHUTDOWN_TIMEOUT: int = int(os.environ.get("GRACEFUL_SHUTDOWN_TIMEOUT", "30"))
    
    # API Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # Module-specific log levels
    MODULE_LOG_LEVELS: Dict[str, str] = {}
    
    # Migration settings
    AUTOMIGRATE: bool = os.environ.get("AUTOMIGRATE", "false").lower() == "true"
    AUTO_SEED: bool = os.environ.get("AUTO_SEED", "true").lower() == "true"
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        """
        Validate and convert CORS origins from various formats
        """
        if isinstance(v, str):
            # If it's a JSON string, parse it
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # Otherwise, split by comma
            return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# Global settings instance
_settings = None

def get_settings() -> Settings:
    """
    Factory function to create and return the settings object
    """
    global _settings
    if _settings is None:
        _settings = Settings()
        
        # Load module-specific log levels from environment variables
        for key, value in os.environ.items():
            if key.startswith("LOG_LEVEL_") and key != "LOG_LEVEL":
                module_name = key[10:].lower().replace("_", ".")
                _settings.MODULE_LOG_LEVELS[module_name] = value
    
    return _settings