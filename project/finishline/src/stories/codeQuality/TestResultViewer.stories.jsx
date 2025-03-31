/**
 * TestResultViewer Story
 * 
 * Detailed view of test results with filtering
 */
import React from 'react';
import { Story, Meta } from '@storybook/react';

import TestResultViewer from '../components/codeQuality/TestResultViewer';

export default {
  title: 'Code Quality/TestResultViewer',
  component: TestResultViewer,
  argTypes: {
    // Control definitions will be added during enhancement
  },
} as Meta;

const Template: Story = (args) => <TestResultViewer {...args} />;

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
