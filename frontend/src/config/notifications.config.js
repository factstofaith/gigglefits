/**
 * Notifications configuration
 */

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center'
};

export const DEFAULT_NOTIFICATION_CONFIG = {
  position: NOTIFICATION_POSITIONS.TOP_RIGHT,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

export const NOTIFICATION_SOUNDS = {
  enabled: true,
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  info: '/sounds/info.mp3',
  warning: '/sounds/warning.mp3'
};

export const NOTIFICATION_CONFIG = {
  types: NOTIFICATION_TYPES,
  positions: NOTIFICATION_POSITIONS,
  defaults: DEFAULT_NOTIFICATION_CONFIG,
  sounds: NOTIFICATION_SOUNDS
};

export default {
  NOTIFICATION_TYPES,
  NOTIFICATION_POSITIONS,
  DEFAULT_NOTIFICATION_CONFIG,
  NOTIFICATION_SOUNDS,
  NOTIFICATION_CONFIG
};
