/**
 * ErrorTrackingSystem Stories
 * 
 * Storybook documentation for the ErrorTrackingSystem component.
 */

import React from 'react';
import ErrorTrackingSystem from '../../components/performance/ErrorTrackingSystem';

export default {
  title: 'Components/Advanced/ErrorTrackingSystem',
  component: ErrorTrackingSystem,
  parameters: {
    componentSubtitle: 'Error tracking and reporting system',
    docs: {
      description: {
        component: 'Error tracking and reporting system'
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
export const Default = (args) => <ErrorTrackingSystem {...args} />;
Default.args = {
  children: 'Default ErrorTrackingSystem'
};

// Additional variants
export const WithPerformanceTracking = (args) => (
  <ErrorTrackingSystem {...args}>
    With performance tracking enabled
  </ErrorTrackingSystem>
);