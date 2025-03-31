import React from 'react';
import { RadioGroupProps } from '../../types/form';

/**
 * RadioGroupAdapted component
 * 
 * An enhanced radio group component with accessibility features,
 * supporting row/column layouts, error states, and option grouping.
 */
declare const RadioGroupAdapted: React.ForwardRefExoticComponent<
  RadioGroupProps & React.RefAttributes<HTMLDivElement>
>;

export default RadioGroupAdapted;