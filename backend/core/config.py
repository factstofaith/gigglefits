"""
Configuration settings for the application.
"""

import os
from typing import List, Optional
from pydantic import BaseModel

class Settings(BaseModel):
    """Application settings"""
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "TAP Integration Platform"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Auth settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Custom settings
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "True").lower() == "true"

# Create settings instance
settings = Settings()