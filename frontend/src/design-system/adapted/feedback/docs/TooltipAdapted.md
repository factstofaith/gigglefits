# TooltipAdapted

The `TooltipAdapted` component provides additional information in a small popup when users hover over, focus on, or touch an element. Tooltips are commonly used to explain the purpose of buttons, form elements, or other interactive components.

## Features

- **Multiple placement options** (top, bottom, left, right and variants)
- **Customizable delays** for showing and hiding
- **Focus and touch support** for accessibility
- **Arrow indicator** option for directional guidance
- **Controlled and uncontrolled modes** for flexible state management

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | Required | The element that triggers the tooltip |
| `title` | `node` | Required | The content of the tooltip |
| `placement` | `string` | `'bottom'` | Tooltip position relative to the trigger element |
| `arrow` | `boolean` | `false` | If `true`, adds an arrow pointing to the trigger |
| `enterDelay` | `number` | `400` | Delay in ms before showing the tooltip |
| `leaveDelay` | `number` | `0` | Delay in ms before hiding the tooltip |
| `open` | `boolean` | | Controls the open state in controlled mode |
| `disableHoverListener` | `boolean` | `false` | If `true`, disables tooltip on hover |
| `disableTouchListener` | `boolean` | `false` | If `true`, disables tooltip on touch |
| `disableFocusListener` | `boolean` | `false` | If `true`, disables tooltip on focus |
| `maxWidth` | `number` or `string` | `300` | Maximum width for the tooltip content |
| `ariaLabel` | `string` | | Accessibility label for the tooltip |

## Usage Examples

### Basic Usage

```jsx
import { TooltipAdapted } from '../../../design-system/adapter';

function BasicTooltip() {
  return (
    <TooltipAdapted title="Delete item">
      <button>Delete</button>
    </TooltipAdapted>
  );
}
```

### Custom Placement and Arrow

```jsx
import { TooltipAdapted } from '../../../design-system/adapter';

function CustomTooltip() {
  return (
    <TooltipAdapted 
      title="Settings configuration" 
      placement="right"
      arrow={true}
    >
      <button>Settings</button>
    </TooltipAdapted>
  );
}
```

### Controlled Tooltip

```jsx
import { useState } from 'react';
import { TooltipAdapted, Button } from '../../../design-system/adapter';

function ControlledTooltip() {
  const [open, setOpen] = useState(false);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <div>
      <Button onClick={() => setOpen(!open)}>
        Toggle Tooltip
      </Button>
      
      <TooltipAdapted 
        title="This tooltip is controlled programmatically"
        open={open}
        placement="top"
      >
        <span style={{ marginLeft: 16 }}>Hover or touch me</span>
      </TooltipAdapted>
    </div>
  );
}
```

### Custom Delays

```jsx
import { TooltipAdapted } from '../../../design-system/adapter';

function DelayedTooltip() {
  return (
    <TooltipAdapted 
      title="This tooltip appears quickly and stays longer" 
      enterDelay={100}
      leaveDelay={500}
    >
      <button>Quick Info</button>
    </TooltipAdapted>
  );
}
```

### Rich Content

```jsx
import { TooltipAdapted, Typography, Box } from '../../../design-system/adapter';

function RichTooltip() {
  return (
    <TooltipAdapted 
      title={
        <Box>
          <Typography variant="subtitle2">Advanced Configuration</Typography>
          <Typography variant="body2">
            Configure advanced settings for the application. 
            Only modify these settings if you understand the implications.
          </Typography>
        </Box>
      }
      placement="bottom"
      maxWidth={400}
    >
      <button>Advanced Settings</button>
    </TooltipAdapted>
  );
}
```

## Accessibility

The TooltipAdapted component implements the following accessibility features:

- Supports keyboard navigation for users who cannot use a mouse
- Shows on focus to support keyboard-only navigation
- Provides appropriate ARIA attributes for screen readers
- Allows custom aria labels for better description
- Touch support for mobile device accessibility

For best accessibility practices:

1. Always provide meaningful content in the `title` prop
2. Use `ariaLabel` for situations where the tooltip content may not be descriptive enough
3. Avoid disabling focus or touch listeners unless necessary

## Customization

You can customize the tooltip appearance using the `sx` prop:

```jsx
<TooltipAdapted 
  title="Custom styled tooltip"
  sx={{
    backgroundColor: 'primary.main',
    '& .MuiTooltip-arrow': {
      color: 'primary.main',
    },
    fontWeight: 'bold',
    fontSize: '0.875rem',
  }}
>
  <button>Hover for custom tooltip</button>
</TooltipAdapted>
```