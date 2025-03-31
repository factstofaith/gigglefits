# DataPreviewAdapted

The `DataPreviewAdapted` component is a high-performance data visualization component designed for displaying and interacting with large datasets. It supports both tabular and JSON views, with comprehensive filtering, validation, and virtualization features for optimal performance.

## Features

- **Virtualized rendering** for extremely efficient display of large datasets
- **Dual view modes**: Table and JSON representations
- **Advanced filtering** capabilities with field-specific filtering
- **Schema validation** with detailed error and warning reporting
- **Expandable rows** for detailed data inspection
- **Download functionality** for exporting data
- **Comprehensive accessibility** support

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array` | `null` | Array of objects to display in the preview |
| `schema` | `Object` | `null` | Schema object defining the structure and validation rules for the data |
| `isLoading` | `Boolean` | `false` | Whether the data is currently loading |
| `error` | `String` | `null` | Error message to display if data loading failed |
| `onRefresh` | `Function` | **required** | Callback function to refresh the data |
| `dataSource` | `String` | `''` | Source identifier for the data being displayed |
| `maxHeight` | `Number` | `400` | Maximum height of the component in pixels |
| `showDownload` | `Boolean` | `true` | Whether to show the download button |
| `showFilters` | `Boolean` | `true` | Whether to show filtering controls |
| `showValidation` | `Boolean` | `true` | Whether to show validation results |
| `initialViewMode` | `'table'` or `'json'` | `'table'` | Initial view mode for the data |
| `ariaLabel` | `String` | `'Data Preview'` | Accessibility label for the component |

### Schema Format

The schema object should have the following structure:

```js
{
  fields: [
    {
      name: 'fieldName',    // Field identifier
      type: 'string',       // Data type (string, number, boolean, date, object, array)
      required: true,       // Whether the field is required
      format: 'email'       // Optional format constraint (email, uri, uuid)
    },
    // Additional fields...
  ]
}
```

## Usage Examples

### Basic Usage

```jsx
import { DataPreviewAdapted } from '../../../design-system/adapter';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await fetchData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DataPreviewAdapted
      data={data}
      isLoading={isLoading}
      error={error}
      onRefresh={handleRefresh}
      dataSource="API Example"
    />
  );
};
```

### With Schema Validation

```jsx
import { DataPreviewAdapted } from '../../../design-system/adapter';

const MyValidatedComponent = () => {
  const [data, setData] = useState(null);
  
  // Define schema for validation
  const schema = {
    fields: [
      { name: 'id', type: 'number', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'email', type: 'string', format: 'email' },
      { name: 'isActive', type: 'boolean' },
      { name: 'createdAt', type: 'date' }
    ]
  };
  
  const handleRefresh = async () => {
    // Fetch data implementation
  };
  
  return (
    <DataPreviewAdapted
      data={data}
      schema={schema}
      onRefresh={handleRefresh}
      showValidation={true}
    />
  );
};
```

### JSON View Mode

```jsx
import { DataPreviewAdapted } from '../../../design-system/adapter';

const JsonViewExample = () => {
  const [data, setData] = useState([
    { id: 1, name: 'Item 1', details: { category: 'A', tags: ['important', 'featured'] } },
    { id: 2, name: 'Item 2', details: { category: 'B', tags: ['standard'] } }
  ]);
  
  return (
    <DataPreviewAdapted
      data={data}
      onRefresh={() => {}}
      initialViewMode="json"
      maxHeight={600}
    />
  );
};
```

## Performance Considerations

The `DataPreviewAdapted` component uses several techniques to ensure optimal performance:

1. **Virtualization**: Only renders visible rows in the viewport using `react-window`'s `FixedSizeList`
2. **Memoization**: Uses `React.memo` to prevent unnecessary re-renders
3. **Efficient Filtering**: Applies filters through memoized data transformation
4. **Lazy Expansion**: Only renders expanded row content when needed
5. **Optimized Rendering**: Minimizes DOM operations and maintains consistent update patterns

For extremely large datasets (over 10,000 rows), consider implementing pagination on the server side and loading chunks of data as needed.

## Accessibility

The component includes several accessibility features:

- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Focus management for interactive elements
- Appropriate contrast ratios for text and UI elements
- Detailed error messaging with screen reader support

## Technical Implementation

The `DataPreviewAdapted` component uses the following key technologies:

- **react-window**: For virtualized rendering of table rows
- **react-json-view**: For JSON visualization
- **React hooks**: For state management and memoization
- **Accessibility utilities**: For ARIA attribute integration

## Customization

While the component provides comprehensive built-in functionality, for advanced customization scenarios, consider:

1. Extending the schema validation with custom validation functions
2. Creating a wrapper component to add specialized filtering logic
3. Implementing a custom row renderer for domain-specific visualization