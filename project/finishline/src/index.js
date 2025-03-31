/**
 * TAP Integration Platform
 * Main entry point for the library
 */

// Export components
export * from './components/common';

// Export hooks
export * from './hooks';

// Export utilities
export * from './utils';

// Export contexts
export * from './contexts';

// Default export with version info
const TapIntegrationPlatform = {
  version: '1.0.0',
  description: 'TAP Integration Platform components library',
};

export default TapIntegrationPlatform;