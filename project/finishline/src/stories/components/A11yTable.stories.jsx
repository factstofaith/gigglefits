/**
 * A11yTable Stories
 * 
 * Storybook documentation for the A11yTable component.
 */

import React from 'react';
import A11yTable from '../../components/common/A11yTable';

export default {
  title: 'Components/Common/A11yTable',
  component: A11yTable,
  parameters: {
    componentSubtitle: 'Accessible data table with sorting and pagination',
    docs: {
      description: {
        component: 'Accessible data table with sorting and pagination'
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
export const Default = (args) => <A11yTable {...args} />;
Default.args = {
  children: 'Default A11yTable'
};

// Variants
export const WithAriaAttributes = (args) => (
  <A11yTable
    ariaLabel="Example label"
    ariaLabelledBy="labelId"
    ariaDescribedBy="descId"
    {...args}
  >
    With ARIA attributes
  </A11yTable>
);

// Examples specific to this component
