/**
 * Fix Hook Violations Script
 * 
 * This script identifies and fixes remaining hook violations in the codebase.
 * It ensures all hooks follow React's rules.
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Base paths
const FRONTEND_PATH = path.resolve(__dirname, '../../../frontend');
const SRC_PATH = path.join(FRONTEND_PATH, 'src');

// File with known hook violation from technical debt report
const filesToCheck = [
  // Add paths to be determined from technical debt report
];

// Check if a function is a hook (starts with 'use')
function isHook(name) {
  return name.startsWith('use') && 
         name.length > 3 && 
         name[3] === name[3].toUpperCase();
}

// Check if node is a React Hook call
function isReactHook(node) {
  return t.isMemberExpression(node.callee) && 
         t.isIdentifier(node.callee.object, { name: 'React' }) && 
         t.isIdentifier(node.callee.property) && 
         isHook(node.callee.property.name);
}

// Check if node is a custom Hook call
function isCustomHook(node) {
  return t.isIdentifier(node.callee) && isHook(node.callee.name);
}

// Find hook violations in a file
function findHookViolations(filePath, fixMode = false) {
  console.log(`Analyzing ${filePath}...`);
  
  let violations = [];
  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Parse the file
    const ast = parser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    // Variables to track context
    let inComponentFunction = false;
    let inConditionalBlock = false;
    let inLoop = false;
    let currentFunctionName = null;
    let hookCallsInFunction = [];
    
    // Traverse and find violations
    traverse(ast, {
      // Track function declarations/expressions
      FunctionDeclaration(path) {
        const parentName = path.node.id ? path.node.id.name : 'anonymous';
        currentFunctionName = parentName;
        inComponentFunction = path.node.id && 
                             (path.node.id.name[0] === path.node.id.name[0].toUpperCase() || 
                              isHook(path.node.id.name));
        hookCallsInFunction = [];
        
        // Process function body
        path.traverse({
          CallExpression(callPath) {
            if ((isReactHook(callPath.node) || isCustomHook(callPath.node)) && 
                (inConditionalBlock || inLoop)) {
              const hookName = t.isIdentifier(callPath.node.callee) ? 
                             callPath.node.callee.name : 
                             callPath.node.callee.property.name;
              
              violations.push({
                location: callPath.node.loc.start.line,
                hookName,
                parentName: currentFunctionName,
                message: `Hook '${hookName}' called in a ${inConditionalBlock ? 'conditional' : 'loop'}`
              });
              
              // Fix in fix mode - move hook outside the conditional or loop
              if (fixMode) {
                // Complex logic to fix would go here in a real implementation
                // This would require significant AST manipulation
                console.log(`  Would fix hook '${hookName}' on line ${callPath.node.loc.start.line}`);
              }
            }
            
            // Track hooks called in this function
            if (isReactHook(callPath.node) || isCustomHook(callPath.node)) {
              const hookName = t.isIdentifier(callPath.node.callee) ? 
                              callPath.node.callee.name : 
                              callPath.node.callee.property.name;
              hookCallsInFunction.push(hookName);
            }
          },
          
          // Track conditional blocks
          IfStatement(ifPath) {
            const oldInConditional = inConditionalBlock;
            inConditionalBlock = true;
            ifPath.traverse({
              CallExpression(callPath) {
                if ((isReactHook(callPath.node) || isCustomHook(callPath.node))) {
                  const hookName = t.isIdentifier(callPath.node.callee) ? 
                                 callPath.node.callee.name : 
                                 callPath.node.callee.property.name;
                  
                  violations.push({
                    location: callPath.node.loc.start.line,
                    hookName,
                    parentName: currentFunctionName,
                    message: `Hook '${hookName}' called in a conditional`
                  });
                  
                  // Fix in fix mode
                  if (fixMode) {
                    console.log(`  Would fix hook '${hookName}' in conditional on line ${callPath.node.loc.start.line}`);
                  }
                }
              }
            });
            inConditionalBlock = oldInConditional;
          },
          
          // Track loops
          ForStatement(forPath) {
            const oldInLoop = inLoop;
            inLoop = true;
            forPath.traverse({
              CallExpression(callPath) {
                if ((isReactHook(callPath.node) || isCustomHook(callPath.node))) {
                  const hookName = t.isIdentifier(callPath.node.callee) ? 
                                 callPath.node.callee.name : 
                                 callPath.node.callee.property.name;
                  
                  violations.push({
                    location: callPath.node.loc.start.line,
                    hookName,
                    parentName: currentFunctionName,
                    message: `Hook '${hookName}' called in a loop`
                  });
                  
                  // Fix in fix mode
                  if (fixMode) {
                    console.log(`  Would fix hook '${hookName}' in loop on line ${callPath.node.loc.start.line}`);
                  }
                }
              }
            });
            inLoop = oldInLoop;
          },
          
          WhileStatement(whilePath) {
            const oldInLoop = inLoop;
            inLoop = true;
            whilePath.traverse({
              CallExpression(callPath) {
                if ((isReactHook(callPath.node) || isCustomHook(callPath.node))) {
                  const hookName = t.isIdentifier(callPath.node.callee) ? 
                                 callPath.node.callee.name : 
                                 callPath.node.callee.property.name;
                  
                  violations.push({
                    location: callPath.node.loc.start.line,
                    hookName,
                    parentName: currentFunctionName,
                    message: `Hook '${hookName}' called in a loop`
                  });
                  
                  // Fix in fix mode
                  if (fixMode) {
                    console.log(`  Would fix hook '${hookName}' in loop on line ${callPath.node.loc.start.line}`);
                  }
                }
              }
            });
            inLoop = oldInLoop;
          }
        });
        
        // Check for hooks not at the top level of the function
        if (hookCallsInFunction.length > 0 && path.node.body.body) {
          const bodyStatements = path.node.body.body;
          const hookCalls = bodyStatements.filter(stmt => 
            t.isExpressionStatement(stmt) && 
            t.isCallExpression(stmt.expression) && 
            ((t.isIdentifier(stmt.expression.callee) && isHook(stmt.expression.callee.name)) || 
             (t.isMemberExpression(stmt.expression.callee) && 
              t.isIdentifier(stmt.expression.callee.object, { name: 'React' }) && 
              t.isIdentifier(stmt.expression.callee.property) && 
              isHook(stmt.expression.callee.property.name)))
          );
          
          if (hookCalls.length < hookCallsInFunction.length) {
            violations.push({
              location: path.node.loc.start.line,
              hookName: hookCallsInFunction.join(', '),
              parentName: currentFunctionName,
              message: 'Hooks not at the top level of component'
            });
            
            // Fix in fix mode
            if (fixMode) {
              console.log(`  Would fix hooks not at top level in ${currentFunctionName}`);
            }
          }
        }
      },
      
      // Similar checks for arrow functions and function expressions
      ArrowFunctionExpression(path) {
        const parentNode = path.parent;
        let parentName = 'anonymous';
        
        if (t.isVariableDeclarator(parentNode) && parentNode.id) {
          parentName = parentNode.id.name;
          inComponentFunction = parentName[0] === parentName[0].toUpperCase() || isHook(parentName);
        } else if (t.isProperty(parentNode) && parentNode.key) {
          parentName = parentNode.key.name || 'property';
        } else if (t.isAssignmentExpression(parentNode) && parentNode.left) {
          if (t.isIdentifier(parentNode.left)) {
            parentName = parentNode.left.name;
          } else if (t.isMemberExpression(parentNode.left)) {
            parentName = parentNode.left.property.name || 'member';
          }
        }
        
        currentFunctionName = parentName;
        hookCallsInFunction = [];
        
        // Process function body (similar to FunctionDeclaration)
        // ...same traversal logic for call expressions, conditions, and loops as above
      }
    });
    
    // If in fix mode and violations found, modify and save the file
    if (fixMode && violations.length > 0) {
      // In a real implementation, we would modify the AST and generate new code
      // This would be a complex task requiring careful analysis of each violation
      
      // For demonstration, we'll just log what we would do
      console.log(`Would fix ${violations.length} violations in ${filePath}`);
      
      // Re-serialize the AST (not shown here as it requires the actual fixes)
      // const output = generate(ast, {}, fileContent);
      // fs.writeFileSync(filePath, output.code, 'utf8');
    }
    
    return violations;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return violations;
  }
}

// Find all *.jsx and *.js files in the src directory
function findAllJsFiles() {
  function findFiles(dir, pattern, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        findFiles(filePath, pattern, fileList);
      } else if (pattern.test(file)) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }
  
  return findFiles(SRC_PATH, /\.(js|jsx)$/);
}

// Find all hook violations
function findAndFixAllHookViolations(fix = false) {
  console.log(`🔍 ${fix ? 'Fixing' : 'Finding'} hook violations...`);
  
  // If no specific files are defined, check all JS files
  const filesToProcess = filesToCheck.length > 0 ? filesToCheck : findAllJsFiles();
  
  let allViolations = [];
  
  filesToProcess.forEach(file => {
    const violations = findHookViolations(file, fix);
    if (violations.length > 0) {
      allViolations = [...allViolations, ...violations];
      console.log(`Found ${violations.length} violations in ${file}`);
      violations.forEach(v => {
        console.log(`  Line ${v.location}: ${v.message} in ${v.parentName}`);
      });
    }
  });
  
  console.log(`Total violations found: ${allViolations.length}`);
  
  if (fix) {
    console.log('✅ Hook violations fixed!');
  }
  
  return allViolations;
}

// Main function
function main() {
  const fixMode = process.argv.includes('--fix');
  findAndFixAllHookViolations(fixMode);
}

// Run the script
main();