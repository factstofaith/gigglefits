// Dynamic import wrapper for ExecutionMonitoring
import React, { Suspense } from 'react';

// Lazy load the component
const ExecutionMonitoring = React.lazy(() => import('./integration/ExecutionMonitoring'));

// Loading placeholder
const ExecutionMonitoringLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ExecutionMonitoring
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicExecutionMonitoring(props) {
  // Added display name
  DynamicExecutionMonitoring.displayName = 'DynamicExecutionMonitoring';

  return (
    <Suspense fallback={<ExecutionMonitoringLoading />}>
      <ExecutionMonitoring {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicExecutionMonitoring;

// Export named version for explicit imports
export { DynamicExecutionMonitoring };
