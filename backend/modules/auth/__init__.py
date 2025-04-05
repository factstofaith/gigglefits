"""
Authentication module for the TAP Integration Platform

This module provides standardized authentication endpoints and services
for the TAP Integration Platform, including login, token refresh, and MFA verification.
"""

from modules.auth.controller import router as auth_router
from modules.auth.service import AuthService