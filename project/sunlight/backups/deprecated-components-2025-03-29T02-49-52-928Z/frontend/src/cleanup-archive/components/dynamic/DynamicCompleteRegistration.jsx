// Dynamic import wrapper for CompleteRegistration
import React, { Suspense } from 'react';

// Lazy load the component
const CompleteRegistration = React.lazy(() => import('./invitation/CompleteRegistration'));

// Loading placeholder
const CompleteRegistrationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for CompleteRegistration
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicCompleteRegistration(props) {
  // Added display name
  DynamicCompleteRegistration.displayName = 'DynamicCompleteRegistration';

  return (
    <Suspense fallback={<CompleteRegistrationLoading />}>
      <CompleteRegistration {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicCompleteRegistration;

// Export named version for explicit imports
export { DynamicCompleteRegistration };
