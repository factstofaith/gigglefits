# Transformation Components

This directory contains transformation-specific components for the TAP Integration Platform.

## Overview

Transformation components allow users to convert, manipulate, and transform data between different formats and types. These components are designed to be used in the flow canvas as transformation nodes.

## Directory Structure

- `/nodes` - Individual transformation node components
- `/common` - Shared utilities and components used by transformation nodes
- `/__tests__` - Test files for transformation components

## Available Transformation Nodes

### DataTypeConversion

Converts data from one type to another, with support for various data types including:
- String
- Number (integer/float)
- Boolean
- Date/DateTime
- Array
- Object

Features:
- Type validation and conversion
- Format string support for date/time formatting
- Custom error handling strategies
- Null value handling
- Preview of conversion results

Usage:
```jsx
import { DataTypeConversion } from './components/integration/transformation/nodes';

// In your component
<DataTypeConversion 
  initialConfig={{
    inputField: 'sourceField',
    outputField: 'targetField',
    inputType: 'string',
    outputType: 'number',
    errorHandling: 'keepOriginal'
  }}
  onConfigChange={handleConfigChange}
/>
```

### TextFormatting

Performs various text operations on string values, including:
- Case conversion (uppercase, lowercase, capitalize)
- Trimming whitespace
- String replacement (with regex support)
- Substring extraction
- Padding (start/end)
- Text removal
- Concatenation
- Template-based formatting

Features:
- Multiple text operations in a single component
- Regular expression support
- Case sensitivity options
- Template-based text formatting
- Preview of formatting results

Usage:
```jsx
import { TextFormatting } from './components/integration/transformation/nodes';

// In your component
<TextFormatting 
  initialConfig={{
    inputField: 'messageField',
    outputField: 'formattedMessage',
    operation: 'replace',
    searchValue: 'old',
    replaceValue: 'new',
    useRegex: true,
    caseSensitive: false
  }}
  onConfigChange={handleConfigChange}
/>
```

### NumericOperation

Performs mathematical operations on numeric fields with high precision, including:
- Basic arithmetic (add, subtract, multiply, divide)
- Advanced operations (power, modulo, percentage)
- Rounding functions (round, floor, ceiling)
- Statistical operations (min, max)
- Mathematical functions (sqrt, log, exp)
- Sign operations (absolute, negate)

Features:
- 17 different numeric operations in a single component
- High precision calculations using Decimal.js
- Configurable decimal precision and rounding modes
- Comprehensive error handling strategies
- Null value handling
- Real-time calculation preview

Usage:
```jsx
import { NumericOperation } from './components/integration/transformation/nodes';

// In your component
<NumericOperation 
  initialConfig={{
    inputField: 'amount',
    outputField: 'calculatedAmount',
    operation: 'add',
    operand: 10,
    precision: 2,
    roundingMode: 'round',
    useHighPrecision: true,
    handleErrors: 'fallback',
    fallbackValue: 0
  }}
  onConfigChange={handleConfigChange}
/>
```

## Implementation Details

All transformation nodes are implemented using the production accelerators:

1. **TransformationNodeTemplate**: Provides consistent UI, validation, error handling, and state management
2. **useDataTransformation**: Handles data transformation with performance optimization and error tracking
3. **TransformationState**: Manages state for complex transformations with transaction support

## Adding New Transformation Nodes

To add a new transformation node:

1. Create a new component in the `/nodes` directory
2. Use the `TransformationNodeTemplate` as the base component
3. Implement the configuration panel and transformation logic
4. Add tests in the `/__tests__` directory
5. Export the component in the `nodes/index.js` file
6. Update this README with documentation for the new component

## Best Practices

1. Use the accelerators for consistent implementation
2. Follow the established patterns for configuration and validation
3. Implement comprehensive error handling
4. Include preview functionality where appropriate
5. Add thorough documentation and tests