from .base import BaseSettings

class DevelopmentSettings(BaseSettings):
    """Development environment settings."""
    
    # Override base settings for development
    DEBUG: bool = True
    LOG_LEVEL: str = "debug"
    SECRET_KEY: str = "development_secret_key_change_me"
    
    # Development database uses SQLite for local testing
    DATABASE_URL: str = "sqlite:///tap_dev.db"
    DB_SSL_REQUIRED: bool = False
    
    # Development-specific settings
    RELOAD: bool = True
    ENABLE_DOCS: bool = True
    ENABLE_SQL_LOGGING: bool = True
    ENABLE_TRACE_REQUESTS: bool = True
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env.development"