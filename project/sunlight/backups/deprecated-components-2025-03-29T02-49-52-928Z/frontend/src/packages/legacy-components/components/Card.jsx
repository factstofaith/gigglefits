/**
 * @component Card
 * @description A compatibility wrapper for the legacy Card component. This component
 * maps the legacy Card API to the new design system Card component, providing a
 * seamless transition path for existing usages.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Card from '@design-system/components/layout/Card';

/**
 * CardLegacy - Migration wrapper for legacy Card component
 *
 * @param {Object} props - All props from the original Card component
 * @returns {React.ReactElement} Rendered Card component from design system
 */
const Card = React.forwardRef(
  (
    {
      children,
      variant = 'outlined',
      elevation = 1,
      square = false,
      raised = false,
      className = '',
      style = {},
      ...otherProps
    },
    ref
  ) => {
    // Map legacy variant to design system variant
    let dsVariant = variant;

    // If raised is true, we want to use 'elevated' variant
    if (raised) {
      dsVariant = 'elevated';
    }

    // Map elevation to design system shadow
    let shadow = 'none';
    if (dsVariant === 'elevated' || elevation > 0) {
      // Map Material UI elevation (0-24) to design system shadow levels
      if (elevation <= 1) shadow = 'sm';
      else if (elevation <= 4) shadow = 'md';
      else if (elevation <= 8) shadow = 'lg';
      else shadow = 'xl';
    }

    // Display deprecation notice in dev environment
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'CardLegacy is a compatibility component and will be deprecated. ' +
          'Please migrate to the new design system Card component.'
      );
    }

    return (
      <Card
        ref={ref}
        variant={dsVariant}
        shadow={shadow}
        square={square}
        className={className}
        style={style}
        {...otherProps}
      >
        {children}
      </Card>
    );
  }
);

CardLegacy.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['outlined', 'elevation', 'contained']),
  elevation: PropTypes.number,
  square: PropTypes.bool,
  raised: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

Card.displayName = 'Card';

export default Card;
