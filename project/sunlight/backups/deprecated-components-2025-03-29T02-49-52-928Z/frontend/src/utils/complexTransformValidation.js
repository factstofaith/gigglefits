/**
 * @module complexTransformValidation
 * @description Enhanced validation for complex transformation nodes with multiple inputs and outputs,
 * verifying proper field mappings, connection compatibility, and transformation configurations.
 */

/**
 * Validates a transform node with multiple inputs or outputs
 * @param {Object} node - The transform node to validate
 * @param {Array} edges - All edges in the flow
 * @param {Array} nodes - All nodes in the flow
 * @returns {Object} Validation results including errors and warnings
 */
export const validateComplexTransformNode = (node, edges, nodes) => {
  // Added display name
  validateComplexTransformNode.displayName = 'validateComplexTransformNode';

  // Added display name
  validateComplexTransformNode.displayName = 'validateComplexTransformNode';

  // Added display name
  validateComplexTransformNode.displayName = 'validateComplexTransformNode';

  // Added display name
  validateComplexTransformNode.displayName = 'validateComplexTransformNode';

  // Added display name
  validateComplexTransformNode.displayName = 'validateComplexTransformNode';


  const errors = [];
  const warnings = [];
  const info = [];
  
  if (!node || !node.data) return { errors, warnings, info };
  
  const nodeData = node.data;
  const nodeId = node.id;
  const nodeType = node.type;
  const transformType = nodeData.transformType;
  
  // Skip validation if transform type is not specified
  if (!transformType) return { errors, warnings, info };
  
  // Get incoming and outgoing connections
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  const outgoingEdges = edges.filter(edge => edge.source === nodeId);
  const incomingNodes = incomingEdges.map(edge => 
    nodes.find(n => n.id === edge.source)
  ).filter(Boolean);
  const outgoingNodes = outgoingEdges.map(edge => 
    nodes.find(n => n.id === edge.target)
  ).filter(Boolean);
  
  // Validate based on transform type
  switch (transformType) {
    case 'join':
      validateJoinTransform(nodeData, nodeId, nodeType, incomingEdges, incomingNodes, errors, warnings);
      break;
    case 'split':
      validateSplitTransform(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings);
      break;
    case 'map':
      validateMapTransform(nodeData, nodeId, nodeType, errors, warnings);
      break;
    case 'aggregate':
      validateAggregateTransform(nodeData, nodeId, nodeType, errors, warnings);
      break;
    case 'fork':
      validateForkTransform(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings);
      break;
    case 'merge':
      validateMergeTransform(nodeData, nodeId, nodeType, incomingEdges, incomingNodes, errors, warnings);
      break;
  }
  
  // Validate field mappings
  if (nodeData.fieldMappings && nodeData.fieldMappings.length > 0) {
    validateFieldMappings(nodeData.fieldMappings, nodeId, nodeType, errors, warnings);
  }
  
  return { errors, warnings, info };
};

/**
 * Validates join transformation
 * @private
 */
function validateJoinTransform(nodeData, nodeId, nodeType, incomingEdges, incomingNodes, errors, warnings) {
  // Added display name
  validateJoinTransform.displayName = 'validateJoinTransform';

  // Check for minimum number of inputs
  if (incomingEdges.length < 2) {
    errors.push({
      id: `transform-join-insufficient-inputs-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Join transformation requires at least 2 input connections',
      details: 'A join transformation combines data from multiple sources and requires at least 2 inputs.',
      recommendation: 'Connect at least one more source to this join transformation.',
    });
  }
  
  // Check for join field mappings
  if (!nodeData.fieldMappings || nodeData.fieldMappings.length === 0) {
    errors.push({
      id: `transform-join-missing-mappings-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Join transformation is missing field mappings',
      details: 'A join transformation requires field mappings to define how data is combined.',
      recommendation: 'Configure field mappings for this join transformation.',
    });
  }
  
  // Check for join keys
  if (!nodeData.joinKeys || Object.keys(nodeData.joinKeys).length === 0) {
    warnings.push({
      id: `transform-join-missing-keys-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Join transformation is missing join keys',
      details: 'A join transformation should specify which fields to join on for better performance.',
      recommendation: 'Specify join keys for this transformation.',
    });
  } else {
    // Validate that join keys reference existing fields
    for (const [source, joinField] of Object.entries(nodeData.joinKeys)) {
      const sourceNode = incomingNodes.find(node => node.id === source);
      if (!sourceNode) {
        warnings.push({
          id: `transform-join-invalid-source-${nodeId}-${source}`,
          nodeId,
          nodeType,
          severity: 'warning',
          message: `Join key references unknown source: ${source}`,
          details: 'The join key references a source that is not connected to this node.',
          recommendation: 'Update join keys to reference connected sources only.',
        });
      }
    }
  }
  
  // Check for join type
  if (!nodeData.joinType) {
    warnings.push({
      id: `transform-join-missing-type-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Join transformation is missing join type',
      details: 'A join transformation should specify the type of join (inner, left, right, full).',
      recommendation: 'Specify a join type for this transformation.',
    });
  }
}

/**
 * Validates split transformation
 * @private
 */
function validateSplitTransform(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings) {
  // Added display name
  validateSplitTransform.displayName = 'validateSplitTransform';

  // Check for output connections
  if (outgoingEdges.length < 2) {
    warnings.push({
      id: `transform-split-insufficient-outputs-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Split transformation has less than 2 output connections',
      details: 'A split transformation is designed to route data to multiple destinations but currently has less than 2 outputs.',
      recommendation: 'Connect additional destinations to this split transformation.',
    });
  }
  
  // Check for split conditions
  if (!nodeData.splitConditions || nodeData.splitConditions.length === 0) {
    errors.push({
      id: `transform-split-missing-conditions-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Split transformation is missing conditions',
      details: 'A split transformation requires conditions to determine how to route data.',
      recommendation: 'Configure split conditions for this transformation.',
    });
  } else {
    // Check that all outputs have conditions
    const outputsWithConditions = new Set(nodeData.splitConditions.map(c => c.targetId));
    outgoingEdges.forEach(edge => {
      if (!outputsWithConditions.has(edge.target)) {
        warnings.push({
          id: `transform-split-missing-condition-${nodeId}-${edge.target}`,
          nodeId,
          nodeType,
          severity: 'warning',
          message: `Output to ${edge.target} is missing a condition`,
          details: 'Each output of a split transformation should have a condition to determine when data flows through it.',
          recommendation: 'Add a condition for this output or set it as the default output.',
        });
      }
    });
  }
  
  // Check for field mappings
  if (!nodeData.fieldMappings || nodeData.fieldMappings.length === 0) {
    errors.push({
      id: `transform-split-missing-mappings-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Split transformation is missing field mappings',
      details: 'A split transformation requires field mappings for each output.',
      recommendation: 'Configure field mappings for each output of this split transformation.',
    });
  }
}

/**
 * Validates map transformation
 * @private
 */
function validateMapTransform(nodeData, nodeId, nodeType, errors, warnings) {
  // Added display name
  validateMapTransform.displayName = 'validateMapTransform';

  if (!nodeData.fieldMappings || nodeData.fieldMappings.length === 0) {
    errors.push({
      id: `transform-map-missing-mappings-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Map transformation is missing field mappings',
      details: 'A map transformation requires field mappings to transform the data.',
      recommendation: 'Configure field mappings for this transformation.',
    });
  }
}

/**
 * Validates aggregate transformation
 * @private
 */
function validateAggregateTransform(nodeData, nodeId, nodeType, errors, warnings) {
  // Added display name
  validateAggregateTransform.displayName = 'validateAggregateTransform';

  // Check for aggregation functions
  if (!nodeData.aggregations || nodeData.aggregations.length === 0) {
    errors.push({
      id: `transform-aggregate-missing-functions-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Aggregate transformation is missing aggregation functions',
      details: 'An aggregate transformation requires at least one aggregation function (sum, count, average, etc.).',
      recommendation: 'Configure aggregation functions for this transformation.',
    });
  } else {
    // Check that each aggregation has a source field and output field
    nodeData.aggregations.forEach((agg, index) => {
      if (!agg.function) {
        errors.push({
          id: `transform-aggregate-missing-function-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'error',
          message: `Aggregation #${index + 1} is missing function type`,
          details: 'Each aggregation must specify a function type (sum, count, average, etc.).',
          recommendation: 'Select a function type for this aggregation.',
        });
      }
      
      if (!agg.sourceField && agg.function !== 'count') {
        errors.push({
          id: `transform-aggregate-missing-source-field-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'error',
          message: `Aggregation #${index + 1} is missing source field`,
          details: 'Each aggregation (except count) must specify a source field to aggregate.',
          recommendation: 'Select a source field for this aggregation.',
        });
      }
      
      if (!agg.outputField) {
        errors.push({
          id: `transform-aggregate-missing-output-field-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'error',
          message: `Aggregation #${index + 1} is missing output field`,
          details: 'Each aggregation must specify an output field name.',
          recommendation: 'Provide an output field name for this aggregation.',
        });
      }
    });
  }
  
  // Check for group by fields
  if (!nodeData.groupByFields || nodeData.groupByFields.length === 0) {
    warnings.push({
      id: `transform-aggregate-missing-groupby-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Aggregate transformation is missing group by fields',
      details: 'An aggregate transformation typically needs group by fields to aggregate data properly.',
      recommendation: 'Consider adding group by fields for this aggregation.',
    });
  }
}

/**
 * Validates fork transformation
 * @private
 */
function validateForkTransform(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings) {
  // Added display name
  validateForkTransform.displayName = 'validateForkTransform';

  // Check for output connections
  if (outgoingEdges.length < 2) {
    warnings.push({
      id: `transform-fork-insufficient-outputs-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Fork transformation has less than 2 output connections',
      details: 'A fork transformation is designed to send identical data to multiple destinations but currently has less than 2 outputs.',
      recommendation: 'Connect additional destinations to this fork transformation.',
    });
  }
  
  // Check for field mappings
  if (!nodeData.fieldMappings || nodeData.fieldMappings.length === 0) {
    errors.push({
      id: `transform-fork-missing-mappings-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Fork transformation is missing field mappings',
      details: 'A fork transformation requires field mappings for each output.',
      recommendation: 'Configure field mappings for this fork transformation.',
    });
  }
}

/**
 * Validates merge transformation
 * @private
 */
function validateMergeTransform(nodeData, nodeId, nodeType, incomingEdges, incomingNodes, errors, warnings) {
  // Added display name
  validateMergeTransform.displayName = 'validateMergeTransform';

  // Check for minimum number of inputs
  if (incomingEdges.length < 2) {
    errors.push({
      id: `transform-merge-insufficient-inputs-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Merge transformation requires at least 2 input connections',
      details: 'A merge transformation combines data from multiple sources and requires at least 2 inputs.',
      recommendation: 'Connect at least one more source to this merge transformation.',
    });
  }
  
  // Check for merge strategy
  if (!nodeData.mergeStrategy) {
    warnings.push({
      id: `transform-merge-missing-strategy-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Merge transformation is missing merge strategy',
      details: 'A merge transformation should specify a strategy for combining data (append, combine fields, etc.).',
      recommendation: 'Select a merge strategy for this transformation.',
    });
  }
  
  // Check for field mappings
  if (!nodeData.fieldMappings || nodeData.fieldMappings.length === 0) {
    errors.push({
      id: `transform-merge-missing-mappings-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Merge transformation is missing field mappings',
      details: 'A merge transformation requires field mappings to define how data is combined.',
      recommendation: 'Configure field mappings for this merge transformation.',
    });
  }
}

/**
 * Validates field mappings
 * @private
 */
function validateFieldMappings(fieldMappings, nodeId, nodeType, errors, warnings) {
  // Added display name
  validateFieldMappings.displayName = 'validateFieldMappings';

  fieldMappings.forEach((mapping, index) => {
    // Check for source field
    if (!mapping.sourceField || !mapping.sourceField.id) {
      errors.push({
        id: `transform-mapping-missing-source-${nodeId}-${index}`,
        nodeId,
        nodeType,
        severity: 'error',
        message: `Field mapping #${index + 1} is missing source field`,
        details: 'Each field mapping must specify a source field.',
        recommendation: 'Complete the field mapping by selecting a source field.',
      });
    }
    
    // Check for destination field
    if (!mapping.destField || !mapping.destField.id) {
      errors.push({
        id: `transform-mapping-missing-destination-${nodeId}-${index}`,
        nodeId,
        nodeType,
        severity: 'error',
        message: `Field mapping #${index + 1} is missing destination field`,
        details: 'Each field mapping must specify a destination field.',
        recommendation: 'Complete the field mapping by selecting a destination field.',
      });
    }
    
    // Check for compatibility between source and destination fields
    if (mapping.sourceField && mapping.destField && 
        mapping.sourceField.type && mapping.destField.type &&
        !mapping.transform?.type) {
      
      // Basic type compatibility check
      const sourceType = mapping.sourceField.type.toLowerCase();
      const destType = mapping.destField.type.toLowerCase();
      
      const typePairs = [
        ['string', 'string'],
        ['number', 'number'],
        ['number', 'string'],
        ['integer', 'number'],
        ['float', 'number'],
        ['boolean', 'boolean'],
        ['boolean', 'string'],
        ['date', 'date'],
        ['date', 'string'],
        ['datetime', 'datetime'],
        ['datetime', 'string'],
        ['object', 'object'],
        ['array', 'array'],
      ];
      
      const isCompatible = typePairs.some(([src, dst]) => 
        sourceType.includes(src) && destType.includes(dst)
      );
      
      if (!isCompatible && !mapping.isCompatible) {
        warnings.push({
          id: `transform-incompatible-types-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'warning',
          message: `Field mapping #${index + 1} has potentially incompatible types`,
          details: `Source type "${mapping.sourceField.type}" may not be compatible with destination type "${mapping.destField.type}" without transformation.`,
          recommendation: 'Add a transformation to convert between these types or verify that the mapping is valid.',
        });
      }
    }
    
    // Check transformations
    if (mapping.transform) {
      // Check expression transformation
      if (mapping.transform.type === 'expression' && !mapping.transform.expression) {
        errors.push({
          id: `transform-missing-expression-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'error',
          message: `Field mapping #${index + 1} is missing expression`,
          details: 'An expression transformation requires a JavaScript expression.',
          recommendation: 'Add an expression for this transformation.',
        });
      }
      
      // Check format transformation
      if (mapping.transform.type === 'format' && !mapping.transform.format) {
        errors.push({
          id: `transform-missing-format-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'error',
          message: `Field mapping #${index + 1} is missing format string`,
          details: 'A format transformation requires a format string.',
          recommendation: 'Add a format string for this transformation.',
        });
      }
      
      // Check conditional transformation
      if (mapping.transform.type === 'conditional' && (!mapping.transform.conditions || mapping.transform.conditions.length === 0)) {
        errors.push({
          id: `transform-missing-conditions-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'error',
          message: `Field mapping #${index + 1} is missing conditional logic`,
          details: 'A conditional transformation requires at least one condition.',
          recommendation: 'Add conditions for this transformation.',
        });
      }
    }
  });
}

/**
 * Validates router node with multiple output paths
 * @param {Object} node - The router node to validate
 * @param {Array} edges - All edges in the flow
 * @param {Array} nodes - All nodes in the flow
 * @returns {Object} Validation results including errors and warnings
 */
export const validateComplexRouterNode = (node, edges, nodes) => {
  // Added display name
  validateComplexRouterNode.displayName = 'validateComplexRouterNode';

  // Added display name
  validateComplexRouterNode.displayName = 'validateComplexRouterNode';

  // Added display name
  validateComplexRouterNode.displayName = 'validateComplexRouterNode';

  // Added display name
  validateComplexRouterNode.displayName = 'validateComplexRouterNode';

  // Added display name
  validateComplexRouterNode.displayName = 'validateComplexRouterNode';


  const errors = [];
  const warnings = [];
  const info = [];
  
  if (!node || !node.data) return { errors, warnings, info };
  
  const nodeData = node.data;
  const nodeId = node.id;
  const nodeType = node.type;
  const routerType = nodeData.routerType;
  
  // Skip validation if router type is not specified
  if (!routerType) return { errors, warnings, info };
  
  // Get outgoing connections
  const outgoingEdges = edges.filter(edge => edge.source === nodeId);
  const outgoingNodes = outgoingEdges.map(edge => 
    nodes.find(n => n.id === edge.target)
  ).filter(Boolean);
  
  // Validate based on router type
  switch (routerType) {
    case 'condition':
      validateConditionRouter(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings);
      break;
    case 'switch':
      validateSwitchRouter(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings);
      break;
    case 'fork':
      validateForkRouter(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings);
      break;
    case 'merge':
      validateMergeRouter(nodeData, nodeId, nodeType, edges, nodes, errors, warnings);
      break;
  }
  
  return { errors, warnings, info };
};

/**
 * Validates a condition router node
 * @private
 */
function validateConditionRouter(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings) {
  // Added display name
  validateConditionRouter.displayName = 'validateConditionRouter';

  // Check for condition expression
  if (!nodeData.condition) {
    errors.push({
      id: `router-missing-condition-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Condition router is missing condition',
      details: 'A condition router requires a condition to determine the routing path.',
      recommendation: 'Add a condition expression for this router.',
    });
  }
  
  // Check for true/false paths
  if (outgoingEdges.length < 2) {
    warnings.push({
      id: `router-condition-missing-paths-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Condition router has less than 2 output paths',
      details: 'A condition router typically needs at least 2 paths (true and false).',
      recommendation: 'Add both true and false output paths for this router.',
    });
  } else if (outgoingEdges.length > 2) {
    warnings.push({
      id: `router-condition-too-many-paths-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Condition router has more than 2 output paths',
      details: 'A condition router typically has exactly 2 paths (true and false).',
      recommendation: 'Consider using a switch router for more than 2 paths.',
    });
  }
  
  // Check for path labeling
  const hasLabeledPaths = nodeData.paths && nodeData.paths.length > 0;
  if (!hasLabeledPaths) {
    warnings.push({
      id: `router-condition-missing-path-labels-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Condition router is missing path labels',
      details: 'Path labels help identify which output corresponds to true/false outcomes.',
      recommendation: 'Label the output paths as true/false.',
    });
  }
}

/**
 * Validates a switch router node
 * @private
 */
function validateSwitchRouter(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings) {
  // Added display name
  validateSwitchRouter.displayName = 'validateSwitchRouter';

  // Check for switch field
  if (!nodeData.switchField) {
    errors.push({
      id: `router-missing-switch-field-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Switch router is missing switch field',
      details: 'A switch router requires a field to evaluate for different cases.',
      recommendation: 'Specify the field to switch on.',
    });
  }
  
  // Check for cases
  if (!nodeData.cases || nodeData.cases.length === 0) {
    errors.push({
      id: `router-missing-cases-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Switch router has no cases defined',
      details: 'A switch router requires at least one case to route data.',
      recommendation: 'Add at least one case to this switch router.',
    });
  } else {
    // Check that each case has a value and target
    nodeData.cases.forEach((caseItem, index) => {
      if (caseItem.value === undefined) {
        errors.push({
          id: `router-case-missing-value-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'error',
          message: `Case #${index + 1} is missing value`,
          details: 'Each case must specify a value to match against the switch field.',
          recommendation: 'Provide a value for this case.',
        });
      }
      
      if (!caseItem.targetId) {
        errors.push({
          id: `router-case-missing-target-${nodeId}-${index}`,
          nodeId,
          nodeType,
          severity: 'error',
          message: `Case #${index + 1} is missing target`,
          details: 'Each case must specify a target node to route data to.',
          recommendation: 'Select a target for this case.',
        });
      } else {
        // Check that target exists
        const targetExists = outgoingEdges.some(edge => edge.target === caseItem.targetId);
        if (!targetExists) {
          errors.push({
            id: `router-case-invalid-target-${nodeId}-${index}`,
            nodeId,
            nodeType,
            severity: 'error',
            message: `Case #${index + 1} has invalid target: ${caseItem.targetId}`,
            details: 'The target node is not connected to this router.',
            recommendation: 'Connect the target node or update the case configuration.',
          });
        }
      }
    });
  }
  
  // Check for default case
  if (!nodeData.defaultCase) {
    warnings.push({
      id: `router-missing-default-case-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Switch router is missing default case',
      details: 'A default case ensures data is always routed even when no case matches.',
      recommendation: 'Add a default case to this switch router.',
    });
  } else if (!nodeData.defaultCase.targetId) {
    errors.push({
      id: `router-default-case-missing-target-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Default case is missing target',
      details: 'The default case must specify a target node to route data to.',
      recommendation: 'Select a target for the default case.',
    });
  } else {
    // Check that default target exists
    const targetExists = outgoingEdges.some(edge => edge.target === nodeData.defaultCase.targetId);
    if (!targetExists) {
      errors.push({
        id: `router-default-case-invalid-target-${nodeId}`,
        nodeId,
        nodeType,
        severity: 'error',
        message: `Default case has invalid target: ${nodeData.defaultCase.targetId}`,
        details: 'The target node for the default case is not connected to this router.',
        recommendation: 'Connect the target node or update the default case configuration.',
      });
    }
  }
}

/**
 * Validates a fork router node
 * @private
 */
function validateForkRouter(nodeData, nodeId, nodeType, outgoingEdges, outgoingNodes, errors, warnings) {
  // Added display name
  validateForkRouter.displayName = 'validateForkRouter';

  // Check for output connections
  if (outgoingEdges.length < 2) {
    warnings.push({
      id: `router-fork-insufficient-outputs-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Fork router has less than 2 output connections',
      details: 'A fork router is designed to send identical data to multiple destinations but currently has less than 2 outputs.',
      recommendation: 'Connect additional destinations to this fork router.',
    });
  }
  
  // Check for path configuration
  const hasPathConfig = nodeData.paths && nodeData.paths.length > 0;
  if (!hasPathConfig && outgoingEdges.length > 0) {
    warnings.push({
      id: `router-fork-missing-path-config-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Fork router is missing path configuration',
      details: 'Path configuration helps identify which outputs are active and their labels.',
      recommendation: 'Configure paths for this fork router.',
    });
  } else if (hasPathConfig) {
    // Check that paths match connections
    const configuredTargets = new Set(nodeData.paths.map(p => p.targetId));
    outgoingEdges.forEach(edge => {
      if (!configuredTargets.has(edge.target)) {
        warnings.push({
          id: `router-fork-unconfigured-path-${nodeId}-${edge.target}`,
          nodeId,
          nodeType,
          severity: 'warning',
          message: `Output to ${edge.target} is not configured`,
          details: 'Each output of a fork router should have a configuration in the paths array.',
          recommendation: 'Add a path configuration for this output.',
        });
      }
    });
  }
}

/**
 * Validates a merge router node
 * @private
 */
function validateMergeRouter(nodeData, nodeId, nodeType, edges, nodes, errors, warnings) {
  // Added display name
  validateMergeRouter.displayName = 'validateMergeRouter';

  // Check for input connections
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  if (incomingEdges.length < 2) {
    errors.push({
      id: `router-merge-insufficient-inputs-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'error',
      message: 'Merge router requires at least 2 input connections',
      details: 'A merge router combines data from multiple sources and requires at least 2 inputs.',
      recommendation: 'Connect at least one more source to this merge router.',
    });
  }
  
  // Check for merge strategy
  if (!nodeData.mergeStrategy) {
    warnings.push({
      id: `router-merge-missing-strategy-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Merge router is missing merge strategy',
      details: 'A merge router should specify a strategy for combining data (first-match, all, round-robin, etc.).',
      recommendation: 'Select a merge strategy for this router.',
    });
  }
  
  // Check for output connection
  const outgoingEdges = edges.filter(edge => edge.source === nodeId);
  if (outgoingEdges.length === 0) {
    warnings.push({
      id: `router-merge-no-output-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Merge router has no output connection',
      details: 'A merge router should have at least one output to send the merged data to.',
      recommendation: 'Connect an output node to this merge router.',
    });
  } else if (outgoingEdges.length > 1) {
    warnings.push({
      id: `router-merge-multiple-outputs-${nodeId}`,
      nodeId,
      nodeType,
      severity: 'warning',
      message: 'Merge router has multiple output connections',
      details: 'A merge router typically has a single output for the merged data.',
      recommendation: 'Consider using a fork router if you need to send to multiple destinations.',
    });
  }
}

export default {
  validateComplexTransformNode,
  validateComplexRouterNode
};