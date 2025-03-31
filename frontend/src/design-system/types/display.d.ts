/**
 * Type definitions for display components
 */

import React from 'react';
import {
  AccessibilityProps,
  ColorVariant,
  ComponentStateProps,
  DataGridColumn,
  PaginationProps,
  SizeVariant,
  SortDirection,
  SortProps,
  SxProps
} from './common';

/**
 * AvatarAdapted component props
 */
export interface AvatarProps extends SxProps, AccessibilityProps {
  /** Alt text for the avatar image */
  alt?: string;
  /** The content of the component, typically used when no src is provided */
  children?: React.ReactNode;
  /** Properties applied to the img element */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  /** The sizes attribute for the img element */
  sizes?: string;
  /** The src attribute for the img element */
  src?: string;
  /** The srcSet attribute for the img element */
  srcSet?: string;
  /** The shape of the avatar */
  variant?: 'circular' | 'rounded' | 'square';
  /** The size of the avatar */
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;
  /** The color of the avatar */
  color?: 'default' | ColorVariant | string;
}

/**
 * TableAdapted component props
 */
export interface TableProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLTableElement> {
  /** The content of the table, typically TableHead and TableBody components */
  children?: React.ReactNode;
  /** If true, the table row will shade on hover */
  hover?: boolean;
  /** If true, the table will have a fixed layout */
  stickyHeader?: boolean;
  /** If true, will apply some styles to the table rows */
  striped?: boolean;
  /** Allows TableCell components to specify a size property */
  size?: 'small' | 'medium';
  /** If true, compact the table */
  dense?: boolean;
  /** If true, remove padding */
  padding?: 'normal' | 'checkbox' | 'none';
  /** Aria label for the table */
  ariaLabel?: string;
}

/**
 * TableHeadAdapted component props
 */
export interface TableHeadProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLTableSectionElement> {
  /** The content of the component, typically TableCell components */
  children?: React.ReactNode;
  /** If true, make header stick to the top of the container */
  stickyHeader?: boolean;
  /** Sort information */
  sort?: SortProps;
  /** Callback fired when header cell is clicked for sorting */
  onSortChange?: (field: string, direction: SortDirection) => void;
}

/**
 * TableHeadCellAdapted component props
 */
export interface TableHeadCellProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLTableCellElement> {
  /** The content of the cell */
  children?: React.ReactNode;
  /** The field this cell is associated with, used for sorting */
  field?: string;
  /** If true, the cell can be sorted */
  sortable?: boolean;
  /** Current sort direction for this field */
  sortDirection?: SortDirection;
  /** Set the text-align on the table cell content */
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  /** Specify the padding */
  padding?: 'normal' | 'checkbox' | 'none';
  /** Specify the cell's scope attribute */
  scope?: string;
  /** Sets the width of the cell */
  width?: number | string;
}

/**
 * TableBodyAdapted component props
 */
export interface TableBodyProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLTableSectionElement> {
  /** The content of the component, typically TableRow components */
  children?: React.ReactNode;
  /** Enable striped rows */
  striped?: boolean;
  /** Data for virtualized rendering */
  data?: any[];
  /** If true, enables virtualized rendering for large datasets */
  virtualized?: boolean;
  /** Row height for virtualization */
  rowHeight?: number;
  /** Maximum height for virtualized table body */
  maxHeight?: number | string;
  /** Render function for virtualized rows */
  renderRow?: (item: any, index: number) => React.ReactNode;
}

/**
 * TableBodyRowAdapted component props
 */
export interface TableBodyRowProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLTableRowElement> {
  /** The content of the row, typically TableCell components */
  children?: React.ReactNode;
  /** If true, the table row will have the hover effect */
  hover?: boolean;
  /** If true, the table row will have the selected styles */
  selected?: boolean;
  /** Callback fired when row is clicked */
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  /** Stripe index for alternating colors */
  stripeIndex?: number;
}

/**
 * TableBodyCellAdapted component props
 */
export interface TableBodyCellProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLTableCellElement> {
  /** The content of the cell */
  children?: React.ReactNode;
  /** Set the text-align on the table cell content */
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  /** Specify the padding */
  padding?: 'normal' | 'checkbox' | 'none';
  /** The number of columns the cell extends */
  colSpan?: number;
  /** The number of rows the cell spans */
  rowSpan?: number;
  /** Sets the width of the cell */
  width?: number | string;
}

/**
 * ChipAdapted component props
 */
export interface ChipProps extends SxProps, AccessibilityProps, ComponentStateProps, React.RefAttributes<HTMLDivElement> {
  /** The content of the chip */
  label?: React.ReactNode;
  /** Avatar element */
  avatar?: React.ReactNode;
  /** Icon element displayed before the label */
  icon?: React.ReactNode;
  /** Icon element displayed after the label */
  deleteIcon?: React.ReactNode;
  /** If true, the chip will appear clickable */
  clickable?: boolean;
  /** Callback fired when the chip is clicked */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Callback fired when the delete icon is clicked */
  onDelete?: (event: React.MouseEvent<HTMLElement>) => void;
  /** The color of the chip */
  color?: ColorVariant;
  /** The variant of the chip */
  variant?: 'filled' | 'outlined';
  /** The size of the chip */
  size?: 'small' | 'medium';
}

/**
 * DataGridAdapted component props
 */
export interface DataGridProps<T = any> extends SxProps, AccessibilityProps, PaginationProps, React.RefAttributes<HTMLDivElement> {
  /** Data grid columns configuration */
  columns: DataGridColumn<T>[];
  /** Data rows */
  rows: T[];
  /** Loading state */
  loading?: boolean;
  /** If true, shows checkboxes for row selection */
  checkboxSelection?: boolean;
  /** Selected row ids */
  selectionModel?: string[] | number[];
  /** Callback fired when selection changes */
  onSelectionModelChange?: (newSelection: string[] | number[]) => void;
  /** Callback fired when a row is clicked */
  onRowClick?: (params: { row: T; index: number }) => void;
  /** Sorting model */
  sortModel?: SortProps[];
  /** Callback fired when sorting changes */
  onSortModelChange?: (model: SortProps[]) => void;
  /** If true, enables virtualized rendering for large datasets */
  virtualized?: boolean;
  /** Height of the data grid */
  height?: number | string;
  /** If true, enables pagination */
  pagination?: boolean;
  /** Density of the grid */
  density?: 'compact' | 'standard' | 'comfortable';
  /** If true, disables column sorting */
  disableColumnSorting?: boolean;
  /** If true, disables column resize */
  disableColumnResize?: boolean;
  /** If true, disables column menu */
  disableColumnMenu?: boolean;
  /** The number of rows per page. Only applicable when pagination is enabled. */
  pageSize?: number;
  /** Current page. Only applicable when pagination is enabled. */
  page?: number;
  /** Callback fired when page changes */
  onPageChange?: (page: number) => void;
  /** Callback fired when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * ListAdapted component props
 */
export interface ListProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLUListElement> {
  /** The content of the component, normally ListItem components */
  children?: React.ReactNode;
  /** If true, compact vertical padding is used */
  dense?: boolean;
  /** If true, removes padding from the list */
  disablePadding?: boolean;
  /** If true, the list will subheaders stick to the top during scroll */
  subheader?: React.ReactNode;
  /** If true, enables virtualized rendering for large lists */
  virtualized?: boolean;
  /** Data for virtualized rendering */
  data?: any[];
  /** Height of the list */
  height?: number | string;
  /** Row height for virtualization */
  rowHeight?: number;
  /** Render function for virtualized items */
  renderItem?: (item: any, index: number) => React.ReactNode;
}

/**
 * DataPreviewAdapted component props
 */
export interface DataPreviewProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** The data to preview */
  data: any[] | object;
  /** View mode */
  viewMode?: 'table' | 'json' | 'raw';
  /** If true, enables search functionality */
  searchEnabled?: boolean;
  /** If true, enables filtering */
  filterEnabled?: boolean;
  /** Initial expanded paths for JSON view */
  defaultExpandedPaths?: string[];
  /** Maximum height for the preview container */
  maxHeight?: number | string;
  /** If true, displays loading animation */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** If true, enables copy to clipboard functionality */
  copyEnabled?: boolean;
  /** Callback fired when data is copied */
  onCopy?: () => void;
  /** If true, enables virtualized rendering for large datasets */
  virtualized?: boolean;
  /** If true, enables sorting of table columns */
  sortable?: boolean;
}

/**
 * CardAdapted component props
 */
export interface CardProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** The content of the card */
  children?: React.ReactNode;
  /** Shadow depth, corresponds to dp in the spec */
  elevation?: number;
  /** The variant to use */
  variant?: 'elevation' | 'outlined';
  /** If true, rounded corners are disabled */
  square?: boolean;
  /** If true, the card will use a higher elevation */
  raised?: boolean;
  /** Callback fired when the card is clicked */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** The role attribute of the card */
  role?: string;
  /** Class name applied to the root element */
  className?: string;
  /** Style applied to the root element */
  style?: React.CSSProperties;
}

/**
 * CardContentAdapted component props
 */
export interface CardContentProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** The content of the component */
  children?: React.ReactNode;
  /** If true, padding is removed */
  disablePadding?: boolean;
  /** If true, applies smaller padding */
  dense?: boolean;
  /** Class name applied to the root element */
  className?: string;
  /** Style applied to the root element */
  style?: React.CSSProperties;
}