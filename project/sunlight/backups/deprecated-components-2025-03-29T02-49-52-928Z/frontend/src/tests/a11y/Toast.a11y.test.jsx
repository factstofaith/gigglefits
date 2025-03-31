import React from 'react';
import { render, screen } from '../utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import Toast from '@components/common/Toast';

// Mock the design system components
jest.mock('../../design-system/components/layout', () => ({
  Box: ({ children, as, style, ...props }) => {
    const Component = as || 'div';
    return <Component data-testid="mock-box" style={style} {...props}>{children}</Component>;
  },
}));

jest.mock('../../design-system/components/core', () => ({
  Typography: ({ children, as, variant, style }) => {
    const Component = as || 'span';
    return <Component data-testid={`mock-typography-${variant}`} style={style}>{children}</Component>;
  },
}));

jest.mock('../../design-system/components/feedback', () => ({
  Toast: ({ 
    ref,
    open, 
    autoHideDuration, 
    onClose, 
    severity, 
    message, 
    action,
    position,
    style
  }) => (
    <div 
      ref={ref}
      role="alert&quot;
      aria-live="assertive"
      data-testid="mock-toast"
      data-severity={severity}
      data-position={position}
      style={style}
    >
      <div data-testid="toast-message">{message}</div>
      <div data-testid="toast-action">{action}</div>
    </div>
  ),
}));

jest.mock('../../design-system/foundations/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        success: { main: '#4caf50' },
        error: { main: '#f44336' },
        warning: { main: '#ff9800' },
        info: { main: '#2196f3' },
      },
      shadows: {
        md: '0px 3px 5px rgba(0, 0, 0, 0.2)',
      },
    }
  }),
}));

// Mock the MUI icons
jest.mock('@mui/icons-material', () => ({
  Close: () => <span data-testid="close-icon">✕</span>,
  CheckCircleOutline: () => <span data-testid="success-icon">✓</span>,
  ErrorOutline: () => <span data-testid="error-icon">✗</span>,
  WarningAmber: () => <span data-testid="warning-icon">⚠</span>,
  Info: () => <span data-testid="info-icon">ℹ</span>,
}));

// Extend expect with jest-axe
expect.extend(toHaveNoViolations);

describe('Toast Accessibility', () => {
  it('should have no accessibility violations with basic props', async () => {
    const { container } = render(
      <Toast
        open={true}
        onClose={() => {}}
        message="This is a toast message&quot;
        type="info"
      />
    );
    
    // Run axe
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with title', async () => {
    const { container } = render(
      <Toast
        open={true}
        onClose={() => {}}
        message="This is a toast message&quot;
        title="Toast Title"
        type="success&quot;
      />
    );
    
    // Run axe
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations with custom action', async () => {
    const { container } = render(
      <Toast
        open={true}
        onClose={() => {}}
        message="This is a toast message&quot;
        type="error"
        action={<button>Retry</button>}
      />
    );
    
    // Run axe
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should render with proper ARIA attributes', () => {
    render(
      <Toast
        open={true}
        onClose={() => {}}
        message="This is a toast message&quot;
        type="warning"
      />
    );
    
    // Check for proper ARIA attributes
    const toast = screen.getByTestId('mock-toast');
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  it('should have close button with accessible label', () => {
    render(
      <Toast
        open={true}
        onClose={() => {}}
        message="This is a toast message&quot;
      />
    );
    
    // Check for labeled close button
    const closeButton = screen.getByLabelText("Close toast');
    expect(closeButton).toBeInTheDocument();
  });

  it('should render appropriate icon based on type for screen readers', () => {
    const { rerender } = render(
      <Toast
        open={true}
        onClose={() => {}}
        message="Success message&quot;
        type="success"
      />
    );
    
    // Check success icon
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    
    // Test other types
    rerender(
      <Toast
        open={true}
        onClose={() => {}}
        message="Error message&quot;
        type="error"
      />
    );
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    
    rerender(
      <Toast
        open={true}
        onClose={() => {}}
        message="Warning message&quot;
        type="warning"
      />
    );
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    
    rerender(
      <Toast
        open={true}
        onClose={() => {}}
        message="Info message&quot;
        type="info"
      />
    );
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('should handle screen reader text appropriately', async () => {
    const { container } = render(
      <Toast
        open={true}
        onClose={() => {}}
        message="This is important information&quot;
        title="Critical Update"
        type="error&quot;
      />
    );
    
    // Message should be visible
    expect(screen.getByText("This is important information')).toBeInTheDocument();
    expect(screen.getByText('Critical Update')).toBeInTheDocument();
    
    // Run axe to check for screen reader accessibility
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Additional test to check focus management
  it('should have proper focus management', () => {
    const handleClose = jest.fn();
    render(
      <Toast
        open={true}
        onClose={handleClose}
        message="This message requires action&quot;
        type="warning"
        action={<button data-testid="action-button">Take Action</button>}
      />
    );
    
    // Both action and close buttons should be in the document and focusable
    const actionButton = screen.getByTestId('action-button');
    const closeButton = screen.getByLabelText('Close toast');
    
    expect(actionButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    
    // Both buttons should be focusable elements
    expect(actionButton.tagName).toBe('BUTTON');
    expect(closeButton.tagName).toBe('BUTTON');
  });
});