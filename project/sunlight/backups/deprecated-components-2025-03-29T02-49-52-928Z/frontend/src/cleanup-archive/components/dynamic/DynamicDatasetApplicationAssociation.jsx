// Dynamic import wrapper for DatasetApplicationAssociation
import React, { Suspense } from 'react';

// Lazy load the component
const DatasetApplicationAssociation = React.lazy(() => import('./integration/DatasetApplicationAssociation'));

// Loading placeholder
const DatasetApplicationAssociationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DatasetApplicationAssociation
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDatasetApplicationAssociation(props) {
  // Added display name
  DynamicDatasetApplicationAssociation.displayName = 'DynamicDatasetApplicationAssociation';

  return (
    <Suspense fallback={<DatasetApplicationAssociationLoading />}>
      <DatasetApplicationAssociation {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDatasetApplicationAssociation;

// Export named version for explicit imports
export { DynamicDatasetApplicationAssociation };
