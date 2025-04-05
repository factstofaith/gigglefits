
import {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary } from
'@/error-handling'; /**
* Azure Blob Container Browser Component
*
* A component for browsing and selecting Azure Blob containers and blobs.
* Supports container creation, browsing, searching, and file operations.
*
* @component
*/
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box,
Button,
Card,
CardContent,
CardHeader,
CircularProgress,
Dialog,
DialogActions,
DialogContent,
DialogContentText,
DialogTitle,
Divider,
Grid,
IconButton,
InputAdornment,
List,
ListItem,
ListItemIcon,
ListItemSecondaryAction,
ListItemText,
Menu,
MenuItem,
Paper,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
TextField,
Tooltip,
Typography,
Alert,
AlertTitle,
FormControlLabel,
Checkbox,
LinearProgress } from
'@mui/material';
import {
  AddCircleOutline as AddIcon,
  ArrowUpward as UpIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  CreateNewFolder as CreateFolderIcon,
  CloudCircle as ContainerIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorOutlineIcon } from
'@mui/icons-material';

/**
 * Format file size to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Azure Blob Container Browser Component
 */
const AzureBlobContainerBrowser = ({
  config,
  onSelectContainer,
  onSelectBlob,
  readOnly = false,
  selectedContainer = '',
  selectedPath = ''
}) => {
  const [formError, setFormError] = useState(null);
  // State for containers and blobs
  const [containers, setContainers] = useState([]);
  const [blobs, setBlobs] = useState([]);
  const [currentPath, setCurrentPath] = useState(selectedPath || '');
  const [pathHistory, setPathHistory] = useState([]);

  // State for loading indicators
  const [loading, setLoading] = useState(false);
  const [containerLoading, setContainerLoading] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Dialog states
  const [newContainerDialogOpen, setNewContainerDialogOpen] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadOptions, setUploadOptions] = useState({
    overwriteExisting: true,
    calculateMD5: false
  });

  // Context menu state
  const [contextMenuPos, setContextMenuPos] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // File viewer state
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileViewUrl, setFileViewUrl] = useState('');
  const [fileViewType, setFileViewType] = useState('');

  // Error state
  const [error, setError] = useState(null);

  /**
   * Load containers from Azure
   */
  const loadContainers = useCallback(async () => {
    if (!config) return;

    setContainerLoading(true);
    setError(null);

    try {
      // Simulated API call for now - in real implementation, this would call an API
      // using the config parameters
      console.log('Loading containers with config:', config);

      // Simulate API response
      const response = await new Promise((resolve) => setTimeout(() => {
        resolve({
          status: 'success',
          containers: [
          { name: 'container1', properties: { lastModified: new Date().toISOString() } },
          { name: 'container2', properties: { lastModified: new Date().toISOString() } },
          { name: 'datasets', properties: { lastModified: new Date().toISOString() } },
          { name: 'exports', properties: { lastModified: new Date().toISOString() } },
          { name: 'imports', properties: { lastModified: new Date().toISOString() } }]

        });
      }, 1000));

      if (response.status === 'success') {
        setContainers(response.containers);

        // If a container is already selected, keep it selected
        if (selectedContainer && response.containers.some((c) => c.name === selectedContainer)) {
          loadBlobs(selectedContainer, selectedPath || '');
        }
      } else {
        setError(response.message || 'Failed to load containers');
      }
    } catch (err) {
      console.error('Error loading containers:', err);
      setError(err.message || 'An error occurred while loading containers');
    } finally {
      setContainerLoading(false);
    }
  }, [config, selectedContainer, selectedPath]);

  /**
   * Load blobs from a container
   */
  const loadBlobs = useCallback(async (containerName, path = '') => {
    if (!config || !containerName) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      console.log(`Loading blobs from container: ${containerName}, path: ${path}`);

      // Simulate API response with mock data based on path
      const response = await new Promise((resolve) => setTimeout(() => {
        // Generate different mock responses based on the path
        let mockBlobs = [];

        if (path === '') {
          // Root directory
          mockBlobs = [
          {
            name: 'folder1/',
            properties: {
              contentLength: 0,
              lastModified: new Date(Date.now() - 86400000).toISOString(),
              contentType: 'application/directory'
            },
            type: 'directory'
          },
          {
            name: 'folder2/',
            properties: {
              contentLength: 0,
              lastModified: new Date(Date.now() - 172800000).toISOString(),
              contentType: 'application/directory'
            },
            type: 'directory'
          },
          {
            name: 'data/',
            properties: {
              contentLength: 0,
              lastModified: new Date(Date.now() - 259200000).toISOString(),
              contentType: 'application/directory'
            },
            type: 'directory'
          },
          {
            name: 'sample.csv',
            properties: {
              contentLength: 1024,
              lastModified: new Date(Date.now() - 345600000).toISOString(),
              contentType: 'text/csv'
            },
            type: 'blob'
          },
          {
            name: 'readme.txt',
            properties: {
              contentLength: 512,
              lastModified: new Date(Date.now() - 432000000).toISOString(),
              contentType: 'text/plain'
            },
            type: 'blob'
          }];

        } else if (path === 'folder1/') {
          // Folder 1 contents
          mockBlobs = [
          {
            name: 'folder1/subfolder/',
            properties: {
              contentLength: 0,
              lastModified: new Date(Date.now() - 518400000).toISOString(),
              contentType: 'application/directory'
            },
            type: 'directory'
          },
          {
            name: 'folder1/data1.json',
            properties: {
              contentLength: 2048,
              lastModified: new Date(Date.now() - 604800000).toISOString(),
              contentType: 'application/json'
            },
            type: 'blob'
          }];

        } else if (path === 'folder1/subfolder/') {
          // Subfolder contents
          mockBlobs = [
          {
            name: 'folder1/subfolder/deep.xml',
            properties: {
              contentLength: 4096,
              lastModified: new Date(Date.now() - 691200000).toISOString(),
              contentType: 'application/xml'
            },
            type: 'blob'
          }];

        } else if (path === 'folder2/') {
          // Folder 2 contents
          mockBlobs = [
          {
            name: 'folder2/image.png',
            properties: {
              contentLength: 102400,
              lastModified: new Date(Date.now() - 777600000).toISOString(),
              contentType: 'image/png'
            },
            type: 'blob'
          },
          {
            name: 'folder2/document.pdf',
            properties: {
              contentLength: 204800,
              lastModified: new Date(Date.now() - 864000000).toISOString(),
              contentType: 'application/pdf'
            },
            type: 'blob'
          }];

        } else if (path === 'data/') {
          // Data folder contents
          mockBlobs = [
          {
            name: 'data/dataset1.csv',
            properties: {
              contentLength: 5120,
              lastModified: new Date(Date.now() - 950400000).toISOString(),
              contentType: 'text/csv'
            },
            type: 'blob'
          },
          {
            name: 'data/dataset2.csv',
            properties: {
              contentLength: 6144,
              lastModified: new Date(Date.now() - 1036800000).toISOString(),
              contentType: 'text/csv'
            },
            type: 'blob'
          },
          {
            name: 'data/dataset3.xlsx',
            properties: {
              contentLength: 8192,
              lastModified: new Date(Date.now() - 1123200000).toISOString(),
              contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            type: 'blob'
          }];

        }

        resolve({
          status: 'success',
          blobs: mockBlobs,
          containerName: containerName,
          path: path
        });
      }, 1000));

      if (response.status === 'success') {
        // Update current container and path
        if (containerName !== selectedContainer) {
          onSelectContainer(containerName);
          setPathHistory([]);
        }

        setBlobs(response.blobs);
        setCurrentPath(path);

        // If this is a new path, add it to history
        if (path !== currentPath) {
          setPathHistory((prevHistory) => {
            // Add the previous path to history only if it's not empty
            if (currentPath) {
              return [...prevHistory, currentPath];
            }
            return prevHistory;
          });
        }
      } else {
        setError(response.message || 'Failed to load blobs');
      }
    } catch (err) {
      console.error('Error loading blobs:', err);
      setError(err.message || 'An error occurred while loading blobs');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [config, currentPath, onSelectContainer, selectedContainer]);

  /**
   * Navigate to a folder or blob
   */
  const navigateTo = useCallback((item) => {
    if (item.type === 'directory') {
      // Extract the folder path from the name
      const fullPath = item.name;

      // Load blobs from the folder
      loadBlobs(selectedContainer, fullPath);
    } else if (item.type === 'blob') {
      // Select the blob
      onSelectBlob({
        containerName: selectedContainer,
        path: currentPath,
        blobName: item.name,
        blobProperties: item.properties
      });
    }
  }, [currentPath, loadBlobs, onSelectBlob, selectedContainer]);

  /**
   * Go up one level in the path
   */
  const navigateUp = useCallback(() => {
    if (pathHistory.length > 0) {
      // Get the previous path
      const previousPath = pathHistory[pathHistory.length - 1];

      // Update the path history
      setPathHistory((prevHistory) => prevHistory.slice(0, -1));

      // Load blobs from the previous path
      loadBlobs(selectedContainer, previousPath);
    } else {
      // If we're at the root of a container, go back to container list
      setBlobs([]);
      setCurrentPath('');
      onSelectContainer('');
    }
  }, [loadBlobs, onSelectContainer, pathHistory, selectedContainer]);

  /**
   * Search for blobs
   */
  const searchBlobs = useCallback(async () => {
    if (!searchTerm || !selectedContainer) return;

    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      console.log(`Searching for "${searchTerm}" in container: ${selectedContainer}`);

      // Simulate API response
      const response = await new Promise((resolve) => setTimeout(() => {
        // Generate mock search results
        const allPossibleBlobs = [
        {
          name: 'folder1/data1.json',
          properties: {
            contentLength: 2048,
            lastModified: new Date(Date.now() - 604800000).toISOString(),
            contentType: 'application/json'
          },
          type: 'blob'
        },
        {
          name: 'folder1/subfolder/deep.xml',
          properties: {
            contentLength: 4096,
            lastModified: new Date(Date.now() - 691200000).toISOString(),
            contentType: 'application/xml'
          },
          type: 'blob'
        },
        {
          name: 'folder2/image.png',
          properties: {
            contentLength: 102400,
            lastModified: new Date(Date.now() - 777600000).toISOString(),
            contentType: 'image/png'
          },
          type: 'blob'
        },
        {
          name: 'folder2/document.pdf',
          properties: {
            contentLength: 204800,
            lastModified: new Date(Date.now() - 864000000).toISOString(),
            contentType: 'application/pdf'
          },
          type: 'blob'
        },
        {
          name: 'data/dataset1.csv',
          properties: {
            contentLength: 5120,
            lastModified: new Date(Date.now() - 950400000).toISOString(),
            contentType: 'text/csv'
          },
          type: 'blob'
        },
        {
          name: 'data/dataset2.csv',
          properties: {
            contentLength: 6144,
            lastModified: new Date(Date.now() - 1036800000).toISOString(),
            contentType: 'text/csv'
          },
          type: 'blob'
        },
        {
          name: 'data/dataset3.xlsx',
          properties: {
            contentLength: 8192,
            lastModified: new Date(Date.now() - 1123200000).toISOString(),
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          type: 'blob'
        },
        {
          name: 'sample.csv',
          properties: {
            contentLength: 1024,
            lastModified: new Date(Date.now() - 345600000).toISOString(),
            contentType: 'text/csv'
          },
          type: 'blob'
        },
        {
          name: 'readme.txt',
          properties: {
            contentLength: 512,
            lastModified: new Date(Date.now() - 432000000).toISOString(),
            contentType: 'text/plain'
          },
          type: 'blob'
        }];


        // Filter by search term
        const searchLower = searchTerm.toLowerCase();
        const results = allPossibleBlobs.filter((blob) =>
        blob.name.toLowerCase().includes(searchLower));


        resolve({
          status: 'success',
          blobs: results
        });
      }, 1000));

      if (response.status === 'success') {
        setSearchResults(response.blobs);
      } else {
        setError(response.message || 'Failed to search blobs');
      }
    } catch (err) {
      console.error('Error searching blobs:', err);
      setError(err.message || 'An error occurred while searching blobs');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedContainer]);

  /**
   * Clear search and return to regular browsing
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);

    // Reload current path
    if (selectedContainer) {
      loadBlobs(selectedContainer, currentPath);
    }
  }, [currentPath, loadBlobs, selectedContainer]);

  /**
   * Create a new container
   */
  const createContainer = useCallback(async () => {
    if (!newContainerName) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      console.log(`Creating container: ${newContainerName}`);

      // Simulate API response
      const response = await new Promise((resolve) => setTimeout(() => {
        if (newContainerName.includes(' ')) {
          resolve({
            status: 'error',
            message: 'Container name cannot contain spaces'
          });
        } else if (containers.some((c) => c.name === newContainerName)) {
          resolve({
            status: 'error',
            message: 'Container already exists'
          });
        } else {
          resolve({
            status: 'success',
            container: {
              name: newContainerName,
              properties: {
                lastModified: new Date().toISOString()
              }
            }
          });
        }
      }, 1000));

      if (response.status === 'success') {
        // Add new container to list
        setContainers((prevContainers) => [...prevContainers, response.container]);

        // Close dialog
        setNewContainerDialogOpen(false);
        setNewContainerName('');

        // Select the new container
        onSelectContainer(response.container.name);
        loadBlobs(response.container.name, '');
      } else {
        setError(response.message || 'Failed to create container');
      }
    } catch (err) {
      console.error('Error creating container:', err);
      setError(err.message || 'An error occurred while creating container');
    } finally {
      setLoading(false);
    }
  }, [containers, loadBlobs, newContainerName, onSelectContainer]);

  /**
   * Create a new folder
   */
  const createFolder = useCallback(async () => {
    if (!newFolderName || !selectedContainer) return;

    setLoading(true);
    setError(null);

    try {
      // Construct the full path
      const fullPath = currentPath ? `${currentPath}${newFolderName}/` : `${newFolderName}/`;

      // Simulate API call
      console.log(`Creating folder: ${fullPath} in container: ${selectedContainer}`);

      // Simulate API response
      const response = await new Promise((resolve) => setTimeout(() => {
        resolve({
          status: 'success',
          folder: {
            name: fullPath,
            properties: {
              contentLength: 0,
              lastModified: new Date().toISOString(),
              contentType: 'application/directory'
            },
            type: 'directory'
          }
        });
      }, 1000));

      if (response.status === 'success') {
        // Add new folder to list
        setBlobs((prevBlobs) => [...prevBlobs, response.folder]);

        // Close dialog
        setNewFolderDialogOpen(false);
        setNewFolderName('');
      } else {
        setError(response.message || 'Failed to create folder');
      }
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err.message || 'An error occurred while creating folder');
    } finally {
      setLoading(false);
    }
  }, [currentPath, newFolderName, selectedContainer]);

  /**
   * Delete a container, folder, or blob
   */
  const deleteItem = useCallback(async () => {
    if (!itemToDelete) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`Deleting ${itemToDelete.type}: ${itemToDelete.name}`);

      // Simulate API call
      const response = await new Promise((resolve) => setTimeout(() => {
        resolve({
          status: 'success'
        });
      }, 1000));

      if (response.status === 'success') {
        if (itemToDelete.type === 'container') {
          // Remove container from list
          setContainers((prevContainers) =>
          prevContainers.filter((c) => c.name !== itemToDelete.name));


          // If this was the selected container, clear selection
          if (selectedContainer === itemToDelete.name) {
            onSelectContainer('');
            setBlobs([]);
            setCurrentPath('');
          }
        } else {
          // Remove blob or folder from list
          setBlobs((prevBlobs) =>
          prevBlobs.filter((b) => b.name !== itemToDelete.name));

        }

        // Close dialog
        setConfirmDeleteDialogOpen(false);
        setItemToDelete(null);
      } else {
        setError(response.message || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message || 'An error occurred while deleting item');
    } finally {
      setLoading(false);
    }
  }, [itemToDelete, onSelectContainer, selectedContainer]);

  /**
   * Process file selection for upload
   */
  const processFileSelection = useCallback((files) => {
    if (!files || files.length === 0) return;

    // If it's a FileList (from input), convert to array
    const fileArray = Array.from(files);

    if (fileArray.length === 1) {
      // Single file selection - use the existing workflow
      setSelectedFile(fileArray[0]);
      setFilesToUpload([]);
    } else {
      // Multiple file selection
      setFilesToUpload(fileArray);
      setSelectedFile(fileArray[0]); // Show the first file in preview
      setCurrentUploadIndex(0);
    }
  }, []);

  /**
   * Upload a single file
   */
  const uploadSingleFile = useCallback(async (file) => {
    if (!file || !selectedContainer) return false;

    try {
      // Construct the full path
      const fullPath = currentPath ? `${currentPath}${file.name}` : file.name;

      console.log(`Uploading file: ${fullPath} to container: ${selectedContainer}`);

      // Simulate upload progress with more realistic behavior
      let progress = 0;
      const uploadProgressInterval = setInterval(() => {
        // Realistic upload progress simulation
        // First 80% is linear, last 20% is slower to simulate server processing
        if (progress < 80) {
          progress += Math.random() * 5; // Random increment for realism
        } else if (progress < 95) {
          progress += Math.random() * 0.5; // Slower near the end
        } else if (progress < 99) {
          progress += 0.1; // Very slow for the last bit
        }

        if (progress >= 100) {
          clearInterval(uploadProgressInterval);
          progress = 100;
        }

        setUploadProgress(Math.min(Math.floor(progress), 100));
      }, 200);

      // Simulate API response with file validation and upload behavior
      const response = await new Promise((resolve) => {
        // Calculate simulated upload time based on file size for realism
        // Larger files take longer to upload
        const baseUploadTime = 1000; // Minimum 1 second
        const sizeBasedTime = Math.min(file.size / 10000, 5000); // Up to 5 seconds more for large files

        setTimeout(() => {
          clearInterval(uploadProgressInterval);
          setUploadProgress(100);

          // In a real implementation, we would check for errors
          // like size limits, permission issues, etc.
          resolve({
            status: 'success',
            blob: {
              name: fullPath,
              properties: {
                contentLength: file.size,
                lastModified: new Date().toISOString(),
                contentType: file.type || 'application/octet-stream'
              },
              type: 'blob'
            }
          });
        }, baseUploadTime + sizeBasedTime);
      });

      if (response.status === 'success') {
        // Add new file to list if we're in the current path
        setBlobs((prevBlobs) => [...prevBlobs, response.blob]);
        return true;
      } else {
        setError(response.message || `Failed to upload file: ${file.name}`);
        return false;
      }
    } catch (err) {
      console.error(`Error uploading file ${file.name}:`, err);
      setError(err.message || `An error occurred while uploading file: ${file.name}`);
      return false;
    }
  }, [currentPath, selectedContainer]);

  /**
   * Upload files (single file or batch upload)
   */
  const uploadFile = useCallback(async () => {
    if (!selectedContainer) return;

    setLoading(true);
    setError(null);

    try {
      if (filesToUpload.length > 0) {
        // Batch upload workflow
        let successCount = 0;

        // Process each file in sequence
        for (let i = 0; i < filesToUpload.length; i++) {
          setCurrentUploadIndex(i);
          setSelectedFile(filesToUpload[i]); // Update preview to current file
          setUploadProgress(0);

          const success = await uploadSingleFile(filesToUpload[i]);
          if (success) {
            successCount++;
          }

          // Short pause between files
          if (i < filesToUpload.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Show completion message
        console.log(`Uploaded ${successCount} of ${filesToUpload.length} files successfully`);

        // Close dialog after batch upload
        if (successCount > 0) {
          setTimeout(() => {
            setFileUploadDialogOpen(false);
            setSelectedFile(null);
            setFilesToUpload([]);
            setUploadProgress(0);
          }, 1500);
        }

      } else if (selectedFile) {
        // Single file upload workflow
        const success = await uploadSingleFile(selectedFile);

        // Close dialog after successful upload
        if (success) {
          setTimeout(() => {
            setFileUploadDialogOpen(false);
            setSelectedFile(null);
            setUploadProgress(0);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error in upload process:', err);
      setError(err.message || 'An unexpected error occurred during upload');
    } finally {
      setLoading(false);
    }
  }, [currentPath, selectedContainer, selectedFile, filesToUpload, uploadSingleFile]);

  /**
   * Download a blob
   */
  const downloadBlob = useCallback((item) => {
    if (!item || !selectedContainer) return;

    console.log(`Downloading blob: ${item.name} from container: ${selectedContainer}`);

    // In a real implementation, this would create a download link using the blob URL
    // For now, we'll just simulate it
    alert(`Simulated download of file: ${item.name}`);
  }, [selectedContainer]);

  /**
   * View/preview a blob
   */
  const viewBlob = useCallback((item) => {
    if (!item || !selectedContainer) return;

    console.log(`Viewing blob: ${item.name} from container: ${selectedContainer}`);

    // In a real implementation, this would create a URL for the blob content
    // For now, we'll use a placeholder
    setFileViewUrl(`https://example.com/preview/${selectedContainer}/${item.name}`);

    // Set the file type based on contentType or extension
    const contentType = item.properties?.contentType || '';
    setFileViewType(contentType);

    // Open the viewer
    setFileViewerOpen(true);
  }, [selectedContainer]);

  /**
   * Handle context menu opening
   */
  const handleContextMenu = useCallback((event, item) => {
    event.preventDefault();

    // Skip if in read-only mode
    if (readOnly) return;

    setContextMenuPos({ x: event.clientX, y: event.clientY });
    setSelectedItem(item);
  }, [readOnly]);

  /**
   * Handle context menu closing
   */
  const handleContextMenuClose = useCallback(() => {
    setContextMenuPos(null);
    setSelectedItem(null);
  }, []);

  // Load containers on mount
  useEffect(() => {
    if (config) {
      loadContainers();
    }
  }, [config, loadContainers]);

  // File content render functions with enhanced preview
  const renderFilePreview = (url, contentType) => {
    // Import FilePreview component for advanced file previewing
    const FilePreview = require('../../common/FilePreview').default;

    // Generate a mock file object with the selected item's data
    const fileObj = selectedItem ? {
      name: getDisplayName(selectedItem.name, selectedItem.type),
      type: contentType,
      size: selectedItem.properties?.contentLength || 0,
      lastModified: selectedItem.properties?.lastModified
    } : null;

    // Generate simulated content for text files
    const generateSimulatedContent = () => {
      if (contentType === 'text/plain') {
        return `This is a simulated preview of a plain text file.\n\nFilename: ${selectedItem.name}\nSize: ${formatFileSize(selectedItem.properties?.contentLength || 0)}\nLast Modified: ${formatDate(selectedItem.properties?.lastModified)}\n\nIn a production environment, this would fetch the actual file content from the Azure Blob storage.`;
      }

      if (contentType === 'text/csv') {
        return `id,name,email,department\n1,"John Smith",john.smith@example.com,Marketing\n2,"Jane Doe",jane.doe@example.com,Engineering\n3,"Robert Johnson",robert.johnson@example.com,Finance\n4,"Sarah Williams",sarah.williams@example.com,Human Resources\n5,"Michael Brown",michael.brown@example.com,Sales`;
      }

      if (contentType === 'application/json') {
        return JSON.stringify({
          "id": 12345,
          "name": "Sample JSON Data",
          "items": [
          { "id": 1, "value": "First item" },
          { "id": 2, "value": "Second item" },
          { "id": 3, "value": "Third item" }],

          "metadata": {
            "created": new Date().toISOString(),
            "version": "1.0.0",
            "source": "Azure Blob Storage"
          }
        }, null, 2);
      }

      if (contentType === 'application/xml' || contentType === 'text/xml') {
        return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item id="1">\n    <name>First Item</name>\n    <value>100</value>\n  </item>\n  <item id="2">\n    <name>Second Item</name>\n    <value>200</value>\n  </item>\n  <metadata>\n    <created>${new Date().toISOString()}</created>\n    <source>Azure Blob Storage</source>\n  </metadata>\n</root>`;
      }

      // Default text content
      return `This is a simulated preview of content type: ${contentType}\n\nIn a production environment, this would display the actual file content.`;
    };

    // Generate content for text-based files
    const content = contentType === 'text/plain' ||
    contentType === 'text/csv' ||
    contentType === 'application/json' ||
    contentType === 'application/xml' ||
    contentType === 'text/xml' ?
    generateSimulatedContent() :
    null;

    return (
      <FilePreview
        file={fileObj}
        url={url}
        content={content}
        mimeType={contentType}
        filename={fileObj?.name}
        onDownload={() => downloadBlob(selectedItem)}
        maxHeight="600px"
        fullWidth={true} />);


  };

  // Get color for file icon based on content type
  const getIconColorForFileType = (contentType) => {
    if (contentType.startsWith('image/')) {
      return 'success.main'; // Green for images
    } else if (contentType.startsWith('text/')) {
      return 'info.main'; // Blue for text files
    } else if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
      return 'success.dark'; // Dark green for spreadsheets
    } else if (contentType.includes('pdf')) {
      return 'error.main'; // Red for PDFs
    } else if (contentType.includes('zip') || contentType.includes('compressed')) {
      return 'warning.dark'; // Dark yellow for archives
    } else if (contentType.includes('json') || contentType.includes('xml')) {
      return 'secondary.main'; // Purple for data files
    } else {
      return 'info.main'; // Default blue
    }
  };

  // Item name display function (truncates long paths)
  const getDisplayName = (name, type) => {
    if (type === 'container') {
      return name;
    } else if (type === 'directory') {
      // For directories, extract the last folder name
      const parts = name.split('/');
      return parts[parts.length - 2] || name; // Account for trailing slash
    } else {
      // For blobs, extract filename from potentially nested path
      const parts = name.split('/');
      return parts[parts.length - 1] || name;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar with actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
          {/* Breadcrumb navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
            <Typography
              variant="h6"
              sx={{
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>

              {selectedContainer ?
              <>
                  <Tooltip title="Back to containers">
                    <Box
                    component="span"
                    onClick={() => onSelectContainer('')}
                    sx={{
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}>

                      Containers
                    </Box>
                  </Tooltip>
                  {' / '}
                  <Tooltip title={`Container: ${selectedContainer}`}>
                    <strong>{selectedContainer}</strong>
                  </Tooltip>
                </> :

              'Azure Blob Containers'}

            </Typography>
            
            {/* Path breadcrumb navigation */}
            {selectedContainer && currentPath &&
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 1,
                overflow: 'hidden',
                flexWrap: 'nowrap'
              }}>

                <Typography
                component="span"
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>

                  {' / '}
                  {currentPath.split('/').filter(Boolean).map((segment, index, array) => {
                  // Create a path up to this segment
                  const pathUpToSegment = array.slice(0, index + 1).join('/') + '/';

                  return (
                    <React.Fragment key={index}>
                        {index > 0 && ' / '}
                        <Tooltip title={`Navigate to ${segment}`}>
                          <Box
                          component="span"
                          onClick={() => loadBlobs(selectedContainer, pathUpToSegment)}
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            flexShrink: 0,
                            '&:hover': { textDecoration: 'underline' }
                          }}>

                            {segment}
                          </Box>
                        </Tooltip>
                      </React.Fragment>);

                })}
                </Typography>
              </Box>}

          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          {selectedContainer &&
          <Tooltip title="Go up">
              <IconButton
              onClick={navigateUp}
              disabled={loading}
              size="small">

                <UpIcon />
              </IconButton>
            </Tooltip>}

          
          <Tooltip title="Refresh">
            <IconButton
              onClick={() => selectedContainer ? loadBlobs(selectedContainer, currentPath) : loadContainers()}
              disabled={loading}
              size="small">

              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {!readOnly &&
          <>
              {selectedContainer ?
            <Tooltip title="Upload File">
                  <IconButton
                onClick={() => setFileUploadDialogOpen(true)}
                disabled={loading}
                size="small"
                color="primary">

                    <UploadIcon />
                  </IconButton>
                </Tooltip> :

            <Tooltip title="New Container">
                  <IconButton
                onClick={() => setNewContainerDialogOpen(true)}
                disabled={loading || containerLoading}
                size="small"
                color="primary">

                    <AddIcon />
                  </IconButton>
                </Tooltip>}

              
              {selectedContainer &&
            <Tooltip title="New Folder">
                  <IconButton
                onClick={() => setNewFolderDialogOpen(true)}
                disabled={loading}
                size="small"
                color="primary">

                    <CreateFolderIcon />
                  </IconButton>
                </Tooltip>}

            </>}

        </Box>
      </Box>
      
      {/* Search bar */}
      {selectedContainer &&
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
          fullWidth
          placeholder="Search blobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          size="small"
          InputProps={{
            startAdornment:
            <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>,

            endAdornment: isSearching &&
            <InputAdornment position="end">
                  <Button
                size="small"
                onClick={clearSearch}
                disabled={loading}>

                    Clear
                  </Button>
                </InputAdornment>

          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && searchTerm) {
              searchBlobs();
            }
          }} />

          <Button
          variant="contained"
          onClick={searchBlobs}
          disabled={loading || !searchTerm}
          sx={{ ml: 1 }}>

            Search
          </Button>
        </Box>}

      
      {/* Error message */}
      {error &&
      <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>}

      
      {/* Content area */}
      {containerLoading || loading ?
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box> :
      selectedContainer ?
      // Blob list
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Size</TableCell>
                <TableCell align="right">Last Modified</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(isSearching ? searchResults : blobs).length === 0 ?
            <TableRow>
                  <TableCell colSpan={4} align="center">
                    {isSearching ? 'No search results' : 'No items in this location'}
                  </TableCell>
                </TableRow> :
            (isSearching ? searchResults : blobs).map((item) =>
            <TableRow
              key={item.name}
              hover
              onClick={() => navigateTo(item)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, item)}>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {item.type === 'directory' ?
                    <FolderIcon color="primary" /> :

                    <FileIcon
                      sx={{
                        color: getIconColorForFileType(item.properties?.contentType || '')
                      }} />}


                      </ListItemIcon>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {getDisplayName(item.name, item.type)}
                        </Typography>
                        {item.type === 'blob' && item.properties?.contentType &&
                    <Typography variant="caption" color="text.secondary">
                            {item.properties.contentType}
                          </Typography>}

                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {item.type === 'directory' ?
                '-' :

                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    color: 'text.secondary'
                  }}>

                        {formatFileSize(item.properties?.contentLength || 0)}
                      </Typography>}

                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.properties?.lastModified)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {item.type === 'blob' &&
                  <>
                          <Tooltip title="View">
                            <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewBlob(item);
                        }}>

                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadBlob(item);
                        }}>

                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Select this file">
                            <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBlob({
                            containerName: selectedContainer,
                            path: currentPath,
                            blobName: item.name,
                            blobProperties: item.properties
                          });
                        }}>

                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>}

                      {!readOnly &&
                  <Tooltip title="More actions">
                          <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, item);
                      }}>

                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>}

                    </Box>
                  </TableCell>
                </TableRow>)}

            </TableBody>
          </Table>
        </TableContainer> :

      // Container list
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Container Name</TableCell>
                <TableCell align="right">Last Modified</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {containers.length === 0 ?
            <TableRow>
                  <TableCell colSpan={3} align="center">
                    No containers found
                  </TableCell>
                </TableRow> :
            containers.map((container) =>
            <TableRow
              key={container.name}
              hover
              onClick={() => loadBlobs(container.name, '')}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, { ...container, type: 'container' })}>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ContainerIcon color="primary" />
                      </ListItemIcon>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {container.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(container.properties?.lastModified)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Tooltip title="Browse container">
                        <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadBlobs(container.name, '');
                      }}>

                          <FolderOpenIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Select container">
                        <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectContainer(container.name);
                      }}>

                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!readOnly &&
                  <Tooltip title="More actions">
                          <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, { ...container, type: 'container' });
                      }}>

                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>}

                    </Box>
                  </TableCell>
                </TableRow>)}

            </TableBody>
          </Table>
        </TableContainer>}

      
      {/* Context menu */}
      <Menu
        open={Boolean(contextMenuPos)}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
        contextMenuPos ?
        { top: contextMenuPos.y, left: contextMenuPos.x } :
        undefined}>


        {selectedItem && selectedItem.type === 'container' &&
        <div>
            <MenuItem onClick={() => {
            loadBlobs(selectedItem.name, '');
            handleContextMenuClose();
          }}>
              <ListItemIcon>
                <FolderOpenIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Browse container
            </MenuItem>
            <MenuItem
            onClick={() => {
              onSelectContainer(selectedItem.name);
              handleContextMenuClose();
            }}
            divider>

              <ListItemIcon>
                <CheckCircleIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Select container
            </MenuItem>
            {!readOnly &&
          <MenuItem onClick={() => {
            setItemToDelete(selectedItem);
            setConfirmDeleteDialogOpen(true);
            handleContextMenuClose();
          }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete container
              </MenuItem>}

          </div>}

        
        {selectedItem && selectedItem.type === 'directory' &&
        <div>
            <MenuItem onClick={() => {
            navigateTo(selectedItem);
            handleContextMenuClose();
          }}>
              <ListItemIcon>
                <FolderOpenIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Open folder
            </MenuItem>
            {!readOnly &&
          <MenuItem onClick={() => {
            setItemToDelete(selectedItem);
            setConfirmDeleteDialogOpen(true);
            handleContextMenuClose();
          }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete folder
              </MenuItem>}

          </div>}

        
        {selectedItem && selectedItem.type === 'blob' &&
        <div>
            <MenuItem onClick={() => {
            viewBlob(selectedItem);
            handleContextMenuClose();
          }}>
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              View
            </MenuItem>
            <MenuItem onClick={() => {
            downloadBlob(selectedItem);
            handleContextMenuClose();
          }}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              Download
            </MenuItem>
            <MenuItem
            onClick={() => {
              onSelectBlob({
                containerName: selectedContainer,
                path: currentPath,
                blobName: selectedItem.name,
                blobProperties: selectedItem.properties
              });
              handleContextMenuClose();
            }}
            divider>

              <ListItemIcon>
                <CheckCircleIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Select this file
            </MenuItem>
            {!readOnly &&
          <MenuItem onClick={() => {
            setItemToDelete(selectedItem);
            setConfirmDeleteDialogOpen(true);
            handleContextMenuClose();
          }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete
              </MenuItem>}

          </div>}

      </Menu>
      
      {/* New Container Dialog */}
      <Dialog open={newContainerDialogOpen} onClose={() => setNewContainerDialogOpen(false)}>
        <DialogTitle>Create New Container</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the new container. Container names must be lowercase letters, numbers, or hyphens.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="container-name"
            label="Container Name"
            type="text"
            fullWidth
            value={newContainerName}
            onChange={(e) => setNewContainerName(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            disabled={loading} />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewContainerDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={createContainer}
            color="primary"
            disabled={loading || !newContainerName}>

            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the new folder.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="folder-name"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            disabled={loading} />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={createFolder}
            color="primary"
            disabled={loading || !newFolderName}>

            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the {itemToDelete?.type === 'container' ? 'container' : itemToDelete?.type === 'directory' ? 'folder' : 'file'}:
            <Box component="span" sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}>
              {itemToDelete?.name}
            </Box>
            {itemToDelete?.type === 'container' &&
            <Typography color="error" sx={{ mt: 2 }}>
                This will delete all blobs in the container!
              </Typography>}

            {itemToDelete?.type === 'directory' &&
            <Typography color="error" sx={{ mt: 2 }}>
                This will delete all contents of the folder!
              </Typography>}

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={deleteItem}
            color="error"
            disabled={loading}>

            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Enhanced File Upload Dialog */}
      <Dialog
        open={fileUploadDialogOpen}
        onClose={() => {
          if (!loading) {
            setFileUploadDialogOpen(false);
            setSelectedFile(null);
            setUploadProgress(0);
          }
        }}
        fullWidth
        maxWidth="md">

        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Upload Files to Azure Blob Storage
            <IconButton onClick={() => {
              if (!loading) {
                setFileUploadDialogOpen(false);
                setSelectedFile(null);
                setUploadProgress(0);
              }
            }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Upload Location:
          </Typography>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ContainerIcon color="primary" sx={{ mr: 1 }} />
              <Typography sx={{ fontWeight: 'medium' }}>
                {selectedContainer}{currentPath ? `/${currentPath}` : ''}
              </Typography>
            </Box>
          </Paper>
          
          {/* Enhanced File Drop Zone */}
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 3,
              mb: 3,
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              },
              position: 'relative'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = (theme) => theme.palette.primary.main;
              e.currentTarget.style.backgroundColor = (theme) => theme.palette.action.hover;
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.backgroundColor = '';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.backgroundColor = '';

              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                // Process all dropped files
                processFileSelection(e.dataTransfer.files);
              }
            }}>

            <UploadIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop Files Here
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              or
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}>

              Browse Files
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processFileSelection(e.target.files);
                  }
                }} />

            </Button>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
              Supported file types: CSV, JSON, XML, PDF, Images, Text files
            </Typography>
          </Box>
          
          {/* File Preview & Validation Section */}
          {selectedFile &&
          <Box>
              <Typography variant="subtitle2" gutterBottom>
                File Preview
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    {/* Import the FileCard component for file preview */}
                    {(() => {
                    const FileCard = require('../../common/FileCard').default;
                    const { generateFileMetadata } = require("@/utils/fileTypeUtils");

                    // Generate metadata for the file
                    const fileMetadata = generateFileMetadata(selectedFile);

                    return (
                      <FileCard
                        file={selectedFile}
                        showActions={false}
                        showPreview={false}
                        variant="outlined" />);


                  })()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      File Details
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>File name:</span> 
                        <span style={{ fontWeight: 'medium' }}>{selectedFile.name}</span>
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Size:</span> 
                        <span>{formatFileSize(selectedFile.size)}</span>
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Type:</span> 
                        <span>{selectedFile.type || 'Unknown'}</span>
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Last modified:</span> 
                        <span>{new Date(selectedFile.lastModified).toLocaleString()}</span>
                      </Typography>
                    </Box>
                    
                    {/* File Type Validation */}
                    {(() => {
                    const { isPreviewSupported, getFileTypeDescription } = require("@/utils/fileTypeUtils");
                    const mimeType = selectedFile.type;
                    const isSupported = isPreviewSupported(mimeType);

                    return (
                      <Box sx={{ mb: 2 }}>
                          {isSupported ?
                        <Alert severity="success" icon={<CheckCircleIcon />}>
                              This file type ({getFileTypeDescription(mimeType)}) is fully supported.
                            </Alert> :

                        <Alert severity="warning">
                              <AlertTitle>Limited Support</AlertTitle>
                              This file type may have limited preview capabilities in the system.
                            </Alert>}

                        </Box>);

                  })()}
                    
                    <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => setSelectedFile(null)}
                    sx={{ mt: 1 }}>

                      Remove File
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Upload Progress Tracking */}
              {uploadProgress > 0 &&
            <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom display="flex" justifyContent="space-between">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </Typography>
                  <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mb: 1
                }} />

                  <Typography variant="caption" color="textSecondary">
                    {uploadProgress < 100 ?
                `Uploading ${selectedFile.name}...` :
                `Successfully uploaded ${selectedFile.name}`}

                  </Typography>
                  
                  {/* Batch upload status indicator */}
                  {filesToUpload.length > 1 &&
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="textSecondary">
                        File {currentUploadIndex + 1} of {filesToUpload.length}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {Array.from({ length: Math.min(filesToUpload.length, 5) }).map((_, index) => {
                    // Calculate status for this dot
                    let color = 'grey.300'; // default - not started
                    if (index < currentUploadIndex) {
                      color = 'success.main'; // completed
                    } else if (index === currentUploadIndex) {
                      color = uploadProgress === 100 ? 'success.main' : 'primary.main'; // in progress
                    }

                    return (
                      <Box
                        key={index}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: color,
                          mx: 0.5
                        }} />);


                  })}
                        {filesToUpload.length > 5 &&
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                            +{filesToUpload.length - 5} more
                          </Typography>}

                      </Box>
                    </Box>}

                </Box>}

              
              {/* Upload Options */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Options
                </Typography>
                <FormControlLabel
                control={
                <Checkbox
                  checked={uploadOptions.overwriteExisting}
                  onChange={() => setUploadOptions((prev) => ({
                    ...prev,
                    overwriteExisting: !prev.overwriteExisting
                  }))}
                  name="overwriteExisting" />}


                label="Overwrite if file already exists" />

                <FormControlLabel
                control={
                <Checkbox
                  checked={uploadOptions.calculateMD5}
                  onChange={() => setUploadOptions((prev) => ({
                    ...prev,
                    calculateMD5: !prev.calculateMD5
                  }))}
                  name="calculateMD5" />}


                label="Calculate and store content MD5 (for integrity verification)" />


                {/* Batch upload info */}
                {filesToUpload.length > 1 &&
              <Box sx={{ mt: 2, p: 1, bgcolor: 'info.lightest', borderRadius: 1 }}>
                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'medium', color: 'info.main', display: 'flex', alignItems: 'center' }}>
                      <InfoIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                      Batch Upload Information
                    </Typography>
                    <Typography variant="body2">
                      {filesToUpload.length} files selected for upload ({
                  formatFileSize(filesToUpload.reduce((total, file) => total + file.size, 0))}
                  )
                    </Typography>
                    <Button
                  size="small"
                  variant="text"
                  color="primary"
                  onClick={() => {
                    setFilesToUpload([]);
                    setSelectedFile(null);
                  }}
                  sx={{ mt: 1 }}
                  startIcon={<CloseIcon fontSize="small" />}>

                      Clear Batch Selection
                    </Button>
                  </Box>}

              </Box>
            </Box>}

        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setFileUploadDialogOpen(false);
              setSelectedFile(null);
              setUploadProgress(0);
            }}
            disabled={loading}>

            Cancel
          </Button>
          <Button
            onClick={uploadFile}
            variant="contained"
            color="primary"
            disabled={loading || !selectedFile || uploadProgress > 0}
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}>

            {loading ?
            'Uploading...' :
            filesToUpload.length > 1 ?
            `Upload ${filesToUpload.length} Files` :
            'Upload File'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Enhanced File Viewer Dialog */}
      <Dialog
        open={fileViewerOpen}
        onClose={() => setFileViewerOpen(false)}
        fullWidth
        maxWidth="lg">

        <DialogContent dividers sx={{ p: 0 }}>
          {renderFilePreview(fileViewUrl, fileViewType)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileViewerOpen(false)}>Close</Button>
          {selectedItem && selectedItem.type === 'blob' &&
          <>
              <Button
              onClick={() => {
                downloadBlob(selectedItem);
              }}
              startIcon={<DownloadIcon />}>

                Download
              </Button>
              <Button
              onClick={() => {
                onSelectBlob({
                  containerName: selectedContainer,
                  path: currentPath,
                  blobName: selectedItem.name,
                  blobProperties: selectedItem.properties
                });
                setFileViewerOpen(false);
              }}
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}>

                Select This File
              </Button>
            </>}

        </DialogActions>
      </Dialog>
    </Box>);

};

AzureBlobContainerBrowser.propTypes = {
  config: PropTypes.object.isRequired,
  onSelectContainer: PropTypes.func.isRequired,
  onSelectBlob: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  selectedContainer: PropTypes.string,
  selectedPath: PropTypes.string
};

export default AzureBlobContainerBrowser;