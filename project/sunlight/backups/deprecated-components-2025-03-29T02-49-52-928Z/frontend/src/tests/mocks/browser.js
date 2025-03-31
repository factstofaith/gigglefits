// src/tests/mocks/browser.js
// MSW browser setup for API mocking in development

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker with handlers
export const worker = setupWorker(...handlers)

// Export handlers
export { handlers };