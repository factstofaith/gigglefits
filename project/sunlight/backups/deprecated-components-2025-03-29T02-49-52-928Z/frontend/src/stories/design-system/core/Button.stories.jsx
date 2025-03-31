import React from 'react';
import { Button } from '@design-system/components/core/Button';
import { ThemeProvider } from '@design-system/foundations/theme/ThemeProvider';

export default {
  title: 'Design System/Core/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider initialMode="light&quot;>
        <div style={{ padding: "2rem' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
      description: 'The variant of the button',
      defaultValue: 'contained',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'success', 'info'],
      description: 'The color of the button',
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the button',
      defaultValue: 'medium',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      defaultValue: false,
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take up the full width of its container',
      defaultValue: false,
    },
    onClick: { action: 'clicked' },
  },
};

// Default button
export const Default = {
  args: {
    children: 'Button',
  },
};

// Primary button
export const Primary = {
  args: {
    variant: 'contained',
    color: 'primary',
    children: 'Primary Button',
  },
};

// Secondary button
export const Secondary = {
  args: {
    variant: 'contained',
    color: 'secondary',
    children: 'Secondary Button',
  },
};

// Error button
export const Error = {
  args: {
    variant: 'contained',
    color: 'error',
    children: 'Error Button',
  },
};

// Outlined button
export const Outlined = {
  args: {
    variant: 'outlined',
    color: 'primary',
    children: 'Outlined Button',
  },
};

// Text button
export const Text = {
  args: {
    variant: 'text',
    color: 'primary',
    children: 'Text Button',
  },
};

// Small button
export const Small = {
  args: {
    size: 'small',
    children: 'Small Button',
  },
};

// Large button
export const Large = {
  args: {
    size: 'large',
    children: 'Large Button',
  },
};

// Disabled button
export const Disabled = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

// Full width button
export const FullWidth = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// Button with icon
export const WithIcon = {
  args: {
    children: 'Button with Icon',
    startIcon: (
      <svg 
        width="20&quot; 
        height="20" 
        viewBox="0 0 24 24&quot; 
        fill="currentColor"
        style={{ display: 'inline-block' }}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5&quot; />
      </svg>
    ),
  },
};

// Button variants showcase
export const Variants = () => (
  <div style={{ display: "flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="contained&quot; color="primary">Contained</Button>
      <Button variant="outlined&quot; color="primary">Outlined</Button>
      <Button variant="text&quot; color="primary">Text</Button>
    </div>
  </div>
);

// Button colors showcase
export const Colors = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button color="primary&quot;>Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="error&quot;>Error</Button>
    </div>
    <div style={{ display: "flex', gap: '1rem' }}>
      <Button color="warning&quot;>Warning</Button>
      <Button color="success">Success</Button>
      <Button color="info">Info</Button>
    </div>
  </div>
);