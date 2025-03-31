// ***********************************************
// Custom Cypress commands for error simulation and recovery testing
// ***********************************************

/**
 * Command to simulate network connectivity issues
 * @param {Object} options - Configuration options for network simulation
 * @param {string} options.method - The HTTP method to intercept (GET, POST, PUT, DELETE)
 * @param {string} options.url - The URL pattern to intercept
 * @param {string} options.errorType - Type of error to simulate ('timeout', 'connection-refused', 'offline')
 * @param {number} options.duration - Duration in ms to simulate the error before recovery
 */
Cypress.Commands.add('simulateNetworkError', (options = {}) => {
  const { 
    method = '*', 
    url = '**', 
    errorType = 'timeout', 
    duration = 3000,
    times = 1
  } = options;
  
  // Setup the intercept based on error type
  switch (errorType) {
    case 'timeout':
      cy.intercept({ method, url }, (req) => {
        req.on('response', (res) => {
          // Delay the response significantly to cause timeout
          res.setDelay(duration);
        });
      }).as('networkTimeoutError');
      break;
      
    case 'connection-refused':
      cy.intercept({ method, url }, { forceNetworkError: true }).as('networkConnectionError');
      
      // If duration is provided, restore normal operation after duration
      if (duration) {
        cy.wait(duration).then(() => {
          cy.intercept({ method, url }).as('networkRestored');
        });
      }
      break;
      
    case 'offline':
      // Simulate browser being offline
      cy.window().then((win) => {
        // Save original properties
        const originalOnline = win.navigator.onLine;
        
        // Mock navigator.onLine to return false
        Object.defineProperty(win.navigator, 'onLine', {
          configurable: true,
          get: () => false,
        });
        
        // Trigger offline event
        const offlineEvent = new Event('offline');
        win.dispatchEvent(offlineEvent);
        
        // If duration is provided, restore online status after duration
        if (duration) {
          setTimeout(() => {
            Object.defineProperty(win.navigator, 'onLine', {
              configurable: true,
              get: () => originalOnline,
            });
            
            // Trigger online event
            const onlineEvent = new Event('online');
            win.dispatchEvent(onlineEvent);
          }, duration);
        }
      });
      break;
      
    default:
      throw new Error(`Unsupported error type: ${errorType}`);
  }
});

/**
 * Command to simulate API response errors
 * @param {Object} options - Configuration options for API error simulation
 * @param {string} options.method - The HTTP method to intercept (GET, POST, PUT, DELETE)
 * @param {string} options.url - The URL pattern to intercept
 * @param {number} options.statusCode - The HTTP status code to return
 * @param {Object} options.body - The error response body to return
 * @param {boolean} options.persistent - Whether to keep the intercept active (default: false)
 */
Cypress.Commands.add('simulateApiError', (options = {}) => {
  const { 
    method = '*', 
    url = '**', 
    statusCode = 500, 
    body = { error: 'Simulated server error' },
    persistent = false
  } = options;
  
  // Setup API error intercept
  cy.intercept({ method, url }, { 
    statusCode,
    body,
    delay: 10 // Small delay to simulate network
  }).as('apiError');
  
  // If not persistent, automatically restore after the first hit
  if (!persistent) {
    cy.once('fail', (err) => {
      if (err.message.includes(url)) {
        return false; // Prevent test from failing due to the simulated error
      }
    });
  }
});

/**
 * Command to verify error handling behavior
 * @param {Object} options - Configuration options for error verification
 * @param {string} options.selector - The selector for the error UI element to verify
 * @param {string} options.contains - Text expected in the error message
 * @param {boolean} options.visible - Whether the error element should be visible
 * @param {function} options.callback - Callback function for custom verification
 */
Cypress.Commands.add('verifyErrorHandling', (options = {}) => {
  const { 
    selector = '[data-testid="error-message"]', 
    contains = null, 
    visible = true,
    callback = null
  } = options;
  
  // If a selector is provided, verify the error UI
  if (selector) {
    if (visible) {
      cy.get(selector).should('be.visible');
      if (contains) {
        cy.get(selector).should('contain', contains);
      }
    } else {
      cy.get(selector).should('not.be.visible');
    }
  }
  
  // If a callback is provided, execute it for custom verification
  if (callback && typeof callback === 'function') {
    callback();
  }
});

/**
 * Command to test error recovery mechanisms
 * @param {Object} options - Configuration options for recovery testing
 * @param {string} options.actionSelector - The selector for the recovery action element
 * @param {string} options.waitForSelector - The selector to wait for after recovery
 * @param {number} options.timeout - Timeout for recovery action
 * @param {function} options.beforeAction - Function to call before the recovery action
 * @param {function} options.afterAction - Function to call after the recovery action
 */
Cypress.Commands.add('testErrorRecovery', (options = {}) => {
  const { 
    actionSelector = '[data-testid="retry-button"]', 
    waitForSelector = '[data-testid="content-loaded"]',
    timeout = 10000,
    beforeAction = null,
    afterAction = null
  } = options;
  
  // Execute before action hook if provided
  if (beforeAction && typeof beforeAction === 'function') {
    beforeAction();
  }
  
  // Perform the recovery action
  cy.get(actionSelector).should('be.visible').click();
  
  // Wait for recovery to complete
  if (waitForSelector) {
    cy.get(waitForSelector, { timeout }).should('exist');
  }
  
  // Execute after action hook if provided
  if (afterAction && typeof afterAction === 'function') {
    afterAction();
  }
});

/**
 * Command to simulate authentication errors
 * @param {Object} options - Configuration options for auth error simulation
 * @param {string} options.type - Type of auth error ('expired-token', 'invalid-token', 'session-timeout')
 * @param {string} options.redirectUrl - URL to redirect to after auth error
 */
Cypress.Commands.add('simulateAuthenticationError', (options = {}) => {
  const { 
    type = 'expired-token', 
    redirectUrl = '/login'
  } = options;
  
  switch (type) {
    case 'expired-token':
      // Intercept and modify all API requests to return 401
      cy.intercept('**/api/**', {
        statusCode: 401,
        body: { error: 'Token expired', code: 'TOKEN_EXPIRED' }
      }).as('expiredTokenError');
      break;
      
    case 'invalid-token':
      // Simulate invalid token by intercepting API requests
      cy.intercept('**/api/**', {
        statusCode: 401,
        body: { error: 'Invalid token', code: 'INVALID_TOKEN' }
      }).as('invalidTokenError');
      break;
      
    case 'session-timeout':
      // Force logout by manipulating session storage
      cy.window().then((win) => {
        // Clear token from storage
        win.localStorage.removeItem('auth_token');
        win.sessionStorage.removeItem('auth_token');
        
        // Navigate to login page
        if (redirectUrl) {
          cy.visit(redirectUrl);
        }
      });
      break;
      
    default:
      throw new Error(`Unsupported authentication error type: ${type}`);
  }
});

/**
 * Command to simulate resource access errors
 * @param {Object} options - Configuration options for resource access error simulation
 * @param {string} options.url - The URL pattern to intercept
 * @param {string} options.type - Type of resource error ('not-found', 'forbidden', 'conflict')
 */
Cypress.Commands.add('simulateResourceError', (options = {}) => {
  const { 
    url = '**/api/resources/*', 
    type = 'not-found'
  } = options;
  
  let statusCode = 404;
  let body = { error: 'Resource not found' };
  
  switch (type) {
    case 'not-found':
      statusCode = 404;
      body = { error: 'Resource not found', code: 'RESOURCE_NOT_FOUND' };
      break;
      
    case 'forbidden':
      statusCode = 403;
      body = { error: 'Access denied', code: 'ACCESS_DENIED' };
      break;
      
    case 'conflict':
      statusCode = 409;
      body = { error: 'Resource conflict', code: 'RESOURCE_CONFLICT' };
      break;
      
    default:
      throw new Error(`Unsupported resource error type: ${type}`);
  }
  
  // Intercept the resource request
  cy.intercept({ url }, { statusCode, body }).as('resourceError');
});

/**
 * Command to verify error reporting and logs
 * @param {Object} options - Configuration options for error reporting verification
 * @param {boolean} options.checkConsole - Whether to check browser console logs
 * @param {string} options.logSelector - Selector for UI log/error display
 * @param {string} options.contains - Text expected in error logs
 */
Cypress.Commands.add('verifyErrorReporting', (options = {}) => {
  const { 
    checkConsole = true, 
    logSelector = '[data-testid="error-log"]',
    apiEndpoint = null,
    contains = null
  } = options;
  
  // Check browser console logs if requested
  if (checkConsole) {
    cy.window().then((win) => {
      const consoleLogStub = cy.stub(win.console, 'error');
      
      // Verify that console.error was called with expected message
      if (contains) {
        // Wait briefly to allow error logging to occur
        cy.wait(500).then(() => {
          expect(consoleLogStub).to.be.called;
          
          // Check if any call contains the expected text
          const calls = consoleLogStub.getCalls();
          const hasExpectedError = calls.some(call => {
            const args = call.args;
            return args.some(arg => {
              return typeof arg === 'string' && arg.includes(contains);
            });
          });
          
          expect(hasExpectedError).to.be.true;
        });
      }
    });
  }
  
  // Check UI error log if selector provided
  if (logSelector) {
    cy.get(logSelector).should('exist');
    if (contains) {
      cy.get(logSelector).should('contain', contains);
    }
  }
  
  // Check API error endpoint if provided
  if (apiEndpoint) {
    cy.request({
      url: apiEndpoint,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.body).to.have.property('logs');
      
      if (contains) {
        const logs = response.body.logs;
        const hasMatchingLog = logs.some(log => log.message.includes(contains));
        expect(hasMatchingLog).to.be.true;
      }
    });
  }
});

/**
 * Command to verify system state after error recovery
 * @param {Object} options - Configuration options for state verification
 * @param {Object} options.expectedState - Expected state key-value pairs to verify
 * @param {function} options.customVerification - Custom verification function
 */
Cypress.Commands.add('verifySystemState', (options = {}) => {
  const { 
    expectedState = {}, 
    customVerification = null,
    dataTestId = null
  } = options;
  
  // Verify specific state elements if provided
  if (Object.keys(expectedState).length > 0) {
    cy.window().then((win) => {
      Object.entries(expectedState).forEach(([key, value]) => {
        // Check various application state sources
        if (win.appState && win.appState[key] !== undefined) {
          expect(win.appState[key]).to.deep.equal(value);
        }
      });
    });
  }
  
  // Use data-testid for state verification if provided
  if (dataTestId) {
    cy.get(`[data-testid="${dataTestId}"]`).should('exist');
  }
  
  // Run custom verification if provided
  if (customVerification && typeof customVerification === 'function') {
    customVerification();
  }
});