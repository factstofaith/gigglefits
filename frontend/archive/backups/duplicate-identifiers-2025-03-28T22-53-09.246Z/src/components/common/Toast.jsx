/**
 * @component Toast
 * @description A wrapper around the design system Toast component.
 * This component is deprecated and maintained for backward compatibility.
 * New code should import Toast directly from '../../design-system'.
 *
 * @example
 * // Preferred usage (new code)
 * import { Toast } from '../../design-system';
 *
 * @example
 * // Legacy usage (existing code)
 * import Toast from '../components/common/Toast';
 */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Toast as DesignSystemToast } from '../../design-system';

/**
 * Toast component - DEPRECATED
 * This is a wrapper around the design system Toast for backward compatibility.
 * @deprecated Use the Toast component from design-system/adapter instead.
 */
const Toast = forwardRef((props, ref) => {
  // Show deprecation warning in development (only once)
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'DEPRECATED: Using common/Toast is deprecated. Please import Toast from design-system/adapter instead.'
    );
  }

  return <DesignSystemToast ref={ref} {...props} />;
});

Toast.displayName = 'Toast';

Toast.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  message: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  severity: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  autoHideDuration: PropTypes.number,
  action: PropTypes.node,
  title: PropTypes.node,
  position: PropTypes.string,
  persistent: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Toast;