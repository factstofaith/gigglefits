/**
 * Script to verify TypeScript compilation and type checking
 * Used in CI/CD pipeline to enforce type safety
 */

const { execSync } = require('child_process');
const chalk = require('chalk');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TS_CONFIG_PATH = path.join(PROJECT_ROOT, 'tsconfig.json');
const DESIGN_SYSTEM_DIR = path.join(PROJECT_ROOT, 'src/design-system');

// Error threshold configuration
const MAX_ERRORS = process.env.TS_MAX_ERRORS || 0;
const REPORT_ONLY = process.argv.includes('--report-only');

console.log(chalk.blue('🔍 Verifying TypeScript type safety...'));

try {
  // Run TypeScript compiler in noEmit mode
  const tscCommand = `npx tsc --project ${TS_CONFIG_PATH} --noEmit`;
  
  try {
    execSync(tscCommand, { encoding: 'utf8', stdio: 'pipe' });
    console.log(chalk.green('✅ TypeScript verification successful! No type errors found.'));
    process.exit(0);
  } catch (error) {
    // Process the error output
    const output = error.output.toString();
    const errorMatches = output.match(/Found (\d+) error/);
    
    if (errorMatches && errorMatches[1]) {
      const errorCount = parseInt(errorMatches[1], 10);
      
      // Extract design system specific errors
      const designSystemErrors = output.split('\n')
        .filter(line => line.includes('/design-system/'))
        .length;
      
      console.log(chalk.yellow(`TypeScript check found ${errorCount} errors (${designSystemErrors} in design system)`));
      
      if (errorCount <= MAX_ERRORS || REPORT_ONLY) {
        console.log(chalk.yellow(`⚠️ There are TypeScript errors but below threshold of ${MAX_ERRORS} or running in report-only mode.`));
        console.log(output);
        process.exit(0);
      } else {
        console.error(chalk.red(`❌ TypeScript verification failed with ${errorCount} errors (threshold: ${MAX_ERRORS}).`));
        console.error(output);
        process.exit(1);
      }
    } else {
      console.error(chalk.red('❌ TypeScript verification failed with unknown error:'));
      console.error(error.message);
      process.exit(1);
    }
  }
} catch (error) {
  console.error(chalk.red('❌ Failed to run TypeScript verification:'));
  console.error(error.message);
  process.exit(1);
}