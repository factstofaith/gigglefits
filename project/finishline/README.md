# TAP Integration Platform - Optimized Frontend Build

## Overview
This is an optimized build configuration for the TAP Integration Platform frontend. It focuses on providing a standardized, clean architecture with modern build practices.

## Features
- Dual module output (ESM and CommonJS) for maximum compatibility
- Tree-shaking and code splitting for optimal bundle size
- Component standardization for consistent development experience
- Optimized webpack configuration for faster builds
- Integrated testing and linting tools

## Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Build library (both ESM and CJS formats)
npm run build:all
```

## Project Structure
```
/src               # Source code
  /components      # React components
  /hooks           # Custom React hooks
  /utils           # Utility functions
  /contexts        # React contexts
/config            # Webpack and build configurations
/tests             # Test files
```

## Standards
- All components follow a standardized pattern
- TypeScript is used for type safety
- ESLint and Prettier enforce code style
- Jest and Testing Library for unit tests

## Optimization Strategy
- Aggressive code splitting
- Tree-shaking unused code
- Shared dependencies extracted to vendor chunks
- Modern and legacy builds for browser compatibility
