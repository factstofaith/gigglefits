/**
 * @component Alert
 * @description A compatibility wrapper for the legacy Alert component. This component
 * maps the legacy Material UI Alert API to the new design system Alert component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Alert from '@design-system/components/feedback/Alert';

/**
 * AlertLegacy - Migration wrapper for legacy Alert component
 *
 * @param {Object} props - All props from the original Material UI Alert component
 * @returns {React.ReactElement} Rendered Alert component from design system
 */
const Alert = React.forwardRef(
  (
    {
      children,
      severity = 'info',
      variant = 'standard',
      icon = true,
      action,
      onClose,
      closeText = '',
      color,
      className = '',
      style = {},
      ...otherProps
    },
    ref
  ) => {
    // Map Material UI severity values to design system (they are the same but let's be explicit)
    const severityMapping = {
      error: 'error',
      warning: 'warning',
      info: 'info',
      success: 'success',
    };

    // Map Material UI variant values to design system
    const variantMapping = {
      standard: 'standard',
      filled: 'filled',
      outlined: 'outlined',
    };

    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'AlertLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Alert component.'
      );
    }

    // Determine if alert should be closable
    const isClosable = !!onClose;

    return (
      <Alert
        ref={ref}
        severity={severityMapping[severity] || 'info'}
        variant={variantMapping[variant] || 'standard'}
        icon={icon}
        action={action}
        onClose={onClose}
        closable={isClosable}
        className={className}
        style={style}
        {...otherProps}
      >
        {children}
      </Alert>
    );
  }
);

AlertLegacy.propTypes = {
  children: PropTypes.node.isRequired,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  icon: PropTypes.bool,
  action: PropTypes.node,
  onClose: PropTypes.func,
  closeText: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

Alert.displayName = 'Alert';

export default Alert;
