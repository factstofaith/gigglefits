// Dynamic import wrapper for FileNotificationSystem
import React, { Suspense } from 'react';

// Lazy load the component
const FileNotificationSystem = React.lazy(() => import('./integration/FileNotificationSystem'));

// Loading placeholder
const FileNotificationSystemLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for FileNotificationSystem
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicFileNotificationSystem(props) {
  // Added display name
  DynamicFileNotificationSystem.displayName = 'DynamicFileNotificationSystem';

  return (
    <Suspense fallback={<FileNotificationSystemLoading />}>
      <FileNotificationSystem {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicFileNotificationSystem;

// Export named version for explicit imports
export { DynamicFileNotificationSystem };
