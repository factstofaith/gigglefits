import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Checkbox from '../CheckboxAdapted';

describe('CheckboxAdapted', () => {
  it('renders with default props', () => {
    render(<CheckboxAdapted />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBeDisabled();
    expect(checkbox).not.toHaveAttribute('required');
  });

  it('renders with label when provided', () => {
    render(<CheckboxAdapted label="Test Checkbox&quot; />);
    
    expect(screen.getByText("Test Checkbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Checkbox')).toBeInTheDocument();
  });

  it('handles checked state correctly', () => {
    render(<CheckboxAdapted checked={true} label="Checked Checkbox&quot; />);
    
    const checkbox = screen.getByLabelText("Checked Checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles indeterminate state correctly', () => {
    const { container } = render(<CheckboxAdapted indeterminate={true} label="Indeterminate Checkbox&quot; />);
    
    const checkbox = screen.getByLabelText("Indeterminate Checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    
    // Verify the visual representation of indeterminate state
    // Look for the horizontal line SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg.querySelector('path')).toHaveAttribute('d', 'M5 12H19');
  });

  it('handles disabled state correctly', () => {
    render(<CheckboxAdapted disabled={true} label="Disabled Checkbox&quot; />);
    
    const checkbox = screen.getByLabelText("Disabled Checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('calls onChange when clicked', () => {
    const handleChange = jest.fn();
    render(<CheckboxAdapted onChange={handleChange} label="Click Me&quot; />);
    
    fireEvent.click(screen.getByLabelText("Click Me'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    
    // The second argument should be the new checked state (true)
    expect(handleChange.mock.calls[0][1]).toBe(true);
  });

  it('does not call onChange when disabled', () => {
    const handleChange = jest.fn();
    render(<CheckboxAdapted onChange={handleChange} disabled={true} label="Disabled&quot; />);
    
    fireEvent.click(screen.getByLabelText("Disabled'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies different colors correctly', () => {
    const { rerender, container } = render(<CheckboxAdapted checked={true} color="primary&quot; />);
    
    // We can"t directly test the computed style, so we check the inline styles
    let visual = container.querySelector('.ds-checkbox-visual');
    expect(visual).toHaveStyle('border: 2px solid #1976d2');
    expect(visual).toHaveStyle('background-color: #1976d2');
    
    rerender(<CheckboxAdapted checked={true} color="secondary&quot; />);
    visual = container.querySelector(".ds-checkbox-visual');
    expect(visual).toHaveStyle('border: 2px solid #9c27b0');
    expect(visual).toHaveStyle('background-color: #9c27b0');
    
    rerender(<CheckboxAdapted checked={true} color="error&quot; />);
    visual = container.querySelector(".ds-checkbox-visual');
    expect(visual).toHaveStyle('border: 2px solid #d32f2f');
    expect(visual).toHaveStyle('background-color: #d32f2f');
  });

  it('applies different sizes correctly', () => {
    const { rerender, container } = render(<CheckboxAdapted size="small&quot; />);
    
    // Check that the small size is applied
    let visual = container.querySelector(".ds-checkbox-visual');
    expect(visual).toHaveStyle('width: 16px');
    expect(visual).toHaveStyle('height: 16px');
    
    rerender(<CheckboxAdapted size="large&quot; />);
    visual = container.querySelector(".ds-checkbox-visual');
    expect(visual).toHaveStyle('width: 24px');
    expect(visual).toHaveStyle('height: 24px');
  });

  it('applies required attribute correctly', () => {
    render(<CheckboxAdapted required={true} label="Required Checkbox&quot; />);
    
    const checkbox = screen.getByLabelText("Required Checkbox');
    expect(checkbox).toHaveAttribute('required');
    expect(checkbox).toHaveAttribute('aria-required', 'true');
  });

  it('applies custom className correctly', () => {
    render(<CheckboxAdapted className="custom-checkbox&quot; label="Custom Class" />);
    
    const wrapper = screen.getByText('Custom Class').closest('label');
    expect(wrapper).toHaveClass('ds-checkbox');
    expect(wrapper).toHaveClass('custom-checkbox');
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <CheckboxAdapted 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        label="Focus Test&quot; 
      />
    );
    
    const checkbox = screen.getByLabelText("Focus Test');
    
    fireEvent.focus(checkbox);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(checkbox);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('handles id, name, and value props correctly', () => {
    render(
      <CheckboxAdapted 
        id="test-id&quot; 
        name="test-name" 
        value="test-value&quot;
        label="Props Test" 
      />
    );
    
    const checkbox = screen.getByLabelText('Props Test');
    expect(checkbox).toHaveAttribute('id', 'test-id');
    expect(checkbox).toHaveAttribute('name', 'test-name');
    expect(checkbox).toHaveAttribute('value', 'test-value');
  });

  it('applies aria attributes correctly', () => {
    render(
      <CheckboxAdapted 
        ariaLabel="Accessibility Checkbox&quot;
        ariaLabelledBy="external-label"
        label="Not used for aria-label&quot;
      />
    );
    
    const checkbox = screen.getByRole("checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Accessibility Checkbox');
    expect(checkbox).toHaveAttribute('aria-labelledby', 'external-label');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label id="checkbox-group&quot;>Preferences</label>
        <CheckboxAdapted 
          label="Email notifications" 
          ariaLabelledBy="checkbox-group&quot;
        />
        <CheckboxAdapted 
          label="SMS notifications" 
          ariaLabelledBy="checkbox-group&quot;
        />
        <CheckboxAdapted 
          label="Push notifications" 
          ariaLabelledBy="checkbox-group"
          indeterminate={true}
        />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});