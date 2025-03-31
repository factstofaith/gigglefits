/**
 * @component DialogActions
 * @description A compatibility wrapper for the legacy DialogActions component. This component
 * maps the legacy DialogActions API to the new design system Dialog actions, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Box from '@design-system/components/layout/Box';

/**
 * DialogActionsLegacy - Migration wrapper for legacy DialogActions component
 *
 * @param {Object} props - All props from the original DialogActions component
 * @returns {React.ReactElement} Rendered DialogActions component from design system
 */
const DialogActions = React.forwardRef(
  ({ children, className = '', style = {}, disableSpacing = false, ...otherProps }, ref) => {
    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'DialogActionsLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Dialog component.'
      );
    }

    return (
      <Box
        ref={ref}
        className={`design-system-dialog-actions ${className}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 3,
          py: 2,
          ...(!disableSpacing && {
            '& > :not(:first-of-type)': {
              ml: 2,
            },
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

DialogActionsLegacy.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  disableSpacing: PropTypes.bool,
};

DialogActions.displayName = 'DialogActions';

export default DialogActions;
