/**
 * TestDashboard Story
 * 
 * Dashboard for visualizing test results and coverage
 */
import React from 'react';
import { Story, Meta } from '@storybook/react';

import TestDashboard from '../components/codeQuality/TestDashboard';

export default {
  title: 'Code Quality/TestDashboard',
  component: TestDashboard,
  argTypes: {
    // Control definitions will be added during enhancement
  },
} as Meta;

const Template: Story = (args) => <TestDashboard {...args} />;

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
