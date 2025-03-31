import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AzureBlobConfiguration from '../../components/integration/AzureBlobConfiguration';

describe('AzureBlobConfiguration Migration', () => {
  const defaultProps = {
    config: {
      authMethod: 'connectionString',
      connectionString: '',
      accountName: '',
      accountKey: '',
      sasToken: '',
      containerName: 'test-container',
      filePattern: '*.csv',
      path: '',
    },
    onChange: jest.fn(),
    errors: {},
    isSuperUser: true,
  };

  it('renders with legacy design system components', () => {
    render(<AzureBlobConfiguration {...defaultProps} />);

    // Check if the main component is rendered
    expect(screen.getByText('Azure Blob Storage Configuration')).toBeInTheDocument();

    // Check if the legacy text fields are rendered
    const connectionStringField = screen.getByLabelText('Connection String');
    expect(connectionStringField.closest('.InputFieldLegacy-root')).toBeInTheDocument();

    // Switch auth method to test other fields
    const accountKeyRadio = screen.getByLabelText('Account Name & Key');
    fireEvent.click(accountKeyRadio);

    // Verify account name field uses InputFieldLegacy
    const accountNameField = screen.getByLabelText('Storage Account Name');
    expect(accountNameField.closest('.InputFieldLegacy-root')).toBeInTheDocument();
  });

  it('renders container configuration with legacy components', () => {
    render(<AzureBlobConfiguration {...defaultProps} />);

    // Verify container name field uses InputFieldLegacy
    const containerNameField = screen.getByLabelText('Container Name');
    expect(containerNameField.closest('.InputFieldLegacy-root')).toBeInTheDocument();

    // Verify file pattern field uses InputFieldLegacy
    const filePatternField = screen.getByLabelText('File Pattern');
    expect(filePatternField.closest('.InputFieldLegacy-root')).toBeInTheDocument();

    // Verify path field uses InputFieldLegacy
    const pathField = screen.getByLabelText('Path (Optional)');
    expect(pathField.closest('.InputFieldLegacy-root')).toBeInTheDocument();
  });

  it('handles input changes with legacy components', () => {
    render(<AzureBlobConfiguration {...defaultProps} />);

    // Test changing container name
    const containerNameField = screen.getByLabelText('Container Name');
    fireEvent.change(containerNameField, { target: { value: 'new-container' } });

    // Verify onChange was called with updated config
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        containerName: 'new-container',
      })
    );
  });
});
