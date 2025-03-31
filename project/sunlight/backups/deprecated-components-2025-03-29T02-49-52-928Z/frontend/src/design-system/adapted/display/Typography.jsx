/**
 * @component Typography
 * @description Enhanced Typography component with consistent styling,
 * accessibility features, and performance optimizations.
 * 
 * @typedef {import('../../types/core').TypographyProps} TypographyProps
 */
import React from 'react';
import PropTypes from 'prop-types';
import { getAriaAttributes } from '@utils/accessibilityUtils';

// Mapping of variant to HTML tag
const variantMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  button: 'span',
  overline: 'span',
};

// Font size mapping based on variant
const fontSizeMapping = {
  h1: '2.5rem',    // 40px
  h2: '2rem',      // 32px
  h3: '1.75rem',   // 28px
  h4: '1.5rem',    // 24px
  h5: '1.25rem',   // 20px
  h6: '1.125rem',  // 18px
  subtitle1: '1rem',     // 16px
  subtitle2: '0.875rem', // 14px
  body1: '1rem',         // 16px
  body2: '0.875rem',     // 14px
  caption: '0.75rem',    // 12px
  button: '0.875rem',    // 14px
  overline: '0.75rem',   // 12px
};

// Font weight mapping
const fontWeightMapping = {
  h1: 700,
  h2: 700,
  h3: 600,
  h4: 600,
  h5: 600,
  h6: 600,
  subtitle1: 600,
  subtitle2: 500,
  body1: 400,
  body2: 400,
  button: 500,
  caption: 400,
  overline: 400,
};

// Line height mapping
const lineHeightMapping = {
  h1: 1.2,
  h2: 1.25,
  h3: 1.3,
  h4: 1.35,
  h5: 1.4,
  h6: 1.5,
  subtitle1: 1.5,
  subtitle2: 1.5,
  body1: 1.5,
  body2: 1.5,
  button: 1.75,
  caption: 1.66,
  overline: 2.66,
};

/**
 * TypographyAdapted component
 * 
 * @type {React.ForwardRefExoticComponent<TypographyProps & React.RefAttributes<HTMLElement>>}
 */
const Typography = React.memo(React.forwardRef(({
  // Content props
  children,
  
  // Typography props
  variant = 'body1',
  component,
  noWrap = false,
  gutterBottom = false,
  paragraph = false,
  
  // Styling props
  align = 'inherit',
  color = 'inherit',
  fontSize,
  fontWeight,
  fontStyle,
  
  // Accessibility props
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  role,
  
  // Additional styling
  className,
  style,
  
  ...rest
}, ref) => {
  // Determine which HTML tag to use
  const Component = component || (paragraph ? 'p' : variantMapping[variant] || 'span');
  
  // Generate accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    labelledBy: ariaLabelledBy,
    describedBy: ariaDescribedBy,
    role: role,
  });
  
  return (
    <Component
      ref={ref}
      className={`ds-typography ds-typography-${variant} ${className || ''}`}
      style={{
        // Apply variant-based styling
        fontSize: fontSize || fontSizeMapping[variant],
        fontWeight: fontWeight || fontWeightMapping[variant],
        fontStyle: fontStyle,
        lineHeight: lineHeightMapping[variant],
        
        // Additional styling options
        textAlign: align,
        color: color,
        marginBottom: gutterBottom ? '0.35em' : paragraph ? '16px' : 0,
        
        // Layout options
        overflow: noWrap ? 'hidden' : 'visible',
        textOverflow: noWrap ? 'ellipsis' : 'clip',
        whiteSpace: noWrap ? 'nowrap' : 'normal',
        
        // Additional custom styles
        ...style,
      }}
      {...ariaAttributes}
      {...rest}
    >
      {children}
    </Component>
  );
}));

TypographyAdapted.propTypes = {
  // Content props
  children: PropTypes.node,
  
  // Typography props
  variant: PropTypes.oneOf([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'subtitle1', 'subtitle2',
    'body1', 'body2',
    'caption', 'button', 'overline',
  ]),
  component: PropTypes.elementType,
  noWrap: PropTypes.bool,
  gutterBottom: PropTypes.bool,
  paragraph: PropTypes.bool,
  
  // Styling props
  align: PropTypes.oneOf(['inherit', 'left', 'center', 'right', 'justify']),
  color: PropTypes.string,
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fontStyle: PropTypes.oneOf(['normal', 'italic', 'oblique']),
  
  // Accessibility props
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  role: PropTypes.string,
  
  // Additional styling
  className: PropTypes.string,
  style: PropTypes.object,
};

Typography.displayName = 'Typography';

export default Typography;