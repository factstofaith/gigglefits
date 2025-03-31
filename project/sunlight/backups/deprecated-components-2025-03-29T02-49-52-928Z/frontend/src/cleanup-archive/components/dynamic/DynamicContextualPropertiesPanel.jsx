// Dynamic import wrapper for ContextualPropertiesPanel
import React, { Suspense } from 'react';

// Lazy load the component
const ContextualPropertiesPanel = React.lazy(() => import('./integration/ContextualPropertiesPanel'));

// Loading placeholder
const ContextualPropertiesPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ContextualPropertiesPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicContextualPropertiesPanel(props) {
  // Added display name
  DynamicContextualPropertiesPanel.displayName = 'DynamicContextualPropertiesPanel';

  return (
    <Suspense fallback={<ContextualPropertiesPanelLoading />}>
      <ContextualPropertiesPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicContextualPropertiesPanel;

// Export named version for explicit imports
export { DynamicContextualPropertiesPanel };
