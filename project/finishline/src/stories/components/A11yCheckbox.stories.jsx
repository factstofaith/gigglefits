/**
 * A11yCheckbox Stories
 * 
 * Storybook documentation for the A11yCheckbox component.
 */

import React from 'react';
import A11yCheckbox from '../../components/common/A11yCheckbox';

export default {
  title: 'Components/Common/A11yCheckbox',
  component: A11yCheckbox,
  parameters: {
    componentSubtitle: 'Accessible checkbox component with label',
    docs: {
      description: {
        component: 'Accessible checkbox component with label'
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
export const Default = (args) => <A11yCheckbox {...args} />;
Default.args = {
  children: 'Default A11yCheckbox'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yCheckbox
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yCheckbox>
);

// Examples specific to this component
