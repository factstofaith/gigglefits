import React from 'react';
import { PaginationProps } from '../../types/navigation';

/**
 * PaginationAdapted component
 * 
 * An adapter wrapper for the Material UI Pagination component that provides
 * consistent pagination with enhanced accessibility features.
 * 
 * Features:
 * - Accessibility support with ARIA attributes
 * - Configurable page boundaries and navigation buttons
 * - Multiple styling variants and size options
 * - Consistent event handling across the design system
 */
declare const PaginationAdapted: React.ForwardRefExoticComponent<
  PaginationProps & React.RefAttributes<HTMLDivElement>
>;

export default PaginationAdapted;