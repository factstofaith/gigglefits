#!/bin/bash
# This script runs tests that don't depend on MSW

# Make script executable
chmod +x run-msw-free-tests.sh

echo "Running MSW-free tests..."
JEST_SETUP_FILE=./src/tests/standalone-setup.js npx jest --testMatch="**/MswFreeResourceLoader.test.jsx" --no-watchman

exit 0