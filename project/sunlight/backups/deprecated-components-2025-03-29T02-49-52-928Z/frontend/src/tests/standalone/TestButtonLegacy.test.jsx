// TestButtonLegacy.test.jsx
// Independent test file for ButtonLegacy that doesn't rely on any external dependencies

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import standalone component (not the real one)
import Button from './TestButtonLegacy';

// Test suite
describe('ButtonLegacy Component', () => {
  // Basic rendering tests
  it('renders a button with text', () => {
    render(<ButtonLegacy>Click Me</ButtonLegacy>);

    const button = screen.getByTestId('button-legacy');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
  });

  it('applies the correct default classes', () => {
    render(<ButtonLegacy>Default Button</ButtonLegacy>);

    const button = screen.getByTestId('button-legacy');
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('btn-contained');
    expect(button).toHaveClass('btn-primary');
    expect(button).toHaveClass('btn-medium');
  });

  // Variant tests
  it('applies the correct classes for outlined variant', () => {
    render(<ButtonLegacy variant="outlined&quot;>Outlined Button</ButtonLegacy>);

    const button = screen.getByTestId("button-legacy');
    expect(button).toHaveClass('btn-outlined');
  });

  it('applies the correct classes for text variant', () => {
    render(<ButtonLegacy variant="text&quot;>Text Button</ButtonLegacy>);

    const button = screen.getByTestId("button-legacy');
    expect(button).toHaveClass('btn-text');
  });

  // Color tests
  it('applies the correct classes for secondary color', () => {
    render(<ButtonLegacy color="secondary&quot;>Secondary Button</ButtonLegacy>);

    const button = screen.getByTestId("button-legacy');
    expect(button).toHaveClass('btn-secondary');
  });

  it('applies the correct classes for error color', () => {
    render(<ButtonLegacy color="error&quot;>Error Button</ButtonLegacy>);

    const button = screen.getByTestId("button-legacy');
    expect(button).toHaveClass('btn-error');
  });

  // Size tests
  it('applies the correct classes for small size', () => {
    render(<ButtonLegacy size="small&quot;>Small Button</ButtonLegacy>);

    const button = screen.getByTestId("button-legacy');
    expect(button).toHaveClass('btn-small');
  });

  it('applies the correct classes for large size', () => {
    render(<ButtonLegacy size="large&quot;>Large Button</ButtonLegacy>);

    const button = screen.getByTestId("button-legacy');
    expect(button).toHaveClass('btn-large');
  });

  // Other prop tests
  it('applies the full width class when fullWidth is true', () => {
    render(<ButtonLegacy fullWidth>Full Width Button</ButtonLegacy>);

    const button = screen.getByTestId('button-legacy');
    expect(button).toHaveClass('btn-full-width');
  });

  it('applies the disabled class and attribute when disabled is true', () => {
    render(<ButtonLegacy disabled>Disabled Button</ButtonLegacy>);

    const button = screen.getByTestId('button-legacy');
    expect(button).toHaveClass('btn-disabled');
    expect(button).toBeDisabled();
  });

  // Event tests
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ButtonLegacy onClick={handleClick}>Clickable Button</ButtonLegacy>);

    const button = screen.getByTestId('button-legacy');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <ButtonLegacy disabled onClick={handleClick}>
        Disabled Button
      </ButtonLegacy>
    );

    const button = screen.getByTestId('button-legacy');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  // Icon tests
  it('renders start icon when provided', () => {
    const StartIcon = () => <span data-testid="start-icon">Icon</span>;
    render(<ButtonLegacy startIcon={<StartIcon />}>Button with Start Icon</ButtonLegacy>);

    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders end icon when provided', () => {
    const EndIcon = () => <span data-testid="end-icon">Icon</span>;
    render(<ButtonLegacy endIcon={<EndIcon />}>Button with End Icon</ButtonLegacy>);

    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });
});
