// Dynamic import wrapper for IntegrationFlowCanvas
import React, { Suspense } from 'react';

// Lazy load the component
const IntegrationFlowCanvas = React.lazy(() => import('./integration/IntegrationFlowCanvas'));

// Loading placeholder
const IntegrationFlowCanvasLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for IntegrationFlowCanvas
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicIntegrationFlowCanvas(props) {
  // Added display name
  DynamicIntegrationFlowCanvas.displayName = 'DynamicIntegrationFlowCanvas';

  return (
    <Suspense fallback={<IntegrationFlowCanvasLoading />}>
      <IntegrationFlowCanvas {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicIntegrationFlowCanvas;

// Export named version for explicit imports
export { DynamicIntegrationFlowCanvas };
