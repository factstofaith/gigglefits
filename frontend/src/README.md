# TAP Integration Platform Frontend

## Project Overview

This project is a comprehensive frontend application for the TAP Integration Platform, featuring a design system and various features like search, integrations management, and more.

## Key Components

### Design System

The design system provides a consistent visual language and component library:

- **Foundations**: Theme provider, color tokens, typography, spacing, breakpoints
- **Core Components**: Typography, Button, ThemeSwitcher
- **Layout Components**: Box, Stack, Card, Grid
- **Form Components**: TextField, FormField, Select

Documentation:
- [Design System Documentation](./design-system/README.md)

### Key Features

#### Search Feature

The search feature enables users to find content across the platform:

- **GlobalSearchProvider**: Context provider for search state
- **GlobalSearchBar**: Search input with suggestions
- **SearchResultsPage**: Detailed search results with filtering

#### Flow Canvas

Visual interface for building integration flows with drag-and-drop functionality:

- **IntegrationFlowCanvas**: Main canvas component
- **EnhancedNodePalette**: Component selection panel
- **ContextualPropertiesPanel**: Dynamic property editing

#### Notification System

Comprehensive notification system for both temporary and persistent notifications:

- **Toast**: Temporary notifications that auto-dismiss
- **NotificationCenter**: UI for accessing persistent notifications
- **notificationHelper**: Utility for service-triggered notifications

Documentation:
- [Feature Documentation](./docs/features/README.md)

## Directory Structure

```
frontend/src/
├── design-system/              # Design system components
│   ├── components/             # UI components
│   │   ├── core/               # Core components
│   │   ├── form/               # Form components
│   │   └── layout/             # Layout components
│   ├── foundations/            # Design system foundation
│   │   ├── theme/              # Theme provider and themes
│   │   └── tokens/             # Design tokens
│   └── hooks/                  # Custom hooks
├── features/                   # Feature modules
│   └── search/                 # Search feature
├── docs/                       # Documentation
└── App.example.jsx             # Example app implementation
```

## Getting Started

1. Make sure to wrap your application with the necessary providers:

```jsx
import { ThemeProvider } from './design-system';
import { GlobalSearchProvider } from './features/search';

function App() {
  return (
    <ThemeProvider>
      <GlobalSearchProvider>
        {/* Your application here */}
      </GlobalSearchProvider>
    </ThemeProvider>
  );
}
```

2. Use the design system components to build your UI:

```jsx
import { Box, Typography, Button } from './design-system';

function MyComponent() {
  return (
    <Box p="lg">
      <Typography variant="h4">My Component</Typography>
      <Button variant="contained" color="primary">
        Click Me
      </Button>
    </Box>
  );
}
```

3. Integrate the search feature:

```jsx
import { GlobalSearchBar } from './features/search';

function Header() {
  return (
    <header>
      <Logo />
      <GlobalSearchBar />
      <Navigation />
    </header>
  );
}
```

## Example Applications

We've created two example applications to demonstrate the design system and search feature:

1. **Basic Example**: `App.example.jsx` - A simple example showing how to use the design system and search feature together.

2. **Extended Example**: `App.extended.jsx` - A comprehensive example that showcases all design system components, including:
   - Theme switching with ThemeSwitcher
   - Responsive layouts with Grid
   - Form components with validation
   - Advanced card layouts
   - Complete design system demo page

## Contributing

When adding new components or features:

1. Follow the established patterns and conventions
2. Update relevant documentation
3. Ensure components are accessible and responsive
4. Consider how the component fits into the design system