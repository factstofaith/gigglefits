/**
 * Checkbox Tests
 * 
 * Tests for the Checkbox component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Checkbox />);
      expect(screen.getByTestId('tap-checkbox')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders with a label', () => {
      render(<Checkbox label="Accept terms" id="terms" />);
      expect(screen.getByText('Accept terms')).toBeInTheDocument();
    });

    it('renders with a required indicator when required', () => {
      render(<Checkbox label="Accept terms" id="terms" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Checkbox helperText="Helper text" id="test" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Checkbox error="Error message" id="test" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders as disabled', () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
      expect(screen.getByTestId('tap-checkbox').classList.contains('tap-checkbox--disabled')).toBe(true);
    });

    it('renders with different sizes', () => {
      render(<Checkbox size="large" />);
      expect(screen.getByTestId('tap-checkbox').classList.contains('tap-checkbox--large')).toBe(true);
    });

    it('renders with label at start when labelPlacement is start', () => {
      render(<Checkbox label="Label at start" labelPlacement="start" />);
      // We can't easily test the exact style here, but we can verify the prop is reflected in the DOM
      const checkboxWrapper = screen.getByTestId('tap-checkbox');
      expect(checkboxWrapper.style.flexDirection).toBe('row-reverse');
    });

    it('renders with custom className', () => {
      render(<Checkbox className="custom-class" />);
      // The class is applied to the wrapper element
      expect(screen.getByTestId('tap-checkbox').parentElement.classList.contains('custom-class')).toBe(true);
    });
  });

  // Controlled vs Uncontrolled tests
  describe('controlled and uncontrolled behavior', () => {
    it('works as a controlled component', () => {
      const handleChange = jest.fn();
      const { rerender } = render(<Checkbox checked={false} onChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.checked).toBe(false);
      
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
      
      // Value shouldn't change without prop update
      expect(checkbox.checked).toBe(false);
      
      // Update prop to simulate controlled behavior
      rerender(<Checkbox checked={true} onChange={handleChange} />);
      expect(checkbox.checked).toBe(true);
    });

    it('works as an uncontrolled component', () => {
      const handleChange = jest.fn();
      render(<Checkbox defaultChecked={false} onChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.checked).toBe(false);
      
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
      
      // Value should update in uncontrolled mode
      expect(checkbox.checked).toBe(true);
    });

    it('renders checked state correctly', () => {
      render(<Checkbox checked={true} />);
      
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.getByTestId('checkbox-checked-icon')).toBeInTheDocument();
    });

    it('renders indeterminate state correctly', () => {
      render(<Checkbox indeterminate />);
      
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
      expect(screen.getByRole('checkbox')).toHaveAttribute('data-indeterminate', 'true');
      expect(screen.getByTestId('checkbox-indeterminate-icon')).toBeInTheDocument();
    });
  });

  // Event handler tests
  describe('event handlers', () => {
    it('calls onChange handler when clicked', () => {
      const handleChange = jest.fn();
      render(<Checkbox onChange={handleChange} />);
      
      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('does not call onChange when disabled', () => {
      const handleChange = jest.fn();
      render(<Checkbox disabled onChange={handleChange} />);
      
      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('links label to checkbox via id', () => {
      render(<Checkbox label="Accept terms" id="terms-checkbox" />);
      
      const label = screen.getByText('Accept terms');
      expect(label).toHaveAttribute('for', 'terms-checkbox');
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'terms-checkbox');
    });

    it('generates a unique id if not provided', () => {
      render(<Checkbox label="Accept terms" />);
      
      const label = screen.getByText('Accept terms');
      const forAttribute = label.getAttribute('for');
      expect(forAttribute).toMatch(/checkbox-[a-z0-9]+/);
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', forAttribute);
    });

    it('sets aria-invalid when there is an error', () => {
      render(<Checkbox error="Error message" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for helper text', () => {
      render(<Checkbox helperText="Helper text" id="test-checkbox" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'test-checkbox-helper-text');
      expect(screen.getByText('Helper text')).toHaveAttribute('id', 'test-checkbox-helper-text');
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM input', () => {
      const ref = React.createRef();
      render(<Checkbox ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});