// Hooks accelerator index file
// Exports production-ready React hooks for transformation operations

import useDataTransformation from './useDataTransformation';
import useSchemaManagement from './useSchemaManagement';

// Export all hooks
export {
  useDataTransformation,
  useSchemaManagement
};

/**
 * Hooks Accelerator
 * 
 * This module provides a collection of production-ready React hooks that 
 * significantly accelerate development of transformation components while
 * maintaining direct-to-production code quality.
 * 
 * Principles:
 * 
 * 1. Production-Ready: All hooks include comprehensive validation, error 
 *    handling, performance optimization, and proper cleanup to prevent memory leaks.
 * 
 * 2. Developer Experience: Hooks provide intuitive APIs that make complex
 *    operations simple, with detailed feedback for easier debugging.
 * 
 * 3. Performance Optimized: Built with performance in mind, including caching,
 *    memoization, and efficient data handling.
 * 
 * 4. Zero Technical Debt: Designed from the start with best practices, 
 *    eliminating the need for future refactoring.
 * 
 * Available Hooks:
 * 
 * - useDataTransformation: For transforming data with validation, error handling,
 *   performance tracking, and caching.
 * 
 * - useSchemaManagement: For inferring, validating, and managing data schemas
 *   with comprehensive field detection and validation.
 * 
 * Usage:
 * 
 * ```jsx
 * import { useDataTransformation } from './accelerators/hooks';
 * 
 * function MyComponent() {
 *   const transformFunction = (data) => {
 *     // Transform data here
 *     return transformedData;
 *   };
 *   
 *   const {
 *     transform,
 *     data: transformedData,
 *     isLoading,
 *     isError,
 *     error
 *   } = useDataTransformation(transformFunction, {
 *     validateInput: true,
 *     cacheResults: true
 *   });
 *   
 *   // Use in component
 * }
 * ```
 */