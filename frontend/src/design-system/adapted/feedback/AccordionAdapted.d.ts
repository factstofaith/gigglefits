import React from 'react';
import { AccordionAdaptedProps } from '../../types/complex-components';

/**
 * AccordionAdapted component
 * 
 * An enhanced accordion component for collapsible content panels
 * with accessibility features and smooth transitions.
 * - Supports both controlled and uncontrolled modes
 * - Provides accessibility features including ARIA attributes
 * - Includes customizable transitions and styling options
 * - Works seamlessly with AccordionSummaryAdapted and AccordionDetailsAdapted
 */
declare const AccordionAdapted: React.ForwardRefExoticComponent<
  AccordionAdaptedProps & React.RefAttributes<HTMLDivElement>
>;

export default AccordionAdapted;