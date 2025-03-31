/**
 * @module useFlowValidation
 * @description Custom hook for validating integration flows
 */

import { useCallback, useState, useMemo } from 'react';
import { createFlowValidator } from '@utils/flowValidation';

/**
 * Hook for validating integration flows
 * @returns {Object} Flow validation utilities
 */
export const useFlowValidation = () => {
  // Added display name
  useFlowValidation.displayName = 'useFlowValidation';

  // Added display name
  useFlowValidation.displayName = 'useFlowValidation';

  // Added display name
  useFlowValidation.displayName = 'useFlowValidation';

  // Added display name
  useFlowValidation.displayName = 'useFlowValidation';

  // Added display name
  useFlowValidation.displayName = 'useFlowValidation';


  // Initialize the flow validator
  const flowValidator = useMemo(() => createFlowValidator(), []);
  
  // State to store validation results
  const [validationResults, setValidationResults] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    info: [],
    validationState: {
      hasTrigger: false,
      hasDestination: false,
      nodesWithMissingRequiredFields: [],
      disconnectedNodes: new Set(),
      unreachableNodes: new Set(),
      duplicateNodeIds: new Set(),
    }
  });

  /**
   * Validate a flow
   * @param {Array} nodes - Flow nodes
   * @param {Array} edges - Flow edges
   * @returns {Object} Validation results
   */
  const validateFlow = useCallback((nodes, edges) => {
  // Added display name
  validateFlow.displayName = 'validateFlow';

    if (!nodes || !edges) {
      return {
        isValid: false,
        errors: [{ id: 'missing-data', message: 'Missing flow data' }],
        warnings: [],
        info: [],
        validationState: {
          hasTrigger: false,
          hasDestination: false,
          nodesWithMissingRequiredFields: [],
          disconnectedNodes: new Set(),
          unreachableNodes: new Set(),
          duplicateNodeIds: new Set(),
        }
      };
    }

    // Perform validation
    const results = flowValidator.validateFlow(nodes, edges);
    
    // Update state and return results
    setValidationResults(results);
    return results;
  }, [flowValidator]);

  /**
   * Validate a single node
   * @param {Object} node - The node to validate
   * @returns {Object} Node validation results
   */
  const validateNode = useCallback((node) => {
  // Added display name
  validateNode.displayName = 'validateNode';

    if (!node) {
      return {
        errors: [{ id: 'missing-node', message: 'Node is missing' }],
        warnings: [],
        info: [],
        hasMissingRequiredFields: true
      };
    }

    return flowValidator.validateNodeByType(node);
  }, [flowValidator]);

  /**
   * Validate edges
   * @param {Array} edges - Flow edges
   * @param {Array} nodes - Flow nodes
   * @returns {Object} Edge validation results
   */
  const validateEdges = useCallback((edges, nodes) => {
  // Added display name
  validateEdges.displayName = 'validateEdges';

    if (!edges || !nodes) {
      return {
        errors: [{ id: 'missing-data', message: 'Missing edges or nodes data' }],
        warnings: [],
        info: []
      };
    }

    return flowValidator.validateEdges(edges, nodes);
  }, [flowValidator]);

  return {
    validateFlow,
    validateNode,
    validateEdges,
    validationResults
  };
};

export default useFlowValidation;