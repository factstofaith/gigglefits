import React from 'react';
import Alert from '@design-system/components/feedback/Alert';
import { Button } from '@design-system/components/core/Button';
import { ThemeProvider } from '@design-system/foundations/theme/ThemeProvider';

export default {
  title: 'Design System/Feedback/Alert',
  component: Alert,
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
    layout: 'padded',
  },
  argTypes: {
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'The severity of the alert',
      defaultValue: 'info',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'standard'],
      description: 'The variant to use',
      defaultValue: 'filled',
    },
    title: {
      control: 'text',
      description: 'The title of the alert',
    },
    children: {
      control: 'text',
      description: 'The content of the alert',
    },
    closable: {
      control: 'boolean',
      description: 'Whether the alert is closable',
      defaultValue: false,
    },
    icon: {
      control: 'boolean',
      description: 'Whether to show the severity icon',
      defaultValue: true,
    },
    onClose: { action: 'closed' },
  },
};

// Default alert
export const Default = {
  args: {
    severity: 'info',
    children: 'This is an information alert',
  },
};

// Info alert
export const Info = {
  args: {
    severity: 'info',
    children: 'This is an information alert with important details',
  },
};

// Success alert
export const Success = {
  args: {
    severity: 'success',
    children: 'This is a success alert - your action was completed successfully!',
  },
};

// Warning alert
export const Warning = {
  args: {
    severity: 'warning',
    children: 'This is a warning alert - pay attention to this message',
  },
};

// Error alert
export const Error = {
  args: {
    severity: 'error',
    children: 'This is an error alert - something went wrong!',
  },
};

// Alert with title
export const WithTitle = {
  args: {
    severity: 'info',
    title: 'Important Information',
    children: 'This is an information alert with a title for additional context',
  },
};

// Outlined variant
export const Outlined = {
  args: {
    severity: 'success',
    variant: 'outlined',
    children: 'This is an outlined success alert',
  },
};

// Standard variant
export const Standard = {
  args: {
    severity: 'warning',
    variant: 'standard',
    children: 'This is a standard warning alert with lighter background',
  },
};

// Closable alert
export const Closable = {
  args: {
    severity: 'info',
    closable: true,
    children: 'This is a closable alert - click the X to dismiss',
  },
};

// Alert without icon
export const WithoutIcon = {
  args: {
    severity: 'success',
    icon: false,
    children: 'This is an alert without an icon',
  },
};

// Alert with action
export const WithAction = {
  args: {
    severity: 'warning',
    children: 'This is an alert with an action button',
    action: <Button size="small&quot; variant="outlined" color="inherit&quot;>Action</Button>,
  },
};

// Alert with title and action
export const WithTitleAndAction = {
  args: {
    severity: "error',
    title: 'Error Detected',
    children: 'This is an error alert with a title and action button',
    closable: true,
    action: <Button size="small&quot; variant="outlined" color="inherit&quot;>Fix Now</Button>,
  },
};

// Alert variations showcase
export const AlertVariations = () => (
  <div style={{ display: "flex', flexDirection: 'column', gap: '1rem' }}>
    <Alert severity="info&quot;>This is an information alert</Alert>
    <Alert severity="success">This is a success alert</Alert>
    <Alert severity="warning&quot;>This is a warning alert</Alert>
    <Alert severity="error">This is an error alert</Alert>
  </div>
);

// Alert variants showcase
export const VariantShowcase = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <Alert severity="info&quot; variant="filled">Filled variant (default)</Alert>
    <Alert severity="info&quot; variant="outlined">Outlined variant</Alert>
    <Alert severity="info&quot; variant="standard">Standard variant</Alert>
  </div>
);