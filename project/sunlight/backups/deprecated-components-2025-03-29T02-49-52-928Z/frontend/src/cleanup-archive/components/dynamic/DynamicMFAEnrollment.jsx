// Dynamic import wrapper for MFAEnrollment
import React, { Suspense } from 'react';

// Lazy load the component
const MFAEnrollment = React.lazy(() => import('./security/MFAEnrollment'));

// Loading placeholder
const MFAEnrollmentLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for MFAEnrollment
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicMFAEnrollment(props) {
  // Added display name
  DynamicMFAEnrollment.displayName = 'DynamicMFAEnrollment';

  return (
    <Suspense fallback={<MFAEnrollmentLoading />}>
      <MFAEnrollment {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicMFAEnrollment;

// Export named version for explicit imports
export { DynamicMFAEnrollment };
