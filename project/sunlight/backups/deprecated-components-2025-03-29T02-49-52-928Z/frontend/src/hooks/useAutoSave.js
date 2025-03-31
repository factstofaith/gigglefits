import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for automatically saving data on changes with configurable debounce time
 * 
 * @param {Object|Array} data - The data to watch for changes and trigger auto save
 * @param {Function} saveFunction - Function to call to perform the save operation
 * @param {Object} options - Configuration options
 * @param {number} [options.debounceTime=2000] - Debounce time in milliseconds
 * @param {boolean} [options.enabled=true] - Whether auto save is enabled
 * @param {Function} [options.onSaveStart] - Callback when save operation starts
 * @param {Function} [options.onSaveComplete] - Callback when save operation completes
 * @param {Function} [options.onSaveError] - Callback when save operation fails
 * @returns {Object} Auto save state and control functions
 */
function useAutoSave(data, saveFunction, options = {}) {
  // Added display name
  useAutoSave.displayName = 'useAutoSave';

  const {
    debounceTime = 2000,
    enabled = true,
    onSaveStart,
    onSaveComplete,
    onSaveError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const saveTimeoutRef = useRef(null);
  const dataRef = useRef(data);

  // Update the ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Function to perform the save operation
  const performSave = async () => {
    if (!isEnabled) return;
    
    setIsSaving(true);
    setError(null);
    
    if (onSaveStart) {
      onSaveStart();
    }
    
    try {
      await saveFunction(dataRef.current);
      setLastSaved(new Date());
      
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (err) {
      console.error('Auto save failed:', err);
      setError(err);
      
      if (onSaveError) {
        onSaveError(err);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Debounced save function triggered when data changes
  const debouncedSave = useCallback(() => {
  // Added display name
  debouncedSave.displayName = 'debouncedSave';

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (isEnabled) {
      saveTimeoutRef.current = setTimeout(() => {
        performSave();
      }, debounceTime);
    }
  }, [isEnabled, debounceTime]);
  
  // Trigger debounced save when data changes
  useEffect(() => {
    debouncedSave();
  }, [data, debouncedSave]);
  
  // Function to manually trigger a save
  const saveNow = () => {
  // Added display name
  saveNow.displayName = 'saveNow';

  // Added display name
  saveNow.displayName = 'saveNow';

  // Added display name
  saveNow.displayName = 'saveNow';

  // Added display name
  saveNow.displayName = 'saveNow';

  // Added display name
  saveNow.displayName = 'saveNow';


    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    return performSave();
  };
  
  // Toggle auto save on/off
  const toggleAutoSave = (value = !isEnabled) => {
  // Added display name
  toggleAutoSave.displayName = 'toggleAutoSave';

  // Added display name
  toggleAutoSave.displayName = 'toggleAutoSave';

  // Added display name
  toggleAutoSave.displayName = 'toggleAutoSave';

  // Added display name
  toggleAutoSave.displayName = 'toggleAutoSave';

  // Added display name
  toggleAutoSave.displayName = 'toggleAutoSave';


    setIsEnabled(value);
  };
  
  return {
    isSaving,
    lastSaved,
    error,
    isEnabled,
    saveNow,
    toggleAutoSave,
  };
}

export default useAutoSave;