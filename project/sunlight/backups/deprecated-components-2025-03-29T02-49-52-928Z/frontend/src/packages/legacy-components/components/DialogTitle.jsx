/**
 * @component DialogTitle
 * @description A compatibility wrapper for the legacy DialogTitle component. This component
 * maps the legacy DialogTitle API to the new design system Dialog title, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@design-system/components/core/Typography';
import Box from '@design-system/components/layout/Box';

/**
 * DialogTitleLegacy - Migration wrapper for legacy DialogTitle component
 *
 * @param {Object} props - All props from the original DialogTitle component
 * @returns {React.ReactElement} Rendered DialogTitle component from design system
 */
const DialogTitle = React.forwardRef(
  ({ children, className = '', style = {}, ...otherProps }, ref) => {
    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'DialogTitleLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Dialog component.'
      );
    }

    return (
      <Box
        ref={ref}
        className={`design-system-dialog-title ${className}`}
        sx={{
          px: 3,
          py: 2,
          ...style,
        }}
        {...otherProps}
      >
        {typeof children === 'string' ? <Typography variant="h6&quot;>{children}</Typography> : children}
      </Box>
    );
  }
);

DialogTitleLegacy.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

DialogTitle.displayName = "DialogTitle';

export default DialogTitle;
