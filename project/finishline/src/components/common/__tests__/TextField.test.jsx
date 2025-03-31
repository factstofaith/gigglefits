/**
 * TextField Tests
 * 
 * Tests for the TextField component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextField from '../TextField';

describe('TextField', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<TextField />);
      expect(screen.getByTestId('tap-textfield')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with a label', () => {
      render(<TextField label="Name" id="name" />);
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('renders with a required indicator when required', () => {
      render(<TextField label="Name" id="name" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with placeholder text', () => {
      render(<TextField placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<TextField helperText="Helper text" id="test" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<TextField error="Error message" id="test" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders as disabled', () => {
      render(<TextField disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(screen.getByTestId('tap-textfield').classList.contains('tap-textfield--disabled')).toBe(true);
    });

    it('renders as readonly', () => {
      render(<TextField readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('renders with different types', () => {
      render(<TextField type="password" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
    });

    it('renders with different variants', () => {
      render(<TextField variant="filled" />);
      expect(screen.getByTestId('tap-textfield').classList.contains('tap-textfield--filled')).toBe(true);
    });

    it('renders with different sizes', () => {
      render(<TextField size="large" />);
      expect(screen.getByTestId('tap-textfield').classList.contains('tap-textfield--large')).toBe(true);
    });

    it('renders as full width', () => {
      render(<TextField fullWidth />);
      expect(screen.getByTestId('tap-textfield').classList.contains('tap-textfield--fullwidth')).toBe(true);
    });

    it('renders with custom className', () => {
      render(<TextField className="custom-class" />);
      expect(screen.getByTestId('tap-textfield').classList.contains('custom-class')).toBe(true);
    });
  });

  // Controlled vs Uncontrolled tests
  describe('controlled and uncontrolled behavior', () => {
    it('works as a controlled component', () => {
      const handleChange = jest.fn();
      const { rerender } = render(<TextField value="test" onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      expect(input.value).toBe('test');
      
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
      
      // Value shouldn't change without prop update
      expect(input.value).toBe('test');
      
      // Update prop to simulate controlled behavior
      rerender(<TextField value="new value" onChange={handleChange} />);
      expect(input.value).toBe('new value');
    });

    it('works as an uncontrolled component', () => {
      const handleChange = jest.fn();
      render(<TextField defaultValue="test" onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      expect(input.value).toBe('test');
      
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
      
      // Value should update in uncontrolled mode
      expect(input.value).toBe('new value');
    });
  });

  // Event handler tests
  describe('event handlers', () => {
    it('calls onChange handler when value changes', () => {
      const handleChange = jest.fn();
      render(<TextField onChange={handleChange} />);
      
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler when input is focused', () => {
      const handleFocus = jest.fn();
      render(<TextField onFocus={handleFocus} />);
      
      fireEvent.focus(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur handler when input loses focus', () => {
      const handleBlur = jest.fn();
      render(<TextField onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('does not call onChange when disabled', () => {
      const handleChange = jest.fn();
      render(<TextField disabled onChange={handleChange} />);
      
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not call onChange when readOnly', () => {
      const handleChange = jest.fn();
      render(<TextField readOnly onChange={handleChange} />);
      
      // We should still be able to try to change the value
      // but the handler won't be called for a read-only field
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('links label to input via id', () => {
      render(<TextField label="Name" id="name-input" />);
      
      const label = screen.getByText('Name');
      expect(label).toHaveAttribute('for', 'name-input');
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'name-input');
    });

    it('sets aria-invalid when there is an error', () => {
      render(<TextField error="Error message" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for helper text', () => {
      render(<TextField helperText="Helper text" id="test-input" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper-text');
      expect(screen.getByText('Helper text')).toHaveAttribute('id', 'test-input-helper-text');
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM input', () => {
      const ref = React.createRef();
      render(<TextField ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});