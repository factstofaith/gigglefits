/**
 * API Documentation Generator
 * 
 * Automatic API documentation generator for React components, hooks, and utilities.
 * Part of the zero technical debt documentation implementation.
 * 
 * @module utils/docs/apiDocGenerator
 */

/**
 * Component documentation metadata format
 * 
 * @typedef {Object} ComponentDocMeta
 * @property {string} name - Component name
 * @property {string} description - Component description
 * @property {string} category - Component category
 * @property {Array<PropDoc>} props - Component props
 * @property {Array<string>} examples - Usage examples
 * @property {string} filepath - Component file path
 */

/**
 * Prop documentation format
 * 
 * @typedef {Object} PropDoc
 * @property {string} name - Prop name
 * @property {string} type - Prop type
 * @property {boolean} required - Whether the prop is required
 * @property {string} description - Prop description
 * @property {*} defaultValue - Default value for the prop
 */

/**
 * Hook documentation metadata format
 * 
 * @typedef {Object} HookDocMeta
 * @property {string} name - Hook name
 * @property {string} description - Hook description
 * @property {string} category - Hook category
 * @property {Array<ParamDoc>} params - Hook parameters
 * @property {ReturnDoc} returns - Hook return value
 * @property {Array<string>} examples - Usage examples
 * @property {string} filepath - Hook file path
 */

/**
 * Parameter documentation format
 * 
 * @typedef {Object} ParamDoc
 * @property {string} name - Parameter name
 * @property {string} type - Parameter type
 * @property {boolean} required - Whether the parameter is required
 * @property {string} description - Parameter description
 * @property {*} defaultValue - Default value for the parameter
 */

/**
 * Return value documentation format
 * 
 * @typedef {Object} ReturnDoc
 * @property {string} type - Return value type
 * @property {string} description - Return value description
 */

/**
 * Utility documentation metadata format
 * 
 * @typedef {Object} UtilityDocMeta
 * @property {string} name - Utility name
 * @property {string} description - Utility description
 * @property {string} category - Utility category
 * @property {Array<FunctionDoc>} functions - Utility functions
 * @property {Array<string>} examples - Usage examples
 * @property {string} filepath - Utility file path
 */

/**
 * Function documentation format
 * 
 * @typedef {Object} FunctionDoc
 * @property {string} name - Function name
 * @property {string} description - Function description
 * @property {Array<ParamDoc>} params - Function parameters
 * @property {ReturnDoc} returns - Function return value
 * @property {Array<string>} examples - Usage examples
 */

// Stores component documentation metadata
const componentDocs = {};

// Stores hook documentation metadata
const hookDocs = {};

// Stores utility documentation metadata
const utilityDocs = {};

/**
 * Register component documentation metadata
 * 
 * @param {ComponentDocMeta} metadata - Component documentation metadata
 */
export const registerComponent = (metadata) => {
  if (!metadata.name) {
    console.warn('Component documentation missing name property');
    return;
  }
  
  componentDocs[metadata.name] = {
    ...metadata,
    type: 'component',
    timestamp: new Date().toISOString()
  };
};

/**
 * Register hook documentation metadata
 * 
 * @param {HookDocMeta} metadata - Hook documentation metadata
 */
export const registerHook = (metadata) => {
  if (!metadata.name) {
    console.warn('Hook documentation missing name property');
    return;
  }
  
  hookDocs[metadata.name] = {
    ...metadata,
    type: 'hook',
    timestamp: new Date().toISOString()
  };
};

/**
 * Register utility documentation metadata
 * 
 * @param {UtilityDocMeta} metadata - Utility documentation metadata
 */
export const registerUtility = (metadata) => {
  if (!metadata.name) {
    console.warn('Utility documentation missing name property');
    return;
  }
  
  utilityDocs[metadata.name] = {
    ...metadata,
    type: 'utility',
    timestamp: new Date().toISOString()
  };
};

/**
 * Get all registered component documentation
 * 
 * @returns {Object} All component documentation
 */
export const getAllComponentDocs = () => {
  return { ...componentDocs };
};

/**
 * Get all registered hook documentation
 * 
 * @returns {Object} All hook documentation
 */
export const getAllHookDocs = () => {
  return { ...hookDocs };
};

/**
 * Get all registered utility documentation
 * 
 * @returns {Object} All utility documentation
 */
export const getAllUtilityDocs = () => {
  return { ...utilityDocs };
};

/**
 * Get component documentation by name
 * 
 * @param {string} name - Component name
 * @returns {ComponentDocMeta|undefined} Component documentation
 */
export const getComponentDoc = (name) => {
  return componentDocs[name];
};

/**
 * Get hook documentation by name
 * 
 * @param {string} name - Hook name
 * @returns {HookDocMeta|undefined} Hook documentation
 */
export const getHookDoc = (name) => {
  return hookDocs[name];
};

/**
 * Get utility documentation by name
 * 
 * @param {string} name - Utility name
 * @returns {UtilityDocMeta|undefined} Utility documentation
 */
export const getUtilityDoc = (name) => {
  return utilityDocs[name];
};

/**
 * Search documentation by keyword
 * 
 * @param {string} keyword - Search keyword
 * @returns {Array} Matching documentation items
 */
export const searchDocs = (keyword) => {
  if (!keyword) return [];
  
  const results = [];
  const searchRegex = new RegExp(keyword, 'i');
  
  // Search components
  Object.values(componentDocs).forEach(doc => {
    if (
      searchRegex.test(doc.name) ||
      searchRegex.test(doc.description) ||
      searchRegex.test(doc.category)
    ) {
      results.push(doc);
    }
  });
  
  // Search hooks
  Object.values(hookDocs).forEach(doc => {
    if (
      searchRegex.test(doc.name) ||
      searchRegex.test(doc.description) ||
      searchRegex.test(doc.category)
    ) {
      results.push(doc);
    }
  });
  
  // Search utilities
  Object.values(utilityDocs).forEach(doc => {
    if (
      searchRegex.test(doc.name) ||
      searchRegex.test(doc.description) ||
      searchRegex.test(doc.category)
    ) {
      results.push(doc);
    }
  });
  
  return results;
};

/**
 * Generate markdown documentation for a component
 * 
 * @param {string} componentName - Component name
 * @returns {string} Generated markdown documentation
 */
export const generateComponentMarkdown = (componentName) => {
  const doc = getComponentDoc(componentName);
  if (!doc) return `Component '${componentName}' not found in documentation registry`;
  
  let markdown = `# ${doc.name}\n\n`;
  markdown += `${doc.description}\n\n`;
  
  if (doc.category) {
    markdown += `**Category:** ${doc.category}\n\n`;
  }
  
  // Props table
  if (doc.props && doc.props.length > 0) {
    markdown += `## Props\n\n`;
    markdown += `| Name | Type | Required | Default | Description |\n`;
    markdown += `| ---- | ---- | -------- | ------- | ----------- |\n`;
    
    doc.props.forEach(prop => {
      const defaultValue = typeof prop.defaultValue !== 'undefined' 
        ? `\`${String(prop.defaultValue)}\`` 
        : '-';
      
      markdown += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${defaultValue} | ${prop.description} |\n`;
    });
    
    markdown += '\n';
  }
  
  // Examples
  if (doc.examples && doc.examples.length > 0) {
    markdown += `## Examples\n\n`;
    
    doc.examples.forEach((example, index) => {
      markdown += `### Example ${index + 1}\n\n`;
      markdown += "```jsx\n";
      markdown += example + "\n";
      markdown += "```\n\n";
    });
  }
  
  // File info
  if (doc.filepath) {
    markdown += `---\n\n`;
    markdown += `Defined in: \`${doc.filepath}\`\n`;
  }
  
  return markdown;
};

/**
 * Generate markdown documentation for a hook
 * 
 * @param {string} hookName - Hook name
 * @returns {string} Generated markdown documentation
 */
export const generateHookMarkdown = (hookName) => {
  const doc = getHookDoc(hookName);
  if (!doc) return `Hook '${hookName}' not found in documentation registry`;
  
  let markdown = `# ${doc.name}\n\n`;
  markdown += `${doc.description}\n\n`;
  
  if (doc.category) {
    markdown += `**Category:** ${doc.category}\n\n`;
  }
  
  // Parameters
  if (doc.params && doc.params.length > 0) {
    markdown += `## Parameters\n\n`;
    markdown += `| Name | Type | Required | Default | Description |\n`;
    markdown += `| ---- | ---- | -------- | ------- | ----------- |\n`;
    
    doc.params.forEach(param => {
      const defaultValue = typeof param.defaultValue !== 'undefined' 
        ? `\`${String(param.defaultValue)}\`` 
        : '-';
      
      markdown += `| \`${param.name}\` | \`${param.type}\` | ${param.required ? 'Yes' : 'No'} | ${defaultValue} | ${param.description} |\n`;
    });
    
    markdown += '\n';
  }
  
  // Return value
  if (doc.returns) {
    markdown += `## Returns\n\n`;
    markdown += `**Type:** \`${doc.returns.type}\`\n\n`;
    markdown += `${doc.returns.description}\n\n`;
  }
  
  // Examples
  if (doc.examples && doc.examples.length > 0) {
    markdown += `## Examples\n\n`;
    
    doc.examples.forEach((example, index) => {
      markdown += `### Example ${index + 1}\n\n`;
      markdown += "```jsx\n";
      markdown += example + "\n";
      markdown += "```\n\n";
    });
  }
  
  // File info
  if (doc.filepath) {
    markdown += `---\n\n`;
    markdown += `Defined in: \`${doc.filepath}\`\n`;
  }
  
  return markdown;
};

/**
 * Generate markdown documentation for a utility
 * 
 * @param {string} utilityName - Utility name
 * @returns {string} Generated markdown documentation
 */
export const generateUtilityMarkdown = (utilityName) => {
  const doc = getUtilityDoc(utilityName);
  if (!doc) return `Utility '${utilityName}' not found in documentation registry`;
  
  let markdown = `# ${doc.name}\n\n`;
  markdown += `${doc.description}\n\n`;
  
  if (doc.category) {
    markdown += `**Category:** ${doc.category}\n\n`;
  }
  
  // Functions
  if (doc.functions && doc.functions.length > 0) {
    markdown += `## Functions\n\n`;
    
    doc.functions.forEach(func => {
      markdown += `### ${func.name}\n\n`;
      markdown += `${func.description}\n\n`;
      
      // Parameters
      if (func.params && func.params.length > 0) {
        markdown += `#### Parameters\n\n`;
        markdown += `| Name | Type | Required | Default | Description |\n`;
        markdown += `| ---- | ---- | -------- | ------- | ----------- |\n`;
        
        func.params.forEach(param => {
          const defaultValue = typeof param.defaultValue !== 'undefined' 
            ? `\`${String(param.defaultValue)}\`` 
            : '-';
          
          markdown += `| \`${param.name}\` | \`${param.type}\` | ${param.required ? 'Yes' : 'No'} | ${defaultValue} | ${param.description} |\n`;
        });
        
        markdown += '\n';
      }
      
      // Return value
      if (func.returns) {
        markdown += `#### Returns\n\n`;
        markdown += `**Type:** \`${func.returns.type}\`\n\n`;
        markdown += `${func.returns.description}\n\n`;
      }
      
      // Examples
      if (func.examples && func.examples.length > 0) {
        markdown += `#### Examples\n\n`;
        
        func.examples.forEach((example, index) => {
          markdown += "```js\n";
          markdown += example + "\n";
          markdown += "```\n\n";
        });
      }
      
      markdown += '\n';
    });
  }
  
  // General examples
  if (doc.examples && doc.examples.length > 0) {
    markdown += `## Examples\n\n`;
    
    doc.examples.forEach((example, index) => {
      markdown += `### Example ${index + 1}\n\n`;
      markdown += "```js\n";
      markdown += example + "\n";
      markdown += "```\n\n";
    });
  }
  
  // File info
  if (doc.filepath) {
    markdown += `---\n\n`;
    markdown += `Defined in: \`${doc.filepath}\`\n`;
  }
  
  return markdown;
};

/**
 * Generate HTML documentation from markdown
 * 
 * @param {string} markdown - Markdown content
 * @returns {string} Generated HTML documentation
 */
export const generateHtmlFromMarkdown = (markdown) => {
  // Very simple markdown to HTML conversion
  // In a real implementation, use a markdown parser like marked
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4 { 
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    h1 { border-bottom: 2px solid #eaecef; padding-bottom: 0.3em; }
    h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    th, td {
      text-align: left;
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f6f8fa;
    }
    code {
      background-color: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
    }
    pre {
      background-color: #f6f8fa;
      padding: 16px;
      overflow: auto;
      border-radius: 3px;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    .category {
      display: inline-block;
      padding: 0.2em 0.5em;
      background-color: #eef2ff;
      border-radius: 3px;
      font-size: 0.9em;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>`;

  // Replace headings
  html += markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    // Replace code blocks
    .replace(/```(.+?)\n([\s\S]+?)\n```/g, '<pre><code>$2</code></pre>')
    // Replace inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Replace tables (simple version, not handling all markdown table features)
    .replace(/\|(.+?)\|\n\|(.+?)\|\n((?:\|.+?\|\n)+)/g, (match, header, separator, rows) => {
      let tableHtml = '<table>\n<thead>\n<tr>';
      
      // Extract header cells
      header.split('|').forEach(cell => {
        if (cell.trim()) {
          tableHtml += `<th>${cell.trim()}</th>`;
        }
      });
      
      tableHtml += '</tr>\n</thead>\n<tbody>\n';
      
      // Extract rows
      rows.split('\n').forEach(row => {
        if (row.trim()) {
          tableHtml += '<tr>';
          row.split('|').forEach(cell => {
            if (cell.trim() || cell.trim() === '') {
              tableHtml += `<td>${cell.trim()}</td>`;
            }
          });
          tableHtml += '</tr>\n';
        }
      });
      
      tableHtml += '</tbody>\n</table>';
      return tableHtml;
    })
    // Replace category
    .replace(/\*\*Category:\*\* (.+)/, '<div class="category">$1</div>')
    // Replace paragraphs
    .replace(/^([^<#\|].+)$/gm, '<p>$1</p>')
    // Replace horizontal rules
    .replace(/^---$/gm, '<hr>');

  html += `</body>
</html>`;

  return html;
};

/**
 * Generate a comprehensive API documentation page for all registered items
 * 
 * @returns {string} Generated HTML documentation
 */
export const generateApiDocumentation = () => {
  let markdown = `# API Documentation\n\n`;
  
  // Components
  const componentList = Object.values(componentDocs);
  if (componentList.length > 0) {
    markdown += `## Components\n\n`;
    
    // Group by category
    const componentsByCategory = {};
    componentList.forEach(component => {
      const category = component.category || 'Uncategorized';
      if (!componentsByCategory[category]) {
        componentsByCategory[category] = [];
      }
      componentsByCategory[category].push(component);
    });
    
    // Generate component list by category
    Object.entries(componentsByCategory).forEach(([category, components]) => {
      markdown += `### ${category}\n\n`;
      
      components.forEach(component => {
        markdown += `- [${component.name}](#component-${component.name.toLowerCase()}) - ${component.description}\n`;
      });
      
      markdown += '\n';
    });
  }
  
  // Hooks
  const hookList = Object.values(hookDocs);
  if (hookList.length > 0) {
    markdown += `## Hooks\n\n`;
    
    // Group by category
    const hooksByCategory = {};
    hookList.forEach(hook => {
      const category = hook.category || 'Uncategorized';
      if (!hooksByCategory[category]) {
        hooksByCategory[category] = [];
      }
      hooksByCategory[category].push(hook);
    });
    
    // Generate hook list by category
    Object.entries(hooksByCategory).forEach(([category, hooks]) => {
      markdown += `### ${category}\n\n`;
      
      hooks.forEach(hook => {
        markdown += `- [${hook.name}](#hook-${hook.name.toLowerCase()}) - ${hook.description}\n`;
      });
      
      markdown += '\n';
    });
  }
  
  // Utilities
  const utilityList = Object.values(utilityDocs);
  if (utilityList.length > 0) {
    markdown += `## Utilities\n\n`;
    
    // Group by category
    const utilitiesByCategory = {};
    utilityList.forEach(utility => {
      const category = utility.category || 'Uncategorized';
      if (!utilitiesByCategory[category]) {
        utilitiesByCategory[category] = [];
      }
      utilitiesByCategory[category].push(utility);
    });
    
    // Generate utility list by category
    Object.entries(utilitiesByCategory).forEach(([category, utilities]) => {
      markdown += `### ${category}\n\n`;
      
      utilities.forEach(utility => {
        markdown += `- [${utility.name}](#utility-${utility.name.toLowerCase()}) - ${utility.description}\n`;
      });
      
      markdown += '\n';
    });
  }
  
  // Detailed documentation
  markdown += `## Detailed Documentation\n\n`;
  
  // Component details
  componentList.forEach(component => {
    markdown += `<a id="component-${component.name.toLowerCase()}"></a>\n\n`;
    markdown += generateComponentMarkdown(component.name).split('\n').slice(1).join('\n');
    markdown += '\n\n---\n\n';
  });
  
  // Hook details
  hookList.forEach(hook => {
    markdown += `<a id="hook-${hook.name.toLowerCase()}"></a>\n\n`;
    markdown += generateHookMarkdown(hook.name).split('\n').slice(1).join('\n');
    markdown += '\n\n---\n\n';
  });
  
  // Utility details
  utilityList.forEach(utility => {
    markdown += `<a id="utility-${utility.name.toLowerCase()}"></a>\n\n`;
    markdown += generateUtilityMarkdown(utility.name).split('\n').slice(1).join('\n');
    markdown += '\n\n---\n\n';
  });
  
  return generateHtmlFromMarkdown(markdown);
};

/**
 * Extract documentation from JSDoc comments in source code
 * 
 * @param {string} sourceCode - Source code to parse
 * @param {string} filePath - Path to the source file
 * @returns {Array} Extracted documentation metadata
 */
export const extractDocsFromSource = (sourceCode, filePath) => {
  // This is a simplified implementation
  // In a real implementation, use a JSDoc parser
  
  const docItems = [];
  
  // Look for component definitions
  const componentMatch = sourceCode.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:export\s+)?(?:const|function)\s+([A-Z][A-Za-z0-9_]*)/g);
  
  if (componentMatch) {
    componentMatch.forEach(match => {
      const nameMatch = match.match(/(?:export\s+)?(?:const|function)\s+([A-Z][A-Za-z0-9_]*)/);
      const descMatch = match.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
      
      if (nameMatch && descMatch) {
        const name = nameMatch[1];
        const jsdoc = descMatch[1];
        
        // Extract description
        const description = jsdoc.replace(/\*\s*@[a-z]+.*$/gm, '')
          .replace(/^\s*\*\s*/gm, '')
          .trim();
        
        // Extract category
        const categoryMatch = jsdoc.match(/@category\s+(.+)$/m);
        const category = categoryMatch ? categoryMatch[1].trim() : 'Components';
        
        // Extract props from propTypes
        const propsMatch = sourceCode.match(new RegExp(`${name}\\.propTypes\\s*=\\s*{([\\s\\S]*?)};`));
        const props = [];
        
        if (propsMatch) {
          const propTypesBlock = propsMatch[1];
          const propMatches = propTypesBlock.match(/([a-zA-Z0-9_]+):\s*PropTypes\.[a-zA-Z]+[^,}]*/g);
          
          if (propMatches) {
            propMatches.forEach(propMatch => {
              const propNameMatch = propMatch.match(/([a-zA-Z0-9_]+):/);
              const propTypeMatch = propMatch.match(/PropTypes\.([a-zA-Z]+)/);
              const isRequiredMatch = propMatch.includes('.isRequired');
              
              if (propNameMatch && propTypeMatch) {
                props.push({
                  name: propNameMatch[1],
                  type: propTypeMatch[1],
                  required: isRequiredMatch,
                  description: `Property ${propNameMatch[1]} of type ${propTypeMatch[1]}`,
                  defaultValue: undefined
                });
              }
            });
          }
        }
        
        // Look for defaultProps
        const defaultPropsMatch = sourceCode.match(new RegExp(`${name}\\.defaultProps\\s*=\\s*{([\\s\\S]*?)};`));
        
        if (defaultPropsMatch) {
          const defaultPropsBlock = defaultPropsMatch[1];
          const defaultPropMatches = defaultPropsBlock.match(/([a-zA-Z0-9_]+):\s*([^,}]*)/g);
          
          if (defaultPropMatches) {
            defaultPropMatches.forEach(defaultPropMatch => {
              const propNameMatch = defaultPropMatch.match(/([a-zA-Z0-9_]+):/);
              const propValueMatch = defaultPropMatch.match(/:\s*([^,}]*)/);
              
              if (propNameMatch && propValueMatch) {
                const propName = propNameMatch[1];
                const propValue = propValueMatch[1].trim();
                
                // Find the prop and update the defaultValue
                const prop = props.find(p => p.name === propName);
                if (prop) {
                  prop.defaultValue = propValue;
                }
              }
            });
          }
        }
        
        // Look for examples in comments
        const examples = [];
        const exampleMatches = jsdoc.match(/@example\s*\n([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/)/g);
        
        if (exampleMatches) {
          exampleMatches.forEach(exampleMatch => {
            const example = exampleMatch
              .replace(/@example\s*\n/g, '')
              .replace(/^\s*\*\s*/gm, '')
              .trim();
            
            examples.push(example);
          });
        }
        
        // Register component documentation
        docItems.push({
          type: 'component',
          name,
          description,
          category,
          props,
          examples,
          filepath: filePath
        });
      }
    });
  }
  
  // Look for hook definitions
  const hookMatch = sourceCode.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:export\s+)?(?:const|function)\s+(use[A-Z][A-Za-z0-9_]*)/g);
  
  if (hookMatch) {
    hookMatch.forEach(match => {
      const nameMatch = match.match(/(?:export\s+)?(?:const|function)\s+(use[A-Z][A-Za-z0-9_]*)/);
      const descMatch = match.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
      
      if (nameMatch && descMatch) {
        const name = nameMatch[1];
        const jsdoc = descMatch[1];
        
        // Extract description
        const description = jsdoc.replace(/\*\s*@[a-z]+.*$/gm, '')
          .replace(/^\s*\*\s*/gm, '')
          .trim();
        
        // Extract category
        const categoryMatch = jsdoc.match(/@category\s+(.+)$/m);
        const category = categoryMatch ? categoryMatch[1].trim() : 'Hooks';
        
        // Extract parameters
        const params = [];
        const paramMatches = jsdoc.match(/@param\s+{([^}]+)}\s+(\[?[a-zA-Z0-9_.]+\]?)\s+(.*?)(?=\n\s*\*\s*@|\n\s*\*\/)/g);
        
        if (paramMatches) {
          paramMatches.forEach(paramMatch => {
            const paramTypeMatch = paramMatch.match(/@param\s+{([^}]+)}/);
            const paramNameMatch = paramMatch.match(/@param\s+{[^}]+}\s+(\[?[a-zA-Z0-9_.]+\]?)/);
            const paramDescMatch = paramMatch.match(/@param\s+{[^}]+}\s+\[?[a-zA-Z0-9_.]+\]?\s+(.*?)(?=\n\s*\*\s*@|\n\s*\*\/)/);
            
            if (paramTypeMatch && paramNameMatch) {
              const isRequired = !paramNameMatch[1].startsWith('[');
              const name = paramNameMatch[1].replace(/^\[|\]$/g, '');
              
              params.push({
                name,
                type: paramTypeMatch[1],
                required: isRequired,
                description: paramDescMatch ? paramDescMatch[1].trim() : `Parameter ${name}`,
                defaultValue: undefined
              });
            }
          });
        }
        
        // Extract return value
        let returns = null;
        const returnMatch = jsdoc.match(/@returns\s+{([^}]+)}\s+(.*?)(?=\n\s*\*\s*@|\n\s*\*\/)/);
        
        if (returnMatch) {
          returns = {
            type: returnMatch[1],
            description: returnMatch[2].trim()
          };
        }
        
        // Look for examples in comments
        const examples = [];
        const exampleMatches = jsdoc.match(/@example\s*\n([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/)/g);
        
        if (exampleMatches) {
          exampleMatches.forEach(exampleMatch => {
            const example = exampleMatch
              .replace(/@example\s*\n/g, '')
              .replace(/^\s*\*\s*/gm, '')
              .trim();
            
            examples.push(example);
          });
        }
        
        // Register hook documentation
        docItems.push({
          type: 'hook',
          name,
          description,
          category,
          params,
          returns,
          examples,
          filepath: filePath
        });
      }
    });
  }
  
  // Look for utility definitions (exported functions)
  const utilityModuleMatch = sourceCode.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:export\s+)?const\s+([a-zA-Z][A-Za-z0-9_]*)\s*=\s*{/);
  
  if (utilityModuleMatch) {
    const moduleName = utilityModuleMatch[2];
    const moduleJsdoc = utilityModuleMatch[1];
    
    // Extract description
    const moduleDescription = moduleJsdoc
      .replace(/\*\s*@[a-z]+.*$/gm, '')
      .replace(/^\s*\*\s*/gm, '')
      .trim();
    
    // Extract category
    const moduleCategoryMatch = moduleJsdoc.match(/@category\s+(.+)$/m);
    const moduleCategory = moduleCategoryMatch ? moduleCategoryMatch[1].trim() : 'Utilities';
    
    // Look for exported functions
    const functions = [];
    const functionMatches = sourceCode.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:export\s+)?(?:const|function)\s+([a-z][A-Za-z0-9_]*)\s*=/g);
    
    if (functionMatches) {
      functionMatches.forEach(funcMatch => {
        const funcNameMatch = funcMatch.match(/(?:export\s+)?(?:const|function)\s+([a-z][A-Za-z0-9_]*)/);
        const funcDescMatch = funcMatch.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
        
        if (funcNameMatch && funcDescMatch) {
          const name = funcNameMatch[1];
          const jsdoc = funcDescMatch[1];
          
          // Extract description
          const description = jsdoc
            .replace(/\*\s*@[a-z]+.*$/gm, '')
            .replace(/^\s*\*\s*/gm, '')
            .trim();
          
          // Extract parameters
          const params = [];
          const paramMatches = jsdoc.match(/@param\s+{([^}]+)}\s+(\[?[a-zA-Z0-9_.]+\]?)\s+(.*?)(?=\n\s*\*\s*@|\n\s*\*\/)/g);
          
          if (paramMatches) {
            paramMatches.forEach(paramMatch => {
              const paramTypeMatch = paramMatch.match(/@param\s+{([^}]+)}/);
              const paramNameMatch = paramMatch.match(/@param\s+{[^}]+}\s+(\[?[a-zA-Z0-9_.]+\]?)/);
              const paramDescMatch = paramMatch.match(/@param\s+{[^}]+}\s+\[?[a-zA-Z0-9_.]+\]?\s+(.*?)(?=\n\s*\*\s*@|\n\s*\*\/)/);
              
              if (paramTypeMatch && paramNameMatch) {
                const isRequired = !paramNameMatch[1].startsWith('[');
                const name = paramNameMatch[1].replace(/^\[|\]$/g, '');
                
                params.push({
                  name,
                  type: paramTypeMatch[1],
                  required: isRequired,
                  description: paramDescMatch ? paramDescMatch[1].trim() : `Parameter ${name}`,
                  defaultValue: undefined
                });
              }
            });
          }
          
          // Extract return value
          let returns = null;
          const returnMatch = jsdoc.match(/@returns\s+{([^}]+)}\s+(.*?)(?=\n\s*\*\s*@|\n\s*\*\/)/);
          
          if (returnMatch) {
            returns = {
              type: returnMatch[1],
              description: returnMatch[2].trim()
            };
          }
          
          // Look for examples in comments
          const examples = [];
          const exampleMatches = jsdoc.match(/@example\s*\n([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/)/g);
          
          if (exampleMatches) {
            exampleMatches.forEach(exampleMatch => {
              const example = exampleMatch
                .replace(/@example\s*\n/g, '')
                .replace(/^\s*\*\s*/gm, '')
                .trim();
              
              examples.push(example);
            });
          }
          
          functions.push({
            name,
            description,
            params,
            returns,
            examples
          });
        }
      });
    }
    
    // Register utility documentation
    if (functions.length > 0) {
      docItems.push({
        type: 'utility',
        name: moduleName,
        description: moduleDescription,
        category: moduleCategory,
        functions,
        filepath: filePath
      });
    }
  }
  
  return docItems;
};

/**
 * Process all documentation items from source code and register them
 * 
 * @param {Array} docItems - Documentation items to process
 */
export const processDocsFromSource = (docItems) => {
  docItems.forEach(item => {
    switch (item.type) {
      case 'component':
        registerComponent(item);
        break;
      case 'hook':
        registerHook(item);
        break;
      case 'utility':
        registerUtility(item);
        break;
    }
  });
};

export default {
  registerComponent,
  registerHook,
  registerUtility,
  getComponentDoc,
  getHookDoc,
  getUtilityDoc,
  getAllComponentDocs,
  getAllHookDocs,
  getAllUtilityDocs,
  searchDocs,
  generateComponentMarkdown,
  generateHookMarkdown,
  generateUtilityMarkdown,
  generateHtmlFromMarkdown,
  generateApiDocumentation,
  extractDocsFromSource,
  processDocsFromSource
};