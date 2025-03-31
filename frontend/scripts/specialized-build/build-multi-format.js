#!/usr/bin/env node
/**
 * Multi-Format Build Script
 * 
 * This script builds the package in multiple formats for optimal compatibility.
 * 
 * Usage:
 *   node build-multi-format.js [options]
 * 
 * Options:
 *   --formats=<formats>   Comma-separated list of formats to build (default: cjs,esm,types)
 *   --clean              Clean the dist directory before building
 *   --verbose            Show detailed information during build
 * 
 * Example:
 *   node build-multi-format.js --formats=cjs,esm,umd,types --clean
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const CLEAN = args.includes('--clean');
const FORMATS = args.find(arg => arg.startsWith('--formats='))?.split('=')[1]?.split(',') || ['cjs', 'esm', 'types'];

// Utility functions
function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌ ' : 
                 type === 'success' ? '✅ ' : 
                 type === 'warning' ? '⚠️ ' : 
                 type === 'info' ? 'ℹ️ ' : '';
  console.log(`${prefix}${message}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(`   ${message}`);
  }
}

function runCommand(command) {
  log(`Running: ${command}`, 'info');
  try {
    execSync(command, { stdio: VERBOSE ? 'inherit' : 'pipe' });
    return true;
  } catch (error) {
    log(`Error running command: ${command}`, 'error');
    if (VERBOSE) {
      console.error(error.message);
    }
    return false;
  }
}

// Clean dist directory if requested
if (CLEAN) {
  log('Cleaning dist directory...', 'info');
  try {
    fs.rmSync(path.resolve(process.cwd(), 'dist'), { recursive: true, force: true });
    log('Cleaned dist directory', 'success');
  } catch (error) {
    log(`Error cleaning dist directory: ${error.message}`, 'warning');
  }
}

// Build each requested format
let successCount = 0;
let failCount = 0;

for (const format of FORMATS) {
  log(`Building ${format} format...`, 'info');
  
  const scriptName = `build:${format}`;
  const success = runCommand(`npm run ${scriptName}`);
  
  if (success) {
    log(`Successfully built ${format} format`, 'success');
    successCount++;
  } else {
    log(`Failed to build ${format} format`, 'error');
    failCount++;
  }
}

// Summary
log('
Build Summary:', 'info');
log(`Formats requested: ${FORMATS.length}`, 'info');
log(`Successful builds: ${successCount}`, 'success');
if (failCount > 0) {
  log(`Failed builds: ${failCount}`, 'error');
}

// Exit with appropriate code
process.exit(failCount > 0 ? 1 : 0);
