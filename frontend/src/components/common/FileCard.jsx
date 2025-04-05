import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * FileCard Component
                                                                                      * 
                                                                                      * A reusable card component for displaying file metadata with preview capabilities.
                                                                                      * Supports various file types with appropriate icons and actions.
                                                                                      */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardActionArea, CardActions, CardContent, CardMedia, Chip, Dialog, IconButton, Tooltip, Typography } from '@mui/material';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import AudioFileOutlinedIcon from '@mui/icons-material/AudioFileOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

// File type utilities
import { getFileTypeIcon, getFileTypeColor, getFileTypeDescription, generateFileMetadata } from "@/utils/fileTypeUtils";

// File preview component
import FilePreview from './FilePreview';

/**
 * FileCard component for displaying file information
 * @component
 */
const FileCard = ({
  file,
  url,
  name,
  size,
  type,
  lastModified,
  onPreview,
  onDownload,
  onDelete,
  showActions = true,
  showPreview = true,
  compact = false,
  variant = 'outlined'
}) => {
  const [formError, setFormError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fileMetadata, setFileMetadata] = useState(null);
  useEffect(() => {
    // Create file metadata object
    const fileObj = file || {
      name: name,
      size: size,
      type: type,
      lastModified: lastModified
    };
    setFileMetadata(generateFileMetadata(fileObj));
  }, [file, name, size, type, lastModified]);
  if (!fileMetadata) {
    return null;
  }

  // Format file size
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format last modified date
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get file icon component based on file type
  const getFileIconComponent = iconName => {
    const iconProps = {
      fontSize: compact ? 'medium' : 'large',
      sx: {
        color: getFileTypeColor(fileMetadata.mimeType)
      }
    };
    switch (iconName) {
      case 'Description':
        return <DescriptionOutlinedIcon {...iconProps} />;
      case 'Image':
        return <ImageOutlinedIcon {...iconProps} />;
      case 'PictureAsPdf':
        return <PictureAsPdfOutlinedIcon {...iconProps} />;
      case 'AudioFile':
        return <AudioFileOutlinedIcon {...iconProps} />;
      case 'VideoFile':
        return <VideocamOutlinedIcon {...iconProps} />;
      case 'Code':
        return <CodeOutlinedIcon {...iconProps} />;
      case 'Storage':
        return <StorageOutlinedIcon {...iconProps} />;
      case 'FolderZip':
        return <FolderZipOutlinedIcon {...iconProps} />;
      case 'TableChart':
        return <TableChartOutlinedIcon {...iconProps} />;
      default:
        return <InsertDriveFileOutlinedIcon {...iconProps} />;
    }
  };

  // Handle preview click
  const handlePreviewClick = () => {
    if (onPreview) {
      onPreview(fileMetadata);
    } else {
      setPreviewOpen(true);
    }
  };

  // Handle download click
  const handleDownloadClick = e => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(fileMetadata);
    }
  };

  // Handle delete click
  const handleDeleteClick = e => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(fileMetadata);
    }
  };

  // Close preview dialog
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  // Determine if we have a thumbnail URL for images
  const thumbnailUrl = fileMetadata.mimeType.startsWith('image/') && url ? url : null;

  // For compact cards
  if (compact) {
    return <>
        <Card variant={variant} sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '48px',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}>

          <CardActionArea onClick={handlePreviewClick} sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          justifyContent: 'flex-start',
          px: 1
        }}>

            <Box sx={{
            mr: 1
          }}>
              {getFileIconComponent(getFileTypeIcon(fileMetadata.mimeType))}
            </Box>
            <Box sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden',
            pr: showActions ? 5 : 1
          }}>
              <Typography variant="body2" noWrap sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '60%'
            }}>

                {fileMetadata.filename}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>

                {formatFileSize(fileMetadata.size)}
              </Typography>
            </Box>
          </CardActionArea>
          
          {showActions && <Box sx={{
          position: 'absolute',
          right: 8,
          display: 'flex',
          alignItems: 'center'
        }}>
              {onPreview && fileMetadata.isPreviewable && <Tooltip title="Preview">
                  <IconButton size="small" onClick={handlePreviewClick} color="primary">

                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>}

              
              {onDownload && <Tooltip title="Download">
                  <IconButton size="small" onClick={handleDownloadClick}>

                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>}

              
              {onDelete && <Tooltip title="Delete">
                  <IconButton size="small" onClick={handleDeleteClick} color="error">

                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>}

            </Box>}

        </Card>
        
        {/* Preview Dialog */}
        {showPreview && <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="lg" fullWidth>

            <FilePreview file={file} url={url} mimeType={fileMetadata.mimeType} filename={fileMetadata.filename} onDownload={onDownload ? () => onDownload(fileMetadata) : undefined} />

          </Dialog>}

      </>;
  }

  // For full-sized cards
  return <>
      <Card variant={variant} sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      '&:hover': {
        boxShadow: 2
      }
    }}>

        {/* Thumbnail area */}
        <CardActionArea onClick={handlePreviewClick}>
          {thumbnailUrl ? <CardMedia component="img" height="140" image={thumbnailUrl} alt={fileMetadata.filename} sx={{
          objectFit: 'contain',
          bgcolor: 'background.default'
        }} /> : <Box sx={{
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}>

              {getFileIconComponent(getFileTypeIcon(fileMetadata.mimeType))}
            </Box>}

          
          <CardContent>
            <Typography variant="subtitle2" noWrap title={fileMetadata.filename} gutterBottom>

              {fileMetadata.filename}
            </Typography>
            
            <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1
          }}>
              <Chip label={fileMetadata.description} size="small" sx={{
              height: 20,
              fontSize: '0.7rem',
              bgcolor: getFileTypeColor(fileMetadata.mimeType) + '22',
              color: getFileTypeColor(fileMetadata.mimeType)
            }} />

              
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(fileMetadata.size)}
              </Typography>
            </Box>
            
            {fileMetadata.lastModified && <Typography variant="caption" color="text.secondary" display="block">
                Modified: {formatDate(fileMetadata.lastModified)}
              </Typography>}

          </CardContent>
        </CardActionArea>
        
        {/* Actions */}
        {showActions && <CardActions sx={{
        mt: 'auto',
        justifyContent: 'flex-end'
      }}>
            {onPreview && fileMetadata.isPreviewable && <Tooltip title="Preview">
                <IconButton size="small" onClick={handlePreviewClick} color="primary">

                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>}

            
            {onDownload && <Tooltip title="Download">
                <IconButton size="small" onClick={handleDownloadClick}>

                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>}

            
            {onDelete && <Tooltip title="Delete">
                <IconButton size="small" onClick={handleDeleteClick} color="error">

                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>}

          </CardActions>}

      </Card>
      
      {/* Preview Dialog */}
      {showPreview && <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="lg" fullWidth>

          <FilePreview file={file} url={url} mimeType={fileMetadata.mimeType} filename={fileMetadata.filename} onDownload={onDownload ? () => onDownload(fileMetadata) : undefined} />

        </Dialog>}

    </>;
};
FileCard.propTypes = {
  file: PropTypes.object,
  url: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
  type: PropTypes.string,
  lastModified: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  onPreview: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
  showPreview: PropTypes.bool,
  compact: PropTypes.bool,
  variant: PropTypes.oneOf(['outlined', 'elevation', 'contained'])
};
export default FileCard;