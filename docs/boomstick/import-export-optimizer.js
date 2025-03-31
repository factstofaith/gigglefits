#!/usr/bin/env node
/**
 * Import/Export Optimizer
 * 
 * Deep static analysis tool for finding and fixing:
 * - Duplicate exports
 * - Invalid export names
 * - Circular dependencies
 * - Unused imports
 * - Missing imports 
 * - Import path optimization
 * 
 * Features:
 * - Module dependency graph construction
 * - Circular dependency detection
 * - Unused code elimination
 * - Path alias optimization
 * - Dual compatibility validation
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };
const { execSync } = require('child_process');

// Configuration
const config = {
  rootDir: process.cwd(),
  backupDir: path.resolve(`./project/777_Final/backups/${new Date().toISOString().replace(/:/g, '-')}`),
  outputFile: './imports-exports-analysis.json',
  dryRun: false,
  verbose: false,
  skipTests: false,
  aliasMap: {
    '@components': 'src/components',
    '@utils': 'src/utils',
    '@hooks': 'src/hooks',
    '@contexts': 'src/contexts',
    '@services': 'src/services',
    '@design-system': 'src/design-system'
  }
};

// Parse command line args
const args = process.argv.slice(2);
if (args.includes('--dry-run')) config.dryRun = true;
if (args.includes('--verbose')) config.verbose = true;
if (args.includes('--skip-tests')) config.skipTests = true;

// Ensure backup directory exists
if (!config.dryRun) {
  fs.mkdirSync(config.backupDir, { recursive: true });
  console.log(chalk.blue(`Created backup directory: ${config.backupDir}`));
}

/**
 * Find JS/JSX files recursively
 */
function findJsFiles(dir, ignoreDirs = ['node_modules', '.git', 'build', 'dist']) {
  const result = [];
  const queue = [dir];
  
  while (queue.length > 0) {
    const currentDir = queue.shift();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name)) {
          queue.push(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        result.push(fullPath);
      }
    }
  }
  
  return result;
}

/**
 * Analyze imports and exports in a file
 */
function analyzeImportsExports(filePath, moduleMap) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const exports = [];
  const issues = [];
  
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
    });
    
    // Find all imports and exports
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const importedNames = [];
        let hasDefaultImport = false;
        
        path.node.specifiers.forEach(specifier => {
          if (t.isImportDefaultSpecifier(specifier)) {
            hasDefaultImport = true;
            importedNames.push({ name: specifier.local.name, isDefault: true });
          } else if (t.isImportSpecifier(specifier)) {
            importedNames.push({ 
              name: specifier.local.name, 
              imported: specifier.imported ? specifier.imported.name : specifier.local.name,
              isDefault: false 
            });
          } else if (t.isImportNamespaceSpecifier(specifier)) {
            importedNames.push({ name: specifier.local.name, isNamespace: true });
          }
        });
        
        imports.push({
          source,
          importedNames,
          node: path.node,
          loc: path.node.loc
        });
        
        // Check for empty imports
        if (importedNames.length === 0) {
          issues.push({
            type: 'empty-import',
            severity: 'error',
            message: `Empty import from "${source}"`,
            loc: path.node.loc,
            fix: {
              type: 'remove-import',
              description: 'Remove empty import',
              automated: true
            }
          });
        }
        
        // Check for duplicate imports
        const duplicateImports = imports.filter(i => i.source === source && i !== imports[imports.length - 1]);
        if (duplicateImports.length > 0) {
          issues.push({
            type: 'duplicate-import',
            severity: 'warning',
            message: `Duplicate import from "${source}"`,
            loc: path.node.loc,
            fix: {
              type: 'merge-imports',
              description: 'Merge duplicate imports',
              automated: true,
              imports: duplicateImports.concat(imports[imports.length - 1])
            }
          });
        }
        
        // Check for invalid import paths
        if (source.includes('-') && !source.startsWith('@') && !source.startsWith('./') && !source.startsWith('../')) {
          issues.push({
            type: 'invalid-import-path',
            severity: 'warning',
            message: `Import path contains hyphens which can cause issues: "${source}"`,
            loc: path.node.loc,
            fix: {
              type: 'normalize-path',
              description: 'Use underscore instead of hyphen in import path',
              automated: true
            }
          });
        }
      },
      
      ExportNamedDeclaration(path) {
        const source = path.node.source?.value;
        const exportedNames = [];
        
        if (path.node.declaration) {
          // export const/let/var or export function/class
          if (t.isVariableDeclaration(path.node.declaration)) {
            path.node.declaration.declarations.forEach(decl => {
              if (t.isIdentifier(decl.id)) {
                exportedNames.push({ name: decl.id.name, isDefault: false });
              } else if (t.isObjectPattern(decl.id)) {
                // Handle destructuring exports
                decl.id.properties.forEach(prop => {
                  if (t.isIdentifier(prop.key)) {
                    exportedNames.push({ name: prop.key.name, isDefault: false });
                  }
                });
              }
            });
          } else if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
            exportedNames.push({ name: path.node.declaration.id.name, isDefault: false });
          } else if (t.isClassDeclaration(path.node.declaration) && path.node.declaration.id) {
            exportedNames.push({ name: path.node.declaration.id.name, isDefault: false });
          }
        } else if (path.node.specifiers) {
          // export { x, y } from 'module'
          path.node.specifiers.forEach(specifier => {
            if (t.isExportSpecifier(specifier)) {
              exportedNames.push({ 
                name: specifier.exported.name, 
                local: specifier.local.name,
                isDefault: false 
              });
            }
          });
        }
        
        exports.push({
          source,
          exportedNames,
          node: path.node,
          loc: path.node.loc
        });
        
        // Check for invalid export names with hyphens
        exportedNames.forEach(({ name }) => {
          if (name.includes('-')) {
            issues.push({
              type: 'invalid-export-name',
              severity: 'error',
              message: `Export name contains invalid character: "${name}"`,
              loc: path.node.loc,
              fix: {
                type: 'rename-export',
                description: 'Replace hyphens with underscores in export name',
                automated: true,
                oldName: name,
                newName: name.replace(/-/g, '_')
              }
            });
          }
        });
      },
      
      ExportDefaultDeclaration(path) {
        let name = 'default';
        
        // Try to get the name of the exported default
        if (t.isIdentifier(path.node.declaration)) {
          name = path.node.declaration.name;
        } else if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
          name = path.node.declaration.id.name;
        } else if (t.isClassDeclaration(path.node.declaration) && path.node.declaration.id) {
          name = path.node.declaration.id.name;
        }
        
        exports.push({
          exportedNames: [{ name, isDefault: true }],
          node: path.node,
          loc: path.node.loc
        });
      },
      
      ExportAllDeclaration(path) {
        const source = path.node.source.value;
        
        exports.push({
          source,
          exportedNames: [{ name: '*', isDefault: false }],
          node: path.node,
          loc: path.node.loc
        });
      }
    });
    
    // Check for multiple default exports
    const defaultExports = exports.filter(exp => 
      exp.exportedNames.some(name => name.isDefault)
    );
    
    if (defaultExports.length > 1) {
      issues.push({
        type: 'multiple-default-exports',
        severity: 'error',
        message: `Multiple default exports found in file`,
        loc: defaultExports[1].loc,
        fix: {
          type: 'fix-default-exports',
          description: 'Keep only one default export',
          automated: true
        }
      });
    }
    
    // Check unused imports if module map is provided
    if (moduleMap) {
      // Analyze identifier usage
      const identifiersUsed = new Set();
      
      traverse(ast, {
        Identifier(path) {
          // Skip import/export declarations
          if (path.findParent(p => p.isImportDeclaration() || p.isExportDeclaration())) {
            return;
          }
          
          // Skip variable declarations
          if (path.parent.type === 'VariableDeclarator' && path.parent.id === path.node) {
            return;
          }
          
          // Skip function and class declarations
          if ((path.parent.type === 'FunctionDeclaration' || path.parent.type === 'ClassDeclaration') 
              && path.parent.id === path.node) {
            return;
          }
          
          identifiersUsed.add(path.node.name);
        }
      });
      
      // Find unused imports
      imports.forEach(importItem => {
        importItem.importedNames.forEach(imported => {
          if (!identifiersUsed.has(imported.name) && !exports.some(exp => 
              exp.exportedNames.some(en => en.name === imported.name || en.local === imported.name)
          )) {
            issues.push({
              type: 'unused-import',
              severity: 'warning',
              message: `Unused import: "${imported.name}" from "${importItem.source}"`,
              loc: importItem.loc,
              fix: {
                type: 'remove-unused-import',
                description: 'Remove unused import',
                automated: true,
                importItem,
                importedName: imported
              }
            });
          }
        });
      });
    }
    
    // Add file to module map
    if (moduleMap) {
      moduleMap[filePath] = { imports, exports };
    }
    
  } catch (error) {
    issues.push({
      type: 'parse-error',
      severity: 'error',
      message: `Failed to parse file: ${error.message}`,
      loc: error.loc
    });
  }
  
  return { imports, exports, issues };
}

/**
 * Create module dependency graph
 */
function createDependencyGraph(moduleMap) {
  const graph = {};
  
  Object.entries(moduleMap).forEach(([filePath, { imports }]) => {
    graph[filePath] = {
      dependencies: [],
      dependents: []
    };
    
    imports.forEach(importItem => {
      const importPath = resolveImportPath(filePath, importItem.source);
      if (importPath && moduleMap[importPath]) {
        graph[filePath].dependencies.push(importPath);
        
        if (!graph[importPath]) {
          graph[importPath] = { dependencies: [], dependents: [] };
        }
        
        graph[importPath].dependents.push(filePath);
      }
    });
  });
  
  return graph;
}

/**
 * Resolve import path relative to file
 */
function resolveImportPath(filePath, importSource) {
  const dirName = path.dirname(filePath);
  
  // Absolute import - check alias map
  if (!importSource.startsWith('.') && !importSource.startsWith('/')) {
    for (const [alias, aliasPath] of Object.entries(config.aliasMap)) {
      if (importSource.startsWith(alias)) {
        const relativePath = importSource.replace(alias, aliasPath);
        const possiblePaths = [
          `${relativePath}.js`,
          `${relativePath}.jsx`,
          `${relativePath}/index.js`,
          `${relativePath}/index.jsx`
        ];
        
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            return path.resolve(p);
          }
        }
      }
    }
    
    // Try node_modules or absolute path
    return null;
  }
  
  // Relative import
  if (importSource.startsWith('.')) {
    const absolutePath = path.resolve(dirName, importSource);
    
    // Try extensions
    const possiblePaths = [
      absolutePath,
      `${absolutePath}.js`,
      `${absolutePath}.jsx`,
      `${absolutePath}/index.js`,
      `${absolutePath}/index.jsx`
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }
  
  return null;
}

/**
 * Find circular dependencies in graph
 */
function findCircularDependencies(graph) {
  const circular = [];
  
  function detectCycles(node, visited = new Set(), path = []) {
    if (visited.has(node)) {
      // Found cycle
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart).concat(node);
        circular.push(cycle);
      }
      return;
    }
    
    visited.add(node);
    path.push(node);
    
    const dependencies = graph[node]?.dependencies || [];
    for (const dep of dependencies) {
      detectCycles(dep, new Set([...visited]), [...path]);
    }
  }
  
  // Check each node
  Object.keys(graph).forEach(node => {
    detectCycles(node);
  });
  
  return circular;
}

/**
 * Apply fixes to a file
 */
function applyFixes(filePath, issues) {
  if (config.dryRun) {
    console.log(chalk.yellow(`[DRY RUN] Would fix ${issues.length} issues in ${filePath}`));
    return true;
  }
  
  // Create backup
  const backupPath = path.join(config.backupDir, `${path.basename(filePath)}.${Date.now()}.backup`);
  fs.copyFileSync(filePath, backupPath);
  if (config.verbose) {
    console.log(chalk.blue(`Created backup: ${backupPath}`));
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let ast;
    
    try {
      ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
      });
    } catch (error) {
      console.error(chalk.red(`Failed to parse ${filePath}: ${error.message}`));
      return false;
    }
    
    let modified = false;
    
    // Apply fixes by modifying the AST
    issues.forEach(issue => {
      if (!issue.fix || !issue.fix.automated) return;
      
      switch (issue.fix.type) {
        case 'remove-import':
          traverse(ast, {
            ImportDeclaration(path) {
              if (path.node.loc.start.line === issue.loc.start.line) {
                path.remove();
                modified = true;
              }
            }
          });
          break;
          
        case 'merge-imports':
          // Not implemented via AST
          break;
          
        case 'normalize-path':
          traverse(ast, {
            ImportDeclaration(path) {
              if (path.node.loc.start.line === issue.loc.start.line) {
                path.node.source.value = path.node.source.value.replace(/-/g, '_');
                modified = true;
              }
            }
          });
          break;
          
        case 'rename-export':
          traverse(ast, {
            ExportNamedDeclaration(path) {
              if (path.node.loc.start.line === issue.loc.start.line) {
                path.node.specifiers.forEach(specifier => {
                  if (specifier.exported && specifier.exported.name === issue.fix.oldName) {
                    specifier.exported.name = issue.fix.newName;
                    modified = true;
                  }
                });
              }
            }
          });
          break;
          
        case 'fix-default-exports':
          let foundFirst = false;
          traverse(ast, {
            ExportDefaultDeclaration(path) {
              if (!foundFirst) {
                foundFirst = true;
              } else {
                // Convert to named export
                const declaration = path.node.declaration;
                let name;
                
                if (t.isIdentifier(declaration)) {
                  name = declaration.name;
                  path.replaceWith(
                    t.exportNamedDeclaration(
                      null,
                      [t.exportSpecifier(declaration, t.identifier(name + 'Export'))],
                      null
                    )
                  );
                } else {
                  // For anonymous function/class, create variable first
                  name = 'anonymous' + Math.floor(Math.random() * 10000);
                  
                  const varDecl = t.variableDeclaration('const', [
                    t.variableDeclarator(t.identifier(name), declaration)
                  ]);
                  
                  path.replaceWithMultiple([
                    varDecl,
                    t.exportNamedDeclaration(
                      null,
                      [t.exportSpecifier(t.identifier(name), t.identifier(name + 'Export'))],
                      null
                    )
                  ]);
                }
                
                modified = true;
              }
            }
          });
          break;
          
        case 'remove-unused-import':
          traverse(ast, {
            ImportDeclaration(path) {
              if (path.node.loc.start.line === issue.loc.start.line) {
                // If it's the only import, remove the whole declaration
                if (path.node.specifiers.length === 1) {
                  path.remove();
                  modified = true;
                } else {
                  // Remove just this specific import
                  path.node.specifiers = path.node.specifiers.filter(specifier => {
                    if (t.isImportDefaultSpecifier(specifier) && issue.fix.importedName.isDefault) {
                      return specifier.local.name !== issue.fix.importedName.name;
                    } else if (t.isImportSpecifier(specifier) && !issue.fix.importedName.isDefault) {
                      return specifier.local.name !== issue.fix.importedName.name;
                    } else if (t.isImportNamespaceSpecifier(specifier) && issue.fix.importedName.isNamespace) {
                      return specifier.local.name !== issue.fix.importedName.name;
                    }
                    return true;
                  });
                  
                  modified = true;
                }
              }
            }
          });
          break;
      }
    });
    
    // Handle merge imports case separately
    const mergeImportsIssues = issues.filter(i => i.fix && i.fix.type === 'merge-imports');
    if (mergeImportsIssues.length > 0) {
      // This needs a manual approach, regenerate content and use regex
      content = fs.readFileSync(filePath, 'utf8');
      
      mergeImportsIssues.forEach(issue => {
        const source = issue.fix.imports[0].source;
        
        // Collect all import names
        const importedItems = {};
        issue.fix.imports.forEach(imp => {
          imp.importedNames.forEach(item => {
            if (item.isDefault) {
              importedItems.default = item.name;
            } else if (item.isNamespace) {
              importedItems.namespace = item.name;
            } else {
              importedItems[item.imported || item.name] = item.name;
            }
          });
        });
        
        // Create new import statement
        let newImport = 'import ';
        const parts = [];
        
        if (importedItems.default) {
          parts.push(importedItems.default);
        }
        
        if (importedItems.namespace) {
          parts.push(`* as ${importedItems.namespace}`);
        }
        
        const namedImports = Object.entries(importedItems)
          .filter(([key]) => key !== 'default' && key !== 'namespace')
          .map(([imported, local]) => imported === local ? imported : `${imported} as ${local}`);
        
        if (namedImports.length > 0) {
          parts.push(`{ ${namedImports.join(', ')} }`);
        }
        
        newImport += parts.join(', ') + ` from '${source}';`;
        
        // Remove all imports from this source
        const regex = new RegExp(`import [^;]+from ['"]${source}['"][;]\\n?`, 'g');
        const firstMatch = content.match(regex)[0];
        content = content.replace(regex, '');
        
        // Add the new combined import where the first one was
        content = content.replace(/^/, newImport + '\n');
        
        modified = true;
      });
    }
    
    if (modified) {
      // If AST was modified, generate new code
      if (ast) {
        const output = generate(ast);
        content = output.code;
      }
      
      // Write changes
      fs.writeFileSync(filePath, content);
      console.log(chalk.green(`Fixed ${issues.length} issues in ${filePath}`));
      
      // Validate the fixes
      try {
        // Syntax check
        execSync(`npx eslint --no-eslintrc --parser-options=jsx=true --parser=@babel/eslint-parser ${filePath}`, { stdio: 'pipe' });
        
        // Check if fixes work with tests
        if (!config.skipTests) {
          try {
            execSync('npm run test:once', { stdio: 'pipe' });
          } catch (error) {
            console.error(chalk.red(`Tests failed after fixing ${filePath}, restoring from backup`));
            fs.copyFileSync(backupPath, filePath);
            return false;
          }
        }
        
        console.log(chalk.green(`Validation passed for ${filePath}`));
        return true;
      } catch (error) {
        console.error(chalk.red(`Validation failed for ${filePath}, restoring from backup: ${error.message}`));
        fs.copyFileSync(backupPath, filePath);
        return false;
      }
    } else {
      console.log(chalk.yellow(`No changes needed for ${filePath}`));
      return true;
    }
  } catch (error) {
    console.error(chalk.red(`Error fixing ${filePath}: ${error.message}`));
    // Restore from backup
    try {
      fs.copyFileSync(backupPath, filePath);
    } catch (e) {
      console.error(chalk.red(`Failed to restore backup: ${e.message}`));
    }
    return false;
  }
}

/**
 * Generate HTML report
 */
function generateHtmlReport(results, circularDeps) {
  const reportPath = config.outputFile.replace('.json', '.html');
  
  // Count issues by type
  const issueTypes = {};
  let totalIssues = 0;
  let filesWithIssues = 0;
  
  results.forEach(result => {
    if (result.issues.length > 0) {
      filesWithIssues++;
      
      result.issues.forEach(issue => {
        if (!issueTypes[issue.type]) {
          issueTypes[issue.type] = 0;
        }
        issueTypes[issue.type]++;
        totalIssues++;
      });
    }
  });
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Import/Export Analysis Report</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 0; padding: 20px; }
    .header { margin-bottom: 20px; }
    .summary { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px; }
    .summary-item { flex: 1; min-width: 200px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .summary-item.error { background: #ffebee; }
    .summary-item.warning { background: #fff8e1; }
    .circular { background: #fce4ec; padding: 15px; border-radius: 5px; margin-bottom: 30px; }
    .file { margin-bottom: 20px; }
    .file-header { background: #f5f5f5; padding: 10px; cursor: pointer; }
    .issue { padding: 10px; border-left: 3px solid #ddd; margin: 10px 0; }
    .issue.error { border-left-color: #f44336; }
    .issue.warning { border-left-color: #ff9800; }
    .fix { background: #e8f5e9; padding: 10px; margin-top: 10px; border-radius: 5px; }
    code { font-family: monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Import/Export Analysis Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <div class="summary-item">
      <h3>Total Issues</h3>
      <div>${totalIssues}</div>
    </div>
    <div class="summary-item">
      <h3>Files with Issues</h3>
      <div>${filesWithIssues}</div>
    </div>
    ${Object.entries(issueTypes).map(([type, count]) => `
      <div class="summary-item ${type.includes('error') ? 'error' : 'warning'}">
        <h3>${type}</h3>
        <div>${count}</div>
      </div>
    `).join('')}
  </div>
  
  ${circularDeps.length > 0 ? `
    <div class="circular">
      <h2>Circular Dependencies (${circularDeps.length})</h2>
      <ul>
        ${circularDeps.map(cycle => `
          <li>
            <code>${cycle.join(' → ')}</code>
          </li>
        `).join('')}
      </ul>
    </div>
  ` : ''}
  
  <h2>Issues by File</h2>
  ${results.filter(r => r.issues.length > 0).map(result => `
    <div class="file">
      <div class="file-header" onclick="toggleFile('${Buffer.from(result.filePath).toString('base64')}')">
        <h3>${result.filePath} (${result.issues.length} issues)</h3>
      </div>
      <div id="${Buffer.from(result.filePath).toString('base64')}" class="issues hidden">
        ${result.issues.map(issue => `
          <div class="issue ${issue.severity}">
            <div><strong>${issue.type}</strong> - Line ${issue.loc?.start.line || 'N/A'}</div>
            <div>${issue.message}</div>
            ${issue.fix ? `
              <div class="fix">
                <strong>Suggested Fix:</strong> ${issue.fix.description}
                ${issue.fix.automated ? '<span>(Automated)</span>' : '<span>(Manual)</span>'}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
  
  <script>
    function toggleFile(id) {
      const element = document.getElementById(id);
      element.classList.toggle('hidden');
    }
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(chalk.blue(`HTML report saved to ${reportPath}`));
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('🔍 Analyzing imports and exports...'));
  
  // Find JS/JSX files
  const files = findJsFiles(config.rootDir);
  console.log(chalk.blue(`Found ${files.length} JS/JSX files`));
  
  // Create module map
  const moduleMap = {};
  const results = [];
  
  // Analyze files
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (config.verbose || i % 100 === 0) {
      console.log(chalk.blue(`Analyzing file ${i+1}/${files.length}: ${file}`));
    }
    
    try {
      const result = analyzeImportsExports(file, moduleMap);
      results.push({ filePath: file, ...result });
    } catch (error) {
      console.error(chalk.red(`Error analyzing ${file}: ${error.message}`));
      results.push({ 
        filePath: file, 
        imports: [], 
        exports: [], 
        issues: [{
          type: 'analysis-error',
          severity: 'error',
          message: `Failed to analyze file: ${error.message}`
        }]
      });
    }
  }
  
  // Create dependency graph
  console.log(chalk.blue('Creating dependency graph...'));
  const graph = createDependencyGraph(moduleMap);
  
  // Find circular dependencies
  console.log(chalk.blue('Finding circular dependencies...'));
  const circularDeps = findCircularDependencies(graph);
  
  if (circularDeps.length > 0) {
    console.log(chalk.yellow(`\nFound ${circularDeps.length} circular dependencies:`));
    circularDeps.forEach((cycle, i) => {
      console.log(chalk.yellow(`  ${i+1}. ${cycle.join(' → ')}`));
    });
  } else {
    console.log(chalk.green('No circular dependencies found!'));
  }
  
  // Count issues
  let totalIssues = 0;
  let fixableIssues = 0;
  
  results.forEach(result => {
    totalIssues += result.issues.length;
    fixableIssues += result.issues.filter(i => i.fix && i.fix.automated).length;
  });
  
  console.log(chalk.blue(`\nFound ${totalIssues} issues (${fixableIssues} automatically fixable)`));
  
  // Write report
  const outputDir = path.dirname(config.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(config.outputFile, JSON.stringify({ results, circularDeps }, null, 2));
  
  // Generate HTML report
  generateHtmlReport(results, circularDeps);
  
  // Apply fixes
  if (fixableIssues > 0) {
    console.log(chalk.blue('\nApplying fixes...'));
    
    let fixedCount = 0;
    let errorCount = 0;
    
    // Process files with issues
    for (const result of results.filter(r => r.issues.length > 0)) {
      const fixableIssues = result.issues.filter(i => i.fix && i.fix.automated);
      
      if (fixableIssues.length > 0) {
        console.log(chalk.blue(`Fixing ${fixableIssues.length} issues in ${result.filePath}`));
        
        if (applyFixes(result.filePath, fixableIssues)) {
          fixedCount++;
        } else {
          errorCount++;
        }
      }
    }
    
    // Print summary
    console.log(chalk.blue('\n=== Import/Export Fix Summary ==='));
    console.log(`Total files with issues: ${results.filter(r => r.issues.length > 0).length}`);
    console.log(`Files fixed: ${fixedCount}`);
    console.log(`Files with errors: ${errorCount}`);
  }
}

// Run main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});