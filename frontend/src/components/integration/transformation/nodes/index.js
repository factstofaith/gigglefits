// transformation/nodes/index.js
// -----------------------------------------------------------------------------
// Export all transformation node components for easy importing

import DataTypeConversion from './DataTypeConversion';
import TextFormatting from './TextFormatting';
import NumericOperation from './NumericOperation';

// Map of transformation node types to components
const transformationNodeTypes = {
  dataTypeConversion: DataTypeConversion,
  textFormatting: TextFormatting,
  numericOperation: NumericOperation,
};

export {
  DataTypeConversion,
  TextFormatting,
  NumericOperation,
  transformationNodeTypes,
};