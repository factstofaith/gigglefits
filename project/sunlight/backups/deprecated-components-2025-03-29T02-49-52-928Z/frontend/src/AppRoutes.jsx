// AppRoutes.jsx
// -----------------------------------------------------------------------------
// Centralized routing configuration with lazy-loaded route components

import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LinearProgress, Box } from './design-system';
import { ErrorBoundary } from './design-system/adapted';
import performanceMetrics from './utils/performanceMetrics';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/auth/RequireAdmin';

// Fallback loading component
const PageLoadingFallback = () => (
  <Box sx={{ width: '100%', pt: 2, px: 2 }}>
    <LinearProgress />
  </Box>
);

// Lazily loaded route components
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const IntegrationDetailPage = lazy(
  () => import('./pages/IntegrationDetailPage')
);
const EarningsPage = lazy(() => import('./pages/EarningsPage'));
const UserSettingsPage = lazy(() => import('./pages/UserSettingsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const DesignSystemDemo = lazy(() => import('./design-system/docs/DesignSystemDemo'));

// Documentation Pages
const PublicDocumentationPage = lazy(() => import('./pages/documentation/PublicDocumentationPage'));

// User Invitation System - Admin Pages
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const UserDetailPage = lazy(() => import('./pages/admin/UserDetailPage'));
const InvitationListPage = lazy(() => import('./pages/admin/InvitationListPage'));
const InvitationFormPage = lazy(() => import('./pages/admin/InvitationFormPage'));
const EmailConfigPage = lazy(() => import('./pages/admin/EmailConfigPage'));
const MFASettingsPage = lazy(() => import('./pages/admin/MFASettingsPage'));
const DocumentationManagementPage = lazy(() => import('./pages/admin/DocumentationManagementPage'));

// User Invitation System - Security Pages
const MFAVerificationPage = lazy(() => import('./pages/security/MFAVerificationPage'));
const MFAEnrollmentPage = lazy(() => import('./pages/security/MFAEnrollmentPage'));
const RecoveryCodesPage = lazy(() => import('./pages/security/RecoveryCodesPage'));

// User Invitation System - Invitation Pages
const AcceptInvitationPage = lazy(() => import('./pages/invitation/AcceptInvitationPage'));
const CompleteRegistrationPage = lazy(() => import('./pages/invitation/CompleteRegistrationPage'));
const OAuthCallbackPage = lazy(() => import('./pages/invitation/OAuthCallbackPage'));

// User Invitation System - Profile Pages
const UserProfilePage = lazy(() => import('./pages/profile/UserProfilePage'));
const SecuritySettingsPage = lazy(() => import('./pages/profile/SecuritySettingsPage'));
const LoginHistoryPage = lazy(() => import('./pages/profile/LoginHistoryPage'));

// Testing Pages
const ThemeTestPage = lazy(() => import('./pages/testing/ThemeTestPage'));

/**
 * Wrapper component for lazy-loaded routes to provide error boundary protection
 */
const LazyRouteWithErrorBoundary = ({ component: Component, ...props }) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);

/**
 * Main application routes with lazy loading
 * Using Suspense to show loading indicator while components are being loaded
 * Each lazy-loaded component is wrapped in an ErrorBoundary for graceful failure handling
 */
function AppRoutes() {
  // Added display name
  AppRoutes.displayName = 'AppRoutes';

  const location = useLocation();

  // Track route changes for performance metrics
  useEffect(() => {
    // Start timing for route load
    const routeName = location.pathname;
    const navigationTime = performanceMetrics.trackRouteChange(routeName);

    // Log detailed metrics for development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`📊 Navigation to ${routeName} took ${navigationTime.toFixed(2)}ms`);
    }

    // Track the initial view for analytics
    if (performanceMetrics.metrics.routeChangeCount === 1) {
      // This would connect to your analytics in a real app
      console.debug(`📊 Initial route: ${routeName}`);
    }
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/&quot; element={<LazyRouteWithErrorBoundary component={HomePage} />} />

          {/* Documentation routes */}
          <Route
            path="/documentation"
            element={<LazyRouteWithErrorBoundary component={PublicDocumentationPage} />}
          />

          {/* Integrations routes */}
          <Route
            path="/integrations&quot;
            element={<LazyRouteWithErrorBoundary component={IntegrationsPage} />}
          />
          <Route
            path="/integrations/:id"
            element={<LazyRouteWithErrorBoundary component={IntegrationDetailPage} />}
          />

          {/* Admin routes */}
          <Route
            path="/admin&quot;
            element={<LazyRouteWithErrorBoundary component={AdminDashboardPage} />}
          />

          {/* Earnings routes */}
          <Route
            path="/earnings/*"
            element={<LazyRouteWithErrorBoundary component={EarningsPage} />}
          />

          {/* User routes */}
          <Route
            path="/settings&quot;
            element={<LazyRouteWithErrorBoundary component={UserSettingsPage} />}
          />

          {/* Demo routes */}
          <Route
            path="/demo/design-system"
            element={<LazyRouteWithErrorBoundary component={DesignSystemDemo} />}
          />
          <Route
            path="/demo/theme-test&quot;
            element={<LazyRouteWithErrorBoundary component={ThemeTestPage} />}
          />

          {/* User Invitation System - Public Routes */}
          <Route 
            path="/invitation/verify/:token" 
            element={<LazyRouteWithErrorBoundary component={AcceptInvitationPage} />} 
          />
          <Route 
            path="/invitation/complete&quot; 
            element={<LazyRouteWithErrorBoundary component={CompleteRegistrationPage} />} 
          />
          <Route 
            path="/invitation/oauth/:provider/callback" 
            element={<LazyRouteWithErrorBoundary component={OAuthCallbackPage} />} 
          />
          <Route 
            path="/mfa-verify&quot; 
            element={<LazyRouteWithErrorBoundary component={MFAVerificationPage} />} 
          />

          {/* User Invitation System - Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                <LazyRouteWithErrorBoundary component={UserManagementPage} />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/users/:id&quot;
            element={
              <RequireAdmin>
                <LazyRouteWithErrorBoundary component={UserDetailPage} />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/invitations"
            element={
              <RequireAdmin>
                <LazyRouteWithErrorBoundary component={InvitationListPage} />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/invitations/new&quot;
            element={
              <RequireAdmin>
                <LazyRouteWithErrorBoundary component={InvitationFormPage} />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/email-config"
            element={
              <RequireAdmin>
                <LazyRouteWithErrorBoundary component={EmailConfigPage} />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/mfa-settings&quot;
            element={
              <RequireAdmin>
                <LazyRouteWithErrorBoundary component={MFASettingsPage} />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/documentation"
            element={
              <RequireAdmin>
                <LazyRouteWithErrorBoundary component={DocumentationManagementPage} />
              </RequireAdmin>
            }
          />

          {/* User Invitation System - User Routes */}
          <Route
            path="/profile&quot;
            element={
              <RequireAuth>
                <LazyRouteWithErrorBoundary component={UserProfilePage} />
              </RequireAuth>
            }
          />
          <Route
            path="/profile/security"
            element={
              <RequireAuth>
                <LazyRouteWithErrorBoundary component={SecuritySettingsPage} />
              </RequireAuth>
            }
          />
          <Route
            path="/profile/login-history&quot;
            element={
              <RequireAuth>
                <LazyRouteWithErrorBoundary component={LoginHistoryPage} />
              </RequireAuth>
            }
          />
          <Route
            path="/mfa/setup"
            element={
              <RequireAuth>
                <LazyRouteWithErrorBoundary component={MFAEnrollmentPage} />
              </RequireAuth>
            }
          />
          <Route
            path="/mfa/recovery-codes&quot;
            element={
              <RequireAuth>
                <LazyRouteWithErrorBoundary component={RecoveryCodesPage} />
              </RequireAuth>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRoutes;
