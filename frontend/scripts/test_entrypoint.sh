#!/bin/bash
# Test entrypoint script for frontend container
# This script sets up the test environment and runs the tests

set -e

# Display banner
echo "================================================"
echo "TAP Integration Platform - Frontend Test Runner"
echo "================================================"

# Parse arguments
TEST_TYPE=${1:-standard}
COVERAGE=${2:-no}
CI_MODE=${3:-yes}

# Set environment variables
export CI=true
export NODE_ENV=test
export TEST_TYPE=$TEST_TYPE

# Create command based on test type
cmd="npm run"

case $TEST_TYPE in
    standard)
        cmd="$cmd test"
        ;;
    contexts)
        cmd="$cmd test:contexts"
        ;;
    utils)
        cmd="$cmd test:utils"
        ;;
    integration)
        cmd="$cmd test:integration"
        ;;
    a11y)
        cmd="$cmd test:a11y"
        ;;
    *)
        echo "Unknown test type: $TEST_TYPE"
        echo "Valid types: standard, contexts, utils, integration, a11y"
        exit 1
        ;;
esac

# Add coverage if requested
if [ "$COVERAGE" = "yes" ]; then
    cmd="$cmd -- --coverage"
fi

# Add CI mode if not already in CI mode
if [ "$CI_MODE" = "yes" ] && [ -z "$CI" ]; then
    cmd="$cmd -- --ci"
fi

# Add watchAll=false to ensure tests run once and exit
cmd="$cmd -- --watchAll=false"

# Run the tests
echo "Running tests: $cmd"
$cmd

# If coverage was generated, copy it to the test_results directory
if [ "$COVERAGE" = "yes" ]; then
    mkdir -p /app/test_results
    cp -r /app/coverage/* /app/test_results/
fi

# Display completion message
echo "================================================"
echo "Test run completed!"
if [ "$COVERAGE" = "yes" ]; then
    echo "Coverage results available in /app/test_results/"
fi
echo "================================================"