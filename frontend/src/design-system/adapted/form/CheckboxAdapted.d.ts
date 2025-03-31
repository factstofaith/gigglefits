import React from 'react';
import { CheckboxProps } from '../../types/form';

/**
 * CheckboxAdapted component
 * 
 * Enhanced checkbox component with accessibility features, consistent styling,
 * and support for checked, indeterminate, and disabled states.
 */
declare const CheckboxAdapted: React.ForwardRefExoticComponent<
  CheckboxProps & React.RefAttributes<HTMLInputElement>
>;

export default CheckboxAdapted;