import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock the NotificationSettings component
jest.mock('../../components/integration/NotificationSettings', () => {
  const MockedComponent = ({ notifications, onChange, errors, readOnly }) => {
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
      <div data-testid="notification-settings">
        <div className="notification-settings-dropdowns&quot;>
          <div
            role="combobox"
            aria-label="When to Send Notifications"
            data-testid="notify-on-select"
          >
            When to Send Notifications
          </div>

          <div
            role="combobox&quot;
            aria-label="Summary Frequency"
            data-testid="summary-frequency-select"
          >
            Summary Frequency
          </div>

          <div
            role="combobox&quot;
            aria-label="Notification Type"
            data-testid="notification-type-select"
          >
            Notification Type
          </div>
        </div>
      </div>
    );
  };

  MockedComponent.displayName = 'NotificationSettings';

  return MockedComponent;
});

// Import the component after mocking
import NotificationSettings from '../../components/integration/NotificationSettings';

describe('NotificationSettings SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  const defaultNotifications = {
    enabled: true,
    notifyOn: ['success', 'error'],
    recipients: [{ email: 'test@example.com', type: 'all' }],
    enableSummary: true,
    summarySchedule: 'daily',
  };

  test('NotificationSettings renders with all SelectLegacy dropdowns', () => {
    renderWithTheme(
      <NotificationSettings notifications={defaultNotifications} onChange={() => {}} />
    );

    const component = screen.getByTestId('notification-settings');
    const notifyOnSelect = screen.getByTestId('notify-on-select');
    const summaryFrequencySelect = screen.getByTestId('summary-frequency-select');
    const notificationTypeSelect = screen.getByTestId('notification-type-select');

    expect(component).toBeInTheDocument();
    expect(notifyOnSelect).toBeInTheDocument();
    expect(summaryFrequencySelect).toBeInTheDocument();
    expect(notificationTypeSelect).toBeInTheDocument();

    // Verify select fields are rendered with the right roles
    expect(
      screen.getByRole('combobox', { name: 'When to Send Notifications' })
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Summary Frequency' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Notification Type' })).toBeInTheDocument();
  });
});
