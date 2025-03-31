#!/bin/bash
set -e

echo "Starting TAP Integration Platform Backend"

# Create web.config with secure headers
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

# Create uploads directory if it doesn't exist
mkdir -p /home/site/wwwroot/uploads
chmod 755 /home/site/wwwroot/uploads

# Run database migrations
echo "Running database migrations..."
cd /home/site/wwwroot
python -m db.run_migrations

# Start the application with uvicorn
echo "Starting uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000