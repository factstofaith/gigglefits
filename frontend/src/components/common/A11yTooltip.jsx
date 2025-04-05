import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Accessibility-Enhanced Tooltip Component
                                                                                      * 
                                                                                      * A tooltip component with enhanced accessibility features.
                                                                                      * Part of the zero technical debt accessibility implementation.
                                                                                      * 
                                                                                      * @module components/common/A11yTooltip
                                                                                      */
import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import { useA11yPrefersReducedMotion } from "@/hooks/a11y";

/**
 * Enhanced Tooltip with built-in accessibility features
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Element that triggers the tooltip
 * @param {string|React.ReactNode} props.title - Tooltip content
 * @param {string} [props.a11yLabel] - Accessible label for the tooltip trigger (screen readers)
 * @param {boolean} [props.a11yKeyboardFocusable=true] - Whether tooltip should be showable via keyboard
 * @param {boolean} [props.a11yRespectMotionPreferences=true] - Whether to respect reduced motion preferences
 * @param {string} [props.placement='bottom'] - Tooltip placement
 * @param {number} [props.enterDelay=700] - Delay before showing tooltip (ms)
 * @param {number} [props.leaveDelay=0] - Delay before hiding tooltip (ms)
 * @param {string} [props.className] - Additional class name
 * @param {Object} [props.style] - Additional styles
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The enhanced tooltip
 */
const A11yTooltip = forwardRef(({
  // A11y props
  a11yLabel,
  a11yKeyboardFocusable = true,
  a11yRespectMotionPreferences = true,
  // Standard tooltip props
  children,
  title,
  placement = 'bottom',
  enterDelay = 700,
  leaveDelay = 0,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const [formError, setFormError] = useState(null);
  const prefersReducedMotion = useA11yPrefersReducedMotion();
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);

  // Adjust animation settings based on motion preferences
  const animationProps = a11yRespectMotionPreferences && prefersReducedMotion ? {
    TransitionProps: {
      timeout: 0,
      style: {
        transitionDuration: '0ms'
      }
    }
  } : {};

  // Handle keyboard focus
  const handleFocus = event => {
    if (event.key === 'Tab') {
      setIsKeyboardFocused(true);
    }
  };
  const handleBlur = () => {
    setIsKeyboardFocused(false);
  };

  // Show tooltip immediately if keyboard focused
  const delayProps = a11yKeyboardFocusable && isKeyboardFocused ? {
    enterDelay: 0
  } : {
    enterDelay
  };

  // Enhance children with a11y attributes
  const enhancedChildren = React.isValidElement(children) ? React.cloneElement(children, {
    onKeyDown: handleFocus,
    onBlur: handleBlur,
    'aria-label': a11yLabel || (typeof title === 'string' ? title : undefined),
    tabIndex: children.props.tabIndex !== undefined ? children.props.tabIndex : a11yKeyboardFocusable ? 0 : undefined
  }) : children;
  return <Tooltip ref={ref} title={title} placement={placement} leaveDelay={leaveDelay} className={`a11y-tooltip ${className}`} style={style} {...delayProps} {...animationProps} {...rest}>

      {enhancedChildren}
    </Tooltip>;
});
A11yTooltip.displayName = 'A11yTooltip';
A11yTooltip.propTypes = {
  // A11y props
  a11yLabel: PropTypes.string,
  a11yKeyboardFocusable: PropTypes.bool,
  a11yRespectMotionPreferences: PropTypes.bool,
  // Standard tooltip props
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['bottom', 'bottom-end', 'bottom-start', 'left', 'left-end', 'left-start', 'right', 'right-end', 'right-start', 'top', 'top-end', 'top-start']),
  enterDelay: PropTypes.number,
  leaveDelay: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object
};
export default A11yTooltip;