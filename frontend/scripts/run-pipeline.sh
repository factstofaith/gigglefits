#!/bin/bash
# 
# Combined NPM and QA Testing Pipeline Runner
#
# This script provides a convenient way to run the integrated pipeline
# with proper environment setup and error handling.
#

# Set error handling
set -e

# Change to project directory (supports running from any location)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Parse arguments
SKIP_BUILD=0
SKIP_TESTS=0
REPORT_ONLY=0
VERBOSE=0

for arg in "$@"; do
  case $arg in
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=1
      shift
      ;;
    --report-only)
      REPORT_ONLY=1
      shift
      ;;
    --verbose)
      VERBOSE=1
      shift
      ;;
    --help)
      echo "Combined NPM and QA Testing Pipeline Runner"
      echo ""
      echo "Usage:"
      echo "  ./scripts/run-pipeline.sh [options]"
      echo ""
      echo "Options:"
      echo "  --skip-build     Skip the package build step"
      echo "  --skip-tests     Skip the test execution"
      echo "  --report-only    Generate reports without failing on errors"
      echo "  --verbose        Show detailed output"
      echo "  --help           Show this help message"
      exit 0
      ;;
  esac
done

# Build arguments for the Node.js script
ARGS=""
if [ $SKIP_BUILD -eq 1 ]; then
  ARGS="$ARGS --skip-build"
fi

if [ $SKIP_TESTS -eq 1 ]; then
  ARGS="$ARGS --skip-tests"
fi

if [ $REPORT_ONLY -eq 1 ]; then
  ARGS="$ARGS --report-only"
fi

if [ $VERBOSE -eq 1 ]; then
  ARGS="$ARGS --verbose"
fi

# Make script executable
chmod +x "./scripts/run-integrated-pipeline.js"

# Run the pipeline
echo "Starting integrated pipeline with arguments: $ARGS"
node "./scripts/run-integrated-pipeline.js" $ARGS

# Exit with the script's exit code
exit $?