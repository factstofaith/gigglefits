import React from 'react';
import PropTypes from 'prop-types';
import { styled } from "@/design-system/styled";
import { useComponentExample } from './hooks/useComponentExample';

/**
 * ComponentExample - Example of a standardized component structure
 * 
 * This component demonstrates the recommended structure for components
 * in the TAP Integration Platform, including hooks integration, prop types,
 * and styling.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - The name to display
 * @param {string} [props.description] - Optional description text
 * @param {boolean} [props.isHighlighted=false] - Whether the component is highlighted
 * @param {Function} [props.onAction] - Action handler function
 * @returns {JSX.Element} The ComponentExample component
 * 
 * @example
 * <ComponentExample 
 *   name="Example" 
 *   description="This is an example"
 *   isHighlighted={true}
 *   onAction={() => console.log('Action triggered')}
 * />
 */
function ComponentExample({
  name,
  description,
  isHighlighted,
  onAction
}) {
  // Use custom hook for component logic
  const {
    count,
    incrementCount,
    decrementCount,
    resetCount
  } = useComponentExample();

  // Derived state
  const displayName = React.useMemo(() => `${name}${isHighlighted ? ' (Highlighted)' : ''}`, [name, isHighlighted]);

  // Event handlers
  const handleAction = React.useCallback(() => {
    if (onAction) {
      onAction({
        name,
        count
      });
    }
  }, [onAction, name, count]);

  // Side effects
  React.useEffect(() => {
    // Log component mount
    console.log(`ComponentExample mounted with name: ${name}`);

    // Cleanup
    return () => {
      console.log(`ComponentExample unmounted with name: ${name}`);
    };
  }, [name]);

  // Render
  return <StyledComponentExample data-testid="component-example" data-highlighted={isHighlighted}>
      <div className="header">
        <h2>{displayName}</h2>
        {description && <p className="description">{description}</p>}
      </div>
      
      <div className="content">
        <div className="counter">
          <p>Count: {count}</p>
          <div className="actions">
            <button onClick={decrementCount}>-</button>
            <button onClick={resetCount}>Reset</button>
            <button onClick={incrementCount}>+</button>
          </div>
        </div>
        
        <button className="action-button" onClick={handleAction} disabled={!onAction}>
          Trigger Action
        </button>
      </div>
    </StyledComponentExample>;
}

// Prop types
ComponentExample.propTypes = {
  /** The name to display in the component */
  name: PropTypes.string.isRequired,
  /** Optional description text */
  description: PropTypes.string,
  /** Whether the component should be highlighted */
  isHighlighted: PropTypes.bool,
  /** Action handler function */
  onAction: PropTypes.func
};

// Default props
ComponentExample.defaultProps = {
  description: '',
  isHighlighted: false,
  onAction: undefined
};

// Styled component
const StyledComponentExample = styled.div`
  /* Base styles */
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* Variant styles */
  background-color: ${(props) => props['data-highlighted'] ? '#FDF9E5' : '#ffffff'};
  
  border: 1px solid ${(props) => props['data-highlighted'] ? '#F9EAB5' : '#e0e0e0'};
  
  /* Child element styles */
  .header {
    margin-bottom: 16px;
    
    h2 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
    
    .description {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }
  
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .counter {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      
      p {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
      }
      
      .actions {
        display: flex;
        gap: 8px;
        
        button {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          border: 1px solid #ddd;
          background-color: #f5f5f5;
          cursor: pointer;
          
          &:hover {
            background-color: #e0e0e0;
          }
        }
      }
    }
    
    .action-button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      background-color: #1976d2;
      color: white;
      cursor: pointer;
      
      &:hover {
        background-color: #1565c0;
      }
      
      &:disabled {
        background-color: #e0e0e0;
        color: #9e9e9e;
        cursor: not-allowed;
      }
    }
  }
`;
export default ComponentExample;