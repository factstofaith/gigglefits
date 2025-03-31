# TAP Platform Component Library

A comprehensive component library for building applications within the TAP Integration Platform ecosystem.

## Features

- Reusable UI components based on Material-UI
- Consistent theming across applications
- TypeScript support with full type definitions
- Comprehensive documentation
- Accessibility compliant components
- Storybook integration for interactive component exploration

## Installation

```bash
npm install @tap-platform/component-library
```

## Usage

### Basic Usage

```jsx
import React from 'react';
import { Button, Typography, ThemeProvider } from '@tap-platform/component-library';

function App() {
  return (
    <ThemeProvider>
      <Typography variant="h1">Hello World</Typography>
      <Button variant="contained" color="primary">
        Click Me
      </Button>
    </ThemeProvider>
  );
}
```

### Custom Theming

You can customize the theme by providing theme options:

```jsx
import React from 'react';
import { ThemeProvider } from '@tap-platform/component-library';

// Custom theme options
const themeOptions = {
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
};

function App() {
  return (
    <ThemeProvider themeOptions={themeOptions}>
      {/* Your application */}
    </ThemeProvider>
  );
}
```

## Component Categories

The library includes the following component categories:

### Core Components

- `Button` - Button component for user interactions
- `Typography` - Text component with consistent styling
- `ThemeProvider` - Provider for consistent theming

### Display Components

- `Avatar` - User avatar component
- `Badge` - Badge component for notifications
- `Chip` - Chip component for displaying compact elements
- `List` - List component for displaying items in a list
- `Table` - Table component for displaying tabular data

### Feedback Components

- `Alert` - Alert component for displaying messages
- `CircularProgress` - Circular loading indicator
- `Dialog` - Modal dialog component
- `LinearProgress` - Linear loading indicator
- `Skeleton` - Placeholder loading component
- `Toast` - Toast notification component

### Form Components

- `Checkbox` - Checkbox input component
- `DatePicker` - Date selection component
- `FormField` - Form field wrapper component
- `Radio` - Radio button component
- `Select` - Dropdown selection component
- `Slider` - Slider input component
- `Switch` - Toggle switch component
- `TextField` - Text input component

### Layout Components

- `Box` - Flexible box component
- `Card` - Card container component
- `Grid` - Grid layout component
- `Stack` - Stack layout component

### Navigation Components

- `Breadcrumbs` - Breadcrumb navigation component
- `Menu` - Menu component for dropdown menus
- `Pagination` - Pagination component
- `Tabs` - Tab navigation component

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/tap-integration-platform.git

# Navigate to the component library directory
cd tap-integration-platform/packages/component-library

# Install dependencies
npm install
```

### Development Commands

```bash
# Start Storybook for development
npm run storybook

# Build the library
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

### Adding a New Component

1. Create a new component file in the appropriate category directory
2. Add component exports to src/index.ts
3. Create a story file for the component
4. Add tests for the component
5. Document the component with JSDoc comments

## Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.