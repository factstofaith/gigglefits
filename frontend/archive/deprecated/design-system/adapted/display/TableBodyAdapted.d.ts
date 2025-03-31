/**
 * TableBodyAdapted component
 * 
 * Enhanced table body component with virtualization support for efficient rendering of large datasets.
 * 
 * Features:
 * - Support for standard and virtualized rendering modes
 * - Efficient rendering of large datasets using react-window
 * - Striped row styling support
 * - Comprehensive accessibility attributes
 * - Row selection with proper ARIA attributes
 * - Support for hover effects and interactive rows
 * - Cell alignment and padding customization
 * 
 * @example
 * ```jsx
 * <TableAdapted>
 *   <TableHeadAdapted>...</TableHeadAdapted>
 *   <TableBodyAdapted striped>
 *     <TableBodyAdapted.Row>
 *       <TableBodyAdapted.Cell>Row 1, Cell 1</TableBodyAdapted.Cell>
 *       <TableBodyAdapted.Cell>Row 1, Cell 2</TableBodyAdapted.Cell>
 *     </TableBodyAdapted.Row>
 *     <TableBodyAdapted.Row>
 *       <TableBodyAdapted.Cell>Row 2, Cell 1</TableBodyAdapted.Cell>
 *       <TableBodyAdapted.Cell>Row 2, Cell 2</TableBodyAdapted.Cell>
 *     </TableBodyAdapted.Row>
 *   </TableBodyAdapted>
 * </TableAdapted>
 * 
 * // With virtualization for large datasets
 * <TableAdapted>
 *   <TableHeadAdapted>...</TableHeadAdapted>
 *   <TableBodyAdapted 
 *     virtualized 
 *     data={largeDataset}
 *     rowHeight={50}
 *     maxHeight={400}
 *     renderRow={({ data, index }) => (
 *       <TableBodyAdapted.Row>
 *         <TableBodyAdapted.Cell>{data.name}</TableBodyAdapted.Cell>
 *         <TableBodyAdapted.Cell>{data.status}</TableBodyAdapted.Cell>
 *       </TableBodyAdapted.Row>
 *     )}
 *   />
 * </TableAdapted>
 * ```
 */

import React from 'react';
import { TableBodyProps, TableBodyRowProps, TableBodyCellProps } from '../../types/display';

declare const TableBodyAdapted: React.ForwardRefExoticComponent<TableBodyProps> & {
  /**
   * TableBodyRowAdapted - Row component for table body
   * 
   * Features:
   * - Configurable hover effects
   * - Selection state with proper ARIA attributes
   * - Support for striped styling
   * - Interactive row click handling
   */
  Row: React.FC<TableBodyRowProps>;
  
  /**
   * TableBodyCellAdapted - Cell component for table body
   * 
   * Features:
   * - Text alignment customization
   * - Padding customization
   * - Support for colspan and rowspan
   * - Width customization options
   */
  Cell: React.FC<TableBodyCellProps>;
};

export default TableBodyAdapted;
export { 
  TableBodyRowAdapted, 
  TableBodyCellAdapted 
} from './TableBodyAdapted';