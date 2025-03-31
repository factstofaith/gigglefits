/**
 * Badge Tests
 * 
 * Tests for the Badge component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from '../Badge';

describe('Badge', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders with children content', () => {
      render(<Badge>42</Badge>);
      
      expect(screen.getByTestId('tap-badge')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders with content prop', () => {
      render(<Badge content="New" />);
      
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders with primary color by default', () => {
      render(<Badge>42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('tap-badge--primary')).toBe(true);
    });

    it('renders with specified color', () => {
      render(<Badge color="error">42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('tap-badge--error')).toBe(true);
    });

    it('renders with standard variant by default', () => {
      render(<Badge>42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('tap-badge--standard')).toBe(true);
    });

    it('renders with specified variant', () => {
      render(<Badge variant="outlined">42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('tap-badge--outlined')).toBe(true);
    });

    it('renders with medium size by default', () => {
      render(<Badge>42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('tap-badge--medium')).toBe(true);
    });

    it('renders with specified size', () => {
      render(<Badge size="small">42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('tap-badge--small')).toBe(true);
    });

    it('renders with rounded shape by default', () => {
      render(<Badge>42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('tap-badge--rounded')).toBe(true);
    });

    it('renders with specified shape', () => {
      render(<Badge shape="pill">42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('tap-badge--pill')).toBe(true);
    });

    it('renders with custom className', () => {
      render(<Badge className="custom-badge">42</Badge>);
      
      expect(screen.getByTestId('tap-badge').classList.contains('custom-badge')).toBe(true);
    });
  });

  // Numeric content tests
  describe('numeric content behavior', () => {
    it('renders numeric content directly', () => {
      render(<Badge>{5}</Badge>);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('limits display value with max prop', () => {
      render(<Badge max={99}>{100}</Badge>);
      
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('does not render with zero content by default', () => {
      const { container } = render(<Badge>{0}</Badge>);
      
      expect(container).toBeEmptyDOMElement();
    });

    it('renders zero content when showZero is true', () => {
      render(<Badge showZero>{0}</Badge>);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  // Visibility tests
  describe('visibility behavior', () => {
    it('does not render when invisible is true', () => {
      const { container } = render(<Badge invisible>42</Badge>);
      
      expect(container).toBeEmptyDOMElement();
    });

    it('does not render when content is undefined', () => {
      const { container } = render(<Badge />);
      
      expect(container).toBeEmptyDOMElement();
    });
  });

  // Interaction tests
  describe('interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Badge onClick={handleClick}>42</Badge>);
      
      fireEvent.click(screen.getByTestId('tap-badge'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM element', () => {
      const ref = React.createRef();
      render(<Badge ref={ref}>42</Badge>);
      
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current).toBe(screen.getByTestId('tap-badge'));
    });
  });
});