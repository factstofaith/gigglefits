# AutocompleteAdapted Component

A high-performance autocomplete component with virtualization for large datasets, grouping capabilities, and comprehensive accessibility features.

## Features

- Virtualized rendering for large option sets
- Support for grouping options
- Multiple selection mode
- Free text entry support
- Customizable option rendering
- Loading state handling
- Complete keyboard navigation
- Screen reader compatibility

## Usage

```jsx
import { Autocomplete } from '../design-system/adapter';

// Basic usage
<Autocomplete
  id="countries-autocomplete"
  options={countryList}
  value={selectedCountry}
  onChange={handleCountryChange}
  label="Select a country"
/>

// With option grouping
<Autocomplete
  id="grouped-autocomplete"
  options={items}
  value={selectedItem}
  onChange={handleItemChange}
  label="Select an item"
  groupBy={(option) => option.category}
/>

// Multiple selection
<Autocomplete
  id="multi-select-autocomplete"
  options={users}
  value={selectedUsers}
  onChange={handleUserChange}
  label="Select users"
  multiple
  limitTags={2}
/>

// With free text entry
<Autocomplete
  id="free-text-autocomplete"
  options={tags}
  value={selectedTags}
  onChange={handleTagChange}
  label="Enter tags"
  multiple
  freeSolo
/>

// With custom option rendering
<Autocomplete
  id="custom-render-autocomplete"
  options={users}
  value={selectedUser}
  onChange={handleUserChange}
  label="Select a user"
  getOptionLabel={(option) => option.name}
  renderOption={(option) => (
    <div className="user-option">
      <img src={option.avatar} alt={option.name} />
      <div>
        <strong>{option.name}</strong>
        <div>{option.email}</div>
      </div>
    </div>
  )}
/>

// With virtualization for large datasets
<Autocomplete
  id="large-dataset-autocomplete"
  options={largeDataset}
  value={selectedValue}
  onChange={handleChange}
  label="Select an item"
  enableVirtualization={true}
  virtualizationThreshold={200}
  maxHeight={350}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | Required | Unique identifier for the component |
| `options` | array | Required | Array of available options |
| `value` | any | `null` | Selected value(s) |
| `onChange` | function | Required | Function called when selection changes |
| `label` | string | `''` | Text label for the field |
| `placeholder` | string | `''` | Placeholder text shown when empty |
| `helperText` | string | `''` | Helper text displayed below the input |
| `error` | boolean | `false` | Whether the field is in an error state |
| `disabled` | boolean | `false` | Whether the field is disabled |
| `required` | boolean | `false` | Whether the field is required |
| `multiple` | boolean | `false` | Whether multiple values can be selected |
| `freeSolo` | boolean | `false` | Whether to allow values not in the options list |
| `loading` | boolean | `false` | Whether the component is in a loading state |
| `limitTags` | number | `-1` | Maximum number of tags to display when `multiple` is true |
| `enableVirtualization` | boolean | `true` | Whether to use virtualization for large datasets |
| `virtualizationThreshold` | number | `100` | Minimum options count to trigger virtualization |
| `maxHeight` | number | `300` | Maximum height of the dropdown in pixels |
| `itemSize` | number | `48` | Height of each option item in pixels |
| `getOptionLabel` | function | `(opt) => opt.label \|\| opt` | Function to get display text for an option |
| `isOptionEqualToValue` | function | `(opt, val) => opt.id === val.id` | Function to determine if option equals value |
| `filterOptions` | function | `null` | Custom filter function for options |
| `groupBy` | function | `null` | Function to group options by category |
| `renderOption` | function | `null` | Custom option rendering function |
| `renderTags` | function | `null` | Custom tag rendering function for multiple select |
| `renderInput` | function | `null` | Custom input rendering function |
| `ariaLabel` | string | - | Accessible label |
| `ariaLabelledBy` | string | - | ID of element that labels the component |
| `ariaDescribedBy` | string | - | ID of element that describes the component |

## Performance Optimization

The component uses virtualization to efficiently render large datasets, significantly improving performance when dealing with hundreds or thousands of options. The virtualization is automatically enabled for datasets larger than the `virtualizationThreshold` value.

Key performance features:
- Only renders visible options in the dropdown
- Optimized for large datasets with thousands of options
- Variable sizing for option groups
- React.memo for efficient re-rendering

## Accessibility Features

- Proper ARIA attributes
- Keyboard navigation (up/down arrows, Enter, Escape)
- Screen reader support
- Focus management
- Proper labeling
- Support for aria-required, aria-disabled, and error states