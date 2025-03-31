/**
 * Transformation Node
 *
 * A custom node for data transformations in the integration flow canvas.
 * This node represents a data transformation operation.
 *
 * @component
 */

import React, { memo } from 'react';
import { Handle } from 'reactflow';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material';
import {
  Transform as TransformIcon,
  Code as CodeIcon,
  Functions as FunctionsIcon,
  AutoAwesome as AutoAwesomeIcon,
  SwapHoriz as SwapHorizIcon,
  Settings as SettingsIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const TRANSFORMATION_TYPES = {
  MAPPING: {
    icon: SwapHorizIcon,
    color: '#ff9800', // Orange
    label: 'Mapping',
  },
  FORMULA: {
    icon: FunctionsIcon,
    color: '#ff9800', // Orange
    label: 'Formula',
  },
  SCRIPT: {
    icon: CodeIcon,
    color: '#ff9800', // Orange
    label: 'Script',
  },
  AI: {
    icon: AutoAwesomeIcon,
    color: '#ff9800', // Orange
    label: 'AI Transform',
  },
  default: {
    icon: TransformIcon,
    color: '#ff9800', // Orange
    label: 'Transform',
  },
};

/**
 * Transformation Node component
 */
const TransformationNode = memo(({ id, data, isConnectable, selected }) => {
  const transformationType = data.transformationType || 'default';
  const transformationConfig = TRANSFORMATION_TYPES[transformationType] || TRANSFORMATION_TYPES.default;
  const TransformationIconComponent = transformationConfig.icon;
  const hasError = data.error !== undefined;
  const isConfigured = data.isConfigured || false;
  
  return (
    <Paper 
      elevation={selected ? 3 : 1}
      sx={{
        minHeight: 80,
        width: 200,
        padding: 1,
        borderRadius: 1,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: selected ? 'primary.main' : transformationConfig.color,
        backgroundColor: 'background.paper',
        position: 'relative',
      }}
    >
      {/* Input handle on the left */}
      <Handle
        type="target"
        position="left"
        id="input"
        style={{ 
          left: -8,
          top: '50%',
          width: 12,
          height: 12,
          background: transformationConfig.color,
          border: '2px solid #fff',
        }}
        isConnectable={isConnectable}
      />
      
      {/* Output handle on the right */}
      <Handle
        type="source"
        position="right"
        id="output"
        style={{ 
          right: -8,
          top: '50%',
          width: 12,
          height: 12,
          background: transformationConfig.color,
          border: '2px solid #fff',
        }}
        isConnectable={isConnectable}
      />
      
      {/* Node header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
        backgroundColor: transformationConfig.color,
        color: '#fff',
        marginLeft: -1,
        marginRight: -1,
        marginTop: -1,
        padding: 0.5,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
      }}>
        <TransformationIconComponent fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {transformationConfig.label}
        </Typography>
        <Badge 
          color={hasError ? "error" : "success"} 
          variant="dot"
          invisible={!isConfigured}
        >
          <Tooltip title="Configure Transformation">
            <IconButton 
              size="small"
              sx={{ 
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Badge>
      </Box>
      
      {/* Node content */}
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {data.label || 'Data Transformation'}
        </Typography>
        
        {/* Display transformation details */}
        {data.fields && data.fields.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 0.5 }}>
            <Chip 
              label={`${data.fields.length} field${data.fields.length > 1 ? 's' : ''}`} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          </Box>
        )}
        
        {/* Status indicator */}
        {hasError ? (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption" color="error">
              {data.error}
            </Typography>
          </Box>
        ) : isConfigured ? (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
            <CheckIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption" color="success.main">
              Configured
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Click to configure
          </Typography>
        )}
      </Box>
    </Paper>
  );
});

export default TransformationNode;