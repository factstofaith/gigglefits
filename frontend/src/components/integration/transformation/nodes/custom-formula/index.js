/**
 * CustomFormula Module Index
 * 
 * Exports the CustomFormula transformation node and related utilities.
 */

export { default as CustomFormulaNode } from './CustomFormulaNode';
export { default as FormulaEditor } from './FormulaEditor';
export { default as FunctionCatalog } from './FunctionCatalog';
export { parseFormula, validateFormula, evaluateFormula } from './formula-parser';
export { 
  registerFunction, 
  getFunction, 
  getFunctionsByCategory,
  getAllFunctions,
  searchFunctions,
  FunctionCategories,
  DataTypes
} from './function-registry';

// Export a node definition for the node registry
export const customFormulaNodeDefinition = {
  type: 'CUSTOM_FORMULA',
  label: 'Custom Formula',
  description: 'Create custom formulas using a comprehensive expression language',
  category: 'TRANSFORMATION',
  inputs: 1,
  outputs: 1,
  icon: 'function', // This would be a material-ui icon name
  color: '#3F51B5',
  configProperties: [
    {
      name: 'formula',
      label: 'Formula',
      type: 'formula',
      required: true,
      description: 'The formula to evaluate'
    },
    {
      name: 'inputFieldPath',
      label: 'Input Field',
      type: 'fieldPath',
      required: true,
      description: 'The field to apply the formula to'
    },
    {
      name: 'outputFieldPath',
      label: 'Output Field',
      type: 'fieldPath',
      required: true,
      description: 'The field to store the result in'
    },
    {
      name: 'errorHandling',
      label: 'Error Handling',
      type: 'select',
      options: [
        { value: 'FAIL', label: 'Fail Execution' },
        { value: 'NULL', label: 'Return NULL' },
        { value: 'DEFAULT', label: 'Use Default Value' }
      ],
      defaultValue: 'NULL',
      description: 'How to handle formula evaluation errors'
    },
    {
      name: 'defaultValue',
      label: 'Default Value',
      type: 'string',
      visibleWhen: 'errorHandling === "DEFAULT"',
      description: 'Default value to use when formula evaluation fails'
    }
  ],
  component: 'CustomFormulaNode',
  validateConfiguration: (config) => {
    const errors = [];
    
    if (!config.formula || config.formula.trim() === '') {
      errors.push({ field: 'formula', message: 'Formula is required' });
    }
    
    if (!config.inputFieldPath) {
      errors.push({ field: 'inputFieldPath', message: 'Input field is required' });
    }
    
    if (!config.outputFieldPath) {
      errors.push({ field: 'outputFieldPath', message: 'Output field is required' });
    }
    
    if (config.errorHandling === 'DEFAULT' && !config.defaultValue) {
      errors.push({ field: 'defaultValue', message: 'Default value is required when error handling is set to "Use Default Value"' });
    }
    
    return errors;
  }
};
