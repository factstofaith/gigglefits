# Project Sunlight: Frontend Optimization

This project focuses on optimizing the TAP Integration Platform frontend codebase to resolve compilation issues, standardize code patterns, and eliminate technical debt.

## Overview

Project Sunlight aims to create a fully standardized, maintainable, and high-quality codebase by addressing:

- ESLint warnings and errors
- TypeScript configuration issues
- React component structure
- Duplicate dependencies
- Design system standardization
- React hooks rule violations
- Context implementations
- Service patterns
- Build process optimization

## Getting Started

The easiest way to get started is to use the interactive starter script:

```bash
cd project/sunlight
./start.sh
```

This will guide you through the different phases and options available.

## Standardization Phases

Project Sunlight uses a phased approach to systematically eliminate technical debt:

### Phase 1: Initial Setup & Direct Fixes
Sets up the foundation and applies direct fixes to critical issues.

```bash
npm run run:phase1
```

### Phase 2: Component Standardization
Standardizes components, removes duplicates, and fixes import patterns.

```bash
npm run run:phase2
```

### Phase 3: Hook & Context Standardization
Fixes React Hook violations and standardizes context implementations.

```bash
npm run run:phase3
```

### Phase 4-6: Additional Standardization (Coming Soon)
Future phases will address services, utilities, tests, documentation, and build optimization.

## Technical Debt Tracking

We track progress in eliminating technical debt using the ClaudeContext.md file and the technical debt audit script:

```bash
npm run audit
```

This will analyze the codebase and update the Technical Debt Elimination Tracker in ClaudeContext.md.

## Project Structure

```
project/sunlight/
├── scripts/                       # Optimization and fix scripts
│   ├── fix-html-entities.js           # Fix HTML entity escaping issues
│   ├── fix-jsx-syntax.js              # Fix JSX syntax errors
│   ├── fix-react-hooks.js             # Fix React Hooks violations
│   ├── fix-component-display-names.js # Add display names to components
│   ├── run-all-fixes.js               # Run all fixes in sequence
│   ├── verify-build.js                # Verify build status
│   ├── apply-improvements.js          # Apply all improvements and track changes
│   ├── transform-components.js        # Transform components to use design system adapter
│   ├── remove-deprecated.js           # Remove deprecated components
│   ├── standardize-hooks.js           # Standardize React hooks
│   ├── standardize-contexts.js        # Standardize context implementations
│   └── audit-technical-debt.js        # Audit and track technical debt
├── src/                           # Source code
│   └── design-system/             # Standardized design system
│       ├── adapter.js                 # Centralized component adapter
│       ├── index.js                   # Entry point re-exports
│       └── MIGRATION_GUIDE.md         # Guide for migrating components
├── ClaudeContext.md               # Project planning and tracking
├── COMMIT_TEMPLATE.md             # Standardized commit message template
├── eslint.config.js               # Standardized ESLint config
├── package.json                   # Project scripts and configuration
├── README.md                      # Project documentation
├── start.sh                       # Interactive starter script
└── tsconfig.json                  # Optimized TypeScript config
```

## Design System Standardization

We've implemented a standardized design system adapter that centralizes component imports:

```javascript
// Before - problematic approach with duplicate imports
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';

// After - standardized approach
import { Button, TextField, useMediaQuery } from '@design-system/optimized';
```

See `src/design-system/MIGRATION_GUIDE.md` for detailed migration instructions.

## Technical Best Practices

The project enforces these technical best practices:

- **Consistent Component Structure**: Using design system adapter
- **React Hooks Rules**: Proper hook usage and dependency arrays
- **Context Implementation**: Standardized provider pattern with custom hooks
- **TypeScript Integration**: Proper typing and configuration
- **Code Quality**: ESLint rules and automated fixes
- **Component Reusability**: Removing duplicates and standardizing interfaces
- **Build Optimization**: Improved webpack configuration

## Contributing

When adding new code or fixes to this project:

1. Follow the coding standards in eslint.config.js
2. Use the design system adapter for component imports
3. Follow React hooks rules
4. Use the commit message template in COMMIT_TEMPLATE.md
5. Update ClaudeContext.md with your progress