/**
 * Accessibility Components Showcase
 * 
 * A demonstration component that showcases all accessibility-enhanced components.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module components/common/A11yShowcase
 */

import React, { useState, useRef } from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  TextField, 
  MenuItem, 
  Box, 
  Divider, 
  FormControlLabel,
  Switch,
  Stack,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import { 
  A11yButton, 
  A11yDialog, 
  A11yForm, 
  A11yTable, 
  A11yMenu,
  A11yTooltip
} from './a11y';
import { 
  useA11yAnnouncement,
  useA11yKeyboard
} from '../../hooks/a11y';

/**
 * A showcase component for all accessibility-enhanced components
 */
const A11yShowcase = () => {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form references
  const formRef = useRef(null);
  
  // Announcement hooks
  const { announcePolite, announceAssertive } = useA11yAnnouncement();
  
  // Keyboard hooks
  const { getArrowKeyHandler } = useA11yKeyboard();
  
  // Table data
  const tableData = [
    { id: 1, name: 'Button', usage: 'Interactive elements', status: 'Complete' },
    { id: 2, name: 'Dialog', usage: 'Modal interfaces', status: 'Complete' },
    { id: 3, name: 'Form', usage: 'User input', status: 'Complete' },
    { id: 4, name: 'Table', usage: 'Data presentation', status: 'Complete' },
    { id: 5, name: 'Menu', usage: 'Navigation', status: 'Complete' },
    { id: 6, name: 'Tooltip', usage: 'Contextual help', status: 'Complete' }
  ];
  
  const tableColumns = [
    { id: 'id', label: 'ID', align: 'left' },
    { id: 'name', label: 'Component', align: 'left' },
    { id: 'usage', label: 'Usage', align: 'left' },
    { id: 'status', label: 'Status', align: 'left' }
  ];
  
  // Menu items
  const menuItems = [
    { label: 'Button Example', onClick: () => announcePolite('Button menu item clicked') },
    { label: 'Dialog Example', onClick: () => setDialogOpen(true) },
    { label: 'Form Example', onClick: () => formRef.current.scrollIntoView() },
    { divider: true },
    { label: 'Make Announcement', onClick: () => announceAssertive('This is a screen reader announcement') }
  ];
  
  // Handle form submission
  const handleSubmit = (data) => {
    announcePolite(`Form submitted with name: ${data.name} and type: ${data.componentType}`);
    console.log('Form data:', data);
  };
  
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1">
          Accessibility Components Showcase
        </Typography>
        <Typography variant="body1" paragraph>
          This showcase demonstrates the accessibility-enhanced components built with zero technical debt.
          These components follow WAI-ARIA best practices and provide enhanced keyboard navigation, screen reader support, and other accessibility features.
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            A11yButton Examples
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <A11yButton 
              variant="contained" 
              a11yAnnouncement="Primary button clicked"
            >
              Primary Button
            </A11yButton>
            
            <A11yButton 
              variant="outlined" 
              a11yAnnouncement="Secondary button clicked"
            >
              Secondary Button
            </A11yButton>
            
            <A11yButton 
              variant="text" 
              a11yLabel="Text button with custom label"
              a11yAnnouncement="Text button clicked"
            >
              Text Button
            </A11yButton>
            
            <A11yButton 
              variant="contained" 
              color="error"
              a11yAnnouncement="Danger action initiated"
              disabled
            >
              Disabled Button
            </A11yButton>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            A11yDialog Example
          </Typography>
          <Typography variant="body2" paragraph>
            Dialogs with enhanced keyboard navigation, focus management, and screen reader announcements.
          </Typography>
          
          <A11yButton 
            variant="contained" 
            onClick={() => setDialogOpen(true)}
            a11yAnnouncement="Opening dialog"
          >
            Open Dialog
          </A11yButton>
          
          <A11yDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Accessible Dialog Example"
            a11yAnnouncement="Dialog opened with important information"
            actions={
              <>
                <A11yButton 
                  a11yAnnouncement="Dialog closed without action"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </A11yButton>
                <A11yButton 
                  variant="contained" 
                  a11yAnnouncement="Dialog action confirmed"
                  onClick={() => {
                    announcePolite('Action confirmed and dialog closed');
                    setDialogOpen(false);
                  }}
                >
                  Confirm
                </A11yButton>
              </>
            }
          >
            <Typography paragraph>
              This dialog demonstrates proper focus management and screen reader announcements.
              When opened, focus is trapped within the dialog and returned to the trigger element when closed.
            </Typography>
            <TextField 
              label="Sample Input Field" 
              fullWidth 
              margin="normal"
              aria-label="Sample input field for demonstration"
            />
          </A11yDialog>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            A11yMenu Example
          </Typography>
          <Typography variant="body2" paragraph>
            Accessible dropdown menus with keyboard navigation and screen reader support.
          </Typography>
          
          <Box display="flex" gap={2}>
            <A11yMenu
              items={menuItems}
              a11yLabel="Component examples menu"
              a11yAnnouncement="Menu opened with 5 items"
            >
              Menu Examples
            </A11yMenu>
            
            <A11yMenu
              items={menuItems}
              triggerAs="icon"
              a11yLabel="Icon menu for examples"
            >
              <MenuIcon />
            </A11yMenu>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom ref={formRef}>
            A11yForm Example
          </Typography>
          <Typography variant="body2" paragraph>
            Forms with built-in validation, error messaging, and screen reader announcements.
          </Typography>
          
          <A11yForm
            onSubmit={handleSubmit}
            a11yLabel="Accessibility component form"
            a11yAnnouncement="Form submitted successfully"
            a11yFocusOnError={true}
            a11yRegion="form"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Component Name"
                  name="name"
                  required
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Component Type"
                  name="componentType"
                  required
                  fullWidth
                  margin="normal"
                  defaultValue=""
                >
                  <MenuItem value="">Select a type</MenuItem>
                  <MenuItem value="button">Button</MenuItem>
                  <MenuItem value="dialog">Dialog</MenuItem>
                  <MenuItem value="form">Form</MenuItem>
                  <MenuItem value="table">Table</MenuItem>
                  <MenuItem value="menu">Menu</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch name="enabledFlag" />}
                  label="Enable Component"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <A11yButton type="reset">
                    Reset
                  </A11yButton>
                  <A11yButton 
                    type="submit" 
                    variant="contained"
                    a11yAnnouncement="Form is being submitted"
                  >
                    Submit
                  </A11yButton>
                </Box>
              </Grid>
            </Grid>
          </A11yForm>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            A11yTable Example
          </Typography>
          <Typography variant="body2" paragraph>
            Accessible data tables with ARIA attributes, sortable columns, and screen reader support.
          </Typography>
          
          <A11yTable
            data={tableData}
            columns={tableColumns}
            a11yLabel="Accessibility Components Table"
            a11yCaption="List of accessibility components and their status"
            a11ySummary="A table showing 6 accessibility components with their ID, name, usage, and status"
            sortBy="id"
            sortDirection="asc"
            onSort={(column, direction) => {
              announcePolite(`Table sorted by ${column} in ${direction} order`);
            }}
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            A11yTooltip Examples
          </Typography>
          <Typography variant="body2" paragraph>
            Accessible tooltips with keyboard focus support and motion preferences.
          </Typography>
          
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <A11yTooltip 
              title="Basic tooltip with keyboard focus support" 
              a11yKeyboardFocusable={true}
            >
              <A11yButton variant="outlined">
                Hover or Focus
              </A11yButton>
            </A11yTooltip>
            
            <A11yTooltip 
              title={
                <Box>
                  <Typography variant="subtitle2">Rich Content Tooltip</Typography>
                  <Typography variant="body2">With extended description text</Typography>
                </Box>
              } 
              a11yLabel="Button with rich tooltip content"
            >
              <A11yButton variant="outlined">
                Rich Tooltip
              </A11yButton>
            </A11yTooltip>
            
            <A11yTooltip 
              title="Tooltip with reduced motion settings" 
              a11yRespectMotionPreferences={true}
              placement="top"
            >
              <IconButton aria-label="Information about motion preferences">
                <InfoIcon />
              </IconButton>
            </A11yTooltip>
          </Stack>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Additional Resources
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Accessibility Guidelines</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                These components follow these guidelines:
              </Typography>
              <ul>
                <li>
                  <Link href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noopener">
                    WCAG 2.1 Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="https://www.w3.org/WAI/ARIA/apg/" target="_blank" rel="noopener">
                    ARIA Authoring Practices Guide
                  </Link>
                </li>
                <li>
                  <Link href="https://inclusive-components.design/" target="_blank" rel="noopener">
                    Inclusive Components
                  </Link>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Implementation Approach</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                All components follow a zero technical debt approach, with:
              </Typography>
              <ul>
                <li>Comprehensive screen reader support via ARIA attributes</li>
                <li>Keyboard navigation with focus management</li>
                <li>Support for motion preference sensitivity</li>
                <li>Consistent announcement system for dynamic changes</li>
                <li>Proper focus trapping in modals</li>
                <li>Semantic HTML with proper ARIA relationships</li>
              </ul>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default A11yShowcase;