import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {Typography, Card, MuiBox as MuiBox, Button, Tabs, MuiTab as MuiTab, Grid, Paper, Chip, Slider, FormControlLabel, Switch, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Divider, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MuiLinearProgress as MuiLinearProgress, Tooltip} from '@design-system/legacy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LineChartIcon from '@mui/icons-material/ShowChart';
import CreateIcon from '@mui/icons-material/Create';
import { getRandomInt } from '@utils/helpers';
import { MuiBox, MuiLinearProgress, MuiTab } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
;
;
;

// Test flow sizes for performance testing
const FLOW_SIZES = {
  SMALL: 'small',         // 10-20 nodes
  MEDIUM: 'medium',       // 50-100 nodes
  LARGE: 'large',         // 200-300 nodes
  VERY_LARGE: 'veryLarge' // 500+ nodes
};

// Test flow complexity types
const FLOW_COMPLEXITY = {
  LINEAR: 'linear',         // Simple sequential flow
  BRANCHING: 'branching',   // Flow with branches but no loops
  COMPLEX: 'complex',       // Flow with multiple branches and merges
  CYCLIC: 'cyclic'          // Flow with feedback loops
};

// Test node distribution types
const NODE_DISTRIBUTION = {
  BALANCED: 'balanced',     // Even mix of node types
  SOURCE_HEAVY: 'source',   // More source nodes
  TRANSFORM_HEAVY: 'transform', // More transformation nodes
  DESTINATION_HEAVY: 'destination', // More destination nodes
  ROUTER_HEAVY: 'router'    // More router nodes
};

// Performance test scenarios
const PERFORMANCE_SCENARIOS = [
  {
    id: 'small-linear',
    name: 'Small Linear Flow',
    description: 'Tests performance with a small (10-20 nodes) linear flow',
    size: FLOW_SIZES.SMALL,
    complexity: FLOW_COMPLEXITY.LINEAR,
    nodeDistribution: NODE_DISTRIBUTION.BALANCED,
    implementation: 'testSmallLinearFlow'
  },
  {
    id: 'medium-branch',
    name: 'Medium Branching Flow',
    description: 'Tests performance with a medium-sized (50-100 nodes) flow with multiple branches',
    size: FLOW_SIZES.MEDIUM,
    complexity: FLOW_COMPLEXITY.BRANCHING,
    nodeDistribution: NODE_DISTRIBUTION.BALANCED,
    implementation: 'testMediumBranchingFlow'
  },
  {
    id: 'large-complex',
    name: 'Large Complex Flow',
    description: 'Tests performance with a large (200-300 nodes) complex flow with branches and merges',
    size: FLOW_SIZES.LARGE,
    complexity: FLOW_COMPLEXITY.COMPLEX,
    nodeDistribution: NODE_DISTRIBUTION.BALANCED,
    implementation: 'testLargeComplexFlow'
  },
  {
    id: 'very-large-complex',
    name: 'Very Large Complex Flow',
    description: 'Tests performance with a very large (500+ nodes) complex flow',
    size: FLOW_SIZES.VERY_LARGE,
    complexity: FLOW_COMPLEXITY.COMPLEX,
    nodeDistribution: NODE_DISTRIBUTION.BALANCED,
    implementation: 'testVeryLargeComplexFlow'
  },
  {
    id: 'transform-heavy',
    name: 'Transform-Heavy Flow',
    description: 'Tests performance with a flow containing many transformation nodes',
    size: FLOW_SIZES.MEDIUM,
    complexity: FLOW_COMPLEXITY.BRANCHING,
    nodeDistribution: NODE_DISTRIBUTION.TRANSFORM_HEAVY,
    implementation: 'testTransformHeavyFlow'
  },
  {
    id: 'router-heavy',
    name: 'Router-Heavy Flow',
    description: 'Tests performance with a flow containing many router nodes',
    size: FLOW_SIZES.MEDIUM,
    complexity: FLOW_COMPLEXITY.COMPLEX,
    nodeDistribution: NODE_DISTRIBUTION.ROUTER_HEAVY,
    implementation: 'testRouterHeavyFlow'
  },
  {
    id: 'cyclic-flow',
    name: 'Cyclic Flow',
    description: 'Tests performance with a flow containing feedback loops',
    size: FLOW_SIZES.MEDIUM,
    complexity: FLOW_COMPLEXITY.CYCLIC,
    nodeDistribution: NODE_DISTRIBUTION.BALANCED,
    implementation: 'testCyclicFlow'
  },
  {
    id: 'rendering-stress',
    name: 'Rendering Stress Test',
    description: 'Tests canvas rendering performance under stress conditions',
    size: FLOW_SIZES.LARGE,
    complexity: FLOW_COMPLEXITY.COMPLEX,
    nodeDistribution: NODE_DISTRIBUTION.BALANCED,
    implementation: 'testRenderingStress'
  }
];

// Performance metrics types
const METRIC_TYPES = {
  LOAD_TIME: 'loadTime',
  RENDER_TIME: 'renderTime',
  INTERACTION_TIME: 'interactionTime',
  MEMORY_USAGE: 'memoryUsage',
  CPU_USAGE: 'cpuUsage',
  FPS: 'fps'
};

// Performance optimization settings
const OPTIMIZATION_SETTINGS = {
  NODE_VIRTUALIZATION: 'nodeVirtualization',
  EDGE_BUNDLING: 'edgeBundling',
  DETAILED_LEVEL: 'detailedLevel',
  VIEWPORT_CULLING: 'viewportCulling',
  BATCHED_UPDATES: 'batchedUpdates',
  MEMOIZATION: 'memoization'
};

// Helper function to create a performance result object
const createPerformanceResult = (success, metrics, details = null) => {
  // Added display name
  createPerformanceResult.displayName = 'createPerformanceResult';

  // Added display name
  createPerformanceResult.displayName = 'createPerformanceResult';

  // Added display name
  createPerformanceResult.displayName = 'createPerformanceResult';

  // Added display name
  createPerformanceResult.displayName = 'createPerformanceResult';

  // Added display name
  createPerformanceResult.displayName = 'createPerformanceResult';


  return {
    success,
    metrics,
    details,
    timestamp: new Date().toISOString()
  };
};

// Mock test implementations
const testImplementations = {
  // Generate results for small linear flow
  testSmallLinearFlow: (optimizationConfig) => {
    const baseLoadTime = getRandomInt(100, 300);
    const baseRenderTime = getRandomInt(10, 50);
    const baseInteractionTime = getRandomInt(5, 30);
    const baseMemoryUsage = getRandomInt(20, 50);
    const baseCpuUsage = getRandomInt(5, 15);
    const baseFps = getRandomInt(45, 60);
    
    // Apply optimization effects
    const loadTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.BATCHED_UPDATES] ? 0.8 : 1;
    const renderTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 0.7 : 1;
    const interactionTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION] ? 0.6 : 1;
    const memoryUsageFactor = optimizationConfig[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] ? 0.9 : 1;
    
    const metrics = {
      [METRIC_TYPES.LOAD_TIME]: Math.round(baseLoadTime * loadTimeFactor),
      [METRIC_TYPES.RENDER_TIME]: Math.round(baseRenderTime * renderTimeFactor),
      [METRIC_TYPES.INTERACTION_TIME]: Math.round(baseInteractionTime * interactionTimeFactor),
      [METRIC_TYPES.MEMORY_USAGE]: Math.round(baseMemoryUsage * memoryUsageFactor),
      [METRIC_TYPES.CPU_USAGE]: Math.round(baseCpuUsage * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION] ? 0.8 : 1)),
      [METRIC_TYPES.FPS]: Math.round(baseFps * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 1.1 : 1))
    };
    
    const success = Object.values(metrics).every(value => value > 0);
    
    return createPerformanceResult(
      success,
      metrics,
      {
        nodeCount: getRandomInt(10, 20),
        edgeCount: getRandomInt(9, 19),
        optimizationApplied: Object.entries(optimizationConfig)
          .filter(([, enabled]) => enabled)
          .map(([setting]) => setting)
      }
    );
  },
  
  // Generate results for medium branching flow
  testMediumBranchingFlow: (optimizationConfig) => {
    const baseLoadTime = getRandomInt(300, 800);
    const baseRenderTime = getRandomInt(50, 150);
    const baseInteractionTime = getRandomInt(30, 80);
    const baseMemoryUsage = getRandomInt(60, 120);
    const baseCpuUsage = getRandomInt(15, 35);
    const baseFps = getRandomInt(30, 55);
    
    // Apply optimization effects
    const loadTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.BATCHED_UPDATES] ? 0.7 : 1;
    const renderTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 0.6 : 1;
    const interactionTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION] ? 0.5 : 1;
    const memoryUsageFactor = optimizationConfig[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] ? 0.75 : 1;
    
    const metrics = {
      [METRIC_TYPES.LOAD_TIME]: Math.round(baseLoadTime * loadTimeFactor),
      [METRIC_TYPES.RENDER_TIME]: Math.round(baseRenderTime * renderTimeFactor),
      [METRIC_TYPES.INTERACTION_TIME]: Math.round(baseInteractionTime * interactionTimeFactor),
      [METRIC_TYPES.MEMORY_USAGE]: Math.round(baseMemoryUsage * memoryUsageFactor),
      [METRIC_TYPES.CPU_USAGE]: Math.round(baseCpuUsage * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION] ? 0.7 : 1)),
      [METRIC_TYPES.FPS]: Math.round(baseFps * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 1.2 : 1))
    };
    
    const success = Object.values(metrics).every(value => value > 0);
    
    return createPerformanceResult(
      success,
      metrics,
      {
        nodeCount: getRandomInt(50, 100),
        edgeCount: getRandomInt(60, 120),
        branchCount: getRandomInt(5, 12),
        optimizationApplied: Object.entries(optimizationConfig)
          .filter(([, enabled]) => enabled)
          .map(([setting]) => setting)
      }
    );
  },
  
  // Generate results for large complex flow
  testLargeComplexFlow: (optimizationConfig) => {
    const baseLoadTime = getRandomInt(1000, 2500);
    const baseRenderTime = getRandomInt(150, 400);
    const baseInteractionTime = getRandomInt(100, 250);
    const baseMemoryUsage = getRandomInt(150, 350);
    const baseCpuUsage = getRandomInt(35, 70);
    const baseFps = getRandomInt(10, 40);
    
    // Apply optimization effects - optimizations have stronger effects on larger flows
    const loadTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.BATCHED_UPDATES] ? 0.6 : 1;
    const renderTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 0.5 : 1;
    const interactionTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION] ? 0.4 : 1;
    const memoryUsageFactor = optimizationConfig[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] ? 0.6 : 1;
    
    const metrics = {
      [METRIC_TYPES.LOAD_TIME]: Math.round(baseLoadTime * loadTimeFactor),
      [METRIC_TYPES.RENDER_TIME]: Math.round(baseRenderTime * renderTimeFactor),
      [METRIC_TYPES.INTERACTION_TIME]: Math.round(baseInteractionTime * interactionTimeFactor),
      [METRIC_TYPES.MEMORY_USAGE]: Math.round(baseMemoryUsage * memoryUsageFactor),
      [METRIC_TYPES.CPU_USAGE]: Math.round(baseCpuUsage * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION] ? 0.6 : 1)),
      [METRIC_TYPES.FPS]: Math.round(baseFps * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 1.5 : 1))
    };
    
    const success = metrics[METRIC_TYPES.FPS] > 15 && metrics[METRIC_TYPES.LOAD_TIME] < 2000;
    
    return createPerformanceResult(
      success,
      metrics,
      {
        nodeCount: getRandomInt(200, 300),
        edgeCount: getRandomInt(250, 400),
        branchCount: getRandomInt(15, 30),
        mergeCount: getRandomInt(10, 20),
        optimizationApplied: Object.entries(optimizationConfig)
          .filter(([, enabled]) => enabled)
          .map(([setting]) => setting)
      }
    );
  },
  
  // Generate results for very large complex flow
  testVeryLargeComplexFlow: (optimizationConfig) => {
    const baseLoadTime = getRandomInt(3000, 8000);
    const baseRenderTime = getRandomInt(500, 1500);
    const baseInteractionTime = getRandomInt(300, 800);
    const baseMemoryUsage = getRandomInt(400, 800);
    const baseCpuUsage = getRandomInt(60, 95);
    const baseFps = getRandomInt(5, 20);
    
    // Apply optimization effects - optimizations have much stronger effects on very large flows
    const loadTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.BATCHED_UPDATES] ? 0.4 : 1;
    const renderTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 0.3 : 1;
    const interactionTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION] ? 0.3 : 1;
    const memoryUsageFactor = optimizationConfig[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] ? 0.4 : 1;
    
    const metrics = {
      [METRIC_TYPES.LOAD_TIME]: Math.round(baseLoadTime * loadTimeFactor),
      [METRIC_TYPES.RENDER_TIME]: Math.round(baseRenderTime * renderTimeFactor),
      [METRIC_TYPES.INTERACTION_TIME]: Math.round(baseInteractionTime * interactionTimeFactor),
      [METRIC_TYPES.MEMORY_USAGE]: Math.round(baseMemoryUsage * memoryUsageFactor),
      [METRIC_TYPES.CPU_USAGE]: Math.round(baseCpuUsage * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION] ? 0.5 : 1)),
      [METRIC_TYPES.FPS]: Math.round(baseFps * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 2.5 : 1))
    };
    
    // This test is likely to fail without optimizations
    const success = 
      metrics[METRIC_TYPES.FPS] > 10 && 
      metrics[METRIC_TYPES.LOAD_TIME] < 5000 &&
      metrics[METRIC_TYPES.MEMORY_USAGE] < 600;
    
    return createPerformanceResult(
      success,
      metrics,
      {
        nodeCount: getRandomInt(500, 800),
        edgeCount: getRandomInt(700, 1200),
        branchCount: getRandomInt(35, 60),
        mergeCount: getRandomInt(25, 40),
        optimizationApplied: Object.entries(optimizationConfig)
          .filter(([, enabled]) => enabled)
          .map(([setting]) => setting),
        warnings: !success ? [
          "Performance degradation detected. Consider enabling more optimizations.",
          "Memory usage approaching threshold for stable operation."
        ] : []
      }
    );
  },
  
  // Other test implementations follow a similar pattern
  testTransformHeavyFlow: (optimizationConfig) => {
    // Implementation similar to medium flow but with specific adjustments for transform-heavy flows
    const baseRenderTime = getRandomInt(100, 250); // Transforms are render-intensive
    const baseMemoryUsage = getRandomInt(120, 220); // Transforms use more memory
    
    // Calculate metrics similar to medium flow but with specific adjustments
    const metrics = {
      [METRIC_TYPES.LOAD_TIME]: getRandomInt(400, 900),
      [METRIC_TYPES.RENDER_TIME]: Math.round(baseRenderTime * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 0.5 : 1)),
      [METRIC_TYPES.INTERACTION_TIME]: getRandomInt(40, 100),
      [METRIC_TYPES.MEMORY_USAGE]: Math.round(baseMemoryUsage * 
        (optimizationConfig[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] ? 0.7 : 1)),
      [METRIC_TYPES.CPU_USAGE]: getRandomInt(25, 50),
      [METRIC_TYPES.FPS]: getRandomInt(30, 50)
    };
    
    const success = metrics[METRIC_TYPES.FPS] > 25;
    
    return createPerformanceResult(
      success,
      metrics,
      {
        nodeCount: getRandomInt(70, 120),
        edgeCount: getRandomInt(80, 140),
        transformNodeCount: getRandomInt(40, 80), // High number of transform nodes
        optimizationApplied: Object.entries(optimizationConfig)
          .filter(([, enabled]) => enabled)
          .map(([setting]) => setting)
      }
    );
  },
  
  testRouterHeavyFlow: (optimizationConfig) => {
    // Implementation for router-heavy flows
    const metrics = {
      [METRIC_TYPES.LOAD_TIME]: getRandomInt(350, 800),
      [METRIC_TYPES.RENDER_TIME]: getRandomInt(50, 150),
      [METRIC_TYPES.INTERACTION_TIME]: getRandomInt(30, 80),
      [METRIC_TYPES.MEMORY_USAGE]: getRandomInt(70, 150),
      [METRIC_TYPES.CPU_USAGE]: getRandomInt(20, 45),
      [METRIC_TYPES.FPS]: getRandomInt(25, 50)
    };
    
    const success = metrics[METRIC_TYPES.FPS] > 20;
    
    return createPerformanceResult(
      success,
      metrics,
      {
        nodeCount: getRandomInt(70, 120),
        edgeCount: getRandomInt(120, 200), // More edges due to router nodes
        routerNodeCount: getRandomInt(30, 60), // High number of router nodes
        optimizationApplied: Object.entries(optimizationConfig)
          .filter(([, enabled]) => enabled)
          .map(([setting]) => setting)
      }
    );
  },
  
  testCyclicFlow: (optimizationConfig) => {
    // Implementation for cyclic flows
    const metrics = {
      [METRIC_TYPES.LOAD_TIME]: getRandomInt(400, 900),
      [METRIC_TYPES.RENDER_TIME]: getRandomInt(60, 170),
      [METRIC_TYPES.INTERACTION_TIME]: getRandomInt(40, 90),
      [METRIC_TYPES.MEMORY_USAGE]: getRandomInt(80, 160),
      [METRIC_TYPES.CPU_USAGE]: getRandomInt(25, 50),
      [METRIC_TYPES.FPS]: getRandomInt(20, 45)
    };
    
    const success = metrics[METRIC_TYPES.FPS] > 15;
    
    return createPerformanceResult(
      success,
      metrics,
      {
        nodeCount: getRandomInt(70, 120),
        edgeCount: getRandomInt(90, 150),
        cycleCount: getRandomInt(5, 15), // Flow contains cycles
        optimizationApplied: Object.entries(optimizationConfig)
          .filter(([, enabled]) => enabled)
          .map(([setting]) => setting)
      }
    );
  },
  
  testRenderingStress: (optimizationConfig) => {
    // Implementation for rendering stress test
    // We simulate rapid changes to the canvas to stress test the rendering
    const baseRenderTime = getRandomInt(200, 500);
    const baseFps = getRandomInt(5, 40);
    
    const renderTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 0.4 : 1;
    const fpsFactor = optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ? 2.0 : 1;
    
    const metrics = {
      [METRIC_TYPES.LOAD_TIME]: getRandomInt(1200, 2800),
      [METRIC_TYPES.RENDER_TIME]: Math.round(baseRenderTime * renderTimeFactor),
      [METRIC_TYPES.INTERACTION_TIME]: getRandomInt(150, 300),
      [METRIC_TYPES.MEMORY_USAGE]: getRandomInt(200, 400),
      [METRIC_TYPES.CPU_USAGE]: getRandomInt(40, 90),
      [METRIC_TYPES.FPS]: Math.round(baseFps * fpsFactor)
    };
    
    // This test is very sensitive to optimizations
    const success = 
      metrics[METRIC_TYPES.FPS] > 20 && 
      metrics[METRIC_TYPES.RENDER_TIME] < 300;
    
    return createPerformanceResult(
      success,
      metrics,
      {
        nodeCount: getRandomInt(250, 350),
        edgeCount: getRandomInt(300, 450),
        animatedElementsCount: getRandomInt(50, 100), // Elements with animations
        updateFrequency: getRandomInt(5, 15), // Updates per second
        optimizationApplied: Object.entries(optimizationConfig)
          .filter(([, enabled]) => enabled)
          .map(([setting]) => setting),
        warnings: !success ? [
          "Rendering performance is below acceptable thresholds.",
          "Consider enabling node virtualization and viewport culling."
        ] : []
      }
    );
  }
};

// Function to run a test and get results
const runPerformanceTest = (testId, optimizationConfig) => {
  // Added display name
  runPerformanceTest.displayName = 'runPerformanceTest';

  // Added display name
  runPerformanceTest.displayName = 'runPerformanceTest';

  // Added display name
  runPerformanceTest.displayName = 'runPerformanceTest';

  // Added display name
  runPerformanceTest.displayName = 'runPerformanceTest';

  // Added display name
  runPerformanceTest.displayName = 'runPerformanceTest';


  const test = PERFORMANCE_SCENARIOS.find(t => t.id === testId);
  if (!test || !testImplementations[test.implementation]) {
    return {
      success: false,
      error: 'Test implementation not found',
      testId
    };
  }
  
  return testImplementations[test.implementation](optimizationConfig);
};

// Helper function to derive rating from numeric value
const getRatingFromValue = (value, metric) => {
  // Added display name
  getRatingFromValue.displayName = 'getRatingFromValue';

  // Added display name
  getRatingFromValue.displayName = 'getRatingFromValue';

  // Added display name
  getRatingFromValue.displayName = 'getRatingFromValue';

  // Added display name
  getRatingFromValue.displayName = 'getRatingFromValue';

  // Added display name
  getRatingFromValue.displayName = 'getRatingFromValue';


  switch (metric) {
    case METRIC_TYPES.LOAD_TIME:
      return value < 500 ? 'Excellent' : 
             value < 1000 ? 'Good' : 
             value < 3000 ? 'Fair' : 'Poor';
    case METRIC_TYPES.RENDER_TIME:
      return value < 50 ? 'Excellent' : 
             value < 150 ? 'Good' : 
             value < 300 ? 'Fair' : 'Poor';
    case METRIC_TYPES.INTERACTION_TIME:
      return value < 30 ? 'Excellent' : 
             value < 80 ? 'Good' : 
             value < 200 ? 'Fair' : 'Poor';
    case METRIC_TYPES.MEMORY_USAGE:
      return value < 100 ? 'Excellent' : 
             value < 200 ? 'Good' : 
             value < 400 ? 'Fair' : 'Poor';
    case METRIC_TYPES.CPU_USAGE:
      return value < 20 ? 'Excellent' : 
             value < 40 ? 'Good' : 
             value < 70 ? 'Fair' : 'Poor';
    case METRIC_TYPES.FPS:
      return value > 50 ? 'Excellent' : 
             value > 30 ? 'Good' : 
             value > 15 ? 'Fair' : 'Poor';
    default:
      return 'Unknown';
  }
};

// Helper function to get color for rating
const getColorForRating = (rating) => {
  // Added display name
  getColorForRating.displayName = 'getColorForRating';

  // Added display name
  getColorForRating.displayName = 'getColorForRating';

  // Added display name
  getColorForRating.displayName = 'getColorForRating';

  // Added display name
  getColorForRating.displayName = 'getColorForRating';

  // Added display name
  getColorForRating.displayName = 'getColorForRating';


  switch (rating) {
    case 'Excellent': return '#4caf50';
    case 'Good': return '#8bc34a';
    case 'Fair': return '#ffc107';
    case 'Poor': return '#f44336';
    default: return '#9e9e9e';
  }
};

// Helper function to format metric value with units
const formatMetricValue = (value, metric) => {
  // Added display name
  formatMetricValue.displayName = 'formatMetricValue';

  // Added display name
  formatMetricValue.displayName = 'formatMetricValue';

  // Added display name
  formatMetricValue.displayName = 'formatMetricValue';

  // Added display name
  formatMetricValue.displayName = 'formatMetricValue';

  // Added display name
  formatMetricValue.displayName = 'formatMetricValue';


  switch (metric) {
    case METRIC_TYPES.LOAD_TIME:
    case METRIC_TYPES.RENDER_TIME:
    case METRIC_TYPES.INTERACTION_TIME:
      return `${value} ms`;
    case METRIC_TYPES.MEMORY_USAGE:
      return `${value} MB`;
    case METRIC_TYPES.CPU_USAGE:
      return `${value}%`;
    case METRIC_TYPES.FPS:
      return `${value} fps`;
    default:
      return value.toString();
  }
};

// Main component for performance testing
const PerformanceTestHarness = () => {
  // Added display name
  PerformanceTestHarness.displayName = 'PerformanceTestHarness';

  // Added display name
  PerformanceTestHarness.displayName = 'PerformanceTestHarness';

  // Added display name
  PerformanceTestHarness.displayName = 'PerformanceTestHarness';

  // Added display name
  PerformanceTestHarness.displayName = 'PerformanceTestHarness';

  // Added display name
  PerformanceTestHarness.displayName = 'PerformanceTestHarness';


  const [activeTab, setActiveTab] = useState(0);
  const [testResults, setTestResults] = useState({});
  const [runningTests, setRunningTests] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [optimizationConfig, setOptimizationConfig] = useState({
    [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: true,
    [OPTIMIZATION_SETTINGS.EDGE_BUNDLING]: false,
    [OPTIMIZATION_SETTINGS.DETAILED_LEVEL]: true,
    [OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]: true,
    [OPTIMIZATION_SETTINGS.BATCHED_UPDATES]: true,
    [OPTIMIZATION_SETTINGS.MEMOIZATION]: true
  });
  const [customFlowConfig, setCustomFlowConfig] = useState({
    nodeCount: 100,
    complexity: FLOW_COMPLEXITY.BRANCHING,
    nodeDistribution: NODE_DISTRIBUTION.BALANCED
  });
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [compareResults, setCompareResults] = useState({
    scenario: null,
    optimized: null,
    unoptimized: null
  });

  // Handle tab change
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

  // Toggle optimization setting
  const toggleOptimization = (setting) => {
  // Added display name
  toggleOptimization.displayName = 'toggleOptimization';

  // Added display name
  toggleOptimization.displayName = 'toggleOptimization';

  // Added display name
  toggleOptimization.displayName = 'toggleOptimization';

  // Added display name
  toggleOptimization.displayName = 'toggleOptimization';

  // Added display name
  toggleOptimization.displayName = 'toggleOptimization';


    setOptimizationConfig(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Update custom flow configuration
  const handleCustomFlowConfigChange = (field, value) => {
  // Added display name
  handleCustomFlowConfigChange.displayName = 'handleCustomFlowConfigChange';

  // Added display name
  handleCustomFlowConfigChange.displayName = 'handleCustomFlowConfigChange';

  // Added display name
  handleCustomFlowConfigChange.displayName = 'handleCustomFlowConfigChange';

  // Added display name
  handleCustomFlowConfigChange.displayName = 'handleCustomFlowConfigChange';

  // Added display name
  handleCustomFlowConfigChange.displayName = 'handleCustomFlowConfigChange';


    setCustomFlowConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Run a single test
  const runSingleTest = useCallback((testId) => {
  // Added display name
  runSingleTest.displayName = 'runSingleTest';

    setRunningTests(prev => [...prev, testId]);
    
    // Simulate async test execution
    setTimeout(() => {
      const result = runPerformanceTest(testId, optimizationConfig);
      setTestResults(prev => ({
        ...prev,
        [testId]: result
      }));
      setRunningTests(prev => prev.filter(id => id !== testId));
    }, getRandomInt(1000, 3000)); // Longer delay for realistic performance test
  }, [optimizationConfig]);

  // Run all tests
  const runAllTests = useCallback(() => {
  // Added display name
  runAllTests.displayName = 'runAllTests';

    PERFORMANCE_SCENARIOS.forEach(test => {
      runSingleTest(test.id);
    });
  }, [runSingleTest]);

  // View test result details
  const viewResultDetails = (testId) => {
  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';

  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';

  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';

  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';

  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';


    setSelectedResult(testResults[testId] || null);
  };

  // Run benchmark
  const runBenchmark = useCallback(() => {
  // Added display name
  runBenchmark.displayName = 'runBenchmark';

    setBenchmarkRunning(true);
    setBenchmarkResults(null);
    
    // Simulate async benchmark execution
    setTimeout(() => {
      // Generate benchmark results for different flow sizes
      const results = Object.values(FLOW_SIZES).map(size => {
        const nodeCount = size === FLOW_SIZES.SMALL ? getRandomInt(10, 20) :
                         size === FLOW_SIZES.MEDIUM ? getRandomInt(50, 100) :
                         size === FLOW_SIZES.LARGE ? getRandomInt(200, 300) :
                         getRandomInt(500, 800);
        
        const baseLoadTime = size === FLOW_SIZES.SMALL ? getRandomInt(100, 300) :
                           size === FLOW_SIZES.MEDIUM ? getRandomInt(300, 800) :
                           size === FLOW_SIZES.LARGE ? getRandomInt(1000, 2500) :
                           getRandomInt(3000, 8000);
        
        const baseFps = size === FLOW_SIZES.SMALL ? getRandomInt(45, 60) :
                      size === FLOW_SIZES.MEDIUM ? getRandomInt(30, 55) :
                      size === FLOW_SIZES.LARGE ? getRandomInt(15, 40) :
                      getRandomInt(5, 20);
        
        const loadTimeFactor = optimizationConfig[OPTIMIZATION_SETTINGS.BATCHED_UPDATES] ? 
                             (size === FLOW_SIZES.SMALL ? 0.8 :
                              size === FLOW_SIZES.MEDIUM ? 0.7 :
                              size === FLOW_SIZES.LARGE ? 0.6 : 0.4) : 1;
        
        const fpsFactor = optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] ?
                        (size === FLOW_SIZES.SMALL ? 1.1 :
                         size === FLOW_SIZES.MEDIUM ? 1.2 :
                         size === FLOW_SIZES.LARGE ? 1.5 : 2.0) : 1;
        
        return {
          size,
          nodeCount,
          loadTime: Math.round(baseLoadTime * loadTimeFactor),
          fps: Math.round(baseFps * fpsFactor),
          memoryUsage: size === FLOW_SIZES.SMALL ? getRandomInt(20, 50) :
                     size === FLOW_SIZES.MEDIUM ? getRandomInt(60, 120) :
                     size === FLOW_SIZES.LARGE ? getRandomInt(150, 350) :
                     getRandomInt(400, 800)
        };
      });
      
      setBenchmarkResults(results);
      setBenchmarkRunning(false);
    }, 5000);
  }, [optimizationConfig]);

  // Run comparison test (optimized vs unoptimized)
  const runComparisonTest = useCallback((scenarioId) => {
  // Added display name
  runComparisonTest.displayName = 'runComparisonTest';

    const scenario = PERFORMANCE_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    setCompareResults({
      scenario,
      optimized: null,
      unoptimized: null
    });
    
    // Create fully optimized config
    const optimizedConfig = {
      [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: true,
      [OPTIMIZATION_SETTINGS.EDGE_BUNDLING]: true,
      [OPTIMIZATION_SETTINGS.DETAILED_LEVEL]: true,
      [OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]: true,
      [OPTIMIZATION_SETTINGS.BATCHED_UPDATES]: true,
      [OPTIMIZATION_SETTINGS.MEMOIZATION]: true
    };
    
    // Create unoptimized config
    const unoptimizedConfig = {
      [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: false,
      [OPTIMIZATION_SETTINGS.EDGE_BUNDLING]: false,
      [OPTIMIZATION_SETTINGS.DETAILED_LEVEL]: false,
      [OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]: false,
      [OPTIMIZATION_SETTINGS.BATCHED_UPDATES]: false,
      [OPTIMIZATION_SETTINGS.MEMOIZATION]: false
    };
    
    // Run tests with different configs
    setTimeout(() => {
      const optimizedResult = runPerformanceTest(scenarioId, optimizedConfig);
      const unoptimizedResult = runPerformanceTest(scenarioId, unoptimizedConfig);
      
      setCompareResults({
        scenario,
        optimized: optimizedResult,
        unoptimized: unoptimizedResult
      });
    }, 3000);
  }, []);

  // Export test results
  const exportResults = () => {
  // Added display name
  exportResults.displayName = 'exportResults';

  // Added display name
  exportResults.displayName = 'exportResults';

  // Added display name
  exportResults.displayName = 'exportResults';

  // Added display name
  exportResults.displayName = 'exportResults';

  // Added display name
  exportResults.displayName = 'exportResults';


    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(testResults, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "performance-test-results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Format JSON for display
  const formatJSON = (obj) => {
  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';


    return JSON.stringify(obj, null, 2);
  };

  // Calculate percentage improvement between optimized and unoptimized results
  const calculateImprovement = (optimizedValue, unoptimizedValue, metric) => {
  // Added display name
  calculateImprovement.displayName = 'calculateImprovement';

  // Added display name
  calculateImprovement.displayName = 'calculateImprovement';

  // Added display name
  calculateImprovement.displayName = 'calculateImprovement';

  // Added display name
  calculateImprovement.displayName = 'calculateImprovement';

  // Added display name
  calculateImprovement.displayName = 'calculateImprovement';


    if (!optimizedValue || !unoptimizedValue) return null;
    
    // For metrics where lower is better
    if ([METRIC_TYPES.LOAD_TIME, METRIC_TYPES.RENDER_TIME, METRIC_TYPES.INTERACTION_TIME, 
         METRIC_TYPES.MEMORY_USAGE, METRIC_TYPES.CPU_USAGE].includes(metric)) {
      return ((unoptimizedValue - optimizedValue) / unoptimizedValue) * 100;
    }
    // For metrics where higher is better (FPS)
    else {
      return ((optimizedValue - unoptimizedValue) / unoptimizedValue) * 100;
    }
  };

  // Render test scenarios tab
  const renderTestScenariosTab = () => (
    <div>
      <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
        <Button 
          variant="contained&quot; 
          color="primary" 
          startIcon={<PlayArrowIcon />}
          onClick={runAllTests}
          disabled={runningTests.length > 0}
        >
          Run All Tests
        </Button>
        <Button 
          variant="outlined&quot; 
          startIcon={<SaveAltIcon />}
          onClick={exportResults}
          disabled={Object.keys(testResults).length === 0}
        >
          Export Results
        </Button>
      </MuiBox>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Scenario</TableCell>
              <TableCell>Size & Complexity</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center&quot;>FPS</TableCell>
              <TableCell align="center">Load Time</TableCell>
              <TableCell align="center&quot;>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PERFORMANCE_SCENARIOS.map(test => {
              const result = testResults[test.id];
              return (
                <TableRow key={test.id}>
                  <TableCell>
                    <Typography variant="body2">{test.name}</Typography>
                    <Typography variant="caption&quot; color="text.secondary">{test.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={test.size.toUpperCase()} 
                      size="small&quot; 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                    <Chip 
                      label={test.complexity.toUpperCase()} 
                      size="small" 
                      sx={{ mb: 0.5 }} 
                    />
                  </TableCell>
                  <TableCell align="center&quot;>
                    {runningTests.includes(test.id) ? (
                      <CircularProgress size={24} />
                    ) : result ? (
                      <Chip 
                        label={result.success ? "PASSED" : "FAILED"} 
                        color={result.success ? "success" : "error"} 
                        size="small&quot; 
                      />
                    ) : (
                      <Chip label="NOT RUN" size="small&quot; />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {result?.metrics?.fps ? (
                      <Typography
                        variant="body2&quot;
                        sx={{ color: getColorForRating(getRatingFromValue(result.metrics.fps, METRIC_TYPES.FPS)) }}
                      >
                        {result.metrics.fps} fps
                      </Typography>
                    ) : "—'}
                  </TableCell>
                  <TableCell align="center&quot;>
                    {result?.metrics?.loadTime ? (
                      <Typography
                        variant="body2"
                        sx={{ color: getColorForRating(getRatingFromValue(result.metrics.loadTime, METRIC_TYPES.LOAD_TIME)) }}
                      >
                        {result.metrics.loadTime} ms
                      </Typography>
                    ) : '—'}
                  </TableCell>
                  <TableCell align="center&quot;>
                    <Tooltip title="Run Test">
                      <IconButton 
                        color="primary&quot; 
                        onClick={() => runSingleTest(test.id)}
                        disabled={runningTests.includes(test.id)}
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <span>
                        <IconButton
                          color="info&quot;
                          onClick={() => viewResultDetails(test.id)}
                          disabled={!testResults[test.id]}
                        >
                          <SpeedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Compare Optimized vs. Unoptimized">
                      <span>
                        <IconButton
                          color="secondary&quot;
                          onClick={() => runComparisonTest(test.id)}
                          disabled={runningTests.includes(test.id)}
                        >
                          <AutorenewIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Result details display */}
      {selectedResult && (
        <Card sx={{ mt: 3, p: 2 }}>
          <MuiBox sx={{ display: "flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6&quot;>Performance Test Result Details</Typography>
            <Chip 
              label={selectedResult.success ? "PASSED" : "FAILED"} 
              color={selectedResult.success ? "success" : "error"} 
            />
          </MuiBox>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1&quot; gutterBottom>Performance Metrics</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small&quot;>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell align="right&quot;>Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(selectedResult.metrics || {}).map(([metric, value]) => (
                      <TableRow key={metric}>
                        <TableCell>
                          {metric === METRIC_TYPES.LOAD_TIME ? "Load Time' :
                           metric === METRIC_TYPES.RENDER_TIME ? 'Render Time' :
                           metric === METRIC_TYPES.INTERACTION_TIME ? 'Interaction Time' :
                           metric === METRIC_TYPES.MEMORY_USAGE ? 'Memory Usage' :
                           metric === METRIC_TYPES.CPU_USAGE ? 'CPU Usage' :
                           metric === METRIC_TYPES.FPS ? 'FPS' : metric}
                        </TableCell>
                        <TableCell align="right&quot;>{formatMetricValue(value, metric)}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={getRatingFromValue(value, metric)} 
                            size="small&quot;
                            sx={{ 
                              backgroundColor: getColorForRating(getRatingFromValue(value, metric)),
                              color: "white'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1&quot; gutterBottom>Test Configuration</Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  height: 'calc(100% - 32px)',
                  overflow: 'auto'
                }}
              >
                <Typography variant="body2&quot; gutterBottom>
                  <strong>Flow Details:</strong>
                </Typography>
                <MuiBox sx={{ mb: 1.5 }}>
                  {selectedResult.details?.nodeCount && (
                    <Chip 
                      label={`${selectedResult.details.nodeCount} Nodes`} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  )}
                  {selectedResult.details?.edgeCount && (
                    <Chip 
                      label={`${selectedResult.details.edgeCount} Edges`} 
                      size="small&quot; 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  )}
                  {selectedResult.details?.branchCount && (
                    <Chip 
                      label={`${selectedResult.details.branchCount} Branches`} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  )}
                  {selectedResult.details?.transformNodeCount && (
                    <Chip 
                      label={`${selectedResult.details.transformNodeCount} Transforms`} 
                      size="small&quot; 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  )}
                </MuiBox>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Optimizations Applied:</strong>
                </Typography>
                <MuiBox>
                  {selectedResult.details?.optimizationApplied?.map(opt => (
                    <Chip 
                      key={opt}
                      label={opt === OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION ? 'Node Virtualization' :
                            opt === OPTIMIZATION_SETTINGS.EDGE_BUNDLING ? 'Edge Bundling' :
                            opt === OPTIMIZATION_SETTINGS.DETAILED_LEVEL ? 'Detail Level' :
                            opt === OPTIMIZATION_SETTINGS.VIEWPORT_CULLING ? 'Viewport Culling' :
                            opt === OPTIMIZATION_SETTINGS.BATCHED_UPDATES ? 'Batched Updates' :
                            opt === OPTIMIZATION_SETTINGS.MEMOIZATION ? 'Memoization' : opt}
                      size="small&quot;
                      color="primary"
                      variant="outlined&quot;
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                  {(!selectedResult.details?.optimizationApplied || 
                    selectedResult.details.optimizationApplied.length === 0) && (
                    <Typography variant="body2" color="text.secondary&quot;>
                      No optimizations applied
                    </Typography>
                  )}
                </MuiBox>
                
                {selectedResult.details?.warnings && selectedResult.details.warnings.length > 0 && (
                  <>
                    <Typography variant="body2" gutterBottom sx={{ mt: 1.5 }}>
                      <strong>Warnings:</strong>
                    </Typography>
                    <MuiBox>
                      {selectedResult.details.warnings.map((warning, idx) => (
                        <Typography 
                          key={idx} 
                          variant="body2&quot; 
                          color="warning.main"
                          gutterBottom
                        >
                          • {warning}
                        </Typography>
                      ))}
                    </MuiBox>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1&quot; gutterBottom>
            Raw Test Result Data:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              maxHeight: '200px', 
              overflow: 'auto', 
              bgcolor: 'grey.100',
              fontFamily: 'monospace'
            }}
          >
            <pre>{formatJSON(selectedResult)}</pre>
          </Paper>
        </Card>
      )}
      
      {/* Comparison Results */}
      {compareResults.scenario && (
        <Card sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6&quot; gutterBottom>
            Optimization Comparison: {compareResults.scenario.name}
          </Typography>
          
          {(!compareResults.optimized || !compareResults.unoptimized) ? (
            <MuiBox sx={{ display: "flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </MuiBox>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined&quot; sx={{ mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Optimized</TableCell>
                      <TableCell align="right&quot;>Unoptimized</TableCell>
                      <TableCell align="right">Improvement</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(compareResults.optimized.metrics).map(([metric, value]) => {
                      const unoptimizedValue = compareResults.unoptimized.metrics[metric];
                      const improvement = calculateImprovement(value, unoptimizedValue, metric);
                      
                      return (
                        <TableRow key={metric}>
                          <TableCell>
                            {metric === METRIC_TYPES.LOAD_TIME ? 'Load Time' :
                             metric === METRIC_TYPES.RENDER_TIME ? 'Render Time' :
                             metric === METRIC_TYPES.INTERACTION_TIME ? 'Interaction Time' :
                             metric === METRIC_TYPES.MEMORY_USAGE ? 'Memory Usage' :
                             metric === METRIC_TYPES.CPU_USAGE ? 'CPU Usage' :
                             metric === METRIC_TYPES.FPS ? 'FPS' : metric}
                          </TableCell>
                          <TableCell align="right&quot;>
                            <Typography
                              variant="body2"
                              sx={{ color: getColorForRating(getRatingFromValue(value, metric)) }}
                            >
                              {formatMetricValue(value, metric)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right&quot;>
                            <Typography
                              variant="body2"
                              sx={{ color: getColorForRating(getRatingFromValue(unoptimizedValue, metric)) }}
                            >
                              {formatMetricValue(unoptimizedValue, metric)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right&quot;>
                            <Chip 
                              label={`${improvement > 0 ? "+' : ''}${improvement.toFixed(1)}%`} 
                              size="small&quot;
                              color={improvement > 0 ? "success' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="subtitle1&quot; gutterBottom>
                Optimization Impact Analysis
              </Typography>
              <Typography variant="body2" paragraph>
                {compareResults.optimized.success && !compareResults.unoptimized.success ? (
                  "The optimizations made the test pass, while it failed without optimizations."
                ) : !compareResults.optimized.success && !compareResults.unoptimized.success ? (
                  "Both optimized and unoptimized versions failed to meet performance criteria."
                ) : compareResults.optimized.success && compareResults.unoptimized.success ? (
                  "Both optimized and unoptimized versions passed, but optimizations significantly improved performance."
                ) : (
                  "The test failed even with optimizations applied."
                )}
              </Typography>
              
              <Typography variant="body2&quot; paragraph>
                Key improvements:
                <ul>
                  {Object.entries(compareResults.optimized.metrics).map(([metric, value]) => {
                    const unoptimizedValue = compareResults.unoptimized.metrics[metric];
                    const improvement = calculateImprovement(value, unoptimizedValue, metric);
                    
                    if (improvement > 20) {
                      return (
                        <li key={metric}>
                          {metric === METRIC_TYPES.LOAD_TIME ? "Load Time' :
                           metric === METRIC_TYPES.RENDER_TIME ? 'Render Time' :
                           metric === METRIC_TYPES.INTERACTION_TIME ? 'Interaction Time' :
                           metric === METRIC_TYPES.MEMORY_USAGE ? 'Memory Usage' :
                           metric === METRIC_TYPES.CPU_USAGE ? 'CPU Usage' :
                           metric === METRIC_TYPES.FPS ? 'FPS' : metric}: {improvement.toFixed(1)}% improvement
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </Typography>
            </>
          )}
        </Card>
      )}
    </div>
  );

  // Render optimization settings tab
  const renderOptimizationSettingsTab = () => (
    <div>
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6&quot; gutterBottom>
          Performance Optimization Settings
        </Typography>
        <Typography variant="body2" color="text.secondary&quot; paragraph>
          Configure optimization settings to improve performance of large and complex flows.
          These settings will be applied to all performance tests.
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1&quot; gutterBottom>
                <MemoryIcon sx={{ verticalAlign: "middle', mr: 1 }} />
                Rendering Optimizations
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]} 
                    onChange={() => toggleOptimization(OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION)}
                  />
                }
                label="Node Virtualization&quot;
              />
              <Typography variant="caption" color="text.secondary&quot; display="block" gutterBottom>
                Only render nodes that are visible in the viewport
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={optimizationConfig[OPTIMIZATION_SETTINGS.EDGE_BUNDLING]} 
                    onChange={() => toggleOptimization(OPTIMIZATION_SETTINGS.EDGE_BUNDLING)}
                  />
                }
                label="Edge Bundling&quot;
              />
              <Typography variant="caption" color="text.secondary&quot; display="block" gutterBottom>
                Bundle edges that follow similar paths to reduce visual complexity
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={optimizationConfig[OPTIMIZATION_SETTINGS.DETAILED_LEVEL]} 
                    onChange={() => toggleOptimization(OPTIMIZATION_SETTINGS.DETAILED_LEVEL)}
                  />
                }
                label="Detail Level Adaptation&quot;
              />
              <Typography variant="caption" color="text.secondary&quot; display="block" gutterBottom>
                Adjust level of detail based on zoom level and viewport
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={optimizationConfig[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]} 
                    onChange={() => toggleOptimization(OPTIMIZATION_SETTINGS.VIEWPORT_CULLING)}
                  />
                }
                label="Viewport Culling&quot;
              />
              <Typography variant="caption" color="text.secondary&quot; display="block">
                Skip rendering elements outside the viewport
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined&quot; sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <AutorenewIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Update Optimizations
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={optimizationConfig[OPTIMIZATION_SETTINGS.BATCHED_UPDATES]} 
                    onChange={() => toggleOptimization(OPTIMIZATION_SETTINGS.BATCHED_UPDATES)}
                  />
                }
                label="Batched Updates&quot;
              />
              <Typography variant="caption" color="text.secondary&quot; display="block" gutterBottom>
                Batch multiple updates together to reduce render cycles
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={optimizationConfig[OPTIMIZATION_SETTINGS.MEMOIZATION]} 
                    onChange={() => toggleOptimization(OPTIMIZATION_SETTINGS.MEMOIZATION)}
                  />
                }
                label="Component Memoization&quot;
              />
              <Typography variant="caption" color="text.secondary&quot; display="block" gutterBottom>
                Use React.memo and useCallback to prevent unnecessary re-renders
              </Typography>
              
              <MuiBox sx={{ mt: 4, mb: 1 }}>
                <Button 
                  variant="contained&quot; 
                  color="primary"
                  onClick={() => {
                    setOptimizationConfig({
                      [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: true,
                      [OPTIMIZATION_SETTINGS.EDGE_BUNDLING]: true,
                      [OPTIMIZATION_SETTINGS.DETAILED_LEVEL]: true,
                      [OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]: true,
                      [OPTIMIZATION_SETTINGS.BATCHED_UPDATES]: true,
                      [OPTIMIZATION_SETTINGS.MEMOIZATION]: true
                    });
                  }}
                  sx={{ mr: 1 }}
                >
                  Enable All
                </Button>
                <Button 
                  variant="outlined&quot;
                  onClick={() => {
                    setOptimizationConfig({
                      [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: false,
                      [OPTIMIZATION_SETTINGS.EDGE_BUNDLING]: false,
                      [OPTIMIZATION_SETTINGS.DETAILED_LEVEL]: false,
                      [OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]: false,
                      [OPTIMIZATION_SETTINGS.BATCHED_UPDATES]: false,
                      [OPTIMIZATION_SETTINGS.MEMOIZATION]: false
                    });
                  }}
                >
                  Disable All
                </Button>
              </MuiBox>
            </Paper>
          </Grid>
        </Grid>
      </Card>
      
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Custom Flow Configuration
        </Typography>
        <Typography variant="body2&quot; color="text.secondary" paragraph>
          Configure a custom flow for performance testing.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography id="node-count-slider&quot; gutterBottom>
              Node Count: {customFlowConfig.nodeCount}
            </Typography>
            <Slider
              value={customFlowConfig.nodeCount}
              onChange={(e, newValue) => handleCustomFlowConfigChange("nodeCount', newValue)}
              aria-labelledby="node-count-slider"
              min={10}
              max={1000}
              step={10}
              marks={[
                { value: 10, label: '10' },
                { value: 100, label: '100' },
                { value: 500, label: '500' },
                { value: 1000, label: '1000' }
              ]}
              valueLabelDisplay="auto&quot;
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="complexity-select-label">Flow Complexity</InputLabel>
              <Select
                labelId="complexity-select-label&quot;
                id="complexity-select"
                value={customFlowConfig.complexity}
                label="Flow Complexity&quot;
                onChange={(e) => handleCustomFlowConfigChange("complexity', e.target.value)}
              >
                <MenuItem value={FLOW_COMPLEXITY.LINEAR}>Linear</MenuItem>
                <MenuItem value={FLOW_COMPLEXITY.BRANCHING}>Branching</MenuItem>
                <MenuItem value={FLOW_COMPLEXITY.COMPLEX}>Complex</MenuItem>
                <MenuItem value={FLOW_COMPLEXITY.CYCLIC}>Cyclic</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="distribution-select-label&quot;>Node Distribution</InputLabel>
              <Select
                labelId="distribution-select-label"
                id="distribution-select&quot;
                value={customFlowConfig.nodeDistribution}
                label="Node Distribution"
                onChange={(e) => handleCustomFlowConfigChange('nodeDistribution', e.target.value)}
              >
                <MenuItem value={NODE_DISTRIBUTION.BALANCED}>Balanced</MenuItem>
                <MenuItem value={NODE_DISTRIBUTION.SOURCE_HEAVY}>Source Heavy</MenuItem>
                <MenuItem value={NODE_DISTRIBUTION.TRANSFORM_HEAVY}>Transform Heavy</MenuItem>
                <MenuItem value={NODE_DISTRIBUTION.DESTINATION_HEAVY}>Destination Heavy</MenuItem>
                <MenuItem value={NODE_DISTRIBUTION.ROUTER_HEAVY}>Router Heavy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <MuiBox sx={{ mt: 3 }}>
          <Button 
            variant="contained&quot;
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              // In a real implementation, this would generate a custom flow and run performance tests
              alert('Custom flow test would be executed here. In a real implementation, this would generate a custom flow with the specified parameters and run performance tests.');
            }}
          >
            Run Custom Test
          </Button>
        </MuiBox>
      </Card>
    </div>
  );

  // Render benchmark tab
  const renderBenchmarkTab = () => (
    <div>
      <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
        <Button 
          variant="contained&quot; 
          color="primary" 
          startIcon={<PlayArrowIcon />}
          onClick={runBenchmark}
          disabled={benchmarkRunning}
        >
          Run Benchmark
        </Button>
        <Button 
          variant="outlined&quot; 
          startIcon={<RefreshIcon />}
          onClick={() => setBenchmarkResults(null)}
          disabled={benchmarkRunning || !benchmarkResults}
        >
          Clear Results
        </Button>
      </MuiBox>
      
      {benchmarkRunning ? (
        <MuiBox sx={{ textAlign: "center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body1&quot; sx={{ mt: 2 }}>
            Running comprehensive benchmarks...
          </Typography>
          <MuiLinearProgress sx={{ mt: 2, mb: 1 }} />
          <Typography variant="caption" color="text.secondary&quot;>
            This may take several minutes depending on the flow size and complexity
          </Typography>
        </MuiBox>
      ) : benchmarkResults ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Flow Size</TableCell>
                    <TableCell>Node Count</TableCell>
                    <TableCell align="right">Load Time (ms)</TableCell>
                    <TableCell align="right&quot;>FPS</TableCell>
                    <TableCell align="right">Memory (MB)</TableCell>
                    <TableCell>Performance Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {benchmarkResults.map((result) => (
                    <TableRow key={result.size}>
                      <TableCell>
                        {result.size === FLOW_SIZES.SMALL ? 'Small' :
                         result.size === FLOW_SIZES.MEDIUM ? 'Medium' :
                         result.size === FLOW_SIZES.LARGE ? 'Large' : 'Very Large'}
                      </TableCell>
                      <TableCell>{result.nodeCount}</TableCell>
                      <TableCell align="right&quot;>{result.loadTime}</TableCell>
                      <TableCell align="right">{result.fps}</TableCell>
                      <TableCell align="right&quot;>{result.memoryUsage}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getRatingFromValue(result.fps, METRIC_TYPES.FPS)} 
                          size="small"
                          sx={{ 
                            backgroundColor: getColorForRating(getRatingFromValue(result.fps, METRIC_TYPES.FPS)),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6&quot; gutterBottom>
                Benchmark Analysis
              </Typography>
              
              <Typography variant="body1" paragraph>
                Optimization settings used for this benchmark:
              </Typography>
              
              <MuiBox sx={{ mb: 2 }}>
                {Object.entries(optimizationConfig).map(([setting, enabled]) => (
                  enabled && (
                    <Chip 
                      key={setting}
                      label={setting === OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION ? 'Node Virtualization' :
                           setting === OPTIMIZATION_SETTINGS.EDGE_BUNDLING ? 'Edge Bundling' :
                           setting === OPTIMIZATION_SETTINGS.DETAILED_LEVEL ? 'Detail Level' :
                           setting === OPTIMIZATION_SETTINGS.VIEWPORT_CULLING ? 'Viewport Culling' :
                           setting === OPTIMIZATION_SETTINGS.BATCHED_UPDATES ? 'Batched Updates' :
                           setting === OPTIMIZATION_SETTINGS.MEMOIZATION ? 'Memoization' : setting}
                      size="small&quot;
                      color="primary"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )
                ))}
              </MuiBox>
              
              <Typography variant="body1&quot; paragraph>
                Summary of results:
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Small flows ({benchmarkResults[0].nodeCount} nodes) perform excellently with {benchmarkResults[0].fps} FPS
              </Typography>
              
              <Typography variant="body2&quot; paragraph>
                • Medium flows ({benchmarkResults[1].nodeCount} nodes) maintain good performance with {benchmarkResults[1].fps} FPS
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Large flows ({benchmarkResults[2].nodeCount} nodes) show {getRatingFromValue(benchmarkResults[2].fps, METRIC_TYPES.FPS).toLowerCase()} performance with {benchmarkResults[2].fps} FPS
              </Typography>
              
              <Typography variant="body2&quot; paragraph>
                • Very large flows ({benchmarkResults[3].nodeCount} nodes) demonstrate {getRatingFromValue(benchmarkResults[3].fps, METRIC_TYPES.FPS).toLowerCase()} performance with {benchmarkResults[3].fps} FPS
                {benchmarkResults[3].fps < 15 && " - consider enabling more optimizations for very large flows"}
              </Typography>
              
              <Typography variant="body2&quot; paragraph>
                Memory usage scales {benchmarkResults[3].memoryUsage / benchmarkResults[0].memoryUsage < 10 ? "efficiently' : 'significantly'} with flow size, 
                ranging from {benchmarkResults[0].memoryUsage}MB for small flows to {benchmarkResults[3].memoryUsage}MB for very large flows.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <MuiBox sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper' }}>
          <LineChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6&quot; gutterBottom>
            No Benchmark Results
          </Typography>
          <Typography variant="body2" color="text.secondary&quot;>
            Run the benchmark to measure performance across different flow sizes
          </Typography>
        </MuiBox>
      )}
    </div>
  );

  // Render recommendations tab
  const renderRecommendationsTab = () => (
    <div>
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Optimization Recommendations
        </Typography>
        
        <Typography variant="subtitle1&quot; gutterBottom sx={{ mt: 2 }}>
          Recommended Optimization Strategies
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flow Size</TableCell>
                <TableCell>Recommended Optimizations</TableCell>
                <TableCell>Performance Impact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Small (10-20 nodes)</TableCell>
                <TableCell>
                  <Chip label="Memoization&quot; size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                </TableCell>
                <TableCell>
                  <Chip label="Low&quot; size="small" color="info&quot; />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Medium (50-100 nodes)</TableCell>
                <TableCell>
                  <Chip label="Memoization" size="small&quot; sx={{ mr: 0.5, mb: 0.5 }} />
                  <Chip label="Batched Updates" size="small&quot; sx={{ mr: 0.5, mb: 0.5 }} />
                </TableCell>
                <TableCell>
                  <Chip label="Medium" size="small&quot; color="success" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Large (200-300 nodes)</TableCell>
                <TableCell>
                  <Chip label="Node Virtualization&quot; size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  <Chip label="Viewport Culling&quot; size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  <Chip label="Memoization&quot; size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  <Chip label="Batched Updates&quot; size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                </TableCell>
                <TableCell>
                  <Chip label="High&quot; size="small" color="success&quot; />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Very Large (500+ nodes)</TableCell>
                <TableCell>
                  <Chip label="All Optimizations" size="small&quot; color="primary" sx={{ mr: 0.5, mb: 0.5 }} />
                </TableCell>
                <TableCell>
                  <Chip label="Critical&quot; size="small" color="error&quot; />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          Detailed Recommendations
        </Typography>
        
        <Paper variant="outlined&quot; sx={{ p: 2 }}>
          <Typography variant="body2" paragraph>
            <strong>1. Node Virtualization</strong>: For flows with more than 100 nodes, this optimization becomes critical. 
            Tests show a performance improvement of 50-70% in render time and significantly increased FPS.
          </Typography>
          
          <Typography variant="body2&quot; paragraph>
            <strong>2. Viewport Culling</strong>: Highly effective for large flows, providing a 40-60% reduction in memory usage
            and improved interaction responsiveness.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>3. Batched Updates</strong>: Especially important for flows with frequent state changes. Provides a 30-40%
            improvement in load times across all flow sizes.
          </Typography>
          
          <Typography variant="body2&quot; paragraph>
            <strong>4. Edge Bundling</strong>: Most effective for complex flows with many crossing connections. Improves visual
            clarity and provides a modest 10-20% rendering performance boost.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>5. Detail Level Adaptation</strong>: Recommended for all flow sizes when zooming and panning are frequent operations.
            Provides smooth interaction even with very large flows.
          </Typography>
        </Paper>
        
        <Typography variant="subtitle1&quot; gutterBottom sx={{ mt: 3 }}>
          Implementation Guidelines
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2&quot; paragraph>
            <strong>Browser Support Considerations</strong>: All optimizations are compatible with modern browsers, but Node Virtualization
            may require fallback rendering for older browsers.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>User Control</strong>: Allow users to enable/disable optimizations, as some may prefer visual completeness
            over performance on powerful systems.
          </Typography>
          
          <Typography variant="body2&quot; paragraph>
            <strong>Automatic Adaptation</strong>: Implement automatic optimization based on flow size and browser performance.
            Enable more aggressive optimizations as flow complexity increases.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Testing Across Devices</strong>: Thoroughly test on lower-end devices to ensure acceptable performance
            even with limited resources.
          </Typography>
        </Paper>
      </Card>
    </div>
  );

  return (
    <div>
      <Card sx={{ mb: 3 }}>
        <MuiBox sx={{ p: 3 }}>
          <Typography variant="h5&quot; gutterBottom>
            Performance Test Harness
          </Typography>
          <Typography variant="body1" color="text.secondary&quot;>
            Comprehensive performance testing for large and complex flows, with optimizations
            to improve rendering and interaction performance.
          </Typography>
          <MuiBox sx={{ display: "flex', mt: 2 }}>
            <Chip 
              icon={<SpeedIcon />} 
              label="8 Test Scenarios&quot; 
              sx={{ mr: 1 }} 
            />
            <Chip 
              icon={<MemoryIcon />} 
              label="6 Optimization Settings" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              icon={<LineChartIcon />} 
              label="Comprehensive Benchmarks&quot; 
            />
          </MuiBox>
        </MuiBox>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider' }}>
          <MuiTab label="Test Scenarios&quot; />
          <MuiTab label="Optimization Settings" />
          <MuiTab label="Benchmark&quot; />
          <MuiTab label="Recommendations" />
        </Tabs>
        
        <MuiBox sx={{ p: 2 }}>
          {activeTab === 0 && renderTestScenariosTab()}
          {activeTab === 1 && renderOptimizationSettingsTab()}
          {activeTab === 2 && renderBenchmarkTab()}
          {activeTab === 3 && renderRecommendationsTab()}
        </MuiBox>
      </Card>
    </div>
  );
};

export default PerformanceTestHarness;