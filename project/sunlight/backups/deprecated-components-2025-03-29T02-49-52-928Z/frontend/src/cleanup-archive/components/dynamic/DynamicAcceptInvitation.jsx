// Dynamic import wrapper for AcceptInvitation
import React, { Suspense } from 'react';

// Lazy load the component
const AcceptInvitation = React.lazy(() => import('./users/invitation/AcceptInvitation'));

// Loading placeholder
const AcceptInvitationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for AcceptInvitation
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicAcceptInvitation(props) {
  // Added display name
  DynamicAcceptInvitation.displayName = 'DynamicAcceptInvitation';

  return (
    <Suspense fallback={<AcceptInvitationLoading />}>
      <AcceptInvitation {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicAcceptInvitation;

// Export named version for explicit imports
export { DynamicAcceptInvitation };
