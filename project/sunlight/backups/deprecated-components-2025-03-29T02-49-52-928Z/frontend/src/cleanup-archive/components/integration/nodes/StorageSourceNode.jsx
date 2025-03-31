import {   Tooltip, Box , Tooltip, Box , Tooltip, Box } from '../../../../design-system';
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Handle } from '@utils/reactFlowAdapter';
import { 
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
  Description as FileIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import BaseNode from './BaseNode';

// Styled components
const NodeContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  height: '100%',
  boxSizing: 'border-box'
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  width: '100%'
}));

const StorageTypeBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}));

const ResourceBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}));

/**
 * Storage Source Node Component for integration flow canvas
 * This node represents a source of data from a storage system (S3, Azure, SharePoint, etc.)
 */
const StorageSourceNode = ({ data, selected, id }) => {
  // Added display name
  StorageSourceNode.displayName = 'StorageSourceNode';

  // Added display name
  StorageSourceNode.displayName = 'StorageSourceNode';

  // Added display name
  StorageSourceNode.displayName = 'StorageSourceNode';

  // Added display name
  StorageSourceNode.displayName = 'StorageSourceNode';

  // Added display name
  StorageSourceNode.displayName = 'StorageSourceNode';


  // Get display values from node data
  const storageType = data?.storageType || 'unknown';
  const containerName = data?.containerName || '';
  const resourcePath = data?.resourcePath || '';
  const label = data?.label || 'Storage Source';

  // Icon mapping
  const getStorageIcon = useCallback(() => {
  // Added display name
  getStorageIcon.displayName = 'getStorageIcon';

    switch(storageType.toLowerCase()) {
      case 's3':
        return <CloudUploadIcon fontSize="small&quot; sx={{ mr: 0.5 }} />;
      case "azure':
        return <StorageIcon fontSize="small&quot; sx={{ mr: 0.5 }} />;
      case "sharepoint':
        return <FolderIcon fontSize="small&quot; sx={{ mr: 0.5 }} />;
      default:
        return <StorageIcon fontSize="small" sx={{ mr: 0.5 }} />;
    }
  }, [storageType]);

  // Get type label
  const getTypeLabel = useCallback(() => {
  // Added display name
  getTypeLabel.displayName = 'getTypeLabel';

    switch(storageType.toLowerCase()) {
      case 's3':
        return 'AWS S3';
      case 'azure':
        return 'Azure Blob';
      case 'sharepoint':
        return 'SharePoint';
      default:
        return storageType;
    }
  }, [storageType]);

  return (
    <BaseNode selected={selected} nodeId={id} nodeType="storage-source&quot;>
      <NodeContent>
        <HeaderBox>
          {getStorageIcon()}
          <Typography variant="body2" noWrap sx={{ fontWeight: 'bold' }}>{label}</Typography>
        </HeaderBox>
        
        <StorageTypeBox>
          {getTypeLabel()}
        </StorageTypeBox>
        
        {containerName && (
          <Tooltip title={`Container: ${containerName}`}>
            <ResourceBox>
              <FolderIcon fontSize="small&quot; sx={{ mr: 0.5 }} />
              {containerName}
            </ResourceBox>
          </Tooltip>
        )}
        
        {resourcePath && (
          <Tooltip title={`Path: ${resourcePath}`}>
            <ResourceBox>
              <FileIcon fontSize="small" sx={{ mr: 0.5 }} />
              {resourcePath}
            </ResourceBox>
          </Tooltip>
        )}
      </NodeContent>
      
      {/* Output handle for node connections */}
      <Handle
        type="source&quot;
        position="right"
        id="output&quot;
        style={{ 
          width: 10, 
          height: 10, 
          right: -5, 
          top: "50%',
          background: '#4caf50'  // Green for source output
        }}
      />
    </BaseNode>
  );
};

StorageSourceNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string,
    storageType: PropTypes.string,
    containerName: PropTypes.string,
    resourcePath: PropTypes.string
  }),
  selected: PropTypes.bool,
  id: PropTypes.string.isRequired
};

// Use React.memo for performance optimization
export default memo(StorageSourceNode);