# Design System Implementation: Direct Migration Plan

## Remaining Components To Migrate

### Page Components
- [x] AdminDashboard.jsx - Main admin dashboard page
- [x] AdminDashboardPage.jsx - Enhanced admin dashboard
- [x] TemplatesPage.jsx - Templates browsing page
- [x] UserSettingsPage.jsx - User settings page
- [x] EarningsPage.jsx - Earnings management page
- [x] HomePage.jsx - Application home page
- [x] IntegrationDetailPage.jsx - Integration details view
- [x] IntegrationsPage.jsx - Integrations listing page

### Admin Components
- [x] AdminLayout.jsx - Admin section layout component
- [x] ReleasesManager.jsx - Manage software releases (partial migration)
- [x] TemplatesManager.jsx - Template management interface (partially migrated)
- [x] TenantsManager.jsx - Tenant management interface (partially migrated)
- [x] ApplicationsManager.jsx - Application management
- [x] DatasetsManager.jsx - Dataset management interface

### Common Components
- [x] StatusDisplay.jsx - Status indicators used throughout the app
- [x] VirtualizedDataTable.jsx - Performance-optimized table component
- [x] Timeline.jsx - Time sequence visualization
- [x] ProgressBar.jsx - Progress indicator component
- [x] PortalModal.jsx - Modal dialog using React portal
- [x] PerformanceMetricsDisplay.jsx - Performance metrics visualization
- [x] PageHeader.jsx - Page header component with navigation
- [x] Logo.jsx - Logo display component
- [x] IntegrationStatsBar.jsx - Stats display for integration
- [x] IntegrationHealthBar.jsx - Health monitor for integrations
- [x] InputField.jsx - Form input field component
- [x] Footer.jsx - Application footer component
- [x] DashboardCard.jsx - Card component for dashboards
- [x] ChatSupportPanel.jsx - Support chat interface
- [x] CachingDemo.jsx - Caching demonstration component
- [x] KeyboardShortcutsHelp.jsx - Keyboard shortcuts dialog
- [x] Navigation.jsx - Navigation component
- [x] PageLayout.jsx - Layout component for pages
- [x] SearchBar.jsx - Search input component
- [x] SearchFilterPanel.jsx - Search filter interface
- [x] FilterBuilder.jsx - Filter creation interface
- [x] NotificationCenter.jsx - Notification management UI
- [x] Toast.jsx - Toast notification component
- [x] ToastContainer.jsx - Container for toast notifications
- [x] OptimizedToast.jsx - Performance-optimized toast component
- [x] ResourceLoader.jsx - Data loading/error handling component
- [x] UserProfile.jsx - User profile display component
- [x] AccessibilityReport.jsx - Accessibility reporting tool
- [x] AccessibilityTester.jsx - A11y testing component
- [x] ErrorBoundary.jsx - Error handling component

### High Priority Components
- [x] IntegrationFlowCanvas.jsx - Core flow building interface (initial migration started)
- [x] DataTable.jsx - Used across the application (initial migration started)
- [x] NodePalette.jsx - Essential part of integration builder (initial migration started)

### Node Components
- [x] BaseNode.jsx - Base component for all nodes (initial migration started)
- [x] SourceNode.jsx - Source data node (initial migration started)
- [x] DestinationNode.jsx - Destination node (initial migration started)
- [x] TransformNode.jsx - Data transformation node (initial migration started)
- [x] ActionNode.jsx - Workflow action node (initial migration started)
- [x] RouterNode.jsx - Conditional routing node (initial migration started)
- [x] TriggerNode.jsx - Trigger events node (initial migration started)
- [x] DatasetNode.jsx - Dataset reference node (initial migration started)

### Integration Components
- [x] IntegrationFlowCanvasOptimized.jsx - Performance-optimized canvas (initial migration started)
- [x] IntegrationBuilder.jsx - Top-level integration builder (initial migration completed)
- [x] ValidationPanel.jsx - Validation UI (initial migration completed)
- [x] DataPreviewPanel.jsx - Data preview functionality (initial migration completed)
- [x] VisualFieldMapper.jsx - Field mapping visualization (initial migration completed)
- [x] ContextualPropertiesPanel.jsx - Properties panel (initial migration completed)
- [x] RunLogViewer.jsx - Log viewing interface (initial migration completed)

### Template Components
- [x] TemplateLibrary.jsx - Template browsing (initial migration completed)
- [x] TemplateCard.jsx - Template card display (initial migration completed) 
- [x] TemplateDetailView.jsx - Template details (initial migration completed)
- [x] TemplateEditDialog.jsx - Template editing (initial migration completed)
- [x] TemplateShareDialog.jsx - Sharing options UI (initial migration completed)
- [x] SaveAsTemplateButton.jsx - Template saving UI (initial migration completed)
- [x] SaveAsTemplateDialog.jsx - Save dialog (initial migration started)

### Earnings Components
- [x] EarningsCodeManager.jsx - Earnings code management (initial migration completed)
- [x] EarningsMapEditor.jsx - Earnings mapping interface (initial migration completed)
- [x] EmployeeManager.jsx - Employee data management (initial migration completed)
- [x] EmployeeRosterManager.jsx - Roster management (initial migration completed)

## Standardization Checklist

### Immediate Tasks
- [x] 1. Analyze core app structure and identify highest-impact components
- [x] 2. Set up ThemeProvider in App.jsx and standardize application theming
- [x] 3. Migrate main layout components (Box, Grid, Stack) to design system
- [x] 4. Update page components in priority order:
  - [x] HomePage.jsx
  - [x] IntegrationDetailPage.jsx
  - [x] IntegrationsPage.jsx
  - [x] AdminDashboardPage.jsx
- [x] 5. Implement design system Typography across all pages
- [x] 6. Update form components (TextField, Select, Button) in key forms

### Form Component Migration Checklist
- [x] IntegrationCreationDialog.jsx
- [x] ScheduleConfiguration.jsx
- [x] NotificationSettings.jsx
- [x] AzureBlobConfiguration.jsx
- [x] FieldMappingEditor.jsx
- [x] TemplateSelector.jsx
- [x] IntegrationTable.jsx
- [x] NodePropertiesPanel.jsx

### Testing Milestones
- [x] 1. Verify app structure and navigation works with ThemeProvider
- [x] 2. Test core page rendering and layout functionality
- [x] 3. Validate form submission and data handling
- [x] 4. Ensure responsive design works on all screen sizes
- [x] 5. Verify styling consistency across components

### Performance Optimization
- [x] 1. Complete all form component migrations (from checklist above)
- [x] 2. Migrate remaining common components (see Common Components list)
- [ ] 3. Remove unused Material UI components from bundle
- [ ] 4. Ensure proper code splitting for large components
- [ ] 5. Verify lazy loading working correctly for routes
- [ ] 6. Measure and optimize bundle size

## Project Overview
The TAP Integration Platform is transitioning from Material UI to our custom design system. Since the app isn't in production yet, we're implementing the most direct approach without legacy wrappers to get a standardized, testable version quickly.

## Current State Analysis

### Design System Structure
1. **Custom Design System Components**:
   - Located in `/design-system/components/` organized by category (core, layout, form, feedback, etc.)
   - Implements our own styling, theming, and component APIs optimized for our needs

2. **Current Codebase Status**:
   - Mix of direct Material UI imports and design system components
   - Some components using legacy wrappers (which add unnecessary complexity)
   - Inconsistent component usage patterns across the application

## Direct Migration Strategy

### Core Principles
1. **Direct Implementation**: Import design system components directly, not through legacy wrappers
2. **Clean Architecture**: Remove all Material UI dependencies where possible
3. **Consistent Patterns**: Standardize component usage across the application
4. **Optimized Performance**: Leverage design system's optimized rendering and bundle size benefits

### Target Import Pattern
```jsx
// BEFORE (Material UI)
import { Button, Box, Typography } from '@mui/material';

// AFTER (Direct Design System)
import { Button } from '../design-system/components/core';
import { Box } from '../design-system/components/layout';
import { Typography } from '../design-system/components/core';
```

## Migration Implementation Plan

### Step 1: Define Core Component Mapping
For each Material UI component, identify the direct design system replacement:

| Material UI | Design System Replacement |
|-------------|---------------------------|
| `Button` | `../design-system/components/core/Button` |
| `Box` | `../design-system/components/layout/Box` |
| `Typography` | `../design-system/components/core/Typography` |
| `Card` | `../design-system/components/layout/Card` |
| `Grid` | `../design-system/components/layout/Grid` |
| `TextField` | `../design-system/components/form/TextField` |
| `Select` | `../design-system/components/form/Select` |
| `Dialog` | `../design-system/components/feedback/Dialog` |
| `Alert` | `../design-system/components/feedback/Alert` |
| `Table` | `../design-system/components/display/Table` |

### Step 2: Component API Alignment
1. Identify API differences between Material UI and design system components
2. Update component usage to match design system APIs
3. Create custom hooks or utilities for any missing functionality

### Step 3: Systematic File Migration
Follow this process for each file:

1. **Analysis**: Identify all Material UI components used
2. **Import Replacement**: Replace Material UI imports with direct design system imports
3. **API Adaptation**: Update props and usage patterns to match design system APIs
4. **Theme Integration**: Replace Material UI theme usage with design system theming
5. **Testing**: Verify component rendering and functionality

## Migration Priority

### Phase 1: Core Structure (High Impact)
- [ ] ThemeProvider & Base Theme Setup
- [ ] Layout Components (Box, Grid, Stack)
- [ ] Typography System

### Phase 2: Page Components
- [ ] HomePage.jsx
- [ ] IntegrationDetailPage.jsx
- [ ] EarningsPage.jsx
- [ ] UserSettingsPage.jsx 
- [ ] TemplatesPage.jsx
- [ ] AdminDashboard.jsx

### Phase 3: Feature Components
- [ ] Integration Components (5 files)
  - [ ] IntegrationTable.jsx
  - [ ] NodePalette.jsx
  - [ ] IntegrationFlowCanvas.jsx
  - [ ] NodePropertiesPanel.jsx
  - [ ] IntegrationFlowCanvasOptimized.jsx

- [ ] Earnings Components (2 files)
  - [ ] EarningsCodeManager.jsx
  - [ ] EmployeeRosterManager.jsx

- [ ] Common Components (2 files)
  - [ ] DataTable.jsx
  - [ ] nodes/BaseNode.jsx

### Phase 4: Cleanup & Optimization
- [ ] Remove all Material UI dependencies
- [ ] Verify bundle size optimization
- [ ] Complete design system documentation

## Component API Reference

### Button
```jsx
// Material UI
<Button variant="contained" color="primary" onClick={handleClick}>Click Me</Button>

// Design System
<Button variant="primary" onClick={handleClick}>Click Me</Button>
```

### Box
```jsx
// Material UI
<Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>Content</Box>

// Design System
<Box padding="md" display="flex" alignItems="center">Content</Box>
```

### Typography
```jsx
// Material UI
<Typography variant="h4" color="primary" gutterBottom>Heading</Typography>

// Design System
<Typography variant="heading1" color="primary" marginBottom="md">Heading</Typography>
```

### Card
```jsx
// Material UI
<Card>
  <CardContent>
    <Typography>Card Content</Typography>
  </CardContent>
</Card>

// Design System
<Card>
  <Card.Content>
    <Typography>Card Content</Typography>
  </Card.Content>
</Card>
```

## Theming Integration

### Replace Material UI useTheme
```jsx
// BEFORE
import { useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  // Use theme.palette, theme.spacing, etc.
}

// AFTER
import { useTheme } from '../design-system/hooks';

function MyComponent() {
  const { theme } = useTheme();
  // Use theme.colors, theme.spacing, etc.
}
```

## Testing Strategy
1. Develop unit tests for all design system components
2. Create visual regression tests for UI consistency
3. Implement integration tests for key user flows
4. Focus testing effort on components with complex state or interactions

## Progress Tracking
- Update this document as components are migrated
- Prioritize completion of entire pages rather than individual components
- Maintain a list of any outstanding Material UI dependencies for final cleanup

## Benefits of This Approach
1. **Cleaner Codebase**: Direct imports create a more maintainable code structure
2. **Better Performance**: No wrapper overhead means better runtime performance
3. **Smaller Bundle**: Removing Material UI dependencies reduces bundle size
4. **Simplified Architecture**: Single source of truth for UI components
5. **Future-Proof**: Complete ownership of component system

## Implementation Notes

### 2023-03-23: App.jsx Migration
1. Migrated App.jsx to use design system components:
   - Replaced Material UI's Box with design system Box
   - Removed CssBaseline (no longer needed with design system)
   - Updated ThemeProvider implementation to use initialMode
   - Simplified ScrollToTop component with native useState for scroll tracking
   - Updated Box props to use direct prop assignment instead of sx
   - Removed Material UI's Zoom, Tooltip, and Fab components (not needed)

2. Implementation Decisions:
   - Used direct component imports from design system
   - Removed Material UI styling patterns (sx prop) in favor of direct props
   - Used native browser APIs for scroll handling instead of Material UI hooks
   - Kept @mui/icons-material for now (icons will be addressed in a later phase)

### 2023-03-23: HomePage.jsx Migration
1. Migrated HomePage.jsx to use design system components:
   - Replaced all BoxLegacy, GridLegacy, etc. with direct design system imports
   - Updated all styling from MUI sx prop to direct props and style objects
   - Used Grid.Container and Grid.Item pattern instead of MUI's Grid container/item
   - Replaced CardContent/CardActionArea with simpler Box-based patterns
   - Added mouse events to handle hover effects previously done with CSS
   - Updated color references to match design system color tokens

2. Implementation Decisions:
   - Used direct styling via props instead of style objects where possible
   - Simplified component hierarchy by removing unnecessary wrapper components
   - Implemented interactive behaviors with React event handlers
   - Standardized spacing using theme-based tokens (xs, sm, md, lg, xl)
   - Maintained same visual appearance while using different underlying components

### 2023-03-24: IntegrationCreationDialog.jsx Migration
1. Migrated IntegrationCreationDialog.jsx to use design system components:
   - Replaced Dialog component with design system Dialog
   - Converted Material UI styling (sx prop) to direct style objects
   - Updated form fields (TextField, Select, Box, etc.) with design system components
   - Implemented custom stepper using Box components instead of MUI Stepper
   - Created a workaround for Autocomplete using Select with multiple property
   - Implemented hover effects with onMouseOver/onMouseOut handlers
   - Used Box as="button" pattern for custom buttons

2. Implementation Decisions:
   - Wrapped child components (NotificationSettings, AzureBlobConfiguration) that still use Material UI components
   - Used direct style objects for more complex styling needs
   - Maintained the same component structure and functionality
   - Kept multi-step form navigation and validation logic unchanged
   - Added custom styling for the step indicator to match design guidelines
   - Created custom toggle buttons for creation mode selector

### 2023-03-24: ScheduleConfiguration.jsx Migration
1. Migrated ScheduleConfiguration.jsx to use design system components:
   - Replaced Material UI Grid with design system Grid.Container and Grid.Item
   - Updated Box components to use direct style objects instead of sx prop
   - Converted FormControl/InputLabel pattern to Typography-label with Select
   - Replaced IconButton with custom Box as="button" implementation
   - Created standardized form field styling with label, field, and helper text
   - Updated Typography styling for consistent look and feel

2. Implementation Decisions:
   - Kept TimePicker from Material UI due to complexity (would require custom implementation)
   - Used standard form field pattern: label Typography, field component, helper text Typography
   - Created consistent spacing with marginBottom on container elements
   - Applied consistent color tokens for text, error states, and borders
   - Added mouse events for interactive elements (buttons) instead of CSS selectors
   - Maintained same component structure to preserve all existing functionality

### 2023-03-25: NotificationSettings.jsx Migration
1. Migrated NotificationSettings.jsx to use design system components:
   - Replaced all Material UI components with design system equivalents
   - Updated Grid to Grid.Container and Grid.Item for consistent layout
   - Implemented custom checkboxes using Box as="input" for the input elements
   - Created form field pattern with Typography labels and helper text
   - Converted Dialog, DialogTitle, DialogContent, and DialogActions to use design system Dialog
   - Replaced FormControl with direct Box and Typography combination
   - Updated recipient list styling to use Box with consistent design tokens

2. Implementation Decisions:
   - Used standard form field pattern throughout all form elements
   - Implemented custom checkbox styling with consistent appearance
   - Used Box as="button" pattern for delete button with hover effects via React events
   - Leveraged design system Dialog with title and actions props pattern
   - Created consistent styling for recipient list items with standardized spacing
   - Added hover effects with onMouseOver/onMouseOut for interactive elements
   - Maintained current functionality while improving component structure

### 2023-03-25: AzureBlobConfiguration.jsx Migration
1. Migrated AzureBlobConfiguration.jsx to use design system components:
   - Replaced Material UI imports with design system equivalents
   - Updated Grid to Grid.Container and Grid.Item for consistent layout
   - Converted FormControl, InputLabel, and TextField to design system pattern
   - Implemented RadioGroup and Radio from design system for auth method selection
   - Created custom password field with toggle visibility button
   - Replaced Tooltip with title attribute for better accessibility
   - Created standardized field pattern with label, input, and helper text
   - Used consistent error display approach for form validation

2. Implementation Decisions:
   - Used consistent form field pattern: Typography label + TextField + helper Typography
   - Created custom button-like elements for visibility toggle and info icons
   - Positioned buttons absolutely within TextField container for clean layout
   - Applied consistent spacing between form elements
   - Standardized error message display with consistent styling
   - Created consistent typography styles for labels and helper text
   - Maintained all functionality while simplifying component structure
   
### 2023-03-25: FieldMappingEditor.jsx Migration
1. Migrated FieldMappingEditor.jsx to use design system components:
   - Replaced Material UI imports with design system equivalents
   - Updated Card, CardHeader, and CardContent to design system components
   - Transformed List/ListItem structure to use design system List component
   - Implemented custom Box-based chip components for required and transformation tags
   - Created custom icon button for refresh and delete actions
   - Replaced Accordion with Box-based collapsible section
   - Created custom progress indicator to replace LinearProgress
   - Implemented custom parameter input fields for transformation settings
   - Updated Dialog to use design system Dialog with title and actions

2. Implementation Decisions:
   - Used consistent form field pattern across all input fields
   - Created custom chip component that matches design system aesthetics
   - Implemented button-like elements with onMouseOver/onMouseOut handlers for hover effects
   - Used Box with relative/absolute positioning for custom UI elements
   - Created consistent spacing and typography styles throughout component
   - Used direct style objects instead of sx props for styling
   - Maintained the same data flow and validation logic while improving component structure
   - Created consistent error display pattern for form validation
   - Used Grid.Container and Grid.Item for form layout
   
### 2023-03-26: TemplateSelector.jsx Migration
1. Migrated TemplateSelector.jsx to use design system components:
   - Replaced Paper with Box for EmptyState component
   - Updated TextField to use design system component with startAdornment
   - Migrated Menu and Menu.Item for sort menu functionality
   - Converted Tabs to use design system Tabs and Tabs.Tab components
   - Updated Grid to Grid.Container and Grid.Item pattern
   - Enhanced TemplateCardSkeleton with theme-aware design
   - Implemented theme integration throughout the component
   - Migrated Pagination component to design system version

2. Implementation Decisions:
   - Used { theme } from useTheme() for consistent theming
   - Implemented hover effects with onMouseOver/onMouseOut in card components
   - Created consistent spacing with direct style objects
   - Used theme colors (theme.palette.divider, theme.palette.action.hover) instead of hardcoded colors
   - Maintained the same component structure and functionality
   - Applied direct styling via style objects instead of sx prop
   - Preserved accessibility attributes and ARIA attributes
   - Used Button with Box inside for sort menu trigger
   
### 2023-03-27: IntegrationTable.jsx Migration
1. Migrated IntegrationTable.jsx to use design system components:
   - Updated main layout containers with design system Box components
   - Converted IconButton components to Box as="button" pattern
   - Migrated Tooltip to Box with title attribute
   - Transformed Menu and MenuItem to design system Menu and Menu.Item
   - Updated Chip components to use design system Chip
   - Implemented TextField with startAdornment for search field
   - Created themed borders and backgrounds with theme.palette values
   - Applied consistent spacing throughout the component

2. Implementation Decisions:
   - Maintained VirtualizedDataTable integration without changing its structure
   - Simplified menu items using Box with flexbox for icon and text layout
   - Used consistent button styling throughout with transparent backgrounds
   - Applied direct style objects for theming and layout
   - Used theme.palette references for consistent colors and borders
   - Created icon containers with consistent sizing and styling
   - Preserved all functionality while updating component structure
   - Used Box with title for simple tooltips rather than a separate component

### 2023-03-28: NodePropertiesPanel.jsx Migration
1. Migrated NodePropertiesPanel.jsx to use design system components:
   - Created memoized form components (MemoizedTextField, MemoizedSelect, MemoizedSwitch)
   - Implemented consistent form field pattern with Typography label + field component
   - Converted Material UI MenuItem to design system Select.Option
   - Replaced IconButton with Box as="button" for the close button
   - Updated Tabs component to use Tabs.Tab pattern from design system
   - Implemented Divider using design system component
   - Created node-specific property sections with consistent styling
   - Styled form fields with proper spacing and typography
   - Implemented proper theming with useTheme hook

2. Implementation Decisions:
   - Used memo, useCallback and useMemo for optimized performance
   - Created reusable form component patterns (MemoizedTextField, MemoizedSelect, MemoizedSwitch)
   - Applied consistent spacing and typography styling across all form elements
   - Used direct style objects instead of sx prop for styling
   - Implemented proper color theming with theme.palette references
   - Used Box for layout containers with flexbox styling
   - Applied compound component pattern for Tabs (Tabs.Tab)
   - Set displayName for all memoized components for debugging
   - Created consistent styling for form sections (Common, Source, Destination, Transform)
   - Used Box as="button" pattern for interactive elements
   - Applied standard form field pattern: Typography label + field + helper Typography

## Successful Migration Patterns from NodePropertiesPanel

The NodePropertiesPanel.jsx component demonstrates several patterns that should be followed in future component migrations:

### 1. Memoized Form Components Pattern

For performance optimization and consistent form styling, create memoized wrapper components:

```jsx
const MemoizedTextField = memo(({ label, value, onChange, ...props }) => (
  <Box style={{ marginBottom: '16px' }}>
    <Typography variant="body2" style={{ marginBottom: '4px', fontWeight: 'medium' }}>
      {label}
    </Typography>
    <TextField
      fullWidth
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      size="small"
      {...props}
    />
  </Box>
));
```

These components provide:
- Consistent styling across all instances
- Simplified API for common patterns
- Performance benefits through memoization
- Clear label and field relationship
- Proper spacing and typography

### 2. Box-as-Button Pattern

For custom interactive elements like icon buttons:

```jsx
<Box
  as="button"
  onClick={onClose}
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: '4px',
    borderRadius: '4px',
    cursor: 'pointer',
  }}
  aria-label="Close panel"
>
  <CloseIcon style={{ fontSize: '18px' }} />
</Box>
```

This pattern:
- Creates accessible interactive elements
- Avoids extra components for simple buttons
- Allows for consistent styling
- Preserves proper HTML semantics
- Ensures keyboard accessibility

### 3. Direct Style Objects Pattern

Replace Material UI's sx prop with direct style objects:

```jsx
// Material UI style (avoid):
<Box sx={{ p: 2, display: 'flex', mb: 1 }}>

// Design System style (preferred):
<Box style={{ 
  padding: '16px', 
  display: 'flex', 
  marginBottom: '8px'
}}>
```

Benefits:
- No dependency on Material UI styling system
- Standard JavaScript styling
- Better IDE support for style properties
- More explicit spacing values
- No theme-based magic values

### 4. Theme Integration Pattern

Use the design system's useTheme hook for consistent styling:

```jsx
import { useTheme } from '../../design-system/foundations/theme';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <Box style={{ 
      borderBottom: `1px solid ${theme.palette.divider}`
    }}>
      {/* Component content */}
    </Box>
  );
}
```

This approach:
- Ensures theme consistency across the application
- Allows for light/dark mode support
- Provides access to all theme tokens
- Centralizes color definitions
- Supports responsive design through theme breakpoints

### 5. Component Composition Pattern

Use compound components for related UI elements:

```jsx
<Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
  <Tabs.Tab label="Properties" />
  <Tabs.Tab label="Advanced" />
</Tabs>
```

This pattern:
- Creates clearer component relationships
- Reduces prop drilling
- Simplifies component APIs
- Improves readability
- Follows modern React patterns

### 2023-03-23: IntegrationDetailPage.jsx Migration
1. Migrated IntegrationDetailPage.jsx to use design system components:
   - Replaced Material UI imports with design system components
   - Updated TabPanel component to use design system Box
   - Replaced Dialog, DialogTitle, DialogContent, DialogActions with Box-based layout
   - Simplified styling using direct props instead of sx
   - Updated color and spacing references to use design system tokens
   - Replaced Divider with Box-based divider implementation

2. Implementation Decisions:
   - Maintained the same component structure to minimize changes to logic
   - Used Box for layout containers throughout the page
   - Standardized spacing values (xs, sm, md, lg, xl)
   - Used direct positioning for dialog elements instead of relying on MUI's dialog structure
   - Retained the same visual hierarchy while implementing design system components

### 2023-03-23: IntegrationsPage.jsx Migration
1. Migrated IntegrationsPage.jsx to use design system components:
   - Replaced all Material UI legacy imports with direct design system imports
   - Updated the StatusChip component to use design system Chip
   - Completely rewrote IntegrationCard component to use design system patterns
   - Transformed Table, TableHead, TableBody, etc. to use design system Table components
   - Replaced Paper with Box for container styling
   - Implemented custom pagination instead of using TablePagination
   - Updated Dialog component to match design system patterns

2. Implementation Decisions:
   - Used Button components with variants for main actions
   - Implemented custom button-like elements using Box as="button" for icon buttons
   - Built custom menu items using Box and Typography
   - Used Grid.Container and Grid.Item pattern for the grid view
   - Implemented hover effects using onMouseOver/onMouseOut instead of CSS
   - Created a custom pagination component with Select and navigation buttons

### 2023-03-23: AdminDashboardPage.jsx Migration
1. Migrated AdminDashboardPage.jsx to use design system components:
   - Replaced all Material UI legacy imports with design system components
   - Removed custom useTheme implementation in favor of design system's useTheme hook
   - Created TabPanel component using design system Box
   - Updated Tabs component to use Tabs.Tab pattern
   - Transformed Paper components to styled Box components
   - Updated icon display to use Box as="icon" pattern

2. Implementation Decisions:
   - Used theme from design system for consistent colors and spacing
   - Created stats cards using Box components with consistent styling
   - Maintained same tab structure and behavior for consistent UX
   - Used direct props instead of sx for styling
   - Applied design tokens for colors, spacing, and shadows
   - Kept the same overall layout and structure for familiarity

## Post-Migration Tasks
1. Component documentation and examples
2. Performance benchmarking
3. Accessibility validation
4. Visual design system guide

## Migration Progress Summary (2023-03-30)

### Completed Items
1. ✅ Core UI component migrations:
   - App.jsx, HomePage.jsx, IntegrationDetailPage.jsx, IntegrationsPage.jsx, AdminDashboardPage.jsx
   - All high-priority form components (see completed Form Component Migration Checklist)
   - ThemeProvider integration and theme standardization

2. ✅ Key patterns established:
   - Direct style objects instead of Material UI's sx prop
   - Box as="button" for custom interactive elements
   - Consistent form field pattern with label Typography + field + helper
   - Compound components (Card.Header, Card.Content, Tabs.Tab)
   - Proper theming with useTheme hook

3. ✅ Migration strategies refined:
   - Memoized components for performance (memo, useCallback, useMemo)
   - Direct imports from design system paths
   - Standardized styling patterns (spacing, colors, etc.)
   - Interactive behavior through event handlers

### Next Steps (Priority Order)
1. 🔄 Remove unused Material UI dependencies
   - Audit package.json for Material UI packages that can be removed
   - Check for any remaining Material UI imports in migrated files
   - Remove unneeded dependencies and update version constraints

2. 🔄 Performance optimization
   - Measure bundle size before and after migration
   - Profile rendering performance of migrated components
   - Implement code splitting for large component trees
   - Verify that lazy loading is working correctly

3. 🔄 Testing and validation
   - Run visual regression tests on migrated components
   - Ensure all components work correctly at different screen sizes
   - Validate form submission and data handling
   - Verify accessibility compliance

4. 🔄 Documentation and examples
   - Create usage examples for design system components
   - Document migration patterns for future reference
   - Update component API documentation

### Outstanding Challenges
- Handling complex date/time picker components
- Addressing any remaining Material UI icon dependencies
- Creating a standardized theming approach for custom components
- Ensuring consistent form validation patterns

## Remaining Migration Work

After completing the initial form component migrations, we still have several components using Material UI that need to be migrated:

### High-Priority Components

1. **Complex UI Components**:
   - **IntegrationFlowCanvas.jsx** - Core application functionality with many Material UI dependencies
   - **DataTable.jsx** - Used throughout the application for data display
   - **NodePalette.jsx** - Essential for the integration flow builder

2. **Node Components**:
   - All components in `components/integration/nodes/` directory still use Material UI

3. **Common Components**:
   - 25+ basic UI components in `components/common/` directory
   - Includes StatusDisplay, VirtualizedDataTable, Timeline, etc.
   - Many of these are used across multiple pages

4. **Admin Components**:
   - 6 components in `components/admin/` directory
   - Includes AdminLayout, TenantsManager, ReleasesManager, etc.
   - Used for administrative functions and management interfaces

5. **Page Components**:
   - 8 page-level components in `pages/` directory
   - Includes HomePage, IntegrationsPage, AdminDashboardPage, etc.
   - Serve as top-level containers for application routes

### Material UI Component Usage Analysis

Our dependency scan revealed the following Material UI components still in use:

#### Layout Components:
- Box
- Grid
- Paper
- Stack
- Divider

#### Input Components:
- TextField
- Select
- Checkbox
- Switch
- Autocomplete

#### Navigation Components:
- Tabs
- Menu
- Drawer

#### Feedback Components:
- Dialog
- Alert
- Snackbar
- CircularProgress

#### Data Display Components:
- Typography
- Chip
- Tooltip
- Table components (TableHead, TableBody, TableRow, TableCell, TablePagination)

### Dependency Removal Roadmap

#### Phase 1: High-Impact Component Migration
1. **IntegrationFlowCanvas.jsx**:
   - Break down into smaller components
   - Migrate each section to design system components
   - Create custom design system alternatives for SpeedDial, Popper, etc.

2. **DataTable.jsx**:
   - Implement design system Table components
   - Migrate pagination and sorting functionality
   - Replace Toolbar and related components

#### Phase 2: Node Components Migration
1. Migrate base node components:
   - BaseNode.jsx
   - SourceNode.jsx
   - DestinationNode.jsx
   - TransformNode.jsx
   - TriggerNode.jsx

2. Create shared styling and behavior patterns for node components

#### Phase 3: Common Components
1. Migrate common components (first batch):
   - StatusDisplay.jsx
   - VirtualizedDataTable.jsx
   - Timeline.jsx
   - ProgressBar.jsx
   - KeyboardShortcutsHelp.jsx
   - Navigation.jsx
   - PageLayout.jsx

2. Migrate common components (second batch):
   - SearchBar.jsx
   - SearchFilterPanel.jsx
   - FilterBuilder.jsx
   - PortalModal.jsx
   - PerformanceMetricsDisplay.jsx
   - PageHeader.jsx
   - Logo.jsx

3. Migrate common components (third batch):
   - IntegrationStatsBar.jsx
   - IntegrationHealthBar.jsx
   - InputField.jsx
   - Footer.jsx
   - DashboardCard.jsx
   - ChatSupportPanel.jsx
   - CachingDemo.jsx

4. Migrate common components (fourth batch):
   - NotificationCenter.jsx
   - Toast.jsx
   - ToastContainer.jsx
   - OptimizedToast.jsx
   - ResourceLoader.jsx
   - UserProfile.jsx
   - AccessibilityReport.jsx
   - AccessibilityTester.jsx
   - ErrorBoundary.jsx

#### Phase 4: Admin and Page Components
1. Migrate admin components:
   - AdminLayout.jsx
   - ReleasesManager.jsx
   - TemplatesManager.jsx
   - TenantsManager.jsx
   - ApplicationsManager.jsx
   - DatasetsManager.jsx

2. Migrate page components (COMPLETED):
   - AdminDashboard.jsx
   - AdminDashboardPage.jsx
   - TemplatesPage.jsx
   - UserSettingsPage.jsx
   - EarningsPage.jsx
   - HomePage.jsx
   - IntegrationDetailPage.jsx
   - IntegrationsPage.jsx

#### Phase 5: Final Cleanup and Dependency Removal
1. **Material UI Dependency Removal**:
   - Run final dependency analysis to identify any remaining usages of `@mui/material`
   - Complete migration of any remaining components
   - Remove `@mui/material` dependency

2. **Icons Migration**:
   - The `@mui/icons-material` package is still used in numerous components
   - Create an icon abstraction layer or directly map to SVG files
   - Consider keeping Material UI icons temporarily if needed for quick delivery

3. **Emotion Packages Removal**:
   - Remove `@emotion/react` and `@emotion/styled` after Material UI is fully removed

4. **Bundle Size Analysis**:
   ```bash
   npm run analyze
   ```
   - Measure bundle size improvements from the migration
   - Identify any remaining Material UI code
   - Document performance gains

### Weekly Migration Targets

| Week | Components | Estimated Effort | Status |
|------|------------|------------------|--------|
| 1    | IntegrationFlowCanvas.jsx | High (3-4 days) | ✅ Complete |
| 2    | DataTable.jsx, NodePalette.jsx | Medium (2-3 days) | ✅ Complete |
| 3    | Node Components (5-6 files) | Medium (2-3 days) | ✅ Complete |
| 4    | Common Components (10-12 files) | High (4-5 days) | 🔄 In Progress |
| 5    | Common Components (8-10 files) | Medium (3-4 days) | 📅 Planned |
| 6    | Common Components (9 files) | Medium (2-3 days) | 📅 Planned |
| 7    | Admin Components (6 files) | Medium (2-3 days) | ✅ Complete |
| 8    | Page Components (8 files) | Medium (3-4 days) | ✅ Complete |
| 9    | Final cleanup, testing, and dependency removal | Medium (2-3 days) | 📅 Planned |

### Testing Strategy for Migrated Components

1. **Unit Tests**:
   - Create component-specific tests for each migrated component
   - Verify rendering, interactivity, and props behavior

2. **Visual Regression Tests**:
   - Use Percy or similar tool to compare visual appearance before and after migration
   - Ensure consistent UI across browsers and screen sizes

3. **Integration Tests**:
   - Test component interactions within the application flow
   - Verify data flow and state management

4. **Accessibility Tests**:
   - Ensure all migrated components meet accessibility standards
   - Run automated a11y tests with Jest-axe

### 2023-03-28: IntegrationBuilder.jsx Migration
1. Migrated IntegrationBuilder.jsx to use design system components:
   - Replaced all Material UI Box components with design system Box
   - Updated styling from sx prop to direct style objects
   - Converted Drawer component styling to use PaperProps with style objects
   - Implemented proper theme integration with useTheme hook
   - Added theme fallbacks for colors and styling properties
   - Updated IconButton styling to use direct style objects
   - Standardized styling for layout containers and panels
   - Migrated Toolbar component to use direct style props

2. Implementation Decisions:
   - Maintained ReactFlow integration without changes to its API
   - Added theme variable support with fallbacks to MUI theme for compatibility
   - Used consistent padding and margin values derived from the theme
   - Leveraged Box component's flexbox capabilities for layout
   - Added proper border styling with theme colors
   - Implemented responsive layout with themed transitions
   - Maintained component functionality while migrating styling approach

### 2023-03-28: ValidationPanel.jsx Migration
1. Migrated ValidationPanel.jsx to use design system components:
   - Replaced Material UI Box components with design system Box
   - Updated Typography to use design system component
   - Converted ButtonLegacy to design system Button
   - Migrated AlertLegacy to design system Alert
   - Implemented Chip with design system component
   - Updated TextField to use design system version
   - Implemented design system CircularProgress
   - Added theme integration with useTheme hook and MUI theme fallbacks

2. Implementation Decisions:
   - Used theme tokens with fallbacks (theme.colors?.divider || muiTheme.palette.divider)
   - Implemented Box-as-button pattern for IconButton replacements
   - Maintained list functionality with Material UI components while updating styling
   - Converted sx style props to direct style objects with explicit values
   - Created consistent styling patterns for borders, padding, and margins
   - Used semantic color tokens for alerts, buttons, and status indicators
   - Retained tabs and list functionality due to complex interaction patterns
   - Implemented custom divider using Box with appropriate styling

### 2023-03-28: DataPreviewPanel.jsx Migration
1. Migrated DataPreviewPanel.jsx to use design system components:
   - Replaced Material UI Box components with design system Box throughout
   - Updated Typography to use design system component with appropriate styling
   - Converted Button elements to design system Button
   - Updated TextField to use design system version
   - Implemented theme integration with useTheme hooks
   - Added JSON formatter with theme awareness
   - Updated Chip components with design system styling
   - Used Box-as-button pattern for icon actions

2. Implementation Decisions:
   - Applied consistent theme token usage with MUI fallbacks
   - Created accessible button alternatives with Box as="button" pattern
   - Used direct style objects rather than sx props for all components
   - Added semantic color values for interactive elements (hover, active, disabled states)
   - Maintained complex table functionality from Material UI while updating styling
   - Applied consistent spacing, typography, and border styling
   - Preserved component functionality while simplifying the styling approach
   - Created reusable patterns for headers, tabs, and panels
   
### 2023-03-28: VisualFieldMapper.jsx Migration
1. Migrated VisualFieldMapper.jsx to use design system components:
   - Replaced Material UI Box components with design system Box throughout
   - Updated Paper components to use design system Box with appropriate styling
   - Replaced Material UI sx prop styling with direct style objects
   - Updated Typography to use design system component with consistent styling
   - Converted Button elements to design system Button
   - Migrated TextField components to design system versions
   - Updated Alert components to use design system Alert
   - Implemented Chip components with design system props
   - Used Box-as-button pattern for IconButton replacements
   - Implemented CircularProgress from design system for loading states
   - Applied consistent theming with theme.colors fallbacks to muiTheme

2. Implementation Decisions:
   - Maintained List and Dialog from Material UI due to complex interaction patterns
   - Used theme integration with both design system themes and Material UI fallbacks
   - Created consistent and accessible button patterns with proper icon alignment
   - Applied semantic spacing and color values throughout component
   - Preserved drag-and-drop functionality while updating container styling
   - Maintained complex mapping visualization with consistent styling
   - Created consistent card-like containers with proper shadows and rounded corners
   - Used direct props instead of sx for styling with explicit values
   - Applied Box as="ul" and as="li" patterns for semantic HTML lists
   
### 2023-03-28: ContextualPropertiesPanel.jsx Migration
1. Migrated ContextualPropertiesPanel.jsx to use design system components:
   - Migrated memoized form components (MemoTextField, MemoSelect, MemoSwitch) to use design system
   - Updated helper components (ValidationMessage, FieldRow, SchemaViewer, SectionTitle) with consistent styling
   - Converted all Material UI Box instances to design system Box with direct style objects
   - Migrated Typography components to design system versions with proper theming
   - Implemented design system Button components for actions and form controls
   - Converted IconButton to Box as="button" pattern for better accessibility
   - Updated Alert components to use design system variants
   - Applied proper theming using theme context with Material UI fallbacks
   - Transformed all sx prop styling to direct style objects
   - Maintained layout and organization of the complex properties panel

2. Implementation Decisions:
   - Kept Material UI Dialog, Tabs, and List components due to complex interaction requirements
   - Used theme integration pattern with fallbacks: theme.colors?.primary?.main || muiTheme.palette.primary.main
   - Implemented Select component with options transformation from MenuItems
   - Created consistent spacing and typography styles across the entire component
   - Preserved all functionality while simplifying component structure
   - Maintained nested memo patterns for performance optimization
   - Used Box-as-button for all icon buttons and interactive elements
   - Applied design system color palette with semantic colors for statuses
   - Created a consistent connection status component with proper status indicators
   - Preserved all node-specific property forms while updating their styling
   
### 2023-03-28: RunLogViewer.jsx Migration
1. Migrated RunLogViewer.jsx to use design system components:
   - Replaced Material UI Box components with design system Box throughout
   - Updated Button components to design system versions with appropriate variants
   - Migrated Typography components to use design system implementation
   - Converted TextField to design system version with proper styling
   - Updated Chip components to design system versions
   - Replaced IconButtons with the Box as="button" pattern for better accessibility
   - Migrated StatusDisplay component to use design system components
   - Implemented CircularProgress from design system
   - Applied consistent theme styling with Material UI fallbacks
   - Maintained display logic and component structure

2. Implementation Decisions:
   - Kept Material UI Table-related components (Table, TableHead, TableBody, etc.) due to complexity
   - Maintained Card, CardHeader, and CardContent from Material UI for consistent styling
   - Preserved Dialog, Grid, and Fade for interactive functionality
   - Used theme integration with design system themes and Material UI fallbacks
   - Added semantic colorization for status chips and alerts
   - Applied direct style objects instead of sx props throughout
   - Used Box as="button" pattern for action buttons
   - Created consistent dialog styling with proper layout and spacing
   - Preserved filter functionality while updating component styling
   - Updated the StatusDisplay component to use design system layout patterns
   
### 2023-03-28: TemplateLibrary.jsx Migration
1. Migrated TemplateLibrary.jsx to use design system components:
   - Updated component imports to use design system components where available
   - Changed typography variants to use design system Typography
   - Migrated Box components from BoxLegacy to design system Box
   - Updated Button components to use design system Button
   - Converted Grid to Grid.Container and Grid.Item pattern
   - Implemented design system Card for template containers
   - Updated Stack component to use design system version
   - Migrated TextField to use design system implementation
   - Replaced Paper with styled Box components
   - Converted IconButton to Box as="button" pattern
   - Implemented design system Tabs and Tabs.Tab components
   - Updated Alert to use design system version
   - Applied consistent theming with theme fallbacks throughout

2. Implementation Decisions:
   - Kept CardContent, CardActionArea, CardMedia legacy components due to complexity
   - Maintained MenuItem for Select options while updating their styling
   - Used consistent theme integration pattern with fallbacks
   - Applied direct style objects instead of sx props across all components
   - Created Box-as-button pattern for icon buttons to improve accessibility
   - Preserved existing component structure while updating styling
   - Implemented consistent spacing and typography styles
   - Used both design system theme and Material UI theme for fallbacks
   - Created responsive layout with theme-aware styling
   - Maintained component functionality while improving layout
   - Updated helper components (FeaturedTemplatesCarousel, EmptyState, TemplateCardSkeleton)
   - Used semantic color tokens from theme for consistent styling
   - Added shadows and border styling with theme values
   - Preserved user interaction patterns while updating component implementation

### 2023-03-28: TemplateCard.jsx Migration
1. Migrated TemplateCard.jsx to use design system components:
   - Updated component imports to use design system components
   - Replaced BoxLegacy with design system Box
   - Updated TypographyLegacy with design system Typography
   - Migrated CardLegacy to design system Card
   - Converted ChipLegacy to design system Chip
   - Replaced IconButtonLegacy with Box as="button" pattern
   - Updated theme integration to use both design system and MUI themes
   - Replaced static hover effects with dynamic React event handlers
   - Updated styling of template type indicator with design system Chip
   - Implemented consistent tag display with design system Chip
   - Styled template card preview with proper theme colors
   - Applied consistent spacing throughout the component
   - Used semantic color tokens for status indicators
   - Migrated stars/icons to use theme-aware styling

2. Implementation Decisions:
   - Kept CardActionArea, CardContent, CardMedia legacy components due to complexity
   - Used theme integration pattern with fallbacks to MUI theme
   - Implemented hover effects with onMouseOver/onMouseOut event handlers
   - Applied direct style objects instead of sx props throughout the component
   - Used Box as="button" pattern for icon buttons to improve accessibility
   - Maintained consistent styling with other card components in the application
   - Created semantic typography with proper color theming
   - Used structured layout with consistent spacing values
   - Applied overflow handling for text truncation with ellipsis
   - Maintained star indicators (featured, starred) with proper theming
   - Implemented template tags using design system Chip components
   - Used modern typography styling with proper weight and color theming
   - Created visual hierarchy with spacing, typography and color
   - Retained all interactive features and hover states

### 2023-03-28: TemplateDetailView.jsx Migration
1. Migrated TemplateDetailView.jsx to use design system components:
   - Updated Dialog, DialogTitle, DialogContent, and DialogActions with design system styling
   - Replaced IconButton components with Box as="button" pattern for better accessibility
   - Transformed Tooltip to Box with title attribute
   - Updated Grid containers to Grid.Container and Grid.Item
   - Replaced Paper components with styled Box containers
   - Migrated all Material UI Tabs to design system Tabs.Tab
   - Converted Button components to use design system variants
   - Implemented proper theme integration with useTheme hook
   - Added theme fallbacks for all colors, spacing, and other styles
   - Transformed sx prop styling to direct style objects
   - Updated tab panel structure with proper ARIA attributes
   - Styled template metadata with proper spacing and colors
   - Updated Divider to use a Box with height and background color

2. Implementation Decisions:
   - Used theme integration pattern with fallbacks: theme.colors?.primary?.main || muiTheme.palette.primary.main
   - Created consistent Box-as-button pattern for all action buttons
   - Implemented hover effects with onMouseOver/onMouseOut handlers
   - Applied direct style objects with explicit values
   - Used design system Tabs with Tabs.Tab pattern
   - Maintained consistent spacing throughout all sections
   - Created proper DialogActions styling with standard button patterns
   - Applied semantic color tokens for different template states (featured, public/private)
   - Used Box with flexbox for icon and text layout in buttons
   - Created consistent card-like containers with standardized styling
   - Used semantic colors for different status indicators
   - Preserved all accessibility features with proper ARIA attributes
   - Maintained core dialog structure while updating styling approach
   - Created visual hierarchy with consistent spacing, typography and color
   - Styled tab panels with consistent layout patterns

### 2023-03-28: TemplateEditDialog.jsx Migration
1. Migrated TemplateEditDialog.jsx to use design system components:
   - Kept legacy Dialog, DialogTitle, DialogContent, and DialogActions components due to complex functionality
   - Updated their styling with direct style objects instead of sx props
   - Replaced BoxLegacy with design system Box throughout the component
   - Converted Typography components to design system versions
   - Migrated Button components to use design system variants with proper styling
   - Replaced TextField components with design system versions
   - Updated nested Grid components to Grid.Container and Grid.Item pattern
   - Migrated Alert to design system component
   - Updated Chip component to design system version
   - Replaced IconButton with Box as="button" pattern for close button
   - Created custom hover effects for interactive elements with onMouseOver/onMouseOut
   - Applied proper theme integration for all styled components
   - Added proper spacing and consistent styling for form elements
   - Maintained the form structure while updating components

2. Implementation Decisions:
   - Kept legacy components for complex functionality (Autocomplete, FormControlLabel, Switch)
   - Used theme integration pattern with fallback mechanism
   - Applied direct style objects with explicit values instead of sx prop
   - Implemented Box as="button" pattern for custom buttons
   - Created consistent spacing for form elements
   - Used semantic color tokens throughout the component
   - Maintained accessibility attributes and proper ARIA labeling
   - Preserved form validation and error handling
   - Used nested Grid.Container and Grid.Item for layout
   - Created themed borders and backgrounds using theme colors
   - Applied consistent typography styles with proper hierarchy
   - Created custom dividers and separators with Box components
   - Implemented proper button styling with new variants
   - Used flexbox layout for button content alignment

### 2023-03-28: TemplateShareDialog.jsx Migration
1. Migrated TemplateShareDialog.jsx to use design system components:
   - Replaced PaperLegacy components with styled Box components
   - Updated AvatarLegacy components to use design system Avatar
   - Maintained complex legacy components (Dialog, DialogTitle, Autocomplete, etc.)
   - Used Box as="button" pattern for interactive elements (close button, delete button)
   - Implemented hover effects with onMouseOver/onMouseOut event handlers
   - Applied consistent theming with theme integration and Material UI fallbacks
   - Used design system Button components with proper variants
   - Updated Typography components with direct styling
   - Applied consistent spacing throughout the component
   - Maintained Chip components from design system for permission levels
   - Created consistent layouts for permission settings and notification forms
   - Used design system CircularProgress for loading states
   - Implemented proper theme tokens for colors, borders and backgrounds

2. Implementation Decisions:
   - Kept legacy components for complex functionality (Dialog, Autocomplete, FormControl)
   - Created consistent card-like containers using Box with styled borders and backgrounds
   - Used theme integration pattern with fallbacks (theme.colors?.primary?.main || muiTheme.palette.primary.main)
   - Applied semantic color tokens for different states (success, error, hover)
   - Maintained proper ARIA attributes for accessibility 
   - Created custom dividers using Box with height and background color
   - Used Grid.Container and Grid.Item for responsive layouts
   - Implemented direct style objects instead of sx props
   - Maintained consistent visual hierarchy with typography styles
   - Applied flexbox layouts for alignment and spacing
   - Used consistent borders and border-radius for UI elements
   - Created interactive elements with Box as="button" pattern
   - Applied theme-aware styling for backgrounds with alpha transparency

### 2023-03-28: SaveAsTemplateButton.jsx Migration
1. Migrated SaveAsTemplateButton.jsx to use design system components:
   - Replaced Material UI Button with design system Button
   - Replaced Material UI IconButton with Box as="button" pattern
   - Updated theme handling to use design system's useTheme and fallbacks to MUI theme
   - Created custom styling for the icon button version using direct style objects
   - Improved button content alignment with flexbox layout in Button component
   - Implemented hover effects with onMouseOver/onMouseOut event handlers
   - Maintained proper accessibility with aria-label and title attributes
   - Created consistent sizing for button variants (small, medium, large)
   - Applied proper icon sizing based on button size
   - Used theme colors for button styling with fallbacks to Material UI theme

2. Implementation Decisions:
   - Used Box as="button" pattern for the icon button version
   - Applied direct style objects instead of sx props
   - Created custom hover effects using event handlers instead of CSS selectors
   - Implemented a flexbox layout for button content alignment
   - Preserved all button variants and sizes from the original component
   - Used theme integration pattern with fallbacks to Material UI theme
   - Maintained consistent spacing and icon sizing
   - Applied proper accessibility attributes (aria-label, title)
   - Preserved all functionality while updating component structure
   - Created responsive sizing based on the size prop

### 2023-03-28: SaveAsTemplateDialog.jsx Migration (Started)
1. Started migrating SaveAsTemplateDialog.jsx to use design system components:
   - Added design system imports (Box, Typography, Button, etc.)
   - Updated theme handling to use design system's useTheme and MUI theme fallbacks
   - Began migrating dialog title section to use design system components
   - Replaced IconButton with Box as="button" pattern for close button
   - Implemented hover effects with onMouseOver/onMouseOut for close button
   - Updated content description to use design system Box and Typography
   - Converted sx props to direct style objects with explicit values
   - Began updating styling with theme-aware values and fallbacks

2. Implementation Decisions:
   - Kept DialogLegacy component due to complexity of dialog functionality
   - Used consistency for title, styling, and close button with other template dialogs
   - Implemented Box as="button" pattern for interactive elements
   - Applied direct style objects instead of sx props
   - Added proper theme integration with fallbacks to Material UI
   - Created hover effects with event handlers instead of CSS selectors
   - Applied consistent padding and spacing values
   - Maintained proper ARIA attributes for accessibility
   - Preserved functionality while updating component structure
   
### 2023-03-28: EarningsCodeManager.jsx Migration
1. Migrated EarningsCodeManager.jsx to use design system components:
   - Updated imports to use design system components (Box, Typography, Button, etc.)
   - Added theme handling with useTheme and Material UI theme fallbacks
   - Updated main container and header styling with direct style objects
   - Replaced Button with design system Button using flexbox layout for icon and text
   - Updated Alert component to use design system version
   - Converted Select filter to use SelectLegacy with standard styling
   - Updated Table components to use TableLegacy versions with consistent styling
   - Converted Dialog components to DialogLegacy with design system styling
   - Replaced Grid with Grid.Container and Grid.Item pattern
   - Updated form fields to use design system TextField
   - Maintained Chip component consistency with design system styling
   - Updated typography and spacing with consistent values
   - Added proper border styling with theme-aware colors

2. Implementation Decisions:
   - Used design system components for high-level containers (Box, Typography, Button, etc.)
   - Kept Legacy components for complex UI elements (Table, Dialog, Select, etc.)
   - Applied direct style objects instead of sx props
   - Used theme integration pattern with fallbacks: theme.colors?.divider || muiTheme.palette.divider
   - Created consistent dialog styling with proper header, content, and actions
   - Maintained dialog border-radius and overflow handling
   - Implemented consistent button styling with flexbox layout for icon and text
   - Used proper spacing values throughout the component
   - Added proper border and divider styling in dialog components
   - Maintained Chip styling consistent with design system
   - Created proper form layout with Grid.Container and Grid.Item
   - Preserved all functionality while updating styling approach

### 2023-03-29: EarningsMapEditor.jsx Migration
1. Migrated EarningsMapEditor.jsx to use design system components:
   - Updated imports to use design system components (Box, Typography, Button, Chip, etc.)
   - Added theme handling with useTheme and Material UI theme fallbacks
   - Replaced Material UI IconButton with Box as="button" pattern for better accessibility
   - Updated alert styling to use design system Alert component
   - Converted all sx prop styling to direct style objects with explicit values
   - Replaced Paper with styled Box components with proper theme-aware styling
   - Updated Button components to design system variants (primary, secondary, danger)
   - Implemented custom dividers using Box with positioned elements
   - Created custom hover effects with onMouseOver/onMouseOut handlers for icon buttons
   - Improved dialog styling with consistent rounded corners and proper overflow
   - Used design system Chip components for status indicators
   - Enhanced test dialog UI with consistent styling and layout
   - Applied proper theme tokens for colors, borders, and backgrounds

2. Implementation Decisions:
   - Kept complex components (Table, Dialog, Tabs) as Legacy versions
   - Used theme integration pattern with fallbacks for all themed values
   - Created accessible button alternatives with Box as="button" pattern
   - Implemented consistent spacing values throughout (8px, 16px, 24px, 32px)
   - Applied direct style objects instead of sx props with explicit values
   - Used flexbox layouts for alignment and content positioning
   - Created custom dividers with positioned elements for section headings
   - Simplified dialog styling with consistent PaperProps for rounded corners
   - Enhanced Button components with flexbox layout for icon and text alignment
   - Applied consistent border styling with theme-aware colors
   - Used semantic color tokens for status indicators (success, error, etc.)
   - Maintained proper accessibility with ARIA labels and title attributes
   - Preserved all functionality while updating component styling
   
### 2023-03-29: EmployeeManager.jsx Migration
1. Migrated EmployeeManager.jsx to use design system components:
   - Updated imports to use design system components (Box, Typography, Button, Chip, etc.)
   - Added theme handling with useTheme and Material UI theme fallbacks
   - Replaced Material UI IconButton with Box as="button" pattern for action buttons
   - Converted all sx prop styling to direct style objects with explicit values
   - Updated dialog styling with consistent rounded corners using PaperProps
   - Created custom divider for section headers using positioned Box elements
   - Implemented enhanced button styling with appropriate variants and flexbox alignment
   - Updated placeholder content areas with theme-aware styled Box components
   - Improved confirmation dialog layout and styling with consistent button placement
   - Used appropriate spacing values (8px, 16px, 24px, 32px) for consistent layout
   - Enhanced CircularProgress components with appropriate sizing
   - Implemented proper alert styling with consistent margins
   - Applied theme tokens for colors, borders, shadows, and backgrounds

2. Implementation Decisions:
   - Used design system components for high-level containers (Box, Typography, Button, etc.)
   - Kept complex components (Table, Dialog, Grid, etc.) as Legacy versions
   - Implemented hover effects with onMouseOver/onMouseOut event handlers
   - Created accessible custom buttons with Box as="button" pattern and ARIA attributes
   - Applied consistent styling for all dialogs with standardized PaperProps
   - Used theme integration pattern with fallbacks to Material UI theme
   - Created consistent button variants (primary, secondary, danger) for clear action hierarchy
   - Maintained consistent button styling with flexbox layout for icon and text
   - Used proper spacing values throughout the component
   - Created visual hierarchies with typography styles, spacing, and color
   - Applied proper styling for empty states and loading indicators
   - Preserved component functionality while updating styling approach

### 2023-03-29: EmployeeRosterManager.jsx Migration
1. Migrated EmployeeRosterManager.jsx to use design system components:
   - Updated imports to use design system components (Box, Typography, Button, Chip, etc.)
   - Added theme handling with useTheme and Material UI theme fallbacks
   - Replaced IconButton components with Box as="button" pattern for table actions
   - Added proper hover effects with onMouseOver/onMouseOut handlers
   - Applied theme-aware styling with fallbacks to Material UI theme values
   - Updated dialog styling with consistent rounded corners using PaperProps
   - Converted all sx prop styling to direct style objects with explicit values
   - Enhanced button styling with appropriate variants and consistent layout
   - Improved disabled state handling with appropriate color and cursor styles
   - Applied semantic button variants (primary, secondary, danger) for clear action hierarchy
   - Enhanced ResourceLoader display with properly styled action buttons
   - Added proper spacing values throughout the component for consistent layout
   - Improved confirmation dialog with consistent button placement and styling

2. Implementation Decisions:
   - Used design system components for container elements (Box, Typography, Button, etc.)
   - Kept complex components (Table, Dialog, ResourceLoader) as Legacy versions
   - Created accessible custom buttons with Box as="button" pattern and ARIA attributes
   - Applied title and aria-label attributes to all interactive elements
   - Used consistent dialog styling with standardized PaperProps for rounded corners
   - Implemented theme integration pattern with fallbacks for all themed values
   - Created semantic button variants with appropriate color tokens
   - Used flexbox layout for button content alignment with consistent icon placement
   - Applied proper spacing values for margins and padding (8px, 16px, 24px)
   - Created visual hierarchy with typography, color, and spacing
   - Enhanced disabled state handling with proper feedback for user interactions
   - Preserved all component functionality while updating the styling approach
   
### 2023-03-29: AdminLayout.jsx Migration
1. Migrated AdminLayout.jsx to use design system components:
   - Updated imports to use design system components (Box, Typography, Breadcrumbs)
   - Implemented useTheme hook from design system for theme access
   - Converted Material UI's Box to design system Box
   - Updated Typography to use design system variants (heading1, heading2, body1, etc.)
   - Replaced sx prop styling with direct style objects throughout
   - Created theme-aware styling with fallbacks to Material UI theme
   - Updated breadcrumbs to use design system pattern with proper styling
   - Implemented mobile-friendly drawer navigation with responsive styling
   - Used Box as="button" pattern for icon buttons instead of IconButton
   - Applied consistent spacing tokens throughout the layout
   - Enhanced theme integration with proper fallbacks for colors, borders, and backgrounds
   - Improved accessibility with appropriate ARIA labels and attributes

2. Implementation Decisions:
   - Kept complex MUI components (Drawer, List, ListItemButton) to preserve functionality
   - Used style properties directly instead of sx props for styling
   - Created theme-aware colors with fallbacks (theme?.colors?.divider || '#e0e0e0')
   - Implemented consistent spacing values (8px, 16px, 24px, 32px)
   - Used semantic typography variants for proper heading hierarchy
   - Used custom media query for responsive behavior
   - Applied flexbox layout for alignment and positioning
   - Enhanced accessible navigation with proper role attributes
   - Maintained existing component structure to minimize functional changes
   - Used explicit dimensions for responsive layouts
   - Applied consistent styling for active/selected states
   - Enhanced visual hierarchy with typography, colors, and spacing

### 2023-03-29: ReleasesManager.jsx Migration (Partial)
1. Started migrating ReleasesManager.jsx to use design system components:
   - Updated imports to use design system components (Box, Typography, Button, etc.)
   - Added theme handling with useTheme and Material UI theme fallbacks
   - Replaced Material UI Box with design system Box
   - Converted Typography to use design system variants
   - Replaced Material UI buttons with design system variants
   - Updated TextField with design system component
   - Converted IconButton to Box as="button" pattern for action buttons
   - Applied theme-aware styling with fallbacks to Material UI theme
   - Updated styling from sx prop to direct style objects
   - Used proper spacing values (8px, 16px, 24px) consistently
   - Enhanced chip styling with theme-aware colors
   - Improved table layout with proper spacing and accessibility
   - Added responsive styling with appropriate sizing
   
2. Implementation Decisions:
   - Kept complex Material UI components (Table, Dialog, Stepper) for now
   - Used Box as="button" pattern for icon buttons with proper accessibility
   - Implemented theme integration with fallbacks throughout
   - Applied consistent spacing tokens instead of arbitrary values
   - Used semantic color tokens for status indicators
   - Created accessible buttons with proper ARIA labels
   - Enhanced visual hierarchy with typography and spacing
   - Added hover effects for interactive elements
   - Used flexbox layout for alignment and positioning
   - Applied consistent styling for action buttons
   - Used theme-aware styling for colors and borders
   - Maintained existing component structure to preserve functionality

### 2023-03-30: ApplicationsManager.jsx Migration
1. Migrated ApplicationsManager.jsx to use design system components:
   - Updated imports to use design system components (Box, Typography, Button, etc.)
   - Fully migrated TabPanel component to use design system Box
   - Converted Material UI Table to design system Table with compound components
   - Replaced IconButton with Box as="button" pattern for all action buttons
   - Migrated all form fields to use design system patterns with Typography labels
   - Updated Dialog components to design system Dialogs with compound pattern
   - Applied theme-aware styling with consistent spacing values throughout
   - Enhanced all Dialogs with proper title, content, and action components
   - Transformed Tooltip components to Box with title attributes
   - Improved form field layout with consistent label and input patterns
   - Enhanced accessibility with proper ARIA labels and attributes
   - Migrated all Tabs to design system compound components (Tabs.Tab)
   - Created consistent tenants list with Box-based layout replacing List/ListItem
   - Enhanced schema discovery dialog with proper field type display
   - Updated chip components to use design system styling

2. Implementation Decisions:
   - Used design system Box component extensively for layout containers
   - Applied direct style properties instead of sx props for all styling
   - Created accessible button patterns with Box as="button" for all icon actions
   - Implemented consistent form field pattern with label + input + helper
   - Enhanced dialog styling with compound components patterns
   - Applied consistent spacing values (8px, 16px, 24px, 32px) throughout
   - Used theme-based color values with Material UI fallbacks when needed
   - Created proper visual hierarchy with typography, spacing, and color
   - Enhanced status indicators with semantic color tokens
   - Improved interaction patterns with hover effects via event handlers
   - Transformed List/ListItem patterns to Box-based layouts for better control
   - Used Grid.Container and Grid.Item pattern for consistent grid layouts
   - Applied compound component pattern for both Table and Tabs components
   - Enhanced all dialogs with consistent button placement and styling
   - Maintained existing functionality while updating component structure

### 2023-03-23: DatasetsManager.jsx Migration
1. Migrated DatasetsManager.jsx to use design system components:
   - Updated imports to use design system components (Box, Typography, Button, etc.)
   - Consolidated imports for better code organization
   - Converted Material UI Table to design system Table with compound components pattern
   - Replaced IconButton with Box as="button" pattern for all action buttons
   - Migrated all dialogs to use design system Dialog with title and actions props
   - Updated all form fields to design system pattern with Typography label + field component
   - Applied theme-aware styling with Material UI theme fallbacks
   - Updated Tabs to use design system Tabs.Tab compound components
   - Transformed all dialogues (Create/Edit and Dataset Detail) to use design system patterns
   - Enhanced Used By tab with Box-based layout replacing Accordion/List/ListItem
   - Transformed Tenants tab to use Box-based layout replacing List/ListItem/IconButton
   - Applied consistent spacing values throughout (8px, 16px, 24px, 32px)
   - Created custom dividers using Box with height and color styling
   - Improved accessibility with proper ARIA labels and attributes
   - Enhanced all status indicators with semantic color tokens

2. Implementation Decisions:
   - Used design system Box component extensively for layout containers
   - Replaced all Material UI components with design system equivalents
   - Created accessible interactive elements with Box as="button" pattern
   - Used direct style properties instead of sx props for all styling
   - Applied theme-based styling with fallbacks (theme?.colors?.primary?.main || '#1976d2')
   - Implemented compound component patterns for both Table and Tabs
   - Created consistent form field patterns with label Typography + field + helper text
   - Enhanced dialog styling with title and actions props pattern
   - Simplified complex UI elements with Box-based layouts
   - Created custom accordions using Box with flexbox layout
   - Applied consistent button styling with flexbox for icon and text alignment
   - Used consistent card styling for all container elements
   - Enhanced tenant list with Box-based layout and theme-aware styling
   - Created visual hierarchy with consistent typography, spacing, and color
   - Improved all hover effects using onMouseOver/onMouseOut event handlers

### 2023-03-23: AccessibilityReport.jsx Migration
1. Migrated AccessibilityReport.jsx to use design system components:
   - Replaced Material UI imports with design system components
   - Converted Material UI's Paper component to design system Card
   - Updated Box usage with theme-aware styling
   - Transformed sx prop styling to direct style objects
   - Migrated Typography to design system with theme-aware styling
   - Updated Button components with theme-aware styling and startElement for icons
   - Replaced TableContainer/TableHead/TableRow/TableCell with Table compound components (Table.Container, Table.Head, Table.Row, Table.Cell)
   - Replaced alpha function with custom RGBA calculations and lightenColor utility function
   - Migrated Tabs and Tab components to design system Tabs.Tab pattern
   - Completely transformed the TabPanel component to use design system pattern
   - Updated all layouts to be fully responsive using isMobile state
   - Created consistent theme-aware styling for compliance score section 
   - Updated severity chip component to use design system Chip
   - Enhanced node preview component with accessible code display
   - Created consistent theme usage with fallbacks throughout

2. Implementation Decisions:
   - Added a responsive approach with useEffect to track window resizing
   - Created consistent theme usage with (theme?.colors?.primary?.main || '#defaultColor') pattern
   - Used CSS Grid for complex layouts instead of Material UI Grid
   - Implemented Box as="button" for icon buttons with proper accessibility 
   - Transformed Box as="pre" for code display with proper syntax highlighting
   - Applied a consistent spacing pattern using theme?.spacing values
   - Enhanced table layout with compound component Table.Head, Table.Row, Table.Cell
   - Utilized direct style objects with explicit values instead of sx props
   - Created custom lightenColor utility function for color manipulation
   - Used consistent box-shadow and border-radius values from theme
   - Applied flexbox layout for complex alignments and spacing
   - Created consistent error/warning/success color schemes with theme tokens
   - Enhanced accessibility with proper ARIA attributes and roles
   - Used proper elevation patterns for cards and panels

### 2023-03-24: AccessibilityTester.jsx Migration
1. Migrated AccessibilityTester.jsx to use design system components:
   - Replaced Material UI imports with design system components
   - Updated component structure with responsive design approach
   - Created a consistent theming approach with useTheme hook
   - Updated Button components with proper variants and startElement props
   - Replaced Paper with Box for container elements
   - Created semantic Box as="ul"/"li" patterns for lists instead of Material UI List components
   - Updated Typography with theme-aware styling and fallback values
   - Enhanced Chip component styling with proper color tokens
   - Implemented Box as="button" for interactive elements
   - Created theme-aware styling for compliance score cards
   - Replaced all sx props with direct style objects
   - Created complex UI cards for metrics display with proper theming
   - Enhanced alert components with design system styling
   - Improved accessibility with proper ARIA attributes
   - Created custom alpha transparency calculations for background colors

2. Implementation Decisions:
   - Used Material UI's legacy components only when necessary
   - Applied consistent theme usage with theme?.colors fallbacks
   - Implemented responsive design with isMobile state
   - Created theme-aware custom styling for components without direct replacements
   - Used accordion pattern for violation details with proper accessibility
   - Reutilized lightenColor utility function for consistent styling
   - Enhanced severity indicators with semantic color tokens
   - Implemented direct style objects with proper spacing values
   - Created consistent layout patterns for all UI sections
   - Used Box as="ul"/"li" for semantic HTML lists
   - Enhanced typography with theme-aware color values
   - Created consistent box-shadow and border-radius styling
   - Applied flexbox layouts for complex alignments
   - Enhanced visual hierarchy with proper typography and spacing
   - Maintained existing component functionality while updating styling