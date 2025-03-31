import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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

// Auth components
const RequireAuth = React.lazy(() => import('./components/auth/RequireAuth'));
const RequireAdmin = React.lazy(() => import('./components/auth/RequireAdmin'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
      
      <Route path="/integrations" element={<RequireAuth><IntegrationsPage /></RequireAuth>} />
      <Route path="/integrations/:id" element={<RequireAuth><IntegrationDetailPage /></RequireAuth>} />
      
      <Route path="/earnings" element={<RequireAuth><EarningsPage /></RequireAuth>} />
      
      <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
      
      <Route path="/settings" element={<RequireAuth><UserSettingsPage /></RequireAuth>} />
      
      {/* Development testing routes */}
      <Route path="/dev/test-s3" element={<TestS3Configuration />} />
      <Route path="/dev/test-sharepoint" element={<TestSharePointConfiguration />} />
      <Route path="/dev/test-api-webhook" element={<TestAPIWebhookConfiguration />} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
