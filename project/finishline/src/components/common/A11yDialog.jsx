/**
 * Accessible Dialog Component
 * 
 * A fully accessible modal dialog that follows WCAG standards.
 * Features keyboard navigation with focus trapping, ARIA attributes,
 * screen reader support, and animated transitions.
 */

import React, { useRef, useEffect, useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

/**
 * Accessible Dialog Component
 */
const A11yDialog = forwardRef((props, ref) => {
  const {
    open,
    onClose,
    title,
    description,
    children,
    ariaLabelledBy,
    ariaDescribedBy,
    hideCloseButton = false,
    closeOnBackdropClick = true,
    closeOnEsc = true,
    maxWidth = 'md',
    fullWidth = false,
    fullScreen = false,
    disablePortal = false,
    transitionDuration = 300,
    className,
    style,
    backdropClassName,
    backdropStyle,
    dataTestId,
    ...other
  } = props;
  
  // Create refs for focus management
  const dialogRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  
  // Track mounted state for animations
  const [mounted, setMounted] = useState(false);
  
  // Generate unique IDs for ARIA attributes if not provided
  const uniqueId = useRef(`dialog-${Math.random().toString(36).substr(2, 9)}`);
  const titleId = ariaLabelledBy || `${uniqueId.current}-title`;
  const descriptionId = ariaDescribedBy || (description ? `${uniqueId.current}-description` : undefined);
  
  // Calculate max width based on size
  const getMaxWidthValue = () => {
    const sizes = {
      xs: '444px',
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1920px',
      'xxl': '2560px'
    };
    
    return sizes[maxWidth] || (typeof maxWidth === 'string' ? maxWidth : 'none');
  };
  
  // Handle backdrop click
  const handleBackdropClick = (event) => {
    // Only close if clicked directly on the backdrop, not on dialog content
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose?.();
    }
  };
  
  // Handle key down events
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && closeOnEsc) {
      event.stopPropagation();
      onClose?.();
    }
  };
  
  // Manage focus when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Store the currently focused element
      previousActiveElementRef.current = document.activeElement;
      
      // Set mounted state for animation
      setMounted(true);
      
      // Focus the dialog after animation completes
      const timerId = setTimeout(() => {
        if (dialogRef.current) {
          // Focus the first focusable element in the dialog
          const focusableElements = dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          } else {
            // If no focusable elements, focus the dialog itself
            dialogRef.current.focus();
          }
        }
      }, transitionDuration);
      
      return () => clearTimeout(timerId);
    } else {
      // Set unmounted state for exit animation
      const timerId = setTimeout(() => {
        setMounted(false);
      }, 50);
      
      // Return focus to the previously focused element
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
      
      return () => clearTimeout(timerId);
    }
  }, [open, transitionDuration]);
  
  // Trap focus within the dialog
  useEffect(() => {
    if (!open || !dialogRef.current) return undefined;
    
    const handleTabKeypress = (event) => {
      if (event.key !== 'Tab') return;
      
      // Find all focusable elements within the dialog
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Cycle focus within the dialog
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    
    // Add event listener for tab keypresses
    document.addEventListener('keydown', handleTabKeypress);
    
    return () => {
      document.removeEventListener('keydown', handleTabKeypress);
    };
  }, [open]);
  
  // Prevent scrolling of the background when dialog is open
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);
  
  // Combine refs
  const handleRef = (element) => {
    dialogRef.current = element;
    
    // Handle the forwarded ref
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };
  
  // Exit early if not open and not mounted
  if (!open && !mounted) return null;
  
  // Dialog element
  const dialogElement = (
    <div
      role="presentation"
      className={backdropClassName}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1300,
        transition: `opacity ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        opacity: mounted && open ? 1 : 0,
        ...backdropStyle
      }}
      onClick={handleBackdropClick}
      data-testid={dataTestId ? `${dataTestId}-backdrop` : undefined}
    >
      <div
        ref={handleRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={className}
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
          padding: '24px',
          outline: 'none',
          maxWidth: fullScreen ? '100%' : (fullWidth ? '100%' : getMaxWidthValue()),
          width: fullScreen ? '100%' : (fullWidth ? 'calc(100% - 64px)' : 'auto'),
          maxHeight: fullScreen ? '100%' : 'calc(100% - 64px)',
          height: fullScreen ? '100%' : 'auto',
          overflow: 'auto',
          transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          transform: mounted && open ? 'none' : 'translateY(-20px)',
          opacity: mounted && open ? 1 : 0,
          ...style
        }}
        onKeyDown={handleKeyDown}
        data-testid={dataTestId}
        {...other}
      >
        <header style={{ position: 'relative', marginBottom: '16px' }}>
          <h2 id={titleId} style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500 }}>
            {title}
          </h2>
          
          {description && (
            <div id={descriptionId} style={{ marginTop: '8px', color: 'rgba(0, 0, 0, 0.6)' }}>
              {description}
            </div>
          )}
          
          {!hideCloseButton && (
            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(0, 0, 0, 0.54)',
                transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                '&:focus': {
                  outline: '2px solid #4d90fe',
                  outlineOffset: '2px'
                }
              }}
            >
              {/* Close icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </header>
        
        <div style={{ overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
  
  // Use portal unless disabled
  return disablePortal 
    ? dialogElement 
    : createPortal(dialogElement, document.body);
});

A11yDialog.displayName = 'A11yDialog';

A11yDialog.propTypes = {
  /** Whether the dialog is open */
  open: PropTypes.bool.isRequired,
  /** Callback fired when the dialog is closed */
  onClose: PropTypes.func,
  /** Dialog title */
  title: PropTypes.node.isRequired,
  /** Dialog description (optional) */
  description: PropTypes.node,
  /** Dialog content */
  children: PropTypes.node,
  /** ID of the element that labels the dialog (if not using title prop) */
  ariaLabelledBy: PropTypes.string,
  /** ID of the element that describes the dialog (if not using description prop) */
  ariaDescribedBy: PropTypes.string,
  /** Whether to hide the close button */
  hideCloseButton: PropTypes.bool,
  /** Whether to close the dialog when clicking the backdrop */
  closeOnBackdropClick: PropTypes.bool,
  /** Whether to close the dialog when pressing Escape */
  closeOnEsc: PropTypes.bool,
  /** Maximum width of the dialog */
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
  /** Whether the dialog should take up the full width */
  fullWidth: PropTypes.bool,
  /** Whether the dialog should take up the full screen */
  fullScreen: PropTypes.bool,
  /** Whether to disable the portal behavior */
  disablePortal: PropTypes.bool,
  /** Duration of the transition animation in milliseconds */
  transitionDuration: PropTypes.number,
  /** Additional CSS class for the dialog */
  className: PropTypes.string,
  /** Additional inline styles for the dialog */
  style: PropTypes.object,
  /** Additional CSS class for the backdrop */
  backdropClassName: PropTypes.string,
  /** Additional inline styles for the backdrop */
  backdropStyle: PropTypes.object,
  /** Data test ID for testing */
  dataTestId: PropTypes.string
};

export default A11yDialog;