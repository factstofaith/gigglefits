"""
Health check endpoints and utilities for backend service
"""

import os
import sys
import platform
import time
import logging
import psutil
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

# Import your database session
from db.base import get_db_session

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

class SystemInfo(BaseModel):
    hostname: str
    platform: str
    version: str
    python_version: str
    uptime: float
    process_id: int
    memory_usage: Dict[str, Any]
    container: bool

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: float
    system_info: SystemInfo
    components: List[ComponentHealth]

# Start time to calculate uptime
_start_time = time.time()

# Get application version from environment or default
_app_version = os.environ.get("APP_VERSION", "1.0.0")

# Component health check functions
async def check_database_health(db_session: AsyncSession) -> ComponentHealth:
    """Check database connectivity and health"""
    try:
        # Simple query to check database connectivity
        result = await db_session.execute("SELECT 1")
        await db_session.commit()
        
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
        memory = psutil.virtual_memory()
        available_mb = memory.available / (1024 * 1024)
        total_mb = memory.total / (1024 * 1024)
        
        # Set thresholds based on container environment
        min_available_mb = 100  # 100 MB minimum
        
        if available_mb < min_available_mb:
            return ComponentHealth(
                name="memory",
                status=HealthStatus.DEGRADED,
                message=f"Low memory: {available_mb:.2f} MB available",
                details={
                    "available_mb": round(available_mb, 2),
                    "total_mb": round(total_mb, 2),
                    "percent_used": memory.percent
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
                    "percent_used": memory.percent
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

# Collect system information
def get_system_info() -> SystemInfo:
    """Get system information for health check response"""
    memory = psutil.virtual_memory()
    
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
        container=os.environ.get("RUNNING_IN_DOCKER", "false").lower() == "true"
    )

# Health check endpoints
@router.get("/health", response_model=HealthResponse)
async def health_check(response: Response, db: AsyncSession = Depends(get_db_session)):
    """Comprehensive health check endpoint"""
    # Run component health checks
    components = []
    
    # Check database health
    db_health = await check_database_health(db)
    components.append(db_health)
    
    # Check filesystem health
    fs_health = await check_filesystem_health()
    components.append(fs_health)
    
    # Check memory health
    memory_health = await check_memory_health()
    components.append(memory_health)
    
    # Determine overall status (worst of all components)
    if any(c.status == HealthStatus.UNAVAILABLE for c in components):
        status = HealthStatus.UNAVAILABLE
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif any(c.status == HealthStatus.DEGRADED for c in components):
        status = HealthStatus.DEGRADED
        response.status_code = status.HTTP_200_OK  # Still functioning but degraded
    else:
        status = HealthStatus.OK
        response.status_code = status.HTTP_200_OK
    
    # Create health response
    health_response = HealthResponse(
        status=status,
        version=_app_version,
        timestamp=time.time(),
        system_info=get_system_info(),
        components=components
    )
    
    return health_response

@router.get("/health/simple")
async def simple_health_check(response: Response, db: AsyncSession = Depends(get_db_session)):
    """
    Simple health check endpoint that returns 200 if the service is running
    and can connect to the database, 503 otherwise.
    """
    try:
        # Simple database check
        result = await db.execute("SELECT 1")
        await db.commit()
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "error", "message": str(e)}
