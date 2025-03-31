// constants.js
// -----------------------------------------------------------------------------
// Application constants

// Brand colors
export const COLORS = {
  PRIMARY: '#48C2C5', // Teal - primary color
  SECONDARY: '#FC741C', // Dark orange - secondary color
  WARNING: '#FFAA3B', // Light orange - warning color
  TEXT: '#3B3D3D', // Near black - text color
  BACKGROUND: '#FFFFFF', // White - background color
  LIGHT_BG: '#F5F5F5', // Light grey - secondary background
};

// API Endpoints (for when connecting to real backend)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    USER: '/api/auth/user',
  },
  INTEGRATIONS: {
    BASE: '/api/integrations',
    FIELD_MAPPINGS: '/api/field-mappings',
  },
};

// Integration types
export const INTEGRATION_TYPES = ['API-based', 'File-based', 'Database'];

// Integration sources/destinations
export const API_SOURCES = [
  'Workday (HR)',
  'Kronos (Time)',
  'Paylocity (Payroll)',
  '7Shifts (Time)',
  'BambooHR (HR)',
  'ADP (Payroll)',
  'Custom API',
];

export const FILE_SOURCES = [
  'Azure Blob Container',
  'AWS S3 Bucket',
  'Google Cloud Storage',
  'Local File System',
  'SFTP Server',
];

// Integration schedules
export const SCHEDULES = [
  'On demand',
  'Daily @ 2am',
  'Daily @ 6am',
  'Hourly',
  'Weekly on Fridays',
  'Monthly (1st day)',
  'Custom',
];

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  THEME: 'app_theme',
};
