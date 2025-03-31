import React from 'react';
import { DataPreviewProps } from '../../types/display';

/**
 * DataPreviewAdapted component
 * 
 * An enhanced data preview component that provides tabular and JSON views
 * of datasets with virtualization for performance, comprehensive filtering,
 * and data validation features.
 * 
 * Features:
 * - Tabular and JSON view modes
 * - Virtualized rendering for large datasets
 * - Advanced filtering capabilities
 * - Data schema validation
 * - Expandable row details
 * - Export functionality
 * - Comprehensive error and warning reporting
 */
declare const DataPreviewAdapted: React.FC<DataPreviewProps>;

export default DataPreviewAdapted;