import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { checkA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Menu, { MenuItem, MenuDivider } from '@design-system/components/navigation/Menu';

// Mock createPortal to render menus in the test environment
jest.mock('react-dom', () => {
  const originalModule = jest.requireActual('react-dom');
  return {
    ...originalModule,
    createPortal: (node) => node,
  };
});

/**
 * Menu component test suite
 */
describe('Menu Component', () => {
  // Setup for most tests that need an anchor element
  const setupMenuWithAnchor = () => {
  // Added display name
  setupMenuWithAnchor.displayName = 'setupMenuWithAnchor';

  // Added display name
  setupMenuWithAnchor.displayName = 'setupMenuWithAnchor';

  // Added display name
  setupMenuWithAnchor.displayName = 'setupMenuWithAnchor';

  // Added display name
  setupMenuWithAnchor.displayName = 'setupMenuWithAnchor';

  // Added display name
  setupMenuWithAnchor.displayName = 'setupMenuWithAnchor';


    const anchor = document.createElement('button');
    anchor.textContent = 'Open Menu';
    document.body.appendChild(anchor);
    
    // Mock getBoundingClientRect
    anchor.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 100,
      height: 40,
      top: 100,
      right: 150,
      bottom: 140,
      left: 50,
    });
    
    return anchor;
  };
  
  // Cleanup after tests
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  // Test basic rendering of closed menu
  it('renders nothing when closed', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={false} anchorEl={anchorEl} data-testid="menu">
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  // Test basic rendering of open menu
  it('renders correctly when open', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} data-testid="menu">
          <MenuItem data-testid="item-1">Item 1</MenuItem>
          <MenuItem data-testid="item-2">Item 2</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('menu')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    
    // Menu should have proper role
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    // Menu items should have proper role
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  // Test menu positioning
  it('positions correctly based on anchor element', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} data-testid="menu" placement="bottom-start&quot;>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const menu = screen.getByTestId("menu');
    
    // Position should match the anchor's position (bottom-start)
    expect(menu.style.top).toBe('140px'); // anchor.bottom
    expect(menu.style.left).toBe('50px'); // anchor.left
  });

  // Test different placements
  it('applies different placement positions', () => {
    const anchorEl = setupMenuWithAnchor();
    
    const { rerender } = render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} data-testid="menu" placement="top-end&quot;>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    // We need to set offsetHeight for top placement calculation
    const menu = screen.getByTestId("menu');
    Object.defineProperty(menu, 'offsetHeight', { value: 100 });
    
    // Force recalculation
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // For top-end, menu should be positioned above anchor and aligned to the right
    expect(menu.style.top).toBe('0px'); // anchor.top - menu.offsetHeight
    expect(menu.style.left).toBe('50px'); // anchor.right - menu.width
    
    // Test center-center placement
    rerender(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} data-testid="menu" placement="center-center&quot;>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    // Force recalculation
    act(() => {
      window.dispatchEvent(new Event("resize'));
    });
    
    // For center-center, menu should be positioned at the center of the anchor
    expect(menu.style.top).toBe('70px'); // anchor.top + (anchor.height / 2) - (menu.offsetHeight / 2)
    const expectedLeft = anchorEl.getBoundingClientRect().left + 
      (anchorEl.getBoundingClientRect().width / 2) - 
      (parseInt(menu.style.minWidth) / 2);
    expect(parseInt(menu.style.left)).toBeCloseTo(expectedLeft, 0);
  });

  // Test click on menu item
  it('calls onClick handler when menu item is clicked', async () => {
    const user = setupUserEvent();
    const anchorEl = setupMenuWithAnchor();
    const handleItemClick = jest.fn();
    const handleClose = jest.fn();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} onClose={handleClose}>
          <MenuItem onClick={handleItemClick} data-testid="menu-item">
            Click Me
          </MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    // Click the menu item
    await user.click(screen.getByTestId('menu-item'));
    
    // Both item click and menu close handlers should be called
    expect(handleItemClick).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledWith(expect.anything(), 'itemClick');
  });

  // Test disabled menu item
  it('disables menu items correctly', async () => {
    const user = setupUserEvent();
    const anchorEl = setupMenuWithAnchor();
    const handleItemClick = jest.fn();
    const handleClose = jest.fn();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} onClose={handleClose}>
          <MenuItem onClick={handleItemClick} disabled data-testid="disabled-item">
            Disabled Item
          </MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const disabledItem = screen.getByTestId('disabled-item');
    
    // Disabled item should have proper attributes
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    expect(disabledItem).toHaveAttribute('tabIndex', '-1');
    
    // Click should not trigger handlers
    await user.click(disabledItem);
    expect(handleItemClick).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });

  // Test menu with icons
  it('renders menu items with icons', () => {
    const anchorEl = setupMenuWithAnchor();
    const TestIcon = () => <span data-testid="test-icon">★</span>;
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl}>
          <MenuItem icon={<TestIcon />} data-testid="item-with-icon">
            Item with Icon
          </MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const menuItem = screen.getByTestId('item-with-icon');
    expect(menuItem).toContainElement(screen.getByTestId('test-icon'));
    expect(menuItem).toHaveTextContent('Item with Icon');
  });

  // Test menu divider
  it('renders menu divider correctly', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl}>
          <MenuItem>Item 1</MenuItem>
          <MenuDivider data-testid="divider" />
          <MenuItem>Item 2</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const divider = screen.getByTestId('divider');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute('role', 'separator');
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  });

  // Test divider in menu item
  it('renders menu item with divider', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl}>
          <MenuItem divider data-testid="item-with-divider">
            Item with Divider
          </MenuItem>
          <MenuItem>Next Item</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const itemWithDivider = screen.getByTestId('item-with-divider');
    expect(itemWithDivider.style.borderBottom).not.toBe('none');
  });

  // Test dense menu items
  it('renders dense menu items correctly', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl}>
          <MenuItem data-testid="regular-item">Regular Item</MenuItem>
          <MenuItem dense data-testid="dense-item">Dense Item</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const regularItem = screen.getByTestId('regular-item');
    const denseItem = screen.getByTestId('dense-item');
    
    expect(regularItem.style.minHeight).toBe('48px');
    expect(denseItem.style.minHeight).toBe('32px');
    expect(denseItem.style.padding).not.toBe(regularItem.style.padding);
  });

  // Test selected menu items
  it('renders selected menu items correctly', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl}>
          <MenuItem data-testid="regular-item">Regular Item</MenuItem>
          <MenuItem selected data-testid="selected-item">Selected Item</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const selectedItem = screen.getByTestId('selected-item');
    
    // Selected item should have background color and font weight
    expect(selectedItem.style.backgroundColor).toBe(mockTheme.colors.action.selected);
    expect(selectedItem.style.fontWeight).toBe(mockTheme.typography.fontWeights.medium.toString());
  });

  // Test click outside to close
  it('closes menu when clicking outside', async () => {
    const user = setupUserEvent();
    const anchorEl = setupMenuWithAnchor();
    const handleClose = jest.fn();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} onClose={handleClose} data-testid="menu">
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    // Create an outside element
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);
    
    // Click outside the menu
    fireEvent.mouseDown(outsideElement);
    
    // onClose should be called with 'clickaway' reason
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledWith(expect.anything(), 'clickaway');
  });

  // Test escape key to close
  it('closes menu with Escape key', async () => {
    const anchorEl = setupMenuWithAnchor();
    const handleClose = jest.fn();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} onClose={handleClose} data-testid="menu">
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // onClose should be called with 'escapeKeyDown' reason
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledWith(expect.anything(), 'escapeKeyDown');
  });

  // Test autofocus
  it('autofocuses first menu item when open', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} autoFocus={true}>
          <MenuItem data-testid="item-1">Item 1</MenuItem>
          <MenuItem data-testid="item-2">Item 2</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    // First item should be focused
    expect(document.activeElement).toBe(screen.getByTestId('item-1'));
  });

  // Test keyboard navigation
  it('supports keyboard navigation', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl}>
          <MenuItem data-testid="item-1">Item 1</MenuItem>
          <MenuItem data-testid="item-2">Item 2</MenuItem>
          <MenuItem data-testid="item-3">Item 3</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const menu = screen.getByRole('menu');
    const item1 = screen.getByTestId('item-1');
    const item2 = screen.getByTestId('item-2');
    const item3 = screen.getByTestId('item-3');
    
    // Focus first item
    item1.focus();
    expect(document.activeElement).toBe(item1);
    
    // ArrowDown should move to next item
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(item2);
    
    // ArrowDown again should move to last item
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(item3);
    
    // ArrowDown again should wrap to first item
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(item1);
    
    // ArrowUp should move to last item
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(item3);
    
    // Home should move to first item
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(document.activeElement).toBe(item1);
    
    // End should move to last item
    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toBe(item3);
  });

  // Test keyboard selection
  it('allows selecting menu items with keyboard', async () => {
    const anchorEl = setupMenuWithAnchor();
    const handleItemClick = jest.fn();
    const handleClose = jest.fn();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} onClose={handleClose}>
          <MenuItem onClick={handleItemClick} data-testid="menu-item">
            Click Me
          </MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const menuItem = screen.getByTestId('menu-item');
    menuItem.focus();
    
    // Press Enter to select
    fireEvent.keyDown(menuItem, { key: 'Enter' });
    expect(handleItemClick).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
    
    // Reset mocks
    handleItemClick.mockClear();
    handleClose.mockClear();
    
    // Press Space to select
    fireEvent.keyDown(menuItem, { key: ' ' });
    expect(handleItemClick).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // Test menu with custom minWidth
  it('applies custom minWidth', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} minWidth={200} data-testid="menu">
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const menu = screen.getByTestId('menu');
    expect(menu.style.minWidth).toBe('200px');
  });

  // Test menu with custom maxHeight
  it('applies custom maxHeight', () => {
    const anchorEl = setupMenuWithAnchor();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} maxHeight={150} data-testid="menu">
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const menu = screen.getByTestId('menu');
    expect(menu.style.maxHeight).toBe('150px');
  });

  // Test ref forwarding
  it('forwards ref correctly', () => {
    const anchorEl = setupMenuWithAnchor();
    const menuRef = React.createRef();
    const itemRef = React.createRef();
    const dividerRef = React.createRef();
    
    render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl} ref={menuRef}>
          <MenuItem ref={itemRef} data-testid="menu-item">Item 1</MenuItem>
          <MenuDivider ref={dividerRef} data-testid="menu-divider" />
        </Menu>
      </MockThemeProvider>
    );
    
    expect(menuRef.current).toBeDefined();
    expect(itemRef.current).toBe(screen.getByTestId('menu-item'));
    expect(dividerRef.current).toBe(screen.getByTestId('menu-divider'));
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    const anchorEl = setupMenuWithAnchor();
    
    const { container } = render(
      <MockThemeProvider>
        <Menu open={true} anchorEl={anchorEl}>
          <MenuItem>Item 1</MenuItem>
          <MenuDivider />
          <MenuItem>Item 2</MenuItem>
          <MenuItem disabled>Disabled Item</MenuItem>
        </Menu>
      </MockThemeProvider>
    );
    
    const results = await checkA11y(container);
    expect(results).toHaveNoViolations();
  });
});

// Mock theme for style testing
const mockTheme = {
  colors: {
    action: {
      selected: 'rgba(0, 0, 0, 0.08)'
    }
  },
  typography: {
    fontWeights: {
      medium: 500
    }
  }
};