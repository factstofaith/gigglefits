/**
 * Function Registry Module
 * 
 * Implements an extensible registry for all formula functions
 * with documentation, type validation, and categorization.
 * 
 * This module leverages our zero technical debt approach by implementing
 * a comprehensive, well-documented function system without legacy constraints.
 */

// Function registry to store all available functions
const functionRegistry = {};

// Function categories for organization
export const FunctionCategories = {
  MATH_BASIC: 'Basic Math',
  MATH_TRIG: 'Trigonometry',
  MATH_STAT: 'Statistics',
  MATH_FIN: 'Financial',
  MATH_ROUND: 'Rounding',
  STRING_BASIC: 'String Operations',
  STRING_CASE: 'Case Conversion',
  STRING_VALIDATE: 'String Validation',
  STRING_ADVANCED: 'Advanced String',
  DATE_FORMAT: 'Date Formatting',
  DATE_COMPONENTS: 'Date Components',
  DATE_CALC: 'Date Calculations',
  DATE_CONVERT: 'Date Conversion',
  LOGICAL_BASIC: 'Basic Logic',
  LOGICAL_COMPARE: 'Comparison',
  LOGICAL_CONTROL: 'Control Flow',
  ARRAY_TRANSFORM: 'Array Transformation',
  ARRAY_AGGREGATE: 'Array Aggregation',
  ARRAY_MANIPULATE: 'Array Manipulation',
  ADVANCED_REGEX: 'Regular Expressions',
  ADVANCED_JSON: 'JSON Operations',
  ADVANCED_TYPE: 'Type Operations',
  ADVANCED_CONVERT: 'Type Conversion'
};

// Data types for validation
export const DataTypes = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  ARRAY: 'array',
  OBJECT: 'object',
  ANY: 'any',
  NULL: 'null',
  FUNCTION: 'function'
};

/**
 * Register a function in the function registry
 * 
 * @param {string} name - Function name
 * @param {Function} implementation - Function implementation
 * @param {string} category - Function category from FunctionCategories
 * @param {string} description - Function description
 * @param {Array} params - Array of parameter definitions with name, type, and description
 * @param {Object} returnDef - Return type definition with type and description
 * @param {Array} examples - Array of example usages
 */
export function registerFunction(name, implementation, category, description, params, returnDef, examples) {
  functionRegistry[name] = {
    name,
    implementation,
    category,
    description,
    params,
    returnType: returnDef,
    examples
  };
}

/**
 * Get a function from the registry by name
 * 
 * @param {string} name - Function name to retrieve
 * @returns {Object|null} Function definition or null if not found
 */
export function getFunction(name) {
  return functionRegistry[name] || null;
}

/**
 * Get all functions in a specific category
 * 
 * @param {string} category - Category to filter by
 * @returns {Array} Array of function definitions
 */
export function getFunctionsByCategory(category) {
  return Object.values(functionRegistry).filter(fn => fn.category === category);
}

/**
 * Get all registered functions
 * 
 * @returns {Object} Map of all function definitions
 */
export function getAllFunctions() {
  return { ...functionRegistry };
}

/**
 * Search for functions by name or description
 * 
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Matching function definitions
 */
export function searchFunctions(searchTerm) {
  const term = searchTerm.toLowerCase();
  return Object.values(functionRegistry).filter(fn => 
    fn.name.toLowerCase().includes(term) || 
    fn.description.toLowerCase().includes(term)
  );
}

/**
 * Initialize the function registry with basic functions
 */
export function initializeRegistry() {
  // Register basic math functions
  registerBasicMathFunctions();
  // Register trigonometric functions
  registerTrigFunctions();
  // Register statistical functions
  registerStatFunctions();
  // Register rounding functions
  registerRoundingFunctions();
  // Register string functions
  registerStringFunctions();
  // Register logical functions
  registerLogicalFunctions();
}

/**
 * Register basic math functions
 */
function registerBasicMathFunctions() {
  // Sum function
  registerFunction(
    'sum',
    (...args) => args.reduce((total, num) => total + num, 0),
    FunctionCategories.MATH_BASIC,
    'Calculates the sum of all arguments',
    [
      { name: 'values', type: [DataTypes.NUMBER], isVarArgs: true, description: 'Numbers to add together' }
    ],
    { type: DataTypes.NUMBER, description: 'The sum of all arguments' },
    ['sum(1, 2, 3) => 6', 'sum(10, -5) => 5']
  );

  // Subtract function
  registerFunction(
    'subtract',
    (a, b) => a - b,
    FunctionCategories.MATH_BASIC,
    'Subtracts the second number from the first',
    [
      { name: 'a', type: DataTypes.NUMBER, description: 'The number to subtract from' },
      { name: 'b', type: DataTypes.NUMBER, description: 'The number to subtract' }
    ],
    { type: DataTypes.NUMBER, description: 'The result of subtracting b from a' },
    ['subtract(10, 4) => 6', 'subtract(5, 8) => -3']
  );

  // Multiply function
  registerFunction(
    'multiply',
    (...args) => args.reduce((product, num) => product * num, 1),
    FunctionCategories.MATH_BASIC,
    'Multiplies all the arguments together',
    [
      { name: 'values', type: [DataTypes.NUMBER], isVarArgs: true, description: 'Numbers to multiply together' }
    ],
    { type: DataTypes.NUMBER, description: 'The product of all arguments' },
    ['multiply(2, 3, 4) => 24', 'multiply(10, -2) => -20']
  );

  // Divide function
  registerFunction(
    'divide',
    (a, b) => {
      if (b === 0) {
        throw new Error('Division by zero');
      }
      return a / b;
    },
    FunctionCategories.MATH_BASIC,
    'Divides the first number by the second',
    [
      { name: 'a', type: DataTypes.NUMBER, description: 'The dividend (number to be divided)' },
      { name: 'b', type: DataTypes.NUMBER, description: 'The divisor (number to divide by)' }
    ],
    { type: DataTypes.NUMBER, description: 'The result of dividing a by b' },
    ['divide(10, 2) => 5', 'divide(9, 3) => 3']
  );

  // Modulo function
  registerFunction(
    'mod',
    (a, b) => {
      if (b === 0) {
        throw new Error('Modulo by zero');
      }
      return a % b;
    },
    FunctionCategories.MATH_BASIC,
    'Returns the remainder of dividing the first number by the second',
    [
      { name: 'a', type: DataTypes.NUMBER, description: 'The dividend (number to be divided)' },
      { name: 'b', type: DataTypes.NUMBER, description: 'The divisor (number to divide by)' }
    ],
    { type: DataTypes.NUMBER, description: 'The remainder of dividing a by b' },
    ['mod(10, 3) => 1', 'mod(15, 4) => 3']
  );

  // Power function
  registerFunction(
    'power',
    (base, exponent) => Math.pow(base, exponent),
    FunctionCategories.MATH_BASIC,
    'Raises the first number to the power of the second number',
    [
      { name: 'base', type: DataTypes.NUMBER, description: 'The base number' },
      { name: 'exponent', type: DataTypes.NUMBER, description: 'The exponent' }
    ],
    { type: DataTypes.NUMBER, description: 'The result of raising base to the power of exponent' },
    ['power(2, 3) => 8', 'power(10, 2) => 100']
  );

  // Square root function
  registerFunction(
    'sqrt',
    (value) => {
      if (value < 0) {
        throw new Error('Cannot take square root of negative number');
      }
      return Math.sqrt(value);
    },
    FunctionCategories.MATH_BASIC,
    'Returns the square root of a number',
    [
      { name: 'value', type: DataTypes.NUMBER, description: 'The number to find the square root of' }
    ],
    { type: DataTypes.NUMBER, description: 'The square root of the input value' },
    ['sqrt(9) => 3', 'sqrt(16) => 4']
  );

  // Absolute value function
  registerFunction(
    'abs',
    (value) => Math.abs(value),
    FunctionCategories.MATH_BASIC,
    'Returns the absolute value of a number',
    [
      { name: 'value', type: DataTypes.NUMBER, description: 'The number to find the absolute value of' }
    ],
    { type: DataTypes.NUMBER, description: 'The absolute value of the input' },
    ['abs(-5) => 5', 'abs(10) => 10']
  );
}

/**
 * Register trigonometric functions
 */
function registerTrigFunctions() {
  // Sine function
  registerFunction(
    'sin',
    (angle) => Math.sin(angle),
    FunctionCategories.MATH_TRIG,
    'Returns the sine of an angle in radians',
    [
      { name: 'angle', type: DataTypes.NUMBER, description: 'The angle in radians' }
    ],
    { type: DataTypes.NUMBER, description: 'The sine of the angle' },
    ['sin(0) => 0', 'sin(Math.PI/2) => 1']
  );

  // Cosine function
  registerFunction(
    'cos',
    (angle) => Math.cos(angle),
    FunctionCategories.MATH_TRIG,
    'Returns the cosine of an angle in radians',
    [
      { name: 'angle', type: DataTypes.NUMBER, description: 'The angle in radians' }
    ],
    { type: DataTypes.NUMBER, description: 'The cosine of the angle' },
    ['cos(0) => 1', 'cos(Math.PI) => -1']
  );

  // Tangent function
  registerFunction(
    'tan',
    (angle) => Math.tan(angle),
    FunctionCategories.MATH_TRIG,
    'Returns the tangent of an angle in radians',
    [
      { name: 'angle', type: DataTypes.NUMBER, description: 'The angle in radians' }
    ],
    { type: DataTypes.NUMBER, description: 'The tangent of the angle' },
    ['tan(0) => 0', 'tan(Math.PI/4) => 1']
  );

  // Convert degrees to radians
  registerFunction(
    'toRadians',
    (degrees) => degrees * (Math.PI / 180),
    FunctionCategories.MATH_TRIG,
    'Converts an angle from degrees to radians',
    [
      { name: 'degrees', type: DataTypes.NUMBER, description: 'The angle in degrees' }
    ],
    { type: DataTypes.NUMBER, description: 'The angle in radians' },
    ['toRadians(180) => 3.141592653589793', 'toRadians(90) => 1.5707963267948966']
  );

  // Convert radians to degrees
  registerFunction(
    'toDegrees',
    (radians) => radians * (180 / Math.PI),
    FunctionCategories.MATH_TRIG,
    'Converts an angle from radians to degrees',
    [
      { name: 'radians', type: DataTypes.NUMBER, description: 'The angle in radians' }
    ],
    { type: DataTypes.NUMBER, description: 'The angle in degrees' },
    ['toDegrees(Math.PI) => 180', 'toDegrees(Math.PI/2) => 90']
  );
}

/**
 * Register statistical functions
 */
function registerStatFunctions() {
  // Average (mean) function
  registerFunction(
    'avg',
    (...args) => {
      if (args.length === 0) {
        return 0;
      }
      return args.reduce((sum, num) => sum + num, 0) / args.length;
    },
    FunctionCategories.MATH_STAT,
    'Calculates the average (mean) of the given numbers',
    [
      { name: 'values', type: [DataTypes.NUMBER], isVarArgs: true, description: 'Numbers to average' }
    ],
    { type: DataTypes.NUMBER, description: 'The average of the input values' },
    ['avg(1, 2, 3, 4) => 2.5', 'avg(10, 20) => 15']
  );

  // Minimum function
  registerFunction(
    'min',
    (...args) => {
      if (args.length === 0) {
        return null;
      }
      return Math.min(...args);
    },
    FunctionCategories.MATH_STAT,
    'Returns the smallest of the given numbers',
    [
      { name: 'values', type: [DataTypes.NUMBER], isVarArgs: true, description: 'Numbers to compare' }
    ],
    { type: DataTypes.NUMBER, description: 'The minimum value' },
    ['min(5, 10, 3, 8) => 3', 'min(-5, -10) => -10']
  );

  // Maximum function
  registerFunction(
    'max',
    (...args) => {
      if (args.length === 0) {
        return null;
      }
      return Math.max(...args);
    },
    FunctionCategories.MATH_STAT,
    'Returns the largest of the given numbers',
    [
      { name: 'values', type: [DataTypes.NUMBER], isVarArgs: true, description: 'Numbers to compare' }
    ],
    { type: DataTypes.NUMBER, description: 'The maximum value' },
    ['max(5, 10, 3, 8) => 10', 'max(-5, -10) => -5']
  );

  // Count function
  registerFunction(
    'count',
    (...args) => args.length,
    FunctionCategories.MATH_STAT,
    'Counts the number of arguments provided',
    [
      { name: 'values', type: [DataTypes.ANY], isVarArgs: true, description: 'Values to count' }
    ],
    { type: DataTypes.NUMBER, description: 'The count of provided arguments' },
    ['count(1, 2, 3) => 3', 'count("a", "b", "c", "d") => 4']
  );
}

/**
 * Register rounding functions
 */
function registerRoundingFunctions() {
  // Round function
  registerFunction(
    'round',
    (value, decimals = 0) => {
      const factor = Math.pow(10, decimals);
      return Math.round(value * factor) / factor;
    },
    FunctionCategories.MATH_ROUND,
    'Rounds a number to a specified number of decimal places',
    [
      { name: 'value', type: DataTypes.NUMBER, description: 'The number to round' },
      { name: 'decimals', type: DataTypes.NUMBER, description: 'The number of decimal places', isOptional: true, defaultValue: 0 }
    ],
    { type: DataTypes.NUMBER, description: 'The rounded number' },
    ['round(10.56) => 11', 'round(10.56, 1) => 10.6']
  );

  // Floor function
  registerFunction(
    'floor',
    (value) => Math.floor(value),
    FunctionCategories.MATH_ROUND,
    'Rounds a number down to the nearest integer',
    [
      { name: 'value', type: DataTypes.NUMBER, description: 'The number to round down' }
    ],
    { type: DataTypes.NUMBER, description: 'The number rounded down to the nearest integer' },
    ['floor(10.7) => 10', 'floor(-10.1) => -11']
  );

  // Ceiling function
  registerFunction(
    'ceiling',
    (value) => Math.ceil(value),
    FunctionCategories.MATH_ROUND,
    'Rounds a number up to the nearest integer',
    [
      { name: 'value', type: DataTypes.NUMBER, description: 'The number to round up' }
    ],
    { type: DataTypes.NUMBER, description: 'The number rounded up to the nearest integer' },
    ['ceiling(10.1) => 11', 'ceiling(-10.7) => -10']
  );

  // Truncate function
  registerFunction(
    'trunc',
    (value) => Math.trunc(value),
    FunctionCategories.MATH_ROUND,
    'Removes the decimal part of a number',
    [
      { name: 'value', type: DataTypes.NUMBER, description: 'The number to truncate' }
    ],
    { type: DataTypes.NUMBER, description: 'The integer part of the number' },
    ['trunc(10.7) => 10', 'trunc(-10.7) => -10']
  );
}

/**
 * Register string functions
 */
function registerStringFunctions() {
  // Concatenate function
  registerFunction(
    'concat',
    (...args) => args.join(''),
    FunctionCategories.STRING_BASIC,
    'Concatenates all the arguments into a single string',
    [
      { name: 'values', type: [DataTypes.ANY], isVarArgs: true, description: 'Values to concatenate' }
    ],
    { type: DataTypes.STRING, description: 'The concatenated string' },
    ['concat("Hello", " ", "World") => "Hello World"', 'concat("Value: ", 42) => "Value: 42"']
  );

  // Substring function
  registerFunction(
    'substring',
    (text, start, length) => {
      if (typeof text !== 'string') {
        text = String(text);
      }
      return text.substring(start, length ? start + length : undefined);
    },
    FunctionCategories.STRING_BASIC,
    'Extracts a portion of a string',
    [
      { name: 'text', type: DataTypes.STRING, description: 'The input string' },
      { name: 'start', type: DataTypes.NUMBER, description: 'The starting index' },
      { name: 'length', type: DataTypes.NUMBER, description: 'The length of the substring to extract', isOptional: true }
    ],
    { type: DataTypes.STRING, description: 'The extracted substring' },
    ['substring("Hello World", 0, 5) => "Hello"', 'substring("Hello World", 6) => "World"']
  );

  // Upper case function
  registerFunction(
    'upper',
    (text) => {
      if (typeof text !== 'string') {
        text = String(text);
      }
      return text.toUpperCase();
    },
    FunctionCategories.STRING_CASE,
    'Converts a string to upper case',
    [
      { name: 'text', type: DataTypes.STRING, description: 'The input string' }
    ],
    { type: DataTypes.STRING, description: 'The upper case string' },
    ['upper("Hello") => "HELLO"', 'upper("hello world") => "HELLO WORLD"']
  );

  // Lower case function
  registerFunction(
    'lower',
    (text) => {
      if (typeof text !== 'string') {
        text = String(text);
      }
      return text.toLowerCase();
    },
    FunctionCategories.STRING_CASE,
    'Converts a string to lower case',
    [
      { name: 'text', type: DataTypes.STRING, description: 'The input string' }
    ],
    { type: DataTypes.STRING, description: 'The lower case string' },
    ['lower("HELLO") => "hello"', 'lower("Hello World") => "hello world"']
  );

  // Trim function
  registerFunction(
    'trim',
    (text) => {
      if (typeof text !== 'string') {
        text = String(text);
      }
      return text.trim();
    },
    FunctionCategories.STRING_BASIC,
    'Removes whitespace from both ends of a string',
    [
      { name: 'text', type: DataTypes.STRING, description: 'The input string' }
    ],
    { type: DataTypes.STRING, description: 'The trimmed string' },
    ['trim("  Hello  ") => "Hello"', 'trim("Hello World  ") => "Hello World"']
  );

  // Replace function
  registerFunction(
    'replace',
    (text, search, replacement) => {
      if (typeof text !== 'string') {
        text = String(text);
      }
      return text.replace(new RegExp(search, 'g'), replacement);
    },
    FunctionCategories.STRING_BASIC,
    'Replaces all occurrences of a substring with another string',
    [
      { name: 'text', type: DataTypes.STRING, description: 'The input string' },
      { name: 'search', type: DataTypes.STRING, description: 'The substring to search for' },
      { name: 'replacement', type: DataTypes.STRING, description: 'The replacement string' }
    ],
    { type: DataTypes.STRING, description: 'The string with replacements' },
    ['replace("Hello World", "o", "0") => "Hell0 W0rld"', 'replace("apple apple", "apple", "orange") => "orange orange"']
  );

  // Length function
  registerFunction(
    'length',
    (text) => {
      if (typeof text !== 'string') {
        text = String(text);
      }
      return text.length;
    },
    FunctionCategories.STRING_BASIC,
    'Returns the length of a string',
    [
      { name: 'text', type: DataTypes.STRING, description: 'The input string' }
    ],
    { type: DataTypes.NUMBER, description: 'The length of the string' },
    ['length("Hello") => 5', 'length("") => 0']
  );
}

/**
 * Register logical functions
 */
function registerLogicalFunctions() {
  // If function
  registerFunction(
    'if',
    (condition, trueValue, falseValue) => condition ? trueValue : falseValue,
    FunctionCategories.LOGICAL_BASIC,
    'Returns one value if the condition is true, and another value if it is false',
    [
      { name: 'condition', type: DataTypes.BOOLEAN, description: 'The condition to check' },
      { name: 'trueValue', type: DataTypes.ANY, description: 'The value to return if the condition is true' },
      { name: 'falseValue', type: DataTypes.ANY, description: 'The value to return if the condition is false' }
    ],
    { type: DataTypes.ANY, description: 'The selected value based on the condition' },
    ['if(true, "Yes", "No") => "Yes"', 'if(5 > 10, "Greater", "Less") => "Less"']
  );

  // And function
  registerFunction(
    'and',
    (...args) => args.every(arg => !!arg),
    FunctionCategories.LOGICAL_BASIC,
    'Returns true if all arguments are true',
    [
      { name: 'values', type: [DataTypes.BOOLEAN], isVarArgs: true, description: 'Boolean values to check' }
    ],
    { type: DataTypes.BOOLEAN, description: 'True if all arguments are true, false otherwise' },
    ['and(true, true, true) => true', 'and(true, false, true) => false']
  );

  // Or function
  registerFunction(
    'or',
    (...args) => args.some(arg => !!arg),
    FunctionCategories.LOGICAL_BASIC,
    'Returns true if any argument is true',
    [
      { name: 'values', type: [DataTypes.BOOLEAN], isVarArgs: true, description: 'Boolean values to check' }
    ],
    { type: DataTypes.BOOLEAN, description: 'True if any argument is true, false otherwise' },
    ['or(false, true, false) => true', 'or(false, false, false) => false']
  );

  // Not function
  registerFunction(
    'not',
    (value) => !value,
    FunctionCategories.LOGICAL_BASIC,
    'Returns the logical NOT of the argument',
    [
      { name: 'value', type: DataTypes.BOOLEAN, description: 'The boolean value to negate' }
    ],
    { type: DataTypes.BOOLEAN, description: 'The negated boolean value' },
    ['not(true) => false', 'not(false) => true']
  );

  // Equal function
  registerFunction(
    'eq',
    (a, b) => a === b,
    FunctionCategories.LOGICAL_COMPARE,
    'Checks if two values are equal',
    [
      { name: 'a', type: DataTypes.ANY, description: 'First value to compare' },
      { name: 'b', type: DataTypes.ANY, description: 'Second value to compare' }
    ],
    { type: DataTypes.BOOLEAN, description: 'True if values are equal, false otherwise' },
    ['eq(5, 5) => true', 'eq("hello", "world") => false']
  );

  // Not equal function
  registerFunction(
    'neq',
    (a, b) => a !== b,
    FunctionCategories.LOGICAL_COMPARE,
    'Checks if two values are not equal',
    [
      { name: 'a', type: DataTypes.ANY, description: 'First value to compare' },
      { name: 'b', type: DataTypes.ANY, description: 'Second value to compare' }
    ],
    { type: DataTypes.BOOLEAN, description: 'True if values are not equal, false otherwise' },
    ['neq(5, 10) => true', 'neq("hello", "hello") => false']
  );

  // Greater than function
  registerFunction(
    'gt',
    (a, b) => a > b,
    FunctionCategories.LOGICAL_COMPARE,
    'Checks if the first value is greater than the second',
    [
      { name: 'a', type: DataTypes.ANY, description: 'First value to compare' },
      { name: 'b', type: DataTypes.ANY, description: 'Second value to compare' }
    ],
    { type: DataTypes.BOOLEAN, description: 'True if first value is greater, false otherwise' },
    ['gt(10, 5) => true', 'gt(5, 10) => false']
  );

  // Less than function
  registerFunction(
    'lt',
    (a, b) => a < b,
    FunctionCategories.LOGICAL_COMPARE,
    'Checks if the first value is less than the second',
    [
      { name: 'a', type: DataTypes.ANY, description: 'First value to compare' },
      { name: 'b', type: DataTypes.ANY, description: 'Second value to compare' }
    ],
    { type: DataTypes.BOOLEAN, description: 'True if first value is less, false otherwise' },
    ['lt(5, 10) => true', 'lt(10, 5) => false']
  );
}

// Initialize the registry with basic functions
initializeRegistry();
