// Dynamic import wrapper for FlowPerformanceMonitor
import React, { Suspense } from 'react';

// Lazy load the component
const FlowPerformanceMonitor = React.lazy(() => import('./integration/FlowPerformanceMonitor'));

// Loading placeholder
const FlowPerformanceMonitorLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for FlowPerformanceMonitor
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicFlowPerformanceMonitor(props) {
  // Added display name
  DynamicFlowPerformanceMonitor.displayName = 'DynamicFlowPerformanceMonitor';

  return (
    <Suspense fallback={<FlowPerformanceMonitorLoading />}>
      <FlowPerformanceMonitor {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicFlowPerformanceMonitor;

// Export named version for explicit imports
export { DynamicFlowPerformanceMonitor };
