/**
 * React contexts
 * Context providers for state management
 */

export { default as ThemeContext, ThemeProvider, useTheme } from './ThemeContext';
export { default as NotificationContext, NotificationProvider, useNotification } from './NotificationContext';
export { default as ConfigContext, ConfigProvider, useConfig } from './ConfigContext';
export { default as AuthContext, AuthProvider, useAuth } from './AuthContext';
export { default as DialogContext, DialogProvider, useDialog, useSpecificDialog } from './DialogContext';

// Database Monitoring Context - For Phase 4 Database Optimization
export { default as DatabaseMonitoringContext, DatabaseMonitoringProvider, useDatabaseMonitoring } from './DatabaseMonitoringContext';