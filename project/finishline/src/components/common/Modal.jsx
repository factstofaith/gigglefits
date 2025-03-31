/**
 * Modal
 * 
 * A standardized modal/dialog component for displaying content in an overlay.
 * 
 * @module components/common/Modal
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

/**
 * Standardized modal/dialog component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {node} props.children - Modal content
 * @param {string} [props.title] - Modal title
 * @param {node} [props.footer] - Modal footer content
 * @param {boolean} [props.closeOnBackdropClick=true] - Whether clicking the backdrop closes the modal
 * @param {boolean} [props.closeOnEscape=true] - Whether pressing the Escape key closes the modal
 * @param {string} [props.size='medium'] - Modal size
 * @param {boolean} [props.fullWidth=false] - Whether the modal should take full width
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} [props.backdropClassName] - Additional CSS class names for the backdrop
 * @param {React.Ref} ref - Forwarded ref
 * @returns {React.ReactPortal|null} The modal component
 */
const Modal = forwardRef(({
  open,
  onClose,
  children,
  title,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = 'medium',
  fullWidth = false,
  className = '',
  backdropClassName = '',
  ...rest
}, ref) => {
  const modalRef = useRef(null);
  const modalElement = document.getElementById('modal-root') || document.body;
  
  // Size styles
  const sizeMap = {
    small: {
      width: '400px',
      maxWidth: '90%',
    },
    medium: {
      width: '600px',
      maxWidth: '90%',
    },
    large: {
      width: '800px',
      maxWidth: '90%',
    },
    xlarge: {
      width: '1100px',
      maxWidth: '90%',
    },
  };
  
  // Focus the modal when it opens
  useEffect(() => {
    if (open) {
      // Create a focus trap within the modal
      const handleFocus = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          modalRef.current.focus();
        }
      };
      
      // Get first focusable element in the modal
      const focusableElement = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      // Focus on the first focusable element, or the modal itself if none is found
      if (focusableElement) {
        focusableElement.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
      
      document.addEventListener('focus', handleFocus, true);
      
      // Disable body scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Compensate for scrollbar disappearing
      
      return () => {
        document.removeEventListener('focus', handleFocus, true);
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [open]);
  
  // Handle escape key press
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, closeOnEscape]);
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };
  
  // Don't render if not open
  if (!open) return null;
  
  // Backdrop styles
  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)',
  };
  
  // Modal styles
  const modalStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    width: fullWidth ? '90%' : sizeMap[size]?.width || sizeMap.medium.width,
    maxWidth: sizeMap[size]?.maxWidth || '90%',
    position: 'relative',
    outline: 'none',
    overflow: 'hidden',
  };
  
  // Header styles
  const headerStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
  
  // Title styles
  const titleStyle = {
    margin: 0,
    fontSize: '18px',
    fontWeight: 500,
    color: '#212121',
    flex: 1,
  };
  
  // Close button styles
  const closeButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    padding: 0,
    color: '#757575',
  };
  
  // Content styles
  const contentStyle = {
    padding: '24px',
    overflowY: 'auto',
    flexGrow: 1,
  };
  
  // Footer styles
  const footerStyle = {
    padding: '16px 24px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  };
  
  return createPortal(
    <div 
      className={`tap-modal-backdrop ${backdropClassName}`}
      style={backdropStyle}
      onClick={handleBackdropClick}
      role="presentation"
      data-testid="tap-modal-backdrop"
    >
      <div
        ref={(node) => {
          // Handle both refs
          modalRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`tap-modal tap-modal--${size} ${fullWidth ? 'tap-modal--fullwidth' : ''} ${className}`}
        style={modalStyle}
        tabIndex={-1}
        data-testid="tap-modal"
        {...rest}
      >
        {/* Modal Header */}
        {(title || onClose) && (
          <div className="tap-modal__header" style={headerStyle}>
            {title && (
              <h2 id="modal-title" className="tap-modal__title" style={titleStyle}>
                {title}
              </h2>
            )}
            
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="tap-modal__close"
                style={closeButtonStyle}
                data-testid="tap-modal-close-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Modal Content */}
        <div className="tap-modal__content" style={contentStyle}>
          {children}
        </div>
        
        {/* Modal Footer */}
        {footer && (
          <div className="tap-modal__footer" style={footerStyle}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    modalElement
  );
});

// Display name for debugging
Modal.displayName = 'Modal';

// Prop types
Modal.propTypes = {
  /** Whether the modal is open */
  open: PropTypes.bool.isRequired,
  
  /** Function to call when the modal is closed */
  onClose: PropTypes.func.isRequired,
  
  /** Modal content */
  children: PropTypes.node.isRequired,
  
  /** Modal title */
  title: PropTypes.string,
  
  /** Modal footer content */
  footer: PropTypes.node,
  
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick: PropTypes.bool,
  
  /** Whether pressing the Escape key closes the modal */
  closeOnEscape: PropTypes.bool,
  
  /** Modal size */
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  
  /** Whether the modal should take full width */
  fullWidth: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
  
  /** Additional CSS class names for the backdrop */
  backdropClassName: PropTypes.string,
};

export default Modal;