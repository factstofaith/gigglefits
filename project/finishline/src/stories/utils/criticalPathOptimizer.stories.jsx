/**
 * criticalPathOptimizer Stories
 * 
 * Storybook documentation for the criticalPathOptimizer utility.
 */

import React from 'react';
import { criticalPathOptimizer } from '../../utils/criticalPathOptimizer';

export default {
  title: 'Utilities/Advanced/criticalPathOptimizer',
  
  parameters: {
    componentSubtitle: 'Utility for optimizing critical rendering path with priority loading',
    docs: {
      description: {
        component: 'Utility for optimizing critical rendering path with priority loading'
      }
    }
  }
};

// Example usage
export const BasicUsage = () => {
  return (
    <div>
      <h2>criticalPathOptimizer Example</h2>
      <pre>
        {
          // Code example would go here
          `import { criticalPathOptimizer } from '../../utils/criticalPathOptimizer';
          
// Use the utility
const optimizer = criticalPathOptimizer({ 
  // configuration options 
});

// Optimize your application
const result = optimizer.process(myData);`
        }
      </pre>
    </div>
  );
};