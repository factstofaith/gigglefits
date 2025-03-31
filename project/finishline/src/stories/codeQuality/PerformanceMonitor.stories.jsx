/**
 * PerformanceMonitor Story
 * 
 * Performance test results visualization
 */
import React from 'react';
import { Story, Meta } from '@storybook/react';

import PerformanceMonitor from '../components/codeQuality/PerformanceMonitor';

export default {
  title: 'Code Quality/PerformanceMonitor',
  component: PerformanceMonitor,
  argTypes: {
    // Control definitions will be added during enhancement
  },
} as Meta;

const Template: Story = (args) => <PerformanceMonitor {...args} />;

export const Default = Template.bind({});
Default.args = {
  // Default props will be added during enhancement
};

export const WithData = Template.bind({});
WithData.args = {
  // Data example props will be added during enhancement
};

export const WithError = Template.bind({});
WithError.args = {
  // Error state props will be added during enhancement
  error: 'Example error message'
};
