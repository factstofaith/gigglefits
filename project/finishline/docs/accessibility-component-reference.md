# Accessibility Component Reference

This document provides a comprehensive reference for all accessibility-focused components in the TAP Integration Platform.

## Component Overview

| Component | Status | Description |
|-----------|--------|-------------|
| A11yButton | ✅ Complete | Accessible button with keyboard support and visual feedback |
| A11yForm | ✅ Complete | Accessible form with validation and screen reader support |
| A11yTable | ✅ Complete | Accessible data table with sorting and pagination |
| A11yMenu | ✅ Complete | Accessible dropdown menu with keyboard navigation |
| A11yTabs | ✅ Complete | Accessible tabbed interface |
| A11yModal | ✅ Complete | Accessible modal dialog with focus trap |
| A11yCheckbox | ✅ Complete | Accessible checkbox input |
| A11yRadio | ✅ Complete | Accessible radio button input |
| A11ySelect | ✅ Complete | Accessible select dropdown |
| A11yTooltip | ✅ Complete | Accessible tooltip with positioning options |
| A11yAlert | ✅ Complete | Accessible alert notifications |

## Component Details

### A11yButton

A fully accessible button component that follows WCAG standards.

**Props:**
- `children`: Button content
- `color`: Button color theme (primary, secondary, success, danger, light, dark)
- `size`: Button size (small, medium, large)
- `variant`: Button variant (contained, outlined, text)
- `fullWidth`: Whether button should take full width
- `disabled`: Whether button is disabled
- `loading`: Whether to show loading state
- `href`: Optional URL to render as an anchor tag
- `startIcon`: Icon to display before text
- `endIcon`: Icon to display after text
- `type`: Button type (button, submit, reset)
- `onClick`: Click handler
- `ariaLabel`: Accessible label
- `ariaLabelledBy`: ID of element that labels the button
- `ariaDescribedBy`: ID of element that describes the button
- `ariaControls`: ID of element controlled by the button
- `ariaExpanded`: Whether the controlled element is expanded
- `ariaHaspopup`: Type of popup triggered by the button

**Accessibility Features:**
- Keyboard activation with Enter and Space
- Focus visibility and management
- ARIA attribute support
- Loading state announcements
- Color contrast compliance
- Support for various states (hover, focus, disabled)

**Usage Example:**
```jsx
<A11yButton
  color="primary"
  size="medium"
  variant="contained"
  onClick={handleClick}
  ariaLabel="Save document"
>
  Save
</A11yButton>
```

### A11yForm

Accessible form component with validation and screen reader support.

**Props:**
- `children`: Form content
- `initialValues`: Initial form values
- `validate`: Validation function
- `onSubmit`: Submit handler
- `ariaLabel`: Accessible label
- `ariaLabelledBy`: ID of element that labels the form
- `ariaDescribedBy`: ID of element that describes the form

**Sub-components:**
- `FormField`: Individual form field
- `FormGroup`: Group of related fields
- `FormError`: Error summary display

**Accessibility Features:**
- Form validation with accessible error messages
- Field labeling and association
- Focus management for error states
- ARIA live regions for error announcements
- Keyboard support for all form controls

**Usage Example:**
```jsx
<A11yForm
  initialValues={{ name: '', email: '' }}
  validate={validateForm}
  onSubmit={handleSubmit}
>
  <FormField
    name="name"
    label="Name"
    required
  />
  <FormField
    name="email"
    label="Email"
    type="email"
    required
  />
  <A11yButton type="submit">Submit</A11yButton>
</A11yForm>
```

### A11yTable

Accessible data table with sorting, pagination, and screen reader support.

**Props:**
- `data`: Table data array
- `columns`: Column definitions
- `sortable`: Whether columns are sortable
- `paginated`: Whether to enable pagination
- `selectable`: Whether rows are selectable
- `caption`: Table caption
- `ariaLabel`: Accessible label
- `ariaLabelledBy`: ID of element that labels the table
- `ariaDescribedBy`: ID of element that describes the table

**Sub-components:**
- `TableHead`: Table header section
- `TableBody`: Table body section
- `TableRow`: Table row
- `TableCell`: Table cell
- `TablePagination`: Pagination controls

**Accessibility Features:**
- Semantic table markup
- ARIA roles and attributes
- Keyboard navigation within table
- Sort indicators for screen readers
- Accessible pagination controls
- Row selection with keyboard support

**Usage Example:**
```jsx
<A11yTable
  data={users}
  columns={[
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role' }
  ]}
  sortable
  paginated
  caption="User Directory"
/>
```

### A11yMenu

Accessible dropdown menu with keyboard navigation.

**Props:**
- `children`: Menu items
- `label`: Menu button label
- `open`: Whether menu is open
- `onOpen`: Handler for menu open
- `onClose`: Handler for menu close
- `placement`: Menu placement (top, bottom, left, right)
- `ariaLabel`: Accessible label
- `ariaLabelledBy`: ID of element that labels the menu

**Sub-components:**
- `MenuItem`: Menu item

**Accessibility Features:**
- Keyboard navigation with arrow keys
- ARIA menu role and properties
- Focus management when opening/closing
- Screen reader announcements for state changes
- Proper focus trapping within menu

**Usage Example:**
```jsx
<A11yMenu label="Options">
  <MenuItem onClick={handleEdit}>Edit</MenuItem>
  <MenuItem onClick={handleDelete}>Delete</MenuItem>
  <MenuItem onClick={handleShare}>Share</MenuItem>
</A11yMenu>
```

### A11yTabs

Accessible tabbed interface component.

**Props:**
- `children`: Tab panels
- `value`: Active tab index
- `onChange`: Tab change handler
- `orientation`: Tab orientation (horizontal, vertical)
- `ariaLabel`: Accessible label

**Sub-components:**
- `Tab`: Individual tab
- `TabPanel`: Content panel for each tab

**Accessibility Features:**
- ARIA tabs role and attributes
- Keyboard navigation with arrow keys
- Automatic activation on focus (optional)
- Screen reader announcements for tab changes
- Focus management when switching tabs

**Usage Example:**
```jsx
<A11yTabs value={activeTab} onChange={handleTabChange}>
  <Tab label="Details" />
  <Tab label="Settings" />
  <Tab label="History" />
  
  <TabPanel>Details content</TabPanel>
  <TabPanel>Settings content</TabPanel>
  <TabPanel>History content</TabPanel>
</A11yTabs>
```

### A11yModal

Accessible modal dialog with focus trapping.

**Props:**
- `children`: Modal content
- `open`: Whether modal is open
- `onClose`: Close handler
- `title`: Modal title
- `ariaLabel`: Accessible label
- `ariaLabelledBy`: ID of element that labels the modal
- `ariaDescribedBy`: ID of element that describes the modal

**Sub-components:**
- `ModalHeader`: Modal header with title
- `ModalBody`: Modal main content
- `ModalFooter`: Modal footer with actions

**Accessibility Features:**
- Focus trapping within modal
- Return focus after closing
- ESC key to close
- ARIA dialog role and attributes
- Screen reader announcements
- Click outside to close (optional)

**Usage Example:**
```jsx
<A11yModal
  open={isOpen}
  onClose={handleClose}
  title="Confirm Action"
>
  <ModalBody>
    Are you sure you want to continue?
  </ModalBody>
  <ModalFooter>
    <A11yButton onClick={handleClose} color="secondary">Cancel</A11yButton>
    <A11yButton onClick={handleConfirm} color="primary">Confirm</A11yButton>
  </ModalFooter>
</A11yModal>
```

### A11yCheckbox

Accessible checkbox input component.

**Props:**
- `checked`: Whether checkbox is checked
- `onChange`: Change handler
- `label`: Checkbox label
- `disabled`: Whether checkbox is disabled
- `required`: Whether checkbox is required
- `error`: Error message
- `ariaLabel`: Accessible label
- `ariaLabelledBy`: ID of element that labels the checkbox

**Accessibility Features:**
- Keyboard activation with Space
- Visual focus indicators
- ARIA checkbox role and attributes
- Label association
- Error state announcements

**Usage Example:**
```jsx
<A11yCheckbox
  checked={isAccepted}
  onChange={handleChange}
  label="I accept the terms and conditions"
  required
/>
```

### A11yRadio

Accessible radio button input component.

**Props:**
- `value`: Radio button value
- `checked`: Whether radio is checked
- `onChange`: Change handler
- `name`: Radio group name
- `label`: Radio label
- `disabled`: Whether radio is disabled
- `ariaLabel`: Accessible label
- `ariaLabelledBy`: ID of element that labels the radio

**Sub-components:**
- `RadioGroup`: Group of radio buttons

**Accessibility Features:**
- Keyboard navigation with arrow keys
- ARIA radio role and attributes
- Group association
- Focus management within group
- Visual selection indicators

**Usage Example:**
```jsx
<RadioGroup
  name="priority"
  value={priority}
  onChange={handleChange}
  label="Priority Level"
>
  <A11yRadio value="low" label="Low" />
  <A11yRadio value="medium" label="Medium" />
  <A11yRadio value="high" label="High" />
</RadioGroup>
```

### A11ySelect

Accessible select dropdown component.

**Props:**
- `value`: Selected value
- `onChange`: Change handler
- `options`: Array of options
- `label`: Select label
- `placeholder`: Placeholder text
- `disabled`: Whether select is disabled
- `required`: Whether select is required
- `error`: Error message
- `ariaLabel`: Accessible label
- `ariaLabelledBy`: ID of element that labels the select

**Accessibility Features:**
- Keyboard navigation with arrow keys
- ARIA combobox/listbox roles and attributes
- Label association
- Type-ahead functionality
- Focus management during interaction
- Screen reader announcements for selection changes

**Usage Example:**
```jsx
<A11ySelect
  value={country}
  onChange={handleCountryChange}
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' }
  ]}
  required
/>
```

### A11yTooltip

Accessible tooltip component.

**Props:**
- `children`: Element to trigger tooltip
- `content`: Tooltip content
- `position`: Tooltip position (top, bottom, left, right)
- `delay`: Delay before showing tooltip
- `ariaLabel`: Accessible label

**Accessibility Features:**
- Keyboard activation
- ARIA tooltip role
- Focus handling
- Timing adjustments for screen readers
- Dismissal with ESC key

**Usage Example:**
```jsx
<A11yTooltip
  content="Delete this item permanently"
  position="top"
>
  <A11yButton color="danger">Delete</A11yButton>
</A11yTooltip>
```

### A11yAlert

Accessible alert notification component.

**Props:**
- `children`: Alert content
- `type`: Alert type (info, success, warning, error)
- `onClose`: Close handler
- `autoClose`: Whether to close automatically
- `closable`: Whether alert can be closed
- `ariaLabel`: Accessible label

**Accessibility Features:**
- ARIA alert role
- Live region for screen reader announcements
- Focus management when opened
- Keyboard dismissal
- Color contrast for different alert types

**Usage Example:**
```jsx
<A11yAlert
  type="success"
  closable
  onClose={handleClose}
>
  Your changes have been saved successfully.
</A11yAlert>
```

## Accessibility Utilities

### a11yUtils.js

Utility functions for enhancing accessibility:

**Functions:**
- `createFocusTrap(container)`: Creates a focus trap within a container
- `announceToScreenReader(message, priority)`: Announces a message to screen readers
- `isAccessibleToScreenReaders(element)`: Checks if an element is accessible to screen readers
- `meetsContrastRequirements(foreground, background, level)`: Checks if color combination meets WCAG contrast requirements

**Usage Example:**
```jsx
import { createFocusTrap, announceToScreenReader } from '../utils/a11yUtils';

function MyComponent() {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusTrap = createFocusTrap(modalRef.current);
      focusTrap.activate();
      
      return () => focusTrap.deactivate();
    }
  }, [isOpen]);
  
  const handleSuccess = () => {
    announceToScreenReader('Operation completed successfully', 'polite');
  };
  
  // Component implementation...
}
```

## Best Practices

When using these components:

1. Always provide accessible names via labels or ARIA attributes
2. Maintain keyboard navigation patterns consistent with platform standards
3. Ensure color contrast meets WCAG AA requirements
4. Test with screen readers to verify announcements
5. Manage focus appropriately, especially for modal interactions
6. Provide feedback for all user actions
7. Use semantic elements whenever possible

## Testing Components

All accessibility components include comprehensive test suites:

1. **Basic rendering tests** to verify proper rendering
2. **Keyboard navigation tests** to ensure keyboard accessibility
3. **ARIA attribute tests** to verify proper attributes
4. **Screen reader announcement tests** to verify proper announcements
5. **Focus management tests** to verify proper focus handling

Use the accessibility testing utilities to write tests for new components.