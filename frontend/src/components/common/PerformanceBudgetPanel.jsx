/**
 * Performance Budget Panel Component
 * 
 * A component for displaying and managing performance budgets in development.
 * Part of the zero technical debt performance implementation.
 * 
 * @module components/common/PerformanceBudgetPanel
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Collapse, 
  Button, 
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';

import {
  getPerformanceMetrics,
  getPerformanceBudget,
  checkAllBudgets,
  getViolations,
  clearViolations,
  generateBudgetReport
} from '../../utils/performance';

/**
 * Performance Budget Panel Component
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const PerformanceBudgetPanel = ({ 
  position = 'bottom-right',
  autoExpandViolations = true,
  initiallyOpen = false,
  refreshInterval = 10000,
  logToConsole = false
}) => {
  // State for panel visibility and active tab
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [activeTab, setActiveTab] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportHtml, setReportHtml] = useState('');
  
  // State for violations
  const [violations, setViolations] = useState({
    components: [],
    interactions: [],
    resources: [],
    navigation: [],
    bundleSizes: []
  });
  
  // State for expanded sections
  const [expanded, setExpanded] = useState({
    components: autoExpandViolations,
    interactions: autoExpandViolations,
    resources: autoExpandViolations,
    navigation: autoExpandViolations,
    bundleSizes: autoExpandViolations
  });
  
  /**
   * Toggle a specific section's expansion
   */
  const toggleExpanded = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  /**
   * Check all performance budgets
   */
  const checkBudgets = useCallback(() => {
    const currentViolations = checkAllBudgets({ logToConsole });
    setViolations(currentViolations);
    
    // Auto-expand sections with violations if enabled
    if (autoExpandViolations) {
      const newExpanded = { ...expanded };
      
      Object.entries(currentViolations).forEach(([category, categoryViolations]) => {
        if (categoryViolations.length > 0) {
          newExpanded[category] = true;
        }
      });
      
      setExpanded(newExpanded);
    }
  }, [logToConsole, autoExpandViolations, expanded]);
  
  /**
   * Clear all recorded violations
   */
  const handleClearViolations = () => {
    clearViolations();
    checkBudgets();
  };
  
  /**
   * Generate and show full report
   */
  const handleShowReport = () => {
    const report = generateBudgetReport();
    setReportHtml(report);
    setReportDialogOpen(true);
  };
  
  /**
   * Download the report
   */
  const handleDownloadReport = () => {
    const report = generateBudgetReport();
    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-budget-report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Check budgets on mount and when refresh interval changes
  useEffect(() => {
    checkBudgets();
    
    // Set up refresh interval
    if (refreshInterval > 0) {
      const intervalId = setInterval(checkBudgets, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [checkBudgets, refreshInterval]);
  
  // Count total violations
  const totalViolations = Object.values(violations)
    .reduce((sum, categoryViolations) => sum + categoryViolations.length, 0);
  
  // Determine severity level
  let severity = 'success';
  if (totalViolations > 10) {
    severity = 'error';
  } else if (totalViolations > 0) {
    severity = 'warning';
  }
  
  // Position styles
  const positionStyles = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 }
  };
  
  // Render nothing if no violations and panel is not open
  if (totalViolations === 0 && !isOpen) {
    return null;
  }
  
  // Render the component
  return (
    <>
      {/* Main panel */}
      <Paper 
        sx={{
          position: 'fixed',
          zIndex: 9999,
          width: isOpen ? 500 : 'auto',
          maxHeight: isOpen ? '80vh' : 'auto',
          overflow: isOpen ? 'auto' : 'visible',
          boxShadow: 3,
          ...positionStyles[position]
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: severity === 'error' ? '#ffebee' : 
                            severity === 'warning' ? '#fff8e1' : '#e8f5e9',
            padding: isOpen ? 2 : 1,
            cursor: 'pointer',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            borderBottomLeftRadius: isOpen ? 0 : 4,
            borderBottomRightRadius: isOpen ? 0 : 4,
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {severity === 'error' ? (
              <ErrorIcon color="error" sx={{ mr: 1 }} />
            ) : severity === 'warning' ? (
              <WarningIcon color="warning" sx={{ mr: 1 }} />
            ) : (
              <CheckIcon color="success" sx={{ mr: 1 }} />
            )}
            
            <Typography variant="subtitle1">
              {isOpen ? 'Performance Budget' : `${totalViolations} Budget Violation${totalViolations !== 1 ? 's' : ''}`}
            </Typography>
          </Box>
          
          <Box>
            {isOpen && (
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                checkBudgets();
              }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}>
              {isOpen ? <CloseIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
        
        {/* Panel content */}
        {isOpen && (
          <Box sx={{ p: 2 }}>
            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<RefreshIcon />}
                onClick={checkBudgets}
              >
                Refresh
              </Button>
              
              <Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<BarChartIcon />}
                  onClick={handleShowReport}
                  sx={{ mr: 1 }}
                >
                  Report
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={handleClearViolations}
                >
                  Clear
                </Button>
              </Box>
            </Box>
            
            {/* Summary */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Budget Violations Summary
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <ViolationChip
                  label="Components"
                  count={violations.components.length}
                  onClick={() => {
                    setActiveTab(0);
                    toggleExpanded('components');
                  }}
                />
                <ViolationChip
                  label="Interactions"
                  count={violations.interactions.length}
                  onClick={() => {
                    setActiveTab(0);
                    toggleExpanded('interactions');
                  }}
                />
                <ViolationChip
                  label="Resources"
                  count={violations.resources.length}
                  onClick={() => {
                    setActiveTab(0);
                    toggleExpanded('resources');
                  }}
                />
                <ViolationChip
                  label="Navigation"
                  count={violations.navigation.length}
                  onClick={() => {
                    setActiveTab(0);
                    toggleExpanded('navigation');
                  }}
                />
                <ViolationChip
                  label="Bundle Sizes"
                  count={violations.bundleSizes.length}
                  onClick={() => {
                    setActiveTab(0);
                    toggleExpanded('bundleSizes');
                  }}
                />
              </Box>
            </Box>
            
            {/* Tabs for detailed info */}
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Violations" />
              <Tab label="Budgets" />
            </Tabs>
            
            {/* Tab content */}
            {activeTab === 0 ? (
              // Violations tab
              <Box>
                {totalViolations === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CheckIcon color="success" sx={{ fontSize: 48 }} />
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                      No budget violations detected
                    </Typography>
                  </Box>
                ) : (
                  Object.entries(violations).map(([category, categoryViolations]) => (
                    categoryViolations.length > 0 && (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            py: 1,
                            borderBottom: 1,
                            borderColor: 'divider'
                          }}
                          onClick={() => toggleExpanded(category)}
                        >
                          <Typography variant="subtitle2">
                            {category.charAt(0).toUpperCase() + category.slice(1)} 
                            ({categoryViolations.length})
                          </Typography>
                          <IconButton size="small">
                            {expanded[category] ? (
                              <ExpandMoreIcon style={{ transform: 'rotate(180deg)' }} />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </Box>
                        
                        <Collapse in={expanded[category]}>
                          <TableContainer sx={{ mt: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Item</TableCell>
                                  <TableCell align="right">Value</TableCell>
                                  <TableCell align="right">Budget</TableCell>
                                  <TableCell align="right">% Over</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {categoryViolations.map((violation, idx) => {
                                  // Format values based on unit
                                  const unit = violation.unit || 'ms';
                                  let value, budget;
                                  
                                  if (unit === 'bytes') {
                                    value = `${(violation.value / 1024).toFixed(1)} KB`;
                                    budget = `${(violation.budget / 1024).toFixed(1)} KB`;
                                  } else {
                                    value = `${violation.value.toFixed(1)} ${unit}`;
                                    budget = `${violation.budget.toFixed(1)} ${unit}`;
                                  }
                                  
                                  // Determine severity class
                                  let severityColor = 'warning.light';
                                  if (violation.overagePercent > 50) {
                                    severityColor = 'error.light';
                                  } else if (violation.overagePercent > 20) {
                                    severityColor = 'error.lighter';
                                  }
                                  
                                  return (
                                    <TableRow 
                                      key={`${category}-${idx}`}
                                      sx={{ backgroundColor: severityColor }}
                                    >
                                      <TableCell>{violation.name}</TableCell>
                                      <TableCell align="right">{value}</TableCell>
                                      <TableCell align="right">{budget}</TableCell>
                                      <TableCell align="right">
                                        {violation.overagePercent.toFixed(1)}%
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Collapse>
                      </Box>
                    )
                  ))
                )}
              </Box>
            ) : (
              // Budgets tab
              <Box>
                {Object.entries(getPerformanceBudget()).map(([category, budgets]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        py: 1,
                        borderBottom: 1,
                        borderColor: 'divider'
                      }}
                      onClick={() => toggleExpanded(category)}
                    >
                      <Typography variant="subtitle2">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Typography>
                      <IconButton size="small">
                        {expanded[category] ? (
                          <ExpandMoreIcon style={{ transform: 'rotate(180deg)' }} />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </Box>
                    
                    <Collapse in={expanded[category]}>
                      <TableContainer sx={{ mt: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Item</TableCell>
                              <TableCell align="right">Budget</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(budgets).map(([name, value]) => {
                              // Format value based on category
                              let formattedValue;
                              
                              if (category === 'bundleSizes') {
                                if (value >= 1024 * 1024) {
                                  formattedValue = `${(value / 1024 / 1024).toFixed(2)} MB`;
                                } else {
                                  formattedValue = `${(value / 1024).toFixed(2)} KB`;
                                }
                              } else {
                                formattedValue = `${value} ms`;
                              }
                              
                              return (
                                <TableRow key={`${category}-${name}`}>
                                  <TableCell>{name}</TableCell>
                                  <TableCell align="right">{formattedValue}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Collapse>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>
      
      {/* Report dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Performance Budget Report
          <IconButton
            aria-label="close"
            onClick={() => setReportDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          </Box>
          
          <iframe
            srcDoc={reportHtml}
            style={{ width: '100%', height: '70vh', border: 'none' }}
            title="Performance Budget Report"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/**
 * Violation summary chip component
 */
const ViolationChip = ({ label, count, onClick }) => {
  let color = 'success';
  let icon = null;
  
  if (count > 0) {
    color = count > 5 ? 'error' : 'warning';
    icon = count > 5 ? <ErrorIcon /> : <WarningIcon />;
  } else {
    icon = <CheckIcon />;
  }
  
  return (
    <Tooltip title={`${count} ${label} violation${count !== 1 ? 's' : ''}`}>
      <Chip
        label={`${label}: ${count}`}
        color={color}
        icon={icon}
        onClick={onClick}
        sx={{ cursor: 'pointer' }}
      />
    </Tooltip>
  );
};

PerformanceBudgetPanel.propTypes = {
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  autoExpandViolations: PropTypes.bool,
  initiallyOpen: PropTypes.bool,
  refreshInterval: PropTypes.number,
  logToConsole: PropTypes.bool
};

ViolationChip.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};

export default PerformanceBudgetPanel;