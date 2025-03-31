/**
 * RuntimePerformanceMonitor Stories
 * 
 * Storybook documentation for the RuntimePerformanceMonitor component.
 */

import React from 'react';
import RuntimePerformanceMonitor from '../../components/performance/RuntimePerformanceMonitor';

export default {
  title: 'Components/Advanced/RuntimePerformanceMonitor',
  component: RuntimePerformanceMonitor,
  parameters: {
    componentSubtitle: 'Runtime performance monitoring component',
    docs: {
      description: {
        component: 'Runtime performance monitoring component'
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
export const Default = (args) => <RuntimePerformanceMonitor {...args} />;
Default.args = {
  children: 'Default RuntimePerformanceMonitor'
};

// Additional variants
export const WithPerformanceTracking = (args) => (
  <RuntimePerformanceMonitor {...args}>
    With performance tracking enabled
  </RuntimePerformanceMonitor>
);