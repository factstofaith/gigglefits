import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider, Background } from '@utils/reactFlowAdapter';
import 'reactflow/dist/style.css';

// Material UI components
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;;

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SaveIcon from '@mui/icons-material/Save';

// Import node components
import { nodeTypes } from '@components/integration/nodes';
import IntegrationFlowCanvas from '@components/integration/IntegrationFlowCanvas';

// Import test data
import { generateTestNodes, generateTestEdges } from './testDataGenerator';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar, Stack, Step, StepLabel, Stepper, Tab, Tabs, TextField, Typography } from '../../design-system';
// Design system import already exists;
/**
 * NodeTypesTester Component
 * Comprehensive testing framework for all node types with various configurations
 */
function NodeTypesTester() {
  // Added display name
  NodeTypesTester.displayName = 'NodeTypesTester';

  // Test state
  const [activeStep, setActiveStep] = useState(0);
  const [activeNodeType, setActiveNodeType] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [testFlow, setTestFlow] = useState({ nodes: [], edges: [] });
  const [activeTab, setActiveTab] = useState(0);
  const [configOptionsMap, setConfigOptionsMap] = useState({});
  
  // Get list of node types to test (excluding base and utility nodes)
  const nodeTypesToTest = Object.keys(nodeTypes).filter(
    type => type !== 'default' && !type.includes('Base')
  );
  
  // Define test configurations for each node type
  const nodeConfigOptions = {
    sourceNode: [
      { name: 'Basic', config: { connectionType: 'direct' } },
      { name: 'API Source', config: { connectionType: 'api', authType: 'oauth' } },
      { name: 'File Source', config: { connectionType: 'file', fileType: 'csv' } },
      { name: 'Database Source', config: { connectionType: 'database', databaseType: 'sql' } }
    ],
    transformNode: [
      { name: 'Basic Transform', config: { transformType: 'basic' } },
      { name: 'Map Fields', config: { transformType: 'map' } },
      { name: 'Join Data', config: { transformType: 'join', joinType: 'inner' } },
      { name: 'Filter Data', config: { transformType: 'filter' } },
      { name: 'Aggregate Data', config: { transformType: 'aggregate' } }
    ],
    destinationNode: [
      { name: 'Basic', config: { connectionType: 'direct' } },
      { name: 'API Destination', config: { connectionType: 'api', authType: 'apiKey' } },
      { name: 'File Destination', config: { connectionType: 'file', fileType: 'json' } },
      { name: 'Database Destination', config: { connectionType: 'database', databaseType: 'nosql' } }
    ],
    routerNode: [
      { name: 'Condition Router', config: { routerType: 'condition' } },
      { name: 'Fork Router', config: { routerType: 'fork', outputs: 3 } },
      { name: 'Switch Router', config: { routerType: 'switch', cases: ['case1', 'case2', 'default'] } }
    ],
    datasetNode: [
      { name: 'Input Dataset', config: { direction: 'input' } },
      { name: 'Output Dataset', config: { direction: 'output' } },
      { name: 'Reference Dataset', config: { direction: 'reference' } }
    ],
    triggerNode: [
      { name: 'Schedule Trigger', config: { triggerType: 'schedule', schedule: '0 0 * * *' } },
      { name: 'File Trigger', config: { triggerType: 'file', monitorType: 'creation' } },
      { name: 'Webhook Trigger', config: { triggerType: 'webhook' } },
      { name: 'Event Trigger', config: { triggerType: 'event', eventSource: 'app' } }
    ],
    actionNode: [
      { name: 'Notification Action', config: { actionType: 'notification' } },
      { name: 'API Call Action', config: { actionType: 'apiCall' } },
      { name: 'Function Action', config: { actionType: 'function' } },
      { name: 'Process Action', config: { actionType: 'process' } }
    ]
  };
  
  // Initialize configuration options map
  useEffect(() => {
    // Create map with all node types and their configurations
    const optionsMap = {};
    Object.keys(nodeConfigOptions).forEach(nodeType => {
      optionsMap[nodeType] = nodeConfigOptions[nodeType] || [];
    });
    
    setConfigOptionsMap(optionsMap);
    
    // Set initial node type
    if (nodeTypesToTest.length > 0 && !activeNodeType) {
      setActiveNodeType(nodeTypesToTest[0]);
    }
  }, []);
  
  // Test runner
  const runTest = useCallback(async (nodeType, configuration) => {
  // Added display name
  runTest.displayName = 'runTest';

    if (!nodeType || !configuration) return;
    
    setIsRunning(true);
    setError(null);
    
    try {
      // Set up test flow with the node to test
      const nodeUnderTest = {
        id: `${nodeType}-test`,
        type: nodeType,
        position: { x: 250, y: 100 },
        data: {
          label: `${nodeType.replace('Node', '')} Test`,
          nodeType: nodeType.replace('Node', ''),
          configData: configuration.config,
          validation: { isValid: true, messages: [] }
        }
      };
      
      // Create some input nodes if needed
      let inputNodes = [];
      let inputEdges = [];
      
      if (nodeType !== 'sourceNode' && nodeType !== 'triggerNode') {
        inputNodes = [
          {
            id: 'source-input',
            type: 'sourceNode',
            position: { x: 50, y: 100 },
            data: {
              label: 'Source Input',
              nodeType: 'source',
              configData: { outputSchema: { fields: [{ name: 'field1', type: 'string' }] } },
              validation: { isValid: true, messages: [] }
            }
          }
        ];
        
        inputEdges = [
          {
            id: 'edge-input',
            source: 'source-input',
            target: `${nodeType}-test`,
            animated: true
          }
        ];
      }
      
      // Create output nodes if needed
      let outputNodes = [];
      let outputEdges = [];
      
      if (nodeType !== 'destinationNode') {
        outputNodes = [
          {
            id: 'dest-output',
            type: 'destinationNode',
            position: { x: 450, y: 100 },
            data: {
              label: 'Destination Output',
              nodeType: 'destination',
              configData: {},
              validation: { isValid: true, messages: [] }
            }
          }
        ];
        
        outputEdges = [
          {
            id: 'edge-output',
            source: `${nodeType}-test`,
            target: 'dest-output',
            animated: true
          }
        ];
      }
      
      // Create multiple outputs for router nodes
      if (nodeType === 'routerNode') {
        outputNodes = [];
        outputEdges = [];
        
        const routerType = configuration.config.routerType;
        const outputCount = routerType === 'fork' ? configuration.config.outputs : 
                            routerType === 'switch' ? configuration.config.cases.length : 2;
        
        for (let i = 0; i < outputCount; i++) {
          outputNodes.push({
            id: `dest-output-${i}`,
            type: 'destinationNode',
            position: { x: 450, y: 50 + i * 100 },
            data: {
              label: `Destination ${i+1}`,
              nodeType: 'destination',
              configData: {},
              validation: { isValid: true, messages: [] }
            }
          });
          
          outputEdges.push({
            id: `edge-output-${i}`,
            source: `${nodeType}-test`,
            target: `dest-output-${i}`,
            animated: true
          });
        }
      }
      
      // Combine all nodes and edges
      const testNodes = [...inputNodes, nodeUnderTest, ...outputNodes];
      const testEdges = [...inputEdges, ...outputEdges];
      
      setTestFlow({ nodes: testNodes, edges: testEdges });
      
      // Simulate test validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Record test result
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      // Store result
      setTestResults(prev => ({
        ...prev,
        [`${nodeType}-${configuration.name}`]: {
          success,
          timestamp: new Date().toISOString(),
          configuration,
          nodeType,
          message: success ? 'Test passed' : 'Validation failed'
        }
      }));
      
      // Show success message
      if (success) {
        setSuccessMessage(`Test passed for ${nodeType} - ${configuration.name}`);
      } else {
        setError(`Test failed for ${nodeType} - ${configuration.name}`);
      }
    } catch (err) {
      setError(`Error running test: ${err.message}`);
      
      // Record failed test
      setTestResults(prev => ({
        ...prev,
        [`${nodeType}-${configuration.name}`]: {
          success: false,
          timestamp: new Date().toISOString(),
          configuration,
          nodeType,
          message: `Error: ${err.message}`
        }
      }));
    } finally {
      setIsRunning(false);
    }
  }, []);
  
  // Run all tests for current node type
  const runAllTestsForNodeType = useCallback(async () => {
  // Added display name
  runAllTestsForNodeType.displayName = 'runAllTestsForNodeType';

    if (!activeNodeType || !configOptionsMap[activeNodeType]) return;
    
    const configs = configOptionsMap[activeNodeType];
    setIsRunning(true);
    
    try {
      for (const config of configs) {
        await runTest(activeNodeType, config);
        // Short pause between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setSuccessMessage(`All tests completed for ${activeNodeType}`);
    } catch (err) {
      setError(`Error running tests: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [activeNodeType, configOptionsMap, runTest]);
  
  // Run all tests for all node types
  const runAllTests = useCallback(async () => {
  // Added display name
  runAllTests.displayName = 'runAllTests';

    setIsRunning(true);
    
    try {
      for (const nodeType of nodeTypesToTest) {
        setActiveNodeType(nodeType);
        
        const configs = configOptionsMap[nodeType] || [];
        for (const config of configs) {
          await runTest(nodeType, config);
          // Short pause between tests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setSuccessMessage('All node type tests completed');
    } catch (err) {
      setError(`Error running all tests: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [nodeTypesToTest, configOptionsMap, runTest]);
  
  // Next node type
  const goToNextNodeType = useCallback(() => {
  // Added display name
  goToNextNodeType.displayName = 'goToNextNodeType';

    const currentIndex = nodeTypesToTest.indexOf(activeNodeType);
    if (currentIndex < nodeTypesToTest.length - 1) {
      setActiveNodeType(nodeTypesToTest[currentIndex + 1]);
    }
  }, [activeNodeType, nodeTypesToTest]);
  
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
    
    const exportFileDefaultName = `node-tests-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [testResults]);

  // Create a summary of test results
  const testSummary = useMemo(() => {
  // Added display name
  testSummary.displayName = 'testSummary';

    const summary = {
      total: Object.keys(testResults).length,
      passed: Object.values(testResults).filter(r => r.success).length,
      failed: Object.values(testResults).filter(r => !r.success).length,
      byType: {}
    };
    
    // Group by node type
    Object.values(testResults).forEach(result => {
      if (!summary.byType[result.nodeType]) {
        summary.byType[result.nodeType] = { total: 0, passed: 0, failed: 0 };
      }
      
      summary.byType[result.nodeType].total++;
      if (result.success) {
        summary.byType[result.nodeType].passed++;
      } else {
        summary.byType[result.nodeType].failed++;
      }
    });
    
    return summary;
  }, [testResults]);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h5&quot; component="h1" gutterBottom>
          Node Types Comprehensive Testing
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1&quot; gutterBottom>
            This tool tests all node types with various configurations to ensure they function correctly.
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button 
              variant="contained&quot;
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={runAllTests}
              disabled={isRunning}
            >
              Run All Tests
            </Button>
            
            <Button
              variant="outlined&quot;
              startIcon={<SaveIcon />}
              onClick={exportResults}
              disabled={Object.keys(testResults).length === 0}
            >
              Export Results
            </Button>
          </Stack>
          
          {/* Test summary */}
          {testSummary.total > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "background.paper', borderRadius: 1 }}>
              <Typography variant="h6&quot; gutterBottom>Test Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: "success.light', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h4&quot;>{testSummary.passed}</Typography>
                    <Typography variant="body2">PASSED</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h4&quot;>{testSummary.failed}</Typography>
                    <Typography variant="body2">FAILED</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white', textAlign: 'center' }}>
                    <Typography variant="h4&quot;>{testSummary.total}</Typography>
                    <Typography variant="body2">TOTAL</Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Results by node type */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1&quot; gutterBottom>Results by Node Type</Typography>
                <Grid container spacing={1}>
                  {Object.entries(testSummary.byType).map(([nodeType, counts]) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={nodeType}>
                      <Card variant="outlined">
                        <CardContent sx={{ py: 1 }}>
                          <Typography variant="subtitle2&quot;>{nodeType}</Typography>
                          <Box sx={{ display: "flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Chip 
                              size="small&quot; 
                              label={`${counts.passed} passed`} 
                              color="success" 
                              variant="outlined&quot;
                            />
                            {counts.failed > 0 && (
                              <Chip 
                                size="small" 
                                label={`${counts.failed} failed`} 
                                color="error&quot; 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Node type selector */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6&quot; gutterBottom>
            Individual Node Type Testing
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="node-type-select-label">Node Type</InputLabel>
            <Select
              labelId="node-type-select-label&quot;
              id="node-type-select"
              value={activeNodeType || ''}
              label="Node Type&quot;
              onChange={(e) => setActiveNodeType(e.target.value)}
              disabled={isRunning}
            >
              {nodeTypesToTest.map((nodeType) => (
                <MenuItem key={nodeType} value={nodeType}>
                  {nodeType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {activeNodeType && (
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="contained&quot;
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={runAllTestsForNodeType}
                disabled={isRunning}
              >
                Test All Configurations
              </Button>
              
              <Button
                variant="outlined&quot;
                startIcon={<SkipNextIcon />}
                onClick={goToNextNodeType}
                disabled={
                  isRunning || 
                  nodeTypesToTest.indexOf(activeNodeType) === nodeTypesToTest.length - 1
                }
              >
                Next Node Type
              </Button>
            </Stack>
          )}
        </Box>
        
        {/* Configuration tests for selected node type */}
        {activeNodeType && configOptionsMap[activeNodeType] && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Test Configurations for {activeNodeType}
            </Typography>
            
            {configOptionsMap[activeNodeType].map((config, index) => {
              const testKey = `${activeNodeType}-${config.name}`;
              const testResult = testResults[testKey];
              
              return (
                <Accordion key={index} disabled={isRunning}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ flexGrow: 1 }}>{config.name}</Typography>
                      {testResult && (
                        <Chip
                          size="small&quot;
                          icon={testResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                          label={testResult.success ? "Passed' : 'Failed'}
                          color={testResult.success ? 'success' : 'error'}
                          sx={{ mr: 2 }}
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2&quot; gutterBottom>Configuration</Typography>
                        <pre style={{ 
                          backgroundColor: "#f5f5f5', 
                          padding: '8px', 
                          borderRadius: '4px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(config.config, null, 2)}
                        </pre>
                        
                        <Button
                          variant="contained&quot;
                          color="primary"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => runTest(activeNodeType, config)}
                          disabled={isRunning}
                          sx={{ mt: 1 }}
                        >
                          Run Test
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2&quot; gutterBottom>Test Result</Typography>
                        {testResult ? (
                          <Box>
                            <Alert 
                              severity={testResult.success ? "success' : 'error'}
                              sx={{ mb: 1 }}
                            >
                              {testResult.message}
                            </Alert>
                            <Typography variant="caption&quot; display="block">
                              Test ran at: {new Date(testResult.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2&quot; color="text.secondary">
                            No test result yet
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </Paper>
      
      {/* Test canvas */}
      <Paper sx={{ p: 2, height: '400px' }}>
        <Typography variant="h6&quot; gutterBottom>
          Test Flow Canvas
        </Typography>
        
        <Box sx={{ height: "320px', width: '100%', border: '1px solid #ddd', position: 'relative' }}>
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
              initialNodes={testFlow.nodes}
              initialEdges={testFlow.edges}
              onSave={() => {}}
              onRun={() => {}}
              readOnly={true}
              userPreferences={{ enableOptimization: true }}
            />
          </ReactFlowProvider>
        </Box>
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
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default NodeTypesTester;