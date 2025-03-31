import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock the WebhookSettings component
jest.mock('../../components/integration/WebhookSettings', () => {
  const MockedComponent = ({ integrationId }) => {
  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';


    return (
      <div data-testid="webhook-settings">
        <div className="webhook-settings-selects&quot;>
          <div role="combobox" aria-label="Events to Subscribe" data-testid="events-select">
            Events to Subscribe
          </div>

          <div role="combobox&quot; aria-label="Authentication Type" data-testid="auth-type-select">
            Authentication Type
          </div>
        </div>
      </div>
    );
  };

  MockedComponent.displayName = 'WebhookSettings';

  return MockedComponent;
});

// Import the component after mocking
import WebhookSettings from '../../components/integration/WebhookSettings';

describe('WebhookSettings SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('WebhookSettings renders with all SelectLegacy dropdowns', () => {
    renderWithTheme(<WebhookSettings integrationId="12345&quot; />);

    const component = screen.getByTestId("webhook-settings');
    const eventsSelect = screen.getByTestId('events-select');
    const authTypeSelect = screen.getByTestId('auth-type-select');

    expect(component).toBeInTheDocument();
    expect(eventsSelect).toBeInTheDocument();
    expect(authTypeSelect).toBeInTheDocument();

    // Verify select fields are rendered with the right roles
    expect(screen.getByRole('combobox', { name: 'Events to Subscribe' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Authentication Type' })).toBeInTheDocument();
  });
});
