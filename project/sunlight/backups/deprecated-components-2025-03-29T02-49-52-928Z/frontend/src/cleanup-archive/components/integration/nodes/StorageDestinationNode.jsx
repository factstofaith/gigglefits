import {   Tooltip, Chip , Tooltip, Chip , Tooltip, Chip } from '../../../../design-system';
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Handle } from '@utils/reactFlowAdapter';
import { 
  Storage as StorageIcon,
  CloudDownload as CloudDownloadIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  Save as SaveIcon
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
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.secondary.contrastText,
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

const FileFormatChip = styled(Chip)(({ theme }) => ({
  marginTop: theme.spacing(1),
  height: 20,
  fontSize: '0.7rem'
}));

/**
 * Storage Destination Node Component for integration flow canvas
 * This node represents a destination for data in a storage system (S3, Azure, SharePoint, etc.)
 */
const StorageDestinationNode = ({ data, selected, id }) => {
  // Added display name
  StorageDestinationNode.displayName = 'StorageDestinationNode';

  // Added display name
  StorageDestinationNode.displayName = 'StorageDestinationNode';

  // Added display name
  StorageDestinationNode.displayName = 'StorageDestinationNode';

  // Added display name
  StorageDestinationNode.displayName = 'StorageDestinationNode';

  // Added display name
  StorageDestinationNode.displayName = 'StorageDestinationNode';


  // Get display values from node data
  const storageType = data?.storageType || 'unknown';
  const containerName = data?.containerName || '';
  const resourcePath = data?.resourcePath || '';
  const label = data?.label || 'Storage Destination';
  const fileFormat = data?.fileFormat || '';
  const writeMode = data?.writeMode || 'overwrite';
  
  // Icon mapping
  const getStorageIcon = useCallback(() => {
  // Added display name
  getStorageIcon.displayName = 'getStorageIcon';

    switch(storageType.toLowerCase()) {
      case 's3':
        return <CloudDownloadIcon fontSize="small&quot; sx={{ mr: 0.5 }} />;
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

  // Get write mode icon
  const getWriteModeIcon = useCallback(() => {
  // Added display name
  getWriteModeIcon.displayName = 'getWriteModeIcon';

    switch(writeMode) {
      case 'append':
        return <Tooltip title="Append Mode&quot;>
          <span style={{ fontSize: "0.7rem', marginLeft: '4px' }}>+</span>
        </Tooltip>;
      case 'backup':
        return <Tooltip title="Backup Mode&quot;>
          <span style={{ fontSize: "0.7rem', marginLeft: '4px' }}>*</span>
        </Tooltip>;
      default: // overwrite
        return null;
    }
  }, [writeMode]);

  return (
    <BaseNode selected={selected} nodeId={id} nodeType="storage-destination&quot;>
      <NodeContent>
        <HeaderBox>
          {getStorageIcon()}
          <Typography variant="body2" noWrap sx={{ fontWeight: 'bold' }}>{label}</Typography>
        </HeaderBox>
        
        <StorageTypeBox>
          {getTypeLabel()}
          {getWriteModeIcon()}
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
        
        {fileFormat && (
          <FileFormatChip 
            label={fileFormat.toUpperCase()} 
            size="small&quot; 
            color="info"
            icon={<SaveIcon style={{ fontSize: '0.8rem' }} />}
          />
        )}
      </NodeContent>
      
      {/* Input handle for node connections */}
      <Handle
        type="target&quot;
        position="left"
        id="input&quot;
        style={{ 
          width: 10, 
          height: 10, 
          left: -5, 
          top: "50%',
          background: '#f44336'  // Red for destination input
        }}
      />
    </BaseNode>
  );
};

StorageDestinationNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string,
    storageType: PropTypes.string,
    containerName: PropTypes.string,
    resourcePath: PropTypes.string,
    fileFormat: PropTypes.string,
    writeMode: PropTypes.string
  }),
  selected: PropTypes.bool,
  id: PropTypes.string.isRequired
};

// Use React.memo for performance optimization
export default memo(StorageDestinationNode);