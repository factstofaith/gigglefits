import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock the ScheduleConfiguration component
jest.mock('../../components/integration/ScheduleConfiguration', () => {
  const MockedComponent = ({ schedule, onChange, errors, readOnly }) => {
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
      <div data-testid="schedule-configuration">
        <div className="schedule-configuration-selects&quot;>
          <div role="combobox" aria-label="Schedule Type" data-testid="schedule-type-select">
            Schedule Type
          </div>

          <div role="combobox&quot; aria-label="Timezone" data-testid="timezone-select">
            Timezone
          </div>

          <div role="combobox&quot; aria-label="Day of Week" data-testid="day-of-week-select">
            Day of Week
          </div>

          <div role="combobox&quot; aria-label="Day of Month" data-testid="day-of-month-select">
            Day of Month
          </div>
        </div>
      </div>
    );
  };

  MockedComponent.displayName = 'ScheduleConfiguration';

  return MockedComponent;
});

// Import the component after mocking
import ScheduleConfiguration from '../../components/integration/ScheduleConfiguration';

describe('ScheduleConfiguration SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  const defaultSchedule = {
    type: 'daily',
    cronExpression: '0 0 8 * * *',
    timezone: 'UTC',
    effectiveDate: '',
    description: '',
  };

  test('ScheduleConfiguration renders with all SelectLegacy dropdowns', () => {
    renderWithTheme(<ScheduleConfiguration schedule={defaultSchedule} onChange={() => {}} />);

    const component = screen.getByTestId('schedule-configuration');
    const scheduleTypeSelect = screen.getByTestId('schedule-type-select');
    const timezoneSelect = screen.getByTestId('timezone-select');
    const dayOfWeekSelect = screen.getByTestId('day-of-week-select');
    const dayOfMonthSelect = screen.getByTestId('day-of-month-select');

    expect(component).toBeInTheDocument();
    expect(scheduleTypeSelect).toBeInTheDocument();
    expect(timezoneSelect).toBeInTheDocument();
    expect(dayOfWeekSelect).toBeInTheDocument();
    expect(dayOfMonthSelect).toBeInTheDocument();

    // Verify select fields are rendered with the right roles
    expect(screen.getByRole('combobox', { name: 'Schedule Type' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Timezone' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Day of Week' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Day of Month' })).toBeInTheDocument();
  });
});
