# TypeScript Integration Guide

## Overview

This document provides guidelines for using the TypeScript type system in the TAP Integration Platform. It covers the type definitions for the design system components, how to use them in your code, and how to extend them for new components.

## Type Definitions

The design system provides TypeScript definitions for all components through:

1. **Interface files** - Located in `src/design-system/types/`
2. **JSDoc annotations** - In component source files
3. **Declaration files** - `.d.ts` files for components

## Using Type Definitions

### Importing Component Types

```typescript
// Import from the types directory
import { ButtonProps } from '@design-system/types';

// Or import directly from the component
import { ButtonProps } from '@design-system/adapted/core/ButtonAdapted';
```

### Using Component Types

```typescript
import { Button } from '@design-system/adapter';
import { ButtonProps } from '@design-system/types';

// Type for your component props
interface MyComponentProps {
  primaryButtonProps: ButtonProps;
  secondaryButtonProps?: ButtonProps;
}

function MyComponent({ primaryButtonProps, secondaryButtonProps }: MyComponentProps) {
  return (
    <div>
      <Button {...primaryButtonProps} />
      {secondaryButtonProps && <Button {...secondaryButtonProps} />}
    </div>
  );
}
```

### Generic Components

Some components like DataGridAdapted support generics for stronger typing:

```typescript
import { DataGrid } from '@design-system/adapter';
import { DataGridAdaptedProps } from '@design-system/types';

// Define your data type
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Use the generic version of DataGridAdaptedProps
const userGridProps: DataGridAdaptedProps<UserData> = {
  columns: [
    { field: 'name', headerName: 'Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'role', headerName: 'Role' }
  ],
  rows: users, // Type-safe, must be UserData[]
  onRowClick: (row) => {
    // TypeScript knows 'row' is UserData
    console.log(row.name);
  }
};

function UserGrid() {
  return <DataGrid {...userGridProps} />;
}
```

## Type Categories

### Common Types

Located in `types/common.d.ts`:

- `SxProps` - Styling props
- `AccessibilityProps` - ARIA attributes
- `ComponentStateProps` - State props like disabled
- `ClickHandler`, `ChangeHandler`, etc. - Event handlers

### Component-Specific Types

Organized by component category:

- `core.d.ts` - Button, ErrorBoundary, etc.
- `form.d.ts` - TextField, Select, etc.
- `display.d.ts` - Typography, Table, etc.
- `feedback.d.ts` - Alert, Modal, etc.
- `navigation.d.ts` - Tabs, Link, etc.
- `complex-components.d.ts` - DataGrid, TabsPanel, etc.

## Type Checking

### Build Integration

TypeScript checking is integrated into the build process:

- Development: `npm run typecheck:watch`
- Production: `npm run typecheck` (runs during build)
- CI/CD: `npm run typecheck:ci`

### Strict Mode

While the project uses `strict: false` globally, we aim for strict typing in new code.

## Extending Type Definitions

### Creating New Component Types

1. Add interface to appropriate category file
2. Extend common types as needed
3. Export from `index.d.ts`
4. Add JSDoc to component

### Example:

```typescript
// In types/display.d.ts
export interface MyComponentProps extends SxProps, AccessibilityProps {
  /** Primary content */
  children: React.ReactNode;
  /** Component variant */
  variant?: 'default' | 'primary' | 'secondary';
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

// In MyComponent.jsx
/**
 * @component MyComponent
 * @description Description of the component
 * @typedef {import('../../types/display').MyComponentProps} MyComponentProps
 * @type {React.FC<MyComponentProps>}
 */
```

## Best Practices

1. Use TypeScript interfaces for all components
2. Extend common types for consistency
3. Add JSDoc annotations to leverage type checking in JS files
4. Run `typecheck` regularly during development
5. Add declaration files for all public components
6. Use generics for data-driven components
7. Document all props with JSDoc comments

## Additional Resources

- [TypeScript React Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Official TypeScript Documentation](https://www.typescriptlang.org/docs/)