/**
 * bundleSizeOptimizer Stories
 * 
 * Storybook documentation for the bundleSizeOptimizer utility.
 */

import React from 'react';
import { bundleSizeOptimizer } from '../../utils/bundleSizeOptimizer';

export default {
  title: 'Utilities/Advanced/bundleSizeOptimizer',
  
  parameters: {
    componentSubtitle: 'Advanced bundle size optimization utilities',
    docs: {
      description: {
        component: 'Advanced bundle size optimization utilities'
      }
    }
  }
};

// Example usage
export const BasicUsage = () => {
  return (
    <div>
      <h2>bundleSizeOptimizer Example</h2>
      <pre>
        {
          // Code example would go here
          `import { bundleSizeOptimizer } from '../../utils/bundleSizeOptimizer';
          
// Use the utility
const optimizer = bundleSizeOptimizer({ 
  // configuration options 
});

// Optimize your application
const result = optimizer.process(myData);`
        }
      </pre>
    </div>
  );
};