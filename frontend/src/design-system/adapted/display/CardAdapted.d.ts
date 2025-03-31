import React from 'react';
import { CardProps } from '../../types/display';

/**
 * CardAdapted component
 * 
 * An enhanced Card component with improved accessibility,
 * performance optimizations, and consistent API.
 * Provides proper ARIA attributes for interactive cards.
 */
declare const CardAdapted: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>;

export default CardAdapted;