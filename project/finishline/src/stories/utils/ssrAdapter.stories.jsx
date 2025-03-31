/**
 * ssrAdapter Stories
 * 
 * Storybook documentation for the ssrAdapter utility.
 */

import React from 'react';
import { ssrAdapter } from '../../utils/ssrAdapter';

export default {
  title: 'Utilities/Advanced/ssrAdapter',
  
  parameters: {
    componentSubtitle: 'Server-side rendering adapter for components',
    docs: {
      description: {
        component: 'Server-side rendering adapter for components'
      }
    }
  }
};

// Example usage
export const BasicUsage = () => {
  return (
    <div>
      <h2>ssrAdapter Example</h2>
      <pre>
        {
          // Code example would go here
          `import { ssrAdapter } from '../../utils/ssrAdapter';
          
// Use the utility
const optimizer = ssrAdapter({ 
  // configuration options 
});

// Optimize your application
const result = optimizer.process(myData);`
        }
      </pre>
    </div>
  );
};