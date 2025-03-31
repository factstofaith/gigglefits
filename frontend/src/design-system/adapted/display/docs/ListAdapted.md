# ListAdapted Component

A high-performance list component with virtualization for large datasets and accessibility enhancements.

## Features

- Virtualized rendering for large datasets
- Customizable item rendering
- Empty state handling
- Comprehensive accessibility support
- Error boundary for resilience

## Usage

```jsx
import { List } from '../design-system/adapter';

// Basic usage
<List
  id="list-example"
  items={[
    { id: '1', primary: 'Item 1', secondary: 'Description 1' },
    { id: '2', primary: 'Item 2', secondary: 'Description 2' },
    { id: '3', primary: 'Item 3', secondary: 'Description 3' }
  ]}
  header="Basic List"
/>

// With click handlers
<List
  id="clickable-list"
  items={[
    { 
      id: '1', 
      primary: 'Item 1', 
      secondary: 'Description 1',
      onClick: (item) => handleItemClick(item)
    },
    // More items...
  ]}
/>

// With custom item rendering
<List
  id="custom-list"
  items={items}
  renderItem={({ item, index }) => (
    <div className="custom-item">
      <strong>{item.primary}</strong>
      <p>{item.secondary}</p>
      <button onClick={() => handleAction(item)}>Action</button>
    </div>
  )}
/>

// With virtualization for large datasets
<List
  id="virtualized-list"
  items={largeItemArray}
  enableVirtualization={true}
  maxHeight={400}
  itemSize={60}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | Required | Unique identifier for the component |
| `items` | array | `[]` | Array of item objects with properties used for rendering |
| `header` | node | `''` | Header text or element for the list |
| `dense` | boolean | `false` | Whether to render a more compact version of the list |
| `disablePadding` | boolean | `false` | Whether to remove the default padding |
| `maxHeight` | number | `400` | Maximum height of the list in pixels |
| `itemSize` | number | `56` | Height of each item in pixels for virtualization |
| `enableVirtualization` | boolean | `true` | Whether to enable virtualization for large lists |
| `renderItem` | function | `null` | Custom item renderer function |
| `emptyMessage` | node | `'No items to display'` | Message to display when list is empty |
| `ariaLabel` | string | - | Accessible label |
| `ariaLabelledBy` | string | - | ID of element that labels the list |

### Item Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string \| number | Unique identifier for the item |
| `primary` | node | Primary text/content |
| `secondary` | node | Secondary text/content |
| `icon` | node | Icon element to display |
| `onClick` | function | Click handler for the item |
| `selected` | boolean | Whether the item is selected |
| `disabled` | boolean | Whether the item is disabled |

## Performance Optimization

This component uses virtualization via `react-window` to render only the visible items when dealing with large datasets, significantly improving performance. The virtualization is automatically enabled for lists with more than 20 items but can be disabled if needed.

## Accessibility Features

- Proper list semantics with role attributes
- Keyboard navigation
- Focus management for interactive items
- ARIA attributes for list structure