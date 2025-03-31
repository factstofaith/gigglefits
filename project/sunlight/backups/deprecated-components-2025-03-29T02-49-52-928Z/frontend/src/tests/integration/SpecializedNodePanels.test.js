/**
 * SpecializedNodePanels.test.js
 * 
 * Integration tests for the specialized node property panels in the flow canvas.
 * Tests DatasetNodePropertiesPanel and ApplicationNodePropertiesPanel interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@design-system/foundations/theme';

// Components to test
import DatasetNodePropertiesPanel from '@components/integration/DatasetNodePropertiesPanel';
import ApplicationNodePropertiesPanel from '@components/integration/ApplicationNodePropertiesPanel';

// Mocks
import * as integrationService from '@services/integrationService';

// Mock theme for design system
const mockTheme = {
  colors: {
    primary: { main: '#1976d2', lighter: '#e3f2fd' },
    secondary: { main: '#dc004e' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
    background: { paper: '#ffffff', default: '#f5f5f5', hover: '#f9f9f9', light: '#f5f5f5' },
    text: { primary: '#000000', secondary: '#666666' },
    divider: '#e0e0e0',
  },
  shadows: ['none', '0px 2px 1px -1px rgba(0,0,0,0.2)'],
  shape: { borderRadius: 4 },
};

// Mock services
jest.mock('../../services/integrationService', () => ({
  getDatasets: jest.fn(),
  associateDataset: jest.fn(),
}));

// Render wrapper with providers
const renderWithTheme = (ui) => {
  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';


  return render(
    <ThemeProvider theme={mockTheme}>
      {ui}
    </ThemeProvider>
  );
};

// Test data
const mockDatasets = [
  {
    id: 'dataset-1',
    name: 'Employee Data',
    description: 'Employee information including personal details and job information',
    type: 'Internal',
    fields: [
      { name: 'employee_id', type: 'string', required: true },
      { name: 'first_name', type: 'string', required: true },
      { name: 'last_name', type: 'string', required: true },
      { name: 'email', type: 'string', required: false },
      { name: 'hire_date', type: 'date', required: true },
      { name: 'salary', type: 'number', required: false },
    ],
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-06-20T15:30:00Z',
  },
  {
    id: 'dataset-2',
    name: 'Department Data',
    description: 'Department structure and hierarchy information',
    type: 'Internal',
    fields: [
      { name: 'department_id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'location', type: 'string', required: false },
      { name: 'manager_id', type: 'string', required: false },
    ],
    createdAt: '2023-02-10T09:15:00Z',
    updatedAt: '2023-05-18T11:20:00Z',
  },
];

const mockDatasetNode = {
  id: 'dataset-node-1',
  type: 'datasetNode',
  data: {
    label: 'Employee Dataset',
    datasetId: 'dataset-1',
    datasetType: 'Internal',
    fields: mockDatasets[0].fields,
    description: 'Dataset for employee information',
  }
};

const mockApplicationNode = {
  id: 'app-node-1',
  type: 'applicationNode',
  data: {
    label: 'HR System',
    name: 'HR System',
    description: 'Human Resources Management System',
    applicationType: 'api',
    authType: 'oauth2',
    authConfig: {
      clientId: 'client-123',
      clientSecret: '******',
      tokenUrl: 'https://hrsystem.example.com/oauth/token',
      authUrl: 'https://hrsystem.example.com/oauth/authorize',
      scope: 'read write',
    },
    connectionConfig: {
      name: 'HR API Connection',
      baseUrl: 'https://hrsystem.example.com/api/v1',
      apiType: 'rest',
      headers: 'Content-Type: application/json\nAccept: application/json',
      useConnectionPool: true,
    },
    associatedDatasets: [mockDatasets[0]],
    connectionStatus: 'connected',
  }
};

describe('Specialized Node Property Panels', () => {
  describe('DatasetNodePropertiesPanel', () => {
    beforeEach(() => {
      // Reset and mock service responses
      jest.clearAllMocks();
      integrationService.getDatasets.mockResolvedValue(mockDatasets);
    });

    test('renders dataset selection and details correctly', async () => {
      const handleUpdateNode = jest.fn();
      
      renderWithTheme(
        <DatasetNodePropertiesPanel 
          nodeData={mockDatasetNode.data}
          onUpdateNode={handleUpdateNode}
          integrationId="integration-123"
        />
      );
      
      // Should show loading initially
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Wait for datasets to load
      await waitFor(() => {
        expect(screen.getByText('Dataset Configuration')).toBeInTheDocument();
        expect(screen.getByText('2 Datasets')).toBeInTheDocument();
      });
      
      // Selected dataset should be highlighted
      expect(screen.getByText('Employee Data')).toBeInTheDocument();
      
      // Dataset schema should be shown
      expect(screen.getByText('Dataset Schema')).toBeInTheDocument();
      
      // Field list should include the fields from the dataset
      expect(screen.getByText('employee_id')).toBeInTheDocument();
      expect(screen.getByText('first_name')).toBeInTheDocument();
      expect(screen.getByText('string')).toBeInTheDocument();
    });
    
    test('allows selecting a different dataset', async () => {
      const handleUpdateNode = jest.fn();
      
      renderWithTheme(
        <DatasetNodePropertiesPanel 
          nodeData={mockDatasetNode.data}
          onUpdateNode={handleUpdateNode}
          integrationId="integration-123"
        />
      );
      
      // Wait for datasets to load
      await waitFor(() => {
        expect(screen.getByText('Employee Data')).toBeInTheDocument();
      });
      
      // Select the Department dataset
      fireEvent.click(screen.getByText('Department Data'));
      
      // Should update the node data
      expect(handleUpdateNode).toHaveBeenCalledWith({
        ...mockDatasetNode.data,
        datasetId: 'dataset-2',
        label: 'Department Data'
      });
    });
    
    test('handles dataset search filtering', async () => {
      const handleUpdateNode = jest.fn();
      
      renderWithTheme(
        <DatasetNodePropertiesPanel 
          nodeData={mockDatasetNode.data}
          onUpdateNode={handleUpdateNode}
          integrationId="integration-123"
        />
      );
      
      // Wait for datasets to load
      await waitFor(() => {
        expect(screen.getAllByText(/Data/i).length).toBeGreaterThan(0);
      });
      
      // Search for "Department"
      fireEvent.change(screen.getByPlaceholderText('Search datasets...'), {
        target: { value: 'Department' }
      });
      
      // Should only show Department Data
      expect(screen.getByText('Department Data')).toBeInTheDocument();
      expect(screen.queryByText('Employee Data')).not.toBeInTheDocument();
      
      // Clear search
      fireEvent.change(screen.getByPlaceholderText('Search datasets...'), {
        target: { value: '' }
      });
      
      // Should show all datasets again
      expect(screen.getByText('Department Data')).toBeInTheDocument();
      expect(screen.getByText('Employee Data')).toBeInTheDocument();
    });
    
    test('shows error state when service call fails', async () => {
      // Mock service to throw error
      integrationService.getDatasets.mockRejectedValue(new Error('Network error'));
      
      renderWithTheme(
        <DatasetNodePropertiesPanel 
          nodeData={mockDatasetNode.data}
          onUpdateNode={jest.fn()}
          integrationId="integration-123"
        />
      );
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to load datasets/i)).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      // Clicking retry should call the service again
      integrationService.getDatasets.mockResolvedValue(mockDatasets);
      fireEvent.click(screen.getByText('Retry'));
      
      // Should load data after retry
      await waitFor(() => {
        expect(screen.getByText('Employee Data')).toBeInTheDocument();
      });
    });
  });

  describe('ApplicationNodePropertiesPanel', () => {
    test('renders application configuration tabs correctly', () => {
      const handleUpdateNode = jest.fn();
      
      renderWithTheme(
        <ApplicationNodePropertiesPanel 
          nodeData={mockApplicationNode.data}
          onUpdateNode={handleUpdateNode}
          availableDatasets={mockDatasets}
        />
      );
      
      // Header should show the application name
      expect(screen.getByDisplayValue('HR System')).toBeInTheDocument();
      
      // Should show application type selection
      expect(screen.getByText('API Application')).toBeInTheDocument();
      
      // Tabs should be visible
      expect(screen.getByText('Connection')).toBeInTheDocument();
      expect(screen.getByText('Authentication')).toBeInTheDocument();
      expect(screen.getByText('Datasets')).toBeInTheDocument();
      
      // Connection status should be shown
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Successfully connected to the application')).toBeInTheDocument();
      
      // Connection details should be shown
      expect(screen.getByDisplayValue('HR API Connection')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://hrsystem.example.com/api/v1')).toBeInTheDocument();
    });
    
    test('allows switching between configuration tabs', () => {
      renderWithTheme(
        <ApplicationNodePropertiesPanel 
          nodeData={mockApplicationNode.data}
          onUpdateNode={jest.fn()}
          availableDatasets={mockDatasets}
        />
      );
      
      // Default to Connection tab
      expect(screen.getByDisplayValue('HR API Connection')).toBeInTheDocument();
      
      // Switch to Authentication tab
      fireEvent.click(screen.getByText('Authentication'));
      
      // Should show authentication config
      expect(screen.getByDisplayValue('client-123')).toBeInTheDocument();
      expect(screen.getByText('OAuth 2.0')).toBeInTheDocument();
      
      // Switch to Datasets tab
      fireEvent.click(screen.getByText('Datasets'));
      
      // Should show associated datasets
      expect(screen.getByText('Associated Datasets')).toBeInTheDocument();
      expect(screen.getByText('Employee Data')).toBeInTheDocument();
    });
    
    test('allows editing connection configuration', () => {
      const handleUpdateNode = jest.fn();
      
      renderWithTheme(
        <ApplicationNodePropertiesPanel 
          nodeData={mockApplicationNode.data}
          onUpdateNode={handleUpdateNode}
          availableDatasets={mockDatasets}
        />
      );
      
      // Change connection name
      fireEvent.change(screen.getByDisplayValue('HR API Connection'), {
        target: { value: 'Updated HR API Connection' }
      });
      
      // Should update connection config
      expect(handleUpdateNode).toHaveBeenCalledWith(expect.objectContaining({
        connectionConfig: expect.objectContaining({
          name: 'Updated HR API Connection',
        })
      }));
    });
    
    test('allows testing connection', () => {
      renderWithTheme(
        <ApplicationNodePropertiesPanel 
          nodeData={mockApplicationNode.data}
          onUpdateNode={jest.fn()}
          availableDatasets={mockDatasets}
        />
      );
      
      // Click Test Connection button
      fireEvent.click(screen.getByText('Test Connection'));
      
      // Should show testing state
      expect(screen.getByText('Testing...')).toBeInTheDocument();
    });
    
    test('allows changing authentication type', () => {
      const handleUpdateNode = jest.fn();
      
      renderWithTheme(
        <ApplicationNodePropertiesPanel 
          nodeData={mockApplicationNode.data}
          onUpdateNode={handleUpdateNode}
          availableDatasets={mockDatasets}
        />
      );
      
      // Switch to Authentication tab
      fireEvent.click(screen.getByText('Authentication'));
      
      // Change authentication type to API Key
      fireEvent.mouseDown(screen.getByText('OAuth 2.0'));
      fireEvent.click(screen.getByText('API Key'));
      
      // Should update auth type and reset auth config
      expect(handleUpdateNode).toHaveBeenCalledWith(expect.objectContaining({
        authType: 'api_key',
        authConfig: {}
      }));
    });
    
    test('allows managing associated datasets', () => {
      const handleUpdateNode = jest.fn();
      
      renderWithTheme(
        <ApplicationNodePropertiesPanel 
          nodeData={mockApplicationNode.data}
          onUpdateNode={handleUpdateNode}
          availableDatasets={mockDatasets}
        />
      );
      
      // Switch to Datasets tab
      fireEvent.click(screen.getByText('Datasets'));
      
      // Should show associated datasets
      expect(screen.getByText('Employee Data')).toBeInTheDocument();
      
      // Remove association
      fireEvent.click(screen.getByText('Remove'));
      
      // Should update associated datasets
      expect(handleUpdateNode).toHaveBeenCalledWith(expect.objectContaining({
        associatedDatasets: []
      }));
      
      // Reset for next test
      handleUpdateNode.mockReset();
      
      // Add new association (Department Data should be available)
      fireEvent.mouseDown(screen.getByPlaceholderText('Select dataset to associate'));
      fireEvent.click(screen.getByText('Department Data'));
      fireEvent.click(screen.getByText('Associate'));
      
      // Should update associated datasets
      expect(handleUpdateNode).toHaveBeenCalledWith(expect.objectContaining({
        associatedDatasets: expect.arrayContaining([
          expect.objectContaining({ id: 'dataset-2' })
        ])
      }));
    });
    
    test('handles read-only mode correctly', () => {
      renderWithTheme(
        <ApplicationNodePropertiesPanel 
          nodeData={mockApplicationNode.data}
          onUpdateNode={jest.fn()}
          availableDatasets={mockDatasets}
          readOnly={true}
        />
      );
      
      // Check if inputs are disabled
      expect(screen.getByDisplayValue('HR System')).toBeDisabled();
      expect(screen.getByDisplayValue('HR API Connection')).toBeDisabled();
      
      // Switch to Datasets tab
      fireEvent.click(screen.getByText('Datasets'));
      
      // Remove button should not be available
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });
  });
});