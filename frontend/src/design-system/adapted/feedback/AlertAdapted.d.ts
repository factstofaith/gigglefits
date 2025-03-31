import React from 'react';

export interface AlertAdaptedProps {
  /** The severity of the alert. This defines the color and icon used. */
  severity?: 'success' | 'info' | 'warning' | 'error';
  
  /** The variant to use. */
  variant?: 'standard' | 'filled' | 'outlined';
  
  /** The content of the component. */
  children?: React.ReactNode;
  
  /** The title of the alert. */
  title?: React.ReactNode;
  
  /** The action displayed after the message. */
  action?: React.ReactNode;
  
  /** Override the default icon. */
  icon?: React.ReactNode;
  
  /** Callback fired when the component requests to be closed. */
  onClose?: () => void;
  
  /** Shadow depth, corresponds to dp in the spec. */
  elevation?: number;
  
  /** If true, the alert will be filled with a solid background. */
  filled?: boolean;
  
  /** If true, the alert will have an outlined appearance. */
  outlined?: boolean;
  
  /** If true, rounded corners are disabled. */
  square?: boolean;
  
  /** Accessibility label for screen readers. */
  ariaLabel?: string;
  
  /** ARIA role for the alert. */
  role?: string;
  
  /** CSS class to apply to the component. */
  className?: string;
  
  /** Inline styles to apply to the component. */
  style?: React.CSSProperties;
}

declare const AlertAdapted: React.ForwardRefExoticComponent<
  AlertAdaptedProps & React.RefAttributes<HTMLDivElement>
>;

export default AlertAdapted;