import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Handle } from '@utils/reactFlowAdapter';

/**
 * OptimizedBaseNode
 * A performance-optimized version of BaseNode for large flows.
 * Shows a simplified representation for better performance.
 * 
 * @param {Object} data - Node data
 * @param {string} data.label - Node label
 * @param {string} data.nodeType - Type of node
 * @param {Object} data.validation - Validation state
 * @param {boolean} data.isSimplified - Whether showing simplified view
 * @param {Object} props - Additional react-flow node props
 * @returns {JSX.Element} Simplified node representation
 */
function OptimizedBaseNode({ data, ...props }) {
  // Basic type-based styling
  const nodeTypeColors = {
    source: '#2E7EED',
    destination: '#27AE60',
    transform: '#F2994A',
    filter: '#F2994A',
    dataset: '#9B51E0',
    trigger: '#EB5757',
    router: '#BB6BD9',
    action: '#F2C94C',
    default: '#888888'
  };
  
  // Get color based on node type
  const nodeColor = nodeTypeColors[data.nodeType] || nodeTypeColors.default;
  
  // Check if we have validation errors
  const hasError = data.validation && data.validation.isValid === false;
  
  // Simplified node style
  const style = {
    background: nodeColor,
    borderRadius: '4px',
    padding: '4px',
    width: '100px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: 'white',
    textAlign: 'center',
    boxShadow: hasError ? '0 0 0 2px red' : 'none',
    opacity: data.isSimplified ? 0.7 : 1,
    border: props.selected ? '2px solid #fff' : 'none'
  };
  
  // Simplified handles
  const renderHandles = () => {
  // Added display name
  renderHandles.displayName = 'renderHandles';

  // Added display name
  renderHandles.displayName = 'renderHandles';

  // Added display name
  renderHandles.displayName = 'renderHandles';

  // Added display name
  renderHandles.displayName = 'renderHandles';

  // Added display name
  renderHandles.displayName = 'renderHandles';


    // Always show at least one input and output handle
    return (
      <>
        <Handle
          type="target&quot;
          position="left"
          style={{ background: '#555', width: '8px', height: '8px' }}
        />
        <Handle
          type="source&quot;
          position="right"
          style={{ background: '#555', width: '8px', height: '8px' }}
        />
      </>
    );
  };
  
  return (
    <div style={style}>
      {data.label}
      {renderHandles()}
    </div>
  );
}

OptimizedBaseNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    nodeType: PropTypes.string.isRequired,
    validation: PropTypes.object,
    isSimplified: PropTypes.bool
  }).isRequired,
  selected: PropTypes.bool
};

// Add displayName for improved debugging in React DevTools
OptimizedBaseNode.displayName = 'OptimizedBaseNode';

// Use React.memo with custom comparison for optimization
export default memo(OptimizedBaseNode, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.data.label === nextProps.data.label &&
    prevProps.data.nodeType === nextProps.data.nodeType &&
    prevProps.data.isSimplified === nextProps.data.isSimplified &&
    prevProps.selected === nextProps.selected &&
    (prevProps.data.validation?.isValid === nextProps.data.validation?.isValid)
  );
});