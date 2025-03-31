import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import Tabs from '../TabsAdapted';

// Create custom wrapper component for testing TabsAdapted with its children
const TabsTestComponent = ({ orientation = 'horizontal', value = 0, onChange = jest.fn() }) => (
  <TabsAdapted 
    value={value} 
    onChange={onChange}
    orientation={orientation}
    aria-label="Test tabs"
  >
    <TabsAdapted.Tab label="Tab 1&quot; value={0} id="tab-0" />
    <TabsAdapted.Tab label="Tab 2&quot; value={1} id="tab-1" />
    <TabsAdapted.Tab label="Tab 3&quot; value={2} id="tab-2" disabled />
    
    <TabsAdapted.TabPanel value={0} id="panel-0&quot;>
      Content for Tab 1
    </TabsAdapted.TabPanel>
    <TabsAdapted.TabPanel value={1} id="panel-1">
      Content for Tab 2
    </TabsAdapted.TabPanel>
    <TabsAdapted.TabPanel value={2} id="panel-2&quot;>
      Content for Tab 3
    </TabsAdapted.TabPanel>
  </TabsAdapted>
);

describe("TabsAdapted', () => {
  it('renders with default props', () => {
    render(<TabsTestComponent />);
    
    // Check tabs
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
    
    // Check initial tab panel content
    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
    
    // Check that other panels are not visible
    expect(screen.queryByText('Content for Tab 2')).not.toBeVisible();
    expect(screen.queryByText('Content for Tab 3')).not.toBeVisible();
  });

  it('switches tab when clicked', () => {
    const handleChange = jest.fn();
    render(<TabsTestComponent onChange={handleChange} />);
    
    // Initially first tab is active
    expect(screen.getByText('Content for Tab 1')).toBeVisible();
    
    // Click on the second tab
    fireEvent.click(screen.getByText('Tab 2'));
    
    // Check that onChange was called with the correct value
    expect(handleChange).toHaveBeenCalledWith(expect.anything(), 1);
  });

  it('does not respond to clicks on disabled tabs', () => {
    const handleChange = jest.fn();
    render(<TabsTestComponent onChange={handleChange} />);
    
    // Click on the disabled tab
    fireEvent.click(screen.getByText('Tab 3'));
    
    // Ensure the onChange was not called
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders with vertical orientation', () => {
    render(<TabsTestComponent orientation="vertical&quot; />);
    
    // Find the tabs container
    const tabsContainer = screen.getByRole("tablist');
    expect(tabsContainer).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('shows the correct tab panel when value changes', () => {
    const { rerender } = render(<TabsTestComponent value={0} />);
    
    // Initially first tab content is visible
    expect(screen.getByText('Content for Tab 1')).toBeVisible();
    expect(screen.queryByText('Content for Tab 2')).not.toBeVisible();
    
    // Change the active tab prop
    rerender(<TabsTestComponent value={1} />);
    
    // Now the second tab content should be visible
    expect(screen.queryByText('Content for Tab 1')).not.toBeVisible();
    expect(screen.getByText('Content for Tab 2')).toBeVisible();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<TabsTestComponent />);
    
    // Check tablist role and aria-orientation
    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveAttribute('aria-orientation', 'horizontal');
    expect(tabList).toHaveAttribute('aria-label', 'Test tabs');
    
    // Check individual tabs
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('aria-controls', 'panel-0');
    expect(tab1).toHaveAttribute('id', 'tab-0');
    
    const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
    expect(tab3).toHaveAttribute('aria-disabled', 'true');
    
    // Check tab panels
    const panel1 = screen.getByRole('tabpanel');
    expect(panel1).toHaveAttribute('aria-labelledby', 'tab-0');
    expect(panel1).toHaveAttribute('id', 'panel-0');
  });

  it('renders tabs with icons', () => {
    render(
      <TabsAdapted value={0} onChange={jest.fn()}>
        <TabsAdapted.Tab 
          label="Tab with Icon&quot; 
          value={0} 
          icon={<span data-testid="test-icon">🔍</span>} 
        />
        <TabsAdapted.TabPanel value={0}>Content</TabsAdapted.TabPanel>
      </TabsAdapted>
    );
    
    expect(screen.getByText('Tab with Icon')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TabsTestComponent />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});