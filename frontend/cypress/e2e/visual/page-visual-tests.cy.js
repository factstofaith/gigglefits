// cypress/e2e/visual/page-visual-tests.cy.js

/**
 * Visual Regression Tests for Pages
 * 
 * Tests the visual appearance of pages to ensure visual consistency
 */
describe('Page Visual Regression Tests', () => {
  let pages;

  before(() => {
    // Load the page test data
    cy.fixture('visual/components.json').then((data) => {
      pages = data.pages;
    });
  });

  describe('Public Pages', () => {
    it('should test login page visual appearance', () => {
      // Clear any existing login state
      cy.window().then(win => {
        win.localStorage.removeItem('isLoggedIn');
        win.localStorage.removeItem('token');
      });
      
      cy.visit('/login');
      
      // Wait for page to fully load
      cy.get('form').should('be.visible');
      cy.wait(1000); // Wait for animations to complete
      
      // Take snapshot of login page
      cy.visualSnapshot('Login Page');
      
      // Test responsive variations
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1280, height: 800 } // Desktop
      ];
      
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.wait(500); // Wait for responsive adjustments
        cy.visualSnapshot(`Login Page - ${viewport.width}x${viewport.height}`);
      });
      
      // Test form with validation errors
      cy.get('[data-testid="submit-login"]').click();
      cy.wait(300); // Wait for validation errors to appear
      cy.visualSnapshot('Login Page - With Validation Errors');
    });

    it('should test registration page visual appearance', () => {
      cy.visit('/register');
      
      // Wait for page to load
      cy.get('form').should('be.visible');
      cy.wait(1000);
      
      // Take snapshot
      cy.visualSnapshot('Registration Page');
    });
  });

  describe('Authenticated Pages', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should test all defined pages for visual consistency', () => {
      // Test each page defined in the fixture
      pages.forEach(page => {
        if (page.url.startsWith('/')) {
          cy.log(`Testing page: ${page.name}`);
          
          // Visit the page
          cy.visit(page.url);
          
          // Wait for page to load
          if (page.waitForSelector) {
            cy.get(page.waitForSelector).should('be.visible');
          }
          cy.wait(1000); // Wait for animations to complete
          
          // Hide dynamic content if specified
          if (page.hideSelectors && page.hideSelectors.length > 0) {
            page.hideSelectors.forEach(selector => {
              cy.get('body').then($body => {
                if ($body.find(selector).length > 0) {
                  cy.get(selector).invoke('css', 'visibility', 'hidden');
                }
              });
            });
          }
          
          // Use visualTestPage command
          cy.visualTestPage(page.name, {
            waitForSelector: page.waitForSelector,
            hideSelectors: page.hideSelectors
          });
        }
      });
    });

    it('should test dashboard page with different data states', () => {
      cy.visit('/');
      
      // Wait for dashboard to load
      cy.get('[data-testid="dashboard-page"]').should('be.visible');
      cy.wait(1000);
      
      // Take snapshot of loaded dashboard
      cy.visualSnapshot('Dashboard - Loaded State');
      
      // Test empty state if possible
      cy.window().then(win => {
        // Check if we have a way to simulate empty state
        if (win.mockEmptyDashboard) {
          win.mockEmptyDashboard();
          cy.wait(500);
          cy.visualSnapshot('Dashboard - Empty State');
        }
      });
      
      // Test loading state if possible
      cy.window().then(win => {
        // Check if we have a way to simulate loading state
        if (win.mockLoadingDashboard) {
          win.mockLoadingDashboard();
          cy.wait(500);
          cy.visualSnapshot('Dashboard - Loading State');
        }
      });
    });
  });

  describe('Layout Components', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should test navigation bar in different states', () => {
      cy.visit('/');
      
      // Wait for navigation bar to load
      cy.get('[data-testid="main-navigation"]').should('be.visible');
      
      // Take snapshot of navigation
      cy.visualSnapshot('Navigation Bar - Default');
      
      // Test active state (click a navigation item)
      cy.get('[data-testid="nav-integrations"]').click();
      cy.wait(500); // Wait for navigation to update
      cy.visualSnapshot('Navigation Bar - Integrations Active');
      
      // Test different viewport sizes
      cy.viewport('iphone-x');
      cy.wait(500); // Wait for responsive layout changes
      cy.visualSnapshot('Navigation Bar - Mobile');
      
      // Test mobile menu if it exists
      cy.get('body').then($body => {
        if ($body.find('[data-testid="mobile-menu-button"]').length > 0) {
          cy.get('[data-testid="mobile-menu-button"]').click();
          cy.wait(500); // Wait for mobile menu to open
          cy.visualSnapshot('Navigation Bar - Mobile Menu Open');
        }
      });
      
      // Reset viewport
      cy.viewport(1280, 720);
    });

    it('should test modal dialogs for visual consistency', () => {
      cy.visit('/integrations');
      
      // Open modal dialog
      cy.contains('button', 'New Integration').click();
      
      // Wait for modal to open
      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(500); // Wait for animation to complete
      
      // Take snapshot of modal dialog
      cy.visualSnapshot('Modal Dialog - Integration Creation');
      
      // Test form filling in modal
      cy.get('[data-testid="integration-name"]').type('Test Integration');
      cy.wait(300);
      cy.visualSnapshot('Modal Dialog - Form Filled');
      
      // Test validation error state
      cy.get('[data-testid="integration-name"]').clear();
      cy.get('[data-testid="submit-button"]').click();
      cy.wait(300);
      cy.visualSnapshot('Modal Dialog - Validation Errors');
      
      // Close modal
      cy.get('[aria-label="Close dialog"]').click();
    });
  });

  describe('Responsive Design Tests', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should test responsive behavior of key pages', () => {
      const keysPages = [
        { url: '/', name: 'Dashboard' },
        { url: '/integrations', name: 'Integrations List' },
        { url: '/settings', name: 'Settings' }
      ];
      
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1280, height: 800, name: 'desktop' },
        { width: 1920, height: 1080, name: 'large desktop' }
      ];
      
      // Test each page at each viewport
      keysPages.forEach(page => {
        viewports.forEach(viewport => {
          cy.viewport(viewport.width, viewport.height);
          cy.visit(page.url);
          
          // Wait for page to load
          cy.wait(1000);
          
          // Take snapshot
          cy.visualSnapshot(`${page.name} - ${viewport.name}`);
        });
      });
    });
  });
});