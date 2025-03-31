/**
 * A11ySelect Stories
 * 
 * Storybook documentation for the A11ySelect component.
 */

import React from 'react';
import A11ySelect from '../../components/common/A11ySelect';

export default {
  title: 'Components/Common/A11ySelect',
  component: A11ySelect,
  parameters: {
    componentSubtitle: 'Accessible dropdown select with keyboard navigation',
    docs: {
      description: {
        component: 'Accessible dropdown select with keyboard navigation'
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
export const Default = (args) => <A11ySelect {...args} />;
Default.args = {
  children: 'Default A11ySelect'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11ySelect
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11ySelect>
);

// Examples specific to this component
