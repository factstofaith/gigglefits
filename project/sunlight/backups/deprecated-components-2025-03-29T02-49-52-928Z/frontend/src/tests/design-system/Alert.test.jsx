// src/tests/design-system/Alert.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { testA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Alert from '@design-system/components/feedback/Alert';

// Mock Box and Typography components
jest.mock('../../design-system/components/layout/Box', () => {
  return {
    __esModule: true,
    default: ({ children, role, className, ...props }) => (
      <div data-testid="mock-box" role={role} className={className} {...props}>
        {children}
      </div>
    ),
  };
});

jest.mock('../../design-system/components/core/Typography', () => {
  return {
    __esModule: true,
    default: ({ children, variant, component = 'div', ...props }) => {
      const Component = component;
      return (
        <Component data-testid="mock-typography" data-variant={variant} {...props}>
          {children}
        </Component>
      );
    },
  };
});

// Mock theme values
jest.mock('../../design-system/foundations/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        info: { main: '#0288d1', light: '#03a9f4' },
        success: { main: '#2e7d32', light: '#4caf50' },
        warning: { main: '#ed6c02', light: '#ff9800' },
        error: { main: '#d32f2f', light: '#ef5350' },
        common: { white: '#ffffff' },
        text: { primary: '#000000' },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
      },
      typography: {
        fontWeights: {
          medium: 500,
        },
      },
      borderRadius: {
        md: '4px',
      },
      shadows: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
      },
    },
  }),
}));

// Custom render with theme provider
const customRender = (ui, options = {}) => {
  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';

  // Added display name
  customRender.displayName = 'customRender';


  return render(ui, { wrapper: MockThemeProvider, ...options });
};

describe('Alert Component', () => {
  it('renders correctly with default props', () => {
    customRender(<Alert>This is an alert</Alert>);
    
    // Alert should be in the document with role="alert&quot;
    const alert = screen.getByRole("alert');
    expect(alert).toBeInTheDocument();
    
    // Should have default severity class
    expect(alert).toHaveClass('tap-alert-info');
    
    // Should have default variant class
    expect(alert).toHaveClass('tap-alert-filled');
    
    // Should contain the message
    expect(screen.getByText('This is an alert')).toBeInTheDocument();
    
    // Should have an icon by default
    const alertContent = alert.querySelector('.tap-alert-content');
    expect(alertContent).toBeInTheDocument();
    const iconContainer = alert.querySelector('.tap-alert-icon');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders with different severity levels', () => {
    const { rerender } = customRender(<Alert severity="info&quot;>Info Alert</Alert>);
    expect(screen.getByRole("alert')).toHaveClass('tap-alert-info');
    
    rerender(<Alert severity="success&quot;>Success Alert</Alert>);
    expect(screen.getByRole("alert')).toHaveClass('tap-alert-success');
    
    rerender(<Alert severity="warning&quot;>Warning Alert</Alert>);
    expect(screen.getByRole("alert')).toHaveClass('tap-alert-warning');
    
    rerender(<Alert severity="error&quot;>Error Alert</Alert>);
    expect(screen.getByRole("alert')).toHaveClass('tap-alert-error');
  });

  it('renders with different variants', () => {
    const { rerender } = customRender(<Alert variant="filled&quot;>Filled Alert</Alert>);
    expect(screen.getByRole("alert')).toHaveClass('tap-alert-filled');
    
    rerender(<Alert variant="outlined&quot;>Outlined Alert</Alert>);
    expect(screen.getByRole("alert')).toHaveClass('tap-alert-outlined');
    
    rerender(<Alert variant="standard&quot;>Standard Alert</Alert>);
    expect(screen.getByRole("alert')).toHaveClass('tap-alert-standard');
  });

  it('renders with a title', () => {
    customRender(<Alert title="Alert Title&quot;>Alert with title</Alert>);
    
    const title = screen.getByText("Alert Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3'); // Typography with component="h3&quot;
    
    const titleBar = screen.getByRole("alert').querySelector('.tap-alert-title-bar');
    expect(titleBar).toBeInTheDocument();
  });

  it('renders without an icon when icon prop is false', () => {
    customRender(<Alert icon={false}>Alert without icon</Alert>);
    
    const alert = screen.getByRole('alert');
    const iconContainer = alert.querySelector('.tap-alert-icon');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('renders with an action', () => {
    const actionButton = <button>Action</button>;
    customRender(<Alert action={actionButton}>Alert with action</Alert>);
    
    const alert = screen.getByRole('alert');
    const actionContainer = alert.querySelector('.tap-alert-action');
    expect(actionContainer).toBeInTheDocument();
    
    const action = screen.getByRole('button', { name: 'Action' });
    expect(action).toBeInTheDocument();
  });

  it('renders with closable button and can be closed', () => {
    const handleClose = jest.fn();
    customRender(
      <Alert closable onClose={handleClose}>
        Closable alert
      </Alert>
    );
    
    // Close button should be present
    const closeButton = screen.getByRole('button', { name: 'Close alert' });
    expect(closeButton).toBeInTheDocument();
    
    // Click the close button
    fireEvent.click(closeButton);
    
    // Alert should be removed from the DOM
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    
    // onClose callback should be called
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders with closable button in title bar when title is provided', () => {
    customRender(
      <Alert title="Alert Title&quot; closable>
        Closable alert with title
      </Alert>
    );
    
    const alert = screen.getByRole("alert');
    const titleBar = alert.querySelector('.tap-alert-title-bar');
    
    // Close button should be in the title bar
    const closeButton = titleBar.querySelector('button');
    expect(closeButton).toBeInTheDocument();
    
    // Close button should not be in the content area
    const content = alert.querySelector('.tap-alert-content');
    expect(content.querySelector('button')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    customRender(<Alert className="custom-class&quot;>Alert with custom class</Alert>);
    
    const alert = screen.getByRole("alert');
    expect(alert).toHaveClass('custom-class');
  });

  it('renders with custom styles', () => {
    const customStyle = { marginTop: '20px' };
    customRender(<Alert style={customStyle}>Alert with custom style</Alert>);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle('margin-top: 20px');
  });

  it('renders children as Typography when children is a string', () => {
    customRender(<Alert>String message</Alert>);
    
    const messageContainer = screen.getByRole('alert').querySelector('.tap-alert-message');
    const typography = messageContainer.querySelector('[data-testid="mock-typography"]');
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveAttribute('data-variant', 'body2');
  });

  it('renders children directly when children is not a string', () => {
    const complexChildren = <div data-testid="complex-content">Complex Content</div>;
    customRender(<Alert>{complexChildren}</Alert>);
    
    const messageContainer = screen.getByRole('alert').querySelector('.tap-alert-message');
    expect(messageContainer).toContainElement(screen.getByTestId('complex-content'));
  });

  it('has no accessibility violations', async () => {
    await testA11y(<Alert>Accessibility Test</Alert>);
  });
});