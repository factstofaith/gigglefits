import React from 'react';
import PropTypes from 'prop-types';
import { styled } from "@/design-system/adapter";

/**
 * Button - A standardized button component
 * 
 * This component provides a consistent button implementation following
 * the TAP Integration Platform design system guidelines.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, text)
 * @param {string} [props.size='medium'] - Button size (small, medium, large)
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.fullWidth=false] - Whether the button should take full width
 * @param {Function} [props.onClick] - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @returns {JSX.Element} The Button component
 * 
 * @example
 * <Button 
 *   variant="primary"
 *   size="medium"
 *   onClick={() => console.log('Button clicked')}
 * >
 *   Click Me
 * </Button>
 */
function Button({
  variant,
  size,
  disabled,
  fullWidth,
  onClick,
  children,
  ...props
}) {
  // Event handlers
  const handleClick = React.useCallback((event) => {
    if (onClick && !disabled) {
      onClick(event);
    }
  }, [onClick, disabled]);

  // Derived values
  const ariaDisabled = React.useMemo(() =>
  disabled ? 'true' : undefined,
  [disabled]
  );

  // Render
  return (
    <StyledButton
      data-testid="button"
      data-variant={variant}
      data-size={size}
      data-fullwidth={fullWidth}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={ariaDisabled}
      {...props}>

      {children}
    </StyledButton>);

}

// Prop types
Button.propTypes = {
  /** Button variant (primary, secondary, text) */
  variant: PropTypes.oneOf(['primary', 'secondary', 'text']),
  /** Button size (small, medium, large) */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Whether the button is disabled */
  disabled: PropTypes.bool,
  /** Whether the button should take full width */
  fullWidth: PropTypes.bool,
  /** Click handler function */
  onClick: PropTypes.func,
  /** Button content */
  children: PropTypes.node.isRequired
};

// Default props
Button.defaultProps = {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  fullWidth: false,
  onClick: undefined
};

// Styled component
const StyledButton = styled.button`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 22px;
  font-family: ${({ theme }) => theme?.typography?.fontFamily || 'sans-serif'};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
  
  /* Size variants */
  padding: ${(props) => {
  switch (props['data-size']) {
    case 'small':
      return '0.25rem 0.75rem';
    case 'large':
      return '0.5rem 1.25rem';
    case 'medium':
    default:
      return '0.35rem 0.9rem';
  }
}};
  
  font-size: ${(props) => {
  switch (props['data-size']) {
    case 'small':
      return '0.875rem';
    case 'large':
      return '1.125rem';
    case 'medium':
    default:
      return '1rem';
  }
}};
  
  /* Width */
  width: ${(props) => props['data-fullwidth'] ? '100%' : 'auto'};
  
  /* Variant styles */
  background-color: ${(props) => {
  if (props.disabled) {
    return '#DDDDDD';
  }

  switch (props['data-variant']) {
    case 'secondary':
      return '#FFFFFF';
    case 'text':
      return 'transparent';
    case 'primary':
    default:
      return '#3B3D3D';
  }
}};
  
  color: ${(props) => {
  if (props.disabled) {
    return '#888888';
  }

  switch (props['data-variant']) {
    case 'secondary':
    case 'text':
      return '#3B3D3D';
    case 'primary':
    default:
      return '#FFFFFF';
  }
}};
  
  border: ${(props) => {
  switch (props['data-variant']) {
    case 'secondary':
      return '1px solid #3B3D3D';
    default:
      return 'none';
  }
}};
  
  /* Hover state */
  &:hover:not(:disabled) {
    background-color: ${(props) => {
  switch (props['data-variant']) {
    case 'secondary':
      return '#F5F5F5';
    case 'text':
      return 'rgba(59, 61, 61, 0.1)';
    case 'primary':
    default:
      return '#FC741C';
  }
}};
    
    transform: translateY(-1px);
  }
  
  /* Focus state */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 61, 61, 0.3);
  }
  
  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export default Button;