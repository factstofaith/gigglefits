# PaginationAdapted Component

The `PaginationAdapted` component provides navigation controls for moving between multiple pages of content.

## Features

- Consistent Material UI compatibility with design system styling
- Multiple visual variants: text, outlined, and contained
- Customizable page boundary and sibling counts
- First/last page navigation options
- Full keyboard accessibility
- Screen reader support with ARIA attributes

## Usage

```jsx
import { Pagination } from 'design-system/adapter';

function ResultsPage() {
  const [page, setPage] = React.useState(1);
  const totalPages = 10;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    loadData(newPage);
  };

  return (
    <div>
      <ResultsList data={currentPageData} />
      
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </div>
  );
}
```

## Props

### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | number | 1 | The total number of pages |
| `page` | number | 1 | The current page |
| `defaultPage` | number | 1 | The default page selected (uncontrolled mode) |
| `color` | string | 'primary' | The color of the pagination: 'primary', 'secondary', 'success', 'error', 'warning', 'info' |
| `size` | string | 'medium' | The size of the pagination: 'small', 'medium', 'large' |
| `disabled` | boolean | false | If true, the pagination is disabled |

### Display Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | 'outlined' | The variant to use: 'text', 'outlined', 'contained' |
| `shape` | string | 'rounded' | The shape of the pagination items: 'rounded', 'circular' |
| `boundaryCount` | number | 1 | Number of pages at the beginning and end |
| `siblingCount` | number | 1 | Number of sibling pages on either side of the current page |

### Navigation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showFirstButton` | boolean | false | If true, show the first-page button |
| `showLastButton` | boolean | false | If true, show the last-page button |
| `hideNextButton` | boolean | false | If true, hide the next-page button |
| `hidePrevButton` | boolean | false | If true, hide the previous-page button |

### Interaction Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onChange` | function | — | Callback fired when the page is changed. Signature: (event, page) => void |

### Accessibility Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | string | — | Aria label for the navigation element |
| `getItemAriaLabel` | function | — | Function to generate aria-label for page items. Signature: (type, page, selected) => string |

## Examples

### Basic Pagination

```jsx
<Pagination 
  count={10} 
  page={currentPage} 
  onChange={handleChange}
/>
```

### With First/Last Buttons

```jsx
<Pagination 
  count={10} 
  page={currentPage} 
  onChange={handleChange}
  showFirstButton
  showLastButton
/>
```

### Different Variants

```jsx
<>
  <Pagination variant="text" count={10} />
  <Pagination variant="outlined" count={10} />
  <Pagination variant="contained" count={10} />
</>
```

### Different Sizes

```jsx
<>
  <Pagination size="small" count={10} />
  <Pagination size="medium" count={10} />
  <Pagination size="large" count={10} />
</>
```

### Custom Colors

```jsx
<>
  <Pagination color="primary" count={10} />
  <Pagination color="secondary" count={10} />
  <Pagination color="error" count={10} />
</>
```

### Custom Page Range Display

```jsx
<Pagination 
  count={50} 
  page={currentPage} 
  siblingCount={2}  // Show 2 pages on either side of current page
  boundaryCount={2} // Show 2 pages at beginning and end
/>
```

## Accessibility

The `PaginationAdapted` component includes several accessibility features:

- Appropriate ARIA roles and labels
- Keyboard navigation support
- Clear focus indicators
- Current page indication for screen readers
- Properly disabled state for navigation limits