/**
 * @component Card
 * @description An enhanced Card component with improved accessibility,
 * performance optimizations, and consistent API.
 * @typedef {import('../../types/display').CardProps} CardProps
 * @type {React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@design-system/components/display';
import { getAriaAttributes } from '@utils/accessibilityUtils';
import ErrorBoundary from '../core/ErrorBoundary';

const Card = React.memo(React.forwardRef(({
  // Card props
  children,
  elevation = 1,
  variant = 'elevation',
  
  // Layout props
  raised = false,
  square = false,
  
  // Interaction props
  onClick,
  
  // Accessibility props
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  role,
  
  // Styling props
  className,
  style,
  
  ...rest
}, ref) => {
  // Determine if card is interactive
  const isInteractive = !!onClick;
  
  // Set appropriate role for interactive cards
  const cardRole = role || (isInteractive ? 'button' : undefined);
  
  // Generate accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    labelledBy: ariaLabelledBy,
    describedBy: ariaDescribedBy,
    role: cardRole,
  });
  
  // Determine elevation - raised cards have higher elevation
  const finalElevation = raised ? Math.max(elevation, 8) : elevation;
  
  // Set tabIndex for interactive cards
  const interactiveProps = isInteractive ? {
    tabIndex: 0,
    onClick,
    onKeyDown: (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && onClick) {
        e.preventDefault();
        onClick(e);
      }
    },
  } : {};
  
  return (
    <ErrorBoundary>
      <Card
        ref={ref}
        elevation={finalElevation}
        variant={variant}
        square={square}
        className={`ds-card ds-card-adapted ${isInteractive ? 'ds-card-interactive' : ''} ${className || ''}`}
        style={{
          cursor: isInteractive ? 'pointer' : 'default',
          ...style,
        }}
        {...ariaAttributes}
        {...interactiveProps}
        {...rest}
      >
        {children}
      </Card>
    </ErrorBoundary>
  );
}));

CardAdapted.propTypes = {
  children: PropTypes.node,
  elevation: PropTypes.number,
  variant: PropTypes.oneOf(['elevation', 'outlined']),
  raised: PropTypes.bool,
  square: PropTypes.bool,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  role: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

Card.displayName = 'Card';

export default Card;