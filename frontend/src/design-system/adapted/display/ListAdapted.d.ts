import React from 'react';
import { ListAdaptedProps } from '../../types/complex-components';

/**
 * ListAdapted component
 * 
 * An enhanced list component with virtualization for large datasets.
 * - Efficiently renders large lists with virtualization
 * - Supports custom item renderers
 * - Includes selection states, icons, and primary/secondary text
 * - Provides accessibility features including keyboard navigation
 */
declare const ListAdapted: React.ForwardRefExoticComponent<
  ListAdaptedProps & React.RefAttributes<HTMLUListElement>
>;

export default ListAdapted;