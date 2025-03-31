// src/tests/design-system/Toast.test.jsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { testA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Toast from '@design-system/components/feedback/Toast';

// Mock Box and Typography components
jest.mock('../../design-system/components/layout/Box', () => {
  return {
    __esModule: true,
    default: ({ children, role, className, style, 'aria-live': ariaLive, ...props }) => (
      <div data-testid="mock-box" role={role} className={className} aria-live={ariaLive} style={style} {...props}>
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

// Mock theme values with required color values for different toast types
jest.mock('../../design-system/foundations/theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b' },
        success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
        warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100' },
        error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828' },
        background: { paper: '#ffffff' },
        text: { secondary: '#666666', primary: '#000000' },
        action: { hover: 'rgba(0, 0, 0, 0.04)' },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      borderRadius: {
        md: '8px',
      },
      shadows: {
        md: '0 4px 8px 0 rgba(0,0,0,0.1)',
      },
      zIndex: {
        toast: 1400,
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

describe('Toast Component', () => {
  // Mock timers for auto-hide functionality
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    customRender(<Toast message="Default toast message&quot; />);
    
    const toast = screen.getByRole("alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('tap-toast');
    expect(toast).toHaveClass('tap-toast-info');
    expect(screen.getByText('Default toast message')).toBeInTheDocument();
  });

  it('renders different severity variants correctly', () => {
    const { rerender } = customRender(<Toast severity="info&quot; message="Info toast" />);
    
    let toast = screen.getByRole('alert');
    expect(toast).toHaveClass('tap-toast-info');
    expect(screen.getByText('Info toast')).toBeInTheDocument();
    
    rerender(<Toast severity="success&quot; message="Success toast" />);
    toast = screen.getByRole('alert');
    expect(toast).toHaveClass('tap-toast-success');
    expect(screen.getByText('Success toast')).toBeInTheDocument();
    
    rerender(<Toast severity="warning&quot; message="Warning toast" />);
    toast = screen.getByRole('alert');
    expect(toast).toHaveClass('tap-toast-warning');
    expect(screen.getByText('Warning toast')).toBeInTheDocument();
    
    rerender(<Toast severity="error&quot; message="Error toast" />);
    toast = screen.getByRole('alert');
    expect(toast).toHaveClass('tap-toast-error');
    expect(screen.getByText('Error toast')).toBeInTheDocument();
  });

  it('renders with custom className and style', () => {
    const customStyle = { backgroundColor: 'rgb(240, 240, 240)' };
    
    customRender(
      <Toast 
        message="Custom toast&quot; 
        className="custom-toast-class" 
        style={customStyle} 
      />
    );
    
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('custom-toast-class');
    expect(toast.style.backgroundColor).toBe('rgb(240, 240, 240)');
  });

  it('renders with ReactNode message instead of string', () => {
    const complexMessage = (
      <div data-testid="complex-message">
        <h4>Complex Message</h4>
        <p>This is a complex message with HTML</p>
      </div>
    );
    
    customRender(<Toast message={complexMessage} />);
    
    expect(screen.getByTestId('complex-message')).toBeInTheDocument();
    expect(screen.getByText('Complex Message')).toBeInTheDocument();
    expect(screen.getByText('This is a complex message with HTML')).toBeInTheDocument();
  });

  it('renders action element when provided', () => {
    const actionElement = <button>Action</button>;
    
    customRender(<Toast message="Toast with action&quot; action={actionElement} />);
    
    expect(screen.getByRole("button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByText('Toast with action')).toBeInTheDocument();
  });

  it('does not render close button when persistent is true', () => {
    customRender(<Toast message="Persistent toast&quot; persistent={true} />);
    
    expect(screen.queryByRole("button', { name: 'Close toast' })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    
    customRender(<Toast message="Closable toast&quot; onClose={handleClose} />);
    
    const closeButton = screen.getByRole("button', { name: 'Close toast' });
    fireEvent.click(closeButton);
    
    // Wait for animation to complete
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('auto-hides after autoHideDuration', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Toast 
        message="Auto-hide toast&quot; 
        autoHideDuration={2000} 
        onClose={handleClose} 
      />
    );
    
    // Fast-forward time to trigger auto-hide
    act(() => {
      jest.advanceTimersByTime(2000); // Initial timeout
    });
    
    act(() => {
      jest.advanceTimersByTime(300); // Animation duration
    });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not auto-hide when persistent is true', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Toast 
        message="Persistent toast&quot; 
        autoHideDuration={2000} 
        onClose={handleClose} 
        persistent={true} 
      />
    );
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("does not auto-hide when autoHideDuration is 0', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Toast 
        message="No auto-hide toast&quot; 
        autoHideDuration={0} 
        onClose={handleClose} 
      />
    );
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("renders with different position values', () => {
    // Test top-left position
    const { rerender } = customRender(
      <Toast message="Top left toast&quot; position="top-left" />
    );
    
    let toast = screen.getByRole('alert');
    expect(toast.style.top).toBe('16px');
    expect(toast.style.left).toBe('16px');
    
    // Test top-right position
    rerender(<Toast message="Top right toast&quot; position="top-right" />);
    toast = screen.getByRole('alert');
    expect(toast.style.top).toBe('16px');
    expect(toast.style.right).toBe('16px');
    
    // Test bottom-left position
    rerender(<Toast message="Bottom left toast&quot; position="bottom-left" />);
    toast = screen.getByRole('alert');
    expect(toast.style.bottom).toBe('16px');
    expect(toast.style.left).toBe('16px');
    
    // Test bottom-right position
    rerender(<Toast message="Bottom right toast&quot; position="bottom-right" />);
    toast = screen.getByRole('alert');
    expect(toast.style.bottom).toBe('16px');
    expect(toast.style.right).toBe('16px');
    
    // Test top-center position
    rerender(<Toast message="Top center toast&quot; position="top-center" />);
    toast = screen.getByRole('alert');
    expect(toast.style.top).toBe('16px');
    expect(toast.style.left).toBe('50%');
    expect(toast.style.transform).toBe('translateX(-50%)');
    
    // Test bottom-center position
    rerender(<Toast message="Bottom center toast&quot; position="bottom-center" />);
    toast = screen.getByRole('alert');
    expect(toast.style.bottom).toBe('16px');
    expect(toast.style.left).toBe('50%');
    expect(toast.style.transform).toBe('translateX(-50%)');
  });

  it('renders nothing when open is false', () => {
    customRender(<Toast message="Hidden toast&quot; open={false} />);
    
    expect(screen.queryByRole("alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden toast')).not.toBeInTheDocument();
  });

  it('responds to open prop changes', () => {
    const { rerender } = customRender(<Toast message="Toggle toast&quot; open={false} />);
    
    // Initially not rendered
    expect(screen.queryByRole("alert')).not.toBeInTheDocument();
    
    // Change to open=true
    rerender(<Toast message="Toggle toast&quot; open={true} />);
    expect(screen.getByRole("alert')).toBeInTheDocument();
    expect(screen.getByText('Toggle toast')).toBeInTheDocument();
    
    // Change back to open=false
    rerender(<Toast message="Toggle toast&quot; open={false} />);
    
    // Wait for exit animation
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(screen.queryByRole("alert')).not.toBeInTheDocument();
  });

  it('shows appropriate icon based on severity', () => {
    const { rerender } = customRender(<Toast severity="info&quot; message="Info toast" />);
    
    // Check for SVG icon
    let iconContainer = screen.getByText('Info toast').previousSibling;
    expect(iconContainer).toHaveClass('tap-toast-icon');
    expect(iconContainer.querySelector('svg')).toBeInTheDocument();
    
    rerender(<Toast severity="success&quot; message="Success toast" />);
    iconContainer = screen.getByText('Success toast').previousSibling;
    expect(iconContainer.querySelector('svg')).toBeInTheDocument();
    
    rerender(<Toast severity="warning&quot; message="Warning toast" />);
    iconContainer = screen.getByText('Warning toast').previousSibling;
    expect(iconContainer.querySelector('svg')).toBeInTheDocument();
    
    rerender(<Toast severity="error&quot; message="Error toast" />);
    iconContainer = screen.getByText('Error toast').previousSibling;
    expect(iconContainer.querySelector('svg')).toBeInTheDocument();
  });

  it('applies animation styles when closing', () => {
    const handleClose = jest.fn();
    
    customRender(<Toast message="Animated toast&quot; onClose={handleClose} />);
    
    const closeButton = screen.getByRole("button', { name: 'Close toast' });
    fireEvent.click(closeButton);
    
    // Check that opacity and transform are set for animation
    const toast = screen.getByRole('alert');
    expect(toast.style.opacity).toBe('0');
    expect(toast.style.transform).toBe('translateY(20px)');
  });

  it('handles ref forwarding', () => {
    const ref = React.createRef();
    
    customRender(<Toast ref={ref} message="Toast with ref&quot; />);
    
    expect(ref.current).toHaveAttribute("role', 'alert');
    expect(ref.current).toHaveClass('tap-toast');
  });

  it('has proper accessibility attributes', () => {
    customRender(<Toast message="Accessible toast&quot; />);
    
    const toast = screen.getByRole("alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('has no accessibility violations', async () => {
    await testA11y(
      <Toast message="Accessibility test toast" />
    );
  });
});