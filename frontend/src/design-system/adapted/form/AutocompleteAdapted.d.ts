import React from 'react';
import { AutocompleteProps } from '../../types/form';

/**
 * AutocompleteAdapted component
 * 
 * Enhanced autocomplete component with accessibility, virtualization for large datasets,
 * and standardized API. Supports option grouping, custom rendering, and keyboard navigation.
 * 
 * @template T The type of the options
 */
declare const AutocompleteAdapted: React.ForwardRefExoticComponent<
  AutocompleteProps<any> & React.RefAttributes<HTMLDivElement>
>;

export default AutocompleteAdapted;