#!/usr/bin/env node

/**
 * Create A11y Component CLI Tool
 * 
 * A command-line tool for generating accessibility-enhanced components
 * for the TAP Integration Platform UI Facelift project.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { generateCompleteComponent } = require('../src/utils/tools/componentTemplateGenerator');

// Configuration
const config = {
  componentBasePath: path.resolve(__dirname, '../src/components'),
  customTemplatesPath: path.resolve(__dirname, './templates'),
  componentTypes: ['generic', 'button', 'dialog', 'form', 'table'],
  templateTypes: ['a11y', 'functional', 'performance'],
  defaultType: 'a11y',
  defaultComponentType: 'generic'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Process command line arguments
const args = process.argv.slice(2);
const flags = {
  help: args.includes('--help') || args.includes('-h'),
  noTests: args.includes('--no-tests') || args.includes('-nt'),
  enhance: args.includes('--enhance') || args.includes('-e'),
  batch: args.includes('--batch') || args.includes('-b'),
  force: args.includes('--force') || args.includes('-f')
};

// Extract arguments that aren't flags
const nonFlagArgs = args.filter(arg => !arg.startsWith('-'));

/**
 * Show help information
 */
function showHelp() {
  console.log(`
  Create A11y Component CLI Tool
  ------------------------------
  A tool for generating accessibility-enhanced components for the TAP Integration Platform.
  
  Usage:
    npm run create-a11y-component -- [options] [ComponentName] [ComponentType] [TemplatePath]
  
  Options:
    --help, -h          : Show this help information
    --no-tests, -nt     : Skip generating test files
    --enhance, -e       : Enhance an existing component with accessibility features
    --batch, -b         : Batch mode for enhancing multiple components
    --force, -f         : Force overwrite of existing files
  
  Component Types:
    ${config.componentTypes.join(', ')}
  
  Template Types:
    ${config.templateTypes.join(', ')}
  
  Examples:
    npm run create-a11y-component -- MyButton button
    npm run create-a11y-component -- CustomDialog dialog src/components/dialogs
    npm run create-a11y-component -- --enhance ExistingComponent
    npm run create-a11y-component -- --batch --enhance components.txt
  `);
  rl.close();
}

/**
 * Ask a question and get user input
 * 
 * @param {string} question - Question to ask
 * @param {string} defaultValue - Default value
 * @returns {Promise<string>} User response
 */
function askQuestion(question, defaultValue = '') {
  const defaultText = defaultValue ? ` (${defaultValue})` : '';
  
  return new Promise(resolve => {
    rl.question(`${question}${defaultText}: `, answer => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Validate a component name
 * 
 * @param {string} name - Component name to validate
 * @returns {boolean} Whether the name is valid
 */
function isValidComponentName(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

/**
 * Check if a file exists
 * 
 * @param {string} filePath - Path to check
 * @returns {boolean} Whether the file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

/**
 * Create a component based on user input or arguments
 */
async function createComponent() {
  try {
    // Get component name
    let componentName = nonFlagArgs[0];
    if (!componentName) {
      componentName = await askQuestion('Component name (PascalCase)');
    }
    
    if (!isValidComponentName(componentName)) {
      console.error('Error: Component name must be in PascalCase (start with a capital letter)');
      rl.close();
      return;
    }
    
    // Get component type
    let componentType = nonFlagArgs[1] || config.defaultComponentType;
    if (!config.componentTypes.includes(componentType)) {
      componentType = await askQuestion(
        `Component type (${config.componentTypes.join(', ')})`,
        config.defaultComponentType
      );
    }
    
    // Get template type
    let templateType = config.defaultType;
    if (!flags.enhance) {
      templateType = await askQuestion(
        `Template type (${config.templateTypes.join(', ')})`,
        config.defaultType
      );
    }
    
    // Get component path
    let componentPath = nonFlagArgs[2] || config.componentBasePath;
    if (componentPath === 'common') {
      componentPath = path.join(config.componentBasePath, 'common');
    } else if (componentPath === 'integration') {
      componentPath = path.join(config.componentBasePath, 'integration');
    } else if (!path.isAbsolute(componentPath)) {
      componentPath = path.join(config.componentBasePath, componentPath);
    }
    
    // Get component description
    const componentDescription = await askQuestion('Component description', `A ${componentType} component`);
    
    // Check if component already exists
    const componentFile = path.join(componentPath, `${componentName}.jsx`);
    if (fileExists(componentFile) && !flags.force && !flags.enhance) {
      const overwrite = await askQuestion(`Component ${componentName} already exists. Overwrite? (y/n)`, 'n');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Operation cancelled.');
        rl.close();
        return;
      }
    }
    
    // If enhancing an existing component
    if (flags.enhance) {
      if (!fileExists(componentFile)) {
        console.error(`Error: Component ${componentName} does not exist and cannot be enhanced.`);
        rl.close();
        return;
      }
      
      console.log(`Enhancing component ${componentName} with accessibility features...`);
      
      // Create a11y version of the component
      const a11yComponentName = `A11y${componentName}`;
      const a11yComponentFile = path.join(componentPath, `${a11yComponentName}.jsx`);
      
      // Generate the new component
      const result = generateCompleteComponent({
        componentName: a11yComponentName,
        componentPath,
        componentDescription: `Accessibility-enhanced version of ${componentName}`,
        templateType: 'a11y',
        componentType,
        generateTests: !flags.noTests
      });
      
      if (result.success) {
        console.log(`Enhanced component created successfully:\n${result.files.join('\n')}`);
      } else {
        console.error('Error creating enhanced component:', result.errors.join('\n'));
      }
    } else {
      // Generate the component
      const result = generateCompleteComponent({
        componentName,
        componentPath,
        componentDescription,
        templateType,
        componentType,
        generateTests: !flags.noTests
      });
      
      if (result.success) {
        console.log(`Component created successfully:\n${result.files.join('\n')}`);
      } else {
        console.error('Error creating component:', result.errors.join('\n'));
      }
    }
    
    rl.close();
  } catch (error) {
    console.error('Error creating component:', error);
    rl.close();
  }
}

/**
 * Process a batch of components from a file
 * 
 * @param {string} filePath - Path to the batch file
 */
async function processBatch(filePath) {
  try {
    if (!fileExists(filePath)) {
      console.error(`Error: Batch file ${filePath} does not exist.`);
      rl.close();
      return;
    }
    
    // Read the batch file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const components = fileContent.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    console.log(`Processing ${components.length} components from ${filePath}...`);
    
    // Process each component
    for (const line of components) {
      const [componentName, componentType, componentPath] = line.split(',').map(s => s.trim());
      
      if (!componentName) {
        console.warn('Skipping empty component name');
        continue;
      }
      
      // Generate the component
      console.log(`Processing ${componentName}...`);
      const result = generateCompleteComponent({
        componentName: flags.enhance ? `A11y${componentName}` : componentName,
        componentPath: componentPath ? path.join(config.componentBasePath, componentPath) : config.componentBasePath,
        componentDescription: flags.enhance ? `Accessibility-enhanced version of ${componentName}` : `A ${componentType || config.defaultComponentType} component`,
        templateType: 'a11y',
        componentType: componentType || config.defaultComponentType,
        generateTests: !flags.noTests
      });
      
      if (result.success) {
        console.log(`Component ${componentName} created successfully.`);
      } else {
        console.error(`Error creating component ${componentName}:`, result.errors.join('\n'));
      }
    }
    
    console.log('Batch processing complete.');
    rl.close();
  } catch (error) {
    console.error('Error processing batch:', error);
    rl.close();
  }
}

/**
 * Main function
 */
async function main() {
  // Show help if requested
  if (flags.help) {
    showHelp();
    return;
  }
  
  // Process batch file if in batch mode
  if (flags.batch) {
    const batchFile = nonFlagArgs[0];
    if (!batchFile) {
      console.error('Error: No batch file specified.');
      rl.close();
      return;
    }
    
    await processBatch(batchFile);
    return;
  }
  
  // Create or enhance a single component
  await createComponent();
}

// Start the program
main();