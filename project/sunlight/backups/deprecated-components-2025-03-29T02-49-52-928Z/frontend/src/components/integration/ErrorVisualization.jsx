import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Badge,
  Divider,
  useTheme
} from '../../design-system/adapter';
import { 
import { Box } from '../../design-system';
// Design system import already exists;
;
ERROR_SEVERITY, 
  createFlowError, 
  groupErrors, 
  filterErrors, 
  getErrorMessage, 
  getRecoveryStrategy
} from '../../utils/errorHandling';

/**
 * Component that visualizes errors in the flow canvas
 */
export const ErrorVisualization = ({ 
  errors, 
  flowData, 
  onErrorClick, 
  onErrorHover, 
  onErrorDismiss, 
  isVisible = true
}) => {
  // Added display name
  ErrorVisualization.displayName = 'ErrorVisualization';

  // Added display name
  ErrorVisualization.displayName = 'ErrorVisualization';

  // Added display name
  ErrorVisualization.displayName = 'ErrorVisualization';

  // Added display name
  ErrorVisualization.displayName = 'ErrorVisualization';

  // Added display name
  ErrorVisualization.displayName = 'ErrorVisualization';


  const [filteredErrors, setFilteredErrors] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    severity: null,
    type: null,
    nodeId: null,
    edgeId: null
  });
  const [groupBy, setGroupBy] = useState('severity');
  const [groupedErrors, setGroupedErrors] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  // Process errors when they change or filters change
  useEffect(() => {
    // Apply active filters
    let filtered = errors;
    
    if (activeFilters.severity) {
      filtered = filtered.filter(error => error.severity === activeFilters.severity);
    }
    
    if (activeFilters.type) {
      filtered = filtered.filter(error => error.type === activeFilters.type);
    }
    
    if (activeFilters.nodeId) {
      filtered = filtered.filter(error => error.nodeId === activeFilters.nodeId);
    }
    
    if (activeFilters.edgeId) {
      filtered = filtered.filter(error => error.edgeId === activeFilters.edgeId);
    }
    
    // Prioritize errors
    const prioritized = prioritizeErrors(filtered);
    setFilteredErrors(prioritized);
    
    // Group errors
    const grouped = groupErrors(prioritized, groupBy);
    setGroupedErrors(grouped);
    
    // Initialize expanded groups
    if (Object.keys(expandedGroups).length === 0) {
      const initialExpandedGroups = {};
      Object.keys(grouped).forEach(group => {
        // Automatically expand groups with errors of FATAL or ERROR severity
        const hasCriticalErrors = grouped[group].some(
          error => error.severity === ErrorSeverity.FATAL || error.severity === ErrorSeverity.ERROR
        );
        initialExpandedGroups[group] = hasCriticalErrors;
      });
      setExpandedGroups(initialExpandedGroups);
    }
  }, [errors, activeFilters, groupBy]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupKey) => {
  // Added display name
  toggleGroup.displayName = 'toggleGroup';

    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  }, []);

  // Update filter
  const updateFilter = useCallback((filterKey, value) => {
  // Added display name
  updateFilter.displayName = 'updateFilter';

    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey] === value ? null : value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
  // Added display name
  clearFilters.displayName = 'clearFilters';

    setActiveFilters({
      severity: null,
      type: null,
      nodeId: null,
      edgeId: null
    });
  }, []);

  // Change grouping
  const changeGrouping = useCallback((newGroupBy) => {
  // Added display name
  changeGrouping.displayName = 'changeGrouping';

    setGroupBy(newGroupBy);
    // Reset expanded groups when changing grouping
    setExpandedGroups({});
  }, []);

  // Get node or edge label for the error
  const getErrorLocationLabel = useCallback((error) => {
  // Added display name
  getErrorLocationLabel.displayName = 'getErrorLocationLabel';

    if (error.nodeId) {
      const node = flowData?.nodes?.find(n => n.id === error.nodeId);
      return node ? `${node.data.label || node.id}` : `Node ${error.nodeId}`;
    }
    
    if (error.edgeId) {
      const edge = flowData?.edges?.find(e => e.id === error.edgeId);
      if (edge) {
        const sourceNode = flowData?.nodes?.find(n => n.id === edge.source);
        const targetNode = flowData?.nodes?.find(n => n.id === edge.target);
        const sourceLabel = sourceNode?.data?.label || edge.source;
        const targetLabel = targetNode?.data?.label || edge.target;
        return `${sourceLabel} → ${targetLabel}`;
      }
      return `Connection ${error.edgeId}`;
    }
    
    return 'Flow';
  }, [flowData]);

  // If not visible, return null
  if (!isVisible) {
    return null;
  }

  const theme = useTheme();
  
  // Map severity to theme colors
  const severityColors = {
    [ERROR_SEVERITY.FATAL]: theme.palette.error.main,
    [ERROR_SEVERITY.ERROR]: theme.palette.error.light,
    [ERROR_SEVERITY.WARNING]: theme.palette.warning.main,
    [ERROR_SEVERITY.INFO]: theme.palette.info.main,
  };

  // If no errors, show a success message
  if (errors.length === 0) {
    return (
      <Box
        sx={{
          padding: 2,
          borderRadius: 1,
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.contrastText
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="subtitle1&quot;>
            <Box component="span" sx={{ marginRight: 1 }}>✓</Box>
            No errors detected
          </Typography>
        </Box>
      </Box>
    );
  }

  // Get counts by severity
  const errorCounts = errors.reduce((counts, error) => {
    counts[error.severity] = (counts[error.severity] || 0) + 1;
    return counts;
  }, {});

  return (
    <Paper 
      elevation={2}
      sx={{
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1
      }}
    >
      {/* Header with summary and controls */}
      <Box 
        sx={{
          padding: 2,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6&quot;>
            {errors.length} {errors.length === 1 ? "issue' : 'issues'} detected
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onErrorDismiss && (
              <Button 
                variant="outlined&quot;
                size="small"
                color="secondary&quot;
                onClick={onErrorDismiss}
              >
                Dismiss all
              </Button>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: "flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(errorCounts).map(([severity, count]) => (
            <Badge 
              key={severity}
              badgeContent={count}
              sx={{
                cursor: 'pointer',
                opacity: activeFilters.severity === severity ? 1 : 0.7,
                '&:hover': { opacity: 1 },
                backgroundColor: activeFilters.severity === severity ? 
                  `${severityColors[severity]}22` : 'transparent',
                borderRadius: 1,
                padding: '4px 8px',
                border: activeFilters.severity === severity ?
                  `1px solid ${severityColors[severity]}` : `1px solid transparent`
              }}
              onClick={() => updateFilter('severity', severity)}
            >
              <Typography 
                variant="body2&quot;
                sx={{ 
                  color: severityColors[severity],
                  fontWeight: activeFilters.severity === severity ? "bold' : 'normal'
                }}
              >
                {severity}
              </Typography>
            </Badge>
          ))}
          
          {Object.values(activeFilters).some(filter => filter !== null) && (
            <Button 
              variant="text&quot;
              size="small"
              onClick={clearFilters}
              sx={{ marginLeft: 'auto' }}
            >
              Clear filters
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl size="small&quot; variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel id="group-by-label&quot;>Group by</InputLabel>
            <Select
              labelId="group-by-label"
              value={groupBy}
              onChange={(e) => changeGrouping(e.target.value)}
              label="Group by&quot;
            >
              <MenuItem value="severity">Severity</MenuItem>
              <MenuItem value="type&quot;>Type</MenuItem>
              <MenuItem value="node">Node</MenuItem>
              <MenuItem value="edge&quot;>Connection</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Error groups and details */}
      <Box 
        sx={{
          maxHeight: "400px',
          overflow: 'auto',
          padding: 1
        }}
      >
        {Object.entries(groupedErrors).map(([groupKey, groupErrors]) => (
          <Paper
            key={groupKey}
            elevation={0}
            sx={{
              marginBottom: 1,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1
            }}
          >
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 1,
                cursor: 'pointer',
                backgroundColor: theme.palette.background.paper,
                '&:hover': { backgroundColor: theme.palette.action.hover }
              }}
              onClick={() => toggleGroup(groupKey)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                <Typography variant="body1&quot; sx={{ marginRight: 0.5 }}>
                  {expandedGroups[groupKey] ? "▼' : '►'}
                </Typography>
                <Typography variant="subtitle2&quot;>
                  {groupKey}
                </Typography>
                <Badge
                  badgeContent={groupErrors.length}
                  color="primary"
                  sx={{ marginLeft: 1 }}
                />
              </Box>
            </Box>
            
            {expandedGroups[groupKey] && (
              <Box sx={{ padding: 1 }}>
                {groupErrors.map(error => {
                  const recoveryStrategy = getRecoveryStrategy(error);
                  
                  return (
                    <Box 
                      key={error.id} 
                      sx={{
                        marginBottom: 1,
                        padding: 1,
                        borderRadius: 1,
                        borderLeft: `4px solid ${severityColors[error.severity]}`,
                        backgroundColor: `${severityColors[error.severity]}11`,
                        cursor: onErrorClick ? 'pointer' : 'default',
                        '&:hover': onErrorClick ? { 
                          backgroundColor: `${severityColors[error.severity]}22` 
                        } : {}
                      }}
                      onClick={() => onErrorClick && onErrorClick(error)}
                      onMouseEnter={() => onErrorHover && onErrorHover(error, true)}
                      onMouseLeave={() => onErrorHover && onErrorHover(error, false)}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 0.5
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Badge 
                            sx={{
                              backgroundColor: `${severityColors[error.severity]}22`,
                              color: severityColors[error.severity],
                              borderRadius: 1,
                              padding: '2px 6px'
                            }}
                          >
                            {error.type}
                          </Badge>
                          <Typography variant="body2&quot; sx={{ fontWeight: "medium' }}>
                            {getErrorLocationLabel(error)}
                          </Typography>
                        </Box>
                        <Typography variant="caption&quot; color="text.secondary">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ marginY: 1 }}>
                        <Typography variant="body2&quot;>
                          {getErrorMessage(error.type, error.code, error.details)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary&quot; sx={{ marginTop: 0.5 }}>
                          {recoveryStrategy.description}
                        </Typography>
                      </Box>
                      
                      {error.occurrenceCount > 1 && (
                        <Typography variant="caption" sx={{ display: 'block', marginTop: 0.5 }}>
                          Occurred {error.occurrenceCount} times
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        ))}
      </Box>
    </Paper>
  );
};

ErrorVisualization.propTypes = {
  errors: PropTypes.array.isRequired,
  flowData: PropTypes.object,
  onErrorClick: PropTypes.func,
  onErrorHover: PropTypes.func,
  onErrorDismiss: PropTypes.func,
  isVisible: PropTypes.bool
};

/**
 * ErrorIndicator component that shows a small indicator in the canvas
 * when errors are present but the full error panel is not visible
 */
export const ErrorIndicator = ({ 
  errors, 
  onClick, 
  position = 'bottom-right'
}) => {
  // Added display name
  ErrorIndicator.displayName = 'ErrorIndicator';

  // Added display name
  ErrorIndicator.displayName = 'ErrorIndicator';

  // Added display name
  ErrorIndicator.displayName = 'ErrorIndicator';

  // Added display name
  ErrorIndicator.displayName = 'ErrorIndicator';

  // Added display name
  ErrorIndicator.displayName = 'ErrorIndicator';


  const theme = useTheme();
  
  if (!errors || errors.length === 0) {
    return null;
  }
  
  // Get counts by severity
  const errorCounts = errors.reduce((counts, error) => {
    counts[error.severity] = (counts[error.severity] || 0) + 1;
    return counts;
  }, {});
  
  // Determine highest severity
  const hasFatal = errorCounts[ERROR_SEVERITY.FATAL] > 0;
  const hasError = errorCounts[ERROR_SEVERITY.ERROR] > 0;
  const hasWarning = errorCounts[ERROR_SEVERITY.WARNING] > 0;
  
  let highestSeverity = ERROR_SEVERITY.INFO;
  if (hasFatal) highestSeverity = ERROR_SEVERITY.FATAL;
  else if (hasError) highestSeverity = ERROR_SEVERITY.ERROR;
  else if (hasWarning) highestSeverity = ERROR_SEVERITY.WARNING;
  
  // Map severity to theme colors
  const severityColors = {
    [ERROR_SEVERITY.FATAL]: theme.palette.error.main,
    [ERROR_SEVERITY.ERROR]: theme.palette.error.light,
    [ERROR_SEVERITY.WARNING]: theme.palette.warning.main,
    [ERROR_SEVERITY.INFO]: theme.palette.info.main,
  };

  // Position styles
  const positionStyles = {
    'top-left': { top: 12, left: 12 },
    'top-right': { top: 12, right: 12 },
    'bottom-left': { bottom: 12, left: 12 },
    'bottom-right': { bottom: 12, right: 12 }
  };
  
  return (
    <Box 
      sx={{
        position: 'absolute',
        ...positionStyles[position],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: severityColors[highestSeverity],
        color: '#fff',
        borderRadius: '50%',
        width: 56,
        height: 56,
        cursor: 'pointer',
        boxShadow: 3,
        zIndex: 100,
        '&:hover': {
          opacity: 0.9,
          transform: 'scale(1.05)'
        },
        transition: 'all 0.2s ease'
      }}
      onClick={onClick}
    >
      <Typography variant="h6&quot; sx={{ fontWeight: "bold', lineHeight: 1 }}>
        {errors.length}
      </Typography>
      <Typography variant="caption&quot; sx={{ textTransform: "uppercase', fontSize: '0.6rem' }}>
        {errors.length === 1 ? 'issue' : 'issues'}
      </Typography>
    </Box>
  );
};

ErrorIndicator.propTypes = {
  errors: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  position: PropTypes.oneOf([
    'top-left', 'top-right', 'bottom-left', 'bottom-right'
  ])
};

/**
 * NodeErrorHighlight component that highlights a node with errors
 */
export const NodeErrorHighlight = ({ 
  nodeId, 
  errors, 
  isHovered = false 
}) => {
  // Added display name
  NodeErrorHighlight.displayName = 'NodeErrorHighlight';

  // Added display name
  NodeErrorHighlight.displayName = 'NodeErrorHighlight';

  // Added display name
  NodeErrorHighlight.displayName = 'NodeErrorHighlight';

  // Added display name
  NodeErrorHighlight.displayName = 'NodeErrorHighlight';

  // Added display name
  NodeErrorHighlight.displayName = 'NodeErrorHighlight';


  const theme = useTheme();
  
  // Filter errors for this node
  const nodeErrors = errors.filter(error => error.nodeId === nodeId);
  
  if (nodeErrors.length === 0) {
    return null;
  }
  
  // Determine highest severity
  const hasFatal = nodeErrors.some(error => error.severity === ERROR_SEVERITY.FATAL);
  const hasError = nodeErrors.some(error => error.severity === ERROR_SEVERITY.ERROR);
  const hasWarning = nodeErrors.some(error => error.severity === ERROR_SEVERITY.WARNING);
  
  let highestSeverity = ERROR_SEVERITY.INFO;
  if (hasFatal) highestSeverity = ERROR_SEVERITY.FATAL;
  else if (hasError) highestSeverity = ERROR_SEVERITY.ERROR;
  else if (hasWarning) highestSeverity = ERROR_SEVERITY.WARNING;
  
  // Map severity to theme colors
  const severityColors = {
    [ERROR_SEVERITY.FATAL]: theme.palette.error.main,
    [ERROR_SEVERITY.ERROR]: theme.palette.error.light,
    [ERROR_SEVERITY.WARNING]: theme.palette.warning.main,
    [ERROR_SEVERITY.INFO]: theme.palette.info.main,
  };
  
  return (
    <Box 
      sx={{
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: severityColors[highestSeverity],
        color: 'white',
        borderRadius: '50%',
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        boxShadow: isHovered ? 3 : 1,
        border: `2px solid ${theme.palette.background.paper}`,
        transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}
    >
      {nodeErrors.length}
    </Box>
  );
};

NodeErrorHighlight.propTypes = {
  nodeId: PropTypes.string.isRequired,
  errors: PropTypes.array.isRequired,
  isHovered: PropTypes.bool
};

/**
 * EdgeErrorHighlight component that highlights an edge with errors
 */
export const EdgeErrorHighlight = ({ 
  edgeId, 
  errors, 
  isHovered = false 
}) => {
  // Added display name
  EdgeErrorHighlight.displayName = 'EdgeErrorHighlight';

  // Added display name
  EdgeErrorHighlight.displayName = 'EdgeErrorHighlight';

  // Added display name
  EdgeErrorHighlight.displayName = 'EdgeErrorHighlight';

  // Added display name
  EdgeErrorHighlight.displayName = 'EdgeErrorHighlight';

  // Added display name
  EdgeErrorHighlight.displayName = 'EdgeErrorHighlight';


  const theme = useTheme();
  
  // Filter errors for this edge
  const edgeErrors = errors.filter(error => error.edgeId === edgeId);
  
  if (edgeErrors.length === 0) {
    return null;
  }
  
  // Determine highest severity
  const hasFatal = edgeErrors.some(error => error.severity === ERROR_SEVERITY.FATAL);
  const hasError = edgeErrors.some(error => error.severity === ERROR_SEVERITY.ERROR);
  const hasWarning = edgeErrors.some(error => error.severity === ERROR_SEVERITY.WARNING);
  
  let highestSeverity = ERROR_SEVERITY.INFO;
  if (hasFatal) highestSeverity = ERROR_SEVERITY.FATAL;
  else if (hasError) highestSeverity = ERROR_SEVERITY.ERROR;
  else if (hasWarning) highestSeverity = ERROR_SEVERITY.WARNING;
  
  // Map severity to theme colors
  const severityColors = {
    [ERROR_SEVERITY.FATAL]: theme.palette.error.main,
    [ERROR_SEVERITY.ERROR]: theme.palette.error.light,
    [ERROR_SEVERITY.WARNING]: theme.palette.warning.main,
    [ERROR_SEVERITY.INFO]: theme.palette.info.main,
  };
  
  return (
    <Box 
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 8,
          border: `2px dashed ${severityColors[highestSeverity]}`,
          boxShadow: isHovered ? 
            `0 0 0 3px ${severityColors[highestSeverity]}44` : 
            `0 0 0 1px ${severityColors[highestSeverity]}22`,
          opacity: isHovered ? 0.9 : 0.7,
          animation: isHovered ? 'pulse 1.5s infinite' : 'none',
          transition: 'all 0.2s ease'
        },
        '@keyframes pulse': {
          '0%': { opacity: 0.5 },
          '50%': { opacity: 0.9 },
          '100%': { opacity: 0.5 }
        }
      }}
    />
  );
};

EdgeErrorHighlight.propTypes = {
  edgeId: PropTypes.string.isRequired,
  errors: PropTypes.array.isRequired,
  isHovered: PropTypes.bool
};

export default {
  ErrorVisualization,
  ErrorIndicator,
  NodeErrorHighlight,
  EdgeErrorHighlight
};