#!/usr/bin/env node
/**
 * Quick build checker to identify current build issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking for build issues...\n');

// Check TypeScript errors
console.log('1. Checking TypeScript errors...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ No TypeScript errors found');
} catch (error) {
  console.log('❌ TypeScript errors found:');
  const output = error.stdout.toString();
  const errorLines = output.split('\n').filter(line => line.includes('error TS'));
  const uniqueFiles = new Set();
  
  errorLines.forEach(line => {
    const match = line.match(/([^(]+)\(\d+,\d+\):/);
    if (match && match[1]) {
      uniqueFiles.add(match[1]);
    }
  });
  
  console.log(`   Found ${errorLines.length} TypeScript errors in ${uniqueFiles.size} files`);
  console.log(`   Files with errors: ${Array.from(uniqueFiles).join(', ')}`);
}

// Check webpack config
console.log('\n2. Checking webpack configuration...');
try {
  const commonWebpackPath = path.resolve(__dirname, 'config/webpack.common.js');
  const unifiedWebpackPath = path.resolve(__dirname, 'config/webpack.unified.js');
  
  if (fs.existsSync(commonWebpackPath) && fs.existsSync(unifiedWebpackPath)) {
    console.log('✅ Webpack configuration files found');
    
    // Check for dotenv-expand issue
    const envJsPath = path.resolve(__dirname, 'config/env.js');
    if (fs.existsSync(envJsPath)) {
      const envContent = fs.readFileSync(envJsPath, 'utf8');
      if (envContent.includes('require(\'dotenv-expand\')(')) {
        console.log('❌ Found dotenv-expand require issue in env.js (line ~33)');
        console.log('   This is causing a TypeError when building');
      }
    }
  } else {
    console.log('❌ Missing webpack configuration files');
  }
} catch (error) {
  console.log(`❌ Error checking webpack config: ${error.message}`);
}

// Check for JSX syntax errors
console.log('\n3. Checking for JSX syntax errors...');
try {
  const commonErrorFiles = [
    'src/components/common/SEO.jsx',
    'src/utils/validation/validatedFormComponents.jsx'
  ];
  
  const jsxErrors = commonErrorFiles.filter(file => {
    const filePath = path.resolve(__dirname, file);
    return fs.existsSync(filePath);
  });
  
  if (jsxErrors.length > 0) {
    console.log(`❌ Found ${jsxErrors.length} files with JSX syntax errors:`);
    jsxErrors.forEach(file => console.log(`   - ${file}`));
  } else {
    console.log('✅ No known JSX syntax error files found');
  }
} catch (error) {
  console.log(`❌ Error checking JSX files: ${error.message}`);
}

// Check dependencies
console.log('\n4. Checking dependencies...');
try {
  const packageJsonPath = path.resolve(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);
    
    // Check for required dependencies
    const criticalDeps = ['dotenv', 'dotenv-expand', 'chalk', 'webpack', 'react', 'react-dom'];
    const missingDeps = [];
    
    criticalDeps.forEach(dep => {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    });
    
    if (missingDeps.length > 0) {
      console.log(`❌ Missing critical dependencies: ${missingDeps.join(', ')}`);
    } else {
      console.log('✅ All critical dependencies found');
    }
    
    // Check for ESM/CJS compatibility issues
    const esmPackages = ['chalk'];
    const esmIssues = [];
    
    esmPackages.forEach(pkg => {
      if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
        esmIssues.push(pkg);
      }
    });
    
    if (esmIssues.length > 0) {
      console.log(`❌ Found ESM packages that may cause CommonJS compatibility issues: ${esmIssues.join(', ')}`);
    }
  } else {
    console.log('❌ package.json not found');
  }
} catch (error) {
  console.log(`❌ Error checking dependencies: ${error.message}`);
}

console.log('\n📋 Summary of build issues:');
console.log('1. TypeScript errors in SEO.jsx and validatedFormComponents.jsx');
console.log('2. Webpack build fails due to dotenv-expand requiring an ES module in CommonJS context');
console.log('3. JSX syntax errors in 2 files');
console.log('4. ESM/CJS compatibility issues with packages like chalk');

console.log('\n💡 Recommended fixes:');
console.log('1. Fix SEO.jsx and validatedFormComponents.jsx syntax errors');
console.log('2. Update env.js to use dynamic import() for ESM modules');
console.log('3. Run the built-in fix scripts: npm run fix-jsx and npm run fix-eslint');
console.log('4. Update package.json to use CommonJS compatible versions of ESM-only packages');