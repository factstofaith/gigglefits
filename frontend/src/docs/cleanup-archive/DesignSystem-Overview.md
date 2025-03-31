# TAP Integration Platform Design System

This document provides an overview of the TAP Integration Platform design system, its components, and usage guidelines.

## Introduction

The TAP Integration Platform design system provides a collection of reusable UI components, design tokens, and patterns to ensure a consistent user experience across the application. It offers a unified approach to styling, accessibility, and responsiveness.

## Key Features

- **Consistent UI**: Standardized components and patterns
- **Accessibility**: Built-in ARIA support and keyboard navigation
- **Responsive Design**: Components adapt to different screen sizes
- **Theming**: Support for light/dark mode and customization
- **Performance**: Optimized components for faster rendering

## Setup

Wrap your application with the `ThemeProvider`:

```jsx
import { ThemeProvider } from '../design-system';

function App() {
  return (
    <ThemeProvider>
      {/* Your application components */}
    </ThemeProvider>
  );
}
```

## Component Categories

### Core Components

- **Typography**: Text styling for headings, paragraphs, and more
- **Button**: Action triggers with multiple variants and states
- **Icon**: Visual elements for enhancing UI clarity

### Layout Components

- **Box**: Basic layout container with style props
- **Stack**: Vertical or horizontal arrangement of elements
- **Grid**: Responsive grid system
- **Card**: Contained content sections

### Form Components

- **TextField**: Text input with various states and styles
- **Select**: Dropdown selection component
- **Checkbox**: Boolean selection component
- **Radio**: Single selection from multiple options
- **Switch**: Toggle between two states
- **FormField**: Wrapper for form controls with labels and error states

### Feedback Components

- **Alert**: Status and notification messages
- **Toast**: Temporary notifications
- **Dialog**: Modal interactions
- **Progress**: Loading indicators (circular and linear)
- **Skeleton**: Loading placeholders

### Navigation Components

- **Tabs**: Content organization with tabs
- **Breadcrumbs**: Hierarchical navigation path
- **Menu**: Dropdown options
- **Pagination**: Page navigation

### Display Components

- **Chip**: Compact elements for tags or filters
- **Badge**: Notification indicators
- **List**: Consistent listing of items
- **Table**: Structured data display

## Usage Examples

See [DesignSystemUsage.md](DesignSystemUsage.md) for comprehensive examples of each component.

## Design Tokens

The design system is built around a set of design tokens that define the visual language:

### Colors

- Primary: Used for primary actions and focus
- Secondary: Used for secondary actions
- Error: Used for error states
- Warning: Used for warning states
- Info: Used for informational states
- Success: Used for success states
- Background: Page and component backgrounds
- Text: Text colors with various emphasis levels

### Typography

- Font family: System fonts optimized for readability
- Font sizes: Consistent size scale from xs to xl
- Font weights: Regular, medium, and bold options
- Line heights: Optimized for readability

### Spacing

Consistent spacing scale from xs to xl, used for margins, padding, and layout.

### Breakpoints

- xs: <600px (mobile)
- sm: 600px-960px (tablet)
- md: 960px-1280px (small desktop)
- lg: 1280px-1920px (large desktop)
- xl: >1920px (extra large screens)

## Theming

The design system supports theming through the ThemeProvider component:

```jsx
import { ThemeProvider, lightTheme, darkTheme } from '../design-system';

function App({ userPrefersDarkMode }) {
  const theme = userPrefersDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeProvider theme={theme}>
      {/* Your application components */}
    </ThemeProvider>
  );
}
```

## Responsive Design

Use the `useMediaQuery` hook for responsive behavior:

```jsx
import { useMediaQuery, Box } from '../design-system';

function ResponsiveComponent() {
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  
  return (
    <Box 
      p={isSmallScreen ? 'sm' : 'lg'}
      display={isSmallScreen ? 'block' : 'flex'}
    >
      {isSmallScreen ? 'Mobile view' : 'Desktop view'}
    </Box>
  );
}
```

## Accessibility

The design system prioritizes accessibility:

- ARIA attributes are built into components
- Keyboard navigation is supported
- Color contrast meets WCAG standards
- Focus states are clearly visible
- Screen reader support

## Best Practices

1. **Use design tokens**: For spacing, colors, and typography
2. **Follow component patterns**: Use established patterns for consistency
3. **Composition over customization**: Combine simple components for complex UI
4. **Responsive design**: Design for mobile first, then enhance for larger screens
5. **Consistent spacing**: Use the spacing tokens instead of arbitrary pixel values
6. **Semantic colors**: Use semantic color names instead of hardcoded values

## Getting Help

- Check the component examples in `/frontend/src/design-system/docs/examples`
- See `/frontend/src/design-system/docs/DesignSystemUsage.md` for detailed examples
- For migration from legacy components, see `DesignSystem-Migration.md`