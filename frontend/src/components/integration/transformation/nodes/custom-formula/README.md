# CustomFormula Transformation Node

This component provides a comprehensive formula building capability for data transformation, enabling users to create complex expressions with a visual builder interface.

## Features

- Visual formula construction with syntax highlighting
- Enhanced formula editor with auto-completion for brackets, quotes, and parentheses
- Intelligent function suggestions with detailed documentation, parameters, and examples
- Comprehensive function library with over 35 functions across multiple categories
- Real-time validation and error feedback with position information
- Formula testing with sample data preview
- Performance optimization for formula evaluation
- Field listing from sample data for easy access

## Implementation

This component leverages our zero technical debt approach by:

1. Using the TransformationNodeTemplate for consistent UI and validation
2. Implementing a robust parser with abstract syntax tree (AST) evaluation
3. Creating an extensible function registry with comprehensive documentation
4. Building a sophisticated tokenizer for advanced syntax highlighting
5. Implementing context-aware function suggestion system
6. Ensuring full accessibility and proper error handling

## Components

- **CustomFormulaNode**: Main component that integrates all formula building capabilities
- **FormulaEditor**: Advanced editor with syntax highlighting and autocomplete
- **FunctionCatalog**: Browse and search available functions with documentation
- **formula-parser.js**: Formula parsing, validation, and evaluation
- **function-registry.js**: Extensible registry for formula functions

## Function Categories

- **Mathematical Basic**: sum, subtract, multiply, divide, power, mod, abs
- **Trigonometric**: sin, cos, tan, toRadians, toDegrees
- **Statistical**: avg, min, max, count
- **Rounding**: round, floor, ceiling, trunc
- **String Operations**: concat, substring, trim, replace, length
- **String Case**: upper, lower
- **Logical**: if, and, or, not, eq, neq, gt, lt

## Usage Example

```jsx
import { CustomFormulaNode } from '../transformation/nodes/custom-formula';

// Sample node data
const nodeData = {
  id: 'formula-1',
  type: 'CustomFormula',
  config: {
    formula: 'sum(data.amount, 10)',
    inputFieldPath: 'data',
    outputFieldPath: 'result',
    errorHandling: 'NULL'
  }
};

// Sample data for preview
const sampleData = {
  amount: 50,
  name: 'Sample Item'
};

// Render the component
<CustomFormulaNode
  nodeData={nodeData}
  onChange={handleNodeChange}
  sampleData={sampleData}
/>
```

## Extending with New Functions

The function registry is extensible and allows easy registration of new functions:

```js
import { registerFunction, FunctionCategories, DataTypes } from '../transformation/nodes/custom-formula';

// Register a new function
registerFunction(
  'formatCurrency',
  (value, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(value);
  },
  FunctionCategories.STRING_ADVANCED,
  'Formats a number as currency',
  [
    { name: 'value', type: DataTypes.NUMBER, description: 'The value to format' },
    { name: 'currency', type: DataTypes.STRING, description: 'Currency code (USD, EUR, etc.)', isOptional: true },
    { name: 'locale', type: DataTypes.STRING, description: 'Locale for formatting', isOptional: true }
  ],
  { type: DataTypes.STRING, description: 'The formatted currency string' },
  ['formatCurrency(1234.56) => "$1,234.56"', 'formatCurrency(1234.56, "EUR", "de-DE") => "1.234,56 €"']
);
```

See the implementation plan and component documentation for more detailed usage examples.
