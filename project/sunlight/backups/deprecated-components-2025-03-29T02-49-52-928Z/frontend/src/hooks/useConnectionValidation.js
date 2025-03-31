/**
 * useConnectionValidation.js
 * -----------------------------------------------------------------------------
 * Custom React hook for validating connections in the integration flow canvas.
 * Provides methods to validate node connections, flow integrity, and manage
 * validation errors.
 * 
 * @module hooks/useConnectionValidation
 */

import { useState, useCallback } from 'react';
import { validateConnection, validateFlow } from '@utils/connectionValidator';

/**
 * Custom hook for validating connections and the complete flow in the integration canvas
 * 
 * This hook provides functionality for:
 * - Validating connections between nodes as they are being created
 * - Validating the entire flow for correctness and completeness
 * - Tracking validation errors by severity and element
 * - Managing the validation state for the integration canvas
 * 
 * @function
 * @param {Object} [initialOptions={}] - Initial configuration options
 * @returns {Object} Connection validation methods and state
 * @property {Function} validateConnection - Validates a connection between two handles
 * @property {Function} validateFlow - Validates the entire flow
 * @property {Function} getElementErrors - Gets errors for a specific node or edge
 * @property {Function} getErrorsBySeverity - Gets errors filtered by severity
 * @property {Function} hasErrors - Checks if an element has errors
 * @property {Function} clearErrors - Clears all validation errors
 * @property {Function} addError - Adds a custom validation error
 * @property {Array} validationErrors - Current validation errors
 * @property {boolean} isValidating - Whether validation is in progress
 * @property {number} errorCount - Total number of validation errors
 * @property {Object} errorsByType - Count of errors by severity type
 * 
 * @example
 * // Basic usage in a flow editor component
 * function FlowEditor() {
  // Added display name
  FlowEditor.displayName = 'FlowEditor';

 *   const { nodes, edges, setNodes, setEdges } = useFlowState();
 *   const { 
 *     validateConnection, 
 *     validateFlow, 
 *     getElementErrors,
 *     hasErrors
 *   } = useConnectionValidation();
 *   
 *   // Called when a user attempts to connect two nodes
 *   const onConnect = useCallback((params) => {
  // Added display name
  onConnect.displayName = 'onConnect';

 *     const validation = validateConnection(params);
 *     
 *     if (validation.isValid) {
 *       // Add the connection
 *       setEdges(prevEdges => [...prevEdges, { ...params, id: `e${params.source}-${params.target}` }]);
 *     } else {
 *       // Show error message
 *       showToast(validation.message, 'error');
 *     }
 *   }, [validateConnection, setEdges, showToast]);
 *   
 *   // Validate the entire flow before saving or executing
 *   const handleExecuteFlow = useCallback(() => {
  // Added display name
  handleExecuteFlow.displayName = 'handleExecuteFlow';

 *     const errors = validateFlow(nodes, edges);
 *     
 *     if (errors.length === 0) {
 *       // Execute the flow
 *       executeFlow();
 *     } else {
 *       // Show validation errors
 *       showValidationErrors(errors);
 *     }
 *   }, [nodes, edges, validateFlow, executeFlow, showValidationErrors]);
 *   
 *   // Highlight nodes with errors in the UI
 *   const nodeTypes = useMemo(() => {
  // Added display name
  nodeTypes.displayName = 'nodeTypes';

 *     // Custom node components that can show error states
 *     return {
 *       source: (props) => (
 *         <SourceNode 
 *           {...props} 
 *           hasError={hasErrors(props.id)} 
 *           errors={getElementErrors(props.id)}
 *         />
 *       ),
 *       // ...other node types
 *     };
 *   }, [hasErrors, getElementErrors]);
 *   
 *   return (
 *     <div>
 *       <ReactFlow
 *         nodes={nodes}
 *         edges={edges}
 *         onConnect={onConnect}
 *         nodeTypes={nodeTypes}
 *       />
 *       <button onClick={handleExecuteFlow}>
 *         Execute Flow
 *       </button>
 *     </div>
 *   );
 * }
 */
const useConnectionValidation = (initialOptions = {}) => {
  // Added display name
  useConnectionValidation.displayName = 'useConnectionValidation';

  // Added display name
  useConnectionValidation.displayName = 'useConnectionValidation';

  // Added display name
  useConnectionValidation.displayName = 'useConnectionValidation';

  // Added display name
  useConnectionValidation.displayName = 'useConnectionValidation';

  // Added display name
  useConnectionValidation.displayName = 'useConnectionValidation';


  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  
  /**
   * Validates a connection between two handles
   * Used when the user is attempting to create a new connection
   * 
   * @function
   * @param {Object} params - Connection parameters
   * @param {string} params.source - Source node ID
   * @param {string} params.sourceHandle - Source handle ID
   * @param {string} params.target - Target node ID
   * @param {string} params.targetHandle - Target handle ID
   * @returns {Object} Validation result with isValid and message
   * @property {boolean} isValid - Whether the connection is valid
   * @property {string} message - Error message if connection is invalid
   */
  const validateConnectionHandler = useCallback((params) => {
  // Added display name
  validateConnectionHandler.displayName = 'validateConnectionHandler';

    return validateConnection(params);
  }, []);
  
  /**
   * Validates the entire flow
   * Used to validate the complete flow before saving or executing
   * 
   * @function
   * @param {Array} nodes - The flow nodes
   * @param {Array} edges - The flow edges
   * @returns {Array} Array of validation errors
   * @property {string} id - Error ID
   * @property {string} severity - Error severity ('error', 'warning', 'info')
   * @property {string} message - Error message
   * @property {string} [details] - Detailed error description
   * @property {string} [nodeId] - ID of node with error
   * @property {string} [edgeId] - ID of edge with error
   */
  const validateFlowHandler = useCallback((nodes, edges) => {
  // Added display name
  validateFlowHandler.displayName = 'validateFlowHandler';

    setIsValidating(true);
    
    try {
      const errors = validateFlow(nodes, edges);
      setValidationErrors(errors);
      return errors;
    } catch (error) {
      console.error('Error validating flow:', error);
      return [{
        id: 'validation-error',
        severity: 'error',
        message: 'Error validating flow',
        details: error.message
      }];
    } finally {
      setIsValidating(false);
    }
  }, []);
  
  /**
   * Checks if a specific node or edge has validation errors
   * Used to highlight invalid elements in the flow
   * 
   * @function
   * @param {string} id - The node or edge ID
   * @param {string} [type='node'] - 'node' or 'edge'
   * @returns {Array} Array of validation errors for the specific element
   */
  const getElementErrors = useCallback((id, type = 'node') => {
    if (!id) return [];
    
    return validationErrors.filter(error => {
      if (type === 'node') {
        return error.nodeId === id;
      } else if (type === 'edge') {
        return error.edgeId === id;
      }
      return false;
    });
  }, [validationErrors]);
  
  /**
   * Gets validation errors by severity
   * Used to filter and display errors by importance
   * 
   * @function
   * @param {string} severity - Error severity ('error', 'warning', 'info')
   * @returns {Array} Array of validation errors with the specified severity
   */
  const getErrorsBySeverity = useCallback((severity) => {
  // Added display name
  getErrorsBySeverity.displayName = 'getErrorsBySeverity';

    if (!severity) return validationErrors;
    
    return validationErrors.filter(error => error.severity === severity);
  }, [validationErrors]);
  
  /**
   * Checks if an element has errors of a specific severity
   * Used for conditional styling of elements with errors
   * 
   * @function
   * @param {string} id - The node or edge ID
   * @param {string} [type='node'] - 'node' or 'edge'
   * @param {string} [severity='error'] - Error severity ('error', 'warning', 'info')
   * @returns {boolean} True if the element has errors of the specified severity
   */
  const hasErrors = useCallback((id, type = 'node', severity = 'error') => {
    const errors = getElementErrors(id, type);
    
    if (!severity) {
      return errors.length > 0;
    }
    
    return errors.some(error => error.severity === severity);
  }, [getElementErrors]);
  
  /**
   * Clears all validation errors
   * Used when resetting the validation state
   * 
   * @function
   */
  const clearErrors = useCallback(() => {
  // Added display name
  clearErrors.displayName = 'clearErrors';

    setValidationErrors([]);
  }, []);
  
  /**
   * Adds a custom validation error
   * Used for manual validation or application-specific validations
   * 
   * @function
   * @param {Object} error - The error object to add
   * @param {string} [error.id] - Error ID (generated if not provided)
   * @param {string} [error.severity='error'] - Error severity ('error', 'warning', 'info')
   * @param {string} [error.message='Custom validation error'] - Error message
   * @param {string} [error.details] - Detailed error description
   * @param {string} [error.nodeId] - ID of node with error
   * @param {string} [error.edgeId] - ID of edge with error
   */
  const addError = useCallback((error) => {
  // Added display name
  addError.displayName = 'addError';

    setValidationErrors(prev => [...prev, {
      id: error.id || `custom-error-${Date.now()}`,
      severity: error.severity || 'error',
      message: error.message || 'Custom validation error',
      details: error.details || '',
      nodeId: error.nodeId,
      edgeId: error.edgeId
    }]);
  }, []);
  
  return {
    // Methods
    validateConnection: validateConnectionHandler,
    validateFlow: validateFlowHandler,
    getElementErrors,
    getErrorsBySeverity,
    hasErrors,
    clearErrors,
    addError,
    
    // State
    validationErrors,
    isValidating,
    errorCount: validationErrors.length,
    errorsByType: {
      error: getErrorsBySeverity('error').length,
      warning: getErrorsBySeverity('warning').length,
      info: getErrorsBySeverity('info').length
    }
  };
};

export default useConnectionValidation;