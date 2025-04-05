/**
 * Feature Flags Service
 * 
 * Simple service for managing feature flags in the application.
 */

import { reportError, ErrorSeverity } from "@/error-handling/error-service";
import { withDockerNetworkErrorHandling } from '@/error-handling/docker';
import { ENV } from '@/utils/environmentConfig';

// Default feature flags configuration
const defaultFeatureFlags = {
  // Core features
  newDesignSystem: true,
  enhancedErrorHandling: true,
  advancedAnalytics: false,

  // UI components
  newNavigationBar: false,
  enhancedDataTable: false,
  newDashboardLayout: false,

  // Features
  multiTenantSupport: true,
  advancedFileUpload: false,
  enhancedDataVisualization: false,

  // Experimental
  betaFeatures: false,
  experimentalUI: false
};

// Current feature flags state
let currentFeatureFlags = { ...defaultFeatureFlags };

/**
 * Handle feature flag errors properly
 * @param {Error} error - The error that occurred
 * @param {string} operation - The feature flag operation that failed
 * @param {Object} details - Additional details about the operation
 * @returns {Error} The original error for further handling
 */
function handleFeatureFlagError(error, operation, details = {}) {
  // Add specific feature flag context to the error
  const errorInfo = {
    operation,
    ...details,
    timestamp: new Date().toISOString()
  };

  // Most feature flag issues are minor
  const severity = ErrorSeverity.WARNING;

  // Report the error with proper context
  reportError(error, errorInfo, 'featureFlagsService', severity);

  // Return the error to allow for further handling
  return error;
}

// Check if a feature is enabled
function isFeatureEnabled(featureName) {
  try {
    if (!(featureName in currentFeatureFlags)) {
      const error = new Error(`Feature flag "${featureName}" is not defined`);
      handleFeatureFlagError(error, 'isFeatureEnabled', { featureName });
      return false;
    }

    return currentFeatureFlags[featureName];
  } catch (error) {
    handleFeatureFlagError(error, 'isFeatureEnabled', { featureName });
    return false;
  }
}

// Set a feature flag (for testing/development)
function setFeatureFlag(featureName, value) {
  try {
    if (!(featureName in currentFeatureFlags)) {
      const error = new Error(`Feature flag "${featureName}" is not defined`);
      handleFeatureFlagError(error, 'setFeatureFlag', { featureName, value });
      return false;
    }

    currentFeatureFlags[featureName] = !!value;

    return true;
  } catch (error) {
    handleFeatureFlagError(error, 'setFeatureFlag', { featureName, value });
    return false;
  }
}

// Reset all feature flags to default values
function resetFeatureFlags() {
  try {
    currentFeatureFlags = { ...defaultFeatureFlags };
    return currentFeatureFlags;
  } catch (error) {
    handleFeatureFlagError(error, 'resetFeatureFlags');
    return { ...defaultFeatureFlags };
  }
}

// Get all feature flags
function getAllFeatureFlags() {
  try {
    return { ...currentFeatureFlags };
  } catch (error) {
    handleFeatureFlagError(error, 'getAllFeatureFlags');
    return { ...defaultFeatureFlags };
  }
}

// Get a stub hook function - actual implementation will be in hook files
function createUseFeatureFlag() {
  return function useFeatureFlag(featureName) {
    return isFeatureEnabled(featureName);
  };
}

export default {
  isEnabled: isFeatureEnabled,
  setFlag: setFeatureFlag,
  resetFlags: resetFeatureFlags,
  getAllFlags: getAllFeatureFlags,
  createUseFeatureFlag
};