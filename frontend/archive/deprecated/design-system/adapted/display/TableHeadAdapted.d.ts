/**
 * TableHeadAdapted component
 * 
 * Enhanced table header component with sorting and improved accessibility
 * 
 * Features:
 * - Sortable column headers with visual indicators
 * - Sticky header option for long tables
 * - Comprehensive accessibility attributes
 * - Hover effects for sortable columns
 * - Custom sort behavior through callbacks
 * - Automatic propagation of sort props to child components
 * 
 * @example
 * ```jsx
 * <TableAdapted>
 *   <TableHeadAdapted 
 *     stickyHeader 
 *     sortable 
 *     onSortChange={(field, direction) => handleSort(field, direction)}
 *   >
 *     <tr>
 *       <TableHeadAdapted.Cell field="name">Name</TableHeadAdapted.Cell>
 *       <TableHeadAdapted.Cell field="status" align="center">Status</TableHeadAdapted.Cell>
 *       <TableHeadAdapted.Cell field="date">Date</TableHeadAdapted.Cell>
 *     </tr>
 *   </TableHeadAdapted>
 *   <TableBodyAdapted>...</TableBodyAdapted>
 * </TableAdapted>
 * ```
 */

import React from 'react';
import { TableHeadProps, TableHeadCellProps } from '../../types/display';

declare const TableHeadAdapted: React.ForwardRefExoticComponent<TableHeadProps> & {
  /**
   * TableHeadCellAdapted - Cell component for table headers with sorting capability
   * 
   * Features:
   * - Sortable column headers when enabled
   * - Visual indicators for sort direction
   * - Hover effects for interactive feedback
   * - Automatic aria-sort attribute management
   * - Alignment options (left, center, right)
   * - Width customization
   */
  Cell: React.FC<TableHeadCellProps>;
};

export default TableHeadAdapted;
export { TableHeadCellAdapted } from './TableHeadAdapted';