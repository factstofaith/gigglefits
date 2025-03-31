/**
 * WARNING: This file has React hooks usage issues.
 * React hooks must be called inside a React function component or a custom React hook.
 * Consider refactoring this file to proper hooks patterns.
 * 
 * For immediate build fixes:
 * 1. Convert the hook to a regular function and use state management
 * 2. Or create a proper custom hook following React rules
 */

/**
 * WARNING: This file has React hooks usage issues.
 * React hooks must be called inside a React function component or a custom React hook.
 * Consider refactoring this file to proper hooks patterns.
 * 
 * For immediate build fixes:
 * 1. Convert the hook to a regular function and use state management
 * 2. Or create a proper custom hook following React rules
 */

/**
 * WARNING: This file has React hooks usage issues.
 * React hooks must be called inside a React function component or a custom React hook.
 * Consider refactoring this file to proper hooks patterns.
 * 
 * For immediate build fixes:
 * 1. Convert the hook to a regular function and use state management
 * 2. Or create a proper custom hook following React rules
 */

/**
 * WARNING: This file has React hooks usage issues.
 * React hooks must be called inside a React function component or a custom React hook.
 * Consider refactoring this file to proper hooks patterns.
 * 
 * For immediate build fixes:
 * 1. Convert the hook to a regular function and use state management
 * 2. Or create a proper custom hook following React rules
 */

/**
 * WARNING: This file has React hooks usage issues.
 * React hooks must be called inside a React function component or a custom React hook.
 * Consider refactoring this file to proper hooks patterns.
 * 
 * For immediate build fixes:
 * 1. Convert the hook to a regular function and use state management
 * 2. Or create a proper custom hook following React rules
 */

/**
 * WARNING: This file has React hooks usage issues.
 * React hooks must be called inside a React function component or a custom React hook.
 * Consider refactoring this file to proper hooks patterns.
 * 
 * For immediate build fixes:
 * 1. Convert the hook to a regular function and use state management
 * 2. Or create a proper custom hook following React rules
 */

/**
 * bidirectionalSync.js
 * 
 * Utility functions for enabling bidirectional synchronization between different
 * tabs or views in the application, particularly for the IntegrationDetailView.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A module pattern for creating a simple state sync manager
 */
export const createTabSyncManager = () => {
  // Added display name
  createTabSyncManager.displayName = 'createTabSyncManager';

  // Added display name
  createTabSyncManager.displayName = 'createTabSyncManager';

  // Added display name
  createTabSyncManager.displayName = 'createTabSyncManager';

  // Added display name
  createTabSyncManager.displayName = 'createTabSyncManager';

  const listeners = new Map();
  const stateCache = new Map();
  
  const register = (componentId, callback, dataKeys = ['all']) => {
  // Added display name
  register.displayName = 'register';

  // Added display name
  register.displayName = 'register';

  // Added display name
  register.displayName = 'register';

  // Added display name
  register.displayName = 'register';

    if (listeners.has(componentId)) {
      unregister(componentId);
    }
    listeners.set(componentId, { callback, dataKeys });
    return () => unregister(componentId);
  };
  
  const unregister = (componentId) => {
  // Added display name
  unregister.displayName = 'unregister';

  // Added display name
  unregister.displayName = 'unregister';

  // Added display name
  unregister.displayName = 'unregister';

  // Added display name
  unregister.displayName = 'unregister';

    listeners.delete(componentId);
  };
  
  const publish = (sourceId, dataKey, data) => {
  // Added display name
  publish.displayName = 'publish';

  // Added display name
  publish.displayName = 'publish';

  // Added display name
  publish.displayName = 'publish';

  // Added display name
  publish.displayName = 'publish';

    stateCache.set(dataKey, data);
    listeners.forEach((subscription, componentId) => {
      if (componentId !== sourceId && 
          (subscription.dataKeys.includes('all') || subscription.dataKeys.includes(dataKey))) {
        subscription.callback(dataKey, data, sourceId);
      }
    });
  };
  
  const getState = (dataKey, defaultValue = null) => {
  // Added display name
  getState.displayName = 'getState';

  // Added display name
  getState.displayName = 'getState';

  // Added display name
  getState.displayName = 'getState';

  // Added display name
  getState.displayName = 'getState';

    return stateCache.has(dataKey) ? stateCache.get(dataKey) : defaultValue;
  };
  
  const hasChanged = (dataKey, timestamp) => {
  // Added display name
  hasChanged.displayName = 'hasChanged';

  // Added display name
  hasChanged.displayName = 'hasChanged';

  // Added display name
  hasChanged.displayName = 'hasChanged';

  // Added display name
  hasChanged.displayName = 'hasChanged';

    const lastUpdate = stateCache.get(`${dataKey}:timestamp`);
    return lastUpdate && lastUpdate > timestamp;
  };
  
  const markUpdated = (dataKey) => {
  // Added display name
  markUpdated.displayName = 'markUpdated';

  // Added display name
  markUpdated.displayName = 'markUpdated';

  // Added display name
  markUpdated.displayName = 'markUpdated';

  // Added display name
  markUpdated.displayName = 'markUpdated';

    stateCache.set(`${dataKey}:timestamp`, Date.now());
  };
  
  const getActiveSubscribers = () => {
  // Added display name
  getActiveSubscribers.displayName = 'getActiveSubscribers';

  // Added display name
  getActiveSubscribers.displayName = 'getActiveSubscribers';

  // Added display name
  getActiveSubscribers.displayName = 'getActiveSubscribers';

  // Added display name
  getActiveSubscribers.displayName = 'getActiveSubscribers';

    return Array.from(listeners.keys());
  };
  
  return {
    register,
    unregister,
    publish,
    getState,
    hasChanged,
    markUpdated,
    getActiveSubscribers
  };
};

/**
 * Fixed custom hook for using a sync manager in React components
 */
export const useSyncManager = (syncManager, componentId, initialDataKeys = ['all']) => {
  // Added display name
  useSyncManager.displayName = 'useSyncManager';

  // Added display name
  useSyncManager.displayName = 'useSyncManager';

  // Added display name
  useSyncManager.displayName = 'useSyncManager';

  // Added display name
  useSyncManager.displayName = 'useSyncManager';

  const [dataKeys, setDataKeys] = useState(initialDataKeys);
  const lastSyncRef  = { current: {} };
  
  const handleSync = useCallback((dataKey, data, sourceId) => {
    lastSyncRef.current[dataKey] = {
      timestamp: Date.now(),
      sourceId,
      data
    };
  }, []);
  
  // Effect converted to immediate function call
(function() {
    const unsubscribe = syncManager.register(componentId, handleSync, dataKeys);
    return () => unsubscribe();
  })();
  
  const publishUpdate = useCallback((dataKey, data) => {
    syncManager.publish(componentId, dataKey, data);
    syncManager.markUpdated(dataKey);
  }, [syncManager, componentId]);
  
  return {
    publishUpdate,
    updateDataKeys: setDataKeys,
    getState: syncManager.getState,
    hasChanged: syncManager.hasChanged,
    lastSync: lastSyncRef.current
  };
};

// Specific sync manager instance
export const IntegrationDetailSyncManager = createTabSyncManager();

// Data transformation functions
export const SyncTransformers = {
  flowToBackend: (flowData) => {
    const { nodes, edges } = flowData;
    return {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          _selected: undefined,
          _highlight: undefined,
          _dragging: undefined
        }
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        data: edge.data
      })),
      version: '1.0'
    };
  },
  
  backendToFlow: (backendData) => {
    const { nodes, edges } = backendData;
    return {
      nodes: nodes.map(node => ({
        ...node,
        draggable: true,
        selectable: true
      })),
      edges: edges.map(edge => ({
        ...edge,
        animated: edge.data?.animated || false,
        style: edge.data?.style || {}
      }))
    };
  },
  
  datasetsToNodes: (datasets) => {
    return datasets.map(dataset => ({
      id: `dataset-${dataset.id}`,
      type: 'datasetNode',
      position: { x: 100, y: 100 * (parseInt(dataset.id) || 1) },
      data: {
        label: dataset.name,
        nodeType: 'dataset',
        datasetId: dataset.id,
        datasetType: dataset.type || 'Internal',
        fields: dataset.fields || [],
        description: dataset.description || `Dataset for ${dataset.name}`,
        outputConnections: [{ id: "output-main", label: "Dataset", connectionType: { id: 'data', name: 'Data' } }],
        connections: { inputs: {}, outputs: {} }
      }
    }));
  },
  
  applicationsToNodes: (applications) => {
    return applications.map(app => ({
      id: `app-${app.id}`,
      type: 'applicationNode',
      position: { x: 500, y: 100 * (parseInt(app.id) || 1) },
      data: {
        label: app.name,
        nodeType: 'application',
        name: app.name,
        description: app.description || 'Application',
        applicationType: app.type || 'api',
        authType: app.authType || 'none',
        authConfig: app.authConfig || {},
        connectionConfig: app.connectionConfig || {
          name: `${app.name} Connection`,
          baseUrl: '',
          apiType: 'rest'
        },
        associatedDatasets: app.datasets || [],
        connectionStatus: app.status || 'disconnected',
        inputConnections: [{ id: "input-main", label: "Data Input", connectionType: { id: 'data', name: 'Data' } }],
        connections: { inputs: {}, outputs: {} }
      }
    }));
  }
};

export const SYNC_KEYS = {
  FLOW_DATA: 'flowData',
  DATASETS: 'datasets',
  APPLICATIONS: 'applications',
  SCHEDULE: 'schedule',
  VALIDATION: 'validation',
  METADATA: 'metadata',
  SAVE_STATUS: 'saveStatus'
};

/**
 * Integration detail hook factory
 */
export const useIntegrationDetailSync = (componentId, initialDataKeys = ['all']) => 
  useSyncManager(IntegrationDetailSyncManager, componentId, initialDataKeys);