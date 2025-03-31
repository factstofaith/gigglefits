/**
 * Card Tests
 * 
 * Tests for the Card component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../Card';

describe('Card', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with header when provided', () => {
      render(<Card header="Card header">Card content</Card>);
      expect(screen.getByText('Card header')).toBeInTheDocument();
    });

    it('renders with footer when provided', () => {
      render(<Card footer="Card footer">Card content</Card>);
      expect(screen.getByText('Card footer')).toBeInTheDocument();
    });

    it('renders with default variant by default', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByTestId('tap-card').classList.contains('tap-card--default')).toBe(true);
    });

    it('renders with specified variant', () => {
      render(<Card variant="primary">Card content</Card>);
      expect(screen.getByTestId('tap-card').classList.contains('tap-card--primary')).toBe(true);
    });

    it('renders with hoverable class when hoverable is true', () => {
      render(<Card hoverable>Card content</Card>);
      expect(screen.getByTestId('tap-card').classList.contains('tap-card--hoverable')).toBe(true);
    });

    it('renders with custom className', () => {
      render(<Card className="custom-class">Card content</Card>);
      expect(screen.getByTestId('tap-card').classList.contains('custom-class')).toBe(true);
    });
  });

  // Interaction tests
  describe('interactions', () => {
    it('applies hover effect when hoverable and mouse enters', () => {
      render(<Card hoverable>Card content</Card>);
      const card = screen.getByTestId('tap-card');
      
      fireEvent.mouseEnter(card);
      expect(card.style.transform).toBe('translateY(-4px)');
      expect(card.style.boxShadow).toBe('0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.12)');
    });

    it('removes hover effect when hoverable and mouse leaves', () => {
      render(<Card hoverable>Card content</Card>);
      const card = screen.getByTestId('tap-card');
      
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      expect(card.style.transform).toBe('');
      expect(card.style.boxShadow).toBe('0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)');
    });

    it('does not apply hover effect when not hoverable', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByTestId('tap-card');
      
      fireEvent.mouseEnter(card);
      expect(card.style.transform).toBe('');
    });
  });

  // Style variants tests
  describe('style variants', () => {
    it('renders with outlined style when outlined is true', () => {
      render(<Card outlined>Card content</Card>);
      const card = screen.getByTestId('tap-card');
      
      // Check that the card has a border and no box-shadow
      expect(card.style.border).toBe('1px solid rgb(224, 224, 224)');
      expect(card.style.boxShadow).toBe('none');
    });

    it('renders without elevation when elevation is false', () => {
      render(<Card elevation={false}>Card content</Card>);
      const card = screen.getByTestId('tap-card');
      
      expect(card.style.boxShadow).toBe('none');
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM element', () => {
      const ref = React.createRef();
      render(<Card ref={ref}>Card content</Card>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});