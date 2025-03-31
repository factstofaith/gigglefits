import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import Button from '@mui/material/Button';

/**
 * Alert component meta data for Storybook
 */
const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A component for displaying feedback messages to users.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
      description: 'The severity of the alert',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'info' },
      },
    },
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined'],
      description: 'The variant of the alert',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'standard' },
      },
    },
    title: {
      control: 'text',
      description: 'The title of the alert',
      table: {
        type: { summary: 'string' },
      },
    },
    dismissible: {
      control: 'boolean',
      description: 'If true, the alert will be dismissible',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'If true, the alert will take full width',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    compact: {
      control: 'boolean',
      description: 'If true, the alert will have a compact layout',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

/**
 * Default alert story
 */
export const Default: Story = {
  args: {
    severity: 'info',
    children: 'This is an information alert.',
  },
};

/**
 * Success alert story
 */
export const Success: Story = {
  args: {
    severity: 'success',
    children: 'Operation completed successfully.',
  },
};

/**
 * Warning alert story
 */
export const Warning: Story = {
  args: {
    severity: 'warning',
    children: 'Warning: This action might have consequences.',
  },
};

/**
 * Error alert story
 */
export const Error: Story = {
  args: {
    severity: 'error',
    children: 'Error: Operation failed.',
  },
};

/**
 * With title alert story
 */
export const WithTitle: Story = {
  args: {
    severity: 'success',
    title: 'Success',
    children: 'Operation completed successfully.',
  },
};

/**
 * Dismissible alert story
 */
export const Dismissible: Story = {
  args: {
    severity: 'info',
    dismissible: true,
    children: 'This alert can be dismissed.',
  },
};

/**
 * Filled variant alert story
 */
export const Filled: Story = {
  args: {
    severity: 'info',
    variant: 'filled',
    children: 'This is a filled alert.',
  },
};

/**
 * Outlined variant alert story
 */
export const Outlined: Story = {
  args: {
    severity: 'info',
    variant: 'outlined',
    children: 'This is an outlined alert.',
  },
};

/**
 * Full width alert story
 */
export const FullWidth: Story = {
  args: {
    severity: 'info',
    fullWidth: true,
    children: 'This alert takes the full width of its container.',
  },
};

/**
 * Compact alert story
 */
export const Compact: Story = {
  args: {
    severity: 'info',
    compact: true,
    children: 'This is a compact alert.',
  },
};

/**
 * With action alert story
 */
export const WithAction: Story = {
  args: {
    severity: 'warning',
    action: (
      <Button color="inherit" size="small">
        UNDO
      </Button>
    ),
    children: 'This action can be undone.',
  },
};

/**
 * All severities and variants
 */
export const AllSeveritiesAndVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert severity="success" variant="standard">This is a standard success alert</Alert>
      <Alert severity="info" variant="standard">This is a standard info alert</Alert>
      <Alert severity="warning" variant="standard">This is a standard warning alert</Alert>
      <Alert severity="error" variant="standard">This is a standard error alert</Alert>
      
      <Alert severity="success" variant="filled">This is a filled success alert</Alert>
      <Alert severity="info" variant="filled">This is a filled info alert</Alert>
      <Alert severity="warning" variant="filled">This is a filled warning alert</Alert>
      <Alert severity="error" variant="filled">This is a filled error alert</Alert>
      
      <Alert severity="success" variant="outlined">This is an outlined success alert</Alert>
      <Alert severity="info" variant="outlined">This is an outlined info alert</Alert>
      <Alert severity="warning" variant="outlined">This is an outlined warning alert</Alert>
      <Alert severity="error" variant="outlined">This is an outlined error alert</Alert>
    </div>
  ),
};