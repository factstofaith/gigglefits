/**
 * AccessibilityMonitor Stories
 * 
 * Storybook documentation for the AccessibilityMonitor component.
 */

import React from 'react';
import AccessibilityMonitor from '../../components/performance/AccessibilityMonitor';

export default {
  title: 'Components/Advanced/AccessibilityMonitor',
  component: AccessibilityMonitor,
  parameters: {
    componentSubtitle: 'Accessibility compliance monitoring component',
    docs: {
      description: {
        component: 'Accessibility compliance monitoring component'
      }
    }
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Content of the component',
      defaultValue: 'Component content'
    },
    className: {
      control: 'text',
      description: 'Additional CSS class'
    }
  }
};

// Default component story
export const Default = (args) => <AccessibilityMonitor {...args} />;
Default.args = {
  children: 'Default AccessibilityMonitor'
};

// Additional variants
export const WithPerformanceTracking = (args) => (
  <AccessibilityMonitor {...args}>
    With performance tracking enabled
  </AccessibilityMonitor>
);