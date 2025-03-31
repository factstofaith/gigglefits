#!/usr/bin/env node
/**
 * Duplicate Exports Fix Script
 * 
 * This script identifies and fixes duplicate exports in the design system adapter.
 * It ensures that each component is only exported once to prevent build errors.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let dryRun = true; // Default to dry run for safety
let verbose = false;

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--run') {
    dryRun = false;
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--help') {
    console.log(`
Duplicate Exports Fix Script

This script identifies and fixes duplicate exports in the design system adapter.
It ensures that each component is only exported once to prevent build errors.

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --run                Apply fixes (without this flag, only a dry run is performed)
  --verbose            Show detailed information
  --help               Show this help message
`);
    process.exit(0);
  }
}

// Main function to fix duplicate exports
async function fixDuplicateExports() {
  console.log(chalk.blue('🔧 Fixing duplicate exports in design system adapter...'));
  console.log(chalk.blue(`Mode: ${dryRun ? 'DRY RUN (preview only)' : 'APPLY CHANGES'}`));
  
  const adapterFile = path.resolve('./src/design-system/adapter.js');
  
  if (!fs.existsSync(adapterFile)) {
    console.error(chalk.red(`❌ Adapter file not found: ${adapterFile}`));
    return { fixed: false };
  }
  
  // Read the adapter file
  const content = fs.readFileSync(adapterFile, 'utf8');
  
  // Find all export sections
  const exportRegex = /export\s+{([^}]+)}/gs;
  let exportSections = [];
  let match;
  
  while ((match = exportRegex.exec(content)) !== null) {
    exportSections.push({
      fullMatch: match[0],
      exports: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }
  
  if (exportSections.length === 0) {
    console.log(chalk.yellow('⚠️ No export sections found in the adapter file.'));
    return { fixed: false };
  }
  
  // Extract all exported components
  const exportedComponents = new Set();
  const duplicates = new Set();
  const exportLines = [];
  
  // Process all export sections
  exportSections.forEach(section => {
    const lines = section.exports.split(',').map(line => line.trim()).filter(line => line);
    
    lines.forEach(line => {
      // Extract component name (handling "ComponentA as ComponentB" syntax)
      const parts = line.split(' as ');
      const componentName = parts.length > 1 ? parts[1].trim() : parts[0].trim();
      
      if (exportedComponents.has(componentName)) {
        duplicates.add(componentName);
      } else {
        exportedComponents.add(componentName);
      }
      
      exportLines.push({
        line,
        componentName,
        isDuplicate: exportedComponents.has(componentName) && componentName !== line,
        sectionIndex: exportSections.length - 1
      });
    });
  });
  
  if (duplicates.size === 0) {
    console.log(chalk.green('✅ No duplicate exports found in the adapter file.'));
    return { fixed: false };
  }
  
  console.log(chalk.yellow(`Found ${duplicates.size} duplicate exports: ${Array.from(duplicates).join(', ')}`));
  
  // Fix duplicate exports
  let modifiedContent = content;
  let fixed = false;
  
  // Keep track of which components we've kept
  const keptComponents = new Set();
  
  // Process export sections in reverse to avoid offset issues
  exportSections.reverse().forEach((section, sectionIndex) => {
    const realSectionIndex = exportSections.length - 1 - sectionIndex;
    
    // Get the lines for this section
    const linesToKeep = [];
    const linesToRemove = [];
    
    exportLines
      .filter(line => line.sectionIndex === realSectionIndex)
      .forEach(line => {
        if (duplicates.has(line.componentName)) {
          if (!keptComponents.has(line.componentName)) {
            // Keep the first occurrence of the duplicate component
            keptComponents.add(line.componentName);
            linesToKeep.push(line.line);
            console.log(chalk.green(`  Keeping: ${line.line} in section ${realSectionIndex + 1}`));
          } else {
            // Remove subsequent occurrences
            linesToRemove.push(line.line);
            console.log(chalk.red(`  Removing: ${line.line} from section ${realSectionIndex + 1}`));
          }
        } else {
          // Keep non-duplicate components
          linesToKeep.push(line.line);
        }
      });
    
    // Rebuild the export section with the lines to keep
    const newExports = linesToKeep.join(',\n  ');
    const newExportSection = `export {\n  ${newExports}\n}`;
    
    // Replace the export section in the content
    if (linesToRemove.length > 0) {
      modifiedContent = modifiedContent.substring(0, section.startIndex) + 
                        newExportSection + 
                        modifiedContent.substring(section.endIndex);
      fixed = true;
    }
  });
  
  // Write back the file if modified
  if (fixed) {
    if (!dryRun) {
      fs.writeFileSync(adapterFile, modifiedContent);
      console.log(chalk.green('✅ Fixed duplicate exports in the adapter file.'));
    } else {
      console.log(chalk.yellow('DRY RUN: Would fix duplicate exports in the adapter file.'));
    }
  }
  
  return { fixed };
}

// Execute the script
fixDuplicateExports().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});