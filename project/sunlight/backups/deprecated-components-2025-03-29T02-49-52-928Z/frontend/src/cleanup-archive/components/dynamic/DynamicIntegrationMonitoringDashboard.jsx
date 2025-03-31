// Dynamic import wrapper for IntegrationMonitoringDashboard
import React, { Suspense } from 'react';

// Lazy load the component
const IntegrationMonitoringDashboard = React.lazy(() => import('./integration/IntegrationMonitoringDashboard'));

// Loading placeholder
const IntegrationMonitoringDashboardLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for IntegrationMonitoringDashboard
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicIntegrationMonitoringDashboard(props) {
  // Added display name
  DynamicIntegrationMonitoringDashboard.displayName = 'DynamicIntegrationMonitoringDashboard';

  return (
    <Suspense fallback={<IntegrationMonitoringDashboardLoading />}>
      <IntegrationMonitoringDashboard {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicIntegrationMonitoringDashboard;

// Export named version for explicit imports
export { DynamicIntegrationMonitoringDashboard };
