/**
 * @component FormHelperText
 * @description A compatibility wrapper for the legacy FormHelperText component. This component
 * maps the legacy FormHelperText API to the new design system helper text, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@design-system/components/core';

/**
 * FormHelperTextLegacy - Migration wrapper for legacy FormHelperText component
 *
 * @param {Object} props - All props from the original FormHelperText component
 * @returns {React.ReactElement} Rendered FormHelperText component from design system
 */
const FormHelperText = React.forwardRef(
  (
    { children, error = false, disabled = false, className = '', style = {}, ...otherProps },
    ref
  ) => {
    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'FormHelperTextLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system FormField component.'
      );
    }

    return (
      <Typography
        ref={ref}
        variant="caption&quot;
        className={`design-system-form-helper-text ${className}`}
        sx={{
          color: error ? "error.main' : disabled ? 'text.disabled' : 'text.secondary',
          mt: 0.5,
          mx: 1.5,
          display: 'block',
          ...style,
        }}
        {...otherProps}
      >
        {children}
      </Typography>
    );
  }
);

FormHelperTextLegacy.propTypes = {
  children: PropTypes.node,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

FormHelperText.displayName = 'FormHelperText';

export default FormHelperText;
