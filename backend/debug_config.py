#!/usr/bin/env python3
"""Debug script for configuration issues."""

import os
import sys
import traceback

# Add backend to path
sys.path.insert(0, '/home/ai-dev/Desktop/tap-integration-platform/backend')

# Import configuration factory
from core.config_factory import ConfigFactory, EnvironmentType

# Set required environment variables
os.environ.update({
    'APP_ENVIRONMENT': 'development',
    'DATABASE_URL': 'sqlite:///data/test.sqlite',
    'SECRET_KEY': 'test_secret_key',
    'JWT_SECRET_KEY': 'test_jwt_secret',
    'CORS_ORIGINS': 'http://localhost:3000',
    'BACKEND_CORS_ORIGINS': 'http://localhost:3000',
    'MODULE_LOG_LEVELS': '{}'
})

# Reset configuration
ConfigFactory.reset()

# Try to create config
try:
    print("Attempting to create config...")
    config = ConfigFactory.get_config()
    print(f"Success! Config type: {type(config)}")
    print(f"APP_ENVIRONMENT: {getattr(config, 'APP_ENVIRONMENT', 'Not found')}")
    print(f"DEBUG: {getattr(config, 'DEBUG', 'Not found')}")
    print(f"LOG_LEVEL: {getattr(config, 'LOG_LEVEL', 'Not found')}")
except Exception as e:
    print(f"Error creating config: {e}")
    traceback.print_exc()