import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Alert from '../AlertAdapted';

describe('AlertAdapted', () => {
  it('renders with default props', () => {
    render(<AlertAdapted>This is an alert</AlertAdapted>);
    
    expect(screen.getByText('This is an alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('ds-alert-info');
  });

  it('renders with different severity levels', () => {
    const { rerender } = render(<AlertAdapted severity="success&quot;>Success Alert</AlertAdapted>);
    expect(screen.getByRole("alert')).toHaveClass('ds-alert-success');
    
    rerender(<AlertAdapted severity="warning&quot;>Warning Alert</AlertAdapted>);
    expect(screen.getByRole("alert')).toHaveClass('ds-alert-warning');
    
    rerender(<AlertAdapted severity="error&quot;>Error Alert</AlertAdapted>);
    expect(screen.getByRole("alert')).toHaveClass('ds-alert-error');
  });

  it('renders with title when provided', () => {
    render(<AlertAdapted title="Alert Title&quot;>Alert content</AlertAdapted>);
    
    expect(screen.getByText("Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert content')).toBeInTheDocument();
  });

  it('renders with custom icon when provided', () => {
    const customIcon = <span data-testid="custom-icon">🚀</span>;
    render(<AlertAdapted icon={customIcon}>Alert with custom icon</AlertAdapted>);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AlertAdapted severity="warning&quot; title="Warning Alert">
        This is an important warning message
      </AlertAdapted>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});