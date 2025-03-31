/**
 * React compatibility adapters
 * 
 * This file provides compatibility adapters for different React versions
 */

import React from 'react';

/**
 * Higher-order component for React version compatibility
 * @param {React.ComponentType} Component - The component to wrap
 * @returns {React.ComponentType} - The wrapped component with version compatibility
 */
export function withReact18Compatibility(Component) {
  const WrappedComponent = (props) => {
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `React18Compatible(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}

/**
 * Creates a version-safe context for React
 * @param {*} defaultValue - The default context value
 * @returns {React.Context} - A React context with compatibility features
 */
export function createCompatContext(defaultValue) {
  return React.createContext(defaultValue);
}

/**
 * Version-safe useEffect with proper cleanup
 * @param {Function} effect - Effect callback
 * @param {Array} deps - Dependency array
 */
export function useCompatEffect(effect, deps) {
  return React.useEffect(effect, deps);
}

export default {
  withReact18Compatibility,
  createCompatContext,
  useCompatEffect
};
