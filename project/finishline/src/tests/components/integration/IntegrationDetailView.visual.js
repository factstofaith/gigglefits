/**
 * Visual Regression Tests for IntegrationDetailView
 * 
 * Tests the visual appearance of the IntegrationDetailView component in different states.
 */

import { VisualTesting, ComponentVisualState } from '../../../utils/visualRegressionTesting';

describe('IntegrationDetailView Visual Tests', () => {
  let visualTesting;
  
  // Set up visual testing before tests
  beforeAll(async () => {
    // Configure visual testing
    visualTesting = new VisualTesting({
      snapshotsDir: '__snapshots__/visual/integration',
      diffDir: '__diff__/visual/integration',
      threshold: 0.02, // 2% threshold to allow for minor rendering differences
      viewports: ['375x667', '768x1024', '1440x900'],
    });
    
    // Initialize visual testing
    await visualTesting.initialize();
  });
  
  // Clean up after tests
  afterAll(async () => {
    await visualTesting.cleanup();
  });
  
  // Test different states of the IntegrationDetailView component
  test('renders all states correctly', async () => {
    // Base URL for the component (would point to a storybook page in real implementation)
    const baseUrl = 'http://localhost:6006/iframe.html?id=components-integration-integrationdetailview';
    
    // Define component states to test
    const states = new ComponentVisualState()
      // Default state with data
      .addDefaultState({ 
        integrationId: '123',
        mockData: {
          id: '123',
          name: 'Test Integration',
          description: 'This is a test integration for visual regression testing',
          source: 'Azure Blob Container',
          destination: 'Database',
          type: 'Data Transfer',
          createdAt: '2025-03-15T10:00:00Z',
          updatedAt: '2025-03-16T11:00:00Z',
          azureBlobConfig: {
            authMethod: 'connectionString',
            containerName: 'test-container'
          },
          schedule: {
            type: 'onDemand'
          }
        }
      })
      // Loading state
      .addLoadingState({ 
        integrationId: '123',
        loading: true
      })
      // Error state
      .addErrorState({ 
        integrationId: '123',
        error: 'Failed to load integration details'
      })
      // Edit mode
      .addState('editing', { 
        integrationId: '123',
        isEditing: true,
        mockData: {
          id: '123',
          name: 'Test Integration',
          description: 'This is a test integration for visual regression testing',
          source: 'Azure Blob Container',
          destination: 'Database',
          type: 'Data Transfer',
          createdAt: '2025-03-15T10:00:00Z',
          updatedAt: '2025-03-16T11:00:00Z',
          azureBlobConfig: {
            authMethod: 'connectionString',
            containerName: 'test-container'
          },
          schedule: {
            type: 'onDemand'
          }
        }
      })
      // Configuration tab
      .addState('configTab', { 
        integrationId: '123',
        activeTab: 1,
        mockData: {
          id: '123',
          name: 'Test Integration',
          description: 'This is a test integration for visual regression testing',
          source: 'Azure Blob Container',
          destination: 'Database',
          type: 'Data Transfer',
          createdAt: '2025-03-15T10:00:00Z',
          updatedAt: '2025-03-16T11:00:00Z',
          azureBlobConfig: {
            authMethod: 'connectionString',
            containerName: 'test-container'
          },
          schedule: {
            type: 'onDemand'
          }
        }
      })
      // Schedule tab
      .addState('scheduleTab', { 
        integrationId: '123',
        activeTab: 2,
        mockData: {
          id: '123',
          name: 'Test Integration',
          description: 'This is a test integration for visual regression testing',
          source: 'Azure Blob Container',
          destination: 'Database',
          type: 'Data Transfer',
          createdAt: '2025-03-15T10:00:00Z',
          updatedAt: '2025-03-16T11:00:00Z',
          azureBlobConfig: {
            authMethod: 'connectionString',
            containerName: 'test-container'
          },
          schedule: {
            type: 'daily',
            cronExpression: '0 0 * * *',
            timezone: 'UTC'
          }
        }
      })
      // Non-Azure source/destination
      .addState('nonAzure', { 
        integrationId: '123',
        mockData: {
          id: '123',
          name: 'Test Integration',
          description: 'This is a test integration for visual regression testing',
          source: 'Database',
          destination: 'API',
          type: 'Data Transfer',
          createdAt: '2025-03-15T10:00:00Z',
          updatedAt: '2025-03-16T11:00:00Z',
          schedule: {
            type: 'onDemand'
          }
        }
      })
      // Running integration
      .addState('running', { 
        integrationId: '123',
        isRunning: true,
        mockData: {
          id: '123',
          name: 'Test Integration',
          description: 'This is a test integration for visual regression testing',
          source: 'Azure Blob Container',
          destination: 'Database',
          type: 'Data Transfer',
          createdAt: '2025-03-15T10:00:00Z',
          updatedAt: '2025-03-16T11:00:00Z',
          azureBlobConfig: {
            authMethod: 'connectionString',
            containerName: 'test-container'
          },
          schedule: {
            type: 'onDemand'
          }
        }
      })
      .getStates();
    
    // Run visual tests for all states and viewports
    const results = await visualTesting.testComponentStates(
      'IntegrationDetailView', 
      baseUrl, 
      states
    );
    
    // Check results
    Object.entries(results).forEach(([stateName, viewportResults]) => {
      Object.entries(viewportResults).forEach(([viewport, passed]) => {
        expect(passed).toBe(true);
      });
    });
  });
  
  // Test specific interactions that might change the visual appearance
  test('captures interaction states correctly', async () => {
    // URL for the interactive test page
    const interactionUrl = 'http://localhost:6006/iframe.html?id=components-integration-integrationdetailview--interactions';
    
    // Test button hover state
    const hoverResult = await visualTesting.runTestAllViewports(
      'run-button-hover',
      'IntegrationDetailView',
      `${interactionUrl}&interaction=runButtonHover`
    );
    
    // Test edit mode transition
    const editTransitionResult = await visualTesting.runTestAllViewports(
      'edit-mode-transition',
      'IntegrationDetailView',
      `${interactionUrl}&interaction=editModeTransition`
    );
    
    // Test tab switch animation
    const tabSwitchResult = await visualTesting.runTestAllViewports(
      'tab-switch',
      'IntegrationDetailView',
      `${interactionUrl}&interaction=tabSwitch`
    );
    
    // Check results
    Object.values(hoverResult).forEach(passed => expect(passed).toBe(true));
    Object.values(editTransitionResult).forEach(passed => expect(passed).toBe(true));
    Object.values(tabSwitchResult).forEach(passed => expect(passed).toBe(true));
  });
  
  // Test with different theme modes
  test('renders correctly with different themes', async () => {
    // Base URL for the component
    const baseUrl = 'http://localhost:6006/iframe.html?id=components-integration-integrationdetailview';
    
    // Light theme
    const lightResult = await visualTesting.runTestAllViewports(
      'light-theme',
      'IntegrationDetailView',
      `${baseUrl}&theme=light`
    );
    
    // Dark theme
    const darkResult = await visualTesting.runTestAllViewports(
      'dark-theme',
      'IntegrationDetailView',
      `${baseUrl}&theme=dark`
    );
    
    // Check results
    Object.values(lightResult).forEach(passed => expect(passed).toBe(true));
    Object.values(darkResult).forEach(passed => expect(passed).toBe(true));
  });
  
  // Test long content handling
  test('handles long content correctly', async () => {
    // Base URL for the component
    const baseUrl = 'http://localhost:6006/iframe.html?id=components-integration-integrationdetailview';
    
    // Long name
    const longNameResult = await visualTesting.runTestAllViewports(
      'long-name',
      'IntegrationDetailView',
      `${baseUrl}&longName=true`
    );
    
    // Long description
    const longDescriptionResult = await visualTesting.runTestAllViewports(
      'long-description',
      'IntegrationDetailView',
      `${baseUrl}&longDescription=true`
    );
    
    // Check results
    Object.values(longNameResult).forEach(passed => expect(passed).toBe(true));
    Object.values(longDescriptionResult).forEach(passed => expect(passed).toBe(true));
  });
});