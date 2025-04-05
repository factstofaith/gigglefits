from .base import BaseSettings
from pydantic import ConfigDict
from typing import List

class ProductionSettings(BaseSettings):
    """
    Production environment settings.
    
    Provides configuration optimized for production with:
    - Minimal logging (only warnings and errors)
    - Strict security settings
    - No debug features
    - Enhanced performance configuration
    - Documentation disabled
    
    These settings should be used in production environments only.
    """
    
    # Override base settings for production
    DEBUG: bool = False
    DEBUG_MODE: bool = False
    LOG_LEVEL: str = "warning"  # Less verbose logging in production
    
    # Required fields must be set in production (in env or .env.production)
    SECRET_KEY: str = "production_secret_key_for_testing"  # Default for testing only
    JWT_SECRET_KEY: str = "production_jwt_key_for_testing"  # Default for testing only
    DATABASE_URL: str = "postgresql://user:password@postgres:5432/production"  # Default for testing only
    
    # Production-specific settings
    ENABLE_DOCS: bool = False  # Disable API documentation
    ENABLE_SQL_LOGGING: bool = False  # No SQL query logging
    ENABLE_TRACE_REQUESTS: bool = False  # No request tracing
    ENABLE_PERFORMANCE_LOGGING: bool = False  # No performance logging
    
    # Security settings
    DB_SSL_REQUIRED: bool = True  # Always require SSL in production
    
    # Higher rate limiting for production
    RATE_LIMIT_REQUESTS: int = 200
    RATE_LIMIT_WINDOW: int = 3600
    
    # API health monitoring
    MONITOR_MEMORY_USAGE: bool = True
    MEMORY_WARNING_THRESHOLD_MB: int = 2048  # 2GB
    
    # Environment identification
    APP_ENVIRONMENT: str = "production"
    ENVIRONMENT: str = "production"
    
    # CORS settings for production (restrictive)
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://app.example.com", 
        "https://api.example.com"
    ]  # Specific origins only in production
    CORS_ORIGINS: List[str] = [
        "https://app.example.com", 
        "https://api.example.com"
    ]  # Specific origins only in production
    
    # Docker container settings
    WORKERS: int = 4  # Multiple workers for production
    AUTOMIGRATE: bool = False  # No auto-migration in production
    
    # Demo mode disabled for production
    DEMO_MODE: bool = False
    
    model_config = ConfigDict(
        env_file=None,  # Disable .env file loading in tests
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # Allow extra fields in environment
    )