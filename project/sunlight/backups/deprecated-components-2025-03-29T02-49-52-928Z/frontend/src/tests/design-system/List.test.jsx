import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { checkA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import List, { ListItem, ListItemText, ListItemIcon } from '@design-system/components/display/List';

/**
 * List component test suite
 */
describe('List Component', () => {
  // Test basic rendering
  it('renders list correctly', () => {
    render(
      <MockThemeProvider>
        <List data-testid="list">
          <ListItem data-testid="list-item-1">Item 1</ListItem>
          <ListItem data-testid="list-item-2">Item 2</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('list')).toBeInTheDocument();
    expect(screen.getByTestId('list-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('list-item-2')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  // Test List component styles
  it('applies correct styles to List component', () => {
    render(
      <MockThemeProvider>
        <List data-testid="list">
          <ListItem>Item 1</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const list = screen.getByTestId('list');
    expect(list.tagName).toBe('UL');
    expect(list.style.margin).toBe('0px');
    expect(list.style.padding).not.toBe('0px'); // Default padding is applied
    expect(list.style.listStyle).toBe('none');
    expect(list.style.width).toBe('100%');
  });

  // Test disablePadding prop
  it('respects disablePadding prop', () => {
    render(
      <MockThemeProvider>
        <List disablePadding data-testid="list-no-padding">
          <ListItem>Item 1</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const list = screen.getByTestId('list-no-padding');
    expect(list.style.padding).toBe('0px');
  });

  // Test dense prop
  it('passes dense prop to child ListItems', () => {
    render(
      <MockThemeProvider>
        <List dense data-testid="dense-list">
          <ListItem data-testid="list-item">Item 1</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const listItem = screen.getByTestId('list-item');
    expect(listItem.style.padding).toBeTruthy();
    // The padding on dense items is smaller than regular items
    expect(listItem.style.padding).not.toBe('16px 16px'); // Not regular padding
  });

  // Test subheader rendering
  it('renders subheader correctly', () => {
    render(
      <MockThemeProvider>
        <List subheader="List Subheader&quot; data-testid="list-with-subheader">
          <ListItem>Item 1</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    expect(screen.getByText('List Subheader')).toBeInTheDocument();
  });

  // Test ListItem rendering
  it('renders ListItem correctly', () => {
    render(
      <MockThemeProvider>
        <List>
          <ListItem data-testid="list-item">Item 1</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const listItem = screen.getByTestId('list-item');
    expect(listItem.tagName).toBe('LI'); // Default tag is li
    expect(listItem.style.display).toBe('flex');
    expect(listItem.style.alignItems).toBe('center');
    expect(listItem.style.width).toBe('100%');
  });

  // Test ListItem as button
  it('renders ListItem as button when button prop is true', () => {
    render(
      <MockThemeProvider>
        <List>
          <ListItem button data-testid="button-list-item">Button Item</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const buttonItem = screen.getByTestId('button-list-item');
    expect(buttonItem.tagName).toBe('BUTTON');
    expect(buttonItem).toHaveAttribute('role', 'button');
    expect(buttonItem).toHaveAttribute('tabIndex', '0');
    expect(buttonItem.style.cursor).toBe('pointer');
  });

  // Test ListItem with onClick
  it('makes ListItem clickable with onClick', async () => {
    const user = setupUserEvent();
    const handleClick = jest.fn();
    
    render(
      <MockThemeProvider>
        <List>
          <ListItem onClick={handleClick} data-testid="clickable-item">Clickable Item</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const clickableItem = screen.getByTestId('clickable-item');
    expect(clickableItem).toHaveAttribute('role', 'button');
    expect(clickableItem).toHaveAttribute('tabIndex', '0');
    expect(clickableItem.style.cursor).toBe('pointer');
    
    await user.click(clickableItem);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test keyboard navigation for clickable ListItem
  it('supports keyboard navigation for clickable ListItems', () => {
    const handleClick = jest.fn();
    
    render(
      <MockThemeProvider>
        <List>
          <ListItem onClick={handleClick} data-testid="clickable-item">Clickable Item</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const clickableItem = screen.getByTestId('clickable-item');
    
    // Press Enter key
    fireEvent.keyDown(clickableItem, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Press Space key
    fireEvent.keyDown(clickableItem, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  // Test disabled ListItem
  it('disables ListItem when disabled prop is true', async () => {
    const user = setupUserEvent();
    const handleClick = jest.fn();
    
    render(
      <MockThemeProvider>
        <List>
          <ListItem 
            onClick={handleClick} 
            disabled 
            data-testid="disabled-item"
          >
            Disabled Item
          </ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const disabledItem = screen.getByTestId('disabled-item');
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    expect(disabledItem.style.opacity).toBeLessThan(1);
    expect(disabledItem.style.cursor).toBe('default');
    
    // Click should not trigger handler
    await user.click(disabledItem);
    expect(handleClick).not.toHaveBeenCalled();
    
    // Keyboard should not trigger handler
    fireEvent.keyDown(disabledItem, { key: 'Enter' });
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test selected ListItem
  it('applies selected styling to ListItem', () => {
    render(
      <MockThemeProvider>
        <List>
          <ListItem data-testid="regular-item">Regular Item</ListItem>
          <ListItem selected data-testid="selected-item">Selected Item</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const regularItem = screen.getByTestId('regular-item');
    const selectedItem = screen.getByTestId('selected-item');
    
    expect(regularItem.style.backgroundColor).toBe('transparent');
    expect(selectedItem.style.backgroundColor).toBe(mockTheme.colors.action.selected);
  });

  // Test ListItem with divider
  it('renders ListItem with divider', () => {
    render(
      <MockThemeProvider>
        <List>
          <ListItem divider data-testid="divider-item">Item with Divider</ListItem>
          <ListItem>Next Item</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const dividerItem = screen.getByTestId('divider-item');
    expect(dividerItem.style.borderBottom).not.toBe('none');
  });

  // Test ListItem with dense prop
  it('renders dense ListItem correctly', () => {
    render(
      <MockThemeProvider>
        <List>
          <ListItem data-testid="regular-item">Regular Item</ListItem>
          <ListItem dense data-testid="dense-item">Dense Item</ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const regularItem = screen.getByTestId('regular-item');
    const denseItem = screen.getByTestId('dense-item');
    
    // Dense item should have less padding
    expect(regularItem.style.padding).not.toBe(denseItem.style.padding);
  });

  // Test ListItem with primary and secondary text
  it('renders ListItem with primary and secondary text', () => {
    render(
      <MockThemeProvider>
        <List>
          <ListItem 
            primary="Primary Text&quot; 
            secondary="Secondary Text"
            data-testid="text-item"
          />
        </List>
      </MockThemeProvider>
    );
    
    expect(screen.getByText('Primary Text')).toBeInTheDocument();
    expect(screen.getByText('Secondary Text')).toBeInTheDocument();
    
    // Styles should differ between primary and secondary
    const primaryText = screen.getByText('Primary Text');
    const secondaryText = screen.getByText('Secondary Text');
    
    expect(primaryText.style.fontWeight).toBe(mockTheme.typography.fontWeights.medium.toString());
    expect(secondaryText.style.color).toBe(mockTheme.colors.text.secondary);
  });

  // Test ListItem with start icon
  it('renders ListItem with start icon', () => {
    const StartIcon = () => <span data-testid="start-icon">★</span>;
    
    render(
      <MockThemeProvider>
        <List>
          <ListItem 
            primary="Item with Icon&quot;
            startIcon={<StartIcon />}
            data-testid="icon-item"
          />
        </List>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByText('Item with Icon')).toBeInTheDocument();
  });

  // Test ListItem with end icon
  it('renders ListItem with end icon', () => {
    const EndIcon = () => <span data-testid="end-icon">→</span>;
    
    render(
      <MockThemeProvider>
        <List>
          <ListItem 
            primary="Item with Icon&quot;
            endIcon={<EndIcon />}
            data-testid="icon-item"
          />
        </List>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    expect(screen.getByText('Item with Icon')).toBeInTheDocument();
  });

  // Test ListItemText component
  it('renders ListItemText correctly', () => {
    render(
      <MockThemeProvider>
        <List>
          <ListItem>
            <ListItemText 
              primary="Primary Text&quot; 
              secondary="Secondary Text"
              data-testid="item-text"
            />
          </ListItem>
        </List>
      </MockThemeProvider>
    );
    
    expect(screen.getByText('Primary Text')).toBeInTheDocument();
    expect(screen.getByText('Secondary Text')).toBeInTheDocument();
    
    const itemText = screen.getByTestId('item-text');
    expect(itemText.style.flex).toBe('1 1 auto');
  });

  // Test ListItemIcon component
  it('renders ListItemIcon correctly', () => {
    const TestIcon = () => <span data-testid="test-icon">★</span>;
    
    render(
      <MockThemeProvider>
        <List>
          <ListItem>
            <ListItemIcon data-testid="item-icon">
              <TestIcon />
            </ListItemIcon>
            <ListItemText primary="Item with Icon&quot; />
          </ListItem>
        </List>
      </MockThemeProvider>
    );
    
    const itemIcon = screen.getByTestId("item-icon');
    expect(itemIcon).toBeInTheDocument();
    expect(itemIcon).toContainElement(screen.getByTestId('test-icon'));
    expect(itemIcon.style.minWidth).toBe('36px');
    expect(itemIcon.style.display).toBe('inline-flex');
  });

  // Test all sub-components together
  it('composes all list components correctly', () => {
    const StartIcon = () => <span data-testid="start-icon">★</span>;
    const EndIcon = () => <span data-testid="end-icon">→</span>;
    
    render(
      <MockThemeProvider>
        <List subheader="My List&quot; data-testid="complex-list">
          <ListItem button data-testid="item-1">
            <ListItemIcon>
              <StartIcon />
            </ListItemIcon>
            <ListItemText primary="Button Item&quot; secondary="With secondary text" />
            <ListItemIcon>
              <EndIcon />
            </ListItemIcon>
          </ListItem>
          <ListItem divider selected data-testid="item-2">
            <ListItemText primary="Selected & Divider&quot; />
          </ListItem>
          <ListItem disabled data-testid="item-3">
            <ListItemIcon>
              <StartIcon />
            </ListItemIcon>
            <ListItemText primary="Disabled Item&quot; />
          </ListItem>
        </List>
      </MockThemeProvider>
    );
    
    // Verify structure
    expect(screen.getByTestId("complex-list')).toBeInTheDocument();
    expect(screen.getByText('My List')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toHaveAttribute('role', 'button');
    expect(screen.getByTestId('item-2').style.backgroundColor).toBe(mockTheme.colors.action.selected);
    expect(screen.getByTestId('item-2').style.borderBottom).not.toBe('none');
    expect(screen.getByTestId('item-3')).toHaveAttribute('aria-disabled', 'true');
    
    // Verify content
    expect(screen.getByText('Button Item')).toBeInTheDocument();
    expect(screen.getByText('With secondary text')).toBeInTheDocument();
    expect(screen.getByText('Selected & Divider')).toBeInTheDocument();
    expect(screen.getByText('Disabled Item')).toBeInTheDocument();
    expect(screen.getAllByTestId('start-icon')).toHaveLength(2);
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  // Test ref forwarding
  it('forwards refs correctly', () => {
    const listRef = React.createRef();
    const itemRef = React.createRef();
    const textRef = React.createRef();
    const iconRef = React.createRef();
    
    render(
      <MockThemeProvider>
        <List ref={listRef} data-testid="list">
          <ListItem ref={itemRef} data-testid="list-item">
            <ListItemIcon ref={iconRef} data-testid="item-icon">
              <span>★</span>
            </ListItemIcon>
            <ListItemText ref={textRef} data-testid="item-text" primary="Text&quot; />
          </ListItem>
        </List>
      </MockThemeProvider>
    );
    
    expect(listRef.current).toBe(screen.getByTestId("list'));
    expect(itemRef.current).toBe(screen.getByTestId('list-item'));
    expect(textRef.current).toBe(screen.getByTestId('item-text'));
    expect(iconRef.current).toBe(screen.getByTestId('item-icon'));
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MockThemeProvider>
        <List subheader="Accessible List&quot;>
          <ListItem button>
            <ListItemText primary="Clickable Item" />
          </ListItem>
          <ListItem disabled>
            <ListItemText primary="Disabled Item&quot; />
          </ListItem>
          <ListItem selected>
            <ListItemText primary="Selected Item" secondary="With description&quot; />
          </ListItem>
        </List>
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
      selected: "rgba(0, 0, 0, 0.08)'
    },
    text: {
      secondary: 'rgba(0, 0, 0, 0.6)'
    }
  },
  typography: {
    fontWeights: {
      medium: 500
    }
  }
};