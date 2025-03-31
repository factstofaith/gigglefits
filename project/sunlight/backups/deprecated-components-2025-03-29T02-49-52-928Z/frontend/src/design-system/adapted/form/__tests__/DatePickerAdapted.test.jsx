/**
 * DatePickerAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import DatePicker from '../DatePickerAdapted';

// Mock the design system DatePicker component
jest.mock('@design-system/components/form', () => ({
  DatePicker: jest.fn(({ 
    label, 
    placeholder, 
    value, 
    onChange, 
    disabled, 
    error, 
    errorText,
    helperText,
    children,
    minDate,
    maxDate,
    format,
    disablePast,
    disableFuture,
    'aria-label': ariaLabel,
    'aria-invalid': ariaInvalid,
    ...props 
  }) => (
    <div data-testid="mock-date-picker" role="textbox&quot;>
      <label>{label}</label>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value || ''} 
        onChange={onChange} 
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        data-min-date={minDate}
        data-max-date={maxDate}
        data-format={format}
        data-disable-past={disablePast}
        data-disable-future={disableFuture}
      />
      {error && <div data-testid="error-text">{errorText}</div>}
      {!error && helperText && <div data-testid="helper-text">{helperText}</div>}
      {children}
    </div>
  )),
}));

describe('DatePickerAdapted', () => {
  it('renders with basic props', () => {
    render(
      <DatePickerAdapted 
        label="Test Date&quot; 
        placeholder="Select date"
      />
    );

    expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();
    expect(screen.getByText('Test Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('renders with error state', () => {
    render(
      <DatePickerAdapted 
        label="Test Date&quot; 
        error={true}
        helperText="This is an error message"
      />
    );

    expect(screen.getByTestId('error-text')).toHaveTextContent('This is an error message');
  });

  it('renders with helper text', () => {
    render(
      <DatePickerAdapted 
        label="Test Date&quot; 
        helperText="This is helper text"
      />
    );

    expect(screen.getByTestId('helper-text')).toHaveTextContent('This is helper text');
  });

  it('handles disabled state', () => {
    render(
      <DatePickerAdapted 
        label="Test Date&quot; 
        disabled={true}
      />
    );

    const input = screen.getByRole("textbox').querySelector('input');
    expect(input).toBeDisabled();
  });

  it('passes date format correctly', () => {
    render(
      <DatePickerAdapted 
        label="Test Date&quot; 
        format="yyyy-MM-dd"
      />
    );

    const input = screen.getByRole('textbox').querySelector('input');
    expect(input).toHaveAttribute('data-format', 'yyyy-MM-dd');
  });

  it('passes min/max date constraints', () => {
    const minDate = new Date('2023-01-01');
    const maxDate = new Date('2023-12-31');
    
    render(
      <DatePickerAdapted 
        label="Test Date&quot;
        minDate={minDate}
        maxDate={maxDate}
      />
    );

    const input = screen.getByRole("textbox').querySelector('input');
    expect(input).toHaveAttribute('data-min-date');
    expect(input).toHaveAttribute('data-max-date');
  });

  it('passes date restrictions correctly', () => {
    render(
      <DatePickerAdapted 
        label="Test Date&quot;
        disablePast={true}
        disableFuture={false}
      />
    );

    const input = screen.getByRole("textbox').querySelector('input');
    expect(input).toHaveAttribute('data-disable-past', 'true');
    expect(input).toHaveAttribute('data-disable-future', 'false');
  });

  it('applies correct className', () => {
    render(
      <DatePickerAdapted 
        label="Test Date&quot;
        className="custom-class"
      />
    );

    expect(screen.getByTestId('mock-date-picker')).toHaveClass('ds-date-picker');
    expect(screen.getByTestId('mock-date-picker')).toHaveClass('ds-date-picker-adapted');
    expect(screen.getByTestId('mock-date-picker')).toHaveClass('custom-class');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <DatePickerAdapted
        id="date-test&quot;
        label="Test Date"
        helperText="Select a valid date"
      />
    );

    // Wait for any immediate effects or state updates to complete
    await new Promise(r => setTimeout(r, 0));

    // Run accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});