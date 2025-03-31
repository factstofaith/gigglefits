// documentation-commands.js
// -----------------------------------------------------------------------------
// Custom Cypress commands for testing the Documentation Portal functionality

/**
 * Navigate to the documentation portal
 * Assumes user is already logged in
 */
Cypress.Commands.add('navigateToDocumentation', () => {
  cy.log('Navigating to Documentation Portal');
  
  // Navigate to documentation through the main navigation
  cy.get('a[href*="/documentation"]').click();
  cy.url().should('include', '/documentation');
  
  // Verify page loaded correctly
  cy.contains('h1', 'TAP Integration Platform Documentation').should('be.visible');
});

/**
 * Search documentation
 * @param {String} searchTerm - The search term
 */
Cypress.Commands.add('searchDocumentation', (searchTerm) => {
  cy.log(`Searching documentation with term: ${searchTerm}`);
  
  // Locate and use the search field
  cy.get('input[placeholder*="Search"]').clear().type(searchTerm);
  
  // Verify search applied
  cy.get('input[placeholder*="Search"]').should('have.value', searchTerm);
});

/**
 * Browse documentation category
 * @param {String} category - The category to browse
 */
Cypress.Commands.add('browseDocumentationCategory', (category) => {
  cy.log(`Browsing documentation category: ${category}`);
  
  // Click on the category card or link
  cy.contains('.MuiCard-root', category).click();

  // Verify category page loaded
  cy.contains(category).should('be.visible');
  cy.url().should('include', 'documentation'); // URL may have category ID
});

/**
 * View documentation page
 * @param {String} pageTitle - The title of the documentation page to view
 */
Cypress.Commands.add('viewDocumentationPage', (pageTitle) => {
  cy.log(`Viewing documentation page: ${pageTitle}`);
  
  // Find and click on the documentation article with the given title
  cy.contains(pageTitle).click();
  
  // Verify page content loaded
  cy.contains('h1, h2, h3, h4, h5, h6', pageTitle).should('be.visible');
});

/**
 * Navigate to documentation analytics
 * Assumes user is logged in as admin
 */
Cypress.Commands.add('navigateToDocumentationAnalytics', () => {
  cy.log('Navigating to Documentation Analytics');
  
  // Navigate to admin area first
  cy.get('a[href*="/admin"]').click();
  cy.url().should('include', '/admin');
  
  // Navigate to documentation analytics section
  cy.contains('Documentation Analytics').click();
  
  // Verify analytics dashboard loaded
  cy.contains('Documentation Analytics').should('be.visible');
  cy.contains('Total Views').should('be.visible');
});

/**
 * Filter analytics by date range
 * @param {String} timePeriod - The time period to filter by (day, week, month, year, all)
 */
Cypress.Commands.add('filterAnalyticsByDateRange', (timePeriod) => {
  cy.log(`Filtering analytics by time period: ${timePeriod}`);
  
  // Open the time period selector
  cy.get('[id="time-period-select"]').click();
  
  // Select the specified time period
  let displayedPeriod = '';
  switch(timePeriod) {
    case 'day':
      displayedPeriod = 'Last 24 Hours';
      break;
    case 'week':
      displayedPeriod = 'Last 7 Days';
      break;
    case 'month':
      displayedPeriod = 'Last 30 Days';
      break;
    case 'year':
      displayedPeriod = 'Last Year';
      break;
    case 'all':
      displayedPeriod = 'All Time';
      break;
    default:
      displayedPeriod = timePeriod;
  }
  
  cy.contains(displayedPeriod).click();
  
  // Verify filter applied
  cy.contains(displayedPeriod).should('be.visible');
});

/**
 * Submit documentation feedback
 * @param {String} pageTitle - The title of the documentation page
 * @param {String} rating - The rating (positive/negative)
 * @param {String} comment - The feedback comment
 */
Cypress.Commands.add('submitDocumentationFeedback', (pageTitle, rating, comment) => {
  cy.log(`Submitting ${rating} feedback for: ${pageTitle}`);
  
  // View the documentation page first
  cy.viewDocumentationPage(pageTitle);
  
  // Find and click the feedback button based on rating
  if (rating === 'positive') {
    cy.get('[aria-label="Positive feedback"]').click();
  } else {
    cy.get('[aria-label="Negative feedback"]').click();
  }
  
  // Enter comment if provided
  if (comment) {
    cy.get('textarea[placeholder*="Tell us more"]').type(comment);
  }
  
  // Submit feedback
  cy.contains('button', 'Submit Feedback').click();
  
  // Verify feedback submitted
  cy.contains('Thank you for your feedback').should('be.visible');
});

/**
 * View documentation feedback report
 * Assumes user is on the documentation analytics page
 */
Cypress.Commands.add('viewFeedbackReport', () => {
  cy.log('Viewing feedback report');
  
  // Navigate to the feedback tab
  cy.contains('[role="tab"]', 'Feedback').click();
  
  // Verify feedback report loaded
  cy.contains('Feedback Summary').should('be.visible');
  cy.contains('Positive Feedback').should('be.visible');
  cy.contains('Negative Feedback').should('be.visible');
});

/**
 * Check page for accessibility issues
 * @param {String} context - The context for logging
 */
Cypress.Commands.add('checkDocumentationA11y', (context = 'documentation page') => {
  cy.log(`Checking accessibility for: ${context}`);
  cy.injectAxe();
  cy.checkA11y(null, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
  }, (violations) => {
    cy.task('log', `${violations.length} accessibility violations found in ${context}`);
    violations.forEach((violation) => {
      cy.task('log', `Violation: ${violation.id} - ${violation.description}`);
    });
  });
});