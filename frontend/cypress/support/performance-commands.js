// ***********************************************
// Custom Cypress performance testing commands
// ***********************************************

/**
 * Measures page load performance metrics
 * @param {string} pageName - The name of the page being tested
 * @param {Object} options - Additional options for the test
 */
Cypress.Commands.add('measurePageLoad', (pageName, options = {}) => {
  const {
    thresholds = {
      domContentLoaded: 1000,
      load: 2000,
      firstPaint: 800,
      firstContentfulPaint: 1000
    },
    logResult = true,
    saveResult = true
  } = options;
  
  // Create an object to store performance metrics
  const metrics = {};
  
  // Get performance metrics from browser
  cy.window().then(win => {
    // Get basic navigation timing metrics
    const perfData = win.performance.timing;
    const navStart = perfData.navigationStart;
    
    metrics.domContentLoaded = perfData.domContentLoadedEventEnd - navStart;
    metrics.load = perfData.loadEventEnd - navStart;
    metrics.dns = perfData.domainLookupEnd - perfData.domainLookupStart;
    metrics.connection = perfData.connectEnd - perfData.connectStart;
    metrics.ttfb = perfData.responseStart - navStart;
    metrics.domInteractive = perfData.domInteractive - navStart;
    metrics.domComplete = perfData.domComplete - navStart;
    
    // Get paint metrics if available
    const paintMetrics = win.performance.getEntriesByType('paint');
    if (paintMetrics.length > 0) {
      paintMetrics.forEach(paintMetric => {
        if (paintMetric.name === 'first-paint') {
          metrics.firstPaint = paintMetric.startTime;
        }
        if (paintMetric.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = paintMetric.startTime;
        }
      });
    }
    
    // Log metrics if requested
    if (logResult) {
      cy.log(`Performance metrics for ${pageName}:`);
      Object.entries(metrics).forEach(([key, value]) => {
        const thresholdValue = thresholds[key];
        let statusSymbol = '';
        
        if (thresholdValue !== undefined) {
          statusSymbol = value <= thresholdValue ? '✅' : '❌';
        }
        
        cy.log(`${key}: ${Math.round(value)}ms ${statusSymbol}`);
      });
    }
    
    // Save metrics if requested
    if (saveResult) {
      // Store metrics in Cypress.env for later retrieval
      Cypress.env('performanceMetrics', Cypress.env('performanceMetrics') || {});
      Cypress.env('performanceMetrics')[pageName] = metrics;
    }
    
    // Check metrics against thresholds if provided
    Object.entries(thresholds).forEach(([key, threshold]) => {
      if (metrics[key] !== undefined) {
        expect(
          metrics[key], 
          `${key} should be less than ${threshold}ms (was ${Math.round(metrics[key])}ms)`
        ).to.be.at.most(threshold);
      }
    });
  });
  
  // Return the metrics for further use
  return cy.wrap(metrics);
});

/**
 * Measures component render performance
 * @param {string} selector - The component selector
 * @param {string} componentName - The name of the component being tested
 * @param {Object} options - Additional options for the test
 */
Cypress.Commands.add('measureComponentRender', (selector, componentName, options = {}) => {
  const {
    threshold = 100,
    iterations = 3,
    logResult = true,
    saveResult = true
  } = options;
  
  // Create an array to store render times
  const renderTimes = [];
  
  // Function to measure render time
  const measureRender = () => {
    return cy.window().then(win => {
      // Start timing
      const startTime = performance.now();
      
      // Force re-render by toggling visibility
      return cy.get(selector)
        .invoke('css', 'display', 'none')
        .wait(10)
        .invoke('css', 'display', 'block')
        .wait(50) // Wait for render to complete
        .then(() => {
          // Calculate render time
          const endTime = performance.now();
          const renderTime = endTime - startTime;
          
          // Add to render times
          renderTimes.push(renderTime);
          
          return renderTime;
        });
    });
  };
  
  // Run multiple iterations to get an average
  cy.wrap(Array(iterations).fill()).each((_, i) => {
    cy.log(`Measuring render time (iteration ${i + 1}/${iterations})...`);
    measureRender();
  }).then(() => {
    // Calculate average render time
    const total = renderTimes.reduce((sum, time) => sum + time, 0);
    const average = total / renderTimes.length;
    
    // Log result if requested
    if (logResult) {
      cy.log(`Average render time for ${componentName}: ${Math.round(average)}ms`);
      cy.log(`Render times: ${renderTimes.map(t => Math.round(t)).join(', ')}ms`);
    }
    
    // Save result if requested
    if (saveResult) {
      Cypress.env('componentRenderTimes', Cypress.env('componentRenderTimes') || {});
      Cypress.env('componentRenderTimes')[componentName] = {
        average,
        times: renderTimes
      };
    }
    
    // Check against threshold if provided
    if (threshold !== null) {
      expect(
        average, 
        `Average render time should be less than ${threshold}ms (was ${Math.round(average)}ms)`
      ).to.be.at.most(threshold);
    }
    
    // Return the results
    return cy.wrap({
      average,
      times: renderTimes
    });
  });
});

/**
 * Measures API response time
 * @param {string} method - The HTTP method
 * @param {string} url - The API endpoint URL
 * @param {string} apiName - The name of the API being tested
 * @param {Object} options - Additional options for the test
 */
Cypress.Commands.add('measureApiResponse', (method, url, apiName, options = {}) => {
  const {
    threshold = 500,
    body = null,
    headers = {},
    logResult = true,
    saveResult = true
  } = options;
  
  // Intercept the API request
  cy.intercept(method, url).as('apiRequest');
  
  // Trigger the API request
  if (body !== null) {
    cy.request({
      method,
      url,
      body,
      headers
    });
  } else {
    cy.request({
      method,
      url,
      headers
    });
  }
  
  // Wait for the request to complete and measure the response time
  cy.wait('@apiRequest').then(interception => {
    const responseTime = interception.duration;
    
    // Log result if requested
    if (logResult) {
      const statusSymbol = responseTime <= threshold ? '✅' : '❌';
      cy.log(`API response time for ${apiName}: ${responseTime}ms ${statusSymbol}`);
    }
    
    // Save result if requested
    if (saveResult) {
      Cypress.env('apiResponseTimes', Cypress.env('apiResponseTimes') || {});
      Cypress.env('apiResponseTimes')[apiName] = responseTime;
    }
    
    // Check against threshold if provided
    if (threshold !== null) {
      expect(
        responseTime, 
        `API response time should be less than ${threshold}ms (was ${responseTime}ms)`
      ).to.be.at.most(threshold);
    }
    
    // Return the response time
    return cy.wrap(responseTime);
  });
});

/**
 * Measures interaction performance (e.g., click, input, etc.)
 * @param {string} selector - The element selector
 * @param {string} action - The action to perform ('click', 'type', etc.)
 * @param {string} actionName - The name of the action being tested
 * @param {Object} options - Additional options for the test
 */
Cypress.Commands.add('measureInteraction', (selector, action, actionName, options = {}) => {
  const {
    threshold = 100,
    actionParams = [],
    waitForSelector = null,
    waitTimeout = 5000,
    logResult = true,
    saveResult = true
  } = options;
  
  // Start timing
  const startTime = performance.now();
  
  // Perform the action
  cy.get(selector).then($el => {
    if (action === 'click') {
      cy.wrap($el).click();
    } else if (action === 'type') {
      cy.wrap($el).type(actionParams[0] || '');
    } else if (action === 'select') {
      cy.wrap($el).select(actionParams[0] || '');
    } else if (action === 'check') {
      cy.wrap($el).check();
    } else if (action === 'uncheck') {
      cy.wrap($el).uncheck();
    } else if (typeof action === 'function') {
      action($el, ...actionParams);
    }
    
    // Wait for selector if provided
    if (waitForSelector) {
      cy.get(waitForSelector, { timeout: waitTimeout }).should('be.visible');
    }
  }).then(() => {
    // Calculate interaction time
    const endTime = performance.now();
    const interactionTime = endTime - startTime;
    
    // Log result if requested
    if (logResult) {
      const statusSymbol = interactionTime <= threshold ? '✅' : '❌';
      cy.log(`Interaction time for ${actionName}: ${Math.round(interactionTime)}ms ${statusSymbol}`);
    }
    
    // Save result if requested
    if (saveResult) {
      Cypress.env('interactionTimes', Cypress.env('interactionTimes') || {});
      Cypress.env('interactionTimes')[actionName] = interactionTime;
    }
    
    // Check against threshold if provided
    if (threshold !== null) {
      expect(
        interactionTime, 
        `Interaction time should be less than ${threshold}ms (was ${Math.round(interactionTime)}ms)`
      ).to.be.at.most(threshold);
    }
    
    // Return the interaction time
    return cy.wrap(interactionTime);
  });
});

/**
 * Measures time to complete a user flow
 * @param {Function} flowFunction - Function containing the flow steps
 * @param {string} flowName - The name of the flow being tested
 * @param {Object} options - Additional options for the test
 */
Cypress.Commands.add('measureUserFlow', (flowFunction, flowName, options = {}) => {
  const {
    threshold = 5000,
    logResult = true,
    saveResult = true
  } = options;
  
  // Start timing
  const startTime = performance.now();
  
  // Execute the flow
  flowFunction().then(() => {
    // Calculate flow time
    const endTime = performance.now();
    const flowTime = endTime - startTime;
    
    // Log result if requested
    if (logResult) {
      const statusSymbol = flowTime <= threshold ? '✅' : '❌';
      cy.log(`User flow time for ${flowName}: ${Math.round(flowTime)}ms ${statusSymbol}`);
    }
    
    // Save result if requested
    if (saveResult) {
      Cypress.env('userFlowTimes', Cypress.env('userFlowTimes') || {});
      Cypress.env('userFlowTimes')[flowName] = flowTime;
    }
    
    // Check against threshold if provided
    if (threshold !== null) {
      expect(
        flowTime, 
        `User flow time should be less than ${threshold}ms (was ${Math.round(flowTime)}ms)`
      ).to.be.at.most(threshold);
    }
    
    // Return the flow time
    return cy.wrap(flowTime);
  });
});

/**
 * Generates a performance report for all collected metrics
 * @param {string} reportName - The name of the report
 */
Cypress.Commands.add('generatePerformanceReport', (reportName = 'Performance Report') => {
  // Collect all metrics
  const pageMetrics = Cypress.env('performanceMetrics') || {};
  const componentRenderTimes = Cypress.env('componentRenderTimes') || {};
  const apiResponseTimes = Cypress.env('apiResponseTimes') || {};
  const interactionTimes = Cypress.env('interactionTimes') || {};
  const userFlowTimes = Cypress.env('userFlowTimes') || {};
  
  // Create report
  const report = {
    reportName,
    timestamp: new Date().toISOString(),
    pageMetrics,
    componentRenderTimes,
    apiResponseTimes,
    interactionTimes,
    userFlowTimes
  };
  
  // Log summary
  cy.log('Performance Report:');
  
  if (Object.keys(pageMetrics).length > 0) {
    cy.log('Page Load Metrics:');
    Object.entries(pageMetrics).forEach(([page, metrics]) => {
      cy.log(`  ${page}:`);
      Object.entries(metrics).forEach(([key, value]) => {
        cy.log(`    ${key}: ${Math.round(value)}ms`);
      });
    });
  }
  
  if (Object.keys(componentRenderTimes).length > 0) {
    cy.log('Component Render Times:');
    Object.entries(componentRenderTimes).forEach(([component, data]) => {
      cy.log(`  ${component}: ${Math.round(data.average)}ms`);
    });
  }
  
  if (Object.keys(apiResponseTimes).length > 0) {
    cy.log('API Response Times:');
    Object.entries(apiResponseTimes).forEach(([api, time]) => {
      cy.log(`  ${api}: ${Math.round(time)}ms`);
    });
  }
  
  if (Object.keys(interactionTimes).length > 0) {
    cy.log('Interaction Times:');
    Object.entries(interactionTimes).forEach(([action, time]) => {
      cy.log(`  ${action}: ${Math.round(time)}ms`);
    });
  }
  
  if (Object.keys(userFlowTimes).length > 0) {
    cy.log('User Flow Times:');
    Object.entries(userFlowTimes).forEach(([flow, time]) => {
      cy.log(`  ${flow}: ${Math.round(time)}ms`);
    });
  }
  
  // Return the report
  return cy.wrap(report);
});