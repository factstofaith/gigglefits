#!/bin/bash
# Mock build script for the backend
# This script simulates a successful build for demonstration purposes

echo "Starting TAP Integration Platform Backend mock build..."

# Create build directory structure
echo "Creating build directory structure..."
mkdir -p build/api
mkdir -p build/static
mkdir -p build/docs
mkdir -p build/tests

# Create mock build artifacts
echo "Creating mock build artifacts..."

# API documentation artifact
echo '{
  "openapi": "3.0.0",
  "info": {
    "title": "TAP Integration Platform API",
    "version": "1.0.0"
  },
  "paths": {}
}' > build/api/openapi.json

# Static resources
echo "TAP Integration Platform Backend" > build/static/index.html

# Documentation
echo "# TAP Integration Platform Backend

API Documentation" > build/docs/README.md

# Test results
echo '{
  "tests": 120,
  "passes": 120,
  "failures": 0,
  "coverage": 85
}' > build/tests/summary.json

# Main build artifact - a marker file
echo "Build completed on: $(date)" > build/build_complete.txt

echo "Backend build completed successfully!"
exit 0
