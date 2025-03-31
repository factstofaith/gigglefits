/**
 * @component TableHead
 * @description Enhanced table header component with sorting and improved accessibility
 * @typedef {import('../../../design-system/types/display').TableHeadProps} TableHeadProps
 * @typedef {import('../../../design-system/types/display').TableHeadCellProps} TableHeadCellProps
 * @type {React.ForwardRefExoticComponent<TableHeadProps>}
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getAriaAttributes } from '@utils/accessibilityUtils';

// Icons (imported directly to avoid MUI import issues)
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

/**
 * TableHeadAdapted - Enhanced table header component with sorting capabilities
 */
const TableHead = React.memo(({
  children,
  sortable = false,
  onSort,
  sortDirection = 'asc',
  sortBy = '',
  stickyHeader = false,
  
  // Accessibility props
  ariaLabel,
  
  // Additional props
  ...rest
}) => {
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || 'Table header',
  });
  
  // Process children to add sorting functionality
  const processedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    
    // Only process TableRow children
    if (child.type.displayName !== 'TableRowAdapted' && 
        child.type.name !== 'TableRowAdapted') {
      return child;
    }
    
    // Add sort props to TableRow
    return React.cloneElement(child, {
      sortable,
      onSort,
      sortDirection,
      sortBy,
      component: 'tr', // Ensure correct HTML semantics
    });
  });
  
  return (
    <thead
      {...ariaAttributes}
      {...rest}
      style={{
        position: stickyHeader ? 'sticky' : 'static',
        top: stickyHeader ? 0 : 'auto',
        zIndex: stickyHeader ? 2 : 'auto',
        backgroundColor: stickyHeader ? 'var(--background-paper, #fff)' : 'transparent',
        ...rest.style,
      }}
    >
      {processedChildren}
    </thead>
  );
});

TableHeadAdapted.propTypes = {
  // Content
  children: PropTypes.node,
  
  // Sorting
  sortable: PropTypes.bool,
  onSort: PropTypes.func,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  sortBy: PropTypes.string,
  
  // Display
  stickyHeader: PropTypes.bool,
  
  // Accessibility
  ariaLabel: PropTypes.string,
};

TableHead.displayName = 'TableHead';

/**
 * TableHeadCellAdapted - Cell component for table headers with sorting capability
 * @type {React.FC<TableHeadCellProps>}
 */
export const TableHeadCellAdapted = React.memo(({
  children,
  sortable = false,
  onSort,
  sortDirection = 'asc',
  sortBy = '',
  field = '',
  align = 'left',
  width,
  minWidth,
  maxWidth,
  
  // Accessibility props
  ariaLabel,
  ariaSort,
  
  // Additional props
  ...rest
}) => {
  // Local state for hover effect
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine if this cell is the current sort field
  const isSorted = sortBy === field;
  
  // Handle sort click
  const handleSortClick = () => {
  // Added display name
  handleSortClick.displayName = 'handleSortClick';

  // Added display name
  handleSortClick.displayName = 'handleSortClick';

  // Added display name
  handleSortClick.displayName = 'handleSortClick';

  // Added display name
  handleSortClick.displayName = 'handleSortClick';

  // Added display name
  handleSortClick.displayName = 'handleSortClick';


    if (!sortable || !field || !onSort) return;
    
    const newDirection = isSorted && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };
  
  // Get appropriate aria-sort attribute
  const getAriaSort = () => {
  // Added display name
  getAriaSort.displayName = 'getAriaSort';

  // Added display name
  getAriaSort.displayName = 'getAriaSort';

  // Added display name
  getAriaSort.displayName = 'getAriaSort';

  // Added display name
  getAriaSort.displayName = 'getAriaSort';

  // Added display name
  getAriaSort.displayName = 'getAriaSort';


    if (ariaSort) return ariaSort;
    if (!isSorted) return undefined;
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };
  
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || (typeof children === 'string' ? children : undefined),
    sort: getAriaSort(),
  });
  
  // Render sort icon if applicable
  const renderSortIcon = () => {
  // Added display name
  renderSortIcon.displayName = 'renderSortIcon';

  // Added display name
  renderSortIcon.displayName = 'renderSortIcon';

  // Added display name
  renderSortIcon.displayName = 'renderSortIcon';

  // Added display name
  renderSortIcon.displayName = 'renderSortIcon';

  // Added display name
  renderSortIcon.displayName = 'renderSortIcon';


    if (!sortable || !field) return null;
    
    const showIcon = isSorted || isHovered;
    if (!showIcon) return null;
    
    const IconComponent = (isSorted && sortDirection === 'desc') ? ArrowDownwardIcon : ArrowUpwardIcon;
    
    return (
      <span style={{ 
        display: 'inline-flex', 
        marginLeft: 4,
        opacity: isSorted ? 1 : 0.5,
        fontSize: '1rem',
        verticalAlign: 'middle'
      }}>
        <IconComponent style={{ fontSize: 'inherit' }} />
      </span>
    );
  };
  
  return (
    <th
      onClick={sortable && field ? handleSortClick : undefined}
      onMouseEnter={() => sortable && field && setIsHovered(true)}
      onMouseLeave={() => sortable && field && setIsHovered(false)}
      style={{
        padding: '16px',
        textAlign: align,
        fontWeight: 'bold',
        borderBottom: '2px solid var(--divider, #e0e0e0)',
        cursor: sortable && field ? 'pointer' : 'default',
        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: isHovered && sortable && field ? 'var(--action-hover, rgba(0, 0, 0, 0.04))' : 'transparent',
        width: width,
        minWidth: minWidth,
        maxWidth: maxWidth,
        ...rest.style
      }}
      scope="col&quot;
      {...ariaAttributes}
      {...rest}
    >
      {children}
      {renderSortIcon()}
    </th>
  );
});

TableHeadCellAdapted.propTypes = {
  // Content
  children: PropTypes.node,
  
  // Sorting
  sortable: PropTypes.bool,
  onSort: PropTypes.func,
  sortDirection: PropTypes.oneOf(["asc', 'desc']),
  sortBy: PropTypes.string,
  field: PropTypes.string,
  
  // Display
  align: PropTypes.oneOf(['left', 'center', 'right']),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  
  // Accessibility
  ariaLabel: PropTypes.string,
  ariaSort: PropTypes.oneOf(['ascending', 'descending', 'none']),
};

TableHeadCellAdapted.displayName = 'TableHeadCellAdapted';

// Attach cell component to TableHeadAdapted
TableHeadAdapted.Cell = TableHeadCellAdapted;

export default TableHead;