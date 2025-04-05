from fastapi import FastAPI
import os

# Create a simple test app for health checks
app = FastAPI(title="TAP Backend Test")

@app.get("/health")
def health():
    return {"status": "ok", "message": "Service is running"}

@app.get("/")
def root():
    # Show environment variables
    env_vars = {key: value for key, value in os.environ.items() 
                if not key.startswith("PATH") and not key.startswith("PYTHON")}
    return {"status": "ok", "environment": env_vars}
