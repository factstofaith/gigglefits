/**
 * End-to-End Test Template
 * 
 * This template demonstrates how to create end-to-end tests using our testing framework.
 * It includes page objects, test suites, and common user flows.
 */

import { E2ETesting, createE2ETestSuite, PageObject } from '../../utils/e2eTesting';

// Example login page object
class LoginPage extends PageObject {
  constructor(e2e) {
    super(e2e, '/login');
    
    // Define selectors for the page
    this.addSelectors({
      pageLoaded: '[data-testid="login-form"]',
      usernameInput: '[data-testid="username-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]',
      errorMessage: '[data-testid="login-error"]',
      forgotPasswordLink: '[data-testid="forgot-password-link"]'
    });
  }
  
  // Login action
  async login(username, password) {
    await this.fill('usernameInput', username);
    await this.fill('passwordInput', password);
    await this.click('loginButton');
  }
  
  // Check if error message is visible
  async hasError() {
    const selector = this.getSelector('errorMessage');
    return await this.e2e.exists(selector);
  }
  
  // Get error message text
  async getErrorMessage() {
    const selector = this.getSelector('errorMessage');
    return await this.e2e.getText(selector);
  }
  
  // Click forgot password link
  async clickForgotPassword() {
    await this.click('forgotPasswordLink');
  }
}

// Example dashboard page object
class DashboardPage extends PageObject {
  constructor(e2e) {
    super(e2e, '/dashboard');
    
    // Define selectors for the page
    this.addSelectors({
      pageLoaded: '[data-testid="dashboard-content"]',
      userName: '[data-testid="user-name"]',
      createButton: '[data-testid="create-new-button"]',
      userMenu: '[data-testid="user-menu"]',
      logoutButton: '[data-testid="logout-button"]',
      integrationsLink: '[data-testid="nav-integrations"]',
      settingsLink: '[data-testid="nav-settings"]'
    });
  }
  
  // Get user name displayed
  async getUserName() {
    const selector = this.getSelector('userName');
    return await this.e2e.getText(selector);
  }
  
  // Click create new button
  async clickCreateNew() {
    await this.click('createButton');
  }
  
  // Logout action
  async logout() {
    await this.click('userMenu');
    await this.click('logoutButton');
  }
  
  // Go to integrations
  async navigateToIntegrations() {
    await this.click('integrationsLink');
  }
  
  // Go to settings
  async navigateToSettings() {
    await this.click('settingsLink');
  }
}

// Example test suite
describe('E2E Tests Template', () => {
  // Initialize global testing instance
  let e2e;
  
  // Initialize page objects
  let loginPage;
  let dashboardPage;
  
  // Set up before all tests
  beforeAll(async () => {
    // Configure E2E testing
    e2e = new E2ETesting({
      baseUrl: 'http://localhost:3000',
      browser: 'chrome',
      headless: true,
      screenshotsDir: 'e2e-results/screenshots',
      videosDir: 'e2e-results/videos'
    });
    
    // Initialize browser
    await e2e.initialize();
    
    // Create page objects
    loginPage = new LoginPage(e2e);
    dashboardPage = new DashboardPage(e2e);
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await e2e.cleanup();
  });
  
  // Test authentication
  describe('Authentication', () => {
    beforeEach(async () => {
      // Navigate to login page before each test
      await loginPage.navigate();
      await loginPage.waitForLoad();
    });
    
    test('successful login redirects to dashboard', async () => {
      // Perform login
      await loginPage.login('testuser@example.com', 'password123');
      
      // Wait for dashboard to load
      await dashboardPage.waitForLoad();
      
      // Check user name
      const userName = await dashboardPage.getUserName();
      expect(userName).toContain('Test User');
      
      // Log out for next test
      await dashboardPage.logout();
    });
    
    test('unsuccessful login shows error message', async () => {
      // Perform login with wrong password
      await loginPage.login('testuser@example.com', 'wrongpassword');
      
      // Check error message
      expect(await loginPage.hasError()).toBe(true);
      expect(await loginPage.getErrorMessage()).toContain('Invalid credentials');
    });
    
    test('forgot password link navigates to password reset', async () => {
      // Click forgot password
      await loginPage.clickForgotPassword();
      
      // Wait for password reset page
      await e2e.waitForElement('[data-testid="reset-password-form"]');
      
      // Check URL
      const url = await e2e.evaluate(() => window.location.pathname);
      expect(url).toBe('/reset-password');
    });
  });
  
  // Test main user flows
  describe('User Flows', () => {
    // Login before all flow tests
    beforeAll(async () => {
      await loginPage.navigate();
      await loginPage.waitForLoad();
      await loginPage.login('testuser@example.com', 'password123');
      await dashboardPage.waitForLoad();
    });
    
    // Logout after all flow tests
    afterAll(async () => {
      await dashboardPage.logout();
    });
    
    test('create new item from dashboard', async () => {
      // Click create new button
      await dashboardPage.clickCreateNew();
      
      // Wait for creation modal
      await e2e.waitForElement('[data-testid="create-modal"]');
      
      // Fill form
      await e2e.fillForm('[data-testid="create-form"]', {
        name: 'Test Item',
        description: 'Created from E2E test',
        type: 'Standard'
      });
      
      // Submit form
      await e2e.click('[data-testid="create-form-submit"]');
      
      // Wait for success message
      await e2e.waitForElement('[data-testid="success-notification"]');
      
      // Check success message text
      const successText = await e2e.getText('[data-testid="success-notification"]');
      expect(successText).toContain('successfully created');
    });
    
    test('navigation between sections works', async () => {
      // Go to integrations
      await dashboardPage.navigateToIntegrations();
      
      // Check URL
      let url = await e2e.evaluate(() => window.location.pathname);
      expect(url).toBe('/integrations');
      
      // Go to settings
      await dashboardPage.navigateToSettings();
      
      // Check URL
      url = await e2e.evaluate(() => window.location.pathname);
      expect(url).toBe('/settings');
      
      // Go back to dashboard
      await e2e.navigate('/dashboard');
      await dashboardPage.waitForLoad();
    });
  });
  
  // Test using test suite builder
  describe('Test Suite Builder Example', () => {
    test('runs a complete test suite', async () => {
      // Create test suite
      const suite = createE2ETestSuite('Example Suite', {
        baseUrl: 'http://localhost:3000'
      });
      
      // Add before each hook
      suite.setBeforeEach(async (e2e) => {
        // Reset test state
        await e2e.navigate('/');
      });
      
      // Add tests
      suite.test('Home page loads', async (e2e) => {
        await e2e.navigate('/');
        await e2e.waitForElement('[data-testid="home-content"]');
        
        const title = await e2e.getText('h1');
        expect(title).toContain('Welcome');
      });
      
      suite.test('Search feature works', async (e2e) => {
        await e2e.navigate('/');
        await e2e.fill('[data-testid="search-input"]', 'test');
        await e2e.press('Enter');
        
        await e2e.waitForElement('[data-testid="search-results"]');
        const resultsCount = await e2e.evaluate(() => {
          return document.querySelectorAll('[data-testid="result-item"]').length;
        });
        
        expect(resultsCount).toBeGreaterThan(0);
      });
      
      // Run suite
      const results = await suite.run();
      
      // Check results
      expect(results.passed).toBe(2);
      expect(results.failed).toBe(0);
    });
  });
});