// TestInputFieldLegacy.test.jsx
// Independent test file for InputFieldLegacy that doesn't rely on any external dependencies

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import standalone component (not the real one)
import InputField from './TestInputFieldLegacy';

// Test suite
describe('InputFieldLegacy Component', () => {
  // Basic rendering tests
  it('renders an input field', () => {
    render(<InputFieldLegacy />);

    const input = screen.getByTestId('input-legacy-field');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with label', () => {
    render(<InputFieldLegacy label="Test Label&quot; />);

    expect(screen.getByText("Test Label')).toBeInTheDocument();
  });

  it('renders as required with appropriate marker', () => {
    render(<InputFieldLegacy label="Required Field&quot; required />);

    const label = screen.getByText("Required Field');
    expect(label).toHaveClass('input-label-required');

    const input = screen.getByTestId('input-legacy-field');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('renders with helper text', () => {
    render(<InputFieldLegacy helperText="Helper text&quot; />);

    expect(screen.getByText("Helper text')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<InputFieldLegacy placeholder="Enter text&quot; />);

    const input = screen.getByTestId("input-legacy-field');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  // Error state tests
  it('renders error state', () => {
    render(<InputFieldLegacy error helperText="Error message&quot; />);

    const input = screen.getByTestId("input-legacy-field');
    const helperText = screen.getByText('Error message');

    expect(input).toHaveClass('input-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(helperText).toHaveClass('input-error-text');
  });

  // Variant tests
  it('renders outlined variant by default', () => {
    render(<InputFieldLegacy />);

    const input = screen.getByTestId('input-legacy-field');
    expect(input).toHaveClass('input-outlined');
  });

  it('renders filled variant', () => {
    render(<InputFieldLegacy variant="filled&quot; />);

    const input = screen.getByTestId("input-legacy-field');
    expect(input).toHaveClass('input-filled');
  });

  it('renders standard variant', () => {
    render(<InputFieldLegacy variant="standard&quot; />);

    const input = screen.getByTestId("input-legacy-field');
    expect(input).toHaveClass('input-standard');
  });

  // Size tests
  it('renders medium size by default', () => {
    render(<InputFieldLegacy />);

    const input = screen.getByTestId('input-legacy-field');
    expect(input).toHaveClass('input-medium');
  });

  it('renders small size', () => {
    render(<InputFieldLegacy size="small&quot; />);

    const input = screen.getByTestId("input-legacy-field');
    expect(input).toHaveClass('input-small');
  });

  it('renders large size', () => {
    render(<InputFieldLegacy size="large&quot; />);

    const input = screen.getByTestId("input-legacy-field');
    expect(input).toHaveClass('input-large');
  });

  // Full width test
  it('renders full width', () => {
    render(<InputFieldLegacy fullWidth />);

    const container = screen.getByTestId('input-legacy-container');
    expect(container).toHaveClass('input-full-width');
  });

  // Disabled state test
  it('renders disabled state', () => {
    render(<InputFieldLegacy disabled />);

    const input = screen.getByTestId('input-legacy-field');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('input-disabled');
  });

  // ReadOnly state test
  it('renders readonly state', () => {
    render(<InputFieldLegacy readOnly />);

    const input = screen.getByTestId('input-legacy-field');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveClass('input-readonly');
  });

  // Multiline test
  it('renders as textarea when multiline is true', () => {
    render(<InputFieldLegacy multiline rows={4} />);

    const textarea = screen.getByTestId('input-legacy-field');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  // Input types test
  it('renders with different input types', () => {
    const { rerender } = render(<InputFieldLegacy type="password&quot; />);

    expect(screen.getByTestId("input-legacy-field')).toHaveAttribute('type', 'password');

    rerender(<InputFieldLegacy type="number&quot; />);
    expect(screen.getByTestId("input-legacy-field')).toHaveAttribute('type', 'number');

    rerender(<InputFieldLegacy type="email&quot; />);
    expect(screen.getByTestId("input-legacy-field')).toHaveAttribute('type', 'email');
  });

  // Adornment tests
  it('renders with start adornment', () => {
    const StartAdornment = () => <span data-testid="start-adornment">$</span>;
    render(<InputFieldLegacy startAdornment={<StartAdornment />} />);

    expect(screen.getByTestId('start-adornment')).toBeInTheDocument();
  });

  it('renders with end adornment', () => {
    const EndAdornment = () => <span data-testid="end-adornment">%</span>;
    render(<InputFieldLegacy endAdornment={<EndAdornment />} />);

    expect(screen.getByTestId('end-adornment')).toBeInTheDocument();
  });

  // Value handling tests
  it('handles defaultValue', () => {
    render(<InputFieldLegacy defaultValue="Default text&quot; />);

    const input = screen.getByTestId("input-legacy-field');
    expect(input).toHaveValue('Default text');
  });

  it('handles controlled value', () => {
    const { rerender } = render(<InputFieldLegacy value="Controlled text&quot; />);

    const input = screen.getByTestId("input-legacy-field');
    expect(input).toHaveValue('Controlled text');

    // Update value
    rerender(<InputFieldLegacy value="Updated text&quot; />);
    expect(input).toHaveValue("Updated text');
  });

  // Event handling tests
  it('calls onChange when input changes', () => {
    const handleChange = jest.fn();
    render(<InputFieldLegacy onChange={handleChange} />);

    const input = screen.getByTestId('input-legacy-field');
    fireEvent.change(input, { target: { value: 'New text' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('New text');
  });

  it('calls onBlur when input loses focus', () => {
    const handleBlur = jest.fn();
    render(<InputFieldLegacy onBlur={handleBlur} />);

    const input = screen.getByTestId('input-legacy-field');
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('calls onFocus when input gains focus', () => {
    const handleFocus = jest.fn();
    render(<InputFieldLegacy onFocus={handleFocus} />);

    const input = screen.getByTestId('input-legacy-field');
    fireEvent.focus(input);

    expect(handleFocus).toHaveBeenCalledTimes(1);
  });
});
