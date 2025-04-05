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
    cat > /app/main.py << 'END'
from fastapi import FastAPI
import os

# Create a simple test app for health checks
app = FastAPI(title="Test Backend App")

@app.get("/health")
def health():
    return {"status": "ok", "message": "Test service is running"}

@app.get("/")
def root():
    # Show environment variables
    env_vars = {key: value for key, value in os.environ.items() 
                if not key.startswith("PATH") and not key.startswith("PYTHON")}
    return {"status": "ok", "environment": env_vars}
END
fi

# Start the server with hot reloading
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
