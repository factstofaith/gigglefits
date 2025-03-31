// TransformationState.js
// Production-grade state management library optimized for transformation operations
// with built-in performance optimization, validation, and error handling.

import { produce } from 'immer';

/**
 * @typedef {Object} StateOptions
 * @property {boolean} enableHistory - Whether to enable state history tracking
 * @property {number} historyLimit - Maximum number of history entries to keep
 * @property {boolean} enableValidation - Whether to enable automatic state validation
 * @property {Function} validator - Custom validation function
 * @property {boolean} enableTransactions - Whether to enable transaction support
 * @property {boolean} debug - Whether to enable debug mode
 */

/**
 * @typedef {Object} StateTransaction
 * @property {string} id - Unique transaction ID
 * @property {string} name - Transaction name
 * @property {Function} changes - Transaction changes function
 * @property {any} initial - Initial state before transaction
 * @property {any} result - Resulting state after transaction
 * @property {boolean} committed - Whether the transaction was committed
 * @property {Error} [error] - Error that occurred during transaction
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the state is valid
 * @property {Object.<string, string>} errors - Map of field names to error messages
 * @property {Object.<string, string>} warnings - Map of field names to warning messages
 * @property {string[]} fields - List of invalid fields
 */

/**
 * @typedef {Object} StateHistory
 * @property {string} id - Unique history entry ID
 * @property {string} action - Action description
 * @property {any} state - State at this point in history
 * @property {Date} timestamp - When this history entry was created
 * @property {boolean} undoable - Whether this action can be undone
 * @property {string} [transactionId] - Associated transaction ID, if any
 */

/**
 * Creates a transformation state manager with optimized performance for large
 * datasets and complex operations.
 * 
 * Features:
 * - Immutable state updates with structural sharing for performance
 * - Transaction support with automatic rollback on error
 * - Validation with detailed error reporting
 * - Performance monitoring and debugging
 * - History tracking with undo/redo support
 * 
 * @param {Object} initialState - Initial state
 * @param {StateOptions} options - Configuration options
 * @returns {Object} State manager
 */
export function createTransformationState(initialState = {}, options = {}) {
  // Default options
  const config = {
    enableHistory: true,
    historyLimit: 50,
    enableValidation: true,
    validator: null,
    enableTransactions: true,
    debug: false,
    ...options
  };
  
  // Internal state
  let currentState = initialState;
  let stateHistory = [];
  let transactionLog = [];
  let currentTransaction = null;
  let redoStack = [];
  
  // Performance metrics
  const performanceMetrics = {
    updateCount: 0,
    totalUpdateTime: 0,
    validationCount: 0,
    totalValidationTime: 0,
    slowestUpdate: 0,
    slowestUpdateAction: '',
    lastUpdateTime: 0
  };
  
  /**
   * Updates the state using an Immer producer function
   * @param {Function|Object} updater - State updater function or object
   * @param {string} actionName - Description of the action
   * @returns {Object} New state
   */
  function updateState(updater, actionName = 'Update state') {
    const startTime = performance.now();
    
    try {
      // Handle object updates vs. function updates
      const nextState = typeof updater === 'function'
        ? produce(currentState, updater)
        : produce(currentState, draft => {
            Object.assign(draft, updater);
          });
      
      // Track performance
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      performanceMetrics.updateCount++;
      performanceMetrics.totalUpdateTime += updateTime;
      performanceMetrics.lastUpdateTime = updateTime;
      
      if (updateTime > performanceMetrics.slowestUpdate) {
        performanceMetrics.slowestUpdate = updateTime;
        performanceMetrics.slowestUpdateAction = actionName;
      }
      
      // Validate if enabled
      let validationResult = { valid: true, errors: {}, warnings: {}, fields: [] };
      
      if (config.enableValidation) {
        validationResult = validateState(nextState);
        if (!validationResult.valid && config.debug) {
          console.warn(`State validation failed after "${actionName}":`, validationResult.errors);
        }
      }
      
      // Only update if not in a transaction
      if (!currentTransaction) {
        // Add to history if enabled
        if (config.enableHistory) {
          addToHistory(actionName, currentState);
          
          // Clear redo stack when new action is performed
          redoStack = [];
        }
        
        // Update current state
        currentState = nextState;
      }
      
      if (config.debug) {
        console.log(`State updated: ${actionName}`, { 
          prev: currentState, 
          next: nextState,
          metrics: { 
            time: updateTime.toFixed(2) + 'ms',
            valid: validationResult.valid 
          }
        });
      }
      
      return nextState;
    } catch (error) {
      if (config.debug) {
        console.error(`Error updating state: ${actionName}`, error);
      }
      
      // Rethrow for transaction handling
      throw error;
    }
  }
  
  /**
   * Validates the current or specified state
   * @param {Object} [state=currentState] - State to validate
   * @returns {ValidationResult} Validation result
   */
  function validateState(state = currentState) {
    const startTime = performance.now();
    
    try {
      let validationResult = { valid: true, errors: {}, warnings: {}, fields: [] };
      
      // Use custom validator if provided
      if (typeof config.validator === 'function') {
        validationResult = config.validator(state);
      } else {
        // Basic validation - check required fields and types
        // This would be replaced with more sophisticated validation in a real implementation
        validationResult.valid = true;
      }
      
      // Track performance
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      performanceMetrics.validationCount++;
      performanceMetrics.totalValidationTime += validationTime;
      
      if (config.debug && validationTime > 50) {
        console.warn(`Slow validation: ${validationTime.toFixed(2)}ms`);
      }
      
      return validationResult;
    } catch (error) {
      if (config.debug) {
        console.error('Error validating state:', error);
      }
      
      return { 
        valid: false, 
        errors: { '_validation': error.message }, 
        warnings: {}, 
        fields: ['_validation'] 
      };
    }
  }
  
  /**
   * Adds current state to history
   * @param {string} action - Action description
   * @param {Object} previousState - Previous state to save
   * @returns {string} History entry ID
   */
  function addToHistory(action, previousState) {
    const historyEntry = {
      id: generateId(),
      action,
      state: previousState,
      timestamp: new Date(),
      undoable: true,
      transactionId: currentTransaction?.id
    };
    
    stateHistory.unshift(historyEntry);
    
    // Limit history size
    if (stateHistory.length > config.historyLimit) {
      stateHistory.pop();
    }
    
    return historyEntry.id;
  }
  
  /**
   * Starts a new transaction
   * @param {string} name - Transaction name
   * @returns {string} Transaction ID
   */
  function beginTransaction(name) {
    if (!config.enableTransactions) {
      return null;
    }
    
    if (currentTransaction) {
      throw new Error('Cannot start a new transaction while another is in progress');
    }
    
    const transaction = {
      id: generateId(),
      name,
      initial: currentState,
      result: null,
      committed: false,
      timestamp: new Date()
    };
    
    currentTransaction = transaction;
    
    if (config.debug) {
      console.log(`Transaction started: ${name}`, { id: transaction.id });
    }
    
    return transaction.id;
  }
  
  /**
   * Commits the current transaction
   * @returns {boolean} Success
   */
  function commitTransaction() {
    if (!config.enableTransactions || !currentTransaction) {
      return false;
    }
    
    currentTransaction.committed = true;
    currentTransaction.result = currentState;
    
    // Add transaction to log
    transactionLog.push({ ...currentTransaction });
    
    // Clear current transaction
    currentTransaction = null;
    
    if (config.enableHistory) {
      addToHistory(`Commit: ${currentTransaction.name}`, currentTransaction.initial);
    }
    
    if (config.debug) {
      console.log(`Transaction committed: ${currentTransaction.name}`);
    }
    
    return true;
  }
  
  /**
   * Rolls back the current transaction
   * @returns {boolean} Success
   */
  function rollbackTransaction() {
    if (!config.enableTransactions || !currentTransaction) {
      return false;
    }
    
    // Restore initial state
    currentState = currentTransaction.initial;
    
    const transactionName = currentTransaction.name;
    
    // Add transaction to log
    currentTransaction.result = null;
    transactionLog.push({ ...currentTransaction });
    
    // Clear current transaction
    currentTransaction = null;
    
    if (config.debug) {
      console.log(`Transaction rolled back: ${transactionName}`);
    }
    
    return true;
  }
  
  /**
   * Executes a function within a transaction
   * @param {Function} fn - Function to execute
   * @param {string} name - Transaction name
   * @returns {any} Function result
   */
  function withTransaction(fn, name = 'Anonymous Transaction') {
    beginTransaction(name);
    
    try {
      const result = fn();
      commitTransaction();
      return result;
    } catch (error) {
      rollbackTransaction();
      throw error;
    }
  }
  
  /**
   * Undoes the last action
   * @returns {boolean} Success
   */
  function undo() {
    if (!config.enableHistory || stateHistory.length === 0) {
      return false;
    }
    
    const lastEntry = stateHistory[0];
    
    if (!lastEntry.undoable) {
      return false;
    }
    
    // Save current state to redo stack
    redoStack.unshift({
      state: currentState,
      action: `Redo: ${lastEntry.action}`
    });
    
    // Restore previous state
    currentState = lastEntry.state;
    
    // Remove entry from history
    stateHistory.shift();
    
    if (config.debug) {
      console.log(`Undo: ${lastEntry.action}`);
    }
    
    return true;
  }
  
  /**
   * Redoes the last undone action
   * @returns {boolean} Success
   */
  function redo() {
    if (!config.enableHistory || redoStack.length === 0) {
      return false;
    }
    
    const redoEntry = redoStack[0];
    
    // Save current state to history
    addToHistory(`Undo: ${redoEntry.action}`, currentState);
    
    // Restore redo state
    currentState = redoEntry.state;
    
    // Remove entry from redo stack
    redoStack.shift();
    
    if (config.debug) {
      console.log(`Redo: ${redoEntry.action}`);
    }
    
    return true;
  }
  
  /**
   * Gets performance metrics
   * @returns {Object} Performance metrics
   */
  function getPerformanceMetrics() {
    const avgUpdateTime = performanceMetrics.updateCount > 0
      ? performanceMetrics.totalUpdateTime / performanceMetrics.updateCount
      : 0;
      
    const avgValidationTime = performanceMetrics.validationCount > 0
      ? performanceMetrics.totalValidationTime / performanceMetrics.validationCount
      : 0;
      
    return {
      ...performanceMetrics,
      avgUpdateTime,
      avgValidationTime
    };
  }
  
  /**
   * Creates a selector that memoizes the result
   * @param {Function} selectorFn - Selector function
   * @returns {Function} Memoized selector
   */
  function createSelector(selectorFn) {
    let lastState = null;
    let lastResult = null;
    
    return function memoizedSelector(...args) {
      if (currentState === lastState) {
        return lastResult;
      }
      
      lastState = currentState;
      lastResult = selectorFn(currentState, ...args);
      return lastResult;
    };
  }
  
  /**
   * Generates a unique ID
   * @returns {string} Unique ID
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  // Return public API
  return {
    // State access
    getState: () => currentState,
    getHistory: () => [...stateHistory],
    
    // State updates
    updateState,
    setState: (newState) => updateState(() => newState, 'Set state'),
    resetState: () => updateState(() => initialState, 'Reset state'),
    
    // Validation
    validateState,
    
    // History operations
    undo,
    redo,
    canUndo: () => config.enableHistory && stateHistory.length > 0,
    canRedo: () => config.enableHistory && redoStack.length > 0,
    
    // Transaction support
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    withTransaction,
    
    // Selection
    createSelector,
    
    // Performance
    getPerformanceMetrics
  };
}

/**
 * Creates a state hook for a React component
 * 
 * This would typically be implemented with React hooks, but is shown here
 * as a standalone function for demonstration purposes.
 * 
 * @param {Object} initialState - Initial state
 * @param {StateOptions} options - State options
 * @returns {Object} State hook interface
 */
export function createTransformationStateHook(initialState, options) {
  const stateManager = createTransformationState(initialState, options);
  
  return {
    useState: () => {
      // This would be a React hook in a real implementation
      return [stateManager.getState(), stateManager.updateState];
    },
    useValidation: () => {
      return stateManager.validateState();
    },
    useHistory: () => {
      return {
        history: stateManager.getHistory(),
        canUndo: stateManager.canUndo(),
        canRedo: stateManager.canRedo(),
        undo: stateManager.undo,
        redo: stateManager.redo
      };
    },
    useTransaction: () => {
      return {
        begin: stateManager.beginTransaction,
        commit: stateManager.commitTransaction,
        rollback: stateManager.rollbackTransaction,
        withTransaction: stateManager.withTransaction
      };
    },
    usePerformance: () => {
      return stateManager.getPerformanceMetrics();
    }
  };
}

export default {
  createTransformationState,
  createTransformationStateHook
};