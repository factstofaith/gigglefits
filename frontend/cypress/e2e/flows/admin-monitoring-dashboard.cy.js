// cypress/e2e/flows/admin-monitoring-dashboard.cy.js

/**
 * End-to-End Test for Admin Monitoring Dashboard
 * 
 * This test verifies the functionality of the administrative monitoring features:
 * 1. Azure Infrastructure Monitoring
 * 2. Error Log Monitoring
 * 3. Documentation Analytics
 * 4. Dashboard navigation and interactivity
 * 5. Data filtering and export capabilities
 */
describe('Admin Monitoring Dashboard Flow', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!'
  };
  
  // Test data - error logs for testing
  const mockErrorLogs = [
    {
      id: 'err-001',
      severity: 'critical',
      message: 'Database connection failed',
      component: 'DatabaseService',
      timestamp: new Date().toISOString(),
      stack_trace: 'Error: Connection refused at DatabaseService.connect',
      context: { attempt: 3, database: 'primary' }
    },
    {
      id: 'err-002',
      severity: 'error',
      message: 'Authentication failed for user',
      component: 'AuthService',
      timestamp: new Date().toISOString(),
      context: { user_id: 'usr-123', method: 'password' }
    },
    {
      id: 'err-003',
      severity: 'warning',
      message: 'API rate limit approaching threshold',
      component: 'ApiGateway',
      timestamp: new Date().toISOString(),
      context: { current: 950, limit: 1000, endpoint: '/api/users' }
    }
  ];
  
  // Test data - Azure resources for testing
  const mockAzureResources = [
    {
      id: 'resource-001',
      name: 'app-service-prod',
      type: 'Microsoft.Web/sites',
      status: 'healthy',
      region: 'eastus'
    },
    {
      id: 'resource-002',
      name: 'sql-db-prod',
      type: 'Microsoft.Sql/servers/databases',
      status: 'warning',
      region: 'eastus'
    },
    {
      id: 'resource-003',
      name: 'storage-account-prod',
      type: 'Microsoft.Storage/storageAccounts',
      status: 'healthy',
      region: 'eastus'
    }
  ];
  
  // Test data - documentation analytics
  const mockDocAnalytics = {
    totalViews: 1250,
    uniqueUsers: 320,
    searchTerms: [
      { term: 'integration setup', count: 45 },
      { term: 'oauth configuration', count: 38 },
      { term: 'error troubleshooting', count: 32 }
    ],
    pageEngagement: [
      { page: '/docs/getting-started', avgTimeOnPage: 145, bounceRate: 0.12 },
      { page: '/docs/integrations/oauth', avgTimeOnPage: 212, bounceRate: 0.08 },
      { page: '/docs/admin/monitoring', avgTimeOnPage: 178, bounceRate: 0.15 }
    ]
  };
  
  beforeEach(() => {
    // Reset test data state
    cy.request('POST', '/api/test/reset-db', { scope: 'admin_monitoring' });
    
    // Seed test error logs
    cy.request('POST', '/api/test/seed-error-logs', { logs: mockErrorLogs });
    
    // Mock Azure resources API
    cy.intercept('GET', '/api/admin/azure/resources*', {
      statusCode: 200,
      body: {
        resources: mockAzureResources,
        total: mockAzureResources.length
      }
    }).as('getAzureResources');
    
    // Mock documentation analytics API
    cy.intercept('GET', '/api/admin/documentation/analytics*', {
      statusCode: 200,
      body: mockDocAnalytics
    }).as('getDocAnalytics');
    
    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Navigate to admin dashboard
    cy.get('[data-testid="admin-menu"]').click();
    cy.get('[data-testid="monitoring-link"]').click();
    
    // Verify navigation to monitoring dashboard
    cy.url().should('include', '/admin/monitoring');
    cy.get('[data-testid="monitoring-dashboard-title"]').should('be.visible');
  });
  
  it('displays and navigates between monitoring dashboard tabs', () => {
    // Verify initial state - should be on configuration tab by default
    cy.get('[data-testid="monitoring-tab-0"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="azure-configuration-panel"]').should('be.visible');
    
    // Test tab navigation - Resources tab
    cy.get('[data-testid="monitoring-tab-1"]').click();
    cy.get('[data-testid="monitoring-tab-1"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="resource-health-cards"]').should('be.visible');
    cy.wait('@getAzureResources');
    
    // Verify resource cards are displayed
    cy.get('[data-testid="resource-card"]').should('have.length', mockAzureResources.length);
    
    // Test tab navigation - Error Logs tab
    cy.get('[data-testid="monitoring-tab-3"]').click();
    cy.get('[data-testid="monitoring-tab-3"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="error-log-viewer"]').should('be.visible');
    
    // Verify error logs are displayed
    cy.get('[data-testid="error-log-table"]').should('be.visible');
    cy.get('[data-testid="error-log-table"]').find('tr').should('have.length.at.least', mockErrorLogs.length);
    
    // Test tab navigation - Documentation tab
    cy.get('[data-testid="monitoring-tab-4"]').click();
    cy.get('[data-testid="monitoring-tab-4"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="documentation-analytics"]').should('be.visible');
    cy.wait('@getDocAnalytics');
    
    // Verify documentation analytics are displayed
    cy.get('[data-testid="doc-analytics-overview"]').should('be.visible');
    cy.get('[data-testid="total-views"]').should('contain', mockDocAnalytics.totalViews);
    cy.get('[data-testid="unique-users"]').should('contain', mockDocAnalytics.uniqueUsers);
    
    // Test keyboard navigation between tabs
    cy.get('[data-testid="monitoring-tab-0"]').focus();
    cy.realPress('ArrowRight'); // Move to tab 1
    cy.get('[data-testid="monitoring-tab-1"]').should('have.focus');
    cy.realPress('ArrowRight'); // Move to tab 2
    cy.get('[data-testid="monitoring-tab-2"]').should('have.focus');
    cy.realPress('ArrowRight'); // Move to tab 3
    cy.get('[data-testid="monitoring-tab-3"]').should('have.focus');
    cy.realPress('Enter'); // Activate tab 3
    cy.get('[data-testid="monitoring-tab-3"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="error-log-viewer"]').should('be.visible');
  });
  
  it('configures Azure monitoring connection', () => {
    // Ensure we're on the configuration tab
    cy.get('[data-testid="monitoring-tab-0"]').click();
    cy.get('[data-testid="azure-configuration-panel"]').should('be.visible');
    
    // Mock the Azure connection API
    cy.intercept('POST', '/api/admin/azure/configure', {
      statusCode: 200,
      body: { success: true, connected: true }
    }).as('configureAzure');
    
    // Fill out connection form
    cy.get('[data-testid="tenant-id-input"]').type('test-tenant-id');
    cy.get('[data-testid="client-id-input"]').type('test-client-id');
    cy.get('[data-testid="client-secret-input"]').type('test-client-secret');
    cy.get('[data-testid="subscription-id-input"]').type('test-subscription-id');
    
    // Submit form
    cy.get('[data-testid="save-azure-config-button"]').click();
    
    // Verify API call
    cy.wait('@configureAzure').then(interception => {
      expect(interception.request.body).to.have.property('tenant_id', 'test-tenant-id');
      expect(interception.request.body).to.have.property('client_id', 'test-client-id');
      expect(interception.request.body).to.have.property('client_secret', 'test-client-secret');
      expect(interception.request.body).to.have.property('subscription_id', 'test-subscription-id');
    });
    
    // Verify success notification
    cy.get('[data-testid="notification-toast"]').should('contain', 'Azure configuration saved');
    
    // Verify connection status is updated
    cy.get('[data-testid="connection-status"]').should('contain', 'Connected');
    
    // Verify resource tab is now enabled
    cy.get('[data-testid="monitoring-tab-1"]').should('not.be.disabled');
    
    // Test resource discovery
    cy.intercept('POST', '/api/admin/azure/discover-resources', {
      statusCode: 200,
      body: { 
        success: true, 
        resource_count: mockAzureResources.length 
      }
    }).as('discoverResources');
    
    // Click discover resources button
    cy.get('[data-testid="discover-resources-button"]').click();
    
    // Verify API call
    cy.wait('@discoverResources');
    
    // Verify success notification with correct count
    cy.get('[data-testid="notification-toast"]').should('contain', `${mockAzureResources.length} Azure resources discovered`);
  });
  
  it('displays and filters error logs', () => {
    // Navigate to Error Logs tab
    cy.get('[data-testid="monitoring-tab-3"]').click();
    cy.get('[data-testid="error-log-viewer"]').should('be.visible');
    
    // Verify all error logs are initially displayed
    cy.get('[data-testid="error-log-table"]').find('tr').should('have.length.at.least', mockErrorLogs.length + 1); // +1 for header row
    
    // Show filters
    cy.get('[data-testid="show-filters-button"]').click();
    cy.get('[data-testid="error-log-filters"]').should('be.visible');
    
    // Test filtering by severity
    cy.intercept('GET', '/api/admin/error-logs*severity=critical*').as('getCriticalLogs');
    cy.get('[data-testid="severity-filter"]').select('critical');
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Verify API call
    cy.wait('@getCriticalLogs');
    
    // Verify filtered results - only critical errors
    cy.get('[data-testid="error-log-table"]').find('tr').should('have.length', 2); // 1 error + header row
    cy.get('[data-testid="error-log-table"]').should('contain', 'Database connection failed');
    
    // Test filtering by component
    cy.intercept('GET', '/api/admin/error-logs*component=AuthService*').as('getAuthLogs');
    cy.get('[data-testid="severity-filter"]').select('all'); // Reset severity filter
    cy.get('[data-testid="component-filter"]').select('AuthService');
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Verify API call
    cy.wait('@getAuthLogs');
    
    // Verify filtered results - only AuthService errors
    cy.get('[data-testid="error-log-table"]').find('tr').should('have.length', 2); // 1 error + header row
    cy.get('[data-testid="error-log-table"]').should('contain', 'Authentication failed for user');
    
    // Test search functionality
    cy.intercept('GET', '/api/admin/error-logs/search*').as('searchLogs');
    cy.get('[data-testid="component-filter"]').select('all'); // Reset component filter
    cy.get('[data-testid="search-input"]').type('rate limit');
    cy.get('[data-testid="search-button"]').click();
    
    // Verify API call
    cy.wait('@searchLogs');
    
    // Verify search results
    cy.get('[data-testid="error-log-table"]').find('tr').should('have.length', 2); // 1 error + header row
    cy.get('[data-testid="error-log-table"]').should('contain', 'API rate limit approaching threshold');
    
    // Test clearing filters
    cy.get('[data-testid="clear-filters-button"]').click();
    cy.get('[data-testid="error-log-table"]').find('tr').should('have.length.at.least', mockErrorLogs.length + 1);
    
    // Test viewing error details
    cy.get('[data-testid="view-details-button"]').first().click();
    cy.get('[data-testid="error-detail-modal"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-stack-trace"]').should('be.visible');
    cy.get('[data-testid="error-context"]').should('be.visible');
    
    // Close modal
    cy.get('[data-testid="close-modal-button"]').click();
    cy.get('[data-testid="error-detail-modal"]').should('not.exist');
  });
  
  it('tests error log export functionality', () => {
    // Navigate to Error Logs tab
    cy.get('[data-testid="monitoring-tab-3"]').click();
    
    // Mock export API responses
    cy.intercept('GET', '/api/admin/error-logs/export?format=csv*', {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=error_logs.csv'
      },
      body: 'id,severity,message,component,timestamp\nerr-001,critical,Database connection failed,DatabaseService,2023-01-01T00:00:00Z'
    }).as('exportCsv');
    
    cy.intercept('GET', '/api/admin/error-logs/export?format=json*', {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=error_logs.json'
      },
      body: JSON.stringify({ logs: mockErrorLogs })
    }).as('exportJson');
    
    // Test CSV export
    cy.get('[data-testid="export-format-select"]').select('csv');
    cy.get('[data-testid="export-button"]').click();
    cy.wait('@exportCsv');
    
    // Verify export success notification
    cy.get('[data-testid="notification-toast"]').should('contain', 'Export started');
    
    // Test JSON export
    cy.get('[data-testid="export-format-select"]').select('json');
    cy.get('[data-testid="export-button"]').click();
    cy.wait('@exportJson');
    
    // Verify export success notification again
    cy.get('[data-testid="notification-toast"]').should('contain', 'Export started');
  });
  
  it('displays Azure resource health cards', () => {
    // Mock Azure resources with different health statuses
    const mixedHealthResources = [
      {
        id: 'resource-001',
        name: 'app-service-prod',
        type: 'Microsoft.Web/sites',
        status: 'healthy',
        region: 'eastus'
      },
      {
        id: 'resource-002',
        name: 'sql-db-prod',
        type: 'Microsoft.Sql/servers/databases',
        status: 'warning',
        region: 'eastus'
      },
      {
        id: 'resource-003',
        name: 'storage-account-prod',
        type: 'Microsoft.Storage/storageAccounts',
        status: 'critical',
        region: 'eastus'
      },
      {
        id: 'resource-004',
        name: 'function-app-prod',
        type: 'Microsoft.Web/sites',
        status: 'healthy',
        region: 'westus'
      }
    ];
    
    // Mock the Azure resources API with mixed health statuses
    cy.intercept('GET', '/api/admin/azure/resources*', {
      statusCode: 200,
      body: {
        resources: mixedHealthResources,
        total: mixedHealthResources.length
      }
    }).as('getMixedResources');
    
    // Navigate to Resources tab
    cy.get('[data-testid="monitoring-tab-1"]').click();
    cy.wait('@getMixedResources');
    
    // Verify resource cards are displayed with correct count
    cy.get('[data-testid="resource-card"]').should('have.length', mixedHealthResources.length);
    
    // Verify resource status indicators
    cy.get('[data-testid="status-healthy"]').should('have.length', 2);
    cy.get('[data-testid="status-warning"]').should('have.length', 1);
    cy.get('[data-testid="status-critical"]').should('have.length', 1);
    
    // Test resource filtering by status
    cy.get('[data-testid="filter-status-select"]').select('critical');
    cy.get('[data-testid="resource-card"]').should('have.length', 1);
    cy.get('[data-testid="resource-card"]').should('contain', 'storage-account-prod');
    
    // Reset filter
    cy.get('[data-testid="filter-status-select"]').select('all');
    cy.get('[data-testid="resource-card"]').should('have.length', mixedHealthResources.length);
    
    // Test resource filtering by region
    cy.get('[data-testid="filter-region-select"]').select('westus');
    cy.get('[data-testid="resource-card"]').should('have.length', 1);
    cy.get('[data-testid="resource-card"]').should('contain', 'function-app-prod');
    
    // Reset filter
    cy.get('[data-testid="filter-region-select"]').select('all');
    
    // Test resource filtering by type
    cy.get('[data-testid="filter-type-select"]').select('Microsoft.Web/sites');
    cy.get('[data-testid="resource-card"]').should('have.length', 2);
    cy.get('[data-testid="resource-card"]').should('contain', 'app-service-prod');
    cy.get('[data-testid="resource-card"]').should('contain', 'function-app-prod');
    
    // Test resource search
    cy.get('[data-testid="filter-type-select"]').select('all');
    cy.get('[data-testid="resource-search-input"]').type('sql');
    cy.get('[data-testid="resource-card"]').should('have.length', 1);
    cy.get('[data-testid="resource-card"]').should('contain', 'sql-db-prod');
    
    // Test resource detail view
    cy.get('[data-testid="view-resource-details"]').first().click();
    cy.get('[data-testid="resource-detail-modal"]').should('be.visible');
    cy.get('[data-testid="resource-metrics-tab"]').should('be.visible');
    cy.get('[data-testid="resource-alerts-tab"]').should('be.visible');
    
    // Close resource details
    cy.get('[data-testid="close-resource-details"]').click();
    cy.get('[data-testid="resource-detail-modal"]').should('not.exist');
  });
  
  it('displays and interacts with documentation analytics', () => {
    // Navigate to Documentation tab
    cy.get('[data-testid="monitoring-tab-4"]').click();
    cy.wait('@getDocAnalytics');
    
    // Verify summary metrics are displayed
    cy.get('[data-testid="total-views"]').should('contain', mockDocAnalytics.totalViews);
    cy.get('[data-testid="unique-users"]').should('contain', mockDocAnalytics.uniqueUsers);
    
    // Verify search term data
    cy.get('[data-testid="search-terms-table"]').should('be.visible');
    cy.get('[data-testid="search-terms-table"]').find('tr').should('have.length', mockDocAnalytics.searchTerms.length + 1); // +1 for header
    mockDocAnalytics.searchTerms.forEach(term => {
      cy.get('[data-testid="search-terms-table"]').should('contain', term.term);
    });
    
    // Verify page engagement data
    cy.get('[data-testid="page-engagement-table"]').should('be.visible');
    cy.get('[data-testid="page-engagement-table"]').find('tr').should('have.length', mockDocAnalytics.pageEngagement.length + 1); // +1 for header
    mockDocAnalytics.pageEngagement.forEach(page => {
      cy.get('[data-testid="page-engagement-table"]').should('contain', page.page);
    });
    
    // Test time period selector
    cy.intercept('GET', '/api/admin/documentation/analytics?period=7d*', {
      statusCode: 200,
      body: {
        ...mockDocAnalytics,
        totalViews: 450,
        uniqueUsers: 120
      }
    }).as('getWeekAnalytics');
    
    cy.get('[data-testid="time-period-select"]').select('7d');
    cy.wait('@getWeekAnalytics');
    
    // Verify updated metrics
    cy.get('[data-testid="total-views"]').should('contain', '450');
    cy.get('[data-testid="unique-users"]').should('contain', '120');
    
    // Test export functionality
    cy.intercept('GET', '/api/admin/documentation/analytics/export*', {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=doc_analytics.json'
      }
    }).as('exportAnalytics');
    
    cy.get('[data-testid="export-analytics-button"]').click();
    cy.wait('@exportAnalytics');
    
    // Verify export success notification
    cy.get('[data-testid="notification-toast"]').should('contain', 'Analytics export started');
  });
  
  it('verifies accessibility of monitoring dashboard', () => {
    // Test heading structure
    cy.get('h1').should('exist');
    cy.get('h2').should('exist');
    
    // Test tab accessibility
    cy.get('[role="tablist"]').should('have.attr', 'aria-label');
    cy.get('[role="tab"]').each($tab => {
      cy.wrap($tab).should('have.attr', 'aria-controls');
      cy.wrap($tab).should('have.attr', 'id');
    });
    
    // Test tab panel accessibility
    cy.get('[role="tabpanel"]').each($panel => {
      cy.wrap($panel).should('have.attr', 'aria-labelledby');
      cy.wrap($panel).should('have.attr', 'id');
    });
    
    // Test keyboard navigation
    cy.get('[data-testid="monitoring-tab-0"]').focus();
    
    // Navigate through tabs with keyboard
    cy.focused().realPress('ArrowRight');
    cy.get('[data-testid="monitoring-tab-1"]').should('have.focus');
    
    cy.focused().realPress('ArrowRight');
    cy.get('[data-testid="monitoring-tab-2"]').should('have.focus');
    
    cy.focused().realPress('ArrowRight');
    cy.get('[data-testid="monitoring-tab-3"]').should('have.focus');
    
    // Activate tab with keyboard
    cy.focused().realPress('Enter');
    cy.get('[data-testid="monitoring-tab-3"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="error-log-viewer"]').should('be.visible');
    
    // Run comprehensive accessibility audit
    cy.checkA11y('[data-testid="monitoring-dashboard"]', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });
  
  it('tests responsive design of monitoring dashboard', () => {
    // Test on mobile viewport
    cy.viewport('iphone-6');
    
    // Verify tabs are still accessible
    cy.get('[role="tablist"]').should('be.visible');
    cy.get('[data-testid="monitoring-tab-0"]').should('be.visible');
    
    // Navigate to Error Logs tab
    cy.get('[data-testid="monitoring-tab-3"]').click();
    
    // Verify error log table adapts to mobile view
    cy.get('[data-testid="error-log-table"]').should('be.visible');
    
    // Verify filters collapse appropriately
    cy.get('[data-testid="show-filters-button"]').click();
    cy.get('[data-testid="error-log-filters"]').should('be.visible');
    
    // Test tablet viewport
    cy.viewport('ipad-2');
    
    // Navigate to Resources tab
    cy.get('[data-testid="monitoring-tab-1"]').click();
    
    // Verify resource cards adapt to tablet layout
    cy.get('[data-testid="resource-card"]').should('be.visible');
    
    // Return to desktop viewport
    cy.viewport(1200, 800);
  });
  
  it('tests refresh functionality across dashboard sections', () => {
    // Test refresh on Resources tab
    cy.get('[data-testid="monitoring-tab-1"]').click();
    
    // Mock refresh API call
    cy.intercept('GET', '/api/admin/azure/resources*', {
      statusCode: 200,
      body: {
        resources: [
          ...mockAzureResources,
          {
            id: 'resource-004',
            name: 'new-resource-after-refresh',
            type: 'Microsoft.Web/sites',
            status: 'healthy',
            region: 'eastus'
          }
        ],
        total: mockAzureResources.length + 1
      }
    }).as('refreshResources');
    
    // Click refresh button
    cy.get('[data-testid="refresh-button"]').click();
    
    // Verify API call
    cy.wait('@refreshResources');
    
    // Verify updated resource count
    cy.get('[data-testid="resource-card"]').should('have.length', mockAzureResources.length + 1);
    cy.get('[data-testid="resource-card"]').should('contain', 'new-resource-after-refresh');
    
    // Test refresh on Error Logs tab
    cy.get('[data-testid="monitoring-tab-3"]').click();
    
    // Mock refresh API call
    cy.intercept('GET', '/api/admin/error-logs*', {
      statusCode: 200,
      body: {
        logs: [
          ...mockErrorLogs,
          {
            id: 'err-004',
            severity: 'info',
            message: 'New log after refresh',
            component: 'RefreshService',
            timestamp: new Date().toISOString()
          }
        ],
        total: mockErrorLogs.length + 1
      }
    }).as('refreshLogs');
    
    // Click refresh button
    cy.get('[data-testid="refresh-button"]').click();
    
    // Verify API call
    cy.wait('@refreshLogs');
    
    // Verify updated log count
    cy.get('[data-testid="error-log-table"]').find('tr').should('have.length.at.least', mockErrorLogs.length + 2); // +1 for new log, +1 for header
    cy.get('[data-testid="error-log-table"]').should('contain', 'New log after refresh');
  });
  
  after(() => {
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Clean up test data
    cy.request('POST', '/api/test/cleanup', { scope: 'admin_monitoring' });
  });
});