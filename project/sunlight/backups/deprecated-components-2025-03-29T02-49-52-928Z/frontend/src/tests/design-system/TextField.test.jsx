// src/tests/design-system/TextField.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { testA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import TextField from '@design-system/components/form/TextField';

// Mock Box and Typography components to simplify testing
jest.mock('../../design-system/components/layout/Box', () => ({
  __esModule: true,
  default: ({ children, style, ...props }) => (
    <div data-testid="mock-box" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('../../design-system/components/core/Typography', () => ({
  __esModule: true,
  default: ({ children, style, ...props }) => (
    <div data-testid="mock-typography" {...props}>
      {children}
    </div>
  ),
}));

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
          disabled: '#999999'
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
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.25rem',
        },
      },
    },
  }),
}));

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

describe('TextField Component', () => {
  it('renders correctly with default props', () => {
    customRender(<TextField data-testid="text-field" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).not.toBeDisabled();
    expect(input).not.toHaveAttribute('readonly');
    expect(input).not.toHaveAttribute('required');
  });

  it('renders with different variants', () => {
    const { rerender } = customRender(<TextField data-testid="text-field" variant="outlined&quot; />);
    let input = screen.getByRole("textbox');
    expect(input).toBeInTheDocument();
    
    rerender(<TextField data-testid="text-field" variant="filled&quot; />);
    input = screen.getByRole("textbox');
    expect(input).toBeInTheDocument();
    
    rerender(<TextField data-testid="text-field" variant="standard&quot; />);
    input = screen.getByRole("textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = customRender(<TextField data-testid="text-field" size="medium&quot; />);
    let input = screen.getByRole("textbox');
    expect(input).toBeInTheDocument();
    
    rerender(<TextField data-testid="text-field" size="small&quot; />);
    input = screen.getByRole("textbox');
    expect(input).toBeInTheDocument();
    
    rerender(<TextField data-testid="text-field" size="large&quot; />);
    input = screen.getByRole("textbox');
    expect(input).toBeInTheDocument();
  });

  it('applies fullWidth prop correctly', () => {
    customRender(<TextField data-testid="text-field" fullWidth />);
    const input = screen.getByRole('textbox');
    expect(input.style.width).toBe('100%');
  });

  it('renders in disabled state', () => {
    customRender(<TextField data-testid="text-field" disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders in read-only state', () => {
    customRender(<TextField data-testid="text-field" readOnly />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('renders as required', () => {
    customRender(<TextField data-testid="text-field" required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
  });

  it('renders in error state with helper text', () => {
    customRender(
      <TextField 
        data-testid="text-field" 
        error 
        helperText="Error message&quot;
      />
    );
    
    const input = screen.getByRole("textbox');
    expect(input).toBeInTheDocument();
    
    const helperText = screen.getByText('Error message');
    expect(helperText).toBeInTheDocument();
  });

  it('renders as multiline textarea', () => {
    customRender(
      <TextField 
        data-testid="text-field" 
        multiline 
        rows={4}
      />
    );
    
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('renders with start and end adornments', () => {
    customRender(
      <TextField 
        data-testid="text-field" 
        startAdornment={<span>$</span>}
        endAdornment={<span>USD</span>}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('handles user input correctly', async () => {
    const handleChange = jest.fn();
    const user = setupUserEvent();
    
    customRender(
      <TextField 
        data-testid="text-field" 
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'Hello World');
    
    expect(handleChange).toHaveBeenCalledTimes(11); // One call per character
  });

  it('handles focus and blur events', async () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    const user = setupUserEvent();
    
    customRender(
      <TextField 
        data-testid="text-field" 
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
    
    const input = screen.getByRole('textbox');
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('works as a controlled component', async () => {
    const handleChange = jest.fn();
    const user = setupUserEvent();
    
    const { rerender } = customRender(
      <TextField 
        data-testid="text-field" 
        value="Controlled&quot;
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole("textbox');
    expect(input.value).toBe('Controlled');
    
    await user.type(input, 'Test');
    expect(handleChange).toHaveBeenCalled();
    
    // Value shouldn't change because it's controlled
    expect(input.value).toBe('Controlled');
    
    // Update the value via props
    rerender(
      <TextField 
        data-testid="text-field" 
        value="Updated&quot;
        onChange={handleChange}
      />
    );
    
    expect(input.value).toBe("Updated');
  });

  it('works with defaultValue for uncontrolled behavior', async () => {
    const user = setupUserEvent();
    
    customRender(
      <TextField 
        data-testid="text-field" 
        defaultValue="Default&quot;
      />
    );
    
    const input = screen.getByRole("textbox');
    expect(input.value).toBe('Default');
    
    // Clear the input
    await user.clear(input);
    // Type new text
    await user.type(input, 'New Value');
    
    // Value should update because it's uncontrolled
    expect(input.value).toBe('New Value');
  });

  it('supports different input types', () => {
    const { rerender } = customRender(<TextField type="password&quot; />);
    let input = screen.getByRole("textbox');
    expect(input).toHaveAttribute('type', 'password');
    
    rerender(<TextField type="email&quot; />);
    input = screen.getByRole("textbox');
    expect(input).toHaveAttribute('type', 'email');
    
    rerender(<TextField type="number&quot; />);
    input = screen.getByRole("textbox');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('has no accessibility violations', async () => {
    await testA11y(<TextField aria-label="Text Field" />);
  });
});