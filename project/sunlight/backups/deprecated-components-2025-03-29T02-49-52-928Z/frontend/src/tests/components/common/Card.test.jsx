import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { testA11y } from '../../utils/a11y-utils';
import Card from '@components/common/Card';

describe('Card', () => {
  // Test basic rendering
  it('renders correctly with children', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  // Test with string title
  it('renders with string title', () => {
    render(
      <Card title="Card Title&quot;>
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText("Card Title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  // Test with React element as title
  it('renders with React element as title', () => {
    const TitleElement = () => <div data-testid="custom-title">Custom Title</div>;
    
    render(
      <Card title={<TitleElement />}>
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  // Test with custom styles
  it('applies custom styles', () => {
    const customStyle = {
      backgroundColor: '#f8f9fa',
      borderLeft: '4px solid #fc741c',
      padding: '2rem'
    };
    
    render(
      <Card style={customStyle}>
        <p>Test content</p>
      </Card>
    );
    
    // Get the card container
    const card = screen.getByText('Test content').parentElement;
    
    // Check that custom styles are applied
    expect(card).toHaveStyle({
      backgroundColor: '#f8f9fa',
      borderLeft: '4px solid #fc741c',
      padding: '2rem'
    });
    
    // Base styles should also be preserved
    expect(card).toHaveStyle({
      borderRadius: '8px'
    });
  });

  // Test with complex content
  it('renders with complex content', () => {
    render(
      <Card title="Complex Card&quot;>
        <div>
          <h4>Section 1</h4>
          <p>Content 1</p>
          <h4>Section 2</h4>
          <p>Content 2</p>
          <button>Click me</button>
        </div>
      </Card>
    );
    
    expect(screen.getByText("Complex Card')).toBeInTheDocument();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    await testA11y(<Card title="Accessible Card&quot;>Card content</Card>);
    
    // Test more complex case
    await testA11y(
      <Card title="Accessible Card">
        <h4>Heading</h4>
        <p>Content with <a href="#">link</a></p>
        <button>Action</button>
      </Card>
    );
  });
});