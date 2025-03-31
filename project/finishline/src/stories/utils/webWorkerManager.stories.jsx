/**
 * webWorkerManager Stories
 * 
 * Storybook documentation for the webWorkerManager utility.
 */

import React from 'react';
import { webWorkerManager } from '../../utils/webWorkerManager';

export default {
  title: 'Utilities/Advanced/webWorkerManager',
  
  parameters: {
    componentSubtitle: 'Web worker support for CPU-intensive tasks',
    docs: {
      description: {
        component: 'Web worker support for CPU-intensive tasks'
      }
    }
  }
};

// Example usage
export const BasicUsage = () => {
  return (
    <div>
      <h2>webWorkerManager Example</h2>
      <pre>
        {
          // Code example would go here
          `import { webWorkerManager } from '../../utils/webWorkerManager';
          
// Use the utility
const optimizer = webWorkerManager({ 
  // configuration options 
});

// Optimize your application
const result = optimizer.process(myData);`
        }
      </pre>
    </div>
  );
};