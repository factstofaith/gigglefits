import React from 'react';
import { ModalAdaptedProps } from '../../types/complex-components';

/**
 * ModalAdapted component
 * 
 * An accessible modal dialog component that adapts Material UI Dialog
 * with enhanced accessibility and performance features.
 * - Includes standardized header, content, and action sections
 * - Provides robust keyboard interaction including escape key support
 * - Features comprehensive ARIA attributes for accessibility
 * - Supports error boundary handling for resilient rendering
 */
declare const ModalAdapted: React.ForwardRefExoticComponent<
  ModalAdaptedProps & React.RefAttributes<HTMLDivElement>
>;

export default ModalAdapted;