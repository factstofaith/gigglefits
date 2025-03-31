// Dynamic import wrapper for ConnectionPropertiesPanel
import React, { Suspense } from 'react';

// Lazy load the component
const ConnectionPropertiesPanel = React.lazy(() => import('./integration/ConnectionPropertiesPanel'));

// Loading placeholder
const ConnectionPropertiesPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ConnectionPropertiesPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicConnectionPropertiesPanel(props) {
  // Added display name
  DynamicConnectionPropertiesPanel.displayName = 'DynamicConnectionPropertiesPanel';

  return (
    <Suspense fallback={<ConnectionPropertiesPanelLoading />}>
      <ConnectionPropertiesPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicConnectionPropertiesPanel;

// Export named version for explicit imports
export { DynamicConnectionPropertiesPanel };
