// cypress/e2e/performance/page-load-performance.cy.js

/**
 * Page Load Performance Tests
 * 
 * Tests the load performance of key pages in the application
 */
describe('Page Load Performance Tests', () => {
  let thresholds;

  before(() => {
    // Load performance thresholds
    cy.fixture('performance/thresholds.json').then((data) => {
      thresholds = data;
    });
  });

  describe('Public Pages', () => {
    it('should measure login page load performance', () => {
      // Clear any existing login state
      cy.window().then(win => {
        win.localStorage.removeItem('isLoggedIn');
        win.localStorage.removeItem('token');
      });
      
      cy.visit('/login');
      
      // Wait for page to fully load
      cy.get('form').should('be.visible');
      
      // Measure page load performance
      cy.measurePageLoad('LoginPage', {
        thresholds: thresholds.pageLoad.LoginPage
      });
    });

    it('should measure registration page load performance', () => {
      cy.visit('/register');
      
      // Wait for page to load
      cy.get('form').should('be.visible');
      
      // Measure page load performance
      cy.measurePageLoad('RegisterPage', {
        thresholds: thresholds.pageLoad.LoginPage // Use login page thresholds as fallback
      });
    });
  });

  describe('Authenticated Pages', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should measure home page load performance', () => {
      cy.visit('/');
      
      // Wait for dashboard to load
      cy.get('[data-testid="dashboard-page"]').should('be.visible');
      
      // Measure page load performance
      cy.measurePageLoad('HomePage', {
        thresholds: thresholds.pageLoad.HomePage
      });
    });

    it('should measure integrations page load performance', () => {
      cy.visit('/integrations');
      
      // Wait for page to load
      cy.get('[data-testid="integrations-page"]').should('be.visible');
      
      // Measure page load performance
      cy.measurePageLoad('IntegrationsPage', {
        thresholds: thresholds.pageLoad.IntegrationsPage
      });
    });

    it('should measure integration detail page load performance', () => {
      cy.visit('/integrations/1');
      
      // Wait for page to load
      cy.get('[data-testid="integration-detail-page"]').should('be.visible');
      
      // Measure page load performance
      cy.measurePageLoad('IntegrationDetailPage', {
        thresholds: thresholds.pageLoad.IntegrationDetailPage
      });
    });

    it('should measure admin dashboard load performance', () => {
      cy.visit('/admin');
      
      // Wait for page to load
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
      
      // Measure page load performance
      cy.measurePageLoad('AdminDashboard', {
        thresholds: thresholds.pageLoad.AdminDashboard
      });
    });
  });

  describe('Page Load Trends', () => {
    beforeEach(() => {
      cy.login('admin', 'password');
    });

    it('should benchmark key pages for baseline performance', () => {
      // Define key pages to benchmark
      const pages = [
        { url: '/', name: 'HomePage', waitSelector: '[data-testid="dashboard-page"]' },
        { url: '/integrations', name: 'IntegrationsPage', waitSelector: '[data-testid="integrations-page"]' },
        { url: '/integrations/1', name: 'IntegrationDetailPage', waitSelector: '[data-testid="integration-detail-page"]' },
        { url: '/admin', name: 'AdminDashboard', waitSelector: '[data-testid="admin-dashboard"]' }
      ];
      
      // Test each page
      pages.forEach(page => {
        cy.visit(page.url);
        
        // Wait for page to load
        cy.get(page.waitSelector).should('be.visible');
        
        // Measure page load performance
        cy.measurePageLoad(page.name, {
          thresholds: thresholds.pageLoad[page.name] || {}
        });
      });
      
      // Generate performance report
      cy.generatePerformanceReport('Page Load Performance Benchmark');
    });
  });
});