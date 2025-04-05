"""
Module initialization for the TAP Integration Platform

This module imports and organizes all API router modules to be included 
in the FastAPI application.
"""

# Import all router modules
from modules.admin.controller import router as admin_router
from modules.users.controller import router as users_router
from modules.earnings.controller import router as earnings_router
from modules.integrations.controller import router as integrations_router
from modules.auth.controller import router as auth_router

# List of all routers to include in the application
api_routers = [
    {"router": admin_router, "prefix": "/api/v1/admin", "tags": ["Admin"]},
    {"router": users_router, "prefix": "/api/v1/users", "tags": ["Users"]},
    {"router": earnings_router, "prefix": "/api/v1/earnings", "tags": ["Earnings"]},
    {"router": integrations_router, "prefix": "/api/v1/integrations", "tags": ["Integrations"]},
    {"router": auth_router, "prefix": "/api/v1", "tags": ["Authentication"]}
]