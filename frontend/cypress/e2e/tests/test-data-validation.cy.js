/**
 * Cypress test for test data validation functionality
 */

describe('Test Data Validation', () => {
  it('validates a generated user entity', () => {
    cy.mockUser().then(user => {
      cy.validateUser(user).then(result => {
        expect(result.valid).to.be.true;
        expect(result.errors).to.have.length(0);
      });
    });
  });

  it('catches validation errors in user entity', () => {
    cy.mockUser().then(user => {
      // Modify user to make it invalid
      delete user.name;
      user.role = 'invalid-role';
      
      cy.validateUser(user).then(result => {
        expect(result.valid).to.be.false;
        expect(result.errors).to.have.length(2);
        
        const fieldErrors = result.errors.map(err => err.field);
        expect(fieldErrors).to.include('name');
        expect(fieldErrors).to.include('role');
      });
    });
  });

  it('validates entity relationships in test context', () => {
    cy.createValidTestContext().then(context => {
      cy.validateAllRelationships(context).then(result => {
        expect(result.valid).to.be.true;
        expect(result.errors).to.have.length(0);
      });
    });
  });
  
  it('detects invalid relationships in test context', () => {
    cy.createValidTestContext().then(context => {
      // Create invalid relationship by changing tenantId
      context.users[0].tenantId = 'non-existent-tenant-id';
      
      cy.validateAllRelationships(context).then(result => {
        expect(result.valid).to.be.false;
        expect(result.errors).to.have.length(1);
        expect(result.errors[0].field).to.equal('tenantId');
      });
    });
  });
});