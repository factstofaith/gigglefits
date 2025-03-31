/**
 * @component Dialog
 * @description A compatibility wrapper for the legacy Dialog component. This component
 * maps the legacy Dialog API to the new design system Dialog component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@design-system/components/feedback/Dialog';

/**
 * DialogLegacy - Migration wrapper for legacy Dialog component
 *
 * @param {Object} props - All props from the original Dialog component
 * @returns {React.ReactElement} Rendered Dialog component from design system
 */
const Dialog = React.forwardRef(
  (
    {
      open,
      onClose,
      title,
      children,
      maxWidth = 'md',
      fullWidth = false,
      fullScreen = false,
      disableBackdropClick = false,
      disableEscapeKeyDown = false,
      TransitionComponent,
      TransitionProps,
      className = '',
      style = {},
      ...otherProps
    },
    ref
  ) => {
    // Map legacy maxWidth to design system size
    const sizeMapping = {
      xs: 'sm',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
      false: 'md',
    };

    const size = sizeMapping[maxWidth] || 'md';

    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'DialogLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Dialog component.'
      );
    }

    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={onClose}
        title={title}
        size={size}
        fullScreen={fullScreen}
        disableBackdropClick={disableBackdropClick}
        disableEscapeKeyDown={disableEscapeKeyDown}
        className={className}
        style={{
          width: fullWidth ? '100%' : undefined,
          ...style,
        }}
        {...otherProps}
      >
        {children}
      </Dialog>
    );
  }
);

DialogLegacy.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  fullWidth: PropTypes.bool,
  fullScreen: PropTypes.bool,
  disableBackdropClick: PropTypes.bool,
  disableEscapeKeyDown: PropTypes.bool,
  TransitionComponent: PropTypes.elementType,
  TransitionProps: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
};

Dialog.displayName = 'Dialog';

export default Dialog;
