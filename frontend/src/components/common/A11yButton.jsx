/**
 * Accessibility-Enhanced Button Component
 * 
 * A button component with enhanced accessibility features.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module components/common/A11yButton
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { useA11yAnnouncement } from '../../hooks/a11y';

/**
 * Enhanced Button with built-in accessibility features
 * 
 * @param {Object} props - Component props
 * @param {string} [props.a11yLabel] - Accessible label override for screen readers
 * @param {string} [props.a11yAnnouncement] - Message to announce to screen readers when clicked
 * @param {string} [props.a11yExpanded] - Aria-expanded state
 * @param {string} [props.a11yControls] - ID of the element this button controls
 * @param {string} [props.a11yHaspopup] - Aria-haspopup state
 * @param {string} [props.a11yDescription] - Additional description for screen readers
 * @param {boolean} [props.a11yFocusIndicator=true] - Whether to use enhanced focus indicator
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The enhanced button
 */
const A11yButton = forwardRef(({
  // A11y props
  a11yLabel,
  a11yAnnouncement,
  a11yExpanded,
  a11yControls,
  a11yHaspopup,
  a11yDescription,
  a11yFocusIndicator = true,
  
  // Standard button props
  children,
  disabled,
  onClick,
  className,
  sx = {},
  ...rest
}, ref) => {
  const { announcePolite } = useA11yAnnouncement();
  
  // Handle click with announcement
  const handleClick = (event) => {
    if (a11yAnnouncement && !disabled) {
      announcePolite(a11yAnnouncement);
    }
    
    if (onClick) {
      onClick(event);
    }
  };
  
  // Combine standard and a11y props
  const buttonProps = {
    // Standard props
    disabled,
    onClick: handleClick,
    className: `${a11yFocusIndicator ? 'a11y-focus-visible' : ''} ${className || ''}`.trim(),
    
    // A11y attributes
    'aria-label': a11yLabel,
    'aria-expanded': a11yExpanded,
    'aria-controls': a11yControls,
    'aria-haspopup': a11yHaspopup,
    'aria-describedby': a11yDescription,
    
    // Enhanced focus styles
    sx: {
      '&.a11y-focus-visible:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.main',
        outlineOffset: '2px',
      },
      ...sx
    },
    
    // Pass through other props
    ...rest
  };
  
  return (
    <Button
      ref={ref}
      {...buttonProps}
    >
      {children}
    </Button>
  );
});

A11yButton.displayName = 'A11yButton';

A11yButton.propTypes = {
  // A11y props
  a11yLabel: PropTypes.string,
  a11yAnnouncement: PropTypes.string,
  a11yExpanded: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  a11yControls: PropTypes.string,
  a11yHaspopup: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  a11yDescription: PropTypes.string,
  a11yFocusIndicator: PropTypes.bool,
  
  // Standard button props
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  sx: PropTypes.object,
};

export default A11yButton;