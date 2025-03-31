/**
 * useLocalStorage
 * 
 * A hook for persisting and syncing state with localStorage.
 * 
 * @module hooks/useLocalStorage
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing state that persists in localStorage
 * 
 * @param {string} key - The localStorage key to use
 * @param {*} initialValue - The initial value to use if no value exists in localStorage
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.sync=true] - Whether to sync state across tabs/windows
 * @param {boolean} [options.serialize=true] - Whether to serialize/deserialize values
 * @param {Function} [options.serializer=JSON.stringify] - Function to serialize values
 * @param {Function} [options.deserializer=JSON.parse] - Function to deserialize values
 * @returns {Array} [storedValue, setValue, removeValue] - Tuple with stored value, setter, and remover
 */
function useLocalStorage(key, initialValue, options = {}) {
  const {
    sync = true,
    serialize = true,
    serializer = JSON.stringify,
    deserializer = JSON.parse,
  } = options;
  
  // Create a ref to track if component is mounted
  const isMounted = useRef(false);
  
  // Function to get the initial value from localStorage or use the provided initialValue
  const getInitialValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      
      // If the key exists in localStorage
      if (item !== null) {
        return serialize ? deserializer(item) : item;
      }
      
      // Otherwise initialize with the provided value
      const initialValueToStore = initialValue instanceof Function ? initialValue() : initialValue;
      if (initialValueToStore !== undefined && serialize) {
        window.localStorage.setItem(key, serializer(initialValueToStore));
      } else if (initialValueToStore !== undefined) {
        window.localStorage.setItem(key, initialValueToStore);
      }
      return initialValueToStore;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  };
  
  // State to store the current value
  const [storedValue, setStoredValue] = useState(getInitialValue);
  
  // Update localStorage when the value changes
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else if (serialize) {
        window.localStorage.setItem(key, serializer(valueToStore));
      } else {
        window.localStorage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, serializer, storedValue]);
  
  // Function to remove the value from localStorage
  const removeValue = useCallback(() => {
    try {
      // Remove from localStorage
      window.localStorage.removeItem(key);
      
      // Reset state to undefined
      setStoredValue(undefined);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);
  
  // Listen for changes to localStorage in other tabs/windows
  useEffect(() => {
    isMounted.current = true;
    
    const handleStorageChange = (event) => {
      if (!isMounted.current || !sync || event.key !== key) return;
      
      try {
        // Get the new value
        const newValue = event.newValue 
          ? (serialize ? deserializer(event.newValue) : event.newValue) 
          : undefined;
        
        // Update state with the new value
        setStoredValue(newValue);
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error);
      }
    };
    
    // Add event listener
    if (sync) {
      window.addEventListener('storage', handleStorageChange);
    }
    
    // Remove event listener on cleanup
    return () => {
      isMounted.current = false;
      if (sync) {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [key, sync, serialize, deserializer]);
  
  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;