/**
 * Fix JSX Syntax Issues
 * 
 * This script identifies and fixes common JSX syntax issues:
 * - Missing closing tags
 * - Mismatched tags
 * - Missing import statements
 * 
 * Usage: node fix-jsx-syntax.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');

// Common JSX syntax issues to check
const JSX_ISSUES = [
  {
    // Check for unclosed JSX tags
    check: (content) => {
      const openTags = [];
      let hasErrors = false;
      
      // Simple regex to find opening and closing JSX tags
      const tagRegex = /<\/?([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)?)(?:\s+[^>]*)?(?:\/)?>/g;
      let match;
      
      while ((match = tagRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const tagName = match[1];
        
        if (fullMatch.startsWith('</')) {
          // Closing tag
          if (openTags.length > 0 && openTags[openTags.length - 1] === tagName) {
            openTags.pop();
          } else {
            hasErrors = true;
          }
        } else if (!fullMatch.endsWith('/>')) {
          // Opening tag (not self-closing)
          openTags.push(tagName);
        }
      }
      
      return { hasErrors: hasErrors || openTags.length > 0, openTags };
    },
    fix: (content, filePath) => {
      // Check for specific known issues and fix them
      
      // Fix for ScheduleConfiguration.jsx - missing Grid closing tag
      if (filePath.includes('ScheduleConfiguration.jsx') && content.includes('<Grid') && !content.match(/<\/Grid>/g)) {
        const fixedContent = content.replace(
          /(<Grid[^>]*>[^<]*)<\/div>/g,
          '$1</Grid></div>'
        );
        return { content: fixedContent, fixed: content !== fixedContent };
      }
      
      return { content, fixed: false };
    }
  },
  {
    // Check for duplicate imports
    check: (content) => {
      // Check for duplicate hooks like useMediaQuery
      const duplicateHooks = content.match(/import\s+\{\s*([^}]*useMediaQuery[^}]*)\}\s+from/g);
      return { 
        hasErrors: duplicateHooks && duplicateHooks.length > 1,
        duplicateImports: duplicateHooks
      };
    },
    fix: (content, filePath) => {
      // Fix for IntegrationFlowCanvas.jsx - duplicate useMediaQuery
      if (filePath.includes('IntegrationFlowCanvas.jsx')) {
        let fixedContent = content;
        
        // Find all useMediaQuery imports
        const importMatches = content.match(/import\s+\{[^}]*useMediaQuery[^}]*\}\s+from\s+['"][^'"]+['"]/g) || [];
        
        if (importMatches.length > 1) {
          // Keep only the first one
          const firstImport = importMatches[0];
          
          // Remove other imports
          for (let i = 1; i < importMatches.length; i++) {
            fixedContent = fixedContent.replace(importMatches[i], '// Removed duplicate import');
          }
          
          return { content: fixedContent, fixed: content !== fixedContent };
        }
      }
      
      return { content, fixed: false };
    }
  },
  {
    // Check for missing imports (undefined components)
    check: (content) => {
      const missingImports = [];
      
      // Check for LinearProgress
      if (content.includes('<LinearProgress') && !content.includes("import LinearProgress")) {
        missingImports.push('LinearProgress');
      }
      
      // Check for Tab
      if (content.includes('<Tab') && !content.includes("import Tab")) {
        missingImports.push('Tab');
      }
      
      // Check for Box
      if (content.includes('<Box') && !content.includes("import Box")) {
        missingImports.push('Box');
      }
      
      return { 
        hasErrors: missingImports.length > 0,
        missingImports
      };
    },
    fix: (content, filePath) => {
      let fixedContent = content;
      let fixed = false;
      
      // Check if we need to add MUI imports
      if (content.includes('<LinearProgress') && !content.includes("import LinearProgress")) {
        fixedContent = fixedContent.replace(
          /import\s+\{([^}]*)\}\s+from\s+['"]@mui\/material['"]/,
          (match, imports) => {
            return match.replace(imports, imports + ', LinearProgress');
          }
        );
        fixed = true;
      }
      
      // Check if we need to add Tab import
      if (content.includes('<Tab') && !content.includes("import Tab")) {
        fixedContent = fixedContent.replace(
          /import\s+\{([^}]*)\}\s+from\s+['"]@mui\/material['"]/,
          (match, imports) => {
            return match.replace(imports, imports + ', Tab');
          }
        );
        fixed = true;
      }
      
      // Check if we need to add Box import
      if (content.includes('<Box') && !content.includes("import Box")) {
        fixedContent = fixedContent.replace(
          /import\s+\{([^}]*)\}\s+from\s+['"]@mui\/material['"]/,
          (match, imports) => {
            return match.replace(imports, imports + ', Box');
          }
        );
        fixed = true;
      }
      
      return { content: fixedContent, fixed };
    }
  }
];

// Find all React component files
const files = glob.sync(`${ROOT_DIR}/**/*.jsx`);
let fixedFiles = 0;
let problemFiles = 0;

// Process each file
files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Apply each check and fix
    JSX_ISSUES.forEach(issue => {
      const checkResult = issue.check(updatedContent);
      
      if (checkResult.hasErrors) {
        const { content: fixedContent, fixed } = issue.fix(updatedContent, filePath);
        
        if (fixed) {
          updatedContent = fixedContent;
          hasChanges = true;
        } else if (checkResult.hasErrors) {
          // Mark as problem file if we couldn't fix automatically
          problemFiles++;
          console.log(`⚠️ Could not automatically fix issues in: ${path.relative(ROOT_DIR, filePath)}`);
        }
      }
    });
    
    // If changes were made, write back to file
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Fixed JSX syntax in: ${path.relative(ROOT_DIR, filePath)}`);
      fixedFiles++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nCompleted! Fixed ${fixedFiles} of ${files.length} files.`);
console.log(`${problemFiles} files need manual inspection.`);