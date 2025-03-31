# Integration Components

This directory contains components for the integration management and configuration features of the TAP Integration Platform.

## Components Overview

- **AzureBlobConfiguration**: Configuration component for Azure Blob Storage integration
- **IntegrationCreationDialog**: Dialog for creating new integrations  
- **IntegrationDetailView**: Detail view and editor for integration configurations
- **IntegrationTable**: Table view showing available integrations
- **IntegrationTableRow**: Row component used in the IntegrationTable
- **ScheduleConfiguration**: Configuration component for scheduling integration runs
- **S3Configuration**: Configuration component for AWS S3 integration
- **SchemaInferenceViewer**: Component for viewing and validating inferred schemas
- **SharePointConfiguration**: Configuration component for SharePoint integration
- **UserRoleSwitcher**: Component for switching between different user roles for testing
- **WebhookConfiguration**: Configuration component for webhook integrations

## Recent Enhancements

### Responsive Design Implementation (September 1, 2025)

The UI has been enhanced with responsive design patterns that optimize the user experience across different screen sizes:

#### IntegrationDetailView Enhancements

- **Adaptive Layout**: Card components now adjust padding, margin, and layout based on viewport size.
- **Responsive Typography**: Text sizes adjust based on screen size for better readability.
- **Mobile-Optimized Controls**: Action buttons adjust for touch-friendly interaction on smaller screens.
- **Scrollable Tabs**: Tabs are now scrollable with properly sized text and controls for mobile devices.
- **Structured Information Display**: Information is displayed with proper label alignment that adapts to screen width.
- **Responsive Card Layout**: Content cards now use a column layout on mobile and a grid layout on larger screens.
- **Touch-Friendly Buttons**: Save/Cancel buttons take full width on mobile for easier touch targets.

#### Design Principles Applied

1. **Fluid Spacing System**: Used MUI's responsive spacing with different values for xs, sm, md breakpoints
2. **Typography Scaling**: Reduced font sizes on smaller screens while maintaining hierarchy
3. **Layout Transformation**: Components change layout structure rather than just resizing
4. **Adaptive Controls**: Interactive elements resize and reposition for touch-friendly interfaces
5. **Vertical Stacking**: Multi-column layouts collapse to single columns on small viewports

#### Technical Implementation

- Used Material UI's responsive styling through the `sx` prop:
  ```jsx
  sx={{ 
    p: { xs: 2, sm: 3, md: 4 },
    fontSize: { xs: '0.875rem', sm: '1rem' },
    flexDirection: { xs: 'column', sm: 'row' }
  }}
  ```

- Applied responsive grid system:
  ```jsx
  <Grid container spacing={{ xs: 2, sm: 3 }}>
    <Grid item xs={12} md={6}>
      {/* Content */}
    </Grid>
  </Grid>
  ```

- Implemented touch-friendly sizing for mobile:
  ```jsx
  <Button
    size={{ xs: 'small', sm: 'medium' }}
    sx={{ width: { xs: '100%', sm: 'auto' } }}
  >
    {buttonText}
  </Button>
  ```

This implementation follows our zero technical debt approach, leveraging the development-only environment to build straight-to-production quality responsive interfaces without legacy browser compatibility concerns.

## Next Steps

- Complete contextual help system implementation
- Enhance user guidance through guided tours
- Implement accessibility compliance features

## Subdirectories

- [nodes](nodes): Contains transformation and operation node components
- [flow](flow): Contains flow canvas and related components
- [wizard-steps](wizard-steps): Contains components for step-by-step wizards

## Notes

- Enhanced with responsive design implementations (Sep 2025)
- Created by Project Sunlight documentation standardization