/**
 * Button Tests
 * 
 * Tests for the Button component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with primary variant by default', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me').classList.contains('tap-button--primary')).toBe(true);
    });

    it('renders with specified variant', () => {
      render(<Button variant="secondary">Click me</Button>);
      expect(screen.getByText('Click me').classList.contains('tap-button--secondary')).toBe(true);
    });

    it('renders with specified size', () => {
      render(<Button size="large">Click me</Button>);
      expect(screen.getByText('Click me').classList.contains('tap-button--large')).toBe(true);
    });

    it('renders as fullWidth when specified', () => {
      render(<Button fullWidth>Click me</Button>);
      expect(screen.getByText('Click me').classList.contains('tap-button--fullWidth')).toBe(true);
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Click me</Button>);
      expect(screen.getByText('Click me').classList.contains('custom-class')).toBe(true);
    });

    it('renders in disabled state', () => {
      render(<Button disabled>Click me</Button>);
      const button = screen.getByText('Click me');
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('renders in loading state', () => {
      render(<Button loading>Click me</Button>);
      const button = screen.getByText('Click me');
      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(button.disabled).toBe(true);
      expect(button.querySelector('.tap-button__loader')).toBeInTheDocument();
    });

    it('renders with aria-label when provided', () => {
      render(<Button ariaLabel="Custom label">Click me</Button>);
      expect(screen.getByText('Click me').getAttribute('aria-label')).toBe('Custom label');
    });
  });

  // Interaction tests
  describe('interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);
      
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Click me</Button>);
      
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Style tests
  describe('styles', () => {
    it('applies hover styles on mouse enter', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByText('Click me');
      
      fireEvent.mouseEnter(button);
      expect(button.style.backgroundColor).toBe('rgb(15, 76, 140)'); // #0f4c8c
    });

    it('restores default styles on mouse leave', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByText('Click me');
      
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      expect(button.style.backgroundColor).toBe('rgb(21, 101, 192)'); // #1565c0
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM button', () => {
      const ref = React.createRef();
      render(<Button ref={ref}>Click me</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});