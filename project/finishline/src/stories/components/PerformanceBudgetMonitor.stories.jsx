/**
 * PerformanceBudgetMonitor Stories
 * 
 * Storybook documentation for the PerformanceBudgetMonitor component.
 */

import React from 'react';
import PerformanceBudgetMonitor from '../../components/performance/PerformanceBudgetMonitor';

export default {
  title: 'Components/Advanced/PerformanceBudgetMonitor',
  component: PerformanceBudgetMonitor,
  parameters: {
    componentSubtitle: 'Component for monitoring performance budgets with CI/CD integration',
    docs: {
      description: {
        component: 'Component for monitoring performance budgets with CI/CD integration'
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
export const Default = (args) => <PerformanceBudgetMonitor {...args} />;
Default.args = {
  children: 'Default PerformanceBudgetMonitor'
};

// Additional variants
export const WithPerformanceTracking = (args) => (
  <PerformanceBudgetMonitor {...args}>
    With performance tracking enabled
  </PerformanceBudgetMonitor>
);