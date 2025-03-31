/**
 * Babel plugin to replace HTML entities in JSX attributes and string literals
 * Using CommonJS format for compatibility with Babel plugin system
 * Simplified version without AST manipulation
 */

module.exports = function() {
  return {
    name: 'transform-html-entities',
    visitor: {
      StringLiteral(path) {
        // Transform HTML entities in string literals
        const value = path.node.value;
        if (value && (
          value.includes("'") || 
          value.includes('"') ||
          value.includes('&') ||
          value.includes('<') ||
          value.includes('>')
        )) {
          const newValue = value
            .replace(/'/g, "'")
            .replace(/"/g, '"')
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>');
          
          path.node.value = newValue;
        }
      },
      JSXAttribute(path) {
        // Transform HTML entities in JSX attribute values
        const value = path.node.value;
        if (value && value.type === 'StringLiteral') {
          const stringValue = value.value;
          if (stringValue && (
            stringValue.includes("'") || 
            stringValue.includes('"') ||
            stringValue.includes('&') ||
            stringValue.includes('<') ||
            stringValue.includes('>')
          )) {
            const newValue = stringValue
              .replace(/'/g, "'")
              .replace(/"/g, '"')
              .replace(/&/g, '&')
              .replace(/</g, '<')
              .replace(/>/g, '>');
            
            value.value = newValue;
          }
        }
      }
    }
  };
};