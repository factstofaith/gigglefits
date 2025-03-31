# TAP Integration Platform Component API Documentation

This document provides comprehensive API documentation for the key components in the TAP Integration Platform frontend.

## Table of Contents

1. [Common Components](#common-components)
   - [Button](#button)
   - [Card](#card)
   - [DataTable](#datatable)
   - [InputField](#inputfield)
   - [PortalModal](#portalmodal)
   - [ErrorBoundary](#errorboundary)
   - [NotificationCenter](#notificationcenter)
   - [SearchBar](#searchbar)
   - [FilterBuilder](#filterbuilder)
   - [SearchFilterPanel](#searchfilterpanel)
   - [AccessibilityTester](#accessibilitytester)

2. [Integration Components](#integration-components)
   - [IntegrationCreationDialog](#integrationcreationdialog)
   - [IntegrationTable](#integrationtable)
   - [IntegrationFlowCanvas](#integrationflowcanvas)
   - [TemplateSelector](#templateselector)
   - [SaveAsTemplateDialog](#saveastemplatedialog)

3. [Admin Components](#admin-components)
   - [ApplicationsManager](#applicationsmanager)
   - [DatasetsManager](#datasetsmanager)
   - [ReleasesManager](#releasesmanager)
   - [TenantsManager](#tenantsmanager)
   - [TemplatesManager](#templatesmanager)

## Common Components

### Button

Enhanced button component with accessibility features and consistent styling.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'contained'` \| `'outlined'` \| `'text'` | `'contained'` | The button variant |
| `color` | `'primary'` \| `'secondary'` \| `'success'` \| `'error'` \| `'info'` \| `'warning'` | `'primary'` | The button color |
| `size` | `'small'` \| `'medium'` \| `'large'` | `'medium'` | The button size |
| `startIcon` | React.ReactNode | `undefined` | Icon to display at the start of the button |
| `endIcon` | React.ReactNode | `undefined` | Icon to display at the end of the button |
| `fullWidth` | boolean | `false` | If `true`, the button will take up the full width of its container |
| `disabled` | boolean | `false` | If `true`, the button will be disabled |
| `loading` | boolean | `false` | If `true`, displays a loading spinner and disables the button |
| `href` | string | `undefined` | The URL to link to when the button is clicked |
| `target` | string | `undefined` | Target attribute for the href link |
| `rel` | string | `undefined` | Rel attribute for the href link |
| `onClick` | function | `undefined` | Callback fired when the button is clicked |
| `aria-label` | string | `undefined` | Accessible label for the button |

#### Example Usage

```jsx
import Button from '../components/common/Button';

// Basic button
<Button onClick={handleClick}>Click Me</Button>

// Outlined variant with icon
<Button 
  variant="outlined" 
  startIcon={<SaveIcon />} 
  onClick={handleSave}
>
  Save
</Button>

// Loading state
<Button loading={isLoading} disabled={isLoading}>
  Submit
</Button>

// Link button
<Button 
  href="https://example.com" 
  target="_blank" 
  rel="noopener noreferrer"
>
  Visit Website
</Button>
```

### Card

Enhanced card component with consistent styling and behavior.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `elevation` | number | `1` | Shadow depth, corresponds to `dp` in the Material Design spec |
| `variant` | `'elevation'` \| `'outlined'` | `'elevation'` | The variant to use |
| `interactive` | boolean | `false` | If `true`, adds hover effects to make card feel interactive |
| `onClick` | function | `undefined` | Callback fired when the card is clicked |
| `title` | string \| React.ReactNode | `undefined` | The card title |
| `subtitle` | string \| React.ReactNode | `undefined` | The card subtitle |
| `headerAction` | React.ReactNode | `undefined` | Action element to display in the card header |
| `footer` | React.ReactNode | `undefined` | Footer content for the card |
| `fullHeight` | boolean | `false` | If `true`, card will expand to fill its container height |
| `className` | string | `undefined` | Additional CSS class |

#### Example Usage

```jsx
import Card from '../components/common/Card';

// Basic card
<Card title="User Profile">
  <Typography>Card content goes here</Typography>
</Card>

// Interactive card with custom header action
<Card 
  title="Project Details" 
  subtitle="Last updated: Yesterday"
  headerAction={<IconButton><MoreVertIcon /></IconButton>}
  interactive
  onClick={handleCardClick}
>
  <Typography>Card content goes here</Typography>
</Card>

// Card with footer
<Card
  title="Analytics Overview"
  footer={
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button size="small">View Details</Button>
    </Box>
  }
>
  <Typography>Card content goes here</Typography>
</Card>
```

### DataTable

Flexible data table component with sorting, pagination, and filtering capabilities.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | array | required | Array of column definitions |
| `data` | array | required | Array of data objects |
| `loading` | boolean | `false` | If `true`, displays a loading state |
| `pagination` | boolean | `true` | If `true`, includes pagination controls |
| `rowsPerPageOptions` | array | `[10, 25, 50]` | Options for rows per page |
| `defaultRowsPerPage` | number | `10` | Default number of rows per page |
| `onRowClick` | function | `undefined` | Callback fired when a row is clicked |
| `getRowId` | function | `row => row.id` | Function to get unique ID for each row |
| `emptyStateMessage` | string | `'No data available'` | Message to display when there's no data |
| `defaultSortBy` | string | `undefined` | Default column to sort by |
| `defaultSortDirection` | `'asc'` \| `'desc'` | `'asc'` | Default sort direction |
| `onSort` | function | `undefined` | Callback fired when sorting changes |
| `onPaginationChange` | function | `undefined` | Callback fired when pagination changes |
| `stickyHeader` | boolean | `false` | If `true`, the table header will be sticky |
| `maxHeight` | number \| string | `undefined` | Maximum height of the table |
| `hideTableHead` | boolean | `false` | If `true`, hides the table header |
| `dense` | boolean | `false` | If `true`, reduces the padding of cells |
| `selectableRows` | boolean | `false` | If `true`, adds checkboxes for row selection |
| `selectedRows` | array | `[]` | Array of selected row IDs |
| `onSelectedRowsChange` | function | `undefined` | Callback fired when row selection changes |

#### Column Definition

```javascript
{
  id: 'name', // Unique identifier for the column
  label: 'Name', // Display label for the column header
  width: '150px', // Optional width
  align: 'left', // Text alignment: 'left', 'center', 'right'
  disableSorting: false, // If true, column won't be sortable
  format: (value) => value, // Optional formatter function
  render: (row) => <CustomComponent value={row.name} />, // Optional custom renderer
}
```

#### Example Usage

```jsx
import DataTable from '../components/common/DataTable';

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role' },
  { 
    id: 'actions', 
    label: 'Actions', 
    disableSorting: true,
    render: (row) => (
      <Button size="small" onClick={() => handleEdit(row)}>
        Edit
      </Button>
    )
  }
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

<DataTable
  columns={columns}
  data={data}
  loading={loading}
  pagination
  onRowClick={handleRowClick}
  defaultSortBy="name"
  emptyStateMessage="No users found"
/>
```

### SearchBar

Advanced search bar component with syntax highlighting, autocompletion, and saved search functionality.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | `''` | The search query |
| `onChange` | function | required | Callback fired when the search query changes |
| `onSearch` | function | required | Callback fired when a search is submitted |
| `suggestions` | array | `[]` | Array of search suggestions |
| `savedSearches` | array | `[]` | Array of saved search objects |
| `onSaveSearch` | function | `undefined` | Callback fired when a search is saved |
| `onDeleteSavedSearch` | function | `undefined` | Callback fired when a saved search is deleted |
| `placeholder` | string | `'Search...'` | Placeholder text for the search input |
| `width` | string \| number | `'100%'` | Width of the search bar |
| `autoFocus` | boolean | `false` | If `true`, the search input will be focused on mount |
| `showHelp` | boolean | `true` | If `true`, shows the help button |
| `allowSavedSearches` | boolean | `true` | If `true`, enables saved search functionality |
| `ariaLabel` | string | `'Search input'` | Accessible label for the search input |

#### Example Usage

```jsx
import SearchBar from '../components/common/SearchBar';
import { useAdvancedSearch } from '../utils/searchUtils';

// Basic usage with search hook
const {
  searchQuery,
  setSearchQuery,
  filteredItems,
  savedSearches,
  saveSearch,
  deleteSavedSearch,
  getSearchSuggestions
} = useAdvancedSearch(items, {
  searchableFields: ['name', 'description', 'tags']
});

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  suggestions={getSearchSuggestions()}
  savedSearches={savedSearches}
  onSaveSearch={saveSearch}
  onDeleteSavedSearch={deleteSavedSearch}
  placeholder="Search integrations..."
  autoFocus
/>
```

### FilterBuilder

Complex filter builder component for creating advanced filter conditions.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | array | required | Array of field definitions |
| `initialFilter` | object | `null` | Initial filter configuration |
| `onChange` | function | `undefined` | Callback fired when the filter changes |
| `onApply` | function | `undefined` | Callback fired when the filter is applied |
| `savedFilters` | array | `[]` | Array of saved filter objects |
| `onSaveFilter` | function | `undefined` | Callback fired when a filter is saved |
| `onDeleteSavedFilter` | function | `undefined` | Callback fired when a saved filter is deleted |
| `onLoadSavedFilter` | function | `undefined` | Callback fired when a saved filter is loaded |
| `compact` | boolean | `false` | If `true`, renders a more compact UI |
| `showTitle` | boolean | `true` | If `true`, shows the component title |
| `title` | string | `'Filter Builder'` | Component title |

#### Field Definition

```javascript
{
  name: 'status', // Field identifier
  label: 'Status', // Display label
  type: 'string' // Data type: 'string', 'number', 'boolean', 'date', 'array'
}
```

#### Example Usage

```jsx
import FilterBuilder from '../components/common/FilterBuilder';

const fields = [
  { name: 'name', label: 'Name', type: 'string' },
  { name: 'status', label: 'Status', type: 'string' },
  { name: 'priority', label: 'Priority', type: 'string' },
  { name: 'createdAt', label: 'Created Date', type: 'date' },
  { name: 'tags', label: 'Tags', type: 'array' }
];

<FilterBuilder
  fields={fields}
  initialFilter={currentFilter}
  onChange={handleFilterChange}
  onApply={handleApplyFilter}
  savedFilters={savedFilters}
  onSaveFilter={handleSaveFilter}
  onDeleteSavedFilter={handleDeleteFilter}
/>
```

### SearchFilterPanel

Combined panel that integrates search bar and filter builder functionality.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | `'Search & Filter'` | Panel title |
| `fields` | array | required | Array of field definitions |
| `items` | array | required | Array of items to search/filter |
| `onFilteredItemsChange` | function | `undefined` | Callback fired when filtered items change |
| `initialSearchQuery` | string | `''` | Initial search query |
| `initialFilter` | object | `null` | Initial filter configuration |
| `savedSearches` | array | `[]` | Array of saved search objects |
| `savedFilters` | array | `[]` | Array of saved filter objects |
| `onSearch` | function | `undefined` | Callback fired when search is submitted |
| `onFilter` | function | `undefined` | Callback fired when filter is applied |
| `onSaveSearch` | function | `undefined` | Callback fired when search is saved |
| `onDeleteSavedSearch` | function | `undefined` | Callback fired when saved search is deleted |
| `onSaveFilter` | function | `undefined` | Callback fired when filter is saved |
| `onDeleteSavedFilter` | function | `undefined` | Callback fired when saved filter is deleted |
| `onLoadSavedFilter` | function | `undefined` | Callback fired when saved filter is loaded |
| `searchOptions` | object | `{}` | Options for search functionality |
| `filterOptions` | object | `{}` | Options for filter functionality |
| `defaultExpanded` | boolean | `false` | If `true`, panel is expanded by default |
| `renderActiveFilters` | boolean | `true` | If `true`, shows active filter chips |
| `showItemCount` | boolean | `true` | If `true`, shows item count |
| `mobileDrawer` | boolean | `true` | If `true`, uses drawer on mobile devices |

#### Example Usage

```jsx
import SearchFilterPanel from '../components/common/SearchFilterPanel';

<SearchFilterPanel
  title="Search & Filter Integrations"
  fields={searchFields}
  items={integrations}
  onFilteredItemsChange={setFilteredIntegrations}
  onSearch={handleSearch}
  onFilter={handleFilter}
  savedSearches={savedSearches}
  savedFilters={savedFilters}
  onSaveSearch={handleSaveSearch}
  onDeleteSavedSearch={handleDeleteSavedSearch}
  onSaveFilter={handleSaveFilter}
  onDeleteSavedFilter={handleDeleteSavedFilter}
  defaultExpanded={true}
/>
```

### AccessibilityTester

Component for running and displaying accessibility tests.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `elementSelector` | string | `'body'` | CSS selector for the element to test |
| `title` | string | `'Accessibility Tester'` | Component title |
| `autoRunOnMount` | boolean | `false` | If `true`, runs test on mount |
| `compact` | boolean | `false` | If `true`, uses a more compact UI |
| `onTestComplete` | function | `null` | Callback fired when test completes |

#### Example Usage

```jsx
import AccessibilityTester from '../components/common/AccessibilityTester';

<AccessibilityTester
  elementSelector="#main-content"
  title="Page Accessibility Test"
  autoRunOnMount={false}
/>
```

## Integration Components

### IntegrationCreationDialog

A comprehensive dialog for creating new integrations with support for both template-based and custom creation workflows. Provides a step-by-step wizard interface for configuring all aspects of an integration including source/destination selection, connection settings, scheduling, dataset selection, and notification preferences.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | required | Controls whether the dialog is open |
| `onClose` | function | required | Callback fired when the dialog is closed |
| `onCreate` | function | required | Callback fired when integration is created, receives the integration data |

#### Features

- Two creation modes: template-based or custom
- Multi-step wizard interface with intuitive navigation
- Dynamic configuration options based on selected components
- Role-based access control for advanced settings
- Template browsing and selection
- Validation for all required fields
- Support for various integration types (API, File, Database)
- Dataset association for field mapping

#### Methods

| Method | Description |
|--------|-------------|
| `handleCreationModeChange` | Toggles between template-based and custom creation modes |
| `handleTemplateSelect` | Handles selection of an integration template and pre-fills form fields |
| `handleChange` | Handles changes to form input fields and updates the integrationData state |
| `handleBlobConfigChange` | Updates the Azure Blob Storage configuration in the integration data |
| `handleScheduleChange` | Updates the schedule configuration in the integration data |
| `handleNotificationChange` | Updates the notification settings in the integration data |
| `handleDatasetChange` | Updates the selected datasets in the integration data |
| `validate` | Validates all integration data before submission |
| `handleCreateFromTemplate` | Creates a new integration based on the selected template |
| `handleCreateCustom` | Creates a new custom integration after validating the form data |
| `handleCreate` | Main creation handler that delegates to the appropriate creation method |
| `handleNext` | Advances the stepper to the next step in the workflow |
| `handleBack` | Returns to the previous step in the workflow |
| `handleClose` | Handles closing the dialog and resetting all form state |

#### Example Usage

```jsx
import IntegrationCreationDialog from '../components/integration/IntegrationCreationDialog';

const [dialogOpen, setDialogOpen] = useState(false);

const handleClose = () => {
  setDialogOpen(false);
};

const handleCreate = (integrationData) => {
  console.log('Integration created:', integrationData);
  // Handle the created integration (e.g., save to API, update state)
  setDialogOpen(false);
};

return (
  <>
    <Button onClick={() => setDialogOpen(true)}>
      Create Integration
    </Button>
    
    <IntegrationCreationDialog
      open={dialogOpen}
      onClose={handleClose}
      onCreate={handleCreate}
    />
  </>
);
```

### TemplateSelector

Component for selecting integration templates when creating a new integration.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelectTemplate` | function | required | Callback fired when a template is selected |
| `initialSelectedId` | string | `null` | ID of initially selected template |
| `integrationType` | string | `null` | Filter templates by type |

#### Example Usage

```jsx
import TemplateSelector from '../components/integration/TemplateSelector';

<TemplateSelector
  onSelectTemplate={handleTemplateSelect}
  initialSelectedId={selectedTemplateId}
  integrationType="API-based"
/>
```

### SaveAsTemplateDialog

Dialog for saving an existing integration as a reusable template.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | required | Controls whether the dialog is open |
| `onClose` | function | required | Callback fired when the dialog is closed |
| `integration` | object | required | The integration object to save as a template |
| `onSuccess` | function | `undefined` | Callback fired when the template is successfully created |

#### Example Usage

```jsx
import SaveAsTemplateDialog from '../components/integration/SaveAsTemplateDialog';

const [dialogOpen, setDialogOpen] = useState(false);

<Button onClick={() => setDialogOpen(true)}>
  Save as Template
</Button>

<SaveAsTemplateDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  integration={currentIntegration}
  onSuccess={handleTemplateCreated}
/>
```

## Admin Components

### TemplatesManager

Admin component for managing integration templates.

#### Props

None. This component is self-contained and fetches its own data.

#### Example Usage

```jsx
import TemplatesManager from '../components/admin/TemplatesManager';

<TemplatesManager />
```

---

For more detailed documentation and examples, refer to the component's source code and the storybook documentation.