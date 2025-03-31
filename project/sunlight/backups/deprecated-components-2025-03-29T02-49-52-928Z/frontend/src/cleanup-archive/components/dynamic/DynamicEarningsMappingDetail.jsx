// Dynamic import wrapper for EarningsMappingDetail
import React, { Suspense } from 'react';

// Lazy load the component
const EarningsMappingDetail = React.lazy(() => import('./integration/EarningsMappingDetail'));

// Loading placeholder
const EarningsMappingDetailLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for EarningsMappingDetail
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicEarningsMappingDetail(props) {
  // Added display name
  DynamicEarningsMappingDetail.displayName = 'DynamicEarningsMappingDetail';

  return (
    <Suspense fallback={<EarningsMappingDetailLoading />}>
      <EarningsMappingDetail {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicEarningsMappingDetail;

// Export named version for explicit imports
export { DynamicEarningsMappingDetail };
