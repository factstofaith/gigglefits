import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
* S3 Bucket Browser Component
*
* A component for browsing and selecting AWS S3 buckets and objects.
* Supports bucket listing, object browsing, searching, and file operations.
*
* @component
*/
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardContent, CardHeader, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormGroup, FormHelperText, FormLabel, Grid, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Paper, Radio, RadioGroup, Select, Slider, Stack, Switch, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, Alert, AlertTitle, FormControlLabel, Checkbox, LinearProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AddCircleOutline as AddIcon, ArrowUpward as UpIcon, CloudUpload as UploadIcon, Delete as DeleteIcon, Download as DownloadIcon, Folder as FolderIcon, FolderOpen as FolderOpenIcon, InsertDriveFile as FileIcon, MoreVert as MoreVertIcon, Refresh as RefreshIcon, Search as SearchIcon, Visibility as ViewIcon, CreateNewFolder as CreateFolderIcon, Storage as BucketIcon, CheckCircle as CheckCircleIcon, Close as CloseIcon, Info as InfoIcon, Warning as WarningIcon, ErrorOutline as ErrorOutlineIcon, FilterList as FilterListIcon, FilterAlt as FilterAltIcon, SelectAll as SelectAllIcon, LibraryAddCheck as BatchActionIcon, Public as PublicIcon, Lock as LockIcon, Archive as ArchiveIcon, Check as CheckIcon, Clear as ClearIcon, ContentCopy as CopyIcon, ZoomIn as ZoomInIcon, MoveToInbox as MoveIcon, Label as TagIcon, Settings as AdvancedIcon } from '@mui/icons-material';

// Utilities for handling file types
import { generateFileMetadata, MimeTypeCategories } from "@/utils/fileTypeUtils";

// File type options for filtering
const FILE_TYPE_OPTIONS = [{
  value: 'TEXT',
  label: 'Text Files',
  description: 'CSV, TXT, JSON, XML, etc.'
}, {
  value: 'DOCUMENT',
  label: 'Documents',
  description: 'PDF, DOCX, XLSX, PPTX, etc.'
}, {
  value: 'IMAGE',
  label: 'Images',
  description: 'JPG, PNG, GIF, SVG, etc.'
}, {
  value: 'AUDIO',
  label: 'Audio',
  description: 'MP3, WAV, OGG, etc.'
}, {
  value: 'VIDEO',
  label: 'Video',
  description: 'MP4, WEBM, AVI, etc.'
}, {
  value: 'ARCHIVE',
  label: 'Archives',
  description: 'ZIP, RAR, TAR, etc.'
}, {
  value: 'DATA',
  label: 'Data Files',
  description: 'CSV, JSON, Parquet, etc.'
}, {
  value: 'CODE',
  label: 'Source Code',
  description: 'JS, PY, JAVA, etc.'
}];

// Size options presets for filtering
const SIZE_PRESETS = [{
  value: [0, 1024 * 10],
  label: 'Tiny (< 10KB)'
}, {
  value: [0, 1024 * 100],
  label: 'Small (< 100KB)'
}, {
  value: [1024 * 100, 1024 * 1024],
  label: 'Medium (100KB - 1MB)'
}, {
  value: [1024 * 1024, 1024 * 1024 * 10],
  label: 'Large (1MB - 10MB)'
}, {
  value: [1024 * 1024 * 10, 1024 * 1024 * 100],
  label: 'X-Large (10MB - 100MB)'
}, {
  value: [1024 * 1024 * 100, Number.MAX_SAFE_INTEGER],
  label: 'XX-Large (> 100MB)'
}];

// Date presets for filtering
const DATE_PRESETS = [{
  value: {
    days: 1
  },
  label: 'Last 24 hours'
}, {
  value: {
    days: 7
  },
  label: 'Last 7 days'
}, {
  value: {
    days: 30
  },
  label: 'Last 30 days'
}, {
  value: {
    days: 90
  },
  label: 'Last 3 months'
}, {
  value: {
    days: 365
  },
  label: 'Last year'
}, {
  value: 'custom',
  label: 'Custom range'
}];

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
 * Gets the date from a specified number of days ago
 * @param {number} days - Number of days to subtract from current date
 * @returns {Date} Date object representing the date X days ago
 */
const getDateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Applies filters to an array of objects
 * @param {Array} objects - Array of S3 objects to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered array of objects
 */
const applyFilters = (objects, filters) => {
  if (!objects || !filters) return objects;
  return objects.filter((item) => {
    // Skip directories if we're filtering by file type or size
    if (item.type === 'folder' || item.type === 'directory') {
      // Only filter directories by date or custom prefix
      let matchesPrefix = true;
      let matchesDate = true;

      // Filter by prefix if specified
      if (filters.customPrefix) {
        matchesPrefix = item.key.toLowerCase().includes(filters.customPrefix.toLowerCase());
      }

      // Filter by date if specified
      if (filters.dateRange.start && filters.dateRange.end) {
        const itemDate = new Date(item.lastModified);
        matchesDate = itemDate >= filters.dateRange.start && itemDate <= filters.dateRange.end;
      }
      return matchesPrefix && matchesDate;
    }

    // Filter by file type
    let matchesFileType = true;
    if (filters.fileTypes && filters.fileTypes.length > 0) {
      matchesFileType = filters.fileTypes.some((type) => {
        // Check if this file's content type belongs to the selected category
        const contentType = item.contentType || '';
        return MimeTypeCategories[type]?.some((mimeType) => contentType.toLowerCase().includes(mimeType.toLowerCase()));
      });
    }

    // Filter by size range
    let matchesSize = true;
    if (filters.sizeRange && filters.sizeRange.length === 2) {
      const size = item.size || 0;
      matchesSize = size >= filters.sizeRange[0] && size <= filters.sizeRange[1];
    }

    // Filter by date range
    let matchesDate = true;
    if (filters.dateRange.start && filters.dateRange.end) {
      const itemDate = new Date(item.lastModified);
      matchesDate = itemDate >= filters.dateRange.start && itemDate <= filters.dateRange.end;
    }

    // Filter by custom prefix
    let matchesPrefix = true;
    if (filters.customPrefix) {
      matchesPrefix = item.key.toLowerCase().includes(filters.customPrefix.toLowerCase());
    }
    return matchesFileType && matchesSize && matchesDate && matchesPrefix;
  });
};

/**
 * Performs batch operation on selected items with comprehensive progress tracking
 * @param {string} action - The action to perform (delete, download, copy, etc.)
 * @param {Array} items - Array of selected items
 * @param {string} target - Target location for copy/move operations
 * @returns {Promise<Object>} Result of the batch operation
 */
const performBatchOperation = async (action, items, target = '') => {
  if (!items || items.length === 0) {
    return {
      success: false,
      message: 'No items selected'
    };
  }

  // Reset status
  setBatchOperationStatus({
    inProgress: true,
    completed: false,
    failed: false,
    message: `Processing ${items.length} items...`,
    details: null,
    progress: 0
  });

  // Track total items for progress calculation
  const totalItems = items.length;
  const updateProgress = (processedItems) => {
    const progress = Math.round(processedItems / totalItems * 100);
    setBatchOperationStatus((prev) => ({
      ...prev,
      progress,
      message: `Processed ${processedItems} of ${totalItems} items (${progress}%)`
    }));
  };
  try {
    // Different operations based on action type
    switch (action) {
      case 'delete':
        // Simulated batch delete with progress
        console.log(`Batch deleting ${items.length} items`);

        // Simulate progress updates
        for (let i = 0; i < totalItems; i++) {
          await new Promise((resolve) => setTimeout(resolve, 75));
          updateProgress(i + 1);
        }
        setBatchOperationStatus({
          inProgress: false,
          completed: true,
          failed: false,
          message: `Successfully deleted ${items.length} items`,
          details: {
            itemCount: items.length,
            itemTypes: countItemTypes(items),
            totalSize: calculateTotalSize(items)
          },
          progress: 100
        });
        return {
          success: true,
          message: `Successfully deleted ${items.length} items`,
          details: {
            itemCount: items.length
          }
        };
      case 'download':
        // Simulated batch download with progress
        console.log(`Batch downloading ${items.length} items`);

        // Faster progress simulation for download
        for (let i = 0; i < totalItems; i++) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          updateProgress(i + 1);
        }
        setBatchOperationStatus({
          inProgress: false,
          completed: true,
          failed: false,
          message: `Prepared ${items.length} items for download`,
          details: {
            itemCount: items.length,
            itemTypes: countItemTypes(items),
            totalSize: calculateTotalSize(items)
          },
          progress: 100
        });
        return {
          success: true,
          message: `Prepared ${items.length} items for download`,
          details: {
            itemCount: items.length
          }
        };
      case 'copy':
        // Simulated batch copy with progress and target
        console.log(`Batch copying ${items.length} items to ${target}`);

        // Slower progress simulation for copy
        for (let i = 0; i < totalItems; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          updateProgress(i + 1);
        }
        setBatchOperationStatus({
          inProgress: false,
          completed: true,
          failed: false,
          message: `Successfully copied ${items.length} items to ${target || 'destination'}`,
          details: {
            itemCount: items.length,
            target: target || 'destination',
            itemTypes: countItemTypes(items),
            totalSize: calculateTotalSize(items)
          },
          progress: 100
        });
        return {
          success: true,
          message: `Successfully copied ${items.length} items`,
          details: {
            itemCount: items.length,
            target
          }
        };
      case 'move':
        // Simulated batch move with progress and target
        console.log(`Batch moving ${items.length} items to ${target}`);

        // Slower progress simulation for move
        for (let i = 0; i < totalItems; i++) {
          await new Promise((resolve) => setTimeout(resolve, 125));
          updateProgress(i + 1);
        }
        setBatchOperationStatus({
          inProgress: false,
          completed: true,
          failed: false,
          message: `Successfully moved ${items.length} items to ${target || 'destination'}`,
          details: {
            itemCount: items.length,
            target: target || 'destination',
            itemTypes: countItemTypes(items),
            totalSize: calculateTotalSize(items)
          },
          progress: 100
        });
        return {
          success: true,
          message: `Successfully moved ${items.length} items`,
          details: {
            itemCount: items.length,
            target
          }
        };
      case 'makePublic':
        // Simulated making items public with progress
        console.log(`Making ${items.length} items public`);
        for (let i = 0; i < totalItems; i++) {
          await new Promise((resolve) => setTimeout(resolve, 40));
          updateProgress(i + 1);
        }
        setBatchOperationStatus({
          inProgress: false,
          completed: true,
          failed: false,
          message: `Successfully made ${items.length} items public`,
          details: {
            itemCount: items.length,
            itemTypes: countItemTypes(items)
          },
          progress: 100
        });
        return {
          success: true,
          message: `Successfully made ${items.length} items public`,
          details: {
            itemCount: items.length
          }
        };
      case 'makePrivate':
        // Simulated making items private with progress
        console.log(`Making ${items.length} items private`);
        for (let i = 0; i < totalItems; i++) {
          await new Promise((resolve) => setTimeout(resolve, 40));
          updateProgress(i + 1);
        }
        setBatchOperationStatus({
          inProgress: false,
          completed: true,
          failed: false,
          message: `Successfully made ${items.length} items private`,
          details: {
            itemCount: items.length,
            itemTypes: countItemTypes(items)
          },
          progress: 100
        });
        return {
          success: true,
          message: `Successfully made ${items.length} items private`,
          details: {
            itemCount: items.length
          }
        };
      case 'addTags':
        // Simulated tagging items with progress
        console.log(`Adding tags to ${items.length} items`);
        for (let i = 0; i < totalItems; i++) {
          await new Promise((resolve) => setTimeout(resolve, 60));
          updateProgress(i + 1);
        }
        setBatchOperationStatus({
          inProgress: false,
          completed: true,
          failed: false,
          message: `Successfully tagged ${items.length} items`,
          details: {
            itemCount: items.length,
            itemTypes: countItemTypes(items)
          },
          progress: 100
        });
        return {
          success: true,
          message: `Successfully tagged ${items.length} items`,
          details: {
            itemCount: items.length
          }
        };
      default:
        setBatchOperationStatus({
          inProgress: false,
          completed: false,
          failed: true,
          message: `Unknown action: ${action}`,
          details: null,
          progress: 0
        });
        return {
          success: false,
          message: `Unknown action: ${action}`
        };
    }
  } catch (error) {
    // Handle errors
    setBatchOperationStatus({
      inProgress: false,
      completed: false,
      failed: true,
      message: `Operation failed: ${error.message}`,
      details: {
        error: error.message
      },
      progress: 0
    });
    return {
      success: false,
      message: `Operation failed: ${error.message}`,
      details: {
        error: error.message
      }
    };
  }
};

/**
 * Counts items by type (file, folder) in a selection
 * @param {Array} items - The items to count
 * @returns {Object} Counts by type
 */
const countItemTypes = (items) => {
  if (!items) return {
    files: 0,
    folders: 0
  };
  const counts = {
    files: 0,
    folders: 0
  };
  items.forEach((item) => {
    if (item.type === 'folder' || item.type === 'directory') {
      counts.folders++;
    } else {
      counts.files++;
    }
  });
  return counts;
};

/**
 * Calculates the total size of selected items
 * @param {Array} items - The items to calculate size for
 * @returns {number} Total size in bytes
 */
const calculateTotalSize = (items) => {
  if (!items) return 0;
  return items.reduce((total, item) => {
    // Only add size for files
    if (item.type !== 'folder' && item.type !== 'directory') {
      return total + (item.size || 0);
    }
    return total;
  }, 0);
};

/**
 * S3 Bucket Browser Component
 */
const S3BucketBrowser = ({
  config,
  onSelectBucket,
  onSelectObject,
  readOnly = false,
  selectedBucket = '',
  selectedPrefix = ''
}) => {
  const [formError, setFormError] = useState(null);
  // Ref to track if component is mounted (prevents memory leaks from state updates after unmount)
  const isMounted = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Refs to track active timers and intervals for cleanup
  const timeoutIdsRef = useRef([]);
  const intervalIdsRef = useRef([]);

  // Helper to safely set timeout with tracking for cleanup
  const setSafeTimeout = useCallback((callback, delay) => {
    const id = setTimeout(() => {
      // Remove from tracking array when executed
      timeoutIdsRef.current = timeoutIdsRef.current.filter((timeoutId) => timeoutId !== id);
      // Only execute callback if component is still mounted
      if (isMounted.current) {
        callback();
      }
    }, delay);

    // Add to tracking array
    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  // Helper to safely set interval with tracking for cleanup
  const setSafeInterval = useCallback((callback, delay) => {
    const id = setInterval(() => {
      // Only execute callback if component is still mounted
      if (isMounted.current) {
        callback();
      }
    }, delay);

    // Add to tracking array
    intervalIdsRef.current.push(id);
    return id;
  }, []);

  // Clean up all active timers and intervals on unmount
  useEffect(() => {
    return () => {
      // Clear all tracked timeouts
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];

      // Clear all tracked intervals
      intervalIdsRef.current.forEach((id) => clearInterval(id));
      intervalIdsRef.current = [];
    };
  }, []);

  // Load buckets on mount and when config changes with proper cleanup
  useEffect(() => {
    // Create abort controller for cleanup
    const abortController = new AbortController();
    if (config) {
      loadBuckets(abortController.signal);
    }

    // Cleanup: abort any in-progress fetches when component unmounts or config changes
    return () => {
      abortController.abort();
    };
  }, [config, loadBuckets]);
  // State for buckets and objects
  const [buckets, setBuckets] = useState([]);
  const [objects, setObjects] = useState([]);
  const [currentPrefix, setCurrentPrefix] = useState(selectedPrefix || '');
  const [prefixHistory, setPrefixHistory] = useState([]);

  // State for loading indicators
  const [loading, setLoading] = useState(false);
  const [bucketLoading, setBucketLoading] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Enhanced filtering state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterTabValue, setFilterTabValue] = useState(0);
  const [activeFilters, setActiveFilters] = useState({
    fileTypes: [],
    sizeRange: [0, Number.MAX_SAFE_INTEGER],
    dateRange: {
      start: null,
      end: null
    },
    modifiedBy: '',
    customPrefix: ''
  });

  // Active filter tracking for visual feedback
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [filterSummary, setFilterSummary] = useState({
    hasFileTypeFilters: false,
    hasSizeFilter: false,
    hasDateFilter: false,
    hasCustomPrefix: false
  });

  // Batch operations state
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [batchActionDialogOpen, setBatchActionDialogOpen] = useState(false);
  const [batchAction, setBatchAction] = useState('');
  const [batchActionTarget, setBatchActionTarget] = useState('');
  const [batchOperationStatus, setBatchOperationStatus] = useState({
    inProgress: false,
    completed: false,
    failed: false,
    message: '',
    details: null,
    progress: 0
  });

  // Dialog states
  const [newBucketDialogOpen, setNewBucketDialogOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
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
    makePublic: false
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
   * Load buckets from S3 with support for cancellation
   * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
   */
  const loadBuckets = useCallback(async (signal) => {
    if (!config) return;
    setBucketLoading(true);
    setError(null);
    try {
      // Simulated API call for development environment
      console.log('Loading S3 buckets with config:', config);

      // Create a promise that can be aborted
      const abortablePromise = new Promise((resolve, reject) => {
        // Track the timeout ID so we can clear it if aborted
        const timeoutId = setTimeout(() => {
          resolve({
            status: 'success',
            buckets: [{
              name: 'data-bucket-1',
              creationDate: new Date(Date.now() - 15552000000).toISOString()
            }, {
              name: 'data-bucket-2',
              creationDate: new Date(Date.now() - 7776000000).toISOString()
            }, {
              name: 'logs-bucket',
              creationDate: new Date(Date.now() - 31104000000).toISOString()
            }, {
              name: 'backup-bucket',
              creationDate: new Date(Date.now() - 62208000000).toISOString()
            }, {
              name: 'test-integration-bucket',
              creationDate: new Date().toISOString()
            }]
          });
        }, 1000);

        // Handle abort signal if provided
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Operation cancelled'));
          });
        }

        // Track the timeout for cleanup
        timeoutIdsRef.current.push(timeoutId);
      });
      const response = await abortablePromise;

      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      if (response.status === 'success') {
        setBuckets(response.buckets);

        // If a bucket is already selected, keep it selected
        if (selectedBucket && response.buckets.some((b) => b.name === selectedBucket)) {
          loadObjects(selectedBucket, selectedPrefix || '', signal);
        }
      } else {
        setError(response.message || 'Failed to load S3 buckets');
      }
    } catch (err) {
      // Only log and update error state if not cancelled and component is mounted
      if (err.message !== 'Operation cancelled' && isMounted.current) {
        console.error('Error loading buckets:', err);
        setError(err.message || 'An error occurred while loading S3 buckets');
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMounted.current) {
        setBucketLoading(false);
      }
    }
  }, [config, selectedBucket, selectedPrefix, isMounted]);

  /**
   * Load objects from a bucket with specified prefix
   */
  const loadObjects = useCallback(async (bucketName, prefix = '') => {
    if (!config || !bucketName) return;
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      console.log(`Loading objects from bucket: ${bucketName}, prefix: ${prefix}`);

      // Simulate API response with mock data based on prefix
      const response = await new Promise((resolve) => setTimeout(() => {
        // Generate different mock responses based on the prefix
        let mockObjects = [];
        if (prefix === '') {
          // Root directory
          mockObjects = [{
            key: 'folder1/',
            size: 0,
            lastModified: new Date(Date.now() - 86400000).toISOString(),
            type: 'folder'
          }, {
            key: 'folder2/',
            size: 0,
            lastModified: new Date(Date.now() - 172800000).toISOString(),
            type: 'folder'
          }, {
            key: 'data/',
            size: 0,
            lastModified: new Date(Date.now() - 259200000).toISOString(),
            type: 'folder'
          }, {
            key: 'sample.csv',
            size: 1024,
            lastModified: new Date(Date.now() - 345600000).toISOString(),
            contentType: 'text/csv',
            type: 'file'
          }, {
            key: 'readme.txt',
            size: 512,
            lastModified: new Date(Date.now() - 432000000).toISOString(),
            contentType: 'text/plain',
            type: 'file'
          }];
        } else if (prefix === 'folder1/') {
          // Folder 1 contents
          mockObjects = [{
            key: 'folder1/subfolder/',
            size: 0,
            lastModified: new Date(Date.now() - 518400000).toISOString(),
            type: 'folder'
          }, {
            key: 'folder1/data1.json',
            size: 2048,
            lastModified: new Date(Date.now() - 604800000).toISOString(),
            contentType: 'application/json',
            type: 'file'
          }];
        } else if (prefix === 'folder1/subfolder/') {
          // Subfolder contents
          mockObjects = [{
            key: 'folder1/subfolder/deep.xml',
            size: 4096,
            lastModified: new Date(Date.now() - 691200000).toISOString(),
            contentType: 'application/xml',
            type: 'file'
          }];
        } else if (prefix === 'folder2/') {
          // Folder 2 contents
          mockObjects = [{
            key: 'folder2/image.png',
            size: 102400,
            lastModified: new Date(Date.now() - 777600000).toISOString(),
            contentType: 'image/png',
            type: 'file'
          }, {
            key: 'folder2/document.pdf',
            size: 204800,
            lastModified: new Date(Date.now() - 864000000).toISOString(),
            contentType: 'application/pdf',
            type: 'file'
          }];
        } else if (prefix === 'data/') {
          // Data folder contents
          mockObjects = [{
            key: 'data/dataset1.csv',
            size: 5120,
            lastModified: new Date(Date.now() - 950400000).toISOString(),
            contentType: 'text/csv',
            type: 'file'
          }, {
            key: 'data/dataset2.csv',
            size: 6144,
            lastModified: new Date(Date.now() - 1036800000).toISOString(),
            contentType: 'text/csv',
            type: 'file'
          }, {
            key: 'data/dataset3.xlsx',
            size: 8192,
            lastModified: new Date(Date.now() - 1123200000).toISOString(),
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            type: 'file'
          }];
        }
        resolve({
          status: 'success',
          objects: mockObjects,
          bucketName: bucketName,
          prefix: prefix
        });
      }, 1000));
      if (response.status === 'success') {
        // Update current bucket and prefix
        if (bucketName !== selectedBucket) {
          onSelectBucket(bucketName);
          setPrefixHistory([]);
        }
        setObjects(response.objects);
        setCurrentPrefix(prefix);

        // If this is a new prefix, add it to history
        if (prefix !== currentPrefix) {
          setPrefixHistory((prevHistory) => {
            // Add the previous prefix to history only if it's not empty
            if (currentPrefix) {
              return [...prevHistory, currentPrefix];
            }
            return prevHistory;
          });
        }
      } else {
        setError(response.message || 'Failed to load objects');
      }
    } catch (err) {
      console.error('Error loading objects:', err);
      setError(err.message || 'An error occurred while loading objects');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [config, currentPrefix, onSelectBucket, selectedBucket]);

  /**
   * Navigate to a folder or object
   */
  const navigateTo = useCallback((item) => {
    if (item.type === 'folder') {
      // Extract the folder prefix from the key
      const fullPrefix = item.key;

      // Load objects from the folder
      loadObjects(selectedBucket, fullPrefix);
    } else if (item.type === 'file') {
      // Select the object
      onSelectObject({
        bucketName: selectedBucket,
        prefix: currentPrefix,
        key: item.key,
        size: item.size,
        lastModified: item.lastModified,
        contentType: item.contentType
      });
    }
  }, [currentPrefix, loadObjects, onSelectObject, selectedBucket]);

  /**
   * Go up one level in the prefix
   */
  const navigateUp = useCallback(() => {
    if (prefixHistory.length > 0) {
      // Get the previous prefix
      const previousPrefix = prefixHistory[prefixHistory.length - 1];

      // Update the prefix history
      setPrefixHistory((prevHistory) => prevHistory.slice(0, -1));

      // Load objects from the previous prefix
      loadObjects(selectedBucket, previousPrefix);
    } else {
      // If we're at the root of a bucket, go back to bucket list
      setObjects([]);
      setCurrentPrefix('');
      onSelectBucket('');
    }
  }, [loadObjects, onSelectBucket, prefixHistory, selectedBucket]);

  /**
   * Search for objects
   */
  const searchObjects = useCallback(async () => {
    if (!searchTerm || !selectedBucket) return;
    setIsSearching(true);
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      console.log(`Searching for "${searchTerm}" in bucket: ${selectedBucket}`);

      // Simulate API response
      const response = await new Promise((resolve) => setTimeout(() => {
        // Generate mock search results
        const allPossibleObjects = [{
          key: 'folder1/data1.json',
          size: 2048,
          lastModified: new Date(Date.now() - 604800000).toISOString(),
          contentType: 'application/json',
          type: 'file'
        }, {
          key: 'folder1/subfolder/deep.xml',
          size: 4096,
          lastModified: new Date(Date.now() - 691200000).toISOString(),
          contentType: 'application/xml',
          type: 'file'
        }, {
          key: 'folder2/image.png',
          size: 102400,
          lastModified: new Date(Date.now() - 777600000).toISOString(),
          contentType: 'image/png',
          type: 'file'
        }, {
          key: 'folder2/document.pdf',
          size: 204800,
          lastModified: new Date(Date.now() - 864000000).toISOString(),
          contentType: 'application/pdf',
          type: 'file'
        }, {
          key: 'data/dataset1.csv',
          size: 5120,
          lastModified: new Date(Date.now() - 950400000).toISOString(),
          contentType: 'text/csv',
          type: 'file'
        }, {
          key: 'data/dataset2.csv',
          size: 6144,
          lastModified: new Date(Date.now() - 1036800000).toISOString(),
          contentType: 'text/csv',
          type: 'file'
        }, {
          key: 'data/dataset3.xlsx',
          size: 8192,
          lastModified: new Date(Date.now() - 1123200000).toISOString(),
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          type: 'file'
        }, {
          key: 'sample.csv',
          size: 1024,
          lastModified: new Date(Date.now() - 345600000).toISOString(),
          contentType: 'text/csv',
          type: 'file'
        }, {
          key: 'readme.txt',
          size: 512,
          lastModified: new Date(Date.now() - 432000000).toISOString(),
          contentType: 'text/plain',
          type: 'file'
        }];

        // Filter by search term
        const searchLower = searchTerm.toLowerCase();
        const results = allPossibleObjects.filter((obj) => obj.key.toLowerCase().includes(searchLower));
        resolve({
          status: 'success',
          objects: results
        });
      }, 1000));
      if (response.status === 'success') {
        setSearchResults(response.objects);
      } else {
        setError(response.message || 'Failed to search objects');
      }
    } catch (err) {
      console.error('Error searching objects:', err);
      setError(err.message || 'An error occurred while searching objects');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedBucket]);

  /**
   * Clear search and return to regular browsing
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);

    // Reload current prefix
    if (selectedBucket) {
      loadObjects(selectedBucket, currentPrefix);
    }
  }, [currentPrefix, loadObjects, selectedBucket]);

  /**
   * Apply advanced filters and update UI
   */
  const applyAdvancedFilters = useCallback(() => {
    if (!selectedBucket) return;
    setLoading(true);
    try {
      // If we're searching, apply filters to search results
      // Otherwise apply to the current objects list
      const itemsToFilter = isSearching ? searchResults : objects;
      const filteredResults = applyFilters(itemsToFilter, activeFilters);

      // If searching, update search results
      // Otherwise, update the objects list directly
      if (isSearching) {
        setSearchResults(filteredResults);
      } else {
        // Set a flag to indicate we're filtering
        setIsSearching(true);
        setSearchResults(filteredResults);
      }
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('An error occurred while applying filters');
    } finally {
      setLoading(false);
      setFilterDialogOpen(false);
    }
  }, [activeFilters, isSearching, objects, searchResults, selectedBucket]);

  /**
   * Clear all active filters
   */
  const clearFilters = useCallback(() => {
    setActiveFilters({
      fileTypes: [],
      sizeRange: [0, Number.MAX_SAFE_INTEGER],
      dateRange: {
        start: null,
        end: null
      },
      modifiedBy: '',
      customPrefix: ''
    });

    // If we were filtering but not searching, reload objects
    if (isSearching && !searchTerm) {
      setIsSearching(false);
      if (selectedBucket) {
        loadObjects(selectedBucket, currentPrefix);
      }
    }
    // If we were both searching and filtering, apply just the search
    else if (isSearching && searchTerm) {
      searchObjects();
    }
  }, [currentPrefix, isSearching, loadObjects, searchObjects, searchTerm, selectedBucket]);

  /**
   * Toggle selection mode for batch operations
   */
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);

    // Clear selections when toggling off
    if (selectionMode) {
      setSelectedItems([]);
    }
  }, [selectionMode]);

  /**
   * Toggle selection of an item
   */
  const toggleItemSelection = useCallback((e, item) => {
    e.stopPropagation(); // Prevent navigating when clicking the checkbox

    setSelectedItems((prev) => {
      // Check if item is already selected
      const isSelected = prev.some((selected) => selected.key === item.key && selected.type === item.type);
      if (isSelected) {
        // Remove item from selection
        return prev.filter((selected) => !(selected.key === item.key && selected.type === item.type));
      } else {
        // Add item to selection
        return [...prev, item];
      }
    });
  }, []);

  /**
   * Check if an item is selected
   */
  const isItemSelected = useCallback((item) => {
    return selectedItems.some((selected) => selected.key === item.key && selected.type === item.type);
  }, [selectedItems]);

  /**
   * Select or deselect all items
   */
  const selectAllItems = useCallback(() => {
    if (selectedItems.length === (isSearching ? searchResults.length : objects.length)) {
      // If all are selected, deselect all
      setSelectedItems([]);
    } else {
      // Otherwise, select all
      setSelectedItems(isSearching ? searchResults : objects);
    }
  }, [isSearching, objects, searchResults, selectedItems]);

  /**
   * Execute batch action on selected items
   */
  const executeBatchAction = useCallback(async () => {
    if (!selectedItems.length || !batchAction) return;
    setLoading(true);
    setError(null);
    try {
      const result = await performBatchOperation(batchAction, selectedItems);
      if (result.success) {
        // Set success message
        // For delete, remove items from the list
        if (batchAction === 'delete') {
          const itemKeys = selectedItems.map((item) => item.key);

          // Update objects or search results accordingly
          if (isSearching) {
            setSearchResults((prev) => prev.filter((item) => !itemKeys.includes(item.key)));
          } else {
            setObjects((prev) => prev.filter((item) => !itemKeys.includes(item.key)));
          }
        }

        // Reset selection
        setSelectedItems([]);
        setSelectionMode(false);
      } else {
        setError(result.message || 'Batch operation failed');
      }
    } catch (err) {
      console.error('Error executing batch action:', err);
      setError('An error occurred during batch operation');
    } finally {
      setLoading(false);
      setBatchActionDialogOpen(false);
    }
  }, [batchAction, isSearching, selectedItems]);

  /**
   * Create a new bucket
   */
  const createBucket = useCallback(async () => {
    if (!newBucketName) return;
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      console.log(`Creating bucket: ${newBucketName}`);

      // Simulate API response
      const response = await new Promise((resolve) => setTimeout(() => {
        if (newBucketName.includes(' ')) {
          resolve({
            status: 'error',
            message: 'Bucket name cannot contain spaces'
          });
        } else if (buckets.some((b) => b.name === newBucketName)) {
          resolve({
            status: 'error',
            message: 'Bucket already exists'
          });
        } else {
          resolve({
            status: 'success',
            bucket: {
              name: newBucketName,
              creationDate: new Date().toISOString()
            }
          });
        }
      }, 1000));
      if (response.status === 'success') {
        // Add new bucket to list
        setBuckets((prevBuckets) => [...prevBuckets, response.bucket]);

        // Close dialog
        setNewBucketDialogOpen(false);
        setNewBucketName('');

        // Select the new bucket
        onSelectBucket(response.bucket.name);
        loadObjects(response.bucket.name, '');
      } else {
        setError(response.message || 'Failed to create bucket');
      }
    } catch (err) {
      console.error('Error creating bucket:', err);
      setError(err.message || 'An error occurred while creating bucket');
    } finally {
      setLoading(false);
    }
  }, [buckets, loadObjects, newBucketName, onSelectBucket]);

  /**
   * Create a new folder
   */
  const createFolder = useCallback(async () => {
    if (!newFolderName || !selectedBucket) return;
    setLoading(true);
    setError(null);
    try {
      // Construct the full key
      const fullKey = currentPrefix ? `${currentPrefix}${newFolderName}/` : `${newFolderName}/`;

      // Simulate API call
      console.log(`Creating folder: ${fullKey} in bucket: ${selectedBucket}`);

      // Simulate API response
      const response = await new Promise((resolve) => setTimeout(() => {
        resolve({
          status: 'success',
          folder: {
            key: fullKey,
            size: 0,
            lastModified: new Date().toISOString(),
            type: 'folder'
          }
        });
      }, 1000));
      if (response.status === 'success') {
        // Add new folder to list
        setObjects((prevObjects) => [...prevObjects, response.folder]);

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
  }, [currentPrefix, newFolderName, selectedBucket]);

  /**
   * Delete a bucket, folder, or object
   */
  const deleteItem = useCallback(async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setError(null);
    try {
      console.log(`Deleting ${itemToDelete.type}: ${itemToDelete.name || itemToDelete.key}`);

      // Simulate API call
      const response = await new Promise((resolve) => setTimeout(() => {
        resolve({
          status: 'success'
        });
      }, 1000));
      if (response.status === 'success') {
        if (itemToDelete.type === 'bucket') {
          // Remove bucket from list
          setBuckets((prevBuckets) => prevBuckets.filter((b) => b.name !== itemToDelete.name));

          // If this was the selected bucket, clear selection
          if (selectedBucket === itemToDelete.name) {
            onSelectBucket('');
            setObjects([]);
            setCurrentPrefix('');
          }
        } else {
          // Remove object or folder from list
          setObjects((prevObjects) => prevObjects.filter((o) => o.key !== itemToDelete.key));
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
  }, [itemToDelete, onSelectBucket, selectedBucket]);

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
    if (!file || !selectedBucket) return false;
    try {
      // Construct the full key
      const fullKey = currentPrefix ? `${currentPrefix}${file.name}` : file.name;
      console.log(`Uploading file: ${fullKey} to bucket: ${selectedBucket}`);

      // Simulate upload progress with more realistic behavior using safe interval helper
      let progress = 0;
      const uploadProgressInterval = setSafeInterval(() => {
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
          // Find and remove from tracked intervals
          const index = intervalIdsRef.current.indexOf(uploadProgressInterval);
          if (index !== -1) {
            intervalIdsRef.current.splice(index, 1);
          }
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

        // Use safe timeout helper to prevent memory leaks
        setSafeTimeout(() => {
          // Find and remove from tracked intervals
          const index = intervalIdsRef.current.indexOf(uploadProgressInterval);
          if (index !== -1) {
            intervalIdsRef.current.splice(index, 1);
          }
          clearInterval(uploadProgressInterval);
          setUploadProgress(100);

          // In a real implementation, we would check for errors
          // like size limits, permission issues, etc.
          resolve({
            status: 'success',
            object: {
              key: fullKey,
              size: file.size,
              lastModified: new Date().toISOString(),
              contentType: file.type || 'application/octet-stream',
              type: 'file'
            }
          });
        }, baseUploadTime + sizeBasedTime);
      });
      if (response.status === 'success') {
        // Add new file to list if we're in the current prefix
        setObjects((prevObjects) => [...prevObjects, response.object]);
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
  }, [currentPrefix, selectedBucket]);

  /**
   * Upload files (single file or batch upload)
   */
  const uploadFile = useCallback(async () => {
    if (!selectedBucket) return;
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
  }, [selectedBucket, selectedFile, filesToUpload, uploadSingleFile]);

  /**
   * Download an object
   */
  const downloadObject = useCallback((item) => {
    if (!item || !selectedBucket) return;
    console.log(`Downloading object: ${item.key} from bucket: ${selectedBucket}`);

    // In a real implementation, this would create a download link
    // For now, we'll just simulate it
    alert(`Simulated download of file: ${item.key}`);
  }, [selectedBucket]);

  /**
   * View/preview an object
   */
  const viewObject = useCallback((item) => {
    if (!item || !selectedBucket) return;
    console.log(`Viewing object: ${item.key} from bucket: ${selectedBucket}`);

    // In a real implementation, this would create a URL for the object content
    // For now, we'll use a placeholder
    setFileViewUrl(`https://example.com/preview/${selectedBucket}/${item.key}`);

    // Set the file type based on contentType
    const contentType = item.contentType || '';
    setFileViewType(contentType);

    // Set selected item for additional metadata in preview
    setSelectedItem(item);

    // Open the viewer
    setFileViewerOpen(true);
  }, [selectedBucket]);

  /**
   * Handle context menu opening
   */
  const handleContextMenu = useCallback((event, item) => {
    event.preventDefault();

    // Skip if in read-only mode
    if (readOnly) return;
    setContextMenuPos({
      x: event.clientX,
      y: event.clientY
    });
    setSelectedItem(item);
  }, [readOnly]);

  /**
   * Handle context menu closing
   */
  const handleContextMenuClose = useCallback(() => {
    setContextMenuPos(null);
    setSelectedItem(null);
  }, []);

  // Load buckets on mount
  useEffect(() => {
    if (config) {
      loadBuckets();
    }
  }, [config, loadBuckets]);

  // File content render functions with enhanced preview
  const renderFilePreview = (url, contentType) => {
    // Import FilePreview component for advanced file previewing
    const FilePreview = require('../../common/FilePreview').default;

    // Generate a mock file object with the selected item's data
    const fileObj = selectedItem ? {
      name: getDisplayName(selectedItem.key, selectedItem.type),
      type: contentType,
      size: selectedItem.size || 0,
      lastModified: selectedItem.lastModified
    } : null;

    // Generate simulated content for text files
    const generateSimulatedContent = () => {
      if (contentType === 'text/plain') {
        return `This is a simulated preview of a plain text file.\n\nFilename: ${selectedItem.key}\nSize: ${formatFileSize(selectedItem.size || 0)}\nLast Modified: ${formatDate(selectedItem.lastModified)}\n\nIn a production environment, this would fetch the actual file content from the S3 bucket.`;
      }
      if (contentType === 'text/csv') {
        return `id,name,email,department\n1,"John Smith",john.smith@example.com,Marketing\n2,"Jane Doe",jane.doe@example.com,Engineering\n3,"Robert Johnson",robert.johnson@example.com,Finance\n4,"Sarah Williams",sarah.williams@example.com,Human Resources\n5,"Michael Brown",michael.brown@example.com,Sales`;
      }
      if (contentType === 'application/json') {
        return JSON.stringify({
          "id": 12345,
          "name": "Sample JSON Data",
          "items": [{
            "id": 1,
            "value": "First item"
          }, {
            "id": 2,
            "value": "Second item"
          }, {
            "id": 3,
            "value": "Third item"
          }],
          "metadata": {
            "created": new Date().toISOString(),
            "version": "1.0.0",
            "source": "S3 Object"
          }
        }, null, 2);
      }
      if (contentType === 'application/xml' || contentType === 'text/xml') {
        return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item id="1">\n    <n>First Item</n>\n    <value>100</value>\n  </item>\n  <item id="2">\n    <n>Second Item</n>\n    <value>200</value>\n  </item>\n  <metadata>\n    <created>${new Date().toISOString()}</created>\n    <source>S3 Object</source>\n  </metadata>\n</root>`;
      }

      // Default text content
      return `This is a simulated preview of content type: ${contentType}\n\nIn a production environment, this would display the actual file content.`;
    };

    // Generate content for text-based files
    const content = contentType === 'text/plain' || contentType === 'text/csv' || contentType === 'application/json' || contentType === 'application/xml' || contentType === 'text/xml' ? generateSimulatedContent() : null;
    return <FilePreview file={fileObj} url={url} content={content} mimeType={contentType} filename={fileObj?.name} onDownload={() => downloadObject(selectedItem)} maxHeight="600px" fullWidth={true} />;
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
  const getDisplayName = (key, type) => {
    if (type === 'bucket') {
      return key;
    } else if (type === 'folder') {
      // For folders, extract the last folder name
      const parts = key.split('/');
      return parts[parts.length - 2] || key; // Account for trailing slash
    } else {
      // For files, extract filename from potentially nested path
      const parts = key.split('/');
      return parts[parts.length - 1] || key;
    }
  };
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }}>
      {/* Top bar with actions */}
      <Box sx={{
      display: 'flex',
      alignItems: 'center',
      mb: 2
    }}>
        <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        overflow: 'hidden'
      }}>
          {/* Breadcrumb navigation */}
          <Box sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'nowrap',
          overflow: 'hidden'
        }}>
            <Typography variant="h6" sx={{
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}>

              {selectedBucket ? <>
                  <Tooltip title="Back to buckets">
                    <Box component="span" onClick={() => onSelectBucket('')} sx={{
                  cursor: 'pointer',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}>

                      Buckets
                    </Box>
                  </Tooltip>
                  {' / '}
                  <Tooltip title={`Bucket: ${selectedBucket}`}>
                    <strong>{selectedBucket}</strong>
                  </Tooltip>
                </> : 'AWS S3 Buckets'}

            </Typography>
            
            {/* Path breadcrumb navigation */}
            {selectedBucket && currentPrefix && <Box sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 1,
            overflow: 'hidden',
            flexWrap: 'nowrap'
          }}>

                <Typography component="span" variant="body2" sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>

                  {' / '}
                  {currentPrefix.split('/').filter(Boolean).map((segment, index, array) => {
                // Create a path up to this segment
                const pathUpToSegment = array.slice(0, index + 1).join('/') + '/';
                return <React.Fragment key={index}>
                        {index > 0 && ' / '}
                        <Tooltip title={`Navigate to ${segment}`}>
                          <Box component="span" onClick={() => loadObjects(selectedBucket, pathUpToSegment)} sx={{
                      cursor: 'pointer',
                      color: 'primary.main',
                      flexShrink: 0,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}>

                            {segment}
                          </Box>
                        </Tooltip>
                      </React.Fragment>;
              })}
                </Typography>
              </Box>}

          </Box>
        </Box>
        
        <Box sx={{
        display: 'flex',
        alignItems: 'center',
        ml: 2
      }}>
          {selectedBucket && <Tooltip title="Go up">
              <IconButton onClick={navigateUp} disabled={loading} size="small">

                <UpIcon />
              </IconButton>
            </Tooltip>}

          
          <Tooltip title="Refresh">
            <IconButton onClick={() => selectedBucket ? loadObjects(selectedBucket, currentPrefix) : loadBuckets()} disabled={loading} size="small">

              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {!readOnly && <>
              {selectedBucket ? <Tooltip title="Upload File">
                  <IconButton onClick={() => setFileUploadDialogOpen(true)} disabled={loading} size="small" color="primary">

                    <UploadIcon />
                  </IconButton>
                </Tooltip> : <Tooltip title="New Bucket">
                  <IconButton onClick={() => setNewBucketDialogOpen(true)} disabled={loading || bucketLoading} size="small" color="primary">

                    <AddIcon />
                  </IconButton>
                </Tooltip>}

              
              {selectedBucket && <Tooltip title="New Folder">
                  <IconButton onClick={() => setNewFolderDialogOpen(true)} disabled={loading} size="small" color="primary">

                    <CreateFolderIcon />
                  </IconButton>
                </Tooltip>}

            </>}

        </Box>
      </Box>
      
      {/* Search and Filter bar */}
      {selectedBucket && <Box sx={{
      mb: 2
    }}>
          {/* Search and Filter Controls */}
          <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 1
      }}>
            <TextField fullWidth placeholder="Search objects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={loading} size="small" InputProps={{
          startAdornment: <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>,
          endAdornment: isSearching && !activeFilters.fileTypes.length && <InputAdornment position="end">
                    <Button size="small" onClick={clearSearch} disabled={loading}>

                      Clear
                    </Button>
                  </InputAdornment>
        }} onKeyPress={(e) => {
          if (e.key === 'Enter' && searchTerm) {
            searchObjects();
          }
        }} />

            <Button variant="contained" onClick={searchObjects} disabled={loading || !searchTerm} sx={{
          ml: 1
        }}>

              Search
            </Button>
            <Tooltip title="Advanced Filters">
              <IconButton color={activeFilters.fileTypes.length > 0 ? "primary" : "default"} onClick={() => {
            setFilterTabValue(0);
            setFilterDialogOpen(true);
          }} sx={{
            ml: 1
          }}>

                <FilterAltIcon />
              </IconButton>
            </Tooltip>
            
            {!readOnly && <Tooltip title={selectionMode ? "Exit Selection Mode" : "Selection Mode"}>
                <IconButton color={selectionMode ? "primary" : "default"} onClick={toggleSelectionMode} sx={{
            ml: 1
          }}>

                  <SelectAllIcon />
                </IconButton>
              </Tooltip>}

          </Box>
          
          {/* Active Filters Display */}
          {(activeFilters.fileTypes.length > 0 || activeFilters.dateRange.start || activeFilters.sizeRange[0] > 0 || activeFilters.sizeRange[1] < Number.MAX_SAFE_INTEGER || activeFilters.customPrefix) && <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        mb: 1
      }}>
              <Typography variant="body2" color="text.secondary">
                Filters:
              </Typography>
              
              {activeFilters.fileTypes.map((fileType) => <Chip key={fileType} label={`Type: ${FILE_TYPE_OPTIONS.find((opt) => opt.value === fileType)?.label || fileType}`} size="small" onDelete={() => {
          setActiveFilters((prev) => ({
            ...prev,
            fileTypes: prev.fileTypes.filter((t) => t !== fileType)
          }));
          // Re-apply filters
          setTimeout(applyAdvancedFilters, 0);
        }} />)}


              
              {activeFilters.sizeRange[0] > 0 && <Chip label={`Min size: ${formatFileSize(activeFilters.sizeRange[0])}`} size="small" onDelete={() => {
          setActiveFilters((prev) => ({
            ...prev,
            sizeRange: [0, prev.sizeRange[1]]
          }));
          // Re-apply filters
          setTimeout(applyAdvancedFilters, 0);
        }} />}


              
              {activeFilters.sizeRange[1] < Number.MAX_SAFE_INTEGER && <Chip label={`Max size: ${formatFileSize(activeFilters.sizeRange[1])}`} size="small" onDelete={() => {
          setActiveFilters((prev) => ({
            ...prev,
            sizeRange: [prev.sizeRange[0], Number.MAX_SAFE_INTEGER]
          }));
          // Re-apply filters
          setTimeout(applyAdvancedFilters, 0);
        }} />}


              
              {activeFilters.dateRange.start && activeFilters.dateRange.end && <Chip label={`Date: ${formatDate(activeFilters.dateRange.start)} - ${formatDate(activeFilters.dateRange.end)}`} size="small" onDelete={() => {
          setActiveFilters((prev) => ({
            ...prev,
            dateRange: {
              start: null,
              end: null
            }
          }));
          // Re-apply filters
          setTimeout(applyAdvancedFilters, 0);
        }} />}


              
              {activeFilters.customPrefix && <Chip label={`Prefix: ${activeFilters.customPrefix}`} size="small" onDelete={() => {
          setActiveFilters((prev) => ({
            ...prev,
            customPrefix: ''
          }));
          // Re-apply filters
          setTimeout(applyAdvancedFilters, 0);
        }} />}


              
              <Button size="small" variant="outlined" startIcon={<ClearIcon fontSize="small" />} onClick={clearFilters}>

                Clear All
              </Button>
            </Box>}

          
          {/* Batch Operations Bar */}
          {selectionMode && selectedItems.length > 0 && <Paper variant="outlined" sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        mt: 1
      }}>

              <Box sx={{
          display: 'flex',
          alignItems: 'center'
        }}>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </Typography>
                <Tooltip title="Clear selection">
                  <IconButton size="small" onClick={() => setSelectedItems([])} sx={{
              ml: 1
            }}>

                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box>
                <Tooltip title="Download Selected">
                  <IconButton size="small" onClick={() => {
              setBatchAction('download');
              setBatchActionDialogOpen(true);
            }}>

                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete Selected">
                  <IconButton size="small" color="error" onClick={() => {
              setBatchAction('delete');
              setBatchActionDialogOpen(true);
            }}>

                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Copy Selected">
                  <IconButton size="small" onClick={() => {
              setBatchAction('copy');
              setBatchActionDialogOpen(true);
            }}>

                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Move Selected">
                  <IconButton size="small" onClick={() => {
              setBatchAction('move');
              setBatchActionDialogOpen(true);
            }}>

                    <MoveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Make Public">
                  <IconButton size="small" onClick={() => {
              setBatchAction('makePublic');
              setBatchActionDialogOpen(true);
            }}>

                    <PublicIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Make Private">
                  <IconButton size="small" onClick={() => {
              setBatchAction('makePrivate');
              setBatchActionDialogOpen(true);
            }}>

                    <LockIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Button size="small" variant="outlined" color="primary" onClick={selectAllItems} sx={{
            ml: 1
          }}>

                  {selectedItems.length === (isSearching ? searchResults.length : objects.length) ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>
            </Paper>}

        </Box>}

      
      {/* Error message */}
      {error && <Typography color="error" sx={{
      mb: 2
    }}>
          Error: {error}
        </Typography>}

      
      {/* Content area */}
      {bucketLoading || loading ? <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      py: 4
    }}>
          <CircularProgress />
        </Box> : selectedBucket ?
    // Object list
    <TableContainer component={Paper} sx={{
      flexGrow: 1,
      overflow: 'auto'
    }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {selectionMode && <TableCell padding="checkbox" width="50px"></TableCell>}
                <TableCell>Name</TableCell>
                <TableCell align="right">Size</TableCell>
                <TableCell align="right">Last Modified</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(isSearching ? searchResults : objects).length === 0 ? <TableRow>
                  <TableCell colSpan={selectionMode ? 5 : 4} align="center">
                    {isSearching ? 'No search results' : 'No objects in this location'}
                  </TableCell>
                </TableRow> : (isSearching ? searchResults : objects).map((item) => <TableRow key={item.key} hover onClick={(e) => selectionMode ? toggleItemSelection(e, item) : navigateTo(item)} sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover'
            },
            ...(selectionMode && isItemSelected(item) ? {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.selectedHover'
              }
            } : {})
          }} onContextMenu={(e) => handleContextMenu(e, item)}>

                  {selectionMode && <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected(item)} onChange={(e) => toggleItemSelection(e, item)} onClick={(e) => e.stopPropagation()} color="primary" size="small" />

                    </TableCell>}

                  <TableCell>
                    <Box sx={{
                display: 'flex',
                alignItems: 'center'
              }}>
                      <ListItemIcon sx={{
                  minWidth: 36
                }}>
                        {item.type === 'folder' ? <FolderIcon color="primary" /> : <FileIcon sx={{
                    color: getIconColorForFileType(item.contentType || '')
                  }} />}


                      </ListItemIcon>
                      <Box>
                        <Typography variant="body2" sx={{
                    fontWeight: 500
                  }}>
                          {getDisplayName(item.key, item.type)}
                        </Typography>
                        {item.type === 'file' && item.contentType && <Typography variant="caption" color="text.secondary">
                            {item.contentType}
                          </Typography>}

                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {item.type === 'folder' ? '-' : <Typography variant="body2" sx={{
                fontFamily: 'monospace',
                fontWeight: 500,
                color: 'text.secondary'
              }}>

                        {formatFileSize(item.size || 0)}
                      </Typography>}

                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.lastModified)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}>
                      {item.type === 'file' && <>
                          <Tooltip title="View">
                            <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      viewObject(item);
                    }}>

                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      downloadObject(item);
                    }}>

                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Select this file">
                            <IconButton size="small" color="primary" onClick={(e) => {
                      e.stopPropagation();
                      onSelectObject({
                        bucketName: selectedBucket,
                        prefix: currentPrefix,
                        key: item.key,
                        size: item.size,
                        lastModified: item.lastModified,
                        contentType: item.contentType
                      });
                    }}>

                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>}

                      {!readOnly && <Tooltip title="More actions">
                          <IconButton size="small" onClick={(e) => {
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
    // Bucket list
    <TableContainer component={Paper} sx={{
      flexGrow: 1,
      overflow: 'auto'
    }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {selectionMode && <TableCell padding="checkbox" width="50px"></TableCell>}
                <TableCell>Bucket Name</TableCell>
                <TableCell align="right">Creation Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buckets.length === 0 ? <TableRow>
                  <TableCell colSpan={selectionMode ? 4 : 3} align="center">
                    No buckets found
                  </TableCell>
                </TableRow> : buckets.map((bucket) => <TableRow key={bucket.name} hover onClick={(e) => selectionMode ? toggleItemSelection(e, {
            ...bucket,
            type: 'bucket'
          }) : loadObjects(bucket.name, '')} sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover'
            },
            ...(selectionMode && isItemSelected({
              ...bucket,
              type: 'bucket'
            }) ? {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.selectedHover'
              }
            } : {})
          }} onContextMenu={(e) => handleContextMenu(e, {
            ...bucket,
            type: 'bucket'
          })}>

                  {selectionMode && <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected({
                ...bucket,
                type: 'bucket'
              })} onChange={(e) => toggleItemSelection(e, {
                ...bucket,
                type: 'bucket'
              })} onClick={(e) => e.stopPropagation()} color="primary" size="small" />

                    </TableCell>}

                  <TableCell>
                    <Box sx={{
                display: 'flex',
                alignItems: 'center'
              }}>
                      <ListItemIcon sx={{
                  minWidth: 36
                }}>
                        <BucketIcon color="primary" />
                      </ListItemIcon>
                      <Typography variant="body2" sx={{
                  fontWeight: 500
                }}>
                        {bucket.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(bucket.creationDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}>
                      <Tooltip title="Browse bucket">
                        <IconButton size="small" color="primary" onClick={(e) => {
                    e.stopPropagation();
                    loadObjects(bucket.name, '');
                  }}>

                          <FolderOpenIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Select bucket">
                        <IconButton size="small" color="primary" onClick={(e) => {
                    e.stopPropagation();
                    onSelectBucket(bucket.name);
                  }}>

                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!readOnly && <Tooltip title="More actions">
                          <IconButton size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, {
                      ...bucket,
                      type: 'bucket'
                    });
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
      <Menu open={Boolean(contextMenuPos)} onClose={handleContextMenuClose} anchorReference="anchorPosition" anchorPosition={contextMenuPos ? {
      top: contextMenuPos.y,
      left: contextMenuPos.x
    } : undefined}>


        {selectedItem && selectedItem.type === 'bucket' && <div>
            <MenuItem onClick={() => {
          loadObjects(selectedItem.name, '');
          handleContextMenuClose();
        }}>
              <ListItemIcon>
                <FolderOpenIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Browse bucket
            </MenuItem>
            <MenuItem onClick={() => {
          onSelectBucket(selectedItem.name);
          handleContextMenuClose();
        }} divider>

              <ListItemIcon>
                <CheckCircleIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Select bucket
            </MenuItem>
            {!readOnly && <MenuItem onClick={() => {
          setItemToDelete(selectedItem);
          setConfirmDeleteDialogOpen(true);
          handleContextMenuClose();
        }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete bucket
              </MenuItem>}

          </div>}

        
        {selectedItem && selectedItem.type === 'folder' && <div>
            <MenuItem onClick={() => {
          navigateTo(selectedItem);
          handleContextMenuClose();
        }}>
              <ListItemIcon>
                <FolderOpenIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Open folder
            </MenuItem>
            {!readOnly && <MenuItem onClick={() => {
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

        
        {selectedItem && selectedItem.type === 'file' && <div>
            <MenuItem onClick={() => {
          viewObject(selectedItem);
          handleContextMenuClose();
        }}>
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              View
            </MenuItem>
            <MenuItem onClick={() => {
          downloadObject(selectedItem);
          handleContextMenuClose();
        }}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              Download
            </MenuItem>
            <MenuItem onClick={() => {
          onSelectObject({
            bucketName: selectedBucket,
            prefix: currentPrefix,
            key: selectedItem.key,
            size: selectedItem.size,
            lastModified: selectedItem.lastModified,
            contentType: selectedItem.contentType
          });
          handleContextMenuClose();
        }} divider>

              <ListItemIcon>
                <CheckCircleIcon fontSize="small" color="primary" />
              </ListItemIcon>
              Select this file
            </MenuItem>
            {!readOnly && <MenuItem onClick={() => {
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
      
      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="md" fullWidth>

        <DialogTitle>
          <Box display="flex" alignItems="center">
            <FilterAltIcon sx={{
            mr: 1
          }} />
            <Typography variant="h6">Advanced Filtering</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={filterTabValue} onChange={(e, newValue) => setFilterTabValue(newValue)} sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2
        }}>

            <Tab label="File Types" />
            <Tab label="Size" />
            <Tab label="Date" />
            <Tab label="Prefix" />
          </Tabs>
          
          {/* File Type Filter Section */}
          <Box sx={{
          p: 1,
          display: filterTabValue === 0 ? 'block' : 'none'
        }}>
            <Typography variant="subtitle1" gutterBottom>
              Filter by File Type
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select file types to include in the results
            </Typography>
            
            <FormGroup>
              <Grid container spacing={2}>
                {FILE_TYPE_OPTIONS.map((option) => <Grid item xs={12} sm={6} md={4} key={option.value}>
                    <FormControlLabel control={<Checkbox checked={activeFilters.fileTypes.includes(option.value)} onChange={(e) => {
                  const newFileTypes = e.target.checked ? [...activeFilters.fileTypes, option.value] : activeFilters.fileTypes.filter((t) => t !== option.value);
                  setActiveFilters({
                    ...activeFilters,
                    fileTypes: newFileTypes
                  });
                }} />} label={<Box>
                          <Typography variant="body2">{option.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>} />


                  </Grid>)}

              </Grid>
            </FormGroup>
            
            {/* Size Filter Section */}
            <Box sx={{
            mt: 4,
            display: filterTabValue === 1 ? 'block' : 'none'
          }}>
              <Typography variant="subtitle1" gutterBottom>
                Filter by Size
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select a size range or use the slider
              </Typography>
              
              <FormControl fullWidth sx={{
              mb: 2
            }}>
                <InputLabel>Size Presets</InputLabel>
                <Select value="" onChange={(e) => {
                const preset = SIZE_PRESETS.find((p) => p.label === e.target.value);
                if (preset) {
                  setActiveFilters({
                    ...activeFilters,
                    sizeRange: preset.value
                  });
                }
              }}>

                  <MenuItem value="">Custom</MenuItem>
                  {SIZE_PRESETS.map((preset) => <MenuItem value={preset.label} key={preset.label}>
                      {preset.label}
                    </MenuItem>)}

                </Select>
              </FormControl>
              
              <Box sx={{
              px: 2
            }}>
                <Typography id="size-slider" gutterBottom>
                  Size Range: {formatFileSize(activeFilters.sizeRange[0])} - {formatFileSize(activeFilters.sizeRange[1])}
                </Typography>
                <Slider value={activeFilters.sizeRange} onChange={(e, newValue) => {
                setActiveFilters({
                  ...activeFilters,
                  sizeRange: newValue
                });
              }} valueLabelDisplay="auto" valueLabelFormat={(value) => formatFileSize(value)} min={0} max={1024 * 1024 * 1024} // 1 GB
              step={1024} marks={[{
                value: 0,
                label: '0'
              }, {
                value: 1024 * 1024,
                label: '1 MB'
              }, {
                value: 1024 * 1024 * 100,
                label: '100 MB'
              }, {
                value: 1024 * 1024 * 1024,
                label: '1 GB'
              }]} />


              </Box>
            </Box>
            
            {/* Date Filter Section */}
            <Box sx={{
            mt: 4,
            display: filterTabValue === 2 ? 'block' : 'none'
          }}>
              <Typography variant="subtitle1" gutterBottom>
                Filter by Date
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select a date range or choose a preset
              </Typography>
              
              <FormControl fullWidth sx={{
              mb: 2
            }}>
                <InputLabel>Date Presets</InputLabel>
                <Select value="" onChange={(e) => {
                const preset = DATE_PRESETS.find((p) => p.label === e.target.value);
                if (preset && preset.value !== 'custom') {
                  const end = new Date();
                  const start = getDateDaysAgo(preset.value.days);
                  setActiveFilters({
                    ...activeFilters,
                    dateRange: {
                      start,
                      end
                    }
                  });
                }
              }}>

                  <MenuItem value="">Custom Range</MenuItem>
                  {DATE_PRESETS.map((preset) => <MenuItem value={preset.label} key={preset.label}>
                      {preset.label}
                    </MenuItem>)}

                </Select>
              </FormControl>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker label="Start Date" value={activeFilters.dateRange.start} onChange={(newValue) => {
                    setActiveFilters({
                      ...activeFilters,
                      dateRange: {
                        ...activeFilters.dateRange,
                        start: newValue
                      }
                    });
                  }} renderInput={(params) => <TextField {...params} fullWidth />} />

                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker label="End Date" value={activeFilters.dateRange.end} onChange={(newValue) => {
                    setActiveFilters({
                      ...activeFilters,
                      dateRange: {
                        ...activeFilters.dateRange,
                        end: newValue
                      }
                    });
                  }} renderInput={(params) => <TextField {...params} fullWidth />} />

                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
            
            {/* Prefix Filter Section */}
            <Box sx={{
            mt: 4,
            display: filterTabValue === 3 ? 'block' : 'none'
          }}>
              <Typography variant="subtitle1" gutterBottom>
                Filter by Prefix
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enter a custom prefix to filter items
              </Typography>
              
              <TextField fullWidth label="Custom Prefix" value={activeFilters.customPrefix} onChange={(e) => {
              setActiveFilters({
                ...activeFilters,
                customPrefix: e.target.value
              });
            }} placeholder="e.g. data/ or report-" helperText="Filter items by key prefix or substring" />

            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<ClearIcon />} onClick={() => {
          setActiveFilters({
            fileTypes: [],
            sizeRange: [0, Number.MAX_SAFE_INTEGER],
            dateRange: {
              start: null,
              end: null
            },
            modifiedBy: '',
            customPrefix: ''
          });
        }}>

            Clear All
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={() => {
          setFilterDialogOpen(false);
          // Apply filters function will be called when dialog is closed
          // since we're already watching activeFilters in an effect
        }} startIcon={<FilterAltIcon />}>

            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Bucket Dialog */}
      <Dialog open={newBucketDialogOpen} onClose={() => setNewBucketDialogOpen(false)}>
        <DialogTitle>Create New Bucket</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the new bucket. Bucket names must be globally unique, lowercase letters, numbers, or hyphens.
          </DialogContentText>
          <TextField autoFocus margin="dense" id="bucket-name" label="Bucket Name" type="text" fullWidth value={newBucketName} onChange={(e) => setNewBucketName(e.target.value)} error={Boolean(error)} helperText={error} disabled={loading} />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewBucketDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={createBucket} color="primary" disabled={loading || !newBucketName}>

            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Batch Action Confirmation Dialog */}
      <Dialog open={batchActionDialogOpen} onClose={() => setBatchActionDialogOpen(false)}>

        <DialogTitle>
          {batchAction === 'delete' && 'Confirm Delete'}
          {batchAction === 'download' && 'Confirm Download'}
          {batchAction === 'copy' && 'Confirm Copy'}
          {batchAction === 'move' && 'Confirm Move'}
          {batchAction === 'makePublic' && 'Confirm Make Public'}
          {batchAction === 'makePrivate' && 'Confirm Make Private'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2
        }}>
            {batchAction === 'delete' && <DeleteIcon color="error" sx={{
            mr: 1
          }} />}
            {batchAction === 'download' && <DownloadIcon color="primary" sx={{
            mr: 1
          }} />}
            {batchAction === 'copy' && <CopyIcon color="primary" sx={{
            mr: 1
          }} />}
            {batchAction === 'move' && <MoveIcon color="primary" sx={{
            mr: 1
          }} />}
            {batchAction === 'makePublic' && <PublicIcon color="primary" sx={{
            mr: 1
          }} />}
            {batchAction === 'makePrivate' && <LockIcon color="primary" sx={{
            mr: 1
          }} />}
            
            <Typography>
              {batchAction === 'delete' && `Are you sure you want to delete ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}?`}
              {batchAction === 'download' && `Download ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}?`}
              {batchAction === 'copy' && `Copy ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}?`}
              {batchAction === 'move' && `Move ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}?`}
              {batchAction === 'makePublic' && `Make ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} public?`}
              {batchAction === 'makePrivate' && `Make ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} private?`}
            </Typography>
          </Box>
          
          {selectedItems.length <= 5 ? <List dense>
              {selectedItems.map((item, index) => <ListItem key={index}>
                  <ListItemIcon>
                    {item.type === 'folder' || item.type === 'directory' ? <FolderIcon fontSize="small" color="primary" /> : <FileIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={item.key.split('/').pop() || item.key} secondary={item.type === 'file' ? formatFileSize(item.size) : ''} />

                </ListItem>)}

            </List> : <Alert severity="info">
              {selectedItems.length} items selected. Proceeding will affect all selected items.
            </Alert>}

          
          {(batchAction === 'copy' || batchAction === 'move') && <Box sx={{
          mt: 2
        }}>
              <Typography variant="subtitle2" gutterBottom>
                Destination:
              </Typography>
              <FormControl fullWidth sx={{
            mt: 1
          }}>
                <InputLabel>Destination Folder</InputLabel>
                <Select value="" onChange={() => {}}>

                  <MenuItem value="">Root Directory</MenuItem>
                  {objects.filter((item) => item.type === 'folder' || item.type === 'directory').map((folder, idx) => <MenuItem key={idx} value={folder.key}>
                        {folder.key}
                      </MenuItem>)}


                </Select>
              </FormControl>
            </Box>}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color={batchAction === 'delete' ? 'error' : 'primary'} onClick={executeBatchAction} startIcon={batchAction === 'delete' ? <DeleteIcon /> : batchAction === 'download' ? <DownloadIcon /> : batchAction === 'copy' ? <CopyIcon /> : batchAction === 'move' ? <MoveIcon /> : batchAction === 'makePublic' ? <PublicIcon /> : batchAction === 'makePrivate' ? <LockIcon /> : null}>


            {batchAction === 'delete' ? 'Delete' : batchAction === 'download' ? 'Download' : batchAction === 'copy' ? 'Copy' : batchAction === 'move' ? 'Move' : batchAction === 'makePublic' ? 'Make Public' : batchAction === 'makePrivate' ? 'Make Private' : 'Confirm'}
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
          <TextField autoFocus margin="dense" id="folder-name" label="Folder Name" type="text" fullWidth value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} error={Boolean(error)} helperText={error} disabled={loading} />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={createFolder} color="primary" disabled={loading || !newFolderName}>

            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the {itemToDelete?.type === 'bucket' ? 'bucket' : itemToDelete?.type === 'folder' ? 'folder' : 'file'}:
            <Box component="span" sx={{
            fontWeight: 'bold',
            display: 'block',
            mt: 1
          }}>
              {itemToDelete?.name || itemToDelete?.key}
            </Box>
            {itemToDelete?.type === 'bucket' && <Typography color="error" sx={{
            mt: 2
          }}>
                This will delete all objects in the bucket!
              </Typography>}

            {itemToDelete?.type === 'folder' && <Typography color="error" sx={{
            mt: 2
          }}>
                This will delete all contents of the folder!
              </Typography>}

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={deleteItem} color="error" disabled={loading}>

            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Enhanced File Upload Dialog */}
      <Dialog open={fileUploadDialogOpen} onClose={() => {
      if (!loading) {
        setFileUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }
    }} fullWidth maxWidth="md">

        <DialogTitle>
          <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
            Upload Files to S3
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
          <Paper variant="outlined" sx={{
          p: 1.5,
          mb: 2,
          bgcolor: 'background.default'
        }}>
            <Box sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
              <BucketIcon color="primary" sx={{
              mr: 1
            }} />
              <Typography sx={{
              fontWeight: 'medium'
            }}>
                {selectedBucket}{currentPrefix ? `/${currentPrefix}` : ''}
              </Typography>
            </Box>
          </Paper>
          
          {/* Enhanced File Drop Zone */}
          <Box sx={{
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
        }} onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.borderColor = (theme) => theme.palette.primary.main;
          e.currentTarget.style.backgroundColor = (theme) => theme.palette.action.hover;
        }} onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.backgroundColor = '';
        }} onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.backgroundColor = '';
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Process all dropped files
            processFileSelection(e.dataTransfer.files);
          }
        }}>

            <UploadIcon color="primary" sx={{
            fontSize: 40,
            mb: 2
          }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop Files Here
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              or
            </Typography>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>

              Browse Files
              <input type="file" hidden multiple onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFileSelection(e.target.files);
              }
            }} />

            </Button>
            <Typography variant="caption" color="textSecondary" sx={{
            display: 'block',
            mt: 2
          }}>
              Supported file types: CSV, JSON, XML, PDF, Images, Text files
            </Typography>
          </Box>
          
          {/* File Preview & Validation Section */}
          {selectedFile && <Box>
              <Typography variant="subtitle2" gutterBottom>
                File Preview
              </Typography>
              <Paper variant="outlined" sx={{
            p: 2,
            mb: 2
          }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    {/* Import the FileCard component for file preview */}
                    {(() => {
                  const FileCard = require('../../common/FileCard').default;

                  // Generate metadata for the file
                  const fileMetadata = generateFileMetadata(selectedFile);
                  return <FileCard file={selectedFile} showActions={false} showPreview={false} variant="outlined" />;
                })()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      File Details
                    </Typography>
                    <Box sx={{
                  mb: 2
                }}>
                      <Typography variant="body2" sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                        <span>File name:</span> 
                        <span style={{
                      fontWeight: 'medium'
                    }}>{selectedFile.name}</span>
                      </Typography>
                      <Typography variant="body2" sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                        <span>Size:</span> 
                        <span>{formatFileSize(selectedFile.size)}</span>
                      </Typography>
                      <Typography variant="body2" sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                        <span>Type:</span> 
                        <span>{selectedFile.type || 'Unknown'}</span>
                      </Typography>
                      <Typography variant="body2" sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                        <span>Last modified:</span> 
                        <span>{new Date(selectedFile.lastModified).toLocaleString()}</span>
                      </Typography>
                    </Box>
                    
                    {/* File Type Validation */}
                    {(() => {
                  const {
                    isPreviewSupported,
                    getFileTypeDescription
                  } = require("@/utils/fileTypeUtils");
                  const mimeType = selectedFile.type;
                  const isSupported = isPreviewSupported(mimeType);
                  return <Box sx={{
                    mb: 2
                  }}>
                          {isSupported ? <Alert severity="success" icon={<CheckCircleIcon />}>
                              This file type ({getFileTypeDescription(mimeType)}) is fully supported.
                            </Alert> : <Alert severity="warning">
                              <AlertTitle>Limited Support</AlertTitle>
                              This file type may have limited preview capabilities in the system.
                            </Alert>}

                        </Box>;
                })()}
                    
                    <Button fullWidth variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => setSelectedFile(null)} sx={{
                  mt: 1
                }}>

                      Remove File
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Upload Progress Tracking */}
              {uploadProgress > 0 && <Box sx={{
            mt: 2,
            mb: 2
          }}>
                  <Typography variant="subtitle2" gutterBottom display="flex" justifyContent="space-between">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{
              height: 10,
              borderRadius: 5,
              mb: 1
            }} />

                  <Typography variant="caption" color="textSecondary">
                    {uploadProgress < 100 ? `Uploading ${selectedFile.name}...` : `Successfully uploaded ${selectedFile.name}`}

                  </Typography>
                  
                  {/* Batch upload status indicator */}
                  {filesToUpload.length > 1 && <Box sx={{
              mt: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
                      <Typography variant="caption" color="textSecondary">
                        File {currentUploadIndex + 1} of {filesToUpload.length}
                      </Typography>
                      <Box sx={{
                display: 'flex',
                alignItems: 'center'
              }}>
                        {Array.from({
                  length: Math.min(filesToUpload.length, 5)
                }).map((_, index) => {
                  // Calculate status for this dot
                  let color = 'grey.300'; // default - not started
                  if (index < currentUploadIndex) {
                    color = 'success.main'; // completed
                  } else if (index === currentUploadIndex) {
                    color = uploadProgress === 100 ? 'success.main' : 'primary.main'; // in progress
                  }
                  return <Box key={index} sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: color,
                    mx: 0.5
                  }} />;
                })}
                        {filesToUpload.length > 5 && <Typography variant="caption" color="textSecondary" sx={{
                  ml: 1
                }}>
                            +{filesToUpload.length - 5} more
                          </Typography>}

                      </Box>
                    </Box>}

                </Box>}

              
              {/* Upload Options */}
              <Box sx={{
            mt: 3
          }}>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Options
                </Typography>
                <FormControlLabel control={<Checkbox checked={uploadOptions.overwriteExisting} onChange={() => setUploadOptions((prev) => ({
              ...prev,
              overwriteExisting: !prev.overwriteExisting
            }))} name="overwriteExisting" />} label="Overwrite if file already exists" />

                <FormControlLabel control={<Checkbox checked={uploadOptions.makePublic} onChange={() => setUploadOptions((prev) => ({
              ...prev,
              makePublic: !prev.makePublic
            }))} name="makePublic" />} label="Make file publicly accessible" />


                {/* Batch upload info */}
                {filesToUpload.length > 1 && <Box sx={{
              mt: 2,
              p: 1,
              bgcolor: 'info.lightest',
              borderRadius: 1
            }}>
                    <Typography variant="body2" gutterBottom sx={{
                fontWeight: 'medium',
                color: 'info.main',
                display: 'flex',
                alignItems: 'center'
              }}>
                      <InfoIcon fontSize="small" sx={{
                  mr: 0.5
                }} /> 
                      Batch Upload Information
                    </Typography>
                    <Typography variant="body2">
                      {filesToUpload.length} files selected for upload ({formatFileSize(filesToUpload.reduce((total, file) => total + file.size, 0))}
                  )
                    </Typography>
                    <Button size="small" variant="text" color="primary" onClick={() => {
                setFilesToUpload([]);
                setSelectedFile(null);
              }} sx={{
                mt: 1
              }} startIcon={<CloseIcon fontSize="small" />}>

                      Clear Batch Selection
                    </Button>
                  </Box>}

              </Box>
            </Box>}

        </DialogContent>
        <DialogActions sx={{
        px: 3,
        py: 2
      }}>
          <Button onClick={() => {
          setFileUploadDialogOpen(false);
          setSelectedFile(null);
          setUploadProgress(0);
        }} disabled={loading}>

            Cancel
          </Button>
          <Button onClick={uploadFile} variant="contained" color="primary" disabled={loading || !selectedFile || uploadProgress > 0} startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}>

            {loading ? 'Uploading...' : filesToUpload.length > 1 ? `Upload ${filesToUpload.length} Files` : 'Upload File'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Enhanced File Viewer Dialog */}
      <Dialog open={fileViewerOpen} onClose={() => setFileViewerOpen(false)} fullWidth maxWidth="lg">

        <DialogContent dividers sx={{
        p: 0
      }}>
          {renderFilePreview(fileViewUrl, fileViewType)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileViewerOpen(false)}>Close</Button>
          {selectedItem && selectedItem.type === 'file' && <>
              <Button onClick={() => {
            downloadObject(selectedItem);
          }} startIcon={<DownloadIcon />}>

                Download
              </Button>
              <Button onClick={() => {
            onSelectObject({
              bucketName: selectedBucket,
              prefix: currentPrefix,
              key: selectedItem.key,
              size: selectedItem.size,
              lastModified: selectedItem.lastModified,
              contentType: selectedItem.contentType
            });
            setFileViewerOpen(false);
          }} variant="contained" color="primary" startIcon={<CheckCircleIcon />}>

                Select This File
              </Button>
            </>}

        </DialogActions>
      </Dialog>
    </Box>;
};
S3BucketBrowser.propTypes = {
  config: PropTypes.object.isRequired,
  onSelectBucket: PropTypes.func.isRequired,
  onSelectObject: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  selectedBucket: PropTypes.string,
  selectedPrefix: PropTypes.string
};
export default S3BucketBrowser;