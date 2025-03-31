// documentation-portal.cy.js
// -----------------------------------------------------------------------------
// E2E tests for the Documentation Portal functionality

/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Documentation Portal', () => {
  // Load fixtures before each test
  beforeEach(() => {
    // Load fixtures
    cy.fixture('documentation/categories.json').as('categoryData');
    cy.fixture('documentation/pages.json').as('pageData');
    cy.fixture('documentation/search_results.json').as('searchData');
    cy.fixture('documentation/analytics.json').as('analyticsData');
    cy.fixture('documentation/feedback.json').as('feedbackData');
    cy.fixture('documentation/document_content.json').as('contentData');
    
    // Login as a regular user
    cy.login('user@example.com', 'Password123!');
    
    // Intercept documentation API calls
    cy.intercept('GET', '/documentation-index.json', { fixture: 'documentation/pages.json' }).as('getDocumentationIndex');
    
    // Intercept category API call
    cy.intercept('GET', '/api/documentation/categories', { fixture: 'documentation/categories.json' }).as('getCategories');
    
    // Intercept document content API calls
    cy.intercept('GET', '/documentation/user-guide/getting-started-guide', (req) => {
      cy.get('@contentData').then(content => {
        req.reply(content['getting-started-guide']);
      });
    }).as('getGettingStartedGuide');
    
    cy.intercept('GET', '/documentation/api-reference/rest-api', (req) => {
      cy.get('@contentData').then(content => {
        req.reply(content['rest-api-reference']);
      });
    }).as('getApiReference');
    
    cy.intercept('GET', '/documentation/integration/azure-blob-storage', (req) => {
      cy.get('@contentData').then(content => {
        req.reply(content['azure-blob-integration']);
      });
    }).as('getAzureBlobIntegration');
    
    // Intercept search API calls
    cy.intercept('GET', '/api/documentation/search*', (req) => {
      const searchTerm = req.query.q;
      cy.get('@searchData').then(searchData => {
        if (searchData[searchTerm]) {
          req.reply(searchData[searchTerm]);
        } else {
          // Return empty results if search term not found
          req.reply([]);
        }
      });
    }).as('searchDocumentation');
    
    // Intercept analytics API calls
    cy.intercept('GET', '/api/documentation/analytics/stats*', { fixture: 'documentation/analytics.json' }).as('getAnalytics');
    cy.intercept('GET', '/api/documentation/analytics/search-terms*', (req) => {
      cy.get('@analyticsData').then(data => {
        req.reply(data.searchTerms);
      });
    }).as('getSearchTerms');
    cy.intercept('GET', '/api/documentation/analytics/categories*', (req) => {
      cy.get('@analyticsData').then(data => {
        req.reply(data.categoryData);
      });
    }).as('getCategoryAnalytics');
    cy.intercept('GET', '/api/documentation/analytics/engagement*', (req) => {
      cy.get('@analyticsData').then(data => {
        req.reply(data.engagementData);
      });
    }).as('getEngagementMetrics');
    
    // Intercept feedback API calls
    cy.intercept('POST', '/api/documentation/feedback', (req) => {
      cy.get('@feedbackData').then(data => {
        req.reply({
          success: true,
          message: "Thank you for your feedback!",
          id: `fb-${Date.now()}`
        });
      });
    }).as('submitFeedback');
    
    cy.intercept('GET', '/api/documentation/feedback*', { fixture: 'documentation/feedback.json' }).as('getFeedback');
  });
  
  describe('Documentation Navigation', () => {
    it('should display the documentation home page', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Verify documentation home page elements
      cy.contains('h1', 'TAP Integration Platform Documentation').should('be.visible');
      cy.contains('Find guides, tutorials, and reference documentation').should('be.visible');
      
      // Verify all categories are displayed
      cy.get('@categoryData').then((categories) => {
        categories.forEach(category => {
          cy.contains(category.title).should('be.visible');
          cy.contains(category.description).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('documentation home page');
    });
    
    it('should browse documentation categories', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Get categories from fixture
      cy.get('@categoryData').then((categories) => {
        // Browse User Guides category
        cy.browseDocumentationCategory('User Guides');
        
        // Verify category page elements
        cy.contains('h4', 'User Guides').should('be.visible');
        cy.get('input[placeholder*="Search"]').should('be.visible');
        
        // Verify documents in the category are displayed
        cy.get('@pageData').then(pageData => {
          const categoryDocs = pageData['documentation-index'].filter(doc => doc.category === 'user-guide');
          categoryDocs.forEach(doc => {
            cy.contains(doc.title).should('be.visible');
          });
        });
        
        // Go back to home
        cy.contains('Documentation Home').click();
        
        // Browse API Reference category
        cy.browseDocumentationCategory('API Reference');
        
        // Verify documents in the API category are displayed
        cy.get('@pageData').then(pageData => {
          const categoryDocs = pageData['documentation-index'].filter(doc => doc.category === 'api-reference');
          categoryDocs.forEach(doc => {
            cy.contains(doc.title).should('be.visible');
          });
        });
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('documentation category page');
    });
    
    it('should view documentation pages', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Browse User Guides category
      cy.browseDocumentationCategory('User Guides');
      
      // View a specific document
      cy.viewDocumentationPage('Getting Started Guide');
      cy.wait('@getGettingStartedGuide');
      
      // Verify document content
      cy.contains('h1', 'Getting Started Guide').should('be.visible');
      cy.contains('h2', 'Overview').should('be.visible');
      cy.contains('h2', 'Key Features').should('be.visible');
      cy.contains('Visual Flow Designer').should('be.visible');
      
      // Test navigation within the document
      cy.contains('a', 'Creating Your First Integration').should('be.visible');
      
      // Go back to category
      cy.contains('User Guides').click();
      
      // View another document
      cy.viewDocumentationPage('REST API Reference');
      cy.wait('@getApiReference');
      
      // Verify document content
      cy.contains('h1', 'REST API Reference').should('be.visible');
      cy.contains('h2', 'Authentication').should('be.visible');
      cy.contains('h2', 'API Endpoints').should('be.visible');
      
      // Check accessibility
      cy.checkDocumentationA11y('documentation content page');
    });
    
    it('should use breadcrumb navigation', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Browse category
      cy.browseDocumentationCategory('Integration Guides');
      
      // View a document
      cy.viewDocumentationPage('Azure Blob Storage Integration');
      cy.wait('@getAzureBlobIntegration');
      
      // Verify breadcrumbs are displayed
      cy.contains('Documentation Home').should('be.visible');
      cy.contains('Integration Guides').should('be.visible');
      
      // Navigate back using breadcrumbs
      cy.contains('Integration Guides').click();
      
      // Verify returned to category page
      cy.contains('h4', 'Integration Guides').should('be.visible');
      
      // Navigate back to home using breadcrumbs
      cy.contains('Documentation Home').click();
      
      // Verify returned to home page
      cy.contains('h1', 'TAP Integration Platform Documentation').should('be.visible');
      
      // Check accessibility
      cy.checkDocumentationA11y('breadcrumb navigation');
    });
  });
  
  describe('Documentation Search', () => {
    it('should search documentation from home page', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Search for a term
      cy.searchDocumentation('api');
      cy.wait('@searchDocumentation');
      
      // Verify search results are displayed
      cy.contains('Search Results for "api"').should('be.visible');
      
      // Verify correct results are shown
      cy.get('@searchData').then(searchData => {
        const apiResults = searchData.api;
        apiResults.forEach(result => {
          cy.contains(result.title).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('search results page');
    });
    
    it('should search documentation from category page', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Browse category
      cy.browseDocumentationCategory('Integration Guides');
      
      // Search within category
      cy.searchDocumentation('oauth');
      cy.wait('@searchDocumentation');
      
      // Verify search results are displayed
      cy.get('@searchData').then(searchData => {
        const oauthResults = searchData.oauth;
        // Filter to only show results in the integration category
        const categoryResults = oauthResults.filter(result => result.category === 'integration');
        
        if (categoryResults.length > 0) {
          categoryResults.forEach(result => {
            cy.contains(result.title).should('be.visible');
          });
        } else {
          cy.contains('No documentation found matching your search').should('be.visible');
        }
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('category search results');
    });
    
    it('should display empty search results for non-matching terms', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Search for a non-matching term
      cy.searchDocumentation('nonexistentterm');
      cy.wait('@searchDocumentation');
      
      // Verify empty results message
      cy.contains('No documentation found matching your search').should('be.visible');
      cy.contains('button', 'Clear Search').should('be.visible');
      
      // Clear search
      cy.contains('button', 'Clear Search').click();
      
      // Verify returned to home page
      cy.get('input[placeholder*="Search"]').should('have.value', '');
      
      // Check accessibility
      cy.checkDocumentationA11y('empty search results');
    });
    
    it('should show search highlighting', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Search for a term that will have highlighted results
      cy.searchDocumentation('monitoring');
      cy.wait('@searchDocumentation');
      
      // Verify results have highlighting
      cy.get('@searchData').then(searchData => {
        const monitoringResults = searchData.monitoring;
        if (monitoringResults && monitoringResults.length > 0) {
          // Click on the first result
          cy.contains(monitoringResults[0].title).click();
          
          // Verify document content loads and might have highlighted content
          cy.contains('h1', monitoringResults[0].title).should('be.visible');
        }
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('search highlighting');
    });
  });
  
  describe('Documentation Analytics', () => {
    beforeEach(() => {
      // Login as admin
      cy.login('admin@example.com', 'Password123!');
    });
    
    it('should display the analytics dashboard', () => {
      // Navigate to documentation analytics
      cy.navigateToDocumentationAnalytics();
      cy.wait('@getAnalytics');
      cy.wait('@getSearchTerms');
      cy.wait('@getCategoryAnalytics');
      cy.wait('@getEngagementMetrics');
      
      // Verify overview cards
      cy.contains('Total Views').should('be.visible');
      cy.contains('Unique Documents').should('be.visible');
      cy.contains('Unique Users').should('be.visible');
      cy.contains('Positive Feedback').should('be.visible');
      
      // Verify data displayed
      cy.get('@analyticsData').then(data => {
        cy.contains(data.stats.total_views.toString()).should('be.visible');
        cy.contains(data.stats.unique_documents.toString()).should('be.visible');
        cy.contains(data.stats.unique_users.toString()).should('be.visible');
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('analytics dashboard');
    });
    
    it('should filter analytics by date range', () => {
      // Navigate to documentation analytics
      cy.navigateToDocumentationAnalytics();
      cy.wait('@getAnalytics');
      
      // Filter by different time periods
      cy.filterAnalyticsByDateRange('day');
      cy.wait('@getAnalytics');
      
      // Verify time period is applied
      cy.contains('Last 24 Hours').should('be.visible');
      
      // Filter by month
      cy.filterAnalyticsByDateRange('month');
      cy.wait('@getAnalytics');
      
      // Verify time period is applied
      cy.contains('Last 30 Days').should('be.visible');
      
      // Check accessibility
      cy.checkDocumentationA11y('filtered analytics');
    });
    
    it('should display popular documents tab', () => {
      // Navigate to documentation analytics
      cy.navigateToDocumentationAnalytics();
      cy.wait('@getAnalytics');
      
      // Verify Popular Documents tab is displayed by default
      cy.contains('Popular Documents').should('be.visible');
      cy.contains('Top 10 Most Viewed Documents').should('be.visible');
      
      // Verify data displayed
      cy.get('@analyticsData').then(data => {
        const topDocument = data.stats.top_documents[0];
        cy.contains(topDocument.title).should('be.visible');
        cy.contains(topDocument.views.toString()).should('be.visible');
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('popular documents tab');
    });
    
    it('should display search terms tab', () => {
      // Navigate to documentation analytics
      cy.navigateToDocumentationAnalytics();
      cy.wait('@getAnalytics');
      
      // Navigate to Search Terms tab
      cy.contains('[role="tab"]', 'Search Terms').click();
      
      // Verify search terms tab is displayed
      cy.contains('Top Search Terms').should('be.visible');
      cy.contains('Popular Search Terms').should('be.visible');
      
      // Verify data displayed
      cy.get('@analyticsData').then(data => {
        const topSearchTerm = data.searchTerms[0];
        cy.contains(topSearchTerm.term).should('be.visible');
        cy.contains(topSearchTerm.count.toString()).should('be.visible');
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('search terms tab');
    });
    
    it('should display feedback tab and data', () => {
      // Navigate to documentation analytics
      cy.navigateToDocumentationAnalytics();
      cy.wait('@getAnalytics');
      
      // View feedback report
      cy.viewFeedbackReport();
      
      // Verify feedback tab is displayed
      cy.contains('Feedback Summary').should('be.visible');
      cy.contains('Positive Feedback').should('be.visible');
      cy.contains('Negative Feedback').should('be.visible');
      
      // Verify data displayed
      cy.get('@analyticsData').then(data => {
        cy.contains(data.stats.feedback.positive.toString()).should('be.visible');
        cy.contains(data.stats.feedback.negative.toString()).should('be.visible');
      });
      
      // Check accessibility
      cy.checkDocumentationA11y('feedback tab');
    });
  });
  
  describe('Documentation Feedback', () => {
    it('should submit positive feedback', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Browse category
      cy.browseDocumentationCategory('Integration Guides');
      
      // View a document
      cy.viewDocumentationPage('Azure Blob Storage Integration');
      cy.wait('@getAzureBlobIntegration');
      
      // Submit positive feedback
      cy.submitDocumentationFeedback(
        'Azure Blob Storage Integration', 
        'positive', 
        'This guide was very helpful, thanks!'
      );
      cy.wait('@submitFeedback');
      
      // Verify feedback submission
      cy.contains('Thank you for your feedback').should('be.visible');
      
      // Check accessibility
      cy.checkDocumentationA11y('after feedback submission');
    });
    
    it('should submit negative feedback with comment', () => {
      // Navigate to documentation portal
      cy.navigateToDocumentation();
      cy.wait('@getDocumentationIndex');
      
      // Browse category
      cy.browseDocumentationCategory('API Reference');
      
      // View a document
      cy.viewDocumentationPage('REST API Reference');
      cy.wait('@getApiReference');
      
      // Submit negative feedback with comment
      cy.submitDocumentationFeedback(
        'REST API Reference', 
        'negative', 
        'Missing examples for webhooks integration'
      );
      cy.wait('@submitFeedback');
      
      // Verify feedback submission
      cy.contains('Thank you for your feedback').should('be.visible');
      
      // Check accessibility
      cy.checkDocumentationA11y('after negative feedback submission');
    });
  });
});