#!/bin/bash
# Production Readiness Validation Script for TAP Integration Platform

# Set environment variables
export NODE_ENV=test
export CYPRESS_RECORD_KEY=${CYPRESS_RECORD_KEY:-""}
export VALIDATION_DATE=$(date +"%Y-%m-%d")

# Create results directory
RESULTS_DIR="validation_results/${VALIDATION_DATE}"
mkdir -p ${RESULTS_DIR}

# Log function
log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" | tee -a "${RESULTS_DIR}/validation.log"
}

# Header
log "========================================================"
log "TAP Integration Platform - Production Readiness Validation"
log "========================================================"
log "Started validation process at $(date)"
log ""

# Step 1: Run unit and integration tests
log "STEP 1: Running unit and integration tests..."
npm run test:ci > "${RESULTS_DIR}/unit_tests.log" 2>&1
UNIT_TEST_RESULT=$?

if [ ${UNIT_TEST_RESULT} -eq 0 ]; then
  log "✅ Unit and integration tests PASSED"
else
  log "❌ Unit and integration tests FAILED - See ${RESULTS_DIR}/unit_tests.log for details"
fi

# Generate coverage reports
log "Generating code coverage reports..."
npm run test:coverage:summary > "${RESULTS_DIR}/coverage_summary.json" 2>&1
COVERAGE_RESULT=$?

if [ ${COVERAGE_RESULT} -eq 0 ]; then
  log "✅ Code coverage reports generated successfully"
else
  log "❌ Code coverage report generation FAILED"
fi

# Step 2: Run E2E tests
log ""
log "STEP 2: Running E2E tests..."
npm run cypress:run > "${RESULTS_DIR}/e2e_tests.log" 2>&1
E2E_RESULT=$?

if [ ${E2E_RESULT} -eq 0 ]; then
  log "✅ E2E tests PASSED"
else
  log "❌ E2E tests FAILED - See ${RESULTS_DIR}/e2e_tests.log for details"
fi

# Step 3: Run accessibility tests
log ""
log "STEP 3: Running accessibility tests..."
npm run cypress:a11y > "${RESULTS_DIR}/accessibility_tests.log" 2>&1
A11Y_RESULT=$?

if [ ${A11Y_RESULT} -eq 0 ]; then
  log "✅ Accessibility tests PASSED"
else
  log "❌ Accessibility tests FAILED - See ${RESULTS_DIR}/accessibility_tests.log for details"
fi

# Step 4: Run visual regression tests
log ""
log "STEP 4: Running visual regression tests..."
npm run cypress:visual > "${RESULTS_DIR}/visual_tests.log" 2>&1
VISUAL_RESULT=$?

if [ ${VISUAL_RESULT} -eq 0 ]; then
  log "✅ Visual regression tests PASSED"
else
  log "❌ Visual regression tests FAILED - See ${RESULTS_DIR}/visual_tests.log for details"
fi

# Step 5: Run performance tests
log ""
log "STEP 5: Running performance tests..."
npm run cypress:performance > "${RESULTS_DIR}/performance_tests.log" 2>&1
PERFORMANCE_RESULT=$?

if [ ${PERFORMANCE_RESULT} -eq 0 ]; then
  log "✅ Performance tests PASSED"
else
  log "❌ Performance tests FAILED - See ${RESULTS_DIR}/performance_tests.log for details"
fi

# Step 6: Generate consolidated report
log ""
log "STEP 6: Generating production readiness report..."
node scripts/generate_production_readiness_report.js \
  --unit-tests "${RESULTS_DIR}/unit_tests.log" \
  --coverage "${RESULTS_DIR}/coverage_summary.json" \
  --e2e-tests "${RESULTS_DIR}/e2e_tests.log" \
  --accessibility "${RESULTS_DIR}/accessibility_tests.log" \
  --visual "${RESULTS_DIR}/visual_tests.log" \
  --performance "${RESULTS_DIR}/performance_tests.log" \
  --output "${RESULTS_DIR}/production_readiness_report.md" \
  --date "${VALIDATION_DATE}" > "${RESULTS_DIR}/report_generation.log" 2>&1
REPORT_RESULT=$?

if [ ${REPORT_RESULT} -eq 0 ]; then
  log "✅ Production readiness report generated successfully"
else
  log "❌ Production readiness report generation FAILED"
fi

# Overall validation result
log ""
log "========================================================"
if [ ${UNIT_TEST_RESULT} -eq 0 ] && [ ${E2E_RESULT} -eq 0 ] && [ ${A11Y_RESULT} -eq 0 ] && [ ${VISUAL_RESULT} -eq 0 ] && [ ${PERFORMANCE_RESULT} -eq 0 ]; then
  log "🎉 VALIDATION PASSED - Platform is ready for production"
  VALIDATION_RESULT=0
else
  log "❌ VALIDATION FAILED - See individual test logs for details"
  VALIDATION_RESULT=1
fi
log "========================================================"

# Copy report to main results directory
cp "${RESULTS_DIR}/production_readiness_report.md" "validation_results/latest_production_readiness_report.md"

log "Validation complete. Report generated at ${RESULTS_DIR}/production_readiness_report.md"
log "A copy of the report is available at validation_results/latest_production_readiness_report.md"

# Create symlink to latest results
rm -f validation_results/latest
ln -s "${VALIDATION_DATE}" validation_results/latest

exit ${VALIDATION_RESULT}