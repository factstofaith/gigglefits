/**
 * Utilities Index
 * 
 * Centralizes exports of all utilities for easier imports.
 * Part of the zero technical debt implementation.
 * 
 * @module utils
 */

// Export main utilities
export * from './helpers';
export * from './constants';

// Export file and data utilities
export * from './fileTypeUtils';
export * from './schemaInference';
export * from './dataQualityAnalyzer';

// Export accessibility utilities
export * as a11y from './a11y';
export * from './accessibilityUtils';

// Export performance utilities
export * as performance from './performance';
export * from './react-compat-adapters';