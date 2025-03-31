/**
 * A11yModal Stories
 * 
 * Storybook documentation for the A11yModal component.
 */

import React from 'react';
import A11yModal from '../../components/common/A11yModal';

export default {
  title: 'Components/Common/A11yModal',
  component: A11yModal,
  parameters: {
    componentSubtitle: 'Accessible modal dialog with focus trapping',
    docs: {
      description: {
        component: 'Accessible modal dialog with focus trapping'
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
export const Default = (args) => <A11yModal {...args} />;
Default.args = {
  children: 'Default A11yModal'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yModal
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yModal>
);

// Examples specific to this component
