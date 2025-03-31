import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import RadioGroup from '../RadioGroupAdapted';

describe('RadioGroupAdapted', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const defaultProps = {
    id: 'test-radio',
    name: 'test-radio',
    value: 'option1',
    onChange: jest.fn(),
    options: mockOptions,
    label: 'Test Radio Group',
  };

  test('renders correctly with default props', () => {
    render(<RadioGroupAdapted {...defaultProps} />);
    
    // Verify label
    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    
    // Verify all options are rendered
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    
    // Check correct option is selected
    const selectedOption = screen.getByLabelText('Option 1');
    expect(selectedOption).toBeChecked();
  });

  test('calls onChange when selection changes', () => {
    render(<RadioGroupAdapted {...defaultProps} />);
    
    // Click on the second option
    fireEvent.click(screen.getByLabelText('Option 2'));
    
    // Verify onChange was called
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  test('renders with error state', () => {
    render(
      <RadioGroupAdapted 
        {...defaultProps} 
        error={true} 
        helperText="Error message&quot;
      />
    );
    
    // Verify error message is displayed
    expect(screen.getByText("Error message')).toBeInTheDocument();
    
    // FormControl should have error class
    const formControl = screen.getByRole('radiogroup').closest('fieldset');
    expect(formControl).toHaveClass('Mui-error');
  });

  test('handles disabled state correctly', () => {
    render(<RadioGroupAdapted {...defaultProps} disabled={true} />);
    
    // All radio options should be disabled
    const radioOptions = screen.getAllByRole('radio');
    radioOptions.forEach(radio => {
      expect(radio).toBeDisabled();
    });
  });

  test('displays in row layout when specified', () => {
    render(<RadioGroupAdapted {...defaultProps} row={true} />);
    
    // Row attribute should be passed to MuiRadioGroup
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveClass('MuiFormGroup-row');
  });

  test('has no accessibility violations', async () => {
    const { container } = render(<RadioGroupAdapted {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});