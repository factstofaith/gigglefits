#!/bin/bash

# This script runs context tests without the global MSW setup
# to avoid conflicts with the MSW mock server

echo "Running UserContext tests with specialized context test configuration..."
NODE_ENV=test npx jest src/tests/contexts/UserContext.test.js --config=jest.contexts.config.js --no-cache --testEnvironment=jsdom --runInBand --verbose --watchAll=false
echo "Test run complete."