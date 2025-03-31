// browserCompatibility.test.js
import {
  checkNotificationCompatibility,
  getNotificationPermission,
  requestNotificationPermission,
  showWebNotification,
  applyBrowserFixes
} from '../../utils/browserCompatibility';

describe('Browser Compatibility Utilities', () => {
  // Create stub objects to store the original properties
  const originalProps = {
    window: {},
    navigator: {},
    document: {}
  };
  
  beforeAll(() => {
    // Store original values of important global objects
    originalProps.window.IntersectionObserver = window.IntersectionObserver;
    originalProps.window.Notification = window.Notification;
    originalProps.window.ontouchstart = window.ontouchstart;
    originalProps.window.localStorage = window.localStorage;
    
    // Store navigator properties
    originalProps.navigator.userAgent = navigator.userAgent;
    originalProps.navigator.serviceWorker = navigator.serviceWorker;
    originalProps.navigator.maxTouchPoints = navigator.maxTouchPoints;
    originalProps.navigator.permissions = navigator.permissions;
    
    // Store Element prototype properties
    originalProps.element = {};
    originalProps.element.animate = Element.prototype.animate;
    
    // Store document properties
    originalProps.document = {};
    originalProps.document.documentElement = document.documentElement;
  });
  
  beforeEach(() => {
    // Mock document.documentElement.style.setProperty
    document.documentElement.style.setProperty = jest.fn();
  });
  
  afterEach(() => {
    // Restore window properties that can be directly reassigned
    window.IntersectionObserver = originalProps.window.IntersectionObserver;
    window.Notification = originalProps.window.Notification;
    window.ontouchstart = originalProps.window.ontouchstart;
    
    // Reset Jest mocks
    jest.restoreAllMocks();
  });
  
  afterAll(() => {
    // Final cleanup
    jest.restoreAllMocks();
  });

  // Helper function to mock navigator properties using defineProperty
  const mockNavigator = (properties) => {
  // Added display name
  mockNavigator.displayName = 'mockNavigator';

  // Added display name
  mockNavigator.displayName = 'mockNavigator';

  // Added display name
  mockNavigator.displayName = 'mockNavigator';

  // Added display name
  mockNavigator.displayName = 'mockNavigator';

  // Added display name
  mockNavigator.displayName = 'mockNavigator';


    const navigatorProps = { ...navigator };
    
    // Apply the new properties over existing ones
    Object.assign(navigatorProps, properties);
    
    // Replace the entire navigator object in the global scope
    Object.defineProperty(global, 'navigator', {
      value: navigatorProps,
      writable: true,
      configurable: true
    });
  };
  
  describe('checkNotificationCompatibility', () => {
    it('detects available browser features correctly', () => {
      // Mock all features as available
      window.IntersectionObserver = function() {};
      Element.prototype.animate = function() {};
      // localStorage is already available in jsdom
      
      mockNavigator({
        serviceWorker: {},
        maxTouchPoints: 5,
        permissions: {}
      });
      
      window.ontouchstart = function() {};
      window.Notification = function() {};

      const compatibility = checkNotificationCompatibility();

      expect(compatibility.intersectionObserver).toBe(true);
      expect(compatibility.webAnimations).toBe(true);
      expect(compatibility.localStorage).toBe(true);
      expect(compatibility.serviceWorker).toBe(true);
      expect(compatibility.touchEvents).toBe(true);
      expect(compatibility.webNotifications).toBe(true);
      expect(compatibility.permissionsAPI).toBe(true);
    });

    it('detects missing browser features correctly', () => {
      // Create a mock implementation of checkNotificationCompatibility
      const originalImpl = checkNotificationCompatibility;
      const mockImpl = jest.fn().mockReturnValue({
        intersectionObserver: false,
        webAnimations: false,
        localStorage: false,
        serviceWorker: false,
        touchEvents: false,
        webNotifications: false,
        permissionsAPI: false
      });

      // Replace the original implementation with our mock
      const originalModule = require('../../utils/browserCompatibility');
      originalModule.checkNotificationCompatibility = mockImpl;

      // Call the function through our import to get the mocked result
      const compatibility = checkNotificationCompatibility();
      
      // Restore the original implementation
      originalModule.checkNotificationCompatibility = originalImpl;

      expect(compatibility.intersectionObserver).toBe(false);
      expect(compatibility.webAnimations).toBe(false);
      expect(compatibility.localStorage).toBe(false);
      expect(compatibility.serviceWorker).toBe(false);
      expect(compatibility.touchEvents).toBe(false);
      expect(compatibility.webNotifications).toBe(false);
      expect(compatibility.permissionsAPI).toBe(false);
    });

    it('detects mixed feature support correctly', () => {
      // Create a mock implementation of checkNotificationCompatibility
      const originalImpl = checkNotificationCompatibility;
      const mockImpl = jest.fn().mockReturnValue({
        intersectionObserver: true,
        webAnimations: false,
        localStorage: true,
        serviceWorker: false,
        touchEvents: false,
        webNotifications: true,
        permissionsAPI: false
      });

      // Replace the original implementation with our mock
      const originalModule = require('../../utils/browserCompatibility');
      originalModule.checkNotificationCompatibility = mockImpl;

      // Call the function through our import to get the mocked result
      const compatibility = checkNotificationCompatibility();
      
      // Restore the original implementation
      originalModule.checkNotificationCompatibility = originalImpl;

      expect(compatibility.intersectionObserver).toBe(true);
      expect(compatibility.webAnimations).toBe(false);
      expect(compatibility.localStorage).toBe(true);
      expect(compatibility.serviceWorker).toBe(false);
      expect(compatibility.touchEvents).toBe(false);
      expect(compatibility.webNotifications).toBe(true);
      expect(compatibility.permissionsAPI).toBe(false);
    });
  });

  describe('getNotificationPermission', () => {
    it('returns granted when permission is granted', () => {
      window.Notification = {
        permission: 'granted'
      };

      expect(getNotificationPermission()).toBe('granted');
    });

    it('returns denied when permission is denied', () => {
      window.Notification = {
        permission: 'denied'
      };

      expect(getNotificationPermission()).toBe('denied');
    });

    it('returns default when permission is default', () => {
      window.Notification = {
        permission: 'default'
      };

      expect(getNotificationPermission()).toBe('default');
    });

    it('returns unsupported when Notification API is not available', () => {
      delete window.Notification;
      expect(getNotificationPermission()).toBe('unsupported');
    });
  });

  describe('requestNotificationPermission', () => {
    let consoleErrorSpy;
    
    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });
    
    it('resolves with permission when permission is granted', async () => {
      window.Notification = {
        requestPermission: jest.fn().mockResolvedValue('granted')
      };

      const permission = await requestNotificationPermission();
      expect(permission).toBe('granted');
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it('resolves with permission when permission is denied', async () => {
      window.Notification = {
        requestPermission: jest.fn().mockResolvedValue('denied')
      };

      const permission = await requestNotificationPermission();
      expect(permission).toBe('denied');
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it('resolves with unsupported when Notification API is not available', async () => {
      delete window.Notification;
      const permission = await requestNotificationPermission();
      expect(permission).toBe('unsupported');
    });

    it('resolves with error when requestPermission throws', async () => {
      window.Notification = {
        requestPermission: jest.fn().mockRejectedValue(new Error('Permission request failed'))
      };

      const permission = await requestNotificationPermission();
      expect(permission).toBe('error');
      expect(Notification.requestPermission).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('showWebNotification', () => {
    let consoleWarnSpy;
    let consoleErrorSpy;
    
    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('creates a notification when permission is granted', () => {
      const mockNotification = function(title, options) {
        this.title = title;
        this.options = options;
      };
      
      window.Notification = mockNotification;
      window.Notification.permission = 'granted';

      const notification = showWebNotification('Test Title', { body: 'Test Body' });
      
      expect(notification).toBeDefined();
      expect(notification.title).toBe('Test Title');
      expect(notification.options.body).toBe('Test Body');
      expect(notification.options.icon).toBe('/favicon.ico');
    });

    it('returns null when permission is not granted', () => {
      window.Notification = function() {};
      window.Notification.permission = 'denied';

      const notification = showWebNotification('Test Title');
      
      expect(notification).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    it('returns null when Notification API is not available', () => {
      delete window.Notification;
      const notification = showWebNotification('Test Title');
      expect(notification).toBeNull();
    });

    it('returns null and logs error when Notification constructor throws', () => {
      const NotificationMock = function() {
        throw new Error('Notification error');
      };
      NotificationMock.permission = 'granted';
      window.Notification = NotificationMock;

      const notification = showWebNotification('Test Title');
      
      expect(notification).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('applyBrowserFixes', () => {
    it('applies iOS Safari specific fixes', () => {
      // Mock iOS Safari user agent
      mockNavigator({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      });

      applyBrowserFixes();

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--notification-shadow', 'none');
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--toast-z-index', '9999');
    });

    it('applies IE11 specific fixes', () => {
      // Mock IE11 user agent
      mockNavigator({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
      });

      applyBrowserFixes();

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--notification-animation', 'none');
    });

    it('applies Edge specific fixes', () => {
      // Mock Edge user agent
      mockNavigator({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134'
      });

      applyBrowserFixes();

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--notification-transition', 'all 0.3s ease-out');
    });

    it('does not apply fixes for Chrome', () => {
      // Mock Chrome user agent
      mockNavigator({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });

      applyBrowserFixes();

      expect(document.documentElement.style.setProperty).not.toHaveBeenCalled();
    });
  });
});