// cypress/e2e/a11y/page-accessibility.cy.js

/**
 * Page Accessibility Tests
 * 
 * Tests the accessibility of each major page in the TAP Integration Platform
 */
describe('Page Accessibility Tests', () => {
  beforeEach(() => {
    cy.injectAxe();
  });

  describe('Public Pages', () => {
    it('should test login page accessibility', () => {
      cy.visit('/login');
      cy.get('form').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
      
      // Test responsiveness by checking different viewport sizes
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1280, height: 800 }, // Desktop
        { width: 1920, height: 1080 } // Large Desktop
      ];
      
      viewports.forEach(size => {
        cy.viewport(size.width, size.height);
        cy.log(`Testing viewport ${size.width}x${size.height}`);
        cy.checkA11y();
      });
    });

    it('should test registration page accessibility', () => {
      cy.visit('/register');
      cy.get('form').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });

    it('should test password reset page accessibility', () => {
      cy.visit('/reset-password');
      cy.get('form').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });
  });

  describe('Authenticated Pages', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should test home dashboard accessibility', () => {
      cy.visit('/');
      cy.get('[data-testid="dashboard-page"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
      
      // Check heading structure
      cy.checkHeadingStructure();
    });

    it('should test integrations page accessibility', () => {
      cy.visit('/integrations');
      cy.get('[data-testid="integrations-page"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });

    it('should test integration detail page accessibility', () => {
      cy.visit('/integrations/1');
      cy.get('[data-testid="integration-detail-page"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });

    it('should test datasets page accessibility', () => {
      cy.visit('/datasets');
      cy.get('[data-testid="datasets-page"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });

    it('should test earnings page accessibility', () => {
      cy.visit('/earnings');
      cy.get('[data-testid="earnings-page"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });

    it('should test user settings page accessibility', () => {
      cy.visit('/settings');
      cy.get('[data-testid="settings-page"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });
  });

  describe('Admin Pages', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should test admin dashboard accessibility', () => {
      cy.visit('/admin');
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });

    it('should test user management page accessibility', () => {
      cy.visit('/admin/users');
      cy.get('[data-testid="user-management"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });

    it('should test monitoring dashboard accessibility', () => {
      cy.visit('/admin/monitoring');
      cy.get('[data-testid="monitoring-dashboard"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });

    it('should test error logs page accessibility', () => {
      cy.visit('/admin/errors');
      cy.get('[data-testid="error-log-viewer"]').should('be.visible');
      
      // Full page audit
      cy.auditA11y({
        checkContrast: true,
        checkKeyboard: true,
        checkHeadings: true
      });
    });
  });

  describe('Modal and Dialog Accessibility', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should test modal dialogs for accessibility', () => {
      cy.visit('/integrations');
      
      // Open an integration creation modal
      cy.contains('button', 'New Integration').click();
      
      // Dialog should be visible
      cy.get('[role="dialog"]').should('be.visible');
      
      // Test dialog accessibility
      cy.get('[role="dialog"]').within(() => {
        cy.checkA11y();
      });
      
      // Test dialog focus management
      cy.testFocusTrapping('[role="dialog"]');
      
      // Check heading structure within dialog
      cy.get('[role="dialog"]').within(() => {
        cy.checkHeadingStructure();
      });
      
      // Test close button
      cy.get('[aria-label="Close dialog"], [data-testid="close-modal"]').should('exist');
      
      // Close dialog
      cy.get('[aria-label="Close dialog"], [data-testid="close-modal"]').click();
      
      // Dialog should be closed
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Theme and Responsive Testing', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should test application at different viewport sizes', () => {
      // Define viewport sizes to test
      const viewports = [
        { width: 320, height: 568, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1280, height: 800, name: 'desktop' }
      ];
      
      // Pages to test
      const pagesToTest = [
        { url: '/', name: 'Dashboard' },
        { url: '/integrations', name: 'Integrations' },
        { url: '/earnings', name: 'Earnings' }
      ];
      
      // Test each page at each viewport
      pagesToTest.forEach(page => {
        viewports.forEach(size => {
          cy.viewport(size.width, size.height);
          cy.visit(page.url);
          cy.log(`Testing ${page.name} at ${size.name} viewport (${size.width}x${size.height})`);
          
          // Wait for page to load
          cy.get('body', { timeout: 10000 }).should('be.visible');
          
          // Check accessibility
          cy.checkA11y();
          
          // Check for horizontal overflow (common responsive issue)
          cy.window().then(win => {
            const docWidth = win.document.documentElement.scrollWidth;
            const windowWidth = win.innerWidth;
            if (docWidth > windowWidth) {
              cy.log(`Warning: Horizontal scrolling detected. Document width: ${docWidth}px, Window width: ${windowWidth}px`);
            } else {
              cy.log(`✓ No horizontal scrolling at ${size.name} viewport`);
            }
          });
        });
      });
    });

    it('should test dark theme accessibility if available', () => {
      cy.visit('/settings');
      
      // Check if dark theme toggle exists
      cy.get('body').then($body => {
        const hasDarkModeToggle = $body.find('[data-testid="theme-toggle"]').length > 0;
        
        if (hasDarkModeToggle) {
          // Toggle dark mode
          cy.get('[data-testid="theme-toggle"]').click();
          
          // Check that dark mode is active
          cy.get('body').should('have.attr', 'data-theme', 'dark')
            .or('have.class', 'dark-theme')
            .or('have.class', 'dark-mode');
            
          // Test key pages in dark mode
          const pagesToTest = [
            '/',
            '/integrations', 
            '/admin'
          ];
          
          pagesToTest.forEach(page => {
            cy.visit(page);
            cy.log(`Testing dark theme accessibility on ${page}`);
            cy.checkA11y();
            cy.checkColorContrast();
          });
          
          // Toggle back to light mode
          cy.visit('/settings');
          cy.get('[data-testid="theme-toggle"]').click();
        } else {
          cy.log('Dark theme toggle not found, skipping dark theme tests');
        }
      });
    });
  });
});