import React from 'react';
import Button from '@components/common/Button';

/**
 * Button component documentation
 * 
 * This is the Button component from the common components library.
 * It provides a consistent way to handle user interactions across the application.
 */
export default {
  title: 'Components/Common/Button',
  component: Button,
  parameters: {
    // Optional parameter to position the component preview in the center
    layout: 'centered',
    // For automatic documentation
    docs: {
      description: {
        component: `A modern, accessible button component with consistent styling and interaction patterns.
          Features enhanced accessibility support, keyboard interaction, and hover effects.`,
      },
    },
  },
  // Define available controls for the component's props
  argTypes: {
    onClick: { action: 'clicked' }, // Shows in actions panel when clicked
    children: { control: 'text' },
    disabled: { control: 'boolean' },
    type: { 
      control: { type: 'select' }, 
      options: ['button', 'submit', 'reset'] 
    },
    variant: { 
      control: { type: 'select' }, 
      options: ['default', 'primary', 'secondary', 'danger'] 
    },
    size: { 
      control: { type: 'select' }, 
      options: ['small', 'medium', 'large'] 
    },
    fullWidth: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    ariaPressed: { control: 'boolean' },
    ariaExpanded: { control: 'boolean' },
    ariaControls: { control: 'text' },
    ariaDescribedBy: { control: 'text' },
  },
  // Default values for the controls
  args: {
    children: 'Button Text',
    disabled: false,
    type: 'button',
    variant: 'default',
    size: 'medium',
    fullWidth: false,
  },
};

/**
 * Default button story
 */
export const Default = {};

/**
 * Button variants
 */
export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    style: { backgroundColor: '#FC741C' },
  },
};

/**
 * Different sizes
 */
export const Sizes = () => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <Button size="small&quot;>Small</Button>
    <Button size="medium">Medium</Button>
    <Button size="large&quot;>Large</Button>
  </div>
);

/**
 * Disabled state
 */
export const Disabled = {
  args: {
    disabled: true,
    children: "Disabled Button',
  },
};

/**
 * Full width button
 */
export const FullWidth = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
};

/**
 * Button with accessibility attributes
 */
export const Accessibility = {
  args: {
    ariaLabel: 'Accessible Button Example',
    ariaControls: 'panel-1',
    ariaExpanded: true,
    children: 'Accessibility Features',
  },
};

/**
 * Interactive example with custom styles
 */
export const Interactive = {
  args: {
    children: 'Interactive Button',
    style: {
      backgroundColor: '#3B4044',
      color: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
  },
};