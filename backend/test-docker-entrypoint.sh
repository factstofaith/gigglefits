#\!/bin/bash
echo "Starting TAP Integration Platform Backend in test mode"
echo "Environment: $APP_ENVIRONMENT"

# Create data directory if it doesn't exist
mkdir -p /app/data

# We're in Docker environment
export RUNNING_IN_DOCKER=true

# Create a minimal test app if main.py is not found
if [ \! -f "/app/main.py" ]; then
    echo "Creating a minimal test app for health check..."
    cp /app/minimal-app.py /app/main.py
fi

# Start the server with hot reloading
exec uvicorn main:app --host 0.0.0.0 --port 8000
