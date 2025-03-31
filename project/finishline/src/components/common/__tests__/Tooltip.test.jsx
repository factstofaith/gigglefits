/**
 * Tooltip Tests
 * 
 * Tests for the Tooltip component.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from '../Tooltip';

// Mock createPortal to make it work with testing-library
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createPortal: (node) => node,
  };
});

describe('Tooltip', () => {
  // Mock timers for delay testing
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  // Basic rendering tests
  describe('rendering', () => {
    it('renders the children', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByText('Hover Me')).toBeInTheDocument();
    });

    it('does not initially show the tooltip', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      const tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 0');
    });

    it('renders with default placement', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('tap-tooltip--top')).toBe(true);
    });

    it('renders with specified placement', () => {
      render(
        <Tooltip title="Tooltip Text" placement="bottom">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('tap-tooltip--bottom')).toBe(true);
    });

    it('renders with default color', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('tap-tooltip--default')).toBe(true);
    });

    it('renders with specified color', () => {
      render(
        <Tooltip title="Tooltip Text" color="error">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('tap-tooltip--error')).toBe(true);
    });

    it('renders with default size', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('tap-tooltip--medium')).toBe(true);
    });

    it('renders with specified size', () => {
      render(
        <Tooltip title="Tooltip Text" size="large">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('tap-tooltip--large')).toBe(true);
    });

    it('renders with an arrow by default', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('tap-tooltip--arrow')).toBe(true);
      expect(screen.getByTestId('tap-tooltip').querySelector('.tap-tooltip__arrow')).toBeInTheDocument();
    });

    it('renders without an arrow when arrow is false', () => {
      render(
        <Tooltip title="Tooltip Text" arrow={false}>
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('tap-tooltip--arrow')).toBe(false);
      expect(screen.getByTestId('tap-tooltip').querySelector('.tap-tooltip__arrow')).not.toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(
        <Tooltip title="Tooltip Text" className="custom-tooltip">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByTestId('tap-tooltip').classList.contains('custom-tooltip')).toBe(true);
    });

    it('returns only children when title is not provided', () => {
      render(
        <Tooltip title="">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      expect(screen.getByText('Hover Me')).toBeInTheDocument();
      expect(screen.queryByTestId('tap-tooltip')).not.toBeInTheDocument();
    });
  });

  // Interaction tests
  describe('interactions', () => {
    it('shows tooltip when hovering over children', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      fireEvent.mouseEnter(screen.getByText('Hover Me'));
      
      // Fast-forward timers to trigger the enterDelay
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      const tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 1');
    });

    it('hides tooltip when mouse leaves children', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      // Show tooltip
      fireEvent.mouseEnter(screen.getByText('Hover Me'));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Hide tooltip
      fireEvent.mouseLeave(screen.getByText('Hover Me'));
      act(() => {
        jest.advanceTimersByTime(0); // Default leaveDelay is 0
      });
      
      const tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 0');
    });

    it('respects enterDelay', () => {
      render(
        <Tooltip title="Tooltip Text" enterDelay={500}>
          <button>Hover Me</button>
        </Tooltip>
      );
      
      fireEvent.mouseEnter(screen.getByText('Hover Me'));
      
      // Check that tooltip is not visible before delay
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      let tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 0');
      
      // Check that tooltip is visible after delay
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 1');
    });

    it('respects leaveDelay', () => {
      render(
        <Tooltip title="Tooltip Text" leaveDelay={500}>
          <button>Hover Me</button>
        </Tooltip>
      );
      
      // Show tooltip
      fireEvent.mouseEnter(screen.getByText('Hover Me'));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Start hide
      fireEvent.mouseLeave(screen.getByText('Hover Me'));
      
      // Check that tooltip is still visible before delay
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      let tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 1');
      
      // Check that tooltip is hidden after delay
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 0');
    });

    it('shows on focus and hides on blur', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Focus Me</button>
        </Tooltip>
      );
      
      // Show on focus
      fireEvent.focus(screen.getByText('Focus Me'));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      let tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 1');
      
      // Hide on blur
      fireEvent.blur(screen.getByText('Focus Me'));
      act(() => {
        jest.advanceTimersByTime(0);
      });
      
      tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 0');
    });

    it('preserves original event handlers on children', () => {
      const handleClick = jest.fn();
      const handleMouseEnter = jest.fn();
      const handleMouseLeave = jest.fn();
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(
        <Tooltip title="Tooltip Text">
          <button
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            Hover Me
          </button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover Me');
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      fireEvent.mouseEnter(button);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      
      fireEvent.mouseLeave(button);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
      
      fireEvent.focus(button);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      fireEvent.blur(button);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  // Interactive tooltip tests
  describe('interactive behavior', () => {
    it('allows interaction with tooltip when interactive is true', () => {
      render(
        <Tooltip title="Tooltip Text" interactive>
          <button>Hover Me</button>
        </Tooltip>
      );
      
      // Show tooltip
      fireEvent.mouseEnter(screen.getByText('Hover Me'));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      const tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('pointer-events: auto');
      expect(tooltip.classList.contains('tap-tooltip--interactive')).toBe(true);
    });

    it('keeps tooltip visible when hovering over interactive tooltip', () => {
      render(
        <Tooltip title="Tooltip Text" interactive>
          <button>Hover Me</button>
        </Tooltip>
      );
      
      // Show tooltip
      fireEvent.mouseEnter(screen.getByText('Hover Me'));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Leave trigger but enter tooltip
      fireEvent.mouseLeave(screen.getByText('Hover Me'));
      fireEvent.mouseEnter(screen.getByTestId('tap-tooltip'));
      
      // Check that tooltip is still visible
      const tooltip = screen.getByTestId('tap-tooltip');
      expect(tooltip).toHaveStyle('opacity: 1');
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <Tooltip title="Tooltip Text">
          <button>Hover Me</button>
        </Tooltip>
      );
      
      // Show tooltip
      fireEvent.mouseEnter(screen.getByText('Hover Me'));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(screen.getByText('Hover Me')).toHaveAttribute('aria-describedby', 'tooltip');
      expect(screen.getByTestId('tap-tooltip')).toHaveAttribute('role', 'tooltip');
      expect(screen.getByTestId('tap-tooltip')).toHaveAttribute('id', 'tooltip');
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards refs to both children and tooltip', () => {
      const childRef = React.createRef();
      const tooltipRef = React.createRef();
      
      render(
        <Tooltip title="Tooltip Text" ref={tooltipRef}>
          <button ref={childRef}>Hover Me</button>
        </Tooltip>
      );
      
      expect(childRef.current).toBeInstanceOf(HTMLButtonElement);
      expect(childRef.current).toBe(screen.getByText('Hover Me'));
      
      expect(tooltipRef.current).toBeInstanceOf(HTMLDivElement);
      expect(tooltipRef.current).toBe(screen.getByTestId('tap-tooltip'));
    });
  });
});