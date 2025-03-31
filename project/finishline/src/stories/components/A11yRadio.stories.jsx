/**
 * A11yRadio Stories
 * 
 * Storybook documentation for the A11yRadio component.
 */

import React from 'react';
import A11yRadio from '../../components/common/A11yRadio';

export default {
  title: 'Components/Common/A11yRadio',
  component: A11yRadio,
  parameters: {
    componentSubtitle: 'Accessible radio button component with label',
    docs: {
      description: {
        component: 'Accessible radio button component with label'
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
export const Default = (args) => <A11yRadio {...args} />;
Default.args = {
  children: 'Default A11yRadio'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yRadio
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yRadio>
);

// Examples specific to this component
