import React from 'react';
import { DatePickerProps } from '../../types/form';

/**
 * DatePickerAdapted component
 * 
 * An adapter wrapper for the Material UI DatePicker component that provides
 * enhanced date selection, validation, and formatting capabilities with
 * comprehensive accessibility support.
 */
declare const DatePickerAdapted: React.ForwardRefExoticComponent<
  DatePickerProps & React.RefAttributes<HTMLDivElement>
>;

export default DatePickerAdapted;