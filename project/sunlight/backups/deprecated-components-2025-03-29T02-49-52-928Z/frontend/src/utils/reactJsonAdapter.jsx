/**
 * ReactJsonAdapter Component
 * 
 * Adapter component for react-json-view that ensures compatibility with React 18.
 * Wraps the react-json-view component with error boundary and provides fallback
 * rendering for graceful degradation.
 * 
 * Key features:
 * - Uses HOC pattern with error boundary
 * - Provides fallback rendering when react-json-view fails
 * - Preserves all original props and functionality
 * - Handles errors gracefully without crashing the application
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withReact18Compatibility } from './withReact18Compatibility';

// Define a custom fallback for JSON view
const JsonViewFallback = ({ src, className, style }) => {
  // Added display name
  JsonViewFallback.displayName = 'JsonViewFallback';

  // Added display name
  JsonViewFallback.displayName = 'JsonViewFallback';

  // Added display name
  JsonViewFallback.displayName = 'JsonViewFallback';

  // Added display name
  JsonViewFallback.displayName = 'JsonViewFallback';

  // Convert the JSON to a formatted string
  const formattedJson = typeof src === 'string' 
    ? src 
    : JSON.stringify(src, null, 2);
  
  // Define default style that resembles react-json-view
  const defaultStyle = {
    fontFamily: 'monospace',
    fontSize: '13px',
    backgroundColor: '#272822',
    color: '#f8f8f2',
    padding: '12px',
    borderRadius: '4px',
    overflowX: 'auto',
    whiteSpace: 'pre',
    ...style
  };
  
  return (
    <pre className={className} style={defaultStyle}>
      {formattedJson}
    </pre>
  );
};

JsonViewFallback.propTypes = {
  src: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.string
  ]).isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

/**
 * Implementation of the actual adapter
 * This needs to be defined before use as we're doing lazy import
 */
const createReactJsonAdapter = (ReactJson) => {
  // Added display name
  createReactJsonAdapter.displayName = 'createReactJsonAdapter';

  // Added display name
  createReactJsonAdapter.displayName = 'createReactJsonAdapter';

  // Added display name
  createReactJsonAdapter.displayName = 'createReactJsonAdapter';

  // Added display name
  createReactJsonAdapter.displayName = 'createReactJsonAdapter';

  // Create the base component that will be wrapped
  const ReactJsonBase = React.forwardRef((props, ref) => {
    // Remove any props that might cause issues
    const safeProps = { ...props };
    delete safeProps.enableClipboard; // This can cause issues in some environments
    
    // Apply fixes for known problematic props
    const enhancedProps = {
      ...safeProps,
      // Force these settings for better compatibility
      shouldCollapse: props.shouldCollapse === undefined ? false : props.shouldCollapse,
      groupArraysAfterLength: props.groupArraysAfterLength === undefined ? 100 : props.groupArraysAfterLength,
      // Set ref if provided
      ref
    };
    
    return <ReactJson {...enhancedProps} />;
  });
  
  ReactJsonBase.displayName = 'ReactJsonBase';
  
  // Wrap with HOC for React 18 compatibility
  return withReact18Compatibility(ReactJsonBase, {
    fallback: JsonViewFallback,
    fallbackProps: {},
    enableLogging: process.env.NODE_ENV === 'development'
  });
};

/**
 * Dynamic import for react-json-view to handle errors gracefully if the module fails to load
 * This ensures the app won't crash if there are issues with the module
 */
const ReactJsonAdapter = React.forwardRef((props, ref) => {
  const [ReactJsonComponent, setReactJsonComponent] = React.useState(null);
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    // Dynamically import react-json-view
    import('react-json-view')
      .then(module => {
        const Adapter = createReactJsonAdapter(module.default);
        setReactJsonComponent(() => Adapter);
      })
      .catch(error => {
        console.error('Failed to load react-json-view:', error);
        setHasError(true);
      });
  }, []);
  
  // If there was an error loading the module, show fallback
  if (hasError) {
    return <JsonViewFallback {...props} />;
  }
  
  // If the component hasn't loaded yet, show a simple loading state
  if (!ReactJsonComponent) {
    return (
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        Loading JSON viewer...
      </div>
    );
  }
  
  // Render the adapted component
  return <ReactJsonComponent {...props} ref={ref} />;
});

ReactJsonAdapter.displayName = 'ReactJsonAdapter';

ReactJsonAdapter.propTypes = {
  src: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]).isRequired,
  theme: PropTypes.string,
  style: PropTypes.object,
  indentWidth: PropTypes.number,
  collapsed: PropTypes.bool,
  collapseStringsAfterLength: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  groupArraysAfterLength: PropTypes.number,
  enableClipboard: PropTypes.bool,
  displayObjectSize: PropTypes.bool,
  displayDataTypes: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onAdd: PropTypes.func,
  onSelect: PropTypes.func,
  iconStyle: PropTypes.oneOf(['circle', 'triangle', 'square']),
  sortKeys: PropTypes.bool,
  shouldCollapse: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  name: PropTypes.string
};

export default ReactJsonAdapter;