import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';

/**
 * TableHead component for the header section of a table
 */
export const TableHead = forwardRef(({ children, ...props }, ref) => {
  const { theme } = useTheme();

  const headStyles = {
    display: 'table-header-group',
    borderBottom: `2px solid ${theme.palette.divider}`,
    fontWeight: theme.typography.fontWeightMedium,
  };

  return (
    <thead ref={ref} style={{ ...headStyles, ...props.style }} {...props}>
      {children}
    </thead>
  );
});

TableHead.propTypes = {
  /**
   * The content of the component, normally TableRow
   */
  children: PropTypes.node,
};

TableHead.displayName = 'TableHead';

/**
 * TableBody component for the body section of a table
 */
export const TableBody = forwardRef(({ children, ...props }, ref) => {
  const bodyStyles = {
    display: 'table-row-group',
  };

  return (
    <tbody ref={ref} style={{ ...bodyStyles, ...props.style }} {...props}>
      {children}
    </tbody>
  );
});

TableBody.propTypes = {
  /**
   * The content of the component, normally TableRow
   */
  children: PropTypes.node,
};

TableBody.displayName = 'TableBody';

/**
 * TableRow component for a row in a table
 */
export const TableRow = forwardRef(
  ({ children, selected = false, hover = false, onClick, ...props }, ref) => {
    const { theme } = useTheme();

    const isClickable = Boolean(onClick);

    // Base styles
    const rowStyles = {
      display: 'table-row',
      outline: 0,
      backgroundColor: selected ? theme.palette.action.selected : 'inherit',
      cursor: isClickable ? 'pointer' : 'inherit',
      transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // Hover state
    const hoverStyles =
      hover || isClickable
        ? {
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }
        : {};

    // Handle click
    const handleClick = event => {
      if (onClick) onClick(event);
    };

    return (
      <tr
        ref={ref}
        onClick={handleClick}
        style={{ ...rowStyles, ...props.style, ...hoverStyles }}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.propTypes = {
  /**
   * The content of the component, normally TableCell
   */
  children: PropTypes.node,

  /**
   * If true, the row will have the selected styling
   */
  selected: PropTypes.bool,

  /**
   * If true, the row will shade on hover
   */
  hover: PropTypes.bool,

  /**
   * Callback fired when the row is clicked
   */
  onClick: PropTypes.func,
};

TableRow.displayName = 'TableRow';

/**
 * TableCell component for a cell in a table
 */
export const TableCell = forwardRef(
  (
    {
      children,
      align = 'left',
      variant = 'body',
      padding = 'normal',
      scope,
      colSpan,
      width,
      minWidth,
      maxWidth,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Determine cell tag based on variant
    const Component = variant === 'head' ? 'th' : 'td';

    // Padding size based on prop
    const paddingSizes = {
      normal: theme.spacing.md,
      dense: theme.spacing.sm,
      none: '0',
    };

    // Base styles
    const cellStyles = {
      display: 'table-cell',
      padding: `${paddingSizes[padding] || paddingSizes.normal} ${paddingSizes[padding] || paddingSizes.normal}`,
      textAlign: align,
      borderBottom: `1px solid ${theme.palette.divider}`,
      verticalAlign: 'inherit',
      fontWeight:
        variant === 'head' ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular,
      color: variant === 'head' ? theme.palette.text.primary : theme.palette.text.secondary,
      fontSize: theme.typography.body2.fontSize,
      lineHeight: '1.5',
      width: width,
      minWidth: minWidth,
      maxWidth: maxWidth,
    };

    return (
      <Component
        ref={ref}
        scope={variant === 'head' ? scope || 'col' : scope}
        colSpan={colSpan}
        style={{ ...cellStyles, ...props.style }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

TableCell.propTypes = {
  /**
   * The content of the cell
   */
  children: PropTypes.node,

  /**
   * Set the text alignment
   */
  align: PropTypes.oneOf(['inherit', 'left', 'center', 'right', 'justify']),

  /**
   * Specify the cell type
   */
  variant: PropTypes.oneOf(['body', 'head']),

  /**
   * Sets the padding applied to the cell
   */
  padding: PropTypes.oneOf(['normal', 'dense', 'none']),

  /**
   * Set scope attribute
   */
  scope: PropTypes.string,

  /**
   * Number of columns the cell extends
   */
  colSpan: PropTypes.number,

  /**
   * Fixed width of the cell
   */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /**
   * Minimum width of the cell
   */
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /**
   * Maximum width of the cell
   */
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

TableCell.displayName = 'TableCell';

/**
 * TableContainer component provides a wrapper for the table with optional scrolling
 */
export const TableContainer = forwardRef(({ children, maxHeight, ...props }, ref) => {
  const containerStyles = {
    width: '100%',
    overflowX: 'auto',
    maxHeight: maxHeight,
    overflowY: maxHeight ? 'auto' : 'visible',
  };

  return (
    <div ref={ref} style={{ ...containerStyles, ...props.style }} {...props}>
      {children}
    </div>
  );
});

TableContainer.propTypes = {
  /**
   * The content of the container, normally a Table
   */
  children: PropTypes.node,

  /**
   * Maximum height of the container
   */
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

TableContainer.displayName = 'TableContainer';

/**
 * Table component provides a way to display structured data
 */
const Table = forwardRef(
  (
    {
      children,
      size = 'medium',
      stickyHeader = false,
      striped = false,
      borderless = false,
      compact = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Base table styles
    const tableStyles = {
      display: 'table',
      width: '100%',
      borderCollapse: 'collapse',
      borderSpacing: 0,
      fontSize: theme.typography.body2.fontSize,
      tableLayout: 'auto',
    };

    // Size-specific styles
    const sizeStyles = {
      small: {
        '& td, & th': {
          padding: theme.spacing.xs,
        },
      },
      medium: {
        // Default, no overrides needed
      },
    };

    // Apply sticky header if enabled
    const stickyHeaderStyles = stickyHeader
      ? {
          '& th': {
            position: 'sticky',
            top: 0,
            backgroundColor: theme.palette.background.paper,
            zIndex: 2,
          },
        }
      : {};

    // Apply striped rows if enabled
    const stripedStyles = striped
      ? {
          '& tbody tr:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
          },
        }
      : {};

    // Remove borders if borderless is true
    const borderStyles = borderless
      ? {
          '& td, & th': {
            borderBottom: 'none',
          },
        }
      : {};

    // Apply compact styling if compact is true
    const compactStyles = compact
      ? {
          '& td, & th': {
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          },
        }
      : {};

    // Helper to apply styles to the child components
    const processedChildren = React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return child;
      }

      // Pass size prop to TableHead and TableBody
      const childProps = {};

      // For future enhancements, can add additional props to child components here

      return React.cloneElement(child, childProps);
    });

    return (
      <table
        ref={ref}
        style={{
          ...tableStyles,
          ...sizeStyles[size],
          ...stickyHeaderStyles,
          ...stripedStyles,
          ...borderStyles,
          ...compactStyles,
          ...props.style,
        }}
        {...props}
      >
        {processedChildren}
      </table>
    );
  }
);

Table.propTypes = {
  /**
   * The content of the table, normally TableHead and TableBody
   */
  children: PropTypes.node,

  /**
   * The size of the table
   */
  size: PropTypes.oneOf(['small', 'medium']),

  /**
   * If true, the table header will stick to the top when scrolling
   */
  stickyHeader: PropTypes.bool,

  /**
   * If true, zebra-striping will be applied to rows
   */
  striped: PropTypes.bool,

  /**
   * If true, row borders will be removed
   */
  borderless: PropTypes.bool,

  /**
   * If true, the table will use more compact spacing
   */
  compact: PropTypes.bool,
};

Table.displayName = 'Table';

// Attach related components to Table
Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.Container = TableContainer;

export default Table;
