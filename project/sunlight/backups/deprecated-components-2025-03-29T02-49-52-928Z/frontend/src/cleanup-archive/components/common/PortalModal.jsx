// PortalModal.jsx
// -----------------------------------------------------------------------------
// A "portal" based modal that reduces Layout/ResizeObserver triggers, because
// it's mounted outside of the main React root flow.
//
// Now with enhanced accessibility features including:
// - Focus trapping within the modal
// - Proper ARIA attributes
// - Keyboard navigation support
// - Screen reader announcements
// - Escape key support
//
// Dependencies:
//   - React and ReactDOM from 'react-dom' (for createPortal)
//   - A <div id="modal-root&quot;></div> in your public/index.html or a static container
//   - accessibilityUtils.js for focus management and ARIA helpers
//
// Usage:
//   <PortalModal
//     isOpen={isModalOpen}
//     onClose={() => setModalOpen(false)}
//     title="My Modal Title"
//   >
//     <p>Content goes here</p>
//   </PortalModal>

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Box } from '../../../design-system'
import { Typography, Button } from '../../../design-system'
import { useTheme } from '../../design-system/foundations/theme';
import {
import Box from '@mui/material/Box';
useFocusTrap,
  announceToScreenReader,
  getAriaAttributes,
} from '../../utils/accessibilityUtils';

function PortalModal({
  isOpen,
  onClose,
  children,
  title,
  ariaLabel,
  ariaDescribedBy,
  size = 'medium',
  closeOnEsc = true,
  closeOnOverlayClick = true,
}) {
  // Added display name
  PortalModal.displayName = 'PortalModal';

  // Use focus trap hook to manage focus within modal
  const focusTrapRef = useFocusTrap(isOpen, closeOnEsc ? onClose : null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = e => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Prevent background scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Announce to screen readers that modal is open
    announceToScreenReader(`Dialog opened: ${title || ariaLabel || 'Modal dialog'}`, false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, onClose, closeOnEsc, title, ariaLabel]);

  if (!isOpen) return null;

  // Size variations
  const sizes = {
    small: { minWidth: '300px', maxWidth: '400px' },
    medium: { minWidth: '400px', maxWidth: '600px' },
    large: { minWidth: '600px', maxWidth: '800px' },
    fullscreen: { width: '90%', maxWidth: '1200px', height: '90%' },
  };

  // The overlay and modal container styles
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59,61,61,0.5)', // black #3B3D3D with alpha
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  const modalStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '1.5rem',
    ...sizes[size],
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    position: 'relative',
    maxHeight: size === 'fullscreen' ? '90vh' : 'calc(90vh - 100px)',
    overflow: 'auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  };

  const titleStyle = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 'bold',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    backgroundColor: '#48C2C5',
    border: 'none',
    borderRadius: '4px',
    color: '#FFFFFF',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
  };

  // Unique IDs for accessibility
  const modalId = `modal-${Math.random().toString(36).substr(2, 9)}`;
  const titleId = `${modalId}-title`;
  const descriptionId = ariaDescribedBy || `${modalId}-description`;

  // Get accessibility attributes
  const modalAriaAttributes = getAriaAttributes({
    role: 'dialog',
    labelledBy: titleId,
    describedBy: descriptionId,
  });

  const { theme } = useTheme();

  // The content of the modal:
  const modalContent = (
    <Box
      style={overlayStyle}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="presentation&quot;
    >
      <Box
        style={{
          ...modalStyle,
          backgroundColor: theme?.colors?.background?.paper || "#FFFFFF',
          boxShadow: theme?.shadows?.[3] || '0 4px 20px rgba(0,0,0,0.2)',
        }}
        ref={focusTrapRef}
        id={modalId}
        onClick={e => e.stopPropagation()} // Prevent clicks inside from closing
        {...modalAriaAttributes}
        aria-modal="true"
      >
        {title && (
          <Box display="flex&quot; justifyContent="space-between" alignItems="center&quot; marginBottom="16px">
            <Typography 
              id={titleId} 
              variant="h5&quot; 
              style={{ 
                margin: 0,
                color: theme?.colors?.text?.primary || "#212121'
              }}
            >
              {title}
            </Typography>
          </Box>
        )}

        <Box
          as="button&quot;
          onClick={onClose}
          aria-label="Close dialog"
          type="button&quot;
          style={{
            position: "absolute',
            top: '16px',
            right: '16px',
            backgroundColor: theme?.colors?.primary?.main || '#48C2C5',
            border: 'none',
            borderRadius: '4px',
            color: '#FFFFFF',
            padding: '4px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
          }}
        >
          X
        </Box>

        <Box id={descriptionId}>{children}</Box>
      </Box>
    </Box>
  );

  // Create a portal to keep the modal outside the main DOM hierarchy
  return ReactDOM.createPortal(modalContent, document.getElementById('modal-root'));
}

PortalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'fullscreen']),
  closeOnEsc: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
};

export default PortalModal;
