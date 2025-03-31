# TAP Integration Platform - Application Wireframe

## Application Architecture

```
                                                +-------------------------+
                                                |                         |
                                                |   UserContext (Auth)    |
                                                |                         |
                                                +------------+------------+
                                                             |
                    +-------------------------------+--------+-------+----------------------------------+
                    |                               |                |                                  |
           +--------v---------+         +-----------v----------+    |                         +--------v---------+
           |                  |         |                      |    |                         |                  |
           |    HomePage      |         |   IntegrationsPage   <----+                         |  AdminDashboard  |
           |                  |         |                      |    |                         |                  |
           +------------------+         +-----------+----------+    |                         +--------+---------+
                                                    |               |                                  |
                                        +-----------v----------+    |                         +--------v---------+
                                        |                      |    |                         |                  |
                                        | IntegrationDetail    <----+                         | UserManagement   |
                                        |                      |    |                         |                  |
                                        +-----------+----------+    |                         +------------------+
                                                    |               |                                  |
           +------------------+         +-----------v----------+    |                         +--------v---------+
           |                  |         |                      |    |                         |                  |
           |   EarningsPage   <---------+    Flow Canvas       |    |                         | ErrorLogViewer   |
           |                  |         |                      |    |                         |                  |
           +------------------+         +------+-------+-------+    |                         +------------------+
                    |                          |       |            |
                    |                          |       |            |               
       +------------v-----------+     +--------v-----+ | +----------v--------+      +------------------+
       |                        |     |              | | |                   |      |                  |
       | EarningsMappingDetail  |     | DataPreview  | | | NodeProperties    |      | Documentation    |
       |                        |     |              | | |                   |      |                  |
       +------------------------+     +--------------+ | +-------------------+      +------------------+
                                                       |
                                            +----------v--------+
                                            |                   |
                                            | RunLogViewer      |
                                            |                   |
                                            +-------------------+
```

## Main Layouts and Components

### Authentication and Navigation
- **LoginPage**: Entry point with authentication
- **RequireAuth**: Authentication wrapper
- **Navigation**: Main app navigation component
- **UserProfile**: User information and settings

### Home and Dashboard
- **HomePage**: Landing dashboard with summary information
- **DashboardCard**: Reusable metric/info cards
- **MetricChart**: Data visualization component
- **ResourceHealthCards**: System health indicators

### Integrations Management
- **IntegrationsPage**: Lists all integrations
- **IntegrationTable**: Sortable/filterable table
- **IntegrationTableRow**: Individual integration info
- **IntegrationCreationDialog**: Flow creation wizard

### Integration Detail
- **IntegrationDetailPage**: Container for flow details
- **IntegrationFlowCanvas**: Visual flow editor (core component)
- **IntegrationDetailView**: Metadata and controls
- **NodePropertiesPanel**: Configuration for selected nodes
- **ScheduleConfiguration**: Scheduling controls

### Flow Components
- **BaseNode**: Foundation for all flow nodes
- **SourceNode**: Data source node
- **DestinationNode**: Data target node
- **DatasetNode**: Dataset configuration
- **TransformNode**: Data transformation
- **TriggerNode**: Flow initiation
- **ActionNode**: Custom actions
- **RouterNode**: Flow branching/conditions

### Data Visualization
- **DataPreviewComponent**: Data viewer for flow testing
- **DataPreviewPanel**: Enhanced data visualization
- **RunLogViewer**: Execution history and logs
- **JSONViewer**: Formatted JSON display

### Admin Features
- **AdminDashboardPage**: Admin-specific dashboard
- **UserManagement**: User CRUD operations
- **TenantsManager**: Multi-tenant controls
- **ApplicationsManager**: Connected app management
- **ErrorLogViewer**: System error logs
- **MFASettings**: Security configuration
- **EmailConfiguration**: Notification settings
- **ReleasesManager**: Version management

### Earnings Management
- **EarningsPage**: Earnings management entry
- **EarningsCodeManager**: Code maintenance
- **EarningsMappingDetail**: Field mapping
- **EmployeeManager**: Employee data management
- **EmployeeRosterManager**: Team assignments

## Design System Components

### Form Components
- **ButtonAdapted**: Enhanced button component
- **TextFieldAdapted**: Text input fields
- **SelectAdapted**: Dropdown selection
- **AutocompleteAdapted**: Enhanced search/select
- **CheckboxAdapted**: Checkbox controls
- **RadioGroupAdapted**: Option groups
- **DatePickerAdapted**: Date selection

### Display Components
- **CardAdapted**: Content containers
- **AlertAdapted**: User notifications
- **BadgeAdapted**: Status indicators
- **ChipAdapted**: Label/tag elements
- **TypographyAdapted**: Text styling
- **TableAdapted**: Data tables
- **DataGridAdapted**: Enhanced data grid
- **ListAdapted**: Item listings
- **DataPreviewAdapted**: Data visualization

### Navigation Components
- **TabsAdapted**: Tab navigation
- **LinkAdapted**: Navigation links
- **PaginationAdapted**: Page controls
- **BreadcrumbsAdapted**: Navigation path

### Layout Components
- **BoxAdapted**: Layout container
- **GridAdapted**: Grid layout system
- **StackAdapted**: Flexible stacking

### Feedback Components
- **ModalAdapted**: Dialog windows
- **ToastAdapted**: Temporary notifications
- **ProgressBarAdapted**: Loading indicators
- **SkeletonAdapted**: Content loading placeholders

## Context Providers

- **UserContext**: Authentication and user data
- **NotificationContext**: Toast notifications
- **ConfigContext**: System configuration
- **IntegrationContext**: Active integration data
- **EarningsContext**: Earnings-specific data
- **AzureConfigContext**: Azure integration config
- **BreadcrumbContext**: Navigation breadcrumbs
- **KeyboardShortcutsContext**: Keyboard shortcuts
- **MonitoringContext**: System monitoring
- **ResourceContext**: External resource info
- **SettingsContext**: User settings
- **TenantContext**: Tenant-specific data
- **WebhookContext**: Webhook configuration

## Utility Layers

- **apiServiceFactory**: API service creation
- **errorHandling**: Standardized error handling
- **notificationHelper**: Notification utilities
- **connectionValidator**: Connection testing
- **flowValidation**: Flow configuration validation
- **schemaDiscovery**: Data schema analysis
- **reactFlowAdapter**: Flow visualization adapter
- **reactJsonAdapter**: JSON visualization
- **enhancedCache**: Client-side caching
- **helpers**: Common utility functions
- **layoutOptimizer**: UI layout optimization
- **flowOptimizer**: Flow performance tools
- **performanceMetrics**: Performance measurement