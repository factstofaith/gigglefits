import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

/**
 * Badge component meta data for Storybook
 */
const meta: Meta<typeof Badge> = {
  title: 'Display/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A badge component for displaying status or notification counts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'],
      description: 'The color of the badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    variant: {
      control: 'select',
      options: ['standard', 'dot'],
      description: 'The variant of the badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'standard' },
      },
    },
    invisible: {
      control: 'boolean',
      description: 'Whether the badge is invisible',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    max: {
      control: 'number',
      description: 'Maximum count to show',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 99 },
      },
    },
    horizontalPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'The horizontal position of the badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'right' },
      },
    },
    verticalPosition: {
      control: 'select',
      options: ['top', 'bottom'],
      description: 'The vertical position of the badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'top' },
      },
    },
    compact: {
      control: 'boolean',
      description: 'Whether the badge is compact sized',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/**
 * Default badge story
 */
export const Default: Story = {
  args: {
    badgeContent: 4,
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Primary badge story
 */
export const Primary: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Secondary badge story
 */
export const Secondary: Story = {
  args: {
    badgeContent: 4,
    color: 'secondary',
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Error badge story
 */
export const Error: Story = {
  args: {
    badgeContent: 4,
    color: 'error',
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Success badge story
 */
export const Success: Story = {
  args: {
    badgeContent: 4,
    color: 'success',
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Warning badge story
 */
export const Warning: Story = {
  args: {
    badgeContent: 4,
    color: 'warning',
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Info badge story
 */
export const Info: Story = {
  args: {
    badgeContent: 4,
    color: 'info',
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Dot variant badge story
 */
export const DotVariant: Story = {
  args: {
    variant: 'dot',
    color: 'error',
    children: <NotificationsIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Max count badge story
 */
export const MaxCount: Story = {
  args: {
    badgeContent: 1000,
    max: 99,
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Custom positioning badge story
 */
export const CustomPosition: Story = {
  args: {
    badgeContent: 5,
    horizontalPosition: 'left',
    verticalPosition: 'bottom',
    color: 'error',
    children: <AccountCircleIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Invisible badge story
 */
export const Invisible: Story = {
  args: {
    badgeContent: 4,
    invisible: true,
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * Compact badge story
 */
export const Compact: Story = {
  args: {
    badgeContent: 4,
    compact: true,
    children: <MailIcon style={{ fontSize: 30 }} />,
  },
};

/**
 * All colors and variants story
 */
export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Badge badgeContent={4} color="default">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge badgeContent={4} color="primary">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge badgeContent={4} color="secondary">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge badgeContent={4} color="error">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge badgeContent={4} color="warning">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge badgeContent={4} color="info">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge badgeContent={4} color="success">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge variant="dot" color="primary">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge variant="dot" color="secondary">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
      <Badge variant="dot" color="error">
        <MailIcon style={{ fontSize: 30 }} />
      </Badge>
    </div>
  ),
};