#!/bin/bash

# Full Cleanup Script for TAP Integration Platform Frontend
# This script runs all the cleanup processes in sequence

echo "=== TAP Integration Platform Frontend Cleanup ==="
echo "Starting cleanup process at $(date)"

# Create logs directory
mkdir -p ../logs

# Run the main project cleanup
echo ""
echo "=== Running Project Cleanup ==="
node ./cleanup.js | tee ../logs/cleanup_$(date +%Y%m%d_%H%M%S).log

# Run design system cleanup
echo ""
echo "=== Running Design System Cleanup ==="
node ./design-system-cleanup.js | tee ../logs/design_system_cleanup_$(date +%Y%m%d_%H%M%S).log

# Analyze webpack configuration files
echo ""
echo "=== Analyzing Webpack Configuration ==="
echo "Checking for webpack configuration issues..."
grep -r "getClientEnvironment" ../config --include="*.js" | tee ../logs/webpack_analysis_$(date +%Y%m%d_%H%M%S).log

# Final verification
echo ""
echo "=== Running Final Verification ==="
echo "Checking for duplicate MUI imports..."
grep -r "@mui/material" ../src --include="*.js" --include="*.jsx" | grep -v "import {" | wc -l

echo ""
echo "Cleanup process completed at $(date)"
echo "Check logs directory for detailed logs."