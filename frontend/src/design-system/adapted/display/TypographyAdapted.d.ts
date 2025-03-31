import React from 'react';
import { TypographyProps } from '../../types/core';

/**
 * TypographyAdapted component
 * 
 * Enhanced Typography component with consistent styling,
 * accessibility features, and performance optimizations.
 */
declare const TypographyAdapted: React.ForwardRefExoticComponent<
  TypographyProps & React.RefAttributes<HTMLElement>
>;

export default TypographyAdapted;