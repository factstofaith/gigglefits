import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from "@/design-system/adapter";
import Button from '../Button';

// Mock theme for testing
const mockTheme = {
  typography: {
    fontFamily: 'Arial, sans-serif'
  }
};

// Wrapper component with ThemeProvider
const TestWrapper = ({
  children
}) => <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>;
describe('Button', () => {
  // Test rendering with default props
  it('renders with default props', () => {
    render(<TestWrapper>
        <Button>Click Me</Button>
      </TestWrapper>);
    const button = screen.getByTestId('button');

    // Check content
    expect(button).toHaveTextContent('Click Me');

    // Check default attributes
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'medium');
    expect(button).toHaveAttribute('data-fullwidth', 'false');
    expect(button).not.toBeDisabled();
  });

  // Test different variants
  it('renders different variants correctly', () => {
    const {
      rerender
    } = render(<TestWrapper>
        <Button variant="primary">Primary</Button>
      </TestWrapper>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'primary');
    rerender(<TestWrapper>
        <Button variant="secondary">Secondary</Button>
      </TestWrapper>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'secondary');
    rerender(<TestWrapper>
        <Button variant="text">Text</Button>
      </TestWrapper>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'text');
  });

  // Test different sizes
  it('renders different sizes correctly', () => {
    const {
      rerender
    } = render(<TestWrapper>
        <Button size="small">Small</Button>
      </TestWrapper>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'small');
    rerender(<TestWrapper>
        <Button size="medium">Medium</Button>
      </TestWrapper>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'medium');
    rerender(<TestWrapper>
        <Button size="large">Large</Button>
      </TestWrapper>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'large');
  });

  // Test fullWidth prop
  it('applies fullWidth style when specified', () => {
    render(<TestWrapper>
        <Button fullWidth>Full Width</Button>
      </TestWrapper>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-fullwidth', 'true');
  });

  // Test disabled state
  it('applies disabled state correctly', () => {
    render(<TestWrapper>
        <Button disabled>Disabled</Button>
      </TestWrapper>);
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  // Test click handler
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<TestWrapper>
        <Button onClick={handleClick}>Click Me</Button>
      </TestWrapper>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test that disabled button doesn't trigger click handler
  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<TestWrapper>
        <Button onClick={handleClick} disabled>Click Me</Button>
      </TestWrapper>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});