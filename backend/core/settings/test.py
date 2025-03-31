from .base import BaseSettings

class TestSettings(BaseSettings):
    """Test environment settings."""
    
    # Override base settings for testing
    DEBUG: bool = True
    LOG_LEVEL: str = "debug"
    SECRET_KEY: str = "test_secret_key_change_me"
    
    # Test database defaults to PostgreSQL in Docker
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/tap_test"
    DB_SSL_REQUIRED: bool = False
    
    # Test-specific settings
    TESTING: bool = True
    ENABLE_DOCS: bool = True
    ENABLE_SQL_LOGGING: bool = False
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env.test"