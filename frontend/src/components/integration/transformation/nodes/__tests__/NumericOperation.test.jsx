import { describe, it, expect, beforeEach, afterEach } from 'jest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import NumericOperation from '../NumericOperation';

describe('NumericOperation - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'numeric-operation'
    };
    render(<NumericOperation {...defaultProps} />);
  });

  it('displays the correct title and description when expanded', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'numeric-operation'
    };
    render(<NumericOperation {...defaultProps} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /numeric operation/i });
    await userEvent.click(headerElement);
    
    // Check title and description are visible
    expect(screen.getByText('Numeric Operation')).toBeInTheDocument();
    expect(screen.getByText('Performs mathematical operations on numeric values')).toBeInTheDocument();
  });

  it('renders in disabled state when disabled prop is true', () => {
    const disabledProps = {
      id: 'test-node',
      testId: 'numeric-operation',
      disabled: true
    };
    render(<NumericOperation {...disabledProps} />);
    
    expect(screen.getByTestId('numeric-operation')).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onConfigChange when configuration changes', async () => {
    const handleConfigChange = jest.fn();
    const props = {
      id: 'test-node',
      testId: 'numeric-operation',
      onConfigChange: handleConfigChange
    };
    render(<NumericOperation {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /numeric operation/i });
    await userEvent.click(headerElement);
    
    // Change input field
    const inputField = screen.getByLabelText(/input field/i);
    await userEvent.type(inputField, 'testField');
    
    expect(handleConfigChange).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const props = {
      id: 'test-node',
      testId: 'numeric-operation',
    };
    render(<NumericOperation {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /numeric operation/i });
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

describe('NumericOperation - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows calculation preview when configured', async () => {
    const props = {
      id: 'test-node',
      testId: 'numeric-operation',
      initialConfig: {
        inputField: 'numField',
        operation: 'add',
        operand: 10
      }
    };
    render(<NumericOperation {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /numeric operation/i });
    await userEvent.click(headerElement);
    
    // Check that calculation preview section is visible
    expect(screen.getByText(/calculation preview/i)).toBeInTheDocument();
    expect(screen.getByText(/sample calculation with operation: add/i)).toBeInTheDocument();
  });

  it('shows operation-specific controls for different operations', async () => {
    const props = {
      id: 'test-node',
      testId: 'numeric-operation'
    };
    render(<NumericOperation {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /numeric operation/i });
    await userEvent.click(headerElement);
    
    // Add operation requires operand (default)
    expect(screen.getByLabelText(/operand/i)).toBeInTheDocument();
    
    // Select an operation that doesn't need operand
    const operationSelect = screen.getByLabelText(/numeric operation/i);
    await userEvent.click(operationSelect);
    await userEvent.click(screen.getByText(/absolute/i));
    
    // Now operand field should not be visible since absolute doesn't need it
    await waitFor(() => {
      expect(screen.queryByLabelText(/^operand$/i)).not.toBeInTheDocument();
    });
  });

  it('shows high precision toggle and different error handling options', async () => {
    const props = {
      id: 'test-node',
      testId: 'numeric-operation',
    };
    render(<NumericOperation {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /numeric operation/i });
    await userEvent.click(headerElement);
    
    // Check for high precision switch
    expect(screen.getByLabelText(/use high precision math/i)).toBeInTheDocument();
    
    // Check error handling options
    const errorHandlingSelect = screen.getByLabelText(/error handling/i);
    expect(errorHandlingSelect).toBeInTheDocument();
    
    // Change error handling to fallback
    await userEvent.click(errorHandlingSelect);
    await userEvent.click(screen.getByText(/use fallback value/i));
    
    // Now fallback value field should be visible
    expect(screen.getByLabelText(/fallback value/i)).toBeInTheDocument();
  });
});

describe('NumericOperation - Accessibility Tests', () => {
  // Add jest-axe matcher
  expect.extend(toHaveNoViolations);

  it('has no accessibility violations', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'numeric-operation'
    };
    const { container } = render(<NumericOperation {...defaultProps} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('has proper focus management', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'numeric-operation'
    };
    render(<NumericOperation {...defaultProps} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /numeric operation/i });
    await userEvent.click(headerElement);
    
    // Check that the first input receives focus when tabbing
    await userEvent.tab();
    expect(screen.getByLabelText(/input field/i)).toHaveFocus();
  });
});