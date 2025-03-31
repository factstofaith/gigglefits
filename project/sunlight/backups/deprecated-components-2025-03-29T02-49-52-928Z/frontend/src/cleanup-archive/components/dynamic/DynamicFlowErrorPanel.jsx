// Dynamic import wrapper for ErrorVisualization
import React, { Suspense } from 'react';

// Lazy load the component - using ErrorVisualization since FlowErrorPanel no longer exists
const ErrorVisualization = React.lazy(() => import('../integration/ErrorVisualization'));

// Loading placeholder
const ErrorVisualizationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for error visualization
 * This wrapper lazily loads the component for better code splitting
 * 
 * Note: This was previously loading FlowErrorPanel from archive, but that file
 * no longer exists. It has been updated to use ErrorVisualization instead.
 */
function DynamicFlowErrorPanel(props) {
  // Added display name
  DynamicFlowErrorPanel.displayName = 'DynamicFlowErrorPanel';

  return (
    <Suspense fallback={<ErrorVisualizationLoading />}>
      <ErrorVisualization {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicFlowErrorPanel;

// Export named version for explicit imports
export { DynamicFlowErrorPanel };
