/**
 * Performance testing utilities
 * 
 * This file contains utilities for performance testing components
 */

/**
 * Generates test columns for data grid and table testing
 * @param {number} count - Number of columns to generate
 * @returns {Array} Array of column definitions
 */
export const generateColumns = (count) => {
  // Added display name
  generateColumns.displayName = 'generateColumns';

  // Added display name
  generateColumns.displayName = 'generateColumns';

  // Added display name
  generateColumns.displayName = 'generateColumns';

  // Added display name
  generateColumns.displayName = 'generateColumns';

  // Added display name
  generateColumns.displayName = 'generateColumns';


  return Array.from({ length: count }, (_, i) => ({
    field: `field${i}`,
    headerName: `Column ${i}`,
    width: 150,
  }));
};

/**
 * Generates test rows for data grid and table testing
 * @param {number} rowCount - Number of rows to generate
 * @param {number} columnCount - Number of columns per row
 * @returns {Array} Array of row data objects
 */
export const generateRows = (rowCount, columnCount) => {
  // Added display name
  generateRows.displayName = 'generateRows';

  // Added display name
  generateRows.displayName = 'generateRows';

  // Added display name
  generateRows.displayName = 'generateRows';

  // Added display name
  generateRows.displayName = 'generateRows';

  // Added display name
  generateRows.displayName = 'generateRows';


  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const row = { id: `row-${rowIndex}` };
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      row[`field${colIndex}`] = `Row ${rowIndex}, Col ${colIndex}`;
    }
    return row;
  });
};

/**
 * Calculate average render time for a component
 * @param {Function} renderFn - Function that renders the component and returns timing
 * @param {number} iterations - Number of render iterations to perform
 * @returns {Object} Object containing min, max, and average render times
 */
export const measureAverageRenderTime = (renderFn, iterations = 5) => {
  // Added display name
  measureAverageRenderTime.displayName = 'measureAverageRenderTime';

  // Added display name
  measureAverageRenderTime.displayName = 'measureAverageRenderTime';

  // Added display name
  measureAverageRenderTime.displayName = 'measureAverageRenderTime';

  // Added display name
  measureAverageRenderTime.displayName = 'measureAverageRenderTime';

  // Added display name
  measureAverageRenderTime.displayName = 'measureAverageRenderTime';


  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const renderTime = renderFn();
    times.push(renderTime);
  }
  
  const min = Math.min(...times);
  const max = Math.max(...times);
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
  
  return { min, max, avg };
};

/**
 * Analyze memory usage during component rendering
 * Note: This is a stub implementation as proper memory measurement
 * requires browser DevTools Performance API in a real environment
 * 
 * @param {Function} renderFn - Function that renders the component
 * @returns {Object} Memory usage statistics (simulated)
 */
export const analyzeMemoryUsage = (renderFn) => {
  // Added display name
  analyzeMemoryUsage.displayName = 'analyzeMemoryUsage';

  // Added display name
  analyzeMemoryUsage.displayName = 'analyzeMemoryUsage';

  // Added display name
  analyzeMemoryUsage.displayName = 'analyzeMemoryUsage';

  // Added display name
  analyzeMemoryUsage.displayName = 'analyzeMemoryUsage';

  // Added display name
  analyzeMemoryUsage.displayName = 'analyzeMemoryUsage';


  // This is a stub implementation
  // In a real environment, we would use the Chrome DevTools Performance API
  
  // Simulate rendering the component
  renderFn();
  
  // Return simulated memory metrics
  return {
    initialMemory: 0,
    peakMemory: 0,
    finalMemory: 0,
    difference: 0
  };
};

/**
 * Measure rendering operations count
 * @param {Function} renderFn - Function that renders the component
 * @param {Object} spies - Object with spies or mock functions to track
 * @returns {Object} Counts of rendering operations
 */
export const measureRenderOperations = (renderFn, spies) => {
  // Added display name
  measureRenderOperations.displayName = 'measureRenderOperations';

  // Added display name
  measureRenderOperations.displayName = 'measureRenderOperations';

  // Added display name
  measureRenderOperations.displayName = 'measureRenderOperations';

  // Added display name
  measureRenderOperations.displayName = 'measureRenderOperations';

  // Added display name
  measureRenderOperations.displayName = 'measureRenderOperations';


  // Clear all spy/mock counts
  Object.values(spies).forEach(spy => spy.mockClear());
  
  // Render the component
  renderFn();
  
  // Collect call counts
  const counts = {};
  for (const [name, spy] of Object.entries(spies)) {
    counts[name] = spy.mock.calls.length;
  }
  
  return counts;
};