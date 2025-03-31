// src/tests/design-system/Checkbox.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { testA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Checkbox from '@design-system/components/form/Checkbox';

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
    default: ({ children, component = 'div', htmlFor, ...props }) => {
      const Component = component;
      return (
        <Component data-testid="mock-typography" htmlFor={htmlFor} {...props}>
          {children}
        </Component>
      );
    },
  };
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
        common: { white: '#ffffff' },
        action: {
          disabled: '#cccccc',
          disabledBackground: '#eeeeee',
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
        },
        fontSizes: {
          sm: '0.875rem',
          md: '1rem',
          lg: '1.25rem',
        },
      },
    },
  }),
}));

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

describe('Checkbox Component', () => {
  it('renders correctly with default props', () => {
    customRender(<Checkbox data-testid="checkbox" />);
    
    // Get the input element
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBeDisabled();
    expect(checkbox).not.toBeRequired();
  });

  it('renders with label', () => {
    customRender(<Checkbox label="Test Label&quot; />);
    
    const checkbox = screen.getByRole("checkbox');
    expect(checkbox).toBeInTheDocument();
    
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
  });

  it('handles checked state correctly', () => {
    customRender(<Checkbox checked={true} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('works as an uncontrolled component with defaultChecked', async () => {
    const user = setupUserEvent();
    customRender(<Checkbox defaultChecked={true} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    
    // Click to uncheck
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('works as a controlled component', async () => {
    const handleChange = jest.fn();
    const user = setupUserEvent();
    
    const { rerender } = customRender(
      <Checkbox checked={false} onChange={handleChange} />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    // Click to check
    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
    
    // State shouldn't change (controlled)
    expect(checkbox).not.toBeChecked();
    
    // Rerender with checked=true
    rerender(<Checkbox checked={true} onChange={handleChange} />);
    expect(checkbox).toBeChecked();
  });

  it('handles onChange event', async () => {
    const handleChange = jest.fn();
    const user = setupUserEvent();
    
    customRender(<Checkbox onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          checked: true
        })
      })
    );
  });

  it('handles disabled state', async () => {
    const handleChange = jest.fn();
    const user = setupUserEvent();
    
    customRender(<Checkbox disabled onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    
    // Try to click disabled checkbox
    await user.click(checkbox);
    
    // onChange should not be called
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('handles required state', () => {
    customRender(<Checkbox required />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeRequired();
  });

  it('handles error state', () => {
    customRender(<Checkbox error />);
    
    // We can't easily test styles directly, but ensure it renders
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('handles indeterminate state', () => {
    customRender(<Checkbox indeterminate checked />);
    
    // We can't easily test the SVG rendering directly, but ensure it renders
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it('renders with different sizes', () => {
    const { rerender } = customRender(<Checkbox size="medium&quot; />);
    
    // We can"t easily test styles directly, but ensure it renders
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    
    rerender(<Checkbox size="small&quot; />);
    checkbox = screen.getByRole("checkbox');
    expect(checkbox).toBeInTheDocument();
    
    rerender(<Checkbox size="large&quot; />);
    checkbox = screen.getByRole("checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('forwards id, name, and value props', () => {
    customRender(
      <Checkbox 
        id="test-id&quot; 
        name="test-name"
        value="test-value&quot;
      />
    );
    
    const checkbox = screen.getByRole("checkbox');
    expect(checkbox).toHaveAttribute('id', 'test-id');
    expect(checkbox).toHaveAttribute('name', 'test-name');
    expect(checkbox).toHaveAttribute('value', 'test-value');
  });

  it('associates label with checkbox via id', () => {
    customRender(<Checkbox id="test-id&quot; label="Test Label" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'test-id');
    
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-id');
  });

  it('handles onBlur event', async () => {
    const handleBlur = jest.fn();
    const user = setupUserEvent();
    
    customRender(
      <>
        <Checkbox onBlur={handleBlur} />
        <button>Focus me</button>
      </>
    );
    
    const checkbox = screen.getByRole('checkbox');
    const button = screen.getByRole('button');
    
    // Focus the checkbox
    await user.click(checkbox);
    
    // Move focus to button to trigger blur
    await user.click(button);
    
    // onBlur should be called
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('applies custom styles', () => {
    const customStyle = { marginBottom: '10px' };
    
    customRender(<Checkbox style={customStyle} />);
    
    const box = screen.getByTestId('mock-box');
    expect(box).toHaveStyle('margin-bottom: 10px');
  });

  it('applies label props', () => {
    const labelProps = { className: 'test-class', style: { fontWeight: 'bold' } };
    
    customRender(<Checkbox label="Test Label&quot; labelProps={labelProps} />);
    
    const label = screen.getByText("Test Label');
    expect(label).toHaveAttribute('class', 'test-class');
  });

  it('has no accessibility violations', async () => {
    await testA11y(<Checkbox label="Accessibility Test" />);
  });
});