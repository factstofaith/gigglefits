/**
 * Copy Package Files
 * 
 * This script copies and creates necessary package files for the NPM package
 * - Creates package.json for the dist folder with proper format exports
 * - Copies TypeScript definitions to the dist folder
 * - Generates format-specific README files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root and destination directories
const rootDir = path.resolve(__dirname, '../../');
const distDir = path.resolve(rootDir, 'dist');
const cjsDir = path.resolve(distDir, 'cjs');
const esmDir = path.resolve(distDir, 'esm');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create dist package.json
function createPackageJson() {
  const mainPkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'));
  
  // Create stripped-down package.json for distribution
  const distPkg = {
    name: mainPkg.name,
    version: mainPkg.version,
    description: "TAP Integration Platform components",
    main: "cjs/index.js",
    module: "esm/index.js",
    types: "index.d.ts",
    exports: {
      ".": {
        "require": "./cjs/index.js",
        "import": "./esm/index.js",
        "types": "./index.d.ts"
      }
    },
    peerDependencies: {
      "react": ">=18.0.0",
      "react-dom": ">=18.0.0"
    },
    engines: {
      "node": ">=14.0.0"
    },
    browserslist: mainPkg.browserslist || {
      "production": [">0.2%", "not dead", "not op_mini all"],
      "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
    }
  };
  
  // Write the package.json to the dist directory
  fs.writeFileSync(
    path.resolve(distDir, 'package.json'),
    JSON.stringify(distPkg, null, 2),
    'utf-8'
  );
  
  console.log('✅ Created dist/package.json');
}

// Copy TypeScript definitions
function copyTypeDefinitions() {
  const srcDir = path.resolve(rootDir, 'src');
  const typesDir = path.resolve(srcDir, 'types');
  const distTypesDir = path.resolve(distDir, 'types');
  
  // Create types directory if it doesn't exist
  if (!fs.existsSync(distTypesDir)) {
    fs.mkdirSync(distTypesDir, { recursive: true });
  }
  
  // Check if types directory exists
  if (fs.existsSync(typesDir)) {
    // Copy all .d.ts files from types directory
    const typeFiles = fs.readdirSync(typesDir).filter(file => file.endsWith('.d.ts'));
    
    typeFiles.forEach(file => {
      const srcFile = path.resolve(typesDir, file);
      const destFile = path.resolve(distTypesDir, file);
      
      fs.copyFileSync(srcFile, destFile);
      console.log(`✅ Copied ${file} to dist/types/`);
    });
    
    // Create index.d.ts file that exports all type definitions
    const indexDts = typeFiles
      .map(file => `export * from './types/${file.replace('.d.ts', '')}';`)
      .join('\n');
    
    fs.writeFileSync(
      path.resolve(distDir, 'index.d.ts'),
      indexDts,
      'utf-8'
    );
    
    console.log('✅ Created dist/index.d.ts');
  } else {
    console.warn('⚠️ No TypeScript definitions found in src/types');
    
    // Create empty index.d.ts file
    fs.writeFileSync(
      path.resolve(distDir, 'index.d.ts'),
      '// Type definitions for TAP Integration Platform\n',
      'utf-8'
    );
    
    console.log('✅ Created empty dist/index.d.ts');
  }
}

// Create README.md for the package
function createReadme() {
  const readmeContent = `# TAP Integration Platform Components

This package contains the component library for the TAP Integration Platform.

## Installation

\`\`\`bash
npm install tap-integration-platform
\`\`\`

## Usage

### CommonJS

\`\`\`js
const { Button, Card } = require('tap-integration-platform');
\`\`\`

### ES Modules

\`\`\`js
import { Button, Card } from 'tap-integration-platform';
\`\`\`

## Package Information

- **Format Support**: CommonJS (CJS) and ES Modules (ESM)
- **React Compatibility**: React 18+
- **TypeScript Support**: Included
`;

  fs.writeFileSync(
    path.resolve(distDir, 'README.md'),
    readmeContent,
    'utf-8'
  );
  
  console.log('✅ Created dist/README.md');
}

// Main function
function main() {
  try {
    console.log('📦 Copying package files for NPM package...');
    
    // Create package.json
    createPackageJson();
    
    // Copy TypeScript definitions
    copyTypeDefinitions();
    
    // Create README.md
    createReadme();
    
    console.log('🎉 Successfully prepared NPM package files');
  } catch (error) {
    console.error('❌ Error preparing package files:', error);
    process.exit(1);
  }
}

// Execute
main();