import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography, Divider, Button, Tabs, Tab, Grid, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import {
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Folder as FolderIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CreateNewFolder as NewFolderIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '../../design-system';

import FileBrowserComponent from '@components/integration/FileBrowserComponent';
import FilePreviewComponent from '@components/integration/FilePreviewComponent';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// Styled components
const PanelContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const PanelContent = styled(Box)({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
});

const BrowserWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden'
});

/**
 * StorageFileBrowserPanel component for browsing and previewing files in storage providers
 * Integrates FileBrowserComponent and FilePreviewComponent into a single panel
 * Supports file browsing, selection, preview, and operations like upload/download
 */
const StorageFileBrowserPanel = ({
  storageType = 's3',
  containerName = '',
  credentials = {},
  initialPath = '/',
  mode = 'browser', // browser, selector
  onFileSelect = null,
  onFilesSelect = null,
  onDismiss = null,
  height = 600,
  width = '100%',
  selectedNodeId = null, // For integration with flow canvas
  fullScreen = false,
  title = null
}) => {
  // Added display name
  StorageFileBrowserPanel.displayName = 'StorageFileBrowserPanel';

  // Added display name
  StorageFileBrowserPanel.displayName = 'StorageFileBrowserPanel';

  // Added display name
  StorageFileBrowserPanel.displayName = 'StorageFileBrowserPanel';


  // State for UI
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // split, browser, preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);
  
  // State for dialogs
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  
  // Get storage type display name
  const getStorageDisplayName = useCallback(() => {
  // Added display name
  getStorageDisplayName.displayName = 'getStorageDisplayName';

    switch(storageType) {
      case 's3': return 'S3';
      case 'azure': return 'Azure Blob Storage';
      case 'sharepoint': return 'SharePoint';
      default: return 'Storage';
    }
  }, [storageType]);
  
  // Get panel title based on mode and storage type
  const getPanelTitle = useCallback(() => {
  // Added display name
  getPanelTitle.displayName = 'getPanelTitle';

    if (title) return title;
    
    const storageTypeName = getStorageDisplayName();
    
    if (mode === 'selector') {
      return `Select File - ${storageTypeName}`;
    }
    
    return `${storageTypeName} File Browser`;
  }, [mode, getStorageDisplayName, title]);
  
  // Handle file selection in the browser
  const handleFileSelect = useCallback((file) => {
  // Added display name
  handleFileSelect.displayName = 'handleFileSelect';

    setSelectedFile(file);
    
    // If in direct selection mode, pass the file to the parent component
    if (mode === 'selector' && onFileSelect && file.type === 'file') {
      onFileSelect(file);
    }
  }, [mode, onFileSelect]);
  
  // Handle mode switch (split, browser, preview)
  const handleViewModeChange = (event, newMode) => {
  // Added display name
  handleViewModeChange.displayName = 'handleViewModeChange';

  // Added display name
  handleViewModeChange.displayName = 'handleViewModeChange';

  // Added display name
  handleViewModeChange.displayName = 'handleViewModeChange';


    setViewMode(newMode);
  };
  
  // Reset selected file when storage type or container changes
  useEffect(() => {
    setSelectedFile(null);
  }, [storageType, containerName]);
  
  // Handle file download (mock implementation)
  const handleDownload = useCallback(() => {
  // Added display name
  handleDownload.displayName = 'handleDownload';

    if (!selectedFile || selectedFile.type !== 'file') return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API call for file download
    setTimeout(() => {
      try {
        // In a real implementation, this would trigger a file download via API
        
        setOperationStatus({
          type: 'success',
          message: `File downloaded successfully: ${selectedFile.name}`
        });
        setLoading(false);
        
        // Auto-dismiss the success message after 3 seconds
        setTimeout(() => {
          setOperationStatus(null);
        }, 3000);
      } catch (err) {
        console.error('Error downloading file:', err);
        setError('Failed to download file. Please check your connection and try again.');
        setLoading(false);
      }
    }, 1000);
  }, [selectedFile]);
  
  // Handle create new folder (mock implementation)
  const handleCreateFolder = useCallback(() => {
  // Added display name
  handleCreateFolder.displayName = 'handleCreateFolder';

    if (!newFolderName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API call for folder creation
    setTimeout(() => {
      try {
        // In a real implementation, this would create a folder via API
        
        setOperationStatus({
          type: 'success',
          message: `Folder created successfully: ${newFolderName}`
        });
        setLoading(false);
        setNewFolderDialogOpen(false);
        setNewFolderName('');
        
        // Auto-dismiss the success message after 3 seconds
        setTimeout(() => {
          setOperationStatus(null);
        }, 3000);
      } catch (err) {
        console.error('Error creating folder:', err);
        setError('Failed to create folder. Please check your permissions and try again.');
        setLoading(false);
      }
    }, 1000);
  }, [newFolderName]);
  
  // Handle file upload (mock implementation)
  const handleUpload = useCallback(() => {
  // Added display name
  handleUpload.displayName = 'handleUpload';

    if (!fileToUpload) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API call for file upload
    setTimeout(() => {
      try {
        // In a real implementation, this would upload a file via API
        
        setOperationStatus({
          type: 'success',
          message: `File uploaded successfully: ${fileToUpload.name}`
        });
        setLoading(false);
        setUploadDialogOpen(false);
        setFileToUpload(null);
        
        // Auto-dismiss the success message after 3 seconds
        setTimeout(() => {
          setOperationStatus(null);
        }, 3000);
      } catch (err) {
        console.error('Error uploading file:', err);
        setError('Failed to upload file. Please check your connection and try again.');
        setLoading(false);
      }
    }, 1500);
  }, [fileToUpload]);
  
  // File input change handler
  const handleFileInputChange = (event) => {
  // Added display name
  handleFileInputChange.displayName = 'handleFileInputChange';

  // Added display name
  handleFileInputChange.displayName = 'handleFileInputChange';

  // Added display name
  handleFileInputChange.displayName = 'handleFileInputChange';


    const files = event.target.files;
    if (files.length > 0) {
      setFileToUpload(files[0]);
    }
  };
  
  // Clear operation status
  const clearOperationStatus = () => {
  // Added display name
  clearOperationStatus.displayName = 'clearOperationStatus';

  // Added display name
  clearOperationStatus.displayName = 'clearOperationStatus';

  // Added display name
  clearOperationStatus.displayName = 'clearOperationStatus';


    setOperationStatus(null);
  };
  
  // Get icon based on storage type
  const getStorageIcon = useCallback(() => {
  // Added display name
  getStorageIcon.displayName = 'getStorageIcon';

    switch(storageType) {
      case 's3': return <CloudUploadIcon />;
      case 'azure': return <StorageIcon />;
      case 'sharepoint': return <FolderIcon />;
      default: return <StorageIcon />;
    }
  }, [storageType]);
  
  return (
    <PanelContainer elevation={1} style={{ height, width }}>
      <PanelHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getStorageIcon()}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {getPanelTitle()}
          </Typography>
        </Box>
        
        <Box>
          {viewMode !== 'browser' && (
            <Tooltip title="Download">
              <span>
                <IconButton 
                  onClick={handleDownload} 
                  disabled={!selectedFile || selectedFile.type !== 'file' || loading}
                  size="small"
                >
                  <DownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
          
          <Tooltip title="Upload File">
            <IconButton 
              onClick={() => setUploadDialogOpen(true)}
              disabled={loading}
              size="small"
            >
              <UploadIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="New Folder">
            <IconButton 
              onClick={() => setNewFolderDialogOpen(true)}
              disabled={loading}
              size="small"
            >
              <NewFolderIcon />
            </IconButton>
          </Tooltip>
          
          {onDismiss && (
            <Tooltip title="Close">
              <IconButton 
                onClick={onDismiss}
                size="small"
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </PanelHeader>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab value="split" label="Split View" disabled={loading} />
          <Tab value="browser" label="Browser" disabled={loading} />
          <Tab value="preview" label="Preview" disabled={!selectedFile || loading} />
        </Tabs>
      </Box>
      
      {operationStatus && (
        <Alert 
          severity={operationStatus.type} 
          sx={{ m: 1 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={clearOperationStatus}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {operationStatus.message}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ m: 1 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
      
      <PanelContent>
        {viewMode === 'split' && (
          <Grid container sx={{ height: '100%', overflow: 'hidden' }}>
            <Grid item xs={6} sx={{ height: '100%', borderRight: 1, borderColor: 'divider' }}>
              <BrowserWrapper>
                <FileBrowserComponent 
                  storageType={storageType}
                  containerName={containerName}
                  credentials={credentials}
                  onSelect={handleFileSelect}
                  initialPath={initialPath}
                  height="100%"
                  mode={mode}
                />
              </BrowserWrapper>
            </Grid>
            <Grid item xs={6} sx={{ height: '100%' }}>
              <BrowserWrapper>
                <FilePreviewComponent 
                  file={selectedFile?.type === 'file' ? selectedFile : null}
                  storageType={storageType}
                  credentials={credentials}
                  height="100%"
                />
              </BrowserWrapper>
            </Grid>
          </Grid>
        )}
        
        {viewMode === 'browser' && (
          <BrowserWrapper>
            <FileBrowserComponent 
              storageType={storageType}
              containerName={containerName}
              credentials={credentials}
              onSelect={handleFileSelect}
              initialPath={initialPath}
              height="100%"
              mode={mode}
            />
          </BrowserWrapper>
        )}
        
        {viewMode === 'preview' && (
          <BrowserWrapper>
            <FilePreviewComponent 
              file={selectedFile?.type === 'file' ? selectedFile : null}
              storageType={storageType}
              credentials={credentials}
              height="100%"
            />
          </BrowserWrapper>
        )}
      </PanelContent>
      
      {/* New Folder Dialog */}
      <Dialog 
        open={newFolderDialogOpen} 
        onClose={() => setNewFolderDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setNewFolderDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFolder} 
            variant="contained" 
            color="primary"
            disabled={!newFolderName.trim() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <NewFolderIcon />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Select a file to upload to the current location.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
            <input
              accept="*/*"
              id="contained-button-file"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              disabled={loading}
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                disabled={loading}
              >
                Select File
              </Button>
            </label>
            
            {fileToUpload && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <FileIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {fileToUpload.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                  ({(fileToUpload.size / 1024).toFixed(1)} KB)
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUploadDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            color="primary"
            disabled={!fileToUpload || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </PanelContainer>
  );
};

StorageFileBrowserPanel.propTypes = {
  storageType: PropTypes.oneOf(['s3', 'azure', 'sharepoint']),
  containerName: PropTypes.string,
  credentials: PropTypes.object,
  initialPath: PropTypes.string,
  mode: PropTypes.oneOf(['browser', 'selector']),
  onFileSelect: PropTypes.func,
  onFilesSelect: PropTypes.func,
  onDismiss: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  selectedNodeId: PropTypes.string,
  fullScreen: PropTypes.bool,
  title: PropTypes.string
};

export default StorageFileBrowserPanel;