# ChipAdapted Component

The `ChipAdapted` component provides a compact element for representing tags, attributes, or categories with an accessible interface.

## Features

- Consistent Material UI compatibility with design system styling
- Multiple visual variants: filled and outlined
- Customizable size options: small, medium, and large
- Support for icons and avatars
- Delete functionality with custom delete icons
- Accessibility-enhanced interactions
- Keyboard navigation support

## Usage

```jsx
import { Chip } from 'design-system/adapter';

function TagList() {
  const handleDelete = (tagId) => {
    // Handle tag deletion
  };

  return (
    <div className="tag-container">
      <Chip 
        label="React" 
        color="primary" 
        onDelete={() => handleDelete('react')} 
      />
      
      <Chip 
        label="TypeScript" 
        color="secondary" 
        variant="outlined" 
      />
      
      <Chip 
        label="JavaScript" 
        icon={<CodeIcon />} 
        color="warning" 
        size="small" 
      />
    </div>
  );
}
```

## Props

### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | node | — | The content of the chip |
| `color` | string | 'default' | The color of the chip: 'default', 'primary', 'secondary', 'success', 'error', 'warning', 'info' |
| `variant` | string | 'filled' | The variant to use: 'filled', 'outlined' |
| `size` | string | 'medium' | The size of the chip: 'small', 'medium', 'large' |
| `disabled` | boolean | false | If true, the chip will be disabled |
| `clickable` | boolean | false | If true, the chip will appear clickable |

### Icon and Avatar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | node | — | Icon element to display at the start of the chip |
| `avatar` | node | — | Avatar element for the chip that adjusts padding |
| `deleteIcon` | node | — | Custom delete icon to use |

### Interaction Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | function | — | Callback fired when the chip is clicked |
| `onDelete` | function | — | Callback fired when delete icon is clicked |
| `component` | elementType | — | The component used for the root node |
| `href` | string | — | If provided, the chip will be a link |

### Accessibility Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | string | — | Accessible label for the chip |
| `ariaDescribedBy` | string | — | ID of element that describes the chip |

## Examples

### Basic Chip

```jsx
<Chip label="Basic Chip" />
```

### Clickable Chip

```jsx
<Chip 
  label="Clickable" 
  onClick={() => console.log('Clicked')} 
  color="primary"
/>
```

### Chip with Delete Action

```jsx
<Chip 
  label="Deletable" 
  onDelete={() => console.log('Delete clicked')} 
/>
```

### Outlined Variant

```jsx
<Chip 
  label="Outlined" 
  variant="outlined" 
  color="secondary"
/>
```

### Different Sizes

```jsx
<>
  <Chip label="Small" size="small" />
  <Chip label="Medium" size="medium" />
  <Chip label="Large" size="large" />
</>
```

### With Custom Icon

```jsx
<Chip 
  label="With Icon" 
  icon={<StarIcon />} 
  color="warning"
/>
```

## Accessibility

The `ChipAdapted` component includes several accessibility features:

- Appropriate ARIA roles based on interactivity
- Keyboard navigation support
- Clear focus indicators
- Screen reader-friendly delete actions
- Support for custom ARIA attributes

## Design System Integration

This component seamlessly integrates with the design system theme, inheriting color schemes, typography, and spacing tokens automatically.