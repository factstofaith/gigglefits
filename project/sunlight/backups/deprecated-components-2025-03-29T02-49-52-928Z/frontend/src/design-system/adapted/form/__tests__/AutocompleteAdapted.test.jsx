import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import Autocomplete from '../AutocompleteAdapted';

// Mock react-window to avoid virtualization in tests
jest.mock('react-window', () => ({
  VariableSizeList: ({ children, itemCount, itemData }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index}>
          {children({ index, style: {}, data: itemData })}
        </div>
      ))}
    </div>
  ),
}));

// Mock useMediaQuery to simulate desktop
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: jest.fn().mockReturnValue(false),
  };
});

describe('AutocompleteAdapted', () => {
  const mockOptions = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
  ];

  const defaultProps = {
    id: 'test-autocomplete',
    options: mockOptions,
    value: null,
    onChange: jest.fn(),
    label: 'Test Autocomplete',
  };

  test('renders correctly with default props', () => {
    render(<AutocompleteAdapted {...defaultProps} />);
    
    // Check for the label
    expect(screen.getByLabelText('Test Autocomplete')).toBeInTheDocument();
  });
  
  test('opens dropdown on click', async () => {
    render(<AutocompleteAdapted {...defaultProps} />);
    
    // Click on the autocomplete to open it
    const input = screen.getByLabelText('Test Autocomplete');
    fireEvent.click(input);
    
    // Check if options are displayed
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });
  
  test('filters options when typing', async () => {
    render(<AutocompleteAdapted {...defaultProps} />);
    
    // Start typing in the autocomplete
    const input = screen.getByLabelText('Test Autocomplete');
    fireEvent.change(input, { target: { value: 'Option 1' } });
    
    // Check if options are filtered
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });
  });
  
  test('calls onChange when option is selected', async () => {
    render(<AutocompleteAdapted {...defaultProps} />);
    
    // Open autocomplete dropdown
    const input = screen.getByLabelText('Test Autocomplete');
    fireEvent.click(input);
    
    // Click on an option
    await waitFor(() => {
      const option = screen.getByText('Option 2');
      fireEvent.click(option);
    });
    
    // Check if onChange was called with the right option
    expect(defaultProps.onChange).toHaveBeenCalled();
  });
  
  test('renders with error state', () => {
    render(
      <AutocompleteAdapted 
        {...defaultProps} 
        error={true} 
        helperText="Error message&quot;
      />
    );
    
    // Check for error message
    expect(screen.getByText("Error message')).toBeInTheDocument();
    
    // Check input has error class
    const input = screen.getByLabelText('Test Autocomplete');
    const inputWrapper = input.closest('.MuiInputBase-root');
    expect(inputWrapper).toHaveClass('Mui-error');
  });
  
  test('handles disabled state correctly', () => {
    render(<AutocompleteAdapted {...defaultProps} disabled={true} />);
    
    // Check if input is disabled
    const input = screen.getByLabelText('Test Autocomplete');
    expect(input).toBeDisabled();
  });
  
  test('renders with virtualization for large datasets', () => {
    // Create a large dataset
    const largeOptions = Array.from({ length: 200 }).map((_, i) => ({
      id: `${i}`,
      label: `Option ${i}`,
    }));
    
    render(
      <AutocompleteAdapted
        {...defaultProps}
        options={largeOptions}
        enableVirtualization={true}
        virtualizationThreshold={100}
      />
    );
    
    // Open autocomplete dropdown
    const input = screen.getByLabelText('Test Autocomplete');
    fireEvent.click(input);
    
    // Check if virtualization is used
    waitFor(() => {
      expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    });
  });
  
  test('supports grouping options', async () => {
    const groupedOptions = [
      { id: '1', label: 'Apple', group: 'Fruits' },
      { id: '2', label: 'Banana', group: 'Fruits' },
      { id: '3', label: 'Carrot', group: 'Vegetables' },
      { id: '4', label: 'Potato', group: 'Vegetables' },
    ];
    
    render(
      <AutocompleteAdapted
        {...defaultProps}
        options={groupedOptions}
        groupBy={(option) => option.group}
      />
    );
    
    // Open autocomplete dropdown
    const input = screen.getByLabelText('Test Autocomplete');
    fireEvent.click(input);
    
    // Check if group headers are displayed
    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });
  });
  
  test('works with multiple selection', async () => {
    render(<AutocompleteAdapted {...defaultProps} multiple={true} value={[]} />);
    
    // Open autocomplete dropdown
    const input = screen.getByLabelText('Test Autocomplete');
    fireEvent.click(input);
    
    // Select first option
    await waitFor(() => {
      const option = screen.getByText('Option 1');
      fireEvent.click(option);
    });
    
    // Check onChange was called with array containing the first option
    expect(defaultProps.onChange).toHaveBeenCalled();
  });
  
  test('has no accessibility violations', async () => {
    const { container } = render(<AutocompleteAdapted {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});