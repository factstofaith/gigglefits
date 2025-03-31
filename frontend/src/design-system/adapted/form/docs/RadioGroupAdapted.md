# RadioGroupAdapted Component

An accessible radio group component with enhanced keyboard navigation and standardized API.

## Features

- Comprehensive accessibility support
- Consistent error handling
- Standardized API pattern
- Enhanced keyboard navigation

## Usage

```jsx
import { RadioGroup } from '../design-system/adapter';

// Basic usage
<RadioGroup
  id="radio-example"
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
<RadioGroup
  id="radio-with-error"
  name="example-error"
  value={selectedValue}
  onChange={handleChange}
  label="Choose an option"
  options={options}
  error={hasError}
  helperText={errorMessage}
/>

// Horizontal layout
<RadioGroup
  id="radio-horizontal"
  name="example-horizontal"
  value={selectedValue}
  onChange={handleChange}
  label="Choose an option"
  options={options}
  row
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | Required | Unique identifier for the component |
| `name` | string | Required | Form field name |
| `value` | string \| number | Required | Selected value |
| `onChange` | function | Required | Function called when selection changes |
| `options` | array | `[]` | Array of option objects: `{ value, label, disabled }` |
| `label` | string | `''` | Text label for the radio group |
| `helperText` | node | `''` | Helper text displayed below the radio group |
| `error` | boolean | `false` | Whether the radio group is in an error state |
| `disabled` | boolean | `false` | Whether the radio group is disabled |
| `required` | boolean | `false` | Whether the field is required |
| `row` | boolean | `false` | Whether to display options in a row instead of column |
| `size` | 'small' \| 'medium' | `'medium'` | The size of the radio buttons |
| `ariaLabel` | string | - | Accessible label |
| `ariaLabelledBy` | string | - | ID of element that labels the radio group |
| `ariaDescribedBy` | string | - | ID of element that describes the radio group |

## Accessibility Features

- Properly grouped radio options with fieldset and legend
- Keyboard navigation between options (arrow keys)
- Proper ARIA attributes for error states and descriptions
- Visible focus indicators
- Support for aria-label, aria-labelledby, and aria-describedby

## Error Handling

The component is wrapped in an ErrorBoundary to prevent cascading failures when errors occur in the UI.