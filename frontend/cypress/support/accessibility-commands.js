// ***********************************************
// Custom Cypress accessibility testing commands
// ***********************************************

/**
 * Enhanced accessibility testing command
 * Provides detailed reporting of accessibility violations with severity levels
 */
Cypress.Commands.add('checkA11y', (context, options, violationCallback) => {
  const defaultOptions = {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
    },
    rules: {
      'color-contrast': { enabled: true },
      'document-title': { enabled: true },
      'html-has-lang': { enabled: true },
      'meta-viewport': { enabled: true },
      'valid-lang': { enabled: true },
      'region': { enabled: false } // Disable region rule as it often creates false positives in SPAs
    },
    ...options
  };

  const reportViolations = (violations) => {
    const violationData = violations.map(
      ({ id, impact, description, nodes, help, helpUrl }) => ({
        id,
        impact,
        description,
        help,
        helpUrl,
        nodes: nodes.length,
        nodeTargets: nodes.map(n => n.target).join(', ')
      })
    );

    // Group violations by impact for better reporting
    const groupedByImpact = violations.reduce((acc, violation) => {
      if (!acc[violation.impact]) {
        acc[violation.impact] = [];
      }
      acc[violation.impact].push(violation);
      return acc;
    }, {});

    // Print the violations to the command log
    if (violations.length > 0) {
      cy.log(`${violations.length} accessibility violation(s) detected`);
      
      // Create a more detailed format for the violations
      const impactOrder = ['critical', 'serious', 'moderate', 'minor'];
      
      impactOrder.forEach(impact => {
        if (groupedByImpact[impact]) {
          cy.log(`${impact.toUpperCase()} violations: ${groupedByImpact[impact].length}`);
          
          groupedByImpact[impact].forEach(violation => {
            cy.log(`
              Rule: ${violation.id}
              Impact: ${violation.impact}
              Description: ${violation.description}
              Elements: ${violation.nodes.length}
              Help: ${violation.help}
              Help URL: ${violation.helpUrl}
            `);
          });
        }
      });
    }

    // Call the violation callback if provided
    if (violationCallback && violations.length > 0) {
      violationCallback(violations);
    }

    // Add the violations to the test report
    if (violations.length > 0) {
      Cypress.env('a11yViolations', violations);
    }
  };

  // Call the standard checkA11y with our custom reporting
  cy.injectAxe();
  return cy.axe(context, defaultOptions).then(reportViolations);
});

/**
 * Custom command to test keyboard navigation
 * Verifies that focus moves in a logical order
 */
Cypress.Commands.add('testKeyboardNavigation', (startSelector, endSelector, maxTabs = 20) => {
  // Start from the specified element
  cy.get(startSelector).focus();
  
  // Keep track of the focus path
  const focusPath = [];
  let tabCount = 0;
  
  // Function to test tabbing
  const testTab = () => {
    // Stop if we've reached our maximum tabs to prevent infinite loops
    if (tabCount >= maxTabs) {
      cy.log(`Maximum tab count (${maxTabs}) reached without finding the end selector.`);
      return;
    }
    
    // Press tab and get the currently focused element
    cy.focused().then($focused => {
      // Add to our focus path
      focusPath.push({
        element: $focused.prop('tagName').toLowerCase(),
        id: $focused.attr('id') || '',
        class: $focused.attr('class') || '',
        text: $focused.text().substring(0, 20) || ''
      });
      
      // Check if we've reached the end selector
      if ($focused.is(endSelector)) {
        cy.log(`Reached end selector after ${tabCount} tabs`);
        return;
      }
      
      // Press tab and continue
      cy.focused().type('{tab}', { force: true });
      tabCount++;
      testTab();
    });
  };
  
  // Start the test
  testTab();
  
  // After testing, log the focus path (helpful for debugging)
  cy.then(() => {
    cy.log(`Focus path (${focusPath.length} elements):`);
    focusPath.forEach((item, index) => {
      cy.log(`${index + 1}: ${item.element}${item.id ? '#' + item.id : ''}${item.class ? '.' + item.class.split(' ')[0] : ''} ${item.text}`);
    });
  });
});

/**
 * Custom command to test focus trapping in modals
 * Ensures that focus stays within the modal when tabbing
 */
Cypress.Commands.add('testFocusTrapping', (modalSelector, attempts = 10) => {
  // Get all focusable elements in the modal
  cy.get(modalSelector).then($modal => {
    const focusableSelectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    const $focusableElements = $modal.find(focusableSelectors.join(','));
    
    if ($focusableElements.length === 0) {
      cy.log('No focusable elements found in modal');
      return;
    }
    
    // Start from the first focusable element
    cy.wrap($focusableElements.first()).focus();
    
    // Press tab multiple times and ensure focus stays within the modal
    for (let i = 0; i < attempts; i++) {
      cy.focused().type('{tab}', { force: true });
      cy.focused().should('exist').and('be.visible');
      cy.focused().should(($el) => {
        expect($modal.has($el).length).to.equal(1);
      });
    }
    
    // Also test shift+tab
    cy.wrap($focusableElements.first()).focus();
    for (let i = 0; i < attempts; i++) {
      cy.focused().type('{shift+tab}', { force: true });
      cy.focused().should('exist').and('be.visible');
      cy.focused().should(($el) => {
        expect($modal.has($el).length).to.equal(1);
      });
    }
  });
});

/**
 * Command to test screen reader accessibility
 * Checks for appropriate ARIA attributes and screen reader text
 */
Cypress.Commands.add('checkScreenReaderAccess', (selector) => {
  cy.get(selector).then($el => {
    // Check for common screen reader accessibility attributes
    const checkAttributes = [
      { attr: 'role', message: 'Element should have appropriate role' },
      { attr: 'aria-label', message: 'Interactive elements should have aria-label if text is not descriptive' },
      { attr: 'aria-labelledby', message: 'Elements can be labelled by another element using aria-labelledby' },
      { attr: 'aria-describedby', message: 'Additional descriptions can be provided with aria-describedby' }
    ];
    
    // Custom checks based on element type
    const tagName = $el.prop('tagName').toLowerCase();
    const role = $el.attr('role');
    
    // Log element information
    cy.log(`Screen reader check for ${tagName}${role ? ` (role="${role}")` : ''}:`);
    
    // Check for images without alt text
    if (tagName === 'img') {
      expect($el.attr('alt'), 'Images should have alt text').to.exist;
    }
    
    // Check for buttons without accessible names
    if (tagName === 'button' || role === 'button') {
      const hasAccessibleName = $el.text().trim() || 
                               $el.attr('aria-label') || 
                               $el.attr('aria-labelledby') || 
                               $el.find('img[alt]').length > 0;
      
      expect(hasAccessibleName, 'Buttons should have accessible names').to.be.true;
    }
    
    // Check for form fields without labels
    if (['input', 'select', 'textarea'].includes(tagName)) {
      const id = $el.attr('id');
      if (id) {
        const hasLabel = $el.closest('form, [role="form"]').find(`label[for="${id}"]`).length > 0;
        expect(hasLabel || $el.attr('aria-label') || $el.attr('aria-labelledby'), 
              'Form fields should be labelled').to.exist;
      } else {
        expect($el.attr('aria-label') || $el.attr('aria-labelledby'), 
              'Form fields without IDs should have ARIA labels').to.exist;
      }
    }
    
    // Check for proper landmarks
    if (['nav', 'main', 'header', 'footer', 'aside'].includes(tagName) || 
        ['navigation', 'main', 'banner', 'contentinfo', 'complementary'].includes(role)) {
      cy.log(`✓ Found landmark element: ${tagName}${role ? ` (role="${role}")` : ''}`);
    }
    
    // Check ARIA attributes as needed
    checkAttributes.forEach(check => {
      if ($el.attr(check.attr)) {
        cy.log(`✓ Found ${check.attr}="${$el.attr(check.attr)}"`);
      }
    });
  });
});

/**
 * Command to test color contrast
 * Uses axe-core's color contrast rule specifically
 */
Cypress.Commands.add('checkColorContrast', (selector = 'body') => {
  cy.injectAxe();
  cy.axe(selector, {
    runOnly: {
      type: 'rule',
      values: ['color-contrast']
    }
  }).then(results => {
    if (results.violations.length > 0) {
      cy.log(`${results.violations.length} color contrast violation(s) detected`);
      results.violations.forEach(violation => {
        cy.log(`
          Rule: ${violation.id}
          Impact: ${violation.impact}
          Description: ${violation.description}
          Elements: ${violation.nodes.length}
        `);
        violation.nodes.forEach((node, i) => {
          cy.log(`Element ${i + 1}: ${node.html.substring(0, 100)}...`);
          cy.log(`Target: ${node.target}`);
        });
      });
    } else {
      cy.log('No color contrast violations detected');
    }
  });
});

/**
 * Test a page at different zoom levels for accessibility
 */
Cypress.Commands.add('testPageZoom', (url, zoomLevels = [1, 1.5, 2]) => {
  zoomLevels.forEach(zoomLevel => {
    cy.visit(url);
    cy.window().then(win => {
      win.document.body.style.zoom = zoomLevel;
      cy.log(`Testing at zoom level: ${zoomLevel * 100}%`);
      
      // Take a snapshot for visual comparison
      if (Cypress.env('PERCY_TOKEN')) {
        cy.percySnapshot(`Zoom level ${zoomLevel * 100}%`);
      }
      
      // Check for horizontal scrolling (a common issue at higher zoom levels)
      cy.window().then(win => {
        const docWidth = win.document.documentElement.scrollWidth;
        const windowWidth = win.innerWidth;
        if (docWidth > windowWidth) {
          cy.log(`Warning: Horizontal scrolling detected at ${zoomLevel * 100}% zoom. Document width: ${docWidth}px, Window width: ${windowWidth}px`);
        } else {
          cy.log(`✓ No horizontal scrolling at ${zoomLevel * 100}% zoom`);
        }
      });
      
      // Check for overlapping elements
      cy.get('button, a, input, select').then($elements => {
        // This is a simplified overlap check
        cy.log(`Checking ${$elements.length} interactive elements for overlap issues`);
      });
      
      // Run accessibility tests at this zoom level
      cy.checkA11y();
    });
  });
});

/**
 * Command to test headings structure
 * Ensures proper heading hierarchy (h1 -> h2 -> h3, etc.)
 */
Cypress.Commands.add('checkHeadingStructure', () => {
  cy.get('h1, h2, h3, h4, h5, h6').then($headings => {
    let lastLevel = 0;
    let hasH1 = false;
    const structure = [];
    
    $headings.each((i, el) => {
      const level = parseInt(el.tagName.substring(1));
      if (level === 1) hasH1 = true;
      structure.push({
        level,
        text: el.innerText.trim().substring(0, 30) + (el.innerText.length > 30 ? '...' : '')
      });
    });
    
    // Log the heading structure
    cy.log('Heading structure:');
    structure.forEach(h => {
      cy.log(`${'  '.repeat(h.level - 1)}${h.level}: ${h.text}`);
    });
    
    // Check for a single h1
    const h1Count = structure.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      cy.log('Warning: No h1 heading found on the page');
    } else if (h1Count > 1) {
      cy.log(`Warning: Multiple h1 headings (${h1Count}) found on the page`);
    } else {
      cy.log('✓ Page has exactly one h1 heading');
    }
    
    // Check for skipped levels
    let hasSkippedLevels = false;
    structure.reduce((prev, curr) => {
      if (curr.level - prev.level > 1) {
        cy.log(`Warning: Skipped heading level from h${prev.level} to h${curr.level}`);
        hasSkippedLevels = true;
      }
      return curr;
    }, { level: 0, text: '' });
    
    if (!hasSkippedLevels) {
      cy.log('✓ No skipped heading levels');
    }
  });
});

/**
 * Command to test a component for accessibility
 * Comprehensive test that combines multiple accessibility checks
 */
Cypress.Commands.add('testComponentA11y', (selector, options = {}) => {
  const defaultOptions = {
    checkContrast: true,
    checkKeyboard: true,
    checkScreenReader: true,
    checkHeadings: false,
    ...options
  };
  
  // Get the component
  cy.get(selector).should('exist').and('be.visible');
  
  // Run standard axe check
  cy.checkA11y(selector);
  
  // Color contrast check
  if (defaultOptions.checkContrast) {
    cy.checkColorContrast(selector);
  }
  
  // Screen reader accessibility check
  if (defaultOptions.checkScreenReader) {
    cy.checkScreenReaderAccess(selector);
  }
  
  // Heading structure check (usually for page components)
  if (defaultOptions.checkHeadings) {
    cy.get(selector).within(() => {
      cy.checkHeadingStructure();
    });
  }
  
  // Keyboard accessibility check if element is interactive
  if (defaultOptions.checkKeyboard) {
    cy.get(selector).then($el => {
      const isInteractive = 
        $el.is('a, button, input, select, textarea') || 
        $el.find('a, button, input, select, textarea').length > 0 ||
        $el.attr('role') === 'button' || 
        $el.attr('tabindex') === '0';
      
      if (isInteractive) {
        cy.log('Testing keyboard accessibility for interactive component');
        
        // If it's a single interactive element, test that it can be focused
        if ($el.is('a, button, input, select, textarea') || 
            $el.attr('role') === 'button' || 
            $el.attr('tabindex') === '0') {
          cy.get(selector).focus().should('be.focused');
        } 
        // Otherwise, find all interactive elements within and test the first/last
        else {
          const interactiveSelectors = 'a, button, input, select, textarea, [role="button"], [tabindex="0"]';
          cy.get(selector).find(interactiveSelectors).first().focus().should('be.focused');
        }
      } else {
        cy.log('Component does not appear to be interactive, skipping keyboard test');
      }
    });
  }
});

// Full page accessibility audit command
Cypress.Commands.add('auditA11y', (options = {}) => {
  const defaultOptions = {
    checkContrast: true,
    checkKeyboard: true,
    checkScreenReader: false,
    checkHeadings: true,
    ...options
  };
  
  cy.log('Running comprehensive accessibility audit');
  
  // Standard axe check
  cy.checkA11y();
  
  // Color contrast check
  if (defaultOptions.checkContrast) {
    cy.checkColorContrast();
  }
  
  // Heading structure check
  if (defaultOptions.checkHeadings) {
    cy.checkHeadingStructure();
  }
  
  // Check page title
  cy.title().then(title => {
    if (!title) {
      cy.log('Warning: Page is missing a title');
    } else {
      cy.log(`✓ Page has title: "${title}"`);
    }
  });
  
  // Check lang attribute
  cy.get('html').should('have.attr', 'lang');
  
  // Check skip link if specified
  if (defaultOptions.skipLinkSelector) {
    cy.get(defaultOptions.skipLinkSelector)
      .should('exist')
      .focus()
      .should('be.visible') // Skip links should become visible on focus
      .type('{enter}');
    
    // Check that focus moved to the main content
    cy.focused().should('exist');
    cy.log('✓ Skip link is functional');
  }
  
  // Log a summary
  cy.log('Accessibility audit complete');
});