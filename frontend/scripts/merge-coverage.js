/**
 * Script to merge coverage reports from Jest and Cypress
 * 
 * This script combines coverage reports from both testing frameworks
 * into a single unified report.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// Configuration
const JEST_COVERAGE_DIR = path.resolve(__dirname, '../coverage');
const CYPRESS_COVERAGE_DIR = path.resolve(__dirname, '../.nyc_output');
const OUTPUT_DIR = path.resolve(__dirname, '../.nyc_output');
const MERGED_COVERAGE = path.resolve(OUTPUT_DIR, 'merged-coverage.json');
const TEMP_COVERAGE = path.resolve(OUTPUT_DIR, 'temp-coverage.json');
const COVERAGE_SUMMARY = path.resolve(JEST_COVERAGE_DIR, 'coverage-summary.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Check if a path exists
 */
function pathExists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Copy Jest coverage report to a format NYC can use
 */
function processJestCoverage() {
  try {
    // Check if Jest coverage exists
    const jestCoveragePath = path.resolve(JEST_COVERAGE_DIR, 'coverage-final.json');
    if (!pathExists(jestCoveragePath)) {
      console.log('No Jest coverage found. Run Jest tests with coverage first.');
      return false;
    }

    // Read Jest coverage
    const jestCoverage = JSON.parse(fs.readFileSync(jestCoveragePath, 'utf8'));

    // Write to temporary file in NYC format
    fs.writeFileSync(
      path.resolve(OUTPUT_DIR, 'jest-coverage.json'),
      JSON.stringify(jestCoverage)
    );
    
    return true;
  } catch (err) {
    console.error('Error processing Jest coverage:', err.message);
    return false;
  }
}

/**
 * Check for Cypress coverage reports
 */
function processCypressCoverage() {
  try {
    // Look for Cypress coverage files
    const cypressCoverageFiles = glob.sync(
      path.resolve(CYPRESS_COVERAGE_DIR, 'coverage-*.json')
    );
    
    if (cypressCoverageFiles.length === 0) {
      console.log('No Cypress coverage found. Run Cypress tests with coverage first.');
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error processing Cypress coverage:', err.message);
    return false;
  }
}

/**
 * Merge coverage reports using NYC
 */
function mergeCoverage() {
  try {
    console.log('Merging coverage reports...');
    
    // Use nyc merge to combine reports
    execSync('nyc merge .nyc_output .nyc_output/merged-coverage.json', { 
      stdio: 'inherit'
    });
    
    // Generate HTML report
    execSync('nyc report --reporter=html --reporter=lcov --reporter=text --reporter=json-summary', {
      stdio: 'inherit',
      env: {
        ...process.env,
        NYC_CONFIG: path.resolve(__dirname, '../.nycrc')
      }
    });
    
    console.log('\n✅ Coverage reports successfully merged!');
    console.log(`HTML report: ${path.resolve(process.cwd(), 'coverage/index.html')}`);
    console.log(`LCOV report: ${path.resolve(process.cwd(), 'coverage/lcov.info')}`);
    console.log(`JSON summary: ${path.resolve(process.cwd(), 'coverage/coverage-summary.json')}`);
    
    console.log('\nTo view the HTML report, open:');
    console.log(`file://${path.resolve(process.cwd(), 'coverage/index.html')}`);
    
    return true;
  } catch (err) {
    console.error('Error merging coverage reports:', err.message);
    return false;
  }
}

/**
 * Run the coverage combination process
 */
async function main() {
  console.log('=== Coverage Merger ===\n');
  
  const hasJestCoverage = processJestCoverage();
  const hasCypressCoverage = processCypressCoverage();
  
  if (!hasJestCoverage && !hasCypressCoverage) {
    console.error('No coverage data found. Run tests with coverage first.');
    console.log('Jest: npm run test:coverage');
    console.log('Cypress: npm run cypress:coverage');
    process.exit(1);
  }
  
  const mergeSuccessful = mergeCoverage();
  
  if (!mergeSuccessful) {
    console.error('Failed to merge coverage reports.');
    process.exit(1);
  }
}

// Run the script
main();