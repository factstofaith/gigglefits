/**
 * Type definitions for complex components
 */

import React from 'react';
import {
  AccessibilityProps,
  ComponentStateProps,
  DataGridColumn,
  PaginationProps,
  SortDirection,
  SortProps,
  SxProps
} from './common';

/**
 * DataGridAdapted component props
 */
export interface DataGridAdaptedProps<TData = any> extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** Unique identifier for the data grid */
  id: string;
  /** Column definitions */
  columns: DataGridColumn<TData>[];
  /** Data rows */
  rows: TData[];
  /** Height of the grid */
  height?: number | string;
  /** Width of the grid */
  width?: number | string;
  /** Height of the header row */
  headerHeight?: number;
  /** Height of the data rows */
  rowHeight?: number;
  /** If true, enables virtualization for large datasets */
  enableVirtualization?: boolean;
  /** If true, makes the header stick to the top when scrolling */
  stickyHeader?: boolean;
  /** If true, reduces the padding of rows */
  dense?: boolean;
  /** Message to display when there is no data */
  noDataMessage?: React.ReactNode;
  /** Callback fired when a row is clicked */
  onRowClick?: (row: TData, index: number) => void;
  /** If true, displays a loading indicator */
  loading?: boolean;
  /** Custom component to display while loading */
  loadingComponent?: React.ReactNode;
  /** Function to get a unique identifier for a row */
  getRowId?: (row: TData) => string | number;
  /** Function to get a class name for a row */
  getRowClassName?: (row: TData, index: number) => string;
  /** Function to get a class name for a cell */
  getCellClassName?: (row: TData, columnIndex: number, rowIndex: number) => string;
  /** Function to render a custom cell */
  renderCell?: (value: any, row: TData, columnIndex: number, rowIndex: number) => React.ReactNode;
  /** Sorting model */
  sortModel?: SortProps[];
  /** Callback fired when sorting changes */
  onSortModelChange?: (model: SortProps[]) => void;
  /** If true, shows checkboxes for row selection */
  checkboxSelection?: boolean;
  /** Selected row ids */
  selectionModel?: (string | number)[];
  /** Callback fired when selection changes */
  onSelectionModelChange?: (newSelection: (string | number)[]) => void;
  /** Pagination props */
  pagination?: boolean;
  /** Page size */
  pageSize?: number;
  /** Current page */
  page?: number;
  /** Callback fired when the page changes */
  onPageChange?: (newPage: number) => void;
  /** Callback fired when the page size changes */
  onPageSizeChange?: (newPageSize: number) => void;
}

/**
 * TableAdapted component props
 */
export interface TableAdaptedProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLTableElement> {
  /** The content of the table, typically TableHead and TableBody */
  children: React.ReactNode;
  /** If true, the table rows will shade on hover */
  hover?: boolean;
  /** If true, the table header will stick to the top while scrolling */
  stickyHeader?: boolean;
  /** If true, applies alternating background colors to rows */
  striped?: boolean;
  /** Defines the table density */
  size?: 'small' | 'medium';
  /** If true, removes most of the padding */
  dense?: boolean;
  /** Cell padding */
  padding?: 'normal' | 'checkbox' | 'none';
  /** Component to render for the root node */
  component?: React.ElementType;
  /** Class name applied to the root element */
  className?: string;
  /** Inline style for the root element */
  style?: React.CSSProperties;
}

/**
 * ListAdapted component props
 */
export interface ListAdaptedProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLUListElement> {
  /** The content of the list, typically ListItem components */
  children?: React.ReactNode;
  /** If true, compact vertical padding is used */
  dense?: boolean;
  /** If true, disables padding for list items */
  disablePadding?: boolean;
  /** If true, list items will not have hover effect */
  disableGutters?: boolean;
  /** List subheader element */
  subheader?: React.ReactNode;
  /** If true, enables virtualization for large lists */
  virtualized?: boolean;
  /** Data for virtualized lists */
  data?: any[];
  /** Item height for virtualization */
  itemHeight?: number;
  /** Function to render each item */
  renderItem?: (item: any, index: number) => React.ReactNode;
  /** Maximum height for the list */
  maxHeight?: number | string;
  /** Component to render for the root node */
  component?: React.ElementType;
  /** Class name applied to the root element */
  className?: string;
  /** Inline style for the root element */
  style?: React.CSSProperties;
}

/**
 * ModalAdapted component props
 */
export interface ModalAdaptedProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** If true, the modal is open */
  open: boolean;
  /** Callback fired when the modal is closed */
  onClose: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, reason: 'backdropClick' | 'escapeKeyDown') => void;
  /** Modal title */
  title?: React.ReactNode;
  /** Modal content */
  children: React.ReactNode;
  /** Modal action buttons */
  actions?: React.ReactNode;
  /** Maximum width of the modal dialog */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** If true, the modal will take up the full width of its container */
  fullWidth?: boolean;
  /** If true, the modal will take up the full screen */
  fullScreen?: boolean;
  /** Class applied to the modal */
  className?: string;
  /** Class applied to the content */
  contentClassName?: string;
  /** Class applied to the backdrop */
  backdropClassName?: string;
  /** Class applied to the paper component */
  paperClassName?: string;
  /** Transition duration */
  transitionDuration?: number | { enter?: number, exit?: number };
  /** If true, clicking the backdrop will not fire the onClose callback */
  disableBackdropClick?: boolean;
  /** If true, pressing the Escape key will not fire the onClose callback */
  disableEscapeKeyDown?: boolean;
  /** If true, the modal will not display a backdrop */
  hideBackdrop?: boolean;
  /** If true, the modal will not unmount when closed */
  keepMounted?: boolean;
  /** Class applied to the root element */
  className?: string;
  /** Inline style for the root element */
  style?: React.CSSProperties;
}

/**
 * TabsAdapted component props
 */
export interface TabsAdaptedProps extends SxProps, AccessibilityProps, ComponentStateProps, React.RefAttributes<HTMLDivElement> {
  /** The value of the currently selected tab */
  value: number | string;
  /** Callback fired when a tab is clicked */
  onChange: (event: React.SyntheticEvent, value: number | string) => void;
  /** The content of the component, normally Tab components */
  children?: React.ReactNode;
  /** The position of the tabs */
  orientation?: 'horizontal' | 'vertical';
  /** The variant to use */
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  /** If true, the tabs will be centered */
  centered?: boolean;
  /** Determines additional display behavior of the tabs */
  scrollButtons?: 'auto' | 'desktop' | 'on' | 'off' | boolean;
  /** The component used for the root node */
  component?: React.ElementType;
  /** The color of the component */
  color?: 'primary' | 'secondary' | 'default';
  /** Class name applied to the root element */
  className?: string;
  /** Inline style for the root element */
  style?: React.CSSProperties;
  /** The indicator color */
  indicatorColor?: 'primary' | 'secondary';
  /** The text color of the tabs */
  textColor?: 'primary' | 'secondary' | 'inherit';
}

/**
 * TabAdapted component props
 */
export interface TabAdaptedProps extends SxProps, AccessibilityProps, ComponentStateProps, React.RefAttributes<HTMLButtonElement> {
  /** The label element */
  label?: React.ReactNode;
  /** The value of the tab */
  value?: number | string;
  /** If true, the tab will take up the full width of its container */
  fullWidth?: boolean;
  /** The icon element */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'start' | 'end' | 'top' | 'bottom';
  /** The wrapped component */
  wrapped?: boolean;
  /** The component used for the root node */
  component?: React.ElementType;
  /** Class name applied to the root element */
  className?: string;
  /** Inline style for the root element */
  style?: React.CSSProperties;
}

/**
 * AccordionAdapted component props
 */
export interface AccordionAdaptedProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** The content of the accordion */
  children: React.ReactNode;
  /** If true, expands the accordion by default */
  defaultExpanded?: boolean;
  /** If true, the accordion is expanded */
  expanded?: boolean;
  /** Callback fired when the expand/collapse state is changed */
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  /** If true, the accordion is disabled */
  disabled?: boolean;
  /** If true, removes the margin between accordions */
  disableGutters?: boolean;
  /** If true, removes the rounded corners */
  square?: boolean;
  /** The variant to use */
  variant?: 'elevation' | 'outlined';
  /** Shadow depth when variant="elevation" */
  elevation?: number;
  /** The component used for the transition */
  TransitionComponent?: React.ElementType;
  /** Props applied to the transition element */
  TransitionProps?: object;
  /** Class name applied to the root element */
  className?: string;
  /** Inline style for the root element */
  style?: React.CSSProperties;
}