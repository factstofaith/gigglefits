# AccordionAdapted

The `AccordionAdapted` component provides collapsible content panels for organizing and presenting information in a limited space. It consists of a summary header and expandable detail section with rich accessibility support.

## Features

- **Controlled and uncontrolled modes** for flexibility in state management
- **Keyboard navigation** support for accessibility
- **Customizable transitions** for smooth animations
- **Enhanced styling options** including elevation and variants
- **Complete accessibility** implementation with proper ARIA attributes

## Component Structure

The Accordion system consists of three components:

1. `AccordionAdapted`: The main container component
2. `AccordionSummaryAdapted`: The clickable header/title component
3. `AccordionDetailsAdapted`: The expandable content container

## API Reference

### AccordionAdapted Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | | The content of the accordion (typically Summary and Details components) |
| `defaultExpanded` | `boolean` | `false` | If `true`, expands the accordion by default in uncontrolled mode |
| `disabled` | `boolean` | `false` | If `true`, disables the accordion |
| `expanded` | `boolean` | | Controls the expanded state in controlled mode |
| `onChange` | `function` | | Callback fired when the expanded state changes |
| `disableGutters` | `boolean` | `false` | If `true`, removes the padding around the accordion |
| `square` | `boolean` | `false` | If `true`, removes the rounded corners |
| `variant` | `'elevation'` \| `'outlined'` | `'elevation'` | The variant to use for styling |
| `elevation` | `number` | `1` | Shadow depth for elevation variant |
| `TransitionComponent` | `elementType` | `Collapse` | Component used for the transition |
| `TransitionProps` | `object` | `{}` | Props applied to the transition component |
| `ariaLabel` | `string` | | Accessibility label |
| `ariaControls` | `string` | | ID of the element controlled by the accordion |

### AccordionSummaryAdapted Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | | The content of the summary |
| `expandIcon` | `node` | `<ExpandMoreIcon />` | Icon to display for expand/collapse |
| `disabled` | `boolean` | `false` | If `true`, disables the accordion summary |
| `expanded` | `boolean` | | Expanded state (usually provided by AccordionAdapted) |
| `onChange` | `function` | | Callback when clicked (usually provided by AccordionAdapted) |
| `ariaControls` | `string` | | ID of the controlled content section |

### AccordionDetailsAdapted Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | | The content of the details section |

## Usage Examples

### Basic Usage

```jsx
import { 
  AccordionAdapted, 
  AccordionSummaryAdapted, 
  AccordionDetailsAdapted 
} from '../../../design-system/adapter';

function SimpleAccordion() {
  return (
    <AccordionAdapted>
      <AccordionSummaryAdapted>
        Expansion Panel 1
      </AccordionSummaryAdapted>
      <AccordionDetailsAdapted>
        <p>Panel content goes here. This can include any components or text.</p>
      </AccordionDetailsAdapted>
    </AccordionAdapted>
  );
}
```

### Controlled Accordion

```jsx
import { useState } from 'react';
import { 
  AccordionAdapted, 
  AccordionSummaryAdapted, 
  AccordionDetailsAdapted 
} from '../../../design-system/adapter';

function ControlledAccordion() {
  const [expanded, setExpanded] = useState(false);
  
  const handleChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };
  
  return (
    <AccordionAdapted
      expanded={expanded}
      onChange={handleChange}
    >
      <AccordionSummaryAdapted>
        Controlled Accordion
      </AccordionSummaryAdapted>
      <AccordionDetailsAdapted>
        <p>This accordion's state is controlled externally.</p>
      </AccordionDetailsAdapted>
    </AccordionAdapted>
  );
}
```

### Multiple Accordions

```jsx
import { useState } from 'react';
import { 
  AccordionAdapted, 
  AccordionSummaryAdapted, 
  AccordionDetailsAdapted 
} from '../../../design-system/adapter';

function AccordionGroup() {
  const [expanded, setExpanded] = useState(false);
  
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  return (
    <div>
      <AccordionAdapted
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
      >
        <AccordionSummaryAdapted>
          Panel 1
        </AccordionSummaryAdapted>
        <AccordionDetailsAdapted>
          <p>Content for panel 1</p>
        </AccordionDetailsAdapted>
      </AccordionAdapted>
      
      <AccordionAdapted
        expanded={expanded === 'panel2'}
        onChange={handleChange('panel2')}
      >
        <AccordionSummaryAdapted>
          Panel 2
        </AccordionSummaryAdapted>
        <AccordionDetailsAdapted>
          <p>Content for panel 2</p>
        </AccordionDetailsAdapted>
      </AccordionAdapted>
      
      <AccordionAdapted
        expanded={expanded === 'panel3'}
        onChange={handleChange('panel3')}
      >
        <AccordionSummaryAdapted>
          Panel 3
        </AccordionSummaryAdapted>
        <AccordionDetailsAdapted>
          <p>Content for panel 3</p>
        </AccordionDetailsAdapted>
      </AccordionAdapted>
    </div>
  );
}
```

## Accessibility

The AccordionAdapted component implements the following accessibility features:

- Proper ARIA attributes (`aria-expanded`, `aria-controls`, `aria-disabled`)
- Keyboard navigation support (Enter and Space keys)
- Focus management for keyboard users
- Screen reader announcements for state changes

## Customization

The appearance can be customized using the following approaches:

```jsx
<AccordionAdapted 
  variant="outlined" 
  sx={{
    backgroundColor: 'background.paper',
    '& .MuiAccordionSummary-root': {
      minHeight: 60,
      backgroundColor: 'primary.lighter'
    }
  }}
>
  <AccordionSummaryAdapted 
    expandIcon={<CustomIcon />}
    sx={{ fontWeight: 'bold' }}
  >
    Custom Styled Accordion
  </AccordionSummaryAdapted>
  <AccordionDetailsAdapted>
    <p>Custom styled content area</p>
  </AccordionDetailsAdapted>
</AccordionAdapted>
```