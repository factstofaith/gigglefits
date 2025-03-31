import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Link from '../LinkAdapted';

describe('LinkAdapted', () => {
  // Mock window.trackEvent for analytics testing
  beforeEach(() => {
    window.trackEvent = jest.fn();
  });

  afterEach(() => {
    delete window.trackEvent;
  });

  it('renders with default props', () => {
    render(<LinkAdapted href="/home&quot;>Home Link</LinkAdapted>);
    
    const link = screen.getByText("Home Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveClass('ds-link');
    expect(link).toHaveClass('ds-link-adapted');
  });

  it('renders with different colors', () => {
    const { rerender } = render(<LinkAdapted href="/test&quot; color="primary">Primary Link</LinkAdapted>);
    expect(screen.getByText('Primary Link')).toHaveStyle({ color: '#1976d2' });
    
    rerender(<LinkAdapted href="/test&quot; color="secondary">Secondary Link</LinkAdapted>);
    expect(screen.getByText('Secondary Link')).toHaveStyle({ color: '#9c27b0' });
    
    rerender(<LinkAdapted href="/test&quot; color="error">Error Link</LinkAdapted>);
    expect(screen.getByText('Error Link')).toHaveStyle({ color: '#d32f2f' });
  });

  it('renders with different underline options', () => {
    const { rerender } = render(<LinkAdapted href="/test&quot; underline="always">Always Underline</LinkAdapted>);
    expect(screen.getByText('Always Underline')).toHaveStyle({ textDecoration: 'underline' });
    
    rerender(<LinkAdapted href="/test&quot; underline="none">No Underline</LinkAdapted>);
    expect(screen.getByText('No Underline')).toHaveStyle({ textDecoration: 'none' });
    
    rerender(<LinkAdapted href="/test&quot; underline="hover">Hover Underline</LinkAdapted>);
    expect(screen.getByText('Hover Underline')).toHaveStyle({ textDecoration: 'none' });
    // Hover styling would be tested in integration tests
  });

  it('adds security attributes for external links', () => {
    render(<LinkAdapted href="https://example.com&quot; target="_blank">External Link</LinkAdapted>);
    
    const link = screen.getByText('External Link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses provided rel attribute when target is _blank', () => {
    render(
      <LinkAdapted 
        href="https://example.com&quot; 
        target="_blank" 
        rel="noopener noreferrer sponsored&quot;
      >
        Sponsored Link
      </LinkAdapted>
    );
    
    const link = screen.getByText("Sponsored Link');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<LinkAdapted href="/click-test&quot; onClick={handleClick}>Click Me</LinkAdapted>);
    
    fireEvent.click(screen.getByText("Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('tracks link clicks when analytics is available', () => {
    render(<LinkAdapted href="/analytics-test&quot;>Analytics Link</LinkAdapted>);
    
    fireEvent.click(screen.getByText("Analytics Link'));
    expect(window.trackEvent).toHaveBeenCalledWith('Link Click', {
      href: '/analytics-test',
      text: 'Analytics Link',
      target: undefined
    });
  });

  it('applies accessibility attributes correctly', () => {
    render(
      <LinkAdapted 
        href="/a11y-test&quot;
        ariaLabel="Test link"
        ariaDescribedBy="desc-id&quot;
        ariaControls="panel-id"
        ariaExpanded={true}
      >
        Accessible Link
      </LinkAdapted>
    );
    
    const link = screen.getByText('Accessible Link');
    expect(link).toHaveAttribute('aria-label', 'Test link');
    expect(link).toHaveAttribute('aria-describedby', 'desc-id');
    expect(link).toHaveAttribute('aria-controls', 'panel-id');
    expect(link).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies variant styles correctly', () => {
    render(<LinkAdapted href="/variant-test&quot; variant="button">Button Link</LinkAdapted>);
    
    expect(screen.getByText('Button Link')).toHaveStyle({ fontWeight: 500 });
  });

  it('accepts custom className', () => {
    render(<LinkAdapted href="/class-test&quot; className="custom-link">Custom Class</LinkAdapted>);
    
    const link = screen.getByText('Custom Class');
    expect(link).toHaveClass('ds-link');
    expect(link).toHaveClass('ds-link-adapted');
    expect(link).toHaveClass('custom-link');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <LinkAdapted href="/a11y-test&quot; ariaLabel="Accessibility test link">
          Accessible Link
        </LinkAdapted>
        <LinkAdapted href="https://example.com&quot; target="_blank">
          External Link with proper security
        </LinkAdapted>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});