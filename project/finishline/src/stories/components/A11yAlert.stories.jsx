/**
 * A11yAlert Stories
 * 
 * Storybook documentation for the A11yAlert component.
 */

import React from 'react';
import A11yAlert from '../../components/common/A11yAlert';

export default {
  title: 'Components/Common/A11yAlert',
  component: A11yAlert,
  parameters: {
    componentSubtitle: 'Accessible alert component with role and live region',
    docs: {
      description: {
        component: 'Accessible alert component with role and live region'
      }
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          }
        ]
      }
    }
  },
  argTypes: {
    // Define control types for component props
    children: {
      control: 'text',
      description: 'Content of the component',
      defaultValue: 'Component content'
    },
    className: {
      control: 'text',
      description: 'Additional CSS class'
    },
    style: {
      control: 'object',
      description: 'Additional inline styles'
    }
  }
};

// Default component story
export const Default = (args) => <A11yAlert {...args} />;
Default.args = {
  children: 'Default A11yAlert'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yAlert
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yAlert>
);

// Examples specific to this component
