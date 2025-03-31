import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@utils/reactFlowAdapter';
import 'reactflow/dist/style.css';

// Material UI components
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, Snackbar, Divider, Grid, Chip, Stack, Card, CardContent, CardActions, Tabs, Tab } from '../../design-system';
;
;
;
;;

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BugReportIcon from '@mui/icons-material/BugReport';
import SchemaIcon from '@mui/icons-material/Schema';
import SaveIcon from '@mui/icons-material/Save';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VerifiedIcon from '@mui/icons-material/Verified';

// Components
import IntegrationFlowCanvas from '@components/integration/IntegrationFlowCanvas';

// Test data generators
import { 
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton } from '../../design-system';
// Design system import already exists;
;
generateTestNodes, 
  generateTestEdges, 
  generateComplexTestFlow 
} from '@tests/integration/testDataGenerator';

/**
 * ComplexFlowValidator Component
 * Tests and validates complex flows with multiple branches
 */
function ComplexFlowValidator() {
  // Added display name
  ComplexFlowValidator.displayName = 'ComplexFlowValidator';

  const [activeTab, setActiveTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [flowConfigurations, setFlowConfigurations] = useState([
    {
      id: 'basic-branch',
      name: 'Basic Branching',
      description: 'Simple flow with a single router node and two branches',
      complexity: 'medium',
      nodeCount: 7
    },
    {
      id: 'multi-branch',
      name: 'Multiple Branches',
      description: 'Flow with multiple router nodes creating multiple branches',
      complexity: 'complex',
      nodeCount: 12
    },
    {
      id: 'branch-join',
      name: 'Branch and Join',
      description: 'Flow with branches that rejoin for final processing',
      complexity: 'complex',
      nodeCount: 10,
      hasJoins: true
    },
    {
      id: 'nested-routes',
      name: 'Nested Routing',
      description: 'Flow with routers inside branches, creating nested decision paths',
      complexity: 'complex',
      nodeCount: 15,
      hasNesting: true
    },
    {
      id: 'multi-source',
      name: 'Multiple Sources',
      description: 'Flow with multiple source nodes feeding into processing paths',
      complexity: 'complex',
      nodeCount: 10,
      multiSource: true
    },
    {
      id: 'full-complex',
      name: 'Full Complexity',
      description: 'Complex flow with all node types, multiple branches, and joins',
      complexity: 'complex',
      nodeCount: 20,
      hasJoins: true,
      hasNesting: true,
      multiSource: true
    }
  ]);
  
  const [testResults, setTestResults] = useState({});
  const [currentFlowConfig, setCurrentFlowConfig] = useState(null);
  const [flowData, setFlowData] = useState({ nodes: [], edges: [] });
  
  // Handler for tab changes
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };
  
  // Generate flow data for a configuration
  const generateFlowData = useCallback((config) => {
  // Added display name
  generateFlowData.displayName = 'generateFlowData';

    if (config.id === 'full-complex') {
      // Use the predefined complex flow
      return generateComplexTestFlow();
    }
    
    let nodes = [];
    let edges = [];
    
    if (config.multiSource) {
      // Create multiple source nodes
      nodes.push({
        id: 'trigger-1',
        type: 'triggerNode',
        position: { x: 50, y: 200 },
        data: {
          label: 'Trigger',
          nodeType: 'trigger',
          configData: { triggerType: 'schedule' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      // Add two source nodes
      nodes.push({
        id: 'source-1',
        type: 'sourceNode',
        position: { x: 250, y: 100 },
        data: {
          label: 'Source 1',
          nodeType: 'source',
          configData: { connectionType: 'api' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      nodes.push({
        id: 'source-2',
        type: 'sourceNode',
        position: { x: 250, y: 300 },
        data: {
          label: 'Source 2',
          nodeType: 'source',
          configData: { connectionType: 'file' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      // Connect trigger to sources
      edges.push({
        id: 'edge-trigger-source1',
        source: 'trigger-1',
        target: 'source-1',
        animated: true,
        data: { label: 'Activates' }
      });
      
      edges.push({
        id: 'edge-trigger-source2',
        source: 'trigger-1',
        target: 'source-2',
        animated: true,
        data: { label: 'Activates' }
      });
      
      // Add transform nodes for each source
      nodes.push({
        id: 'transform-1',
        type: 'transformNode',
        position: { x: 450, y: 100 },
        data: {
          label: 'Transform 1',
          nodeType: 'transform',
          configData: { transformType: 'map' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      nodes.push({
        id: 'transform-2',
        type: 'transformNode',
        position: { x: 450, y: 300 },
        data: {
          label: 'Transform 2',
          nodeType: 'transform',
          configData: { transformType: 'filter' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      // Connect sources to transforms
      edges.push({
        id: 'edge-source1-transform1',
        source: 'source-1',
        target: 'transform-1',
        animated: true,
        data: { label: 'Data' }
      });
      
      edges.push({
        id: 'edge-source2-transform2',
        source: 'source-2',
        target: 'transform-2',
        animated: true,
        data: { label: 'Data' }
      });
      
      // Add router to branch the flow
      nodes.push({
        id: 'router-1',
        type: 'routerNode',
        position: { x: 650, y: 200 },
        data: {
          label: 'Router',
          nodeType: 'router',
          configData: { routerType: 'condition' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      // Connect transforms to router
      edges.push({
        id: 'edge-transform1-router',
        source: 'transform-1',
        target: 'router-1',
        animated: true,
        data: { label: 'Processed Data' }
      });
      
      edges.push({
        id: 'edge-transform2-router',
        source: 'transform-2',
        target: 'router-1',
        animated: true,
        data: { label: 'Processed Data' }
      });
      
      // Add branches from router
      nodes.push({
        id: 'action-1',
        type: 'actionNode',
        position: { x: 850, y: 100 },
        data: {
          label: 'Action',
          nodeType: 'action',
          configData: { actionType: 'notification' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      nodes.push({
        id: 'dataset-1',
        type: 'datasetNode',
        position: { x: 850, y: 300 },
        data: {
          label: 'Dataset',
          nodeType: 'dataset',
          configData: { direction: 'output' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      // Connect router to branches
      edges.push({
        id: 'edge-router-action',
        source: 'router-1',
        target: 'action-1',
        animated: true,
        data: { label: 'Condition True' }
      });
      
      edges.push({
        id: 'edge-router-dataset',
        source: 'router-1',
        target: 'dataset-1',
        animated: true,
        data: { label: 'Condition False' }
      });
      
      // Add destination node
      nodes.push({
        id: 'destination-1',
        type: 'destinationNode',
        position: { x: 1050, y: 200 },
        data: {
          label: 'Destination',
          nodeType: 'destination',
          configData: { connectionType: 'api' },
          validation: { isValid: true, messages: [] }
        }
      });
      
      // Connect branches to destination
      edges.push({
        id: 'edge-action-destination',
        source: 'action-1',
        target: 'destination-1',
        animated: true,
        data: { label: 'Final Output' }
      });
      
      edges.push({
        id: 'edge-dataset-destination',
        source: 'dataset-1',
        target: 'destination-1',
        animated: true,
        data: { label: 'Final Output' }
      });
      
    } else if (config.id === 'basic-branch') {
      // Basic branch flow
      nodes = [
        {
          id: 'source-1',
          type: 'sourceNode',
          position: { x: 50, y: 200 },
          data: {
            label: 'Source',
            nodeType: 'source',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'transform-1',
          type: 'transformNode',
          position: { x: 250, y: 200 },
          data: {
            label: 'Transform',
            nodeType: 'transform',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'router-1',
          type: 'routerNode',
          position: { x: 450, y: 200 },
          data: {
            label: 'Router',
            nodeType: 'router',
            configData: { routerType: 'condition' },
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'transform-2',
          type: 'transformNode',
          position: { x: 650, y: 100 },
          data: {
            label: 'Transform A',
            nodeType: 'transform',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'transform-3',
          type: 'transformNode',
          position: { x: 650, y: 300 },
          data: {
            label: 'Transform B',
            nodeType: 'transform',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'destination-1',
          type: 'destinationNode',
          position: { x: 850, y: 200 },
          data: {
            label: 'Destination',
            nodeType: 'destination',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        }
      ];
      
      edges = [
        {
          id: 'edge-source-transform',
          source: 'source-1',
          target: 'transform-1',
          animated: true,
          data: { label: 'Data' }
        },
        {
          id: 'edge-transform-router',
          source: 'transform-1',
          target: 'router-1',
          animated: true,
          data: { label: 'Processed Data' }
        },
        {
          id: 'edge-router-transformA',
          source: 'router-1',
          target: 'transform-2',
          animated: true,
          data: { label: 'Condition True' }
        },
        {
          id: 'edge-router-transformB',
          source: 'router-1',
          target: 'transform-3',
          animated: true,
          data: { label: 'Condition False' }
        },
        {
          id: 'edge-transformA-destination',
          source: 'transform-2',
          target: 'destination-1',
          animated: true,
          data: { label: 'Output A' }
        },
        {
          id: 'edge-transformB-destination',
          source: 'transform-3',
          target: 'destination-1',
          animated: true,
          data: { label: 'Output B' }
        }
      ];
      
    } else if (config.id === 'branch-join') {
      // Branch and join flow
      // Implementation for branch and join flow with rejoining paths
      nodes = [
        {
          id: 'source-1',
          type: 'sourceNode',
          position: { x: 50, y: 200 },
          data: {
            label: 'Source',
            nodeType: 'source',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'router-1',
          type: 'routerNode',
          position: { x: 250, y: 200 },
          data: {
            label: 'Router',
            nodeType: 'router',
            configData: { routerType: 'fork', outputs: 3 },
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'transform-1',
          type: 'transformNode',
          position: { x: 450, y: 50 },
          data: {
            label: 'Path A',
            nodeType: 'transform',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'transform-2',
          type: 'transformNode',
          position: { x: 450, y: 200 },
          data: {
            label: 'Path B',
            nodeType: 'transform',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'transform-3',
          type: 'transformNode',
          position: { x: 450, y: 350 },
          data: {
            label: 'Path C',
            nodeType: 'transform',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'join-1',
          type: 'transformNode',
          position: { x: 650, y: 125 },
          data: {
            label: 'Join A+B',
            nodeType: 'transform',
            configData: { transformType: 'join' },
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'join-2',
          type: 'transformNode',
          position: { x: 850, y: 200 },
          data: {
            label: 'Final Join',
            nodeType: 'transform',
            configData: { transformType: 'join' },
            validation: { isValid: true, messages: [] }
          }
        },
        {
          id: 'destination-1',
          type: 'destinationNode',
          position: { x: 1050, y: 200 },
          data: {
            label: 'Destination',
            nodeType: 'destination',
            configData: {},
            validation: { isValid: true, messages: [] }
          }
        }
      ];
      
      edges = [
        {
          id: 'edge-source-router',
          source: 'source-1',
          target: 'router-1',
          animated: true,
          data: { label: 'Data' }
        },
        {
          id: 'edge-router-transformA',
          source: 'router-1',
          target: 'transform-1',
          animated: true,
          data: { label: 'Fork 1' }
        },
        {
          id: 'edge-router-transformB',
          source: 'router-1',
          target: 'transform-2',
          animated: true,
          data: { label: 'Fork 2' }
        },
        {
          id: 'edge-router-transformC',
          source: 'router-1',
          target: 'transform-3',
          animated: true,
          data: { label: 'Fork 3' }
        },
        {
          id: 'edge-transformA-join1',
          source: 'transform-1',
          target: 'join-1',
          animated: true,
          data: { label: 'A Data' }
        },
        {
          id: 'edge-transformB-join1',
          source: 'transform-2',
          target: 'join-1',
          animated: true,
          data: { label: 'B Data' }
        },
        {
          id: 'edge-join1-join2',
          source: 'join-1',
          target: 'join-2',
          animated: true,
          data: { label: 'A+B Data' }
        },
        {
          id: 'edge-transformC-join2',
          source: 'transform-3',
          target: 'join-2',
          animated: true,
          data: { label: 'C Data' }
        },
        {
          id: 'edge-join2-destination',
          source: 'join-2',
          target: 'destination-1',
          animated: true,
          data: { label: 'Final Data' }
        }
      ];
    } else {
      // Default to generating based on config parameters
      const genOptions = {
        nodeCount: config.nodeCount,
        complexity: config.complexity,
        includeAllTypes: true,
        withCustomData: true
      };
      
      nodes = generateTestNodes(genOptions);
      edges = generateTestEdges(nodes, { 
        complexity: config.complexity,
        withLabels: true,
        animated: true,
        withCustomData: true
      });
    }
    
    return { nodes, edges };
  }, []);
  
  // Run test for a single flow configuration
  const runFlowTest = useCallback(async (config) => {
  // Added display name
  runFlowTest.displayName = 'runFlowTest';

    setIsRunning(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Generate the flow data
      const flow = generateFlowData(config);
      setFlowData(flow);
      setCurrentFlowConfig(config);
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Run validation checks
      const validationIssues = validateFlow(flow.nodes, flow.edges);
      const success = validationIssues.length === 0;
      
      // Store test result
      setTestResults(prev => ({
        ...prev,
        [config.id]: {
          success,
          timestamp: new Date().toISOString(),
          validationIssues,
          nodeCount: flow.nodes.length,
          edgeCount: flow.edges.length,
          config
        }
      }));
      
      if (success) {
        setSuccess(`Flow "${config.name}" passed all validation checks!`);
      } else {
        setError(`Flow "${config.name}" has ${validationIssues.length} validation issues.`);
      }
    } catch (err) {
      setError(`Error testing flow: ${err.message}`);
      
      // Store failed test
      setTestResults(prev => ({
        ...prev,
        [config.id]: {
          success: false,
          timestamp: new Date().toISOString(),
          validationIssues: [{ message: err.message, severity: 'error' }],
          config
        }
      }));
    } finally {
      setIsRunning(false);
    }
  }, [generateFlowData]);
  
  // Run all flow tests
  const runAllFlowTests = useCallback(async () => {
  // Added display name
  runAllFlowTests.displayName = 'runAllFlowTests';

    setIsRunning(true);
    setError(null);
    
    try {
      for (const config of flowConfigurations) {
        await runFlowTest(config);
        // Short pause between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Check overall success
      const allPassed = Object.values(testResults).every(result => result.success);
      if (allPassed) {
        setSuccess('All flow configurations passed validation!');
      } else {
        const failCount = Object.values(testResults).filter(result => !result.success).length;
        setError(`${failCount} flow configurations failed validation.`);
      }
    } catch (err) {
      setError(`Error running tests: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [flowConfigurations, runFlowTest, testResults]);
  
  // Simple flow validation logic
  const validateFlow = (nodes, edges) => {
  // Added display name
  validateFlow.displayName = 'validateFlow';

  // Added display name
  validateFlow.displayName = 'validateFlow';

  // Added display name
  validateFlow.displayName = 'validateFlow';

  // Added display name
  validateFlow.displayName = 'validateFlow';

  // Added display name
  validateFlow.displayName = 'validateFlow';


    const issues = [];
    
    // Check for disconnected nodes
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id)) {
        issues.push({
          nodeId: node.id,
          message: `Node "${node.data.label}" is disconnected`,
          severity: 'warning'
        });
      }
    });
    
    // Check for source nodes with incoming connections
    nodes.forEach(node => {
      if (node.type === 'sourceNode' || node.type === 'triggerNode') {
        const hasIncomingEdges = edges.some(edge => edge.target === node.id);
        if (hasIncomingEdges) {
          issues.push({
            nodeId: node.id,
            message: `Source/Trigger node "${node.data.label}" shouldn't have incoming connections`,
            severity: 'error'
          });
        }
      }
    });
    
    // Check for destination nodes with outgoing connections
    nodes.forEach(node => {
      if (node.type === 'destinationNode') {
        const hasOutgoingEdges = edges.some(edge => edge.source === node.id);
        if (hasOutgoingEdges) {
          issues.push({
            nodeId: node.id,
            message: `Destination node "${node.data.label}" shouldn't have outgoing connections`,
            severity: 'error'
          });
        }
      }
    });
    
    // Check for router nodes with less than 2 outputs
    nodes.forEach(node => {
      if (node.type === 'routerNode') {
        const outgoingEdges = edges.filter(edge => edge.source === node.id);
        if (outgoingEdges.length < 2) {
          issues.push({
            nodeId: node.id,
            message: `Router node "${node.data.label}" should have at least 2 outputs`,
            severity: 'error'
          });
        }
      }
    });
    
    // Check for cycles in the flow
    const hasCycle = detectCycles(nodes, edges);
    if (hasCycle) {
      issues.push({
        message: 'Flow contains cycles, which can cause infinite loops',
        severity: 'error'
      });
    }
    
    return issues;
  };
  
  // Detect cycles in the flow
  const detectCycles = (nodes, edges) => {
  // Added display name
  detectCycles.displayName = 'detectCycles';

  // Added display name
  detectCycles.displayName = 'detectCycles';

  // Added display name
  detectCycles.displayName = 'detectCycles';

  // Added display name
  detectCycles.displayName = 'detectCycles';

  // Added display name
  detectCycles.displayName = 'detectCycles';


    const graph = {};
    
    // Build adjacency list
    nodes.forEach(node => {
      graph[node.id] = [];
    });
    
    edges.forEach(edge => {
      if (graph[edge.source]) {
        graph[edge.source].push(edge.target);
      }
    });
    
    // DFS to detect cycles
    const visited = {};
    const recStack = {};
    
    const isCyclicUtil = (nodeId) => {
  // Added display name
  isCyclicUtil.displayName = 'isCyclicUtil';

  // Added display name
  isCyclicUtil.displayName = 'isCyclicUtil';

  // Added display name
  isCyclicUtil.displayName = 'isCyclicUtil';

  // Added display name
  isCyclicUtil.displayName = 'isCyclicUtil';

  // Added display name
  isCyclicUtil.displayName = 'isCyclicUtil';


      if (!visited[nodeId]) {
        visited[nodeId] = true;
        recStack[nodeId] = true;
        
        for (const neighbor of graph[nodeId]) {
          if (!visited[neighbor] && isCyclicUtil(neighbor)) {
            return true;
          } else if (recStack[neighbor]) {
            return true;
          }
        }
      }
      
      recStack[nodeId] = false;
      return false;
    };
    
    // Check each node
    for (const nodeId in graph) {
      if (isCyclicUtil(nodeId)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Export test results
  const exportResults = useCallback(() => {
  // Added display name
  exportResults.displayName = 'exportResults';

    const results = {
      timestamp: new Date().toISOString(),
      results: testResults,
      summary: {
        total: Object.keys(testResults).length,
        passed: Object.values(testResults).filter(r => r.success).length,
        failed: Object.values(testResults).filter(r => !r.success).length
      }
    };
    
    // Convert to JSON and create download
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `complex-flow-tests-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [testResults]);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h5&quot; component="h1" gutterBottom>
          Complex Flow Validation
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1&quot; gutterBottom>
            This tool tests complex flows with multiple branches to ensure correct routing and data flow.
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained&quot;
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={runAllFlowTests}
              disabled={isRunning}
            >
              Test All Flow Configurations
            </Button>
            
            <Button
              variant="outlined&quot;
              startIcon={<SaveIcon />}
              onClick={exportResults}
              disabled={Object.keys(testResults).length === 0 || isRunning}
            >
              Export Results
            </Button>
          </Stack>
          
          {/* Test summary */}
          {Object.keys(testResults).length > 0 && (
            <Box sx={{ my: 2 }}>
              <Typography variant="h6" gutterBottom>Test Results</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h4&quot;>
                      {Object.values(testResults).filter(r => r.success).length}
                    </Typography>
                    <Typography variant="body2">PASSED</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h4&quot;>
                      {Object.values(testResults).filter(r => !r.success).length}
                    </Typography>
                    <Typography variant="body2">FAILED</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h4&quot;>{Object.keys(testResults).length}</Typography>
                    <Typography variant="body2">TOTAL</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Flow configurations */}
        <Box>
          <Typography variant="h6&quot; gutterBottom>
            Flow Configurations
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {flowConfigurations.map((config) => {
              const result = testResults[config.id];
              
              return (
                <Grid item xs={12} sm={6} md={4} key={config.id}>
                  <Card sx={{ height: "100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccountTreeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6&quot; component="h2">
                          {config.name}
                        </Typography>
                        {result && (
                          <Box sx={{ ml: 'auto' }}>
                            {result.success ? (
                              <VerifiedIcon color="success&quot; />
                            ) : (
                              <ErrorIcon color="error" />
                            )}
                          </Box>
                        )}
                      </Box>
                      
                      <Typography variant="body2&quot; color="text.secondary" sx={{ mb: 1 }}>
                        {config.description}
                      </Typography>
                      
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          size="small&quot;
                          label={`Complexity: ${config.complexity}`}
                          color="primary"
                          variant="outlined&quot;
                          sx={{ mr: 0.5 }}
                        />
                        <Chip
                          size="small" 
                          label={`Nodes: ~${config.nodeCount}`}
                          color="secondary&quot;
                          variant="outlined"
                        />
                      </Box>
                      
                      {result && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption&quot; display="block">
                            Tested: {new Date(result.timestamp).toLocaleString()}
                          </Typography>
                          
                          {!result.success && result.validationIssues && result.validationIssues.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption&quot; color="error.main">
                                {result.validationIssues.length} Issue(s) Found
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small&quot; 
                        onClick={() => runFlowTest(config)}
                        disabled={isRunning}
                        startIcon={<PlayArrowIcon />}
                      >
                        Test Flow
                      </Button>
                      <Button 
                        size="small"
                        onClick={() => {
                          const flow = generateFlowData(config);
                          setFlowData(flow);
                          setCurrentFlowConfig(config);
                        }}
                        disabled={isRunning}
                        startIcon={<SchemaIcon />}
                      >
                        View Flow
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Paper>
      
      {/* Flow canvas */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6&quot;>
            {currentFlowConfig ? `Flow: ${currentFlowConfig.name}` : "Flow Preview'}
          </Typography>
          
          {currentFlowConfig && testResults[currentFlowConfig.id] && (
            <Chip
              icon={testResults[currentFlowConfig.id].success ? <CheckCircleIcon /> : <ErrorIcon />}
              label={testResults[currentFlowConfig.id].success ? 'Valid' : 'Invalid'}
              color={testResults[currentFlowConfig.id].success ? 'success' : 'error'}
            />
          )}
        </Box>
        
        <Box sx={{ height: '500px', width: '100%', border: '1px solid #ddd' }}>
          {isRunning && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10
            }}>
              <CircularProgress />
            </Box>
          )}
          
          <ReactFlowProvider>
            <IntegrationFlowCanvas
              initialNodes={flowData.nodes}
              initialEdges={flowData.edges}
              onSave={() => {}}
              onRun={() => {}}
              readOnly={true}
              userPreferences={{ enableOptimization: true }}
            />
          </ReactFlowProvider>
        </Box>
        
        {/* Validation issues */}
        {currentFlowConfig && testResults[currentFlowConfig.id] && 
         testResults[currentFlowConfig.id].validationIssues && 
         testResults[currentFlowConfig.id].validationIssues.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1&quot; gutterBottom>
              Validation Issues
            </Typography>
            
            {testResults[currentFlowConfig.id].validationIssues.map((issue, index) => (
              <Alert 
                key={index} 
                severity={issue.severity || "error'}
                sx={{ mb: 1 }}
              >
                {issue.message}
                {issue.nodeId && (
                  <Typography variant="caption&quot; display="block">
                    Node ID: {issue.nodeId}
                  </Typography>
                )}
              </Alert>
            ))}
          </Box>
        )}
      </Paper>
      
      {/* Notifications */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError(null)} severity="error&quot;>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ComplexFlowValidator;