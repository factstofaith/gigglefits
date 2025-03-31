/**
 * AvatarAdapted component tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Avatar from '../AvatarAdapted';

describe('AvatarAdapted', () => {
  it('renders with text content', () => {
    render(<AvatarAdapted>AB</AvatarAdapted>);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('renders with image source', () => {
    render(<AvatarAdapted alt="Test User&quot; src="/test-image.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
    expect(img).toHaveAttribute('alt', 'Test User');
  });

  it('renders with alt text as initials when no src or children are provided', () => {
    render(<AvatarAdapted alt="John Doe&quot; />);
    expect(screen.getByText("JD')).toBeInTheDocument();
  });

  it('renders with single initial for single word', () => {
    render(<AvatarAdapted alt="Administrator&quot; />);
    expect(screen.getByText("A')).toBeInTheDocument();
  });

  it('renders with proper size based on size prop', () => {
    const { rerender } = render(<AvatarAdapted alt="Test User&quot; size="small" />);
    
    let avatar = screen.getByText('TU');
    expect(avatar.parentElement).toHaveStyle({ width: '32px', height: '32px' });
    
    rerender(<AvatarAdapted alt="Test User&quot; size="large" />);
    avatar = screen.getByText('TU');
    expect(avatar.parentElement).toHaveStyle({ width: '56px', height: '56px' });
    
    rerender(<AvatarAdapted alt="Test User&quot; size={100} />);
    avatar = screen.getByText("TU');
    expect(avatar.parentElement).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('renders with proper shape based on variant prop', () => {
    const { rerender } = render(<AvatarAdapted alt="Test User&quot; variant="circular" />);
    
    let avatar = screen.getByText('TU').parentElement;
    expect(avatar).toHaveStyle({ borderRadius: '50%' });
    
    rerender(<AvatarAdapted alt="Test User&quot; variant="square" />);
    avatar = screen.getByText('TU').parentElement;
    expect(avatar).toHaveStyle({ borderRadius: '0' });
    
    rerender(<AvatarAdapted alt="Test User&quot; variant="rounded" />);
    avatar = screen.getByText('TU').parentElement;
    expect(avatar).toHaveStyle({ borderRadius: '4px' });
  });

  it('renders with proper color based on color prop', () => {
    const { rerender } = render(<AvatarAdapted alt="Test User&quot; color="primary" />);
    
    let avatar = screen.getByText('TU').parentElement;
    expect(avatar).toHaveStyle({ backgroundColor: 'var(--primary-main, #1976d2)' });
    
    rerender(<AvatarAdapted alt="Test User&quot; color="error" />);
    avatar = screen.getByText('TU').parentElement;
    expect(avatar).toHaveStyle({ backgroundColor: 'var(--error-main, #d32f2f)' });
    
    rerender(<AvatarAdapted alt="Test User&quot; color="#ff5722" />);
    avatar = screen.getByText('TU').parentElement;
    expect(avatar).toHaveStyle({ backgroundColor: '#ff5722' });
  });

  it('applies custom imgProps to the image element', () => {
    render(
      <AvatarAdapted 
        alt="Test User&quot; 
        src="/test-image.jpg" 
        imgProps={{ loading: 'lazy', className: 'custom-img' }} 
      />
    );
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveClass('custom-img');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <AvatarAdapted alt="Test User" />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});