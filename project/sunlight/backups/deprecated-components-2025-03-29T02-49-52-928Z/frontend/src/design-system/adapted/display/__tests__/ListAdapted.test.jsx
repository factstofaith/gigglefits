import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import List from '../ListAdapted';

// Mock react-window to avoid virtualization in tests
jest.mock('react-window', () => ({
  VariableSizeList: ({ children, itemCount }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index}>{children({ index, style: {} })}</div>
      ))}
    </div>
  ),
}));

describe('ListAdapted', () => {
  const mockItems = [
    { id: '1', primary: 'Item 1', secondary: 'Description 1' },
    { id: '2', primary: 'Item 2', secondary: 'Description 2' },
    { id: '3', primary: 'Item 3', secondary: 'Description 3' },
  ];

  const mockItemsWithClick = mockItems.map(item => ({ 
    ...item, 
    onClick: jest.fn() 
  }));

  const defaultProps = {
    id: 'test-list',
    items: mockItems,
    header: 'Test List',
  };

  test('renders correctly with default props', () => {
    render(<ListAdapted {...defaultProps} />);
    
    // Verify header is rendered
    expect(screen.getByText('Test List')).toBeInTheDocument();
    
    // Verify all items are rendered
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    
    // Verify secondary text is rendered
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('Description 3')).toBeInTheDocument();
  });

  test('renders empty message when no items', () => {
    render(<ListAdapted id="test-list&quot; items={[]} emptyMessage="No items available" />);
    
    // Verify empty message is displayed
    expect(screen.getByText('No items available')).toBeInTheDocument();
  });

  test('calls item onClick handler when clicked', () => {
    render(<ListAdapted id="test-list&quot; items={mockItemsWithClick} />);
    
    // Click on first item
    fireEvent.click(screen.getByText("Item 1'));
    
    // Verify onClick for that item was called
    expect(mockItemsWithClick[0].onClick).toHaveBeenCalled();
  });

  test('uses virtualization for large lists', () => {
    // Create a large list of items
    const manyItems = Array.from({ length: 50 }).map((_, i) => ({
      id: `item-${i}`,
      primary: `Item ${i}`,
      secondary: `Description ${i}`
    }));
    
    render(
      <ListAdapted 
        id="test-list&quot; 
        items={manyItems} 
        enableVirtualization={true} 
      />
    );
    
    // Check if virtualization component is used
    expect(screen.getByTestId("virtualized-list')).toBeInTheDocument();
  });

  test('customizes item rendering with renderItem prop', () => {
    const customRenderItem = ({ item }) => (
      <div data-testid="custom-item">{item.primary} - Custom</div>
    );
    
    render(
      <ListAdapted 
        {...defaultProps} 
        renderItem={customRenderItem}
      />
    );
    
    // Check if custom rendering is used
    const customItems = screen.getAllByTestId('custom-item');
    expect(customItems).toHaveLength(3);
    expect(customItems[0]).toHaveTextContent('Item 1 - Custom');
  });

  test('has no accessibility violations', async () => {
    const { container } = render(<ListAdapted {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});