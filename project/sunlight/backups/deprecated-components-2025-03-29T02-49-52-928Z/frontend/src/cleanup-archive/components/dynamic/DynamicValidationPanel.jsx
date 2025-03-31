// Dynamic import wrapper for ValidationPanel
import React, { Suspense } from 'react';

// Lazy load the component
const ValidationPanel = React.lazy(() => import('./integration/ValidationPanel'));

// Loading placeholder
const ValidationPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ValidationPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicValidationPanel(props) {
  // Added display name
  DynamicValidationPanel.displayName = 'DynamicValidationPanel';

  return (
    <Suspense fallback={<ValidationPanelLoading />}>
      <ValidationPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicValidationPanel;

// Export named version for explicit imports
export { DynamicValidationPanel };
