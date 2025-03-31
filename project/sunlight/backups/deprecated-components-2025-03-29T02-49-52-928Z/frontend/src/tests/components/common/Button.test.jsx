import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { setupUserEvent } from '../../utils/user-event-setup';
import { testA11y } from '../../utils/a11y-utils';
import Button from '@components/common/Button';

describe('Button', () => {
  // Test basic rendering
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  // Test user interactions
  it('handles click events', async () => {
    const user = setupUserEvent();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    // Interact with the component
    await user.click(screen.getByRole('button', { name: /click me/i }));
    
    // Assert the result
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test different props
  it('supports different sizes', () => {
    const { rerender } = render(<Button size="small&quot;>Small Button</Button>);
    
    // Get button element
    const button = screen.getByRole("button', { name: /small button/i });
    
    // Assert small size styles are applied (checking style properties)
    expect(button).toHaveStyle('font-size: 0.875rem');
    
    // Rerender with different props
    rerender(<Button size="large&quot;>Large Button</Button>);
    
    // Assert large size styles are applied
    expect(screen.getByRole("button', { name: /large button/i })).toHaveStyle('font-size: 1.125rem');
  });

  // Test disabled state
  it('handles disabled state', async () => {
    const user = setupUserEvent();
    const handleClick = jest.fn();
    
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    
    // Get button element
    const button = screen.getByRole('button', { name: /disabled button/i });
    
    // Assert disabled attribute is applied
    expect(button).toBeDisabled();
    
    // Try to click the button
    await user.click(button);
    
    // Assert the click handler was not called
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test fullWidth prop
  it('supports fullWidth prop', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    
    // Assert fullWidth styles are applied
    expect(screen.getByRole('button', { name: /full width button/i })).toHaveStyle({
      display: 'block',
      width: '100%'
    });
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    await testA11y(<Button>Accessible Button</Button>);
    
    // Test button with aria attributes
    await testA11y(
      <Button
        ariaLabel="Custom label&quot;
        ariaControls="test-panel"
        ariaExpanded={true}
      >
        Accessible Button with ARIA
      </Button>
    );
  });
});