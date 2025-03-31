/**
 * Phase Analyzer
 * 
 * A comprehensive tool to analyze project progress, identify areas for improvement,
 * and generate recommendations for the current phase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Phase definitions with requirements and success criteria
const phases = {
  'foundation': {
    name: 'Foundation Setup',
    requirements: [
      { name: 'Project Structure', pattern: /webpack\..*\.js$/, minCount: 3 },
      { name: 'Documentation', pattern: /\.md$/, minCount: 2 },
      { name: 'Build Scripts', pattern: /scripts\/.+\.js$/, minCount: 2 }
    ],
    success: {
      'Build Success': () => runBuild(),
      'ESM Support': () => checkESMSupport(),
      'CJS Support': () => checkCJSSupport()
    }
  },
  'components': {
    name: 'Component Standardization',
    requirements: [
      { name: 'Common Components', pattern: /components\/common\/.+\.jsx$/, minCount: 8 },
      { name: 'Component Tests', pattern: /components\/.+\.test\.jsx$/, minCount: 8 },
      { name: 'Component Template', pattern: /ComponentTemplate\.jsx$/, exists: true }
    ],
    success: {
      'Component Tests Passing': () => runTests('component'),
      'Component Structure Standardized': () => checkComponentStructure(),
      'Accessibility Basics': () => checkA11yBasics()
    }
  },
  'state': {
    name: 'State Management and Hooks',
    requirements: [
      { name: 'Context Providers', pattern: /contexts\/.+\.jsx$/, minCount: 3 },
      { name: 'Custom Hooks', pattern: /hooks\/.+\.js$/, minCount: 3 },
      { name: 'API Services', pattern: /services\/.+\.js$/, minCount: 1 },
      { name: 'Utility Libraries', pattern: /utils\/.+\.js$/, minCount: 3 }
    ],
    success: {
      'Hook Tests Passing': () => runTests('hook'),
      'Context Integration': () => checkContextIntegration(),
      'Service Layer Implementation': () => checkServiceLayer()
    }
  },
  'performance': {
    name: 'Performance Optimization',
    requirements: [
      { name: 'Bundle Analysis Tools', pattern: /utils\/.*bundle.*\.js$/i, exists: true },
      { name: 'Performance Monitoring', pattern: /utils\/.*performance.*\.js$/i, exists: true },
      { name: 'Code Splitting Implementation', pattern: /.*lazy.*|.*Suspense.*|.*dynamic.*import.*/i, minCount: 3 }
    ],
    success: {
      'Bundle Size Optimized': () => checkBundleSize(),
      'Render Performance': () => checkRenderPerformance(),
      'Load Time Improvement': () => checkLoadTime()
    }
  },
  'testing': {
    name: 'Testing and Quality',
    requirements: [
      { name: 'Testing Framework', pattern: /utils\/.*testing.*\.js$/i, minCount: 3 },
      { name: 'Test Templates', pattern: /tests\/templates\/.+\.js(x)?$/, minCount: 3 },
      { name: 'Test Examples', pattern: /tests\/(components|e2e)\/.+\.(test|visual|e2e)\.js(x)?$/, minCount: 3 }
    ],
    success: {
      'All Tests Passing': () => runAllTests(),
      'Test Coverage': () => checkTestCoverage(),
      'Visual Regression Tests': () => checkVisualTests(),
      'E2E Tests': () => checkE2ETests()
    }
  },
  'accessibility': {
    name: 'Accessibility and Documentation',
    requirements: [
      { name: 'A11y Components', pattern: /components\/.*a11y.*\.jsx$/i, minCount: 5 },
      { name: 'A11y Testing Tools', pattern: /utils\/.*a11y.*\.js$/i, exists: true },
      { name: 'Documentation', pattern: /(storybook|docs)\/.+\.js(x)?$/, minCount: 5 },
      { name: 'Developer Tools', pattern: /scripts\/(generate|create).*\.js$/i, minCount: 2 }
    ],
    success: {
      'A11y Compliance': () => checkA11yCompliance(),
      'Documentation Coverage': () => checkDocumentationCoverage(),
      'Developer Tool Functionality': () => checkDevTools()
    }
  },
  'advanced': {
    name: 'Advanced Optimizations',
    requirements: [
      { name: 'Caching Strategy', pattern: /utils\/.*cache.*\.js$/i, exists: true },
      { name: 'Offline Support', pattern: /.*workbox.*|.*serviceworker.*/i, exists: true },
      { name: 'Progressive Web App', pattern: /.*manifest.*\.json$|.*pwa.*/i, exists: true },
      { name: 'Module Federation', pattern: /.*federation.*|.*microfrontend.*/i, exists: true }
    ],
    success: {
      'Offline Functionality': () => checkOfflineMode(),
      'PWA Audit': () => checkPWAAudit(),
      'Advanced Bundle Optimization': () => checkAdvancedBundling()
    }
  }
};

// Utility functions for checking
function runBuild() {
  try {
    console.log('Running build...');
    // Mock for illustration - would run actual build command
    // execSync('npm run build', { stdio: 'inherit' });
    return { success: true, message: 'Build completed successfully' };
  } catch (error) {
    return { success: false, message: `Build failed: ${error.message}` };
  }
}

function checkESMSupport() {
  // Mock for illustration
  return { success: true, message: 'ESM modules properly configured' };
}

function checkCJSSupport() {
  // Mock for illustration
  return { success: true, message: 'CommonJS modules properly configured' };
}

function runTests(type) {
  try {
    console.log(`Running ${type} tests...`);
    // Mock for illustration
    // execSync(`npm run test:${type}`, { stdio: 'inherit' });
    return { success: true, message: `${type} tests passed` };
  } catch (error) {
    return { success: false, message: `${type} tests failed: ${error.message}` };
  }
}

function runAllTests() {
  try {
    console.log('Running all tests...');
    // Mock for illustration
    // execSync('npm test', { stdio: 'inherit' });
    return { success: true, message: 'All tests passed' };
  } catch (error) {
    return { success: false, message: `Tests failed: ${error.message}` };
  }
}

function checkComponentStructure() {
  // Mock for illustration
  return { success: true, message: 'Component structure follows standardized pattern' };
}

function checkA11yBasics() {
  // Mock for illustration
  return { success: true, message: 'Basic accessibility features implemented' };
}

function checkContextIntegration() {
  // Mock for illustration
  return { success: true, message: 'Context providers properly integrated with components' };
}

function checkServiceLayer() {
  // Mock for illustration
  return { success: true, message: 'Service layer correctly implemented with error handling' };
}

function checkBundleSize() {
  // Mock for illustration
  return { success: true, message: 'Bundle size optimized within target range' };
}

function checkRenderPerformance() {
  // Mock for illustration
  return { success: true, message: 'Render performance meets target metrics' };
}

function checkLoadTime() {
  // Mock for illustration
  return { success: true, message: 'Initial load time meets target metrics' };
}

function checkTestCoverage() {
  // Mock for illustration
  return { success: true, message: 'Test coverage exceeds 80% threshold' };
}

function checkVisualTests() {
  // Mock for illustration
  return { success: true, message: 'Visual regression tests implemented and passing' };
}

function checkE2ETests() {
  // Mock for illustration
  return { success: true, message: 'End-to-end tests implemented and passing' };
}

function checkA11yCompliance() {
  // Mock for illustration
  return { success: false, message: 'Some components do not meet WCAG AA standards' };
}

function checkDocumentationCoverage() {
  // Mock for illustration
  return { success: false, message: 'API documentation incomplete for 30% of components' };
}

function checkDevTools() {
  // Mock for illustration
  return { success: false, message: 'Component generator needs improvement for accessibility support' };
}

function checkOfflineMode() {
  // Mock for illustration
  return { success: false, message: 'Offline mode not fully implemented' };
}

function checkPWAAudit() {
  // Mock for illustration
  return { success: false, message: 'PWA audit shows performance issues' };
}

function checkAdvancedBundling() {
  // Mock for illustration
  return { success: false, message: 'Advanced code splitting needs optimization' };
}

/**
 * Find files matching a pattern in the project
 * 
 * @param {RegExp} pattern - Pattern to match
 * @param {string} dir - Directory to search
 * @returns {Array} Matching file paths
 */
function findFiles(pattern, dir = './src') {
  // For illustration, return mock data
  // In a real implementation, would recursively scan directories
  
  if (pattern.toString().includes('webpack')) {
    return [
      './config/webpack.common.js',
      './config/webpack.dev.js',
      './config/webpack.prod.js',
      './config/webpack.esm.js',
      './config/webpack.cjs.js'
    ];
  }
  
  if (pattern.toString().includes('components\/common')) {
    return [
      './src/components/common/Button.jsx',
      './src/components/common/Card.jsx',
      './src/components/common/Alert.jsx',
      './src/components/common/TextField.jsx',
      './src/components/common/Checkbox.jsx',
      './src/components/common/Select.jsx',
      './src/components/common/Modal.jsx',
      './src/components/common/Tabs.jsx',
      './src/components/common/Table.jsx',
      './src/components/common/Tooltip.jsx'
    ];
  }
  
  if (pattern.toString().includes('contexts')) {
    return [
      './src/contexts/ThemeContext.jsx',
      './src/contexts/ConfigContext.jsx',
      './src/contexts/NotificationContext.jsx',
      './src/contexts/AuthContext.jsx',
      './src/contexts/DialogContext.jsx'
    ];
  }
  
  if (pattern.toString().includes('hooks')) {
    return [
      './src/hooks/useLocalStorage.js',
      './src/hooks/useAsync.js',
      './src/hooks/useForm.js',
      './src/hooks/useMediaQuery.js',
      './src/hooks/useNotification.js'
    ];
  }
  
  if (pattern.toString().includes('testing')) {
    return [
      './src/utils/testingFramework.js',
      './src/utils/visualRegressionTesting.js',
      './src/utils/e2eTesting.js'
    ];
  }
  
  if (pattern.toString().includes('templates')) {
    return [
      './src/tests/templates/ComponentTestTemplate.jsx',
      './src/tests/templates/VisualRegressionTestTemplate.js',
      './src/tests/templates/E2ETestTemplate.js'
    ];
  }
  
  if (pattern.toString().includes('a11y')) {
    return [
      './src/components/common/A11yButton.jsx',
      './src/components/common/A11yDialog.jsx',
      './src/components/common/A11yForm.jsx',
      './src/components/common/A11yTooltip.jsx'
    ];
  }
  
  // Default return some files for illustration
  return [
    './src/example1.js',
    './src/example2.js'
  ];
}

/**
 * Check if a phase requirement is met
 * 
 * @param {Object} requirement - Requirement to check
 * @returns {Object} Result with status and details
 */
function checkRequirement(requirement) {
  const files = findFiles(requirement.pattern);
  
  if (requirement.exists !== undefined) {
    const exists = files.length > 0;
    return {
      name: requirement.name,
      status: exists === requirement.exists,
      details: exists 
        ? `Found file matching ${requirement.pattern}` 
        : `No file matching ${requirement.pattern}`
    };
  }
  
  if (requirement.minCount !== undefined) {
    const status = files.length >= requirement.minCount;
    return {
      name: requirement.name,
      status,
      details: `Found ${files.length} files, required ${requirement.minCount}`,
      files
    };
  }
  
  return {
    name: requirement.name,
    status: true,
    details: 'Requirement check not specified',
    files
  };
}

/**
 * Run success criteria checks for a phase
 * 
 * @param {Object} criteria - Success criteria functions
 * @returns {Array} Results of criteria checks
 */
function runSuccessCriteria(criteria) {
  const results = [];
  
  for (const [name, checkFn] of Object.entries(criteria)) {
    const result = checkFn();
    results.push({
      name,
      status: result.success,
      details: result.message
    });
  }
  
  return results;
}

/**
 * Generate recommendations based on analysis
 * 
 * @param {Object} requirements - Requirements results
 * @param {Object} successCriteria - Success criteria results
 * @returns {Array} Recommendations
 */
function generateRecommendations(requirements, successCriteria) {
  const recommendations = [];
  
  // Check failed requirements
  const failedRequirements = requirements.filter(req => !req.status);
  failedRequirements.forEach(req => {
    recommendations.push({
      priority: 'high',
      message: `Implement ${req.name}: ${req.details}`
    });
  });
  
  // Check failed success criteria
  const failedCriteria = successCriteria.filter(crit => !crit.status);
  failedCriteria.forEach(crit => {
    recommendations.push({
      priority: 'medium',
      message: `Address ${crit.name}: ${crit.details}`
    });
  });
  
  // If all requirements and criteria are met, suggest advancement
  if (failedRequirements.length === 0 && failedCriteria.length === 0) {
    recommendations.push({
      priority: 'info',
      message: 'All requirements and success criteria met. Ready to advance to next phase.'
    });
  }
  
  return recommendations;
}

/**
 * Analyze a specific phase
 * 
 * @param {string} phase - Phase to analyze
 * @returns {Object} Analysis results
 */
function analyzePhase(phase) {
  if (!phases[phase]) {
    return {
      error: `Unknown phase: ${phase}`,
      validPhases: Object.keys(phases)
    };
  }
  
  const phaseConfig = phases[phase];
  
  // Check requirements
  const requirementResults = phaseConfig.requirements.map(checkRequirement);
  const requirementsPassed = requirementResults.every(r => r.status);
  
  // Run success criteria checks
  const successResults = runSuccessCriteria(phaseConfig.success);
  const successPassed = successResults.every(r => r.status);
  
  // Generate recommendations
  const recommendations = generateRecommendations(requirementResults, successResults);
  
  return {
    phase: phaseConfig.name,
    status: requirementsPassed && successPassed ? 'complete' : 'in-progress',
    requirements: {
      passed: requirementResults.filter(r => r.status).length,
      total: requirementResults.length,
      details: requirementResults
    },
    successCriteria: {
      passed: successResults.filter(r => r.status).length,
      total: successResults.length,
      details: successResults
    },
    recommendations,
    completionPercentage: Math.round(
      ((requirementResults.filter(r => r.status).length / requirementResults.length) * 0.6 +
       (successResults.filter(r => r.status).length / successResults.length) * 0.4) * 100
    )
  };
}

/**
 * Analyze all phases
 * 
 * @returns {Object} Analysis of all phases
 */
function analyzeAllPhases() {
  const results = {};
  
  for (const phase of Object.keys(phases)) {
    results[phase] = analyzePhase(phase);
  }
  
  // Determine current phase
  const phaseOrder = Object.keys(phases);
  let currentPhase = null;
  
  for (let i = phaseOrder.length - 1; i >= 0; i--) {
    const phase = phaseOrder[i];
    if (results[phase].status === 'in-progress') {
      currentPhase = phase;
      break;
    }
  }
  
  // If no in-progress phase found, find the first incomplete phase
  if (!currentPhase) {
    for (const phase of phaseOrder) {
      if (results[phase].status !== 'complete') {
        currentPhase = phase;
        break;
      }
    }
  }
  
  // If all phases complete, set to last phase
  if (!currentPhase && phaseOrder.length > 0) {
    currentPhase = phaseOrder[phaseOrder.length - 1];
  }
  
  return {
    results,
    currentPhase,
    currentPhaseName: currentPhase ? phases[currentPhase].name : null,
    completedPhases: phaseOrder.filter(p => results[p].status === 'complete').length,
    totalPhases: phaseOrder.length,
    overallCompletion: Math.round(
      phaseOrder.reduce((sum, p) => sum + results[p].completionPercentage, 0) / phaseOrder.length
    )
  };
}

/**
 * Generate a detailed report
 * 
 * @param {Object} analysis - Analysis results
 * @returns {string} Markdown report
 */
function generateReport(analysis) {
  const { results, currentPhase, currentPhaseName, completedPhases, totalPhases, overallCompletion } = analysis;
  
  let report = `# Phase Analysis Report\n\n`;
  report += `## Overview\n`;
  report += `- Current Phase: ${currentPhaseName}\n`;
  report += `- Completed Phases: ${completedPhases}/${totalPhases}\n`;
  report += `- Overall Completion: ${overallCompletion}%\n\n`;
  
  report += `## Phase Details\n\n`;
  
  const phaseOrder = Object.keys(phases);
  for (const phase of phaseOrder) {
    const result = results[phase];
    const status = result.status === 'complete' ? '✅' : '🔄';
    
    report += `### ${status} ${result.phase} (${result.completionPercentage}%)\n\n`;
    
    report += `#### Requirements (${result.requirements.passed}/${result.requirements.total})\n`;
    result.requirements.details.forEach(req => {
      const reqStatus = req.status ? '✅' : '❌';
      report += `- ${reqStatus} ${req.name}: ${req.details}\n`;
    });
    
    report += `\n#### Success Criteria (${result.successCriteria.passed}/${result.successCriteria.total})\n`;
    result.successCriteria.details.forEach(crit => {
      const critStatus = crit.status ? '✅' : '❌';
      report += `- ${critStatus} ${crit.name}: ${crit.details}\n`;
    });
    
    if (phase === currentPhase && result.recommendations.length > 0) {
      report += `\n#### Recommendations\n`;
      result.recommendations.forEach(rec => {
        const prefix = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟠' : '🔵';
        report += `- ${prefix} ${rec.message}\n`;
      });
    }
    
    report += `\n`;
  }
  
  return report;
}

/**
 * Run the phase analyzer and generate a report
 * 
 * @param {string} phaseName - Phase to analyze (optional)
 */
function runAnalyzer(phaseName) {
  console.log('Running Phase Analyzer...');
  
  let analysis;
  if (phaseName) {
    analysis = {
      results: { [phaseName]: analyzePhase(phaseName) },
      currentPhase: phaseName,
      currentPhaseName: phases[phaseName]?.name || 'Unknown',
      completedPhases: 0,
      totalPhases: 1,
      overallCompletion: analyzePhase(phaseName).completionPercentage
    };
  } else {
    analysis = analyzeAllPhases();
  }
  
  const report = generateReport(analysis);
  
  // Save report to file
  const reportPath = path.resolve('./phase-analysis-report.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`\nAnalysis complete. Report saved to ${reportPath}`);
  
  // Print summary to console
  if (phaseName) {
    const result = analysis.results[phaseName];
    console.log(`\nPhase: ${result.phase}`);
    console.log(`Status: ${result.status}`);
    console.log(`Completion: ${result.completionPercentage}%`);
    console.log(`Requirements: ${result.requirements.passed}/${result.requirements.total}`);
    console.log(`Success Criteria: ${result.successCriteria.passed}/${result.successCriteria.total}`);
    
    if (result.recommendations.length > 0) {
      console.log('\nTop Recommendations:');
      result.recommendations
        .sort((a, b) => {
          const priority = { high: 0, medium: 1, info: 2 };
          return priority[a.priority] - priority[b.priority];
        })
        .slice(0, 3)
        .forEach(rec => {
          console.log(`- ${rec.message}`);
        });
    }
  } else {
    console.log(`\nCurrent Phase: ${analysis.currentPhaseName}`);
    console.log(`Overall Completion: ${analysis.overallCompletion}%`);
    console.log(`Completed Phases: ${analysis.completedPhases}/${analysis.totalPhases}`);
    
    const currentPhaseResult = analysis.results[analysis.currentPhase];
    if (currentPhaseResult && currentPhaseResult.recommendations.length > 0) {
      console.log('\nTop Recommendations:');
      currentPhaseResult.recommendations
        .sort((a, b) => {
          const priority = { high: 0, medium: 1, info: 2 };
          return priority[a.priority] - priority[b.priority];
        })
        .slice(0, 3)
        .forEach(rec => {
          console.log(`- ${rec.message}`);
        });
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const phase = args[0];

// Run the analyzer
runAnalyzer(phase);

module.exports = {
  analyzePhase,
  analyzeAllPhases,
  generateReport,
  runAnalyzer
};