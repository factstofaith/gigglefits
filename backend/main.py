import os
import sys
import logging
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

# Import application modules
from db.base import get_db_session
from core.config import get_settings
from utils.signal_handlers import setup_signal_handlers
from utils.health import router as health_router

# Configure logging
logging.basicConfig(
    level=logging.getLevelName(os.environ.get("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="TAP Integration Platform",
    description="API for TAP Integration Platform",
    version=os.environ.get("APP_VERSION", "1.0.0"),
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
settings = get_settings()
cors_origins = settings.cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register health routes
app.include_router(health_router)

# Setup signal handlers for graceful shutdown
setup_signal_handlers()

# Main startup function
@app.on_event("startup")
async def startup_event():
    logger.info("Starting TAP Integration Platform Backend")
    logger.info(f"Environment: {os.environ.get('APP_ENVIRONMENT', 'development')}")
    
    # Log container status
    if os.environ.get("RUNNING_IN_DOCKER", "false").lower() == "true":
        logger.info(f"Running in Docker container: {os.environ.get('CONTAINER_NAME', 'unknown')}")
    
    # Add shutdown handler for database connections
    from utils.signal_handlers import register_shutdown_handler
    
    # Register database shutdown handler
    register_shutdown_handler("database", lambda: logger.info("Closing database connections"))

# Root endpoint for basic checks
@app.get("/")
async def root():
    return {"message": "TAP Integration Platform API"}

# Run the application when executed directly
if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    reload = os.environ.get("DEBUG", "false").lower() == "true"
    workers = int(os.environ.get("WORKERS", 1))
    
    # Log startup configuration
    logger.info(f"Starting server on {host}:{port} with {workers} workers")
    
    # Run the application with uvicorn
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        workers=workers
    )
