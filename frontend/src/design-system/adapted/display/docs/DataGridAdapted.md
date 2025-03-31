# DataGridAdapted Component

A high-performance data grid with virtualization for large datasets, comprehensive accessibility features, and flexible rendering options.

## Features

- Virtualized rendering for large datasets (1000+ rows)
- Customizable column and row rendering
- Loading and empty states
- Sticky headers
- Row click handling
- Full keyboard navigation
- Accessibility compliance

## Usage

```jsx
import { DataGrid } from '../design-system/adapter';

// Basic usage
<DataGrid
  id="users-grid"
  columns={[
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 300 },
    { field: 'role', headerName: 'Role', width: 150 }
  ]}
  rows={usersList}
  height={400}
/>

// With row click handler
<DataGrid
  id="clickable-grid"
  columns={columns}
  rows={rows}
  onRowClick={(row) => handleRowSelection(row)}
/>

// With loading state
<DataGrid
  id="loading-grid"
  columns={columns}
  rows={rows}
  loading={isLoading}
  loadingComponent={<CustomLoadingIndicator />}
/>

// With custom cell rendering
<DataGrid
  id="custom-cell-grid"
  columns={columns}
  rows={rows}
  renderCell={({ column, row, rowIndex, columnIndex }) => (
    <TableCell>
      {column.field === 'actions' ? (
        <Button onClick={() => handleAction(row)}>Edit</Button>
      ) : (
        row[column.field]
      )}
    </TableCell>
  )}
/>

// With virtualization for large datasets
<DataGrid
  id="large-dataset-grid"
  columns={columns}
  rows={largeDataset}
  height={600}
  enableVirtualization={true}
  headerHeight={56}
  rowHeight={48}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | Required | Unique identifier for the grid |
| `columns` | array | Required | Column definitions array |
| `rows` | array | Required | Data rows array |
| `height` | number \| string | `400` | Height of the grid |
| `width` | number \| string | `'100%'` | Width of the grid |
| `headerHeight` | number | `48` | Height of the header row |
| `rowHeight` | number | `52` | Height of data rows |
| `enableVirtualization` | boolean | `true` | Whether to enable virtualization for large datasets |
| `stickyHeader` | boolean | `true` | Whether to make the header stick to the top during scrolling |
| `dense` | boolean | `false` | Whether to use dense padding for cells |
| `noDataMessage` | node | `'No data available'` | Message to display when there are no rows |
| `onRowClick` | function | `null` | Handler called when a row is clicked |
| `loading` | boolean | `false` | Whether the grid is in loading state |
| `loadingComponent` | node | `null` | Custom loading indicator |
| `getRowId` | function | `(row) => row.id` | Function to get unique row identifier |
| `getRowClassName` | function | `() => ''` | Function to get CSS class for a row |
| `getCellClassName` | function | `() => ''` | Function to get CSS class for a cell |
| `renderCell` | function | `null` | Custom cell renderer function |
| `ariaLabel` | string | - | Accessible label |
| `ariaLabelledBy` | string | - | ID of element that labels the grid |
| `ariaDescribedBy` | string | - | ID of element that describes the grid |

### Column Definition

| Property | Type | Description |
|----------|------|-------------|
| `field` | string | Field name in the row data object |
| `headerName` | node | Display name for the column header |
| `width` | number | Width of the column in pixels |
| `align` | 'left' \| 'center' \| 'right' | Text alignment for the column |

## Performance Optimization

The DataGridAdapted component uses `react-window` for virtualized rendering, which significantly improves performance with large datasets by only rendering visible rows and columns. The virtualization is automatically enabled for datasets with more than 50 rows but can be configured using the `enableVirtualization` prop.

## Accessibility Features

- Proper ARIA attributes for grid structure
- Keyboard navigation
- Focus management for interactive elements
- Proper row and column headers
- Screen reader support