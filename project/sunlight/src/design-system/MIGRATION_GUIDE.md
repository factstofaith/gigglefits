# Design System Migration Guide

This guide explains how to migrate components to use the new standardized design system adapter.

## Why Migrate?

- Prevent duplicate imports
- Standardize component usage
- Reduce bundle size
- Improve maintainability
- Fix build errors related to duplicate declarations

## Migration Steps

### 1. Update Imports

Replace Material UI direct imports with the adapter imports:

```javascript
// BEFORE
import { Button, TextField } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';

// AFTER
import { Button, TextField, useMediaQuery, AddIcon } from '@design-system/optimized';
```

### 2. Fix Duplicate Imports

Look for components that are imported multiple times in different formats:

```javascript
// BEFORE - problematic
import { useMediaQuery } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery'; // Duplicate!

// AFTER
import { useMediaQuery } from '@design-system/optimized';
```

### 3. Component Naming Consistency

Ensure consistent naming for components:

```javascript
// BEFORE - inconsistent
import { Button as MuiButton } from '@mui/material';
import TextField from '@mui/material/TextField';

// AFTER - consistent
import { Button, TextField } from '@design-system/optimized';
```

## Common Issues & Solutions

### IntegrationFlowCanvas.jsx

This component has duplicate imports of `useMediaQuery` which causes build errors:

```javascript
// BEFORE - problematic
import { useMediaQuery } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery'; // Duplicate!

// AFTER - fixed
import { useMediaQuery } from '@design-system/optimized';
```

### Missing Component Imports

If you see errors like:

```
'LinearProgress' is not defined  react/jsx-no-undef
```

Add the component to your imports:

```javascript
// Add missing component
import { LinearProgress } from '@design-system/optimized';
```

### Test Files

For test files, you can mock the design system adapter:

```javascript
// In your test file
jest.mock('@design-system/optimized', () => ({
  Button: jest.fn((props) => <button {...props} />),
  TextField: jest.fn((props) => <input {...props} />),
  // Add other components as needed
}));
```

## Progressive Migration Strategy

1. Start with components that have build errors
2. Move to components that are being actively developed
3. Gradually migrate remaining components
4. Update tests to use the new pattern

## Verification

After migrating a component, verify that:

1. The component builds without errors
2. The component behaves as expected
3. Tests pass
4. The UI renders correctly

## Support

If you encounter any issues or have questions about the migration process, please ask the development team for assistance.