/**
 * @component FormControlLabel
 * @description A compatibility wrapper for the legacy FormControlLabel component. This component
 * maps the legacy FormControlLabel API to the new design system FormControl with Label, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * FormControlLabelLegacy - Migration wrapper for legacy FormControlLabel component
 *
 * @param {Object} props - All props from the original FormControlLabel component
 * @returns {React.ReactElement} Rendered FormControlLabel component from design system
 */
const FormControlLabel = React.forwardRef(
  (
    {
      control,
      label,
      labelPlacement = 'end',
      disabled = false,
      className = '',
      style = {},
      ...otherProps
    },
    ref
  ) => {
    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'FormControlLabelLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system FormField component.'
      );
    }

    const controlWithProps = React.isValidElement(control)
      ? React.cloneElement(control, { disabled })
      : control;

    return (
      <Box
        ref={ref}
        className={`design-system-form-control-label ${className}`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          ...(labelPlacement === 'start' && {
            flexDirection: 'row-reverse',
            justifyContent: 'flex-end',
          }),
          ...(labelPlacement === 'top' && {
            flexDirection: 'column-reverse',
            alignItems: 'center',
          }),
          ...(labelPlacement === 'bottom' && {
            flexDirection: 'column',
            alignItems: 'center',
          }),
          ...style,
        }}
        {...otherProps}
      >
        {controlWithProps}
        <Typography
          variant="body1&quot;
          sx={{
            ml: labelPlacement === "end' ? 1 : 0,
            mr: labelPlacement === 'start' ? 1 : 0,
            mt: labelPlacement === 'bottom' ? 1 : 0,
            mb: labelPlacement === 'top' ? 1 : 0,
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  }
);

FormControlLabelLegacy.propTypes = {
  control: PropTypes.node,
  label: PropTypes.node,
  labelPlacement: PropTypes.oneOf(['end', 'start', 'top', 'bottom']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

FormControlLabel.displayName = 'FormControlLabel';

export default FormControlLabel;
