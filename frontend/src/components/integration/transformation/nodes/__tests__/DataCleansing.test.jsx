import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataCleansing from '../DataCleansing';

// Mock transformation function from the useDataTransformation hook
jest.mock('../../../../../accelerators/hooks', () => ({
  useDataTransformation: jest.fn((fn) => fn),
}));

describe('DataCleansing Component', () => {
  const initialConfig = {
    inputField: 'sourceField',
    outputField: 'destinationField',
    cleansingOperations: [
      {
        type: 'trim',
        id: '1'
      }
    ],
    applyToNullValues: false,
    treatEmptyAsNull: true,
    nullReplacement: '',
    validateEmail: false,
    validateUrl: false,
    validatePhone: false,
    validatePostalCode: false,
    region: 'US'
  };
  
  const mockOnConfigChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with initial configuration', () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Check that the component title is displayed
    expect(screen.getByText('Data Cleansing')).toBeInTheDocument();
  });

  test('expands configuration panel on click', async () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Click to expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Check that the input field is now visible
    await waitFor(() => {
      expect(screen.getByLabelText('Input Field')).toBeInTheDocument();
    });
  });

  test('updates configuration when input field changes', async () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Wait for the input field to appear
    const inputField = await screen.findByLabelText('Input Field');
    
    // Change the input field value
    fireEvent.change(inputField, { target: { value: 'newSourceField' } });

    // Check that onConfigChange was called with updated configuration
    expect(mockOnConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        inputField: 'newSourceField',
      })
    );
  });

  test('adds a new cleansing operation when add button is clicked', async () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Find and click the Add Operation button
    const addButton = await screen.findByText('Add Operation');
    fireEvent.click(addButton);

    // Check that onConfigChange was called with a new operation added
    expect(mockOnConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        cleansingOperations: expect.arrayContaining([
          expect.objectContaining({ type: 'trim', id: '1' }),
          expect.objectContaining({ type: 'trim' })
        ])
      })
    );
  });

  test('removes an operation when delete button is clicked', async () => {
    // Use a config with multiple operations for this test
    const configWithMultipleOps = {
      ...initialConfig,
      cleansingOperations: [
        { type: 'trim', id: '1' },
        { type: 'removeHtml', id: '2' }
      ]
    };

    render(
      <DataCleansing
        initialConfig={configWithMultipleOps}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Wait for the delete buttons to appear
    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText('Remove operation');
      expect(deleteButtons.length).toBe(2);
      
      // Click the second delete button
      fireEvent.click(deleteButtons[1]);
    });

    // Check that onConfigChange was called with the operation removed
    expect(mockOnConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        cleansingOperations: [
          expect.objectContaining({ type: 'trim', id: '1' })
        ]
      })
    );
  });

  test('shows additional fields for replace operation', async () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Wait for the operation type select to appear
    const operationTypeSelect = await screen.findByLabelText('Operation Type');
    
    // Open the select dropdown
    fireEvent.mouseDown(operationTypeSelect);
    
    // Select 'Replace Text' option
    const replaceOption = screen.getByText('Replace Text');
    fireEvent.click(replaceOption);

    // Check that pattern field appears
    await waitFor(() => {
      expect(screen.getByLabelText('Search Pattern')).toBeInTheDocument();
    });
  });

  test('updates validation options when switches are toggled', async () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Find and click the Validate Email switch
    const validateEmailSwitch = await screen.findByLabelText('Validate Email');
    fireEvent.click(validateEmailSwitch);

    // Check that onConfigChange was called with validateEmail set to true
    expect(mockOnConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        validateEmail: true
      })
    );
  });

  test('shows region selection when phone validation is enabled', async () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Find and click the Validate Phone switch
    const validatePhoneSwitch = await screen.findByLabelText('Validate Phone');
    fireEvent.click(validatePhoneSwitch);

    // Check that region select appears
    await waitFor(() => {
      expect(screen.getByLabelText('Region')).toBeInTheDocument();
    });
  });

  test('displays cleansing preview with sample data', async () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Check that preview section is visible
    await waitFor(() => {
      expect(screen.getByText('Cleansing Preview')).toBeInTheDocument();
    });

    // Find sample input field
    const sampleInput = await screen.findByLabelText('Sample Input');
    
    // Enter test data
    fireEvent.change(sampleInput, { target: { value: '  Test with  extra  spaces  ' } });

    // Check that preview shows cleaned result
    await waitFor(() => {
      const previewOutput = screen.getByText(/Output:/);
      expect(previewOutput).toHaveTextContent('Test with extra spaces');
    });
  });

  test('disables all inputs when readOnly prop is true', async () => {
    render(
      <DataCleansing
        initialConfig={initialConfig}
        onConfigChange={mockOnConfigChange}
        readOnly={true}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Check that input fields are disabled
    await waitFor(() => {
      const inputField = screen.getByLabelText('Input Field');
      expect(inputField).toHaveAttribute('readonly');
    });

    // Check that Add Operation button is disabled
    const addButton = screen.getByText('Add Operation');
    expect(addButton).toBeDisabled();
  });

  test('validates required fields', async () => {
    // Start with empty input field to trigger validation error
    const invalidConfig = { ...initialConfig, inputField: '' };
    
    render(
      <DataCleansing
        initialConfig={invalidConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Expand the panel
    const headerButton = screen.getByText('Data Cleansing').closest('[role="button"]');
    fireEvent.click(headerButton);

    // Find input field and make it dirty
    const inputField = await screen.findByLabelText('Input Field');
    fireEvent.focus(inputField);
    fireEvent.blur(inputField);

    // Check that validation error is shown
    await waitFor(() => {
      expect(screen.getByText('Input field is required')).toBeInTheDocument();
    });
  });
});