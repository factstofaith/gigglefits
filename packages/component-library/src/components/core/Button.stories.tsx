import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

/**
 * Button component meta data for Storybook
 */
const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component for user interactions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
      description: 'The variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'contained' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'],
      description: 'The color of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button takes up the full width',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    subtle: {
      control: 'boolean',
      description: 'Whether the button has a subtle appearance',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Default button story
 */
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
  },
};

/**
 * Primary button story
 */
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    color: 'primary',
  },
};

/**
 * Secondary button story
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    color: 'secondary',
  },
};

/**
 * Outlined button story
 */
export const Outlined: Story = {
  args: {
    children: 'Outlined Button',
    variant: 'outlined',
  },
};

/**
 * Text button story
 */
export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
};

/**
 * Small button story
 */
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'small',
  },
};

/**
 * Large button story
 */
export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
};

/**
 * Disabled button story
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Loading button story
 */
export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

/**
 * Full width button story
 */
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

/**
 * Subtle button story
 */
export const Subtle: Story = {
  args: {
    children: 'Subtle Button',
    subtle: true,
  },
};

/**
 * With icon button story
 */
export const WithIcon: Story = {
  args: {
    children: 'Send',
    startIcon: <SendIcon />,
  },
};

/**
 * Icon only button story
 */
export const IconOnly: Story = {
  args: {
    children: <AddIcon />,
    aria-label: 'add',
  },
};

/**
 * Various colors story
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="error">Error</Button>
      <Button color="warning">Warning</Button>
      <Button color="info">Info</Button>
    </div>
  ),
};

/**
 * Action buttons story
 */
export const ActionButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="contained" color="primary" startIcon={<AddIcon />}>
        Add Item
      </Button>
      <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
        Delete
      </Button>
      <Button variant="contained" color="success" startIcon={<SendIcon />}>
        Send
      </Button>
    </div>
  ),
};