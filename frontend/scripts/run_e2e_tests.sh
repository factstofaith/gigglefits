#!/bin/bash

# Enhanced E2E Test Execution Script for TAP Integration Platform
# This script runs Cypress E2E tests with specific configurations and generates reports

# Set environment variables
export CYPRESS_BASE_URL=http://localhost:3000
export CYPRESS_RECORD_KEY=cypress-record-key-123
export CYPRESS_VIDEO=true

# Default parameters
SPEC_PATTERN="cypress/e2e/flows/*.cy.js"
REPORT_DIR="cypress/reports"
JUNIT_REPORT_DIR="$REPORT_DIR/junit"
HTML_REPORT_DIR="$REPORT_DIR/html"
MODE="run"
TAGS=""
BROWSER="chrome"
HEADLESS=true
PARALLEL=false
ENV="development"
RECORD=false
A11Y_CHECK=false

# Help function
function show_help {
  echo "Usage: $0 [options]"
  echo
  echo "Options:"
  echo "  -s, --spec PATTERN      Specify test files to run (default: $SPEC_PATTERN)"
  echo "  -r, --report-dir DIR    Directory for test reports (default: $REPORT_DIR)"
  echo "  -m, --mode MODE         Mode: run or open (default: $MODE)"
  echo "  -t, --tags TAGS         Run tests with specific tags (comma-separated)"
  echo "  -b, --browser BROWSER   Browser to use: chrome, firefox, edge (default: $BROWSER)"
  echo "  -e, --env ENV           Test environment: development, staging, production (default: $ENV)"
  echo "  -o, --open              Open Cypress in interactive mode (default: headless)"
  echo "  -p, --parallel          Run tests in parallel (requires --record)"
  echo "  -c, --record            Record test results to Cypress Dashboard"
  echo "  -a, --a11y              Run accessibility checks during tests"
  echo "  -h, --help              Display this help message"
  echo
  echo "Examples:"
  echo "  $0 --spec \"cypress/e2e/flows/user-invitation-registration.cy.js\""
  echo "  $0 --tags \"smoke,regression\" --env staging"
  echo "  $0 --mode open --browser firefox"
  echo "  $0 --record --parallel --browser chrome"
  echo "  $0 --a11y --spec \"cypress/e2e/features/*.cy.js\""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -s|--spec)
      SPEC_PATTERN="$2"
      shift 2
      ;;
    -r|--report-dir)
      REPORT_DIR="$2"
      JUNIT_REPORT_DIR="$REPORT_DIR/junit"
      HTML_REPORT_DIR="$REPORT_DIR/html"
      shift 2
      ;;
    -m|--mode)
      MODE="$2"
      shift 2
      ;;
    -t|--tags)
      TAGS="$2"
      shift 2
      ;;
    -b|--browser)
      BROWSER="$2"
      shift 2
      ;;
    -e|--env)
      ENV="$2"
      shift 2
      ;;
    -o|--open)
      HEADLESS=false
      MODE="open"
      shift
      ;;
    -p|--parallel)
      PARALLEL=true
      shift
      ;;
    -c|--record)
      RECORD=true
      shift
      ;;
    -a|--a11y)
      A11Y_CHECK=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Validate browser
if [[ ! "$BROWSER" =~ ^(chrome|firefox|edge)$ ]]; then
  echo "Error: Invalid browser: $BROWSER"
  echo "Valid browsers: chrome, firefox, edge"
  exit 1
fi

# Validate environment
if [[ ! "$ENV" =~ ^(development|staging|production)$ ]]; then
  echo "Error: Invalid environment: $ENV"
  echo "Valid environments: development, staging, production"
  exit 1
fi

# If parallel is set, record must be enabled
if [ "$PARALLEL" = true ] && [ "$RECORD" = false ]; then
  echo "Warning: Parallel execution requires recording to be enabled."
  echo "Enabling recording to Cypress Dashboard."
  RECORD=true
fi

# Ensure report directories exist
mkdir -p "$JUNIT_REPORT_DIR"
mkdir -p "$HTML_REPORT_DIR"

# Set environment-specific variables
if [ "$ENV" == "production" ]; then
  export CYPRESS_BASE_URL="https://production.tap-integration-platform.com"
elif [ "$ENV" == "staging" ]; then
  export CYPRESS_BASE_URL="https://staging.tap-integration-platform.com"
else
  export CYPRESS_BASE_URL="http://localhost:3000"
fi

# Set up accessibility checks if requested
if [ "$A11Y_CHECK" = true ]; then
  export CYPRESS_A11Y_CHECK=true
fi

# Set headless mode environment variable
if [ "$HEADLESS" = true ]; then
  export CYPRESS_HEADLESS=true
else
  export CYPRESS_HEADLESS=false
fi

# Add tags if specified
if [ -n "$TAGS" ]; then
  export CYPRESS_TAGS="$TAGS"
fi

# Build the Cypress command
CYPRESS_CMD="npx cypress $MODE"

# Add browser selection
CYPRESS_CMD="$CYPRESS_CMD --browser $BROWSER"

# Add spec pattern if in run mode
if [ "$MODE" == "run" ]; then
  CYPRESS_CMD="$CYPRESS_CMD --spec \"$SPEC_PATTERN\""
  
  # Add recording options if enabled
  if [ "$RECORD" = true ]; then
    CYPRESS_CMD="$CYPRESS_CMD --record"
    
    if [ "$PARALLEL" = true ]; then
      CYPRESS_CMD="$CYPRESS_CMD --parallel"
    fi
  fi
  
  # Add reporter options
  CYPRESS_CMD="$CYPRESS_CMD --reporter mocha-junit-reporter"
  CYPRESS_CMD="$CYPRESS_CMD --reporter-options mochaFile=$JUNIT_REPORT_DIR/results-[hash].xml"
  
  # Add additional reporter for HTML reports
  CYPRESS_CMD="$CYPRESS_CMD --reporter mochawesome"
  CYPRESS_CMD="$CYPRESS_CMD --reporter-options reportDir=$HTML_REPORT_DIR,overwrite=false,html=true,json=true"
fi

# Print execution details
echo "====== E2E Test Execution ======"
echo "Mode: $MODE"
echo "Browser: $BROWSER"
echo "Environment: $ENV"
echo "Spec pattern: $SPEC_PATTERN"
echo "Report directory: $REPORT_DIR"
echo "Headless mode: $HEADLESS"
echo "Record to Dashboard: $RECORD"
echo "Parallel execution: $PARALLEL"
echo "Accessibility checks: $A11Y_CHECK"
if [ -n "$TAGS" ]; then
  echo "Tags: $TAGS"
fi
echo "==============================="

# Execute Cypress tests
echo "Starting test execution..."
echo $CYPRESS_CMD
eval $CYPRESS_CMD
CYPRESS_EXIT_CODE=$?

# Generate enhanced reports if in run mode
if [ "$MODE" == "run" ]; then
  echo "Generating HTML report..."
  
  # Generate combined mochawesome report
  if [ -d "$HTML_REPORT_DIR" ] && [ -n "$(find "$HTML_REPORT_DIR" -name '*.json')" ]; then
    echo "Merging mochawesome reports..."
    npx mochawesome-merge "$HTML_REPORT_DIR/*.json" > "$HTML_REPORT_DIR/combined-report.json"
    npx marge "$HTML_REPORT_DIR/combined-report.json" --reportDir "$HTML_REPORT_DIR" --inline --charts
  fi
  
  # Generate JUnit report
  node scripts/generate_test_report.js --input "$JUNIT_REPORT_DIR" --output "$HTML_REPORT_DIR"
  
  # Print report paths
  echo "Test execution completed."
  echo "Reports available at:"
  echo " - HTML Report: $HTML_REPORT_DIR/index.html"
  echo " - JUnit Report: $JUNIT_REPORT_DIR"
  
  # Show test summary
  echo "====== Test Summary ======"
  
  # Try to get summary from mochawesome report first
  if [ -f "$HTML_REPORT_DIR/combined-report.json" ]; then
    echo "Reading from Mochawesome report..."
    
    # Use jq to parse the combined report JSON
    TOTAL=$(jq '.stats.tests' "$HTML_REPORT_DIR/combined-report.json")
    PASSED=$(jq '.stats.passes' "$HTML_REPORT_DIR/combined-report.json")
    FAILED=$(jq '.stats.failures' "$HTML_REPORT_DIR/combined-report.json")
    SKIPPED=$(jq '.stats.skipped' "$HTML_REPORT_DIR/combined-report.json")
    DURATION=$(jq '.stats.duration' "$HTML_REPORT_DIR/combined-report.json")
    
    # Convert duration from ms to seconds
    DURATION_SEC=$(echo "scale=2; $DURATION / 1000" | bc)
    
  # Fall back to our custom summary.json if available
  elif [ -f "$HTML_REPORT_DIR/summary.json" ]; then
    echo "Reading from summary.json..."
    
    TOTAL=$(jq '.total' "$HTML_REPORT_DIR/summary.json")
    PASSED=$(jq '.passed' "$HTML_REPORT_DIR/summary.json")
    FAILED=$(jq '.failed' "$HTML_REPORT_DIR/summary.json")
    SKIPPED=$(jq '.skipped' "$HTML_REPORT_DIR/summary.json")
    DURATION=$(jq '.duration' "$HTML_REPORT_DIR/summary.json")
    
    # If duration is in ms, convert to seconds
    if [ $DURATION -gt 1000 ]; then
      DURATION_SEC=$(echo "scale=2; $DURATION / 1000" | bc)
    else
      DURATION_SEC=$DURATION
    fi
  else
    echo "Summary data not available."
    TOTAL=0
    PASSED=0
    FAILED=0
    SKIPPED=0
  fi
  
  # If we have test data, show summary
  if [ $TOTAL -gt 0 ]; then
    echo "Total tests: $TOTAL"
    echo "Passed: $PASSED"
    echo "Failed: $FAILED"
    echo "Skipped: $SKIPPED"
    
    # Calculate pass rate
    PASS_RATE=$(echo "scale=2; $PASSED * 100 / $TOTAL" | bc)
    echo "Pass rate: $PASS_RATE%"
    
    # Show duration if available
    if [ ! -z "$DURATION_SEC" ]; then
      echo "Duration: ${DURATION_SEC}s"
    fi
    
    # Show accessibility issues if a11y checks were enabled
    if [ "$A11Y_CHECK" = true ] && [ -f "$HTML_REPORT_DIR/a11y-summary.json" ]; then
      A11Y_ISSUES=$(jq '.total' "$HTML_REPORT_DIR/a11y-summary.json")
      echo "Accessibility issues: $A11Y_ISSUES"
    fi
  fi
  
  # Update test results document
  # Look for the document in multiple potential locations
  TEST_SUMMARY_DOCS=(
    "project/e2e_test_project/test_execution_summary.md"
    "project/111_tests/e2e_test_summary.md"
    "frontend/docs/testing/e2e_test_summary.md"
  )
  
  for SUMMARY_DOC in "${TEST_SUMMARY_DOCS[@]}"; do
    if [ -f "$SUMMARY_DOC" ]; then
      echo "Updating test execution summary in $SUMMARY_DOC..."
      DATE=$(date +"%Y-%m-%d %H:%M:%S")
      
      # Generate more detailed markdown summary
      SUMMARY_CONTENT="
## E2E Test Execution - $DATE

### Configuration
- **Environment:** $ENV
- **Browser:** $BROWSER
- **Spec Pattern:** \`$SPEC_PATTERN\`
- **Tags:** ${TAGS:-None}

### Results
- **Total Tests:** $TOTAL
- **Passed:** $PASSED
- **Failed:** $FAILED
- **Skipped:** $SKIPPED
- **Pass Rate:** $PASS_RATE%
- **Duration:** ${DURATION_SEC:-N/A}s

${A11Y_CHECK:+### Accessibility\n- **Issues:** $A11Y_ISSUES\n}

### Report Paths
- [HTML Report](../../../$HTML_REPORT_DIR/index.html)
- [JUnit Report](../../../$JUNIT_REPORT_DIR)
"
      # Append to summary file
      echo -e "$SUMMARY_CONTENT" >> "$SUMMARY_DOC"
      echo "Summary updated in $SUMMARY_DOC"
      break
    fi
  done
fi

# Create a new e2e test summary if it doesn't exist
if [ "$MODE" == "run" ] && [ $TOTAL -gt 0 ] && [ ! -f "project/111_tests/e2e_test_summary.md" ]; then
  mkdir -p "project/111_tests"
  echo "# E2E Test Summary" > "project/111_tests/e2e_test_summary.md"
  echo "This document tracks E2E test executions for the TAP Integration Platform." >> "project/111_tests/e2e_test_summary.md"
  echo "" >> "project/111_tests/e2e_test_summary.md"
  
  # Add initial summary
  DATE=$(date +"%Y-%m-%d %H:%M:%S")
  echo "## E2E Test Execution - $DATE" >> "project/111_tests/e2e_test_summary.md"
  echo "" >> "project/111_tests/e2e_test_summary.md"
  echo "### Configuration" >> "project/111_tests/e2e_test_summary.md"
  echo "- **Environment:** $ENV" >> "project/111_tests/e2e_test_summary.md"
  echo "- **Browser:** $BROWSER" >> "project/111_tests/e2e_test_summary.md"
  echo "- **Spec Pattern:** \`$SPEC_PATTERN\`" >> "project/111_tests/e2e_test_summary.md"
  if [ -n "$TAGS" ]; then
    echo "- **Tags:** $TAGS" >> "project/111_tests/e2e_test_summary.md"
  else
    echo "- **Tags:** None" >> "project/111_tests/e2e_test_summary.md"
  fi
  echo "" >> "project/111_tests/e2e_test_summary.md"
  echo "### Results" >> "project/111_tests/e2e_test_summary.md"
  echo "- **Total Tests:** $TOTAL" >> "project/111_tests/e2e_test_summary.md"
  echo "- **Passed:** $PASSED" >> "project/111_tests/e2e_test_summary.md"
  echo "- **Failed:** $FAILED" >> "project/111_tests/e2e_test_summary.md"
  echo "- **Skipped:** $SKIPPED" >> "project/111_tests/e2e_test_summary.md"
  echo "- **Pass Rate:** $PASS_RATE%" >> "project/111_tests/e2e_test_summary.md"
  if [ ! -z "$DURATION_SEC" ]; then
    echo "- **Duration:** ${DURATION_SEC}s" >> "project/111_tests/e2e_test_summary.md"
  else
    echo "- **Duration:** N/A" >> "project/111_tests/e2e_test_summary.md"
  fi
  echo "" >> "project/111_tests/e2e_test_summary.md"
  echo "### Report Paths" >> "project/111_tests/e2e_test_summary.md"
  echo "- [HTML Report](../../../$HTML_REPORT_DIR/index.html)" >> "project/111_tests/e2e_test_summary.md"
  echo "- [JUnit Report](../../../$JUNIT_REPORT_DIR)" >> "project/111_tests/e2e_test_summary.md"
  
  echo "Created new E2E test summary at project/111_tests/e2e_test_summary.md"
fi

# Exit with Cypress exit code
exit $CYPRESS_EXIT_CODE