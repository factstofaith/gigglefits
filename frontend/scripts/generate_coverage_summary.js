/**
 * Script to generate and visualize test coverage summary
 * Parses Jest coverage data and creates a readable summary report
 */

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

// Configuration
const COVERAGE_DATA_PATH = path.resolve(__dirname, '../coverage/coverage-final.json');
const REPORTS_DIR = path.resolve(__dirname, '../coverage/reports');
const SUMMARY_FILE = path.join(REPORTS_DIR, `coverage-summary-${getTimestamp()}.json`);
const MARKDOWN_REPORT = path.join(REPORTS_DIR, `coverage-report-${getTimestamp()}.md`);

// Ensure the reports directory exists
mkdirp.sync(REPORTS_DIR);

/**
 * Get current timestamp in YYYYMMDD_HHMMSS format
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '_');
}

/**
 * Generate coverage summary from Jest coverage data
 */
async function generateCoverageSummary() {
  try {
    // Check if coverage data exists
    if (!fs.existsSync(COVERAGE_DATA_PATH)) {
      console.error('❌ Coverage data not found. Please run tests with coverage first.');
      console.log('Run: npm run test:coverage');
      return;
    }

    // Read and parse the coverage data
    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_DATA_PATH, 'utf8'));
    
    // Process data into a summary
    const summary = processData(coverageData);
    
    // Write summary to JSON file
    fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
    
    // Generate markdown report
    generateMarkdownReport(summary);
    
    console.log(`✅ Coverage summary generated at ${SUMMARY_FILE}`);
    console.log(`✅ Markdown report generated at ${MARKDOWN_REPORT}`);
  } catch (error) {
    console.error('❌ Error generating coverage summary:', error);
  }
}

/**
 * Process coverage data into a structured summary
 */
function processData(coverageData) {
  const summary = {
    timestamp: new Date().toISOString(),
    overall: {
      statements: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 },
      lines: { total: 0, covered: 0, percentage: 0 }
    },
    categories: {
      components: { files: 0, statements: 0, branches: 0, functions: 0, lines: 0 },
      utils: { files: 0, statements: 0, branches: 0, functions: 0, lines: 0 },
      hooks: { files: 0, statements: 0, branches: 0, functions: 0, lines: 0 },
      contexts: { files: 0, statements: 0, branches: 0, functions: 0, lines: 0 },
      services: { files: 0, statements: 0, branches: 0, functions: 0, lines: 0 }
    },
    files: []
  };
  
  // Process each file's coverage data
  Object.entries(coverageData).forEach(([filePath, data]) => {
    const relativePath = filePath.replace(/^.*\/src\//, 'src/');
    const category = getCategoryFromPath(relativePath);
    const fileStats = {
      path: relativePath,
      category,
      statements: calculatePercentage(data.statementMap, data.s),
      branches: calculatePercentage(data.branchMap, data.b),
      functions: calculatePercentage(data.fnMap, data.f),
      lines: calculatePercentage(data.lineMap || data.statementMap, data.l || data.s)
    };
    
    // Add file to the summary
    summary.files.push(fileStats);
    
    // Update category stats
    summary.categories[category].files++;
    summary.categories[category].statements += fileStats.statements.percentage;
    summary.categories[category].branches += fileStats.branches.percentage;
    summary.categories[category].functions += fileStats.functions.percentage;
    summary.categories[category].lines += fileStats.lines.percentage;
    
    // Update overall stats
    summary.overall.statements.total += fileStats.statements.total;
    summary.overall.statements.covered += fileStats.statements.covered;
    summary.overall.branches.total += fileStats.branches.total;
    summary.overall.branches.covered += fileStats.branches.covered;
    summary.overall.functions.total += fileStats.functions.total;
    summary.overall.functions.covered += fileStats.functions.covered;
    summary.overall.lines.total += fileStats.lines.total;
    summary.overall.lines.covered += fileStats.lines.covered;
  });
  
  // Calculate overall percentages
  summary.overall.statements.percentage = calculateMetricPercentage(
    summary.overall.statements.covered,
    summary.overall.statements.total
  );
  summary.overall.branches.percentage = calculateMetricPercentage(
    summary.overall.branches.covered,
    summary.overall.branches.total
  );
  summary.overall.functions.percentage = calculateMetricPercentage(
    summary.overall.functions.covered,
    summary.overall.functions.total
  );
  summary.overall.lines.percentage = calculateMetricPercentage(
    summary.overall.lines.covered,
    summary.overall.lines.total
  );
  
  // Calculate average for categories
  Object.keys(summary.categories).forEach(category => {
    const stats = summary.categories[category];
    if (stats.files > 0) {
      stats.statements = Math.round(stats.statements / stats.files);
      stats.branches = Math.round(stats.branches / stats.files);
      stats.functions = Math.round(stats.functions / stats.files);
      stats.lines = Math.round(stats.lines / stats.files);
    }
  });
  
  return summary;
}

/**
 * Determine category based on file path
 */
function getCategoryFromPath(filePath) {
  if (filePath.includes('/components/')) return 'components';
  if (filePath.includes('/utils/')) return 'utils';
  if (filePath.includes('/hooks/')) return 'hooks';
  if (filePath.includes('/contexts/')) return 'contexts';
  if (filePath.includes('/services/')) return 'services';
  return 'utils'; // Default category
}

/**
 * Calculate covered percentage for a coverage map
 */
function calculatePercentage(map, coverage) {
  const total = Object.keys(map).length;
  let covered = 0;
  
  if (Array.isArray(coverage)) {
    // Handle branch coverage which is an array of arrays
    Object.keys(coverage).forEach(key => {
      const branches = coverage[key];
      if (branches.filter(branch => branch > 0).length === branches.length) {
        covered++;
      }
    });
  } else {
    // Handle statement/function/line coverage
    Object.keys(coverage).forEach(key => {
      if (coverage[key] > 0) {
        covered++;
      }
    });
  }
  
  return {
    total,
    covered,
    percentage: calculateMetricPercentage(covered, total)
  };
}

/**
 * Calculate percentage and handle division by zero
 */
function calculateMetricPercentage(covered, total) {
  if (total === 0) return 100; // If no items to cover, consider it 100%
  return Math.round((covered / total) * 100);
}

/**
 * Generate a markdown report from the summary data
 */
function generateMarkdownReport(summary) {
  const getCoverageEmoji = (percentage) => {
    if (percentage >= 80) return '🟢';
    if (percentage >= 60) return '🟡';
    return '🔴';
  };
  
  let markdownContent = `# Code Coverage Report\n\n`;
  markdownContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  // Overall summary
  markdownContent += `## Overall Coverage\n\n`;
  markdownContent += `| Metric | Coverage | Percentage |\n`;
  markdownContent += `|--------|----------|------------|\n`;
  markdownContent += `| Statements | ${summary.overall.statements.covered}/${summary.overall.statements.total} | ${getCoverageEmoji(summary.overall.statements.percentage)} ${summary.overall.statements.percentage}% |\n`;
  markdownContent += `| Branches | ${summary.overall.branches.covered}/${summary.overall.branches.total} | ${getCoverageEmoji(summary.overall.branches.percentage)} ${summary.overall.branches.percentage}% |\n`;
  markdownContent += `| Functions | ${summary.overall.functions.covered}/${summary.overall.functions.total} | ${getCoverageEmoji(summary.overall.functions.percentage)} ${summary.overall.functions.percentage}% |\n`;
  markdownContent += `| Lines | ${summary.overall.lines.covered}/${summary.overall.lines.total} | ${getCoverageEmoji(summary.overall.lines.percentage)} ${summary.overall.lines.percentage}% |\n\n`;
  
  // Coverage by category
  markdownContent += `## Coverage by Category\n\n`;
  markdownContent += `| Category | Files | Statements | Branches | Functions | Lines |\n`;
  markdownContent += `|----------|-------|------------|----------|-----------|-------|\n`;
  
  Object.keys(summary.categories).forEach(category => {
    const stats = summary.categories[category];
    if (stats.files > 0) {
      markdownContent += `| ${category} | ${stats.files} | ${getCoverageEmoji(stats.statements)} ${stats.statements}% | ${getCoverageEmoji(stats.branches)} ${stats.branches}% | ${getCoverageEmoji(stats.functions)} ${stats.functions}% | ${getCoverageEmoji(stats.lines)} ${stats.lines}% |\n`;
    }
  });
  
  // Top 10 files with lowest coverage
  const sortedFiles = [...summary.files].sort((a, b) => a.lines.percentage - b.lines.percentage);
  const lowestCoverage = sortedFiles.slice(0, 10);
  
  markdownContent += `\n## Files Needing Attention\n\n`;
  markdownContent += `| File | Statements | Branches | Functions | Lines |\n`;
  markdownContent += `|------|------------|----------|-----------|-------|\n`;
  
  lowestCoverage.forEach(file => {
    markdownContent += `| ${file.path} | ${getCoverageEmoji(file.statements.percentage)} ${file.statements.percentage}% | ${getCoverageEmoji(file.branches.percentage)} ${file.branches.percentage}% | ${getCoverageEmoji(file.functions.percentage)} ${file.functions.percentage}% | ${getCoverageEmoji(file.lines.percentage)} ${file.lines.percentage}% |\n`;
  });
  
  // Write the markdown report
  fs.writeFileSync(MARKDOWN_REPORT, markdownContent);
}

// Execute the script
generateCoverageSummary();