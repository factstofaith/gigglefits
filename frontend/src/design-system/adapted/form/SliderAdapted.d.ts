import React from 'react';
import { SliderProps } from '../../types/form';

/**
 * SliderAdapted component
 * 
 * An enhanced slider component for selecting values from a range,
 * with marks, labels, customizable appearance, and comprehensive accessibility features.
 * Supports both single value and range selection modes.
 */
declare const SliderAdapted: React.ForwardRefExoticComponent<
  SliderProps & React.RefAttributes<HTMLDivElement>
>;

export default SliderAdapted;