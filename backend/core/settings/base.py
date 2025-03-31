from typing import List, Optional, Union, Dict, Any
from pydantic import BaseSettings as PydanticBaseSettings, field_validator, AnyHttpUrl

class BaseSettings(PydanticBaseSettings):
    """Base settings class with common configuration values."""
    
    # Application settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "TAP Integration Platform"
    DEBUG: bool = False
    LOG_LEVEL: str = "info"
    APP_ENVIRONMENT: str = "development"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Security settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Encryption settings
    ENCRYPTION_KEY: str = ""
    ENCRYPTION_SALT: str = ""
    ENCRYPTION_KEY_ROTATION: str = "{}"
    
    # Security monitoring settings
    LOG_SECURITY_FILE: str = "security.log"
    SECURITY_LOGIN_FAILURE_THRESHOLD: int = 5
    SECURITY_LOGIN_FAILURE_WINDOW_MINUTES: int = 30
    SECURITY_RATE_LIMIT_THRESHOLD: int = 10
    SECURITY_RATE_LIMIT_WINDOW_MINUTES: int = 60
    MALICIOUS_IPS_FILE: str = "malicious_ips.txt"
    ALLOW_PRIVATE_IPS: bool = False
    
    # Database settings
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_SSL_REQUIRED: bool = True
    DB_USE_CONNECTION_POOLING: bool = True
    
    # API rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600  # In seconds
    
    # Debug feature flags
    ENABLE_TRACE_REQUESTS: bool = False
    ENABLE_SQL_LOGGING: bool = False
    
    # Memory usage monitoring
    MONITOR_MEMORY_USAGE: bool = False
    MEMORY_WARNING_THRESHOLD_MB: int = 1024  # 1GB
    
    # Module-specific log levels
    MODULE_LOG_LEVELS: Dict[str, str] = {}
    
    # Validators
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @field_validator("SECRET_KEY", mode="after")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Validate that SECRET_KEY is set."""
        if not v:
            raise ValueError("SECRET_KEY must be set")
        return v
    
    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate that DATABASE_URL is set."""
        if not v:
            raise ValueError("DATABASE_URL must be set")
        return v
    
    @field_validator("MODULE_LOG_LEVELS", mode="before")
    @classmethod
    def parse_module_log_levels(cls, v: Union[str, Dict[str, str]]) -> Dict[str, str]:
        """Parse MODULE_LOG_LEVELS from JSON string."""
        import json
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return {}
        return v or {}
    
    class Config:
        """Pydantic configuration."""
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"