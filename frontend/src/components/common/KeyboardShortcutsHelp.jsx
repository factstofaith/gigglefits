import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";
import React from 'react';
const KeyboardShortcutsHelp = props => {
  return <div className="keyboardshortcutshelp-component">
      KeyboardShortcutsHelp Component
    </div>;
};
KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';
export default withErrorBoundary(KeyboardShortcutsHelp, {
  boundary: 'KeyboardShortcutsHelp'
});