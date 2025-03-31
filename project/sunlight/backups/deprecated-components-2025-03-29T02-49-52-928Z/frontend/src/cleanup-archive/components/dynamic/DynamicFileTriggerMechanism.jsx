// Dynamic import wrapper for FileTriggerMechanism
import React, { Suspense } from 'react';

// Lazy load the component
const FileTriggerMechanism = React.lazy(() => import('./integration/FileTriggerMechanism'));

// Loading placeholder
const FileTriggerMechanismLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for FileTriggerMechanism
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicFileTriggerMechanism(props) {
  // Added display name
  DynamicFileTriggerMechanism.displayName = 'DynamicFileTriggerMechanism';

  return (
    <Suspense fallback={<FileTriggerMechanismLoading />}>
      <FileTriggerMechanism {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicFileTriggerMechanism;

// Export named version for explicit imports
export { DynamicFileTriggerMechanism };
