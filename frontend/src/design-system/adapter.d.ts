/**
 * Type declarations for the design system adapter
 */

import React from 'react';

// Import types
import {
  Theme,
  ThemeContextInterface,
  
  // Feedback components
  AccordionProps,
  AccordionSummaryProps,
  AccordionDetailsProps,
  AlertProps,
  ModalProps,
  TooltipProps,
  SkeletonProps,
  
  // Form components
  ButtonProps,
  CheckboxProps,
  DatePickerProps,
  RadioGroupProps,
  SelectProps,
  SliderProps,
  TextFieldProps,
  
  // Display components
  AvatarProps,
  ChipProps,
  DataGridProps,
  DataPreviewProps,
  ListProps,
  TableProps,
  TableHeadProps,
  TableHeadCellProps,
  TableBodyProps,
  TableBodyRowProps,
  TableBodyCellProps,
  
  // Navigation components
  LinkProps,
  PaginationProps,
  TabsProps,
  TabProps,
  TabPanelProps
} from './types';

// Theme providers
export declare const ThemeProvider: React.FC<{
  children: React.ReactNode;
  theme?: Theme;
}>;

export declare const ThemeCompatibilityProvider: React.FC<{
  children: React.ReactNode;
}>;

export declare function useTheme(): Theme;
export declare function useMediaQuery(query: string): boolean;

// Feedback components
export declare const Accordion: React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>>;
export declare const AccordionSummary: React.ForwardRefExoticComponent<AccordionSummaryProps & React.RefAttributes<HTMLDivElement>>;
export declare const AccordionDetails: React.ForwardRefExoticComponent<AccordionDetailsProps & React.RefAttributes<HTMLDivElement>>;
export declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
export declare const Modal: React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<HTMLDivElement>>;
export declare const Tooltip: React.ForwardRefExoticComponent<TooltipProps & React.RefAttributes<HTMLDivElement>>;
export declare const Skeleton: React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<HTMLDivElement>>;

// Form components
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
export declare const DatePicker: React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<HTMLDivElement>>;
export declare const RadioGroup: React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>>;
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
export declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLDivElement>>;
export declare const TextField: React.ForwardRefExoticComponent<TextFieldProps & React.RefAttributes<HTMLInputElement>>;

// Display components
export declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLDivElement>>;
export declare const Chip: React.ForwardRefExoticComponent<ChipProps & React.RefAttributes<HTMLDivElement>>;
export declare const DataGrid: React.ForwardRefExoticComponent<DataGridProps & React.RefAttributes<HTMLDivElement>>;
export declare const DataPreview: React.ForwardRefExoticComponent<DataPreviewProps & React.RefAttributes<HTMLDivElement>>;
export declare const List: React.ForwardRefExoticComponent<ListProps & React.RefAttributes<HTMLUListElement>>;
export declare const Table: React.ForwardRefExoticComponent<TableProps & React.RefAttributes<HTMLTableElement>>;
export declare const TableHead: React.ForwardRefExoticComponent<TableHeadProps & React.RefAttributes<HTMLTableSectionElement>>;
export declare const TableBody: React.ForwardRefExoticComponent<TableBodyProps & React.RefAttributes<HTMLTableSectionElement>>;

// Navigation components
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLDivElement>>;
export declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>>;
export declare const Tab: React.ForwardRefExoticComponent<TabProps & React.RefAttributes<HTMLButtonElement>>;
export declare const TabPanel: React.ForwardRefExoticComponent<TabPanelProps & React.RefAttributes<HTMLDivElement>>;

// Layout components
export declare const Box: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
  component?: React.ElementType;
  sx?: Record<string, any>;
} & React.RefAttributes<HTMLDivElement>>;

export declare const Container: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fixed?: boolean;
  disableGutters?: boolean;
  component?: React.ElementType;
  sx?: Record<string, any>;
} & React.RefAttributes<HTMLDivElement>>;

export declare const Grid: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
  container?: boolean;
  item?: boolean;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
  spacing?: number | string;
  component?: React.ElementType;
  sx?: Record<string, any>;
} & React.RefAttributes<HTMLDivElement>>;

export declare const Stack: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  spacing?: number | string;
  divider?: React.ReactNode;
  component?: React.ElementType;
  sx?: Record<string, any>;
} & React.RefAttributes<HTMLDivElement>>;

// Typography
export declare const Typography: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLElement> & {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
  component?: React.ElementType;
  gutterBottom?: boolean;
  noWrap?: boolean;
  paragraph?: boolean;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  color?: string;
  sx?: Record<string, any>;
} & React.RefAttributes<HTMLElement>>;

// Other components and utilities
export declare const Popper: React.FC<{
  open?: boolean;
  anchorEl?: null | Element | ((element: Element) => Element);
  children: React.ReactNode | ((props: { placement: string; TransitionProps?: object }) => React.ReactNode);
  placement?: 'bottom-end' | 'bottom-start' | 'bottom' | 'left-end' | 'left-start' | 'left' | 'right-end' | 'right-start' | 'right' | 'top-end' | 'top-start' | 'top';
  disablePortal?: boolean;
  keepMounted?: boolean;
  transition?: boolean;
  sx?: Record<string, any>;
}>;

export declare const Fade: React.FC<{
  children: React.ReactNode;
  in?: boolean;
  timeout?: number | { enter?: number; exit?: number };
}>;

export declare const Collapse: React.FC<{
  children: React.ReactNode;
  in?: boolean;
  timeout?: number | 'auto' | { enter?: number; exit?: number };
  collapsedSize?: number | string;
  orientation?: 'horizontal' | 'vertical';
}>;

// Styling utilities
export declare function styled(
  Component: React.ElementType,
  options?: object
): (...styles: any[]) => React.ForwardRefExoticComponent<any>;

export declare function alpha(color: string, opacity: number): string;

export declare function createTheme(theme: Partial<Theme>): Theme;