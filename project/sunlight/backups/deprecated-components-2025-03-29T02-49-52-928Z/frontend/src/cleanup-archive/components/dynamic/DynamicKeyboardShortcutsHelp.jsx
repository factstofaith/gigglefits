// Dynamic import wrapper for KeyboardShortcutsHelp
import React, { Suspense } from 'react';

// Lazy load the component
const KeyboardShortcutsHelp = React.lazy(() => import('./common/KeyboardShortcutsHelp'));

// Loading placeholder
const KeyboardShortcutsHelpLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for KeyboardShortcutsHelp
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicKeyboardShortcutsHelp(props) {
  // Added display name
  DynamicKeyboardShortcutsHelp.displayName = 'DynamicKeyboardShortcutsHelp';

  return (
    <Suspense fallback={<KeyboardShortcutsHelpLoading />}>
      <KeyboardShortcutsHelp {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicKeyboardShortcutsHelp;

// Export named version for explicit imports
export { DynamicKeyboardShortcutsHelp };
