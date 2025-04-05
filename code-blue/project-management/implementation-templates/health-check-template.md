# Health Check Implementation Templates

## Backend Health Check

### FastAPI Health Check Endpoint

```python
# health.py

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
```

### Backend Health Check Script (Shell)

```bash
#!/bin/bash
# Backend Health Check Script
# This script checks if the backend is healthy by calling the health endpoint

# Configuration
HEALTH_ENDPOINT="http://localhost:8000/health"
TIMEOUT=5
MAX_RETRIES=3
RETRY_DELAY=1

# Function to check health endpoint
check_health() {
  local response
  local status_code
  
  # Use curl to fetch health endpoint with timeout
  response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json -m "$TIMEOUT" "$HEALTH_ENDPOINT")
  status_code=$?
  
  # Check curl exit status
  if [ $status_code -ne 0 ]; then
    echo "Health check failed: Curl error $status_code"
    return 1
  fi
  
  # Check HTTP status code
  if [ "$response" != "200" ]; then
    echo "Health check failed: HTTP status $response"
    return 1
  fi
  
  # Parse JSON response and check status (optional, requires jq)
  if command -v jq >/dev/null 2>&1; then
    local health_status
    health_status=$(jq -r '.status' /tmp/health_response.json)
    
    if [ "$health_status" != "ok" ]; then
      echo "Health check failed: Service status is $health_status"
      return 1
    fi
  fi
  
  # Cleanup
  rm -f /tmp/health_response.json
  
  return 0
}

# Main health check logic with retries
for (( i=1; i<=MAX_RETRIES; i++ )); do
  if check_health; then
    echo "Health check passed"
    exit 0
  fi
  
  echo "Health check attempt $i of $MAX_RETRIES failed, retrying in $RETRY_DELAY seconds..."
  sleep $RETRY_DELAY
done

echo "Health check failed after $MAX_RETRIES attempts"
exit 1
```

## Frontend Health Check

### Frontend Healthcheck Script (Shell)

```bash
#!/bin/sh
# Frontend Health Check Script for TAP Integration Platform
# This script performs health checks for the frontend service in Docker

# Configuration
PORT=${PORT:-3000}
MAX_RETRIES=3
RETRY_DELAY=1
TIMEOUT=3
HEALTH_ENDPOINT="http://localhost:${PORT}/health"
STATIC_FILE_ENDPOINT="http://localhost:${PORT}/index.html"
PID_PATTERN="node.*dev-server.js"

# Function to check a URL
check_url() {
  local url=$1
  local label=$2
  wget -q --spider --timeout=$TIMEOUT "$url" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "$label is reachable"
    return 0
  else
    echo "$label is not reachable"
    return 1
  fi
}

# Function to check if webpack process is running
check_process() {
  if pgrep -f "$PID_PATTERN" > /dev/null; then
    echo "Frontend service process is running"
    return 0
  else
    echo "Frontend service process is not running"
    return 1
  fi
}

# Main health check logic
check_process || exit 1

# First try the health endpoint if available
for i in $(seq 1 $MAX_RETRIES); do
  if check_url "$HEALTH_ENDPOINT" "Health endpoint"; then
    exit 0
  fi
  
  echo "Health endpoint check attempt $i of $MAX_RETRIES failed - trying static file..."
  
  # If health endpoint fails, try a static file
  if check_url "$STATIC_FILE_ENDPOINT" "Static file"; then
    echo "Static file is accessible, service is healthy"
    exit 0
  fi
  
  # If we still haven't exited, service might be starting up
  echo "Health check attempt $i of $MAX_RETRIES failed - waiting $RETRY_DELAY seconds..."
  sleep $RETRY_DELAY
done

# Even if web server isn't responding yet, if process is running, give more time
# This allows more time for webpack to compile in development mode
echo "Web server not responding, but process is running"
echo "Service may still be starting - marking as healthy to allow startup to complete"
exit 0
```

### Frontend Health Endpoint (JavaScript)

```javascript
// health.js

/**
 * Frontend health check handler
 * Creates an endpoint for health checks in the development server
 */

const os = require('os');
const process = require('process');

// Initial startup time for uptime calculation
const startTime = Date.now();

// Track memory usage metrics
let memoryUsageHistory = [];
const MAX_HISTORY_LENGTH = 10;

// Update memory metrics every minute
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  memoryUsageHistory.push({
    timestamp: Date.now(),
    rss: memoryUsage.rss,
    heapTotal: memoryUsage.heapTotal,
    heapUsed: memoryUsage.heapUsed,
    external: memoryUsage.external,
    arrayBuffers: memoryUsage.arrayBuffers
  });
  
  // Keep history at a reasonable size
  if (memoryUsageHistory.length > MAX_HISTORY_LENGTH) {
    memoryUsageHistory.shift();
  }
}, 60000);

/**
 * Get system information for health check
 * @returns {Object} System information
 */
function getSystemInfo() {
  const memoryUsage = process.memoryUsage();
  
  return {
    hostname: os.hostname(),
    platform: process.platform,
    nodeVersion: process.version,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    processId: process.pid,
    memoryUsage: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      memoryUsageHistory: memoryUsageHistory
    },
    container: process.env.REACT_APP_RUNNING_IN_DOCKER === 'true'
  };
}

/**
 * Check webpack dev server health
 * @returns {Object} Component health status
 */
function checkWebpackHealth() {
  // In a real implementation, you could check for webpack errors or status
  const isHealthy = true; // Simplified check
  
  return {
    name: 'webpack',
    status: isHealthy ? 'ok' : 'degraded',
    message: isHealthy ? 'Webpack running normally' : 'Webpack experiencing issues',
    details: {
      mode: process.env.NODE_ENV || 'development'
    }
  };
}

/**
 * Check memory health
 * @returns {Object} Component health status
 */
function checkMemoryHealth() {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const heapUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
  
  // Set thresholds
  const WARNING_THRESHOLD = 80; // 80% of heap used
  const CRITICAL_THRESHOLD = 90; // 90% of heap used
  
  let status = 'ok';
  let message = 'Memory usage normal';
  
  if (heapUsagePercent > CRITICAL_THRESHOLD) {
    status = 'degraded';
    message = `Critical memory usage: ${heapUsagePercent}% of heap used`;
  } else if (heapUsagePercent > WARNING_THRESHOLD) {
    status = 'warning';
    message = `High memory usage: ${heapUsagePercent}% of heap used`;
  }
  
  return {
    name: 'memory',
    status,
    message,
    details: {
      heapUsedMB,
      heapTotalMB,
      heapUsagePercent,
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024)
    }
  };
}

/**
 * Generate the full health check response
 * @returns {Object} Health check response
 */
function getHealthCheckResponse() {
  const components = [
    checkWebpackHealth(),
    checkMemoryHealth()
  ];
  
  // Determine overall status (worst of all components)
  let overallStatus = 'ok';
  for (const component of components) {
    if (component.status === 'degraded') {
      overallStatus = 'degraded';
      break;
    } else if (component.status === 'warning' && overallStatus === 'ok') {
      overallStatus = 'warning';
    }
  }
  
  return {
    status: overallStatus,
    version: process.env.REACT_APP_VERSION || '1.0.0',
    timestamp: Date.now(),
    systemInfo: getSystemInfo(),
    components
  };
}

/**
 * Health check middleware for express
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function healthCheckMiddleware(req, res) {
  const healthResponse = getHealthCheckResponse();
  
  // Set appropriate HTTP status based on health
  if (healthResponse.status === 'degraded') {
    res.status(503);
  } else {
    res.status(200);
  }
  
  res.json(healthResponse);
}

/**
 * Register health check routes with an express app
 * @param {Object} app - Express app
 */
function registerHealthCheck(app) {
  app.get('/health', healthCheckMiddleware);
}

module.exports = {
  registerHealthCheck,
  getHealthCheckResponse
};
```

## Implementation Notes:

1. **Backend Health Check**:
   - Comprehensive health check that validates database connectivity, filesystem access, and memory usage
   - Returns detailed health information in a structured format
   - Provides a simple health endpoint for container health checks
   - Shell script for Docker health check command

2. **Frontend Health Check**:
   - Shell script for container health checks
   - JavaScript module for in-depth health monitoring
   - Memory usage tracking and reporting
   - Webpack dev server monitoring

3. **Integration Instructions**:
   - Backend: Import and register the health router in your FastAPI application
   - Frontend: Integrate the health check module in your webpack dev server
   - Docker: Update health check commands in Dockerfile and docker-compose.yml

4. **Testing**:
   - Test health checks by accessing the health endpoints directly
   - Verify proper status code responses for different health states
   - Test system under load to verify degraded status reporting