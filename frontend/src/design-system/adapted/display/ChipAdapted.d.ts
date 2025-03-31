import React from 'react';
import { ChipProps } from '../../types/display';

/**
 * ChipAdapted component
 * 
 * An enhanced chip component for tags, attributes, and categories with
 * customizable appearance and interaction features. Provides consistent
 * styling and accessibility features across the application.
 *
 * Features:
 * - Multiple variants (filled, outlined)
 * - Various color options
 * - Click, delete, and hover interactions
 * - Support for icons and avatars
 * - Comprehensive accessibility attributes
 */
declare const ChipAdapted: React.ForwardRefExoticComponent<
  ChipProps & React.RefAttributes<HTMLDivElement>
>;

export default ChipAdapted;