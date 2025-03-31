import React from 'react';
import { Typography } from '@design-system/components/core/Typography';
import { ThemeProvider } from '@design-system/foundations/theme/ThemeProvider';

export default {
  title: 'Design System/Core/Typography',
  component: Typography,
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
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline', 'code'],
      description: 'The typography variant to use',
      defaultValue: 'body1',
    },
    component: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'code'],
      description: 'The component to render (overrides default component for variant)',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'success', 'info', 'textPrimary', 'textSecondary', 'disabled'],
      description: 'The color of the text',
    },
    align: {
      control: 'select',
      options: ['inherit', 'left', 'center', 'right', 'justify'],
      description: 'The alignment of the text',
      defaultValue: 'inherit',
    },
    noWrap: {
      control: 'boolean',
      description: 'Whether the text should not wrap',
      defaultValue: false,
    },
    gutterBottom: {
      control: 'boolean',
      description: 'Whether to add margin-bottom',
      defaultValue: false,
    },
  },
};

// Default typography
export const Default = {
  args: {
    children: 'This is default typography (body1)',
  },
};

// Heading 1
export const Heading1 = {
  args: {
    variant: 'h1',
    children: 'Heading 1',
  },
};

// Heading 2
export const Heading2 = {
  args: {
    variant: 'h2',
    children: 'Heading 2',
  },
};

// Heading 3
export const Heading3 = {
  args: {
    variant: 'h3',
    children: 'Heading 3',
  },
};

// Heading 4
export const Heading4 = {
  args: {
    variant: 'h4',
    children: 'Heading 4',
  },
};

// Heading 5
export const Heading5 = {
  args: {
    variant: 'h5',
    children: 'Heading 5',
  },
};

// Heading 6
export const Heading6 = {
  args: {
    variant: 'h6',
    children: 'Heading 6',
  },
};

// Subtitle 1
export const Subtitle1 = {
  args: {
    variant: 'subtitle1',
    children: 'Subtitle 1',
  },
};

// Subtitle 2
export const Subtitle2 = {
  args: {
    variant: 'subtitle2',
    children: 'Subtitle 2',
  },
};

// Body 1
export const Body1 = {
  args: {
    variant: 'body1',
    children: 'Body 1 text with a bit more content to demonstrate how body text appears in the design system. This is the standard text style for paragraphs and most content throughout the application.',
  },
};

// Body 2
export const Body2 = {
  args: {
    variant: 'body2',
    children: 'Body 2 text with a bit more content to demonstrate how secondary body text appears in the design system. This is often used for less prominent text sections.',
  },
};

// Button text
export const ButtonText = {
  args: {
    variant: 'button',
    children: 'BUTTON TEXT',
  },
};

// Caption
export const Caption = {
  args: {
    variant: 'caption',
    children: 'Caption text for smaller, supporting information',
  },
};

// Overline
export const Overline = {
  args: {
    variant: 'overline',
    children: 'OVERLINE TEXT',
  },
};

// Code
export const Code = {
  args: {
    variant: 'code',
  },
};

// With primary color
export const WithPrimaryColor = {
  args: {
    color: 'primary',
    children: 'Text with primary color',
  },
};

// With secondary color
export const WithSecondaryColor = {
  args: {
    color: 'secondary',
    children: 'Text with secondary color',
  },
};

// With error color
export const WithErrorColor = {
  args: {
    color: 'error',
    children: 'Text with error color',
  },
};

// Center aligned
export const CenterAligned = {
  args: {
    align: 'center',
    children: 'Center aligned text',
  },
};

// No wrap with ellipsis
export const NoWrap = {
  args: {
    noWrap: true,
    children: 'This text is too long to fit in one line so it should be truncated with an ellipsis when the noWrap property is set to true.',
    style: { width: '300px' },
  },
};

// Gutter bottom
export const GutterBottom = {
  args: {
    gutterBottom: true,
    children: 'This text has margin at the bottom',
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialMode="light&quot;>
        <div style={{ padding: "2rem', border: '1px dashed #ccc' }}>
          <Story />
          <Typography>Next paragraph to show the gutter spacing</Typography>
        </div>
      </ThemeProvider>
    ),
  ],
};

// Typography showcase
export const TypographyShowcase = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <Typography variant="h1&quot;>Heading 1</Typography>
    <Typography variant="h2">Heading 2</Typography>
    <Typography variant="h3&quot;>Heading 3</Typography>
    <Typography variant="h4">Heading 4</Typography>
    <Typography variant="h5&quot;>Heading 5</Typography>
    <Typography variant="h6">Heading 6</Typography>
    <Typography variant="subtitle1&quot;>Subtitle 1</Typography>
    <Typography variant="subtitle2">Subtitle 2</Typography>
    <Typography variant="body1&quot;>Body 1: Main text for content areas</Typography>
    <Typography variant="body2">Body 2: Secondary text for supporting information</Typography>
    <Typography variant="button&quot;>BUTTON TEXT</Typography>
    <Typography variant="caption">Caption: Small text for auxiliary information</Typography>
    <Typography variant="overline&quot;>OVERLINE TEXT</Typography>
    <Typography variant="code">const code = "Example code text"</Typography>
  </div>
);