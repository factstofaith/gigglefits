/**
 * Type definitions for core components
 */

import React from 'react';
import {
  AccessibilityProps,
  ColorVariant,
  ComponentStateProps,
  SxProps
} from './common';

/**
 * ButtonAdapted component props
 */
export interface ButtonProps extends SxProps, AccessibilityProps, ComponentStateProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'contained' | 'outlined' | 'text';
  /** Button color */
  color?: ColorVariant;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** The content of the button */
  children: React.ReactNode;
  /** If true, button will take the full width of its container */
  fullWidth?: boolean;
  /** Element to render for the button's start icon */
  startIcon?: React.ReactNode;
  /** Element to render for the button's end icon */
  endIcon?: React.ReactNode;
  /** If true, circular button */
  circular?: boolean;
  /** If true, removes button effect */
  disableRipple?: boolean;
  /** If true, removes elevation */
  disableElevation?: boolean;
  /** If true, no uppercase transform */
  disableTransform?: boolean;
  /** Button href attribute, turns it into an anchor when provided */
  href?: string;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Accessibility - aria-pressed attribute */
  ariaPressed?: boolean;
  /** Accessibility - aria-expanded attribute */
  ariaExpanded?: boolean;
  /** Accessibility - aria-controls attribute */
  ariaControls?: string;
  /** Accessibility - aria-describedby attribute */
  ariaDescribedBy?: string;
}

/**
 * ErrorBoundary component props
 */
export interface ErrorBoundaryProps {
  /** The components to render */
  children: React.ReactNode;
  /** Custom fallback UI to display when an error occurs */
  fallback?: React.ReactNode | ((error: Error, errorInfo: React.ErrorInfo) => React.ReactNode);
  /** Callback function that's called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Key that will reset the error boundary state when changed */
  resetKey?: any;
}

/**
 * ErrorBoundary component state
 */
export interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error object */
  error: Error | null;
  /** Information about the component stack when the error occurred */
  errorInfo: React.ErrorInfo | null;
}

/**
 * TypographyAdapted component props
 */
export interface TypographyProps extends SxProps, React.HTMLAttributes<HTMLElement> {
  /** Typography variant */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
  /** Component to render as */
  component?: React.ElementType;
  /** The content of the typography */
  children?: React.ReactNode;
  /** If true, the text will have a bottom margin */
  gutterBottom?: boolean;
  /** If true, the text will not wrap, but instead will truncate with a text overflow ellipsis */
  noWrap?: boolean;
  /** If true, the text will have a margin top applied to align with a 32px height input */
  paragraph?: boolean;
  /** Text alignment */
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  /** Text color */
  color?: 'initial' | 'inherit' | 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error';
  /** Font weight */
  fontWeight?: 'light' | 'regular' | 'medium' | 'bold';
}