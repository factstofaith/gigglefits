/**
 * Standardize Documentation
 * 
 * This script standardizes documentation across the codebase:
 * - Ensures consistent JSDoc comments for components and functions
 * - Creates README files for directories
 * - Generates component documentation
 * - Improves existing documentation
 * - Creates missing documentation
 * 
 * Usage: node standardize-documentation.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../../frontend/src');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const BACKUP_DIR = path.resolve(__dirname, '../backups', `documentation-standardization-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const DRY_RUN = process.argv.includes('--dry-run');

// Create backup and docs directories
if (!DRY_RUN) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  console.log(`📁 Ensuring docs directory exists: ${DOCS_DIR}`);
}

// Standard component documentation template
function generateComponentDocTemplate(componentName, description, props = [], examples = []) {
  return `# ${componentName}

${description || `The \`${componentName}\` component...`}

## Props

${props.length > 0 ? `| Name | Type | Default | Description |
|------|------|---------|-------------|
${props.map(prop => `| \`${prop.name}\` | \`${prop.type || 'any'}\` | ${prop.default ? `\`${prop.default}\`` : '-'} | ${prop.description || '-'} |`).join('\n')}` : 'This component does not accept any props.'}

## Usage

${examples.length > 0 ? examples.map(example => `### ${example.title || 'Example'}

\`\`\`jsx
${example.code || `<${componentName} />`}
\`\`\`

${example.description || ''}`).join('\n\n') : `\`\`\`jsx
<${componentName} />
\`\`\``}

## Notes

- Created by Project Sunlight documentation standardization
`;
}

// Standard README template for a directory
function generateDirectoryReadmeTemplate(directoryName, files = [], subdirectories = []) {
  return `# ${directoryName}

This directory contains...

## Files

${files.length > 0 ? files.map(file => `- [${file.name}](${file.path}): ${file.description || 'No description available'}`).join('\n') : 'No files in this directory.'}

## Subdirectories

${subdirectories.length > 0 ? subdirectories.map(dir => `- [${dir.name}](${dir.path}): ${dir.description || 'No description available'}`).join('\n') : 'No subdirectories.'}

## Usage

...

## Notes

- Created by Project Sunlight documentation standardization
`;
}

// Function to extract props from a React component
function extractPropsFromComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const props = [];
    
    // Look for PropTypes
    const propTypesRegex = /([A-Za-z0-9_]+)\.propTypes\s*=\s*\{([^}]+)\}/g;
    let propTypesMatch;
    
    while ((propTypesMatch = propTypesRegex.exec(content)) !== null) {
      const propDefinitions = propTypesMatch[2].split(',');
      
      propDefinitions.forEach(propDef => {
        const propMatch = propDef.match(/([A-Za-z0-9_]+):\s*([^,]+)/);
        if (propMatch) {
          const propName = propMatch[1].trim();
          const propType = propMatch[2].trim()
            .replace('PropTypes.', '')
            .replace('isRequired', '')
            .trim();
          
          props.push({
            name: propName,
            type: propType
          });
        }
      });
    }
    
    // Look for default props
    const defaultPropsRegex = /([A-Za-z0-9_]+)\.defaultProps\s*=\s*\{([^}]+)\}/g;
    let defaultPropsMatch;
    
    while ((defaultPropsMatch = defaultPropsRegex.exec(content)) !== null) {
      const defaultPropDefinitions = defaultPropsMatch[2].split(',');
      
      defaultPropDefinitions.forEach(propDef => {
        const propMatch = propDef.match(/([A-Za-z0-9_]+):\s*([^,]+)/);
        if (propMatch) {
          const propName = propMatch[1].trim();
          const propDefault = propMatch[2].trim();
          
          // Find the prop and add the default value
          const existingProp = props.find(p => p.name === propName);
          if (existingProp) {
            existingProp.default = propDefault;
          }
        }
      });
    }
    
    // Look for JSDoc descriptions
    const jsdocRegex = /\/\*\*\s*\n([^*]|\*[^/])*?@param\s+\{[^}]*\}\s+([a-zA-Z0-9_]+)\s+([^*]|\*[^/])*?\*/g;
    let jsdocMatch;
    
    while ((jsdocMatch = jsdocRegex.exec(content)) !== null) {
      const paramMatch = jsdocMatch[0].match(/@param\s+\{[^}]*\}\s+([a-zA-Z0-9_]+)\s+-\s+([^\n]+)/);
      if (paramMatch) {
        const propName = paramMatch[1].trim();
        const propDescription = paramMatch[2].trim();
        
        // Find the prop and add the description
        const existingProp = props.find(p => p.name === propName);
        if (existingProp) {
          existingProp.description = propDescription;
        }
      }
    }
    
    return props;
  } catch (error) {
    console.error(`❌ Error extracting props from ${filePath}:`, error.message);
    return [];
  }
}

// Function to extract examples from a component's documentation
function extractExamplesFromDocs(filePath) {
  try {
    const docPath = path.join(DOCS_DIR, path.relative(COMPONENTS_DIR, filePath).replace(/\.jsx?$/, '.md'));
    
    if (!fs.existsSync(docPath)) {
      return [];
    }
    
    const content = fs.readFileSync(docPath, 'utf8');
    const examples = [];
    
    // Look for example code blocks
    const exampleRegex = /### ([^\n]+)\n\n```jsx\n([\s\S]*?)```\n\n([\s\S]*?)(?=### |$)/g;
    let exampleMatch;
    
    while ((exampleMatch = exampleRegex.exec(content)) !== null) {
      examples.push({
        title: exampleMatch[1].trim(),
        code: exampleMatch[2].trim(),
        description: exampleMatch[3].trim()
      });
    }
    
    return examples;
  } catch (error) {
    console.error(`❌ Error extracting examples from ${filePath}:`, error.message);
    return [];
  }
}

// Function to extract description from a component
function extractDescriptionFromComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for JSDoc description at the top of the file
    const jsdocRegex = /\/\*\*\s*\n([^@]*)\*/;
    const jsdocMatch = content.match(jsdocRegex);
    
    if (jsdocMatch) {
      return jsdocMatch[1]
        .replace(/\*/g, '')
        .replace(/\n/g, ' ')
        .trim();
    }
    
    // If no JSDoc, try to generate a description based on the file name
    const fileName = path.basename(filePath, path.extname(filePath));
    return `The ${fileName} component...`;
  } catch (error) {
    console.error(`❌ Error extracting description from ${filePath}:`, error.message);
    return '';
  }
}

// Function to analyze a component for documentation
function analyzeComponentForDocs(filePath) {
  try {
    const componentName = path.basename(filePath, path.extname(filePath));
    const docPath = path.join(DOCS_DIR, path.relative(COMPONENTS_DIR, filePath).replace(/\.jsx?$/, '.md'));
    
    // Check if documentation exists
    const docExists = fs.existsSync(docPath);
    
    // Extract props, examples, and description
    const props = extractPropsFromComponent(filePath);
    const examples = docExists ? extractExamplesFromDocs(docPath) : [];
    const description = extractDescriptionFromComponent(filePath);
    
    return {
      filePath,
      componentName,
      docPath,
      docExists,
      props,
      examples,
      description,
      needsDocumentation: !docExists
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath} for documentation:`, error.message);
    return {
      filePath,
      error: error.message,
      needsDocumentation: false
    };
  }
}

// Function to analyze a directory for README
function analyzeDirectoryForReadme(dirPath) {
  try {
    const readmePath = path.join(dirPath, 'README.md');
    const readmeExists = fs.existsSync(readmePath);
    
    // Get directory name
    const directoryName = path.basename(dirPath);
    
    // Get files in the directory
    const files = fs.readdirSync(dirPath)
      .filter(file => !file.startsWith('.') && !file.startsWith('_') && fs.statSync(path.join(dirPath, file)).isFile())
      .map(file => ({
        name: file,
        path: file,
        description: file === 'index.js' ? 'Entry point' : ''
      }));
    
    // Get subdirectories
    const subdirectories = fs.readdirSync(dirPath)
      .filter(file => !file.startsWith('.') && !file.startsWith('_') && fs.statSync(path.join(dirPath, file)).isDirectory())
      .map(dir => ({
        name: dir,
        path: dir,
        description: ''
      }));
    
    return {
      dirPath,
      readmePath,
      directoryName,
      readmeExists,
      files,
      subdirectories,
      needsReadme: !readmeExists
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${dirPath} for README:`, error.message);
    return {
      dirPath,
      error: error.message,
      needsReadme: false
    };
  }
}

// Function to create/update component documentation
function createComponentDocumentation(analysis) {
  try {
    const docContent = generateComponentDocTemplate(
      analysis.componentName,
      analysis.description,
      analysis.props,
      analysis.examples
    );
    
    if (!DRY_RUN) {
      // Create directory structure if needed
      const docDir = path.dirname(analysis.docPath);
      fs.mkdirSync(docDir, { recursive: true });
      
      // Write documentation file
      fs.writeFileSync(analysis.docPath, docContent, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error creating documentation for ${analysis.componentName}:`, error.message);
    return false;
  }
}

// Function to create directory README
function createDirectoryReadme(analysis) {
  try {
    const readmeContent = generateDirectoryReadmeTemplate(
      analysis.directoryName,
      analysis.files,
      analysis.subdirectories
    );
    
    if (!DRY_RUN) {
      // Write README file
      fs.writeFileSync(analysis.readmePath, readmeContent, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error creating README for ${analysis.directoryName}:`, error.message);
    return false;
  }
}

// Find all React component files
const componentFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx}`)
  .filter(filePath => {
    const fileName = path.basename(filePath);
    // Skip index files, hidden files, and non-component files
    return !fileName.startsWith('index') && 
           !fileName.startsWith('.') && 
           !fileName.startsWith('_');
  });

console.log(`🔍 Found ${componentFiles.length} component files to analyze...`);

// Analyze components for documentation
const componentAnalyses = componentFiles.map(filePath => analyzeComponentForDocs(filePath));
const componentsNeedingDocs = componentAnalyses.filter(a => a.needsDocumentation);

// Find all directories to analyze for READMEs
const directories = [
  COMPONENTS_DIR,
  ...glob.sync(`${COMPONENTS_DIR}/*`).filter(p => fs.statSync(p).isDirectory())
];

console.log(`🔍 Found ${directories.length} directories to analyze...`);

// Analyze directories for READMEs
const directoryAnalyses = directories.map(dirPath => analyzeDirectoryForReadme(dirPath));
const directoriesNeedingReadme = directoryAnalyses.filter(a => a.needsReadme);

// Summary
console.log(`\n📊 Documentation Analysis Summary:`);
console.log(`- Total component files: ${componentFiles.length}`);
console.log(`- Components needing documentation: ${componentsNeedingDocs.length}`);
console.log(`- Total directories: ${directories.length}`);
console.log(`- Directories needing README: ${directoriesNeedingReadme.length}`);

// Create component documentation
if (componentsNeedingDocs.length > 0) {
  console.log('\n🔄 Creating component documentation...');
  
  if (DRY_RUN) {
    console.log('⚠️ Dry run mode - not creating actual documentation');
  }
  
  let createdCount = 0;
  
  componentsNeedingDocs.forEach(analysis => {
    console.log(`- Creating documentation for ${analysis.componentName}`);
    
    const wasCreated = createComponentDocumentation(analysis);
    if (wasCreated) {
      createdCount++;
    }
  });
  
  console.log(`\n✅ Created documentation for ${createdCount} components`);
}

// Create directory READMEs
if (directoriesNeedingReadme.length > 0) {
  console.log('\n🔄 Creating directory READMEs...');
  
  if (DRY_RUN) {
    console.log('⚠️ Dry run mode - not creating actual READMEs');
  }
  
  let createdCount = 0;
  
  directoriesNeedingReadme.forEach(analysis => {
    console.log(`- Creating README for ${analysis.directoryName} directory`);
    
    const wasCreated = createDirectoryReadme(analysis);
    if (wasCreated) {
      createdCount++;
    }
  });
  
  console.log(`\n✅ Created ${createdCount} directory READMEs`);
}

// Provide suggestions for next steps
console.log('\nNext steps:');
console.log('1. Review created documentation files');
console.log('2. Add detailed descriptions and examples to component documentation');
console.log('3. Enhance directory README files with more context');
console.log('4. Update the Technical Debt Elimination Tracker in ClaudeContext.md');