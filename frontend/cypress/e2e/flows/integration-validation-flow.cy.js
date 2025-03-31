// cypress/e2e/flows/integration-validation-flow.cy.js
/**
 * E2E Test for Integration Validation Flow
 * 
 * This test verifies that users can:
 * 1. Create a new integration
 * 2. Configure its flow
 * 3. Validate the flow
 * 4. Fix validation errors
 * 5. Successfully save a valid flow
 */

// Test constants
const TEST_USER = {
  username: 'admin',
  password: 'password123',
  role: 'admin'
};

// Sample integration data
const TEST_INTEGRATION = {
  name: 'E2E Test Integration',
  description: 'Created for E2E testing',
  type: 'data-sync',
  source: 'Sample API Source',
  destination: 'Azure Blob Storage',
  schedule: '0 0 * * *' // Daily at midnight
};

describe('Integration Validation Flow', () => {
  beforeEach(() => {
    // Reset state and login
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Mock API responses
    cy.intercept('GET', '/api/integrations', { fixture: 'integrations.json' }).as('getIntegrations');
    cy.intercept('GET', '/api/sources', { fixture: 'sources.json' }).as('getSources');
    cy.intercept('GET', '/api/destinations', { fixture: 'destinations.json' }).as('getDestinations');
    
    // Login as admin
    cy.login(TEST_USER.username, TEST_USER.password);
    
    // Navigate to integrations page
    cy.visit('/integrations');
    cy.url().should('include', '/integrations');
    cy.contains('Integrations').should('be.visible');
    cy.wait('@getIntegrations');
  });
  
  it('creates and validates a new integration', () => {
    // 1. Create new integration
    cy.get('[data-testid="create-integration-button"]').click();
    cy.get('[data-testid="integration-modal"]').should('be.visible');
    
    // Fill out basic integration details
    cy.get('[data-testid="integration-name"]').type(TEST_INTEGRATION.name);
    cy.get('[data-testid="integration-description"]').type(TEST_INTEGRATION.description);
    cy.get('[data-testid="integration-type"]').select(TEST_INTEGRATION.type);
    
    // Mock the creation response
    cy.intercept('POST', '/api/integrations', {
      statusCode: 201,
      body: {
        id: '12345',
        ...TEST_INTEGRATION,
        status: 'draft',
        created_at: new Date().toISOString()
      }
    }).as('createIntegration');
    
    // Submit the form
    cy.get('[data-testid="create-button"]').click();
    cy.wait('@createIntegration');
    
    // Verify redirect to new integration detail page
    cy.url().should('include', '/integrations/12345');
    cy.contains(TEST_INTEGRATION.name).should('be.visible');
    
    // 2. Configure integration flow
    cy.get('[data-testid="flow-canvas"]').should('be.visible');
    
    // Add source node
    cy.get('[data-testid="node-palette"]').should('be.visible');
    cy.get('[data-testid="source-node-button"]').click();
    cy.get('[data-testid="flow-canvas"]').click(300, 200);
    
    // Configure source node
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    cy.get('[data-testid="source-type-select"]').select(TEST_INTEGRATION.source);
    cy.get('[data-testid="apply-button"]').click();
    
    // Add destination node
    cy.get('[data-testid="destination-node-button"]').click();
    cy.get('[data-testid="flow-canvas"]').click(600, 200);
    
    // Configure destination node
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    cy.get('[data-testid="destination-type-select"]').select(TEST_INTEGRATION.destination);
    cy.get('[data-testid="apply-button"]').click();
    
    // Connect nodes
    cy.get('[data-testid="source-node"]').find('[data-testid="output-handle"]').trigger('mousedown');
    cy.get('[data-testid="destination-node"]').find('[data-testid="input-handle"]').trigger('mousemove').trigger('mouseup');
    
    // 3. Validate the flow with errors
    // Mock validation with errors
    cy.intercept('POST', '/api/integrations/12345/validate', {
      statusCode: 200,
      body: {
        valid: false,
        errors: [
          {
            nodeId: 'destination-node-1',
            field: 'connectionString',
            message: 'Connection string is required'
          }
        ]
      }
    }).as('validateFlow');
    
    cy.get('[data-testid="validate-button"]').click();
    cy.wait('@validateFlow');
    
    // Verify error is displayed
    cy.get('[data-testid="validation-panel"]').should('be.visible');
    cy.get('[data-testid="validation-error"]').should('contain', 'Connection string is required');
    
    // 4. Fix validation errors
    cy.get('[data-testid="destination-node"]').click();
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    cy.get('[data-testid="connectionString"]').type('DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=testkey;EndpointSuffix=core.windows.net');
    cy.get('[data-testid="apply-button"]').click();
    
    // 5. Validate again with success
    // Mock successful validation
    cy.intercept('POST', '/api/integrations/12345/validate', {
      statusCode: 200,
      body: {
        valid: true,
        errors: []
      }
    }).as('validateFlowSuccess');
    
    cy.get('[data-testid="validate-button"]').click();
    cy.wait('@validateFlowSuccess');
    
    // Verify success message
    cy.get('[data-testid="validation-success"]').should('be.visible');
    cy.get('[data-testid="validation-success"]').should('contain', 'Flow is valid');
    
    // 6. Save the integration
    cy.intercept('PUT', '/api/integrations/12345', {
      statusCode: 200,
      body: {
        id: '12345',
        ...TEST_INTEGRATION,
        status: 'active',
        updated_at: new Date().toISOString()
      }
    }).as('saveIntegration');
    
    cy.get('[data-testid="save-button"]').click();
    cy.wait('@saveIntegration');
    
    // Verify success toast
    cy.get('[data-testid="toast"]').should('be.visible');
    cy.get('[data-testid="toast"]').should('contain', 'Integration saved successfully');
  });
  
  it('handles validation errors gracefully', () => {
    // Navigate to existing integration
    cy.intercept('GET', '/api/integrations/existing-123', { fixture: 'existing-integration.json' }).as('getExistingIntegration');
    cy.visit('/integrations/existing-123');
    cy.wait('@getExistingIntegration');
    
    // Mock server error during validation
    cy.intercept('POST', '/api/integrations/existing-123/validate', {
      statusCode: 500,
      body: {
        message: 'Internal server error'
      }
    }).as('validateFlowError');
    
    // Attempt to validate
    cy.get('[data-testid="validate-button"]').click();
    cy.wait('@validateFlowError');
    
    // Verify error message
    cy.get('[data-testid="toast"]').should('be.visible');
    cy.get('[data-testid="toast"]').should('contain', 'Failed to validate flow');
    
    // Verify client-side validation still works
    cy.get('[data-testid="validation-panel"]').should('be.visible');
    cy.get('[data-testid="client-validation-result"]').should('exist');
  });
  
  it('passes accessibility checks', () => {
    // Navigate to integrations list
    cy.visit('/integrations');
    
    // Check list view accessibility
    cy.checkA11y();
    
    // Navigate to integration detail
    cy.intercept('GET', '/api/integrations/existing-123', { fixture: 'existing-integration.json' }).as('getExistingIntegration');
    cy.contains('Existing Integration').click();
    cy.wait('@getExistingIntegration');
    
    // Check detail view accessibility
    cy.checkA11y();
    
    // Check validation panel accessibility when open
    cy.get('[data-testid="validate-button"]').click();
    cy.get('[data-testid="validation-panel"]').should('be.visible');
    cy.checkA11y('[data-testid="validation-panel"]');
  });
});