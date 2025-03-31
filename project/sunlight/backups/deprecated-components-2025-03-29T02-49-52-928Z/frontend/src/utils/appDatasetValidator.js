/**
 * appDatasetValidator.js
 * 
 * Utility for validating relationships between application and dataset nodes
 * in the integration flow. Ensures that applications are properly connected to
 * datasets and that the data flows respect the application-dataset associations.
 */

import { CONNECTION_TYPES } from '@components/integration/nodes/BaseNode';

/**
 * Validates the relationships between application and dataset nodes in a flow
 * 
 * @param {Array} nodes - The flow nodes
 * @param {Array} edges - The flow edges
 * @returns {Array} Array of validation errors and warnings
 */
export const validateAppDatasetRelationships = (nodes, edges) => {
  // Added display name
  validateAppDatasetRelationships.displayName = 'validateAppDatasetRelationships';

  // Added display name
  validateAppDatasetRelationships.displayName = 'validateAppDatasetRelationships';

  // Added display name
  validateAppDatasetRelationships.displayName = 'validateAppDatasetRelationships';

  // Added display name
  validateAppDatasetRelationships.displayName = 'validateAppDatasetRelationships';

  // Added display name
  validateAppDatasetRelationships.displayName = 'validateAppDatasetRelationships';


  const validationResults = [];
  
  // Find all dataset and application nodes
  const datasetNodes = nodes.filter(node => node.type === 'datasetNode');
  const applicationNodes = nodes.filter(node => node.type === 'applicationNode');
  
  if (datasetNodes.length === 0 || applicationNodes.length === 0) {
    // If there are no dataset or application nodes, no relationships to validate
    return validationResults;
  }
  
  // Check that application nodes have properly associated datasets
  applicationNodes.forEach(appNode => {
    const appId = appNode.id;
    const associatedDatasets = appNode.data.associatedDatasets || [];
    
    // Check for connections to dataset nodes
    const datasetConnections = edges.filter(edge => 
      (edge.source === appId && nodes.find(n => n.id === edge.target)?.type === 'datasetNode') ||
      (edge.target === appId && nodes.find(n => n.id === edge.source)?.type === 'datasetNode')
    );
    
    // For each connected dataset node, check if it's in the associated datasets
    datasetConnections.forEach(connection => {
      const datasetId = connection.source === appId ? connection.target : connection.source;
      const datasetNode = datasetNodes.find(node => node.id === datasetId);
      
      if (datasetNode) {
        const isAssociated = associatedDatasets.some(dataset => 
          dataset.id === datasetNode.data.datasetId ||
          dataset.datasetId === datasetNode.data.datasetId
        );
        
        if (!isAssociated) {
          validationResults.push({
            id: `app-dataset-not-associated-${appId}-${datasetId}`,
            severity: 'error',
            message: 'Connection to non-associated dataset',
            details: `Application \`${appNode.data.label}\` is connected to dataset \`${datasetNode.data.label}\` but they are not associated.`,
            recommendation: 'Associate the dataset with the application in the application configuration.',
            appNodeId: appId,
            datasetNodeId: datasetId,
            edgeId: connection.id
          });
        }
      }
    });
    
    // Check that all associated datasets are present in the flow
    associatedDatasets.forEach(dataset => {
      const datasetId = dataset.id || dataset.datasetId;
      const matchingDatasetNodes = datasetNodes.filter(node => 
        node.data.datasetId === datasetId
      );
      
      if (matchingDatasetNodes.length === 0) {
        validationResults.push({
          id: `dataset-missing-${appId}-${datasetId}`,
          severity: 'warning',
          message: 'Associated dataset not in flow',
          details: `Application \`${appNode.data.label}\` is associated with dataset \`${dataset.name || datasetId}\` but the dataset is not in the flow.`,
          recommendation: 'Add the dataset node to the flow or remove the association.',
          appNodeId: appId,
          datasetId: datasetId
        });
      } else if (matchingDatasetNodes.length > 0) {
        // Check if there's no connection between the app and at least one of the matching datasets
        const hasConnection = matchingDatasetNodes.some(datasetNode => 
          edges.some(edge => 
            (edge.source === appId && edge.target === datasetNode.id) ||
            (edge.target === appId && edge.source === datasetNode.id)
          )
        );
        
        if (!hasConnection) {
          validationResults.push({
            id: `app-dataset-not-connected-${appId}-${datasetId}`,
            severity: 'warning',
            message: 'Associated dataset not connected',
            details: `Application \`${appNode.data.label}\` is associated with dataset \`${dataset.name || datasetId}\` but they are not connected in the flow.`,
            recommendation: 'Create a connection between the application and dataset nodes.',
            appNodeId: appId,
            datasetId: datasetId
          });
        }
      }
    });
  });
  
  // Check for any dataset nodes that aren't associated with applications
  datasetNodes.forEach(datasetNode => {
    const datasetId = datasetNode.data.datasetId;
    
    // Check if this dataset is associated with any application
    const associatedApps = applicationNodes.filter(appNode => 
      (appNode.data.associatedDatasets || []).some(dataset => 
        dataset.id === datasetId || dataset.datasetId === datasetId
      )
    );
    
    if (associatedApps.length === 0) {
      validationResults.push({
        id: `dataset-not-associated-${datasetNode.id}`,
        severity: 'warning',
        message: 'Dataset not associated with any application',
        details: `Dataset "${datasetNode.data.label}" is not associated with any application in the flow.`,
        recommendation: 'Associate the dataset with an application or remove it from the flow.',
        datasetNodeId: datasetNode.id
      });
    }
  });
  
  // Check for data type compatibility in connections between datasets and applications
  edges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    
    if (sourceNode && targetNode) {
      const isDatasetToApp = 
        sourceNode.type === 'datasetNode' && targetNode.type === 'applicationNode';
      const isAppToDataset = 
        sourceNode.type === 'applicationNode' && targetNode.type === 'datasetNode';
      
      if (isDatasetToApp || isAppToDataset) {
        // Get the connection handles
        const sourceOutputs = sourceNode.data.outputConnections || [];
        const targetInputs = targetNode.data.inputConnections || [];
        
        const sourceOutput = sourceOutputs.find(output => output.id === edge.sourceHandle);
        const targetInput = targetInputs.find(input => input.id === edge.targetHandle);
        
        // Check connection type compatibility
        if (sourceOutput && targetInput) {
          const sourceType = sourceOutput.connectionType?.id || 'data';
          const targetType = targetInput.connectionType?.id || 'data';
          
          if (sourceType !== targetType) {
            validationResults.push({
              id: `connection-type-mismatch-${edge.id}`,
              severity: 'error',
              message: 'Connection type mismatch',
              details: `The connection from "${sourceNode.data.label}" to "${targetNode.data.label}" has incompatible connection types: ${sourceType} → ${targetType}.`,
              recommendation: 'Ensure both ends of the connection use the same connection type.',
              edgeId: edge.id,
              sourceNodeId: sourceNode.id,
              targetNodeId: targetNode.id
            });
          }
        }
      }
    }
  });
  
  return validationResults;
};

/**
 * Checks if a dataset is compatible with an application
 * 
 * @param {Object} dataset - The dataset node data
 * @param {Object} application - The application node data
 * @returns {Object} Compatibility result with isCompatible and reason
 */
export const checkDatasetApplicationCompatibility = (dataset, application) => {
  // Added display name
  checkDatasetApplicationCompatibility.displayName = 'checkDatasetApplicationCompatibility';

  // Added display name
  checkDatasetApplicationCompatibility.displayName = 'checkDatasetApplicationCompatibility';

  // Added display name
  checkDatasetApplicationCompatibility.displayName = 'checkDatasetApplicationCompatibility';

  // Added display name
  checkDatasetApplicationCompatibility.displayName = 'checkDatasetApplicationCompatibility';

  // Added display name
  checkDatasetApplicationCompatibility.displayName = 'checkDatasetApplicationCompatibility';


  // Default to compatible
  const result = {
    isCompatible: true,
    reason: ''
  };
  
  // Check for obviously incompatible app types and dataset types
  const appType = application.applicationType || 'api';
  const datasetType = dataset.datasetType || 'Internal';
  
  // Check compatibility based on application type
  if (appType === 'database' && datasetType === 'API') {
    result.isCompatible = false;
    result.reason = 'Database applications cannot directly use API datasets';
  }
  else if (appType === 'api' && datasetType === 'File') {
    // This might be ok in some cases, so just a warning
    result.isCompatible = true;
    result.warnings = ['API applications may require transformation to use File datasets'];
  }
  
  // Check schema compatibility if fields are defined
  if (result.isCompatible && dataset.fields && application.requiredFields) {
    const missingFields = [];
    
    application.requiredFields.forEach(requiredField => {
      const matchingField = dataset.fields.find(field => 
        field.name === requiredField.name && 
        field.type === requiredField.type
      );
      
      if (!matchingField) {
        missingFields.push(requiredField.name);
      }
    });
    
    if (missingFields.length > 0) {
      result.isCompatible = false;
      result.reason = `Missing required fields: ${missingFields.join(', ')}`;
    }
  }
  
  return result;
};

/**
 * Checks if a dataset can be used with multiple applications
 * 
 * @param {Object} dataset - The dataset node data
 * @returns {boolean} True if the dataset can be shared
 */
export const canDatasetBeShared = (dataset) => {
  // Added display name
  canDatasetBeShared.displayName = 'canDatasetBeShared';

  // Added display name
  canDatasetBeShared.displayName = 'canDatasetBeShared';

  // Added display name
  canDatasetBeShared.displayName = 'canDatasetBeShared';

  // Added display name
  canDatasetBeShared.displayName = 'canDatasetBeShared';

  // Added display name
  canDatasetBeShared.displayName = 'canDatasetBeShared';


  // Most datasets can be shared, but some might have restrictions
  const datasetType = dataset.datasetType || 'Internal';
  
  // Check for dataset properties that might indicate it can't be shared
  const isShared = !(
    dataset.exclusive === true ||
    dataset.shareRestricted === true ||
    (dataset.shareSettings && dataset.shareSettings.allowSharing === false)
  );
  
  return isShared;
};

/**
 * Checks if an application can use multiple datasets
 * 
 * @param {Object} application - The application node data
 * @returns {boolean} True if the application can use multiple datasets
 */
export const canUseMultipleDatasets = (application) => {
  // Added display name
  canUseMultipleDatasets.displayName = 'canUseMultipleDatasets';

  // Added display name
  canUseMultipleDatasets.displayName = 'canUseMultipleDatasets';

  // Added display name
  canUseMultipleDatasets.displayName = 'canUseMultipleDatasets';

  // Added display name
  canUseMultipleDatasets.displayName = 'canUseMultipleDatasets';

  // Added display name
  canUseMultipleDatasets.displayName = 'canUseMultipleDatasets';


  // Most application types can use multiple datasets
  const appType = application.applicationType || 'api';
  
  // Some special application types might be restricted to one dataset
  return !(
    application.singleDatasetOnly === true ||
    appType === 'legacy' || // Legacy apps might have restrictions
    (application.datasetSettings && application.datasetSettings.multipleDatasets === false)
  );
};

/**
 * Finds potential compatible datasets for an application in a list
 * 
 * @param {Object} application - The application node data
 * @param {Array} availableDatasets - List of available datasets
 * @returns {Array} List of compatible datasets
 */
export const findCompatibleDatasets = (application, availableDatasets) => {
  // Added display name
  findCompatibleDatasets.displayName = 'findCompatibleDatasets';

  // Added display name
  findCompatibleDatasets.displayName = 'findCompatibleDatasets';

  // Added display name
  findCompatibleDatasets.displayName = 'findCompatibleDatasets';

  // Added display name
  findCompatibleDatasets.displayName = 'findCompatibleDatasets';

  // Added display name
  findCompatibleDatasets.displayName = 'findCompatibleDatasets';


  if (!availableDatasets || !Array.isArray(availableDatasets)) {
    return [];
  }
  
  return availableDatasets.filter(dataset => {
    const compatibility = checkDatasetApplicationCompatibility(dataset, application);
    return compatibility.isCompatible;
  });
};

/**
 * Creates a suggested association between datasets and applications
 * 
 * @param {Array} nodes - The flow nodes
 * @param {Array} edges - The flow edges
 * @returns {Object} Suggested associations
 */
export const suggestDatasetApplicationAssociations = (nodes, edges) => {
  // Added display name
  suggestDatasetApplicationAssociations.displayName = 'suggestDatasetApplicationAssociations';

  // Added display name
  suggestDatasetApplicationAssociations.displayName = 'suggestDatasetApplicationAssociations';

  // Added display name
  suggestDatasetApplicationAssociations.displayName = 'suggestDatasetApplicationAssociations';

  // Added display name
  suggestDatasetApplicationAssociations.displayName = 'suggestDatasetApplicationAssociations';

  // Added display name
  suggestDatasetApplicationAssociations.displayName = 'suggestDatasetApplicationAssociations';


  const suggestions = {
    applications: {},
    datasets: {}
  };
  
  // Find all dataset and application nodes
  const datasetNodes = nodes.filter(node => node.type === 'datasetNode');
  const applicationNodes = nodes.filter(node => node.type === 'applicationNode');
  
  // Process existing connections
  edges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    
    if (sourceNode && targetNode) {
      if (sourceNode.type === 'datasetNode' && targetNode.type === 'applicationNode') {
        // Dataset to Application connection
        const datasetId = sourceNode.data.datasetId;
        const appId = targetNode.id;
        
        if (!suggestions.applications[appId]) {
          suggestions.applications[appId] = [];
        }
        
        if (!suggestions.applications[appId].includes(datasetId)) {
          suggestions.applications[appId].push(datasetId);
        }
        
        if (!suggestions.datasets[datasetId]) {
          suggestions.datasets[datasetId] = [];
        }
        
        if (!suggestions.datasets[datasetId].includes(appId)) {
          suggestions.datasets[datasetId].push(appId);
        }
      }
      else if (sourceNode.type === 'applicationNode' && targetNode.type === 'datasetNode') {
        // Application to Dataset connection
        const appId = sourceNode.id;
        const datasetId = targetNode.data.datasetId;
        
        if (!suggestions.applications[appId]) {
          suggestions.applications[appId] = [];
        }
        
        if (!suggestions.applications[appId].includes(datasetId)) {
          suggestions.applications[appId].push(datasetId);
        }
        
        if (!suggestions.datasets[datasetId]) {
          suggestions.datasets[datasetId] = [];
        }
        
        if (!suggestions.datasets[datasetId].includes(appId)) {
          suggestions.datasets[datasetId].push(appId);
        }
      }
    }
  });
  
  return suggestions;
};

export default {
  validateAppDatasetRelationships,
  checkDatasetApplicationCompatibility,
  canDatasetBeShared,
  canUseMultipleDatasets,
  findCompatibleDatasets,
  suggestDatasetApplicationAssociations
};