/**
 * TooltipAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Tooltip from '../TooltipAdapted';

describe('TooltipAdapted', () => {
  const renderTooltip = (props = {}) => {
  // Added display name
  renderTooltip.displayName = 'renderTooltip';

  // Added display name
  renderTooltip.displayName = 'renderTooltip';

  // Added display name
  renderTooltip.displayName = 'renderTooltip';

  // Added display name
  renderTooltip.displayName = 'renderTooltip';

  // Added display name
  renderTooltip.displayName = 'renderTooltip';


    return render(
      <TooltipAdapted title="Tooltip Content&quot; {...props}>
        <button>Hover Me</button>
      </TooltipAdapted>
    );
  };

  it("renders children without showing tooltip initially', () => {
    renderTooltip();
    
    expect(screen.getByText('Hover Me')).toBeInTheDocument();
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', async () => {
    jest.useFakeTimers();
    
    renderTooltip({ enterDelay: 100 });
    
    const button = screen.getByText('Hover Me');
    fireEvent.mouseEnter(button);
    
    // Advance timers to trigger the tooltip
    jest.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  it('hides tooltip on mouse leave', async () => {
    jest.useFakeTimers();
    
    renderTooltip({ enterDelay: 0, leaveDelay: 0 });
    
    const button = screen.getByText('Hover Me');
    
    // Show tooltip
    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(0);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    });
    
    // Hide tooltip
    fireEvent.mouseLeave(button);
    jest.advanceTimersByTime(0);
    
    await waitFor(() => {
      expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  it('supports controlled mode', async () => {
    const { rerender } = renderTooltip({ open: false });
    
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
    
    rerender(
      <TooltipAdapted title="Tooltip Content&quot; open={true}>
        <button>Hover Me</button>
      </TooltipAdapted>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Tooltip Content')).toBeInTheDocument();
    });
  });

  it('displays tooltip on focus', async () => {
    renderTooltip({ enterDelay: 0 });
    
    const button = screen.getByText('Hover Me');
    fireEvent.focus(button);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    });
  });

  it('respects disableFocusListener prop', () => {
    renderTooltip({ disableFocusListener: true, enterDelay: 0 });
    
    const button = screen.getByText('Hover Me');
    fireEvent.focus(button);
    
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('respects disableHoverListener prop', () => {
    jest.useFakeTimers();
    
    renderTooltip({ disableHoverListener: true, enterDelay: 0 });
    
    const button = screen.getByText('Hover Me');
    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(0);
    
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderTooltip({ 
      ariaLabel: 'Tooltip Information',
      enterDelay: 0
    });
    
    const button = screen.getByText('Hover Me');
    fireEvent.mouseEnter(button);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});