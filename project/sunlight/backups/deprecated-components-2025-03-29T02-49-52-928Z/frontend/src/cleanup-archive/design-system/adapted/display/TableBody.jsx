/**
 * @component TableBody
 * @description Enhanced table body component with virtualization support
 * for efficient rendering of large datasets.
 * @typedef {import('../../../design-system/types/display').TableBodyProps} TableBodyProps
 * @typedef {import('../../../design-system/types/display').TableBodyRowProps} TableBodyRowProps
 * @typedef {import('../../../design-system/types/display').TableBodyCellProps} TableBodyCellProps
 * @type {React.ForwardRefExoticComponent<TableBodyProps>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList } from 'react-window';
import { getAriaAttributes } from '@utils/accessibilityUtils';
import Tab from '@mui/material/Tab';

/**
 * TableBodyAdapted - Enhanced table body component
 */
const TableBody = React.memo(({
  children,
  virtualized = false,
  data = [],
  rowHeight = 53,
  maxHeight = 400,
  renderRow,
  striped = false,
  
  // Accessibility props
  ariaLabel,
  
  // Additional props
  ...rest
}) => {
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || 'Table body',
  });
  
  // If virtualized, use FixedSizeList for efficient rendering
  if (virtualized && Array.isArray(data) && data.length > 0 && renderRow) {
    return (
      <tbody {...ariaAttributes} {...rest}>
        <tr>
          <td colSpan={1000} style={{ padding: 0, border: 'none' }}>
            <FixedSizeList
              height={Math.min(rowHeight * data.length, maxHeight)}
              width="100%&quot;
              itemCount={data.length}
              itemSize={rowHeight}
              itemData={data}
              style={{ overflowX: "hidden' }}
            >
              {({ index, style }) => (
                <div style={style}>
                  {renderRow({ index, data: data[index], style })}
                </div>
              )}
            </FixedSizeList>
          </td>
        </tr>
      </tbody>
    );
  }
  
  // Process children to add striping if needed
  const processedChildren = striped 
    ? React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          striped: striped,
          isOdd: index % 2 === 1,
          ...child.props
        });
      })
    : children;
  
  // Regular tbody implementation for standard use
  return (
    <tbody
      {...ariaAttributes}
      {...rest}
    >
      {processedChildren}
    </tbody>
  );
});

TableBodyAdapted.propTypes = {
  // Content
  children: PropTypes.node,
  
  // Virtualization props
  virtualized: PropTypes.bool,
  data: PropTypes.array,
  rowHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  renderRow: PropTypes.func,
  
  // Display
  striped: PropTypes.bool,
  
  // Accessibility
  ariaLabel: PropTypes.string,
};

TableBody.displayName = 'TableBody';

/**
 * TableBodyRowAdapted - Row component for table body
 * @type {React.FC<TableBodyRowProps>}
 */
export const TableBodyRowAdapted = React.memo(({
  children,
  hover = false,
  selected = false,
  striped = false,
  isOdd = false,
  onClick,
  
  // Accessibility props
  ariaLabel,
  
  // Additional props
  ...rest
}) => {
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    selected: selected ? 'true' : undefined,
  });
  
  // Determine background color based on state
  const getBackgroundColor = () => {
  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';


    if (selected) return 'var(--action-selected, rgba(0, 0, 0, 0.08))';
    if (striped && isOdd) return 'var(--action-hover, rgba(0, 0, 0, 0.04))';
    return 'transparent';
  };
  
  return (
    <tr
      onClick={onClick}
      {...ariaAttributes}
      {...rest}
      style={{
        backgroundColor: getBackgroundColor(),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': hover ? {
          backgroundColor: 'var(--action-hover, rgba(0, 0, 0, 0.04))'
        } : {},
        ...rest.style
      }}
    >
      {children}
    </tr>
  );
});

TableBodyRowAdapted.propTypes = {
  // Content
  children: PropTypes.node,
  
  // State
  hover: PropTypes.bool,
  selected: PropTypes.bool,
  striped: PropTypes.bool,
  isOdd: PropTypes.bool,
  onClick: PropTypes.func,
  
  // Accessibility
  ariaLabel: PropTypes.string,
};

TableBodyRowAdapted.displayName = 'TableBodyRowAdapted';

/**
 * TableBodyCellAdapted - Cell component for table body
 * @type {React.FC<TableBodyCellProps>}
 */
export const TableBodyCellAdapted = React.memo(({
  children,
  align = 'left',
  padding = 'normal',
  colSpan,
  width,
  minWidth,
  maxWidth,
  
  // Accessibility props
  ariaLabel,
  
  // Additional props
  ...rest
}) => {
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || (typeof children === 'string' ? children : undefined),
  });
  
  // Determine padding based on prop
  const getPadding = () => {
  // Added display name
  getPadding.displayName = 'getPadding';

  // Added display name
  getPadding.displayName = 'getPadding';

  // Added display name
  getPadding.displayName = 'getPadding';

  // Added display name
  getPadding.displayName = 'getPadding';

  // Added display name
  getPadding.displayName = 'getPadding';


    switch (padding) {
      case 'dense':
        return '6px 16px';
      case 'none':
        return '0';
      case 'normal':
      default:
        return '16px';
    }
  };
  
  return (
    <td
      colSpan={colSpan}
      {...ariaAttributes}
      {...rest}
      style={{
        padding: getPadding(),
        textAlign: align,
        borderBottom: '1px solid var(--divider, #e0e0e0)',
        width: width,
        minWidth: minWidth,
        maxWidth: maxWidth,
        ...rest.style
      }}
    >
      {children}
    </td>
  );
});

TableBodyCellAdapted.propTypes = {
  // Content
  children: PropTypes.node,
  
  // Display
  align: PropTypes.oneOf(['left', 'center', 'right']),
  padding: PropTypes.oneOf(['normal', 'dense', 'none']),
  colSpan: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  
  // Accessibility
  ariaLabel: PropTypes.string,
};

TableBodyCellAdapted.displayName = 'TableBodyCellAdapted';

// Attach subcomponents
TableBodyAdapted.Row = TableBodyRowAdapted;
TableBodyAdapted.Cell = TableBodyCellAdapted;

export default TableBody;