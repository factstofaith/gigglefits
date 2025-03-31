#!/usr/bin/env node
/**
 * Documentation Verification Script
 *
 * This script verifies the documentation for completeness and accuracy,
 * checking for code examples, broken links, and missing information.
 *
 * Usage:
 *   node scripts/verify-documentation.js [--docs-dir path/to/docs]
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Default settings
let docsDir = path.resolve('./docs');
let outputFile = path.resolve('./validation_results/latest/documentation-verification.json');

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg.startsWith('--docs-dir=')) {
    docsDir = path.resolve(arg.split('=')[1]);
  } else if (arg.startsWith('--output-file=')) {
    outputFile = path.resolve(arg.split('=')[1]);
  } else if (arg === '--help') {
    console.log(`
Documentation Verification Script

Usage:
  node ${path.basename(process.argv[1])} [options]

Options:
  --docs-dir=<path>     Directory containing documentation (default: ./docs)
  --output-file=<path>  Output file for verification results (default: ./validation_results/latest/documentation-verification.json)
  --help                Show this help message
`);
    process.exit(0);
  }
}

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Main verification function
async function verifyDocumentation() {
  console.log(chalk.blue('🔍 Verifying documentation...'));
  
  const verification = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: 0,
      filesWithIssues: 0,
      totalIssues: 0,
      missingExamples: 0,
      brokenLinks: 0,
      missingInformation: 0
    },
    files: {}
  };
  
  try {
    // Check if documentation directory exists
    if (!fs.existsSync(docsDir)) {
      console.error(chalk.red(`❌ Documentation directory not found at ${docsDir}`));
      process.exit(1);
    }
    
    // Get all markdown files
    const markdownFiles = getAllFiles(docsDir).filter(file => file.endsWith('.md'));
    verification.summary.totalFiles = markdownFiles.length;
    
    console.log(chalk.blue(`\n📄 Found ${markdownFiles.length} documentation files`));
    
    // Verify each file
    for (const file of markdownFiles) {
      const relativeFilePath = path.relative(docsDir, file);
      console.log(chalk.blue(`\n📝 Verifying: ${relativeFilePath}`));
      
      const content = fs.readFileSync(file, 'utf8');
      const issues = [];
      
      // Check for code examples
      const codeBlocks = content.match(/```[\s\S]*?```/g);
      if (!codeBlocks || codeBlocks.length === 0) {
        issues.push({
          type: 'missing_example',
          message: 'No code examples found'
        });
        verification.summary.missingExamples++;
      }
      
      // Check for broken internal links
      const internalLinks = content.match(/\[.*?\]\((?!https?:\/\/)([^)]+)\)/g);
      if (internalLinks) {
        for (const link of internalLinks) {
          // Extract link target (path)
          const match = link.match(/\[.*?\]\(([^)]+)\)/);
          if (match && match[1]) {
            const linkTarget = match[1].split('#')[0]; // Remove anchor
            if (linkTarget && !linkTarget.includes(':') && !linkTarget.startsWith('#')) {
              const resolvedPath = path.resolve(path.dirname(file), linkTarget);
              if (!fs.existsSync(resolvedPath)) {
                issues.push({
                  type: 'broken_link',
                  message: `Broken internal link: ${linkTarget}`
                });
                verification.summary.brokenLinks++;
              }
            }
          }
        }
      }
      
      // Check for missing important sections
      const sections = [
        { name: 'Overview', pattern: /#+\s+Overview/i },
        { name: 'Usage', pattern: /#+\s+Usage/i },
        { name: 'Examples', pattern: /#+\s+Examples?/i }
      ];
      
      for (const section of sections) {
        if (!section.pattern.test(content)) {
          issues.push({
            type: 'missing_section',
            message: `Missing ${section.name} section`
          });
          verification.summary.missingInformation++;
        }
      }
      
      // Add results to verification
      verification.files[relativeFilePath] = {
        issueCount: issues.length,
        issues: issues
      };
      
      if (issues.length > 0) {
        verification.summary.filesWithIssues++;
        verification.summary.totalIssues += issues.length;
        
        console.log(chalk.yellow(`⚠️ Found ${issues.length} issues:`));
        issues.forEach(issue => console.log(`  - ${issue.message}`));
      } else {
        console.log(chalk.green('✅ No issues found'));
      }
    }
    
    // Save verification to file
    fs.writeFileSync(outputFile, JSON.stringify(verification, null, 2));
    console.log(chalk.green(`\n✅ Verification results saved to ${outputFile}`));
    
    // Print summary
    console.log(chalk.blue('\n📋 Documentation Verification Summary:'));
    console.log(`Total files: ${verification.summary.totalFiles}`);
    console.log(`Files with issues: ${verification.summary.filesWithIssues}`);
    console.log(`Total issues: ${verification.summary.totalIssues}`);
    console.log(`Missing examples: ${verification.summary.missingExamples}`);
    console.log(`Broken links: ${verification.summary.brokenLinks}`);
    console.log(`Missing information: ${verification.summary.missingInformation}`);
    
    if (verification.summary.totalIssues === 0) {
      console.log(chalk.green('\n✅ All documentation is complete and accurate!'));
    } else {
      console.log(chalk.yellow(`\n⚠️ Found ${verification.summary.totalIssues} documentation issues.`));
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Documentation verification failed: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

// Utility function: Get all files recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Execute verification
verifyDocumentation().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});