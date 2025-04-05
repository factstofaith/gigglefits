#!/bin/bash
set -e

echo "Checking if database should be seeded..."

# Check if AUTO_SEED environment variable is set to true
if [ "$AUTO_SEED" = "true" ]; then
    echo "AUTO_SEED is enabled. Seeding database..."
    python -m db.seed_db
    echo "Database seeding completed!"
else
    echo "AUTO_SEED is not enabled. Skipping database seeding."
fi