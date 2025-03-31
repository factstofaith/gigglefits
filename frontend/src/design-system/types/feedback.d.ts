/**
 * Type definitions for feedback components
 */

import React from 'react';
import {
  AccessibilityProps,
  ColorVariant,
  ComponentStateProps,
  SxProps,
  TransitionProps
} from './common';

/**
 * TooltipAdapted component props
 */
export interface TooltipProps extends SxProps, AccessibilityProps {
  /** The tooltip content */
  title: React.ReactNode;
  /** The element that triggers the tooltip */
  children: React.ReactElement;
  /** Tooltip placement relative to the trigger element */
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
  /** If true, adds an arrow pointing to the trigger */
  arrow?: boolean;
  /** Delay in ms before showing the tooltip */
  enterDelay?: number;
  /** Delay in ms before hiding the tooltip */
  leaveDelay?: number;
  /** Controls the open state in controlled mode */
  open?: boolean;
  /** If true, disables tooltip on hover */
  disableHoverListener?: boolean;
  /** If true, disables tooltip on touch */
  disableTouchListener?: boolean;
  /** If true, disables tooltip on focus */
  disableFocusListener?: boolean;
  /** Maximum width for the tooltip content */
  maxWidth?: number | string;
}

/**
 * SkeletonAdapted component props
 */
export interface SkeletonProps extends SxProps, AccessibilityProps {
  /** Type of skeleton */
  variant?: 'text' | 'circle' | 'rect' | 'rectangular' | 'rounded';
  /** Animation effect */
  animation?: 'pulse' | 'wave' | 'false' | false;
  /** Width of the skeleton */
  width?: number | string;
  /** Height of the skeleton */
  height?: number | string;
  /** Number of lines for text variant */
  lines?: number;
  /** Size for circle variant */
  diameter?: number | string;
}

/**
 * AccordionAdapted component props
 */
export interface AccordionProps extends SxProps, AccessibilityProps, TransitionProps, React.RefAttributes<HTMLDivElement> {
  /** The content of the accordion (typically Summary and Details components) */
  children: React.ReactNode;
  /** If true, expands the accordion by default in uncontrolled mode */
  defaultExpanded?: boolean;
  /** If true, disables the accordion */
  disabled?: boolean;
  /** Controls the expanded state in controlled mode */
  expanded?: boolean;
  /** Callback fired when the expanded state changes */
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  /** If true, removes the padding around the accordion */
  disableGutters?: boolean;
  /** If true, removes the rounded corners */
  square?: boolean;
  /** The variant to use for styling */
  variant?: 'elevation' | 'outlined';
  /** Shadow depth for elevation variant */
  elevation?: number;
}

/**
 * AccordionSummaryAdapted component props
 */
export interface AccordionSummaryProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** The content of the summary */
  children: React.ReactNode;
  /** Icon to display for expand/collapse */
  expandIcon?: React.ReactNode;
  /** If true, disables the accordion summary */
  disabled?: boolean;
  /** Expanded state (usually provided by AccordionAdapted) */
  expanded?: boolean;
  /** Callback when clicked (usually provided by AccordionAdapted) */
  onChange?: (event: React.SyntheticEvent) => void;
  /** If true, adds focus ripple effect */
  focusRipple?: boolean;
  /** If true, disables ripple effect */
  disableRipple?: boolean;
}

/**
 * AccordionDetailsAdapted component props
 */
export interface AccordionDetailsProps extends SxProps, React.RefAttributes<HTMLDivElement> {
  /** The content of the details section */
  children: React.ReactNode;
}

/**
 * AlertAdapted component props
 */
export interface AlertProps extends SxProps, AccessibilityProps, React.RefAttributes<HTMLDivElement> {
  /** The severity of the alert */
  severity?: 'error' | 'warning' | 'info' | 'success';
  /** The content of the alert */
  children: React.ReactNode;
  /** Title of the alert */
  title?: React.ReactNode;
  /** If true, compact version of the alert */
  dense?: boolean;
  /** If true, outlined variant instead of filled */
  outlined?: boolean;
  /** Action component, displayed on the right */
  action?: React.ReactNode;
  /** If true, includes an icon before the message */
  icon?: React.ReactNode | boolean;
  /** Callback fired when the alert is closed */
  onClose?: (event: React.SyntheticEvent) => void;
}

/**
 * ModalAdapted component props
 */
export interface ModalProps extends SxProps, AccessibilityProps, TransitionProps, React.RefAttributes<HTMLDivElement> {
  /** Modal content */
  children: React.ReactNode;
  /** Controls whether the modal is open */
  open: boolean;
  /** Callback fired when the modal requests to be closed */
  onClose: (event: React.SyntheticEvent, reason: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClick') => void;
  /** If true, the modal is centered vertically */
  centered?: boolean;
  /** If true, clicking the backdrop will not close the modal */
  disableBackdropClick?: boolean;
  /** If true, pressing escape will not close the modal */
  disableEscapeKeyDown?: boolean;
  /** If true, traps focus inside the modal */
  disableEnforceFocus?: boolean;
  /** If true, the modal will not prevent focus from leaving */
  disableAutoFocus?: boolean;
  /** If true, the modal will not restore focus to previously focused element once modal is hidden */
  disableRestoreFocus?: boolean;
  /** Callback fired when the backdrop is clicked */
  onBackdropClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** If true, renders a backdrop component behind the modal */
  hideBackdrop?: boolean;
  /** Maximum width of the modal */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string;
  /** Full width mode */
  fullWidth?: boolean;
  /** Full screen mode */
  fullScreen?: boolean;
}