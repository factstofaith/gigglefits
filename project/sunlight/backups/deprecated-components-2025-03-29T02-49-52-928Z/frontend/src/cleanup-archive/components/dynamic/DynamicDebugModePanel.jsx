// Dynamic import wrapper for DebugModePanel
import React, { Suspense } from 'react';

// Lazy load the component
const DebugModePanel = React.lazy(() => import('./integration/DebugModePanel'));

// Loading placeholder
const DebugModePanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DebugModePanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDebugModePanel(props) {
  // Added display name
  DynamicDebugModePanel.displayName = 'DynamicDebugModePanel';

  return (
    <Suspense fallback={<DebugModePanelLoading />}>
      <DebugModePanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDebugModePanel;

// Export named version for explicit imports
export { DynamicDebugModePanel };
