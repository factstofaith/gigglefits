/**
 * A11yForm Stories
 * 
 * Storybook documentation for the A11yForm component.
 */

import React from 'react';
import A11yForm from '../../components/common/A11yForm';

export default {
  title: 'Components/Common/A11yForm',
  component: A11yForm,
  parameters: {
    componentSubtitle: 'Accessible form component with validation and screen reader support',
    docs: {
      description: {
        component: 'Accessible form component with validation and screen reader support'
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
export const Default = (args) => <A11yForm {...args} />;
Default.args = {
  children: 'Default A11yForm'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yForm
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yForm>
);

// Examples specific to this component
