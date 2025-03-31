// Dynamic import wrapper for ApplicationNodePropertiesPanel
import React, { Suspense } from 'react';

// Lazy load the component
const ApplicationNodePropertiesPanel = React.lazy(() => import('./integration/ApplicationNodePropertiesPanel'));

// Loading placeholder
const ApplicationNodePropertiesPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ApplicationNodePropertiesPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicApplicationNodePropertiesPanel(props) {
  // Added display name
  DynamicApplicationNodePropertiesPanel.displayName = 'DynamicApplicationNodePropertiesPanel';

  return (
    <Suspense fallback={<ApplicationNodePropertiesPanelLoading />}>
      <ApplicationNodePropertiesPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicApplicationNodePropertiesPanel;

// Export named version for explicit imports
export { DynamicApplicationNodePropertiesPanel };
