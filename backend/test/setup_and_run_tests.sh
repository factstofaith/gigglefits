#!/bin/bash
# Setup isolated test environment and run tests
# Usage: ./setup_and_run_tests.sh [--reset] [test_file_or_pattern]

# Set up color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# Process arguments
RESET_ENV=false
TEST_FILE=""
PYTEST_ARGS=""

for arg in "$@"; do
    if [[ "$arg" == "--reset" ]]; then
        RESET_ENV=true
    elif [[ "$arg" == --* ]]; then
        PYTEST_ARGS="$PYTEST_ARGS $arg"
    else
        TEST_FILE="$arg"
    fi
done

# Activate virtual environment if it exists
if [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source "$BACKEND_DIR/venv/bin/activate"
else
    echo -e "${YELLOW}No virtual environment found at $BACKEND_DIR/venv${NC}"
    echo -e "${YELLOW}Using system Python...${NC}"
fi

# Install test requirements
echo -e "${BLUE}Installing test requirements...${NC}"
pip install -r "$SCRIPT_DIR/test_requirements.txt"

# Setup environment
echo -e "${BLUE}Setting up test environment...${NC}"
if [ "$RESET_ENV" = true ]; then
    echo -e "${YELLOW}Resetting test environment...${NC}"
    python "$SCRIPT_DIR/setup_test_environment.py" --reset
else
    python "$SCRIPT_DIR/setup_test_environment.py"
fi

# Check if setup was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to set up test environment${NC}"
    exit 1
fi

# Source the test environment
if [ -f "$SCRIPT_DIR/.test.env" ]; then
    echo -e "${BLUE}Loading test environment variables...${NC}"
    export $(grep -v '^#' "$SCRIPT_DIR/.test.env" | xargs)
fi

# Run the tests
echo -e "${BLUE}Running tests...${NC}"
if [ -n "$TEST_FILE" ]; then
    echo -e "${BLUE}Running specific test: $TEST_FILE${NC}"
    python "$SCRIPT_DIR/run_tests.py" $TEST_FILE $PYTEST_ARGS
else
    echo -e "${BLUE}Running all tests${NC}"
    python "$SCRIPT_DIR/run_tests.py" $PYTEST_ARGS
fi

# Store test result
TEST_RESULT=$?

# Display result
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}Tests completed successfully!${NC}"
else
    echo -e "${RED}Tests failed with exit code $TEST_RESULT${NC}"
fi

# Generate test report if pytest-html is installed
if pip list | grep -q pytest-html; then
    echo -e "${BLUE}Generating test report...${NC}"
    python "$SCRIPT_DIR/run_tests.py" --report
fi

exit $TEST_RESULT