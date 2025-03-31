// Dynamic import wrapper for ScheduleConfiguration
import React, { Suspense } from 'react';

// Lazy load the component
const ScheduleConfiguration = React.lazy(() => import('./integration/ScheduleConfiguration'));

// Loading placeholder
const ScheduleConfigurationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ScheduleConfiguration
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicScheduleConfiguration(props) {
  // Added display name
  DynamicScheduleConfiguration.displayName = 'DynamicScheduleConfiguration';

  return (
    <Suspense fallback={<ScheduleConfigurationLoading />}>
      <ScheduleConfiguration {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicScheduleConfiguration;

// Export named version for explicit imports
export { DynamicScheduleConfiguration };
