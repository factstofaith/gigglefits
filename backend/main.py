"""
TAP Integration Platform Backend

This is the main entry point for the FastAPI application that serves
as the backend for the TAP Integration Platform.
"""

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer

# Import application modules
from core.config import settings
from modules.integrations import router as integrations_router

# Create the FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the TAP Integration Platform",
    version="1.0.0"
)

# Configure CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for JWT authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Include routers
app.include_router(integrations_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "message": "API is running"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "TAP Integration Platform API",
        "version": "1.0.0",
        "documentation": "/docs"
    }

# Sample protected endpoint
@app.get("/api/user/profile")
async def get_user_profile(token: str = Depends(oauth2_scheme)):
    """
    Get the current user's profile
    
    This is a protected endpoint that requires authentication
    """
    # In a real implementation, you would:
    # 1. Verify the JWT token
    # 2. Extract the user ID from the token
    # 3. Query the database for the user
    # 4. Return the user data
    
    # For now, we'll return mock data
    return {
        "id": "user_123",
        "username": "demo_user",
        "email": "user@example.com",
        "name": "Demo User",
        "role": "user"
    }

# Run the application with uvicorn when executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)