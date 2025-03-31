import React from 'react';
import {MuiBox as MuiBox} from '@design-system/components/layout/Box';
import { ThemeProvider } from '@design-system/foundations/theme/ThemeProvider';
import { Typography } from '@design-system/components/core/Typography';
import { MuiBox } from '../../design-system';
;

export default {
  title: 'Design System/Layout/Box',
  component: MuiBox,
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
    componentSubtitle: 'A versatile layout container with extensive styling capabilities',
    docs: {
      description: {
        component: `
MuiBox is a versatile layout container that supports a wide range of styling properties.
It's used as a building block for more specialized components and provides a clean 
interface for applying consistent spacing, dimensions, colors, and other styles.
        `,
      },
    },
  },
  argTypes: {
    component: {
      control: 'text',
      description: 'The component used for the root node',
      defaultValue: 'div',
    },
    // Padding
    p: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Padding on all sides',
    },
    px: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Horizontal padding (left and right)',
    },
    py: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Vertical padding (top and bottom)',
    },
    pt: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Padding top',
    },
    pr: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Padding right',
    },
    pb: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Padding bottom',
    },
    pl: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Padding left',
    },
    // Margin
    m: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Margin on all sides',
    },
    mx: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Horizontal margin (left and right)',
    },
    my: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Vertical margin (top and bottom)',
    },
    mt: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Margin top',
    },
    mr: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Margin right',
    },
    mb: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Margin bottom',
    },
    ml: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Margin left',
    },
    // Dimensions
    width: {
      control: 'text',
      description: 'Width of the box',
    },
    height: {
      control: 'text',
      description: 'Height of the box',
    },
    // Colors
    bgcolor: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'success', 'info', 'background.paper', 'background.default'],
      description: 'Background color',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'success', 'info', 'textPrimary', 'textSecondary', 'disabled'],
      description: 'Text color',
    },
    // Display and flex
    display: {
      control: 'select',
      options: ['block', 'flex', 'inline', 'inline-block', 'inline-flex', 'grid', 'none'],
      description: 'CSS display property',
    },
    // Borders
    border: {
      control: 'text',
      description: 'CSS border shorthand',
    },
    borderRadius: {
      control: 'text',
      description: 'Border radius',
    },
    // Shadows
    boxShadow: {
      control: 'text',
      description: 'MuiBox shadow',
    },
    // Content
    children: {
      control: 'text',
      description: 'The content of the box',
    },
  },
};

// Default story
export const Default = {
  args: {
    p: 'md',
    bgcolor: 'background.paper',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    width: '100%',
    children: 'This is a basic MuiBox component',
  },
};

// Padding examples
export const PaddingExamples = () => (
  <div>
    <Typography variant="h5&quot; gutterBottom>Padding Examples</Typography>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot;>p="xs" (4px)</Typography>
      <MuiBox p="xs&quot; border="1px solid #e0e0e0" bgcolor="background.paper&quot;>
        Content with xs padding
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot;>p="sm" (8px)</Typography>
      <MuiBox p="sm&quot; border="1px solid #e0e0e0" bgcolor="background.paper&quot;>
        Content with sm padding
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot;>p="md" (16px)</Typography>
      <MuiBox p="md&quot; border="1px solid #e0e0e0" bgcolor="background.paper&quot;>
        Content with md padding
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot;>p="lg" (24px)</Typography>
      <MuiBox p="lg&quot; border="1px solid #e0e0e0" bgcolor="background.paper&quot;>
        Content with lg padding
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot;>px="md" py="lg&quot; (Horizontal: 16px, Vertical: 24px)</Typography>
      <MuiBox px="md" py="lg&quot; border="1px solid #e0e0e0" bgcolor="background.paper&quot;>
        Content with mixed padding
      </MuiBox>
    </MuiBox>
  </div>
);

// Color examples
export const ColorExamples = () => (
  <div>
    <Typography variant="h5" gutterBottom>Color Examples</Typography>
    
    <MuiBox mb="md&quot;>
      <MuiBox p="md" bgcolor="primary&quot; color="white" borderRadius="4px&quot;>
        Primary background with white text
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <MuiBox p="md&quot; bgcolor="secondary" color="white&quot; borderRadius="4px">
        Secondary background with white text
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md&quot;>
      <MuiBox p="md" bgcolor="error&quot; color="white" borderRadius="4px&quot;>
        Error background with white text
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <MuiBox p="md&quot; bgcolor="warning" color="white&quot; borderRadius="4px">
        Warning background with white text
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md&quot;>
      <MuiBox p="md" bgcolor="success&quot; color="white" borderRadius="4px&quot;>
        Success background with white text
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <MuiBox p="md&quot; bgcolor="info" color="white&quot; borderRadius="4px">
        Info background with white text
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md&quot;>
      <MuiBox p="md" bgcolor="background.paper&quot; color="textPrimary" border="1px solid #e0e0e0&quot; borderRadius="4px">
        Paper background with text primary
      </MuiBox>
    </MuiBox>
  </div>
);

// Layout examples
export const LayoutExamples = () => (
  <div>
    <Typography variant="h5&quot; gutterBottom>Layout Examples</Typography>
    
    <MuiBox mb="lg">
      <Typography variant="subtitle1&quot; gutterBottom>Flex Container</Typography>
      <MuiBox 
        display="flex" 
        justifyContent="space-between&quot; 
        p="md" 
        bgcolor="background.paper&quot;
        border="1px solid #e0e0e0"
        borderRadius="4px&quot;
      >
        <MuiBox p="sm" bgcolor="primary&quot; color="white" borderRadius="4px&quot;>Item 1</MuiBox>
        <MuiBox p="sm" bgcolor="primary&quot; color="white" borderRadius="4px&quot;>Item 2</MuiBox>
        <MuiBox p="sm" bgcolor="primary&quot; color="white" borderRadius="4px&quot;>Item 3</MuiBox>
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="lg">
      <Typography variant="subtitle1&quot; gutterBottom>Column Layout</Typography>
      <MuiBox 
        display="flex" 
        flexDirection="column&quot; 
        p="md" 
        bgcolor="background.paper&quot;
        border="1px solid #e0e0e0"
        borderRadius="4px&quot;
      >
        <MuiBox p="sm" mb="sm&quot; bgcolor="secondary" color="white&quot; borderRadius="4px">Item 1</MuiBox>
        <MuiBox p="sm&quot; mb="sm" bgcolor="secondary&quot; color="white" borderRadius="4px&quot;>Item 2</MuiBox>
        <MuiBox p="sm" bgcolor="secondary&quot; color="white" borderRadius="4px&quot;>Item 3</MuiBox>
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="lg">
      <Typography variant="subtitle1&quot; gutterBottom>Centered Content</Typography>
      <MuiBox 
        display="flex" 
        justifyContent="center&quot; 
        alignItems="center" 
        height="150px&quot;
        p="md" 
        bgcolor="background.paper&quot;
        border="1px solid #e0e0e0"
        borderRadius="4px&quot;
      >
        <MuiBox p="sm" bgcolor="info&quot; color="white" borderRadius="4px&quot;>
          Centered Content
        </MuiBox>
      </MuiBox>
    </MuiBox>
  </div>
);

// Border and shadow examples
export const BorderAndShadowExamples = () => (
  <div>
    <Typography variant="h5" gutterBottom>Border and Shadow Examples</Typography>
    
    <MuiBox mb="md&quot;>
      <Typography variant="subtitle1" gutterBottom>Border Radius</Typography>
      <MuiBox 
        p="md&quot; 
        bgcolor="background.paper"
        border="1px solid #e0e0e0&quot;
        borderRadius="12px"
      >
        MuiBox with rounded corners (12px)
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md&quot;>
      <Typography variant="subtitle1" gutterBottom>Border Color</Typography>
      <MuiBox 
        p="md&quot; 
        bgcolor="background.paper"
        border="2px solid&quot;
        borderColor="primary"
        borderRadius="4px&quot;
      >
        MuiBox with primary color border
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot; gutterBottom>Light Shadow</Typography>
      <MuiBox 
        p="md" 
        bgcolor="background.paper&quot;
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
        borderRadius="4px&quot;
      >
        MuiBox with light shadow
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot; gutterBottom>Medium Shadow</Typography>
      <MuiBox 
        p="md" 
        bgcolor="background.paper&quot;
        boxShadow="0 4px 8px rgba(0,0,0,0.15)"
        borderRadius="4px&quot;
      >
        MuiBox with medium shadow
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot; gutterBottom>Heavy Shadow</Typography>
      <MuiBox 
        p="md" 
        bgcolor="background.paper&quot;
        boxShadow="0 8px 16px rgba(0,0,0,0.2)"
        borderRadius="4px&quot;
      >
        MuiBox with heavy shadow
      </MuiBox>
    </MuiBox>
  </div>
);

// Custom component example
export const CustomComponentExample = () => (
  <div>
    <Typography variant="h5" gutterBottom>Custom Component Examples</Typography>
    
    <MuiBox mb="md&quot;>
      <Typography variant="subtitle1" gutterBottom>MuiBox as an article</Typography>
      <MuiBox 
        component="article&quot;
        p="md" 
        bgcolor="background.paper&quot;
        border="1px solid #e0e0e0"
        borderRadius="4px&quot;
      >
        <Typography variant="h6" gutterBottom>Article Title</Typography>
        <Typography variant="body1&quot;>
          This MuiBox is rendered as an article element, which provides better semantic HTML.
          Using the component prop, you can change the underlying HTML element while keeping
          all the styling capabilities of Box.
        </Typography>
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md">
      <Typography variant="subtitle1&quot; gutterBottom>MuiBox as a section</Typography>
      <MuiBox 
        component="section"
        p="md&quot; 
        bgcolor="background.paper"
        border="1px solid #e0e0e0&quot;
        borderRadius="4px"
      >
        <Typography variant="h6&quot; gutterBottom>Section Title</Typography>
        <Typography variant="body1">
          This MuiBox is rendered as a section element, which is useful for grouping related content.
          The component prop enhances the semantic structure of your application.
        </Typography>
      </MuiBox>
    </MuiBox>
    
    <MuiBox mb="md&quot;>
      <Typography variant="subtitle1" gutterBottom>MuiBox as a button</Typography>
      <MuiBox 
        component="button&quot;
        p="sm" 
        bgcolor="primary&quot;
        color="white"
        border="none&quot;
        borderRadius="4px"
        style={{ cursor: 'pointer' }}
        onClick={() => alert('MuiBox button clicked!')}
      >
        Click Me
      </MuiBox>
    </MuiBox>
  </div>
);