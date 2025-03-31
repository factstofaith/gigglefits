# TableHeadAdapted & TableBodyAdapted

The `TableHeadAdapted` and `TableBodyAdapted` components extend the standard table header and body functionality with advanced features like sorting, virtualization, and enhanced accessibility.

## Features

### TableHeadAdapted
- **Sortable columns** with built-in direction indicators
- **Sticky header** support for scrollable tables
- **Comprehensive accessibility** attributes for screen readers
- **Custom cell component** with advanced formatting options

### TableBodyAdapted
- **Row virtualization** for efficient rendering of large datasets
- **Striped rows** for improved readability
- **Row selection** with proper styling and ARIA attributes
- **Customizable cell padding** and alignment

## API Reference

### TableHeadAdapted Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | | The content of the table head |
| `sortable` | `boolean` | `false` | If `true`, enables sorting for header cells |
| `onSort` | `function` | | Callback fired when a sortable column is clicked |
| `sortDirection` | `'asc'` \| `'desc'` | `'asc'` | The current sort direction |
| `sortBy` | `string` | `''` | The field name that is currently sorted |
| `stickyHeader` | `boolean` | `false` | If `true`, the header will stick to the top when scrolling |
| `ariaLabel` | `string` | `'Table header'` | Accessibility label for the component |

### TableHeadCellAdapted Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | | The content of the header cell |
| `sortable` | `boolean` | `false` | If `true`, enables sorting for this cell |
| `onSort` | `function` | | Callback fired when a sortable cell is clicked |
| `sortDirection` | `'asc'` \| `'desc'` | `'asc'` | The current sort direction |
| `sortBy` | `string` | `''` | The field name that is currently sorted |
| `field` | `string` | `''` | The field name associated with this column |
| `align` | `'left'` \| `'center'` \| `'right'` | `'left'` | The text alignment |
| `width` | `number` \| `string` | | The width of the cell |
| `minWidth` | `number` \| `string` | | The minimum width of the cell |
| `maxWidth` | `number` \| `string` | | The maximum width of the cell |
| `ariaLabel` | `string` | | Accessibility label for the component |
| `ariaSort` | `'ascending'` \| `'descending'` \| `'none'` | | ARIA sort attribute |

### TableBodyAdapted Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | | The content of the table body |
| `virtualized` | `boolean` | `false` | If `true`, enables virtualization for large datasets |
| `data` | `array` | `[]` | Data array for virtualized rendering |
| `rowHeight` | `number` | `53` | Height of each row in pixels for virtualization |
| `maxHeight` | `number` | `400` | Maximum height in pixels for the virtualized list |
| `renderRow` | `function` | | Function to render each row in virtualized mode |
| `striped` | `boolean` | `false` | If `true`, applies zebra striping to rows |
| `ariaLabel` | `string` | `'Table body'` | Accessibility label for the component |

### TableBodyRowAdapted Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | | The content of the table row |
| `hover` | `boolean` | `false` | If `true`, shows hover effect |
| `selected` | `boolean` | `false` | If `true`, displays the row as selected |
| `striped` | `boolean` | `false` | If `true`, displays zebra striping |
| `isOdd` | `boolean` | `false` | If `true`, applies odd row styling (for stripes) |
| `onClick` | `function` | | Callback fired when the row is clicked |
| `ariaLabel` | `string` | | Accessibility label for the component |

### TableBodyCellAdapted Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | | The content of the cell |
| `align` | `'left'` \| `'center'` \| `'right'` | `'left'` | The text alignment |
| `padding` | `'normal'` \| `'dense'` \| `'none'` | `'normal'` | The padding to use |
| `colSpan` | `number` | | Number of columns the cell should span |
| `width` | `number` \| `string` | | The width of the cell |
| `minWidth` | `number` \| `string` | | The minimum width of the cell |
| `maxWidth` | `number` \| `string` | | The maximum width of the cell |
| `ariaLabel` | `string` | | Accessibility label for the component |

## Usage Examples

### Basic Table with Sortable Header

```jsx
import { 
  TableHeadAdapted, 
  TableBodyAdapted 
} from '../../../design-system/adapter';

function SortableTable() {
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [data, setData] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ]);
  
  const handleSort = (field, direction) => {
    setSortBy(field);
    setSortDirection(direction);
    
    // Sort the data based on field and direction
    const sortedData = [...data].sort((a, b) => {
      if (direction === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    
    setData(sortedData);
  };
  
  return (
    <table>
      <TableHeadAdapted 
        sortable 
        sortBy={sortBy} 
        sortDirection={sortDirection} 
        onSort={handleSort}
      >
        <tr>
          <TableHeadAdapted.Cell field="id">ID</TableHeadAdapted.Cell>
          <TableHeadAdapted.Cell field="name">Name</TableHeadAdapted.Cell>
          <TableHeadAdapted.Cell field="email">Email</TableHeadAdapted.Cell>
        </tr>
      </TableHeadAdapted>
      
      <TableBodyAdapted>
        {data.map(item => (
          <TableBodyAdapted.Row key={item.id}>
            <TableBodyAdapted.Cell>{item.id}</TableBodyAdapted.Cell>
            <TableBodyAdapted.Cell>{item.name}</TableBodyAdapted.Cell>
            <TableBodyAdapted.Cell>{item.email}</TableBodyAdapted.Cell>
          </TableBodyAdapted.Row>
        ))}
      </TableBodyAdapted>
    </table>
  );
}
```

### Virtualized Table for Large Datasets

```jsx
import { 
  TableHeadAdapted, 
  TableBodyAdapted 
} from '../../../design-system/adapter';

function VirtualizedTable() {
  // Assume we have a large dataset with 1000+ rows
  const [data, setData] = useState(largeDataset);
  
  const renderRow = ({ data }) => (
    <TableBodyAdapted.Row>
      <TableBodyAdapted.Cell>{data.id}</TableBodyAdapted.Cell>
      <TableBodyAdapted.Cell>{data.name}</TableBodyAdapted.Cell>
      <TableBodyAdapted.Cell>{data.email}</TableBodyAdapted.Cell>
    </TableBodyAdapted.Row>
  );
  
  return (
    <table>
      <TableHeadAdapted stickyHeader>
        <tr>
          <TableHeadAdapted.Cell>ID</TableHeadAdapted.Cell>
          <TableHeadAdapted.Cell>Name</TableHeadAdapted.Cell>
          <TableHeadAdapted.Cell>Email</TableHeadAdapted.Cell>
        </tr>
      </TableHeadAdapted>
      
      <TableBodyAdapted 
        virtualized 
        data={data}
        rowHeight={53}
        maxHeight={500}
        renderRow={renderRow}
      />
    </table>
  );
}
```

### Selectable Rows

```jsx
import { 
  TableHeadAdapted, 
  TableBodyAdapted 
} from '../../../design-system/adapter';

function SelectableTable() {
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ]);
  
  const handleRowClick = (id) => {
    setSelectedId(id);
  };
  
  return (
    <table>
      <TableHeadAdapted>
        <tr>
          <TableHeadAdapted.Cell>ID</TableHeadAdapted.Cell>
          <TableHeadAdapted.Cell>Name</TableHeadAdapted.Cell>
          <TableHeadAdapted.Cell>Email</TableHeadAdapted.Cell>
        </tr>
      </TableHeadAdapted>
      
      <TableBodyAdapted>
        {data.map(item => (
          <TableBodyAdapted.Row 
            key={item.id}
            selected={selectedId === item.id}
            hover
            onClick={() => handleRowClick(item.id)}
          >
            <TableBodyAdapted.Cell>{item.id}</TableBodyAdapted.Cell>
            <TableBodyAdapted.Cell>{item.name}</TableBodyAdapted.Cell>
            <TableBodyAdapted.Cell>{item.email}</TableBodyAdapted.Cell>
          </TableBodyAdapted.Row>
        ))}
      </TableBodyAdapted>
    </table>
  );
}
```

## Accessibility

These components implement several important accessibility features:

- Proper semantic table structure with `<thead>` and `<tbody>` elements
- ARIA attributes for sorting (`aria-sort="ascending"`, etc.)
- Keyboard navigation support for interactive elements
- Selection state communicated via `aria-selected` attribute
- Proper labeling for all interactive elements

## Best Practices

1. **Use virtualization for large datasets**: Enable the `virtualized` prop when dealing with more than 100 rows for better performance
2. **Implement proper sorting logic**: When using sortable headers, ensure the data is properly sorted in your application logic
3. **Use sticky headers for long tables**: Enable the `stickyHeader` prop for tables that will scroll vertically
4. **Provide adequate width constraints**: Use the `width`, `minWidth`, or `maxWidth` props to ensure proper column sizing
5. **Include proper ARIA labels**: Use the `ariaLabel` props for better screen reader support