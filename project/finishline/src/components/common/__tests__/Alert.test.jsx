/**
 * Alert Tests
 * 
 * Tests for the Alert component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '../Alert';

describe('Alert', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders with message', () => {
      render(<Alert message="Test message" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with title when provided', () => {
      render(<Alert message="Test message" title="Test title" />);
      expect(screen.getByText('Test title')).toBeInTheDocument();
    });

    it('renders with info severity by default', () => {
      render(<Alert message="Test message" />);
      expect(screen.getByTestId('tap-alert').classList.contains('tap-alert--info')).toBe(true);
    });

    it('renders with specified severity', () => {
      render(<Alert message="Test message" severity="error" />);
      expect(screen.getByTestId('tap-alert').classList.contains('tap-alert--error')).toBe(true);
    });

    it('renders with outlined class when outlined is true', () => {
      render(<Alert message="Test message" outlined />);
      expect(screen.getByTestId('tap-alert').classList.contains('tap-alert--outlined')).toBe(true);
    });

    it('renders with filled class when filled is true', () => {
      render(<Alert message="Test message" filled />);
      expect(screen.getByTestId('tap-alert').classList.contains('tap-alert--filled')).toBe(true);
    });

    it('renders with close button when closable is true', () => {
      render(<Alert message="Test message" closable />);
      expect(screen.getByTestId('tap-alert-close-button')).toBeInTheDocument();
    });

    it('renders with custom icon when provided', () => {
      const customIcon = <div data-testid="custom-icon">Icon</div>;
      render(<Alert message="Test message" icon={customIcon} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Alert message="Test message" className="custom-class" />);
      expect(screen.getByTestId('tap-alert').classList.contains('custom-class')).toBe(true);
    });
  });

  // Interaction tests
  describe('interactions', () => {
    it('calls onClose and removes alert when close button is clicked', () => {
      const handleClose = jest.fn();
      render(<Alert message="Test message" closable onClose={handleClose} />);
      
      fireEvent.click(screen.getByTestId('tap-alert-close-button'));
      
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
    
    it('removes alert when close button is clicked even without onClose handler', () => {
      render(<Alert message="Test message" closable />);
      
      fireEvent.click(screen.getByTestId('tap-alert-close-button'));
      
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });

  // Style variant tests
  describe('style variants', () => {
    it('has correct role attribute', () => {
      render(<Alert message="Test message" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM element', () => {
      const ref = React.createRef();
      render(<Alert message="Test message" ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});