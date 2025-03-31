from .base import BaseSettings

class ProductionSettings(BaseSettings):
    """Production environment settings."""
    
    # Override base settings for production
    DEBUG: bool = False
    LOG_LEVEL: str = "warning"
    
    # Production-specific settings
    ENABLE_DOCS: bool = False
    ENABLE_SQL_LOGGING: bool = False
    ENABLE_TRACE_REQUESTS: bool = False
    
    # Higher rate limiting for production
    RATE_LIMIT_REQUESTS: int = 200
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env.production"