/**
 * Apply Improvements
 * 
 * This script applies all the optimizations and tracks the changes made.
 * It also provides a summary of the improvements.
 * 
 * Usage: node apply-improvements.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.resolve(__dirname, '../../../frontend');
const CHANGES_LOG_FILE = path.join(PROJECT_DIR, 'changes-applied.md');

// Timestamp for the log
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

console.log('🚀 Starting improvement application process...\n');

// Function to run a command and log output
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log('-'.repeat(50));
  
  try {
    const output = execSync(command, { encoding: 'utf8', cwd: PROJECT_DIR });
    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return { success: false, output: error.stdout || error.message };
  }
}

// Log changes to file
function logChanges(description, success, details = '') {
  const content = `
## ${description}
**Status**: ${success ? '✅ Success' : '❌ Failed'}
**Timestamp**: ${new Date().toISOString()}

${details}

${'---'.repeat(20)}
`;

  fs.appendFileSync(CHANGES_LOG_FILE, content);
}

// Initialize log file if it doesn't exist
if (!fs.existsSync(CHANGES_LOG_FILE)) {
  fs.writeFileSync(CHANGES_LOG_FILE, `# Project Sunlight Changes Log\n\nStarted: ${new Date().toISOString()}\n\n`);
}

// Execute the improvements
const steps = [
  {
    command: 'npm run copy:config',
    description: 'Copying configuration files (tsconfig.json, eslint.config.js)'
  },
  {
    command: 'npm run copy:design-system',
    description: 'Copying design system adapter'
  },
  {
    command: 'npm run fix:html-entities',
    description: 'Fixing HTML entity issues'
  },
  {
    command: 'npm run fix:jsx',
    description: 'Fixing JSX syntax issues'
  },
  {
    command: 'npm run fix:hooks',
    description: 'Fixing React Hooks issues'
  },
  {
    command: 'npm run fix:display-names',
    description: 'Adding component display names'
  },
  {
    command: 'npm run verify:build',
    description: 'Verifying build status'
  }
];

// Run each step
for (const step of steps) {
  const result = runCommand(step.command, step.description);
  logChanges(step.description, result.success, result.output.substring(0, 1000) + '...');
}

// Update project status
const claudeContextPath = path.join(PROJECT_DIR, 'ClaudeContext.md');
const claudeContext = fs.readFileSync(claudeContextPath, 'utf8');
const updatedContext = claudeContext.replace(
  '## Current Phase: Analysis and Planning',
  '## Current Phase: Implementation & Optimization'
);

fs.writeFileSync(claudeContextPath, updatedContext);

console.log('\n🎉 All improvements have been applied!');
console.log(`Changes have been logged to: ${CHANGES_LOG_FILE}`);
console.log('\nNext steps:');
console.log('1. Review the changes log to understand what was modified');
console.log('2. Test the application to ensure functionality');
console.log('3. Update component imports to use the design system adapter');
console.log('4. Run a full build with TypeScript checks enabled');