/**
 * dynamicImportSplitter Stories
 * 
 * Storybook documentation for the dynamicImportSplitter utility.
 */

import React from 'react';
import { dynamicImportSplitter } from '../../utils/dynamicImportSplitter';

export default {
  title: 'Utilities/Advanced/dynamicImportSplitter',
  
  parameters: {
    componentSubtitle: 'Advanced code splitting utility for dynamic imports',
    docs: {
      description: {
        component: 'Advanced code splitting utility for dynamic imports'
      }
    }
  }
};

// Example usage
export const BasicUsage = () => {
  return (
    <div>
      <h2>dynamicImportSplitter Example</h2>
      <pre>
        {
          // Code example would go here
          `import { dynamicImportSplitter } from '../../utils/dynamicImportSplitter';
          
// Use the utility
const optimizer = dynamicImportSplitter({ 
  // configuration options 
});

// Optimize your application
const result = optimizer.process(myData);`
        }
      </pre>
    </div>
  );
};