import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Performance Optimization Showcase
                                                                                      * 
                                                                                      * A demonstration component that showcases performance optimization techniques.
                                                                                      * Part of the zero technical debt performance implementation.
                                                                                      * 
                                                                                      * @module components/common/PerformanceShowcase
                                                                                      */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Grid, Typography, Paper, Box, Button, Divider, Accordion, AccordionSummary, AccordionDetails, TextField, CircularProgress, List, ListItem, ListItemText, ListItemButton, Switch, FormControlLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { optimizeComponent, createOptimizedHandlers, DeferredRender, withRenderTiming, enablePerformanceMonitoring, timeFunction, timeAsyncFunction, createPerformantEventHandler, printRenderStats } from "@/utils/performance";

// Import our new Performance Monitoring Panel
import PerformanceMonitoringPanel from './PerformanceMonitoringPanel';

// Demo component with expensive rendering
const ExpensiveComponent = ({
  itemCount = 50,
  optimized = false
}) => {
  // Generate a lot of items
  const items = useMemo(() => {
    console.log('Generating expensive items...');
    return Array.from({
      length: itemCount
    }, (_, index) => ({
      id: index,
      name: `Item ${index}`,
      description: `Description for item ${index} with some additional text`,
      value: Math.floor(Math.random() * 1000)
    }));
  }, [itemCount]); // Only regenerate when itemCount changes

  // If not optimized, we don't use the useMemo pattern
  const nonOptimizedItems = optimized ? items : Array.from({
    length: itemCount
  }, (_, index) => ({
    id: index,
    name: `Item ${index}`,
    description: `Description for item ${index} with some additional text`,
    value: Math.floor(Math.random() * 1000)
  }));

  // Do some "expensive" calculations
  const startTime = performance.now();
  let total = 0;
  for (let i = 0; i < (optimized ? 100 : 1000); i++) {
    total += Math.random() * i;
  }
  const renderTime = performance.now() - startTime;
  return <Box>
      <Typography variant="subtitle1">
        Render time: {renderTime.toFixed(2)}ms
      </Typography>
      <List sx={{
      height: 200,
      overflow: 'auto',
      bgcolor: 'background.paper'
    }}>

        {(optimized ? items : nonOptimizedItems).map(item => <ListItem key={item.id} disablePadding>
            <ListItemButton>
              <ListItemText primary={item.name} secondary={`${item.description} - Value: ${item.value}`} />

            </ListItemButton>
          </ListItem>)}

      </List>
    </Box>;
};

// Optimized version using HOC
const OptimizedExpensiveComponent = optimizeComponent(ExpensiveComponent, {
  memoProps: ['itemCount', 'optimized'],
  logRenders: true
});

// Component with render timing
const TimedComponent = withRenderTiming(({
  iterations = 100
}) => {
  // Do something computationally expensive
  const value = useMemo(() => {
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sin(i) * Math.cos(i);
    }
    return result;
  }, [iterations]);
  return <Box p={2} bgcolor="rgba(0, 0, 0, 0.04)" borderRadius={1}>
      <Typography variant="body2">
        Computed value: {value.toFixed(4)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        (Check console for timing information)
      </Typography>
    </Box>;
});

/**
 * A showcase component for performance optimization techniques
 */
const PerformanceShowcase = () => {
  const [formError, setFormError] = useState(null);
  // State for demo controls
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [itemCount, setItemCount] = useState(50);
  const [iterations, setIterations] = useState(100);
  const [showDeferred, setShowDeferred] = useState(false);
  const [showMonitoringPanel, setShowMonitoringPanel] = useState(false);

  // Cleanup function for performance monitoring
  const cleanupRef = React.useRef(null);

  // Toggle performance monitoring
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      console.log('Performance monitoring disabled');
    } else {
      cleanupRef.current = enablePerformanceMonitoring({
        trackComponents: true,
        trackInteractions: true,
        logToConsole: true
      });
      console.log('Performance monitoring enabled - check console for results');
    }
    setIsMonitoring(!isMonitoring);
  }, [isMonitoring]);

  // Create optimized event handlers
  const handlers = createOptimizedHandlers({
    handleOptimize: () => setIsOptimized(prev => !prev),
    handleItemCountChange: e => setItemCount(parseInt(e.target.value) || 10),
    handleIterationChange: e => setIterations(parseInt(e.target.value) || 10),
    handlePrintStats: () => {
      printRenderStats();
      console.log('Performance statistics printed to console');
    },
    handleDeferredToggle: () => setShowDeferred(prev => !prev)
  }, []);

  // Demo of performance-timed function
  const runTimedFunction = () => {
    const result = timeFunction(() => {
      let sum = 0;
      for (let i = 0; i < 1000000; i++) {
        sum += i * 0.1;
      }
      return sum;
    }, 'Demo Calculation');
    console.log('Timed function result:', result);
  };

  // Demo of async timed function
  const runTimedAsyncFunction = async () => {
    try {
      await timeAsyncFunction(async () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('Async operation completed');
          }, 1000);
        });
      }, 'Demo Async Operation');
      console.log('Async operation completed and timed');
    } catch (error) {
      console.error('Async operation failed:', error);
    }
  };

  // Debounced event handler for search demo
  const handleSearch = createPerformantEventHandler(value => {
    console.log('Searching for:', value);
  }, {
    debounce: 300,
    name: 'search'
  });

  // Cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
  return <Grid container spacing={4}>
      <Grid item xs={12}>
        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
          <Typography variant="h4" component="h1">
            Performance Optimization Showcase
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setShowMonitoringPanel(prev => !prev)}>

            {showMonitoringPanel ? 'Hide' : 'Show'} Performance Monitor
          </Button>
        </Box>
        <Typography variant="body1" paragraph>
          This showcase demonstrates performance optimization techniques built with zero technical debt.
          These utilities help identify and resolve rendering bottlenecks, optimize component updates,
          and measure performance metrics.
        </Typography>
        
        {showMonitoringPanel && <Box sx={{
        mb: 3
      }}>
            <PerformanceMonitoringPanel onClose={() => setShowMonitoringPanel(false)} />
          </Box>}

      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={2} sx={{
        p: 3
      }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Performance Monitoring Controls
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel control={<Switch checked={isMonitoring} onChange={toggleMonitoring} color="primary" />} label="Enable performance monitoring" />

            
            <Button variant="outlined" onClick={handlers.handlePrintStats} disabled={!isMonitoring}>

              Print performance statistics
            </Button>
            
            <Divider sx={{
            my: 1
          }} />
            
            <Typography variant="subtitle1">Demo Settings</Typography>
            <FormControlLabel control={<Switch checked={isOptimized} onChange={handlers.handleOptimize} color="primary" />} label="Use optimized components" />

            
            <TextField label="Item Count" type="number" value={itemCount} onChange={handlers.handleItemCountChange} variant="outlined" size="small" sx={{
            maxWidth: 200
          }} />

            
            <TextField label="Iterations" type="number" value={iterations} onChange={handlers.handleIterationChange} variant="outlined" size="small" sx={{
            maxWidth: 200
          }} />

          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{
        p: 3
      }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Component Optimization Demo
          </Typography>
          
          <Typography variant="body2" paragraph>
            {isOptimized ? 'Optimized component using memoization and optimizeComponent HOC' : 'Unoptimized component with redundant re-renders'}
          </Typography>
          
          {isOptimized ? <OptimizedExpensiveComponent itemCount={itemCount} optimized={true} /> : <ExpensiveComponent itemCount={itemCount} optimized={false} />}


          
          <Box mt={2}>
            <Button variant="contained" onClick={() => setItemCount(prev => prev + 10)}>

              Add 10 Items (Force Re-render)
            </Button>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{
        p: 3
      }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Deferred Rendering
          </Typography>
          
          <Typography variant="body2" paragraph>
            Non-critical UI elements can be deferred until after initial load
          </Typography>
          
          <Button variant="outlined" onClick={handlers.handleDeferredToggle} sx={{
          mb: 2
        }}>

            {showDeferred ? 'Hide' : 'Show'} Deferred Content
          </Button>
          
          {showDeferred && <DeferredRender delay={500}>
              <Box p={2} bgcolor="rgba(0, 0, 0, 0.04)" borderRadius={1}>
                <Typography variant="body1">
                  This content was rendered after a short delay
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deferring non-critical UI improves initial load performance
                </Typography>
              </Box>
            </DeferredRender>}

        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={2} sx={{
        p: 3
      }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Performance Measurement Tools
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Render Timing
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Component with render time measurement
                </Typography>
                
                <TimedComponent iterations={iterations} />
                
                <Button variant="outlined" onClick={() => setIterations(prev => prev * 2)} size="small" sx={{
                mt: 1
              }}>

                  Double iterations
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Function Timing
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Measure execution time of functions
                </Typography>
                
                <Button variant="outlined" onClick={runTimedFunction} sx={{
                mb: 1
              }}>

                  Run timed function
                </Button>
                
                <Button variant="outlined" onClick={runTimedAsyncFunction}>

                  Run timed async function
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Debounced Events
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Performance-optimized event handlers
                </Typography>
                
                <TextField label="Search (debounced)" fullWidth variant="outlined" onChange={e => handleSearch(e.target.value)} helperText="Type quickly to see debouncing in action (check console)" />

              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={2} sx={{
        p: 3
      }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Implementation Details
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Component Optimization Techniques</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                The following optimization techniques are demonstrated:
              </Typography>
              <ul>
                <li>React.memo for preventing unnecessary renders</li>
                <li>useMemo for expensive computations</li>
                <li>useCallback for stable function references</li>
                <li>Deferred rendering for non-critical content</li>
                <li>Render timing for performance measurement</li>
                <li>Optimized event handlers with debouncing</li>
              </ul>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Performance Monitoring</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                The performance monitoring system tracks:
              </Typography>
              <ul>
                <li>Component render times and frequency</li>
                <li>User interaction response times</li>
                <li>Navigation and page load metrics</li>
                <li>Resource loading performance</li>
                <li>Custom function timing</li>
              </ul>
              <Typography variant="body2" mt={2}>
                Enable monitoring and check the console to see detailed statistics.
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Best Practices</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Key performance best practices implemented:
              </Typography>
              <ul>
                <li>Use memoization for expensive calculations</li>
                <li>Avoid unnecessary re-renders with proper component structure</li>
                <li>Defer non-critical rendering</li>
                <li>Optimize event handlers with debounce/throttle</li>
                <li>Measure and monitor performance metrics</li>
                <li>Use virtualization for long lists (not shown in demo)</li>
                <li>Implement code splitting and lazy loading</li>
              </ul>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Grid>
    </Grid>;
};
export default PerformanceShowcase;