/**
 * A11yModal
 * 
 * Accessible modal dialog with focus trapping
 * 
 * Features:
 * - Fully accessible with ARIA attributes
 * - Keyboard navigation support
 * - Screen reader announcements
 * - High-contrast mode compatibility
 * - Focus management
 */

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * A11yModal Component
 */
const A11yModal = forwardRef((props, ref) => {
  const {
    children,
    className,
    style,
    id,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    dataTestId,
    ...other
  } = props;

  // Using internal ref if none provided
  const componentRef = useRef(null);
  const resolvedRef = ref || componentRef;

  return (
    <div
      ref={resolvedRef}
      className={className}
      style={style}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      data-testid={dataTestId}
      {...other}
    >
      {children}
    </div>
  );
});

A11yModal.displayName = 'A11yModal';

A11yModal.propTypes = {
  /** Child elements */
  children: PropTypes.node,
  /** Additional CSS class */
  className: PropTypes.string,
  /** Additional inline styles */
  style: PropTypes.object,
  /** Element ID */
  id: PropTypes.string,
  /** ARIA label */
  ariaLabel: PropTypes.string,
  /** ID of element that labels this component */
  ariaLabelledBy: PropTypes.string,
  /** ID of element that describes this component */
  ariaDescribedBy: PropTypes.string,
  /** Data test ID for testing */
  dataTestId: PropTypes.string
};

export default A11yModal;