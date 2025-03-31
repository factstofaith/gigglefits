import React from 'react';
import { CardContentProps } from '../../types/display';

/**
 * CardContentAdapted component
 * 
 * Card content component with standardized spacing and accessibility features.
 * Provides consistent padding options through disablePadding and dense properties.
 */
declare const CardContentAdapted: React.ForwardRefExoticComponent<
  CardContentProps & React.RefAttributes<HTMLDivElement>
>;

export default CardContentAdapted;