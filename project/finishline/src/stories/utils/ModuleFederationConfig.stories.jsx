/**
 * ModuleFederationConfig Stories
 * 
 * Storybook documentation for the ModuleFederationConfig utility.
 */

import React from 'react';
import { ModuleFederationConfig } from '../../utils/ModuleFederationConfig';

export default {
  title: 'Utilities/Advanced/ModuleFederationConfig',
  
  parameters: {
    componentSubtitle: 'Module federation configuration for micro frontends',
    docs: {
      description: {
        component: 'Module federation configuration for micro frontends'
      }
    }
  }
};

// Example usage
export const BasicUsage = () => {
  return (
    <div>
      <h2>ModuleFederationConfig Example</h2>
      <pre>
        {
          // Code example would go here
          `import { ModuleFederationConfig } from '../../utils/ModuleFederationConfig';
          
// Use the utility
const optimizer = ModuleFederationConfig({ 
  // configuration options 
});

// Optimize your application
const result = optimizer.process(myData);`
        }
      </pre>
    </div>
  );
};