/**
 * Source Node
 *
 * A custom node for data sources in the integration flow canvas.
 * This node represents the starting point of a data flow.
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
} from '@mui/material';
import {
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const SOURCE_TYPES = {
  S3: {
    icon: StorageIcon,
    color: '#ff9900', // AWS orange
    label: 'S3',
  },
  AZURE_BLOB: {
    icon: StorageIcon,
    color: '#0078d4', // Azure blue
    label: 'Azure Blob',
  },
  SHAREPOINT: {
    icon: StorageIcon,
    color: '#0078d4', // SharePoint blue
    label: 'SharePoint',
  },
  API: {
    icon: StorageIcon,
    color: '#4285f4', // Google blue
    label: 'API',
  },
  DATABASE: {
    icon: StorageIcon,
    color: '#4CAF50', // Green
    label: 'Database',
  },
  default: {
    icon: StorageIcon,
    color: '#757575', // Gray
    label: 'Source',
  },
};

/**
 * Source Node component
 */
const SourceNode = memo(({ id, data, isConnectable, selected }) => {
  const sourceType = data.sourceType || 'default';
  const sourceConfig = SOURCE_TYPES[sourceType] || SOURCE_TYPES.default;
  const SourceIconComponent = sourceConfig.icon;
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
        borderColor: selected ? 'primary.main' : sourceConfig.color,
        backgroundColor: 'background.paper',
        position: 'relative',
      }}
    >
      {/* Output handle on the right side */}
      <Handle
        type="source"
        position="right"
        id="output"
        style={{ 
          right: -8,
          top: '50%',
          width: 12,
          height: 12,
          background: sourceConfig.color,
          border: '2px solid #fff',
        }}
        isConnectable={isConnectable}
      />
      
      {/* Node header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
        backgroundColor: sourceConfig.color,
        color: '#fff',
        marginLeft: -1,
        marginRight: -1,
        marginTop: -1,
        padding: 0.5,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
      }}>
        <SourceIconComponent fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {sourceConfig.label}
        </Typography>
        <Badge 
          color={hasError ? "error" : "success"} 
          variant="dot"
          invisible={!isConfigured}
        >
          <Tooltip title="Configure Source">
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
          {data.label || 'Data Source'}
        </Typography>
        
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

export default SourceNode;