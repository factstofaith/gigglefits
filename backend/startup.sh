#!/bin/bash
set -e

echo "Starting TAP Integration Platform Backend"

# Create web.config with secure headers for Azure environments only
# Skip in Docker environment
if [[ -z "${RUNNING_IN_DOCKER}" ]] && [[ -d "/home/site/wwwroot" ]]; then
    echo "Creating web.config for Azure environment..."
    cat > /home/site/wwwroot/web.config << EOL
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains; preload" />
        <add name="Content-Security-Policy" value="default-src 'self'; script-src 'self'; object-src 'none'; upgrade-insecure-requests;" />
        <add name="Referrer-Policy" value="no-referrer-when-downgrade" />
        <add name="Permissions-Policy" value="accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" />
      </customHeaders>
    </httpProtocol>
    <rewrite>
      <rules>
        <rule name="HTTP to HTTPS redirect" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{HTTPS}" pattern="off" ignoreCase="true" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
EOL
else
    echo "Skipping web.config creation - running in Docker or directory not found"
fi

# Create uploads directory if it doesn't exist (only for Azure environments)
if [[ -z "${RUNNING_IN_DOCKER}" ]] && [[ -d "/home/site/wwwroot" ]]; then
  echo "Creating uploads directory for Azure environment..."
  mkdir -p /home/site/wwwroot/uploads
  chmod 755 /home/site/wwwroot/uploads
fi

# Run database migrations (adjust paths for Docker vs Azure)
echo "Running database migrations..."
if [[ -z "${RUNNING_IN_DOCKER}" ]] && [[ -d "/home/site/wwwroot" ]]; then
  echo "Using Azure paths for database migrations..."
  cd /home/site/wwwroot
else
  # In Docker, we're already in the right directory
  CURRENT_DIR=$(pwd)
  echo "Using Docker paths for database migrations, current directory: $CURRENT_DIR"
  
  # Ensure data directory exists and is writable (for SQLite)
  mkdir -p /app/data || true
fi

# Try to run migrations but don't fail if they fail
python -m db.run_migrations || echo "WARNING: Database migrations failed"

# Start the application with uvicorn only in Azure (in Docker, entrypoint.sh handles this)
if [[ -z "${RUNNING_IN_DOCKER}" ]]; then
  echo "Starting uvicorn server in Azure environment..."
  exec uvicorn main:app --host 0.0.0.0 --port 8000
else
  echo "In Docker environment: uvicorn will be started by entrypoint.sh"
fi