from .base import BaseSettings
from pydantic import ConfigDict
from typing import List

class TestSettings(BaseSettings):
    """
    Test environment settings.
    
    Provides configuration optimized for testing with:
    - In-memory or isolated database
    - Simplified security for testing
    - Testing-specific features enabled
    - Minimal logging during tests
    
    These settings should be used for automated testing only.
    """
    
    # Override base settings for testing
    DEBUG: bool = True
    LOG_LEVEL: str = "debug"  # More verbose for test validation
    SECRET_KEY: str = "test_secret_key_change_me"
    JWT_SECRET_KEY: str = "test_jwt_key_for_testing_only"
    
    # Test database settings
    DATABASE_URL: str = "sqlite:///data/test_db.sqlite"  # Default to SQLite for tests
    DB_SSL_REQUIRED: bool = False  # No SSL in testing
    
    # Test-specific settings
    TESTING: bool = True
    ENABLE_DOCS: bool = True  # Enable docs for test verification
    ENABLE_SQL_LOGGING: bool = False  # Disable SQL logging during tests
    ENABLE_PERFORMANCE_LOGGING: bool = False  # Disable performance logging
    ENABLE_TRACE_REQUESTS: bool = False  # Disable request tracing
    
    # Memory monitoring disabled for tests
    MONITOR_MEMORY_USAGE: bool = False
    
    # Environment identification
    APP_ENVIRONMENT: str = "test"
    ENVIRONMENT: str = "test"
    
    # CORS settings for testing
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # Allow all origins for testing
    CORS_ORIGINS: List[str] = ["*"]  # Allow all origins for testing
    
    # Docker container settings
    WORKERS: int = 1  # Single worker for testing
    AUTOMIGRATE: bool = True  # Auto-migrate database in testing
    
    # API rate limiting - disabled for tests
    RATE_LIMIT_REQUESTS: int = 10000  # Effectively no rate limiting
    
    # Authentication settings for testing
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # Longer expiry for tests
    
    # Demo mode enabled for testing
    DEMO_MODE: bool = True
    
    model_config = ConfigDict(
        env_file=None,  # Disable .env file loading in tests
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # Allow extra fields in environment
    )