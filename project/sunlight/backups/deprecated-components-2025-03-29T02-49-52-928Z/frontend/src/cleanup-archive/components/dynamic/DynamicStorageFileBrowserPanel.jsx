// Dynamic import wrapper for StorageFileBrowserPanel
import React, { Suspense } from 'react';

// Lazy load the component
const StorageFileBrowserPanel = React.lazy(() => import('./integration/StorageFileBrowserPanel'));

// Loading placeholder
const StorageFileBrowserPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for StorageFileBrowserPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicStorageFileBrowserPanel(props) {
  // Added display name
  DynamicStorageFileBrowserPanel.displayName = 'DynamicStorageFileBrowserPanel';

  return (
    <Suspense fallback={<StorageFileBrowserPanelLoading />}>
      <StorageFileBrowserPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicStorageFileBrowserPanel;

// Export named version for explicit imports
export { DynamicStorageFileBrowserPanel };
