/**
 * Destination Node
 *
 * A custom node for data destinations in the integration flow canvas.
 * This node represents the endpoint of a data flow.
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
  CloudUpload as CloudUploadIcon,
  Storage as DatabaseIcon, // Use Storage icon as a replacement for Database
  Api as ApiIcon,
  Settings as SettingsIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const DESTINATION_TYPES = {
  S3: {
    icon: CloudUploadIcon,
    color: '#ff9900', // AWS orange
    label: 'S3',
  },
  AZURE_BLOB: {
    icon: CloudUploadIcon,
    color: '#0078d4', // Azure blue
    label: 'Azure Blob',
  },
  SHAREPOINT: {
    icon: CloudUploadIcon,
    color: '#0078d4', // SharePoint blue
    label: 'SharePoint',
  },
  API: {
    icon: ApiIcon,
    color: '#4285f4', // Google blue
    label: 'API',
  },
  DATABASE: {
    icon: DatabaseIcon,
    color: '#4CAF50', // Green
    label: 'Database',
  },
  default: {
    icon: StorageIcon,
    color: '#2196f3', // Blue
    label: 'Destination',
  },
};

/**
 * Destination Node component
 */
const DestinationNode = memo(({ id, data, isConnectable, selected }) => {
  const destinationType = data.destinationType || 'default';
  const destinationConfig = DESTINATION_TYPES[destinationType] || DESTINATION_TYPES.default;
  const DestinationIconComponent = destinationConfig.icon;
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
        borderColor: selected ? 'primary.main' : destinationConfig.color,
        backgroundColor: 'background.paper',
        position: 'relative',
      }}
    >
      {/* Input handle on the left side */}
      <Handle
        type="target"
        position="left"
        id="input"
        style={{ 
          left: -8,
          top: '50%',
          width: 12,
          height: 12,
          background: destinationConfig.color,
          border: '2px solid #fff',
        }}
        isConnectable={isConnectable}
      />
      
      {/* Node header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
        backgroundColor: destinationConfig.color,
        color: '#fff',
        marginLeft: -1,
        marginRight: -1,
        marginTop: -1,
        padding: 0.5,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
      }}>
        <DestinationIconComponent fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {destinationConfig.label}
        </Typography>
        <Badge 
          color={hasError ? "error" : "success"} 
          variant="dot"
          invisible={!isConfigured}
        >
          <Tooltip title="Configure Destination">
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
          {data.label || 'Data Destination'}
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

export default DestinationNode;