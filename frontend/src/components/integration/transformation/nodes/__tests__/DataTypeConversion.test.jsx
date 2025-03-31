import { describe, it, expect, beforeEach, afterEach } from 'jest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import DataTypeConversion from '../DataTypeConversion';

describe('DataTypeConversion - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'data-type-conversion'
    };
    render(<DataTypeConversion {...defaultProps} />);
  });

  it('displays the correct title and description when expanded', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'data-type-conversion'
    };
    render(<DataTypeConversion {...defaultProps} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /data type conversion/i });
    await userEvent.click(headerElement);
    
    // Check title and description are visible
    expect(screen.getByText('Data Type Conversion')).toBeInTheDocument();
    expect(screen.getByText('Converts data from one type to another')).toBeInTheDocument();
  });

  it('renders in disabled state when disabled prop is true', () => {
    const disabledProps = {
      id: 'test-node',
      testId: 'data-type-conversion',
      disabled: true
    };
    render(<DataTypeConversion {...disabledProps} />);
    
    expect(screen.getByTestId('data-type-conversion')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders in read-only state when readOnly prop is true', async () => {
    const readOnlyProps = {
      id: 'test-node',
      testId: 'data-type-conversion',
      readOnly: true
    };
    render(<DataTypeConversion {...readOnlyProps} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /data type conversion/i });
    await userEvent.click(headerElement);
    
    // Should have input fields in read-only mode
    const inputFields = screen.getAllByRole('textbox');
    inputFields.forEach(field => {
      expect(field).toHaveAttribute('readonly');
    });
  });

  it('calls onConfigChange when configuration changes', async () => {
    const handleConfigChange = jest.fn();
    const props = {
      id: 'test-node',
      testId: 'data-type-conversion',
      onConfigChange: handleConfigChange
    };
    render(<DataTypeConversion {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /data type conversion/i });
    await userEvent.click(headerElement);
    
    // Change input field
    const inputField = screen.getByLabelText(/input field/i);
    await userEvent.type(inputField, 'testField');
    
    expect(handleConfigChange).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const props = {
      id: 'test-node',
      testId: 'data-type-conversion',
    };
    render(<DataTypeConversion {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /data type conversion/i });
    await userEvent.click(headerElement);
    
    // Clear input field
    const inputField = screen.getByLabelText(/input field/i);
    await userEvent.clear(inputField);
    await userEvent.tab(); // Trigger validation by blurring
    
    // Check validation message appears
    await waitFor(() => {
      expect(screen.getByText(/input field is required/i)).toBeInTheDocument();
    });
  });
});

describe('DataTypeConversion - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows conversion preview when inputType and outputType are set', async () => {
    const props = {
      id: 'test-node',
      testId: 'data-type-conversion',
      initialConfig: {
        inputField: 'testField',
        inputType: 'string',
        outputType: 'number',
        errorHandling: 'fail'
      }
    };
    render(<DataTypeConversion {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /data type conversion/i });
    await userEvent.click(headerElement);
    
    // Check that conversion preview section is visible
    expect(screen.getByText(/conversion preview/i)).toBeInTheDocument();
    expect(screen.getByText(/sample string → number conversion/i)).toBeInTheDocument();
  });

  it('shows format string field only when date types are selected', async () => {
    const props = {
      id: 'test-node',
      testId: 'data-type-conversion'
    };
    render(<DataTypeConversion {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /data type conversion/i });
    await userEvent.click(headerElement);
    
    // Initially, format string should not be visible
    expect(screen.queryByLabelText(/format string/i)).not.toBeInTheDocument();
    
    // Select date as input type
    const inputTypeSelect = screen.getByLabelText(/input type/i);
    await userEvent.click(inputTypeSelect);
    await userEvent.click(screen.getByText(/date/i));
    
    // Now format string should be visible
    expect(screen.getByLabelText(/format string/i)).toBeInTheDocument();
  });
});

describe('DataTypeConversion - Accessibility Tests', () => {
  // Add jest-axe matcher
  expect.extend(toHaveNoViolations);

  it('has no accessibility violations', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'data-type-conversion'
    };
    const { container } = render(<DataTypeConversion {...defaultProps} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('has proper focus management', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'data-type-conversion'
    };
    render(<DataTypeConversion {...defaultProps} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /data type conversion/i });
    await userEvent.click(headerElement);
    
    // Check that the first input receives focus when tabbing
    await userEvent.tab();
    expect(screen.getByLabelText(/input field/i)).toHaveFocus();
  });
});