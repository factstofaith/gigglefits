// template-management.cy.js
// -----------------------------------------------------------------------------
// E2E tests for the Template Management functionality

/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Template Management', () => {
  // Load fixtures before each test
  beforeEach(() => {
    // Load fixtures
    cy.fixture('templates/templates.json').as('templateData');
    cy.fixture('templates/template_categories.json').as('categoryData');
    cy.fixture('templates/template_parameters.json').as('parameterData');
    cy.fixture('templates/template_flows.json').as('flowData');
    
    // Login as admin
    cy.login('admin@example.com', 'Password123!');
    
    // Intercept template API calls
    cy.intercept('GET', '/api/templates', { fixture: 'templates/templates.json' }).as('getTemplates');
    
    cy.intercept('POST', '/api/templates', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          ...req.body,
          id: `template-${Date.now()}`, // Generate unique ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
          rating: 0
        }
      });
    }).as('createTemplate');
    
    cy.intercept('PUT', '/api/templates/*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          ...req.body,
          id: req.url.split('/').pop(),
          updatedAt: new Date().toISOString()
        }
      });
    }).as('updateTemplate');
    
    cy.intercept('DELETE', '/api/templates/*', { statusCode: 204 }).as('deleteTemplate');
    
    // Intercept template categories API call
    cy.intercept('GET', '/api/templates/categories', { fixture: 'templates/template_categories.json' }).as('getCategories');
    
    // Intercept template parameters API call
    cy.intercept('GET', '/api/templates/*/parameters', (req) => {
      const templateId = req.url.split('/')[3]; // Extract template ID from URL
      cy.get('@parameterData').then((parameterData) => {
        req.reply(parameterData[templateId] || []);
      });
    }).as('getParameters');
    
    // Intercept template flow API call
    cy.intercept('GET', '/api/templates/*/flow', (req) => {
      const templateId = req.url.split('/')[3]; // Extract template ID from URL
      cy.get('@flowData').then((flowData) => {
        req.reply(flowData[templateId] || {});
      });
    }).as('getFlow');
    
    // Intercept template preview API call
    cy.intercept('GET', '/api/templates/*/preview', (req) => {
      const templateId = req.url.split('/')[3]; // Extract template ID from URL
      cy.get('@templateData').then((templates) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          req.reply({
            template,
            previewData: {
              nodes: 5,
              edges: 4,
              parameters: 3,
              connections: 2
            }
          });
        } else {
          req.reply({ statusCode: 404 });
        }
      });
    }).as('getPreview');
    
    // Intercept integration creation from template
    cy.intercept('POST', '/api/integrations/createFromTemplate', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: `integration-${Date.now()}`,
          name: req.body.name,
          description: req.body.description,
          status: 'Created',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateId: req.body.templateId
        }
      });
    }).as('createFromTemplate');
    
    // Navigate to template browser
    cy.navigateToTemplateBrowser();
    cy.wait('@getTemplates');
    cy.wait('@getCategories');
  });
  
  describe('Template Browser', () => {
    it('should display the list of templates', () => {
      // Verify the template browser is displayed
      cy.contains('Integration Templates').should('be.visible');
      
      // Verify templates are displayed
      cy.get('@templateData').then((templates) => {
        templates.forEach(template => {
          cy.contains('[data-testid="template-item"]', template.name).should('be.visible');
          cy.contains('[data-testid="template-item"]', template.description).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkTemplateA11y('template browser');
    });
    
    it('should filter templates by category', () => {
      // Get categories from fixture
      cy.get('@categoryData').then((categories) => {
        // Select a category to filter by
        const categoryToFilter = categories[1]; // Office Integration
        
        // Filter by category
        cy.filterTemplatesByCategory(categoryToFilter.name);
        
        // Get templates that match this category
        cy.get('@templateData').then((templates) => {
          const categoryTemplates = templates.filter(t => t.category === categoryToFilter.name);
          
          // Verify only matching templates are shown
          cy.get('[data-testid="template-item"]').should('have.length', categoryTemplates.length);
          
          // Verify a matching template is shown
          if (categoryTemplates.length > 0) {
            cy.contains(categoryTemplates[0].name).should('be.visible');
          }
          
          // Verify a non-matching template is not shown
          const nonMatchingTemplate = templates.find(t => t.category !== categoryToFilter.name);
          if (nonMatchingTemplate) {
            cy.contains(nonMatchingTemplate.name).should('not.exist');
          }
        });
      });
      
      // Check accessibility
      cy.checkTemplateA11y('after category filter');
    });
    
    it('should filter templates by industry', () => {
      // Get templates with different industries
      cy.get('@templateData').then((templates) => {
        // Get unique industries
        const industries = [...new Set(templates.map(t => t.industry))];
        
        if (industries.length > 1) {
          // Select an industry to filter by
          const industryToFilter = industries[1]; // e.g., "Business Services"
          
          // Filter by industry
          cy.filterTemplatesByIndustry(industryToFilter);
          
          // Get templates that match this industry
          const industryTemplates = templates.filter(t => t.industry === industryToFilter);
          
          // Verify only matching templates are shown
          cy.get('[data-testid="template-item"]').should('have.length', industryTemplates.length);
          
          // Verify a matching template is shown
          if (industryTemplates.length > 0) {
            cy.contains(industryTemplates[0].name).should('be.visible');
          }
          
          // Verify a non-matching template is not shown
          const nonMatchingTemplate = templates.find(t => t.industry !== industryToFilter);
          if (nonMatchingTemplate) {
            cy.contains(nonMatchingTemplate.name).should('not.exist');
          }
        }
      });
    });
    
    it('should filter templates by complexity', () => {
      // Get templates with different complexity
      cy.get('@templateData').then((templates) => {
        // Get unique complexity levels
        const complexities = [...new Set(templates.map(t => t.complexity))];
        
        if (complexities.length > 1) {
          // Select a complexity to filter by
          const complexityToFilter = complexities[1]; // e.g., "Moderate"
          
          // Filter by complexity
          cy.filterTemplatesByComplexity(complexityToFilter);
          
          // Get templates that match this complexity
          const complexityTemplates = templates.filter(t => t.complexity === complexityToFilter);
          
          // Verify only matching templates are shown
          cy.get('[data-testid="template-item"]').should('have.length', complexityTemplates.length);
          
          // Verify a matching template is shown
          if (complexityTemplates.length > 0) {
            cy.contains(complexityTemplates[0].name).should('be.visible');
          }
          
          // Verify a non-matching template is not shown
          const nonMatchingTemplate = templates.find(t => t.complexity !== complexityToFilter);
          if (nonMatchingTemplate) {
            cy.contains(nonMatchingTemplate.name).should('not.exist');
          }
        }
      });
    });
    
    it('should search for templates', () => {
      // Get a template name to search for
      cy.get('@templateData').then((templates) => {
        const template = templates[0];
        const searchTerm = template.name.split(' ')[0]; // First word of the template name
        
        // Search for the template
        cy.searchTemplates(searchTerm);
        
        // Get templates that match the search term
        const matchingTemplates = templates.filter(t => 
          t.name.includes(searchTerm) || 
          t.description.includes(searchTerm) ||
          t.tags.some(tag => tag.includes(searchTerm))
        );
        
        // Verify only matching templates are shown
        cy.get('[data-testid="template-item"]').should('have.length', matchingTemplates.length);
        
        // Verify a matching template is shown
        if (matchingTemplates.length > 0) {
          cy.contains(matchingTemplates[0].name).should('be.visible');
        }
        
        // Find a non-matching template
        const nonMatchingTemplate = templates.find(t => 
          !t.name.includes(searchTerm) && 
          !t.description.includes(searchTerm) &&
          !t.tags.some(tag => tag.includes(searchTerm))
        );
        
        // Verify a non-matching template is not shown
        if (nonMatchingTemplate) {
          cy.contains(nonMatchingTemplate.name).should('not.exist');
        }
      });
      
      // Check accessibility
      cy.checkTemplateA11y('after search');
    });
    
    it('should preview a template', () => {
      // Get the first template
      cy.get('@templateData').then((templates) => {
        const template = templates[0];
        
        // Preview the template
        cy.previewTemplate(template.name);
        
        // Verify preview shows template details
        cy.contains('Template Preview').should('be.visible');
        cy.contains(template.name).should('be.visible');
        cy.contains(template.description).should('be.visible');
        
        // Check that template parameters are shown
        cy.get('@parameterData').then((parameters) => {
          if (parameters[template.id] && parameters[template.id].length > 0) {
            cy.contains('Parameters').should('be.visible');
            parameters[template.id].slice(0, 2).forEach(param => { // Check first two parameters
              cy.contains(param.displayName).should('be.visible');
            });
          }
        });
        
        // Close the preview
        cy.contains('button', 'Close').click();
      });
      
      // Check accessibility
      cy.checkTemplateA11y('after preview');
    });
  });
  
  describe('Template Form', () => {
    it('should create a new template', () => {
      // Create new template data
      const newTemplate = {
        name: 'API to Database Integration',
        description: 'Generic template for integrating API data with a database',
        category: 'API Integration',
        industry: 'Generic',
        complexity: 'Simple',
        tags: ['API', 'Database', 'Integration'],
        connections: [
          { type: 'API', name: 'Source API' },
          { type: 'Database', name: 'Target Database' }
        ]
      };
      
      // Create the template
      cy.createTemplate(newTemplate);
      cy.wait('@createTemplate');
      
      // Verify new template appears in the list
      cy.contains('[data-testid="template-item"]', newTemplate.name).should('be.visible');
      
      // Check accessibility
      cy.checkTemplateA11y('after creating template');
    });
    
    it('should edit an existing template', () => {
      // Get the first template
      cy.get('@templateData').then((templates) => {
        const template = templates[0];
        const updatedData = {
          name: `${template.name} - Updated`,
          description: 'Updated description for testing',
          tags: ['Updated', 'Testing']
        };
        
        // Edit the template
        cy.editTemplate(template.name, updatedData);
        cy.wait('@updateTemplate');
        
        // Verify changes
        cy.contains('[data-testid="template-item"]', updatedData.name).should('be.visible');
        cy.contains('[data-testid="template-item"]', updatedData.description).should('be.visible');
      });
      
      // Check accessibility
      cy.checkTemplateA11y('after editing template');
    });
    
    it('should delete a template', () => {
      // Get the last template
      cy.get('@templateData').then((templates) => {
        const template = templates[templates.length - 1];
        
        // Delete the template
        cy.deleteTemplate(template.name);
        cy.wait('@deleteTemplate');
        
        // Verify template is removed
        cy.contains('[data-testid="template-item"]', template.name).should('not.exist');
      });
      
      // Check accessibility
      cy.checkTemplateA11y('after deleting template');
    });
  });
  
  describe('Template Application', () => {
    it('should create a new integration from a template', () => {
      // Get the first template
      cy.get('@templateData').then((templates) => {
        const template = templates[0];
        
        // Integration data
        const integrationData = {
          name: `New Integration from ${template.name}`,
          description: 'Integration created from template during testing',
          parameters: {
            sourceFilePattern: '*.csv',
            targetTable: 'test_data'
          }
        };
        
        // Create integration from template
        cy.createIntegrationFromTemplate(template.name, integrationData);
        cy.wait('@createFromTemplate');
        
        // Verify success message and navigation to integration details
        cy.contains('Integration created successfully').should('be.visible');
        cy.contains(integrationData.name).should('be.visible');
      });
      
      // Check accessibility
      cy.checkTemplateA11y('after creating integration');
    });
    
    it('should customize template parameters', () => {
      // Get a template with parameters
      cy.get('@templateData').then((templates) => {
        // Find a template with parameters
        cy.get('@parameterData').then((parameters) => {
          // Find the first template with parameters
          const templateWithParams = templates.find(t => parameters[t.id] && parameters[t.id].length > 0);
          
          if (templateWithParams) {
            // Use the template
            cy.useTemplate(templateWithParams.name);
            
            // Get to the parameters step
            cy.contains('button', 'Next').click();
            
            // Get the parameters for this template
            const templateParams = parameters[templateWithParams.id];
            
            // Customize required parameters
            templateParams.filter(p => p.required).forEach(param => {
              // Set a custom value based on the parameter type
              switch (param.type) {
                case 'string':
                  cy.get(`[name="parameter-${param.name}"]`).clear().type(`custom-${param.name}`);
                  break;
                case 'number':
                  cy.get(`[name="parameter-${param.name}"]`).clear().type('42');
                  break;
                case 'boolean':
                  // Toggle from default value
                  const defaultValue = param.defaultValue;
                  if (defaultValue) {
                    cy.get(`[name="parameter-${param.name}"]`).uncheck();
                  } else {
                    cy.get(`[name="parameter-${param.name}"]`).check();
                  }
                  break;
              }
            });
            
            // Move to next step if there is one
            if (cy.contains('button', 'Next').should('be.visible')) {
              cy.contains('button', 'Next').click();
            }
            
            // Complete the wizard
            cy.contains('button', 'Create Integration').click();
            cy.wait('@createFromTemplate');
            
            // Verify success
            cy.contains('Integration created successfully').should('be.visible');
          }
        });
      });
      
      // Check accessibility
      cy.checkTemplateA11y('after parameter customization');
    });
  });
});