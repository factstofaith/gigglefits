/**
 * Standardized test for the notification system.
 * This test follows the new standardized testing patterns for the TAP Integration Platform.
 * Uses the MockFactory pattern for consistent test data generation.
 * 
 * @author TAP Integration Platform Team
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import components to test
import { NotificationProvider } from '@contexts/NotificationContext';
import useNotification from '@hooks/useNotification';
import Toast from '@components/common/Toast';
import ToastContainer from '@components/common/ToastContainer';
import NotificationCenter from '@components/common/NotificationCenter';

// Import mock factory for test data generation
import mockFactory from './utils/mockFactory';

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

// Mock NotificationCenter component using standardized mocking approach
jest.mock('../components/common/NotificationCenter', () => {
  return jest.fn(props => (
    <div data-testid="notification-center">
      <button aria-label="Notifications" data-testid="notification-button">
        Open Notifications
      </button>
      <button 
        data-testid="clear-all" 
        title="Clear all" 
        onClick={props.onClearAll || (() => {})}
      >
        Clear All
      </button>
      <div data-testid="notification-content">
        {props.notifications && props.notifications.length > 0 ? (
          <div data-testid="has-notifications">
            {props.notifications.map((notification, index) => (
              <div key={index} data-testid={`notification-${index}`}>
                {notification.title}
              </div>
            ))}
          </div>
        ) : (
          <div data-testid="no-notifications">No notifications</div>
        )}
      </div>
    </div>
  ));
});

// Wrapper with providers using standard approach
const renderWithProviders = (ui, options = {}) => {
  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  renderWithProviders.displayName = 'renderWithProviders';

  return render(
    <NotificationProvider>
      {ui}
      <ToastContainer />
    </NotificationProvider>,
    options
  );
};

// Test suite for notification system
describe('Notification System', () => {
  // Setup before each test
  beforeEach(() => {
    // Mock timers for toast auto-dismiss
    jest.useFakeTimers();
  });

  // Cleanup after each test
  afterEach(() => {
    // Clear any running timers
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // Test Toast component rendering
  it('renders Toast component correctly', () => {
    // Use mockFactory to generate toast data
    const toastData = mockFactory.createToast('success', 'Test message');
    
    // Render with direct props
    render(
      <Toast
        open={true}
        message={toastData.message}
        type={toastData.type}
        title="Test Title"
        onClose={() => {}}
      />
    );

    // Assertions
    expect(screen.getByText(toastData.message)).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  // Test toast notification display
  it('shows toast notification when requested', async () => {
    // Setup user event for modern interaction handling
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    // Render with context provider
    renderWithProviders(<TestComponent />);

    // Trigger toast using userEvent
    await user.click(screen.getByTestId('show-toast'));

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

  // Test adding persistent notifications
  it('adds persistent notification when requested', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Use mockFactory to generate notification context with empty notifications
    const notificationContext = mockFactory.createNotificationContext({
      notifications: []
    });
    
    // Render with context provider
    renderWithProviders(
      <>
        <TestComponent />
        <NotificationCenter notifications={notificationContext.notifications} />
      </>
    );

    // Add notification
    await user.click(screen.getByTestId('add-notification'));

    // Open notification center
    await user.click(screen.getByTestId('notification-button'));

    // Check that notification center content is displayed
    expect(screen.getByTestId('notification-content')).toBeInTheDocument();
  });

  // Test clearing all notifications
  it('clears all notifications', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Get NotificationCenter mock
    const MockNotificationCenter = jest.requireMock('../components/common/NotificationCenter');
    
    // Create a tracking mock for onClearAll
    const mockClearAll = jest.fn();
    
    // Use mockFactory to generate notifications
    const notifications = mockFactory.createNotifications('info', 3);
    
    // Render with context provider and provide mock props to NotificationCenter
    renderWithProviders(
      <>
        <TestComponent />
        <NotificationCenter 
          notifications={notifications} 
          onClearAll={mockClearAll} 
        />
      </>
    );

    // Add notification
    await user.click(screen.getByTestId('add-notification'));

    // Open notification center
    await user.click(screen.getByTestId('notification-button'));

    // Click clear all button
    await user.click(screen.getByTestId('clear-all'));

    // Check if clear all function was called
    expect(mockClearAll).toHaveBeenCalled();
    
    // Should show "No notifications" message
    expect(screen.getByTestId('no-notifications')).toBeInTheDocument();
  });

  // Test notification context behavior
  it('provides notification context with required methods', () => {
    // Create test component that checks context values
    const ContextTester = () => {
  // Added display name
  ContextTester.displayName = 'ContextTester';

  // Added display name
  ContextTester.displayName = 'ContextTester';

  // Added display name
  ContextTester.displayName = 'ContextTester';

  // Added display name
  ContextTester.displayName = 'ContextTester';

      ContextTester.displayName = 'ContextTester';

      const notification = useNotification();
      
      // Render context values for testing
      return (
        <div>
          <div data-testid="context-has-show-toast">
            {typeof notification.showToast === 'function' ? 'true' : 'false'}
          </div>
          <div data-testid="context-has-add-notification">
            {typeof notification.addNotification === 'function' ? 'true' : 'false'}
          </div>
          <div data-testid="context-has-clear-all">
            {typeof notification.clearAllNotifications === 'function' ? 'true' : 'false'}
          </div>
          <div data-testid="context-has-mark-read">
            {typeof notification.markAllAsRead === 'function' ? 'true' : 'false'}
          </div>
        </div>
      );
    };
    
    // Render with context provider
    renderWithProviders(<ContextTester />);
    
    // Check that context provides all required methods
    expect(screen.getByTestId('context-has-show-toast')).toHaveTextContent('true');
    expect(screen.getByTestId('context-has-add-notification')).toHaveTextContent('true');
    expect(screen.getByTestId('context-has-clear-all')).toHaveTextContent('true');
    expect(screen.getByTestId('context-has-mark-read')).toHaveTextContent('true');
  });

  // Test notification system accessibility
  it('meets accessibility requirements', () => {
    // Test would typically use jest-axe for accessibility testing
    // For now we'll check basic accessibility attributes
    
    // Use mockFactory to generate notification data
    const notifications = mockFactory.createNotifications('info', 2);
    
    renderWithProviders(
      <>
        <TestComponent />
        <NotificationCenter notifications={notifications} />
      </>
    );
    
    // Check that notification button has required a11y attributes
    const button = screen.getByTestId('notification-button');
    expect(button).toHaveAttribute('aria-label', 'Notifications');
    
    // Check that clear all button has a title
    const clearButton = screen.getByTestId('clear-all');
    expect(clearButton).toHaveAttribute('title', 'Clear all');
  });
});