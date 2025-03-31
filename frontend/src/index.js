// index.js - Main entry point for the TAP Integration Platform package

// Export all design system components
export * from './design-system/adapted/index.js';

// Export utility adapters
export * from './utils/react-compat-adapters.js';

// Export core React context providers
export * from './contexts/NotificationContext.jsx';
export * from './contexts/ConfigContext.jsx';

// Default entry point for the NPM package
const TapIntegrationPlatform = {
  version: '1.0.0',
  description: 'TAP Integration Platform components library',
};

export default TapIntegrationPlatform;

export { default as App } from './App';
export { default as AppRoutes } from './AppRoutes';
export { default as config } from './config';
export { default as main } from './main';
export { default as polyfills } from './polyfills';
export { default as setupPolyfills } from './setupPolyfills';
export { default as setupTests } from './setupTests';
export { default as test_config } from './test_config';
export { default as theme } from './theme';
