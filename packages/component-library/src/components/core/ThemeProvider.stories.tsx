import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from './ThemeProvider';
import { Button } from './Button';
import { Typography } from './Typography';
import { createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

/**
 * ThemeProvider component meta data for Storybook
 */
const meta: Meta<typeof ThemeProvider> = {
  title: 'Core/ThemeProvider',
  component: ThemeProvider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Theme Provider component for consistent styling across the application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    useCssBaseline: {
      control: 'boolean',
      description: 'Whether to include CssBaseline for style normalization',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: true },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeProvider>;

/**
 * Default ThemeProvider story
 */
export const Default: Story = {
  render: () => (
    <ThemeProvider>
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4">Default Theme</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary">Primary</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="contained" color="success">Success</Button>
          <Button variant="contained" color="error">Error</Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="primary">Primary</Button>
          <Button variant="outlined" color="secondary">Secondary</Button>
          <Button variant="outlined" color="success">Success</Button>
          <Button variant="outlined" color="error">Error</Button>
        </Box>
      </Box>
    </ThemeProvider>
  ),
};

/**
 * Custom Theme story
 */
export const CustomTheme: Story = {
  render: () => {
    const customTheme = createTheme({
      palette: {
        primary: {
          main: '#673ab7', // deep purple
        },
        secondary: {
          main: '#ff9800', // orange
        },
        success: {
          main: '#009688', // teal
        },
        error: {
          main: '#f44336', // red
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 12,
      },
    });

    return (
      <ThemeProvider theme={customTheme}>
        <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h4">Custom Theme</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="primary">Primary</Button>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="contained" color="success">Success</Button>
            <Button variant="contained" color="error">Error</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="primary">Primary</Button>
            <Button variant="outlined" color="secondary">Secondary</Button>
            <Button variant="outlined" color="success">Success</Button>
            <Button variant="outlined" color="error">Error</Button>
          </Box>
        </Box>
      </ThemeProvider>
    );
  },
};

/**
 * Theme Override story
 */
export const ThemeOverride: Story = {
  render: () => {
    const themeOptions = {
      palette: {
        primary: {
          main: '#2e7d32', // green
        },
        secondary: {
          main: '#0288d1', // blue
        },
      },
      shape: {
        borderRadius: 0, // square buttons
      },
    };

    return (
      <ThemeProvider themeOptions={themeOptions}>
        <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h4">Theme Override</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="primary">Primary</Button>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="contained" color="success">Success</Button>
            <Button variant="contained" color="error">Error</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="primary">Primary</Button>
            <Button variant="outlined" color="secondary">Secondary</Button>
            <Button variant="outlined" color="success">Success</Button>
            <Button variant="outlined" color="error">Error</Button>
          </Box>
        </Box>
      </ThemeProvider>
    );
  },
};

/**
 * Dark Theme story
 */
export const DarkTheme: Story = {
  render: () => {
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#90caf9', // light blue
        },
        secondary: {
          main: '#f48fb1', // light pink
        },
      },
    });

    return (
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ 
          padding: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          bgcolor: 'background.default', 
          color: 'text.primary',
          borderRadius: 1
        }}>
          <Typography variant="h4">Dark Theme</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="primary">Primary</Button>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="contained" color="success">Success</Button>
            <Button variant="contained" color="error">Error</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="primary">Primary</Button>
            <Button variant="outlined" color="secondary">Secondary</Button>
            <Button variant="outlined" color="success">Success</Button>
            <Button variant="outlined" color="error">Error</Button>
          </Box>
        </Box>
      </ThemeProvider>
    );
  },
};