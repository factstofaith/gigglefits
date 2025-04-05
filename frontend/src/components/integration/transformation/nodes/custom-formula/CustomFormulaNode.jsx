/**
 * CustomFormula Transformation Node
 * 
 * Provides a comprehensive formula building capability for data transformation,
 * enabling users to create complex expressions with a visual builder interface.
 * 
 * This component leverages our zero technical debt approach by implementing
 * an ideal formula system without legacy parser or UI constraints.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

// Placeholder imports - these will be implemented according to the plan
// import { TransformationNodeTemplate } from '../../../accelerators/components/TransformationNodeTemplate';
// import { useDataTransformation } from '../../../accelerators/hooks/useDataTransformation';
import { parseFormula, validateFormula, evaluateFormula } from './formula-parser';
import { getAllFunctions, getFunctionsByCategory, searchFunctions, FunctionCategories } from './function-registry';
import FormulaEditor from './FormulaEditor';
import FunctionCatalog from './FunctionCatalog';
import './custom-formula-node.css';

/**
 * CustomFormula node for creating and executing custom formulas
 * 
 * @param {Object} props - Component props
 * @param {Object} props.nodeData - Node configuration data
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.isReadOnly - Whether the node is in read-only mode
 * @param {Object} props.sampleData - Sample data for formula testing
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const CustomFormulaNode = ({
  nodeData,
  onChange,
  isReadOnly,
  sampleData
}) => {
  // State for formula text
  const [formulaText, setFormulaText] = useState(nodeData?.config?.formula || '');

  // State for formula validation
  const [validationResult, setValidationResult] = useState({
    isValid: true,
    errors: []
  });

  // State for selected function category
  const [selectedCategory, setSelectedCategory] = useState(null);

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');

  // State for available functions
  const [functionSuggestions, setFunctionSuggestions] = useState([]);

  // Parse and validate formula whenever it changes
  const parseAndValidate = useCallback(formula => {
    if (!formula || formula.trim() === '') {
      setValidationResult({
        isValid: true,
        errors: []
      });
      return {
        ast: null,
        validation: {
          isValid: true,
          errors: []
        }
      };
    }
    try {
      const ast = parseFormula(formula);
      // Pass the available functions for validation
      const functions = getAllFunctions();
      const context = {
        data: sampleData,
        functions: Object.keys(functions).reduce((acc, key) => {
          acc[key] = functions[key].implementation;
          return acc;
        }, {})
      };
      const validation = validateFormula(ast, context);
      setValidationResult(validation);
      return {
        ast,
        validation
      };
    } catch (error) {
      const validationError = {
        isValid: false,
        errors: [{
          message: error.message || 'Unknown error',
          position: error.position !== undefined ? error.position : undefined
        }]
      };
      setValidationResult(validationError);
      return {
        ast: null,
        validation: validationError
      };
    }
  }, [sampleData]);

  // Handle formula change
  const handleFormulaChange = useCallback(newFormula => {
    setFormulaText(newFormula);
    const {
      ast,
      validation
    } = parseAndValidate(newFormula);

    // Even if validation fails, we still want to update the formula
    // This allows for partial editing without losing state
    onChange({
      ...nodeData,
      config: {
        ...nodeData.config,
        formula: newFormula,
        ...(validation.isValid ? {
          formulaAst: ast
        } : {})
      }
    });
  }, [nodeData, onChange, parseAndValidate]);

  // Get filtered functions based on search or category
  const filteredFunctions = useMemo(() => {
    if (searchTerm) {
      return searchFunctions(searchTerm);
    }
    if (selectedCategory) {
      return getFunctionsByCategory(selectedCategory);
    }
    return Object.values(getAllFunctions());
  }, [searchTerm, selectedCategory]);

  // Update function suggestions when filtered functions change
  useEffect(() => {
    setFunctionSuggestions(filteredFunctions);
  }, [filteredFunctions]);

  // Handle function insertion
  const handleInsertFunction = useCallback(func => {
    // Build function call with proper number of arguments
    const argCount = func.params ? func.params.length : 0;
    let args = [];

    // Create placeholder arguments based on parameter count and types
    if (func.params) {
      args = func.params.map(param => {
        // Skip var args parameters (they're optional)
        if (param.isVarArgs) return '';
        // Return empty string for optional parameters
        if (param.isOptional) return '';

        // Create appropriate placeholder based on type
        if (Array.isArray(param.type)) {
          return param.type[0] === 'string' ? '""' : '0';
        }
        switch (param.type) {
          case 'string':
            return '""';
          case 'number':
            return '0';
          case 'boolean':
            return 'false';
          case 'date':
            return 'now()';
          case 'array':
            return '[]';
          case 'object':
            return '{}';
          default:
            return '';
        }
      }).filter(arg => arg !== ''); // Filter out empty args (for var args)
    }
    const argsStr = args.join(', ');
    const insertion = `${func.name}(${argsStr})`;

    // Insert the function at cursor or append to end
    const newFormula = formulaText + insertion;
    handleFormulaChange(newFormula);
  }, [formulaText, handleFormulaChange]);

  // Handle category selection
  const handleCategorySelect = useCallback(category => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setSearchTerm('');
  }, [selectedCategory]);

  // Handle search
  const handleSearch = useCallback(term => {
    setSearchTerm(term);
    setSelectedCategory(null);
  }, []);

  // Evaluate formula with sample data for preview
  const evaluationResult = useMemo(() => {
    if (!validationResult.isValid || !formulaText.trim()) {
      return {
        result: null,
        errors: []
      };
    }
    try {
      const ast = parseFormula(formulaText);

      // Create context with sample data and functions
      const functions = getAllFunctions();
      const context = {
        data: sampleData,
        functions: Object.keys(functions).reduce((acc, key) => {
          acc[key] = functions[key].implementation;
          return acc;
        }, {})
      };
      return evaluateFormula(ast, context);
    } catch (error) {
      return {
        result: null,
        errors: [{
          message: error.message || 'Unknown error',
          position: error.position !== undefined ? error.position : undefined
        }]
      };
    }
  }, [formulaText, validationResult.isValid, sampleData]);

  // Get available data fields from sample data
  const availableFields = useMemo(() => {
    const fields = [];
    if (sampleData && typeof sampleData === 'object') {
      Object.keys(sampleData).forEach(key => {
        fields.push({
          name: key,
          type: typeof sampleData[key],
          example: JSON.stringify(sampleData[key]).substring(0, 30)
        });
      });
    }
    return fields;
  }, [sampleData]);

  // This is an enhanced implementation
  // The full component will continue to be developed according to the implementation plan
  return <div className="custom-formula-node">
      <h3>Custom Formula</h3>
      
      <div className="formula-container">
        <div className="formula-sidebar">
          <div className="function-catalog-container">
            <h4>Functions</h4>
            <FunctionCatalog functions={filteredFunctions} onSelectFunction={handleInsertFunction} searchTerm={searchTerm} onSearch={handleSearch} selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />

          </div>
          
          <div className="available-fields">
            <h4>Available Fields</h4>
            <div className="fields-list">
              {availableFields.map(field => <div key={field.name} className="field-item" onClick={() => handleFormulaChange(`${formulaText}data.${field.name}`)}>
                  <span className="field-name">{field.name}</span>
                  <span className="field-type">{field.type}</span>
                  {field.example && <span className="field-example">{field.example}</span>}
                </div>)}

              {availableFields.length === 0 && <div className="no-fields">No sample data available</div>}

            </div>
          </div>
        </div>
        
        <div className="formula-main">
          <div className="formula-editor-section">
            <h4>Formula</h4>
            <FormulaEditor value={formulaText} onChange={handleFormulaChange} readOnly={isReadOnly} validation={validationResult} suggestions={functionSuggestions} />

          </div>
          
          <div className="formula-preview-section">
            <h4>Result Preview</h4>
            <div className="preview-content">
              {evaluationResult.errors.length > 0 ? <div className="preview-error">
                  <div className="error-title">Error:</div>
                  {evaluationResult.errors.map((error, index) => <div key={index} className="error-message">
                      {error.message}
                      {error.position !== undefined && <span className="error-position"> at position {error.position}</span>}

                    </div>)}

                </div> : <div className="preview-result">
                  {evaluationResult.result !== null ? typeof evaluationResult.result === 'object' ? <pre>{JSON.stringify(evaluationResult.result, null, 2)}</pre> : <span className="result-value">{String(evaluationResult.result)}</span> : <span className="no-result">No result</span>}

                </div>}

            </div>
          </div>
          
          <div className="formula-configuration-section">
            <h4>Configuration</h4>
            <div className="config-form">
              <div className="config-field">
                <label htmlFor="inputField">Input Field</label>
                <input id="inputField" type="text" value={nodeData?.config?.inputFieldPath || ''} onChange={e => onChange({
                ...nodeData,
                config: {
                  ...nodeData.config,
                  inputFieldPath: e.target.value
                }
              })} disabled={isReadOnly} placeholder="Enter input field path" />

              </div>
              
              <div className="config-field">
                <label htmlFor="outputField">Output Field</label>
                <input id="outputField" type="text" value={nodeData?.config?.outputFieldPath || ''} onChange={e => onChange({
                ...nodeData,
                config: {
                  ...nodeData.config,
                  outputFieldPath: e.target.value
                }
              })} disabled={isReadOnly} placeholder="Enter output field path" />

              </div>
              
              <div className="config-field">
                <label htmlFor="errorHandling">Error Handling</label>
                <select id="errorHandling" value={nodeData?.config?.errorHandling || 'NULL'} onChange={e => onChange({
                ...nodeData,
                config: {
                  ...nodeData.config,
                  errorHandling: e.target.value
                }
              })} disabled={isReadOnly}>

                  <option value="FAIL">Fail Execution</option>
                  <option value="NULL">Return NULL</option>
                  <option value="DEFAULT">Use Default Value</option>
                </select>
              </div>
              
              {nodeData?.config?.errorHandling === 'DEFAULT' && <div className="config-field">
                  <label htmlFor="defaultValue">Default Value</label>
                  <input id="defaultValue" type="text" value={nodeData?.config?.defaultValue || ''} onChange={e => onChange({
                ...nodeData,
                config: {
                  ...nodeData.config,
                  defaultValue: e.target.value
                }
              })} disabled={isReadOnly} placeholder="Enter default value" />

                </div>}

            </div>
          </div>
        </div>
      </div>
    </div>;
};
CustomFormulaNode.propTypes = {
  nodeData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    config: PropTypes.shape({
      formula: PropTypes.string,
      formulaAst: PropTypes.object,
      inputFieldPath: PropTypes.string,
      outputFieldPath: PropTypes.string,
      errorHandling: PropTypes.string,
      defaultValue: PropTypes.string
    })
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
  sampleData: PropTypes.object
};
CustomFormulaNode.defaultProps = {
  isReadOnly: false,
  sampleData: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    age: 30,
    isActive: true,
    tags: ["customer", "vip"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345"
    }
  }
};
CustomFormulaNode.propTypes = {
  nodeData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    config: PropTypes.shape({
      formula: PropTypes.string,
      formulaAst: PropTypes.object,
      inputFieldPath: PropTypes.string,
      outputFieldPath: PropTypes.string,
      errorHandling: PropTypes.string,
      defaultValue: PropTypes.string
    })
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
  sampleData: PropTypes.object
};
CustomFormulaNode.defaultProps = {
  isReadOnly: false,
  sampleData: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    age: 30,
    isActive: true,
    tags: ["customer", "vip"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345"
    }
  }
};
export default CustomFormulaNode;