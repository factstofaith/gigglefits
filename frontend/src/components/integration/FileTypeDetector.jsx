import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * FileTypeDetector Component
                                                                                      * 
                                                                                      * A component for detecting and displaying file types with comprehensive analysis
                                                                                      * capabilities, including content inspection, pattern matching, and signature detection.
                                                                                      */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import MUI components
import { Box, Paper, Typography, Card, CardContent, Grid, Chip, Divider, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Tooltip, IconButton, Button, CircularProgress, Alert, Stack, Badge, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel } from '@mui/material';

// Import icons
import { Search as SearchIcon, Upload as UploadIcon, UploadFile as UploadFileIcon, InsertDriveFile as FileIcon, MoreVert as MoreIcon, CheckCircle as CheckCircleIcon, AutoAwesome as AutoAwesomeIcon, Article as ArticleIcon, Image as ImageIcon, PictureAsPdf as PdfIcon, Description as DocumentIcon, TableChart as TableIcon, Code as CodeIcon, FolderZip as ArchiveIcon, DataObject as DataObjectIcon, QueryStats as QueryStatsIcon, Storage as StorageIcon, TextSnippet as TextIcon, Help as HelpIcon } from '@mui/icons-material';

// Import file detector utilities
import { analyzeFile, FILE_TYPES, getFileTypeIcon } from "@/utils/fileTypeDetector";

/**
 * Get appropriate icon for a file type
 * 
 * @param {string} category - File type category
 * @returns {JSX.Element} Icon component
 */
const getFileTypeIconComponent = category => {
  switch (category) {
    case 'data':
      return <DataObjectIcon />;
    case 'spreadsheet':
      return <TableIcon />;
    case 'document':
      return <DocumentIcon />;
    case 'image':
      return <ImageIcon />;
    case 'archive':
      return <ArchiveIcon />;
    case 'database':
      return <StorageIcon />;
    case 'code':
      return <CodeIcon />;
    default:
      return <FileIcon />;
  }
};

/**
 * Get color for confidence level
 * 
 * @param {number} confidence - Confidence level (0-1)
 * @returns {string} Color name
 */
const getConfidenceColor = confidence => {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.7) return 'primary';
  if (confidence >= 0.5) return 'info';
  if (confidence >= 0.3) return 'warning';
  return 'error';
};

/**
 * Format confidence as percentage
 * 
 * @param {number} confidence - Confidence level (0-1)
 * @returns {string} Formatted percentage
 */
const formatConfidence = confidence => {
  return `${Math.round(confidence * 100)}%`;
};

/**
 * File Detection Result Card
 * Displays a detected file type with metadata
 */
const FileTypeCard = ({
  result,
  compact = false
}) => {
  const {
    detectedType,
    confidence,
    possibleTypes,
    metadata
  } = result;
  if (!detectedType) {
    return null;
  }
  return <Card variant="outlined">
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Badge badgeContent={`${formatConfidence(confidence)}`} color={getConfidenceColor(confidence)} anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}>

              <Box sx={{
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>

                {getFileTypeIconComponent(detectedType.category)}
              </Box>
            </Badge>
          </Grid>
          
          <Grid item xs>
            <Typography variant="h6" component="div">
              {detectedType.fullName || detectedType.name}
            </Typography>
            
            <Stack direction="row" spacing={1} sx={{
            mt: 0.5
          }}>
              <Chip label={detectedType.category} size="small" variant="outlined" />

              {detectedType.isTextBased && <Chip label="Text-based" size="small" variant="outlined" color="info" />}


            </Stack>
          </Grid>
        </Grid>
        
        {!compact && <>
            <Divider sx={{
          my: 1.5
        }} />
            
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  MIME Type: <Typography component="span" variant="body2" fontFamily="monospace">{detectedType.mimeType}</Typography>
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Extensions: <Typography component="span" variant="body2" fontFamily="monospace">{detectedType.extensions?.join(', ') || 'N/A'}</Typography>
                </Typography>
              </Grid>
              
              {metadata?.fileName && <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    File: <Typography component="span" variant="body2" fontFamily="monospace">{metadata.fileName}</Typography>
                  </Typography>
                </Grid>}

              
              {metadata?.fileSize && <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Size: <Typography component="span" variant="body2" fontFamily="monospace">{formatFileSize(metadata.fileSize)}</Typography>
                  </Typography>
                </Grid>}

            </Grid>
            
            {possibleTypes && possibleTypes.length > 0 && <Box sx={{
          mt: 2
        }}>
                <Typography variant="subtitle2" gutterBottom>
                  Other Possible Types
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {possibleTypes.map((pt, index) => <Chip key={index} label={`${pt.type.name} (${formatConfidence(pt.confidence)})`} size="small" variant="outlined" icon={getFileTypeIconComponent(pt.type.category)} sx={{
              mb: 0.5
            }} />)}


                </Stack>
              </Box>}

          </>}

      </CardContent>
    </Card>;
};

/**
 * FileTypeDetector Component
 * Main component for detecting and displaying file types
 */
const FileTypeDetector = ({
  file = null,
  content = null,
  onDetectionComplete = () => {},
  allowFileDrop = true,
  showDetailedResults = true,
  performDeepInspection = true,
  compact = false
}) => {
  const [formError, setFormError] = useState(null);
  // State for file handling
  const [selectedFile, setSelectedFile] = useState(file);
  const [fileContent, setFileContent] = useState(content);

  // State for detection results
  const [detectionResult, setDetectionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // State for drag and drop
  const [isDragging, setIsDragging] = useState(false);

  // Analyze file when selected
  useEffect(() => {
    if (selectedFile) {
      analyzeSelectedFile();
    }
  }, [selectedFile, analyzeSelectedFile]);

  // Analyze file - memoized to prevent recreation on each render
  const analyzeSelectedFile = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeFile(selectedFile, {
        deepInspection: performDeepInspection,
        maxSampleSize: 8192
      });
      setDetectionResult(result);
      onDetectionComplete(result);
    } catch (err) {
      console.error('Error analyzing file:', err);
      setError('Failed to analyze file. Please try again with a different file.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile, performDeepInspection, onDetectionComplete]);

  // Handle file selection - memoized to prevent recreation on each render
  const handleFileSelect = useCallback(event => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  // Handle file drop
  const handleDrop = useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (!allowFileDrop) return;
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, [allowFileDrop]);

  // Handle drag events
  const handleDragOver = useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    if (allowFileDrop) {
      setIsDragging(true);
    }
  }, [allowFileDrop]);
  const handleDragLeave = useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  // Reset detection - memoized to prevent recreation on each render
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setFileContent(null);
    setDetectionResult(null);
    setError(null);
  }, []);

  // Format file size
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Empty state
  if (!selectedFile && !detectionResult) {
    return <Paper sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      maxWidth: '100%',
      border: isDragging ? '2px dashed' : '1px solid',
      borderColor: isDragging ? 'primary.main' : 'divider',
      backgroundColor: isDragging ? 'action.hover' : 'background.paper'
    }} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>

        <UploadFileIcon sx={{
        fontSize: 48,
        mb: 2,
        color: 'text.secondary'
      }} />
        
        <Typography variant="h6" gutterBottom align="center">
          {allowFileDrop ? 'Drag & Drop a File or' : 'Select a File to Analyze'}
        </Typography>
        
        <Button variant="contained" component="label" startIcon={<UploadIcon />} sx={{
        mt: 2
      }}>

          Browse Files
          <input type="file" hidden onChange={handleFileSelect} />

        </Button>
      </Paper>;
  }

  // Loading state
  if (isAnalyzing) {
    return <Paper sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200
    }}>

        <CircularProgress sx={{
        mb: 2
      }} />
        
        <Typography variant="h6" gutterBottom>
          Analyzing File
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center">
          Performing deep content inspection...
        </Typography>
      </Paper>;
  }

  // Error state
  if (error) {
    return <Paper sx={{
      p: 3
    }}>
        <Alert severity="error" sx={{
        mb: 2
      }}>
          {error}
        </Alert>
        
        <Button variant="outlined" onClick={handleReset} sx={{
        mt: 1
      }}>

          Try Again
        </Button>
      </Paper>;
  }

  // Results view
  return <Paper sx={{
    p: compact ? 0 : 3
  }}>
      <Box>
        {!compact && <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>

            <Typography variant="h6">
              File Type Detection Results
            </Typography>
            
            <Button size="small" startIcon={<SearchIcon />} onClick={handleReset}>

              Analyze Another File
            </Button>
          </Box>}

        
        {detectionResult && <FileTypeCard result={detectionResult} compact={compact} />}


        
        {!compact && showDetailedResults && selectedFile && <Box sx={{
        mt: 3
      }}>
            <Typography variant="subtitle1" gutterBottom>
              Detection Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      File Information
                    </Typography>
                    
                    <List dense disablePadding>
                      <ListItem>
                        <ListItemIcon sx={{
                      minWidth: 36
                    }}>
                          <FileIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Name" secondary={selectedFile.name} primaryTypographyProps={{
                      variant: 'body2'
                    }} secondaryTypographyProps={{
                      component: 'div'
                    }} />

                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon sx={{
                      minWidth: 36
                    }}>
                          <StorageIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Size" secondary={formatFileSize(selectedFile.size)} primaryTypographyProps={{
                      variant: 'body2'
                    }} />

                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon sx={{
                      minWidth: 36
                    }}>
                          <QueryStatsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Detection Confidence" secondary={<Chip label={formatConfidence(detectionResult.confidence)} size="small" color={getConfidenceColor(detectionResult.confidence)} />} primaryTypographyProps={{
                      variant: 'body2'
                    }} secondaryTypographyProps={{
                      component: 'div'
                    }} />

                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Type Characteristics
                    </Typography>
                    
                    <List dense disablePadding>
                      <ListItem>
                        <ListItemIcon sx={{
                      minWidth: 36
                    }}>
                          <DataObjectIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Category" secondary={<Chip label={detectionResult.detectedType.category} size="small" variant="outlined" />} primaryTypographyProps={{
                      variant: 'body2'
                    }} secondaryTypographyProps={{
                      component: 'div'
                    }} />

                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon sx={{
                      minWidth: 36
                    }}>
                          <ArticleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Text-based" secondary={<Chip label={detectionResult.detectedType.isTextBased ? 'Yes' : 'No'} size="small" color={detectionResult.detectedType.isTextBased ? 'success' : 'default'} variant="outlined" />} primaryTypographyProps={{
                      variant: 'body2'
                    }} secondaryTypographyProps={{
                      component: 'div'
                    }} />

                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon sx={{
                      minWidth: 36
                    }}>
                          <CodeIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="MIME Type" secondary={<Typography variant="body2" component="span" sx={{
                      fontFamily: 'monospace'
                    }}>

                              {detectionResult.detectedType.mimeType}
                            </Typography>} primaryTypographyProps={{
                      variant: 'body2'
                    }} secondaryTypographyProps={{
                      component: 'div'
                    }} />

                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>}

      </Box>
    </Paper>;
};

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// PropTypes
FileTypeDetector.propTypes = {
  file: PropTypes.object,
  content: PropTypes.string,
  onDetectionComplete: PropTypes.func,
  allowFileDrop: PropTypes.bool,
  showDetailedResults: PropTypes.bool,
  performDeepInspection: PropTypes.bool,
  compact: PropTypes.bool
};
FileTypeCard.propTypes = {
  result: PropTypes.shape({
    detectedType: PropTypes.object.isRequired,
    confidence: PropTypes.number.isRequired,
    possibleTypes: PropTypes.array,
    metadata: PropTypes.object
  }).isRequired,
  compact: PropTypes.bool
};
export default FileTypeDetector;