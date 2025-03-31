// src/tests/design-system/Dialog.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { testA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import { Dialog } from '../../design-system';

// Mock createPortal to render directly in test
jest.mock('react-dom', () => {
  const originalModule = jest.requireActual('react-dom');
  return {
    ...originalModule,
    createPortal: (node) => node,
  };
});

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
    default: ({ children, variant, component = 'div', id, ...props }) => {
      const Component = component;
      return (
        <Component data-testid="mock-typography" data-variant={variant} id={id} {...props}>
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
        background: { paper: '#ffffff' },
        divider: '#e0e0e0',
        text: { secondary: '#666666' },
        action: { hover: 'rgba(0, 0, 0, 0.04)' },
      },
      spacing: {
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
        lg: '0px 8px 10px rgba(0, 0, 0, 0.14)',
      },
      zIndex: {
        modal: 1300,
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

describe('Dialog Component', () => {
  // Mock document.body.style manipulation
  const originalDocumentBodyStyle = document.body.style;
  
  beforeEach(() => {
    // Mocking window.getComputedStyle
    global.getComputedStyle = jest.fn().mockImplementation(() => ({
      overflow: 'visible',
    }));
    
    // Reset document.body.style
    document.body.style = originalDocumentBodyStyle;
  });
  
  // Mock event listener
  const originalAddEventListener = document.addEventListener;
  const originalRemoveEventListener = document.removeEventListener;
  
  let eventListeners = {};
  
  beforeEach(() => {
    eventListeners = {};
    
    document.addEventListener = jest.fn((event, cb) => {
      eventListeners[event] = cb;
    });
    
    document.removeEventListener = jest.fn((event) => {
      delete eventListeners[event];
    });
  });
  
  afterEach(() => {
    document.addEventListener = originalAddEventListener;
    document.removeEventListener = originalRemoveEventListener;
  });
  
  it('renders nothing when closed', () => {
    customRender(
      <Dialog open={false} onClose={() => {}}>
        Dialog content
      </Dialog>
    );
    
    expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  
  it('renders correctly when open', () => {
    customRender(
      <Dialog open onClose={() => {}}>
        Dialog content
      </Dialog>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });
  
  it('renders with a title', () => {
    customRender(
      <Dialog open onClose={() => {}} title="Dialog Title&quot;>
        Dialog content
      </Dialog>
    );
    
    const dialog = screen.getByRole("dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    
    const title = screen.getByText('Dialog Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2'); // Typography with component="h2&quot;
    expect(title).toHaveAttribute("id', 'dialog-title');
  });
  
  it('renders with action buttons', () => {
    const actions = (
      <>
        <button>Cancel</button>
        <button>Confirm</button>
      </>
    );
    
    customRender(
      <Dialog open onClose={() => {}} actions={actions}>
        Dialog content
      </Dialog>
    );
    
    const actionsContainer = screen.getByText('Dialog content').parentElement.nextSibling;
    expect(actionsContainer).toHaveClass('tap-dialog-actions');
    
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });
  
  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Dialog open onClose={handleClose} title="Dialog Title&quot;>
        Dialog content
      </Dialog>
    );
    
    const closeButton = screen.getByRole("button', { name: 'Close dialog' });
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('calls onClose when backdrop is clicked', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Dialog open onClose={handleClose}>
        Dialog content
      </Dialog>
    );
    
    // Find the backdrop
    const backdrop = screen.getByRole('presentation');
    // Click on the backdrop (not the dialog itself)
    fireEvent.click(backdrop);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onClose when backdrop click is disabled', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Dialog open onClose={handleClose} disableBackdropClick>
        Dialog content
      </Dialog>
    );
    
    // Find the backdrop
    const backdrop = screen.getByRole('presentation');
    // Click on the backdrop
    fireEvent.click(backdrop);
    
    expect(handleClose).not.toHaveBeenCalled();
  });
  
  it('calls onClose when escape key is pressed', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Dialog open onClose={handleClose}>
        Dialog content
      </Dialog>
    );
    
    // Simulate Escape key press
    if (eventListeners.keydown) {
      eventListeners.keydown({ key: 'Escape' });
    }
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onClose when escape key press is disabled', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Dialog open onClose={handleClose} disableEscapeKeyDown>
        Dialog content
      </Dialog>
    );
    
    // Simulate Escape key press
    if (eventListeners.keydown) {
      eventListeners.keydown({ key: 'Escape' });
    }
    
    expect(handleClose).not.toHaveBeenCalled();
  });
  
  it('locks body scroll when open', () => {
    customRender(
      <Dialog open onClose={() => {}}>
        Dialog content
      </Dialog>
    );
    
    expect(document.body.style.overflow).toBe('hidden');
  });
  
  it('renders with different sizes', () => {
    // Test different sizes
    const { rerender } = customRender(
      <Dialog open onClose={() => {}} size="sm&quot;>
        Small Dialog
      </Dialog>
    );
    
    let dialog = screen.getByRole("dialog');
    expect(dialog.style.width).toBe('400px');
    
    rerender(
      <Dialog open onClose={() => {}} size="md&quot;>
        Medium Dialog
      </Dialog>
    );
    dialog = screen.getByRole("dialog');
    expect(dialog.style.width).toBe('600px');
    
    rerender(
      <Dialog open onClose={() => {}} size="lg&quot;>
        Large Dialog
      </Dialog>
    );
    dialog = screen.getByRole("dialog');
    expect(dialog.style.width).toBe('800px');
    
    rerender(
      <Dialog open onClose={() => {}} size="xl&quot;>
        Extra Large Dialog
      </Dialog>
    );
    dialog = screen.getByRole("dialog');
    expect(dialog.style.width).toBe('1200px');
    
    rerender(
      <Dialog open onClose={() => {}} size="full&quot;>
        Full Width Dialog
      </Dialog>
    );
    dialog = screen.getByRole("dialog');
    expect(dialog.style.width).toBe('100%');
  });
  
  it('renders in fullScreen mode', () => {
    customRender(
      <Dialog open onClose={() => {}} fullScreen>
        Full Screen Dialog
      </Dialog>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.width).toBe('100%');
    expect(dialog.style.maxHeight).toBe('100%');
    expect(dialog.style.borderRadius).toBe('0px');
  });
  
  it('renders with custom className', () => {
    customRender(
      <Dialog open onClose={() => {}} className="custom-dialog&quot;>
        Dialog with custom class
      </Dialog>
    );
    
    const dialog = screen.getByRole("dialog');
    expect(dialog).toHaveClass('custom-dialog');
  });
  
  it('renders with custom styles', () => {
    const customStyle = { backgroundColor: 'rgb(240, 240, 240)' };
    
    customRender(
      <Dialog open onClose={() => {}} style={customStyle}>
        Dialog with custom style
      </Dialog>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.backgroundColor).toBe('rgb(240, 240, 240)');
  });
  
  it('prevents event propagation when dialog is clicked', () => {
    const handleClose = jest.fn();
    
    customRender(
      <Dialog open onClose={handleClose}>
        Dialog content
      </Dialog>
    );
    
    const dialog = screen.getByRole('dialog');
    const stopPropagationMock = jest.fn();
    
    // Simulate a click event on the dialog with a mocked stopPropagation
    fireEvent.click(dialog, { stopPropagation: stopPropagationMock });
    
    // onClose should not be called when clicking on the dialog itself
    expect(handleClose).not.toHaveBeenCalled();
  });
  
  it('has no accessibility violations', async () => {
    await testA11y(
      <Dialog open onClose={() => {}} title="Accessibility Test">
        Dialog content for accessibility testing
      </Dialog>
    );
  });
});