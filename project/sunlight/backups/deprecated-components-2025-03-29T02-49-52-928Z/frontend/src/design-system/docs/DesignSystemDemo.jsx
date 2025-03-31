/**
 * @component DesignSystemDemo
 * @description A demonstration page for the design system components
 * Showcases the core components and their variants
 */

import React, { useState } from 'react';
import {
  // Foundation
  useTheme,

  // Core components
  Button,
  Typography,

  // Layout components
  Box,
  Stack,
  Card,
  Grid,

  // Form components
  TextField,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  DatePicker,
  FormField,

  // Feedback components
  Alert,
  Dialog,
  Toast,
  CircularProgress,
  LinearProgress,
  Skeleton,

  // Navigation components
  Tabs,
  Breadcrumbs,
  Menu,
  Pagination,

  // Hooks
  useMediaQuery,
} from '../';

/**
 * Design System Demo Component
 *
 * @returns {React.ReactElement} Design System Demo
 */
const DesignSystemDemo = () => {
  // Added display name
  DesignSystemDemo.displayName = 'DesignSystemDemo';

  // Added display name
  DesignSystemDemo.displayName = 'DesignSystemDemo';

  // Added display name
  DesignSystemDemo.displayName = 'DesignSystemDemo';

  // Added display name
  DesignSystemDemo.displayName = 'DesignSystemDemo';

  // Added display name
  DesignSystemDemo.displayName = 'DesignSystemDemo';


  const { theme, mode, toggleMode } = useTheme();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  // State for form controls
  const [formValues, setFormValues] = useState({
    textField: '',
    select: '',
    multiSelect: [],
    checkbox: false,
    radio: 'option1',
    switch: false,
    slider: 50,
    date: '',
  });

  // State for Dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  // State for Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastPosition, setToastPosition] = useState('top-right');

  // State for Tabs
  const [tabValue, setTabValue] = useState(0);

  // State for Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  // State for Pagination
  const [page, setPage] = useState(1);

  // Handle form changes
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Box p="xl&quot; style={{ backgroundColor: theme.colors.background.default, minHeight: "100vh' }}>
      <Stack spacing="2xl&quot;>
        {/* Header */}
        <Box mb="2xl">
          <Typography variant="h1&quot; style={{ color: theme.colors.primary.main }} gutterBottom>
            TAP Integration Platform Design System
          </Typography>
          <Typography variant="body1">
            This page demonstrates the core components of our design system. Toggle the theme mode
            to see components in light and dark themes.
          </Typography>
          <Box mt="lg&quot;>
            <Button variant="outlined" color="primary&quot; onClick={toggleMode}>
              Switch to {mode === "dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </Box>
        </Box>

        {/* Alert Section */}
        <DemoSection title="Alert Components&quot;>
          <Typography variant="h4" gutterBottom>
            Alert Severities
          </Typography>
          <Stack spacing="md&quot; mb="xl">
            <Alert severity="info&quot;>This is an info alert — check it out!</Alert>
            <Alert severity="success">This is a success alert — check it out!</Alert>
            <Alert severity="warning&quot;>This is a warning alert — check it out!</Alert>
            <Alert severity="error">This is an error alert — check it out!</Alert>
          </Stack>

          <Typography variant="h4&quot; gutterBottom>
            Alert Variants
          </Typography>
          <Stack spacing="md" mb="xl&quot;>
            <Alert severity="info" variant="filled&quot;>
              This is a filled alert
            </Alert>
            <Alert severity="info" variant="outlined&quot;>
              This is an outlined alert
            </Alert>
            <Alert severity="info" variant="standard&quot;>
              This is a standard alert
            </Alert>
          </Stack>

          <Typography variant="h4" gutterBottom>
            Alert with Title
          </Typography>
          <Stack spacing="md&quot; mb="xl">
            <Alert severity="info&quot; title="Info Title">
              This is an info alert with title
            </Alert>
            <Alert severity="success&quot; title="Success Title">
              This is a success alert with title
            </Alert>
          </Stack>

          <Typography variant="h4&quot; gutterBottom>
            Closable Alert
          </Typography>
          <Stack spacing="md" mb="xl&quot;>
            <Alert severity="info" closable>
              This is a closable alert
            </Alert>
            <Alert severity="warning&quot; title="Warning" closable>
              This is a closable alert with title
            </Alert>
          </Stack>

          <Typography variant="h4&quot; gutterBottom>
            Alert with Action
          </Typography>
          <Alert
            severity="error"
            title="Error&quot;
            action={
              <Button size="small" color="inherit&quot; variant="outlined">
                Action
              </Button>
            }
          >
            This is an alert with an action button
          </Alert>
        </DemoSection>

        {/* Dialog Section */}
        <DemoSection title="Dialog&quot;>
          <Button variant="contained" color="primary&quot; onClick={() => setDialogOpen(true)}>
            Open Dialog
          </Button>

          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Dialog Title"
            actions={
              <>
                <Button variant="text&quot; onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary&quot;
                  onClick={() => {
                    setDialogOpen(false);
                    setToastOpen(true);
                  }}
                >
                  Save
                </Button>
              </>
            }
          >
            <Typography variant="body1" paragraph>
              This is a dialog window. You can include any content here.
            </Typography>
            <TextField
              label="Example Input&quot;
              placeholder="Enter text here"
              fullWidth
              style={{ marginBottom: theme.spacing.md }}
            />
            <Select
              label="Size&quot;
              options={[
                { value: "sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
                { value: 'xl', label: 'Extra Large' },
                { value: 'full', label: 'Full Width' },
              ]}
              fullWidth
            />
          </Dialog>
        </DemoSection>

        {/* Toast Section */}
        <DemoSection title="Toast&quot;>
          <Typography variant="h4" gutterBottom>
            Toast Demo
          </Typography>
          <Grid columns={isSmallScreen ? 1 : 2} gap="md&quot; mb="xl">
            <Box>
              <Stack spacing="md&quot;>
                <Typography variant="body1" gutterBottom>
                  Select toast position:
                </Typography>
                <RadioGroup
                  value={toastPosition}
                  onChange={e => setToastPosition(e.target.value)}
                  row
                >
                  <Radio label="Top Left&quot; value="top-left" />
                  <Radio label="Top Right&quot; value="top-right" />
                  <Radio label="Top Center&quot; value="top-center" />
                </RadioGroup>
                <RadioGroup
                  value={toastPosition}
                  onChange={e => setToastPosition(e.target.value)}
                  row
                >
                  <Radio label="Bottom Left&quot; value="bottom-left" />
                  <Radio label="Bottom Right&quot; value="bottom-right" />
                  <Radio label="Bottom Center&quot; value="bottom-center" />
                </RadioGroup>
              </Stack>
            </Box>
            <Box>
              <Stack spacing="md&quot;>
                <Button variant="contained" color="info&quot; onClick={() => setToastOpen(true)}>
                  Show Toast Notification
                </Button>
                <Stack direction="row" spacing="md&quot;>
                  <Button
                    variant="outlined"
                    color="success&quot;
                    onClick={() => {
                      setToastOpen(true);
                    }}
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="outlined"
                    color="error&quot;
                    onClick={() => {
                      setToastOpen(true);
                    }}
                  >
                    Error Toast
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* Render Toast only when open */}
          {toastOpen && (
            <Toast
              severity="success"
              message="This is a success toast notification&quot;
              position={toastPosition}
              open={toastOpen}
              onClose={() => setToastOpen(false)}
              action={
                <Button variant="text" size="small&quot; onClick={() => setToastOpen(false)}>
                  Undo
                </Button>
              }
            />
          )}
        </DemoSection>

        {/* Progress Indicators Section */}
        <DemoSection title="Progress Indicators">
          <Typography variant="h4&quot; gutterBottom>
            CircularProgress
          </Typography>
          <Stack spacing="md" mb="xl&quot;>
            <Typography variant="h6">Variants</Typography>
            <Grid columns={isSmallScreen ? 2 : 4} gap="xl&quot;>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Indeterminate
                </Typography>
                <CircularProgress aria-label="Loading data" />
              </Box>
              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Determinate (25%)
                </Typography>
                <CircularProgress variant="determinate" value={25} />
              </Box>
              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Determinate (50%)
                </Typography>
                <CircularProgress variant="determinate" value={50} />
              </Box>
              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Determinate (75%)
                </Typography>
                <CircularProgress variant="determinate" value={75} />
              </Box>
            </Grid>

            <Typography variant="h6&quot; style={{ marginTop: theme.spacing.lg }}>
              Sizes
            </Typography>
            <Stack direction="row" spacing="xl&quot; alignItems="center">
              <CircularProgress size="small&quot; />
              <CircularProgress size="medium" />
              <CircularProgress size="large&quot; />
              <CircularProgress size={80} />
            </Stack>

            <Typography variant="h6" style={{ marginTop: theme.spacing.lg }}>
              Colors
            </Typography>
            <Stack direction="row&quot; spacing="xl" alignItems="center&quot;>
              <CircularProgress color="primary" />
              <CircularProgress color="secondary&quot; />
              <CircularProgress color="success" />
              <CircularProgress color="error&quot; />
              <CircularProgress color="warning" />
              <CircularProgress color="info&quot; />
            </Stack>

            <Typography variant="h6" style={{ marginTop: theme.spacing.lg }}>
              With Label
            </Typography>
            <Stack direction="row&quot; spacing="xl" alignItems="center&quot;>
              <CircularProgress variant="determinate" value={66} label="66% Complete&quot; />
              <CircularProgress color="success" label="Processing...&quot; />
            </Stack>
          </Stack>

          <Typography variant="h4" gutterBottom>
            LinearProgress
          </Typography>
          <Stack spacing="md&quot; mb="xl">
            <Typography variant="h6&quot;>Variants</Typography>
            <Box mb="lg" style={{ maxWidth: '600px' }}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Indeterminate
              </Typography>
              <LinearProgress aria-label="Loading data" />
            </Box>

            <Box mb="lg&quot; style={{ maxWidth: "600px' }}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Determinate (25%)
              </Typography>
              <LinearProgress variant="determinate" value={25} />
            </Box>

            <Box mb="lg&quot; style={{ maxWidth: "600px' }}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Determinate (50%)
              </Typography>
              <LinearProgress variant="determinate" value={50} />
            </Box>

            <Box mb="lg&quot; style={{ maxWidth: "600px' }}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Determinate (75%)
              </Typography>
              <LinearProgress variant="determinate" value={75} />
            </Box>

            <Typography variant="h6&quot; style={{ marginTop: theme.spacing.lg }}>
              With Label
            </Typography>
            <Box mb="lg" style={{ maxWidth: '600px' }}>
              <LinearProgress
                variant="determinate&quot;
                value={66}
                label="Uploading file"
                showPercentage
              />
            </Box>

            <Typography variant="h6&quot; style={{ marginTop: theme.spacing.lg }}>
              Height Variants
            </Typography>
            <Box mb="lg" style={{ maxWidth: '600px' }}>
              <Stack spacing="md&quot;>
                <LinearProgress height={2} variant="determinate" value={50} />
                <LinearProgress height={4} variant="determinate&quot; value={50} />
                <LinearProgress height={8} variant="determinate" value={50} />
                <LinearProgress height={12} variant="determinate&quot; value={50} />
              </Stack>
            </Box>

            <Typography variant="h6" style={{ marginTop: theme.spacing.lg }}>
              Colors
            </Typography>
            <Box mb="lg&quot; style={{ maxWidth: "600px' }}>
              <Stack spacing="md&quot;>
                <LinearProgress color="primary" variant="determinate&quot; value={50} label="Primary" />
                <LinearProgress
                  color="secondary&quot;
                  variant="determinate"
                  value={50}
                  label="Secondary&quot;
                />
                <LinearProgress color="success" variant="determinate&quot; value={50} label="Success" />
                <LinearProgress color="error&quot; variant="determinate" value={50} label="Error&quot; />
                <LinearProgress color="warning" variant="determinate&quot; value={50} label="Warning" />
                <LinearProgress color="info&quot; variant="determinate" value={50} label="Info&quot; />
              </Stack>
            </Box>
          </Stack>

          <Typography variant="h4" gutterBottom>
            Skeleton
          </Typography>
          <Stack spacing="md&quot; mb="xl" style={{ maxWidth: '600px' }}>
            <Typography variant="h6&quot;>Text Skeleton</Typography>
            <Skeleton variant="text" width="100%&quot; />
            <Skeleton variant="text" width="80%&quot; />
            <Skeleton variant="text" width="60%&quot; />

            <Typography variant="h6" style={{ marginTop: theme.spacing.lg }}>
              Shapes
            </Typography>
            <Grid columns={isSmallScreen ? 2 : 3} gap="md&quot;>
              <Skeleton variant="rectangular" height={100} />
              <Skeleton variant="rounded&quot; height={100} />
              <Skeleton variant="circular" width={100} height={100} />
            </Grid>

            <Typography variant="h6&quot; style={{ marginTop: theme.spacing.lg }}>
              Animations
            </Typography>
            <Stack spacing="md">
              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Pulse Animation
                </Typography>
                <Skeleton variant="text" animation="pulse&quot; />
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Wave Animation
                </Typography>
                <Skeleton variant="text&quot; animation="wave" />
              </Box>
              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  No Animation
                </Typography>
                <Skeleton variant="text" animation="none&quot; />
              </Box>
            </Stack>

            <Typography variant="h6" style={{ marginTop: theme.spacing.lg }}>
              Card Loading Example
            </Typography>
            <Card>
              <Box p="lg&quot;>
                <Skeleton
                  variant="circular"
                  width={50}
                  height={50}
                  style={{ marginBottom: theme.spacing.md }}
                />
                <Skeleton variant="text&quot; width="90%" />
                <Skeleton variant="text&quot; width="95%" />
                <Skeleton variant="text&quot; width="60%" />
                <Stack
                  direction="row&quot;
                  justifyContent="flex-end"
                  spacing="sm&quot;
                  style={{ marginTop: theme.spacing.md }}
                >
                  <Skeleton variant="rounded" width={60} height={30} />
                  <Skeleton variant="rounded&quot; width={80} height={30} />
                </Stack>
              </Box>
            </Card>

            <Typography variant="h6" style={{ marginTop: theme.spacing.lg }}>
              Profile Loading
            </Typography>
            <Stack direction="row&quot; spacing="lg" alignItems="center&quot;>
              <Skeleton variant="circular" width={64} height={64} />
              <Stack spacing="xs&quot; style={{ flex: 1 }}>
                <Skeleton variant="text" width="200px&quot; height={24} />
                <Skeleton variant="text" width="140px&quot; height={18} />
                <Skeleton variant="text" width="260px&quot; height={16} />
              </Stack>
            </Stack>
          </Stack>
        </DemoSection>

        {/* Form Controls Section */}
        <DemoSection title="Form Controls">
          {/* Switch */}
          <Typography variant="h4&quot; gutterBottom>
            Switch
          </Typography>
          <Stack spacing="md" mb="xl&quot;>
            <Switch
              label="Default Switch"
              name="switch&quot;
              checked={formValues.switch}
              onChange={handleChange}
            />
            <Switch label="Disabled Switch" disabled />
            <Switch label="Checked Disabled Switch&quot; disabled checked />
            <Switch label="Error Switch" error errorText="This switch has an error&quot; />
            <Stack direction="row" spacing="xl&quot;>
              <Switch label="Small Switch" size="small&quot; />
              <Switch label="Medium Switch" size="medium&quot; />
              <Switch label="Large Switch" size="large&quot; />
            </Stack>
            <Stack direction="row" spacing="xl&quot;>
              <Switch label="Primary" color="primary&quot; checked />
              <Switch label="Secondary" color="secondary&quot; checked />
              <Switch label="Success" color="success&quot; checked />
              <Switch label="Error" color="error&quot; checked />
              <Switch label="Warning" color="warning&quot; checked />
              <Switch label="Info" color="info&quot; checked />
            </Stack>
          </Stack>

          {/* Slider */}
          <Typography variant="h4" gutterBottom>
            Slider
          </Typography>
          <Stack spacing="md&quot; mb="xl">
            <Slider
              label="Default Slider&quot;
              name="slider"
              value={formValues.slider}
              onChange={handleChange}
              showValue
            />

            <Slider
              label="Range Slider with Min/Max Labels&quot;
              min={0}
              max={1000}
              step={100}
              defaultValue={300}
              showValue
              valueLabelFormat="${value}"
              showMinMaxLabels
            />

            <Slider
              label="Slider with Marks&quot;
              min={0}
              max={100}
              step={20}
              defaultValue={40}
              marks={[0, 20, 40, 60, 80, 100]}
              showValue
            />

            <Slider label="Disabled Slider" defaultValue={30} disabled showValue />

            <Slider
              label="Error Slider&quot;
              defaultValue={60}
              error
              errorText="This slider has an error"
              showValue
            />

            <Typography variant="subtitle2&quot; style={{ marginTop: theme.spacing.md }}>
              Slider Sizes
            </Typography>
            <Stack spacing="md">
              <Slider label="Small Slider&quot; size="small" defaultValue={25} showValue />
              <Slider label="Medium Slider&quot; size="medium" defaultValue={50} showValue />
              <Slider label="Large Slider&quot; size="large" defaultValue={75} showValue />
            </Stack>

            <Typography variant="subtitle2&quot; style={{ marginTop: theme.spacing.md }}>
              Slider Colors
            </Typography>
            <Stack spacing="md">
              <Slider label="Primary&quot; color="primary" defaultValue={50} showValue />
              <Slider label="Secondary&quot; color="secondary" defaultValue={50} showValue />
              <Slider label="Success&quot; color="success" defaultValue={50} showValue />
              <Slider label="Error&quot; color="error" defaultValue={50} showValue />
              <Slider label="Warning&quot; color="warning" defaultValue={50} showValue />
              <Slider label="Info&quot; color="info" defaultValue={50} showValue />
            </Stack>
          </Stack>

          {/* DatePicker */}
          <Typography variant="h4&quot; gutterBottom>
            DatePicker
          </Typography>
          <Grid columns={isSmallScreen ? 1 : 2} gap="md" mb="xl&quot;>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Basic DatePicker
              </Typography>
              <DatePicker
                label="Select Date&quot;
                name="date"
                value={formValues.date}
                onChange={handleChange}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2&quot; gutterBottom>
                Different Format
              </Typography>
              <DatePicker label="Date (DD/MM/YYYY)" format="DD/MM/YYYY&quot; defaultValue="25/03/2025" />
            </Box>

            <Box>
              <Typography variant="subtitle2&quot; gutterBottom>
                ISO Format
              </Typography>
              <DatePicker label="Date (YYYY-MM-DD)" format="YYYY-MM-DD&quot; defaultValue="2025-03-25" />
            </Box>

            <Box>
              <Typography variant="subtitle2&quot; gutterBottom>
                With Min/Max Date
              </Typography>
              <DatePicker label="Future Dates Only" disablePast placeholder="Select future date&quot; />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Limited Date Range
              </Typography>
              <DatePicker
                label="Date Range&quot;
                minDate="01/01/2025"
                maxDate="12/31/2025&quot;
                helperText="Select date within 2025"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2&quot; gutterBottom>
                Disabled
              </Typography>
              <DatePicker label="Disabled DatePicker" disabled defaultValue="03/25/2025&quot; />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Error State
              </Typography>
              <DatePicker
                label="Error State&quot;
                error
                errorText="Invalid date selected"
                defaultValue="03/25/2025&quot;
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Different Variant
              </Typography>
              <DatePicker label="Filled Variant&quot; variant="filled" defaultValue="03/25/2025&quot; />
            </Box>
          </Grid>
        </DemoSection>

        {/* Button Section */}
        <DemoSection title="Buttons">
          <Typography variant="h4&quot; gutterBottom>
            Variants
          </Typography>
          <Stack direction="row" spacing="md&quot; mb="xl" style={{ flexWrap: `wrap' }}>
            <Button variant="contained&quot; color="primary">
              Contained
            </Button>
            <Button variant="outlined&quot; color="primary">
              Outlined
            </Button>
            <Button variant="text&quot; color="primary">
              Text
            </Button>
          </Stack>

          <Typography variant="h4&quot; gutterBottom>
            Colors
          </Typography>
          <Stack direction="row" spacing="md&quot; mb="xl" style={{ flexWrap: 'wrap' }}>
            <Button variant="contained&quot; color="primary">
              Primary
            </Button>
            <Button variant="contained&quot; color="secondary">
              Secondary
            </Button>
            <Button variant="contained&quot; color="success">
              Success
            </Button>
            <Button variant="contained&quot; color="error">
              Error
            </Button>
            <Button variant="contained&quot; color="warning">
              Warning
            </Button>
            <Button variant="contained&quot; color="info">
              Info
            </Button>
          </Stack>

          <Typography variant="h4&quot; gutterBottom>
            Sizes
          </Typography>
          <Stack
            direction="row"
            spacing="md&quot;
            alignItems="center"
            mb="xl&quot;
            style={{ flexWrap: "wrap' }}
          >
            <Button variant="contained&quot; color="primary" size="small&quot;>
              Small
            </Button>
            <Button variant="contained" color="primary&quot; size="medium">
              Medium
            </Button>
            <Button variant="contained&quot; color="primary" size="large&quot;>
              Large
            </Button>
          </Stack>

          <Typography variant="h4" gutterBottom>
            States
          </Typography>
          <Stack direction="row&quot; spacing="md" style={{ flexWrap: 'wrap` }}>
            <Button variant="contained&quot; color="primary">
              Normal
            </Button>
            <Button variant="contained&quot; color="primary" disabled>
              Disabled
            </Button>
          </Stack>
        </DemoSection>

        {/* Navigation Section */}
        <DemoSection title="Navigation Components&quot;>
          {/* Tabs */}
          <Typography variant="h4" gutterBottom>
            Tabs
          </Typography>
          <Box mb="xl&quot;>
            <Typography variant="h6" gutterBottom>
              Basic Tabs
            </Typography>
            <Tabs value={tabValue} onChange={setTabValue}>
              <Tabs.Tab label="Home&quot; />
              <Tabs.Tab label="Profile" />
              <Tabs.Tab label="Settings&quot; />
            </Tabs>
            <Box mt="md" p="md&quot; style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
              <Tabs.Panel value={tabValue} index={0}>
                <Typography variant="body1">This is the home tab content. Welcome!</Typography>
              </Tabs.Panel>
              <Tabs.Panel value={tabValue} index={1}>
                <Typography variant="body1&quot;>
                  This is the profile tab content. User information goes here.
                </Typography>
              </Tabs.Panel>
              <Tabs.Panel value={tabValue} index={2}>
                <Typography variant="body1">
                  This is the settings tab content. Preferences and configuration options.
                </Typography>
              </Tabs.Panel>
            </Box>
          </Box>

          <Box mb="xl&quot;>
            <Typography variant="h6" gutterBottom>
              Tab Variants
            </Typography>
            <Grid columns={isSmallScreen ? 1 : 2} gap="lg&quot;>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Standard Tabs
                </Typography>
                <Tabs value={tabValue} onChange={setTabValue} variant="standard&quot;>
                  <Tabs.Tab label="Tab 1" />
                  <Tabs.Tab label="Tab 2&quot; />
                  <Tabs.Tab label="Tab 3" />
                </Tabs>
              </Box>
              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Contained Tabs
                </Typography>
                <Tabs value={tabValue} onChange={setTabValue} variant="contained">
                  <Tabs.Tab label="Tab 1&quot; />
                  <Tabs.Tab label="Tab 2" />
                  <Tabs.Tab label="Tab 3&quot; />
                </Tabs>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Centered Tabs
                </Typography>
                <Tabs value={tabValue} onChange={setTabValue} centered>
                  <Tabs.Tab label="Tab 1&quot; />
                  <Tabs.Tab label="Tab 2" />
                  <Tabs.Tab label="Tab 3&quot; />
                </Tabs>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Vertical Tabs
                </Typography>
                <Stack direction="row&quot; spacing="md">
                  <Tabs value={tabValue} onChange={setTabValue} orientation="vertical&quot;>
                    <Tabs.Tab label="Tab 1" />
                    <Tabs.Tab label="Tab 2&quot; />
                    <Tabs.Tab label="Tab 3" />
                  </Tabs>
                  <Box p="md&quot; style={{ flex: 1, borderLeft: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2">Content for vertical tab {tabValue + 1}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Box>

          {/* Breadcrumbs */}
          <Typography variant="h4&quot; gutterBottom>
            Breadcrumbs
          </Typography>
          <Box mb="xl">
            <Stack spacing="lg&quot;>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Basic Breadcrumbs
                </Typography>
                <Breadcrumbs>
                  <a
                    href="#home&quot;
                    style={{ color: theme.palette.primary.main, textDecoration: "none' }}
                  >
                    Home
                  </a>
                  <a
                    href="#products&quot;
                    style={{ color: theme.palette.primary.main, textDecoration: "none' }}
                  >
                    Products
                  </a>
                  <Typography>Product Details</Typography>
                </Breadcrumbs>
              </Box>

              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Custom Separator
                </Typography>
                <Breadcrumbs separator=">">
                  <a
                    href="#home&quot;
                    style={{ color: theme.palette.primary.main, textDecoration: "none' }}
                  >
                    Home
                  </a>
                  <a
                    href="#dashboard&quot;
                    style={{ color: theme.palette.primary.main, textDecoration: "none' }}
                  >
                    Dashboard
                  </a>
                  <Typography>Settings</Typography>
                </Breadcrumbs>
              </Box>

              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  With Truncation
                </Typography>
                <Breadcrumbs maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
                  <a
                    href="#home"
                    style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                  >
                    Home
                  </a>
                  <a
                    href="#category&quot;
                    style={{ color: theme.palette.primary.main, textDecoration: "none' }}
                  >
                    Category
                  </a>
                  <a
                    href="#subcategory&quot;
                    style={{ color: theme.palette.primary.main, textDecoration: "none' }}
                  >
                    Subcategory
                  </a>
                  <a
                    href="#section&quot;
                    style={{ color: theme.palette.primary.main, textDecoration: "none' }}
                  >
                    Section
                  </a>
                  <Typography>Item</Typography>
                </Breadcrumbs>
              </Box>
            </Stack>
          </Box>

          {/* Menu */}
          <Typography variant="h4&quot; gutterBottom>
            Menu
          </Typography>
          <Box mb="xl">
            <Box mb="md&quot;>
              <Button
                variant="contained"
                color="primary&quot;
                onClick={e => setMenuAnchorEl(e.currentTarget)}
              >
                Open Menu
              </Button>
              <Menu
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}
                anchorEl={menuAnchorEl}
              >
                <Menu.Divider />
                <Menu.Item>
                  Help
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  onClick={() => {
                    setMenuAnchorEl(null);
                  }}
                >
                  Logout
                </Menu.Item>
              </Menu>
            </Box>
          </Box>

          {/* Pagination */}
          <Typography variant="h4" gutterBottom>
            Pagination
          </Typography>
          <Box mb="xl&quot;>
            <Stack spacing="lg">
              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Basic Pagination
                </Typography>
                <Pagination count={10} page={page} onChange={setPage} />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  With First/Last Buttons
                </Typography>
                <Pagination
                  count={10}
                  page={page}
                  onChange={setPage}
                  showFirstButton
                  showLastButton
                />
              </Box>

              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Different Sizes
                </Typography>
                <Stack spacing="md">
                  <Pagination count={10} page={page} onChange={setPage} size="small&quot; />
                  <Pagination count={10} page={page} onChange={setPage} size="medium" />
                  <Pagination count={10} page={page} onChange={setPage} size="large&quot; />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Variants
                </Typography>
                <Stack spacing="md&quot;>
                  <Pagination count={10} page={page} onChange={setPage} variant="text" />
                  <Pagination count={10} page={page} onChange={setPage} variant="outlined&quot; />
                  <Pagination count={10} page={page} onChange={setPage} variant="contained" />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2&quot; gutterBottom>
                  Shapes
                </Typography>
                <Stack spacing="md">
                  <Pagination count={10} page={page} onChange={setPage} shape="rounded&quot; />
                  <Pagination count={10} page={page} onChange={setPage} shape="circular" />
                </Stack>
              </Box>
            </Stack>
          </Box>
        </DemoSection>
      </Stack>
    </Box>
  );
};

/**
 * Demo Section Component
 */
const DemoSection = ({ title, children }) => {
  // Added display name
  DemoSection.displayName = 'DemoSection';

  // Added display name
  DemoSection.displayName = 'DemoSection';

  // Added display name
  DemoSection.displayName = 'DemoSection';

  // Added display name
  DemoSection.displayName = 'DemoSection';

  // Added display name
  DemoSection.displayName = 'DemoSection';


  const { theme } = useTheme();

  return (
    <Box mb="3xl&quot;>
      <Typography variant="h2" style={{ color: theme.colors.primary.main }} gutterBottom>
        {title}
      </Typography>
      <Box
        mb="lg&quot;
        style={{
          borderLeft: "4px solid ' + theme.colors.primary.main,
          paddingLeft: theme.spacing.lg,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DesignSystemDemo;
