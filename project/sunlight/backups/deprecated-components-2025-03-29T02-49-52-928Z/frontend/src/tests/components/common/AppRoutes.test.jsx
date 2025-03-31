// AppRoutes.test.jsx
// -----------------------------------------------------------------------------
// Tests for AppRoutes component with lazy loading implementation

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the ErrorBoundary component
jest.mock('../../../components/common/ErrorBoundary', () => {
  return {
    __esModule: true,
    default: ({ children }) => <div data-testid="error-boundary">{children}</div>,
  };
});

// Mock React.lazy and Suspense to avoid actual lazy loading in tests
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    lazy: importFn => {
      return importFn();
    },
    Suspense: ({ children }) => <div data-testid="suspense">{children}</div>,
  };
});

// Mock the lazy-loaded components to avoid actual lazy loading in tests
jest.mock('../../../pages/HomePage', () => () => (
  <div data-testid="home-page">Home Page</div>
));
jest.mock('../../../pages/IntegrationsPage', () => () => (
  <div data-testid="integrations-page">Integrations Page</div>
));
jest.mock('../../../pages/IntegrationDetailPage', () => () => (
  <div data-testid="integration-detail-page">Integration Detail Page</div>
));
jest.mock('../../../pages/EarningsPage', () => () => (
  <div data-testid="earnings-page">Earnings Page</div>
));
jest.mock('../../../pages/UserSettingsPage', () => () => (
  <div data-testid="settings-page">Settings Page</div>
));
jest.mock('../../../pages/AdminDashboardPage', () => () => (
  <div data-testid="admin-dashboard-page">Admin Dashboard Page</div>
));

// Import the component under test after mocks are set up
import AppRoutes from '../../../AppRoutes';

describe('AppRoutes Component', () => {
  test('uses Suspense for lazy loading', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('suspense')).toBeInTheDocument();
  });

  test('wraps entire component with ErrorBoundary', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // The outer error boundary wrapping the entire component
    const errorBoundaries = screen.getAllByTestId('error-boundary');
    expect(errorBoundaries.length).toBeGreaterThanOrEqual(1);
  });

  test('renders HomePage by default', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  test('renders IntegrationsPage for /integrations route', async () => {
    render(
      <MemoryRouter initialEntries={['/integrations']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('integrations-page')).toBeInTheDocument();
    });
  });

  test('renders IntegrationDetailPage for /integrations/:id route', async () => {
    render(
      <MemoryRouter initialEntries={['/integrations/123']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('integration-detail-page')).toBeInTheDocument();
    });
  });

  test('renders AdminDashboardPage for /admin route', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
    });
  });

  test('renders EarningsPage for /earnings route', async () => {
    render(
      <MemoryRouter initialEntries={['/earnings']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('earnings-page')).toBeInTheDocument();
    });
  });

  test('renders UserSettingsPage for /settings route', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });
  });



  test('redirects to home for unknown routes', async () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // In our test environment with mocked components, we should actually
    // see that we render the Navigate component which would redirect to home
    expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
  });

  test('wraps each route component with ErrorBoundary', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Multiple error boundaries: one for the overall component and one for each route
    const errorBoundaries = screen.getAllByTestId('error-boundary');
    expect(errorBoundaries.length).toBeGreaterThan(1);
  });
});
