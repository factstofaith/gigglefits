/**
 * Mock for utils/codeSplitting.js
 */
import React, { lazy } from 'react';

// Simply pass through the component from the import promise
export const lazyRoute = (importFunc) => {
  return () => {
    const Component = lazy(importFunc);
    return <Component />;
  };
};