# DatePickerAdapted Component

The `DatePickerAdapted` component serves as an adapter between Material UI's DatePicker component and our design system, providing a consistent interface and enhanced features.

## Features

- Complete Material UI DatePicker API compatibility
- Virtualization for improved performance with large datasets
- Advanced validation handling
- ARIA attributes for accessibility
- Consistent styling and behavior with other form components
- Support for date range constraints and format customization

## Usage

```jsx
import { DatePicker } from 'design-system/adapter';

function MyForm() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  return (
    <DatePicker
      label="Appointment Date"
      value={selectedDate}
      onChange={setSelectedDate}
      format="MM/dd/yyyy"
      disablePast={true}
      helperText="Select a date in the future"
    />
  );
}
```

## Props

### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | — | The label of the date picker |
| `value` | Date \| string | — | The selected date value |
| `defaultValue` | Date \| string | — | The default date value |
| `onChange` | function | — | Callback fired when the value changes |
| `placeholder` | string | — | Placeholder text displayed when no date is selected |
| `format` | string | 'MM/dd/yyyy' | The format string for the displayed date |

### Validation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `error` | boolean | false | If true, the date picker will display an error state |
| `helperText` | node | — | Helper text displayed below the date picker |
| `required` | boolean | false | If true, the label will display an asterisk |
| `minDate` | Date \| string | — | The minimum selectable date |
| `maxDate` | Date \| string | — | The maximum selectable date |
| `disablePast` | boolean | false | If true, past dates will be disabled |
| `disableFuture` | boolean | false | If true, future dates will be disabled |
| `disableDates` | Date[] \| string[] | [] | Array of dates to disable |

### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | 'outlined' \| 'filled' \| 'standard' | 'outlined' | The variant of the date picker |
| `color` | 'primary' \| 'secondary' \| ... | 'primary' | The color of the date picker |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | The size of the date picker |
| `fullWidth` | boolean | false | If true, the date picker will take up the full width of its container |
| `className` | string | — | CSS class name applied to the root element |

### Advanced Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `InputProps` | object | — | Props applied to the Input element |
| `InputLabelProps` | object | — | Props applied to the InputLabel element |
| `FormHelperTextProps` | object | — | Props applied to the FormHelperText element |

### Accessibility Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | string | — | ARIA label for the date picker |
| `ariaDescribedBy` | string | — | ID of the element that describes the date picker |
| `ariaRequired` | boolean | — | ARIA attribute to indicate if the field is required |
| `ariaInvalid` | boolean | — | ARIA attribute to indicate if the value is invalid |

## Examples

### Basic usage

```jsx
<DatePicker
  label="Birth Date"
  value={birthDate}
  onChange={handleBirthDateChange}
/>
```

### With validation constraints

```jsx
<DatePicker
  label="Trip Start Date"
  value={startDate}
  onChange={handleStartDateChange}
  minDate={new Date()} // Today
  maxDate={new Date(new Date().setMonth(new Date().getMonth() + 6))} // 6 months from now
  disablePast={true}
  error={dateError}
  helperText={dateError ? "Please select a valid date" : "Select your trip start date"}
/>
```

### Custom date format

```jsx
<DatePicker
  label="Appointment Date"
  value={appointmentDate}
  onChange={handleAppointmentDateChange}
  format="yyyy-MM-dd" // ISO format
/>
```

### With adornments

```jsx
<DatePicker
  label="Event Date"
  value={eventDate}
  onChange={handleEventDateChange}
  InputProps={{
    startAdornment: <CalendarIcon />,
  }}
/>
```

## Accessibility

The `DatePickerAdapted` component includes several features to ensure accessibility:

- Proper ARIA attributes for screen readers
- Keyboard navigation support
- High contrast focus states
- Clear error and validation messaging
- Screen reader announcements for date selection

## Performance Optimization

This component is optimized for performance in several ways:

- React.memo to prevent unnecessary re-renders
- Ref forwarding for imperative actions
- Efficient prop handling
- Proper virtualization for calendar views with large date ranges
