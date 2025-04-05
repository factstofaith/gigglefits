#!/usr/bin/env python3
"""
Debug script to understand the CORS settings validation in Pydantic.
"""

import os
import json
import logging
import traceback
from pydantic import AnyHttpUrl
from typing import List

logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def display_traceback(e):
    """Display full exception traceback for debugging."""
    logger.error(f"Error type: {type(e).__name__}")
    logger.error(f"Error message: {str(e)}")
    logger.error("Full traceback:")
    for line in traceback.format_tb(e.__traceback__):
        logger.error(line.rstrip())

def test_env_var_parsing():
    """Test different environment variable formats for CORS origins."""
    from core.settings.base import BaseSettings
    
    logger.info("Testing different environment variable formats for CORS origins")
    
    test_cases = [
        # String values
        {"name": "Comma-separated string", "value": "http://localhost:3000,http://localhost:8000"},
        {"name": "Single URL string", "value": "http://localhost:3000"},
        {"name": "JSON array string", "value": '["http://localhost:3000", "http://localhost:8000"]'},
        {"name": "Wildcard string", "value": "*"},
        
        # List values (simulated in env var)
        {"name": "Pydantic-style array", "value": "['http://localhost:3000', 'http://localhost:8000']"},
    ]
    
    for test_case in test_cases:
        logger.info(f"\nTesting format: {test_case['name']}")
        os.environ["BACKEND_CORS_ORIGINS"] = test_case["value"]
        os.environ["CORS_ORIGINS"] = test_case["value"]
        os.environ["SECRET_KEY"] = "test_key"
        os.environ["DATABASE_URL"] = "sqlite:///test.db"
        
        try:
            settings = BaseSettings()
            logger.info(f"✅ SUCCESS: {test_case['name']}")
            logger.info(f"  Type: {type(settings.BACKEND_CORS_ORIGINS)}")
            logger.info(f"  Value: {settings.BACKEND_CORS_ORIGINS}")
        except Exception as e:
            logger.error(f"❌ FAILED: {test_case['name']}")
            display_traceback(e)

def test_direct_anyurl_construction():
    """Test direct construction of AnyHttpUrl values."""
    logger.info("\nTesting direct construction of AnyHttpUrl")
    
    urls = [
        "http://localhost:3000",
        "https://example.com",
        "http://127.0.0.1:8000",
        "*"  # wildcard - should fail
    ]
    
    for url in urls:
        try:
            result = AnyHttpUrl(url)
            logger.info(f"✅ AnyHttpUrl('{url}') succeeded: {result}")
        except Exception as e:
            logger.error(f"❌ AnyHttpUrl('{url}') failed")
            display_traceback(e)

def test_validator_function():
    """Test the validator function directly."""
    from core.settings.base import BaseSettings
    logger.info("\nTesting validator function directly")
    
    test_values = [
        "http://localhost:3000,http://localhost:8000",
        '["http://localhost:3000", "http://localhost:8000"]',
        "*",
        ["http://localhost:3000", "http://localhost:8000"],
        [AnyHttpUrl("http://localhost:3000"), AnyHttpUrl("http://localhost:8000")],
    ]
    
    for value in test_values:
        try:
            # Try both validators
            result1 = BaseSettings.assemble_cors_origins(value)
            result2 = BaseSettings.assemble_cors_origins_alt(value)
            logger.info(f"✅ Validator succeeded for '{value}'")
            logger.info(f"  Result1: {result1}")
            logger.info(f"  Result2: {result2}")
        except Exception as e:
            logger.error(f"❌ Validator failed for '{value}'")
            display_traceback(e)

if __name__ == "__main__":
    logger.info("=== CORS Settings Debugging ===")
    test_direct_anyurl_construction()
    test_validator_function()
    test_env_var_parsing()