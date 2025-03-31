// Dynamic import wrapper for ErrorVisualization
import React, { Suspense } from 'react';

// Lazy load the component
const ErrorVisualization = React.lazy(() => import('./integration/ErrorVisualization'));

// Loading placeholder
const ErrorVisualizationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ErrorVisualization
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicErrorVisualization(props) {
  // Added display name
  DynamicErrorVisualization.displayName = 'DynamicErrorVisualization';

  return (
    <Suspense fallback={<ErrorVisualizationLoading />}>
      <ErrorVisualization {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicErrorVisualization;

// Export named version for explicit imports
export { DynamicErrorVisualization };
