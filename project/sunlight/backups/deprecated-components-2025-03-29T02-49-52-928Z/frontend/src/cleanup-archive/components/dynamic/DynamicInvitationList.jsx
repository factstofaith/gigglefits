// Dynamic import wrapper for InvitationList
import React, { Suspense } from 'react';

// Lazy load the component
const InvitationList = React.lazy(() => import('./admin/InvitationList'));

// Loading placeholder
const InvitationListLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for InvitationList
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicInvitationList(props) {
  // Added display name
  DynamicInvitationList.displayName = 'DynamicInvitationList';

  return (
    <Suspense fallback={<InvitationListLoading />}>
      <InvitationList {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicInvitationList;

// Export named version for explicit imports
export { DynamicInvitationList };
