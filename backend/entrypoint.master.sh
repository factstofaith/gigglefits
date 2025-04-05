#!/bin/bash
set -e

echo "Starting TAP Integration Platform Backend"
echo "Environment: $APP_ENVIRONMENT"

# Set Docker environment flags
export RUNNING_IN_DOCKER=true
export CONTAINER_NAME=${CONTAINER_NAME:-tap-backend}
export CONTAINER_ID=${HOSTNAME:-unknown}

# Create directories and ensure correct permissions
mkdir -p /app/data
mkdir -p /app/logs

# Set graceful shutdown timeout
export GRACEFUL_SHUTDOWN_TIMEOUT=${GRACEFUL_SHUTDOWN_TIMEOUT:-30}
export GRACEFUL_SHUTDOWN_ATTEMPTS=${GRACEFUL_SHUTDOWN_ATTEMPTS:-3}

# Resource monitoring settings
export MEMORY_WARNING_THRESHOLD_MB=${MEMORY_WARNING_THRESHOLD_MB:-1024}
export CPU_WARNING_THRESHOLD_PERCENT=${CPU_WARNING_THRESHOLD_PERCENT:-80}

# Signal handling for proper container shutdown
handle_signal() {
    echo "Received $1 signal, shutting down gracefully..."
    # The application's signal handlers will handle the graceful shutdown
    # Just forward the signal
    kill -$1 "$APP_PID" 2>/dev/null || true
    
    # Wait for application to terminate with timeout
    echo "Waiting for application to terminate (timeout: ${GRACEFUL_SHUTDOWN_TIMEOUT}s)..."
    WAIT_TIMEOUT=0
    while kill -0 "$APP_PID" 2>/dev/null; do
        if [ "$WAIT_TIMEOUT" -ge "$GRACEFUL_SHUTDOWN_TIMEOUT" ]; then
            echo "Application did not terminate within timeout, forcing exit..."
            kill -9 "$APP_PID" 2>/dev/null || true
            break
        fi
        sleep 1
        WAIT_TIMEOUT=$((WAIT_TIMEOUT + 1))
    done
    
    echo "Application shut down"
    exit 0
}

# Register signal handlers
trap 'handle_signal TERM' SIGTERM
trap 'handle_signal INT' SIGINT

# Run startup script if it exists
if [ -f "/app/startup.sh" ]; then
    echo "Running startup script..."
    bash /app/startup.sh
fi

echo "Starting application server..."

# Determine Python executable to use
PYTHON_EXECUTABLE=${PYTHON_EXECUTABLE:-python}
if [ -d "/app/.venv" ] && [ -f "/app/.venv/bin/python" ]; then
    echo "Using virtual environment at /app/.venv"
    PYTHON_EXECUTABLE="/app/.venv/bin/python"
elif [ -d "/app/venv" ] && [ -f "/app/venv/bin/python" ]; then
    echo "Using virtual environment at /app/venv"
    PYTHON_EXECUTABLE="/app/venv/bin/python"
fi

# Check if Alembic migrations are requested on startup
if [ "${AUTOMIGRATE}" = "true" ]; then
    echo "Running database migrations with Alembic..."
    $PYTHON_EXECUTABLE -m alembic upgrade head
fi

# Set worker count from environment or default
WORKERS=${WORKERS:-1}

# Log startup configuration
echo "Starting with configuration:"
echo "  Environment: $APP_ENVIRONMENT"
echo "  Workers: $WORKERS"
echo "  Database: $DATABASE_URL"
echo "  Container: $CONTAINER_NAME ($CONTAINER_ID)"
echo "  Memory threshold: ${MEMORY_WARNING_THRESHOLD_MB}MB"
echo "  Graceful shutdown timeout: ${GRACEFUL_SHUTDOWN_TIMEOUT}s"

# Choose how to start the application based on the worker count
if [ "$WORKERS" -gt 1 ]; then
    # Multi-worker mode with Gunicorn
    if command -v gunicorn >/dev/null 2>&1; then
        echo "Starting with Gunicorn ($WORKERS workers)..."
        gunicorn main:app -b 0.0.0.0:8000 -w $WORKERS -k uvicorn.workers.UvicornWorker --access-logfile - --error-logfile - &
    else
        echo "Gunicorn not found, falling back to Uvicorn..."
        uvicorn main:app --host 0.0.0.0 --port 8000 --workers $WORKERS &
    fi
else
    # Single worker mode with Uvicorn
    echo "Starting with Uvicorn (reload mode)..."
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
fi

# Store PID for signal handling
APP_PID=$!
echo "Application server started with PID: $APP_PID"

# Wait for the application to terminate
wait $APP_PID