// Dynamic import wrapper for FieldMappingEditor
import React, { Suspense } from 'react';

// Lazy load the component
const FieldMappingEditor = React.lazy(() => import('./integration/FieldMappingEditor'));

// Loading placeholder
const FieldMappingEditorLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for FieldMappingEditor
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicFieldMappingEditor(props) {
  // Added display name
  DynamicFieldMappingEditor.displayName = 'DynamicFieldMappingEditor';

  return (
    <Suspense fallback={<FieldMappingEditorLoading />}>
      <FieldMappingEditor {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicFieldMappingEditor;

// Export named version for explicit imports
export { DynamicFieldMappingEditor };
