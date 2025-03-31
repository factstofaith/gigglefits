import React from 'react';
import { TabsAdaptedProps, TabAdaptedProps } from '../../types/complex-components';

/**
 * TabPanel component props
 */
export interface TabPanelProps {
  /** The content of the tab panel */
  children?: React.ReactNode;
  /** The value of the currently selected tab */
  value: number | string;
  /** The index of this panel */
  index: number | string;
  /** Class name applied to the panel */
  className?: string;
  /** Inline style for the panel */
  style?: React.CSSProperties;
}

/**
 * TabsAdapted component
 * 
 * Accessible tabs component with keyboard navigation and optimized rendering for tab panels.
 * - Provides robust keyboard navigation including arrow keys and home/end
 * - Supports both horizontal and vertical orientations
 * - Offers lazy-loading of tab content
 * - Includes comprehensive ARIA attributes for accessibility
 */
declare const TabsAdapted: React.ForwardRefExoticComponent<
  TabsAdaptedProps & React.RefAttributes<HTMLDivElement>
> & {
  Tab: React.FC<TabAdaptedProps>;
  Panel: React.FC<TabPanelProps>;
};

export default TabsAdapted;