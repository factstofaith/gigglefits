// State management accelerator index file
// Exports production-grade state management utilities for transformation operations

import { createTransformationState, createTransformationStateHook } from './TransformationState';
import useTransformationState from './useTransformationState';

export {
  // Core state management
  createTransformationState,
  createTransformationStateHook,
  
  // React hooks
  useTransformationState
};

/**
 * State Management Accelerator
 * 
 * This module provides production-grade state management tools optimized for
 * transformation operations, with features like transaction support, validation,
 * performance monitoring, and history tracking.
 * 
 * Principles:
 * 
 * 1. Performance Optimized: Built for handling large datasets and complex
 *    transformations efficiently.
 * 
 * 2. Production-Ready: Includes comprehensive validation, error handling,
 *    and debugging capabilities out of the box.
 * 
 * 3. Developer Experience: Provides intuitive APIs and detailed feedback
 *    for a smooth development experience.
 * 
 * 4. Zero Technical Debt: Designed with best practices from the start,
 *    eliminating the need for future refactoring.
 * 
 * Usage:
 * 
 * 1. In React components:
 *    ```
 *    import { useTransformationState } from './accelerators/state';
 *    
 *    function MyComponent() {
 *      const {
 *        state,
 *        updateState,
 *        validation,
 *        undo,
 *        redo,
 *        withTransaction
 *      } = useTransformationState(initialState);
 *      
 *      // Use state management in your component
 *    }
 *    ```
 * 
 * 2. In non-React contexts:
 *    ```
 *    import { createTransformationState } from './accelerators/state';
 *    
 *    const stateManager = createTransformationState(initialState, options);
 *    
 *    // Use state management functions
 *    stateManager.updateState(draft => {
 *      draft.someValue = 'new value';
 *    });
 *    ```
 */