// App.test.jsx
// -----------------------------------------------------------------------------
// Tests for App component with context providers and routing

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock AppRoutes component
jest.mock('../../../AppRoutes', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="app-routes">AppRoutes Component</div>),
  };
});

// Mock context providers
jest.mock('../../../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }) => <div data-testid="notification-provider">{children}</div>,
}));

jest.mock('../../../contexts/IntegrationContext', () => ({
  IntegrationProvider: ({ children }) => <div data-testid="integration-provider">{children}</div>,
}));

jest.mock('../../../contexts/EarningsContext', () => ({
  EarningsProvider: ({ children }) => <div data-testid="earnings-provider">{children}</div>,
}));

jest.mock('../../../contexts/ResourceContext', () => ({
  ResourceProvider: ({ children }) => <div data-testid="resource-provider">{children}</div>,
}));

jest.mock('../../../contexts/UserContext', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
}));

jest.mock('../../../contexts/SettingsContext', () => ({
  SettingsProvider: ({ children }) => <div data-testid="settings-provider">{children}</div>,
}));

jest.mock('../../../contexts/WebhookContext', () => ({
  WebhookProvider: ({ children }) => <div data-testid="webhook-provider">{children}</div>,
}));

// Import the component under test
import App from '../../../App';

describe('App Component', () => {
  test('renders with all required context providers', () => {
    render(<App />);

    // Verify all context providers are present
    expect(screen.getByTestId('settings-provider')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('notification-provider')).toBeInTheDocument();
    expect(screen.getByTestId('integration-provider')).toBeInTheDocument();
    expect(screen.getByTestId('earnings-provider')).toBeInTheDocument();
    expect(screen.getByTestId('resource-provider')).toBeInTheDocument();
    expect(screen.getByTestId('webhook-provider')).toBeInTheDocument();

    // Verify AppRoutes is rendered
    expect(screen.getByTestId('app-routes')).toBeInTheDocument();
  });

  test('renders providers in the correct order', () => {
    const { container } = render(<App />);

    // Get the DOM structure
    const html = container.innerHTML;

    // Check that providers are nested in the correct order
    // SettingsProvider > UserProvider > NotificationProvider > IntegrationProvider > EarningsProvider > ResourceProvider > WebhookProvider
    expect(html.indexOf('settings-provider')).toBeLessThan(html.indexOf('user-provider'));
    expect(html.indexOf('user-provider')).toBeLessThan(html.indexOf('notification-provider'));
    expect(html.indexOf('notification-provider')).toBeLessThan(
      html.indexOf('integration-provider')
    );
    expect(html.indexOf('integration-provider')).toBeLessThan(html.indexOf('earnings-provider'));
    expect(html.indexOf('earnings-provider')).toBeLessThan(html.indexOf('resource-provider'));
    expect(html.indexOf('resource-provider')).toBeLessThan(html.indexOf('webhook-provider'));
    expect(html.indexOf('webhook-provider')).toBeLessThan(html.indexOf('app-routes'));
  });
});
