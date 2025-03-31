// Dynamic import wrapper for DataPreviewPanel
import React, { Suspense } from 'react';

// Lazy load the component
const DataPreviewPanel = React.lazy(() => import('./integration/DataPreviewPanel'));

// Loading placeholder
const DataPreviewPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DataPreviewPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDataPreviewPanel(props) {
  // Added display name
  DynamicDataPreviewPanel.displayName = 'DynamicDataPreviewPanel';

  return (
    <Suspense fallback={<DataPreviewPanelLoading />}>
      <DataPreviewPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDataPreviewPanel;

// Export named version for explicit imports
export { DynamicDataPreviewPanel };
