import os
import sys
import logging
import uvicorn
from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

# Import application modules
from db.base import get_db_session
from core.config import get_settings
from utils.signal_handlers import setup_signal_handlers
from utils.health import router as health_router
from modules import api_routers

# Import structured logging system
from utils.logging import configure_logging, get_logger
from utils.logging.middleware import setup_request_logging
from utils.logging.context import docker_context_provider

# Import error handling system
from utils.error_handling import (
    setup_exception_handlers,
    setup_error_api,
    error_api_router,
    setup_error_reporting,
    add_container_middleware,
    setup_container_health_check,
    ResourceType,
    track_resource
)

# Configure structured logging with environment settings
from core.config_factory import ConfigFactory, get_config

# Get configuration
config = get_config()

# Configure logging based on environment
if config.is_docker():
    # Use structured JSON logging in Docker
    from utils.logging.config import configure_logging
    configure_logging(
        level=os.environ.get("LOG_LEVEL", "INFO"),
        enable_json=True,
        enable_docker_context=True
    )
else:
    # Use basic logging configuration for local development
    logging.basicConfig(
        level=logging.getLevelName(os.environ.get("LOG_LEVEL", "INFO")),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)]
    )

# Get logger for this module
logger = get_logger(__name__)

# Initialize error reporting with Docker-specific settings
if config.is_docker():
    # Set up error reporting with persistence in Docker
    setup_error_reporting(
        max_errors=1000,
        enable_logging=True,
        enable_persistence=True,
        error_log_path="/app/data/error_logs/errors.jsonl"
    )
else:
    # Set up error reporting without persistence in development
    setup_error_reporting(
        max_errors=1000,
        enable_logging=True,
        enable_persistence=False
    )

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
# Use either CORS_ORIGINS or BACKEND_CORS_ORIGINS depending on what's available
cors_origins = getattr(settings, "CORS_ORIGINS", getattr(settings, "BACKEND_CORS_ORIGINS", ["http://localhost:3000"]))

# Log CORS configuration
logger.info(f"Configuring CORS with origins: {cors_origins}")
logger.info(f"CORS credentials allowed: {settings.CORS_ALLOW_CREDENTIALS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in cors_origins],
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS or ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=settings.CORS_ALLOW_HEADERS or ["Content-Type", "Authorization", "X-Requested-With", "Access-Control-Request-Headers", "Access-Control-Request-Method"],
    expose_headers=["X-Request-ID", "X-Process-Time", "Content-Type", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
    max_age=86400
)

# Configure request logging middleware
# Skip health check endpoints to reduce log noise
setup_request_logging(
    app,
    log_all_requests=config.is_docker(),  # Log all requests in Docker
    exclude_paths=["/health", "/health/simple", "/health/docker", "/api/docs", "/api/redoc"]
)

# Register health routes
app.include_router(health_router)

# Register error handling API routes
app.include_router(error_api_router, prefix="/api")

# Register all module API routers
for router_config in api_routers:
    app.include_router(
        router=router_config["router"],
        prefix=router_config["prefix"],
        tags=router_config.get("tags", [])
    )
    logger.info(f"Registered API router: {router_config['prefix']}")

# Setup standard exception handlers 
setup_exception_handlers(app)

# Setup Docker-specific middleware if in container
if config.is_docker():
    add_container_middleware(app)
    setup_container_health_check(app, "/container/health")

# Setup signal handlers for graceful shutdown
setup_signal_handlers()

# Add middleware to capture request context
@app.middleware("http")
async def add_request_id_header(request: Request, call_next):
    # Get or generate request ID
    request_id = request.headers.get("X-Request-ID", None)
    if not request_id:
        import uuid
        request_id = str(uuid.uuid4())
    
    # Process the request
    response = await call_next(request)
    
    # Add request ID to response headers
    response.headers["X-Request-ID"] = request_id
    
    return response

# Main startup function
@app.on_event("startup")
async def startup_event():
    # Log startup with container context if running in Docker
    docker_info = {}
    if config.is_docker():
        docker_info = docker_context_provider()
    
    logger.info(
        "Starting TAP Integration Platform Backend",
        extra={
            "environment": os.environ.get('APP_ENVIRONMENT', 'development'),
            "version": os.environ.get('APP_VERSION', '1.0.0'),
            **docker_info
        }
    )
    
    # Log container status
    if config.is_docker():
        docker_settings = config.docker
        logger.info(
            f"Running in Docker container",
            extra={
                "docker": {
                    "container_name": docker_settings.CONTAINER_NAME,
                    "container_id": docker_settings.CONTAINER_ID,
                    "environment": config.ENVIRONMENT
                }
            }
        )
    
    # Initialize database connection pool
    from db.base import get_engine, register_db_shutdown_handler
    
    # Create engine to initialize connection pool
    engine = get_engine()
    
    # Register engine as a resource for tracking
    track_resource(
        resource=engine,
        resource_type=ResourceType.DATABASE_CONNECTION,
        description="Main SQLAlchemy engine",
        cleanup_func=lambda e: e.dispose(),
        owner="main",
        metadata={"dialect": engine.dialect.name}
    )
    
    logger.info(
        f"Initialized database connection pool",
        extra={
            "database": {
                "dialect": engine.dialect.name,
                "pool_size": engine.pool.size(),
                "max_overflow": engine.pool.overflow()
            }
        }
    )
    
    # Register database connection monitoring if in Docker
    if config.is_docker():
        try:
            # Initialize database monitoring
            from utils.db.optimization.connection_pool_manager import get_db_metrics
            logger.info("Initialized database connection monitoring for Docker")
            
            # Log initial metrics
            metrics = get_db_metrics()
            logger.info(
                f"Database pool initialized",
                extra={
                    "database": {
                        "pool_size": metrics['pool']['pool_size'],
                        "max_overflow": metrics['pool']['pool_overflow'],
                        "in_docker": True
                    }
                }
            )
            
            # Set up database health check API
            from utils.error_handling import setup_db_health_check
            setup_db_health_check(app, engine, "/api/health/db")
                
        except ImportError:
            logger.warning("Database connection monitoring not available")
    
    # Register shutdown handlers
    register_db_shutdown_handler()

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down TAP Integration Platform Backend")
    
    # Clean up all tracked resources
    from utils.error_handling import cleanup_all_resources, get_resource_stats
    
    # Log resource stats before cleanup
    resource_stats = get_resource_stats()
    logger.info(f"Resource statistics before shutdown: {resource_stats}")
    
    # Clean up resources
    cleanup_results = cleanup_all_resources()
    logger.info(f"Resource cleanup completed: {len(cleanup_results)} resources processed")

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
    logger.info(
        f"Starting server",
        extra={
            "server": {
                "host": host,
                "port": port,
                "workers": workers,
                "reload": reload
            }
        }
    )
    
    # Run the application with uvicorn
    uvicorn_logging_config = None
    
    # Use structured JSON logging config in Docker
    if config.is_docker():
        from utils.logging.config import get_logging_config_for_docker
        uvicorn_logging_config = get_logging_config_for_docker()
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        workers=workers,
        log_config=uvicorn_logging_config
    )