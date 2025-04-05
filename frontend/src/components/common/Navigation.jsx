import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling/";
import React from 'react';
const Navigation = props => {
  return <div className="navigation-component">
      Navigation Component
    </div>;
};
Navigation.displayName = 'Navigation';
export default withErrorBoundary(Navigation, {
  boundary: 'Navigation'
});