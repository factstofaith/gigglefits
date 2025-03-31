import { describe, it, expect, beforeEach, afterEach } from 'jest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import TextFormatting from '../TextFormatting';

describe('TextFormatting - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'text-formatting'
    };
    render(<TextFormatting {...defaultProps} />);
  });

  it('displays the correct title and description when expanded', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'text-formatting'
    };
    render(<TextFormatting {...defaultProps} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /text formatting/i });
    await userEvent.click(headerElement);
    
    // Check title and description are visible
    expect(screen.getByText('Text Formatting')).toBeInTheDocument();
    expect(screen.getByText('Formats and manipulates text values')).toBeInTheDocument();
  });

  it('renders in disabled state when disabled prop is true', () => {
    const disabledProps = {
      id: 'test-node',
      testId: 'text-formatting',
      disabled: true
    };
    render(<TextFormatting {...disabledProps} />);
    
    expect(screen.getByTestId('text-formatting')).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onConfigChange when configuration changes', async () => {
    const handleConfigChange = jest.fn();
    const props = {
      id: 'test-node',
      testId: 'text-formatting',
      onConfigChange: handleConfigChange
    };
    render(<TextFormatting {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /text formatting/i });
    await userEvent.click(headerElement);
    
    // Change input field
    const inputField = screen.getByLabelText(/input field/i);
    await userEvent.type(inputField, 'testField');
    
    expect(handleConfigChange).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const props = {
      id: 'test-node',
      testId: 'text-formatting',
    };
    render(<TextFormatting {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /text formatting/i });
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

describe('TextFormatting - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows formatting preview when configured', async () => {
    const props = {
      id: 'test-node',
      testId: 'text-formatting',
      initialConfig: {
        inputField: 'testField',
        operation: 'uppercase'
      }
    };
    render(<TextFormatting {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /text formatting/i });
    await userEvent.click(headerElement);
    
    // Check that formatting preview section is visible
    expect(screen.getByText(/formatting preview/i)).toBeInTheDocument();
    expect(screen.getByText(/sample text formatting with operation: uppercase/i)).toBeInTheDocument();
  });

  it('shows operation-specific controls for different operations', async () => {
    const props = {
      id: 'test-node',
      testId: 'text-formatting'
    };
    render(<TextFormatting {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /text formatting/i });
    await userEvent.click(headerElement);
    
    // Select replace operation
    const operationSelect = screen.getByLabelText(/text operation/i);
    await userEvent.click(operationSelect);
    await userEvent.click(screen.getByText(/replace/i));
    
    // Now search and replace fields should be visible
    expect(screen.getByLabelText(/search value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/replace value/i)).toBeInTheDocument();
    
    // Switch to a different operation
    await userEvent.click(operationSelect);
    await userEvent.click(screen.getByText(/substring/i));
    
    // Now substring fields should be visible
    expect(screen.getByLabelText(/start index/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end index/i)).toBeInTheDocument();
  });

  it('shows regex and case sensitivity options for replace operation', async () => {
    const props = {
      id: 'test-node',
      testId: 'text-formatting',
      initialConfig: {
        operation: 'replace'
      }
    };
    render(<TextFormatting {...props} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /text formatting/i });
    await userEvent.click(headerElement);
    
    // Check for regex and case sensitivity switches
    expect(screen.getByLabelText(/use regular expression/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/case sensitive/i)).toBeInTheDocument();
  });
});

describe('TextFormatting - Accessibility Tests', () => {
  // Add jest-axe matcher
  expect.extend(toHaveNoViolations);

  it('has no accessibility violations', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'text-formatting'
    };
    const { container } = render(<TextFormatting {...defaultProps} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('has proper focus management', async () => {
    const defaultProps = {
      id: 'test-node',
      testId: 'text-formatting'
    };
    render(<TextFormatting {...defaultProps} />);
    
    // Click to expand
    const headerElement = screen.getByRole('button', { name: /text formatting/i });
    await userEvent.click(headerElement);
    
    // Check that the first input receives focus when tabbing
    await userEvent.tab();
    expect(screen.getByLabelText(/input field/i)).toHaveFocus();
  });
});