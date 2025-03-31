// useTransformationState.js
// React hook implementation of the TransformationState system

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createTransformationState } from './TransformationState';

/**
 * React hook that provides a production-grade state management system
 * optimized for transformation operations with performance monitoring,
 * validation, transactions, and history tracking.
 * 
 * @param {Object} initialState - Initial state
 * @param {Object} options - Configuration options
 * @returns {Object} State management interface
 */
export default function useTransformationState(initialState = {}, options = {}) {
  // Create a ref to hold the state manager instance
  const stateManagerRef = useRef(null);
  
  // Initialize state manager if it doesn't exist
  if (stateManagerRef.current === null) {
    stateManagerRef.current = createTransformationState(initialState, options);
  }
  
  // Get state manager from ref
  const stateManager = stateManagerRef.current;
  
  // Use React's useState to trigger re-renders
  const [state, setState] = useState(stateManager.getState());
  
  // Force component update when state changes
  const updateComponent = useCallback(() => {
    setState(stateManager.getState());
  }, [stateManager]);
  
  // Update state with change tracking to trigger re-renders
  const updateState = useCallback((updater, actionName) => {
    const nextState = stateManager.updateState(updater, actionName);
    updateComponent();
    return nextState;
  }, [stateManager, updateComponent]);
  
  // State operations with component updates
  const setEntireState = useCallback((newState) => {
    stateManager.setState(newState);
    updateComponent();
  }, [stateManager, updateComponent]);
  
  const resetState = useCallback(() => {
    stateManager.resetState();
    updateComponent();
  }, [stateManager, updateComponent]);
  
  // Validation with memoization
  const validationResult = useMemo(() => {
    return stateManager.validateState();
  }, [stateManager, state]);
  
  // History operations
  const historyState = useMemo(() => {
    return {
      history: stateManager.getHistory(),
      canUndo: stateManager.canUndo(),
      canRedo: stateManager.canRedo()
    };
  }, [stateManager, state]);
  
  const undoOperation = useCallback(() => {
    const success = stateManager.undo();
    if (success) updateComponent();
    return success;
  }, [stateManager, updateComponent]);
  
  const redoOperation = useCallback(() => {
    const success = stateManager.redo();
    if (success) updateComponent();
    return success;
  }, [stateManager, updateComponent]);
  
  // Transaction operations
  const beginTransaction = useCallback((name) => {
    return stateManager.beginTransaction(name);
  }, [stateManager]);
  
  const commitTransaction = useCallback(() => {
    const success = stateManager.commitTransaction();
    if (success) updateComponent();
    return success;
  }, [stateManager, updateComponent]);
  
  const rollbackTransaction = useCallback(() => {
    const success = stateManager.rollbackTransaction();
    if (success) updateComponent();
    return success;
  }, [stateManager, updateComponent]);
  
  const withTransaction = useCallback((fn, name) => {
    return stateManager.withTransaction(() => {
      const result = fn();
      updateComponent();
      return result;
    }, name);
  }, [stateManager, updateComponent]);
  
  // Performance metrics
  const performanceMetrics = useMemo(() => {
    return stateManager.getPerformanceMetrics();
  }, [stateManager, state]);
  
  // Create selector
  const createSelector = useCallback((selectorFn) => {
    return stateManager.createSelector(selectorFn);
  }, [stateManager]);
  
  // Return public interface
  return {
    // State
    state,
    updateState,
    setState: setEntireState,
    resetState,
    
    // Validation
    validation: validationResult,
    isValid: validationResult.valid,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
    validateState: stateManager.validateState,
    
    // History
    history: historyState.history,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
    undo: undoOperation,
    redo: redoOperation,
    
    // Transactions
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    withTransaction,
    
    // Selection
    createSelector,
    
    // Performance
    performanceMetrics
  };
}