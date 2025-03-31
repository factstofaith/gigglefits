import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';
import FaceIcon from '@mui/icons-material/Face';
import TagIcon from '@mui/icons-material/Tag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ComputerIcon from '@mui/icons-material/Computer';

/**
 * Chip component meta data for Storybook
 */
const meta: Meta<typeof Chip> = {
  title: 'Display/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component for displaying compact elements like filters, tags, or categories.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The text displayed on the chip',
      table: {
        type: { summary: 'string' },
      },
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'],
      description: 'The color of the chip',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      description: 'The variant of the chip',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'filled' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'The size of the chip',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' },
      },
    },
    clickable: {
      control: 'boolean',
      description: 'Whether the chip is clickable',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    deletable: {
      control: 'boolean',
      description: 'Whether the chip has a delete icon',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    rounded: {
      control: 'boolean',
      description: 'Whether the chip has more rounded corners',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    bordered: {
      control: 'boolean',
      description: 'Whether the chip has a border',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    onClick: { action: 'clicked' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

/**
 * Default chip story
 */
export const Default: Story = {
  args: {
    label: 'Chip',
  },
};

/**
 * Primary chip story
 */
export const Primary: Story = {
  args: {
    label: 'Primary',
    color: 'primary',
  },
};

/**
 * Secondary chip story
 */
export const Secondary: Story = {
  args: {
    label: 'Secondary',
    color: 'secondary',
  },
};

/**
 * Outlined chip story
 */
export const Outlined: Story = {
  args: {
    label: 'Outlined',
    variant: 'outlined',
  },
};

/**
 * Small chip story
 */
export const Small: Story = {
  args: {
    label: 'Small',
    size: 'small',
  },
};

/**
 * Clickable chip story
 */
export const Clickable: Story = {
  args: {
    label: 'Clickable',
    clickable: true,
  },
};

/**
 * Deletable chip story
 */
export const Deletable: Story = {
  args: {
    label: 'Deletable',
    deletable: true,
  },
};

/**
 * With icon chip story
 */
export const WithIcon: Story = {
  args: {
    label: 'With Icon',
    icon: <FaceIcon />,
  },
};

/**
 * Rounded chip story
 */
export const Rounded: Story = {
  args: {
    label: 'Rounded',
    rounded: true,
  },
};

/**
 * Bordered chip story
 */
export const Bordered: Story = {
  args: {
    label: 'Bordered',
    bordered: true,
  },
};

/**
 * All colors story
 */
export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip label="Default" color="default" />
      <Chip label="Primary" color="primary" />
      <Chip label="Secondary" color="secondary" />
      <Chip label="Error" color="error" />
      <Chip label="Warning" color="warning" />
      <Chip label="Info" color="info" />
      <Chip label="Success" color="success" />
    </div>
  ),
};

/**
 * Different variants and colors
 */
export const VariantsAndColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip label="Default Filled" variant="filled" color="default" />
      <Chip label="Primary Filled" variant="filled" color="primary" />
      <Chip label="Success Filled" variant="filled" color="success" />
      <Chip label="Default Outlined" variant="outlined" color="default" />
      <Chip label="Primary Outlined" variant="outlined" color="primary" />
      <Chip label="Success Outlined" variant="outlined" color="success" />
    </div>
  ),
};

/**
 * Interactive chips story
 */
export const InteractiveChips: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip 
        label="Clickable" 
        icon={<TagIcon />} 
        clickable 
        onClick={() => console.log('Clicked')} 
      />
      <Chip 
        label="Deletable" 
        deletable 
        onDelete={() => console.log('Deleted')} 
      />
      <Chip 
        label="Both" 
        icon={<FaceIcon />} 
        clickable 
        deletable 
        onClick={() => console.log('Clicked')} 
        onDelete={() => console.log('Deleted')} 
      />
    </div>
  ),
};

/**
 * Tag examples story
 */
export const TagExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip 
        label="Technology" 
        icon={<ComputerIcon />} 
        variant="outlined"
        color="primary"
        size="small"
      />
      <Chip 
        label="Approved" 
        icon={<CheckCircleIcon />} 
        color="success"
        size="small"
      />
      <Chip 
        label="Beta" 
        color="secondary"
        size="small"
        rounded
      />
      <Chip 
        label="New Feature" 
        color="info"
        size="small"
        variant="outlined"
      />
      <Chip 
        label="Warning" 
        color="warning"
        size="small"
      />
      <Chip 
        label="Critical" 
        color="error"
        size="small"
      />
    </div>
  ),
};