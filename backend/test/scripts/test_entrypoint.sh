#!/bin/bash
# Test entrypoint script for backend container
# This script sets up the test environment and runs the tests

set -e

# Display banner
echo "================================================"
echo "TAP Integration Platform - Backend Test Runner"
echo "================================================"

# Parse arguments
TEST_TYPE=${1:-all}
COVERAGE=${2:-no}
VERBOSE=${3:-no}

# Setup test environment
echo "Setting up test environment..."
export TEST_MODE=true
export TEST_DATABASE_URL=sqlite:///test_db.sqlite
export JWT_SECRET_KEY=test_secret_key_for_jwt_tokens
export TEST_ADMIN_EMAIL=admin@test.com
export TEST_ADMIN_PASSWORD=admin123
export TEST_USER_EMAIL=user@test.com
export TEST_USER_PASSWORD=user123
export TEST_MFA_SECRET=ABCDEFGHIJKLMNOP
export MOCK_EMAIL_SERVER=true
export TEST_OAUTH_MOCK=true

# OAuth test configuration
export TEST_OFFICE365_CLIENT_ID=mock_office365_client_id
export TEST_OFFICE365_CLIENT_SECRET=mock_office365_client_secret
export TEST_GMAIL_CLIENT_ID=mock_gmail_client_id
export TEST_GMAIL_CLIENT_SECRET=mock_gmail_client_secret
export TEST_OAUTH_REDIRECT_URI=http://localhost:8000/api/invitations/oauth/{provider}/callback

# Prepare test command
cmd="python -m pytest"

# Add test type marker
case $TEST_TYPE in
    unit)
        cmd="$cmd -m unit"
        ;;
    integration)
        cmd="$cmd -m integration"
        ;;
    api)
        cmd="$cmd -m api"
        ;;
    db)
        cmd="$cmd -m db"
        ;;
    e2e)
        cmd="$cmd -m e2e"
        ;;
    all)
        # No marker needed
        ;;
    *)
        echo "Unknown test type: $TEST_TYPE"
        echo "Valid types: unit, integration, api, db, e2e, all"
        exit 1
        ;;
esac

# Add coverage if requested
if [ "$COVERAGE" = "yes" ]; then
    cmd="$cmd --cov=. --cov-report=html:test_results/coverage --cov-report=term"
fi

# Add verbosity if requested
if [ "$VERBOSE" = "yes" ]; then
    cmd="$cmd -v"
fi

# Add report output
cmd="$cmd --html=test_results/report.html"

# Add test directory
cmd="$cmd test"

# Run the tests
echo "Running tests: $cmd"
$cmd

# Display completion message
echo "================================================"
echo "Test run completed!"
echo "Results available in /app/test_results/"
echo "================================================"