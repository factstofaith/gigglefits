# Dynamic Import Migration Guide

## Overview

This guide provides instructions for implementing dynamic imports to improve application performance through better code splitting. Dynamic imports allow components to be loaded only when needed, reducing the initial bundle size.

## Components for Dynamic Import

The following 67 components have been identified as candidates for dynamic imports:

- **ContextualPropertiesPanel** (78.68 KB)
- **FileNotificationSystem** (78.56 KB)
- **VisualFieldMapper** (72.55 KB)
- **IntegrationFlowCanvas** (58.40 KB)
- **ApplicationsManager** (54.26 KB)
- **DebugModePanel** (48.94 KB)
- **ReleasesManager** (48.48 KB)
- **DatasetsManager** (46.29 KB)
- **AlertConfiguration** (37.88 KB)
- **SearchBar** (37.21 KB)
- **FilePreviewComponent** (36.32 KB)
- **IntegrationDetailView** (36.05 KB)
- **StorageConfigPanel** (34.82 KB)
- **IntegrationCreationDialog** (33.79 KB)
- **WebhookSettings** (33.28 KB)
- **FileTriggerMechanism** (32.75 KB)
- **IntegrationMonitoringDashboard** (32.69 KB)
- **DatasetNodePropertiesPanel** (30.97 KB)
- **FieldMappingEditor** (30.19 KB)
- **VirtualizedDataTable** (29.21 KB)
- **TenantsManager** (29.12 KB)
- **ErrorLogViewer** (28.49 KB)
- **EnhancedNodePalette** (27.55 KB)
- **DocumentationAnalytics** (26.51 KB)
- **FileBrowserComponent** (25.38 KB)
- **DataPreviewPanel** (25.37 KB)
- **FileMonitoringSystem** (25.32 KB)
- **ApplicationNodePropertiesPanel** (25.03 KB)
- **FlowErrorPanel** (22.90 KB)
- **EarningsMappingDetail** (22.57 KB)
- **UserDetail** (22.20 KB)
- **ErrorVisualization** (21.33 KB)
- **ScheduleConfiguration** (21.26 KB)
- **RunLogViewer** (20.57 KB)
- **PublicDocumentationPortal** (19.67 KB)
- **UserProfile** (19.63 KB)
- **MFASettings** (19.55 KB)
- **ValidationPanel** (19.40 KB)
- **TemplateBrowser** (19.40 KB)
- **DataPreviewComponent** (19.04 KB)
- **EmailConfiguration** (18.77 KB)
- **ConnectionPropertiesPanel** (18.63 KB)
- **DataTable** (18.54 KB)
- **AzureBlobConfiguration** (16.39 KB)
- **CompleteRegistration** (16.32 KB)
- **StorageFileBrowserPanel** (16.24 KB)
- **UserManagement** (16.18 KB)
- **SecuritySettings** (16.13 KB)
- **UserProfile** (15.84 KB)
- **UserManagement** (15.21 KB)
- **ExecutionMonitoring** (14.89 KB)
- **NotificationSettings** (14.23 KB)
- **DocumentationMetrics** (14.14 KB)
- **AcceptInvitation** (14.10 KB)
- **AuthModal** (13.76 KB)
- **FlowPerformanceMonitor** (13.62 KB)
- **Navigation** (13.09 KB)
- **ThemeTestComponent** (13.01 KB)
- **DatasetApplicationAssociation** (12.92 KB)
- **InvitationList** (12.80 KB)
- **IntegrationTable** (12.77 KB)
- **AzureConfigurationPanel** (11.98 KB)
- **MFAEnrollment** (11.61 KB)
- **HistoryPanel** (11.54 KB)
- **PageLayout** (11.49 KB)
- **InvitationList** (10.68 KB)
- **KeyboardShortcutsHelp** (10.03 KB)

## Implementation Steps

### 1. Use Pre-Generated Dynamic Wrappers

Dynamic wrapper components have been created for each candidate component. You can use these wrappers directly:

```javascript
import ContextualPropertiesPanel from '@components/dynamic/DynamicContextualPropertiesPanel';
```

```javascript
import FileNotificationSystem from '@components/dynamic/DynamicFileNotificationSystem';
```

```javascript
import VisualFieldMapper from '@components/dynamic/DynamicVisualFieldMapper';
```

```javascript
import IntegrationFlowCanvas from '@components/dynamic/DynamicIntegrationFlowCanvas';
```

```javascript
import ApplicationsManager from '@components/dynamic/DynamicApplicationsManager';
```

```javascript
import DebugModePanel from '@components/dynamic/DynamicDebugModePanel';
```

```javascript
import ReleasesManager from '@components/dynamic/DynamicReleasesManager';
```

```javascript
import DatasetsManager from '@components/dynamic/DynamicDatasetsManager';
```

```javascript
import AlertConfiguration from '@components/dynamic/DynamicAlertConfiguration';
```

```javascript
import SearchBar from '@components/dynamic/DynamicSearchBar';
```

```javascript
import FilePreviewComponent from '@components/dynamic/DynamicFilePreviewComponent';
```

```javascript
import IntegrationDetailView from '@components/dynamic/DynamicIntegrationDetailView';
```

```javascript
import StorageConfigPanel from '@components/dynamic/DynamicStorageConfigPanel';
```

```javascript
import IntegrationCreationDialog from '@components/dynamic/DynamicIntegrationCreationDialog';
```

```javascript
import WebhookSettings from '@components/dynamic/DynamicWebhookSettings';
```

```javascript
import FileTriggerMechanism from '@components/dynamic/DynamicFileTriggerMechanism';
```

```javascript
import IntegrationMonitoringDashboard from '@components/dynamic/DynamicIntegrationMonitoringDashboard';
```

```javascript
import DatasetNodePropertiesPanel from '@components/dynamic/DynamicDatasetNodePropertiesPanel';
```

```javascript
import FieldMappingEditor from '@components/dynamic/DynamicFieldMappingEditor';
```

```javascript
import VirtualizedDataTable from '@components/dynamic/DynamicVirtualizedDataTable';
```

```javascript
import TenantsManager from '@components/dynamic/DynamicTenantsManager';
```

```javascript
import ErrorLogViewer from '@components/dynamic/DynamicErrorLogViewer';
```

```javascript
import EnhancedNodePalette from '@components/dynamic/DynamicEnhancedNodePalette';
```

```javascript
import DocumentationAnalytics from '@components/dynamic/DynamicDocumentationAnalytics';
```

```javascript
import FileBrowserComponent from '@components/dynamic/DynamicFileBrowserComponent';
```

```javascript
import DataPreviewPanel from '@components/dynamic/DynamicDataPreviewPanel';
```

```javascript
import FileMonitoringSystem from '@components/dynamic/DynamicFileMonitoringSystem';
```

```javascript
import ApplicationNodePropertiesPanel from '@components/dynamic/DynamicApplicationNodePropertiesPanel';
```

```javascript
import FlowErrorPanel from '@components/dynamic/DynamicFlowErrorPanel';
```

```javascript
import EarningsMappingDetail from '@components/dynamic/DynamicEarningsMappingDetail';
```

```javascript
import UserDetail from '@components/dynamic/DynamicUserDetail';
```

```javascript
import ErrorVisualization from '@components/dynamic/DynamicErrorVisualization';
```

```javascript
import ScheduleConfiguration from '@components/dynamic/DynamicScheduleConfiguration';
```

```javascript
import RunLogViewer from '@components/dynamic/DynamicRunLogViewer';
```

```javascript
import PublicDocumentationPortal from '@components/dynamic/DynamicPublicDocumentationPortal';
```

```javascript
import UserProfile from '@components/dynamic/DynamicUserProfile';
```

```javascript
import MFASettings from '@components/dynamic/DynamicMFASettings';
```

```javascript
import ValidationPanel from '@components/dynamic/DynamicValidationPanel';
```

```javascript
import TemplateBrowser from '@components/dynamic/DynamicTemplateBrowser';
```

```javascript
import DataPreviewComponent from '@components/dynamic/DynamicDataPreviewComponent';
```

```javascript
import EmailConfiguration from '@components/dynamic/DynamicEmailConfiguration';
```

```javascript
import ConnectionPropertiesPanel from '@components/dynamic/DynamicConnectionPropertiesPanel';
```

```javascript
import DataTable from '@components/dynamic/DynamicDataTable';
```

```javascript
import AzureBlobConfiguration from '@components/dynamic/DynamicAzureBlobConfiguration';
```

```javascript
import CompleteRegistration from '@components/dynamic/DynamicCompleteRegistration';
```

```javascript
import StorageFileBrowserPanel from '@components/dynamic/DynamicStorageFileBrowserPanel';
```

```javascript
import UserManagement from '@components/dynamic/DynamicUserManagement';
```

```javascript
import SecuritySettings from '@components/dynamic/DynamicSecuritySettings';
```

```javascript
import UserProfile from '@components/dynamic/DynamicUserProfile';
```

```javascript
import UserManagement from '@components/dynamic/DynamicUserManagement';
```

```javascript
import ExecutionMonitoring from '@components/dynamic/DynamicExecutionMonitoring';
```

```javascript
import NotificationSettings from '@components/dynamic/DynamicNotificationSettings';
```

```javascript
import DocumentationMetrics from '@components/dynamic/DynamicDocumentationMetrics';
```

```javascript
import AcceptInvitation from '@components/dynamic/DynamicAcceptInvitation';
```

```javascript
import AuthModal from '@components/dynamic/DynamicAuthModal';
```

```javascript
import FlowPerformanceMonitor from '@components/dynamic/DynamicFlowPerformanceMonitor';
```

```javascript
import Navigation from '@components/dynamic/DynamicNavigation';
```

```javascript
import ThemeTestComponent from '@components/dynamic/DynamicThemeTestComponent';
```

```javascript
import DatasetApplicationAssociation from '@components/dynamic/DynamicDatasetApplicationAssociation';
```

```javascript
import InvitationList from '@components/dynamic/DynamicInvitationList';
```

```javascript
import IntegrationTable from '@components/dynamic/DynamicIntegrationTable';
```

```javascript
import AzureConfigurationPanel from '@components/dynamic/DynamicAzureConfigurationPanel';
```

```javascript
import MFAEnrollment from '@components/dynamic/DynamicMFAEnrollment';
```

```javascript
import HistoryPanel from '@components/dynamic/DynamicHistoryPanel';
```

```javascript
import PageLayout from '@components/dynamic/DynamicPageLayout';
```

```javascript
import InvitationList from '@components/dynamic/DynamicInvitationList';
```

```javascript
import KeyboardShortcutsHelp from '@components/dynamic/DynamicKeyboardShortcutsHelp';
```

### 2. Update Parent Components

In parent components that import these large components, replace the direct imports with the dynamic versions:

```javascript
// Before
import LargeComponent from '@components/path/to/LargeComponent';

// After
import LargeComponent from '@components/dynamic/DynamicLargeComponent';
```

### 3. Add Loading Styles

Add CSS for the loading placeholders:

```css
.component-loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3B3D3D;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Performance Impact

Implementing these dynamic imports is expected to:

1. Reduce initial bundle size by approximately 2 MB
2. Improve initial load time
3. Enable more efficient caching

## Testing

After implementing dynamic imports, be sure to test:

1. Initial load performance
2. Component loading behavior
3. Error boundaries for failed lazy loads
4. Performance on low-end devices
