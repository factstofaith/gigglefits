/**
 * LiveConnectionTesting.js
 * 
 * Test harness for performing live testing of connection configurations with real data scenarios.
 * This utility provides functions for testing various node types and connection configurations
 * with mock data that simulates real-world integration scenarios.
 */

import { CONNECTION_TYPES } from '@components/integration/nodes/BaseNode';
import { validateConnection, validateFlow } from '@utils/connectionValidator';

// Common test data types that will be used across tests
const TEST_DATA_TYPES = {
  EMPLOYEE: {
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'firstName', type: 'string', required: true },
      { name: 'lastName', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'department', type: 'string', required: false },
      { name: 'position', type: 'string', required: false },
      { name: 'salary', type: 'number', required: false },
      { name: 'hireDate', type: 'date', required: true }
    ],
    sampleData: [
      { id: '001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', department: 'Engineering', position: 'Developer', salary: 85000, hireDate: '2022-01-15' },
      { id: '002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', department: 'Marketing', position: 'Manager', salary: 95000, hireDate: '2021-08-10' }
    ]
  },
  PROJECT: {
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'startDate', type: 'date', required: true },
      { name: 'endDate', type: 'date', required: false },
      { name: 'budget', type: 'number', required: false },
      { name: 'status', type: 'string', required: true }
    ],
    sampleData: [
      { id: 'P001', name: 'Website Redesign', description: 'Redesign company website', startDate: '2023-01-01', endDate: '2023-06-30', budget: 50000, status: 'In Progress' },
      { id: 'P002', name: 'App Development', description: 'Develop mobile app', startDate: '2023-03-15', endDate: null, budget: 75000, status: 'Planning' }
    ]
  },
  CUSTOMER: {
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'phone', type: 'string', required: false },
      { name: 'address', type: 'object', required: false },
      { name: 'registrationDate', type: 'date', required: true },
      { name: 'lastPurchase', type: 'date', required: false }
    ],
    sampleData: [
      { id: 'C001', name: 'Acme Corp', email: 'info@acme.com', phone: '123-456-7890', address: { street: '123 Main St', city: 'Anytown', zip: '12345' }, registrationDate: '2022-01-10', lastPurchase: '2023-02-15' },
      { id: 'C002', name: 'XYZ Industries', email: 'contact@xyz.com', phone: '987-654-3210', address: { street: '456 Oak Ave', city: 'Springfield', zip: '54321' }, registrationDate: '2021-05-18', lastPurchase: '2023-01-20' }
    ]
  }
};

// Node creators for test scenarios
const createSourceNode = (id, dataType = 'EMPLOYEE') => ({
  id,
  type: 'sourceNode',
  position: { x: 100, y: 250 },
  data: {
    label: `${dataType} Source`,
    nodeType: 'source',
    system: 'api',
    connectionUrl: 'https://api.example.com/data',
    status: 'Connected',
    outputConnections: [
      {
        id: "output-main",
        label: "Data Output",
        connectionType: CONNECTION_TYPES.DATA
      }
    ],
    connections: {
      inputs: {},
      outputs: {}
    },
    dataset: TEST_DATA_TYPES[dataType],
    schema: {
      fields: TEST_DATA_TYPES[dataType].fields
    }
  }
});

const createDatasetNode = (id, dataType = 'EMPLOYEE') => ({
  id,
  type: 'datasetNode',
  position: { x: 100, y: 100 },
  data: {
    label: `${dataType} Dataset`,
    nodeType: 'dataset',
    datasetId: `dataset-${dataType.toLowerCase()}`,
    datasetType: 'Internal',
    fields: TEST_DATA_TYPES[dataType].fields,
    description: `Dataset for ${dataType.toLowerCase()} data`,
    outputConnections: [
      {
        id: "output-main",
        label: "Dataset",
        connectionType: CONNECTION_TYPES.DATA
      }
    ],
    connections: {
      inputs: {},
      outputs: {}
    }
  }
});

const createApplicationNode = (id, name = 'HR System') => ({
  id,
  type: 'applicationNode',
  position: { x: 500, y: 100 },
  data: {
    label: name,
    nodeType: 'application',
    name,
    description: 'Application for data processing',
    applicationType: 'api',
    authType: 'oauth2',
    authConfig: {
      clientId: 'client-123',
      clientSecret: '******',
      tokenUrl: 'https://example.com/oauth/token',
      authUrl: 'https://example.com/oauth/authorize',
      scope: 'read write'
    },
    connectionConfig: {
      name: `${name} Connection`,
      baseUrl: 'https://example.com/api/v1',
      apiType: 'rest',
      headers: 'Content-Type: application/json\nAccept: application/json',
      useConnectionPool: true
    },
    associatedDatasets: [],
    connectionStatus: 'connected',
    inputConnections: [
      {
        id: "input-main",
        label: "Data Input",
        connectionType: CONNECTION_TYPES.DATA
      }
    ],
    connections: {
      inputs: {},
      outputs: {}
    }
  }
});

const createTransformNode = (id, transformType = 'map') => ({
  id,
  type: 'transformNode',
  position: { x: 300, y: 250 },
  data: {
    label: `${transformType.charAt(0).toUpperCase() + transformType.slice(1)} Transform`,
    nodeType: 'transform',
    transformType,
    description: `Transform data using ${transformType}`,
    connections: {
      inputs: {},
      outputs: {}
    },
    // Config depends on transform type
    ...(transformType === 'join' ? {
      inputConnections: [
        {
          id: "input-primary",
          label: "Primary",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "input-secondary",
          label: "Secondary",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      outputConnections: [
        {
          id: "output-main",
          label: "Result",
          connectionType: CONNECTION_TYPES.DATA
        }
      ]
    } : transformType === 'fork' || transformType === 'split' ? {
      inputConnections: [
        {
          id: "input-main",
          label: "Input",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      outputConnections: [
        {
          id: "output-0",
          label: "Output 1",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "output-1",
          label: "Output 2",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      outputs: [
        { label: "Output 1" },
        { label: "Output 2" }
      ]
    } : {
      // Default map transform
      inputConnections: [
        {
          id: "input-main",
          label: "Input",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      outputConnections: [
        {
          id: "output-main",
          label: "Output",
          connectionType: CONNECTION_TYPES.DATA
        }
      ]
    })
  }
});

const createRouterNode = (id, routerType = 'fork') => ({
  id,
  type: 'routerNode',
  position: { x: 500, y: 250 },
  data: {
    label: `${routerType.charAt(0).toUpperCase() + routerType.slice(1)} Router`,
    nodeType: 'router',
    routerType,
    description: `Route data using ${routerType}`,
    connections: {
      inputs: {},
      outputs: {}
    },
    // Config depends on router type
    ...(routerType === 'fork' ? {
      inputConnections: [
        {
          id: "input-main",
          label: "Input",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      outputConnections: [
        {
          id: "output-0",
          label: "Path 1",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "output-1",
          label: "Path 2",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "output-2",
          label: "Path 3",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      paths: [
        { label: "Path 1" },
        { label: "Path 2" },
        { label: "Path 3" }
      ]
    } : routerType === 'condition' ? {
      inputConnections: [
        {
          id: "input-main",
          label: "Input",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      outputConnections: [
        {
          id: "output-true",
          label: "True",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "output-false",
          label: "False",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      condition: "data.salary > 90000"
    } : routerType === 'switch' ? {
      inputConnections: [
        {
          id: "input-main",
          label: "Input",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      outputConnections: [
        {
          id: "output-0",
          label: "Case 1",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "output-1",
          label: "Case 2",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "output-default",
          label: "Default",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      switchField: "department",
      cases: [
        { condition: "Engineering", label: "Case 1" },
        { condition: "Marketing", label: "Case 2" },
      ]
    } : {
      // Merge router
      inputConnections: [
        {
          id: "input-0",
          label: "Source 1",
          connectionType: CONNECTION_TYPES.DATA
        },
        {
          id: "input-1",
          label: "Source 2",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      outputConnections: [
        {
          id: "output-main",
          label: "Output",
          connectionType: CONNECTION_TYPES.DATA
        }
      ],
      mergeStrategy: "Sequence",
      sources: [
        { label: "Source 1" },
        { label: "Source 2" }
      ]
    })
  }
});

const createDestinationNode = (id, system = 'database') => ({
  id,
  type: 'destinationNode',
  position: { x: 700, y: 250 },
  data: {
    label: `${system.charAt(0).toUpperCase() + system.slice(1)} Destination`,
    nodeType: 'destination',
    system,
    writeMode: 'upsert',
    status: 'Connected',
    inputConnections: [
      {
        id: "input-main",
        label: "Data Input",
        connectionType: CONNECTION_TYPES.DATA
      }
    ],
    connections: {
      inputs: {},
      outputs: {}
    }
  }
});

// Edge creator for test scenarios
const createEdge = (id, source, target, sourceHandle, targetHandle) => ({
  id,
  source,
  target,
  sourceHandle: sourceHandle || 'output-main',
  targetHandle: targetHandle || 'input-main',
  animated: true,
  data: {
    label: 'Connection'
  }
});

// Test scenarios
const TEST_SCENARIOS = {
  // Basic linear flow: Source -> Transform -> Destination
  LINEAR_FLOW: {
    name: 'Basic Linear Flow',
    description: 'Tests a simple linear flow with source, transform, and destination nodes',
    createNodes: () => [
      createSourceNode('source-1'),
      createTransformNode('transform-1', 'map'),
      createDestinationNode('destination-1')
    ],
    createEdges: () => [
      createEdge('edge-1', 'source-1', 'transform-1'),
      createEdge('edge-2', 'transform-1', 'destination-1')
    ],
    validationExpectations: {
      isValid: true,
      errorCount: 0
    }
  },
  
  // Dataset-Application flow: Dataset -> Application
  DATASET_APPLICATION_FLOW: {
    name: 'Dataset to Application Flow',
    description: 'Tests the connection between dataset and application nodes',
    createNodes: () => [
      createDatasetNode('dataset-1'),
      createApplicationNode('app-1')
    ],
    createEdges: () => [
      createEdge('edge-1', 'dataset-1', 'app-1')
    ],
    validationExpectations: {
      isValid: true,
      errorCount: 0
    }
  },
  
  // Fork router flow: Source -> Router (fork) -> Multiple Destinations
  FORK_ROUTER_FLOW: {
    name: 'Fork Router Flow',
    description: 'Tests a fork router node with multiple output paths',
    createNodes: () => [
      createSourceNode('source-1'),
      createRouterNode('router-1', 'fork'),
      createDestinationNode('destination-1'),
      createDestinationNode('destination-2', 'api'),
      createDestinationNode('destination-3', 'file')
    ],
    createEdges: () => [
      createEdge('edge-1', 'source-1', 'router-1'),
      createEdge('edge-2', 'router-1', 'destination-1', 'output-0', 'input-main'),
      createEdge('edge-3', 'router-1', 'destination-2', 'output-1', 'input-main'),
      createEdge('edge-4', 'router-1', 'destination-3', 'output-2', 'input-main')
    ],
    validationExpectations: {
      isValid: true,
      errorCount: 0
    }
  },
  
  // Condition router flow: Source -> Router (condition) -> True/False destinations
  CONDITION_ROUTER_FLOW: {
    name: 'Condition Router Flow',
    description: 'Tests a condition router node with true/false paths',
    createNodes: () => [
      createSourceNode('source-1'),
      createRouterNode('router-1', 'condition'),
      createDestinationNode('destination-true'),
      createDestinationNode('destination-false', 'api')
    ],
    createEdges: () => [
      createEdge('edge-1', 'source-1', 'router-1'),
      createEdge('edge-2', 'router-1', 'destination-true', 'output-true', 'input-main'),
      createEdge('edge-3', 'router-1', 'destination-false', 'output-false', 'input-main')
    ],
    validationExpectations: {
      isValid: true,
      errorCount: 0
    }
  },
  
  // Switch router flow: Source -> Router (switch) -> Case destinations
  SWITCH_ROUTER_FLOW: {
    name: 'Switch Router Flow',
    description: 'Tests a switch router node with multiple case paths',
    createNodes: () => [
      createSourceNode('source-1'),
      createRouterNode('router-1', 'switch'),
      createDestinationNode('destination-1'),
      createDestinationNode('destination-2', 'api'),
      createDestinationNode('destination-default', 'file')
    ],
    createEdges: () => [
      createEdge('edge-1', 'source-1', 'router-1'),
      createEdge('edge-2', 'router-1', 'destination-1', 'output-0', 'input-main'),
      createEdge('edge-3', 'router-1', 'destination-2', 'output-1', 'input-main'),
      createEdge('edge-4', 'router-1', 'destination-default', 'output-default', 'input-main')
    ],
    validationExpectations: {
      isValid: true,
      errorCount: 0
    }
  },
  
  // Merge flow: Multiple Sources -> Router (merge) -> Destination
  MERGE_ROUTER_FLOW: {
    name: 'Merge Router Flow',
    description: 'Tests a merge router node with multiple input sources',
    createNodes: () => [
      createSourceNode('source-1'),
      createSourceNode('source-2', 'PROJECT'),
      createRouterNode('router-1', 'merge'),
      createDestinationNode('destination-1')
    ],
    createEdges: () => [
      createEdge('edge-1', 'source-1', 'router-1', 'output-main', 'input-0'),
      createEdge('edge-2', 'source-2', 'router-1', 'output-main', 'input-1'),
      createEdge('edge-3', 'router-1', 'destination-1')
    ],
    validationExpectations: {
      isValid: true,
      errorCount: 0
    }
  },
  
  // Join transform flow: Multiple Sources -> Transform (join) -> Destination
  JOIN_TRANSFORM_FLOW: {
    name: 'Join Transform Flow',
    description: 'Tests a join transform node with primary and secondary inputs',
    createNodes: () => [
      createSourceNode('source-1'),
      createSourceNode('source-2', 'PROJECT'),
      createTransformNode('transform-1', 'join'),
      createDestinationNode('destination-1')
    ],
    createEdges: () => [
      createEdge('edge-1', 'source-1', 'transform-1', 'output-main', 'input-primary'),
      createEdge('edge-2', 'source-2', 'transform-1', 'output-main', 'input-secondary'),
      createEdge('edge-3', 'transform-1', 'destination-1')
    ],
    validationExpectations: {
      isValid: true,
      errorCount: 0
    }
  },
  
  // Split transform flow: Source -> Transform (split) -> Multiple Destinations
  SPLIT_TRANSFORM_FLOW: {
    name: 'Split Transform Flow',
    description: 'Tests a split transform node with multiple outputs',
    createNodes: () => [
      createSourceNode('source-1'),
      createTransformNode('transform-1', 'split'),
      createDestinationNode('destination-1'),
      createDestinationNode('destination-2', 'api')
    ],
    createEdges: () => [
      createEdge('edge-1', 'source-1', 'transform-1'),
      createEdge('edge-2', 'transform-1', 'destination-1', 'output-0', 'input-main'),
      createEdge('edge-3', 'transform-1', 'destination-2', 'output-1', 'input-main')
    ],
    validationExpectations: {
      isValid: true,
      errorCount: 0
    }
  },
  
  // Mixed type flow: Combine different node types and connection patterns
  MIXED_TYPE_FLOW: {
    name: 'Mixed Type Flow',
    description: 'Tests a complex flow with multiple node types and connection patterns',
    createNodes: () => [
      createDatasetNode('dataset-1'),
      createDatasetNode('dataset-2', 'PROJECT'),
      createApplicationNode('app-1'),
      createSourceNode('source-1'),
      createTransformNode('transform-1', 'map'),
      createRouterNode('router-1', 'fork'),
      createDestinationNode('destination-1')
    ],
    createEdges: () => [
      createEdge('edge-1', 'dataset-1', 'app-1'),
      createEdge('edge-2', 'dataset-2', 'app-1', 'output-main', 'input-main'),
      createEdge('edge-3', 'source-1', 'transform-1'),
      createEdge('edge-4', 'transform-1', 'router-1'),
      createEdge('edge-5', 'router-1', 'destination-1', 'output-0', 'input-main')
    ],
    validationExpectations: {
      isValid: false, // Should fail due to multiple connections to app-1 input-main
      errorCount: 1
    }
  },
  
  // Invalid connection type flow: Attempt to connect incompatible connection types
  INVALID_CONNECTION_TYPE_FLOW: {
    name: 'Invalid Connection Type Flow',
    description: 'Tests validation of incompatible connection types',
    createNodes: () => {
      // Create a source with control type output
      const source = createSourceNode('source-1');
      source.data.outputConnections[0].connectionType = CONNECTION_TYPES.CONTROL;
      
      // Create a transform with data type input
      const transform = createTransformNode('transform-1');
      
      // Create a destination
      const destination = createDestinationNode('destination-1');
      
      return [source, transform, destination];
    },
    createEdges: () => [
      createEdge('edge-1', 'source-1', 'transform-1'),
      createEdge('edge-2', 'transform-1', 'destination-1')
    ],
    validationExpectations: {
      isValid: false,
      errorCount: 1
    }
  }
};

/**
 * Runs a test scenario and returns the validation results
 * 
 * @param {string} scenarioKey - The key of the test scenario to run
 * @returns {Object} The validation results
 */
const runTestScenario = (scenarioKey) => {
  // Added display name
  runTestScenario.displayName = 'runTestScenario';

  // Added display name
  runTestScenario.displayName = 'runTestScenario';

  // Added display name
  runTestScenario.displayName = 'runTestScenario';

  // Added display name
  runTestScenario.displayName = 'runTestScenario';

  // Added display name
  runTestScenario.displayName = 'runTestScenario';


  const scenario = TEST_SCENARIOS[scenarioKey];
  if (!scenario) {
    throw new Error(`Test scenario "${scenarioKey}" not found`);
  }
  
  // Create nodes and edges
  const nodes = scenario.createNodes();
  const edges = scenario.createEdges();
  
  // Validate the flow
  const validationErrors = validateFlow(nodes, edges);
  
  // Return results
  return {
    scenario,
    nodes,
    edges,
    validationResults: {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      errorCount: validationErrors.length
    },
    meetsExpectations: 
      (validationErrors.length === 0) === scenario.validationExpectations.isValid &&
      validationErrors.length === scenario.validationExpectations.errorCount
  };
};

/**
 * Runs all test scenarios and returns the results
 * 
 * @returns {Object} The results of all test scenarios
 */
const runAllScenarios = () => {
  // Added display name
  runAllScenarios.displayName = 'runAllScenarios';

  // Added display name
  runAllScenarios.displayName = 'runAllScenarios';

  // Added display name
  runAllScenarios.displayName = 'runAllScenarios';

  // Added display name
  runAllScenarios.displayName = 'runAllScenarios';

  // Added display name
  runAllScenarios.displayName = 'runAllScenarios';


  const results = {};
  
  Object.keys(TEST_SCENARIOS).forEach(scenarioKey => {
    results[scenarioKey] = runTestScenario(scenarioKey);
  });
  
  return {
    results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(result => result.meetsExpectations).length,
      failed: Object.values(results).filter(result => !result.meetsExpectations).length
    }
  };
};

/**
 * Tests a single connection between two nodes
 * 
 * @param {Object} sourceNode - The source node
 * @param {Object} targetNode - The target node
 * @param {string} sourceHandle - The source handle ID
 * @param {string} targetHandle - The target handle ID
 * @returns {Object} The validation result
 */
const testConnection = (sourceNode, targetNode, sourceHandle, targetHandle) => {
  // Added display name
  testConnection.displayName = 'testConnection';

  // Added display name
  testConnection.displayName = 'testConnection';

  // Added display name
  testConnection.displayName = 'testConnection';

  // Added display name
  testConnection.displayName = 'testConnection';

  // Added display name
  testConnection.displayName = 'testConnection';


  return validateConnection({
    source: sourceHandle,
    target: targetHandle,
    sourceNode,
    targetNode
  });
};

export {
  TEST_DATA_TYPES,
  TEST_SCENARIOS,
  runTestScenario,
  runAllScenarios,
  testConnection,
  // Export node and edge creators for custom tests
  createSourceNode,
  createDatasetNode,
  createApplicationNode,
  createTransformNode,
  createRouterNode,
  createDestinationNode,
  createEdge
};