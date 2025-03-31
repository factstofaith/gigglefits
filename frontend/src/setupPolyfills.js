/**
 * Setup polyfills for the application
 */

import './polyfills';

// Initialize any global polyfills
console.debug('Setting up polyfills');

// Export a function to manually trigger polyfill setup if needed
export function initPolyfills() {
  console.debug('Manually initializing polyfills');
}

export default {
  initPolyfills
};
