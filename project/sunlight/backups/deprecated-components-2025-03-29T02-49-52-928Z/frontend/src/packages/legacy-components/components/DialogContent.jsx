/**
 * @component DialogContent
 * @description A compatibility wrapper for the legacy DialogContent component. This component
 * maps the legacy DialogContent API to the new design system Dialog content, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Box from '@design-system/components/layout/Box';

/**
 * DialogContentLegacy - Migration wrapper for legacy DialogContent component
 *
 * @param {Object} props - All props from the original DialogContent component
 * @returns {React.ReactElement} Rendered DialogContent component from design system
 */
const DialogContent = React.forwardRef(
  ({ children, className = '', style = {}, dividers = false, ...otherProps }, ref) => {
    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'DialogContentLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Dialog component.'
      );
    }

    return (
      <Box
        ref={ref}
        className={`design-system-dialog-content ${className}`}
        sx={{
          px: 3,
          py: 2,
          ...(dividers && {
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }),
          ...style,
        }}
        {...otherProps}
      >
        {children}
      </Box>
    );
  }
);

DialogContentLegacy.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  dividers: PropTypes.bool,
};

DialogContent.displayName = 'DialogContent';

export default DialogContent;
