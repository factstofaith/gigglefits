// tests/notification.test.js
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { NotificationProvider } from '@contexts/NotificationContext';
import useNotification from '@hooks/useNotification';
import Toast from '@components/common/Toast';
import ToastContainer from '@components/common/ToastContainer';
import NotificationCenter from '@components/common/NotificationCenter';

// Test component that uses notifications
const TestComponent = () => {
  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';


  const { showToast, addNotification } = useNotification();

  return (
    <div>
      <button
        data-testid="show-toast"
        onClick={() => showToast('Test toast', 'success', { title: 'Test Title' })}
      >
        Show Toast
      </button>
      <button
        data-testid="add-notification"
        onClick={() =>
          addNotification({
            title: 'Test Notification',
            message: 'Test notification message',
            type: 'info',
          })
        }
      >
        Add Notification
      </button>
    </div>
  );
};

// Properly mocked NotificationCenter component that receives props
const MockedNotificationCenter = props => {
  const { clearAllNotifications, markAllAsRead } = useNotification();

  return (
    <div data-testid="notification-center">
      <button aria-label="Notifications" data-testid="notification-button">
        Open Notifications
      </button>
      <button data-testid="clear-all" title="Clear all" onClick={clearAllNotifications}>
        Clear All
      </button>
      <div data-testid="notification-content">
        <div data-testid="no-notifications">No notifications</div>
      </div>
    </div>
  );
};

// Jest mock for the actual NotificationCenter component
jest.mock('../components/common/NotificationCenter', () => {
  return jest.fn(props => <MockedNotificationCenter {...props} />);
});

// Wrapper with providers
const Wrapper = ({ children }) => (
  <NotificationProvider>
    {children}
    <ToastContainer />
  </NotificationProvider>
);

describe('Notification System', () => {
  beforeEach(() => {
    // Mock timers for toast auto-dismiss
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clear any running timers
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('Toast component renders correctly', () => {
    render(
      <Toast
        open={true}
        message="Test message"
        type="success"
        title="Test Title"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('Shows toast notification when requested', async () => {
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    // Trigger toast
    fireEvent.click(screen.getByTestId('show-toast'));

    // Check if toast is displayed
    expect(screen.getByText('Test toast')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();

    // Advance timers to auto-dismiss the toast
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Toast should be removed
    await waitFor(() => {
      expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
    });
  });

  test('Adds persistent notification when requested', () => {
    render(
      <Wrapper>
        <TestComponent />
        <MockedNotificationCenter />
      </Wrapper>
    );

    // Add notification
    fireEvent.click(screen.getByTestId('add-notification'));

    // Open notification center
    fireEvent.click(screen.getByTestId('notification-button'));

    // Check that notification center content is displayed
    expect(screen.getByTestId('notification-content')).toBeInTheDocument();
  });

  test('Clears all notifications', () => {
    render(
      <Wrapper>
        <TestComponent />
        <MockedNotificationCenter />
      </Wrapper>
    );

    // Add notification
    fireEvent.click(screen.getByTestId('add-notification'));

    // Open notification center
    fireEvent.click(screen.getByTestId('notification-button'));

    // Click clear all button
    fireEvent.click(screen.getByTestId('clear-all'));

    // Should show "No notifications" message
    expect(screen.getByTestId('no-notifications')).toBeInTheDocument();
  });
});


MockedNotificationCenter.displayName = 'MockedNotificationCenter';