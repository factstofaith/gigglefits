import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { checkA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Tabs, { Tab, TabPanel } from '@design-system/components/navigation/Tabs';

/**
 * Tabs component test suite
 */
describe('Tabs Component', () => {
  // Test basic rendering
  it('renders tabs correctly', () => {
    render(
      <MockThemeProvider>
        <Tabs data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
          <Tab label="Tab 3&quot; data-testid="tab-3" />
        </Tabs>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-1')).toBeInTheDocument();
    expect(screen.getByTestId('tab-2')).toBeInTheDocument();
    expect(screen.getByTestId('tab-3')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  // Test tab selection
  it('handles tab selection correctly', async () => {
    const user = setupUserEvent();
    const handleChange = jest.fn();
    
    render(
      <MockThemeProvider>
        <Tabs onChange={handleChange} data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
          <Tab label="Tab 3&quot; data-testid="tab-3" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // First tab should be selected by default
    const firstTab = screen.getByTestId('tab-1');
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
    
    // Click second tab
    await user.click(screen.getByTestId('tab-2'));
    expect(handleChange).toHaveBeenCalledWith(1);
    
    // Click third tab
    await user.click(screen.getByTestId('tab-3'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  // Test controlled vs uncontrolled behavior
  it('supports controlled and uncontrolled modes', async () => {
    const user = setupUserEvent();
    const handleChange = jest.fn();
    
    // Controlled component
    const { rerender } = render(
      <MockThemeProvider>
        <Tabs value={1} onChange={handleChange} data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
          <Tab label="Tab 3&quot; data-testid="tab-3" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Second tab should be selected initially
    expect(screen.getByTestId('tab-2')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-1')).toHaveAttribute('aria-selected', 'false');
    
    // Click first tab
    await user.click(screen.getByTestId('tab-1'));
    expect(handleChange).toHaveBeenCalledWith(0);
    
    // Component should not update without prop change in controlled mode
    expect(screen.getByTestId('tab-2')).toHaveAttribute('aria-selected', 'true');
    
    // Update value prop
    rerender(
      <MockThemeProvider>
        <Tabs value={0} onChange={handleChange} data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
          <Tab label="Tab 3&quot; data-testid="tab-3" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // First tab should now be selected
    expect(screen.getByTestId('tab-1')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-2')).toHaveAttribute('aria-selected', 'false');
    
    // Test uncontrolled component with defaultValue
    const { unmount } = render(
      <MockThemeProvider>
        <Tabs defaultValue={2} data-testid="tabs-uncontrolled">
          <Tab label="Tab 1&quot; data-testid="tab-4" />
          <Tab label="Tab 2&quot; data-testid="tab-5" />
          <Tab label="Tab 3&quot; data-testid="tab-6" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Third tab should be selected initially
    expect(screen.getByTestId('tab-6')).toHaveAttribute('aria-selected', 'true');
    
    // Click first tab
    await user.click(screen.getByTestId('tab-4'));
    
    // Component should update without prop change in uncontrolled mode
    expect(screen.getByTestId('tab-4')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-6')).toHaveAttribute('aria-selected', 'false');
    
    unmount();
  });

  // Test disabled tab
  it('disables tabs correctly', async () => {
    const user = setupUserEvent();
    const handleChange = jest.fn();
    
    render(
      <MockThemeProvider>
        <Tabs onChange={handleChange} data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" disabled />
          <Tab label="Tab 3&quot; data-testid="tab-3" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Second tab should be disabled
    const disabledTab = screen.getByTestId('tab-2');
    expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
    expect(disabledTab).toHaveAttribute('tabIndex', '-1');
    
    // Click disabled tab
    await user.click(disabledTab);
    expect(handleChange).not.toHaveBeenCalled();
    
    // Click enabled tab
    await user.click(screen.getByTestId('tab-3'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  // Test tab with icons
  it('renders tabs with icons', () => {
    const TestIcon = () => <span data-testid="test-icon">★</span>;
    
    render(
      <MockThemeProvider>
        <Tabs data-testid="tabs">
          <Tab 
            label="Tab with icon&quot; 
            icon={<TestIcon />} 
            data-testid="tab-with-icon" 
          />
          <Tab 
            icon={<TestIcon />} 
            data-testid="tab-icon-only" 
          />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Tab should contain both icon and label
    const tabWithIcon = screen.getByTestId('tab-with-icon');
    expect(tabWithIcon).toContainElement(screen.getAllByTestId('test-icon')[0]);
    expect(tabWithIcon).toHaveTextContent('Tab with icon');
    
    // Tab should contain only icon
    const tabIconOnly = screen.getByTestId('tab-icon-only');
    expect(tabIconOnly).toContainElement(screen.getAllByTestId('test-icon')[1]);
    expect(tabIconOnly).not.toHaveTextContent('Tab with icon');
  });

  // Test tab panel
  it('renders tab panels correctly', () => {
    render(
      <MockThemeProvider>
        <Tabs value={1} data-testid="tabs">
          <Tab label="Tab 1&quot; />
          <Tab label="Tab 2" />
        </Tabs>
        <TabPanel value={1} index={0} data-testid="panel-1">
          Content for Tab 1
        </TabPanel>
        <TabPanel value={1} index={1} data-testid="panel-2">
          Content for Tab 2
        </TabPanel>
      </MockThemeProvider>
    );
    
    // First panel should be hidden, second panel should be visible
    expect(screen.getByTestId('panel-1')).toHaveAttribute('hidden');
    expect(screen.getByTestId('panel-2')).not.toHaveAttribute('hidden');
    expect(screen.getByText('Content for Tab 2')).toBeVisible();
    expect(screen.queryByText('Content for Tab 1')).not.toBeVisible();
  });

  // Test different variants
  it('renders different variants correctly', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Tabs variant="standard&quot; data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Standard variant should have a bottom border
    let tabsElement = screen.getByRole('tablist');
    expect(tabsElement.style.borderBottom).toBeTruthy();
    
    // Test contained variant
    rerender(
      <MockThemeProvider>
        <Tabs variant="contained&quot; data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Contained variant should have a background color and shadow
    tabsElement = screen.getByRole('tablist');
    expect(tabsElement.style.backgroundColor).toBeTruthy();
    expect(tabsElement.style.boxShadow).toBeTruthy();
  });

  // Test different orientations
  it('supports vertical orientation', () => {
    render(
      <MockThemeProvider>
        <Tabs orientation="vertical&quot; data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Tabs container should have column flex direction
    const tabsElement = screen.getByRole('tablist');
    expect(tabsElement.style.flexDirection).toBe('column');
    expect(tabsElement).toHaveAttribute('aria-orientation', 'vertical');
  });

  // Test centered tabs
  it('centers tabs when centered prop is used', () => {
    render(
      <MockThemeProvider>
        <Tabs centered data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Tabs container should have center justification
    const tabsElement = screen.getByRole('tablist');
    expect(tabsElement.style.justifyContent).toBe('center');
  });

  // Test keyboard navigation
  it('supports keyboard navigation', async () => {
    const user = setupUserEvent();
    
    render(
      <MockThemeProvider>
        <Tabs data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
          <Tab label="Tab 3&quot; data-testid="tab-3" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Focus first tab
    const firstTab = screen.getByTestId('tab-1');
    firstTab.focus();
    expect(document.activeElement).toBe(firstTab);
    
    // Press right arrow to move to second tab
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByTestId('tab-2'));
    
    // Press right arrow again to move to third tab
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByTestId('tab-3'));
    
    // Press right arrow again to loop back to first tab
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByTestId('tab-1'));
    
    // Press left arrow to move to last tab
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(screen.getByTestId('tab-3'));
    
    // Press Home to move to first tab
    fireEvent.keyDown(document.activeElement, { key: 'Home' });
    expect(document.activeElement).toBe(screen.getByTestId('tab-1'));
    
    // Press End to move to last tab
    fireEvent.keyDown(document.activeElement, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByTestId('tab-3'));
  });

  // Test keyboard selection
  it('allows selecting tabs with keyboard', async () => {
    const handleChange = jest.fn();
    
    render(
      <MockThemeProvider>
        <Tabs onChange={handleChange} data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Focus second tab
    const secondTab = screen.getByTestId('tab-2');
    secondTab.focus();
    
    // Press Enter to select
    fireEvent.keyDown(secondTab, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(1);
    
    // Press Space to select
    fireEvent.keyDown(secondTab, { key: ' ' });
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  // Test scrollable tabs
  it('renders scrollable tabs correctly', () => {
    render(
      <MockThemeProvider>
        <Tabs scrollable data-testid="tabs">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
          <Tab label="Tab 3&quot; data-testid="tab-3" />
        </Tabs>
      </MockThemeProvider>
    );
    
    // Tabs container should have overflow-x auto
    const tabsElement = screen.getByRole('tablist');
    expect(tabsElement.style.overflowX).toBe('auto');
    
    // Should render scroll buttons
    expect(screen.getByLabelText('Scroll tabs left')).toBeInTheDocument();
    expect(screen.getByLabelText('Scroll tabs right')).toBeInTheDocument();
  });

  // Test ref forwarding
  it('forwards refs correctly', () => {
    const tabsRef = React.createRef();
    const tabRef = React.createRef();
    const panelRef = React.createRef();
    
    render(
      <MockThemeProvider>
        <Tabs ref={tabsRef} data-testid="tabs">
          <Tab ref={tabRef} label="Tab 1&quot; data-testid="tab-1" />
        </Tabs>
        <TabPanel ref={panelRef} value={0} index={0} data-testid="panel">
          Panel content
        </TabPanel>
      </MockThemeProvider>
    );
    
    expect(tabsRef.current).toBe(screen.getByTestId('tabs'));
    expect(tabRef.current).toBe(screen.getByTestId('tab-1'));
    expect(panelRef.current).toBe(screen.getByTestId('panel'));
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MockThemeProvider>
        <Tabs value={0} aria-label="Test tabs">
          <Tab label="Tab 1&quot; />
          <Tab label="Tab 2" />
        </Tabs>
        <TabPanel value={0} index={0}>
          Content for Tab 1
        </TabPanel>
        <TabPanel value={0} index={1}>
          Content for Tab 2
        </TabPanel>
      </MockThemeProvider>
    );
    
    const results = await checkA11y(container);
    expect(results).toHaveNoViolations();
  });

  // Test ARIA attributes
  it('applies correct ARIA attributes', () => {
    render(
      <MockThemeProvider>
        <Tabs value={0} aria-label="Custom tabs label">
          <Tab label="Tab 1&quot; data-testid="tab-1" />
          <Tab label="Tab 2&quot; data-testid="tab-2" />
        </Tabs>
        <TabPanel value={0} index={0} data-testid="panel-1">
          Content for Tab 1
        </TabPanel>
        <TabPanel value={0} index={1} data-testid="panel-2">
          Content for Tab 2
        </TabPanel>
      </MockThemeProvider>
    );
    
    // Tabs container should have proper aria attributes
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Custom tabs label');
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
    
    // Tabs should have proper aria attributes
    expect(screen.getByTestId('tab-1')).toHaveAttribute('role', 'tab');
    expect(screen.getByTestId('tab-1')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-2')).toHaveAttribute('aria-selected', 'false');
    
    // Panels should have proper aria attributes
    expect(screen.getByTestId('panel-1')).toHaveAttribute('role', 'tabpanel');
    expect(screen.getByTestId('panel-1')).toHaveAttribute('id', 'tabpanel-0');
    expect(screen.getByTestId('panel-1')).toHaveAttribute('aria-labelledby', 'tab-0');
    expect(screen.getByTestId('panel-2')).toHaveAttribute('hidden');
  });
});