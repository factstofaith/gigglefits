import React from 'react';
import { DataGridAdaptedProps } from '../../types/complex-components';

/**
 * DataGridAdapted component
 * 
 * A high-performance data grid with virtualization for large datasets and accessibility features.
 * - Supports virtualization for efficient rendering of large datasets
 * - Provides accessibility features including keyboard navigation and ARIA attributes
 * - Includes sorting, pagination, and selection capabilities
 * - Allows custom cell rendering and styling
 */
declare const DataGridAdapted: React.ForwardRefExoticComponent<
  DataGridAdaptedProps & React.RefAttributes<HTMLDivElement>
>;

export default DataGridAdapted;