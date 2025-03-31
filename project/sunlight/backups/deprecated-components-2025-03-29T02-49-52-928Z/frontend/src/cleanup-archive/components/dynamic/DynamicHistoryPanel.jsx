// Dynamic import wrapper for HistoryPanel
import React, { Suspense } from 'react';

// Lazy load the component
const HistoryPanel = React.lazy(() => import('./integration/HistoryPanel'));

// Loading placeholder
const HistoryPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for HistoryPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicHistoryPanel(props) {
  // Added display name
  DynamicHistoryPanel.displayName = 'DynamicHistoryPanel';

  return (
    <Suspense fallback={<HistoryPanelLoading />}>
      <HistoryPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicHistoryPanel;

// Export named version for explicit imports
export { DynamicHistoryPanel };
