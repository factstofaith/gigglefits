// Dynamic import wrapper for PublicDocumentationPortal
import React, { Suspense } from 'react';

// Lazy load the component
const PublicDocumentationPortal = React.lazy(() => import('./documentation/PublicDocumentationPortal'));

// Loading placeholder
const PublicDocumentationPortalLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for PublicDocumentationPortal
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicPublicDocumentationPortal(props) {
  // Added display name
  DynamicPublicDocumentationPortal.displayName = 'DynamicPublicDocumentationPortal';

  return (
    <Suspense fallback={<PublicDocumentationPortalLoading />}>
      <PublicDocumentationPortal {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicPublicDocumentationPortal;

// Export named version for explicit imports
export { DynamicPublicDocumentationPortal };
