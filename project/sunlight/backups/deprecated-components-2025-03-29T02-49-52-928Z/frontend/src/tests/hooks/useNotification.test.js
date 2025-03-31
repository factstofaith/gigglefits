// src/tests/hooks/useNotification.test.js
import { renderHook, act } from '@testing-library/react';
import { useNotification } from '@hooks/useNotification';
import { NotificationProvider } from '@contexts/NotificationContext';
import React from 'react';

describe('useNotification', () => {
  // Test initial state when used without a provider
  it('returns stub methods when used outside of NotificationProvider', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { result } = renderHook(() => useNotification());
    
    // Check that warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'useNotification: NotificationContext not found in React context'
    );
    
    // Verify stub methods are returned
    expect(result.current).toEqual({
      showToast: expect.any(Function),
      addNotification: expect.any(Function),
      updateNotification: expect.any(Function),
      removeNotification: expect.any(Function),
      markAllAsRead: expect.any(Function),
      clearAllNotifications: expect.any(Function),
      toggleNotificationCenter: expect.any(Function),
      notifications: [],
      toasts: [],
    });
    
    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });

  // Test when used with a provider
  it('returns notification context when used with NotificationProvider', () => {
    const wrapper = ({ children }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    
    const { result } = renderHook(() => useNotification(), { wrapper });
    
    // Verify context methods are available
    expect(result.current).toMatchObject({
      showToast: expect.any(Function),
      addNotification: expect.any(Function),
      updateNotification: expect.any(Function),
      removeNotification: expect.any(Function),
      markAllAsRead: expect.any(Function),
      clearAllNotifications: expect.any(Function),
      toggleNotificationCenter: expect.any(Function),
      notifications: expect.any(Array),
      toasts: expect.any(Array),
      preferences: expect.any(Object),
      notificationCenter: expect.any(Object),
    });
  });

  // Test showToast functionality
  it('can show and remove toast notifications', async () => {
    const wrapper = ({ children }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    
    const { result } = renderHook(() => useNotification(), { wrapper });
    
    // Initial state should have no toasts
    expect(result.current.toasts).toHaveLength(0);
    
    // Show a toast
    let toastId;
    act(() => {
      toastId = result.current.showToast('Test toast', 'success', { duration: 10000 });
    });
    
    // Verify toast was added
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      id: toastId,
      message: 'Test toast',
      type: 'success',
      duration: 10000,
    });
    
    // Remove the toast
    act(() => {
      result.current.removeToast(toastId);
    });
    
    // Verify toast was removed
    expect(result.current.toasts).toHaveLength(0);
  });

  // Test addNotification functionality
  it('can add and manage persistent notifications', () => {
    const wrapper = ({ children }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    
    const { result } = renderHook(() => useNotification(), { wrapper });
    
    // Initial state should have no notifications
    expect(result.current.notifications).toHaveLength(0);
    
    // Add a notification
    let notificationId;
    act(() => {
      notificationId = result.current.addNotification({
        title: 'Test notification',
        message: 'This is a test notification',
        type: 'info',
      });
    });
    
    // Verify notification was added
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      id: notificationId,
      title: 'Test notification',
      message: 'This is a test notification',
      type: 'info',
      read: false,
    });
    
    // Unread count should be 1
    expect(result.current.notificationCenter.unreadCount).toBe(1);
    
    // Mark notification as read
    act(() => {
      result.current.updateNotification(notificationId, { read: true });
    });
    
    // Verify notification was updated
    expect(result.current.notifications[0].read).toBe(true);
    
    // Unread count should be 0
    expect(result.current.notificationCenter.unreadCount).toBe(0);
    
    // Remove the notification
    act(() => {
      result.current.removeNotification(notificationId);
    });
    
    // Verify notification was removed
    expect(result.current.notifications).toHaveLength(0);
  });

  // Test markAllAsRead and clearAllNotifications
  it('can mark all notifications as read and clear all notifications', () => {
    const wrapper = ({ children }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    
    const { result } = renderHook(() => useNotification(), { wrapper });
    
    // Add multiple notifications
    act(() => {
      result.current.addNotification({
        title: 'Notification 1',
        message: 'Message 1',
      });
      result.current.addNotification({
        title: 'Notification 2',
        message: 'Message 2',
      });
      result.current.addNotification({
        title: 'Notification 3',
        message: 'Message 3',
      });
    });
    
    // Verify unread count is 3
    expect(result.current.notificationCenter.unreadCount).toBe(3);
    expect(result.current.notifications).toHaveLength(3);
    
    // Mark all as read
    act(() => {
      result.current.markAllAsRead();
    });
    
    // Verify all notifications are read
    expect(result.current.notificationCenter.unreadCount).toBe(0);
    expect(result.current.notifications.every(n => n.read)).toBe(true);
    
    // Clear all notifications
    act(() => {
      result.current.clearAllNotifications();
    });
    
    // Verify notifications are cleared
    expect(result.current.notifications).toHaveLength(0);
  });

  // Test toggleNotificationCenter
  it('can toggle notification center visibility', () => {
    const wrapper = ({ children }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    
    const { result } = renderHook(() => useNotification(), { wrapper });
    
    // Initial state should have notification center closed
    expect(result.current.notificationCenter.isOpen).toBe(false);
    
    // Open notification center
    act(() => {
      result.current.toggleNotificationCenter(true);
    });
    
    // Verify notification center is open
    expect(result.current.notificationCenter.isOpen).toBe(true);
    
    // Toggle notification center
    act(() => {
      result.current.toggleNotificationCenter();
    });
    
    // Verify notification center is closed
    expect(result.current.notificationCenter.isOpen).toBe(false);
  });
});