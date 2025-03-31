// Dynamic import wrapper for StorageConfigPanel
import React, { Suspense } from 'react';

// Lazy load the component
const StorageConfigPanel = React.lazy(() => import('./integration/StorageConfigPanel'));

// Loading placeholder
const StorageConfigPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for StorageConfigPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicStorageConfigPanel(props) {
  // Added display name
  DynamicStorageConfigPanel.displayName = 'DynamicStorageConfigPanel';

  return (
    <Suspense fallback={<StorageConfigPanelLoading />}>
      <StorageConfigPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicStorageConfigPanel;

// Export named version for explicit imports
export { DynamicStorageConfigPanel };
