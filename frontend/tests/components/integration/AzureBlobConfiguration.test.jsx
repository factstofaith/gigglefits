import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AzureBlobConfiguration from '../../../src/components/integration/AzureBlobConfiguration';

// Mock child components
jest.mock('../../../src/components/integration/azure/AzureBlobContainerBrowser', () => {
  return function MockAzureBlobContainerBrowser(props) {
    return (
      <div data-testid="mock-azure-browser">
        <button 
          data-testid="select-container-btn" 
          onClick={() => props.onSelectContainer('test-container')}
        >
          Select Container
        </button>
        <button 
          data-testid="select-blob-btn" 
          onClick={() => props.onSelectBlob({
            containerName: 'test-container',
            blobName: 'test-folder/test-file.csv'
          })}
        >
          Select Blob
        </button>
      </div>
    );
  };
});

jest.mock('../../../src/components/integration/azure/AzureCredentialManager', () => {
  return function MockAzureCredentialManager(props) {
    return (
      <div data-testid="mock-credential-manager">
        <button 
          data-testid="load-credentials-btn" 
          onClick={() => props.onCredentialsLoaded({
            connectionString: 'DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=testkey;EndpointSuffix=core.windows.net'
          })}
        >
          Load Credentials
        </button>
      </div>
    );
  };
});

describe('AzureBlobConfiguration Component', () => {
  const defaultProps = {
    config: {},
    onChange: jest.fn(),
    errors: {},
    readOnly: false,
    isSuperUser: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders auth method selection with connection string selected by default', () => {
    render(<AzureBlobConfiguration {...defaultProps} />);
    
    // Auth method selection should be visible
    expect(screen.getByText('Authentication Method')).toBeInTheDocument();
    
    // Connection string should be selected by default
    const connectionStringRadio = screen.getByLabelText('Connection String');
    expect(connectionStringRadio).toBeChecked();
    
    // Connection string field should be visible
    expect(screen.getByLabelText('Connection String')).toBeInTheDocument();
  });

  test('changes auth method when a different option is selected', async () => {
    render(<AzureBlobConfiguration {...defaultProps} />);
    
    // Click on Account Name & Key option
    const accountKeyRadio = screen.getByLabelText('Account Name & Key');
    fireEvent.click(accountKeyRadio);
    
    // Account name and key fields should be visible
    expect(screen.getByLabelText('Storage Account Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Key')).toBeInTheDocument();
    
    // Connection string field should not be visible
    expect(screen.queryByLabelText('Connection String')).not.toBeInTheDocument();
    
    // Verify onChange was called with the updated config
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        authMethod: 'accountKey',
        connectionString: '',
        accountName: '',
        accountKey: ''
      })
    );
  });

  test('toggles secret visibility', async () => {
    render(<AzureBlobConfiguration {...defaultProps} />);
    
    // Initially, connection string should be password type
    const connectionStringField = screen.getByLabelText('Connection String');
    expect(connectionStringField).toHaveAttribute('type', 'password');
    
    // Find and click visibility toggle button
    const visibilityButton = screen.getAllByRole('button')[0]; // First button is visibility toggle
    fireEvent.click(visibilityButton);
    
    // Field should now be text type
    expect(connectionStringField).toHaveAttribute('type', 'text');
    
    // Click again to hide
    fireEvent.click(visibilityButton);
    
    // Field should be password type again
    expect(connectionStringField).toHaveAttribute('type', 'password');
  });

  test('loads credentials from credential manager', async () => {
    render(<AzureBlobConfiguration {...defaultProps} />);
    
    // Find and click set up credentials button
    const credentialsButton = screen.getByText('Set Up Credentials');
    fireEvent.click(credentialsButton);
    
    // Credential manager should be visible
    const credentialManager = screen.getByTestId('mock-credential-manager');
    expect(credentialManager).toBeInTheDocument();
    
    // Load credentials
    const loadButton = screen.getByTestId('load-credentials-btn');
    fireEvent.click(loadButton);
    
    // Verify onChange was called with the loaded credentials
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        authMethod: 'connectionString',
        connectionString: 'DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=testkey;EndpointSuffix=core.windows.net'
      })
    );
    
    // Button text should change
    expect(screen.getByText('Manage Credentials')).toBeInTheDocument();
  });

  test('opens browser dialog and selects container', async () => {
    render(<AzureBlobConfiguration {...defaultProps} />);
    
    // Find and click browse storage button
    const browseButton = screen.getByText('Browse Storage');
    fireEvent.click(browseButton);
    
    // Dialog should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('mock-azure-browser')).toBeInTheDocument();
    
    // Select a container
    const selectContainerButton = screen.getByTestId('select-container-btn');
    fireEvent.click(selectContainerButton);
    
    // Verify onChange was called with the selected container
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        containerName: 'test-container'
      })
    );
    
    // Close dialog
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Dialog should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('selects blob and updates path and file pattern', async () => {
    render(<AzureBlobConfiguration {...defaultProps} />);
    
    // Open browser dialog
    const browseButton = screen.getByText('Browse Storage');
    fireEvent.click(browseButton);
    
    // Select a blob
    const selectBlobButton = screen.getByTestId('select-blob-btn');
    fireEvent.click(selectBlobButton);
    
    // Verify onChange was called with the selected blob info
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        containerName: 'test-container',
        path: 'test-folder/',
        filePattern: '*.csv'
      })
    );
  });

  test('disables test connection button until required fields are filled', async () => {
    // Render with empty config
    render(<AzureBlobConfiguration {...defaultProps} />);
    
    // Test connection button should be disabled initially
    const testButton = screen.getByText('Test Connection');
    expect(testButton).toBeDisabled();
    
    // Fill connection string
    const connectionStringField = screen.getByLabelText('Connection String');
    fireEvent.change(connectionStringField, { target: { value: 'DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=testkey;EndpointSuffix=core.windows.net' } });
    
    // Test connection button should be enabled
    expect(testButton).not.toBeDisabled();
  });

  test('shows readonly version with disabled controls', async () => {
    render(<AzureBlobConfiguration {...defaultProps} readOnly={true} />);
    
    // All input fields should be disabled
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
    
    // Radio buttons should be disabled
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toBeDisabled();
    });
    
    // Test connection and set up credentials buttons should not be visible
    expect(screen.queryByText('Test Connection')).not.toBeInTheDocument();
    expect(screen.queryByText('Set Up Credentials')).not.toBeInTheDocument();
  });

  test('handles form field changes', async () => {
    render(<AzureBlobConfiguration {...defaultProps} />);
    
    // Change container name
    const containerNameField = screen.getByLabelText('Container Name');
    fireEvent.change(containerNameField, { target: { value: 'my-container' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        containerName: 'my-container'
      })
    );
    
    // Change file pattern
    const filePatternField = screen.getByLabelText('File Pattern');
    fireEvent.change(filePatternField, { target: { value: '*.json' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filePattern: '*.json'
      })
    );
    
    // Toggle create container if not exists
    const createContainerCheckbox = screen.getByRole('checkbox');
    fireEvent.click(createContainerCheckbox);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        createContainerIfNotExists: true
      })
    );
  });

  test('displays validation errors', async () => {
    const props = {
      ...defaultProps,
      errors: {
        connectionString: 'Connection string is required',
        containerName: 'Container name is required'
      }
    };
    
    render(<AzureBlobConfiguration {...props} />);
    
    // Error messages should be displayed
    expect(screen.getByText('Connection string is required')).toBeInTheDocument();
    expect(screen.getByText('Container name is required')).toBeInTheDocument();
  });

  // More tests would be added to cover:
  // - Test connection functionality with successful and failed results
  // - Pattern preview functionality
  // - Tab switching in browser dialog
  // - Different authentication methods (SAS token, managed identity)
  // - Non-superuser view (limited auth options)
});