import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationNodePropertiesPanel from '@components/integration/ApplicationNodePropertiesPanel';

// Mock the theme hook
jest.mock('../../../design-system/adapter', () => ({
  ...jest.requireActual('../../../design-system/adapter'),
  useTheme: () => ({
    theme: {
      colors: {
        success: { main: '#4caf50' },
        error: { main: '#f44336' },
        text: { secondary: '#757575' },
        divider: '#e0e0e0',
        background: { light: '#f5f5f5' },
        primary: { main: '#1976d2', lighter: '#bbdefb' }
      },
      palette: {
        success: { main: '#4caf50' },
        error: { main: '#f44336' },
        warning: { main: '#ff9800' },
        divider: '#e0e0e0',
        text: { primary: '#000000', secondary: '#757575' },
        primary: { main: '#1976d2', lighter: '#bbdefb' },
        background: { paper: '#ffffff', light: '#f5f5f5' }
      }
    }
  })
}));

// Sample test data
const mockNodeData = {
  id: 'app-node-1',
  type: 'application',
  name: 'Test API',
  label: 'Test API',
  description: 'Test API description',
  applicationType: 'api',
  authType: 'basic',
  authConfig: {
    username: 'test-user',
    password: 'test-password'
  },
  connectionConfig: {
    name: 'Test Connection',
    baseUrl: 'https://api.example.com',
    apiType: 'rest',
    headers: 'Content-Type: application/json'
  },
  associatedDatasets: [
    { id: 'dataset-1', name: 'Test Dataset', fields: [{}, {}, {}] }
  ],
  connectionStatus: 'connected'
};

const mockAvailableDatasets = [
  { id: 'dataset-1', name: 'Test Dataset', fields: [{}, {}, {}] },
  { id: 'dataset-2', name: 'Another Dataset', fields: [{}, {}] },
  { id: 'dataset-3', name: 'Third Dataset', fields: [{}, {}, {}, {}] }
];

describe('ApplicationNodePropertiesPanel', () => {
  // Basic rendering test
  it('renders correctly with node data', () => {
    const onUpdateNode = jest.fn();
    
    render(
      <ApplicationNodePropertiesPanel
        nodeData={mockNodeData}
        onUpdateNode={onUpdateNode}
        availableDatasets={mockAvailableDatasets}
      />
    );
    
    // Check if basic elements are rendered
    expect(screen.getByText('Test API')).toBeInTheDocument();
    expect(screen.getByText('Test API description')).toBeInTheDocument();
    expect(screen.getByText('Connection')).toBeInTheDocument();
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Datasets')).toBeInTheDocument();
  });
  
  // Test connection status display
  it('displays connection status correctly', () => {
    const onUpdateNode = jest.fn();
    
    render(
      <ApplicationNodePropertiesPanel
        nodeData={mockNodeData}
        onUpdateNode={onUpdateNode}
        availableDatasets={mockAvailableDatasets}
      />
    );
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Successfully connected to the application')).toBeInTheDocument();
  });
  
  // Test tab switching
  it('switches tabs when clicked', () => {
    const onUpdateNode = jest.fn();
    
    render(
      <ApplicationNodePropertiesPanel
        nodeData={mockNodeData}
        onUpdateNode={onUpdateNode}
        availableDatasets={mockAvailableDatasets}
      />
    );
    
    // Initially we should be on Connection tab
    expect(screen.getByText('Test Connection')).toBeInTheDocument();
    
    // Click on Authentication tab
    fireEvent.click(screen.getByText('Authentication'));
    
    // Now we should see authentication content
    expect(screen.getByText('Authentication Method')).toBeInTheDocument();
    expect(screen.getByText('Basic Auth')).toBeInTheDocument();
    
    // Click on Datasets tab
    fireEvent.click(screen.getByText('Datasets'));
    
    // Now we should see datasets content
    expect(screen.getByText('Associated Datasets')).toBeInTheDocument();
    expect(screen.getByText('Test Dataset')).toBeInTheDocument();
  });
  
  // Test form field updates
  it('updates node data when form fields change', () => {
    const onUpdateNode = jest.fn();
    
    render(
      <ApplicationNodePropertiesPanel
        nodeData={mockNodeData}
        onUpdateNode={onUpdateNode}
        availableDatasets={mockAvailableDatasets}
      />
    );
    
    // Change application name
    const nameInput = screen.getByDisplayValue('Test API');
    fireEvent.change(nameInput, { target: { value: 'Updated API Name' } });
    
    // Verify onUpdateNode was called with updated data
    expect(onUpdateNode).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Updated API Name',
      label: 'Updated API Name' // Label should be updated to match name
    }));
  });
  
  // Test connection testing functionality
  it('simulates connection testing', async () => {
    const onUpdateNode = jest.fn();
    
    render(
      <ApplicationNodePropertiesPanel
        nodeData={{...mockNodeData, connectionStatus: 'disconnected'}}
        onUpdateNode={onUpdateNode}
        availableDatasets={mockAvailableDatasets}
      />
    );
    
    // Click test connection button
    const testButton = screen.getByText('Test Connection');
    fireEvent.click(testButton);
    
    // Button should show loading state
    expect(screen.getByText('Testing...')).toBeInTheDocument();
    
    // Wait for the test to complete
    await waitFor(() => {
      expect(screen.queryByText('Testing...')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // onUpdateNode should have been called with a connectionStatus
    expect(onUpdateNode).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionStatus: expect.stringMatching(/connected|error/)
      })
    );
  });
  
  // Test admin-only features
  it('shows admin tab when isAdmin is true', () => {
    const onUpdateNode = jest.fn();
    
    render(
      <ApplicationNodePropertiesPanel
        nodeData={mockNodeData}
        onUpdateNode={onUpdateNode}
        availableDatasets={mockAvailableDatasets}
        isAdmin={true}
      />
    );
    
    // Advanced tab should be visible for admin
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    
    // Click on Advanced tab
    fireEvent.click(screen.getByText('Advanced'));
    
    // Admin settings should be visible
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    expect(screen.getByText('Enable Caching')).toBeInTheDocument();
  });
  
  it('does not show admin tab when isAdmin is false', () => {
    const onUpdateNode = jest.fn();
    
    render(
      <ApplicationNodePropertiesPanel
        nodeData={mockNodeData}
        onUpdateNode={onUpdateNode}
        availableDatasets={mockAvailableDatasets}
        isAdmin={false}
      />
    );
    
    // Advanced tab should not be visible for non-admin
    expect(screen.queryByText('Advanced')).not.toBeInTheDocument();
  });
  
  // Test read-only mode
  it('disables inputs in read-only mode', () => {
    const onUpdateNode = jest.fn();
    
    render(
      <ApplicationNodePropertiesPanel
        nodeData={mockNodeData}
        onUpdateNode={onUpdateNode}
        availableDatasets={mockAvailableDatasets}
        readOnly={true}
      />
    );
    
    // Inputs should be disabled
    const nameInput = screen.getByDisplayValue('Test API');
    expect(nameInput).toBeDisabled();
    
    // Navigate to datasets tab
    fireEvent.click(screen.getByText('Datasets'));
    
    // Remove button should not be visible in read-only mode
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });
});