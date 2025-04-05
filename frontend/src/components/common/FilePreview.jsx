import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling/"; /**
                                                                                       * FilePreview Component
                                                                                       * 
                                                                                       * A versatile component for previewing different file types.
                                                                                       * Supports text, images, PDFs, and code files with syntax highlighting.
                                                                                       */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Paper, Typography, Tabs, Tab, Divider, Tooltip, IconButton, useTheme } from '@mui/material';

// Icons
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TableViewIcon from '@mui/icons-material/TableView';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

// File type utilities
import { getPreviewType, getSyntaxHighlightLanguage, generateFileMetadata, isPreviewSupported } from "@/utils/fileTypeUtils";

// PlaceholderDisplay component for unsupported file types
const PlaceholderDisplay = ({
  error,
  fileType,
  onDownload
}) => <Box sx={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  p: 4,
  height: '100%',
  bgcolor: 'background.default'
}}>

    {error ? <ErrorOutlineIcon sx={{
    fontSize: 64,
    color: 'error.main',
    mb: 2
  }} /> : <BrokenImageIcon sx={{
    fontSize: 64,
    color: 'action.disabled',
    mb: 2
  }} />}

    
    <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
      {error ? 'Error Loading Preview' : 'Preview Not Available'}
    </Typography>
    
    <Typography variant="body2" color="text.secondary" align="center" paragraph>
      {error ? 'There was an error loading the file preview. Please try downloading the file instead.' : `This file type (${fileType}) is not supported for preview. You can download the file to view it.`}

    </Typography>
    
    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownload} sx={{
    mt: 2
  }}>

      Download File
    </Button>
  </Box>;

// ImagePreview component for image files
const ImagePreview = ({
  url,
  alt,
  error,
  onError
}) => {
  return <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    overflow: 'auto',
    bgcolor: 'background.default'
  }}>

      {error ? <PlaceholderDisplay error={error} fileType="image" /> : <img src={url} alt={alt || 'File preview'} onError={onError} style={{
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    }} />}


    </Box>;
};

// PDFPreview component for PDF files
const PDFPreview = ({
  url,
  error
}) => {
  return <Box sx={{
    height: '100%',
    overflow: 'hidden'
  }}>
      {error ? <PlaceholderDisplay error={error} fileType="PDF" /> : <iframe src={url} title="PDF Preview" width="100%" height="100%" style={{
      border: 'none'
    }}>

          <p>Your browser does not support PDF previews.</p>
        </iframe>}

    </Box>;
};

// TextPreview component for text files
const TextPreview = ({
  content,
  error,
  mimeType
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error('Failed to copy:', err));
  };

  // Determine if content should be treated as code
  const isCode = mimeType && (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html') || mimeType.includes('css'));
  return <Box sx={{
    position: 'relative',
    height: '100%'
  }}>
      {error ? <PlaceholderDisplay error={error} fileType="text" /> : <>
          <Box sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10
      }}>
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton onClick={handleCopy} size="small" color={copied ? "success" : "default"}>

                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{
        height: '100%',
        overflow: 'auto',
        bgcolor: isCode ? 'grey.900' : 'background.paper',
        color: isCode ? 'grey.300' : 'text.primary',
        p: 2,
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        borderRadius: 1
      }}>

            {content || 'No content available'}
          </Box>
        </>}

    </Box>;
};

// CodePreview component for code files with syntax highlighting
// This is a simple version - in a production app, you'd use a library like prism.js or highlight.js
const CodePreview = ({
  content,
  language,
  error
}) => {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();
  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error('Failed to copy:', err));
  };

  // Simple syntax highlighting styles - in a real app, use a proper syntax highlighting library
  const codeStyle = {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
    color: theme.palette.mode === 'dark' ? '#d4d4d4' : '#333333',
    borderRadius: 4,
    overflowX: 'auto',
    height: '100%'
  };
  return <Box sx={{
    position: 'relative',
    height: '100%'
  }}>
      {error ? <PlaceholderDisplay error={error} fileType="code" /> : <>
          <Box sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        display: 'flex'
      }}>
            <Tooltip title="Language: ">
              <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mr: 1,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'background.paper',
            fontSize: '0.75rem',
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider'
          }}>
                <CodeIcon fontSize="inherit" sx={{
              mr: 0.5
            }} />
                {language || 'plaintext'}
              </Box>
            </Tooltip>
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton onClick={handleCopy} size="small" color={copied ? "success" : "default"}>

                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{
        height: '100%',
        overflow: 'auto'
      }}>
            <pre style={codeStyle}>
              <code>
                {content || '// No content available'}
              </code>
            </pre>
          </Box>
        </>}

    </Box>;
};

/**
 * FilePreview component - Universal file preview component
 * @component
 */
const FilePreview = ({
  file,
  url,
  content,
  mimeType,
  filename,
  maxHeight,
  fullWidth,
  showToolbar,
  onDownload,
  isLoading,
  error
}) => {
  const [formError, setFormError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [previewError, setPreviewError] = useState(error || null);
  const [fileMetadata, setFileMetadata] = useState(null);

  // Generate file metadata
  useEffect(() => {
    const fileObj = file || {
      name: filename,
      type: mimeType,
      url: url
    };
    setFileMetadata(generateFileMetadata(fileObj));
  }, [file, filename, mimeType, url]);

  // Reset error state when props change
  useEffect(() => {
    setPreviewError(error || null);
  }, [error, url, content, file]);
  if (!fileMetadata) {
    return <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      py: 4
    }}>
        <CircularProgress />
      </Box>;
  }

  // Determine preview type
  const previewType = getPreviewType(fileMetadata.mimeType);

  // Handle image load error
  const handleImageError = () => {
    setPreviewError('Failed to load image');
  };

  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (url) {
      // Create a temporary anchor and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileMetadata.filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Toggle fullscreen mode
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Determine if there's something to preview
  const hasPreview = isPreviewSupported(fileMetadata.mimeType) && (url || content);
  const previewHeight = expanded ? '80vh' : maxHeight || '400px';

  // Render preview based on file type
  const renderPreview = () => {
    if (isLoading) {
      return <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
      }}>

          <CircularProgress />
        </Box>;
    }
    if (previewError || !hasPreview) {
      return <PlaceholderDisplay error={previewError} fileType={fileMetadata.description} onDownload={handleDownload} />;
    }
    switch (previewType) {
      case 'image':
        return <ImagePreview url={url} alt={fileMetadata.filename} onError={handleImageError} error={previewError} />;
      case 'pdf':
        return <PDFPreview url={url} error={previewError} />;
      case 'code':
        return <CodePreview content={content} language={getSyntaxHighlightLanguage(fileMetadata.mimeType)} error={previewError} />;
      case 'text':
        return <TextPreview content={content} mimeType={fileMetadata.mimeType} error={previewError} />;
      default:
        return <PlaceholderDisplay fileType={fileMetadata.description} onDownload={handleDownload} />;
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
    if (activeTab === 0) {
      return renderPreview();
    }
    if (activeTab === 1) {
      // File details tab
      return <Box sx={{
        p: 2
      }}>
          <Typography variant="h6" gutterBottom>
            File Information
          </Typography>
          
          <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 1
        }}>
            <Typography variant="subtitle2">Filename:</Typography>
            <Typography variant="body2">{fileMetadata.filename}</Typography>
            
            <Typography variant="subtitle2">Type:</Typography>
            <Typography variant="body2">{fileMetadata.description}</Typography>
            
            <Typography variant="subtitle2">MIME Type:</Typography>
            <Typography variant="body2" sx={{
            fontFamily: 'monospace'
          }}>
              {fileMetadata.mimeType}
            </Typography>
            
            <Typography variant="subtitle2">Size:</Typography>
            <Typography variant="body2">
              {formatFileSize(fileMetadata.size)}
            </Typography>
            
            {fileMetadata.lastModified && <>
                <Typography variant="subtitle2">Last Modified:</Typography>
                <Typography variant="body2">
                  {new Date(fileMetadata.lastModified).toLocaleString()}
                </Typography>
              </>}

            
            <Typography variant="subtitle2">Preview Status:</Typography>
            <Typography variant="body2">
              {fileMetadata.isPreviewable ? 'Preview available' : 'Preview not supported for this file type'}
            </Typography>
          </Box>
        </Box>;
    }
    return null;
  };

  // Format file size
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Icon based on file type
  const getFileTypeIcon = () => {
    switch (fileMetadata.previewType) {
      case 'code':
        return <CodeIcon />;
      case 'text':
        if (fileMetadata.mimeType === 'text/csv' || fileMetadata.mimeType === 'text/tab-separated-values') {
          return <TableViewIcon />;
        }
        if (fileMetadata.mimeType === 'application/json') {
          return <DataObjectIcon />;
        }
        return <TextFieldsIcon />;
      default:
        return <TerminalIcon />;
    }
  };
  return <Paper variant="outlined" sx={{
    height: previewHeight,
    width: fullWidth ? '100%' : 'auto',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'height 0.3s ease'
  }}>

      {/* Preview toolbar */}
      {showToolbar && <>
          <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}>

            <Box sx={{
          display: 'flex',
          alignItems: 'center'
        }}>
              <Box sx={{
            mr: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
                {getFileTypeIcon()}
              </Box>
              <Typography variant="subtitle1" noWrap sx={{
            maxWidth: '300px'
          }}>
                {fileMetadata.filename}
              </Typography>
            </Box>
            
            <Box>
              <Tooltip title="Download">
                <IconButton onClick={handleDownload} size="small">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={expanded ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton onClick={toggleExpanded} size="small">
                  {expanded ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Tabs value={activeTab} onChange={handleTabChange} sx={{
        px: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>

            <Tab label="Preview" />
            <Tab label="Details" />
          </Tabs>
        </>}

      
      {/* Preview content */}
      <Box sx={{
      flexGrow: 1,
      overflow: 'auto'
    }}>
        {renderTabContent()}
      </Box>
    </Paper>;
};
FilePreview.propTypes = {
  file: PropTypes.object,
  url: PropTypes.string,
  content: PropTypes.string,
  mimeType: PropTypes.string,
  filename: PropTypes.string,
  maxHeight: PropTypes.string,
  fullWidth: PropTypes.bool,
  showToolbar: PropTypes.bool,
  onDownload: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
FilePreview.defaultProps = {
  maxHeight: '400px',
  fullWidth: true,
  showToolbar: true,
  isLoading: false
};
export default FilePreview;