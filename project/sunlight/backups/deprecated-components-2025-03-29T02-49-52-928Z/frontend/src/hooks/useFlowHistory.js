/**
 * @module useFlowHistory
 * @description Custom hook for managing flow history with undo/redo functionality
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing flow history with undo/redo
 * @param {Array} initialNodes - Initial flow nodes
 * @param {Array} initialEdges - Initial flow edges
 * @param {number} [maxHistorySize=50] - Maximum number of history items to keep
 * @returns {Object} History state and control functions
 */
export const useFlowHistory = (initialNodes = [], initialEdges = [], maxHistorySize = 50) => {
  // Added display name
  useFlowHistory.displayName = 'useFlowHistory';

  // Added display name
  useFlowHistory.displayName = 'useFlowHistory';

  // Added display name
  useFlowHistory.displayName = 'useFlowHistory';

  // Added display name
  useFlowHistory.displayName = 'useFlowHistory';

  // Added display name
  useFlowHistory.displayName = 'useFlowHistory';


  // Use refs to prevent re-renders when history changes
  const historyRef = useRef([
    { nodes: initialNodes, edges: initialEdges }
  ]);
  const currentIndexRef = useRef(0);
  
  // State for UI tracking (to trigger re-renders when needed)
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /**
   * Add a new history item
   * @param {Object} item - The history item to add ({ nodes, edges })
   */
  const addHistoryItem = useCallback((item) => {
  // Added display name
  addHistoryItem.displayName = 'addHistoryItem';

    // Remove any future history items if we're not at the end
    if (currentIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    }
    
    // Add the new history item
    historyRef.current.push(item);
    
    // If we've exceeded max history size, remove oldest items
    if (historyRef.current.length > maxHistorySize) {
      historyRef.current = historyRef.current.slice(
        historyRef.current.length - maxHistorySize
      );
    }
    
    // Update current index to point to the newest item
    currentIndexRef.current = historyRef.current.length - 1;
    
    // Update UI state
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(false);
  }, [maxHistorySize]);

  /**
   * Undo the last change
   * @returns {Object|null} The previous state or null if no history
   */
  const undo = useCallback(() => {
  // Added display name
  undo.displayName = 'undo';

    if (currentIndexRef.current <= 0) {
      return null;
    }
    
    currentIndexRef.current--;
    const previousState = historyRef.current[currentIndexRef.current];
    
    // Update UI state
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
    
    return previousState;
  }, []);

  /**
   * Redo a previously undone change
   * @returns {Object|null} The next state or null if no future history
   */
  const redo = useCallback(() => {
  // Added display name
  redo.displayName = 'redo';

    if (currentIndexRef.current >= historyRef.current.length - 1) {
      return null;
    }
    
    currentIndexRef.current++;
    const nextState = historyRef.current[currentIndexRef.current];
    
    // Update UI state
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
    
    return nextState;
  }, []);

  /**
   * Get the current state from history
   * @returns {Object} The current state
   */
  const getCurrentState = useCallback(() => {
  // Added display name
  getCurrentState.displayName = 'getCurrentState';

    return historyRef.current[currentIndexRef.current];
  }, []);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
  // Added display name
  clearHistory.displayName = 'clearHistory';

    historyRef.current = [historyRef.current[currentIndexRef.current]];
    currentIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  /**
   * Get all history items
   * @returns {Array} All history items
   */
  const getHistory = useCallback(() => {
  // Added display name
  getHistory.displayName = 'getHistory';

    return [...historyRef.current];
  }, []);

  /**
   * Get the current history index
   * @returns {number} Current history index
   */
  const getCurrentIndex = useCallback(() => {
  // Added display name
  getCurrentIndex.displayName = 'getCurrentIndex';

    return currentIndexRef.current;
  }, []);

  return {
    addHistoryItem,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentState,
    clearHistory,
    getHistory,
    getCurrentIndex
  };
};

export default useFlowHistory;