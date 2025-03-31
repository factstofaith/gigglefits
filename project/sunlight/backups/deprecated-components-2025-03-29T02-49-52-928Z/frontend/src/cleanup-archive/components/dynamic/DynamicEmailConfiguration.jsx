// Dynamic import wrapper for EmailConfiguration
import React, { Suspense } from 'react';

// Lazy load the component
const EmailConfiguration = React.lazy(() => import('./admin/EmailConfiguration'));

// Loading placeholder
const EmailConfigurationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for EmailConfiguration
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicEmailConfiguration(props) {
  // Added display name
  DynamicEmailConfiguration.displayName = 'DynamicEmailConfiguration';

  return (
    <Suspense fallback={<EmailConfigurationLoading />}>
      <EmailConfiguration {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicEmailConfiguration;

// Export named version for explicit imports
export { DynamicEmailConfiguration };
