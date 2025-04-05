import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningIcon from '@mui/icons-material/Warning';
import { enablePerformanceMonitoring, getPerformanceMetrics, clearPerformanceMetrics, generatePerformanceReport } from "@/utils/performance/performanceMonitor";
import { getPerformanceBudget, setPerformanceBudget, checkAllBudgets, clearViolations, generateBudgetReport } from "@/utils/performance/performanceBudget";

/**
 * Performance Monitoring Panel Component
 * 
 * Provides a comprehensive performance monitoring dashboard for the application.
 * Part of our zero technical debt approach to performance implementation.
 */
const PerformanceMonitoringPanel = ({
  onClose
}) => {
  const [formError, setFormError] = useState(null);
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [tabValue, setTabValue] = useState(0);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [monitoringConfig, setMonitoringConfig] = useState({
    trackComponents: true,
    trackInteractions: true,
    trackNavigation: true,
    trackResources: true,
    sampleRate: 100,
    logToConsole: false
  });
  const [disableMonitoring, setDisableMonitoring] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [violations, setViolations] = useState([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportHtml, setReportHtml] = useState('');
  const [reportType, setReportType] = useState('performance');

  // Enable/disable monitoring based on state
  useEffect(() => {
    if (monitoringEnabled && !disableMonitoring) {
      const stopFn = enablePerformanceMonitoring({
        ...monitoringConfig,
        onMetricUpdate: () => {

          // Update will happen on refresh instead of every metric
        }
      });
      setDisableMonitoring(() => stopFn);

      // Set up refresh interval
      const intervalId = setInterval(() => {
        setMetrics({
          ...getPerformanceMetrics()
        });
        setViolations(checkAllBudgets({
          logToConsole: false
        }));
      }, 2000);
      setRefreshInterval(intervalId);
    } else if (!monitoringEnabled && disableMonitoring) {
      disableMonitoring();
      setDisableMonitoring(null);

      // Clear refresh interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    return () => {
      if (disableMonitoring) {
        disableMonitoring();
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [monitoringEnabled, monitoringConfig]);

  // Refresh metrics manually
  const handleRefresh = useCallback(() => {
    setMetrics({
      ...getPerformanceMetrics()
    });
    setViolations(checkAllBudgets({
      logToConsole: false
    }));
  }, []);

  // Clear metrics
  const handleClear = useCallback(() => {
    clearPerformanceMetrics();
    clearViolations();
    setMetrics({
      ...getPerformanceMetrics()
    });
    setViolations([]);
  }, []);

  // Toggle monitoring state
  const toggleMonitoring = useCallback(() => {
    setMonitoringEnabled(prev => !prev);
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open settings dialog
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  // Close settings dialog
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  // Update monitoring configuration
  const handleConfigChange = key => event => {
    const value = event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value);
    setMonitoringConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Generate and display HTML report
  const handleGenerateReport = type => {
    let html = '';
    if (type === 'performance') {
      html = generatePerformanceReport();
    } else if (type === 'budget') {
      html = generateBudgetReport();
    }
    setReportHtml(html);
    setReportType(type);
    setReportDialogOpen(true);
  };

  // Download report as HTML file
  const handleDownloadReport = () => {
    const blob = new Blob([reportHtml], {
      type: 'text/html'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Count total violations
  const totalViolations = Object.values(violations).reduce((sum, categoryViolations) => sum + categoryViolations.length, 0);
  return <Card sx={{
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
      <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      p: 2
    }}>
        <Box sx={{
        display: 'flex',
        alignItems: 'center'
      }}>
          <BarChartIcon sx={{
          mr: 1
        }} />
          <Typography variant="h6">Performance Monitoring</Typography>
        </Box>
        <Box>
          <IconButton onClick={handleOpenSettings}>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
        <Box>
          <FormControlLabel control={<Switch checked={monitoringEnabled} onChange={toggleMonitoring} />} label={monitoringEnabled ? "Monitoring Active" : "Monitoring Inactive"} />

          {totalViolations > 0 && <Box component="span" sx={{
          display: 'inline-flex',
          alignItems: 'center',
          ml: 2,
          color: 'warning.main'
        }}>
              <WarningIcon sx={{
            mr: 0.5
          }} />
              <Typography variant="body2" component="span">
                {totalViolations} budget {totalViolations === 1 ? 'violation' : 'violations'} detected
              </Typography>
            </Box>}

        </Box>
        <Box>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => handleGenerateReport('performance')} sx={{
          mr: 1
        }}>

            Performance Report
          </Button>
          <Button variant="outlined" color="warning" startIcon={<FileDownloadIcon />} onClick={() => handleGenerateReport('budget')} disabled={totalViolations === 0}>

            Budget Report
          </Button>
          <Button variant="outlined" onClick={handleClear} sx={{
          ml: 1
        }}>
            Clear Data
          </Button>
        </Box>
      </Box>
      
      <Box sx={{
      borderBottom: 1,
      borderColor: 'divider'
    }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Components" />
          <Tab label="Interactions" />
          <Tab label="Resources" />
          <Tab label="Navigation" />
          <Tab label="Custom" />
          <Tab label={`Violations (${totalViolations})`} />
        </Tabs>
      </Box>
      
      <Box sx={{
      flexGrow: 1,
      overflow: 'auto',
      p: 2
    }}>
        {/* Components Tab */}
        {tabValue === 0 && <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Component</TableCell>
                  <TableCell align="right">Renders</TableCell>
                  <TableCell align="right">Avg Time (ms)</TableCell>
                  <TableCell align="right">Min Time (ms)</TableCell>
                  <TableCell align="right">Max Time (ms)</TableCell>
                  <TableCell align="right">Last Render (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(metrics.components).sort(([, a], [, b]) => b.averageTime - a.averageTime).map(([name, data]) => {
              const budget = getPerformanceBudget().components;
              let threshold = budget.standard;

              // Determine which budget applies
              if (budget[name]) {
                threshold = budget[name];
              } else if (name.includes('Chart') || name.includes('Graph') || name.includes('Visualization')) {
                threshold = budget.complex;
              } else if (name.includes('Layout') || name.includes('App') || name.includes('Page')) {
                threshold = budget.critical;
              }
              const isViolation = data.averageTime > threshold;
              return <TableRow key={name} sx={{
                '&:last-child td, &:last-child th': {
                  border: 0
                },
                backgroundColor: isViolation ? 'rgba(255, 235, 178, 0.2)' : 'inherit'
              }}>

                        <TableCell>
                          {name}
                          {isViolation && <WarningIcon fontSize="small" color="warning" sx={{
                    ml: 1,
                    verticalAlign: 'middle'
                  }} />}


                        </TableCell>
                        <TableCell align="right">{data.count}</TableCell>
                        <TableCell align="right">{data.averageTime.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.minTime.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.maxTime.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.lastTime.toFixed(2)}</TableCell>
                      </TableRow>;
            })}
              </TableBody>
            </Table>
          </TableContainer>}

        
        {/* Interactions Tab */}
        {tabValue === 1 && <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Interaction</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Avg Time (ms)</TableCell>
                  <TableCell align="right">Min Time (ms)</TableCell>
                  <TableCell align="right">Max Time (ms)</TableCell>
                  <TableCell align="right">Last Time (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(metrics.interactions).sort(([, a], [, b]) => b.averageTime - a.averageTime).map(([name, data]) => {
              const budget = getPerformanceBudget().interactions;
              let threshold = budget.button; // Default

              // Determine which budget applies
              if (budget[name]) {
                threshold = budget[name];
              } else if (data.type === 'input' || name.includes('input:')) {
                threshold = budget.input;
              } else if (data.type === 'change' || name.includes('toggle') || name.includes('switch')) {
                threshold = budget.toggle;
              } else if (name.includes('form') || name.includes('submit')) {
                threshold = budget.form;
              } else if (name.includes('navigation') || name.includes('link')) {
                threshold = budget.navigation;
              }
              const isViolation = data.averageTime > threshold;
              return <TableRow key={name} sx={{
                '&:last-child td, &:last-child th': {
                  border: 0
                },
                backgroundColor: isViolation ? 'rgba(255, 235, 178, 0.2)' : 'inherit'
              }}>

                        <TableCell>
                          {name}
                          {isViolation && <WarningIcon fontSize="small" color="warning" sx={{
                    ml: 1,
                    verticalAlign: 'middle'
                  }} />}


                        </TableCell>
                        <TableCell align="right">{data.count}</TableCell>
                        <TableCell align="right">{data.averageTime.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.minTime.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.maxTime.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.lastTime.toFixed(2)}</TableCell>
                      </TableRow>;
            })}
              </TableBody>
            </Table>
          </TableContainer>}

        
        {/* Resources Tab */}
        {tabValue === 2 && <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Resource</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Size (KB)</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Avg Time (ms)</TableCell>
                  <TableCell align="right">Max Time (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(metrics.resources).sort(([, a], [, b]) => b.averageTime - a.averageTime).map(([name, data]) => {
              const budget = getPerformanceBudget().resources;
              let threshold = budget.xhr; // Default

              // Determine which budget applies
              if (budget[name]) {
                threshold = budget[name];
              } else if (data.type === 'script' || name.includes('js:')) {
                threshold = budget.script;
              } else if (data.type === 'stylesheet' || name.includes('css:')) {
                threshold = budget.style;
              } else if (data.type === 'img' || name.match(/\.(jpg|jpeg|png|gif|webp|svg):/i)) {
                threshold = budget.image;
              } else if (data.type === 'font' || name.match(/\.(woff|woff2|ttf|otf|eot):/i)) {
                threshold = budget.font;
              }
              const isViolation = data.averageTime > threshold;
              return <TableRow key={name} sx={{
                '&:last-child td, &:last-child th': {
                  border: 0
                },
                backgroundColor: isViolation ? 'rgba(255, 235, 178, 0.2)' : 'inherit'
              }}>

                        <TableCell>
                          {name}
                          {isViolation && <WarningIcon fontSize="small" color="warning" sx={{
                    ml: 1,
                    verticalAlign: 'middle'
                  }} />}


                        </TableCell>
                        <TableCell>{data.type}</TableCell>
                        <TableCell align="right">{(data.size / 1024).toFixed(2)}</TableCell>
                        <TableCell align="right">{data.count}</TableCell>
                        <TableCell align="right">{data.averageTime.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.maxTime.toFixed(2)}</TableCell>
                      </TableRow>;
            })}
              </TableBody>
            </Table>
          </TableContainer>}

        
        {/* Navigation Tab */}
        {tabValue === 3 && <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell align="right">DOM Interactive (ms)</TableCell>
                  <TableCell align="right">DOM Complete (ms)</TableCell>
                  <TableCell align="right">First Paint (ms)</TableCell>
                  <TableCell align="right">First Contentful Paint (ms)</TableCell>
                  <TableCell align="right">Load (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(metrics.navigation).map(([url, data]) => {
              const budget = getPerformanceBudget().navigation;
              const violations = [];

              // Check each metric against its budget
              if (data.domInteractive > budget.domInteractive) violations.push('domInteractive');
              if (data.domComplete > budget.domComplete) violations.push('domComplete');
              if (data.firstPaint > budget.firstPaint) violations.push('firstPaint');
              if (data.firstContentfulPaint > budget.firstContentfulPaint) violations.push('firstContentfulPaint');
              if (data.load > budget.load) violations.push('load');
              const hasViolation = violations.length > 0;
              return <TableRow key={url} sx={{
                '&:last-child td, &:last-child th': {
                  border: 0
                },
                backgroundColor: hasViolation ? 'rgba(255, 235, 178, 0.2)' : 'inherit'
              }}>

                      <TableCell>
                        {url}
                        {hasViolation && <WarningIcon fontSize="small" color="warning" sx={{
                    ml: 1,
                    verticalAlign: 'middle'
                  }} />}


                      </TableCell>
                      <TableCell align="right" sx={{
                  color: violations.includes('domInteractive') ? 'warning.main' : 'inherit'
                }}>

                        {data.domInteractive.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{
                  color: violations.includes('domComplete') ? 'warning.main' : 'inherit'
                }}>

                        {data.domComplete.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{
                  color: violations.includes('firstPaint') ? 'warning.main' : 'inherit'
                }}>

                        {data.firstPaint.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{
                  color: violations.includes('firstContentfulPaint') ? 'warning.main' : 'inherit'
                }}>

                        {data.firstContentfulPaint.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{
                  color: violations.includes('load') ? 'warning.main' : 'inherit'
                }}>

                        {data.load.toFixed(2)}
                      </TableCell>
                    </TableRow>;
            })}
              </TableBody>
            </Table>
          </TableContainer>}

        
        {/* Custom Metrics Tab */}
        {tabValue === 4 && <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Avg Time (ms)</TableCell>
                  <TableCell align="right">Min Time (ms)</TableCell>
                  <TableCell align="right">Max Time (ms)</TableCell>
                  <TableCell align="right">Last Time (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(metrics.custom).sort(([, a], [, b]) => b.averageTime - a.averageTime).map(([name, data]) => <TableRow key={name} sx={{
              '&:last-child td, &:last-child th': {
                border: 0
              }
            }}>
                      <TableCell>{name}</TableCell>
                      <TableCell align="right">{data.count}</TableCell>
                      <TableCell align="right">{data.averageTime.toFixed(2)}</TableCell>
                      <TableCell align="right">{data.minTime.toFixed(2)}</TableCell>
                      <TableCell align="right">{data.maxTime.toFixed(2)}</TableCell>
                      <TableCell align="right">{data.lastTime.toFixed(2)}</TableCell>
                    </TableRow>)}

              </TableBody>
            </Table>
          </TableContainer>}

        
        {/* Violations Tab */}
        {tabValue === 5 && <>
            {totalViolations === 0 ? <Box sx={{
          textAlign: 'center',
          py: 4
        }}>
                <Typography variant="body1">No budget violations detected</Typography>
              </Box> : <>
                {Object.entries(violations).map(([category, categoryViolations]) => {
            if (categoryViolations.length === 0) return null;
            return <Box key={category} sx={{
              mb: 3
            }}>
                      <Typography variant="h6" sx={{
                mb: 1
              }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)} Violations
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Item</TableCell>
                              <TableCell align="right">Value</TableCell>
                              <TableCell align="right">Budget</TableCell>
                              <TableCell align="right">Overage</TableCell>
                              <TableCell align="right">% Over</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {categoryViolations.map((violation, index) => {
                      // Determine severity
                      let bgColor = 'rgba(255, 235, 178, 0.2)'; // Default - moderate
                      if (violation.overagePercent > 50) {
                        bgColor = 'rgba(249, 168, 168, 0.3)'; // Severe
                      } else if (violation.overagePercent > 20) {
                        bgColor = 'rgba(251, 211, 141, 0.3)'; // Significant
                      }
                      return <TableRow key={`${category}-${index}`} sx={{
                        '&:last-child td, &:last-child th': {
                          border: 0
                        },
                        backgroundColor: bgColor
                      }}>

                                  <TableCell>{violation.name}</TableCell>
                                  <TableCell align="right">
                                    {category === 'bundleSizes' ? `${(violation.value / 1024).toFixed(1)} KB` : `${violation.value.toFixed(1)} ms`}
                                  </TableCell>
                                  <TableCell align="right">
                                    {category === 'bundleSizes' ? `${(violation.budget / 1024).toFixed(1)} KB` : `${violation.budget.toFixed(1)} ms`}
                                  </TableCell>
                                  <TableCell align="right">
                                    {category === 'bundleSizes' ? `${(violation.overage / 1024).toFixed(1)} KB` : `${violation.overage.toFixed(1)} ms`}
                                  </TableCell>
                                  <TableCell align="right">{violation.overagePercent.toFixed(1)}%</TableCell>
                                </TableRow>;
                    })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>;
          })}
              </>}

          </>}

      </Box>
      
      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onClose={handleCloseSettings}>
        <DialogTitle>Performance Monitoring Settings</DialogTitle>
        <DialogContent>
          <Box sx={{
          my: 2
        }}>
            <Typography variant="subtitle1" gutterBottom>Monitoring Options</Typography>
            <FormControlLabel control={<Switch checked={monitoringConfig.trackComponents} onChange={handleConfigChange('trackComponents')} />} label="Track Component Render Times" />

            <FormControlLabel control={<Switch checked={monitoringConfig.trackInteractions} onChange={handleConfigChange('trackInteractions')} />} label="Track User Interactions" />

            <FormControlLabel control={<Switch checked={monitoringConfig.trackNavigation} onChange={handleConfigChange('trackNavigation')} />} label="Track Navigation Performance" />

            <FormControlLabel control={<Switch checked={monitoringConfig.trackResources} onChange={handleConfigChange('trackResources')} />} label="Track Resource Load Times" />

            <FormControlLabel control={<Switch checked={monitoringConfig.logToConsole} onChange={handleConfigChange('logToConsole')} />} label="Log Performance Data to Console" />

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} fullWidth maxWidth="lg">

        <DialogTitle>
          {reportType === 'performance' ? 'Performance Report' : 'Budget Violations Report'}
        </DialogTitle>
        <DialogContent>
          <iframe title="Performance Report" srcDoc={reportHtml} style={{
          width: '100%',
          height: '70vh',
          border: 'none'
        }} />

        </DialogContent>
        <DialogActions>
          <Button startIcon={<FileDownloadIcon />} onClick={handleDownloadReport}>

            Download Report
          </Button>
          <Button onClick={() => setReportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>;
};
export default PerformanceMonitoringPanel;