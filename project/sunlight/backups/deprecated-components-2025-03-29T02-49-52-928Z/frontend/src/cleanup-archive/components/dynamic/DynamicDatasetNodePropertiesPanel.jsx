// Dynamic import wrapper for DatasetNodePropertiesPanel
import React, { Suspense } from 'react';

// Lazy load the component
const DatasetNodePropertiesPanel = React.lazy(() => import('./integration/DatasetNodePropertiesPanel'));

// Loading placeholder
const DatasetNodePropertiesPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DatasetNodePropertiesPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDatasetNodePropertiesPanel(props) {
  // Added display name
  DynamicDatasetNodePropertiesPanel.displayName = 'DynamicDatasetNodePropertiesPanel';

  return (
    <Suspense fallback={<DatasetNodePropertiesPanelLoading />}>
      <DatasetNodePropertiesPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDatasetNodePropertiesPanel;

// Export named version for explicit imports
export { DynamicDatasetNodePropertiesPanel };
