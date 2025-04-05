#!/bin/bash
set -e

echo "Starting TAP Integration Platform Backend"
echo "Environment: $APP_ENVIRONMENT"

# Set Docker environment flags
export RUNNING_IN_DOCKER=true
export CONTAINER_NAME=${CONTAINER_NAME:-tap-backend}

# Create data directory if it doesn't exist
mkdir -p /app/data

# Ensure log directory exists
mkdir -p /app/logs

# Set additional environment variables for signal handlers
export GRACEFUL_SHUTDOWN_TIMEOUT=${GRACEFUL_SHUTDOWN_TIMEOUT:-30}

# Signal handling for proper container shutdown
handle_sigterm() {
    echo "Received SIGTERM signal, shutting down gracefully..."
    # The application's signal handlers will handle the graceful shutdown
    # Just forward the signal
    kill -TERM "$APP_PID" 2>/dev/null || true
    wait "$APP_PID"
    echo "Application shut down"
    exit 0
}

# Register signal handler
trap handle_sigterm SIGTERM SIGINT

# Run startup script if it exists
if [ -f "/app/startup.sh" ]; then
  echo "Running startup script..."
  bash /app/startup.sh
fi

echo "Starting application server..."

# Check if main-test.py exists and use it if available
if [ -f "main-test.py" ]; then
  echo "Using main-test.py for quick testing"
  uvicorn main-test:app --host 0.0.0.0 --port 8000 --reload &
else
  # Start the server with hot reloading
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
fi

# Store PID for signal handling
APP_PID=$!
echo "Application server started with PID: $APP_PID"

# Wait for the application to terminate
wait $APP_PID