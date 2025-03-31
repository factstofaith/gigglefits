# TAP Integration Platform Design System

Welcome to the TAP Integration Platform Design System. This directory contains all the components, patterns, and foundation elements that make up our design system.

## Overview

The design system uses a layered architecture designed to support a gradual migration from Material UI to a custom implementation.

### Directory Structure

```
design-system/
├── adapter.js         # Central adapter providing compatibility
├── index.js           # Main entry point
├── components/        # Core design system components
│   ├── core/          # Fundamental components (Button, etc.)
│   ├── display/       # Display components (Card, Typography, etc.)
│   ├── form/          # Form components (TextField, etc.)
│   ├── feedback/      # Feedback components (Alert, etc.)
│   └── navigation/    # Navigation components (Tabs, etc.)
├── adapted/           # Adapted components (compatibility layer)
│   ├── core/
│   ├── display/
│   ├── form/
│   ├── feedback/
│   └── navigation/
└── foundations/       # Design system foundations
    ├── theme/         # Theme configuration
    └── tokens/        # Design tokens

packages/
└── legacy-components/ # Legacy components moved to separate package
    ├── index.js       # Entry point re-exporting all components
    ├── components/    # Legacy component implementations
    └── package.json   # Package configuration
```

## Migration Architecture

The design system is structured using an adapter pattern to facilitate a gradual migration:

1. **Legacy Components** (`/legacy/*Legacy.jsx`): 
   - Provide backward compatibility with Material UI
   - Ensure existing code continues to work during migration

2. **Adapted Components** (`/adapted/**/*Adapted.jsx`): 
   - Bridge between Material UI and design system
   - Map props between different component models
   - Enhance components with additional features

3. **Core Components** (`/components/**/*.jsx`):
   - Implement the actual design system
   - Provide the source of truth for component behavior

## Recommended Usage

The recommended way to import components is through the central adapter:

```jsx
import { Button, Card, Typography } from '../../design-system/adapter';

function MyComponent() {
  return (
    <Card>
      <Typography variant="h2">Hello Design System</Typography>
      <Button variant="primary">Click Me</Button>
    </Card>
  );
}
```

This ensures your code will continue to work as the underlying implementation evolves.

## Design Principles

1. **Consistency**: Components should provide a consistent user experience
2. **Accessibility**: All components must meet WCAG 2.1 AA standards
3. **Flexibility**: Components should be flexible yet adhere to design guidelines
4. **Simplicity**: API should be intuitive and easy to use
5. **Performance**: Components should be optimized for performance

## Component Development Guidelines

When creating new components:

1. **Follow the Migration Path**:
   - Create the core implementation first
   - Create an adapted version if needed
   - Update the adapter.js file to export the component

2. **Maintain Compatibility**:
   - Ensure backward compatibility with existing code
   - Follow the established naming conventions
   - Document API changes

3. **Quality Standards**:
   - Include thorough type definitions with PropTypes and/or TypeScript
   - Write comprehensive documentation
   - Create tests for each layer (core, adapted, legacy)
   - Ensure the component meets accessibility standards

## Documentation

For more information on using and extending the design system, see:

- [Component Standards](./adapted/COMPONENT_STANDARDS.md)
- [Testing Guide](./adapted/TESTING.md)
- [Design System Adaptation Map](../../project/Sunlight/DESIGN_SYSTEM_ADAPTATION_MAP.md)