from typing import List, Optional, Union, Dict, Any, Annotated
from pydantic import field_validator, AnyHttpUrl, ConfigDict, Field
from pydantic_settings import BaseSettings as PydanticBaseSettings
import json
import os
import logging
import socket
from enum import Enum

logger = logging.getLogger(__name__)

class CORSOrigin(str, Enum):
    """Special CORS origin values including wildcard."""
    WILDCARD = "*"

class DockerSettings(PydanticBaseSettings):
    """
    Docker-specific configuration settings for containerized environments.
    
    This class provides Docker-specific configuration options that are only
    relevant when running in a container. These settings help with container
    orchestration, health checks, and graceful shutdown.
    """
    # Docker environment detection
    RUNNING_IN_DOCKER: bool = False
    CONTAINER_NAME: Optional[str] = None
    CONTAINER_ID: Optional[str] = None
    DOCKER_COMPOSE_PROJECT: Optional[str] = None
    
    # Container health check configuration
    HEALTH_CHECK_INTERVAL: int = 30  # seconds
    HEALTH_CHECK_TIMEOUT: int = 5  # seconds
    HEALTH_CHECK_RETRIES: int = 3
    HEALTH_CHECK_START_PERIOD: int = 15  # seconds
    
    # Graceful shutdown settings
    GRACEFUL_SHUTDOWN_TIMEOUT: int = 30  # seconds
    GRACEFUL_SHUTDOWN_ATTEMPTS: int = 3
    
    # Resource monitoring
    MONITOR_MEMORY_USAGE: bool = True
    MEMORY_WARNING_THRESHOLD_MB: int = 1024  # 1GB
    CPU_WARNING_THRESHOLD_PERCENT: float = 80.0
    
    # Container networking
    CONTAINER_HOST: str = "0.0.0.0"
    CONTAINER_PORT: int = 8000
    
    # Docker-specific logging
    DOCKER_LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s - %(container)s"
    STRUCTURED_LOGGING: bool = True  # Use JSON logging in Docker
    
    @classmethod
    def detect_docker(cls) -> bool:
        """
        Detect if running in a Docker container using multiple methods.
        
        Returns:
            bool: True if running in Docker, False otherwise
        """
        # Method 1: Check for common Docker environment variables
        if os.environ.get("RUNNING_IN_DOCKER", "").lower() == "true":
            return True
            
        # Method 2: Check for container environment file
        if os.path.exists("/.dockerenv"):
            return True
        
        # Method 3: Check for Docker control groups
        try:
            with open("/proc/1/cgroup", "r") as f:
                return any("docker" in line for line in f)
        except (IOError, FileNotFoundError):
            pass
        
        # Method 4: Check hostname (Docker often sets to container ID)
        try:
            hostname = socket.gethostname()
            if len(hostname) == 12 and all(c in "0123456789abcdef" for c in hostname):
                return True
        except:
            pass
            
        return False
    
    @classmethod
    def create_docker_settings(cls) -> "DockerSettings":
        """
        Create Docker settings based on environment detection.
        
        Returns:
            DockerSettings: Configured Docker settings
        """
        is_docker = cls.detect_docker()
        
        if not is_docker:
            # Return minimal Docker settings if not in container
            return DockerSettings(RUNNING_IN_DOCKER=False)
        
        # Get container information
        container_name = os.environ.get("CONTAINER_NAME", socket.gethostname())
        container_id = os.environ.get("HOSTNAME", socket.gethostname())
        compose_project = os.environ.get("COMPOSE_PROJECT_NAME", "")
        
        # Get resource monitoring settings
        memory_threshold = int(os.environ.get("MEMORY_WARNING_THRESHOLD_MB", "1024"))
        cpu_threshold = float(os.environ.get("CPU_WARNING_THRESHOLD_PERCENT", "80.0"))
        
        # Get shutdown settings
        shutdown_timeout = int(os.environ.get("GRACEFUL_SHUTDOWN_TIMEOUT", "30"))
        
        # Create and return Docker settings
        return DockerSettings(
            RUNNING_IN_DOCKER=True,
            CONTAINER_NAME=container_name,
            CONTAINER_ID=container_id,
            DOCKER_COMPOSE_PROJECT=compose_project,
            MEMORY_WARNING_THRESHOLD_MB=memory_threshold,
            CPU_WARNING_THRESHOLD_PERCENT=cpu_threshold,
            GRACEFUL_SHUTDOWN_TIMEOUT=shutdown_timeout,
            STRUCTURED_LOGGING=True,
            MONITOR_MEMORY_USAGE=True
        )

class BaseSettings(PydanticBaseSettings):
    """
    Base settings class with common configuration values.
    
    This class provides standardized environment variable handling with
    validation, type conversion, and sensible defaults. It uses Pydantic
    for validation and settings management.
    
    Environment variables can be provided via:
    1. .env file in project root
    2. OS environment variables
    
    Configuration values are validated at startup, with appropriate error
    messages for missing required values.
    """
    
    # Application settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "TAP Integration Platform"
    DEBUG: bool = False
    DEBUG_MODE: bool = False  # Extended debug mode for additional logging
    LOG_LEVEL: str = "info"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: str = ""  # Empty string means logging to file is disabled
    APP_ENVIRONMENT: str = "development"
    ENVIRONMENT: str = "development"  # For backward compatibility
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"] 
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]  # Alternative name for the same setting
    
    # Security settings
    SECRET_KEY: str
    JWT_SECRET_KEY: str = ""  # Alternatively, use JWT_SECRET_KEY if provided
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
    ENABLE_PERFORMANCE_LOGGING: bool = False
    
    # Memory usage monitoring
    MONITOR_MEMORY_USAGE: bool = False
    MEMORY_WARNING_THRESHOLD_MB: int = 1024  # 1GB
    
    # Performance monitoring
    SLOW_FUNCTION_THRESHOLD: float = 1.0  # seconds
    
    # Module-specific log levels
    MODULE_LOG_LEVELS: Dict[str, str] = {}
    
    # Docker environment settings - simplified version here, full in DockerSettings
    SETUP_INVITATION_SYSTEM: bool = False
    WORKERS: int = 1
    AUTOMIGRATE: bool = False
    
    # Docker configuration
    docker: DockerSettings = Field(default_factory=DockerSettings.create_docker_settings)
    
    # Demo mode - enables certain features for quick testing
    DEMO_MODE: bool = False
    
    # Validators
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str], List[AnyHttpUrl], List[CORSOrigin]]) -> Union[List[str], List[AnyHttpUrl], List[CORSOrigin]]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            # Handle wildcard as a special case
            if v.strip() == "*":
                return [CORSOrigin.WILDCARD]
            # JSON array parsing
            elif v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # Comma-separated string
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins_alt(cls, v: Union[str, List[str], List[AnyHttpUrl], List[CORSOrigin]]) -> Union[List[str], List[AnyHttpUrl], List[CORSOrigin]]:
        """Parse CORS_ORIGINS from string or list."""
        return cls.assemble_cors_origins(v)
    
    @field_validator("SECRET_KEY", mode="after")
    @classmethod
    def validate_secret_key(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        """Validate that either SECRET_KEY or JWT_SECRET_KEY is set."""
        jwt_key = values.data.get("JWT_SECRET_KEY")
        if not v and not jwt_key and cls.__name__ == "BaseSettings":
            # Only validate in BaseSettings - let subclasses handle their own defaults
            raise ValueError("Either SECRET_KEY or JWT_SECRET_KEY must be set")
        return v or jwt_key
    
    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate that DATABASE_URL is set."""
        if not v and cls.__name__ == "BaseSettings":
            # Only validate in BaseSettings - let subclasses handle their own defaults
            raise ValueError("DATABASE_URL must be set")
        return v
    
    @field_validator("MODULE_LOG_LEVELS", mode="before")
    @classmethod
    def parse_module_log_levels(cls, v: Union[str, Dict[str, str]]) -> Dict[str, str]:
        """Parse MODULE_LOG_LEVELS from JSON string."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return {}
        return v or {}
    
    @field_validator("ENVIRONMENT", mode="after")
    @classmethod
    def validate_environment(cls, v: str, values: Dict[str, Any]) -> str:
        """Ensure ENVIRONMENT and APP_ENVIRONMENT are consistent."""
        app_env = values.data.get("APP_ENVIRONMENT")
        # Use a consistent environment value
        if app_env and v != app_env:
            logger.warning(f"ENVIRONMENT ({v}) and APP_ENVIRONMENT ({app_env}) differ, using APP_ENVIRONMENT")
            return app_env
        return v
    
    model_config = ConfigDict(
        case_sensitive=True,
        env_file=None,  # Disable .env file loading in tests
        env_file_encoding="utf-8",
        extra="ignore"  # Allow extra fields in environment without errors
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert settings to a dictionary, excluding sensitive values."""
        data = self.model_dump()
        # Exclude sensitive information
        sensitive_keys = ["SECRET_KEY", "JWT_SECRET_KEY", "ENCRYPTION_KEY", "ENCRYPTION_SALT"]
        for key in sensitive_keys:
            if key in data and data[key]:
                data[key] = "****REDACTED****"
        return data
    
    def log_settings(self, log_level: str = "info") -> None:
        """Log all settings at the specified log level."""
        logger_method = getattr(logger, log_level, logger.info)
        
        settings_dict = self.to_dict()
        logger_method("Application settings:")
        
        for key, value in settings_dict.items():
            logger_method(f"  {key}: {value}")
            
    @classmethod
    def get_environment_value(cls, key: str, default: Any = None) -> Any:
        """
        Get an environment variable with fallback to default.
        This is useful for accessing environment variables outside the settings class.
        """
        return os.environ.get(key, default)
    
    def is_docker(self) -> bool:
        """Check if running in Docker container."""
        return self.docker.RUNNING_IN_DOCKER
    
    def get_docker_info(self) -> Dict[str, Any]:
        """Get Docker container information as a dictionary."""
        if not self.is_docker():
            return {"running_in_docker": False}
        
        return {
            "running_in_docker": True,
            "container_name": self.docker.CONTAINER_NAME,
            "container_id": self.docker.CONTAINER_ID,
            "project": self.docker.DOCKER_COMPOSE_PROJECT,
            "graceful_shutdown_timeout": self.docker.GRACEFUL_SHUTDOWN_TIMEOUT
        }