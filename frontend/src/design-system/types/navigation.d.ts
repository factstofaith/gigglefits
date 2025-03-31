/**
 * Type definitions for navigation components
 */

import React from 'react';
import {
  AccessibilityProps,
  ColorVariant,
  ComponentStateProps,
  SxProps
} from './common';

/**
 * TabsAdapted component props
 */
export interface TabsProps extends SxProps, AccessibilityProps, ComponentStateProps, React.RefAttributes<HTMLDivElement> {
  /** The value of the currently selected tab */
  value: number | string;
  /** Callback fired when a tab is selected */
  onChange: (event: React.SyntheticEvent, value: number | string) => void;
  /** The content of the component, normally Tab components */
  children?: React.ReactNode;
  /** The position of the tabs */
  orientation?: 'horizontal' | 'vertical';
  /** The variant to use */
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  /** The component used for the TabIndicator */
  TabIndicatorProps?: object;
  /** If true, the tabs will be centered */
  centered?: boolean;
  /** Determines additional display behavior of the tabs */
  scrollButtons?: 'auto' | 'desktop' | 'on' | 'off';
  /** The color of the component */
  color?: ColorVariant;
}

/**
 * TabAdapted component props
 */
export interface TabProps extends SxProps, AccessibilityProps, ComponentStateProps, React.RefAttributes<HTMLButtonElement> {
  /** The label of the tab */
  label?: React.ReactNode;
  /** The value of the tab */
  value?: number | string;
  /** If true, the tab will be centered */
  centered?: boolean;
  /** The icon element */
  icon?: React.ReactNode;
  /** Tab content direction */
  iconPosition?: 'start' | 'end' | 'top' | 'bottom';
  /** Override or extend the styles applied to the component */
  classes?: object;
  /** If true, displays the tab indicator */
  showIndicator?: boolean;
  /** The color of the tab */
  color?: ColorVariant;
}

/**
 * TabPanelAdapted component props
 */
export interface TabPanelProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** The content of the component */
  children?: React.ReactNode;
  /** The value of the corresponding Tab */
  value: number | string;
  /** The active value of the Tabs component */
  activeValue: number | string;
  /** Index of the TabPanel */
  index?: number;
}

/**
 * LinkAdapted component props
 */
export interface LinkProps extends SxProps, AccessibilityProps, ComponentStateProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The content of the link */
  children?: React.ReactNode;
  /** The color of the link */
  color?: ColorVariant | 'textPrimary' | 'textSecondary' | 'inherit';
  /** Controls the text decoration */
  underline?: 'none' | 'hover' | 'always';
  /** If true, the link will open in a new tab */
  external?: boolean;
  /** Component used for the root node */
  component?: React.ElementType;
  /** If true, compact padding */
  dense?: boolean;
  /** Typography variant to use */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline' | 'inherit';
}

/**
 * PaginationAdapted component props
 */
export interface PaginationProps extends SxProps, AccessibilityProps, ComponentStateProps, React.RefAttributes<HTMLDivElement> {
  /** The total number of pages */
  count: number;
  /** The page selected by default */
  defaultPage?: number;
  /** The current page */
  page?: number;
  /** Callback fired when page is changed */
  onChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  /** If true, hide the next-page button */
  hideNextButton?: boolean;
  /** If true, hide the previous-page button */
  hidePrevButton?: boolean;
  /** If true, hide the first-page button */
  hideFirstButton?: boolean;
  /** If true, hide the last-page button */
  hideLastButton?: boolean;
  /** If true, show the first-page button */
  showFirstButton?: boolean;
  /** If true, show the last-page button */
  showLastButton?: boolean;
  /** The shape of the pagination items */
  shape?: 'round' | 'rounded';
  /** The size of the pagination component */
  size?: 'small' | 'medium' | 'large';
  /** The variant to use */
  variant?: 'text' | 'outlined';
  /** The color of the component */
  color?: ColorVariant;
  /** The number of siblings to show on each side of current page */
  siblingCount?: number;
  /** Number of always visible pages at the beginning and end */
  boundaryCount?: number;
}