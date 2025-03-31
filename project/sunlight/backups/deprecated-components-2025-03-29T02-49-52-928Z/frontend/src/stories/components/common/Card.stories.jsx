import React from 'react';
import Card from '@components/common/Card';

/**
 * Card component documentation
 * 
 * This is the Card component from the common components library.
 * It provides a simple, flexible container for content with optional title and customizable styling.
 */
export default {
  title: 'Components/Common/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A simple, flexible container component for wrapping content in a visually distinct box with shadow.
          Supports optional title and customizable styling.`,
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    children: { control: 'text' },
    style: { control: 'object' },
  },
  args: {
    title: 'Card Title',
    children: 'Card content goes here.',
    style: {},
  },
};

/**
 * Default card story
 */
export const Default = {};

/**
 * Card without title
 */
export const NoTitle = {
  args: {
    title: undefined,
  },
};

/**
 * Card with custom styling
 */
export const CustomStyling = {
  args: {
    style: {
      backgroundColor: '#f8f9fa',
      borderLeft: '4px solid #fc741c',
      maxWidth: '400px',
    },
  },
};

/**
 * Card with complex content
 */
export const ComplexContent = {
  args: {
    children: (
      <div>
        <h4 style={{ color: '#333', marginTop: 0 }}>Section Heading</h4>
        <p>This is a paragraph of text that demonstrates a card with more complex content.</p>
        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button style={{ padding: '8px 16px', backgroundColor: '#fc741c', border: 'none', borderRadius: '4px', color: 'white' }}>
            Action
          </button>
          <button style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>
            Cancel
          </button>
        </div>
      </div>
    ),
  },
};

/**
 * Card with a React element as title
 */
export const ReactElementTitle = {
  args: {
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fc741c' }}></div>
        <span>Status: Active</span>
      </div>
    ),
  },
};

/**
 * Card grid example
 */
export const CardGrid = {
  args: {
    title: undefined,
    children: undefined,
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '800px' }}>
      <Card title="First Card&quot;>
        <p>This is the first card in the grid.</p>
      </Card>
      <Card title="Second Card" style={{ backgroundColor: '#f8f9fa' }}>
        <p>This is the second card with a different background.</p>
      </Card>
      <Card title="Third Card&quot; style={{ borderTop: "4px solid #6200ee' }}>
        <p>This is the third card with a colored top border.</p>
      </Card>
      <Card title="Fourth Card&quot; style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)' }}>
        <p>This is the fourth card with enhanced shadow.</p>
      </Card>
    </div>
  ),
};