import React, { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import { setErrorMetadata } from './error-service';

// Create context
const ErrorContext = createContext();

// Initial state
const initialState = {
  // Global error visible to the user (e.g., for a global error banner)
  globalError: null,
  
  // Recent errors for logging/debugging
  recentErrors: [],
  
  // User-specific metadata
  metadata: {},
  
  // Application status
  status: 'operational' // 'operational', 'degraded', 'outage'
};

// Reducer for error state management
function errorReducer(state, action) {
  switch (action.type) {
    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload,
        status: action.payload ? 'degraded' : 'operational'
      };
      
    case 'CLEAR_GLOBAL_ERROR':
      return {
        ...state,
        globalError: null,
        status: state.status === 'degraded' ? 'operational' : state.status
      };
      
    case 'ADD_ERROR':
      return {
        ...state,
        recentErrors: [
          action.payload,
          ...state.recentErrors
        ].slice(0, 10) // Keep only the 10 most recent errors
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        recentErrors: []
      };
      
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload
      };
      
    case 'SET_METADATA':
      // Update metadata and propagate to error service
      setErrorMetadata(action.payload);
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.payload
        }
      };
      
    case 'RESET':
      return {
        ...initialState,
        metadata: state.metadata // Preserve metadata on reset
      };
      
    default:
      return state;
  }
}

/**
 * ErrorProvider - Provides global error context and management
 * 
 * This provider manages global error state, error history, and application status.
 * It can be used to display global error notifications and track error patterns.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The ErrorProvider component
 * 
 * @example
 * <ErrorProvider>
 *   <App />
 * </ErrorProvider>
 */
export function ErrorProvider({ children }) {
  const [state, dispatch] = useReducer(errorReducer, initialState);
  
  /**
   * Set a global error visible to the user
   * @param {Error|Object|string} error - The error to display
   */
  const setGlobalError = useCallback((error) => {
    // Convert string errors to Error objects
    const errorObj = typeof error === 'string' 
      ? new Error(error)
      : error;
      
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: errorObj });
    
    // Also add to recent errors
    dispatch({ type: 'ADD_ERROR', payload: {
      error: errorObj,
      timestamp: new Date().toISOString(),
      global: true
    }});
  }, []);
  
  /**
   * Clear the global error display
   */
  const clearGlobalError = useCallback(() => {
    dispatch({ type: 'CLEAR_GLOBAL_ERROR' });
  }, []);
  
  /**
   * Add an error to the recent errors list (without showing globally)
   * @param {Error} error - The error to add
   * @param {Object} [info={}] - Additional error information
   */
  const addError = useCallback((error, info = {}) => {
    dispatch({ 
      type: 'ADD_ERROR', 
      payload: {
        error,
        info,
        timestamp: new Date().toISOString(),
        global: false
      }
    });
  }, []);
  
  /**
   * Clear all recent errors
   */
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);
  
  /**
   * Set application status
   * @param {'operational'|'degraded'|'outage'} status - The application status
   */
  const setStatus = useCallback((status) => {
    dispatch({ type: 'SET_STATUS', payload: status });
  }, []);
  
  /**
   * Set error metadata (user, session, app info)
   * @param {Object} metadata - Metadata to set
   */
  const setMetadata = useCallback((metadata) => {
    dispatch({ type: 'SET_METADATA', payload: metadata });
  }, []);
  
  /**
   * Reset the error state
   */
  const resetErrorState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  
  // Create context value
  const contextValue = {
    ...state,
    setGlobalError,
    clearGlobalError,
    addError,
    clearErrors,
    setStatus,
    setMetadata,
    resetErrorState
  };
  
  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

ErrorProvider.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired
};

/**
 * Hook for accessing the error context
 * @returns {Object} The error context value
 * 
 * @example
 * function ErrorBanner() {
 *   const { globalError, clearGlobalError } = useErrorContext();
 *   
 *   if (!globalError) return null;
 *   
 *   return (
 *     <div className="error-banner">
 *       <p>{globalError.message}</p>
 *       <button onClick={clearGlobalError}>Dismiss</button>
 *     </div>
 *   );
 * }
 */
export function useErrorContext() {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  
  return context;
}

// Export default for simpler imports
export default { ErrorProvider, useErrorContext };