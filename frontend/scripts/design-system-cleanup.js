#!/usr/bin/env node

/**
 * Design System Cleanup Script
 * 
 * This script organizes the design system by:
 * 1. Identifying and removing deprecated adapted components
 * 2. Moving unused components to archive
 * 3. Ensuring proper documentation for all components
 */

const fs = require('fs');
const path = require('path');

// Config
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DESIGN_SYSTEM_DIR = path.join(PROJECT_ROOT, 'src', 'design-system');
const ARCHIVE_DIR = path.join(PROJECT_ROOT, 'archive', 'deprecated', 'design-system');

// Ensure archive directory exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Get list of all adapted components
function getAdaptedComponents() {
  const adaptedDir = path.join(DESIGN_SYSTEM_DIR, 'adapted');
  const components = [];
  
  const categories = ['core', 'display', 'feedback', 'form', 'navigation', 'layout'];
  
  categories.forEach(category => {
    const categoryPath = path.join(adaptedDir, category);
    if (!fs.existsSync(categoryPath)) return;
    
    const files = fs.readdirSync(categoryPath);
    
    files.forEach(file => {
      if (file.endsWith('Adapted.jsx') || file.endsWith('Adapted.js')) {
        components.push({
          name: file,
          category,
          path: path.join(categoryPath, file)
        });
      }
    });
  });
  
  return components;
}

// Check if component is imported anywhere in the codebase
function isComponentUsed(componentName, ignorePath) {
  const srcDir = path.join(PROJECT_ROOT, 'src');
  let isUsed = false;
  
  function searchDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      
      if (itemPath === ignorePath) continue;
      
      if (fs.statSync(itemPath).isDirectory()) {
        if (searchDirectory(itemPath)) {
          return true;
        }
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        const content = fs.readFileSync(itemPath, 'utf8');
        if (content.includes(componentName.replace('.jsx', '').replace('.js', ''))) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  isUsed = searchDirectory(srcDir);
  return isUsed;
}

// Find unused components and move them to archive
function archiveUnusedComponents() {
  const components = getAdaptedComponents();
  let archivedCount = 0;
  
  components.forEach(component => {
    if (!isComponentUsed(component.name, component.path)) {
      // Create archive directory structure if it doesn't exist
      const targetDir = path.join(ARCHIVE_DIR, 'adapted', component.category);
      ensureDirExists(targetDir);
      
      // Move component file to archive
      const targetPath = path.join(targetDir, component.name);
      fs.renameSync(component.path, targetPath);
      console.log(`Archived unused component: ${component.name} to ${targetPath}`);
      archivedCount++;
      
      // Also move associated .d.ts file if it exists
      const dtsPath = component.path.replace('.jsx', '.d.ts').replace('.js', '.d.ts');
      if (fs.existsSync(dtsPath)) {
        const targetDtsPath = path.join(targetDir, path.basename(dtsPath));
        fs.renameSync(dtsPath, targetDtsPath);
        console.log(`Archived component typings: ${path.basename(dtsPath)}`);
      }
    }
  });
  
  console.log(`Archived ${archivedCount} unused components.`);
}

// Update the main index.js file to remove references to archived components
function updateIndexFiles() {
  const adaptedDir = path.join(DESIGN_SYSTEM_DIR, 'adapted');
  const indexPath = path.join(adaptedDir, 'index.js');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Get existing component files to determine which exports to keep
    const existingComponents = [];
    const categories = ['core', 'display', 'feedback', 'form', 'navigation', 'layout'];
    
    categories.forEach(category => {
      const categoryPath = path.join(adaptedDir, category);
      if (!fs.existsSync(categoryPath)) return;
      
      const files = fs.readdirSync(categoryPath);
      
      files.forEach(file => {
        if (file.endsWith('Adapted.jsx') || file.endsWith('Adapted.js')) {
          existingComponents.push(file.replace('.jsx', '').replace('.js', ''));
        }
      });
    });
    
    // Update exports
    const lines = content.split('\n');
    const updatedLines = lines.filter(line => {
      if (line.startsWith('export {') && line.includes('} from ')) {
        const exportName = line.match(/export {\s*(\w+)\s*}/)?.[1];
        return exportName && existingComponents.includes(exportName);
      }
      return true;
    });
    
    fs.writeFileSync(indexPath, updatedLines.join('\n'));
    console.log(`Updated ${indexPath} to remove references to archived components.`);
  }
}

// Create a documentation report
function createDocumentationReport() {
  const components = getAdaptedComponents();
  const undocumentedComponents = [];
  
  components.forEach(component => {
    const docPath = path.join(
      DESIGN_SYSTEM_DIR, 
      'adapted', 
      component.category, 
      'docs', 
      `${component.name.replace('.jsx', '.md').replace('.js', '.md')}`
    );
    
    if (!fs.existsSync(docPath)) {
      undocumentedComponents.push(component.name);
    }
  });
  
  if (undocumentedComponents.length > 0) {
    console.log(`Found ${undocumentedComponents.length} components without documentation:`);
    undocumentedComponents.forEach(comp => console.log(`  - ${comp}`));
    
    // Create a report file
    const reportPath = path.join(PROJECT_ROOT, 'archive', 'reports', 'undocumented_components.md');
    const reportContent = `# Undocumented Components Report
Generated on ${new Date().toISOString().split('T')[0]}

The following components in the design system lack proper documentation:

${undocumentedComponents.map(comp => `- \`${comp}\``).join('\n')}

## Action Required

Please create documentation files for these components in the appropriate docs directory.
`;
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`Created documentation report at ${reportPath}`);
  } else {
    console.log('All components have documentation. Great job!');
  }
}

// Main execution
function main() {
  console.log('Starting design system cleanup...');
  
  ensureDirExists(ARCHIVE_DIR);
  archiveUnusedComponents();
  updateIndexFiles();
  createDocumentationReport();
  
  console.log('Design system cleanup completed!');
}

main();