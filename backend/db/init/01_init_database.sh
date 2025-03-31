#!/bin/bash
# Database initialization script
set -e

echo "Initializing TAP Integration Platform database..."

# Create test database if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE tap_test WITH OWNER = postgres ENCODING = 'UTF8' CONNECTION LIMIT = -1;
EOSQL

echo "Database initialization completed successfully."