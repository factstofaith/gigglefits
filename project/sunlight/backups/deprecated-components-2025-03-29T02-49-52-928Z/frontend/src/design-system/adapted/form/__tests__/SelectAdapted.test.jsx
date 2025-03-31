import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Select from '../SelectAdapted';

// Mock react-window to avoid virtualization in tests
jest.mock('react-window', () => ({
  VariableSizeList: ({ children, itemCount }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index}>{children({ index, style: {} })}</div>
      ))}
    </div>
  ),
}));

describe('SelectAdapted', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const defaultProps = {
    id: 'test-select',
    name: 'test-select',
    value: 'option1',
    onChange: jest.fn(),
    options: mockOptions,
    label: 'Test Select',
  };

  // Basic rendering
  test('renders correctly with default props', () => {
    render(<SelectAdapted {...defaultProps} />);
    
    // Find the select element
    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    
    // Ensure it has the correct value
    expect(screen.getByLabelText('Test Select')).toHaveValue('option1');
  });

  // Test label and helper text
  test('renders label and helper text correctly', () => {
    render(
      <SelectAdapted 
        {...defaultProps} 
        helperText="This is helper text&quot;
      />
    );
    
    expect(screen.getByText("Test Select')).toBeInTheDocument();
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  // Test error state
  test('renders error state correctly', () => {
    render(
      <SelectAdapted 
        {...defaultProps} 
        error={true} 
        helperText="Error message&quot;
      />
    );
    
    const helperText = screen.getByText("Error message');
    expect(helperText).toBeInTheDocument();
    
    // In error state, FormControl should have error class/prop
    const formControl = helperText.closest('.MuiFormControl-root');
    expect(formControl).toHaveClass('Mui-error');
  });

  // Test required and disabled states
  test('handles required and disabled states correctly', () => {
    render(
      <SelectAdapted 
        {...defaultProps} 
        required={true}
        disabled={true}
      />
    );
    
    const select = screen.getByLabelText(/Test Select/);
    expect(select).toBeDisabled();
    
    // Label should have required indicator
    const label = screen.getByText('Test Select');
    expect(label).toHaveClass('Mui-required');
  });

  // Accessibility testing
  test('has no accessibility violations', async () => {
    const { container } = render(<SelectAdapted {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});