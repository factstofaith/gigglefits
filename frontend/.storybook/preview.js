/** @type { import('@storybook/react').Preview } */
import React from 'react';
import { ThemeProvider } from '../src/design-system/foundations/theme/ThemeProvider';

const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialMode="light">
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;