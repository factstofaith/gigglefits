import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CircularProgress } from './CircularProgress';

/**
 * CircularProgress component meta data for Storybook
 */
const meta: Meta<typeof CircularProgress> = {
  title: 'Feedback/CircularProgress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component for showing loading states and progress indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
      description: 'The color of the progress indicator',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'The size of the progress indicator',
      table: {
        type: { summary: 'string | number' },
        defaultValue: { summary: 'medium' },
      },
    },
    thickness: {
      control: { type: 'number', min: 1, max: 10, step: 0.1 },
      description: 'The thickness of the progress indicator',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 3.6 },
      },
    },
    variant: {
      control: 'select',
      options: ['determinate', 'indeterminate'],
      description: 'The variant of the progress indicator',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'The value of the progress indicator (0-100)',
      table: {
        type: { summary: 'number' },
      },
    },
    withLabel: {
      control: 'boolean',
      description: 'If true, the progress will be displayed with a label',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    withBackground: {
      control: 'boolean',
      description: 'If true, the progress will be displayed with a background',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CircularProgress>;

/**
 * Default progress story
 */
export const Default: Story = {
  args: {},
};

/**
 * Determinate progress story
 */
export const Determinate: Story = {
  args: {
    variant: 'determinate',
    value: 75,
  },
};

/**
 * Small progress story
 */
export const Small: Story = {
  args: {
    size: 'small',
  },
};

/**
 * Medium progress story
 */
export const Medium: Story = {
  args: {
    size: 'medium',
  },
};

/**
 * Large progress story
 */
export const Large: Story = {
  args: {
    size: 'large',
  },
};

/**
 * Custom size progress story
 */
export const CustomSize: Story = {
  args: {
    size: 80,
  },
};

/**
 * Primary color progress story
 */
export const Primary: Story = {
  args: {
    color: 'primary',
  },
};

/**
 * Secondary color progress story
 */
export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};

/**
 * With label progress story
 */
export const WithLabel: Story = {
  args: {
    variant: 'determinate',
    value: 75,
    withLabel: true,
  },
};

/**
 * Custom label progress story
 */
export const CustomLabel: Story = {
  args: {
    variant: 'determinate',
    value: 75,
    withLabel: true,
    label: 'Loading...',
  },
};

/**
 * With background progress story
 */
export const WithBackground: Story = {
  args: {
    withBackground: true,
  },
};

/**
 * Thicker progress story
 */
export const Thicker: Story = {
  args: {
    thickness: 6,
  },
};

/**
 * All colors progress story
 */
export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <CircularProgress color="primary" />
      <CircularProgress color="secondary" />
      <CircularProgress color="error" />
      <CircularProgress color="warning" />
      <CircularProgress color="info" />
      <CircularProgress color="success" />
    </div>
  ),
};

/**
 * Auto-incrementing progress story
 */
export const AutoIncrementing: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [progress, setProgress] = useState(0);
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
      }, 800);
      
      return () => {
        clearInterval(timer);
      };
    }, []);
    
    return (
      <CircularProgress
        variant="determinate"
        value={progress}
        withLabel
        withBackground
      />
    );
  },
};