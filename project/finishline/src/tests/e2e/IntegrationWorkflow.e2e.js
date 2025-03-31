/**
 * Integration Workflow E2E Tests
 * 
 * Tests the end-to-end flow of creating, viewing, editing, and running integrations.
 */

import { E2ETesting, PageObject } from '../../utils/e2eTesting';

// Login page
class LoginPage extends PageObject {
  constructor(e2e) {
    super(e2e, '/login');
    
    this.addSelectors({
      pageLoaded: '[data-testid="login-form"]',
      usernameInput: '[data-testid="username-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]'
    });
  }
  
  async login(username, password) {
    await this.fill('usernameInput', username);
    await this.fill('passwordInput', password);
    await this.click('loginButton');
  }
}

// Integrations list page
class IntegrationsListPage extends PageObject {
  constructor(e2e) {
    super(e2e, '/integrations');
    
    this.addSelectors({
      pageLoaded: '[data-testid="integrations-list"]',
      createButton: '[data-testid="create-integration-button"]',
      integrationCard: (name) => `[data-testid="integration-card"][data-name="${name}"]`,
      searchInput: '[data-testid="search-integrations-input"]',
      emptyMessage: '[data-testid="empty-integrations-message"]',
      loadingSpinner: '[data-testid="loading-spinner"]'
    });
  }
  
  async clickCreateIntegration() {
    await this.click('createButton');
  }
  
  async openIntegration(name) {
    const selector = this.getSelector('integrationCard')(name);
    await this.e2e.click(selector);
  }
  
  async searchIntegrations(term) {
    await this.fill('searchInput', term);
    await this.e2e.press('Enter');
    // Wait for search results
    await this.e2e.wait(500);
  }
  
  async getIntegrationsCount() {
    return await this.e2e.evaluate(() => {
      return document.querySelectorAll('[data-testid="integration-card"]').length;
    });
  }
  
  async isIntegrationPresent(name) {
    const selector = this.getSelector('integrationCard')(name);
    return await this.e2e.exists(selector);
  }
}

// Integration creation dialog
class IntegrationCreationDialog extends PageObject {
  constructor(e2e) {
    super(e2e, '');
    
    this.addSelectors({
      dialog: '[data-testid="integration-creation-dialog"]',
      nameInput: '[data-testid="integration-name-input"]',
      descriptionInput: '[data-testid="integration-description-input"]',
      sourceSelect: '[data-testid="integration-source-select"]',
      destinationSelect: '[data-testid="integration-destination-select"]',
      typeSelect: '[data-testid="integration-type-select"]',
      createButton: '[data-testid="create-integration-button"]',
      cancelButton: '[data-testid="cancel-button"]',
      errorMessage: '[data-testid="dialog-error-message"]'
    });
  }
  
  async waitForDialog() {
    await this.e2e.waitForElement(this.getSelector('dialog'));
  }
  
  async fillIntegrationDetails(details) {
    if (details.name) {
      await this.fill('nameInput', details.name);
    }
    
    if (details.description) {
      await this.fill('descriptionInput', details.description);
    }
    
    if (details.source) {
      await this.e2e.selectOption(this.getSelector('sourceSelect'), details.source);
    }
    
    if (details.destination) {
      await this.e2e.selectOption(this.getSelector('destinationSelect'), details.destination);
    }
    
    if (details.type) {
      await this.e2e.selectOption(this.getSelector('typeSelect'), details.type);
    }
  }
  
  async createIntegration() {
    await this.click('createButton');
  }
  
  async cancelCreation() {
    await this.click('cancelButton');
  }
  
  async getErrorMessage() {
    if (await this.e2e.exists(this.getSelector('errorMessage'))) {
      return await this.e2e.getText(this.getSelector('errorMessage'));
    }
    return null;
  }
  
  async isDialogOpen() {
    return await this.e2e.exists(this.getSelector('dialog'));
  }
}

// Integration detail page
class IntegrationDetailPage extends PageObject {
  constructor(e2e) {
    super(e2e, '/integrations/:id');
    
    this.addSelectors({
      pageLoaded: '[data-testid="integration-detail-view"]',
      integrationName: '[data-testid="integration-name"]',
      runNowButton: '[data-testid="run-now-button"]',
      editButton: '[data-testid="edit-button"]',
      tabOverview: '[data-testid="tab-overview"]',
      tabConfiguration: '[data-testid="tab-configuration"]',
      tabSchedule: '[data-testid="tab-schedule"]',
      saveChangesButton: '[data-testid="save-changes-button"]',
      cancelButton: '[data-testid="cancel-button"]',
      configurationForm: '[data-testid="azure-blob-config-form"]',
      scheduleForm: '[data-testid="schedule-config-form"]',
      connectionStringInput: '[data-testid="connection-string-input"]',
      containerNameInput: '[data-testid="container-name-input"]',
      scheduleTypeSelect: '[data-testid="schedule-type-select"]',
      successNotification: '[data-testid="success-notification"]',
      errorNotification: '[data-testid="error-notification"]'
    });
  }
  
  async navigateToIntegration(integrationId) {
    await this.e2e.navigate(`/integrations/${integrationId}`);
    await this.waitForLoad();
  }
  
  async clickRunNow() {
    await this.click('runNowButton');
  }
  
  async clickEdit() {
    await this.click('editButton');
  }
  
  async switchToConfigurationTab() {
    await this.click('tabConfiguration');
  }
  
  async switchToScheduleTab() {
    await this.click('tabSchedule');
  }
  
  async switchToOverviewTab() {
    await this.click('tabOverview');
  }
  
  async saveChanges() {
    await this.click('saveChangesButton');
  }
  
  async cancelEdit() {
    await this.click('cancelButton');
  }
  
  async fillAzureBlobConfig(config) {
    await this.fill('connectionStringInput', config.connectionString);
    await this.fill('containerNameInput', config.containerName);
  }
  
  async setScheduleType(type) {
    await this.e2e.selectOption(this.getSelector('scheduleTypeSelect'), type);
  }
  
  async getIntegrationName() {
    return await this.e2e.getText(this.getSelector('integrationName'));
  }
  
  async isInEditMode() {
    return await this.e2e.exists(this.getSelector('saveChangesButton'));
  }
  
  async isRunButtonEnabled() {
    const disabled = await this.e2e.getAttribute(this.getSelector('runNowButton'), 'disabled');
    return disabled !== 'true' && disabled !== true;
  }
  
  async waitForSuccessNotification() {
    await this.e2e.waitForElement(this.getSelector('successNotification'));
    return await this.e2e.getText(this.getSelector('successNotification'));
  }
  
  async waitForErrorNotification() {
    await this.e2e.waitForElement(this.getSelector('errorNotification'));
    return await this.e2e.getText(this.getSelector('errorNotification'));
  }
}

// Run the E2E tests
describe('Integration Workflow E2E Tests', () => {
  let e2e;
  let loginPage;
  let integrationsListPage;
  let integrationCreationDialog;
  let integrationDetailPage;
  let createdIntegrationId;
  
  // Set up the test environment
  beforeAll(async () => {
    // Create and configure E2E testing instance
    e2e = new E2ETesting({
      baseUrl: 'http://localhost:3000',
      browser: 'chrome',
      headless: true,
      screenshotsDir: 'e2e-results/screenshots/integration-workflow',
      videosDir: 'e2e-results/videos/integration-workflow'
    });
    
    // Initialize browser
    await e2e.initialize();
    
    // Create page objects
    loginPage = new LoginPage(e2e);
    integrationsListPage = new IntegrationsListPage(e2e);
    integrationCreationDialog = new IntegrationCreationDialog(e2e);
    integrationDetailPage = new IntegrationDetailPage(e2e);
    
    // Login before tests
    await loginPage.navigate();
    await loginPage.waitForLoad();
    await loginPage.login('admin@example.com', 'admin123');
    
    // Wait for successful login and navigation to dashboard
    await e2e.waitForNavigation();
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await e2e.cleanup();
  });
  
  // Test creating a new integration
  describe('Integration Creation', () => {
    test('navigates to integrations list page', async () => {
      // Navigate to the integrations list page
      await integrationsListPage.navigate();
      await integrationsListPage.waitForLoad();
      
      // Verify it loaded
      const url = await e2e.evaluate(() => window.location.pathname);
      expect(url).toBe('/integrations');
    });
    
    test('opens integration creation dialog', async () => {
      // Click the create button
      await integrationsListPage.clickCreateIntegration();
      
      // Verify the dialog opens
      await integrationCreationDialog.waitForDialog();
      expect(await integrationCreationDialog.isDialogOpen()).toBe(true);
    });
    
    test('validates required fields', async () => {
      // Try to create with empty fields
      await integrationCreationDialog.createIntegration();
      
      // Verify error message
      const errorMessage = await integrationCreationDialog.getErrorMessage();
      expect(errorMessage).toContain('required');
    });
    
    test('creates a new integration successfully', async () => {
      // Create a test integration name with timestamp to ensure uniqueness
      const timestamp = new Date().getTime();
      const integrationName = `E2E Test Integration ${timestamp}`;
      
      // Fill in the form
      await integrationCreationDialog.fillIntegrationDetails({
        name: integrationName,
        description: 'Created by E2E test',
        source: 'Azure Blob Container',
        destination: 'Database',
        type: 'Data Transfer'
      });
      
      // Create the integration
      await integrationCreationDialog.createIntegration();
      
      // Wait for redirect to detail page
      await e2e.waitForNavigation();
      
      // Extract integration ID from URL
      createdIntegrationId = await e2e.evaluate(() => {
        const match = window.location.pathname.match(/\/integrations\/(.+)/);
        return match ? match[1] : null;
      });
      
      // Verify we're on the detail page
      await integrationDetailPage.waitForLoad();
      
      // Verify the integration name
      const displayedName = await integrationDetailPage.getIntegrationName();
      expect(displayedName).toContain(integrationName);
      
      // Ensure we have a valid integration ID
      expect(createdIntegrationId).toBeTruthy();
    });
  });
  
  // Test viewing and editing integration
  describe('Integration Viewing and Editing', () => {
    test('navigates to integration detail page', async () => {
      // Navigate directly to the integration detail page
      await integrationDetailPage.navigateToIntegration(createdIntegrationId);
      
      // Verify it loaded
      await integrationDetailPage.waitForLoad();
      const url = await e2e.evaluate(() => window.location.pathname);
      expect(url).toBe(`/integrations/${createdIntegrationId}`);
    });
    
    test('switches between tabs', async () => {
      // Switch to configuration tab
      await integrationDetailPage.switchToConfigurationTab();
      expect(await e2e.exists(integrationDetailPage.getSelector('configurationForm'))).toBe(true);
      
      // Switch to schedule tab
      await integrationDetailPage.switchToScheduleTab();
      expect(await e2e.exists(integrationDetailPage.getSelector('scheduleForm'))).toBe(true);
      
      // Switch back to overview tab
      await integrationDetailPage.switchToOverviewTab();
    });
    
    test('enters edit mode', async () => {
      // Click edit button
      await integrationDetailPage.clickEdit();
      
      // Verify edit mode
      expect(await integrationDetailPage.isInEditMode()).toBe(true);
      expect(await e2e.exists(integrationDetailPage.getSelector('saveChangesButton'))).toBe(true);
    });
    
    test('edits and saves Azure Blob configuration', async () => {
      // Switch to configuration tab
      await integrationDetailPage.switchToConfigurationTab();
      
      // Fill Azure Blob configuration
      await integrationDetailPage.fillAzureBlobConfig({
        connectionString: 'DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=testkey;EndpointSuffix=core.windows.net',
        containerName: 'e2e-test-container'
      });
      
      // Switch to schedule tab
      await integrationDetailPage.switchToScheduleTab();
      
      // Change schedule type
      await integrationDetailPage.setScheduleType('daily');
      
      // Save changes
      await integrationDetailPage.saveChanges();
      
      // Verify success notification
      const notification = await integrationDetailPage.waitForSuccessNotification();
      expect(notification).toContain('success');
      
      // Verify not in edit mode anymore
      expect(await integrationDetailPage.isInEditMode()).toBe(false);
    });
    
    test('can cancel edit mode', async () => {
      // Enter edit mode again
      await integrationDetailPage.clickEdit();
      
      // Verify edit mode
      expect(await integrationDetailPage.isInEditMode()).toBe(true);
      
      // Cancel edit
      await integrationDetailPage.cancelEdit();
      
      // Verify not in edit mode anymore
      expect(await integrationDetailPage.isInEditMode()).toBe(false);
    });
  });
  
  // Test running integration
  describe('Running Integration', () => {
    test('runs integration successfully', async () => {
      // Click run now button
      await integrationDetailPage.clickRunNow();
      
      // Verify button is disabled during run
      expect(await integrationDetailPage.isRunButtonEnabled()).toBe(false);
      
      // Wait for run to complete (button becomes enabled again)
      await e2e.wait(3000); // Wait for mock run to complete
      expect(await integrationDetailPage.isRunButtonEnabled()).toBe(true);
    });
  });
  
  // Test integration list and search
  describe('Integration Listing and Search', () => {
    test('navigates back to list and searches for integration', async () => {
      // Navigate to the integrations list page
      await integrationsListPage.navigate();
      await integrationsListPage.waitForLoad();
      
      // Extract integration name for search
      await integrationDetailPage.navigateToIntegration(createdIntegrationId);
      const integrationName = await integrationDetailPage.getIntegrationName();
      
      // Go back to list
      await integrationsListPage.navigate();
      await integrationsListPage.waitForLoad();
      
      // Search for the integration
      await integrationsListPage.searchIntegrations(integrationName);
      
      // Verify integration is found
      expect(await integrationsListPage.isIntegrationPresent(integrationName)).toBe(true);
      
      // Clear search and verify all integrations are shown
      await integrationsListPage.searchIntegrations('');
      const count = await integrationsListPage.getIntegrationsCount();
      expect(count).toBeGreaterThan(0);
    });
    
    test('opens integration from list', async () => {
      // Navigate to the integrations list page
      await integrationsListPage.navigate();
      await integrationsListPage.waitForLoad();
      
      // Extract integration name
      await integrationDetailPage.navigateToIntegration(createdIntegrationId);
      const integrationName = await integrationDetailPage.getIntegrationName();
      
      // Go back to list
      await integrationsListPage.navigate();
      await integrationsListPage.waitForLoad();
      
      // Open integration
      await integrationsListPage.openIntegration(integrationName);
      
      // Verify redirected to detail page
      await integrationDetailPage.waitForLoad();
      const url = await e2e.evaluate(() => window.location.pathname);
      expect(url).toBe(`/integrations/${createdIntegrationId}`);
    });
  });
});