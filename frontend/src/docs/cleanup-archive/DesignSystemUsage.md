# Design System Usage Guide

This guide provides examples and best practices for using our design system components in your application.

## Setup

First, make sure to wrap your application with the `ThemeProvider`:

```jsx
import { ThemeProvider } from '../design-system';

function App() {
  return (
    <ThemeProvider>
      {/* Your application components */}
    </ThemeProvider>
  );
}
```

## Core Components

### Typography

Use the Typography component for consistent text styling:

```jsx
import { Typography } from '../design-system';

// Examples
<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="body1">Regular paragraph text</Typography>
<Typography variant="caption" color="textSecondary">Secondary small text</Typography>

// With color
<Typography color="primary">Primary color text</Typography>
<Typography color="error">Error message</Typography>

// With alignment
<Typography align="center">Centered text</Typography>
<Typography align="right">Right-aligned text</Typography>

// With style variants
<Typography variant="body1" fontWeight="bold">Bold text</Typography>
<Typography variant="body1" fontStyle="italic">Italic text</Typography>

// With gutterBottom (adds margin-bottom)
<Typography gutterBottom>Text with margin bottom</Typography>
```

### Button

Use buttons for user interactions:

```jsx
import { Button } from '../design-system';

// Variants
<Button variant="contained">Contained Button</Button>
<Button variant="outlined">Outlined Button</Button>
<Button variant="text">Text Button</Button>

// Colors
<Button variant="contained" color="primary">Primary</Button>
<Button variant="contained" color="secondary">Secondary</Button>
<Button variant="contained" color="success">Success</Button>
<Button variant="contained" color="error">Error</Button>
<Button variant="contained" color="warning">Warning</Button>
<Button variant="contained" color="info">Info</Button>

// Sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// With icon
<Button startIcon={<Icon name="settings" />}>Settings</Button>
<Button endIcon={<Icon name="arrow-right" />}>Next</Button>

// Disabled
<Button disabled>Disabled Button</Button>

// Click handler
<Button onClick={handleClick}>Click Me</Button>
```

## Layout Components

### Box

Box is a basic container for grouping and styling elements:

```jsx
import { Box } from '../design-system';

// Basic usage
<Box>
  <p>Content goes here</p>
</Box>

// With styling props
<Box 
  p="lg" 
  m="md" 
  bg="background.paper" 
  borderRadius="md"
  boxShadow="sm"
>
  Content with padding, margin, background, border radius and shadow
</Box>

// Responsive styling
<Box 
  display="flex" 
  flexDirection={['column', 'row']} 
  p={['sm', 'md', 'lg']}
>
  Responsive box that changes based on screen size
</Box>

// As another element
<Box as="section" role="region" aria-label="Main content">
  Rendered as a section element
</Box>
```

### Stack

Stack arranges elements in a vertical or horizontal layout:

```jsx
import { Stack } from '../design-system';

// Vertical stack (default)
<Stack spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Horizontal stack
<Stack direction="row" spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Alignment
<Stack alignItems="center" justifyContent="space-between">
  <div>Left</div>
  <div>Center</div>
  <div>Right</div>
</Stack>

// Responsive direction
<Stack 
  direction={['column', 'row']} 
  spacing={['sm', 'md']}
  alignItems="center"
>
  <div>Stacks vertically on mobile, horizontally on desktop</div>
  <div>Item 2</div>
</Stack>
```

### Card

Use Card for contained content sections:

```jsx
import { Card, Typography, Button } from '../design-system';

// Basic card
<Card>
  <Typography variant="h5">Card Title</Typography>
  <Typography variant="body1">Card content goes here.</Typography>
</Card>

// With padding
<Card p="lg">
  Content with padding
</Card>

// Elevated card
<Card elevation="md">
  Card with medium elevation
</Card>

// Interactive card
<Card 
  p="lg" 
  hover={{ elevation: 'lg' }}
  onClick={handleCardClick}
>
  <Typography variant="h5">Interactive Card</Typography>
  <Typography variant="body1">Click me!</Typography>
</Card>

// Card with sections
<Card>
  <Card.Header>
    <Typography variant="h5">Card Header</Typography>
  </Card.Header>
  <Card.Content>
    <Typography variant="body1">Main content area</Typography>
  </Card.Content>
  <Card.Footer>
    <Button variant="text">Cancel</Button>
    <Button variant="contained">Submit</Button>
  </Card.Footer>
</Card>
```

### Grid

Grid creates responsive layouts with rows and columns:

```jsx
import { Grid, Box } from '../design-system';

// Basic grid with columns
<Grid columns={3} gap="md">
  <Box bg="primary.light" p="md">Column 1</Box>
  <Box bg="primary.light" p="md">Column 2</Box>
  <Box bg="primary.light" p="md">Column 3</Box>
</Grid>

// Responsive columns
<Grid 
  columns={[1, 2, 3]} // 1 column on mobile, 2 on tablet, 3 on desktop
  gap={['sm', 'md']} 
>
  <Box bg="primary.light" p="md">Item 1</Box>
  <Box bg="primary.light" p="md">Item 2</Box>
  <Box bg="primary.light" p="md">Item 3</Box>
  <Box bg="primary.light" p="md">Item 4</Box>
  <Box bg="primary.light" p="md">Item 5</Box>
  <Box bg="primary.light" p="md">Item 6</Box>
</Grid>

// Column spanning
<Grid columns={3} gap="md">
  <Box bg="primary.light" p="md" gridColumn="span 2">Spans 2 columns</Box>
  <Box bg="primary.light" p="md">Single column</Box>
  <Box bg="primary.light" p="md">Single column</Box>
  <Box bg="primary.light" p="md" gridColumn="span 3">Spans all 3 columns</Box>
</Grid>
```

## Form Components

### TextField

Use TextField for text input:

```jsx
import { TextField } from '../design-system';

// Basic usage
<TextField label="Name" />

// With placeholder
<TextField 
  label="Email" 
  placeholder="Enter your email address" 
/>

// Variants
<TextField label="Default variant" />
<TextField label="Outlined" variant="outlined" />
<TextField label="Filled" variant="filled" />

// Required field
<TextField label="Required Field" required />

// With helper text
<TextField 
  label="Password" 
  type="password" 
  helperText="Password must be at least 8 characters" 
/>

// Error state
<TextField 
  label="Username" 
  error 
  errorText="Username already taken" 
/>

// Disabled
<TextField label="Disabled Field" disabled />

// Full width
<TextField label="Full Width" fullWidth />

// Controlled component
<TextField 
  label="Controlled Input" 
  value={value} 
  onChange={handleChange} 
/>

// With icon
<TextField 
  label="Search" 
  startIcon={<SearchIcon />}
  endIcon={<ClearIcon onClick={handleClear} />}
/>

// Multiline
<TextField 
  label="Description" 
  multiline 
  rows={4} 
/>
```

### FormField

Use FormField as a wrapper for any form control:

```jsx
import { FormField, TextField, Select } from '../design-system';

// Basic usage
<FormField label="Name">
  <TextField />
</FormField>

// With helper text
<FormField 
  label="Email" 
  helperText="We'll never share your email with anyone else"
>
  <TextField />
</FormField>

// Required field
<FormField label="Password" required>
  <TextField type="password" />
</FormField>

// Error state
<FormField 
  label="Username" 
  error 
  errorText="Username already taken"
>
  <TextField />
</FormField>

// With custom form control
<FormField label="Country">
  <Select 
    options={[
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'mx', label: 'Mexico' },
    ]} 
  />
</FormField>
```

### Select

Use Select for dropdown selections:

```jsx
import { Select } from '../design-system';

// Basic usage
<Select 
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ]}
/>

// With placeholder
<Select 
  label="Select a country"
  placeholder="Choose a country" 
  options={countryOptions}
/>

// Default value
<Select 
  label="Country"
  defaultValue="ca"
  options={countryOptions}
/>

// Controlled component
<Select 
  label="Country"
  value={country}
  onChange={handleCountryChange}
  options={countryOptions}
/>

// Disabled
<Select 
  label="Country"
  disabled
  options={countryOptions}
/>

// Error state
<Select 
  label="Country"
  error
  errorText="Please select a country"
  options={countryOptions}
/>

// Multi-select
<Select 
  label="Countries"
  multiple
  value={selectedCountries}
  onChange={handleSelectionChange}
  options={countryOptions}
/>
```

### Checkbox

Use Checkbox for boolean selections:

```jsx
import { Checkbox } from '../design-system';

// Basic usage
<Checkbox label="Agree to terms and conditions" />

// Controlled component
<Checkbox 
  label="Remember me" 
  checked={rememberMe}
  onChange={handleRememberMeChange}
/>

// Checked by default
<Checkbox label="Subscribe to newsletter" defaultChecked />

// Indeterminate state (partially checked)
<Checkbox 
  label="Select all items" 
  indeterminate={someChecked}
  checked={allChecked}
  onChange={handleSelectAllChange}
/>

// Disabled states
<Checkbox label="Disabled unchecked" disabled />
<Checkbox label="Disabled checked" disabled checked />

// With helper text
<Checkbox 
  label="Subscribe to newsletter" 
  helperText="We'll send you weekly updates" 
/>

// Error state
<Checkbox 
  label="Agree to terms" 
  error 
  errorText="You must agree to continue" 
/>

// Different size
<Checkbox label="Small checkbox" size="small" />
<Checkbox label="Large checkbox" size="large" />

// Different color
<Checkbox label="Primary color" color="primary" />
<Checkbox label="Secondary color" color="secondary" />
<Checkbox label="Success color" color="success" />
```

### Radio

Use Radio for single selections within a group:

```jsx
import { Radio, RadioGroup } from '../design-system';

// Basic RadioGroup
<RadioGroup 
  label="Select an option"
  name="options"
  value={selectedOption}
  onChange={handleOptionChange}
>
  <Radio label="Option 1" value="option1" />
  <Radio label="Option 2" value="option2" />
  <Radio label="Option 3" value="option3" />
</RadioGroup>

// Default selected value
<RadioGroup 
  label="Gender"
  name="gender"
  defaultValue="female"
>
  <Radio label="Male" value="male" />
  <Radio label="Female" value="female" />
  <Radio label="Other" value="other" />
</RadioGroup>

// Horizontal layout
<RadioGroup 
  label="Size"
  name="size"
  row
>
  <Radio label="Small" value="sm" />
  <Radio label="Medium" value="md" />
  <Radio label="Large" value="lg" />
</RadioGroup>

// With helper text
<RadioGroup 
  label="Shipping Method"
  name="shipping"
  helperText="Delivery times may vary"
>
  <Radio label="Standard" value="standard" />
  <Radio label="Express" value="express" />
</RadioGroup>

// Disabled options
<RadioGroup 
  label="Subscription"
  name="subscription"
>
  <Radio label="Monthly" value="monthly" />
  <Radio label="Annual (save 20%)" value="annual" />
  <Radio label="Lifetime" value="lifetime" disabled />
</RadioGroup>

// Error state
<RadioGroup 
  label="Required Selection"
  name="required"
  error
  errorText="Please select an option"
>
  <Radio label="Option 1" value="option1" />
  <Radio label="Option 2" value="option2" />
</RadioGroup>
```

### Switch

Use Switch for toggle options:

```jsx
import { Switch } from '../design-system';

// Basic usage
<Switch label="Dark Mode" />

// Controlled component
<Switch 
  label="Notifications" 
  checked={notifications}
  onChange={handleNotificationsChange}
/>

// Default checked
<Switch label="Auto-save" defaultChecked />

// With helper text
<Switch 
  label="Location Services" 
  helperText="Allow the app to access your location" 
/>

// Disabled states
<Switch label="Disabled unchecked" disabled />
<Switch label="Disabled checked" disabled checked />

// Error state
<Switch 
  label="Required toggle" 
  error 
  errorText="This setting is required" 
/>

// Sizes
<Switch label="Small switch" size="small" />
<Switch label="Medium switch" size="medium" />
<Switch label="Large switch" size="large" />

// Colors
<Switch label="Primary switch" color="primary" />
<Switch label="Secondary switch" color="secondary" />
<Switch label="Success switch" color="success" />
<Switch label="Error switch" color="error" />
```

### Slider

Use Slider for range selection:

```jsx
import { Slider } from '../design-system';

// Basic usage
<Slider label="Volume" />

// With min/max values
<Slider 
  label="Temperature" 
  min={0} 
  max={100} 
  defaultValue={25}
/>

// Controlled component
<Slider 
  label="Progress" 
  value={progress}
  onChange={handleProgressChange}
/>

// Step size
<Slider 
  label="Quantity" 
  min={0}
  max={10}
  step={1}
  defaultValue={5}
/>

// Custom marks
<Slider 
  label="Size" 
  min={0}
  max={100}
  step={25}
  marks={[0, 25, 50, 75, 100]}
/>

// Show value
<Slider 
  label="Price Range" 
  min={0}
  max={1000}
  defaultValue={500}
  showValue
/>

// Custom value format
<Slider 
  label="Price" 
  min={0}
  max={1000}
  defaultValue={500}
  showValue
  valueLabelFormat="${value}"
/>

// Show min/max labels
<Slider 
  label="Price Range" 
  min={0}
  max={1000}
  defaultValue={500}
  showValue
  showMinMaxLabels
/>

// Disabled
<Slider 
  label="Disabled slider" 
  disabled
  defaultValue={50}
/>

// Error state
<Slider 
  label="Required range" 
  error
  errorText="Please select a value"
  defaultValue={50}
/>

// Sizes
<Slider label="Small slider" size="small" />
<Slider label="Medium slider" size="medium" />
<Slider label="Large slider" size="large" />

// Colors
<Slider label="Primary slider" color="primary" />
<Slider label="Secondary slider" color="secondary" />
<Slider label="Success slider" color="success" />
```

### DatePicker

Use DatePicker for date selection:

```jsx
import { DatePicker } from '../design-system';

// Basic usage
<DatePicker label="Select Date" />

// With default value
<DatePicker 
  label="Start Date" 
  defaultValue="03/15/2025" 
/>

// Different date formats
<DatePicker 
  label="US Format (MM/DD/YYYY)" 
  format="MM/DD/YYYY" 
/>

<DatePicker 
  label="European Format (DD/MM/YYYY)" 
  format="DD/MM/YYYY" 
/>

<DatePicker 
  label="ISO Format (YYYY-MM-DD)" 
  format="YYYY-MM-DD" 
/>

// Controlled component
<DatePicker 
  label="Event Date" 
  value={eventDate}
  onChange={handleDateChange}
/>

// With date constraints
<DatePicker 
  label="Future Dates Only" 
  disablePast
/>

<DatePicker 
  label="Past Dates Only" 
  disableFuture
/>

<DatePicker 
  label="Date Range" 
  minDate="01/01/2025"
  maxDate="12/31/2025"
/>

// With helper text
<DatePicker 
  label="Appointment Date" 
  helperText="Choose a date for your appointment" 
/>

// Disabled
<DatePicker 
  label="Disabled Date Picker" 
  disabled 
/>

// Error state
<DatePicker 
  label="Required Date" 
  error
  errorText="Please select a valid date"
/>

// Input variants
<DatePicker label="Default variant" />
<DatePicker label="Outlined variant" variant="outlined" />
<DatePicker label="Filled variant" variant="filled" />
```

## Feedback Components

### Alert

Use Alert for status messages:

```jsx
import { Alert } from '../design-system';

// Severity variants
<Alert severity="info">This is an info alert</Alert>
<Alert severity="success">This is a success alert</Alert>
<Alert severity="warning">This is a warning alert</Alert>
<Alert severity="error">This is an error alert</Alert>

// Appearance variants
<Alert severity="success" variant="standard">Standard alert</Alert>
<Alert severity="success" variant="filled">Filled alert</Alert>
<Alert severity="success" variant="outlined">Outlined alert</Alert>

// With title
<Alert 
  severity="warning" 
  title="Warning"
>
  This is a warning alert with title
</Alert>

// Closable alert
<Alert 
  severity="info" 
  closable
  onClose={handleAlertClose}
>
  This is a closable alert
</Alert>

// With action
<Alert 
  severity="error"
  action={
    <Button variant="text" size="small" onClick={handleAction}>
      Fix it
    </Button>
  }
>
  There was an error processing your request
</Alert>
```

### Dialog

Use Dialog for modal interactions:

```jsx
import { Dialog, Button, TextField, Typography } from '../design-system';

// Basic usage
<Dialog
  open={open}
  onClose={handleClose}
  title="Dialog Title"
>
  <Typography variant="body1">
    Dialog content goes here. You can include any components.
  </Typography>
</Dialog>

// With actions
<Dialog
  open={open}
  onClose={handleClose}
  title="Confirm Action"
  actions={
    <>
      <Button variant="text" onClick={handleClose}>
        Cancel
      </Button>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleConfirm}
      >
        Confirm
      </Button>
    </>
  }
>
  <Typography variant="body1">
    Are you sure you want to proceed?
  </Typography>
</Dialog>

// Form dialog
<Dialog
  open={open}
  onClose={handleClose}
  title="Create New Item"
  actions={
    <>
      <Button variant="text" onClick={handleClose}>
        Cancel
      </Button>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSubmit}
      >
        Create
      </Button>
    </>
  }
>
  <TextField 
    label="Name" 
    fullWidth 
    style={{ marginBottom: '16px' }}
  />
  <TextField 
    label="Description" 
    fullWidth 
    multiline 
    rows={4}
  />
</Dialog>

// Size variants
<Dialog 
  open={open} 
  onClose={handleClose}
  title="Small Dialog"
  size="small"
>
  Small dialog content
</Dialog>

<Dialog 
  open={open} 
  onClose={handleClose}
  title="Large Dialog"
  size="large"
>
  Large dialog content
</Dialog>

// Custom max width
<Dialog 
  open={open} 
  onClose={handleClose}
  title="Custom Width Dialog"
  maxWidth="800px"
>
  Dialog with custom max width
</Dialog>

// Prevent closing on backdrop click
<Dialog 
  open={open} 
  onClose={handleClose}
  title="Modal Dialog"
  disableBackdropClick
>
  This dialog can only be closed by clicking the X or the actions
</Dialog>
```

### Toast

Use Toast for temporary notifications:

```jsx
import { Toast, Button } from '../design-system';

// Basic usage
<Toast
  message="Operation completed successfully"
  open={toastOpen}
  onClose={handleToastClose}
/>

// Severity variants
<Toast
  message="Something went wrong"
  severity="error"
  open={toastOpen}
  onClose={handleToastClose}
/>

<Toast
  message="File uploaded successfully"
  position="bottom-center"
  severity="success"
  open={toastOpen}
  onClose={handleToastClose}
/>

// With custom duration
<Toast
  message="This will disappear in 10 seconds"
  autoHideDuration={10000}
  open={toastOpen}
  onClose={handleToastClose}
/>

// Persistent toast (doesn't auto-hide)
<Toast
  message="Important notice"
  persistent
  severity="warning"
  open={toastOpen}
  onClose={handleToastClose}
/>

// With action
<Toast
  message="Changes saved"
  severity="success"
  open={toastOpen}
  onClose={handleToastClose}
  action={
    <Button size="small" variant="text" onClick={handleUndo}>
      Undo
    </Button>
  }
/>
```

### CircularProgress

Use CircularProgress for loading spinners or displaying progress in a circular format:

```jsx
import { CircularProgress } from '../design-system';

// Basic usage
<CircularProgress />

// Size variants
<CircularProgress size="small" />
<CircularProgress size="medium" />
<CircularProgress size="large" />
<CircularProgress size={80} /> // Custom size

// Colors
<CircularProgress color="primary" />
<CircularProgress color="secondary" />
<CircularProgress color="success" />
<CircularProgress color="error" />

// Determinate progress (controlled)
<CircularProgress variant="determinate" value={75} />

// With label
<CircularProgress label="Loading..." />
<CircularProgress variant="determinate" value={75} label="75% Complete" />
```

### LinearProgress

Use LinearProgress for horizontal progress bars:

```jsx
import { LinearProgress } from '../design-system';

// Basic usage
<LinearProgress />

// Determinate progress (controlled)
<LinearProgress variant="determinate" value={75} />

// With label
<LinearProgress 
  variant="determinate" 
  value={65} 
  label="Uploading" 
  showPercentage
/>

// Colors
<LinearProgress color="primary" />
<LinearProgress color="secondary" />
<LinearProgress color="success" />
<LinearProgress color="error" />

// Custom height
<LinearProgress height={8} />
```

### Skeleton

Use Skeleton for content placeholders during loading:

```jsx
import { Skeleton, Card, Box, Stack } from '../design-system';

// Basic text skeleton
<Skeleton variant="text" />
<Skeleton variant="text" width="80%" />

// Shapes
<Skeleton variant="rectangular" height={100} />
<Skeleton variant="rounded" height={100} />
<Skeleton variant="circular" width={64} height={64} />

// Animation variants
<Skeleton animation="pulse" /> // Default
<Skeleton animation="wave" />
<Skeleton animation="none" />

// Loading card example
<Card>
  <Box p="lg">
    <Skeleton variant="circular" width={50} height={50} style={{ marginBottom: 16 }} />
    <Skeleton variant="text" width="90%" />
    <Skeleton variant="text" width="95%" />
    <Skeleton variant="text" width="60%" />
  </Box>
</Card>

// Profile loading example
<Stack direction="row" spacing="lg" alignItems="center">
  <Skeleton variant="circular" width={64} height={64} />
  <Stack spacing="xs" style={{ flex: 1 }}>
    <Skeleton variant="text" width="200px" height={24} />
    <Skeleton variant="text" width="140px" height={18} />
    <Skeleton variant="text" width="260px" height={16} />
  </Stack>
</Stack>
```

## Navigation Components

### Tabs

Use Tabs for organizing content into selectable panels:

```jsx
import { Tabs } from '../design-system';

// Basic usage
const [value, setValue] = useState(0);

<Tabs value={value} onChange={setValue}>
  <Tabs.Tab label="Tab 1" />
  <Tabs.Tab label="Tab 2" />
  <Tabs.Tab label="Tab 3" />
</Tabs>

{/* Tab panels */}
<Tabs.Panel value={value} index={0}>
  Content for Tab 1
</Tabs.Panel>
<Tabs.Panel value={value} index={1}>
  Content for Tab 2
</Tabs.Panel>
<Tabs.Panel value={value} index={2}>
  Content for Tab 3
</Tabs.Panel>

// With icons
<Tabs value={value} onChange={setValue}>
  <Tabs.Tab label="Profile" icon={<UserIcon />} />
  <Tabs.Tab label="Settings" icon={<GearIcon />} />
  <Tabs.Tab label="Notifications" icon={<BellIcon />} />
</Tabs>

// Disabled tab
<Tabs value={value} onChange={setValue}>
  <Tabs.Tab label="Tab 1" />
  <Tabs.Tab label="Tab 2" disabled />
  <Tabs.Tab label="Tab 3" />
</Tabs>

// Centered tabs
<Tabs value={value} onChange={setValue} centered>
  <Tabs.Tab label="Tab 1" />
  <Tabs.Tab label="Tab 2" />
  <Tabs.Tab label="Tab 3" />
</Tabs>

// Scrollable tabs
<Tabs value={value} onChange={setValue} scrollable>
  <Tabs.Tab label="Tab 1" />
  <Tabs.Tab label="Tab 2" />
  <Tabs.Tab label="Tab 3" />
  <Tabs.Tab label="Tab 4" />
  <Tabs.Tab label="Tab 5" />
  <Tabs.Tab label="Tab 6" />
  <Tabs.Tab label="Tab 7" />
</Tabs>

// Variants
<Tabs value={value} onChange={setValue} variant="standard">
  <Tabs.Tab label="Tab 1" />
  <Tabs.Tab label="Tab 2" />
  <Tabs.Tab label="Tab 3" />
</Tabs>

<Tabs value={value} onChange={setValue} variant="contained">
  <Tabs.Tab label="Tab 1" />
  <Tabs.Tab label="Tab 2" />
  <Tabs.Tab label="Tab 3" />
</Tabs>

// Vertical tabs
<Tabs value={value} onChange={setValue} orientation="vertical">
  <Tabs.Tab label="Tab 1" />
  <Tabs.Tab label="Tab 2" />
  <Tabs.Tab label="Tab 3" />
</Tabs>
```

### Breadcrumbs

Use Breadcrumbs for navigation hierarchy:

```jsx
import { Breadcrumbs, Typography } from '../design-system';

// Basic usage
<Breadcrumbs>
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <Typography>Product Details</Typography>
</Breadcrumbs>

// Custom separator
<Breadcrumbs separator=">">
  <a href="/">Home</a>
  <a href="/dashboard">Dashboard</a>
  <Typography>Settings</Typography>
</Breadcrumbs>

// With truncation
<Breadcrumbs
  maxItems={3}
  itemsBeforeCollapse={1}
  itemsAfterCollapse={1}
>
  <a href="/">Home</a>
  <a href="/category">Category</a>
  <a href="/category/subcategory">Subcategory</a>
  <a href="/category/subcategory/section">Section</a>
  <Typography>Item</Typography>
</Breadcrumbs>

// With icon
<Breadcrumbs>
  <a href="/">
    <HomeIcon style={{ marginRight: '4px' }} />
    Home
  </a>
  <a href="/products">Products</a>
  <Typography>Product Details</Typography>
</Breadcrumbs>
```

### Menu

Use Menu for dropdown selections and contextual actions:

```jsx
import { Menu, Button } from '../design-system';

// Basic usage
const [anchorEl, setAnchorEl] = useState(null);

<Button 
  onClick={(e) => setAnchorEl(e.currentTarget)}
>
  Open Menu
</Button>

<Menu
  open={Boolean(anchorEl)}
  onClose={() => setAnchorEl(null)}
  anchorEl={anchorEl}
>
  <Menu.Item onClick={() => console.log('Item 1 clicked')}>
    Item 1
  </Menu.Item>
  <Menu.Item onClick={() => console.log('Item 2 clicked')}>
    Item 2
  </Menu.Item>
  <Menu.Item onClick={() => console.log('Item 3 clicked')}>
    Item 3
  </Menu.Item>
</Menu>

// With icons
<Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
  <Menu.Item icon={<EditIcon />}>Edit</Menu.Item>
  <Menu.Item icon={<CopyIcon />}>Duplicate</Menu.Item>
  <Menu.Item icon={<DeleteIcon />} disabled>Delete</Menu.Item>
</Menu>

// With dividers
<Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
  <Menu.Item>Profile</Menu.Item>
  <Menu.Item>My Account</Menu.Item>
  <Menu.Divider />
  <Menu.Item>Settings</Menu.Item>
  <Menu.Divider />
  <Menu.Item>Log out</Menu.Item>
</Menu>

// Selected item
<Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
  <Menu.Item>View</Menu.Item>
  <Menu.Item selected>Edit</Menu.Item>
  <Menu.Item>Share</Menu.Item>
</Menu>

// Different placement
<Menu 
  open={Boolean(anchorEl)} 
  onClose={() => setAnchorEl(null)} 
  anchorEl={anchorEl}
  placement="top-end"
>
  <Menu.Item>Option 1</Menu.Item>
  <Menu.Item>Option 2</Menu.Item>
  <Menu.Item>Option 3</Menu.Item>
</Menu>

// Dense menu
<Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
  <Menu.Item dense>Option 1</Menu.Item>
  <Menu.Item dense>Option 2</Menu.Item>
  <Menu.Item dense>Option 3</Menu.Item>
</Menu>
```

### Pagination

Use Pagination for navigating through pages of content:

```jsx
import { Pagination } from '../design-system';

// Basic usage
const [page, setPage] = useState(1);

<Pagination
  count={10}
  page={page}
  onChange={setPage}
/>

// Show first/last buttons
<Pagination
  count={10}
  page={page}
  onChange={setPage}
  showFirstButton
  showLastButton
/>

// Hide next/previous buttons
<Pagination
  count={10}
  page={page}
  onChange={setPage}
  hideNextButton
  hidePrevButton
/>

// Size variants
<Pagination
  count={10}
  page={page}
  onChange={setPage}
  size="small"
/>

<Pagination
  count={10}
  page={page}
  onChange={setPage}
  size="medium" // default
/>

<Pagination
  count={10}
  page={page}
  onChange={setPage}
  size="large"
/>

// Appearance variants
<Pagination
  count={10}
  page={page}
  onChange={setPage}
  variant="text"
/>

<Pagination
  count={10}
  page={page}
  onChange={setPage}
  variant="outlined" // default
/>

<Pagination
  count={10}
  page={page}
  onChange={setPage}
  variant="contained"
/>

// Shape variants
<Pagination
  count={10}
  page={page}
  onChange={setPage}
  shape="rounded" // default
/>

<Pagination
  count={10}
  page={page}
  onChange={setPage}
  shape="circular"
/>

// Colors
<Pagination
  count={10}
  page={page}
  onChange={setPage}
  color="primary" // default
/>

<Pagination
  count={10}
  page={page}
  onChange={setPage}
  color="secondary"
/>

// Control number of displayed pages
<Pagination
  count={20}
  page={page}
  onChange={setPage}
  siblingCount={0} // Show only directly adjacent pages
  boundaryCount={1} // Show only one page at the start/end
/>

<Pagination
  count={20}
  page={page}
  onChange={setPage}
  siblingCount={2} // Show more siblings
  boundaryCount={2} // Show more boundary pages
/>
```

## Display Components

### Chip

Use Chip for compact interactive elements like tags or badges:

```jsx
import { Chip } from '../design-system';

// Basic usage
<Chip label="Basic Chip" />

// With icon
<Chip 
  label="With Icon" 
  icon={<TagIcon />} 
/>

// Clickable chip
<Chip 
  label="Clickable" 
  clickable 
  onClick={handleClick} 
/>

// With delete functionality
<Chip 
  label="Deletable" 
  onDelete={handleDelete} 
/>

// Variants
<Chip label="Filled" variant="filled" />
<Chip label="Outlined" variant="outlined" />

// Colors
<Chip label="Default" color="default" />
<Chip label="Primary" color="primary" />
<Chip label="Secondary" color="secondary" />
<Chip label="Success" color="success" />
<Chip label="Error" color="error" />
<Chip label="Warning" color="warning" />
<Chip label="Info" color="info" />

// Sizes
<Chip label="Small" size="small" />
<Chip label="Medium" size="medium" />
<Chip label="Large" size="large" />

// Disabled
<Chip label="Disabled" disabled />

// Avatar
<Chip 
  avatar 
  icon={<Avatar src="user.jpg" />} 
  label="John Doe" 
/>

// Combined features
<Chip 
  label="Project X" 
  color="primary" 
  variant="outlined" 
  icon={<FolderIcon />} 
  onDelete={handleDelete} 
  onClick={handleClick} 
/>
```

### Badge

Use Badge to add a small badge to the top-right of any element:

```jsx
import { Badge, Button } from '../design-system';

// Basic usage
<Badge content={5}>
  <Button>Notifications</Button>
</Badge>

// Different positions
<Badge content={3} horizontal="right" vertical="top">
  <Button>Top Right</Button>
</Badge>

<Badge content={3} horizontal="left" vertical="top">
  <Button>Top Left</Button>
</Badge>

<Badge content={3} horizontal="right" vertical="bottom">
  <Button>Bottom Right</Button>
</Badge>

<Badge content={3} horizontal="left" vertical="bottom">
  <Button>Bottom Left</Button>
</Badge>

// Maximum value
<Badge content={100} max={99}>
  <Button>Max Value</Button>
</Badge>

// Colors
<Badge content={5} color="primary">
  <Button>Primary</Button>
</Badge>

<Badge content={5} color="secondary">
  <Button>Secondary</Button>
</Badge>

<Badge content={5} color="error">
  <Button>Error</Button>
</Badge>

// Variants
<Badge content={5} variant="standard">
  <Button>Standard</Button>
</Badge>

<Badge content={5} variant="outlined">
  <Button>Outlined</Button>
</Badge>

// Dot variation
<Badge dot color="error">
  <Button>Dot Badge</Button>
</Badge>

// Invisible badge
<Badge content={0} invisible={!showBadge}>
  <Button>Toggle Badge</Button>
</Badge>

// Overlap for circular elements
<Badge content={5} overlap="circular">
  <Avatar>JD</Avatar>
</Badge>
```

### List

Use List for displaying information in a consistent format:

```jsx
import { List } from '../design-system';

// Basic list
<List>
  <List.Item>Item 1</List.Item>
  <List.Item>Item 2</List.Item>
  <List.Item>Item 3</List.Item>
</List>

// With dividers
<List>
  <List.Item divider>Item 1</List.Item>
  <List.Item divider>Item 2</List.Item>
  <List.Item>Item 3</List.Item>
</List>

// Dense list
<List dense>
  <List.Item>Compact Item 1</List.Item>
  <List.Item>Compact Item 2</List.Item>
  <List.Item>Compact Item 3</List.Item>
</List>

// With icons
<List>
  <List.Item>
    <List.ItemIcon>
      <InboxIcon />
    </List.ItemIcon>
    <List.ItemText primary="Inbox" />
  </List.Item>
  <List.Item>
    <List.ItemIcon>
      <DraftsIcon />
    </List.ItemIcon>
    <List.ItemText primary="Drafts" />
  </List.Item>
</List>

// With primary and secondary text
<List>
  <List.Item>
    <List.ItemText 
      primary="Primary text" 
      secondary="Secondary text" 
    />
  </List.Item>
  <List.Item>
    <List.ItemText 
      primary="Another item" 
      secondary="More details here" 
    />
  </List.Item>
</List>

// Simplified text syntax
<List>
  <List.Item primary="Primary text" secondary="Secondary text" />
  <List.Item primary="Another item" secondary="More details here" />
</List>

// Clickable items
<List>
  <List.Item button onClick={() => console.log('Clicked')}>
    Clickable Item
  </List.Item>
  <List.Item onClick={() => console.log('Clicked')}>
    Also Clickable
  </List.Item>
</List>

// Selected and disabled states
<List>
  <List.Item selected>Selected Item</List.Item>
  <List.Item disabled>Disabled Item</List.Item>
</List>

// With subheader
<List subheader="List Title">
  <List.Item>Item 1</List.Item>
  <List.Item>Item 2</List.Item>
</List>

// Advanced example
<List>
  <List.Item>
    <List.ItemIcon>
      <ProfileIcon />
    </List.ItemIcon>
    <List.ItemText primary="John Doe" secondary="Software Engineer" />
    <Button variant="text" size="small">View</Button>
  </List.Item>
  <List.Item selected>
    <List.ItemIcon>
      <ProfileIcon />
    </List.ItemIcon>
    <List.ItemText primary="Jane Smith" secondary="Product Manager" />
    <Button variant="text" size="small">View</Button>
  </List.Item>
</List>
```

### Table

Use Table for displaying structured data:

```jsx
import { Table } from '../design-system';

// Basic table
<Table>
  <Table.Head>
    <Table.Row>
      <Table.Cell variant="head">Name</Table.Cell>
      <Table.Cell variant="head">Email</Table.Cell>
      <Table.Cell variant="head">Role</Table.Cell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>John Doe</Table.Cell>
      <Table.Cell>john@example.com</Table.Cell>
      <Table.Cell>Admin</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell>Jane Smith</Table.Cell>
      <Table.Cell>jane@example.com</Table.Cell>
      <Table.Cell>User</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>

// Striped table
<Table striped>
  <Table.Head>
    <Table.Row>
      <Table.Cell variant="head">Name</Table.Cell>
      <Table.Cell variant="head">Email</Table.Cell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>John Doe</Table.Cell>
      <Table.Cell>john@example.com</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell>Jane Smith</Table.Cell>
      <Table.Cell>jane@example.com</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>

// Compact table
<Table compact>
  <Table.Head>
    <Table.Row>
      <Table.Cell variant="head">ID</Table.Cell>
      <Table.Cell variant="head">Name</Table.Cell>
      <Table.Cell variant="head">Status</Table.Cell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>001</Table.Cell>
      <Table.Cell>Project Alpha</Table.Cell>
      <Table.Cell>Active</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell>002</Table.Cell>
      <Table.Cell>Project Beta</Table.Cell>
      <Table.Cell>Inactive</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>

// With sticky header and scrollable container
<Table.Container maxHeight={300}>
  <Table stickyHeader>
    <Table.Head>
      <Table.Row>
        <Table.Cell variant="head">Name</Table.Cell>
        <Table.Cell variant="head">Email</Table.Cell>
        <Table.Cell variant="head">Role</Table.Cell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      {/* Many rows here */}
      <Table.Row>
        <Table.Cell>John Doe</Table.Cell>
        <Table.Cell>john@example.com</Table.Cell>
        <Table.Cell>Admin</Table.Cell>
      </Table.Row>
      {/* Repeat rows */}
    </Table.Body>
  </Table>
</Table.Container>

// Cell alignment
<Table>
  <Table.Head>
    <Table.Row>
      <Table.Cell variant="head" align="left">Left</Table.Cell>
      <Table.Cell variant="head" align="center">Center</Table.Cell>
      <Table.Cell variant="head" align="right">Right</Table.Cell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell align="left">Left aligned</Table.Cell>
      <Table.Cell align="center">Center aligned</Table.Cell>
      <Table.Cell align="right">Right aligned</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>

// Clickable rows
<Table>
  <Table.Head>
    <Table.Row>
      <Table.Cell variant="head">Name</Table.Cell>
      <Table.Cell variant="head">Email</Table.Cell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row hover onClick={() => handleRowClick('john')}>
      <Table.Cell>John Doe</Table.Cell>
      <Table.Cell>john@example.com</Table.Cell>
    </Table.Row>
    <Table.Row hover onClick={() => handleRowClick('jane')}>
      <Table.Cell>Jane Smith</Table.Cell>
      <Table.Cell>jane@example.com</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>

// Selected row
<Table>
  <Table.Body>
    <Table.Row selected>
      <Table.Cell>Selected Row</Table.Cell>
      <Table.Cell>This row is highlighted</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell>Normal Row</Table.Cell>
      <Table.Cell>This is a regular row</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

## Theming

Access the theme in your components:

```jsx
import { useTheme } from '../design-system';

function MyComponent() {
  const { theme } = useTheme();
  
  // Access theme values
  const primaryColor = theme.colors.primary.main;
  const spacing = theme.spacing.md;
  
  // Use in custom styles
  const customStyle = {
    backgroundColor: primaryColor,
    padding: spacing,
  };
  
  return <div style={customStyle}>Themed component</div>;
}
```

## Responsive Design

Use the `useMediaQuery` hook for responsive behavior:

```jsx
import { useMediaQuery, Box } from '../design-system';

function ResponsiveComponent() {
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  
  return (
    <Box 
      p={isSmallScreen ? 'sm' : 'lg'}
      display={isSmallScreen ? 'block' : 'flex'}
    >
      {/* Content adapts to screen size */}
      {isSmallScreen ? 'Mobile view' : 'Desktop view'}
    </Box>
  );
}
```

## Best Practices

1. **Consistent spacing**: Use the spacing tokens from the theme (`sm`, `md`, `lg`, etc.) instead of arbitrary pixel values.

2. **Semantic colors**: Use semantic color names (`primary`, `error`, `background.paper`) instead of hardcoded color values.

3. **Composition**: Compose complex UI by combining simple components (`Box`, `Stack`, etc.).

4. **Accessibility**: Ensure proper contrast, focus states, and ARIA attributes.

5. **Responsive design**: Design for mobile first, then enhance for larger screens.

6. **Theme consistency**: Use the theme values via props or the `useTheme` hook instead of hardcoded values.

7. **Component hierarchy**: For form elements, wrap with `FormField` for consistent labeling and error handling.

8. **Variants over custom styles**: Prefer using the built-in variants (`variant="outlined"`) over custom styling when possible.