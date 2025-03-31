// earnings-management-workflow.cy.js
// -----------------------------------------------------------------------------
// E2E tests for the Earnings Management System

/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Earnings Management System', () => {
  // Load fixtures before each test
  beforeEach(() => {
    // Load fixtures
    cy.fixture('earnings/rosters.json').as('rosterData');
    cy.fixture('earnings/employees.json').as('employeeData');
    cy.fixture('earnings/earnings-codes.json').as('earningsCodeData');
    cy.fixture('earnings/mappings.json').as('mappingData');
    
    // Login and set up interceptors
    cy.login('admin@example.com', 'Password123!');
    
    // Intercept roster API calls
    cy.intercept('GET', '/api/earnings/rosters', { fixture: 'earnings/rosters.json' }).as('getRosters');
    cy.intercept('POST', '/api/earnings/rosters', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          ...req.body,
          id: '4', // Assign a new ID
          last_sync_at: null
        }
      });
    }).as('createRoster');
    
    cy.intercept('PUT', '/api/earnings/rosters/*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          ...req.body,
          id: req.url.split('/').pop()
        }
      });
    }).as('updateRoster');
    
    cy.intercept('DELETE', '/api/earnings/rosters/*', { statusCode: 204 }).as('deleteRoster');
    
    // Intercept employee API calls
    cy.intercept('GET', '/api/earnings/rosters/*/employees', (req) => {
      const rosterId = req.url.match(/\/rosters\/(\d+)\/employees/)[1];
      cy.get('@employeeData').then((employeeData) => {
        const filteredEmployees = employeeData.filter(emp => emp.roster_id === rosterId);
        req.reply(filteredEmployees);
      });
    }).as('getEmployees');
    
    // Intercept earnings code API calls
    cy.intercept('GET', '/api/earnings/earnings-codes*', { fixture: 'earnings/earnings-codes.json' }).as('getEarningsCodes');
    
    // Intercept mappings API calls
    cy.intercept('GET', '/api/earnings/rosters/*/earnings-maps', (req) => {
      const rosterId = req.url.match(/\/rosters\/(\d+)\/earnings-maps/)[1];
      cy.get('@mappingData').then((mappingData) => {
        const filteredMappings = mappingData.filter(mapping => mapping.roster_id === rosterId);
        req.reply(filteredMappings);
      });
    }).as('getMappings');
    
    // Navigate to earnings
    cy.navigateToEarnings();
    cy.wait('@getRosters');
  });
  
  describe('Employee Roster Management', () => {
    it('should display the list of employee rosters', () => {
      // Verify the roster table is displayed
      cy.contains('Employee Rosters').should('be.visible');
      cy.get('table').should('be.visible');
      
      // Verify each roster is displayed
      cy.get('@rosterData').then((rosters) => {
        rosters.forEach(roster => {
          cy.contains('td', roster.name).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkA11y('roster management');
    });
    
    it('should create a new employee roster', () => {
      // Create new roster using command
      const newRoster = {
        name: 'Marketing Team',
        source_id: 'HR-SYS-004',
        destination_id: 'PAY-SYS-001',
        description: 'Marketing team employee roster with specialized bonuses'
      };
      
      cy.createEmployeeRoster(newRoster);
      cy.wait('@createRoster');
      
      // Verify new roster appears in the list
      cy.contains('td', newRoster.name).should('be.visible');
      
      // Check accessibility
      cy.checkA11y('after creating roster');
    });
    
    it('should edit an existing employee roster', () => {
      // Get the first roster
      cy.get('@rosterData').then((rosters) => {
        const rosterToEdit = rosters[0];
        const updatedData = {
          name: `${rosterToEdit.name} - Updated`,
          description: 'Updated description for testing'
        };
        
        // Edit the roster
        cy.editEmployeeRoster(rosterToEdit.name, updatedData);
        cy.wait('@updateRoster');
        
        // Verify changes
        cy.contains('td', updatedData.name).should('be.visible');
      });
      
      // Check accessibility
      cy.checkA11y('after editing roster');
    });
    
    it('should delete an employee roster', () => {
      // Get the last roster
      cy.get('@rosterData').then((rosters) => {
        const rosterToDelete = rosters[rosters.length - 1];
        
        // Delete the roster
        cy.deleteEmployeeRoster(rosterToDelete.name);
        cy.wait('@deleteRoster');
        
        // Verify it's gone
        cy.contains('td', rosterToDelete.name).should('not.exist');
      });
      
      // Check accessibility
      cy.checkA11y('after deleting roster');
    });
    
    it('should navigate to employee management', () => {
      // Get the first roster
      cy.get('@rosterData').then((rosters) => {
        const roster = rosters[0];
        
        // Navigate to employees
        cy.navigateToRosterEmployees(roster.name);
        cy.wait('@getEmployees');
        
        // Verify navigation
        cy.url().should('include', `/earnings/rosters/${roster.id}/employees`);
        cy.contains(`Managing employees for roster`).should('be.visible');
      });
      
      // Check accessibility
      cy.checkA11y('employee management page');
    });
    
    it('should navigate to earnings mapping', () => {
      // Get the first roster
      cy.get('@rosterData').then((rosters) => {
        const roster = rosters[0];
        
        // Navigate to mappings
        cy.navigateToRosterMappings(roster.name);
        cy.wait('@getMappings');
        
        // Verify navigation
        cy.url().should('include', `/earnings/rosters/${roster.id}/mappings`);
        cy.contains(`Editing earnings mappings for roster`).should('be.visible');
      });
      
      // Check accessibility
      cy.checkA11y('earnings mapping page');
    });
    
    it('should sync a roster', () => {
      // Intercept sync request
      cy.intercept('POST', '/api/earnings/rosters/sync', { 
        statusCode: 202,
        body: { message: 'Sync started' }
      }).as('syncRoster');
      
      // Get the first roster
      cy.get('@rosterData').then((rosters) => {
        const roster = rosters[0];
        
        // Sync the roster
        cy.syncRoster(roster.name);
        cy.wait('@syncRoster');
        
        // Verify success message
        cy.contains('Roster sync started successfully').should('be.visible');
      });
    });
  });
  
  describe('Earnings Codes Management', () => {
    beforeEach(() => {
      // Navigate to earnings codes tab
      cy.navigateToEarningsCodes();
      cy.wait('@getEarningsCodes');
    });
    
    it('should display the list of earnings codes', () => {
      // Verify the codes table is displayed
      cy.contains('Earnings Codes').should('be.visible');
      cy.get('table').should('be.visible');
      
      // Verify each code is displayed
      cy.get('@earningsCodeData').then((codes) => {
        codes.forEach(code => {
          cy.contains('td', code.code).should('be.visible');
        });
      });
      
      // Check accessibility
      cy.checkA11y('earnings codes list');
    });
    
    it('should create a new earnings code', () => {
      // Intercept create request
      cy.intercept('POST', '/api/earnings/earnings-codes', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            ...req.body,
            id: '10' // Assign a new ID
          }
        });
      }).as('createCode');
      
      // Create new code
      const newCode = {
        code: 'SHIFT',
        description: 'Shift Differential',
        source_system: 'HR-SYS-001',
        destination_system: 'PAY-SYS-001',
        category: 'Premium Pay'
      };
      
      cy.createEarningsCode(newCode);
      cy.wait('@createCode');
      
      // Verify new code appears in the list
      cy.contains('td', newCode.code).should('be.visible');
      
      // Check accessibility
      cy.checkA11y('after creating code');
    });
    
    it('should filter earnings codes by system', () => {
      // Get codes for a specific system
      cy.get('@earningsCodeData').then((codes) => {
        // Group codes by destination system
        const systems = {};
        codes.forEach(code => {
          if (code.destination_system) {
            systems[code.destination_system] = systems[code.destination_system] || [];
            systems[code.destination_system].push(code);
          }
        });
        
        // Select a system with multiple codes
        const system = Object.keys(systems).find(sys => systems[sys].length > 1);
        const systemCodes = systems[system];
        
        // Filter by that system
        cy.intercept('GET', `/api/earnings/earnings-codes*`, systemCodes).as('filterCodes');
        cy.filterEarningsCodesBySystem(system);
        cy.wait('@filterCodes');
        
        // Verify only those codes are visible
        cy.get('table tbody tr').should('have.length', systemCodes.length);
        systemCodes.forEach(code => {
          cy.contains('td', code.code).should('be.visible');
        });
        
        // Codes from other systems should not be visible
        const otherSystemCodes = codes.filter(code => code.destination_system !== system);
        if (otherSystemCodes.length > 0) {
          cy.contains('td', otherSystemCodes[0].code).should('not.exist');
        }
      });
    });
  });
  
  describe('Employee Management', () => {
    beforeEach(() => {
      // Navigate to employees of the first roster
      cy.get('@rosterData').then((rosters) => {
        const roster = rosters[0];
        cy.navigateToRosterEmployees(roster.name);
        cy.wait('@getEmployees');
      });
    });
    
    it('should display the list of employees for a roster', () => {
      // Verify the employee table is displayed
      cy.contains('Employees').should('be.visible');
      cy.get('table').should('be.visible');
      
      // Get employees of the first roster
      cy.get('@rosterData').then((rosters) => {
        const rosterId = rosters[0].id;
        
        // Get employees for this roster
        cy.get('@employeeData').then((employees) => {
          const rosterEmployees = employees.filter(emp => emp.roster_id === rosterId);
          
          // Verify each employee is displayed
          rosterEmployees.forEach(employee => {
            cy.contains('td', `${employee.first_name} ${employee.last_name}`).should('be.visible');
          });
          
          // Verify employee count
          cy.get('table tbody tr').should('have.length', rosterEmployees.length);
        });
      });
      
      // Check accessibility
      cy.checkA11y('employee list');
    });
    
    it('should create a new employee', () => {
      // Intercept create request
      cy.intercept('POST', '/api/earnings/employees', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            ...req.body,
            id: '501' // Assign a new ID
          }
        });
      }).as('createEmployee');
      
      // Create new employee
      const newEmployee = {
        employee_id: 'EMP-999',
        first_name: 'Test',
        last_name: 'User',
        email: 'test.user@example.com',
        department: 'Finance',
        position: 'Test Position'
      };
      
      cy.createEmployee(newEmployee);
      cy.wait('@createEmployee');
      
      // Verify new employee appears in the list
      cy.contains('td', `${newEmployee.first_name} ${newEmployee.last_name}`).should('be.visible');
      
      // Check accessibility
      cy.checkA11y('after creating employee');
    });
    
    it('should search for employees', () => {
      // Get employees of the first roster
      cy.get('@rosterData').then((rosters) => {
        const rosterId = rosters[0].id;
        
        // Get employees for this roster
        cy.get('@employeeData').then((employees) => {
          const rosterEmployees = employees.filter(emp => emp.roster_id === rosterId);
          if (rosterEmployees.length > 0) {
            const employee = rosterEmployees[0];
            
            // Search for this employee
            cy.searchEmployees(employee.last_name);
            
            // Verify only matching employees are shown
            cy.contains('td', `${employee.first_name} ${employee.last_name}`).should('be.visible');
            
            // Other employees with different last names should not be visible
            rosterEmployees.forEach(otherEmp => {
              if (otherEmp.last_name !== employee.last_name) {
                cy.contains('td', `${otherEmp.first_name} ${otherEmp.last_name}`).should('not.exist');
              }
            });
          }
        });
      });
    });
  });
  
  describe('Earnings Mapping', () => {
    beforeEach(() => {
      // Navigate to mappings of the first roster
      cy.get('@rosterData').then((rosters) => {
        const roster = rosters[0];
        cy.navigateToRosterMappings(roster.name);
        cy.wait('@getMappings');
      });
    });
    
    it('should display the earnings mappings for a roster', () => {
      // Verify the mappings table is displayed
      cy.contains('Earnings Mappings').should('be.visible');
      cy.get('table').should('be.visible');
      
      // Get mappings of the first roster
      cy.get('@rosterData').then((rosters) => {
        const rosterId = rosters[0].id;
        
        // Get mappings for this roster
        cy.get('@mappingData').then((mappings) => {
          const rosterMappings = mappings.filter(mapping => mapping.roster_id === rosterId);
          
          // Verify each mapping is displayed
          rosterMappings.forEach(mapping => {
            cy.contains('td', mapping.source_code).should('be.visible');
            cy.contains('td', mapping.destination_code).should('be.visible');
          });
          
          // Verify mapping count
          cy.get('table tbody tr').should('have.length', rosterMappings.length);
        });
      });
      
      // Check accessibility
      cy.checkA11y('mappings list');
    });
    
    it('should create a new earnings mapping', () => {
      // Intercept create request
      cy.intercept('POST', '/api/earnings/earnings-maps', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            ...req.body,
            id: '10' // Assign a new ID
          }
        });
      }).as('createMapping');
      
      // Get codes for the source and destination
      cy.get('@earningsCodeData').then((codes) => {
        // Find two codes that aren't already mapped
        const sourceCode = codes.find(code => code.code === 'SICK');
        const destCode = '2500'; // Some destination code
        
        // Create new mapping
        const newMapping = {
          source_code: sourceCode.code,
          destination_code: destCode,
          multiplier: '1.0'
        };
        
        cy.createEarningsMapping(newMapping);
        cy.wait('@createMapping');
        
        // Verify new mapping appears in the list
        cy.contains('td', sourceCode.code).should('be.visible');
        cy.contains('td', destCode).should('be.visible');
        
        // Check accessibility
        cy.checkA11y('after creating mapping');
      });
    });
  });
});