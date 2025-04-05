from .base import BaseSettings, DockerSettings
from pydantic import ConfigDict, Field
from typing import List

class DevelopmentSettings(BaseSettings):
    """
    Development environment settings.
    
    Provides configuration optimized for development with:
    - Enhanced logging and debugging
    - Local database configuration
    - Relaxed security (for development only)
    - Documentation enabled
    
    These settings should NEVER be used in production.
    """
    
    # Override base settings for development
    DEBUG: bool = True
    LOG_LEVEL: str = "debug"  # More verbose logging in development
    SECRET_KEY: str = "development_secret_key_change_me"
    JWT_SECRET_KEY: str = "dev_jwt_key_for_testing_only"
    
    # Development database uses SQLite for local testing
    DATABASE_URL: str = "sqlite:///data/dev.sqlite"
    DB_SSL_REQUIRED: bool = False  # No SSL in development
    
    # Docker health check and invitation system
    SETUP_INVITATION_SYSTEM: bool = False
    
    # Development-specific settings
    RELOAD: bool = True  # Enable auto-reload for code changes
    ENABLE_DOCS: bool = True  # Enable API documentation
    ENABLE_SQL_LOGGING: bool = True  # Log SQL queries
    ENABLE_TRACE_REQUESTS: bool = True  # Trace API requests
    ENABLE_PERFORMANCE_LOGGING: bool = True  # Log performance data
    DEBUG_MODE: bool = True  # Extended debug features
    SLOW_FUNCTION_THRESHOLD: float = 0.5  # seconds, lower for dev environment
    
    # CORS settings more permissive for development
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # Allow all origins in development
    CORS_ORIGINS: List[str] = ["*"]  # Allow all origins in development
    
    # Ensure LOG_FORMAT is properly defined
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Environment identification
    APP_ENVIRONMENT: str = "development"
    ENVIRONMENT: str = "development"
    
    # Docker container settings
    WORKERS: int = 1  # Single worker for development
    AUTOMIGRATE: bool = True  # Auto-migrate database in development
    
    # Memory monitoring for development debugging
    MONITOR_MEMORY_USAGE: bool = True
    MEMORY_WARNING_THRESHOLD_MB: int = 512  # Lower threshold for development
    
    # Demo mode enabled for development
    DEMO_MODE: bool = True
    
    # Docker development settings
    docker: DockerSettings = Field(default_factory=lambda: DockerSettings(
        RUNNING_IN_DOCKER=DockerSettings.detect_docker(),
        CONTAINER_NAME="tap-backend-dev",
        HEALTH_CHECK_INTERVAL=15,  # More frequent health checks in development
        HEALTH_CHECK_TIMEOUT=10,
        HEALTH_CHECK_RETRIES=3,
        HEALTH_CHECK_START_PERIOD=30,  # Longer startup time for development
        GRACEFUL_SHUTDOWN_TIMEOUT=15,  # Shorter timeout for development
        MONITOR_MEMORY_USAGE=True,
        MEMORY_WARNING_THRESHOLD_MB=512,  # Lower memory threshold for development
        CPU_WARNING_THRESHOLD_PERCENT=90.0,  # Higher CPU threshold for development
        STRUCTURED_LOGGING=False,  # Human-readable logging in development
    ))
    
    model_config = ConfigDict(
        env_file=".env",  # Enable .env file loading in development
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # Allow extra fields in environment
    )