import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

/**
 * Typography component meta data for Storybook
 */
const meta: Meta<typeof Typography> = {
  title: 'Core/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Typography component for displaying text with consistent styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'subtitle1',
        'subtitle2',
        'body1',
        'body2',
        'caption',
        'button',
        'overline',
      ],
      description: 'The typography variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'body1' },
      },
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'error',
        'warning',
        'info',
        'success',
        'textPrimary',
        'textSecondary',
      ],
      description: 'The color of the text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'textPrimary' },
      },
    },
    gutterBottom: {
      control: 'boolean',
      description: 'Whether the text has a bottom margin',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    noWrap: {
      control: 'boolean',
      description: 'Whether the text should be truncated with an ellipsis if too long',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    light: {
      control: 'boolean',
      description: 'Whether the text has a light font weight',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    bold: {
      control: 'boolean',
      description: 'Whether the text has a bold font weight',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    secondary: {
      control: 'boolean',
      description: 'Whether the text has the secondary text color',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

/**
 * Default Typography story
 */
export const Default: Story = {
  args: {
    children: 'Default Typography Text',
    variant: 'body1',
  },
};

/**
 * Heading 1 story
 */
export const Heading1: Story = {
  args: {
    children: 'Heading 1',
    variant: 'h1',
  },
};

/**
 * Heading 2 story
 */
export const Heading2: Story = {
  args: {
    children: 'Heading 2',
    variant: 'h2',
  },
};

/**
 * Heading 3 story
 */
export const Heading3: Story = {
  args: {
    children: 'Heading 3',
    variant: 'h3',
  },
};

/**
 * Heading 4 story
 */
export const Heading4: Story = {
  args: {
    children: 'Heading 4',
    variant: 'h4',
  },
};

/**
 * Heading 5 story
 */
export const Heading5: Story = {
  args: {
    children: 'Heading 5',
    variant: 'h5',
  },
};

/**
 * Heading 6 story
 */
export const Heading6: Story = {
  args: {
    children: 'Heading 6',
    variant: 'h6',
  },
};

/**
 * Body 1 story
 */
export const Body1: Story = {
  args: {
    children: 'Body 1 text. This is the default paragraph style.',
    variant: 'body1',
  },
};

/**
 * Body 2 story
 */
export const Body2: Story = {
  args: {
    children: 'Body 2 text. This is a slightly smaller paragraph style.',
    variant: 'body2',
  },
};

/**
 * Caption story
 */
export const Caption: Story = {
  args: {
    children: 'Caption text. Used for image captions and smaller text.',
    variant: 'caption',
  },
};

/**
 * Overline story
 */
export const Overline: Story = {
  args: {
    children: 'OVERLINE TEXT',
    variant: 'overline',
  },
};

/**
 * Primary color story
 */
export const PrimaryColor: Story = {
  args: {
    children: 'Primary color text',
    color: 'primary',
  },
};

/**
 * Secondary color story
 */
export const SecondaryColor: Story = {
  args: {
    children: 'Secondary color text',
    color: 'secondary',
  },
};

/**
 * Error color story
 */
export const ErrorColor: Story = {
  args: {
    children: 'Error color text',
    color: 'error',
  },
};

/**
 * Light weight story
 */
export const LightWeight: Story = {
  args: {
    children: 'Light weight text',
    light: true,
  },
};

/**
 * Bold weight story
 */
export const BoldWeight: Story = {
  args: {
    children: 'Bold weight text',
    bold: true,
  },
};

/**
 * With gutter bottom story
 */
export const WithGutterBottom: Story = {
  render: () => (
    <div>
      <Typography gutterBottom>This text has a gutter bottom.</Typography>
      <Typography>This text comes right after.</Typography>
    </div>
  ),
};

/**
 * No wrap story
 */
export const NoWrap: Story = {
  args: {
    children: 'This is a very long text that would normally wrap to the next line, but with noWrap prop it will be truncated with an ellipsis.',
    noWrap: true,
  },
  parameters: {
    layout: 'padded',
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Typography variant="h1">h1. Heading</Typography>
      <Typography variant="h2">h2. Heading</Typography>
      <Typography variant="h3">h3. Heading</Typography>
      <Typography variant="h4">h4. Heading</Typography>
      <Typography variant="h5">h5. Heading</Typography>
      <Typography variant="h6">h6. Heading</Typography>
      <Typography variant="subtitle1">subtitle1. Lorem ipsum dolor sit amet</Typography>
      <Typography variant="subtitle2">subtitle2. Lorem ipsum dolor sit amet</Typography>
      <Typography variant="body1">body1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
      <Typography variant="body2">body2. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
      <Typography variant="button">BUTTON TEXT</Typography>
      <Typography variant="caption">caption text</Typography>
      <Typography variant="overline">OVERLINE TEXT</Typography>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};