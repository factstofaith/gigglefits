/**
 * useFeatureFlag Hook
 * 
 * React hook for checking if a feature flag is enabled
 */

import { useState, useEffect } from 'react';
import featureFlagsService from '../services/featureFlagsService';

/**
 * Hook to check if a feature flag is enabled
 * @param {string} featureName - Name of the feature flag to check
 * @returns {boolean} Whether the feature is enabled
 */
function useFeatureFlag(featureName) {
  const [isEnabled, setIsEnabled] = useState(featureFlagsService.isEnabled(featureName));
  
  useEffect(() => {
    // Re-check on mount to ensure we have the latest value
    setIsEnabled(featureFlagsService.isEnabled(featureName));
    
    // Setup event listener for flag changes
    const handleFlagChange = (e) => {
      if (e.detail && e.detail.flag === featureName) {
        setIsEnabled(e.detail.value);
      }
    };
    
    window.addEventListener('featureFlagChanged', handleFlagChange);
    
    return () => {
      window.removeEventListener('featureFlagChanged', handleFlagChange);
    };
  }, [featureName]);
  
  return isEnabled;
}

export default useFeatureFlag;
