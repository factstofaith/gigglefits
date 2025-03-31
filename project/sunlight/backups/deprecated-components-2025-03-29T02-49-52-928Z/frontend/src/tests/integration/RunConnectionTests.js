/**
 * RunConnectionTests.js
 * 
 * Script to run the live connection tests and display the results.
 * This can be executed directly or imported and used programmatically.
 */

import { runAllScenarios, runTestScenario } from './LiveConnectionTesting';

/**
 * Format validation errors for display
 * 
 * @param {Array} errors - The validation errors
 * @returns {string} Formatted error text
 */
const formatErrors = (errors) => {
  // Added display name
  formatErrors.displayName = 'formatErrors';

  // Added display name
  formatErrors.displayName = 'formatErrors';

  // Added display name
  formatErrors.displayName = 'formatErrors';

  // Added display name
  formatErrors.displayName = 'formatErrors';

  // Added display name
  formatErrors.displayName = 'formatErrors';


  if (!errors || errors.length === 0) {
    return 'No errors';
  }
  
  return errors.map(error => 
    `[${error.severity || 'error'}] ${error.message} ${error.details ? `- ${error.details}` : ''}`
  ).join('\n');
};

/**
 * Display test results in a formatted way
 * 
 * @param {Object} results - The test results
 * @param {boolean} verbose - Whether to show detailed error information
 */
const displayResults = (results, verbose = false) => {
  // Added display name
  displayResults.displayName = 'displayResults';

  // Added display name
  displayResults.displayName = 'displayResults';

  // Added display name
  displayResults.displayName = 'displayResults';

  // Added display name
  displayResults.displayName = 'displayResults';

  // Added display name
  displayResults.displayName = 'displayResults';


  
  // Display summary
  
  // Display individual test results
  Object.entries(results.results).forEach(([scenarioKey, result]) => {
    const status = result.meetsExpectations ? '✅ PASS' : '❌ FAIL';
    
    if (!result.meetsExpectations || verbose) {
      
      if (result.validationResults.errors.length > 0) {
        result.validationResults.errors.forEach(error => {
          if (verbose && error.details) {
          }
          if (verbose && error.recommendation) {
          }
        });
      }
      
    }
  });
  
  // Overall result
  if (results.summary.failed === 0) {
  } else {
  }
  
};

/**
 * Run a specific test scenario and display the results
 * 
 * @param {string} scenarioKey - The key of the test scenario to run
 * @param {boolean} verbose - Whether to show detailed error information
 */
const runSingleTest = (scenarioKey, verbose = true) => {
  // Added display name
  runSingleTest.displayName = 'runSingleTest';

  // Added display name
  runSingleTest.displayName = 'runSingleTest';

  // Added display name
  runSingleTest.displayName = 'runSingleTest';

  // Added display name
  runSingleTest.displayName = 'runSingleTest';

  // Added display name
  runSingleTest.displayName = 'runSingleTest';


  try {
    const result = runTestScenario(scenarioKey);
    
    
    result.nodes.forEach(node => {
    });
    
    result.edges.forEach(edge => {
    });
    
    
    if (result.validationResults.errors.length > 0) {
      result.validationResults.errors.forEach(error => {
        if (verbose && error.details) {
        }
        if (verbose && error.recommendation) {
        }
      });
    }
    
    
  } catch (error) {
    console.error(`Error running test scenario "${scenarioKey}":`, error);
  }
};

// If this script is run directly, run all tests
if (typeof window !== 'undefined' && window.runConnectionTests) {
  const results = runAllScenarios();
  displayResults(results, true);
}

export {
  runSingleTest,
  displayResults
};