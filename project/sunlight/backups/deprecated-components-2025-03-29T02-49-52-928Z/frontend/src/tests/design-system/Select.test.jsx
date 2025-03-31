// src/tests/design-system/Select.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { testA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Select from '@design-system/components/form/Select';

// Mock Box and Typography components
jest.mock('../../design-system/components/layout/Box', () => {
  return {
    __esModule: true,
    default: ({ children, ...props }) => (
      <div data-testid="mock-box" {...props}>
        {children}
      </div>
    ),
  };
});

jest.mock('../../design-system/components/core/Typography', () => {
  return {
    __esModule: true,
    default: ({ children, ...props }) => (
      <div data-testid="mock-typography" {...props}>
        {children}
      </div>
    ),
  };
});

// Mock getBoundingClientRect and other DOM methods
const mockRect = { top: 100, left: 100, width: 200, height: 40, bottom: 140, right: 300 };
const mockSelect = {
  getBoundingClientRect: jest.fn(() => mockRect),
  contains: jest.fn(() => false),
};
const mockDropdown = {
  contains: jest.fn(() => false),
};

// Mock window.scrollY and window.scrollX
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'scrollX', {
  writable: true,
  value: 0,
});

// Mock theme values
jest.mock('../../design-system/foundations/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { main: '#1976d2' },
        error: { main: '#f44336' },
        text: {
          primary: '#000000',
          secondary: '#666666',
          disabled: '#999999',
        },
        background: { paper: '#ffffff' },
        action: {
          hover: 'rgba(0, 0, 0, 0.04)',
          selected: 'rgba(25, 118, 210, 0.08)',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
      },
      typography: {
        fontFamilies: {
          primary: 'Roboto, sans-serif',
        },
        fontWeights: {
          regular: 400,
          medium: 500,
        },
        fontSizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.25rem',
        },
      },
    },
  }),
}));

// Sample options for testing
const testOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

// Custom render with theme provider
const customRender = (ui, options = {}) => {
  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';


  return render(ui, { wrapper: MockThemeProvider, ...options });
};

describe('Select Component', () => {
  beforeEach(() => {
    // Mock refs
    Element.prototype.getBoundingClientRect = jest.fn(() => mockRect);
    
    // Reset reference mocks
    mockSelect.contains.mockReset();
    mockDropdown.contains.mockReset();
    
    // Set up document listener for click outside
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
  });

  it('renders correctly with default props', () => {
    customRender(<Select />);
    
    // Check the select container
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-expanded', 'false');
    expect(select).toHaveAttribute('aria-disabled', 'false');
    
    // Check placeholder text
    expect(screen.getByText('Select an option')).toBeInTheDocument();
    
    // Check that dropdown is not visible
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    
    // Check that the hidden native select exists
    const nativeSelect = document.querySelector('select');
    expect(nativeSelect).toBeInTheDocument();
  });

  it('renders with provided options', () => {
    customRender(<Select options={testOptions} />);
    
    // Check native select has options
    const nativeSelect = document.querySelector('select');
    expect(nativeSelect.children.length).toBe(3);
    expect(nativeSelect.children[0].textContent).toBe('Option 1');
    expect(nativeSelect.children[1].textContent).toBe('Option 2');
    expect(nativeSelect.children[2].textContent).toBe('Option 3');
  });

  it('opens dropdown when clicked', () => {
    customRender(<Select options={testOptions} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // Dropdown should now be visible
    const dropdown = screen.getByRole('listbox');
    expect(dropdown).toBeInTheDocument();
    
    // Options should be visible
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    
    // Select should have aria-expanded set to true
    expect(select).toHaveAttribute('aria-expanded', 'true');
  });

  it('selects an option when clicked', () => {
    const handleChange = jest.fn();
    customRender(<Select options={testOptions} onChange={handleChange} />);
    
    // Open dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // Click on an option
    const option = screen.getByText('Option 2');
    fireEvent.click(option);
    
    // Check that onChange was called
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: { name: undefined, value: 'option2' },
    }));
    
    // Selected value should be displayed
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    
    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('works as a controlled component', () => {
    const handleChange = jest.fn();
    
    const { rerender } = customRender(
      <Select 
        options={testOptions} 
        value="option1&quot; 
        onChange={handleChange}
      />
    );
    
    // Selected value should be displayed
    expect(screen.getByText("Option 1')).toBeInTheDocument();
    
    // Open dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // Click on an option
    const option = screen.getByText('Option 2');
    fireEvent.click(option);
    
    // Check that onChange was called
    expect(handleChange).toHaveBeenCalled();
    
    // Selection shouldn't change yet (controlled)
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    
    // Update the value prop
    rerender(
      <Select 
        options={testOptions} 
        value="option2&quot; 
        onChange={handleChange}
      />
    );
    
    // Now the selected value should be updated
    expect(screen.getByText("Option 2')).toBeInTheDocument();
  });

  it('handles uncontrolled behavior with defaultValue', () => {
    customRender(
      <Select 
        options={testOptions} 
        defaultValue="option1&quot;
      />
    );
    
    // Default value should be displayed
    expect(screen.getByText("Option 1')).toBeInTheDocument();
    
    // Open dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // Click on an option
    const option = screen.getByText('Option 3');
    fireEvent.click(option);
    
    // Selection should change (uncontrolled)
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('supports multiple selection', () => {
    const handleChange = jest.fn();
    customRender(
      <Select 
        options={testOptions} 
        multiple 
        onChange={handleChange}
      />
    );
    
    // Open dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // Dropdown should have aria-multiselectable attribute
    const dropdown = screen.getByRole('listbox');
    expect(dropdown).toHaveAttribute('aria-multiselectable', 'true');
    
    // Click on multiple options
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);
    
    // Dropdown should stay open for multiple selection
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    // Option should be selected
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: { name: undefined, value: ['option1'] },
    }));
    
    const option3 = screen.getByText('Option 3');
    fireEvent.click(option3);
    
    // Both options should be selected
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: { name: undefined, value: ['option1', 'option3'] },
    }));
  });

  it('renders in disabled state', () => {
    customRender(<Select options={testOptions} disabled />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
    
    // Click shouldn't open the dropdown
    fireEvent.click(select);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    
    // Native select should be disabled
    const nativeSelect = document.querySelector('select');
    expect(nativeSelect).toBeDisabled();
  });

  it('renders in error state', () => {
    customRender(<Select options={testOptions} error />);
    
    // Select should have error styles (we can't easily test styles directly)
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('handles fullWidth prop', () => {
    customRender(<Select options={testOptions} fullWidth />);
    
    const select = screen.getByRole('combobox');
    expect(select.style.width).toBe('100%');
  });

  it('renders with different variants', () => {
    const { rerender } = customRender(<Select options={testOptions} variant="outlined&quot; />);
    
    // Can"t directly test styles, but ensure it renders
    let select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    rerender(<Select options={testOptions} variant="filled&quot; />);
    select = screen.getByRole("combobox');
    expect(select).toBeInTheDocument();
    
    rerender(<Select options={testOptions} variant="standard&quot; />);
    select = screen.getByRole("combobox');
    expect(select).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = customRender(<Select options={testOptions} size="medium&quot; />);
    
    // Can"t directly test styles, but ensure it renders
    let select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    rerender(<Select options={testOptions} size="small&quot; />);
    select = screen.getByRole("combobox');
    expect(select).toBeInTheDocument();
    
    rerender(<Select options={testOptions} size="large&quot; />);
    select = screen.getByRole("combobox');
    expect(select).toBeInTheDocument();
  });

  it('shows no options available message when options array is empty', () => {
    customRender(<Select options={[]} />);
    
    // Open dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // Should show no options message
    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    await testA11y(<Select options={testOptions} aria-label="Test Select" />);
  });
});