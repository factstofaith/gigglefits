// Dynamic import wrapper for FileMonitoringSystem
import React, { Suspense } from 'react';

// Lazy load the component
const FileMonitoringSystem = React.lazy(() => import('./integration/FileMonitoringSystem'));

// Loading placeholder
const FileMonitoringSystemLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for FileMonitoringSystem
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicFileMonitoringSystem(props) {
  // Added display name
  DynamicFileMonitoringSystem.displayName = 'DynamicFileMonitoringSystem';

  return (
    <Suspense fallback={<FileMonitoringSystemLoading />}>
      <FileMonitoringSystem {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicFileMonitoringSystem;

// Export named version for explicit imports
export { DynamicFileMonitoringSystem };
