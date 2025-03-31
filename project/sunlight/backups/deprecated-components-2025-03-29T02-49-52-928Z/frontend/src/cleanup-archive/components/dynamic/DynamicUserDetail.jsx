// Dynamic import wrapper for UserDetail
import React, { Suspense } from 'react';

// Lazy load the component
const UserDetail = React.lazy(() => import('./admin/UserDetail'));

// Loading placeholder
const UserDetailLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for UserDetail
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicUserDetail(props) {
  // Added display name
  DynamicUserDetail.displayName = 'DynamicUserDetail';

  return (
    <Suspense fallback={<UserDetailLoading />}>
      <UserDetail {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicUserDetail;

// Export named version for explicit imports
export { DynamicUserDetail };
