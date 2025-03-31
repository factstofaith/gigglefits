/**
 * ComponentTemplate
 * 
 * A standardized template for creating components with best practices.
 * Use this as a starting point for new components.
 * 
 * @module components/common/ComponentTemplate
 */

import React, { forwardRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Component description - what it does and when to use it
 * 
 * @param {Object} props - Component props
 * @param {string} props.propName - Description of the prop
 * @param {Function} props.onChange - Callback when component value changes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The component
 */
const ComponentTemplate = forwardRef(({
  // Required props
  propName,
  onChange,
  
  // Optional props with defaults
  variant = 'default',
  disabled = false,
  className = '',
  
  // Rest props
  ...rest
}, ref) => {
  // State
  const [state, setState] = useState(null);
  
  // Callbacks
  const handleClick = useCallback((event) => {
    // Do something on click
    if (onChange) {
      onChange(event);
    }
  }, [onChange]);
  
  // Effects
  // useEffect(() => {
  //   // Side effect logic
  //   return () => {
  //     // Cleanup logic
  //   };
  // }, [dependencies]);
  
  // Render helpers
  const getClassNames = () => {
    return [
      'component-template',
      `component-template--${variant}`,
      disabled ? 'component-template--disabled' : '',
      className,
    ].filter(Boolean).join(' ');
  };
  
  // Render
  return (
    <div 
      ref={ref}
      className={getClassNames()}
      onClick={handleClick}
      data-testid="component-template"
      {...rest}
    >
      {propName}
    </div>
  );
});

// Display name for debugging
ComponentTemplate.displayName = 'ComponentTemplate';

// Prop types for documentation and validation
ComponentTemplate.propTypes = {
  /** Description of the prop */
  propName: PropTypes.string.isRequired,
  
  /** Callback when component value changes */
  onChange: PropTypes.func.isRequired,
  
  /** Visual variant of the component */
  variant: PropTypes.oneOf(['default', 'primary', 'secondary']),
  
  /** Whether the component is disabled */
  disabled: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default ComponentTemplate;