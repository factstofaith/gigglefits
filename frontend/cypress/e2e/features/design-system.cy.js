describe('Design System Visual Validation', () => {
  it('Should render Home page with design system components', () => {
    cy.visit('/');
    cy.wait(1000); // Allow for any animations/loading
    cy.percySnapshot('Home Page');
  });

  it('Should render Admin Dashboard with design system components', () => {
    cy.visit('/admin');
    cy.wait(1000);
    cy.percySnapshot('Admin Dashboard');
  });

  it('Should render Integration page with design system components', () => {
    cy.visit('/integrations');
    cy.wait(1000);
    cy.percySnapshot('Integrations Page');
  });

  it('Should render Templates page with design system components', () => {
    cy.visit('/templates');
    cy.wait(1000);
    cy.percySnapshot('Templates Page');
  });

  it('Should open and render Auth Modal properly', () => {
    cy.visit('/');
    // Find and click login button
    cy.contains('button', 'Login').click();
    cy.wait(500);
    cy.percySnapshot('Auth Modal');
  });
});