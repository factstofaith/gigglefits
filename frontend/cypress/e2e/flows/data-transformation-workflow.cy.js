// cypress/e2e/flows/data-transformation-workflow.cy.js

/**
 * End-to-End Test for Data Transformation Workflow
 * 
 * This test verifies the data transformation capabilities:
 * 1. Creating specialized transformation integrations
 * 2. Setting up complex data mappings
 * 3. Applying various transformation types
 * 4. Validating transformation results
 * 5. Testing error handling in transformations
 */
describe('Data Transformation Workflow', () => {
  // Test data - admin user
  const adminUser = {
    email: 'admin@tapplatform.test',
    password: 'Admin1234!',
    fullName: 'Admin User'
  };
  
  // Test data - sample transformation integration
  const transformationIntegration = {
    name: 'Complex Data Transformation Test',
    description: 'Integration for testing complex data transformations',
    type: 'DATA_TRANSFORMATION',
    schedule: 'MANUAL',
    tags: ['test', 'transformation', 'e2e']
  };
  
  before(() => {
    // Clean the test database for integrations
    cy.request('POST', '/api/test/reset-db', { scope: 'integrations' });
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminUser.email);
    cy.get('[data-testid="password-input"]').type(adminUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Complete MFA verification for admin
    cy.get('[data-testid="mfa-verification-dialog"]').should('be.visible');
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();
    
    // Create a base integration for transformation testing
    cy.createIntegration(transformationIntegration).then(createdIntegration => {
      // Store integration ID for later use
      const integrationId = createdIntegration.id;
      cy.wrap(integrationId).as('transformationIntegrationId');
      
      // Open integration builder
      cy.openIntegrationBuilder(integrationId);
      
      // Add source node (JSON Source)
      cy.addNode('JSON_SOURCE', { x: 200, y: 200 }).then($node => {
        const sourceNodeId = $node.attr('data-node-id');
        cy.wrap(sourceNodeId).as('sourceNodeId');
        
        // Configure source node with test data
        cy.configureNode(sourceNodeId, {
          'source_type': 'INLINE',
          'data': JSON.stringify([
            {
              "employee_id": "EMP001",
              "first_name": "John",
              "last_name": "Doe",
              "email": "JOHN.DOE@example.com",
              "hire_date": "2022-01-15",
              "salary": "75000",
              "department": "Engineering",
              "manager_id": "EMP005",
              "status": "ACTIVE",
              "address": {
                "street": "123 Main St",
                "city": "San Francisco",
                "state": "CA",
                "zip": "94105"
              },
              "skills": ["Java", "Python", "JavaScript"]
            },
            {
              "employee_id": "EMP002",
              "first_name": "Jane",
              "last_name": "Smith",
              "email": "jane.smith@example.com",
              "hire_date": "2021-06-20",
              "salary": "85000",
              "department": "Marketing",
              "manager_id": "EMP007",
              "status": "ACTIVE",
              "address": {
                "street": "456 Market St",
                "city": "San Francisco",
                "state": "CA",
                "zip": "94102"
              },
              "skills": ["Marketing", "SEO", "Social Media"]
            }
          ])
        });
      });
      
      // Add destination node (JSON Destination)
      cy.addNode('JSON_DESTINATION', { x: 600, y: 200 }).then($node => {
        const destNodeId = $node.attr('data-node-id');
        cy.wrap(destNodeId).as('destNodeId');
        
        // Configure destination node
        cy.configureNode(destNodeId, {
          'destination_type': 'MEMORY',
          'format': 'JSON'
        });
      });
      
      // Save the initial flow
      cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
      cy.get('[data-testid="save-flow-button"]').click();
      
      // Wait for save to complete
      cy.wait('@saveFlow');
      
      // Navigate back to integrations list
      cy.navigateToIntegrations();
    });
  });
  
  it('implements basic data transformations', function() {
    // Get the integration ID from the before hook
    const integrationId = this.transformationIntegrationId;
    
    // Get node IDs from the before hook
    const sourceNodeId = this.sourceNodeId;
    const destNodeId = this.destNodeId;
    
    // Create a transformation flow with source -> transform -> destination
    cy.createTransformationFlow(integrationId, sourceNodeId, destNodeId).then(transformNodeId => {
      // Store the transform node ID for later use
      cy.wrap(transformNodeId).as('transformNodeId');
      
      // Click on the transform node to configure it
      cy.get(`[data-testid="node-${transformNodeId}"]`).click();
      
      // Verify properties panel is open
      cy.get('[data-testid="node-properties-panel"]').should('be.visible');
      
      // Click on transformation editor tab
      cy.get('[data-testid="transformation-editor-tab"]').click();
      
      // Add basic field mappings
      
      // 1. Simple mapping - employee_id to id (unchanged)
      cy.addFieldMapping('employee_id', 'id');
      
      // 2. Simple mapping with transformation - first_name to first_name (uppercase)
      cy.addFieldMapping('first_name', 'first_name', 'TO_UPPERCASE');
      
      // 3. Simple mapping with transformation - last_name to last_name (uppercase)
      cy.addFieldMapping('last_name', 'last_name', 'TO_UPPERCASE');
      
      // 4. Simple mapping with transformation - email to email (lowercase)
      cy.addFieldMapping('email', 'email', 'TO_LOWERCASE');
      
      // 5. Simple mapping with transformation - hire_date to hire_date_formatted (format date)
      cy.addFieldMapping('hire_date', 'hire_date_formatted', 'FORMAT_DATE');
      
      // Configure date format
      cy.get('[data-testid="transformation-parameter-format"]').last().type('{selectall}{backspace}MM/dd/yyyy');
      
      // 6. Simple mapping with transformation - salary to salary_number (string to number)
      cy.addFieldMapping('salary', 'salary_number', 'TO_NUMBER');
      
      // Preview the transformation results
      cy.previewTransformation(integrationId).then(previewData => {
        // Validate first_name is uppercase
        cy.validatePreviewField('first_name', 'JOHN');
        
        // Validate last_name is uppercase
        cy.validatePreviewField('last_name', 'DOE');
        
        // Validate email is lowercase
        cy.validatePreviewField('email', 'john.doe@example.com');
        
        // Validate hire_date is formatted
        const dateRegex = /\d{2}\/\d{2}\/\d{4}/;
        cy.get('[data-testid="preview-data-table"] th').contains('hire_date_formatted')
          .invoke('index')
          .then(columnIndex => {
            cy.get('[data-testid="preview-data-table"] tbody tr')
              .first()
              .find('td')
              .eq(columnIndex)
              .invoke('text')
              .should('match', dateRegex);
          });
        
        // Validate salary is converted to number
        cy.get('[data-testid="preview-data-table"] th').contains('salary_number')
          .invoke('index')
          .then(columnIndex => {
            cy.get('[data-testid="preview-data-table"] tbody tr')
              .first()
              .find('td')
              .eq(columnIndex)
              .invoke('text')
              .should('equal', '75000');
          });
      });
      
      // Save the transformation
      cy.saveTransformation(integrationId);
      
      // Run the integration to verify actual transformation
      cy.runIntegration(integrationId).then(executionId => {
        // Monitor execution
        cy.monitorExecution(executionId, 30000).then(executionResult => {
          // Verify execution completed successfully
          expect(executionResult.status).to.equal('SUCCESS');
          
          // Verify the transformation output
          cy.visit(`/executions/${executionId}/output`);
          
          // Check output contains transformed data
          cy.get('[data-testid="execution-output"]').should('contain', 'JOHN');
          cy.get('[data-testid="execution-output"]').should('contain', 'DOE');
          cy.get('[data-testid="execution-output"]').should('contain', 'john.doe@example.com');
        });
      });
    });
  });
  
  it('implements complex field mappings', function() {
    // Get the integration ID from the before hook
    const integrationId = this.transformationIntegrationId;
    const transformNodeId = this.transformNodeId;
    
    // Open the integration builder
    cy.openIntegrationBuilder(integrationId);
    
    // Click on the transform node to configure it
    cy.get(`[data-testid="node-${transformNodeId}"]`).click();
    
    // Verify properties panel is open
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    
    // Click on transformation editor tab
    cy.get('[data-testid="transformation-editor-tab"]').click();
    
    // Clear existing mappings
    cy.get('[data-testid="clear-mappings-button"]').click();
    cy.get('[data-testid="confirm-clear-button"]').click();
    
    // Now let's implement complex field mappings
    
    // 1. Combined field mapping - first_name + last_name to full_name
    cy.addCombinedFieldMapping(['first_name', 'last_name'], 'full_name', '${first_name} ${last_name}');
    
    // 2. Object field mapping for address
    cy.addFieldMapping('address.street', 'address.street_address');
    cy.addFieldMapping('address.city', 'address.city');
    cy.addFieldMapping('address.state', 'address.state');
    cy.addFieldMapping('address.zip', 'address.postal_code');
    
    // 3. Combined field mapping for full address
    cy.addCombinedFieldMapping(
      ['address.street', 'address.city', 'address.state', 'address.zip'], 
      'formatted_address', 
      '${address.street}, ${address.city}, ${address.state} ${address.zip}'
    );
    
    // 4. Array field mapping - skills array to skills_list
    cy.addScriptMapping('skills_list', 'return record.skills.join(", ");');
    
    // 5. Complex object creation - employee_summary
    cy.addScriptMapping('employee_summary', `
      return {
        id: record.employee_id,
        name: record.first_name + " " + record.last_name,
        department: record.department,
        location: record.address.city + ", " + record.address.state,
        skill_count: record.skills.length
      };
    `);
    
    // 6. Nested object with transformations
    cy.addScriptMapping('contact_info', `
      return {
        email: record.email.toLowerCase(),
        address: {
          formatted: record.address.street + ", " + 
                    record.address.city + ", " + 
                    record.address.state + " " + 
                    record.address.zip,
          coordinates: {
            latitude: "37.7749",
            longitude: "-122.4194"
          }
        }
      };
    `);
    
    // Preview the transformation results
    cy.previewTransformation(integrationId).then(previewData => {
      // Validate combined field - full_name
      cy.validatePreviewField('full_name', 'John Doe');
      
      // Validate formatted address field
      cy.get('[data-testid="preview-data-table"] th').contains('formatted_address')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .should('contain', '123 Main St, San Francisco, CA 94105');
        });
      
      // Validate skills list
      cy.validatePreviewField('skills_list', 'Java, Python, JavaScript');
      
      // Validate employee summary object
      cy.get('[data-testid="preview-data-table"] th').contains('employee_summary')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const summary = JSON.parse(text);
              expect(summary).to.have.property('id', 'EMP001');
              expect(summary).to.have.property('name', 'John Doe');
              expect(summary).to.have.property('department', 'Engineering');
              expect(summary).to.have.property('location', 'San Francisco, CA');
              expect(summary).to.have.property('skill_count', 3);
            });
        });
      
      // Validate contact info object
      cy.get('[data-testid="preview-data-table"] th').contains('contact_info')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const contactInfo = JSON.parse(text);
              expect(contactInfo).to.have.property('email', 'john.doe@example.com');
              expect(contactInfo.address).to.have.property('formatted').that.contains('123 Main St');
              expect(contactInfo.address.coordinates).to.have.property('latitude', '37.7749');
              expect(contactInfo.address.coordinates).to.have.property('longitude', '-122.4194');
            });
        });
    });
    
    // Save the transformation
    cy.saveTransformation(integrationId);
    
    // Run the integration to verify actual transformation
    cy.runIntegration(integrationId).then(executionId => {
      // Monitor execution
      cy.monitorExecution(executionId, 30000).then(executionResult => {
        // Verify execution completed successfully
        expect(executionResult.status).to.equal('SUCCESS');
        
        // Verify the transformation output
        cy.visit(`/executions/${executionId}/output`);
        
        // Check output contains complex transformed data
        cy.get('[data-testid="execution-output"]').should('contain', 'John Doe');
        cy.get('[data-testid="execution-output"]').should('contain', 'formatted_address');
        cy.get('[data-testid="execution-output"]').should('contain', 'employee_summary');
        cy.get('[data-testid="execution-output"]').should('contain', 'contact_info');
      });
    });
  });
  
  it('implements conditional transformations', function() {
    // Get the integration ID from the before hook
    const integrationId = this.transformationIntegrationId;
    const transformNodeId = this.transformNodeId;
    
    // Open the integration builder
    cy.openIntegrationBuilder(integrationId);
    
    // Click on the transform node to configure it
    cy.get(`[data-testid="node-${transformNodeId}"]`).click();
    
    // Verify properties panel is open
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    
    // Click on transformation editor tab
    cy.get('[data-testid="transformation-editor-tab"]').click();
    
    // Clear existing mappings
    cy.get('[data-testid="clear-mappings-button"]').click();
    cy.get('[data-testid="confirm-clear-button"]').click();
    
    // Now let's implement conditional transformations
    
    // 1. Simple conditional field - employee_id to id
    cy.addFieldMapping('employee_id', 'id');
    
    // 2. Conditional mapping - salary_tier based on salary
    cy.addConditionalFieldMapping('salary', 'salary_tier', `
      if (parseInt(value) < 50000) return "Entry";
      else if (parseInt(value) < 80000) return "Mid";
      else if (parseInt(value) < 100000) return "Senior";
      else return "Executive";
    `);
    
    // 3. Conditional mapping - status_display based on status
    cy.addConditionalFieldMapping('status', 'status_display', `
      if (value === "ACTIVE") return "Active Employee";
      else if (value === "INACTIVE") return "Former Employee";
      else if (value === "ONLEAVE") return "On Leave";
      else return "Unknown Status";
    `);
    
    // 4. Conditional object - department_info
    cy.addScriptMapping('department_info', `
      switch(record.department) {
        case "Engineering":
          return {
            code: "ENG",
            budget_code: "TECH-1001",
            building: "Building A",
            manager_name: "Jane Smith"
          };
        case "Marketing":
          return {
            code: "MKT",
            budget_code: "MKT-2002",
            building: "Building B",
            manager_name: "John Johnson"
          };
        default:
          return {
            code: "OTH",
            budget_code: "GEN-0001",
            building: "Main Office",
            manager_name: "Unknown"
          };
      }
    `);
    
    // 5. Conditional object - performance_rating based on multiple conditions
    cy.addScriptMapping('performance_rating', `
      const hireDateObj = new Date(record.hire_date);
      const now = new Date();
      const tenureMonths = (now.getFullYear() - hireDateObj.getFullYear()) * 12 + 
                          (now.getMonth() - hireDateObj.getMonth());
      
      const salaryNum = parseInt(record.salary);
      
      // Conditionally calculate rating based on tenure and salary
      if (tenureMonths < 6) {
        return {
          category: "New Hire",
          evaluation_status: "Pending",
          next_review_date: "6 Month Review"
        };
      } else if (tenureMonths < 12) {
        return {
          category: "Probationary",
          evaluation_status: "Scheduled",
          next_review_date: "Annual Review"
        };
      } else {
        // Tenured employee
        if (salaryNum > 90000) {
          return {
            category: "Senior",
            evaluation_status: "Complete",
            next_review_date: "Annual Review",
            last_rating: "Exceeds Expectations"
          };
        } else {
          return {
            category: "Regular",
            evaluation_status: "Complete",
            next_review_date: "Annual Review",
            last_rating: "Meets Expectations"
          };
        }
      }
    `);
    
    // 6. Record filtering - using node settings
    cy.get('[data-testid="node-settings-tab"]').click();
    
    // Enable record filtering
    cy.get('[data-testid="enable-filtering-checkbox"]').check();
    
    // Configure filter condition
    cy.get('[data-testid="filter-condition-input"]').type(`
      record.status === "ACTIVE" && parseInt(record.salary) > 50000
    `);
    
    // Go back to transformation editor
    cy.get('[data-testid="transformation-editor-tab"]').click();
    
    // Preview the transformation results
    cy.previewTransformation(integrationId).then(previewData => {
      // Validate salary tier categorization
      cy.validatePreviewField('salary_tier', 'Mid');
      
      // Validate status display
      cy.validatePreviewField('status_display', 'Active Employee');
      
      // Validate department info object
      cy.get('[data-testid="preview-data-table"] th').contains('department_info')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const deptInfo = JSON.parse(text);
              expect(deptInfo).to.have.property('code', 'ENG');
              expect(deptInfo).to.have.property('budget_code', 'TECH-1001');
              expect(deptInfo).to.have.property('building', 'Building A');
            });
        });
      
      // Validate performance rating based on complex conditions
      cy.get('[data-testid="preview-data-table"] th').contains('performance_rating')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const rating = JSON.parse(text);
              // Can't test exact values due to date dependency, but can check structure
              expect(rating).to.have.property('category');
              expect(rating).to.have.property('evaluation_status');
              expect(rating).to.have.property('next_review_date');
            });
        });
      
      // Validate record filtering - Check that the record with status "ACTIVE" and salary > 50000 is shown
      cy.get('[data-testid="record-count"]').should('contain', '1');
      cy.get('[data-testid="preview-data-table"]').should('contain', 'EMP001');
    });
    
    // Save the transformation
    cy.saveTransformation(integrationId);
    
    // Run the integration to verify actual transformation
    cy.runIntegration(integrationId).then(executionId => {
      // Monitor execution
      cy.monitorExecution(executionId, 30000).then(executionResult => {
        // Verify execution completed successfully
        expect(executionResult.status).to.equal('SUCCESS');
        
        // Verify the transformation output
        cy.visit(`/executions/${executionId}/output`);
        
        // Check output contains conditional transformation results
        cy.get('[data-testid="execution-output"]').should('contain', 'salary_tier');
        cy.get('[data-testid="execution-output"]').should('contain', 'Mid');
        cy.get('[data-testid="execution-output"]').should('contain', 'status_display');
        cy.get('[data-testid="execution-output"]').should('contain', 'Active Employee');
        cy.get('[data-testid="execution-output"]').should('contain', 'department_info');
        cy.get('[data-testid="execution-output"]').should('contain', 'ENG');
      });
    });
  });
  
  it('implements advanced script transformations', function() {
    // Get the integration ID from the before hook
    const integrationId = this.transformationIntegrationId;
    const transformNodeId = this.transformNodeId;
    
    // Open the integration builder
    cy.openIntegrationBuilder(integrationId);
    
    // Click on the transform node to configure it
    cy.get(`[data-testid="node-${transformNodeId}"]`).click();
    
    // Verify properties panel is open
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    
    // Click on transformation editor tab
    cy.get('[data-testid="transformation-editor-tab"]').click();
    
    // Clear existing mappings
    cy.get('[data-testid="clear-mappings-button"]').click();
    cy.get('[data-testid="confirm-clear-button"]').click();
    
    // 1. Import external utility function
    cy.get('[data-testid="script-imports-tab"]').click();
    
    // Add utility function for date formatting
    cy.get('[data-testid="add-utility-function-button"]').click();
    cy.get('[data-testid="utility-name-input"]').last().type('formatDate');
    cy.get('[data-testid="utility-function-editor"]').last().type(`
      function formatDate(dateString, format) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        // Format: MM/DD/YYYY
        if (format === 'MM/DD/YYYY') {
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return \`\${month}/\${day}/\${year}\`;
        }
        
        // Format: YYYY-MM-DD
        if (format === 'YYYY-MM-DD') {
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return \`\${year}-\${month}-\${day}\`;
        }
        
        // Format: Month Day, Year
        if (format === 'Month Day, Year') {
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const month = months[date.getMonth()];
          const day = date.getDate();
          const year = date.getFullYear();
          return \`\${month} \${day}, \${year}\`;
        }
        
        return dateString;
      }
    `);
    
    // Add utility function for salary calculation
    cy.get('[data-testid="add-utility-function-button"]').click();
    cy.get('[data-testid="utility-name-input"]').last().type('calculateAnnualBonus');
    cy.get('[data-testid="utility-function-editor"]').last().type(`
      function calculateAnnualBonus(salary, department, yearsOfService) {
        // Convert salary to number
        const baseSalary = Number(salary);
        if (isNaN(baseSalary)) return 0;
        
        // Base bonus percentage by department
        const bonusRates = {
          'Engineering': 0.10,
          'Marketing': 0.08,
          'Sales': 0.12,
          'HR': 0.06,
          'Finance': 0.09
        };
        
        // Get department bonus rate or default to 0.05
        const deptRate = bonusRates[department] || 0.05;
        
        // Add tenure bonus (0.5% per year of service, max 5%)
        const tenureRate = Math.min(yearsOfService * 0.005, 0.05);
        
        // Calculate bonus
        return Math.round(baseSalary * (deptRate + tenureRate));
      }
    `);
    
    // Add utility function for skills assessment
    cy.get('[data-testid="add-utility-function-button"]').click();
    cy.get('[data-testid="utility-name-input"]').last().type('assessSkillset');
    cy.get('[data-testid="utility-function-editor"]').last().type(`
      function assessSkillset(skills, department) {
        if (!Array.isArray(skills) || skills.length === 0) {
          return { 
            level: 'Unknown',
            strength: 'N/A',
            gap: 'N/A'
          };
        }
        
        // Department-specific key skills
        const keySkills = {
          'Engineering': ['Java', 'Python', 'JavaScript', 'Docker', 'AWS', 'CI/CD'],
          'Marketing': ['SEO', 'Social Media', 'Content Creation', 'Analytics', 'Graphic Design'],
          'Sales': ['CRM', 'Negotiation', 'Presentation', 'Market Research'],
          'Finance': ['Excel', 'Financial Analysis', 'Risk Management', 'Accounting']
        };
        
        // Get relevant skills for department
        const relevantSkills = keySkills[department] || [];
        
        // Count matches between employee skills and department key skills
        const matchingSkills = skills.filter(skill => 
          relevantSkills.includes(skill)
        );
        
        // Calculate skill match rate
        let matchRate = 0;
        if (relevantSkills.length > 0) {
          matchRate = matchingSkills.length / relevantSkills.length;
        }
        
        // Evaluate skill level
        let level = 'Entry';
        if (matchRate >= 0.75) level = 'Expert';
        else if (matchRate >= 0.5) level = 'Advanced';
        else if (matchRate >= 0.25) level = 'Intermediate';
        
        // Identify strengths (matching skills)
        const strength = matchingSkills.join(', ') || 'None identified';
        
        // Identify gaps (missing key skills)
        const gaps = relevantSkills.filter(skill => 
          !skills.includes(skill)
        );
        
        return {
          level: level,
          strength: strength,
          gap: gaps.join(', ') || 'None identified'
        };
      }
    `);
    
    // Switch back to transformation editor
    cy.get('[data-testid="transformation-editor-tab"]').click();
    
    // Now let's implement advanced script transformations
    
    // 1. Basic field for identification
    cy.addFieldMapping('employee_id', 'id');
    
    // 2. Using imported date formatting function
    cy.addScriptMapping('formatted_dates', `
      return {
        standard: formatDate(record.hire_date, 'MM/DD/YYYY'),
        iso: formatDate(record.hire_date, 'YYYY-MM-DD'),
        display: formatDate(record.hire_date, 'Month Day, Year')
      };
    `);
    
    // 3. Using imported bonus calculation function with service calculation
    cy.addScriptMapping('compensation', `
      // Calculate years of service
      const hireDate = new Date(record.hire_date);
      const now = new Date();
      const yearsOfService = Math.floor(
        (now - hireDate) / (365 * 24 * 60 * 60 * 1000)
      );
      
      // Calculate bonus
      const annualBonus = calculateAnnualBonus(
        record.salary, 
        record.department,
        yearsOfService
      );
      
      return {
        base_salary: Number(record.salary),
        years_of_service: yearsOfService,
        annual_bonus: annualBonus,
        total_compensation: Number(record.salary) + annualBonus
      };
    `);
    
    // 4. Using imported skills assessment function
    cy.addScriptMapping('skill_assessment', `
      return assessSkillset(record.skills, record.department);
    `);
    
    // 5. Advanced transformation with custom algorithm
    cy.addScriptMapping('performance_metrics', `
      // Complex algorithm to calculate performance metrics
      
      // 1. Base metrics
      const baseSalary = Number(record.salary);
      const hireDate = new Date(record.hire_date);
      const now = new Date();
      const tenureYears = (now - hireDate) / (365 * 24 * 60 * 60 * 1000);
      
      // 2. Department-specific performance factors
      const deptFactors = {
        'Engineering': { productivity: 0.8, quality: 0.9, innovation: 0.85 },
        'Marketing': { productivity: 0.75, quality: 0.8, innovation: 0.9 },
        'Sales': { productivity: 0.9, quality: 0.7, innovation: 0.6 },
        'Finance': { productivity: 0.85, quality: 0.95, innovation: 0.7 }
      };
      
      // Get factors for employee's department or use defaults
      const factors = deptFactors[record.department] || 
        { productivity: 0.8, quality: 0.8, innovation: 0.8 };
      
      // 3. Calculate composite score
      // - Higher salary relative to tenure suggests higher performance
      // - Apply department-specific weightings
      const salaryPerYear = baseSalary / Math.max(tenureYears, 1);
      const baseScore = Math.min(salaryPerYear / 10000, 10); // Cap at 10
      
      // Apply departmental factors
      const productivityScore = baseScore * factors.productivity;
      const qualityScore = baseScore * factors.quality;
      const innovationScore = baseScore * factors.innovation;
      
      // Composite score (weighted average)
      const compositeScore = (
        (productivityScore * 0.4) + 
        (qualityScore * 0.4) + 
        (innovationScore * 0.2)
      ).toFixed(2);
      
      // 4. Return comprehensive metrics
      return {
        composite_score: Number(compositeScore),
        component_scores: {
          productivity: Number(productivityScore.toFixed(2)),
          quality: Number(qualityScore.toFixed(2)),
          innovation: Number(innovationScore.toFixed(2))
        },
        performance_tier: compositeScore >= 8 ? 'High' : 
                          compositeScore >= 6 ? 'Medium' : 'Development Needed',
        next_review_date: new Date(
          hireDate.getFullYear() + Math.ceil(tenureYears) + 1,
          hireDate.getMonth(),
          hireDate.getDate()
        ).toISOString().split('T')[0]
      };
    `);
    
    // 6. Advanced transformation with external data and references
    cy.addScriptMapping('career_development', `
      // Get skills from the record
      const skills = record.skills || [];
      
      // Career path definitions (would typically come from an external source)
      const careerPaths = {
        'Engineering': [
          {
            title: 'Senior Engineer',
            prerequisites: ['Java', 'Python', 'AWS'],
            readiness: skills.filter(s => ['Java', 'Python', 'AWS'].includes(s)).length / 3
          },
          {
            title: 'Technical Lead',
            prerequisites: ['Java', 'Python', 'AWS', 'Leadership'],
            readiness: skills.filter(s => ['Java', 'Python', 'AWS', 'Leadership'].includes(s)).length / 4
          }
        ],
        'Marketing': [
          {
            title: 'Marketing Manager',
            prerequisites: ['SEO', 'Social Media', 'Analytics'],
            readiness: skills.filter(s => ['SEO', 'Social Media', 'Analytics'].includes(s)).length / 3
          }
        ]
      };
      
      // Get career paths for the employee's department
      const availablePaths = careerPaths[record.department] || [];
      
      // Find the most appropriate next role based on skill readiness
      let nextRole = null;
      let bestReadiness = 0;
      
      for (const path of availablePaths) {
        if (path.readiness > bestReadiness) {
          nextRole = path;
          bestReadiness = path.readiness;
        }
      }
      
      // Recommended training based on skill gaps
      let recommendedTraining = [];
      
      if (nextRole) {
        // Find missing prerequisites
        const missingSkills = nextRole.prerequisites.filter(
          skill => !skills.includes(skill)
        );
        
        // Map skills to training courses
        recommendedTraining = missingSkills.map(skill => {
          return \`\${skill} Certification\`;
        });
      }
      
      return {
        current_role: record.department === 'Engineering' ? 'Engineer' : 
                      record.department === 'Marketing' ? 'Marketing Specialist' : 
                      \`\${record.department} Specialist\`,
        next_role: nextRole ? nextRole.title : 'No clear path identified',
        role_readiness: nextRole ? Math.round(nextRole.readiness * 100) + '%' : 'N/A',
        recommended_training: recommendedTraining,
        skill_count: skills.length
      };
    `);
    
    // Preview the transformation results
    cy.previewTransformation(integrationId).then(previewData => {
      // Validate formatted dates
      cy.get('[data-testid="preview-data-table"] th').contains('formatted_dates')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const dates = JSON.parse(text);
              expect(dates).to.have.property('standard').that.matches(/\d{2}\/\d{2}\/\d{4}/);
              expect(dates).to.have.property('iso').that.matches(/\d{4}-\d{2}-\d{2}/);
              expect(dates).to.have.property('display').that.contains(' ');
            });
        });
      
      // Validate compensation calculation
      cy.get('[data-testid="preview-data-table"] th').contains('compensation')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const comp = JSON.parse(text);
              expect(comp).to.have.property('base_salary', 75000);
              expect(comp).to.have.property('years_of_service').that.is.a('number');
              expect(comp).to.have.property('annual_bonus').that.is.a('number');
              expect(comp).to.have.property('total_compensation').that.is.a('number');
              // Verify total is sum of base + bonus
              expect(comp.total_compensation).to.equal(comp.base_salary + comp.annual_bonus);
            });
        });
      
      // Validate skill assessment
      cy.get('[data-testid="preview-data-table"] th').contains('skill_assessment')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const assessment = JSON.parse(text);
              expect(assessment).to.have.property('level').that.is.a('string');
              expect(assessment).to.have.property('strength').that.is.a('string');
              expect(assessment).to.have.property('gap').that.is.a('string');
            });
        });
      
      // Validate performance metrics
      cy.get('[data-testid="preview-data-table"] th').contains('performance_metrics')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const metrics = JSON.parse(text);
              expect(metrics).to.have.property('composite_score').that.is.a('number');
              expect(metrics).to.have.property('component_scores').that.is.an('object');
              expect(metrics.component_scores).to.have.property('productivity').that.is.a('number');
              expect(metrics).to.have.property('performance_tier').that.is.a('string');
              expect(metrics).to.have.property('next_review_date').that.is.a('string');
            });
        });
      
      // Validate career development
      cy.get('[data-testid="preview-data-table"] th').contains('career_development')
        .invoke('index')
        .then(columnIndex => {
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .first()
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const career = JSON.parse(text);
              expect(career).to.have.property('current_role').that.is.a('string');
              expect(career).to.have.property('next_role').that.is.a('string');
              expect(career).to.have.property('role_readiness').that.is.a('string');
              expect(career).to.have.property('recommended_training').that.is.an('array');
            });
        });
    });
    
    // Save the transformation
    cy.saveTransformation(integrationId);
    
    // Run the integration to verify actual transformation
    cy.runIntegration(integrationId).then(executionId => {
      // Monitor execution
      cy.monitorExecution(executionId, 30000).then(executionResult => {
        // Verify execution completed successfully
        expect(executionResult.status).to.equal('SUCCESS');
        
        // Verify the transformation output
        cy.visit(`/executions/${executionId}/output`);
        
        // Check output contains advanced transformation data
        cy.get('[data-testid="execution-output"]').should('contain', 'formatted_dates');
        cy.get('[data-testid="execution-output"]').should('contain', 'compensation');
        cy.get('[data-testid="execution-output"]').should('contain', 'skill_assessment');
        cy.get('[data-testid="execution-output"]').should('contain', 'performance_metrics');
        cy.get('[data-testid="execution-output"]').should('contain', 'career_development');
      });
    });
  });
  
  it('handles transformation errors gracefully', function() {
    // Get the integration ID from the before hook
    const integrationId = this.transformationIntegrationId;
    const transformNodeId = this.transformNodeId;
    
    // Open the integration builder
    cy.openIntegrationBuilder(integrationId);
    
    // First, let's modify the source data to include problematic records
    cy.get(`[data-testid="node-${this.sourceNodeId}"]`).click();
    
    // Verify properties panel is open
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    
    // Update source data to include records with missing or invalid data
    cy.get('[data-testid="node-property-data"]').clear().type(JSON.stringify([
      {
        // Normal record
        "employee_id": "EMP001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "hire_date": "2022-01-15",
        "salary": "75000",
        "department": "Engineering",
        "manager_id": "EMP005",
        "status": "ACTIVE"
      },
      {
        // Record with missing fields
        "employee_id": "EMP002",
        "first_name": "Jane",
        "email": "jane.smith@example.com",
        // missing last_name
        "hire_date": null, // null hire_date
        "salary": "invalid", // invalid salary
        "department": "Marketing",
        "status": "ACTIVE"
      },
      {
        // Record with completely invalid data
        "employee_id": "EMP003",
        "first_name": 123, // number instead of string
        "last_name": null,
        "email": "not-an-email",
        "hire_date": "not-a-date",
        "salary": -5000, // negative salary
        "status": "UNKNOWN" // invalid status
      },
      {
        // Empty record with only ID
        "employee_id": "EMP004"
      }
    ]));
    
    // Apply source changes
    cy.get('[data-testid="apply-node-config-button"]').click();
    
    // Now configure the transform node for error handling
    cy.get(`[data-testid="node-${transformNodeId}"]`).click();
    
    // Verify properties panel is open
    cy.get('[data-testid="node-properties-panel"]').should('be.visible');
    
    // Click on node settings tab to configure error handling
    cy.get('[data-testid="node-settings-tab"]').click();
    
    // Enable error handling
    cy.get('[data-testid="enable-error-handling-checkbox"]').check();
    
    // Select continue on error strategy
    cy.get('[data-testid="error-strategy-select"]').select('CONTINUE');
    
    // Enable error logging
    cy.get('[data-testid="enable-error-logging-checkbox"]').check();
    
    // Click on transformation editor tab
    cy.get('[data-testid="transformation-editor-tab"]').click();
    
    // Clear existing mappings
    cy.get('[data-testid="clear-mappings-button"]').click();
    cy.get('[data-testid="confirm-clear-button"]').click();
    
    // Add transformations with error handling
    
    // 1. Basic mapping with default value for missing field
    cy.addScriptMapping('safe_name', `
      const firstName = record.first_name || 'Unknown';
      const lastName = record.last_name || 'Unknown';
      
      // Handle unexpected types
      const safeFirstName = typeof firstName === 'string' ? firstName : String(firstName);
      const safeLastName = typeof lastName === 'string' ? lastName : String(lastName);
      
      return safeFirstName + ' ' + safeLastName;
    `);
    
    // 2. Safe email validation and normalization
    cy.addScriptMapping('safe_email', `
      // Get email or default
      const email = record.email || 'no-email@example.com';
      
      // Basic email validation
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      const isValid = typeof email === 'string' && emailRegex.test(email);
      
      return {
        address: isValid ? email.toLowerCase() : 'invalid-email@example.com',
        is_valid: isValid
      };
    `);
    
    // 3. Safe date handling
    cy.addScriptMapping('safe_date_info', `
      try {
        // Get hire date or default
        const hireDateStr = record.hire_date || null;
        
        // Try to parse date
        const hireDate = hireDateStr ? new Date(hireDateStr) : null;
        const isValid = hireDate && !isNaN(hireDate.getTime());
        
        if (isValid) {
          const now = new Date();
          const tenureYears = ((now - hireDate) / (365 * 24 * 60 * 60 * 1000)).toFixed(1);
          
          return {
            hire_date: hireDate.toISOString().split('T')[0],
            tenure_years: Number(tenureYears),
            is_valid: true
          };
        } else {
          return {
            hire_date: 'Unknown',
            tenure_years: 0,
            is_valid: false
          };
        }
      } catch (error) {
        // Handle any unexpected errors
        return {
          hire_date: 'Error',
          tenure_years: 0,
          is_valid: false,
          error: error.message
        };
      }
    `);
    
    // 4. Safe salary calculation
    cy.addScriptMapping('safe_compensation', `
      try {
        // Get salary or default
        const salaryStr = record.salary || '0';
        
        // Try to parse salary
        const salary = Number(salaryStr);
        const isValid = !isNaN(salary) && salary > 0;
        
        if (isValid) {
          return {
            salary: salary,
            monthly: Math.round(salary / 12),
            is_valid: true
          };
        } else {
          return {
            salary: 0,
            monthly: 0,
            is_valid: false
          };
        }
      } catch (error) {
        return {
          salary: 0,
          monthly: 0,
          is_valid: false,
          error: error.message
        };
      }
    `);
    
    // 5. Record quality assessment
    cy.addScriptMapping('record_quality', `
      // Set up required fields
      const requiredFields = [
        'employee_id', 'first_name', 'last_name', 
        'email', 'hire_date', 'salary', 'department'
      ];
      
      // Check for presence of each field
      const fieldChecks = {};
      let validFieldCount = 0;
      
      requiredFields.forEach(field => {
        const exists = record[field] !== undefined && record[field] !== null;
        fieldChecks[field] = exists;
        if (exists) validFieldCount++;
      });
      
      // Calculate quality score
      const qualityScore = Math.round((validFieldCount / requiredFields.length) * 100);
      
      // Determine quality tier
      let qualityTier = 'Low';
      if (qualityScore === 100) qualityTier = 'High';
      else if (qualityScore >= 75) qualityTier = 'Medium';
      
      return {
        score: qualityScore,
        tier: qualityTier,
        valid_fields: validFieldCount,
        total_fields: requiredFields.length,
        field_checks: fieldChecks
      };
    `);
    
    // 6. Error tracking with try/catch
    cy.addScriptMapping('transformation_status', `
      try {
        // Get employee ID for reference
        const id = record.employee_id || 'unknown';
        
        // Check for critical fields
        const hasCriticalFields = 
          record.employee_id !== undefined && 
          record.first_name !== undefined && 
          record.email !== undefined;
        
        // Collect warnings
        const warnings = [];
        
        if (!record.last_name) warnings.push('Missing last name');
        if (!record.hire_date) warnings.push('Missing hire date');
        if (!record.salary || isNaN(Number(record.salary))) warnings.push('Invalid salary');
        if (!record.department) warnings.push('Missing department');
        
        // Determine overall status
        let status = 'SUCCESS';
        if (!hasCriticalFields) status = 'ERROR';
        else if (warnings.length > 0) status = 'WARNING';
        
        return {
          record_id: id,
          status: status,
          has_critical_fields: hasCriticalFields,
          warning_count: warnings.length,
          warnings: warnings
        };
      } catch (error) {
        // Handle unexpected errors
        return {
          record_id: record.employee_id || 'unknown',
          status: 'ERROR',
          has_critical_fields: false,
          warning_count: 0,
          error: error.message
        };
      }
    `);
    
    // Preview the transformation results
    cy.previewTransformation(integrationId).then(previewData => {
      // Verify all 4 records are processed despite errors
      cy.get('[data-testid="record-count"]').should('contain', '4');
      
      // Verify safe_name handles missing and invalid data
      cy.get('[data-testid="preview-data-table"] th').contains('safe_name')
        .invoke('index')
        .then(columnIndex => {
          // First record should have normal name
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .eq(0)
            .find('td')
            .eq(columnIndex)
            .should('contain', 'John Doe');
          
          // Second record should have default for missing last name
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .eq(1)
            .find('td')
            .eq(columnIndex)
            .should('contain', 'Jane Unknown');
        });
      
      // Verify safe_email validation
      cy.get('[data-testid="preview-data-table"] th').contains('safe_email')
        .invoke('index')
        .then(columnIndex => {
          // First row has valid email
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .eq(0)
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const email = JSON.parse(text);
              expect(email.is_valid).to.be.true;
            });
          
          // Third row has invalid email
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .eq(2)
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const email = JSON.parse(text);
              expect(email.is_valid).to.be.false;
              expect(email.address).to.equal('invalid-email@example.com');
            });
        });
      
      // Verify transformation_status captures issues
      cy.get('[data-testid="preview-data-table"] th').contains('transformation_status')
        .invoke('index')
        .then(columnIndex => {
          // First row should be SUCCESS
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .eq(0)
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const status = JSON.parse(text);
              expect(status.status).to.equal('SUCCESS');
              expect(status.warning_count).to.equal(0);
            });
          
          // Second row should be WARNING (has some issues)
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .eq(1)
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const status = JSON.parse(text);
              expect(status.status).to.equal('WARNING');
              expect(status.warning_count).to.be.greaterThan(0);
            });
          
          // Fourth row should be ERROR (missing critical fields)
          cy.get('[data-testid="preview-data-table"] tbody tr')
            .eq(3)
            .find('td')
            .eq(columnIndex)
            .invoke('text')
            .then(text => {
              const status = JSON.parse(text);
              expect(status.status).to.equal('ERROR');
              expect(status.has_critical_fields).to.be.false;
            });
        });
    });
    
    // Save the transformation
    cy.saveTransformation(integrationId);
    
    // Run the integration with error handling
    cy.runIntegration(integrationId).then(executionId => {
      // Monitor execution - should complete with warnings
      cy.monitorExecution(executionId, 30000).then(executionResult => {
        // Verify execution completed with warnings
        expect(executionResult.status).to.be.oneOf(['SUCCESS', 'WARNING']);
        
        // Navigate to execution logs
        cy.visit(`/executions/${executionId}/logs`);
        
        // Verify error logs are present
        cy.get('[data-testid="execution-logs"]').should('contain', 'WARNING');
        cy.get('[data-testid="execution-logs"]').should('contain', 'Missing');
        
        // Check error details
        cy.get('[data-testid="log-details-button"]').first().click();
        cy.get('[data-testid="log-details-dialog"]').should('be.visible');
        cy.get('[data-testid="log-details-dialog"]').should('contain', 'record_id');
        
        // Close details dialog
        cy.get('[data-testid="close-dialog-button"]').click();
        
        // Navigate to results
        cy.visit(`/executions/${executionId}/output`);
        
        // Verify output has the processed records with error handling
        cy.get('[data-testid="execution-output"]').should('contain', 'safe_name');
        cy.get('[data-testid="execution-output"]').should('contain', 'safe_email');
        cy.get('[data-testid="execution-output"]').should('contain', 'transformation_status');
        
        // Verify statistics
        cy.visit(`/executions/${executionId}`);
        
        // Should show records with warnings/errors
        cy.get('[data-testid="records-with-warnings"]').should('be.visible');
        cy.get('[data-testid="records-with-errors"]').should('be.visible');
      });
    });
    
    // Test error escalation by changing error strategy
    cy.openIntegrationBuilder(integrationId);
    
    // Click on transform node
    cy.get(`[data-testid="node-${transformNodeId}"]`).click();
    
    // Go to settings tab
    cy.get('[data-testid="node-settings-tab"]').click();
    
    // Change error strategy to FAIL (stop on first error)
    cy.get('[data-testid="error-strategy-select"]').select('FAIL');
    
    // Apply settings
    cy.get('[data-testid="apply-node-config-button"]').click();
    
    // Save the flow
    cy.intercept('PUT', `/api/integrations/${integrationId}/flow`).as('saveFlow');
    cy.get('[data-testid="save-flow-button"]').click();
    cy.wait('@saveFlow');
    
    // Run the integration with strict error handling
    cy.runIntegration(integrationId).then(executionId => {
      // Monitor execution - should fail now
      cy.monitorExecution(executionId, 30000).then(executionResult => {
        // Verify execution failed
        expect(executionResult.status).to.equal('FAILED');
        
        // Check error details
        cy.visit(`/executions/${executionId}/logs`);
        cy.get('[data-testid="execution-logs"]').should('contain', 'ERROR');
        cy.get('[data-testid="execution-logs"]').should('contain', 'stopped due to error');
      });
    });
  });
  
  after(() => {
    // Clean up test integrations
    cy.request('POST', '/api/test/reset-db', { scope: 'integrations' });
    
    // Logout admin
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });
});