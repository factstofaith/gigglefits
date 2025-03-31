import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
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
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  SkipNext as StepIcon,
  BugReport as DebugIcon,
  Code as CodeIcon,
  DataObject as DataIcon,
  Memory as MemoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FilterList as FilterIcon,
  FiberManualRecord as BreakpointIcon
} from '@mui/icons-material';
;
import ReactJson from '@utils/reactJsonAdapter';
import { Alert, Backdrop, Badge, Box, Button, Card, CardContent, CardHeader, Chip, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControlLabel, Grid, IconButton, LinearProgress, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, MenuItem, Paper, Select, Stack, Step, StepContent, StepLabel, Stepper, Switch, Tab, Tabs, TextField, Tooltip, Typography, alpha, styled, useTheme } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
// Styled components
const DebugContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: alpha(theme.palette.background.default, 0.98),
  border: `1px solid ${theme.palette.divider}`,
  zIndex: 100
}));

const DebugHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const DebugToolbar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.background.default, 0.6),
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1)
}));

const DebugContent = styled(Box)({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column'
});

const DebugNodeContainer = styled(Paper)(({ theme, active, success, error, waiting }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1, 2),
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${
    active ? theme.palette.primary.main : 
    success ? theme.palette.success.main : 
    error ? theme.palette.error.main : 
    waiting ? theme.palette.warning.main : 
    theme.palette.divider
  }`,
  backgroundColor: alpha(
    active ? theme.palette.primary.main : 
    success ? theme.palette.success.main : 
    error ? theme.palette.error.main : 
    waiting ? theme.palette.warning.main : 
    theme.palette.background.paper, 
    active || success || error || waiting ? 0.1 : 1
  )
}));

const DebugDetailPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  boxShadow: `0px -1px 5px ${alpha(theme.palette.common.black, 0.05)}`
}));

const StyledChip = styled(Chip)(({ theme, chipcolor }) => ({
  backgroundColor: chipcolor ? alpha(theme.palette[chipcolor].main, 0.1) : undefined,
  color: chipcolor ? theme.palette[chipcolor].main : undefined,
  borderColor: chipcolor ? theme.palette[chipcolor].main : undefined
}));

const DataViewer = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflow: 'auto',
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  borderRadius: theme.shape.borderRadius,
  fontFamily: 'monospace',
  fontSize: '0.8rem'
}));

const BreakpointMarker = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: alpha(theme.palette.error.main, 0.05),
  borderLeft: `3px solid ${theme.palette.error.main}`,
  zIndex: -1
}));

const ExecutionTimeline = styled(Stepper)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  '.MuiStepConnector-line': {
    borderColor: theme.palette.divider
  }
}));

const LogEntry = styled(ListItem)(({ theme, severity }) => ({
  borderLeft: `3px solid ${
    severity === 'error' ? theme.palette.error.main :
    severity === 'warning' ? theme.palette.warning.main :
    severity === 'success' ? theme.palette.success.main :
    theme.palette.info.main
  }`,
  backgroundColor: alpha(
    severity === 'error' ? theme.palette.error.main :
    severity === 'warning' ? theme.palette.warning.main :
    severity === 'success' ? theme.palette.success.main :
    theme.palette.info.main,
    0.05
  ),
  '&:hover': {
    backgroundColor: alpha(
      severity === 'error' ? theme.palette.error.main :
      severity === 'warning' ? theme.palette.warning.main :
      severity === 'success' ? theme.palette.success.main :
      theme.palette.info.main,
      0.1
    )
  }
}));

/**
 * Debug Mode Panel Component
 * Provides step-by-step debugging capabilities for integration flows
 */
const DebugModePanel = ({
  flowData,
  onNodeSelected,
  onDebugExit,
  onStepChange,
  height,
  width,
  position = 'right'
}) => {
  // Added display name
  DebugModePanel.displayName = 'DebugModePanel';

  // Added display name
  DebugModePanel.displayName = 'DebugModePanel';

  // Added display name
  DebugModePanel.displayName = 'DebugModePanel';

  // Added display name
  DebugModePanel.displayName = 'DebugModePanel';

  // Added display name
  DebugModePanel.displayName = 'DebugModePanel';


  const theme = useTheme();
  
  // Ref for auto-scrolling
  const logContainerRef = useRef(null);
  
  // Debug state
  const [debugActive, setDebugActive] = useState(false);
  const [debugMode, setDebugMode] = useState('step'); // step, run, breakpoint
  const [debugSpeed, setDebugSpeed] = useState(1); // 0.5, 1, 2, 5
  const [executionStep, setExecutionStep] = useState(0);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [nodeStates, setNodeStates] = useState({});
  const [debugLogs, setDebugLogs] = useState([]);
  const [breakpoints, setBreakpoints] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [executionData, setExecutionData] = useState({});
  const [executionPath, setExecutionPath] = useState([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [debugSettings, setDebugSettings] = useState({
    showNodeData: true,
    showInputOutputData: true,
    showExecutionTime: true,
    verboseLogging: true,
    highlightPath: true
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsEdited, setSettingsEdited] = useState({...debugSettings});
  
  // Get ordered nodes (topologically sorted for execution)
  const orderedNodes = getOrderedNodesForExecution(flowData);
  
  // Number of total steps for full execution
  const totalSteps = orderedNodes.length;
  
  // Initialize debug state when opening debug mode
  useEffect(() => {
    if (!flowData) return;
    
    // Reset debug state
    setDebugActive(false);
    setExecutionStep(0);
    setCurrentNodeId(null);
    setNodeStates({});
    setDebugLogs([]);
    setExecutionPath([]);
    setExecutionTime(0);
    
    // Generate initial node states
    const initialNodeStates = {};
    flowData.nodes.forEach(node => {
      initialNodeStates[node.id] = {
        status: 'idle', // idle, waiting, active, success, error
        data: null,
        inputData: {},
        outputData: {},
        executionTime: 0,
        error: null
      };
    });
    
    setNodeStates(initialNodeStates);
    addLog('info', 'Debug mode initialized and ready');
  }, [flowData]);
  
  // Start debug execution
  const startDebugExecution = useCallback(() => {
  // Added display name
  startDebugExecution.displayName = 'startDebugExecution';

    if (!flowData || debugActive) return;
    
    setDebugActive(true);
    setExecutionStep(0);
    
    // Reset node states
    const initialNodeStates = {};
    flowData.nodes.forEach(node => {
      initialNodeStates[node.id] = {
        status: 'idle',
        data: null,
        inputData: {},
        outputData: {},
        executionTime: 0,
        error: null
      };
    });
    
    setNodeStates(initialNodeStates);
    setExecutionPath([]);
    setExecutionTime(0);
    setExecutionData({});
    
    // If we're in run mode, start continuous execution
    if (debugMode === 'run') {
      runContinuousExecution(0, initialNodeStates);
    } else {
      // Otherwise, setup for the first step
      prepareNodeForExecution(orderedNodes[0], initialNodeStates);
    }
    
    addLog('info', 'Debug execution started');
  }, [flowData, debugActive, debugMode, orderedNodes]);
  
  // Stop debug execution
  const stopDebugExecution = useCallback(() => {
  // Added display name
  stopDebugExecution.displayName = 'stopDebugExecution';

    if (!debugActive) return;
    
    setDebugActive(false);
    addLog('info', 'Debug execution stopped');
  }, [debugActive]);
  
  // Step to next node execution
  const stepExecution = useCallback(() => {
  // Added display name
  stepExecution.displayName = 'stepExecution';

    if (!debugActive || executionStep >= totalSteps - 1) return;
    
    const nextStep = executionStep + 1;
    const nextNode = orderedNodes[nextStep];
    
    // Execute current node and prepare next node
    executeNode(currentNodeId || orderedNodes[executionStep].id).then(() => {
      prepareNodeForExecution(nextNode);
      setExecutionStep(nextStep);
      
      if (onStepChange) {
        onStepChange({
          step: nextStep,
          totalSteps,
          nodeId: nextNode.id,
          nodeName: nextNode.data?.label || `Node ${nextStep}`
        });
      }
    });
  }, [debugActive, executionStep, totalSteps, orderedNodes, currentNodeId, onStepChange]);
  
  // Pause execution
  const pauseExecution = useCallback(() => {
  // Added display name
  pauseExecution.displayName = 'pauseExecution';

    if (!debugActive || debugMode !== 'run') return;
    
    setDebugMode('step');
    addLog('info', 'Execution paused');
  }, [debugActive, debugMode]);
  
  // Run continuous execution
  const runContinuousExecution = useCallback((startStep = executionStep, startNodeStates = nodeStates) => {
    if (!flowData || !debugActive) return;
    
    // Start from current step
    let currentStep = startStep;
    let currentStates = {...startNodeStates};
    let shouldContinue = true;
    
    const runNextStep = () => {
  // Added display name
  runNextStep.displayName = 'runNextStep';

  // Added display name
  runNextStep.displayName = 'runNextStep';

  // Added display name
  runNextStep.displayName = 'runNextStep';

  // Added display name
  runNextStep.displayName = 'runNextStep';

  // Added display name
  runNextStep.displayName = 'runNextStep';


      if (!shouldContinue || currentStep >= totalSteps) {
        if (currentStep >= totalSteps) {
          addLog('success', 'Flow execution completed successfully');
        }
        return;
      }
      
      const node = orderedNodes[currentStep];
      
      // Check if we need to stop at this node (breakpoint)
      if (debugMode === 'breakpoint' && breakpoints.includes(node.id)) {
        setDebugMode('step');
        setExecutionStep(currentStep);
        setCurrentNodeId(node.id);
        
        // Update node state to waiting
        const newNodeStates = {...currentStates};
        newNodeStates[node.id] = {
          ...newNodeStates[node.id],
          status: 'waiting'
        };
        setNodeStates(newNodeStates);
        
        addLog('warning', `Breakpoint hit at node: ${node.data?.label || node.id}`);
        return;
      }
      
      // Simulate node execution
      currentStates[node.id] = {
        ...currentStates[node.id],
        status: 'active'
      };
      setNodeStates({...currentStates});
      setCurrentNodeId(node.id);
      setExecutionStep(currentStep);
      
      // Add to execution path
      const newPath = [...executionPath, node.id];
      setExecutionPath(newPath);
      
      // Notify of step change
      if (onStepChange) {
        onStepChange({
          step: currentStep,
          totalSteps,
          nodeId: node.id,
          nodeName: node.data?.label || `Node ${currentStep}`
        });
      }
      
      // Simulate execution time and result
      setTimeout(() => {
        const success = Math.random() > 0.1; // 10% chance of error for simulation
        
        // Generate mock execution data
        const executionResult = {
          data: generateMockResultData(node),
          executionTime: Math.floor(Math.random() * 200) + 50 // 50-250ms
        };
        
        // Update node state
        currentStates[node.id] = {
          ...currentStates[node.id],
          status: success ? 'success' : 'error',
          outputData: success ? executionResult.data : null,
          executionTime: executionResult.executionTime,
          error: success ? null : {
            message: 'Execution error in node',
            code: 'NODE_EXECUTION_ERROR',
            details: 'Mock error for debugging purposes'
          }
        };
        
        // Update execution data
        setExecutionData(prev => ({
          ...prev,
          [node.id]: executionResult
        }));
        
        // Update total execution time
        setExecutionTime(prev => prev + executionResult.executionTime);
        
        // Update all states
        setNodeStates({...currentStates});
        
        // Add log
        addLog(
          success ? 'success' : 'error',
          `Node ${node.data?.label || node.id} execution ${success ? 'completed' : 'failed'} (${executionResult.executionTime}ms)`
        );
        
        // Continue to next step if in run mode and successful
        if (success && shouldContinue) {
          currentStep++;
          
          // Adjust speed based on debug speed setting
          const delay = Math.floor(500 / debugSpeed);
          
          setTimeout(() => {
            runNextStep();
          }, delay);
        } else if (!success) {
          // Stop on error
          setDebugMode('step');
          addLog('error', 'Execution stopped due to error');
        }
      }, Math.floor(300 / debugSpeed)); // Simulate execution time, adjusted by speed
    };
    
    // Start the process
    runNextStep();
    
    // Return a function to stop continuous execution
    return () => {
      shouldContinue = false;
    };
  }, [flowData, debugActive, executionStep, nodeStates, totalSteps, orderedNodes, debugMode, breakpoints, executionPath, onStepChange, debugSpeed]);
  
  // Prepare a node for execution
  const prepareNodeForExecution = useCallback((node, currentNodeStates = nodeStates) => {
    if (!node) return;
    
    // Update node state to waiting
    const newNodeStates = {...currentNodeStates};
    newNodeStates[node.id] = {
      ...newNodeStates[node.id],
      status: 'waiting'
    };
    
    setNodeStates(newNodeStates);
    setCurrentNodeId(node.id);
    
    addLog('info', `Ready to execute node: ${node.data?.label || node.id}`);
  }, [nodeStates]);
  
  // Execute a node
  const executeNode = useCallback(async (nodeId) => {
  // Added display name
  executeNode.displayName = 'executeNode';

    if (!nodeId) return;
    
    // Find the node
    const node = flowData.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Update node state to active
    const newNodeStates = {...nodeStates};
    newNodeStates[nodeId] = {
      ...newNodeStates[nodeId],
      status: 'active'
    };
    
    setNodeStates(newNodeStates);
    
    // Add to execution path
    const newPath = [...executionPath, nodeId];
    setExecutionPath(newPath);
    
    // Simulate execution time and data processing
    return new Promise(resolve => {
      // Add delay to simulate processing
      setTimeout(() => {
        // Generate random result (success or error)
        const success = Math.random() > 0.1; // 10% chance of error for simulation
        
        // Generate mock execution data
        const executionResult = {
          data: generateMockResultData(node),
          executionTime: Math.floor(Math.random() * 200) + 50 // 50-250ms
        };
        
        // Update node state with results
        newNodeStates[nodeId] = {
          ...newNodeStates[nodeId],
          status: success ? 'success' : 'error',
          outputData: success ? executionResult.data : null,
          executionTime: executionResult.executionTime,
          error: success ? null : {
            message: 'Execution error in node',
            code: 'NODE_EXECUTION_ERROR',
            details: 'Mock error for debugging purposes'
          }
        };
        
        // Update execution data
        setExecutionData(prev => ({
          ...prev,
          [nodeId]: executionResult
        }));
        
        // Update total execution time
        setExecutionTime(prev => prev + executionResult.executionTime);
        
        // Update all states
        setNodeStates(newNodeStates);
        
        // Add log
        addLog(
          success ? 'success' : 'error',
          `Node ${node.data?.label || node.id} execution ${success ? 'completed' : 'failed'} (${executionResult.executionTime}ms)`
        );
        
        // If error and in run mode, stop execution
        if (!success && debugMode === 'run') {
          setDebugMode('step');
          addLog('error', 'Execution stopped due to error');
        }
        
        // Complete execution
        resolve(success);
      }, Math.floor(500 / debugSpeed)); // Simulate execution time, adjusted by speed
    });
  }, [nodeStates, executionPath, debugMode, debugSpeed, flowData]);
  
  // Toggle breakpoint for a node
  const toggleBreakpoint = useCallback((nodeId) => {
  // Added display name
  toggleBreakpoint.displayName = 'toggleBreakpoint';

    setBreakpoints(prev => {
      if (prev.includes(nodeId)) {
        // Remove breakpoint
        addLog('info', `Breakpoint removed from node ${nodeId}`);
        return prev.filter(id => id !== nodeId);
      } else {
        // Add breakpoint
        addLog('info', `Breakpoint added to node ${nodeId}`);
        return [...prev, nodeId];
      }
    });
  }, []);
  
  // Add a log entry
  const addLog = useCallback((severity, message) => {
  // Added display name
  addLog.displayName = 'addLog';

    const logEntry = {
      id: Date.now(),
      timestamp: new Date(),
      severity,
      message
    };
    
    setDebugLogs(prev => [logEntry, ...prev]);
    
    // Auto-scroll to the top of the log container
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, []);
  
  // Toggle debug settings
  const handleSettingsChange = (setting, value) => {
  // Added display name
  handleSettingsChange.displayName = 'handleSettingsChange';

  // Added display name
  handleSettingsChange.displayName = 'handleSettingsChange';

  // Added display name
  handleSettingsChange.displayName = 'handleSettingsChange';

  // Added display name
  handleSettingsChange.displayName = 'handleSettingsChange';

  // Added display name
  handleSettingsChange.displayName = 'handleSettingsChange';


    setSettingsEdited(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Save debug settings
  const saveDebugSettings = () => {
  // Added display name
  saveDebugSettings.displayName = 'saveDebugSettings';

  // Added display name
  saveDebugSettings.displayName = 'saveDebugSettings';

  // Added display name
  saveDebugSettings.displayName = 'saveDebugSettings';

  // Added display name
  saveDebugSettings.displayName = 'saveDebugSettings';

  // Added display name
  saveDebugSettings.displayName = 'saveDebugSettings';


    setDebugSettings(settingsEdited);
    setSettingsDialogOpen(false);
    addLog('info', 'Debug settings updated');
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';

  // Added display name
  formatTimestamp.displayName = 'formatTimestamp';


    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  // Get execution percentage
  const getExecutionPercentage = () => {
  // Added display name
  getExecutionPercentage.displayName = 'getExecutionPercentage';

  // Added display name
  getExecutionPercentage.displayName = 'getExecutionPercentage';

  // Added display name
  getExecutionPercentage.displayName = 'getExecutionPercentage';

  // Added display name
  getExecutionPercentage.displayName = 'getExecutionPercentage';

  // Added display name
  getExecutionPercentage.displayName = 'getExecutionPercentage';


    if (totalSteps === 0) return 0;
    return Math.round((executionStep / totalSteps) * 100);
  };
  
  // Handle node click
  const handleNodeClick = (node) => {
  // Added display name
  handleNodeClick.displayName = 'handleNodeClick';

  // Added display name
  handleNodeClick.displayName = 'handleNodeClick';

  // Added display name
  handleNodeClick.displayName = 'handleNodeClick';

  // Added display name
  handleNodeClick.displayName = 'handleNodeClick';

  // Added display name
  handleNodeClick.displayName = 'handleNodeClick';


    setSelectedNode(node);
    
    if (onNodeSelected) {
      onNodeSelected(node.id);
    }
  };
  
  // Reset debug session
  const resetDebugSession = () => {
  // Added display name
  resetDebugSession.displayName = 'resetDebugSession';

  // Added display name
  resetDebugSession.displayName = 'resetDebugSession';

  // Added display name
  resetDebugSession.displayName = 'resetDebugSession';

  // Added display name
  resetDebugSession.displayName = 'resetDebugSession';

  // Added display name
  resetDebugSession.displayName = 'resetDebugSession';


    setDebugActive(false);
    setExecutionStep(0);
    setCurrentNodeId(null);
    setExecutionPath([]);
    setExecutionTime(0);
    
    // Reset node states
    const initialNodeStates = {};
    flowData.nodes.forEach(node => {
      initialNodeStates[node.id] = {
        status: 'idle',
        data: null,
        inputData: {},
        outputData: {},
        executionTime: 0,
        error: null
      };
    });
    
    setNodeStates(initialNodeStates);
    addLog('info', 'Debug session reset');
  };
  
  return (
    <DebugContainer style={{ height, width }}>
      <DebugHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DebugIcon sx={{ mr: 1 }} />
          <Typography variant="h6&quot;>Debug Mode</Typography>
          {debugActive && (
            <Chip 
              label={`Step ${executionStep + 1}/${totalSteps}`} 
              size="small" 
              color="primary&quot;
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        <Box>
          <Tooltip title="Debug Settings">
            <IconButton onClick={() => setSettingsDialogOpen(true)} size="small&quot;>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Exit Debug Mode&quot;>
            <IconButton
              onClick={onDebugExit}
              size="small"
              color="default&quot;
              sx={{ ml: 1 }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </DebugHeader>
      
      <DebugToolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Play/Pause/Stop controls */}
          {!debugActive ? (
            <Tooltip title="Start Debug Execution&quot;>
              <Button
                variant="contained"
                color="primary&quot;
                size="small"
                startIcon={<PlayIcon />}
                onClick={startDebugExecution}
              >
                Start
              </Button>
            </Tooltip>
          ) : debugMode === 'run' ? (
            <Tooltip title="Pause Execution&quot;>
              <Button
                variant="contained"
                color="warning&quot;
                size="small"
                startIcon={<PauseIcon />}
                onClick={pauseExecution}
              >
                Pause
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Step Forward&quot;>
              <Button
                variant="contained"
                color="primary&quot;
                size="small"
                startIcon={<StepIcon />}
                onClick={stepExecution}
                disabled={executionStep >= totalSteps - 1}
              >
                Step
              </Button>
            </Tooltip>
          )}
          
          {debugActive && (
            <Tooltip title="Stop Execution&quot;>
              <Button
                variant="outlined"
                color="error&quot;
                size="small"
                startIcon={<StopIcon />}
                onClick={stopDebugExecution}
                sx={{ ml: 1 }}
              >
                Stop
              </Button>
            </Tooltip>
          )}
        </Box>
        
        <Divider orientation="vertical&quot; flexItem sx={{ mx: 1 }} />
        
        {/* Debug mode selection */}
        <Box sx={{ display: "flex', alignItems: 'center' }}>
          <Select
            value={debugMode}
            onChange={(e) => setDebugMode(e.target.value)}
            size="small&quot;
            sx={{ minWidth: 120 }}
            disabled={debugActive && debugMode === "run'}
          >
            <MenuItem value="step&quot;>Step by Step</MenuItem>
            <MenuItem value="run">Continuous Run</MenuItem>
            <MenuItem value="breakpoint&quot;>Run to Breakpoint</MenuItem>
          </Select>
          
          {debugMode === "run' && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <Typography variant="body2&quot; sx={{ mr: 1 }}>Speed:</Typography>
              <Select
                value={debugSpeed}
                onChange={(e) => setDebugSpeed(e.target.value)}
                size="small"
                sx={{ minWidth: 80 }}
                disabled={debugActive && debugMode === 'run'}
              >
                <MenuItem value={0.5}>0.5x</MenuItem>
                <MenuItem value={1}>1x</MenuItem>
                <MenuItem value={2}>2x</MenuItem>
                <MenuItem value={5}>5x</MenuItem>
              </Select>
            </Box>
          )}
        </Box>
        
        <Box sx={{ flex: 1 }} />
        
        {/* Status indicators */}
        {debugActive && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${getExecutionPercentage()}%`}
              size="small&quot;
              color="primary"
              variant="outlined&quot;
            />
            
            <Chip
              label={`${executionTime}ms`}
              size="small"
              icon={<TimelineIcon fontSize="small&quot; />}
              variant="outlined"
            />
            
            <Tooltip title="Reset Debug Session&quot;>
              <IconButton size="small" onClick={resetDebugSession}>
                <RefreshIcon fontSize="small&quot; />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </DebugToolbar>
      
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        indicatorColor="primary"
        textColor="primary&quot;
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Execution&quot; />
        <Tab 
          label="Logs" 
          icon={
            <Badge 
              badgeContent={debugLogs.filter(log => log.severity === 'error').length} 
              color="error&quot;
              max={99}
              showZero={false}
            >
              <span />
            </Badge>
          } 
          iconPosition="end"
        />
        <Tab label="Timeline&quot; />
      </Tabs>
      
      <DebugContent>
        {/* Execution Tab */}
        {selectedTab === 0 && (
          <Box sx={{ p: 0 }}>
            <List disablePadding>
              {orderedNodes.map((node, index) => {
                const nodeState = nodeStates[node.id] || { status: "idle' };
                const isActive = node.id === currentNodeId;
                const hasBreakpoint = breakpoints.includes(node.id);
                const isInPath = executionPath.includes(node.id);
                
                return (
                  <ListItem
                    key={node.id}
                    divider
                    button
                    onClick={() => handleNodeClick(node)}
                    selected={selectedNode?.id === node.id}
                    sx={{
                      backgroundColor: isInPath && debugSettings.highlightPath ? 
                        alpha(theme.palette.primary.main, 0.05) : undefined
                    }}
                  >
                    {hasBreakpoint && <BreakpointMarker />}
                    
                    <ListItemIcon>
                      {nodeState.status === 'active' ? (
                        <CircularProgress size={24} color="primary&quot; />
                      ) : nodeState.status === "success' ? (
                        <SuccessIcon color="success&quot; />
                      ) : nodeState.status === "error' ? (
                        <ErrorIcon color="error&quot; />
                      ) : nodeState.status === "waiting' ? (
                        <WarningIcon color="warning&quot; />
                      ) : (
                        <span style={{ width: 24, display: "inline-block', textAlign: 'center' }}>
                          {index + 1}
                        </span>
                      )}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={node.data?.label || `Node ${index + 1}`}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption&quot; component="span">
                            {node.type}
                          </Typography>
                          
                          {nodeState.executionTime > 0 && debugSettings.showExecutionTime && (
                            <Typography variant="caption&quot; component="span">
                              {nodeState.executionTime}ms
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Stack direction="row&quot; spacing={1}>
                        {/* Status indicators */}
                        {nodeState.status === "idle' && (
                          <StyledChip
                            label="Idle&quot;
                            size="small"
                            variant="outlined&quot;
                          />
                        )}
                        
                        {nodeState.status === "waiting' && (
                          <StyledChip
                            label="Waiting&quot;
                            size="small"
                            chipcolor="warning&quot;
                            variant="outlined"
                          />
                        )}
                        
                        {nodeState.status === 'active' && (
                          <StyledChip
                            label="Running&quot;
                            size="small"
                            chipcolor="primary&quot;
                            variant="outlined"
                          />
                        )}
                        
                        {nodeState.status === 'success' && (
                          <StyledChip
                            label="Success&quot;
                            size="small"
                            chipcolor="success&quot;
                            variant="outlined"
                          />
                        )}
                        
                        {nodeState.status === 'error' && (
                          <StyledChip
                            label="Error&quot;
                            size="small"
                            chipcolor="error&quot;
                            variant="outlined"
                          />
                        )}
                        
                        {/* Breakpoint toggle */}
                        <IconButton
                          edge="end&quot;
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBreakpoint(node.id);
                          }}
                          color={hasBreakpoint ? "error" : "default"}
                        >
                          <BreakpointIcon fontSize="small&quot; />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
        
        {/* Logs Tab */}
        {selectedTab === 1 && (
          <Box sx={{ height: "100%', overflow: 'auto' }} ref={logContainerRef}>
            {debugLogs.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <InfoIcon color="disabled&quot; sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="textSecondary">
                  No debug logs yet. Start debugging to see logs here.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {debugLogs.map(log => (
                  <LogEntry
                    key={log.id}
                    divider
                    severity={log.severity}
                  >
                    <ListItemIcon>
                      {log.severity === 'error' ? (
                        <ErrorIcon color="error&quot; />
                      ) : log.severity === "warning' ? (
                        <WarningIcon color="warning&quot; />
                      ) : log.severity === "success' ? (
                        <SuccessIcon color="success&quot; />
                      ) : (
                        <InfoIcon color="info" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.message}
                      secondary={formatTimestamp(log.timestamp)}
                    />
                  </LogEntry>
                ))}
              </List>
            )}
          </Box>
        )}
        
        {/* Timeline Tab */}
        {selectedTab === 2 && (
          <Box sx={{ p: 2 }}>
            {executionPath.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <TimelineIcon color="disabled&quot; sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="textSecondary">
                  No execution data yet. Start debugging to see the execution timeline.
                </Typography>
              </Box>
            ) : (
              <ExecutionTimeline orientation="vertical&quot;>
                {executionPath.map((nodeId, index) => {
                  const node = flowData.nodes.find(n => n.id === nodeId);
                  const nodeState = nodeStates[nodeId] || { status: "idle' };
                  
                  return (
                    <Step key={index} active={true} completed={nodeState.status === 'success'}>
                      <StepLabel
                        error={nodeState.status === 'error'}
                        icon={
                          nodeState.status === 'active' ? (
                            <CircularProgress size={24} />
                          ) : nodeState.status === 'success' ? (
                            <SuccessIcon />
                          ) : nodeState.status === 'error' ? (
                            <ErrorIcon />
                          ) : (
                            <span>{index + 1}</span>
                          )
                        }
                      >
                        {node?.data?.label || `Node ${index + 1}`}
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2&quot;>
                            {node?.type || "Unknown node type'}
                            {nodeState.executionTime > 0 && (
                              <span> • {nodeState.executionTime}ms</span>
                            )}
                          </Typography>
                          
                          {nodeState.error && (
                            <Alert severity="error&quot; sx={{ mt: 1 }}>
                              {nodeState.error.message}
                            </Alert>
                          )}
                          
                          {debugSettings.showNodeData && executionData[nodeId]?.data && (
                            <Box sx={{ mt: 1 }}>
                              <Accordion>
                                <AccordionSummary expandIcon={<FilterIcon />}>
                                  <Typography variant="body2">View Data</Typography>
                                </AccordionSummary>
                                <AccordionContent>
                                  <DataViewer>
                                    <ReactJson
                                      src={executionData[nodeId].data}
                                      name={null}
                                      theme="rjv-default&quot;
                                      displayDataTypes={false}
                                      collapsed={2}
                                    />
                                  </DataViewer>
                                </AccordionContent>
                              </Accordion>
                            </Box>
                          )}
                        </Box>
                      </StepContent>
                    </Step>
                  );
                })}
              </ExecutionTimeline>
            )}
          </Box>
        )}
      </DebugContent>
      
      {/* Selected Node Detail Panel */}
      {selectedNode && (
        <DebugDetailPanel>
          <Box sx={{ display: "flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6&quot;>{selectedNode.data?.label || "Node Details'}</Typography>
              <Typography variant="body2&quot; color="textSecondary">
                {selectedNode.type} • ID: {selectedNode.id}
              </Typography>
            </Box>
            
            <IconButton size="small&quot; onClick={() => setSelectedNode(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2&quot; gutterBottom>Status</Typography>
              <Box>
                {nodeStates[selectedNode.id]?.status === "idle' && (
                  <Alert severity="info&quot;>Node has not been executed yet</Alert>
                )}
                
                {nodeStates[selectedNode.id]?.status === "waiting' && (
                  <Alert severity="warning&quot;>Node is waiting for execution</Alert>
                )}
                
                {nodeStates[selectedNode.id]?.status === "active' && (
                  <Alert severity="info&quot;>
                    <Box sx={{ display: "flex', alignItems: 'center' }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Node is currently executing
                    </Box>
                  </Alert>
                )}
                
                {nodeStates[selectedNode.id]?.status === 'success' && (
                  <Alert severity="success&quot;>
                    Node executed successfully in {nodeStates[selectedNode.id]?.executionTime}ms
                  </Alert>
                )}
                
                {nodeStates[selectedNode.id]?.status === "error' && (
                  <Alert severity="error&quot;>
                    {nodeStates[selectedNode.id]?.error?.message || "An error occurred during execution'}
                  </Alert>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2&quot; gutterBottom>Debug Actions</Typography>
              <Stack direction="row" spacing={1}>
                {!breakpoints.includes(selectedNode.id) ? (
                  <Button
                    variant="outlined&quot;
                    size="small"
                    startIcon={<BreakpointIcon />}
                    onClick={() => toggleBreakpoint(selectedNode.id)}
                  >
                    Add Breakpoint
                  </Button>
                ) : (
                  <Button
                    variant="outlined&quot;
                    size="small"
                    color="error&quot;
                    startIcon={<BreakpointIcon />}
                    onClick={() => toggleBreakpoint(selectedNode.id)}
                  >
                    Remove Breakpoint
                  </Button>
                )}
                
                {nodeStates[selectedNode.id]?.status !== "active' && (
                  <Button
                    variant="outlined&quot;
                    size="small"
                    startIcon={<PlayIcon />}
                    onClick={() => executeNode(selectedNode.id)}
                    disabled={!debugActive || nodeStates[selectedNode.id]?.status === 'active'}
                  >
                    Execute Node
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
          
          <Typography variant="subtitle2&quot; sx={{ mt: 2, mb: 1 }}>Node Data</Typography>
          
          {debugSettings.showNodeData && executionData[selectedNode.id]?.data ? (
            <DataViewer>
              <ReactJson
                src={executionData[selectedNode.id].data}
                name={null}
                theme="rjv-default"
                displayDataTypes={false}
                collapsed={1}
              />
            </DataViewer>
          ) : (
            <Alert severity="info&quot;>No execution data available for this node yet</Alert>
          )}
        </DebugDetailPanel>
      )}
      
      {/* Debug Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Debug Settings</DialogTitle>
        <DialogContent dividers>
          <List>
            <ListItem>
              <ListItemText
                primary="Show Node Data&quot;
                secondary="Display data processed by each node"
              />
              <Switch
                edge="end&quot;
                checked={settingsEdited.showNodeData}
                onChange={(e) => handleSettingsChange("showNodeData', e.target.checked)}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Show Input/Output Data&quot;
                secondary="Display data flowing between nodes"
              />
              <Switch
                edge="end&quot;
                checked={settingsEdited.showInputOutputData}
                onChange={(e) => handleSettingsChange("showInputOutputData', e.target.checked)}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Show Execution Time&quot;
                secondary="Display processing time for each node"
              />
              <Switch
                edge="end&quot;
                checked={settingsEdited.showExecutionTime}
                onChange={(e) => handleSettingsChange("showExecutionTime', e.target.checked)}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Verbose Logging&quot;
                secondary="Show detailed logs during execution"
              />
              <Switch
                edge="end&quot;
                checked={settingsEdited.verboseLogging}
                onChange={(e) => handleSettingsChange("verboseLogging', e.target.checked)}
              />
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Highlight Execution Path&quot;
                secondary="Highlight nodes that have been executed"
              />
              <Switch
                edge="end&quot;
                checked={settingsEdited.highlightPath}
                onChange={(e) => handleSettingsChange("highlightPath', e.target.checked)}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveDebugSettings} variant="contained&quot; color="primary">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </DebugContainer>
  );
};

// Helper functions
function getOrderedNodesForExecution(flowData) {
  // Added display name
  getOrderedNodesForExecution.displayName = 'getOrderedNodesForExecution';

  if (!flowData || !flowData.nodes || !flowData.edges) {
    return [];
  }
  
  // Simple topological sort
  const nodes = [...flowData.nodes];
  const edges = [...flowData.edges];
  
  // Create a map of node dependencies
  const dependencies = {};
  const nodeMap = {};
  
  // Initialize
  nodes.forEach(node => {
    dependencies[node.id] = [];
    nodeMap[node.id] = node;
  });
  
  // Add dependencies based on edges
  edges.forEach(edge => {
    if (dependencies[edge.target]) {
      dependencies[edge.target].push(edge.source);
    }
  });
  
  // Find nodes with no dependencies
  const result = [];
  const visited = new Set();
  
  // Helper function for DFS
  function visit(nodeId) {
  // Added display name
  visit.displayName = 'visit';

    if (visited.has(nodeId)) return;
    
    // Mark as visited to avoid cycles
    visited.add(nodeId);
    
    // Visit all dependencies first
    dependencies[nodeId].forEach(depId => {
      visit(depId);
    });
    
    // Add this node to result
    if (nodeMap[nodeId]) {
      result.push(nodeMap[nodeId]);
    }
  }
  
  // Start with nodes that have no input edges
  const startNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );
  
  // If no start nodes, just use any node
  if (startNodes.length === 0 && nodes.length > 0) {
    visit(nodes[0].id);
  } else {
    startNodes.forEach(node => visit(node.id));
  }
  
  // Add any remaining nodes (for disconnected graphs)
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      result.push(node);
    }
  });
  
  return result;
}

function generateMockResultData(node) {
  // Added display name
  generateMockResultData.displayName = 'generateMockResultData';

  // Generate mock data based on node type
  switch (node.type) {
    case 'source':
      return {
        rows: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Item ${i + 1}`,
          value: Math.random() * 1000
        })),
        metadata: {
          count: 10,
          format: 'json'
        }
      };
      
    case 'transform':
      return {
        transformedData: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          processed: true,
          result: Math.random() * 100
        })),
        stats: {
          processed: 5,
          filtered: 3,
          errors: 0
        }
      };
      
    case 'destination':
      return {
        status: 'success',
        writtenRecords: 8,
        bytesWritten: 2048,
        location: 's3://bucket/path/to/file.csv'
      };
      
    default:
      return {
        data: `Mock data for node type: ${node.type}`,
        timestamp: new Date().toISOString()
      };
  }
}

// Custom components for cleaner code
const Accordion = ({ children, ...props }) => {
  // Added display name
  Accordion.displayName = 'Accordion';

  // Added display name
  Accordion.displayName = 'Accordion';

  // Added display name
  Accordion.displayName = 'Accordion';

  // Added display name
  Accordion.displayName = 'Accordion';

  // Added display name
  Accordion.displayName = 'Accordion';


  const [expanded, setExpanded] = useState(false);
  
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1, 
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'action.hover' }
        }}
        {...props}
      >
        {React.Children.toArray(children).find(child => child.type.displayName === 'AccordionSummary')}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          {React.Children.toArray(children).find(child => child.type.displayName === 'AccordionContent')}
        </Box>
      </Collapse>
    </Box>
  );
};

const AccordionSummary = (props) => {
  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';

  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';

  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';

  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';

  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';


  return <Box {...props} />;
};
AccordionSummary.displayName = 'AccordionSummary';

const AccordionContent = (props) => {
  // Added display name
  AccordionContent.displayName = 'AccordionContent';

  // Added display name
  AccordionContent.displayName = 'AccordionContent';

  // Added display name
  AccordionContent.displayName = 'AccordionContent';

  // Added display name
  AccordionContent.displayName = 'AccordionContent';

  // Added display name
  AccordionContent.displayName = 'AccordionContent';


  return <Box {...props} />;
};
AccordionContent.displayName = 'AccordionContent';

DebugModePanel.propTypes = {
  flowData: PropTypes.object,
  onNodeSelected: PropTypes.func,
  onDebugExit: PropTypes.func,
  onStepChange: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  position: PropTypes.oneOf(['right', 'left', 'bottom'])
};

export default DebugModePanel;