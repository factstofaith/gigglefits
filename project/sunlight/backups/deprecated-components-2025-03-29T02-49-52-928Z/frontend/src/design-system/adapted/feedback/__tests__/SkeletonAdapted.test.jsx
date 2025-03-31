/**
 * SkeletonAdapted component tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Skeleton from '../SkeletonAdapted';

describe('SkeletonAdapted', () => {
  it('renders with default props (text variant)', () => {
    render(<SkeletonAdapted />);
    
    const skeleton = screen.getByRole('progressbar');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('renders text variant with specified dimensions', () => {
    render(<SkeletonAdapted variant="text&quot; width={200} height={30} />);
    
    const skeleton = screen.getByRole("progressbar');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '30px'
    });
  });

  it('renders multiple lines for text variant', () => {
    render(<SkeletonAdapted variant="text&quot; lines={3} />);
    
    // The first line is the main component, additional lines are rendered as children
    const skeletons = screen.getAllByRole("progressbar');
    expect(skeletons).toHaveLength(1);
    
    // Check that we have 2 additional line spans (for a total of 3)
    const additionalLines = document.querySelectorAll('span[aria-hidden="true"]');
    expect(additionalLines).toHaveLength(2);
  });

  it('renders circle variant', () => {
    render(<SkeletonAdapted variant="circle&quot; diameter={60} />);
    
    const skeleton = screen.getByRole("progressbar');
    expect(skeleton).toHaveStyle({
      width: '60px',
      height: '60px',
      borderRadius: '50%'
    });
  });

  it('renders rectangular variant', () => {
    render(<SkeletonAdapted variant="rectangular&quot; width={300} height={100} />);
    
    const skeleton = screen.getByRole("progressbar');
    expect(skeleton).toHaveStyle({
      width: '300px',
      height: '100px',
      borderRadius: '0'
    });
  });

  it('renders rounded variant', () => {
    render(<SkeletonAdapted variant="rounded&quot; width={400} height={200} />);
    
    const skeleton = screen.getByRole("progressbar');
    expect(skeleton).toHaveStyle({
      width: '400px',
      height: '200px',
      borderRadius: '4px'
    });
  });

  it('applies pulse animation by default', () => {
    render(<SkeletonAdapted />);
    
    const skeleton = screen.getByRole('progressbar');
    expect(skeleton).toHaveStyle({
      animation: 'skeleton-pulse 1.5s ease-in-out 0.5s infinite'
    });
  });

  it('applies wave animation when specified', () => {
    render(<SkeletonAdapted animation="wave&quot; />);
    
    const skeleton = screen.getByRole("progressbar');
    expect(skeleton).toHaveStyle({
      position: 'relative',
      overflow: 'hidden'
    });
    
    // The wave animation is applied to a pseudo-element, which we can't easily test here
  });

  it('accepts custom styling via sx prop', () => {
    render(
      <SkeletonAdapted
        sx={{
          backgroundColor: 'rgb(0, 0, 255)',
          margin: '10px'
        }}
      />
    );
    
    const skeleton = screen.getByRole('progressbar');
    expect(skeleton).toHaveStyle({
      backgroundColor: 'rgb(0, 0, 255)',
      margin: '10px'
    });
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<SkeletonAdapted />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});