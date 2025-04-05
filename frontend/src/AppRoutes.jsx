import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useErrorContext } from './error-handling/ErrorContext';
import ErrorBoundary from './error-handling/ErrorBoundary';

// Import page components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const IntegrationsPage = React.lazy(() => import('./pages/IntegrationsPage'));
const IntegrationDetailPage = React.lazy(() => import('./pages/IntegrationDetailPage'));
const EarningsPage = React.lazy(() => import('./pages/EarningsPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const UserSettingsPage = React.lazy(() => import('./pages/UserSettingsPage'));

// Test components (for development purposes only)
const TestS3Configuration = React.lazy(() => import('./components/integration/test/TestS3Configuration'));
const TestSharePointConfiguration = React.lazy(() => import('./components/integration/test/TestSharePointConfiguration'));
const TestAPIWebhookConfiguration = React.lazy(() => import('./components/integration/test/TestAPIWebhookConfiguration'));
const DockerErrorHandlingExample = React.lazy(() => import('./examples/DockerErrorHandlingExample'));

// Auth components
const RequireAuth = React.lazy(() => import('./components/auth/RequireAuth'));
const RequireAdmin = React.lazy(() => import('./components/auth/RequireAdmin'));

const AppRoutes = () => {
  const location = useLocation();
  const { setMetadata, clearGlobalError } = useErrorContext();
  
  // Track route changes and clear errors on navigation
  useEffect(() => {
    // Update error metadata with current route
    setMetadata({
      currentRoute: location.pathname,
      routeParams: location.search,
      navigationTimestamp: new Date().toISOString()
    });
    
    // Clear global errors when navigating to a new route
    clearGlobalError();
    
    // Optional: Log route changes for debugging
    console.log(`Navigation to: ${location.pathname}${location.search}`);
  }, [location.pathname, location.search, setMetadata, clearGlobalError]);
  
  // Wrap each route component with ErrorBoundary
  const withErrorBoundary = (Component, routeName) => (
    <ErrorBoundary boundary={`route:${routeName}`}>
      <React.Suspense fallback={<div>Loading...</div>}>
        {Component}
      </React.Suspense>
    </ErrorBoundary>
  );
  
  return (
    <Routes>
      <Route path="/login" element={withErrorBoundary(<LoginPage />, 'login')} />
      
      <Route path="/" element={withErrorBoundary(<RequireAuth><HomePage /></RequireAuth>, 'home')} />
      
      <Route path="/integrations" element={withErrorBoundary(<RequireAuth><IntegrationsPage /></RequireAuth>, 'integrations')} />
      <Route path="/integrations/:id" element={withErrorBoundary(<RequireAuth><IntegrationDetailPage /></RequireAuth>, 'integration-detail')} />
      
      <Route path="/earnings" element={withErrorBoundary(<RequireAuth><EarningsPage /></RequireAuth>, 'earnings')} />
      
      <Route path="/admin" element={withErrorBoundary(<RequireAdmin><AdminDashboardPage /></RequireAdmin>, 'admin')} />
      
      <Route path="/settings" element={withErrorBoundary(<RequireAuth><UserSettingsPage /></RequireAuth>, 'settings')} />
      
      {/* Development testing routes */}
      <Route path="/dev/test-s3" element={withErrorBoundary(<TestS3Configuration />, 'test-s3')} />
      <Route path="/dev/test-sharepoint" element={withErrorBoundary(<TestSharePointConfiguration />, 'test-sharepoint')} />
      <Route path="/dev/test-api-webhook" element={withErrorBoundary(<TestAPIWebhookConfiguration />, 'test-api-webhook')} />
      <Route path="/dev/test-docker-error" element={withErrorBoundary(<DockerErrorHandlingExample />, 'test-docker-error')} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
