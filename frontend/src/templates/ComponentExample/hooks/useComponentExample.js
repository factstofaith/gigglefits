import { useState, useCallback } from 'react';

/**
 * useComponentExample - Custom hook for ComponentExample
 * 
 * This hook provides state management and actions for the ComponentExample component.
 * It demonstrates the recommended structure for component-specific hooks.
 * 
 * @returns {Object} The hook's state and actions
 * @returns {number} count - The current count value
 * @returns {Function} incrementCount - Function to increment the count
 * @returns {Function} decrementCount - Function to decrement the count
 * @returns {Function} resetCount - Function to reset the count to zero
 * 
 * @example
 * const { count, incrementCount, decrementCount, resetCount } = useComponentExample();
 */
export function useComponentExample() {
  // State
  const [count, setCount] = useState(0);

  // Actions
  const incrementCount = useCallback(() => {
    setCount((prevCount) => prevCount + 1);
  }, []);

  const decrementCount = useCallback(() => {
    setCount((prevCount) => Math.max(0, prevCount - 1));
  }, []);

  const resetCount = useCallback(() => {
    setCount(0);
  }, []);

  // Return state and actions
  return {
    count,
    incrementCount,
    decrementCount,
    resetCount
  };
}

export default useComponentExample;