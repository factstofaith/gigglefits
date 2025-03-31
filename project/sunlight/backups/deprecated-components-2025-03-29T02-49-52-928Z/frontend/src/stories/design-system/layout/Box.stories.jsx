import React from 'react';
import {MuiBox as MuiBox} from '@design-system/components/layout/Box';
import { Typography } from '@design-system/components/core/Typography';
import { ThemeProvider } from '@design-system/foundations/theme/ThemeProvider';
import { MuiBox } from '../../design-system';
;

export default {
  title: 'Design System/Layout/Box',
  component: MuiBox,
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
    component: {
      control: 'select',
      options: ['div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'nav'],
      description: 'The component to render',
      defaultValue: 'div',
    },
    display: {
      control: 'select',
      options: ['block', 'flex', 'inline', 'inline-block', 'inline-flex', 'grid', 'none'],
      description: 'The display property',
    },
    p: {
      control: { type: 'text' },
      description: 'Padding on all sides (number or theme spacing key)',
    },
    px: {
      control: { type: 'text' },
      description: 'Horizontal padding (left and right)',
    },
    py: {
      control: { type: 'text' },
      description: 'Vertical padding (top and bottom)',
    },
    m: {
      control: { type: 'text' },
      description: 'Margin on all sides (number or theme spacing key)',
    },
    mx: {
      control: { type: 'text' },
      description: 'Horizontal margin (left and right)',
    },
    my: {
      control: { type: 'text' },
      description: 'Vertical margin (top and bottom)',
    },
    bgcolor: {
      control: { type: 'text' },
      description: 'Background color (theme color key or direct value)',
    },
    color: {
      control: { type: 'text' },
      description: 'Text color (theme color key or direct value)',
    },
    width: {
      control: { type: 'text' },
      description: 'Width of the box',
    },
    height: {
      control: { type: 'text' },
      description: 'Height of the box',
    },
    borderRadius: {
      control: { type: 'text' },
      description: 'Border radius of the box',
    },
    boxShadow: {
      control: { type: 'text' },
      description: 'MuiBox shadow of the box',
    },
  },
};

// Default box
export const Default = {
  args: {
    p: 'md',
    width: '200px',
    height: '200px',
    bgcolor: 'primary.light',
    children: <Typography color="primary.contrastText&quot;>Default MuiBox</Typography>,
  },
};

// MuiBox with padding
export const WithPadding = {
  args: {
    p: "lg',
    bgcolor: 'secondary.light',
    children: <Typography>MuiBox with padding</Typography>,
  },
};

// MuiBox with margin
export const WithMargin = {
  args: {
    m: 'md',
    p: 'sm',
    bgcolor: 'info.light',
    children: <Typography>MuiBox with margin</Typography>,
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialMode="light&quot;>
        <div style={{ padding: "1rem', border: '1px dashed #ccc' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

// MuiBox with border radius
export const WithBorderRadius = {
  args: {
    p: 'md',
    bgcolor: 'success.light',
    borderRadius: '8px',
    children: <Typography>MuiBox with border radius</Typography>,
  },
};

// MuiBox with shadow
export const WithShadow = {
  args: {
    p: 'md',
    bgcolor: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    children: <Typography>MuiBox with shadow</Typography>,
  },
};

// Flex box
export const FlexBox = {
  args: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 'md',
    bgcolor: 'warning.light',
    height: '100px',
    children: (
      <>
        <MuiBox p="sm&quot; bgcolor="primary.main">
          <Typography color="white&quot;>Item 1</Typography>
        </MuiBox>
        <MuiBox p="sm" bgcolor="secondary.main&quot;>
          <Typography color="white">Item 2</Typography>
        </MuiBox>
        <MuiBox p="sm&quot; bgcolor="error.main">
          <Typography color="white&quot;>Item 3</Typography>
        </MuiBox>
      </>
    ),
  },
};

// Nested boxes
export const NestedBoxes = {
  args: {
    p: "md',
    bgcolor: 'primary.light',
    borderRadius: '8px',
    children: (
      <>
        <Typography gutterBottom variant="h6&quot;>Outer MuiBox</Typography>
        <MuiBox p="md" bgcolor="white&quot; borderRadius="4px" boxShadow="0 2px 4px rgba(0,0,0,0.1)&quot;>
          <Typography gutterBottom variant="subtitle1">Inner MuiBox</Typography>
          <MuiBox p="sm&quot; bgcolor="secondary.light" borderRadius="4px&quot;>
            <Typography>Nested Content</Typography>
          </MuiBox>
        </MuiBox>
      </>
    ),
  },
};

// MuiBox grid layout
export const GridLayout = () => (
  <MuiBox display="grid" gridTemplateColumns="repeat(3, 1fr)&quot; gap="10px">
    <MuiBox p="md&quot; bgcolor="primary.light" borderRadius="4px&quot;>
      <Typography>Grid Item 1</Typography>
    </MuiBox>
    <MuiBox p="md" bgcolor="secondary.light&quot; borderRadius="4px">
      <Typography>Grid Item 2</Typography>
    </MuiBox>
    <MuiBox p="md&quot; bgcolor="error.light" borderRadius="4px&quot;>
      <Typography>Grid Item 3</Typography>
    </MuiBox>
    <MuiBox p="md" bgcolor="info.light&quot; borderRadius="4px">
      <Typography>Grid Item 4</Typography>
    </MuiBox>
    <MuiBox p="md&quot; bgcolor="success.light" borderRadius="4px&quot;>
      <Typography>Grid Item 5</Typography>
    </MuiBox>
    <MuiBox p="md" bgcolor="warning.light&quot; borderRadius="4px">
      <Typography>Grid Item 6</Typography>
    </MuiBox>
  </MuiBox>
);

// MuiBox as different component
export const AsComponent = {
  args: {
    component: 'section',
    p: 'md',
    bgcolor: 'primary.light',
    borderRadius: '4px',
    children: <Typography>This MuiBox is rendered as a section element</Typography>,
  },
};