/**
 * React 18 Compatibility Adapters
 * 
 * This module provides adapter components for libraries with React 18 compatibility issues.
 * Each adapter implements an error boundary and fallback component to ensure graceful
 * degradation if the underlying component fails.
 */

import React from 'react';
import ReactJsonAdapter from './reactJsonAdapter.jsx';

// Re-export adapters
export { ReactJsonAdapter };

/**
 * Higher-order component that adds React 18 compatibility to any component
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {React.ComponentType} options.FallbackComponent - Component to render if the wrapped component fails
 * @param {Function} options.onError - Function to call when an error occurs
 * @returns {React.ComponentType} - The wrapped component with React 18 compatibility
 */
export const withReact18Compatibility = (Component, options = {}) => {
  // Added display name
  withReact18Compatibility.displayName = 'withReact18Compatibility';

  // Added display name
  withReact18Compatibility.displayName = 'withReact18Compatibility';

  // Added display name
  withReact18Compatibility.displayName = 'withReact18Compatibility';

  // Added display name
  withReact18Compatibility.displayName = 'withReact18Compatibility';

  const {
    FallbackComponent = DefaultFallback,
    onError = () => {}
  } = options;

  // Create an error boundary wrapper
  class React18CompatibilityWrapper extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error(`React 18 compatibility error in ${Component.displayName || 'Component'}:`, error);
      onError(error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return <FallbackComponent error={this.state.error} {...this.props} />;
      }

      return <Component {...this.props} />;
    }
  }

  React18CompatibilityWrapper.displayName = `withReact18Compatibility(${Component.displayName || Component.name || 'Component'})`;
  
  return React18CompatibilityWrapper;
};

// Default fallback component
const DefaultFallback = ({ error, ...props }) => {
  // Added display name
  DefaultFallback.displayName = 'DefaultFallback';

  // Added display name
  DefaultFallback.displayName = 'DefaultFallback';

  // Added display name
  DefaultFallback.displayName = 'DefaultFallback';

  // Added display name
  DefaultFallback.displayName = 'DefaultFallback';

  return (
    <div style={{
      padding: '16px',
      border: '1px solid #f44336',
      borderRadius: '4px',
      backgroundColor: '#ffebee',
      color: '#d32f2f'
    }}>
      <h3>Component Error</h3>
      <p>This component failed to render properly.</p>
      {process.env.NODE_ENV !== 'production' && (
        <details>
          <summary>Error details (only visible in development)</summary>
          <pre>{error && error.toString()}</pre>
        </details>
      )}
    </div>
  );
};

DefaultFallback.displayName = 'DefaultFallback';

/**
 * ReactFlow adapter for React 18 compatibility
 * 
 * This component wraps ReactFlow with proper error boundaries and React 18 compatibility.
 * It provides a fallback visualization when ReactFlow fails to render.
 */
export const ReactFlowAdapter = withReact18Compatibility(React.lazy(() => import('reactflow')), {
  FallbackComponent: ReactFlowFallback,
  onError: (error) => {
    console.error('ReactFlow compatibility error:', error);
  }
});

// Fallback component for ReactFlow
const ReactFlowFallback = ({ nodes, edges, ...props }) => {
  // Added display name
  ReactFlowFallback.displayName = 'ReactFlowFallback';

  // Added display name
  ReactFlowFallback.displayName = 'ReactFlowFallback';

  // Added display name
  ReactFlowFallback.displayName = 'ReactFlowFallback';

  // Added display name
  ReactFlowFallback.displayName = 'ReactFlowFallback';

  return (
    <div style={{
      padding: '20px',
      border: '1px dashed #ccc',
      borderRadius: '8px',
      backgroundColor: '#f8f8f8',
      height: props.style?.height || '400px',
      width: props.style?.width || '100%',
      overflow: 'auto'
    }}>
      <h3>Flow Visualization</h3>
      <p>The interactive flow visualization could not be loaded.</p>
      
      {nodes && nodes.length > 0 && (
        <div>
          <h4>Nodes ({nodes.length})</h4>
          <ul>
            {nodes.map(node => (
              <li key={node.id}>
                {node.data?.label || node.id} - {node.type || 'default'} 
                {node.data && ' (Has data)'}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {edges && edges.length > 0 && (
        <div>
          <h4>Connections ({edges.length})</h4>
          <ul>
            {edges.map(edge => (
              <li key={edge.id}>
                {edge.source} → {edge.target}
                {edge.label && ` (${edge.label})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

ReactFlowFallback.displayName = 'ReactFlowFallback';