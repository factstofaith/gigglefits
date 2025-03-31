"""
Shared utilities for authentication adapters.

This module provides shared functions and utilities to avoid circular imports
between auth adapters.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Mock current user function
def get_current_user(token: str = None):
    """
    Mock implementation of get_current_user for testing purposes.
    
    Args:
        token: JWT token for authentication
        
    Returns:
        User object if token is valid
    """
    # This is a stub implementation that would be replaced with actual logic
    # For testing, we'll just return a mock user based on the token
    if token == "invalid_token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return {
        "id": "test-user-id",
        "email": "test@example.com",
        "name": "Test User",
        "role": "USER"
    }