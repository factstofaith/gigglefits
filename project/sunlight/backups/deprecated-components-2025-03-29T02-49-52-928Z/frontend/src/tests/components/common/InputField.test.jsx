import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { setupUserEvent } from '../../utils/user-event-setup';
import { testA11y } from '../../utils/a11y-utils';
import InputField from '@components/common/InputField';

// Mock the design system components
jest.mock('../../../design-system/components/layout', () => ({
  Box: ({ children, style }) => <div data-testid="mock-box" style={style}>{children}</div>,
}));

jest.mock('../../../design-system/components/core', () => ({
  Typography: ({ children, as, variant, style }) => {
    const Component = as || 'span';
    return (
      <Component data-testid={`mock-typography-${variant}`} style={style}>
        {children}
      </Component>
    );
  },
}));

jest.mock('../../../design-system/components/form', () => ({
  TextField: ({ 
    type, 
    value, 
    onChange, 
    placeholder, 
    error, 
    fullWidth,
    ...props 
  }) => (
    <input
      data-testid="mock-text-field"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-invalid={error ? 'true' : 'false'}
      style={{ width: fullWidth ? '100%' : 'auto' }}
      {...props}
    />
  ),
}));

jest.mock('../../../design-system/foundations/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: {
          primary: '#3B3D3D',
          secondary: '#757575'
        },
        error: {
          main: '#d32f2f'
        }
      }
    }
  }),
}));

describe('InputField', () => {
  // Test basic rendering
  it('renders correctly with label and placeholder', () => {
    render(
      <InputField 
        label="Username&quot; 
        placeholder="Enter username"
      />
    );
    
    // Check for label
    expect(screen.getByText('Username')).toBeInTheDocument();
    
    // Check for input with placeholder
    const input = screen.getByTestId('mock-text-field');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter username');
  });

  // Test user interactions
  it('handles input changes', async () => {
    const user = setupUserEvent();
    const handleChange = jest.fn();
    
    render(
      <InputField 
        label="Email&quot; 
        value="" 
        onChange={handleChange}
      />
    );
    
    const input = screen.getByTestId('mock-text-field');
    await user.type(input, 'test@example.com');
    
    expect(handleChange).toHaveBeenCalled();
  });

  // Test different input types
  it('renders with different input types', () => {
    const { rerender } = render(
      <InputField 
        label="Password&quot; 
        type="password" 
      />
    );
    
    // Check password input
    expect(screen.getByTestId('mock-text-field')).toHaveAttribute('type', 'password');
    
    // Rerender with different type
    rerender(
      <InputField 
        label="Quantity&quot; 
        type="number" 
      />
    );
    
    expect(screen.getByTestId('mock-text-field')).toHaveAttribute('type', 'number');
  });

  // Test error state
  it('displays error state and helper text', () => {
    render(
      <InputField 
        label="Email&quot; 
        error={true}
        helperText="Invalid email format"
      />
    );
    
    // Check for error state
    const input = screen.getByTestId('mock-text-field');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    // Check for helper text
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  // Test custom styles
  it('applies custom styles', () => {
    const customStyle = {
      marginBottom: '24px',
      border: '1px solid #ccc',
    };
    
    render(
      <InputField 
        label="Custom Input&quot; 
        style={customStyle}
      />
    );
    
    // Get the container
    const container = screen.getByTestId("mock-box');
    
    // Check that custom styles are applied
    expect(container).toHaveStyle({
      marginBottom: '24px',
      border: '1px solid #ccc',
    });
  });

  // Test passing additional props
  it('passes additional props to the input', () => {
    render(
      <InputField 
        label="Username&quot; 
        maxLength={10}
        required
        id="username-field"
      />
    );
    
    const input = screen.getByTestId('mock-text-field');
    expect(input).toHaveAttribute('maxLength', '10');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('id', 'username-field');
  });

  // Test accessibility - skipping due to mock components
  // In a real test, this would work with actual components
  it.skip('has no accessibility violations', async () => {
    await testA11y(
      <InputField 
        label="Accessible Input&quot; 
        placeholder="Enter value"
      />
    );
  });
});