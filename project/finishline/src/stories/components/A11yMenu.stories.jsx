/**
 * A11yMenu Stories
 * 
 * Storybook documentation for the A11yMenu component.
 */

import React from 'react';
import A11yMenu from '../../components/common/A11yMenu';

export default {
  title: 'Components/Common/A11yMenu',
  component: A11yMenu,
  parameters: {
    componentSubtitle: 'Accessible dropdown menu with keyboard navigation',
    docs: {
      description: {
        component: 'Accessible dropdown menu with keyboard navigation'
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
export const Default = (args) => <A11yMenu {...args} />;
Default.args = {
  children: 'Default A11yMenu'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yMenu
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yMenu>
);

// Examples specific to this component
