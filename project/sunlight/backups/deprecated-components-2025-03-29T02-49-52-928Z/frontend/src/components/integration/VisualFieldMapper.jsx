/**
 * @component VisualFieldMapper
 * @description An enhanced field mapping tool that allows users to visually
 * connect source fields to destination fields with drag-and-drop, supporting
 * multiple inputs and outputs for complex transformations.
 *
 * Key features:
 * - Drag-and-drop interface for mapping fields
 * - Support for multiple input and output connections
 * - Connection type validation and visual feedback
 * - Advanced transformations with custom expressions
 * - Support for router node conditions and routing rules
 * - Multi-source join operations and field concatenation
 * - Split operations to multiple destination fields
 * - Schema discovery integration
 * - Compatible with complex node configurations
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// Import all design system components from the adapter layer
import {
  Box,
  Typography,
  Button,
  TextField,
  Tabs,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon, 
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Menu,
  MenuItem,
  Tab,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Badge,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Popover,
  useTheme,
  alpha,
} from '../../design-system/adapter';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import NumbersIcon from '@mui/icons-material/Numbers';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ViewArrayIcon from '@mui/icons-material/ViewArray';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FilterListIcon from '@mui/icons-material/FilterList';
import FunctionsIcon from '@mui/icons-material/Functions';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import HubIcon from '@mui/icons-material/Hub';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PanToolIcon from '@mui/icons-material/PanTool';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// Removed duplicate import
// Removed duplicate import
// Import react-xarrows for connection drawing
// Note: In a real implementation, you'd need to install this package
// npm install react-xarrows
const Xarrow = ({ start, end, ...props }) => {
  // Added display name
  Xarrow.displayName = 'Xarrow';

  // Added display name
  Xarrow.displayName = 'Xarrow';

  // Added display name
  Xarrow.displayName = 'Xarrow';

  // Added display name
  Xarrow.displayName = 'Xarrow';

  // Added display name
  Xarrow.displayName = 'Xarrow';


  // Use design system theme
  const theme = useTheme();

  // Simplified mock implementation for demo purposes
  return (
    <Box
      style={{
        position: 'absolute',
        height: '2px',
        backgroundColor: props.color || theme.palette.primary.main,
        zIndex: 10,
        transformOrigin: '0 0',
        // This is just for demonstration - in production use react-xarrows
      }}
    />
  );
};

// Helper components
const FieldItem = ({
  field,
  index,
  side,
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
  isConnected,
  isCompatible,
  isDragging,
  isSelected,
}) => {
  // Added display name
  FieldItem.displayName = 'FieldItem';

  // Added display name
  FieldItem.displayName = 'FieldItem';

  // Added display name
  FieldItem.displayName = 'FieldItem';

  // Added display name
  FieldItem.displayName = 'FieldItem';

  // Added display name
  FieldItem.displayName = 'FieldItem';


  const theme = useTheme();
  const fieldRef = useRef(null);

  // Determine field type icon
  const getTypeIcon = () => {
  // Added display name
  getTypeIcon.displayName = 'getTypeIcon';

  // Added display name
  getTypeIcon.displayName = 'getTypeIcon';

  // Added display name
  getTypeIcon.displayName = 'getTypeIcon';

  // Added display name
  getTypeIcon.displayName = 'getTypeIcon';

  // Added display name
  getTypeIcon.displayName = 'getTypeIcon';


    switch (field.type.toLowerCase()) {
      case 'string':
        return <TextFieldsIcon fontSize="small&quot; />;
      case "number':
      case 'integer':
      case 'float':
      case 'double':
        return <NumbersIcon fontSize="small&quot; />;
      case "boolean':
        return <ToggleOnIcon fontSize="small&quot; />;
      case "date':
      case 'datetime':
      case 'timestamp':
        return <DateRangeIcon fontSize="small&quot; />;
      case "array':
        return <ViewArrayIcon fontSize="small&quot; />;
      case "object':
        return <AccountTreeIcon fontSize="small&quot; />;
      default:
        return <MoreHorizIcon fontSize="small" />;
    }
  };

  // Determine field style based on state
  const getBorderStyle = () => {
  // Added display name
  getBorderStyle.displayName = 'getBorderStyle';

  // Added display name
  getBorderStyle.displayName = 'getBorderStyle';

  // Added display name
  getBorderStyle.displayName = 'getBorderStyle';

  // Added display name
  getBorderStyle.displayName = 'getBorderStyle';

  // Added display name
  getBorderStyle.displayName = 'getBorderStyle';


    if (isSelected) return `2px solid ${theme.palette.primary.main}`;
    if (isConnected) return `1px solid ${theme.palette.success.main}`;
    if (isDragging && isCompatible) return `1px dashed ${theme.palette.primary.main}`;
    if (isDragging && !isCompatible) return `1px dashed ${theme.palette.error.main}`;
    return '1px solid transparent';
  };

  const getBackgroundColor = () => {
  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';

  // Added display name
  getBackgroundColor.displayName = 'getBackgroundColor';


    if (isSelected) {
      return alpha(theme.palette.primary.main, 0.1);
    }
    if (isConnected) {
      return alpha(theme.palette.success.main, 0.05);
    }
    return theme.palette.background.paper;
  };

  return (
    <Paper
      ref={fieldRef}
      elevation={isSelected ? 3 : 1}
      style={{
        padding: '8px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'all 0.2s',
        border: getBorderStyle(),
        backgroundColor: getBackgroundColor(),
        position: 'relative',
      }}
      draggable
      onDragStart={e => onDragStart(e, field, side)}
      onDragOver={e => onDragOver(e, field, side)}
      onDrop={e => onDrop(e, field, side)}
      onClick={() => onClick(field, side)}
      id={`${side}-field-${field.id || index}`}
    >
      <Box 
        style={{ 
          marginRight: '8px', 
          color: field.required 
            ? theme.palette.error.main
            : theme.palette.text.secondary 
        }}
      >
        {getTypeIcon()}
      </Box>

      <Box style={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2&quot; style={{ overflow: "hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={field.name}>
          {field.name}
        </Typography>

        <Typography 
          variant="caption&quot; 
          color={theme.palette.text.secondary}
          style={{ display: "block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {field.type}
        </Typography>
      </Box>

      {field.required && (
        <Tooltip title="Required field&quot;>
          <Box
            as="span"
            style={{
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              color: theme.palette.error.main,
            }}
          >
            *
          </Box>
        </Tooltip>
      )}

      {isConnected && (
        <Box
          style={{
            position: 'absolute',
            [side === 'source' ? 'right' : 'left']: -4,
            top: '50%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: theme.palette.success.main,
            transform: 'translateY(-50%)',
          }}
        />
      )}
    </Paper>
  );
};

// Transformation settings
const TransformationDialog = ({
  open,
  onClose,
  sourceField,
  destField,
  currentTransform,
  onSaveTransform,
}) => {
  // Added display name
  TransformationDialog.displayName = 'TransformationDialog';

  // Added display name
  TransformationDialog.displayName = 'TransformationDialog';

  // Added display name
  TransformationDialog.displayName = 'TransformationDialog';

  // Added display name
  TransformationDialog.displayName = 'TransformationDialog';

  // Added display name
  TransformationDialog.displayName = 'TransformationDialog';


  const [transformType, setTransformType] = useState('direct');
  const [expression, setExpression] = useState('');
  const [format, setFormat] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (open && currentTransform) {
      setTransformType(currentTransform.type || 'direct');
      setExpression(currentTransform.expression || '');
      setFormat(currentTransform.format || '');
    } else if (open) {
      // Default to direct mapping when opening for a new transformation
      setTransformType('direct');
      setExpression('');
      setFormat('');
      setTestResult(null);
    }
  }, [open, currentTransform]);

  const handleSave = () => {
  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';


    onSaveTransform({
      type: transformType,
      expression: expression.trim(),
      format: format.trim(),
    });
    onClose();
  };

  const handleTest = () => {
  // Added display name
  handleTest.displayName = 'handleTest';

  // Added display name
  handleTest.displayName = 'handleTest';

  // Added display name
  handleTest.displayName = 'handleTest';

  // Added display name
  handleTest.displayName = 'handleTest';

  // Added display name
  handleTest.displayName = 'handleTest';


    setIsEvaluating(true);

    // Simulate evaluation with timeout
    setTimeout(() => {
      try {
        let result;
        const sampleValue = getSampleValueForType(sourceField?.type);

        if (transformType === 'direct') {
          result = sampleValue;
        } else if (transformType === 'format' && format) {
          // Simulate string formatting
          result = format.replace('{value}', String(sampleValue));
        } else if (transformType === 'expression' && expression) {
          // In a real app, this would use a safer evaluation method
          // This is just for illustration
          const func = new Function('value', `return ${expression}`);
          result = func(sampleValue);
        }

        setTestResult({
          success: true,
          input: sampleValue,
          output: result,
          outputType: typeof result,
        });
      } catch (error) {
        setTestResult({
          success: false,
          error: error.message,
        });
      } finally {
        setIsEvaluating(false);
      }
    }, 500);
  };

  // Generate sample values for testing
  const getSampleValueForType = type => {
    if (!type) return 'sample';

    switch (type.toLowerCase()) {
      case 'string':
        return 'sample text';
      case 'number':
      case 'integer':
        return 42;
      case 'float':
      case 'double':
        return 3.14;
      case 'boolean':
        return true;
      case 'date':
        return '2023-05-15';
      case 'datetime':
      case 'timestamp':
        return '2023-05-15T14:30:00Z';
      case 'array':
        return ['item1', 'item2'];
      case 'object':
        return { key: 'value' };
      default:
        return 'sample';
    }
  };

  // Use design system theme
  const theme = useTheme();
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md&quot; fullWidth>
      <DialogTitle>
        Field Transformation
        <Box
          as="button"
          onClick={onClose}
          aria-label="close"
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            background: 'transparent',
            border: 'none',
            padding: '4px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CloseIcon />
        </Box>
      </DialogTitle>

      <DialogContent>
        {sourceField && destField && (
          <>
            <Box style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
              <Box 
                style={{ 
                  padding: '8px', 
                  flex: 1,
                  borderRadius: '4px',
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows?.xs || '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography 
                  variant="caption&quot; 
                  style={{ 
                    color: theme.palette.text.secondary,
                    display: "block'
                  }}
                >
                  Source Field
                </Typography>
                <Typography variant="subtitle2&quot;>
                  {sourceField.name} ({sourceField.type})
                </Typography>
              </Box>

              <ArrowForwardIcon style={{ marginLeft: "16px', marginRight: '16px' }} />

              <Box 
                style={{ 
                  padding: '8px', 
                  flex: 1,
                  borderRadius: '4px',
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows?.xs || '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography 
                  variant="caption&quot; 
                  style={{ 
                    color: theme.palette.text.secondary,
                    display: "block'
                  }}
                >
                  Destination Field
                </Typography>
                <Typography variant="subtitle2&quot;>
                  {destField.name} ({destField.type})
                </Typography>
              </Box>
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel>Transformation Type</InputLabel>
              <Select
                value={transformType}
                onChange={e => setTransformType(e.target.value)}
                label="Transformation Type&quot;
              >
                <MenuItem value="direct">Direct Mapping</MenuItem>
                <MenuItem value="expression&quot;>Expression</MenuItem>
                <MenuItem value="format">Format String</MenuItem>
                <MenuItem value="conditional&quot;>Conditional Value</MenuItem>
              </Select>
            </FormControl>

            {transformType === "direct' && (
              <Alert severity="info&quot; style={{ marginTop: "16px' }}>
                Direct mapping will pass the source field value directly to the destination field
                without any transformation.
              </Alert>
            )}

            {transformType === 'expression' && (
              <>
                <TextField
                  label="Transformation Expression&quot;
                  fullWidth
                  value={expression}
                  onChange={e => setExpression(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="value => value.toUpperCase()"
                  helperText="JavaScript expression that transforms the source value. Use &apos;value" as the input parameter."
                  style={{ marginTop: '16px' }}
                />

                <Box style={{ marginTop: '16px', marginBottom: '8px' }}>
                  <Typography variant="subtitle2&quot;>Examples:</Typography>
                  <Box as="ul" style={{ paddingLeft: '16px', marginTop: '4px' }}>
                    <Typography as="li&quot; variant="body2">
                      <code>value.toUpperCase()</code> - Convert to uppercase
                    </Typography>
                    <Typography as="li&quot; variant="body2">
                      <code>Number(value) * 100</code> - Multiply by 100
                    </Typography>
                    <Typography as="li&quot; variant="body2">
                      <code>value ? "Active" : "Inactive"</code> - Convert boolean to text
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {transformType === 'format' && (
              <TextField
                label="Format String&quot;
                fullWidth
                value={format}
                onChange={e => setFormat(e.target.value)}
                placeholder="Prefix: {value}"
                helperText="Format string with {value} as placeholder for the source value&quot;
                style={{ marginTop: "16px' }}
              />
            )}

            {transformType === 'conditional' && (
              <Box style={{ marginTop: '16px' }}>
                <Typography variant="subtitle2&quot; style={{ marginBottom: "8px' }}>
                  Conditional Value Transformation
                </Typography>

                <Alert severity="info&quot; style={{ marginBottom: "16px' }}>
                  Conditional transformations are not yet implemented in this version.
                </Alert>

                {/* This would be replaced with actual UI for conditional logic */}
                <Box 
                  style={{ 
                    padding: '16px', 
                    backgroundColor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '4px'
                  }}
                >
                  <Typography 
                    variant="body2&quot; 
                    style={{ color: theme.palette.text.secondary }}
                  >
                    Conditional value mapping UI would be implemented here.
                  </Typography>
                </Box>
              </Box>
            )}

            <Box style={{ marginTop: "24px' }}>
              <Button
                variant="outlined&quot;
                onClick={handleTest}
                disabled={
                  isEvaluating ||
                  (transformType === "expression' && !expression.trim()) ||
                  (transformType === 'format' && !format.trim())
                }
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {isEvaluating ? (
                  <CircularProgress size="small&quot; style={{ marginRight: "8px' }} />
                ) : (
                  <PlayArrowIcon style={{ marginRight: '8px' }} />
                )}
                Test Transformation
              </Button>

              {testResult && (
                <Box 
                  style={{ 
                    marginTop: '16px', 
                    padding: '16px',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '4px',
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="subtitle2&quot; style={{ marginBottom: "8px' }}>
                    Test Result
                  </Typography>

                  {testResult.success ? (
                    <>
                      <Box style={{ display: 'flex', marginBottom: '8px' }}>
                        <Typography variant="body2&quot; style={{ marginRight: "8px' }}>
                          Input:
                        </Typography>
                        <Typography 
                          variant="body2&quot; 
                          style={{ 
                            fontFamily: "monospace',
                            color: theme.palette.text.primary
                          }}
                        >
                          {JSON.stringify(testResult.input)}
                        </Typography>
                      </Box>

                      <Box style={{ display: 'flex', marginBottom: '8px' }}>
                        <Typography variant="body2&quot; style={{ marginRight: "8px' }}>
                          Output:
                        </Typography>
                        <Typography 
                          variant="body2&quot; 
                          style={{ 
                            fontFamily: "monospace',
                            color: theme.palette.text.primary
                          }}
                        >
                          {JSON.stringify(testResult.output)}
                        </Typography>
                      </Box>

                      <Box style={{ display: 'flex' }}>
                        <Typography variant="body2&quot; style={{ marginRight: "8px' }}>
                          Output Type:
                        </Typography>
                        <Chip
                          label={testResult.outputType}
                          size="small&quot;
                          color={
                            testResult.outputType === destField.type.toLowerCase()
                              ? "success'
                              : 'warning'
                          }
                        />
                      </Box>

                      {testResult.outputType !== destField.type.toLowerCase() && (
                        <Alert severity="warning&quot; style={{ marginTop: "8px' }}>
                          The output type doesn't match the destination field type.
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert severity="error&quot;>{testResult.error || "Transformation failed'}</Alert>
                  )}
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="text&quot; onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={
            (transformType === 'expression' && !expression.trim()) ||
            (transformType === 'format' && !format.trim())
          }
        >
          Save Transformation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * MultiSourceMapping Component
 * Handles complex mappings with multiple inputs/outputs for transform nodes
 */
const MultiSourceMapping = ({ 
  sources, 
  destinations, 
  mappings, 
  onUpdateMappings, 
  transformType,
  readOnly = false 
}) => {
  // Added display name
  MultiSourceMapping.displayName = 'MultiSourceMapping';

  // Added display name
  MultiSourceMapping.displayName = 'MultiSourceMapping';

  // Added display name
  MultiSourceMapping.displayName = 'MultiSourceMapping';

  // Added display name
  MultiSourceMapping.displayName = 'MultiSourceMapping';

  // Added display name
  MultiSourceMapping.displayName = 'MultiSourceMapping';


  const theme = useTheme();
  
  const [activeTab, setActiveTab] = useState('inputs');
  const [selectedInput, setSelectedInput] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expression, setExpression] = useState('');
  
  // Get the icon for the transform type
  const getTransformTypeIcon = () => {
  // Added display name
  getTransformTypeIcon.displayName = 'getTransformTypeIcon';

  // Added display name
  getTransformTypeIcon.displayName = 'getTransformTypeIcon';

  // Added display name
  getTransformTypeIcon.displayName = 'getTransformTypeIcon';

  // Added display name
  getTransformTypeIcon.displayName = 'getTransformTypeIcon';

  // Added display name
  getTransformTypeIcon.displayName = 'getTransformTypeIcon';


    switch (transformType) {
      case 'join':
        return <CallMergeIcon />;
      case 'split':
        return <CallSplitIcon />;
      case 'merge':
        return <MergeTypeIcon />;
      case 'route':
        return <AltRouteIcon />;
      case 'aggregate':
        return <FunctionsIcon />;
      case 'filter':
        return <FilterListIcon />;
      default:
        return <AutoFixHighIcon />;
    }
  };
  
  // Get description for the transform type
  const getTransformDescription = () => {
  // Added display name
  getTransformDescription.displayName = 'getTransformDescription';

  // Added display name
  getTransformDescription.displayName = 'getTransformDescription';

  // Added display name
  getTransformDescription.displayName = 'getTransformDescription';

  // Added display name
  getTransformDescription.displayName = 'getTransformDescription';

  // Added display name
  getTransformDescription.displayName = 'getTransformDescription';


    switch (transformType) {
      case 'join':
        return 'Combines multiple input fields into a single output field';
      case 'split':
        return 'Divides a single input field into multiple output fields';
      case 'merge':
        return 'Combines multiple records into a single record';
      case 'route':
        return 'Routes data to different outputs based on conditions';
      case 'aggregate':
        return 'Performs calculations across multiple records';
      case 'filter':
        return 'Filters records based on specified conditions';
      default:
        return 'Transforms data from inputs to outputs';
    }
  };
  
  // Get input/output connection lines
  const renderConnections = () => {
  // Added display name
  renderConnections.displayName = 'renderConnections';

  // Added display name
  renderConnections.displayName = 'renderConnections';

  // Added display name
  renderConnections.displayName = 'renderConnections';

  // Added display name
  renderConnections.displayName = 'renderConnections';

  // Added display name
  renderConnections.displayName = 'renderConnections';


    return mappings.map((mapping, index) => (
      <Box 
        key={`connection-${index}`}
        style={{
          height: '2px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          position: 'absolute',
          top: `${150 + index * 40}px`,
          left: '40%',
          width: '20%'
        }}
      />
    ));
  };
  
  // Add a new mapping
  const handleAddMapping = () => {
  // Added display name
  handleAddMapping.displayName = 'handleAddMapping';

  // Added display name
  handleAddMapping.displayName = 'handleAddMapping';

  // Added display name
  handleAddMapping.displayName = 'handleAddMapping';

  // Added display name
  handleAddMapping.displayName = 'handleAddMapping';

  // Added display name
  handleAddMapping.displayName = 'handleAddMapping';


    if (!selectedInput || !selectedOutput) return;
    
    const newMapping = {
      id: `mapping-${Date.now()}`,
      inputId: selectedInput.id,
      outputId: selectedOutput.id,
      transformation: {
        type: 'direct',
        expression: ''
      }
    };
    
    onUpdateMappings([...mappings, newMapping]);
    setSelectedInput(null);
    setSelectedOutput(null);
  };
  
  // Delete a mapping
  const handleDeleteMapping = (mappingId) => {
  // Added display name
  handleDeleteMapping.displayName = 'handleDeleteMapping';

  // Added display name
  handleDeleteMapping.displayName = 'handleDeleteMapping';

  // Added display name
  handleDeleteMapping.displayName = 'handleDeleteMapping';

  // Added display name
  handleDeleteMapping.displayName = 'handleDeleteMapping';

  // Added display name
  handleDeleteMapping.displayName = 'handleDeleteMapping';


    onUpdateMappings(mappings.filter(m => m.id !== mappingId));
  };
  
  // Update a mapping's transformation
  const handleUpdateTransformation = (mappingId, transformation) => {
  // Added display name
  handleUpdateTransformation.displayName = 'handleUpdateTransformation';

  // Added display name
  handleUpdateTransformation.displayName = 'handleUpdateTransformation';

  // Added display name
  handleUpdateTransformation.displayName = 'handleUpdateTransformation';

  // Added display name
  handleUpdateTransformation.displayName = 'handleUpdateTransformation';

  // Added display name
  handleUpdateTransformation.displayName = 'handleUpdateTransformation';


    onUpdateMappings(
      mappings.map(m => 
        m.id === mappingId 
          ? { ...m, transformation } 
          : m
      )
    );
  };
  
  // Format for display
  const getFieldLabel = (fieldId, isInput) => {
  // Added display name
  getFieldLabel.displayName = 'getFieldLabel';

  // Added display name
  getFieldLabel.displayName = 'getFieldLabel';

  // Added display name
  getFieldLabel.displayName = 'getFieldLabel';

  // Added display name
  getFieldLabel.displayName = 'getFieldLabel';

  // Added display name
  getFieldLabel.displayName = 'getFieldLabel';


    const collection = isInput ? sources : destinations;
    const field = collection.find(f => f.id === fieldId);
    return field ? field.name : 'Unknown field';
  };
  
  return (
    <Box>
      <Paper 
        elevation={2}
        style={{ 
          padding: '16px', 
          marginBottom: '16px',
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          {getTransformTypeIcon()}
          <Typography variant="h6&quot; style={{ marginLeft: "8px' }}>
            {transformType.charAt(0).toUpperCase() + transformType.slice(1)} Transformation
          </Typography>
        </Box>
        
        <Typography variant="body2&quot; style={{ marginBottom: "16px' }}>
          {getTransformDescription()}
        </Typography>
        
        <Tabs 
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Inputs&quot; value="inputs" />
          <Tab label="Outputs&quot; value="outputs" />
          <Tab label="Mappings&quot; value="mappings" />
          {showAdvanced && <Tab label="Advanced&quot; value="advanced" />}
        </Tabs>
        
        <Box style={{ marginTop: '16px' }}>
          {activeTab === 'inputs' && (
            <Box>
              <Typography variant="subtitle2&quot; gutterBottom>
                Available Input Fields
              </Typography>
              <List dense>
                {sources.map((field) => (
                  <ListItem 
                    key={field.id}
                    button
                    selected={selectedInput?.id === field.id}
                    onClick={() => setSelectedInput(field)}
                    style={{
                      borderRadius: "4px',
                      marginBottom: '4px',
                      border: selectedInput?.id === field.id ? `1px solid ${theme.palette.primary.main}` : 'none'
                    }}
                  >
                    <ListItemIcon>
                      {getFieldIcon(field.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={field.name}
                      secondary={field.type}
                    />
                    {mappings.some(m => m.inputId === field.id) && (
                      <Chip 
                        size="small&quot; 
                        label="Mapped"
                        color="primary&quot; 
                        variant="outlined"
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 'outputs' && (
            <Box>
              <Typography variant="subtitle2&quot; gutterBottom>
                Available Output Fields
              </Typography>
              <List dense>
                {destinations.map((field) => (
                  <ListItem 
                    key={field.id}
                    button
                    selected={selectedOutput?.id === field.id}
                    onClick={() => setSelectedOutput(field)}
                    style={{
                      borderRadius: "4px',
                      marginBottom: '4px',
                      border: selectedOutput?.id === field.id ? `1px solid ${theme.palette.primary.main}` : 'none'
                    }}
                  >
                    <ListItemIcon>
                      {getFieldIcon(field.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={field.name}
                      secondary={field.type}
                    />
                    {mappings.some(m => m.outputId === field.id) && (
                      <Chip 
                        size="small&quot; 
                        label="Mapped" 
                        color="primary&quot;
                        variant="outlined"
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 'mappings' && (
            <Box>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Typography variant="subtitle2&quot;>
                  Current Mappings
                </Typography>
                
                <Button 
                  variant="outlined" 
                  size="small&quot; 
                  startIcon={<AddIcon />}
                  disabled={!selectedInput || !selectedOutput || readOnly}
                  onClick={handleAddMapping}
                >
                  Add Mapping
                </Button>
              </Box>
              
              {mappings.length > 0 ? (
                <List dense>
                  {mappings.map((mapping) => (
                    <ListItem 
                      key={mapping.id}
                      style={{
                        borderRadius: "4px',
                        marginBottom: '8px',
                        border: `1px solid ${theme.palette.divider}`,
                        padding: '8px'
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Box style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2&quot; style={{ fontWeight: "medium' }}>
                              {getFieldLabel(mapping.inputId, true)}
                            </Typography>
                            
                            <Box style={{ margin: '0 8px', display: 'flex', alignItems: 'center' }}>
                              {mapping.transformation.type === 'direct' ? (
                                <ArrowForwardIcon fontSize="small&quot; />
                              ) : (
                                <Chip 
                                  size="small" 
                                  icon={<AutoFixHighIcon />} 
                                  label={mapping.transformation.type}
                                  color="secondary&quot;
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            
                            <Typography variant="body2&quot; style={{ fontWeight: "medium' }}>
                              {getFieldLabel(mapping.outputId, false)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          mapping.transformation.expression && (
                            <Box style={{ marginTop: '4px' }}>
                              <Typography variant="caption&quot; component="code" style={{ 
                                display: 'block',
                                backgroundColor: theme.palette.background.default,
                                padding: '4px',
                                borderRadius: '4px'
                              }}>
                                {mapping.transformation.expression}
                              </Typography>
                            </Box>
                          )
                        }
                      />
                      
                      {!readOnly && (
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end&quot; 
                            size="small"
                            onClick={() => handleDeleteMapping(mapping.id)}
                          >
                            <DeleteIcon fontSize="small&quot; />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box style={{ 
                  padding: "24px', 
                  textAlign: 'center', 
                  borderRadius: '4px',
                  backgroundColor: theme.palette.background.default
                }}>
                  <Typography 
                    variant="body2&quot; 
                    style={{ color: theme.palette.text.secondary }}
                  >
                    No mappings defined yet. Select input and output fields, then click "Add Mapping".
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {activeTab === 'advanced' && (
            <Box>
              <Typography variant="subtitle2&quot; gutterBottom>
                Advanced Transformation Logic
              </Typography>
              
              <TextField
                label="Custom Transformation Expression"
                fullWidth
                multiline
                rows={4}
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="// Write custom transformation logic here&quot;
                variant="outlined"
                disabled={readOnly}
                helperText="Use JavaScript expressions to transform your data. Access input fields by their names.&quot;
                style={{ marginBottom: "16px' }}
              />
              
              <Box>
                <Typography variant="body2&quot; gutterBottom>Example transformations:</Typography>
                <Box as="ul" style={{ marginLeft: '24px' }}>
                  <Typography as="li&quot; variant="body2">
                    <code>inputs.firstName + ' ' + inputs.lastName</code>
                  </Typography>
                  <Typography as="li&quot; variant="body2">
                    <code>inputs.amount * 1.1</code>
                  </Typography>
                  <Typography as="li&quot; variant="body2">
                    <code>inputs.isActive ? 'Active' : 'Inactive'</code>
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        
        <Box style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                color="primary&quot;
              />
            }
            label="Show Advanced Options"
          />
        </Box>
      </Paper>
    </Box>
  );
};

// Helper function to get field icon by type
const getFieldIcon = (type) => {
  // Added display name
  getFieldIcon.displayName = 'getFieldIcon';

  // Added display name
  getFieldIcon.displayName = 'getFieldIcon';

  // Added display name
  getFieldIcon.displayName = 'getFieldIcon';

  // Added display name
  getFieldIcon.displayName = 'getFieldIcon';

  // Added display name
  getFieldIcon.displayName = 'getFieldIcon';


  switch (type?.toLowerCase()) {
    case 'string':
      return <TextFieldsIcon fontSize="small&quot; />;
    case "number':
    case 'integer':
    case 'float':
    case 'double':
      return <NumbersIcon fontSize="small&quot; />;
    case "boolean':
      return <ToggleOnIcon fontSize="small&quot; />;
    case "date':
    case 'datetime':
    case 'timestamp':
      return <DateRangeIcon fontSize="small&quot; />;
    case "array':
      return <ViewArrayIcon fontSize="small&quot; />;
    case "object':
      return <AccountTreeIcon fontSize="small&quot; />;
    default:
      return <MoreHorizIcon fontSize="small" />;
  }
};

// Main component
const VisualFieldMapper = ({
  sourceFields = [],
  destinationFields = [],
  existingMappings = [],
  onSaveMappings,
  onCancel,
  title = 'Field Mapper',
  readOnly = false,
  multipleSourcesAllowed = false,
  multipleDestinationsAllowed = false,
  transformType = 'direct',
  nodeType = 'standard',
  advanced = false,
}) => {
  // Added display name
  VisualFieldMapper.displayName = 'VisualFieldMapper';

  // Added display name
  VisualFieldMapper.displayName = 'VisualFieldMapper';

  // Added display name
  VisualFieldMapper.displayName = 'VisualFieldMapper';

  // Added display name
  VisualFieldMapper.displayName = 'VisualFieldMapper';

  // Added display name
  VisualFieldMapper.displayName = 'VisualFieldMapper';


  const theme = useTheme();
  const [mappings, setMappings] = useState([]);
  const [draggedField, setDraggedField] = useState(null);
  const [dragSide, setDragSide] = useState(null);
  const [compatibleFields, setCompatibleFields] = useState({});
  const [sourceSearchTerm, setSourceSearchTerm] = useState('');
  const [destSearchTerm, setDestSearchTerm] = useState('');
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [showIncompatible, setShowIncompatible] = useState(false);
  const [transformDialogOpen, setTransformDialogOpen] = useState(false);
  const [autoMapDialogOpen, setAutoMapDialogOpen] = useState(false);
  const [savedMappings, setSavedMappings] = useState(false);

  const containerRef = useRef(null);

  // Initialize mappings from props
  useEffect(() => {
    setMappings(existingMappings || []);
  }, [existingMappings]);

  // Filter fields based on search terms
  const filteredSourceFields = useMemo(() => {
  // Added display name
  filteredSourceFields.displayName = 'filteredSourceFields';

    if (!sourceSearchTerm.trim()) return sourceFields;

    const term = sourceSearchTerm.toLowerCase();
    return sourceFields.filter(
      field => field.name.toLowerCase().includes(term) || field.type.toLowerCase().includes(term)
    );
  }, [sourceFields, sourceSearchTerm]);

  const filteredDestFields = useMemo(() => {
  // Added display name
  filteredDestFields.displayName = 'filteredDestFields';

    if (!destSearchTerm.trim()) return destinationFields;

    const term = destSearchTerm.toLowerCase();
    return destinationFields.filter(
      field => field.name.toLowerCase().includes(term) || field.type.toLowerCase().includes(term)
    );
  }, [destinationFields, destSearchTerm]);

  // Determine if fields are connected
  const isFieldConnected = useCallback(
    (field, side) => {
  // Added display name
  isFieldConnected.displayName = 'isFieldConnected';

      if (side === 'source') {
        return mappings.some(m => m.sourceField.id === field.id);
      } else {
        return mappings.some(m => m.destField.id === field.id);
      }
    },
    [mappings]
  );

  // Get field mapping details
  const getFieldMapping = useCallback(
    (field, side) => {
  // Added display name
  getFieldMapping.displayName = 'getFieldMapping';

      if (side === 'source') {
        return mappings.find(m => m.sourceField.id === field.id);
      } else {
        return mappings.find(m => m.destField.id === field.id);
      }
    },
    [mappings]
  );

  // Check if fields are compatible for mapping
  const areFieldsCompatible = useCallback((sourceField, destField) => {
  // Added display name
  areFieldsCompatible.displayName = 'areFieldsCompatible';

    if (!sourceField || !destField) return false;

    // Basic type compatibility rules
    const sourceType = sourceField.type.toLowerCase();
    const destType = destField.type.toLowerCase();

    // Perfect match - same types
    if (sourceType === destType) return true;

    // Numeric types are compatible with each other
    const numericTypes = ['number', 'integer', 'float', 'double', 'decimal'];
    if (numericTypes.includes(sourceType) && numericTypes.includes(destType)) {
      return true;
    }

    // String-like types are compatible with each other
    const stringTypes = ['string', 'text', 'char', 'varchar'];
    if (stringTypes.includes(sourceType) && stringTypes.includes(destType)) {
      return true;
    }

    // Date types are compatible with each other and strings
    const dateTypes = ['date', 'datetime', 'timestamp'];
    if (
      dateTypes.includes(sourceType) &&
      (dateTypes.includes(destType) || stringTypes.includes(destType))
    ) {
      return true;
    }

    // String can receive many types
    if (stringTypes.includes(destType)) {
      return true;
    }

    // Allow custom transformation for other cases
    return false;
  }, []);

  // Handle field drag start
  const handleDragStart = useCallback(
    (e, field, side) => {
  // Added display name
  handleDragStart.displayName = 'handleDragStart';

      e.dataTransfer.setData('field', JSON.stringify(field));
      e.dataTransfer.setData('side', side);

      setDraggedField(field);
      setDragSide(side);

      // Determine and highlight compatible fields
      const compatibles = {};

      if (side === 'source') {
        destinationFields.forEach(destField => {
          compatibles[destField.id] = areFieldsCompatible(field, destField);
        });
      } else {
        sourceFields.forEach(sourceField => {
          compatibles[sourceField.id] = areFieldsCompatible(sourceField, field);
        });
      }

      setCompatibleFields(compatibles);
    },
    [sourceFields, destinationFields, areFieldsCompatible]
  );

  // Handle field drag over
  const handleDragOver = useCallback(
    (e, field, side) => {
  // Added display name
  handleDragOver.displayName = 'handleDragOver';

      e.preventDefault();

      // Only allow dropping if the sides are different
      if (dragSide && dragSide !== side) {
        // Check compatibility
        const isDraggedCompatible = compatibleFields[field.id];

        // Allow drop if compatible or if showing incompatible fields
        if (isDraggedCompatible || showIncompatible) {
          e.dataTransfer.dropEffect = 'link';
        } else {
          e.dataTransfer.dropEffect = 'none';
        }
      }
    },
    [dragSide, compatibleFields, showIncompatible]
  );

  // Handle field drop
  const handleDrop = useCallback(
    (e, field, side) => {
  // Added display name
  handleDrop.displayName = 'handleDrop';

      e.preventDefault();

      const droppedFieldData = e.dataTransfer.getData('field');
      const droppedFieldSide = e.dataTransfer.getData('side');

      if (!droppedFieldData || !droppedFieldSide || droppedFieldSide === side) {
        return;
      }

      const droppedField = JSON.parse(droppedFieldData);

      // Determine source and destination fields
      const sourceField = droppedFieldSide === 'source' ? droppedField : field;
      const destField = droppedFieldSide === 'destination' ? droppedField : field;

      // Check if we're replacing an existing mapping
      const existingSourceMapping = mappings.findIndex(m => m.sourceField.id === sourceField.id);
      const existingDestMapping = mappings.findIndex(m => m.destField.id === destField.id);

      // Remove existing mappings if needed
      const newMappings = [...mappings];
      if (existingSourceMapping >= 0) {
        newMappings.splice(existingSourceMapping, 1);
      }
      if (existingDestMapping >= 0 && existingDestMapping !== existingSourceMapping) {
        newMappings.splice(
          existingDestMapping > existingSourceMapping
            ? existingDestMapping - 1
            : existingDestMapping,
          1
        );
      }

      // Create the new mapping
      const isCompatible = areFieldsCompatible(sourceField, destField);

      if (isCompatible || showIncompatible) {
        const newMapping = {
          id: `${sourceField.id}-${destField.id}`,
          sourceField,
          destField,
          transform: {
            type: 'direct',
            expression: '',
            format: '',
          },
          isCompatible,
        };

        newMappings.push(newMapping);
        setMappings(newMappings);

        // Select the new mapping
        setSelectedMapping(newMapping);
      }

      // Clear drag state
      setDraggedField(null);
      setDragSide(null);
      setCompatibleFields({});
    },
    [mappings, areFieldsCompatible, showIncompatible]
  );

  // Handle field click
  const handleFieldClick = useCallback(
    (field, side) => {
  // Added display name
  handleFieldClick.displayName = 'handleFieldClick';

      const mapping = getFieldMapping(field, side);
      if (mapping) {
        setSelectedMapping(mapping);
      } else {
        setSelectedMapping(null);
      }
    },
    [getFieldMapping]
  );

  // Handle mapping delete
  const handleDeleteMapping = useCallback(
    mapping => {
      const newMappings = mappings.filter(m => m.id !== mapping.id);
      setMappings(newMappings);
      setSelectedMapping(null);
    },
    [mappings]
  );

  // Handle transform dialog
  const handleOpenTransformDialog = useCallback(() => {
  // Added display name
  handleOpenTransformDialog.displayName = 'handleOpenTransformDialog';

    if (selectedMapping) {
      setTransformDialogOpen(true);
    }
  }, [selectedMapping]);

  // Handle save transform
  const handleSaveTransform = useCallback(
    transform => {
  // Added display name
  handleSaveTransform.displayName = 'handleSaveTransform';

      if (!selectedMapping) return;

      const newMappings = mappings.map(m => {
        if (m.id === selectedMapping.id) {
          return {
            ...m,
            transform,
          };
        }
        return m;
      });

      setMappings(newMappings);
      setSelectedMapping({
        ...selectedMapping,
        transform,
      });
    },
    [mappings, selectedMapping]
  );

  // Handle auto-mapping
  const handleAutoMap = useCallback(() => {
  // Added display name
  handleAutoMap.displayName = 'handleAutoMap';

    // Simple auto-mapping based on exact name matches and type compatibility
    const newMappings = [];

    sourceFields.forEach(sourceField => {
      // Check if source is already mapped
      const isSourceMapped = mappings.some(m => m.sourceField.id === sourceField.id);
      if (isSourceMapped) return;

      // Try exact name match first
      const exactNameMatch = destinationFields.find(
        destField =>
          destField.name.toLowerCase() === sourceField.name.toLowerCase() &&
          areFieldsCompatible(sourceField, destField) &&
          !mappings.some(m => m.destField.id === destField.id) // Not already mapped
      );

      if (exactNameMatch) {
        newMappings.push({
          id: `${sourceField.id}-${exactNameMatch.id}`,
          sourceField,
          destField: exactNameMatch,
          transform: {
            type: 'direct',
            expression: '',
            format: '',
          },
          isCompatible: true,
        });
        return;
      }

      // Try similar name match with type compatibility
      const similarNames = destinationFields.filter(destField => {
        const srcName = sourceField.name.toLowerCase();
        const dstName = destField.name.toLowerCase();

        // Check if destination is already mapped
        const isDestMapped = mappings.some(m => m.destField.id === destField.id);
        if (isDestMapped) return false;

        // Check name similarity and type compatibility
        return (
          (srcName.includes(dstName) || dstName.includes(srcName)) &&
          areFieldsCompatible(sourceField, destField)
        );
      });

      if (similarNames.length > 0) {
        // Use the first match for simplicity
        const bestMatch = similarNames[0];
        newMappings.push({
          id: `${sourceField.id}-${bestMatch.id}`,
          sourceField,
          destField: bestMatch,
          transform: {
            type: 'direct',
            expression: '',
            format: '',
          },
          isCompatible: true,
        });
      }
    });

    // Add new mappings to existing ones (avoiding duplicates)
    const combinedMappings = [...mappings];

    newMappings.forEach(newMapping => {
      // Check if source or destination already mapped
      const sourceAlreadyMapped = combinedMappings.some(
        m => m.sourceField.id === newMapping.sourceField.id
      );
      const destAlreadyMapped = combinedMappings.some(
        m => m.destField.id === newMapping.destField.id
      );

      if (!sourceAlreadyMapped && !destAlreadyMapped) {
        combinedMappings.push(newMapping);
      }
    });

    setMappings(combinedMappings);
    // Show success message with count of new mappings
    alert(`Auto-mapping complete. Added ${newMappings.length} new mappings.`);
  }, [sourceFields, destinationFields, mappings, areFieldsCompatible]);

  // Handle save
  const handleSave = useCallback(() => {
    // For transform and router nodes, the mapping structure is different
    if ((nodeType === 'transform' || nodeType === 'router') && (multipleSourcesAllowed || multipleDestinationsAllowed) && advanced) {
      // Convert to the expected format for the API
      const formattedMappings = mappings.map(mapping => ({
        id: mapping.id,
        sourceField: sourceFields.find(f => f.id === mapping.inputId),
        destField: destinationFields.find(f => f.id === mapping.outputId),
        transform: mapping.transformation,
        isCompatible: true
      }));
      
      onSaveMappings(formattedMappings);
    } else {
      // For standard nodes, use the regular mapping format
      onSaveMappings(mappings);
    }
    
    setSavedMappings(true);

    // Simulate a delay before closing
    setTimeout(() => {
      onCancel();
    }, 1500);
  }, [mappings, sourceFields, destinationFields, nodeType, multipleSourcesAllowed, multipleDestinationsAllowed, advanced, onSaveMappings, onCancel]);

  // Check if all required destination fields are mapped
  const requiredUnmappedDestFields = useMemo(() => {
  // Added display name
  requiredUnmappedDestFields.displayName = 'requiredUnmappedDestFields';

    return destinationFields.filter(
      field => field.required && !mappings.some(m => m.destField.id === field.id)
    );
  }, [destinationFields, mappings]);

  // Render connection lines
  const renderConnections = useCallback(() => {
    // In a real implementation, this would use something like react-xarrows
    // For demo purposes, we'll just show a simplified implementation

    return mappings.map(mapping => (
      <Xarrow
        key={mapping.id}
        start={`source-field-${mapping.sourceField.id}`}
        end={`destination-field-${mapping.destField.id}`}
        color={
          mapping.isCompatible
            ? mapping.transform && mapping.transform.type !== 'direct'
              ? '#F2994A'
              : '#27AE60'
            : '#EB5757'
        }
        strokeWidth={selectedMapping && selectedMapping.id === mapping.id ? 3 : 2}
        headSize={4}
        dashness={!mapping.isCompatible}
      />
    ));
  }, [mappings, selectedMapping]);

  // Get stats for the mapping
  const mappingStats = useMemo(
    () => ({
      total: mappings.length,
      compatible: mappings.filter(m => m.isCompatible).length,
      incompatible: mappings.filter(m => !m.isCompatible).length,
      transformed: mappings.filter(m => m.transform && m.transform.type !== 'direct').length,
      requiredMapped: destinationFields.filter(
        field => field.required && mappings.some(m => m.destField.id === field.id)
      ).length,
      requiredTotal: destinationFields.filter(field => field.required).length,
    }),
    [mappings, destinationFields]
  );

  // Use the advanced multi-source/destination mapper for transform and router nodes
  if ((nodeType === 'transform' || nodeType === 'router') && (multipleSourcesAllowed || multipleDestinationsAllowed) && advanced) {
    return (
      <MultiSourceMapping 
        sources={sourceFields}
        destinations={destinationFields}
        mappings={mappings}
        onUpdateMappings={setMappings}
        transformType={transformType}
        readOnly={readOnly}
      />
    );
  }
  
  return (
    <Box
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6&quot;>{title}</Typography>

        <Box>
          <Button 
            variant="outlined" 
            onClick={onCancel} 
            style={{ marginRight: '8px' }}
          >
            Cancel
          </Button>

          <Button
            variant="contained&quot;
            onClick={handleSave}
            disabled={readOnly || requiredUnmappedDestFields.length > 0}
            style={{ display: "inline-flex', alignItems: 'center' }}
          >
            {savedMappings && <CheckCircleIcon style={{ marginRight: '8px' }} />}
            {savedMappings ? 'Saved!' : 'Save Mappings'}
          </Button>
        </Box>
      </Box>

      {/* Mapping info */}
      <Box 
        style={{ 
          padding: '16px', 
          backgroundColor: alpha(theme.palette.background.paper, 0.12)
        }}
      >
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1&quot;>Field Mappings</Typography>
            <Typography 
              variant="body2" 
              style={{ color: theme.palette.text.secondary }}
            >
              {mappingStats.total} mappings • {mappingStats.requiredMapped}/
              {mappingStats.requiredTotal} required fields mapped
            </Typography>
          </Box>

          <Box>
            {!readOnly && (
              <>
                <Button
                  variant="outlined&quot;
                  onClick={handleAutoMap}
                  size="small"
                  style={{ 
                    marginRight: '8px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <AutoAwesomeIcon style={{ marginRight: '4px' }} />
                  Auto-Map Fields
                </Button>

                <FormControlLabel
                  control={
                    <Switch
                      size="small&quot;
                      checked={showIncompatible}
                      onChange={e => setShowIncompatible(e.target.checked)}
                    />
                  }
                  label={
                    <Typography 
                      variant="body2" 
                      style={{ fontSize: '14px' }}
                    >
                      Allow incompatible mappings
                    </Typography>
                  }
                />
              </>
            )}
          </Box>
        </Box>

        {/* Stats */}
        <Box style={{ display: 'flex', marginTop: '8px' }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`${mappingStats.compatible} Compatible`}
            size="small&quot;
            color="success"
            variant="outlined&quot;
            style={{ marginRight: "8px' }}
          />

          {mappingStats.incompatible > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${mappingStats.incompatible} Incompatible`}
              size="small&quot;
              color="error"
              variant="outlined&quot;
              style={{ marginRight: "8px' }}
            />
          )}

          {mappingStats.transformed > 0 && (
            <Chip
              icon={<AutoFixHighIcon />}
              label={`${mappingStats.transformed} Transformed`}
              size="small&quot;
              color="warning"
              variant="outlined&quot;
              style={{ marginRight: "8px' }}
            />
          )}
        </Box>

        {/* Required fields warning */}
        {requiredUnmappedDestFields.length > 0 && (
          <Alert
            severity="warning&quot;
            style={{ marginTop: "16px' }}
            action={
              <Button variant="text&quot; size="small">
                Map Required Fields
              </Button>
            }
          >
            {requiredUnmappedDestFields.length} required destination{' '}
            {requiredUnmappedDestFields.length === 1 ? 'field is' : 'fields are'} not mapped.
          </Alert>
        )}
      </Box>

      {/* Mapping workspace */}
      <Box
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          padding: '16px',
        }}
      >
        {/* Source fields */}
        <Box
          style={{
            flex: 1,
            marginRight: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box 
            style={{ 
              padding: '8px', 
              marginBottom: '8px',
              backgroundColor: theme.palette.background.paper,
              borderRadius: '4px',
              boxShadow: theme.shadows?.xs || '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Typography variant="subtitle2&quot; style={{ marginBottom: "8px' }}>
              Source Fields
            </Typography>

            <TextField
              placeholder="Search source fields...&quot;
              size="small"
              fullWidth
              value={sourceSearchTerm}
              onChange={e => setSourceSearchTerm(e.target.value)}
              startAdornment={<SearchIcon />}
            />
          </Box>

          <Box style={{ flex: 1, overflow: 'auto' }}>
            {filteredSourceFields.map((field, index) => (
              <FieldItem
                key={field.id || index}
                field={field}
                index={index}
                side="source&quot;
                onDragStart={!readOnly ? handleDragStart : null}
                onDragOver={!readOnly ? handleDragOver : null}
                onDrop={!readOnly ? handleDrop : null}
                onClick={handleFieldClick}
                isConnected={isFieldConnected(field, "source')}
                isCompatible={dragSide === 'destination' && compatibleFields[field.id]}
                isDragging={dragSide === 'destination'}
                isSelected={selectedMapping && selectedMapping.sourceField.id === field.id}
              />
            ))}

            {filteredSourceFields.length === 0 && (
              <Typography
                variant="body2&quot;
                style={{ 
                  padding: "16px', 
                  textAlign: 'center', 
                  color: theme.palette.text.secondary,
                }}
              >
                No source fields found matching "{sourceSearchTerm}"
              </Typography>
            )}
          </Box>
        </Box>

        {/* Middle section with mapping details */}
        <Box
          style={{ 
            width: '250px', 
            marginLeft: '16px', 
            marginRight: '16px', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          <Box
            style={{
              padding: '12px',
              marginBottom: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.background.paper,
              borderRadius: '4px',
              boxShadow: theme.shadows?.xs || '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Typography variant="subtitle2&quot; style={{ marginBottom: "8px' }}>
              Mapping Details
            </Typography>

            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60px',
              }}
            >
              {selectedMapping ? (
                <Box style={{ textAlign: 'center' }}>
                  <Typography 
                    variant="body2&quot; 
                    style={{ fontWeight: theme.typography?.fontWeights?.medium || 500 }}
                  >
                    {selectedMapping.sourceField.name}
                  </Typography>

                  <Box
                    style={{
                      display: "flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '4px 0',
                    }}
                  >
                    {selectedMapping.transform && selectedMapping.transform.type !== 'direct' ? (
                      <Chip
                        icon={<AutoFixHighIcon />}
                        label={selectedMapping.transform.type}
                        size="small&quot;
                        color="secondary"
                        variant="outlined&quot;
                      />
                    ) : (
                      <ArrowForwardIcon style={{ 
                        color: theme.palette.text.secondary
                      }} />
                    )}
                  </Box>

                  <Typography 
                    variant="body2" 
                    style={{ fontWeight: theme.typography?.fontWeights?.medium || 500 }}
                  >
                    {selectedMapping.destField.name}
                  </Typography>
                </Box>
              ) : (
                <Typography 
                  variant="body2&quot; 
                  style={{ color: theme.palette.text.secondary }}
                >
                  Select a mapping to view details
                </Typography>
              )}
            </Box>

            {selectedMapping && !readOnly && (
              <Box style={{ marginTop: "8px', display: 'flex', justifyContent: 'center' }}>
                <Button
                  size="small&quot;
                  onClick={handleOpenTransformDialog}
                  variant="outlined"
                  style={{ 
                    marginRight: '8px',
                    display: 'inline-flex', 
                    alignItems: 'center' 
                  }}
                >
                  <AutoFixHighIcon style={{ marginRight: '4px', fontSize: '16px' }} />
                  Transform
                </Button>

                <Button
                  size="small&quot;
                  color="error"
                  onClick={() => handleDeleteMapping(selectedMapping)}
                  variant="outlined&quot;
                  style={{ display: "inline-flex', alignItems: 'center' }}
                >
                  <DeleteIcon style={{ marginRight: '4px', fontSize: '16px' }} />
                  Remove
                </Button>
              </Box>
            )}
          </Box>

          <Box 
            style={{ 
              padding: '12px', 
              flex: 1, 
              overflow: 'auto',
              backgroundColor: theme.palette.background.paper,
              borderRadius: '4px',
              boxShadow: theme.shadows?.xs || '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Typography variant="subtitle2&quot; style={{ marginBottom: "8px' }}>
              Mappings
            </Typography>

            {mappings.length > 0 ? (
              <List dense disablePadding>
                {mappings.map(mapping => (
                  <ListItem
                    key={mapping.id}
                    disableGutters
                    button
                    onClick={() => setSelectedMapping(mapping)}
                    selected={selectedMapping && selectedMapping.id === mapping.id}
                    style={{
                      borderRadius: '4px',
                      marginBottom: '4px',
                      border: '1px solid',
                      borderColor: mapping.isCompatible 
                        ? 'transparent' 
                        : theme.palette.error.light,
                      backgroundColor: selectedMapping && selectedMapping.id === mapping.id
                        ? alpha(theme.palette.primary.main, 0.12)
                        : theme.palette.background.paper,
                    }}
                  >
                    <ListItemIcon style={{ minWidth: '24px' }}>
                      {mapping.isCompatible ? (
                        <CheckCircleIcon 
                          color="success&quot; 
                          style={{ fontSize: "18px' }} 
                        />
                      ) : (
                        <WarningIcon 
                          color="error&quot; 
                          style={{ fontSize: "18px' }} 
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={mapping.sourceField.name}
                      secondary={mapping.destField.name}
                      primaryTypographyProps={{
                        variant: 'body2',
                        noWrap: true,
                        style: { maxWidth: '120px' },
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        noWrap: true,
                        style: { maxWidth: '120px' },
                      }}
                    />

                    {mapping.transform && mapping.transform.type !== 'direct' && (
                      <AutoFixHighIcon 
                        style={{ 
                          fontSize: '18px', 
                          marginRight: '8px',
                          color: theme.palette.warning.main,
                        }} 
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2&quot;
                style={{ 
                  textAlign: "center', 
                  marginTop: '16px',
                  color: theme.palette.text.secondary,
                }}
              >
                No mappings created yet
              </Typography>
            )}
          </Box>
        </Box>

        {/* Destination fields */}
        <Box
          style={{
            flex: 1,
            marginLeft: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box 
            style={{ 
              padding: '8px', 
              marginBottom: '8px',
              backgroundColor: theme.palette.background.paper,
              borderRadius: '4px',
              boxShadow: theme.shadows?.xs || '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Typography variant="subtitle2&quot; style={{ marginBottom: "8px' }}>
              Destination Fields
            </Typography>

            <TextField
              placeholder="Search destination fields...&quot;
              size="small"
              fullWidth
              value={destSearchTerm}
              onChange={e => setDestSearchTerm(e.target.value)}
              startAdornment={<SearchIcon />}
            />
          </Box>

          <Box style={{ flex: 1, overflow: 'auto' }}>
            {filteredDestFields.map((field, index) => (
              <FieldItem
                key={field.id || index}
                field={field}
                index={index}
                side="destination&quot;
                onDragStart={!readOnly ? handleDragStart : null}
                onDragOver={!readOnly ? handleDragOver : null}
                onDrop={!readOnly ? handleDrop : null}
                onClick={handleFieldClick}
                isConnected={isFieldConnected(field, "destination')}
                isCompatible={dragSide === 'source' && compatibleFields[field.id]}
                isDragging={dragSide === 'source'}
                isSelected={selectedMapping && selectedMapping.destField.id === field.id}
              />
            ))}

            {filteredDestFields.length === 0 && (
              <Typography
                variant="body2&quot;
                style={{ 
                  padding: "16px', 
                  textAlign: 'center', 
                  color: theme.palette.text.secondary,
                }}
              >
                No destination fields found matching "{destSearchTerm}"
              </Typography>
            )}
          </Box>
        </Box>

        {/* Visual connections - simplified implementation */}
        {renderConnections()}
      </Box>

      {/* Transformation Dialog */}
      <TransformationDialog
        open={transformDialogOpen}
        onClose={() => setTransformDialogOpen(false)}
        sourceField={selectedMapping?.sourceField}
        destField={selectedMapping?.destField}
        currentTransform={selectedMapping?.transform}
        onSaveTransform={handleSaveTransform}
      />
    </Box>
  );
};

export default VisualFieldMapper;