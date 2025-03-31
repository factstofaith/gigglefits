/**
 * Test for IntegrationDetailView Component
 * 
 * Tests the IntegrationDetailView component functionality, including:
 * - Rendering different states (loading, error, normal)
 * - Tab switching
 * - Edit mode toggling
 * - Integration with service calls
 * - Form interactions
 * - Accessibility
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import testing utilities
import { 
  renderWithProviders, 
  createStandardMocks,
  MockApiServer
} from '../../../utils/testingFramework';

// Import the component to test
import IntegrationDetailView from '../../../../frontend/src/components/integration/IntegrationDetailView';

// Mock dependencies
jest.mock('../../../../frontend/src/services/integrationService', () => ({
  getIntegrationById: jest.fn(),
  updateIntegration: jest.fn(),
  runIntegration: jest.fn()
}));

jest.mock('../../../../frontend/src/services/authService', () => ({
  isAdmin: jest.fn(),
}));

// Mock child components
jest.mock('../../../../frontend/src/components/integration/AzureBlobConfiguration', () => {
  return function MockAzureBlobConfiguration(props) {
    return (
      <div data-testid="mock-azure-blob-config">
        <button 
          data-testid="azure-config-change-btn" 
          onClick={() => props.onChange({ 
            ...props.config,
            containerName: 'updated-container' 
          })}
        >
          Update Config
        </button>
        <div>Read Only: {props.readOnly ? 'Yes' : 'No'}</div>
        <div>Super User: {props.isSuperUser ? 'Yes' : 'No'}</div>
      </div>
    );
  };
});

jest.mock('../../../../frontend/src/components/integration/ScheduleConfiguration', () => {
  return function MockScheduleConfiguration(props) {
    return (
      <div data-testid="mock-schedule-config">
        <button 
          data-testid="schedule-change-btn" 
          onClick={() => props.onChange({ 
            ...props.schedule,
            type: 'daily' 
          })}
        >
          Update Schedule
        </button>
        <div>Read Only: {props.readOnly ? 'Yes' : 'No'}</div>
      </div>
    );
  };
});

// Import original services to access for mocking
import { 
  getIntegrationById, 
  updateIntegration, 
  runIntegration 
} from '../../../../frontend/src/services/integrationService';
import authService from '../../../../frontend/src/services/authService';

// Test data
const mockIntegration = {
  id: '123',
  name: 'Test Integration',
  description: 'This is a test integration',
  type: 'Data Transfer',
  source: 'Azure Blob Container',
  destination: 'Database',
  createdAt: '2025-03-15T10:00:00Z',
  updatedAt: '2025-03-16T11:00:00Z',
  azureBlobConfig: {
    authMethod: 'connectionString',
    containerName: 'test-container',
    connectionString: 'DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=testkey;EndpointSuffix=core.windows.net'
  },
  schedule: {
    type: 'onDemand',
    cronExpression: '',
    timezone: 'UTC'
  }
};

describe('IntegrationDetailView Component', () => {
  // Set up test data and mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    getIntegrationById.mockResolvedValue(mockIntegration);
    authService.isAdmin.mockResolvedValue(true);
    updateIntegration.mockResolvedValue({ success: true });
    runIntegration.mockResolvedValue({ status: 'started' });
  });
  
  describe('Rendering Tests', () => {
    test('renders loading state', async () => {
      // Delay the API response
      getIntegrationById.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(mockIntegration), 100);
      }));
      
      // Render the component
      renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Loading indicator should be visible
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Wait for the loading to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
    
    test('renders error state when API fails', async () => {
      // Mock API failure
      getIntegrationById.mockRejectedValue(new Error('API error'));
      
      // Render the component
      renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Failed to load integration details')).toBeInTheDocument();
      });
      
      // Check for reload button
      expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    });
    
    test('renders integration details correctly', async () => {
      // Render the component
      renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Check basic info rendering
      expect(screen.getByText('Azure Blob Container')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Data Transfer')).toBeInTheDocument();
      
      // Check description
      expect(screen.getByText('This is a test integration')).toBeInTheDocument();
      
      // Check dates are formatted
      const dateRegex = new RegExp(new Date(mockIntegration.createdAt).toLocaleString());
      expect(screen.getByText(dateRegex)).toBeInTheDocument();
    });
  });
  
  describe('User Interaction Tests', () => {
    test('switches tabs correctly', async () => {
      // Render the component
      const { user } = renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Initially, Overview tab should be active
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      
      // Click on Configuration tab
      await user.click(screen.getByRole('tab', { name: /Configuration/i }));
      
      // Configuration tab content should now be visible
      expect(screen.getByTestId('mock-azure-blob-config')).toBeInTheDocument();
      
      // Click on Schedule tab
      await user.click(screen.getByRole('tab', { name: /Schedule/i }));
      
      // Schedule tab content should now be visible
      expect(screen.getByTestId('mock-schedule-config')).toBeInTheDocument();
    });
    
    test('toggles edit mode correctly', async () => {
      // Render the component
      const { user } = renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Find and click edit button
      const editButton = screen.getByTestId('EditIcon').closest('button');
      await user.click(editButton);
      
      // Save and Cancel buttons should now be visible
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      
      // Switch to Configuration tab to check readonly is false
      await user.click(screen.getByRole('tab', { name: /Configuration/i }));
      expect(screen.getByText('Read Only: No')).toBeInTheDocument();
      
      // Cancel edit mode
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      
      // Save and Cancel buttons should be hidden again
      expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      
      // Check readonly is now true
      expect(screen.getByText('Read Only: Yes')).toBeInTheDocument();
    });
    
    test('updates and saves configuration changes', async () => {
      // Render the component
      const { user } = renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Enter edit mode
      const editButton = screen.getByTestId('EditIcon').closest('button');
      await user.click(editButton);
      
      // Go to Configuration tab
      await user.click(screen.getByRole('tab', { name: /Configuration/i }));
      
      // Update config
      await user.click(screen.getByTestId('azure-config-change-btn'));
      
      // Save changes
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));
      
      // Check API was called with updated data
      await waitFor(() => {
        expect(updateIntegration).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            azureBlobConfig: expect.objectContaining({
              containerName: 'updated-container'
            })
          }),
          expect.anything()
        );
      });
      
      // Edit mode should be exited after save
      expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    });
    
    test('updates and saves schedule changes', async () => {
      // Render the component
      const { user } = renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Enter edit mode
      const editButton = screen.getByTestId('EditIcon').closest('button');
      await user.click(editButton);
      
      // Go to Schedule tab
      await user.click(screen.getByRole('tab', { name: /Schedule/i }));
      
      // Update schedule
      await user.click(screen.getByTestId('schedule-change-btn'));
      
      // Save changes
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));
      
      // Check API was called with updated data
      await waitFor(() => {
        expect(updateIntegration).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            schedule: expect.objectContaining({
              type: 'daily'
            })
          }),
          expect.anything()
        );
      });
    });
    
    test('runs integration when Run Now button is clicked', async () => {
      // Render the component
      const { user } = renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Find and click Run Now button
      await user.click(screen.getByRole('button', { name: 'Run Now' }));
      
      // Button should show running state
      expect(screen.getByText('Running...')).toBeInTheDocument();
      
      // Check API was called
      expect(runIntegration).toHaveBeenCalledWith('123', expect.anything());
      
      // Wait for running state to end
      await waitFor(() => {
        expect(screen.getByText('Run Now')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
  
  describe('Conditional Rendering Tests', () => {
    test('Configuration tab is disabled when not using Azure Blob', async () => {
      // Mock integration without Azure Blob
      const nonAzureIntegration = {
        ...mockIntegration,
        source: 'Database',
        destination: 'API'
      };
      getIntegrationById.mockResolvedValue(nonAzureIntegration);
      
      // Render the component
      renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Configuration tab should be disabled
      const configTab = screen.getByRole('tab', { name: /Configuration/i });
      expect(configTab).toHaveAttribute('aria-disabled', 'true');
    });
    
    test('shows limited UI for non-admin users', async () => {
      // Mock user as non-admin
      authService.isAdmin.mockResolvedValue(false);
      
      // Render the component
      const { user } = renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Enter edit mode
      const editButton = screen.getByTestId('EditIcon').closest('button');
      await user.click(editButton);
      
      // Go to Configuration tab
      await user.click(screen.getByRole('tab', { name: /Configuration/i }));
      
      // Super user should be No
      expect(screen.getByText('Super User: No')).toBeInTheDocument();
    });
  });
  
  describe('Error Handling Tests', () => {
    test('handles save error correctly', async () => {
      // Mock save failure
      updateIntegration.mockRejectedValue(new Error('Save failed'));
      
      // Render the component
      const { user } = renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Enter edit mode
      const editButton = screen.getByTestId('EditIcon').closest('button');
      await user.click(editButton);
      
      // Go to Configuration tab
      await user.click(screen.getByRole('tab', { name: /Configuration/i }));
      
      // Update config
      await user.click(screen.getByTestId('azure-config-change-btn'));
      
      // Save changes
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));
      
      // Error message should be displayed
      await waitFor(() => {
        expect(screen.getByText('Failed to save changes')).toBeInTheDocument();
      });
      
      // Should still be in edit mode
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });
    
    test('handles run integration error correctly', async () => {
      // Mock run failure
      runIntegration.mockRejectedValue(new Error('Run failed'));
      
      // Render the component
      const { user } = renderWithProviders(<IntegrationDetailView integrationId="123" />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Integration')).toBeInTheDocument();
      });
      
      // Find and click Run Now button
      await user.click(screen.getByRole('button', { name: 'Run Now' }));
      
      // Error message should be displayed
      await waitFor(() => {
        expect(screen.getByText('Failed to run integration')).toBeInTheDocument();
      });
      
      // Button should return to normal state
      expect(screen.getByText('Run Now')).toBeInTheDocument();
    });
  });
});