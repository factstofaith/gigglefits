/**
 * Application Routes with Code Splitting
 * 
 * Implements route-based code splitting using React.lazy and Suspense.
 * 
 * @module AppRoutes
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazyRoute } from './utils/codeSplitting';

// Layout components
const MainLayout = lazy(() => import('./components/layout/MainLayout'));

// Lazy load page components
const HomePage = lazyRoute(() => import('./pages/HomePage'));
const LoginPage = lazyRoute(() => import('./pages/LoginPage'));
const IntegrationsPage = lazyRoute(() => import('./pages/IntegrationsPage'));
const IntegrationDetailPage = lazyRoute(() => import('./pages/IntegrationDetailPage'));
const UserSettingsPage = lazyRoute(() => import('./pages/UserSettingsPage'));
const AdminDashboardPage = lazyRoute(() => import('./pages/AdminDashboardPage'));
const EarningsPage = lazyRoute(() => import('./pages/EarningsPage'));

// Error and fallback pages
const NotFoundPage = lazyRoute(() => import('./pages/NotFoundPage'));
const ErrorBoundaryPage = lazyRoute(() => import('./pages/ErrorBoundaryPage'));

// Auth components
const RequireAuth = lazy(() => import('./components/auth/RequireAuth'));
const RequireAdmin = lazy(() => import('./components/auth/RequireAdmin'));

// Loading fallback
const LoadingFallback = () => (
  <div className="page-loading-fallback">
    <div className="loading-spinner"></div>
    <p>Loading page...</p>
  </div>
);

/**
 * Application Routes Component
 * 
 * @returns {JSX.Element} Routes component
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <RequireAuth />
            </Suspense>
          }
        >
          <Route 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout />
              </Suspense>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/integrations/:id" element={<IntegrationDetailPage />} />
            <Route path="/settings" element={<UserSettingsPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            
            {/* Admin routes */}
            <Route 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <RequireAdmin />
                </Suspense>
              }
            >
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Route>
        
        {/* Error and fallback routes */}
        <Route path="/error" element={<ErrorBoundaryPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;