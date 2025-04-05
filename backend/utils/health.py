"""
Health check endpoints and utilities for backend service

This module provides comprehensive health checks for the application,
helping with container orchestration and service monitoring. It includes:

1. Detailed health check endpoints with component status
2. System information and resource monitoring
3. Database connection checks
4. Filesystem access verification
5. Memory usage monitoring
6. Docker-specific health information

The health endpoints follow a standardized format that works well with
container orchestration platforms like Kubernetes, Docker Swarm, etc.
"""

import os
import sys
import platform
import time
import logging
import psutil
import json
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from contextlib import asynccontextmanager
from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy.orm import Session  # Change: Use synchronous Session instead of AsyncSession
from sqlalchemy import text
from pydantic import BaseModel, Field

# Import database session and configuration
from db.base import get_db_session
from core.config_factory import ConfigFactory, get_config

# Logger setup
logger = logging.getLogger(__name__)

# Router for health endpoints
router = APIRouter(tags=["health"])

# Health status constants
class HealthStatus:
    OK = "ok"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"

# Health check response models
class ComponentHealth(BaseModel):
    name: str
    status: str
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class DockerInfo(BaseModel):
    running_in_docker: bool
    container_name: Optional[str] = None
    container_id: Optional[str] = None
    project: Optional[str] = None
    image: Optional[str] = None
    health_check_interval: Optional[int] = None

class SystemInfo(BaseModel):
    hostname: str
    platform: str
    version: str
    python_version: str
    uptime: float
    process_id: int
    memory_usage: Dict[str, Any]
    docker: DockerInfo
    cpu_usage: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: float
    environment: str
    system_info: SystemInfo
    components: List[ComponentHealth]

# Start time to calculate uptime
_start_time = time.time()

# Get application version from environment or default
_app_version = os.environ.get("APP_VERSION", "1.0.0")

# Create Docker info model from configuration
def get_docker_info() -> DockerInfo:
    """
    Get Docker container information for health check.
    
    Returns:
        DockerInfo model with container details
    """
    config = get_config()
    
    # Check if running in Docker
    if config.is_docker():
        docker_settings = config.docker
        return DockerInfo(
            running_in_docker=True,
            container_name=docker_settings.CONTAINER_NAME,
            container_id=docker_settings.CONTAINER_ID,
            project=docker_settings.DOCKER_COMPOSE_PROJECT,
            image=os.environ.get("IMAGE_NAME", "unknown"),
            health_check_interval=docker_settings.HEALTH_CHECK_INTERVAL
        )
    
    # Not in Docker
    return DockerInfo(
        running_in_docker=False
    )

# Component health check functions
async def check_database_health(db_session) -> ComponentHealth:
    """Check database connectivity and health"""
    try:
        # Simple query to check database connectivity
        # Fix: Use synchronous execution since db_session is a synchronous Session
        result = db_session.execute(text("SELECT 1"))
        db_session.commit()
        
        if result:
            return ComponentHealth(
                name="database",
                status=HealthStatus.OK,
                message="Database connection established",
                details={"database_type": os.environ.get("DATABASE_URL", "").split("://")[0]}
            )
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return ComponentHealth(
            name="database",
            status=HealthStatus.UNAVAILABLE,
            message=f"Database connection failed: {str(e)}",
            details={"error": str(e)}
        )

async def check_filesystem_health() -> ComponentHealth:
    """Check filesystem access and health"""
    data_dir = os.environ.get("DATA_DIR", "/app/data")
    try:
        # Ensure directory exists
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
            
        # Check write access
        test_file = os.path.join(data_dir, "healthcheck_test.txt")
        with open(test_file, "w") as f:
            f.write("healthcheck")
            
        # Check read access
        with open(test_file, "r") as f:
            content = f.read()
            
        # Clean up
        os.remove(test_file)
        
        if content == "healthcheck":
            return ComponentHealth(
                name="filesystem",
                status=HealthStatus.OK,
                message="Filesystem is writable",
                details={"path": data_dir}
            )
        else:
            return ComponentHealth(
                name="filesystem",
                status=HealthStatus.DEGRADED,
                message="Filesystem read/write mismatch",
                details={"path": data_dir}
            )
    except Exception as e:
        logger.error(f"Filesystem health check failed: {str(e)}")
        return ComponentHealth(
            name="filesystem",
            status=HealthStatus.DEGRADED,
            message=f"Filesystem error: {str(e)}",
            details={"error": str(e), "path": data_dir}
        )

async def check_memory_health() -> ComponentHealth:
    """Check available memory"""
    try:
        # Get configuration
        config = get_config()
        memory_threshold = config.MEMORY_WARNING_THRESHOLD_MB
        if config.is_docker():
            memory_threshold = config.docker.MEMORY_WARNING_THRESHOLD_MB
        
        memory = psutil.virtual_memory()
        available_mb = memory.available / (1024 * 1024)
        total_mb = memory.total / (1024 * 1024)
        
        if available_mb < memory_threshold:
            return ComponentHealth(
                name="memory",
                status=HealthStatus.DEGRADED,
                message=f"Low memory: {available_mb:.2f} MB available (threshold: {memory_threshold} MB)",
                details={
                    "available_mb": round(available_mb, 2),
                    "total_mb": round(total_mb, 2),
                    "percent_used": memory.percent,
                    "threshold_mb": memory_threshold
                }
            )
        else:
            return ComponentHealth(
                name="memory",
                status=HealthStatus.OK,
                message="Memory usage within normal range",
                details={
                    "available_mb": round(available_mb, 2),
                    "total_mb": round(total_mb, 2),
                    "percent_used": memory.percent,
                    "threshold_mb": memory_threshold
                }
            )
    except Exception as e:
        logger.error(f"Memory health check failed: {str(e)}")
        return ComponentHealth(
            name="memory",
            status=HealthStatus.OK,  # Default to OK to avoid false negatives
            message="Unable to check memory usage",
            details={"error": str(e)}
        )

async def check_cpu_health() -> ComponentHealth:
    """Check CPU usage"""
    try:
        # Get configuration
        config = get_config()
        cpu_threshold = 80.0  # Default threshold
        if config.is_docker():
            cpu_threshold = config.docker.CPU_WARNING_THRESHOLD_PERCENT
        
        # Get CPU percentages (this is a blocking call, but brief)
        cpu_percent = psutil.cpu_percent(interval=0.5)
        
        if cpu_percent > cpu_threshold:
            return ComponentHealth(
                name="cpu",
                status=HealthStatus.DEGRADED,
                message=f"High CPU usage: {cpu_percent:.1f}% (threshold: {cpu_threshold}%)",
                details={
                    "percent_used": cpu_percent,
                    "threshold_percent": cpu_threshold,
                    "core_count": psutil.cpu_count(logical=True)
                }
            )
        else:
            return ComponentHealth(
                name="cpu",
                status=HealthStatus.OK,
                message="CPU usage within normal range",
                details={
                    "percent_used": cpu_percent,
                    "threshold_percent": cpu_threshold,
                    "core_count": psutil.cpu_count(logical=True)
                }
            )
    except Exception as e:
        logger.error(f"CPU health check failed: {str(e)}")
        return ComponentHealth(
            name="cpu",
            status=HealthStatus.OK,  # Default to OK to avoid false negatives
            message="Unable to check CPU usage",
            details={"error": str(e)}
        )

async def check_docker_health() -> Optional[ComponentHealth]:
    """Check Docker container health (only if running in Docker)"""
    config = get_config()
    if not config.is_docker():
        return None
    
    try:
        # Docker-specific checks
        docker_settings = config.docker
        
        # Simple validation of container environment
        container_name = docker_settings.CONTAINER_NAME
        container_id = docker_settings.CONTAINER_ID
        
        if not container_name or not container_id:
            return ComponentHealth(
                name="docker",
                status=HealthStatus.DEGRADED,
                message="Container information incomplete",
                details={"error": "Missing container name or ID"}
            )
        
        # Check cgroup resource constraints (simplified)
        try:
            with open("/sys/fs/cgroup/memory/memory.limit_in_bytes", "r") as f:
                memory_limit = int(f.read().strip()) / (1024 * 1024)  # Convert to MB
            
            with open("/sys/fs/cgroup/memory/memory.usage_in_bytes", "r") as f:
                memory_usage = int(f.read().strip()) / (1024 * 1024)  # Convert to MB
            
            memory_percent = (memory_usage / memory_limit) * 100 if memory_limit > 0 else 0
            
            return ComponentHealth(
                name="docker",
                status=HealthStatus.OK,
                message="Container running normally",
                details={
                    "container_name": container_name,
                    "container_id": container_id,
                    "memory_limit_mb": round(memory_limit, 2),
                    "memory_usage_mb": round(memory_usage, 2),
                    "memory_percent": round(memory_percent, 2)
                }
            )
        except (IOError, FileNotFoundError):
            # Fall back to basic checks if cgroup files aren't accessible
            return ComponentHealth(
                name="docker",
                status=HealthStatus.OK,
                message="Container running normally",
                details={
                    "container_name": container_name,
                    "container_id": container_id
                }
            )
    except Exception as e:
        logger.error(f"Docker health check failed: {str(e)}")
        return ComponentHealth(
            name="docker",
            status=HealthStatus.DEGRADED,
            message=f"Docker check failed: {str(e)}",
            details={"error": str(e)}
        )

# Collect system information
def get_system_info() -> SystemInfo:
    """Get system information for health check response"""
    memory = psutil.virtual_memory()
    
    # Create CPU usage details
    cpu_info = {
        "percent": psutil.cpu_percent(interval=None),
        "count": psutil.cpu_count(logical=True),
        "physical_count": psutil.cpu_count(logical=False)
    }
    
    # Get Docker information
    docker_info = get_docker_info()
    
    return SystemInfo(
        hostname=platform.node(),
        platform=platform.platform(),
        version=_app_version,
        python_version=platform.python_version(),
        uptime=round(time.time() - _start_time, 2),
        process_id=os.getpid(),
        memory_usage={
            "total_mb": round(memory.total / (1024 * 1024), 2),
            "available_mb": round(memory.available / (1024 * 1024), 2),
            "percent_used": memory.percent
        },
        cpu_usage=cpu_info,
        docker=docker_info
    )

# Health check endpoints
@router.get("/health", response_model=HealthResponse)
async def health_check(response: Response, request: Request, db: Session = Depends(get_db_session)):
    """Comprehensive health check endpoint"""
    # Get configuration
    config = get_config()
    
    # Run component health checks concurrently
    db_health, fs_health, memory_health, cpu_health = await asyncio.gather(
        check_database_health(db),
        check_filesystem_health(),
        check_memory_health(),
        check_cpu_health()
    )
    
    # Add components to list
    components = [db_health, fs_health, memory_health, cpu_health]
    
    # Add Docker health check if running in Docker
    if config.is_docker():
        docker_health = await check_docker_health()
        if docker_health:
            components.append(docker_health)
    
    # Determine overall status (worst of all components)
    health_status = None  # Rename to avoid conflict with FastAPI status
    
    if any(c.status == HealthStatus.UNAVAILABLE for c in components):
        health_status = HealthStatus.UNAVAILABLE
        # Fix: Use a different variable name to avoid conflict with FastAPI status module
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif any(c.status == HealthStatus.DEGRADED for c in components):
        health_status = HealthStatus.DEGRADED
        response.status_code = status.HTTP_200_OK  # Still functioning but degraded
    else:
        health_status = HealthStatus.OK
        response.status_code = status.HTTP_200_OK
    
    # Create health response
    health_response = HealthResponse(
        status=health_status,  # Use renamed variable to avoid conflict with FastAPI status
        version=_app_version,
        timestamp=time.time(),
        environment=config.ENVIRONMENT,
        system_info=get_system_info(),
        components=components
    )
    
    # Log health status if degraded or unavailable
    if health_status != HealthStatus.OK:  # Use renamed variable
        degraded_components = [c.name for c in components if c.status != HealthStatus.OK]
        logger.warning(f"Health check returned {health_status} status. Degraded components: {', '.join(degraded_components)}")
    
    return health_response

@router.get("/health/simple")
async def simple_health_check(response: Response, db: Session = Depends(get_db_session)):
    """
    Simple health check endpoint that returns 200 if the service is running
    and can connect to the database, 503 otherwise.
    """
    try:
        # Simple database check - using synchronous execution
        result = db.execute(text("SELECT 1"))
        db.commit()
        
        # Get configuration for environment info
        config = get_config()
        
        return {
            "status": "ok",
            "version": _app_version,
            "environment": config.ENVIRONMENT,
            "docker": config.is_docker()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "error", "message": str(e)}

@router.get("/health/docker")
async def docker_health_check(response: Response):
    """
    Specialized health check for Docker container orchestration.
    
    This endpoint is designed for Docker HEALTHCHECK commands:
    - Returns 200 if the service is running properly
    - Returns 503 if the service is degraded or unavailable
    - Minimal overhead for frequent checks
    """
    config = get_config()
    
    # If not in Docker, return basic status
    if not config.is_docker():
        return {"status": "ok", "docker": False}
    
    try:
        # Minimal checks for quick response
        memory = psutil.virtual_memory()
        available_mb = memory.available / (1024 * 1024)
        
        # Check against threshold from configuration
        memory_threshold = config.docker.MEMORY_WARNING_THRESHOLD_MB
        
        # Basic status check
        status_ok = available_mb >= memory_threshold
        
        # Check database health if connection monitoring is available
        db_status = "ok"
        db_status_message = None
        try:
            from utils.db.optimization.connection_pool_manager import get_db_health_status
            db_health = get_db_health_status()
            if db_health["status"] != "healthy":
                status_ok = False
                db_status = "degraded"
                db_status_message = db_health["message"]
        except ImportError:
            # Use basic database health check if monitoring is not available
            from db.base import db_health_check
            db_result = db_health_check()
            if db_result["status"] != "ok":
                status_ok = False
                db_status = "degraded"
                db_status_message = db_result["message"]
        
        if status_ok:
            return {
                "status": "ok",
                "docker": True,
                "container": config.docker.CONTAINER_NAME,
                "container_id": config.docker.CONTAINER_ID,
                "environment": config.ENVIRONMENT,
                "memory_available_mb": round(available_mb, 2),
                "database": db_status
            }
        else:
            # Determine reason for degraded status
            reasons = []
            if available_mb < memory_threshold:
                reasons.append(f"Low memory: {available_mb:.2f}MB available (threshold: {memory_threshold}MB)")
            if db_status != "ok" and db_status_message:
                reasons.append(f"Database issue: {db_status_message}")
            
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            return {
                "status": "degraded",
                "docker": True,
                "container": config.docker.CONTAINER_NAME,
                "container_id": config.docker.CONTAINER_ID,
                "environment": config.ENVIRONMENT,
                "reasons": reasons,
                "memory_available_mb": round(available_mb, 2),
                "database": db_status
            }
    except Exception as e:
        logger.error(f"Docker health check failed: {str(e)}")
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "error",
            "docker": True,
            "container": getattr(config.docker, "CONTAINER_NAME", "unknown"),
            "error": str(e)
        }

@router.get("/health/db")
async def db_health_check(response: Response):
    """
    Database health check with detailed metrics.
    
    This endpoint provides detailed database connection pool metrics
    and health status information. It's useful for monitoring and
    debugging database connection issues in Docker environments.
    """
    config = get_config()
    
    # Basic database health check
    from db.base import db_health_check as basic_db_check
    basic_health = basic_db_check()
    
    # Status determination
    is_healthy = basic_health["status"] == "ok"
    
    # Try to get detailed metrics if available
    detailed_metrics = None
    try:
        from utils.db.optimization.connection_pool_manager import get_db_metrics
        detailed_metrics = get_db_metrics()
        
        # Add Docker-specific information if available
        if config.is_docker():
            docker_info = config.get_docker_info()
            detailed_metrics["docker"].update(docker_info)
    except ImportError:
        logger.debug("Detailed database metrics not available")
    
    # Create response
    response_data = {
        "status": "healthy" if is_healthy else "unhealthy",
        "message": basic_health["message"],
        "query_time_ms": basic_health.get("query_time_ms"),
        "database_type": basic_health.get("database_type", "unknown"),
        "in_docker": config.is_docker(),
        "environment": config.ENVIRONMENT
    }
    
    # Add detailed metrics if available
    if detailed_metrics:
        response_data["metrics"] = detailed_metrics
    
    # Set response status
    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    
    return response_data