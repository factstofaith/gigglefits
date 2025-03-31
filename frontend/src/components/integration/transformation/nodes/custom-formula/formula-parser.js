/**
 * Formula Parser Module
 * 
 * Implements a comprehensive parser for the CustomFormula expression language
 * with abstract syntax tree (AST) generation and validation.
 * 
 * This module leverages our zero technical debt approach by implementing
 * an ideal parsing architecture without legacy constraints.
 */

// Token types for the lexer
export const TokenTypes = {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION',
  WHITESPACE: 'WHITESPACE',
  EOF: 'EOF'
};

// Operators with precedence
export const Operators = {
  '+': { precedence: 1, associativity: 'left' },
  '-': { precedence: 1, associativity: 'left' },
  '*': { precedence: 2, associativity: 'left' },
  '/': { precedence: 2, associativity: 'left' },
  '%': { precedence: 2, associativity: 'left' },
  '^': { precedence: 3, associativity: 'right' },
  '==': { precedence: 0, associativity: 'left' },
  '!=': { precedence: 0, associativity: 'left' },
  '>': { precedence: 0, associativity: 'left' },
  '<': { precedence: 0, associativity: 'left' },
  '>=': { precedence: 0, associativity: 'left' },
  '<=': { precedence: 0, associativity: 'left' },
  '&&': { precedence: -1, associativity: 'left' },
  '||': { precedence: -2, associativity: 'left' }
};

// Core AST node types that will be implemented
export const AstNodeTypes = {
  LITERAL: 'LITERAL',
  VARIABLE: 'VARIABLE',
  FUNCTION_CALL: 'FUNCTION_CALL',
  BINARY_OP: 'BINARY_OP',
  UNARY_OP: 'UNARY_OP',
  CONDITIONAL: 'CONDITIONAL',
  ARRAY_LITERAL: 'ARRAY_LITERAL',
  OBJECT_LITERAL: 'OBJECT_LITERAL',
  PROPERTY_ACCESS: 'PROPERTY_ACCESS'
};

/**
 * Tokenize a formula string into tokens
 * 
 * @param {string} formula - The formula to tokenize
 * @returns {Array} Array of tokens
 */
function tokenize(formula) {
  // Simple tokenizer implementation
  const tokens = [];
  let position = 0;
  
  while (position < formula.length) {
    let char = formula[position];
    
    // Skip whitespace
    if (/\s/.test(char)) {
      position++;
      continue;
    }
    
    // Parse numbers
    if (/[0-9]/.test(char)) {
      let value = '';
      let hasDot = false;
      
      while (position < formula.length && (/[0-9]/.test(formula[position]) || (!hasDot && formula[position] === '.'))) {
        if (formula[position] === '.') {
          hasDot = true;
        }
        value += formula[position];
        position++;
      }
      
      tokens.push({
        type: TokenTypes.NUMBER,
        value: hasDot ? parseFloat(value) : parseInt(value, 10),
        position: position - value.length
      });
      
      continue;
    }
    
    // Parse strings
    if (char === '"' || char === "'") {
      const quote = char;
      let value = '';
      position++; // Skip opening quote
      
      while (position < formula.length && formula[position] !== quote) {
        // Handle escape sequences
        if (formula[position] === '\\' && position + 1 < formula.length) {
          position++;
          if (formula[position] === 'n') value += '\n';
          else if (formula[position] === 't') value += '\t';
          else value += formula[position];
        } else {
          value += formula[position];
        }
        position++;
      }
      
      if (position < formula.length) {
        position++; // Skip closing quote
      } else {
        // Unterminated string error
        throw {
          message: `Unterminated string starting at position ${position - value.length - 1}`,
          position: position - value.length - 1
        };
      }
      
      tokens.push({
        type: TokenTypes.STRING,
        value: value,
        position: position - value.length - 2
      });
      
      continue;
    }
    
    // Parse identifiers (variable names, function names)
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      
      while (position < formula.length && /[a-zA-Z0-9_]/.test(formula[position])) {
        value += formula[position];
        position++;
      }
      
      tokens.push({
        type: TokenTypes.IDENTIFIER,
        value: value,
        position: position - value.length
      });
      
      continue;
    }
    
    // Parse operators
    if (/[+\-*\/%^=!<>&|]/.test(char)) {
      let value = char;
      position++;
      
      // Check for two-character operators
      if (position < formula.length) {
        const nextChar = formula[position];
        const twoCharOp = char + nextChar;
        
        if (['==', '!=', '>=', '<=', '&&', '||'].includes(twoCharOp)) {
          value = twoCharOp;
          position++;
        }
      }
      
      tokens.push({
        type: TokenTypes.OPERATOR,
        value: value,
        position: position - value.length
      });
      
      continue;
    }
    
    // Parse punctuation
    if (/[\(\),\.\[\]{}:]/.test(char)) {
      tokens.push({
        type: TokenTypes.PUNCTUATION,
        value: char,
        position: position
      });
      position++;
      continue;
    }
    
    // Unknown character
    throw {
      message: `Unexpected character '${char}' at position ${position}`,
      position
    };
  }
  
  // Add EOF token
  tokens.push({
    type: TokenTypes.EOF,
    position: formula.length
  });
  
  return tokens;
}

/**
 * Parse tokens into an abstract syntax tree (AST)
 * 
 * @param {Array} tokens - Array of tokens to parse
 * @returns {Object} AST representing the formula
 */
function parseTokens(tokens) {
  let current = 0;
  
  // Simple recursive descent parser
  function parseExpression() {
    return parseAssignment();
  }
  
  function parseAssignment() {
    return parseLogicalOr();
  }
  
  function parseLogicalOr() {
    let left = parseLogicalAnd();
    
    while (current < tokens.length && 
           tokens[current].type === TokenTypes.OPERATOR && 
           tokens[current].value === '||') {
      const operator = tokens[current].value;
      current++;
      const right = parseLogicalAnd();
      left = {
        type: AstNodeTypes.BINARY_OP,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseLogicalAnd() {
    let left = parseEquality();
    
    while (current < tokens.length && 
           tokens[current].type === TokenTypes.OPERATOR && 
           tokens[current].value === '&&') {
      const operator = tokens[current].value;
      current++;
      const right = parseEquality();
      left = {
        type: AstNodeTypes.BINARY_OP,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseEquality() {
    let left = parseComparison();
    
    while (current < tokens.length && 
           tokens[current].type === TokenTypes.OPERATOR && 
           ['==', '!='].includes(tokens[current].value)) {
      const operator = tokens[current].value;
      current++;
      const right = parseComparison();
      left = {
        type: AstNodeTypes.BINARY_OP,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseComparison() {
    let left = parseAdditive();
    
    while (current < tokens.length && 
           tokens[current].type === TokenTypes.OPERATOR && 
           ['<', '>', '<=', '>='].includes(tokens[current].value)) {
      const operator = tokens[current].value;
      current++;
      const right = parseAdditive();
      left = {
        type: AstNodeTypes.BINARY_OP,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseAdditive() {
    let left = parseMultiplicative();
    
    while (current < tokens.length && 
           tokens[current].type === TokenTypes.OPERATOR && 
           ['+', '-'].includes(tokens[current].value)) {
      const operator = tokens[current].value;
      current++;
      const right = parseMultiplicative();
      left = {
        type: AstNodeTypes.BINARY_OP,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseMultiplicative() {
    let left = parseExponential();
    
    while (current < tokens.length && 
           tokens[current].type === TokenTypes.OPERATOR && 
           ['*', '/', '%'].includes(tokens[current].value)) {
      const operator = tokens[current].value;
      current++;
      const right = parseExponential();
      left = {
        type: AstNodeTypes.BINARY_OP,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseExponential() {
    let left = parseUnary();
    
    while (current < tokens.length && 
           tokens[current].type === TokenTypes.OPERATOR && 
           tokens[current].value === '^') {
      const operator = tokens[current].value;
      current++;
      const right = parseUnary();
      left = {
        type: AstNodeTypes.BINARY_OP,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseUnary() {
    if (current < tokens.length && 
        tokens[current].type === TokenTypes.OPERATOR && 
        ['+', '-', '!'].includes(tokens[current].value)) {
      const operator = tokens[current].value;
      current++;
      const right = parseUnary();
      return {
        type: AstNodeTypes.UNARY_OP,
        operator,
        right
      };
    }
    
    return parsePrimary();
  }
  
  function parsePrimary() {
    const token = tokens[current];
    
    // Parse literals
    if (token.type === TokenTypes.NUMBER) {
      current++;
      return {
        type: AstNodeTypes.LITERAL,
        valueType: 'number',
        value: token.value
      };
    }
    
    if (token.type === TokenTypes.STRING) {
      current++;
      return {
        type: AstNodeTypes.LITERAL,
        valueType: 'string',
        value: token.value
      };
    }
    
    // Parse identifiers (either variables or function calls)
    if (token.type === TokenTypes.IDENTIFIER) {
      const identifier = token.value;
      current++;
      
      // Check if it's a function call
      if (current < tokens.length && 
          tokens[current].type === TokenTypes.PUNCTUATION && 
          tokens[current].value === '(') {
        return parseFunctionCall(identifier);
      }
      
      // Otherwise it's a variable
      return {
        type: AstNodeTypes.VARIABLE,
        name: identifier
      };
    }
    
    // Parse parenthesized expressions
    if (token.type === TokenTypes.PUNCTUATION && token.value === '(') {
      current++; // Skip opening parenthesis
      const expr = parseExpression();
      
      if (current >= tokens.length || 
          tokens[current].type !== TokenTypes.PUNCTUATION || 
          tokens[current].value !== ')') {
        throw {
          message: 'Expected closing parenthesis',
          position: token.position
        };
      }
      
      current++; // Skip closing parenthesis
      return expr;
    }
    
    // Parse array literals
    if (token.type === TokenTypes.PUNCTUATION && token.value === '[') {
      return parseArrayLiteral();
    }
    
    // Parse object literals
    if (token.type === TokenTypes.PUNCTUATION && token.value === '{') {
      return parseObjectLiteral();
    }
    
    throw {
      message: `Unexpected token ${token.type}: ${token.value}`,
      position: token.position
    };
  }
  
  function parseFunctionCall(name) {
    current++; // Skip opening parenthesis
    const args = [];
    
    // Parse arguments
    if (current < tokens.length && 
        !(tokens[current].type === TokenTypes.PUNCTUATION && 
          tokens[current].value === ')')) {
      
      while (true) {
        args.push(parseExpression());
        
        if (current < tokens.length && 
            tokens[current].type === TokenTypes.PUNCTUATION && 
            tokens[current].value === ',') {
          current++; // Skip comma
        } else {
          break;
        }
      }
    }
    
    if (current >= tokens.length || 
        tokens[current].type !== TokenTypes.PUNCTUATION || 
        tokens[current].value !== ')') {
      throw {
        message: 'Expected closing parenthesis',
        position: tokens[current - 1].position + 1
      };
    }
    
    current++; // Skip closing parenthesis
    
    return {
      type: AstNodeTypes.FUNCTION_CALL,
      name,
      arguments: args
    };
  }
  
  function parseArrayLiteral() {
    const startToken = tokens[current];
    current++; // Skip opening bracket
    const elements = [];
    
    // Parse elements
    if (current < tokens.length && 
        !(tokens[current].type === TokenTypes.PUNCTUATION && 
          tokens[current].value === ']')) {
      
      while (true) {
        elements.push(parseExpression());
        
        if (current < tokens.length && 
            tokens[current].type === TokenTypes.PUNCTUATION && 
            tokens[current].value === ',') {
          current++; // Skip comma
        } else {
          break;
        }
      }
    }
    
    if (current >= tokens.length || 
        tokens[current].type !== TokenTypes.PUNCTUATION || 
        tokens[current].value !== ']') {
      throw {
        message: 'Expected closing bracket',
        position: startToken.position
      };
    }
    
    current++; // Skip closing bracket
    
    return {
      type: AstNodeTypes.ARRAY_LITERAL,
      elements
    };
  }
  
  function parseObjectLiteral() {
    const startToken = tokens[current];
    current++; // Skip opening brace
    const properties = [];
    
    // Parse properties
    if (current < tokens.length && 
        !(tokens[current].type === TokenTypes.PUNCTUATION && 
          tokens[current].value === '}')) {
      
      while (true) {
        // Parse key
        let key;
        
        if (tokens[current].type === TokenTypes.STRING) {
          key = tokens[current].value;
          current++;
        } else if (tokens[current].type === TokenTypes.IDENTIFIER) {
          key = tokens[current].value;
          current++;
        } else {
          throw {
            message: 'Expected string or identifier as object key',
            position: tokens[current].position
          };
        }
        
        // Parse colon
        if (current >= tokens.length || 
            tokens[current].type !== TokenTypes.PUNCTUATION || 
            tokens[current].value !== ':') {
          throw {
            message: 'Expected colon after object key',
            position: tokens[current - 1].position + key.length
          };
        }
        
        current++; // Skip colon
        
        // Parse value
        const value = parseExpression();
        
        properties.push({ key, value });
        
        if (current < tokens.length && 
            tokens[current].type === TokenTypes.PUNCTUATION && 
            tokens[current].value === ',') {
          current++; // Skip comma
        } else {
          break;
        }
      }
    }
    
    if (current >= tokens.length || 
        tokens[current].type !== TokenTypes.PUNCTUATION || 
        tokens[current].value !== '}') {
      throw {
        message: 'Expected closing brace',
        position: startToken.position
      };
    }
    
    current++; // Skip closing brace
    
    return {
      type: AstNodeTypes.OBJECT_LITERAL,
      properties
    };
  }
  
  const ast = parseExpression();
  
  if (current < tokens.length - 1) {
    throw {
      message: 'Unexpected tokens after end of expression',
      position: tokens[current].position
    };
  }
  
  return ast;
}

/**
 * Parse a formula string into an abstract syntax tree (AST)
 * 
 * @param {string} formula - The formula to parse
 * @returns {Object} AST representing the formula
 */
export function parseFormula(formula) {
  try {
    const tokens = tokenize(formula);
    return parseTokens(tokens);
  } catch (error) {
    // Enhance the error with source context if not already present
    if (!error.position && typeof error === 'object') {
      error.message = `Formula parse error: ${error.message}`;
    }
    throw error;
  }
}

/**
 * Validate a formula AST against a context
 * 
 * @param {Object} ast - AST to validate
 * @param {Object} context - Validation context with available variables and functions
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateFormula(ast, context = {}) {
  const errors = [];
  const usedFunctions = new Set();
  const usedVariables = new Set();
  
  // This is a placeholder implementation
  // The full validation will be implemented according to the plan
  try {
    // Simple validation checking for undefined variables and functions
    validateNode(ast);
    
    return {
      isValid: errors.length === 0,
      errors,
      usedFunctions: Array.from(usedFunctions),
      usedVariables: Array.from(usedVariables)
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error],
      usedFunctions: Array.from(usedFunctions),
      usedVariables: Array.from(usedVariables)
    };
  }
  
  // Recursive node validation
  function validateNode(node, path = '') {
    if (!node || typeof node !== 'object') {
      errors.push({
        message: `Invalid node at path ${path}`,
        path
      });
      return;
    }
    
    switch (node.type) {
      case AstNodeTypes.LITERAL:
        // Literals are always valid
        break;
        
      case AstNodeTypes.VARIABLE:
        usedVariables.add(node.name);
        // Check if variable exists in context
        // This will be expanded for full validation
        break;
        
      case AstNodeTypes.FUNCTION_CALL:
        usedFunctions.add(node.name);
        // Check if function exists and validate arguments
        // This will be expanded for full validation
        (node.arguments || []).forEach((arg, i) => {
          validateNode(arg, `${path}.arguments[${i}]`);
        });
        break;
        
      case AstNodeTypes.BINARY_OP:
        validateNode(node.left, `${path}.left`);
        validateNode(node.right, `${path}.right`);
        break;
        
      case AstNodeTypes.UNARY_OP:
        validateNode(node.right, `${path}.right`);
        break;
        
      case AstNodeTypes.CONDITIONAL:
        validateNode(node.condition, `${path}.condition`);
        validateNode(node.trueExpr, `${path}.trueExpr`);
        validateNode(node.falseExpr, `${path}.falseExpr`);
        break;
        
      case AstNodeTypes.ARRAY_LITERAL:
        (node.elements || []).forEach((element, i) => {
          validateNode(element, `${path}.elements[${i}]`);
        });
        break;
        
      case AstNodeTypes.OBJECT_LITERAL:
        (node.properties || []).forEach((prop, i) => {
          validateNode(prop.value, `${path}.properties[${i}].value`);
        });
        break;
        
      case AstNodeTypes.PROPERTY_ACCESS:
        validateNode(node.object, `${path}.object`);
        break;
        
      default:
        errors.push({
          message: `Unknown node type: ${node.type}`,
          path
        });
    }
  }
}

/**
 * Evaluate a parsed formula AST with a given context
 * 
 * @param {Object} ast - AST to evaluate
 * @param {Object} context - Evaluation context with variables and functions
 * @returns {Object} Evaluation result with result value and errors array
 */
export function evaluateFormula(ast, context = {}) {
  // This is a partial implementation with basic support
  // The full evaluation will be implemented according to the plan
  try {
    const result = evaluateNode(ast);
    return { result, errors: [] };
  } catch (error) {
    return {
      result: null,
      errors: [
        typeof error === 'string'
          ? { message: error }
          : error
      ]
    };
  }
  
  // Recursive node evaluation
  function evaluateNode(node) {
    if (!node || typeof node !== 'object') {
      throw `Invalid node: ${JSON.stringify(node)}`;
    }
    
    switch (node.type) {
      case AstNodeTypes.LITERAL:
        return node.value;
        
      case AstNodeTypes.VARIABLE:
        const value = getVariableValue(node.name, context);
        if (value === undefined) {
          throw `Variable not found: ${node.name}`;
        }
        return value;
        
      case AstNodeTypes.FUNCTION_CALL:
        return callFunction(node.name, (node.arguments || []).map(arg => evaluateNode(arg)), context);
        
      case AstNodeTypes.BINARY_OP:
        return evaluateBinaryOp(node.operator, evaluateNode(node.left), evaluateNode(node.right));
        
      case AstNodeTypes.UNARY_OP:
        return evaluateUnaryOp(node.operator, evaluateNode(node.right));
        
      case AstNodeTypes.CONDITIONAL:
        return evaluateNode(node.condition)
          ? evaluateNode(node.trueExpr)
          : evaluateNode(node.falseExpr);
        
      case AstNodeTypes.ARRAY_LITERAL:
        return (node.elements || []).map(element => evaluateNode(element));
        
      case AstNodeTypes.OBJECT_LITERAL:
        const obj = {};
        (node.properties || []).forEach(prop => {
          obj[prop.key] = evaluateNode(prop.value);
        });
        return obj;
        
      case AstNodeTypes.PROPERTY_ACCESS:
        const object = evaluateNode(node.object);
        if (object === null || object === undefined) {
          throw `Cannot access property on null or undefined`;
        }
        return object[node.property];
        
      default:
        throw `Unknown node type: ${node.type}`;
    }
  }
  
  // Get a variable value from the context
  function getVariableValue(name, context) {
    // Support for accessing nested properties using dot notation
    if (name.includes('.')) {
      const parts = name.split('.');
      let value = context.data || context;
      
      for (const part of parts) {
        if (value === null || value === undefined) {
          return undefined;
        }
        value = value[part];
      }
      
      return value;
    }
    
    // Direct variable access
    if (context.data && context.data[name] !== undefined) {
      return context.data[name];
    }
    
    return context[name];
  }
  
  // Call a function from the context
  function callFunction(name, args, context) {
    // Simple function call implementation
    // This will be expanded for the full evaluation
    if (context.functions && typeof context.functions[name] === 'function') {
      return context.functions[name](...args);
    }
    
    throw `Function not found: ${name}`;
  }
  
  // Evaluate a binary operation
  function evaluateBinaryOp(operator, left, right) {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': 
        if (right === 0) {
          throw 'Division by zero';
        }
        return left / right;
      case '%': return left % right;
      case '^': return Math.pow(left, right);
      case '==': return left === right;
      case '!=': return left !== right;
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '&&': return left && right;
      case '||': return left || right;
      default: throw `Unknown binary operator: ${operator}`;
    }
  }
  
  // Evaluate a unary operation
  function evaluateUnaryOp(operator, right) {
    switch (operator) {
      case '+': return +right;
      case '-': return -right;
      case '!': return !right;
      default: throw `Unknown unary operator: ${operator}`;
    }
  }
}

/**
 * Compile a formula AST to an optimized execution function
 * 
 * @param {Object} ast - AST to compile
 * @returns {Function} Compiled function that takes a context and returns a result
 */
export function compileFormula(ast) {
  // This is a placeholder implementation
  // The full compilation will be implemented according to the plan
  return (context) => evaluateFormula(ast, context);
}
