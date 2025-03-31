/**
 * Select Tests
 * 
 * Tests for the Select component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Select from '../Select';

// Sample options for testing
const sampleOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders with default props and options', () => {
      render(<Select options={sampleOptions} />);
      expect(screen.getByTestId('tap-select')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      
      // Check if options are rendered
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('Option 1');
    });

    it('renders with a label', () => {
      render(<Select options={sampleOptions} label="Select an option" id="select-test" />);
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('renders with a required indicator when required', () => {
      render(<Select options={sampleOptions} label="Select an option" id="select-test" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Select options={sampleOptions} placeholder="Choose an option" />);
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4); // 3 options + placeholder
      expect(options[0]).toHaveTextContent('Choose an option');
      expect(options[0]).toBeDisabled();
    });

    it('renders with helper text', () => {
      render(<Select options={sampleOptions} helperText="Helper text" id="test" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Select options={sampleOptions} error="Error message" id="test" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders as disabled', () => {
      render(<Select options={sampleOptions} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
      expect(screen.getByTestId('tap-select').classList.contains('tap-select--disabled')).toBe(true);
    });

    it('renders options with disabled state', () => {
      render(<Select options={sampleOptions} />);
      const options = screen.getAllByRole('option');
      expect(options[2]).toBeDisabled();
    });

    it('renders with different variants', () => {
      render(<Select options={sampleOptions} variant="filled" />);
      expect(screen.getByTestId('tap-select').classList.contains('tap-select--filled')).toBe(true);
    });

    it('renders with different sizes', () => {
      render(<Select options={sampleOptions} size="large" />);
      expect(screen.getByTestId('tap-select').classList.contains('tap-select--large')).toBe(true);
    });

    it('renders as full width', () => {
      render(<Select options={sampleOptions} fullWidth />);
      expect(screen.getByTestId('tap-select').classList.contains('tap-select--fullwidth')).toBe(true);
    });

    it('renders with custom className', () => {
      render(<Select options={sampleOptions} className="custom-class" />);
      expect(screen.getByTestId('tap-select').classList.contains('custom-class')).toBe(true);
    });
  });

  // Controlled vs Uncontrolled tests
  describe('controlled and uncontrolled behavior', () => {
    it('works as a controlled component', () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <Select 
          options={sampleOptions} 
          value="option1" 
          onChange={handleChange} 
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select.value).toBe('option1');
      
      // Attempt to change the value
      fireEvent.change(select, { target: { value: 'option2' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
      
      // Value shouldn't change without prop update
      expect(select.value).toBe('option1');
      
      // Update prop to simulate controlled behavior
      rerender(
        <Select 
          options={sampleOptions} 
          value="option2" 
          onChange={handleChange} 
        />
      );
      expect(select.value).toBe('option2');
    });

    it('works as an uncontrolled component', () => {
      const handleChange = jest.fn();
      render(
        <Select 
          options={sampleOptions} 
          defaultValue="option1" 
          onChange={handleChange} 
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select.value).toBe('option1');
      
      // Change the value
      fireEvent.change(select, { target: { value: 'option2' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
      
      // Value should update in uncontrolled mode
      expect(select.value).toBe('option2');
    });
  });

  // Event handler tests
  describe('event handlers', () => {
    it('calls onChange handler when value changes', () => {
      const handleChange = jest.fn();
      render(
        <Select 
          options={sampleOptions} 
          onChange={handleChange} 
        />
      );
      
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler when select is focused', () => {
      const handleFocus = jest.fn();
      render(
        <Select 
          options={sampleOptions} 
          onFocus={handleFocus} 
        />
      );
      
      fireEvent.focus(screen.getByRole('combobox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur handler when select loses focus', () => {
      const handleBlur = jest.fn();
      render(
        <Select 
          options={sampleOptions} 
          onBlur={handleBlur} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.focus(select);
      fireEvent.blur(select);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('does not call onChange when disabled', () => {
      const handleChange = jest.fn();
      render(
        <Select 
          options={sampleOptions} 
          disabled 
          onChange={handleChange} 
        />
      );
      
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } });
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not call onChange when readOnly', () => {
      const handleChange = jest.fn();
      render(
        <Select 
          options={sampleOptions} 
          readOnly 
          onChange={handleChange} 
        />
      );
      
      // Even though the DOM doesn't have a readOnly attribute for select elements,
      // we should still honor the prop in our component
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } });
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('links label to select via id', () => {
      render(
        <Select 
          options={sampleOptions} 
          label="Select an option" 
          id="options-select" 
        />
      );
      
      const label = screen.getByText('Select an option');
      expect(label).toHaveAttribute('for', 'options-select');
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'options-select');
    });

    it('sets aria-invalid when there is an error', () => {
      render(
        <Select 
          options={sampleOptions} 
          error="Error message" 
        />
      );
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for helper text', () => {
      render(
        <Select 
          options={sampleOptions} 
          helperText="Helper text" 
          id="test-select" 
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-helper-text');
      expect(screen.getByText('Helper text')).toHaveAttribute('id', 'test-select-helper-text');
    });

    it('generates a unique id if not provided', () => {
      render(
        <Select 
          options={sampleOptions} 
          label="Select an option" 
        />
      );
      
      const label = screen.getByText('Select an option');
      const forAttribute = label.getAttribute('for');
      expect(forAttribute).toMatch(/select-[a-z0-9]+/);
      expect(screen.getByRole('combobox')).toHaveAttribute('id', forAttribute);
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM select', () => {
      const ref = React.createRef();
      render(
        <Select 
          options={sampleOptions} 
          ref={ref} 
        />
      );
      
      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });
  });
});