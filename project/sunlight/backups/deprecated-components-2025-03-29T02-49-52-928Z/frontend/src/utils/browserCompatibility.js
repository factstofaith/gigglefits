/**
 * browserCompatibility.js
 * -----------------------------------------------------------------------------
 * Utilities for checking browser compatibility and handling browser-specific
 * behavior for notifications and other features.
 * 
 * @module utils/browserCompatibility
 */

/**
 * Check if the browser supports various notification and web features
 * Used to determine which notification capabilities are available
 * 
 * @function
 * @returns {Object} Object with flags for various compatibility checks
 * @property {boolean} intersectionObserver - Support for Intersection Observer API (used for notification visibility tracking)
 * @property {boolean} webAnimations - Support for Web Animations API (used for notification animations)
 * @property {boolean} localStorage - Support for Local Storage (used for notification persistence)
 * @property {boolean} serviceWorker - Support for Service Workers (used for push notifications)
 * @property {boolean} touchEvents - Support for Touch Events (for mobile support)
 * @property {boolean} webNotifications - Support for Web Notifications API
 * @property {boolean} permissionsAPI - Support for Permissions API (used for notification permissions)
 * 
 * @example
 * const compatibility = checkNotificationCompatibility();
 * if (compatibility.webNotifications) {
 *   // Enable web notification features
 * } else {
 *   // Fall back to in-app notifications only
 * }
 */
export const checkNotificationCompatibility = () => {
  // Added display name
  checkNotificationCompatibility.displayName = 'checkNotificationCompatibility';

  // Added display name
  checkNotificationCompatibility.displayName = 'checkNotificationCompatibility';

  // Added display name
  checkNotificationCompatibility.displayName = 'checkNotificationCompatibility';

  // Added display name
  checkNotificationCompatibility.displayName = 'checkNotificationCompatibility';

  // Added display name
  checkNotificationCompatibility.displayName = 'checkNotificationCompatibility';


  // Check basic browser features needed for notification system
  return {
    // Check for Intersection Observer API (used for notification visibility tracking)
    intersectionObserver: typeof IntersectionObserver !== 'undefined',

    // Check for Web Animations API (used for notification animations)
    webAnimations: typeof Element.prototype.animate !== 'undefined',

    // Check for Local Storage (used for notification persistence)
    localStorage: typeof localStorage !== 'undefined',

    // Check for Service Workers (used for push notifications)
    serviceWorker: 'serviceWorker' in navigator,

    // Check for Touch Events (for mobile support)
    touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

    // Check for Web Notifications API
    webNotifications: 'Notification' in window,

    // Check for Permissions API (used for notification permissions)
    permissionsAPI: 'permissions' in navigator,
  };
};

/**
 * Get current web notification permission status
 * Possible values are 'granted', 'denied', 'default', or 'unsupported'
 * 
 * @function
 * @returns {string} Permission status: 'granted', 'denied', 'default', or 'unsupported'
 * 
 * @example
 * const permissionStatus = getNotificationPermission();
 * if (permissionStatus === 'granted') {
 *   // Can show notifications
 * } else if (permissionStatus === 'default') {
 *   // Need to request permission
 * }
 */
export const getNotificationPermission = () => {
  // Added display name
  getNotificationPermission.displayName = 'getNotificationPermission';

  // Added display name
  getNotificationPermission.displayName = 'getNotificationPermission';

  // Added display name
  getNotificationPermission.displayName = 'getNotificationPermission';

  // Added display name
  getNotificationPermission.displayName = 'getNotificationPermission';

  // Added display name
  getNotificationPermission.displayName = 'getNotificationPermission';


  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission;
};

/**
 * Request permission for web notifications
 * Must be triggered by a user action (e.g., button click)
 * 
 * @function
 * @async
 * @returns {Promise<string>} Permission status: 'granted', 'denied', 'default', 'unsupported', or 'error'
 * 
 * @example
 * async function enableNotifications() {
  // Added display name
  enableNotifications.displayName = 'enableNotifications';

 *   const permission = await requestNotificationPermission();
 *   if (permission === 'granted') {
 *     showWebNotification('Notifications enabled!');
 *   }
 * }
 * 
 * // Must be called from a user action
 * notificationButton.addEventListener('click', enableNotifications);
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return Promise.resolve('unsupported');
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'error';
  }
};

/**
 * Show a native web notification using the Web Notifications API
 * This will display a notification at the OS level if permission is granted
 * 
 * @function
 * @param {string} title - Notification title text
 * @param {Object} [options={}] - Notification options
 * @param {string} [options.body] - Notification body text
 * @param {string} [options.icon] - URL of icon to display
 * @param {string} [options.badge] - URL of badge to display on mobile
 * @param {Array<Object>} [options.actions] - Actions that can be taken on the notification
 * @param {string} [options.tag] - Tag for grouping notifications
 * @param {boolean} [options.silent] - Whether to prevent sound/vibration
 * @param {boolean} [options.requireInteraction] - Whether notification should remain until dismissed
 * @returns {Notification|null} Notification instance or null if not supported or permission denied
 * 
 * @example
 * const notification = showWebNotification('New Message', {
 *   body: 'You have a new message from John',
 *   icon: '/images/message-icon.png',
 *   tag: 'message'
 * });
 * 
 * if (notification) {
 *   notification.onclick = () => {
 *     window.focus();
 *     notification.close();
 *   };
 * }
 */
export const showWebNotification = (title, options = {}) => {
  // Added display name
  showWebNotification.displayName = 'showWebNotification';

  // Added display name
  showWebNotification.displayName = 'showWebNotification';

  // Added display name
  showWebNotification.displayName = 'showWebNotification';

  // Added display name
  showWebNotification.displayName = 'showWebNotification';

  // Added display name
  showWebNotification.displayName = 'showWebNotification';


  if (!('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Web notification permission not granted');
    return null;
  }

  try {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (error) {
    console.error('Error showing web notification:', error);
    return null;
  }
};

/**
 * Apply browser-specific fixes for the notification system
 * This addresses known issues with notifications in specific browsers
 * 
 * @function
 * 
 * @example
 * // Call during application initialization
 * applyBrowserFixes();
 */
export const applyBrowserFixes = () => {
  // Added display name
  applyBrowserFixes.displayName = 'applyBrowserFixes';

  // Added display name
  applyBrowserFixes.displayName = 'applyBrowserFixes';

  // Added display name
  applyBrowserFixes.displayName = 'applyBrowserFixes';

  // Added display name
  applyBrowserFixes.displayName = 'applyBrowserFixes';

  // Added display name
  applyBrowserFixes.displayName = 'applyBrowserFixes';


  const userAgent = navigator.userAgent.toLowerCase();

  // iOS Safari specific fixes
  if (/iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent)) {
    document.documentElement.style.setProperty('--notification-shadow', 'none');
    document.documentElement.style.setProperty('--toast-z-index', '9999');
  }

  // IE11 specific fixes
  if (/trident\/7\./.test(userAgent)) {
    document.documentElement.style.setProperty('--notification-animation', 'none');
  }

  // Edge specific fixes
  if (/edge\//.test(userAgent)) {
    document.documentElement.style.setProperty('--notification-transition', 'all 0.3s ease-out');
  }
};

/**
 * Check if the browser is Internet Explorer
 * 
 * @function
 * @returns {boolean} True if the browser is Internet Explorer
 * 
 * @example
 * if (isIE()) {
 *   // Show IE-specific warning or apply IE-specific fixes
 * }
 */
export const isIE = () => {
  // Added display name
  isIE.displayName = 'isIE';

  // Added display name
  isIE.displayName = 'isIE';

  // Added display name
  isIE.displayName = 'isIE';

  // Added display name
  isIE.displayName = 'isIE';

  // Added display name
  isIE.displayName = 'isIE';


  const ua = window.navigator.userAgent;
  return /MSIE|Trident/.test(ua);
};

/**
 * Check if the browser is Edge (legacy)
 * 
 * @function
 * @returns {boolean} True if the browser is Edge (legacy)
 * 
 * @example
 * if (isEdgeLegacy()) {
 *   // Apply Edge-specific fixes
 * }
 */
export const isEdgeLegacy = () => {
  // Added display name
  isEdgeLegacy.displayName = 'isEdgeLegacy';

  // Added display name
  isEdgeLegacy.displayName = 'isEdgeLegacy';

  // Added display name
  isEdgeLegacy.displayName = 'isEdgeLegacy';

  // Added display name
  isEdgeLegacy.displayName = 'isEdgeLegacy';

  // Added display name
  isEdgeLegacy.displayName = 'isEdgeLegacy';


  return /Edge\/\d./i.test(navigator.userAgent);
};

/**
 * Check if the browser is Safari
 * 
 * @function
 * @returns {boolean} True if the browser is Safari
 * 
 * @example
 * if (isSafari()) {
 *   // Apply Safari-specific fixes
 * }
 */
export const isSafari = () => {
  // Added display name
  isSafari.displayName = 'isSafari';

  // Added display name
  isSafari.displayName = 'isSafari';

  // Added display name
  isSafari.displayName = 'isSafari';

  // Added display name
  isSafari.displayName = 'isSafari';

  // Added display name
  isSafari.displayName = 'isSafari';


  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * Check if the device is iOS
 * 
 * @function
 * @returns {boolean} True if the device is running iOS
 * 
 * @example
 * if (isIOS()) {
 *   // Apply iOS-specific fixes
 * }
 */
export const isIOS = () => {
  // Added display name
  isIOS.displayName = 'isIOS';

  // Added display name
  isIOS.displayName = 'isIOS';

  // Added display name
  isIOS.displayName = 'isIOS';

  // Added display name
  isIOS.displayName = 'isIOS';

  // Added display name
  isIOS.displayName = 'isIOS';


  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Get the current browser name and version
 * 
 * @function
 * @returns {Object} Object containing browser name and version
 * @property {string} name - Browser name
 * @property {string} version - Browser version
 * 
 * @example
 * const { name, version } = getBrowserInfo();
 */
export const getBrowserInfo = () => {
  // Added display name
  getBrowserInfo.displayName = 'getBrowserInfo';

  // Added display name
  getBrowserInfo.displayName = 'getBrowserInfo';

  // Added display name
  getBrowserInfo.displayName = 'getBrowserInfo';

  // Added display name
  getBrowserInfo.displayName = 'getBrowserInfo';

  // Added display name
  getBrowserInfo.displayName = 'getBrowserInfo';


  const ua = navigator.userAgent;
  let browserName = "Unknown";
  let version = "Unknown";
  
  // Extract browser name and version
  if (/MSIE|Trident/.test(ua)) {
    browserName = "Internet Explorer";
    const ieVersion = ua.match(/(MSIE |rv:)(\d+\.\d+)/);
    version = ieVersion ? ieVersion[2] : "Unknown";
  } else if (/Edge\/\d./i.test(ua)) {
    browserName = "Edge (Legacy)";
    const edgeVersion = ua.match(/Edge\/(\d+\.\d+)/);
    version = edgeVersion ? edgeVersion[1] : "Unknown";
  } else if (/Edg\/\d./i.test(ua)) {
    browserName = "Edge (Chromium)";
    const chromiumEdgeVersion = ua.match(/Edg\/(\d+\.\d+)/);
    version = chromiumEdgeVersion ? chromiumEdgeVersion[1] : "Unknown";
  } else if (/Chrome/i.test(ua)) {
    browserName = "Chrome";
    const chromeVersion = ua.match(/Chrome\/(\d+\.\d+)/);
    version = chromeVersion ? chromeVersion[1] : "Unknown";
  } else if (/Firefox/i.test(ua)) {
    browserName = "Firefox";
    const firefoxVersion = ua.match(/Firefox\/(\d+\.\d+)/);
    version = firefoxVersion ? firefoxVersion[1] : "Unknown";
  } else if (/Safari/i.test(ua)) {
    browserName = "Safari";
    const safariVersion = ua.match(/Version\/(\d+\.\d+)/);
    version = safariVersion ? safariVersion[1] : "Unknown";
  } else if (/Opera|OPR\//i.test(ua)) {
    browserName = "Opera";
    const operaVersion = ua.match(/(Opera|OPR)\/(\d+\.\d+)/);
    version = operaVersion ? operaVersion[2] : "Unknown";
  }
  
  return { name: browserName, version };
};