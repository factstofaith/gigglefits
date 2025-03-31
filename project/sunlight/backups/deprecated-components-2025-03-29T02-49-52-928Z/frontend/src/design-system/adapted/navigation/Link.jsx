/**
 * @component Link
 * @description An accessible link component that adapts Material UI's Link
 * with enhanced accessibility and tracking features.
 * 
 * @typedef {import('../../types/navigation').LinkProps} LinkProps
 * @type {React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>}
 * 
 * @example
 * // Basic usage
 * <LinkAdapted href="/dashboard&quot;>Dashboard</LinkAdapted>
 * 
 * // External link with security attributes
 * <LinkAdapted href="https://example.com" target="_blank&quot;>
 *   External Link
 * </LinkAdapted>
 * 
 * // Custom styling
 * <LinkAdapted 
 *   href="/settings" 
 *   color="secondary&quot; 
 *   underline="always"
 * >
 *   Settings
 * </LinkAdapted>
 */
import React from 'react';
import PropTypes from 'prop-types';
import { getAriaAttributes } from '@utils/accessibilityUtils';

// Color mapping from semantic colors to tokens
const colorMapping = {
  primary: '#1976d2',      // From color tokens
  secondary: '#9c27b0',    // From color tokens
  inherit: 'inherit',
  textPrimary: 'rgba(0, 0, 0, 0.87)',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  error: '#d32f2f',        // From color tokens
};

/**
 * LinkAdapted - Enhanced link component
 */
const Link = React.memo(React.forwardRef(({
  // Link properties
  href,
  target,
  rel,
  children,
  color = 'primary',
  underline = 'hover',
  
  // Event handlers
  onClick,
  
  // Accessibility
  ariaLabel,
  ariaDescribedBy,
  ariaControls,
  ariaExpanded,
  
  // Styling
  className,
  variant,
  
  // Additional props
  ...otherProps
}, ref) => {
  // Set rel for security if target is _blank
  const secureRel = target === '_blank' ? rel || 'noopener noreferrer' : rel;
  
  // Generate style based on props
  const style = {
    color: colorMapping[color] || color,
    textDecoration: underline === 'always' ? 'underline' : 'none',
    cursor: href || onClick ? 'pointer' : 'default',
    fontWeight: variant === 'button' ? 500 : 'inherit',
    ...otherProps.style,
  };
  
  // Add hover effect
  const hoverStyle = underline === 'hover' ? {
    '&:hover': {
      textDecoration: 'underline',
    }
  } : {};
  
  // Track link clicks if analytics is available
  const handleClick = (e) => {
  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';


    // Call original onClick handler
    if (onClick) {
      onClick(e);
    }
    
    // Track link click in analytics if window.trackEvent exists
    if (href && window.trackEvent && !e.defaultPrevented) {
      window.trackEvent('Link Click', {
        href,
        text: typeof children === 'string' ? children : null,
        target,
      });
    }
  };
  
  // Generate accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    describedBy: ariaDescribedBy,
    controls: ariaControls,
    expanded: ariaExpanded,
  });
  
  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={secureRel}
      style={{...style, ...hoverStyle}}
      className={`ds-link ds-link-adapted ${className || ''}`}
      onClick={handleClick}
      {...ariaAttributes}
      {...otherProps}
    >
      {children}
    </a>
  );
}));

LinkAdapted.propTypes = {
  href: PropTypes.string,
  target: PropTypes.string,
  rel: PropTypes.string,
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    'primary', 
    'secondary', 
    'textPrimary', 
    'textSecondary', 
    'error', 
    'inherit'
  ]),
  underline: PropTypes.oneOf(['always', 'hover', 'none']),
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaControls: PropTypes.string,
  ariaExpanded: PropTypes.bool,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['text', 'button']),
};

Link.displayName = 'Link';

export default Link;