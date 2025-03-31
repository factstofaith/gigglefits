// ***********************************************
// Custom Cypress visual testing commands
// ***********************************************

/**
 * Command to take a Percy snapshot with additional configuration options
 * @param {string} name - The name of the snapshot
 * @param {Object} options - Additional Percy options
 */
Cypress.Commands.add('visualSnapshot', (name, options = {}) => {
  // Generate a unique name including viewport size
  const viewportWidth = Cypress.config('viewportWidth');
  const viewportHeight = Cypress.config('viewportHeight');
  const deviceInfo = `${viewportWidth}x${viewportHeight}`;
  const fullName = `${name} - ${deviceInfo}`;

  // Take the Percy snapshot with options
  cy.percySnapshot(fullName, options);
});

/**
 * Command to test a component visually across multiple states
 * @param {string} selector - The component selector
 * @param {string} name - Base name for the snapshots
 * @param {Object} options - Component test options
 */
Cypress.Commands.add('visualTestComponent', (selector, name, options = {}) => {
  const {
    testHover = true,
    testFocus = true,
    testActive = true,
    testResponsive = true,
    responsiveSizes = ['iphone-x', 'ipad-2', [1280, 720]],
    waitTime = 500
  } = options;

  // Get the component and verify it's visible
  cy.get(selector).should('be.visible').then($component => {
    // Take snapshot of default state
    cy.log(`Taking visual snapshot of ${name} - default state`);
    cy.wrap($component).should('be.visible');
    cy.wait(waitTime); // Give animations time to complete
    cy.visualSnapshot(`${name} - Default`);

    // Test hover state if requested
    if (testHover) {
      cy.log(`Taking visual snapshot of ${name} - hover state`);
      cy.wrap($component).trigger('mouseover', { force: true });
      cy.wait(waitTime); // Give hover animations time to complete
      cy.visualSnapshot(`${name} - Hover`);
      // Reset state
      cy.wrap($component).trigger('mouseout', { force: true });
    }

    // Test focus state if requested
    if (testFocus) {
      cy.log(`Taking visual snapshot of ${name} - focus state`);
      cy.wrap($component).focus({ force: true });
      cy.wait(waitTime); // Give focus animations time to complete
      cy.visualSnapshot(`${name} - Focus`);
      // Reset state
      cy.wrap($component).blur({ force: true });
    }

    // Test active/pressed state if requested
    if (testActive) {
      cy.log(`Taking visual snapshot of ${name} - active state`);
      cy.wrap($component).trigger('mousedown', { force: true });
      cy.wait(waitTime); // Give active animations time to complete
      cy.visualSnapshot(`${name} - Active`);
      // Reset state
      cy.wrap($component).trigger('mouseup', { force: true });
    }
  });

  // Test responsive variations if requested
  if (testResponsive) {
    // Store original viewport
    const originalWidth = Cypress.config('viewportWidth');
    const originalHeight = Cypress.config('viewportHeight');

    // Test each responsive size
    responsiveSizes.forEach(size => {
      if (Array.isArray(size)) {
        // If size is an array [width, height]
        const [width, height] = size;
        cy.viewport(width, height);
        cy.log(`Taking visual snapshot of ${name} at ${width}x${height}`);
      } else {
        // If size is a preset like 'iphone-x'
        cy.viewport(size);
        cy.log(`Taking visual snapshot of ${name} on ${size}`);
      }

      // Wait for viewport change and take snapshot
      cy.wait(waitTime); // Give responsive changes time to apply
      cy.get(selector).should('be.visible');
      cy.visualSnapshot(`${name} - ${typeof size === 'string' ? size : size.join('x')}`);
    });

    // Restore original viewport
    cy.viewport(originalWidth, originalHeight);
  }
});

/**
 * Command to test a page visually across multiple breakpoints
 * @param {string} pageName - Name of the page for snapshots
 * @param {Object} options - Page test options
 */
Cypress.Commands.add('visualTestPage', (pageName, options = {}) => {
  const {
    waitForSelector = 'body',
    responsiveSizes = ['iphone-x', 'ipad-2', [1280, 720]],
    waitTime = 1000,
    hideSelectors = [],
    percyOptions = {}
  } = options;

  // Wait for the page to be ready
  cy.get(waitForSelector).should('be.visible');
  cy.wait(waitTime); // Wait for animations/loading to complete

  // Hide dynamic content that would cause visual test flakiness
  hideSelectors.forEach(selector => {
    cy.get(selector).invoke('css', 'visibility', 'hidden');
  });

  // Take snapshot of the current viewport
  cy.visualSnapshot(`${pageName} - Default View`, percyOptions);

  // Store original viewport
  const originalWidth = Cypress.config('viewportWidth');
  const originalHeight = Cypress.config('viewportHeight');

  // Test each responsive size
  responsiveSizes.forEach(size => {
    if (Array.isArray(size)) {
      // If size is an array [width, height]
      const [width, height] = size;
      cy.viewport(width, height);
      cy.log(`Taking visual snapshot of ${pageName} at ${width}x${height}`);
    } else {
      // If size is a preset like 'iphone-x'
      cy.viewport(size);
      cy.log(`Taking visual snapshot of ${pageName} on ${size}`);
    }

    // Wait for viewport change and take snapshot
    cy.wait(waitTime); // Give responsive changes time to apply
    cy.get(waitForSelector).should('be.visible');

    // Hide dynamic content again (it might have reappeared)
    hideSelectors.forEach(selector => {
      cy.get(selector).invoke('css', 'visibility', 'hidden');
    });

    cy.visualSnapshot(`${pageName} - ${typeof size === 'string' ? size : size.join('x')}`, percyOptions);
  });

  // Restore original viewport
  cy.viewport(originalWidth, originalHeight);
});

/**
 * Command to perform a visual diff test for a specific component
 * @param {string} componentName - Name of the component being tested
 * @param {string} selector - CSS selector for the component
 * @param {Object} options - Additional options for the test
 */
Cypress.Commands.add('visualDiffComponent', (componentName, selector, options = {}) => {
  const {
    testStates = ['default'],
    actions = {},
    cleanup = () => {},
    waitTime = 500
  } = options;

  cy.get(selector).should('be.visible').then($component => {
    // Test each state
    testStates.forEach(state => {
      // Apply the state if there's an action for it
      if (actions[state]) {
        actions[state]($component);
        cy.wait(waitTime); // Wait for state change to complete
      }

      // Take snapshot
      cy.visualSnapshot(`${componentName} - ${state}`);
    });

    // Run cleanup if provided
    cleanup();
  });
});

/**
 * Command to compare light and dark theme for a component
 * @param {string} componentName - Name of the component
 * @param {string} selector - Component selector
 * @param {Object} options - Additional test options
 */
Cypress.Commands.add('visualThemeTest', (componentName, selector, options = {}) => {
  const {
    themeToggleSelector = '[data-testid="theme-toggle"]',
    waitTime = 1000
  } = options;

  // First test in current theme (assumed to be light)
  cy.get(selector).should('be.visible');
  cy.wait(waitTime); // Wait for component to fully render
  cy.visualSnapshot(`${componentName} - Light Theme`);

  // Toggle to dark theme if the toggle exists
  cy.get('body').then($body => {
    if ($body.find(themeToggleSelector).length > 0) {
      cy.get(themeToggleSelector).click();
      cy.wait(waitTime); // Wait for theme change to apply

      // Take snapshot in dark theme
      cy.get(selector).should('be.visible');
      cy.visualSnapshot(`${componentName} - Dark Theme`);

      // Toggle back to light theme
      cy.get(themeToggleSelector).click();
    } else {
      cy.log('Theme toggle not found, skipping dark theme test');
    }
  });
});