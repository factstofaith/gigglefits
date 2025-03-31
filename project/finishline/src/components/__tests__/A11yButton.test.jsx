/**
 * A11yButton component test
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import A11yButton from '../common/A11yButton';

describe('A11yButton', () => {
  it('renders button with correct text', () => {
    render(<A11yButton>Test Button</A11yButton>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('handles clicks', () => {
    const handleClick = jest.fn();
    render(<A11yButton onClick={handleClick}>Click Me</A11yButton>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = jest.fn();
    render(<A11yButton onClick={handleClick} disabled>Disabled Button</A11yButton>);
    
    // With the real component, we need to use the right selector
    const button = screen.getByText('Disabled Button').closest('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  it('renders different variants', () => {
    const { rerender } = render(<A11yButton variant="contained">Contained</A11yButton>);
    expect(screen.getByText('Contained')).toBeInTheDocument();
    
    rerender(<A11yButton variant="outlined">Outlined</A11yButton>);
    expect(screen.getByText('Outlined')).toBeInTheDocument();
    
    rerender(<A11yButton variant="text">Text</A11yButton>);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
  
  it('renders different sizes', () => {
    const { rerender } = render(<A11yButton size="small">Small</A11yButton>);
    expect(screen.getByText('Small')).toBeInTheDocument();
    
    rerender(<A11yButton size="medium">Medium</A11yButton>);
    expect(screen.getByText('Medium')).toBeInTheDocument();
    
    rerender(<A11yButton size="large">Large</A11yButton>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });
  
  it('renders as a link when href is provided', () => {
    render(<A11yButton href="https://example.com">Link Button</A11yButton>);
    const linkButton = screen.getByText('Link Button').closest('a');
    expect(linkButton).toHaveAttribute('href', 'https://example.com');
  });
});