# Legacy Components Package

This package contains all Legacy components extracted from the TAP Integration Platform design system as part of the aggressive cleanup process. These components were previously located in `/design-system/legacy/`.

## Purpose

These components are kept separate from the main design system to:

1. Keep the core design system clean and focused
2. Make dependencies on Legacy components explicit
3. Facilitate future removal or replacement
4. Provide a clear migration path for the design system

## Component Inventory

This package contains 63 Legacy components including:

- Form components (ButtonLegacy, InputFieldLegacy, etc.)
- Layout components (CardLegacy, GridLegacy, etc.)
- Navigation components (TabsLegacy, MenuItemLegacy, etc.)
- Feedback components (AlertLegacy, TooltipLegacy, etc.)
- Data display components (TableLegacy, TableRowLegacy, etc.)

## Usage

Import Legacy components from this package:

```javascript
import { ButtonLegacy, CardLegacy } from '../packages/legacy-components';
```

Or through the adapter (preferred method):

```javascript
import { Button, Card } from '../design-system/adapter';
```

## Migration Strategy

The adapter.js file in the design system directory has been updated to import from this package location instead of the previous legacy directory. This ensures that existing code continues to work without modification.

Over time, you should aim to:

1. Replace uses of Legacy components with their Adapted or Core equivalents
2. Minimize direct imports from this package
3. Eventually phase out this package completely

## Important Notes

- These components are maintained for backward compatibility only
- No new features should be added to these components
- Prefer the Adapted or Core components for new development

Created: March 28, 2025
