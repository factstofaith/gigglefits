/**
 * Common type definitions for design system components
 */

import React from 'react';

/**
 * Common HTML element props
 */
export type HTMLElementProps = React.HTMLAttributes<HTMLElement>;

/**
 * Standard event handler types
 */
export type ChangeHandler<T = any> = (value: T, event: React.ChangeEvent<HTMLElement>) => void;
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;

/**
 * Common component appearance props
 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
export type SizeVariant = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Common size related types
 */
export type DimensionValue = number | string;
export type ResponsiveValue<T> = T | Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', T>;

/**
 * Utility type for polymorphic components
 */
export type PolymorphicComponent<P = {}, D extends React.ElementType = 'div'> = 
  React.ForwardRefExoticComponent<P & { component?: D } & React.RefAttributes<unknown>>;

/**
 * Utility type for component that accepts 'as' prop
 */
export type AsComponent<P = {}, D extends React.ElementType = 'div'> = 
  React.ForwardRefExoticComponent<P & { as?: D } & React.RefAttributes<unknown>>;

/**
 * Utility type for component ref
 */
export type ComponentRef<T extends HTMLElement = HTMLElement> = React.RefObject<T>;

/**
 * Common styling props
 */
export interface SxProps {
  sx?: Record<string, any>;
}

/**
 * Common component states
 */
export interface ComponentStateProps {
  disabled?: boolean;
  error?: boolean;
  focused?: boolean;
  required?: boolean;
}

/**
 * Common accessibility props
 */
export interface AccessibilityProps {
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  role?: string;
}

/**
 * Common transition props
 */
export interface TransitionProps {
  TransitionComponent?: React.ElementType;
  TransitionProps?: Record<string, any>;
}

/**
 * Common table-related types
 */
export interface DataGridColumn<T = any> {
  field: string;
  headerName?: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: { row: T; field: string; value: any }) => React.ReactNode;
}

/**
 * Form-related common types
 */
export interface FormControlProps extends ComponentStateProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Data-related common types
 */
export interface PaginationProps {
  page?: number;
  count?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Common sorting types
 */
export type SortDirection = 'asc' | 'desc' | null;
export interface SortProps {
  field: string;
  direction: SortDirection;
}