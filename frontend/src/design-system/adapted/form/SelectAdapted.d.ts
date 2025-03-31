import React from 'react';
import { SelectProps } from '../../types/form';

/**
 * SelectAdapted component
 * 
 * An enhanced select component with accessibility features and virtualization for large option lists.
 * Includes support for custom rendering, virtualization for large datasets, and comprehensive accessibility.
 */
declare const SelectAdapted: React.ForwardRefExoticComponent<
  SelectProps & React.RefAttributes<HTMLSelectElement>
>;

export default SelectAdapted;