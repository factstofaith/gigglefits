import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AzureConfigurationPanel from '@components/admin/AzureConfigurationPanel';
import { NotificationContext } from '@contexts/NotificationContext';
import { AzureConfigContext } from '@contexts/AzureConfigContext';

// Mock the services
jest.mock('../../../services/azureConfigService', () => ({
  testAzureConnection: jest.fn().mockResolvedValue({ success: true, message: 'Connection successful' }),
  saveAzureConfiguration: jest.fn().mockResolvedValue({ success: true })
}));

// Create mock context values
const mockNotification = {
  showNotification: jest.fn(),
  showError: jest.fn()
};

const mockAzureConfig = {
  isConfigured: false,
  isConnected: false,
  saveConfig: jest.fn().mockResolvedValue({ success: true }),
  testConnection: jest.fn().mockResolvedValue({ success: true, message: 'Connection successful' }),
  config: null
};

// Create wrapper component with providers
function renderWithProviders(ui, contextOverrides = {}) {
  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  const azureConfigValue = { ...mockAzureConfig, ...contextOverrides };
  
  return render(
    <NotificationContext.Provider value={mockNotification}>
      <AzureConfigContext.Provider value={azureConfigValue}>
        {ui}
      </AzureConfigContext.Provider>
    </NotificationContext.Provider>
  );
}

describe('AzureConfigurationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders configuration form when not configured', () => {
    renderWithProviders(<AzureConfigurationPanel />);
    
    // Form elements should be present
    expect(screen.getByLabelText(/Tenant ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subscription ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Resource Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Authentication Method/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test Connection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Configuration/i })).toBeInTheDocument();
  });

  test('shows service principal fields when service principal auth is selected', async () => {
    renderWithProviders(<AzureConfigurationPanel />);
    
    // Select Service Principal authentication method
    const authMethodSelect = screen.getByLabelText(/Authentication Method/i);
    fireEvent.change(authMethodSelect, { target: { value: 'servicePrincipal' } });
    
    // Service Principal fields should appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Client ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Client Secret/i)).toBeInTheDocument();
    });
  });

  test('validates required fields before submission', async () => {
    renderWithProviders(<AzureConfigurationPanel />);
    
    // Try to save without filling required fields
    const saveButton = screen.getByRole('button', { name: /Save Configuration/i });
    fireEvent.click(saveButton);
    
    // Validation error messages should appear
    await waitFor(() => {
      expect(screen.getByText(/Tenant ID is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Subscription ID is required/i)).toBeInTheDocument();
    });
  });

  test('submits form successfully with valid data', async () => {
    renderWithProviders(<AzureConfigurationPanel />);
    
    // Fill form fields
    userEvent.type(screen.getByLabelText(/Tenant ID/i), 'test-tenant-id');
    userEvent.type(screen.getByLabelText(/Subscription ID/i), 'test-subscription-id');
    userEvent.type(screen.getByLabelText(/Resource Group/i), 'test-resource-group');
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save Configuration/i });
    fireEvent.click(saveButton);
    
    // Should call saveConfig from context
    await waitFor(() => {
      expect(mockAzureConfig.saveConfig).toHaveBeenCalled();
      expect(mockNotification.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Configuration saved successfully'),
        'success'
      );
    });
  });

  test('shows error when save fails', async () => {
    // Override saveConfig to fail
    const failedSave = { saveConfig: jest.fn().mockRejectedValue(new Error('Failed to save')) };
    renderWithProviders(<AzureConfigurationPanel />, failedSave);
    
    // Fill form fields
    userEvent.type(screen.getByLabelText(/Tenant ID/i), 'test-tenant-id');
    userEvent.type(screen.getByLabelText(/Subscription ID/i), 'test-subscription-id');
    userEvent.type(screen.getByLabelText(/Resource Group/i), 'test-resource-group');
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save Configuration/i });
    fireEvent.click(saveButton);
    
    // Should show error notification
    await waitFor(() => {
      expect(mockNotification.showError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save')
      );
    });
  });

  test('tests connection successfully', async () => {
    renderWithProviders(<AzureConfigurationPanel />);
    
    // Fill form fields
    userEvent.type(screen.getByLabelText(/Tenant ID/i), 'test-tenant-id');
    userEvent.type(screen.getByLabelText(/Subscription ID/i), 'test-subscription-id');
    userEvent.type(screen.getByLabelText(/Resource Group/i), 'test-resource-group');
    
    // Click test connection button
    const testButton = screen.getByRole('button', { name: /Test Connection/i });
    fireEvent.click(testButton);
    
    // Should call testConnection from context
    await waitFor(() => {
      expect(mockAzureConfig.testConnection).toHaveBeenCalled();
      expect(mockNotification.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Connection successful'),
        'success'
      );
    });
  });

  test('shows error when test connection fails', async () => {
    // Override testConnection to fail
    const failedTest = { testConnection: jest.fn().mockResolvedValue({ success: false, message: 'Connection failed' }) };
    renderWithProviders(<AzureConfigurationPanel />, failedTest);
    
    // Fill form fields
    userEvent.type(screen.getByLabelText(/Tenant ID/i), 'test-tenant-id');
    userEvent.type(screen.getByLabelText(/Subscription ID/i), 'test-subscription-id');
    userEvent.type(screen.getByLabelText(/Resource Group/i), 'test-resource-group');
    
    // Click test connection button
    const testButton = screen.getByRole('button', { name: /Test Connection/i });
    fireEvent.click(testButton);
    
    // Should show error notification
    await waitFor(() => {
      expect(mockNotification.showError).toHaveBeenCalledWith(
        expect.stringContaining('Connection failed')
      );
    });
  });

  test('shows config view when azure is already configured', () => {
    const configuredContext = {
      isConfigured: true,
      isConnected: true,
      config: {
        tenant_id: 'configured-tenant-id',
        subscription_id: 'configured-subscription-id',
        resource_group: 'configured-resource-group',
        auth_method: 'servicePrincipal'
      }
    };
    
    renderWithProviders(<AzureConfigurationPanel />, configuredContext);
    
    // Should show configuration details
    expect(screen.getByText(/Current Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/configured-tenant-id/i)).toBeInTheDocument();
    expect(screen.getByText(/configured-subscription-id/i)).toBeInTheDocument();
    expect(screen.getByText(/configured-resource-group/i)).toBeInTheDocument();
    
    // Should have edit button
    expect(screen.getByRole('button', { name: /Edit Configuration/i })).toBeInTheDocument();
  });

  test('switches to edit mode when edit button is clicked', async () => {
    const configuredContext = {
      isConfigured: true,
      isConnected: true,
      config: {
        tenant_id: 'configured-tenant-id',
        subscription_id: 'configured-subscription-id',
        resource_group: 'configured-resource-group',
        auth_method: 'servicePrincipal'
      }
    };
    
    renderWithProviders(<AzureConfigurationPanel />, configuredContext);
    
    // Click edit button
    const editButton = screen.getByRole('button', { name: /Edit Configuration/i });
    fireEvent.click(editButton);
    
    // Form should appear with pre-filled values
    await waitFor(() => {
      expect(screen.getByLabelText(/Tenant ID/i)).toHaveValue('configured-tenant-id');
      expect(screen.getByLabelText(/Subscription ID/i)).toHaveValue('configured-subscription-id');
      expect(screen.getByLabelText(/Resource Group/i)).toHaveValue('configured-resource-group');
    });
  });
});