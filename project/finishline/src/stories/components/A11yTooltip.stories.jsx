/**
 * A11yTooltip Stories
 * 
 * Storybook documentation for the A11yTooltip component.
 */

import React from 'react';
import A11yTooltip from '../../components/common/A11yTooltip';

export default {
  title: 'Components/Common/A11yTooltip',
  component: A11yTooltip,
  parameters: {
    componentSubtitle: 'Accessible tooltip with configurable position',
    docs: {
      description: {
        component: 'Accessible tooltip with configurable position'
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
export const Default = (args) => <A11yTooltip {...args} />;
Default.args = {
  children: 'Default A11yTooltip'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yTooltip
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yTooltip>
);

// Examples specific to this component
