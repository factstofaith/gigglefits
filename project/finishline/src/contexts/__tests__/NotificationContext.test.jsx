/**
 * NotificationContext Tests
 * 
 * Tests for the NotificationContext provider and hook.
 */

import React from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationProvider, useNotification } from '../NotificationContext';

// Mock timer functions
jest.useFakeTimers();

// Test component that uses notifications
const TestComponent = () => {
  const { notifications, notify } = useNotification();
  
  return (
    <div data-testid="notification-test">
      <button 
        onClick={() => notify.success('Success message')} 
        data-testid="add-success"
      >
        Add Success
      </button>
      <button 
        onClick={() => notify.error('Error message')} 
        data-testid="add-error"
      >
        Add Error
      </button>
      <button 
        onClick={() => notify.warning('Warning message')} 
        data-testid="add-warning"
      >
        Add Warning
      </button>
      <button 
        onClick={() => notify.info('Info message')} 
        data-testid="add-info"
      >
        Add Info
      </button>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id} data-testid={`notification-${notification.type}`}>
            {notification.message} ({notification.type})
          </li>
        ))}
      </ul>
    </div>
  );
};

// Wrapper for testing hooks
const wrapper = ({ children }) => <NotificationProvider>{children}</NotificationProvider>;

describe('NotificationContext', () => {
  // Provider tests
  describe('NotificationProvider', () => {
    it('renders children correctly', () => {
      render(
        <NotificationProvider>
          <div data-testid="test-child">Test Child</div>
        </NotificationProvider>
      );
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('accepts custom maxNotifications', () => {
      const { result } = renderHook(() => useNotification(), { 
        wrapper: ({ children }) => (
          <NotificationProvider maxNotifications={3}>
            {children}
          </NotificationProvider>
        ) 
      });
      
      // Add 5 notifications (should only keep the last 3)
      act(() => {
        result.current.addNotification({ message: '1' });
        result.current.addNotification({ message: '2' });
        result.current.addNotification({ message: '3' });
        result.current.addNotification({ message: '4' });
        result.current.addNotification({ message: '5' });
      });
      
      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.notifications[0].message).toBe('3');
      expect(result.current.notifications[1].message).toBe('4');
      expect(result.current.notifications[2].message).toBe('5');
    });

    it('accepts custom autoHideDuration', () => {
      const { result } = renderHook(() => useNotification(), { 
        wrapper: ({ children }) => (
          <NotificationProvider autoHideDuration={2000}>
            {children}
          </NotificationProvider>
        ) 
      });
      
      act(() => {
        result.current.addNotification({ message: 'Test' });
      });
      
      // Notification should still be there at 1000ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.notifications).toHaveLength(1);
      
      // Notification should be gone at 2000ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  // Hook tests
  describe('useNotification', () => {
    it('returns the notifications array', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      
      expect(Array.isArray(result.current.notifications)).toBe(true);
      expect(result.current.notifications).toHaveLength(0);
    });

    it('can add a notification', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      
      act(() => {
        result.current.addNotification({ message: 'Test notification', type: 'info' });
      });
      
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].message).toBe('Test notification');
      expect(result.current.notifications[0].type).toBe('info');
    });

    it('can remove a notification', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      
      let notificationId;
      act(() => {
        notificationId = result.current.addNotification({ message: 'Test notification' });
      });
      
      expect(result.current.notifications).toHaveLength(1);
      
      act(() => {
        result.current.removeNotification(notificationId);
      });
      
      expect(result.current.notifications).toHaveLength(0);
    });

    it('can clear all notifications', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      
      act(() => {
        result.current.addNotification({ message: 'Test 1' });
        result.current.addNotification({ message: 'Test 2' });
        result.current.addNotification({ message: 'Test 3' });
      });
      
      expect(result.current.notifications).toHaveLength(3);
      
      act(() => {
        result.current.clearAllNotifications();
      });
      
      expect(result.current.notifications).toHaveLength(0);
    });

    it('automatically removes notifications after duration', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      
      act(() => {
        result.current.addNotification({ 
          message: 'Auto-hide test', 
          duration: 3000, 
          autoHide: true 
        });
      });
      
      expect(result.current.notifications).toHaveLength(1);
      
      // Advance time by 2999ms, notification should still be there
      act(() => {
        jest.advanceTimersByTime(2999);
      });
      expect(result.current.notifications).toHaveLength(1);
      
      // Advance time to 3000ms, notification should be gone
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current.notifications).toHaveLength(0);
    });

    it('does not auto-hide notifications with autoHide=false', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      
      act(() => {
        result.current.addNotification({ 
          message: 'Persistent notification', 
          autoHide: false 
        });
      });
      
      expect(result.current.notifications).toHaveLength(1);
      
      // Advance time by more than the default duration
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      // Notification should still be there
      expect(result.current.notifications).toHaveLength(1);
    });

    it('provides helper functions for notification types', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      
      act(() => {
        result.current.notify.success('Success message');
        result.current.notify.error('Error message');
        result.current.notify.warning('Warning message');
        result.current.notify.info('Info message');
      });
      
      expect(result.current.notifications).toHaveLength(4);
      expect(result.current.notifications[0].type).toBe('success');
      expect(result.current.notifications[1].type).toBe('error');
      expect(result.current.notifications[2].type).toBe('warning');
      expect(result.current.notifications[3].type).toBe('info');
    });

    it('throws an error when used outside of NotificationProvider', () => {
      // Suppress console.error for this test to avoid noisy output
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        renderHook(() => useNotification());
      }).toThrow('useNotification must be used within a NotificationProvider');
      
      // Restore console.error
      console.error = originalError;
    });
  });
});