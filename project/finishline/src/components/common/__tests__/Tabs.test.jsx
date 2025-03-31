/**
 * Tabs Tests
 * 
 * Tests for the Tabs and TabPanel components.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tabs, { TabPanel } from '../Tabs';

describe('Tabs', () => {
  // Reusable test tabs
  const renderTestTabs = (props = {}) => (
    <Tabs {...props}>
      <TabPanel label="Tab 1">Content 1</TabPanel>
      <TabPanel label="Tab 2">Content 2</TabPanel>
      <TabPanel label="Tab 3">Content 3</TabPanel>
    </Tabs>
  );
  
  // Basic rendering tests
  describe('rendering', () => {
    it('renders tabs and panels', () => {
      render(renderTestTabs());
      
      expect(screen.getByTestId('tap-tabs')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('renders the first tab as selected by default', () => {
      render(renderTestTabs());
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
      
      // First panel should be visible, others hidden
      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.getByText('Content 2')).not.toBeVisible();
      expect(screen.getByText('Content 3')).not.toBeVisible();
    });

    it('renders with defaultValue to set initial tab', () => {
      render(renderTestTabs({ defaultValue: 1 }));
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
      
      // Second panel should be visible, others hidden
      expect(screen.getByText('Content 1')).not.toBeVisible();
      expect(screen.getByText('Content 2')).toBeVisible();
      expect(screen.getByText('Content 3')).not.toBeVisible();
    });

    it('renders with different orientation', () => {
      render(renderTestTabs({ orientation: 'vertical' }));
      
      expect(screen.getByTestId('tap-tabs').classList.contains('tap-tabs--vertical')).toBe(true);
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('renders with different variant', () => {
      render(renderTestTabs({ variant: 'contained' }));
      
      expect(screen.getByTestId('tap-tabs').classList.contains('tap-tabs--contained')).toBe(true);
    });

    it('renders with centered tabs', () => {
      render(renderTestTabs({ centered: true }));
      
      // This is a style property, harder to test directly, but we can check for the prop effect
      const tabList = screen.getByRole('tablist');
      expect(tabList.style.justifyContent).toBe('center');
    });

    it('renders with full width tabs', () => {
      render(renderTestTabs({ fullWidth: true }));
      
      expect(screen.getByTestId('tap-tabs').classList.contains('tap-tabs--fullwidth')).toBe(true);
    });

    it('renders with custom className', () => {
      render(renderTestTabs({ className: 'custom-class' }));
      
      expect(screen.getByTestId('tap-tabs').classList.contains('custom-class')).toBe(true);
    });
  });

  // Controlled vs Uncontrolled tests
  describe('controlled and uncontrolled behavior', () => {
    it('works as a controlled component', () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        renderTestTabs({ value: 0, onChange: handleChange })
      );
      
      const tabs = screen.getAllByRole('tab');
      
      // Click on second tab
      fireEvent.click(tabs[1]);
      expect(handleChange).toHaveBeenCalledWith(1);
      
      // Tab shouldn't change without prop update
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      
      // Update prop to simulate controlled behavior
      rerender(
        renderTestTabs({ value: 1, onChange: handleChange })
      );
      
      // Now second tab should be selected
      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'false');
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeVisible();
    });

    it('works as an uncontrolled component', () => {
      const handleChange = jest.fn();
      render(renderTestTabs({ defaultValue: 0, onChange: handleChange }));
      
      const tabs = screen.getAllByRole('tab');
      
      // Click on second tab
      fireEvent.click(tabs[1]);
      expect(handleChange).toHaveBeenCalledWith(1);
      
      // Tab should change in uncontrolled mode
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeVisible();
    });
  });

  // Event handler tests
  describe('event handlers', () => {
    it('calls onChange when a tab is clicked', () => {
      const handleChange = jest.fn();
      render(renderTestTabs({ onChange: handleChange }));
      
      fireEvent.click(screen.getAllByRole('tab')[1]);
      expect(handleChange).toHaveBeenCalledWith(1);
    });

    it('supports keyboard navigation with arrow keys', () => {
      const handleChange = jest.fn();
      render(renderTestTabs({ onChange: handleChange }));
      
      const tabs = screen.getAllByRole('tab');
      
      // Focus first tab
      tabs[0].focus();
      
      // Arrow right to move to second tab
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      expect(handleChange).toHaveBeenCalledWith(1);
      
      // Arrow left to move back to first tab
      handleChange.mockClear();
      tabs[1].focus();
      fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });
      expect(handleChange).toHaveBeenCalledWith(0);
      
      // Home key to go to first tab
      handleChange.mockClear();
      tabs[2].focus();
      fireEvent.keyDown(tabs[2], { key: 'Home' });
      expect(handleChange).toHaveBeenCalledWith(0);
      
      // End key to go to last tab
      handleChange.mockClear();
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'End' });
      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it('wraps around when navigating past the ends', () => {
      const handleChange = jest.fn();
      render(renderTestTabs({ onChange: handleChange }));
      
      const tabs = screen.getAllByRole('tab');
      
      // Arrow right from last tab should go to first
      tabs[2].focus();
      fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
      expect(handleChange).toHaveBeenCalledWith(0);
      
      // Arrow left from first tab should go to last
      handleChange.mockClear();
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
      expect(handleChange).toHaveBeenCalledWith(2);
    });
  });

  // Accessibility tests
  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(renderTestTabs());
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
      
      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab, i) => {
        expect(tab).toHaveAttribute('aria-selected', i === 0 ? 'true' : 'false');
        expect(tab).toHaveAttribute('tabIndex', i === 0 ? '0' : '-1');
        expect(tab).toHaveAttribute('aria-controls', `tap-tab-panel-${i}`);
      });
      
      const panels = screen.getAllByRole('tabpanel');
      panels.forEach((panel, i) => {
        expect(panel).toHaveAttribute('aria-hidden', i === 0 ? 'false' : 'true');
      });
    });
  });

  // Disabled tabs
  describe('disabled tabs', () => {
    it('renders disabled tabs correctly', () => {
      render(
        <Tabs>
          <TabPanel label="Tab 1">Content 1</TabPanel>
          <TabPanel label="Tab 2" disabled>Content 2</TabPanel>
          <TabPanel label="Tab 3">Content 3</TabPanel>
        </Tabs>
      );
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs[1]).toBeDisabled();
      expect(tabs[1].classList.contains('tap-tabs__tab--disabled')).toBe(true);
    });

    it('prevents clicking on disabled tabs', () => {
      const handleChange = jest.fn();
      render(
        <Tabs onChange={handleChange}>
          <TabPanel label="Tab 1">Content 1</TabPanel>
          <TabPanel label="Tab 2" disabled>Content 2</TabPanel>
          <TabPanel label="Tab 3">Content 3</TabPanel>
        </Tabs>
      );
      
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[1]);
      expect(handleChange).not.toHaveBeenCalled();
      
      // First tab should still be selected
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM element', () => {
      const ref = React.createRef();
      render(renderTestTabs({ ref }));
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId('tap-tabs'));
    });
  });
});