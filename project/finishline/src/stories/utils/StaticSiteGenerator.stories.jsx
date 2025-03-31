/**
 * StaticSiteGenerator Stories
 * 
 * Storybook documentation for the StaticSiteGenerator utility.
 */

import React from 'react';
import { StaticSiteGenerator } from '../../utils/StaticSiteGenerator';

export default {
  title: 'Utilities/Advanced/StaticSiteGenerator',
  
  parameters: {
    componentSubtitle: 'Static site generation utility for documentation',
    docs: {
      description: {
        component: 'Static site generation utility for documentation'
      }
    }
  }
};

// Example usage
export const BasicUsage = () => {
  return (
    <div>
      <h2>StaticSiteGenerator Example</h2>
      <pre>
        {
          // Code example would go here
          `import { StaticSiteGenerator } from '../../utils/StaticSiteGenerator';
          
// Use the utility
const optimizer = StaticSiteGenerator({ 
  // configuration options 
});

// Optimize your application
const result = optimizer.process(myData);`
        }
      </pre>
    </div>
  );
};