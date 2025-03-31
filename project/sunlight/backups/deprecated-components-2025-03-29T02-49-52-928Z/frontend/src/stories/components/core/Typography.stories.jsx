import React from 'react';
import { Typography } from '@design-system/components/core/Typography';
import { ThemeProvider } from '@design-system/foundations/theme/ThemeProvider';

export default {
  title: 'Design System/Core/Typography',
  component: Typography,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: '2rem' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    componentSubtitle: 'Typography component for consistent text styling across the application',
    docs: {
      description: {
        component: `
Typography is a core component that renders text with consistent styling based on the theme.
It supports various variants (h1-h6, body1, body2, etc.) and properties like color, alignment, and more.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline', 'code'],
      description: 'Typography variant that maps to a component and predefined styles',
      defaultValue: 'body1',
    },
    component: {
      control: 'text',
      description: 'Override the component used to render the text',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'success', 'info', 'textPrimary', 'textSecondary', 'disabled'],
      description: 'The color of the text',
    },
    align: {
      control: 'select',
      options: ['inherit', 'left', 'center', 'right', 'justify'],
      description: 'Text alignment',
      defaultValue: 'inherit',
    },
    noWrap: {
      control: 'boolean',
      description: 'If true, the text will not wrap, but instead will truncate with a text overflow ellipsis',
      defaultValue: false,
    },
    gutterBottom: {
      control: 'boolean',
      description: 'If true, the text will have a bottom margin',
      defaultValue: false,
    },
    children: {
      control: 'text',
      description: 'The content of the component',
    },
    style: {
      control: 'object',
      description: 'Override or extend the styles applied to the component',
    },
  },
};

// Default story
export const Default = {
  args: {
    children: 'This is a typography component',
    variant: 'body1',
  },
};

// All variants story
export const AllVariants = () => (
  <div>
    <Typography variant="h1&quot; gutterBottom>h1. Heading</Typography>
    <Typography variant="h2" gutterBottom>h2. Heading</Typography>
    <Typography variant="h3&quot; gutterBottom>h3. Heading</Typography>
    <Typography variant="h4" gutterBottom>h4. Heading</Typography>
    <Typography variant="h5&quot; gutterBottom>h5. Heading</Typography>
    <Typography variant="h6" gutterBottom>h6. Heading</Typography>
    <Typography variant="subtitle1&quot; gutterBottom>subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</Typography>
    <Typography variant="subtitle2" gutterBottom>subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</Typography>
    <Typography variant="body1&quot; gutterBottom>body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.</Typography>
    <Typography variant="body2" gutterBottom>body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.</Typography>
    <Typography variant="button&quot; display="block" gutterBottom>BUTTON TEXT</Typography>
    <Typography variant="caption&quot; display="block" gutterBottom>caption text</Typography>
    <Typography variant="overline&quot; display="block" gutterBottom>OVERLINE TEXT</Typography>
    <Typography variant="code&quot; display="block" gutterBottom>const code = 'Typography code example';</Typography>
  </div>
);

// Colors story
export const Colors = () => (
  <div>
    <Typography color="primary&quot; gutterBottom>Primary color</Typography>
    <Typography color="secondary" gutterBottom>Secondary color</Typography>
    <Typography color="error&quot; gutterBottom>Error color</Typography>
    <Typography color="warning" gutterBottom>Warning color</Typography>
    <Typography color="success&quot; gutterBottom>Success color</Typography>
    <Typography color="info" gutterBottom>Info color</Typography>
    <Typography color="textPrimary&quot; gutterBottom>Text primary color</Typography>
    <Typography color="textSecondary" gutterBottom>Text secondary color</Typography>
    <Typography color="disabled&quot; gutterBottom>Disabled text color</Typography>
  </div>
);

// Alignment story
export const Alignment = () => (
  <div>
    <Typography align="left" gutterBottom>Left aligned text</Typography>
    <Typography align="center&quot; gutterBottom>Center aligned text</Typography>
    <Typography align="right" gutterBottom>Right aligned text</Typography>
    <Typography align="justify&quot; gutterBottom>Justified text. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?</Typography>
  </div>
);

// No wrap story
export const NoWrap = () => (
  <div style={{ width: "200px', border: '1px dashed #ccc', padding: '8px' }}>
    <Typography noWrap gutterBottom>
      This text is very long and should be truncated with an ellipsis because noWrap is true.
    </Typography>
    <Typography gutterBottom>
      This text is very long but will wrap normally because noWrap is false.
    </Typography>
  </div>
);

// Component override story
export const ComponentOverride = () => (
  <div>
    <Typography variant="h1&quot; component="span" gutterBottom>
      This is an h1 variant rendered as a span
    </Typography>
    <Typography variant="body1&quot; component="h2" gutterBottom>
      This is a body1 variant rendered as an h2
    </Typography>
  </div>
);

// Custom styling story
export const CustomStyling = () => (
  <div>
    <Typography 
      style={{ 
        textDecoration: 'underline',
        fontStyle: 'italic',
        color: 'purple',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '4px'
      }} 
      gutterBottom
    >
      Typography with custom styling
    </Typography>
  </div>
);