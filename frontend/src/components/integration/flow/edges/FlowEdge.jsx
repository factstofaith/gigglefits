import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Flow Edge
                                                                                      *
                                                                                      * A custom edge component for the integration flow canvas.
                                                                                      * This component visualizes the connection between nodes with validation indicators
                                                                                      * and interactive controls for edge management.
                                                                                      *
                                                                                      * @component
                                                                                      */
import React, { memo, useState, useCallback, useEffect } from 'react';
import { getBezierPath, getMarkerEnd } from 'reactflow';
import { Typography, Tooltip, Box, Popover, IconButton, Chip, Menu, MenuItem, ListItemIcon, ListItemText, Fade } from '@mui/material';
import { Check as CheckIcon, Error as ErrorIcon, Info as InfoIcon, Delete as DeleteIcon, Label as LabelIcon, Settings as SettingsIcon, BugReport as BugReportIcon, PlayArrow as TestIcon, ExpandMore as ExpandMoreIcon, TrendingFlat as FlowIcon, PriorityHigh as PriorityIcon, Bolt as DataFlowIcon, EventNote as EventIcon, SettingsEthernet as ControlIcon } from '@mui/icons-material';

// Connection type definitions
const CONNECTION_TYPES = {
  DATA: {
    label: 'Data',
    icon: DataFlowIcon,
    description: 'Transfers data records between nodes',
    color: '#2196F3'
  },
  CONTROL: {
    label: 'Control',
    icon: ControlIcon,
    description: 'Controls execution flow between nodes',
    color: '#9C27B0'
  },
  EVENT: {
    label: 'Event',
    icon: EventIcon,
    description: 'Triggers based on events',
    color: '#FF9800'
  }
};

// Map edge types to colors based on source/target nodes
const EDGE_TYPES = {
  'sourceNode-destinationNode': '#4CAF50',
  // Green
  'sourceNode-transformationNode': '#FF9800',
  // Orange
  'sourceNode-filterNode': '#9C27B0',
  // Purple
  'transformationNode-destinationNode': '#2196F3',
  // Blue
  'transformationNode-transformationNode': '#FF9800',
  // Orange
  'transformationNode-filterNode': '#9C27B0',
  // Purple
  'filterNode-destinationNode': '#2196F3',
  // Blue
  'filterNode-transformationNode': '#FF9800',
  // Orange
  'filterNode-filterNode': '#9C27B0',
  // Purple
  'default': '#666666' // Default gray
};

// Priority levels for connections
const PRIORITY_LEVELS = {
  HIGH: {
    label: 'High',
    color: '#f44336'
  },
  MEDIUM: {
    label: 'Medium',
    color: '#ff9800'
  },
  LOW: {
    label: 'Low',
    color: '#4caf50'
  }
};

/**
 * Edge context menu for edge actions
 */
const EdgeContextMenu = memo(({
  anchorEl,
  open,
  onClose,
  onDelete,
  onLabelEdit,
  onPriorityChange,
  onConnectionTypeChange,
  onTest,
  onAddBreakpoint,
  connectionType,
  priority
}) => {
  return <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'center'
  }} transformOrigin={{
    vertical: 'top',
    horizontal: 'center'
  }}>

      <MenuItem onClick={onLabelEdit}>
        <ListItemIcon>
          <LabelIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Label</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={e => {
      e.stopPropagation();
      e.preventDefault();
    }}>

        <ListItemIcon>
          <FlowIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Connection Type</ListItemText>
        <ExpandMoreIcon fontSize="small" />
        
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={e => e.stopPropagation()} anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }} transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}>

          {Object.entries(CONNECTION_TYPES).map(([type, config]) => {
          const TypeIcon = config.icon;
          return <MenuItem key={type} onClick={() => onConnectionTypeChange(type)} selected={connectionType === type}>

                <ListItemIcon>
                  <TypeIcon fontSize="small" style={{
                color: config.color
              }} />
                </ListItemIcon>
                <ListItemText>{config.label}</ListItemText>
              </MenuItem>;
        })}
        </Menu>
      </MenuItem>
      
      <MenuItem onClick={e => {
      e.stopPropagation();
      e.preventDefault();
    }}>

        <ListItemIcon>
          <PriorityIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Priority</ListItemText>
        <ExpandMoreIcon fontSize="small" />
        
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={e => e.stopPropagation()} anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }} transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}>

          {Object.entries(PRIORITY_LEVELS).map(([level, config]) => <MenuItem key={level} onClick={() => onPriorityChange(level)} selected={priority === level}>

              <ListItemIcon>
                <Box component="span" sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: config.color,
              display: 'inline-block'
            }} />

              </ListItemIcon>
              <ListItemText>{config.label}</ListItemText>
            </MenuItem>)}

        </Menu>
      </MenuItem>
      
      <MenuItem onClick={onAddBreakpoint}>
        <ListItemIcon>
          <BugReportIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Add Breakpoint</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={onTest}>
        <ListItemIcon>
          <TestIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Test Connection</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={onDelete}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Delete" primaryTypographyProps={{
        color: 'error'
      }} />
      </MenuItem>
    </Menu>;
});

/**
 * Flow Edge component
 */
const FlowEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  arrowHeadType,
  markerEndId,
  selected,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  onClick,
  edgeUpdaterRadius
}) => {
  const [formError, setFormError] = useState(null);
  // State for edge interaction
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [edgeValidation, setEdgeValidation] = useState(null);

  // Get animated status from data
  const isAnimated = data?.animated ?? false;

  // Determine connection type based on source and target node types
  const sourceType = source?.split('-')[0] || 'unknown';
  const targetType = target?.split('-')[0] || 'unknown';
  const connectionType = `${sourceType}-${targetType}`;

  // Get edge color based on connection type
  const connectionData = data?.connectionType ? CONNECTION_TYPES[data.connectionType] : null;
  const edgeColor = connectionData?.color || EDGE_TYPES[connectionType] || EDGE_TYPES.default;

  // Get priority data
  const priorityData = data?.priority ? PRIORITY_LEVELS[data.priority] : null;

  // Merge custom style with defaults
  const edgeStyle = {
    stroke: edgeColor,
    strokeWidth: selected ? 3 : 2,
    ...style
  };

  // Apply dashed style for control and event connections
  if (data?.connectionType === 'CONTROL' || data?.connectionType === 'EVENT') {
    edgeStyle.strokeDasharray = '5,5';
  }

  // Apply animation for animated edges
  if (isAnimated) {
    edgeStyle.strokeDasharray = '5,5';
    edgeStyle.animation = 'flowAnimation 1s linear infinite';
  }

  // Get path and label position
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  // Get marker end (arrow)
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  // Calculate center point for label manually
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  // Determine if edge has errors based on data.validation or data.error
  const validationData = data?.validation || {};
  const hasError = validationData.hasError || data?.error;
  const hasWarning = validationData.hasWarning || data?.warning;
  const isValidated = validationData.isValid || data?.validated;

  // Get validation message
  const validationMessage = validationData.message || data?.message || (hasError ? 'Invalid connection' : hasWarning ? 'Warning' : 'Valid connection');

  // Function to show edge context menu
  const handleContextMenu = useCallback(event => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  }, []);

  // Function to close edge context menu
  const handleCloseContextMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Function to handle edge deletion
  const handleDelete = useCallback(() => {
    if (data?.onDelete) {
      data.onDelete(id);
    }
    handleCloseContextMenu();
  }, [data, id, handleCloseContextMenu]);

  // Function to handle label editing
  const handleLabelEdit = useCallback(() => {
    if (data?.onLabelEdit) {
      data.onLabelEdit(id);
    }
    handleCloseContextMenu();
  }, [data, id, handleCloseContextMenu]);

  // Function to handle connection type change
  const handleConnectionTypeChange = useCallback(type => {
    if (data?.onConnectionTypeChange) {
      data.onConnectionTypeChange(id, type);
    }
    handleCloseContextMenu();
  }, [data, id, handleCloseContextMenu]);

  // Function to handle priority change
  const handlePriorityChange = useCallback(priority => {
    if (data?.onPriorityChange) {
      data.onPriorityChange(id, priority);
    }
    handleCloseContextMenu();
  }, [data, id, handleCloseContextMenu]);

  // Function to handle connection testing
  const handleTest = useCallback(() => {
    if (data?.onTest) {
      data.onTest(id);
    }
    handleCloseContextMenu();
  }, [data, id, handleCloseContextMenu]);

  // Function to handle breakpoint addition
  const handleAddBreakpoint = useCallback(() => {
    if (data?.onAddBreakpoint) {
      data.onAddBreakpoint(id);
    }
    handleCloseContextMenu();
  }, [data, id, handleCloseContextMenu]);

  // Validate edge on mount and when source/target change
  useEffect(() => {
    const validateEdge = async () => {
      // Skip validation if there's no validation function
      if (!data?.onValidate) return;
      try {
        const result = await data.onValidate({
          source,
          target,
          sourceHandleId,
          targetHandleId,
          data
        });
        setEdgeValidation(result);
      } catch (error) {
        console.error('Edge validation error:', error);
        setEdgeValidation({
          isValid: false,
          hasError: true,
          message: error.message || 'Validation error'
        });
      }
    };
    validateEdge();
  }, [source, target, sourceHandleId, targetHandleId, data]);

  // Use both passed validation and calculated validation
  const finalValidation = edgeValidation || validationData;

  // Determine path styling based on validation, priority and hover state
  const getPathStyle = () => {
    let pathStyle = {
      ...edgeStyle
    };

    // Apply validation colors if not already set by connection type
    if (finalValidation?.hasError) {
      pathStyle.stroke = '#f44336'; // Error red
    } else if (finalValidation?.hasWarning) {
      pathStyle.stroke = '#ff9800'; // Warning orange
    }

    // Apply priority color if set and no validation errors
    if (priorityData && !finalValidation?.hasError) {
      pathStyle.stroke = priorityData.color;
    }

    // Highlight on hover or selection
    if (isHovered || selected) {
      pathStyle.strokeWidth = 3;
      pathStyle.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.3))';
    }
    return pathStyle;
  };
  return <>
      {/* Edge background (slightly wider for easier selection) */}
      <path className="react-flow__edge-interaction-path" d={edgePath} strokeWidth={15} stroke="transparent" fill="none" onClick={onClick} onContextMenu={handleContextMenu} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} />

      
      {/* Main edge path */}
      <path id={id} style={getPathStyle()} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} onContextMenu={handleContextMenu} />

      
      {/* Flow animation for data flow */}
      {isAnimated && <path className="react-flow__edge-path react-flow__edge-animated" d={edgePath} style={{
      stroke: edgeColor,
      strokeWidth: 2,
      strokeDasharray: '5,5',
      animation: 'flowAnimation 1s linear infinite'
    }} />}


      
      {/* Connection type indicator */}
      {connectionData && <foreignObject width={24} height={24} x={labelX - 24 - 5} y={labelY - 12} requiredExtensions="http://www.w3.org/1999/xhtml" className="react-flow__edge-type-indicator">

          <Tooltip title={`${connectionData.label} Connection: ${connectionData.description}`}>
            <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '4px',
          backgroundColor: 'background.paper',
          border: `1px solid ${connectionData.color}`,
          boxShadow: 1
        }}>

              <connectionData.icon style={{
            color: connectionData.color,
            fontSize: 16
          }} />

            </Box>
          </Tooltip>
        </foreignObject>}

      
      {/* Edge validation indicator */}
      {(finalValidation?.hasError || finalValidation?.hasWarning || finalValidation?.isValid) && <Tooltip title={finalValidation.message || validationMessage}>
          <foreignObject width={20} height={20} x={centerX - 10} y={centerY - 10} requiredExtensions="http://www.w3.org/1999/xhtml" className="react-flow__edge-validation">

            <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: finalValidation.hasError ? '#f44336' : finalValidation.hasWarning ? '#ff9800' : '#4caf50',
          color: '#fff',
          boxShadow: 1
        }}>

              {finalValidation.hasError ? <ErrorIcon style={{
            fontSize: 14
          }} /> : finalValidation.hasWarning ? <InfoIcon style={{
            fontSize: 14
          }} /> : <CheckIcon style={{
            fontSize: 14
          }} />}

            </Box>
          </foreignObject>
        </Tooltip>}

      
      {/* Priority indicator */}
      {priorityData && <foreignObject width={24} height={24} x={labelX + 5} y={labelY - 12} requiredExtensions="http://www.w3.org/1999/xhtml" className="react-flow__edge-priority">

          <Tooltip title={`${priorityData.label} Priority`}>
            <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '4px',
          backgroundColor: 'background.paper',
          border: `1px solid ${priorityData.color}`,
          boxShadow: 1
        }}>

              <PriorityIcon style={{
            color: priorityData.color,
            fontSize: 16
          }} />

            </Box>
          </Tooltip>
        </foreignObject>}

      
      {/* Breakpoint indicator */}
      {data?.breakpoint && <foreignObject width={20} height={20} x={(centerX + labelX) / 2 - 10} y={(centerY + labelY) / 2 - 10} requiredExtensions="http://www.w3.org/1999/xhtml" className="react-flow__edge-breakpoint">

          <Tooltip title="Breakpoint">
            <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: '#e91e63',
          color: '#fff',
          boxShadow: 1
        }}>

              <BugReportIcon style={{
            fontSize: 14
          }} />
            </Box>
          </Tooltip>
        </foreignObject>}

      
      {/* Edge label */}
      {data?.label && <foreignObject width={100} height={30} x={labelX - 50} y={labelY - 15} requiredExtensions="http://www.w3.org/1999/xhtml" className="react-flow__edge-label">

          <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '2px 4px',
        borderRadius: 1,
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: 1,
        transition: 'all 0.2s',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: 2
        }
      }} onClick={e => {
        e.stopPropagation();
        if (data?.onLabelEdit) {
          data.onLabelEdit(id);
        }
      }}>

            <Typography variant="caption" align="center" noWrap sx={{
          fontWeight: selected ? 'bold' : 'normal'
        }}>

              {data.label}
            </Typography>
          </Box>
        </foreignObject>}

      
      {/* Edge context menu */}
      <EdgeContextMenu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseContextMenu} onDelete={handleDelete} onLabelEdit={handleLabelEdit} onConnectionTypeChange={handleConnectionTypeChange} onPriorityChange={handlePriorityChange} onTest={handleTest} onAddBreakpoint={handleAddBreakpoint} connectionType={data?.connectionType} priority={data?.priority} />

      
      {/* Quick action buttons on hover/select */}
      {(isHovered || selected) && <foreignObject width={72} height={24} x={centerX - 36} y={centerY - 36} requiredExtensions="http://www.w3.org/1999/xhtml" className="react-flow__edge-actions">

          <Fade in={true}>
            <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 2,
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}>

              <Tooltip title="Settings">
                <IconButton size="small" onClick={handleContextMenu} sx={{
              width: 24,
              height: 24
            }}>

                  <SettingsIcon style={{
                fontSize: 14
              }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Test">
                <IconButton size="small" onClick={handleTest} sx={{
              width: 24,
              height: 24
            }}>

                  <TestIcon style={{
                fontSize: 14
              }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={handleDelete} sx={{
              width: 24,
              height: 24
            }}>

                  <DeleteIcon style={{
                fontSize: 14
              }} color="error" />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        </foreignObject>}

    </>;
});
export default FlowEdge;