// This file is loaded before Jest starts to run tests
// It should contain only the minimum required polyfills

// Import TextEncoder/TextDecoder from text-encoding package
require('text-encoding');

// This file will be loaded by Jest before any tests run
console.log('Jest setup: TextEncoder and TextDecoder have been polyfilled using text-encoding package');