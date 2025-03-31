/**
 * MSW Mock Server (Browser-compatible version)
 * 
 * This is a simplified version that avoids using Node.js modules
 * that are not available in the browser environment.
 */
import { setupWorker } from 'msw';
import { handlers } from './handlers';

// Setup MSW in a browser-compatible way
let worker;

// Only initialize if we're in a browser environment
if (typeof window !== 'undefined') {
  worker = setupWorker(...handlers);
}

// Export functions with fallbacks to avoid Node.js dependencies
export const server = {
  listen: () => {
    if (worker) {
      worker.start();
    } else {
    }
  },
  resetHandlers: () => {
    if (worker) {
      worker.resetHandlers();
    }
  },
  close: () => {
    if (worker) {
      worker.stop();
    }
  },
  use: (handlers) => {
    if (worker) {
      worker.use(...handlers);
    }
  }
};