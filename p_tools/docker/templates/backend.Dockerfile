# Production Dockerfile for TAP Integration Platform Backend
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libpq-dev \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional packages for monitoring and health checks
RUN pip install --no-cache-dir \
    psutil \
    pydantic-settings \
    httpx

# Copy application code
COPY . .

# Create data directory for database files
RUN mkdir -p /app/data && chmod 777 /app/data

# Create a health check script
RUN echo '#!/bin/bash\n\
curl -f http://localhost:8000/health || exit 1\n\
' > /app/healthcheck.sh && chmod +x /app/healthcheck.sh

# Create an entrypoint script
RUN echo '#!/bin/bash\n\
echo "Starting TAP Integration Platform Backend"\n\
echo "Environment: $APP_ENVIRONMENT"\n\
\n\
# Run migrations if AUTOMIGRATE is enabled\n\
if [ "$AUTOMIGRATE" = "true" ]; then\n\
  echo "Running database migrations..."\n\
  python -m db.manage_db migrate\n\
fi\n\
\n\
# Run startup script if it exists\n\
if [ -f "/app/startup.sh" ]; then\n\
  echo "Running startup script..."\n\
  chmod +x /app/startup.sh\n\
  bash /app/startup.sh\n\
fi\n\
\n\
# Start the server\n\
echo "Starting server on port 8000..."\n\
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers $WORKERS\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose API port
EXPOSE 8000

# Set default environment variables
ENV WORKERS=4 \
    AUTOMIGRATE=false \
    APP_ENVIRONMENT=production \
    API_VERSION=v1 \
    ENVIRONMENT=production \
    LOG_LEVEL=INFO \
    DB_SSL_REQUIRED=true

# Add Docker healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD [ "/app/healthcheck.sh" ]

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]