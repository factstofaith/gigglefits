import React from 'react';
import PropTypes from 'prop-types';
import { styled } from "@/design-system/styled";

/**
 * ComponentTemplate - A template for creating standardized components
 * 
 * This component serves as a reference implementation for the TAP Integration Platform
 * component architecture. Use this template when creating new components to ensure
 * consistency across the codebase.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The component title
 * @param {string} [props.variant='default'] - The component variant
 * @param {boolean} [props.isActive=false] - Whether the component is active
 * @param {Function} [props.onClick] - Click handler function
 * @param {React.ReactNode} props.children - Child elements
 * @returns {JSX.Element} The ComponentTemplate component
 * 
 * @example
 * <ComponentTemplate 
 *   title="Example Component" 
 *   variant="primary" 
 *   isActive={true}
 *   onClick={() => console.log('Clicked!')}
 * >
 *   This is an example component.
 * </ComponentTemplate>
 */
function ComponentTemplate({
  title,
  variant,
  isActive,
  onClick,
  children
}) {
  // State management (if needed)
  const [isHovered, setIsHovered] = React.useState(false);

  // Derived values (using useMemo for expensive computations)
  const ariaLabel = React.useMemo(() =>
  `Component ${title} is ${isActive ? 'active' : 'inactive'}`,
  [title, isActive]
  );

  // Event handlers (using useCallback to prevent unnecessary recreations)
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  // Side effects (if needed)
  React.useEffect(() => {
    // Execute side effects (e.g., logging, analytics)
    console.log(`ComponentTemplate "${title}" mounted`);

    // Cleanup function
    return () => {
      console.log(`ComponentTemplate "${title}" unmounted`);
    };
  }, [title]);

  // Conditional rendering logic
  if (!title) {
    return null;
  }

  // Main render
  return (
    <StyledComponent
      data-testid="component-template"
      data-variant={variant}
      data-active={isActive}
      data-hovered={isHovered}
      aria-label={ariaLabel}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>

      <div className="component-header">
        <h2 className="component-title">{title}</h2>
      </div>
      <div className="component-content">
        {children}
      </div>
    </StyledComponent>);

}

// Prop types (with descriptions for better documentation)
ComponentTemplate.propTypes = {
  /** The component title displayed in the header */
  title: PropTypes.string.isRequired,
  /** The component variant (default, primary, secondary) */
  variant: PropTypes.oneOf(['default', 'primary', 'secondary']),
  /** Whether the component is in active state */
  isActive: PropTypes.bool,
  /** Click handler function */
  onClick: PropTypes.func,
  /** Component content */
  children: PropTypes.node
};

// Default props
ComponentTemplate.defaultProps = {
  variant: 'default',
  isActive: false,
  onClick: undefined,
  children: null
};

// Styled component (using design system styled-components)
const StyledComponent = styled.div`
  /* Base styles */
  border-radius: 4px;
  padding: 16px;
  transition: all 0.2s ease;
  
  /* Variant styles */
  background-color: ${(props) =>
props['data-variant'] === 'primary' ? '#e3f2fd' :
props['data-variant'] === 'secondary' ? '#f5f5f5' :
'#ffffff'};
  
  border: 1px solid ${
(props) =>
props['data-variant'] === 'primary' ? '#bbdefb' :
props['data-variant'] === 'secondary' ? '#e0e0e0' :
'#f0f0f0'};
  
  /* State styles */
  opacity: ${
(props) => props['data-active'] ? 1 : 0.8};
  box-shadow: ${(props) =>
props['data-hovered'] ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none'};
  
  /* Child element styles */
  .component-header {
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
  }
  
  .component-title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: #333;
  }
  
  .component-content {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
  }
`;


export default ComponentTemplate;