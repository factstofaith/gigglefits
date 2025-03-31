import React from 'react';
import { TableAdaptedProps } from '../../types/complex-components';

/**
 * TableAdapted component
 * 
 * An adapter wrapper for Material UI Table components with virtualization
 * support for efficient rendering of large datasets.
 * - Provides a clean, standardized interface for tabular data display
 * - Includes support for virtualization with react-window for performance
 * - Allows custom cell rendering and row event handlers
 * - Supports accessibility features including keyboard navigation and ARIA attributes
 */
declare const TableAdapted: React.ForwardRefExoticComponent<
  TableAdaptedProps & React.RefAttributes<HTMLTableElement>
>;

export default TableAdapted;