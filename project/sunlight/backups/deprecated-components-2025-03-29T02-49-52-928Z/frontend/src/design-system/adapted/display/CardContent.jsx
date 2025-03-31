/**
 * @component CardContent
 * @description Card content component with standardized spacing and
 * accessibility features.
 * @typedef {import('../../types/display').CardContentProps} CardContentProps
 * @type {React.ForwardRefExoticComponent<CardContentProps & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '../../design-system';
// Design system import already exists;
;

const CardContent = React.memo(React.forwardRef(({
  // Content props
  children,
  
  // Padding props
  disablePadding = false,
  dense = false,
  
  // Accessibility props
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  
  // Styling props
  className,
  style,
  
  ...rest
}, ref) => {
  // Determine padding based on props
  const padding = disablePadding ? 0 : dense ? 8 : 16;
  
  // Process accessibility attributes
  const ariaProps = {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
  };
  
  return (
    <Box
      ref={ref}
      className={`ds-card-content ds-card-content-adapted ${className || ''}`}
      style={{
        padding,
        ...style,
      }}
      {...ariaProps}
      {...rest}
    >
      {children}
    </Box>
  );
}));

CardContentAdapted.propTypes = {
  children: PropTypes.node,
  disablePadding: PropTypes.bool,
  dense: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

CardContent.displayName = 'CardContent';

export default CardContent;