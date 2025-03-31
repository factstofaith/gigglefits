# SelectAdapted Component

A virtualized, accessible select component that enhances the Material UI Select with performance optimizations and standardized API.

## Features

- Virtualization for large option lists via react-window
- Comprehensive accessibility features 
- Consistent error handling with error boundaries
- Full keyboard navigation support
- Standardized API pattern

## Usage

```jsx
import { Select } from '../design-system/adapter';

// Basic usage
<Select
  id="select-example"
  name="example"
  value={selectedValue}
  onChange={handleChange}
  label="Choose an option"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]}
/>

// With error state
<Select
  id="select-with-error"
  name="example-error"
  value={selectedValue}
  onChange={handleChange}
  label="Choose an option"
  options={options}
  error={hasError}
  helperText={errorMessage}
/>

// Multiple selection
<Select
  id="multi-select"
  name="example-multiple"
  value={selectedValues}
  onChange={handleMultipleChange}
  label="Choose options"
  options={options}
  multiple
/>

// With virtualization for large datasets
<Select
  id="virtualized-select"
  name="example-virtualized"
  value={selectedValue}
  onChange={handleChange}
  label="Choose a country"
  options={countryList} // Large list of options
  maxHeight={300}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | Required | Unique identifier for the component |
| `name` | string | Required | Form field name |
| `value` | string \| number \| array | Required | Selected value(s) |
| `onChange` | function | Required | Function called when selection changes |
| `options` | array | `[]` | Array of option objects: `{ value, label, disabled }` |
| `label` | string | `''` | Text label for the select |
| `helperText` | node | `''` | Helper text displayed below the select |
| `error` | boolean | `false` | Whether the select is in an error state |
| `disabled` | boolean | `false` | Whether the select is disabled |
| `required` | boolean | `false` | Whether the field is required |
| `fullWidth` | boolean | `true` | Whether the select should take up full width |
| `multiple` | boolean | `false` | Whether multiple options can be selected |
| `placeholder` | string | `''` | Placeholder text when no option is selected |
| `variant` | 'outlined' \| 'standard' \| 'filled' | `'outlined'` | The variant to use |
| `size` | 'small' \| 'medium' | `'medium'` | The size of the component |
| `maxHeight` | number | `300` | Maximum height of the dropdown menu |
| `ariaLabel` | string | - | Accessible label |
| `ariaLabelledBy` | string | - | ID of element that labels the select |
| `ariaDescribedBy` | string | - | ID of element that describes the select |

## Performance Optimization

The component uses `React.memo` and virtualization for dropdown options to optimize performance, particularly with large datasets. When rendering 1000+ options, the virtualized list significantly improves rendering performance and memory usage.

## Accessibility Features

- Full keyboard navigation
- Proper ARIA attributes for screen readers
- Respects the required, disabled, and error states
- Clear focus indicators
- Support for aria-label, aria-labelledby, and aria-describedby

## Error Handling

The component is wrapped in an ErrorBoundary to prevent cascading failures and provide fallback UI when errors occur.