// tests/utils/notificationHelper.test.js

import notificationStore, {
  createNotificationManager,
  initNotificationHelper,
} from '../../utils/notificationHelper';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-id-123'),
}));

// Mock console.error to avoid cluttering the test output
const originalConsoleError = console.error;
console.error = jest.fn();

describe('notificationHelper', () => {
  let mockContext;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock context methods
    mockContext = {
      showToast: jest.fn(),
      addNotification: jest.fn().mockReturnValue('mock-id-123'),
      updateNotification: jest.fn(),
      removeNotification: jest.fn(),
      markAllAsRead: jest.fn(),
      clearAllNotifications: jest.fn(),
    };

    // Initialize the store with mock context
    initNotificationHelper(mockContext);
  });

  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  // Store initialization tests
  describe('Store Initialization', () => {
    it('should initialize the notification store with context', () => {
      expect(notificationStore.getContext()).toBe(mockContext);
    });

    it('should return the store instance when initialized', () => {
      const result = notificationStore.init(mockContext);
      expect(result).toBe(notificationStore);
    });

    it('should return null when getting context if not initialized', () => {
      // Create a clean store without context
      const tempStore = { ...notificationStore };
      tempStore.contextRef = null;
      
      expect(tempStore.getContext()).toBeNull();
      expect(console.error).toHaveBeenCalledWith('NotificationHelper: context not initialized');
    });
  });

  // Store method tests
  describe('Store Methods', () => {
    it('should show toast notifications via the store', () => {
      notificationStore.showToast('Test message', 'success', { duration: 3000 });

      expect(mockContext.showToast).toHaveBeenCalledWith('Test message', 'success', {
        duration: 3000,
      });
    });

    it('should use default values for toast type and options', () => {
      notificationStore.showToast('Simple message');

      expect(mockContext.showToast).toHaveBeenCalledWith('Simple message', 'info', {});
    });

    it('should add notifications via the store', () => {
      const notification = {
        title: 'Test Title',
        message: 'Test message',
        type: 'info',
      };

      const id = notificationStore.addNotification(notification);

      expect(mockContext.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
          message: 'Test message',
          type: 'info',
        })
      );

      expect(id).toBe('mock-id-123');
    });

    it('should generate a timestamp when adding notifications', () => {
      // Mock Date.now
      const originalDate = global.Date;
      const mockDate = new Date('2025-01-01T12:00:00Z');
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        
        static now() {
          return mockDate.getTime();
        }
        
        toISOString() {
          return '2025-01-01T12:00:00.000Z';
        }
      };

      notificationStore.addNotification({
        title: 'Timestamp Test',
        message: 'Should have timestamp',
      });

      expect(mockContext.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: '2025-01-01T12:00:00.000Z',
        })
      );

      // Restore Date
      global.Date = originalDate;
    });

    it('should preserve custom properties when adding notifications', () => {
      const notification = {
        title: 'Custom Test',
        message: 'With custom properties',
        customProp1: 'custom value 1',
        customProp2: 42,
        customObject: { nestedProp: true },
      };

      notificationStore.addNotification(notification);

      expect(mockContext.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          customProp1: 'custom value 1',
          customProp2: 42,
          customObject: { nestedProp: true },
        })
      );
    });

    it('should update notifications via the store', () => {
      notificationStore.updateNotification('test-id', { read: true });

      expect(mockContext.updateNotification).toHaveBeenCalledWith('test-id', { read: true });
    });

    it('should remove notifications via the store', () => {
      notificationStore.removeNotification('test-id');

      expect(mockContext.removeNotification).toHaveBeenCalledWith('test-id');
    });

    it('should mark notifications as read via the store', () => {
      notificationStore.markAsRead('test-id');

      expect(mockContext.updateNotification).toHaveBeenCalledWith('test-id', { read: true });
    });

    it('should mark all notifications as read via the store', () => {
      notificationStore.markAllAsRead();

      expect(mockContext.markAllAsRead).toHaveBeenCalled();
    });

    it('should clear all notifications via the store', () => {
      notificationStore.clearAllNotifications();

      expect(mockContext.clearAllNotifications).toHaveBeenCalled();
    });

    it('should handle missing properties in notification object', () => {
      // Add minimal notification
      notificationStore.addNotification({ message: 'Minimal notification' });

      // Check that default values were added
      expect(mockContext.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '',
          message: 'Minimal notification',
          type: 'info',
          read: false,
        })
      );
    });

    it('should handle action click callbacks in notifications', () => {
      const mockActionHandler = jest.fn();
      
      notificationStore.addNotification({
        title: 'Action Test',
        message: 'Click the action',
        actionLabel: 'Click Me',
        onActionClick: mockActionHandler,
      });

      const addedNotification = mockContext.addNotification.mock.calls[0][0];
      expect(addedNotification.actionLabel).toBe('Click Me');
      
      // Verify the action handler is callable
      addedNotification.onActionClick();
      expect(mockActionHandler).toHaveBeenCalled();
    });

    it('should gracefully handle missing context for all methods', () => {
      // Create a clean store without context
      const noContextStore = { ...notificationStore };
      noContextStore.contextRef = null;
      
      // None of these should throw errors
      noContextStore.showToast('Test');
      noContextStore.addNotification({ title: 'Test' });
      noContextStore.updateNotification('id', {});
      noContextStore.removeNotification('id');
      noContextStore.markAsRead('id');
      noContextStore.markAllAsRead();
      noContextStore.clearAllNotifications();
      
      // Context methods should not be called
      expect(mockContext.showToast).not.toHaveBeenCalled();
      expect(mockContext.addNotification).not.toHaveBeenCalled();
      expect(mockContext.updateNotification).not.toHaveBeenCalled();
      expect(mockContext.removeNotification).not.toHaveBeenCalled();
      expect(mockContext.markAllAsRead).not.toHaveBeenCalled();
      expect(mockContext.clearAllNotifications).not.toHaveBeenCalled();
    });
  });

  // Factory tests
  describe('Notification Manager Factory', () => {
    it('should create notification manager instances', () => {
      const manager = createNotificationManager();

      expect(manager).toBeDefined();
      expect(typeof manager.showToast).toBe('function');
      expect(typeof manager.addNotification).toBe('function');
      expect(typeof manager.updateNotification).toBe('function');
      expect(typeof manager.removeNotification).toBe('function');
      expect(typeof manager.markAsRead).toBe('function');
      expect(typeof manager.markAllAsRead).toBe('function');
      expect(typeof manager.clearAllNotifications).toBe('function');
    });

    it('should delegate to the store when calling manager methods', () => {
      const manager = createNotificationManager();
      
      // Setup spies on the store methods
      const showToastSpy = jest.spyOn(notificationStore, 'showToast');
      const addNotificationSpy = jest.spyOn(notificationStore, 'addNotification');
      const updateNotificationSpy = jest.spyOn(notificationStore, 'updateNotification');
      const removeNotificationSpy = jest.spyOn(notificationStore, 'removeNotification');
      const markAsReadSpy = jest.spyOn(notificationStore, 'markAsRead');
      const markAllAsReadSpy = jest.spyOn(notificationStore, 'markAllAsRead');
      const clearAllNotificationsSpy = jest.spyOn(notificationStore, 'clearAllNotifications');
      
      // Call all manager methods
      manager.showToast('Manager toast', 'info');
      manager.addNotification({ title: 'Manager notification' });
      manager.updateNotification('id', { read: true });
      manager.removeNotification('id');
      manager.markAsRead('id');
      manager.markAllAsRead();
      manager.clearAllNotifications();
      
      // Verify store methods were called
      expect(showToastSpy).toHaveBeenCalledWith('Manager toast', 'info', {});
      expect(addNotificationSpy).toHaveBeenCalledWith({ title: 'Manager notification' });
      expect(updateNotificationSpy).toHaveBeenCalledWith('id', { read: true });
      expect(removeNotificationSpy).toHaveBeenCalledWith('id');
      expect(markAsReadSpy).toHaveBeenCalledWith('id');
      expect(markAllAsReadSpy).toHaveBeenCalled();
      expect(clearAllNotificationsSpy).toHaveBeenCalled();
    });

    it('should allow different manager instances to coexist', () => {
      const manager1 = createNotificationManager();
      const manager2 = createNotificationManager();
      
      // Different managers should be independent objects
      expect(manager1).not.toBe(manager2);
      
      // But they should all delegate to the same store
      manager1.showToast('From manager 1');
      manager2.showToast('From manager 2');
      
      // Context should receive both calls
      expect(mockContext.showToast).toHaveBeenCalledTimes(2);
      expect(mockContext.showToast).toHaveBeenCalledWith('From manager 1', 'info', {});
      expect(mockContext.showToast).toHaveBeenCalledWith('From manager 2', 'info', {});
    });
  });

  // Integration tests
  describe('Integration with Services', () => {
    it('should work with third-party modules even before context initialization', () => {
      // Reset the store
      notificationStore.contextRef = null;
      
      // Create a manager
      const earlyManager = createNotificationManager();
      
      // Using it shouldn't throw errors, even without context
      expect(() => {
        earlyManager.showToast('Early message');
        earlyManager.addNotification({ title: 'Early notification' });
      }).not.toThrow();
      
      // Now initialize with context
      initNotificationHelper(mockContext);
      
      // Now calls should reach the context
      earlyManager.showToast('Later message');
      expect(mockContext.showToast).toHaveBeenCalledWith('Later message', 'info', {});
    });

    it('should support creating multiple managers for different modules', () => {
      // Create managers as if from different modules
      const authManager = createNotificationManager();
      const dataManager = createNotificationManager();
      const apiManager = createNotificationManager();
      
      // All should work with the same underlying context
      authManager.showToast('Auth message', 'success');
      dataManager.showToast('Data message', 'info');
      apiManager.showToast('API message', 'error');
      
      expect(mockContext.showToast).toHaveBeenCalledTimes(3);
      expect(mockContext.showToast).toHaveBeenCalledWith('Auth message', 'success', {});
      expect(mockContext.showToast).toHaveBeenCalledWith('Data message', 'info', {});
      expect(mockContext.showToast).toHaveBeenCalledWith('API message', 'error', {});
    });
  });
});
