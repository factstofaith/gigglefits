# Button Component

A standardized button component for the TAP Integration Platform.

## Features

- Multiple variants (primary, secondary, text)
- Different sizes (small, medium, large)
- Full width option
- Disabled state
- Hover and focus styles
- Accessibility support

## Usage

```jsx
import Button from '../../components/Button';

function MyComponent() {
  return (
    <div>
      {/* Basic usage */}
      <Button onClick={() => console.log('Clicked!')}>
        Click Me
      </Button>
      
      {/* With different variants */}
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="text">Text Button</Button>
      
      {/* With different sizes */}
      <Button size="small">Small Button</Button>
      <Button size="medium">Medium Button</Button>
      <Button size="large">Large Button</Button>
      
      {/* Full width button */}
      <Button fullWidth>Full Width Button</Button>
      
      {/* Disabled button */}
      <Button disabled>Disabled Button</Button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'text'` | `'primary'` | Button variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `fullWidth` | `boolean` | `false` | Whether the button should take full width |
| `onClick` | `function` | `undefined` | Click handler function |
| `children` | `ReactNode` | Required | Button content |

## Accessibility

The Button component includes the following accessibility features:

- Uses semantic `<button>` element
- Provides `aria-disabled` attribute when disabled
- Maintains proper focus styles for keyboard navigation
- Ensures adequate color contrast for all variants

## Design Decisions

- Uses flexbox for content alignment
- Implements consistent border-radius across all button variants
- Maintains consistent padding and sizing with design system
- Uses transition effects for smooth hover interactions

## Testing

100% test coverage for:
- Rendering with all variants and sizes
- Interaction handling
- Disabled state behavior
- Style variations