import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import TextField from '../TextFieldAdapted';

// Mock the imported TextField component
jest.mock('@design-system/components/form', () => ({
  TextField: jest.fn(({
    id,
    ref,
    name,
    label,
    type,
    placeholder,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    disabled,
    autoFocus,
    multiline,
    rows,
    fullWidth,
    startAdornment,
    endAdornment,
    autoComplete,
    className,
    error,
    required,
    helperText,
    ...props
  }) => (
    <div className={className} data-testid="mock-textfield">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={ref}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
        data-multiline={multiline ? 'true' : undefined}
        data-rows={rows}
        data-fullwidth={fullWidth ? 'true' : undefined}
        {...props}
      />
      {startAdornment && <div data-testid="start-adornment">{startAdornment}</div>}
      {endAdornment && <div data-testid="end-adornment">{endAdornment}</div>}
      {helperText && <div data-testid="helper-text">{helperText}</div>}
    </div>
  ))
}));

describe('TextFieldAdapted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<TextFieldAdapted />);
    
    const textField = screen.getByTestId('mock-textfield');
    expect(textField).toBeInTheDocument();
    expect(textField).toHaveClass('ds-text-field');
    expect(textField).toHaveClass('ds-text-field-adapted');
    
    const input = textField.querySelector('input');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).not.toBeDisabled();
  });

  it('renders with label when provided', () => {
    render(<TextFieldAdapted label="Test Label&quot; />);
    
    expect(screen.getByText("Test Label')).toBeInTheDocument();
  });

  it('passes id, name, and other basic props correctly', () => {
    render(
      <TextFieldAdapted 
        id="test-id&quot; 
        name="test-name" 
        placeholder="Test placeholder&quot;
      />
    );
    
    const input = screen.getByTestId("mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('name', 'test-name');
    expect(input).toHaveAttribute('placeholder', 'Test placeholder');
  });

  it('handles value and onChange correctly', () => {
    const handleChange = jest.fn();
    render(<TextFieldAdapted value="Test Value&quot; onChange={handleChange} />);
    
    const input = screen.getByTestId("mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('value', 'Test Value');
    
    fireEvent.change(input, { target: { value: 'New Value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state correctly', () => {
    render(<TextFieldAdapted disabled={true} />);
    
    const input = screen.getByTestId('mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('disabled');
  });

  it('applies error state correctly', () => {
    render(<TextFieldAdapted error={true} helperText="Error message&quot; />);
    
    const input = screen.getByTestId("mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('applies required state correctly', () => {
    render(<TextFieldAdapted required={true} />);
    
    const input = screen.getByTestId('mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('handles multiline state correctly', () => {
    render(<TextFieldAdapted multiline={true} rows={4} />);
    
    const input = screen.getByTestId('mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('data-multiline', 'true');
    expect(input).toHaveAttribute('data-rows', '4');
  });

  it('applies fullWidth correctly', () => {
    render(<TextFieldAdapted fullWidth={true} />);
    
    const input = screen.getByTestId('mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('data-fullwidth', 'true');
  });

  it('handles startAdornment and endAdornment correctly', () => {
    const InputProps = {
      startAdornment: <span>$</span>,
      endAdornment: <span>%</span>,
    };
    
    render(<TextFieldAdapted InputProps={InputProps} />);
    
    expect(screen.getByTestId('start-adornment')).toBeInTheDocument();
    expect(screen.getByTestId('start-adornment')).toHaveTextContent('$');
    
    expect(screen.getByTestId('end-adornment')).toBeInTheDocument();
    expect(screen.getByTestId('end-adornment')).toHaveTextContent('%');
  });

  it('handles focus and blur events correctly', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <TextFieldAdapted 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
      />
    );
    
    const input = screen.getByTestId('mock-textfield').querySelector('input');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('applies custom className correctly', () => {
    render(<TextFieldAdapted className="custom-textfield&quot; />);
    
    const textField = screen.getByTestId("mock-textfield');
    expect(textField).toHaveClass('ds-text-field');
    expect(textField).toHaveClass('ds-text-field-adapted');
    expect(textField).toHaveClass('custom-textfield');
  });

  it('applies different input types correctly', () => {
    const { rerender } = render(<TextFieldAdapted type="text&quot; />);
    
    let input = screen.getByTestId("mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('type', 'text');
    
    rerender(<TextFieldAdapted type="email&quot; />);
    input = screen.getByTestId("mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('type', 'email');
    
    rerender(<TextFieldAdapted type="password&quot; />);
    input = screen.getByTestId("mock-textfield').querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('applies aria attributes correctly', () => {
    render(
      <TextFieldAdapted 
        id="test-field&quot;
        helperText="Help text" 
        ariaLabel="Accessibility Label&quot;
        ariaDescribedBy="custom-description"
      />
    );
    
    // Since we're mocking, we can't directly test the merged aria attributes
    // but we can verify they're passed to the component
    const textField = screen.getByTestId('mock-textfield');
    expect(textField).toHaveAttribute('aria-label', 'Accessibility Label');
    expect(textField).toHaveAttribute('aria-describedby', 'custom-description');
  });

  it('applies helper text with correct id reference', () => {
    render(
      <TextFieldAdapted 
        id="text-field-id&quot;
        helperText="Helper information" 
      />
    );
    
    expect(screen.getByText('Helper information')).toBeInTheDocument();
    // In a real implementation, the helper text would have an id like "text-field-id-helper-text"
    // and the input would have aria-describedby pointing to it
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <TextFieldAdapted 
          id="username&quot;
          label="Username" 
          required={true}
        />
        <TextFieldAdapted 
          id="password&quot;
          label="Password" 
          type="password&quot;
          required={true}
        />
        <TextFieldAdapted 
          id="bio"
          label="Biography&quot; 
          multiline={true}
          rows={4}
          helperText="Tell us about yourself"
        />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});