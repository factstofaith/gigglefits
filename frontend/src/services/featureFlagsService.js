/**
 * Feature Flags Service
 * 
 * Simple service for managing feature flags in the application.
 */

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
  experimentalUI: false,
};

// Current feature flags state
let currentFeatureFlags = { ...defaultFeatureFlags };

// Check if a feature is enabled
function isFeatureEnabled(featureName) {
  if (!(featureName in currentFeatureFlags)) {
    console.warn(`Feature flag "${featureName}" is not defined`);
    return false;
  }
  
  return currentFeatureFlags[featureName];
}

// Set a feature flag (for testing/development)
function setFeatureFlag(featureName, value) {
  if (!(featureName in currentFeatureFlags)) {
    console.warn(`Feature flag "${featureName}" is not defined`);
    return false;
  }
  
  currentFeatureFlags[featureName] = !!value;
  
  return true;
}

// Reset all feature flags to default values
function resetFeatureFlags() {
  currentFeatureFlags = { ...defaultFeatureFlags };
  return currentFeatureFlags;
}

// Get all feature flags
function getAllFeatureFlags() {
  return { ...currentFeatureFlags };
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
  createUseFeatureFlag,
};