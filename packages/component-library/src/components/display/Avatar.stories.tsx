import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

/**
 * Avatar component meta data for Storybook
 */
const meta: Meta<typeof Avatar> = {
  title: 'Display/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component for displaying user profile images, icons or initials.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['circular', 'square', 'rounded'],
      description: 'The shape of the avatar',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'circular' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'xlarge'],
      description: 'The size of the avatar',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' },
      },
    },
    bordered: {
      control: 'boolean',
      description: 'Whether the avatar has a border',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    borderColor: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      description: 'The color of the border',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    src: {
      control: 'text',
      description: 'The image source',
      table: {
        type: { summary: 'string' },
      },
    },
    alt: {
      control: 'text',
      description: 'The alt text for the image',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

/**
 * Default avatar story
 */
export const Default: Story = {
  args: {
    children: 'JD',
  },
};

/**
 * Image avatar story
 */
export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    alt: 'John Doe',
  },
};

/**
 * Initials avatar story
 */
export const WithInitials: Story = {
  args: {
    children: 'JD',
  },
};

/**
 * Icon avatar story
 */
export const WithIcon: Story = {
  args: {
    children: <FolderIcon />,
  },
};

/**
 * Small avatar story
 */
export const Small: Story = {
  args: {
    size: 'small',
    children: 'S',
  },
};

/**
 * Medium avatar story
 */
export const Medium: Story = {
  args: {
    size: 'medium',
    children: 'M',
  },
};

/**
 * Large avatar story
 */
export const Large: Story = {
  args: {
    size: 'large',
    children: 'L',
  },
};

/**
 * Extra Large avatar story
 */
export const ExtraLarge: Story = {
  args: {
    size: 'xlarge',
    children: 'XL',
  },
};

/**
 * Square avatar story
 */
export const Square: Story = {
  args: {
    variant: 'square',
    children: <AssignmentIcon />,
  },
};

/**
 * Rounded avatar story
 */
export const Rounded: Story = {
  args: {
    variant: 'rounded',
    children: <AccountCircleIcon />,
  },
};

/**
 * Circular avatar story
 */
export const Circular: Story = {
  args: {
    variant: 'circular',
    children: 'JD',
  },
};

/**
 * Bordered avatar story
 */
export const Bordered: Story = {
  args: {
    bordered: true,
    borderColor: 'primary',
    children: 'JD',
  },
};

/**
 * All variants and sizes
 */
export const AllVariantsAndSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Avatar size="small" variant="circular">JD</Avatar>
      <Avatar size="medium" variant="circular">JD</Avatar>
      <Avatar size="large" variant="circular">JD</Avatar>
      <Avatar size="xlarge" variant="circular">JD</Avatar>
      
      <Avatar size="small" variant="square">JD</Avatar>
      <Avatar size="medium" variant="square">JD</Avatar>
      <Avatar size="large" variant="square">JD</Avatar>
      <Avatar size="xlarge" variant="square">JD</Avatar>
      
      <Avatar size="small" variant="rounded">JD</Avatar>
      <Avatar size="medium" variant="rounded">JD</Avatar>
      <Avatar size="large" variant="rounded">JD</Avatar>
      <Avatar size="xlarge" variant="rounded">JD</Avatar>
    </div>
  ),
};

/**
 * Different border colors
 */
export const BorderColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Avatar bordered borderColor="primary">JD</Avatar>
      <Avatar bordered borderColor="secondary">JD</Avatar>
      <Avatar bordered borderColor="error">JD</Avatar>
      <Avatar bordered borderColor="warning">JD</Avatar>
      <Avatar bordered borderColor="info">JD</Avatar>
      <Avatar bordered borderColor="success">JD</Avatar>
    </div>
  ),
};