/**
 * CodeQualityDashboard Story
 * 
 * Dashboard component for visualizing code quality metrics
 */
import React from 'react';
import { Story, Meta } from '@storybook/react';

import CodeQualityDashboard from '../components/codeQuality/CodeQualityDashboard';

export default {
  title: 'Code Quality/CodeQualityDashboard',
  component: CodeQualityDashboard,
  argTypes: {
    // Control definitions will be added during enhancement
  },
} as Meta;

const Template: Story = (args) => <CodeQualityDashboard {...args} />;

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
