/**
 * A11yTabs Stories
 * 
 * Storybook documentation for the A11yTabs component.
 */

import React from 'react';
import A11yTabs from '../../components/common/A11yTabs';

export default {
  title: 'Components/Common/A11yTabs',
  component: A11yTabs,
  parameters: {
    componentSubtitle: 'Accessible tabbed interface with keyboard navigation',
    docs: {
      description: {
        component: 'Accessible tabbed interface with keyboard navigation'
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
export const Default = (args) => <A11yTabs {...args} />;
Default.args = {
  children: 'Default A11yTabs'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yTabs
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yTabs>
);

// Examples specific to this component
