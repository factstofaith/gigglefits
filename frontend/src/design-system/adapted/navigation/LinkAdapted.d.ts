import React from 'react';
import { LinkProps } from '../../types/navigation';

/**
 * LinkAdapted component
 * 
 * An accessible link component that enhances standard anchor elements with
 * consistent styling, analytics tracking, and accessibility features.
 * 
 * Features:
 * - Consistent styling based on design system
 * - Automatic tracking for analytics
 * - Enhanced accessibility attributes
 * - Security features for external links
 * - Customizable underline behavior
 */
declare const LinkAdapted: React.ForwardRefExoticComponent<
  LinkProps & React.RefAttributes<HTMLAnchorElement>
>;

export default LinkAdapted;