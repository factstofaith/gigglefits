import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MoreVert as MoreVertIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  DataObject as DataObjectIcon,
  Database as DatabaseIcon,
  Description as DescriptionIcon,
  CloudQueue as CloudQueueIcon,
  OpenInNew as OpenInNewIcon,
  Link as LinkIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { 
  getDatasetTypeName, 
  getSourceTypeName, 
  formatFileSize,
  DATASET_SOURCE_TYPES,
  DATASET_STATUSES,
  getDatasetStatusColor,
} from './dataset_model';

// Styled components
const StyledCard = styled(Card)(({ theme, status }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  borderLeft: `4px solid ${getDatasetStatusColor(status)}`,
}));

const DatasetHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
}));

const DatasetTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: '48px',
}));

const DatasetDescription = styled(Typography)(({ theme }) => ({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(1.5),
  minHeight: '40px',
}));

const MetadataItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
}));

const CardFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(1),
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

const StatusChip = styled(Chip)(({ theme, statuscolor }) => ({
  backgroundColor: `${statuscolor}20`, // 20% opacity
  color: statuscolor,
  fontWeight: 500,
}));

/**
 * DatasetCard component
 * 
 * A card component that displays dataset information in a compact,
 * visually appealing format for use in grid layouts.
 */
const DatasetCard = ({
  dataset,
  onMenuOpen,
  onFavoriteToggle,
  isFavorite = false,
  showApplications = true,
  variant = 'grid',
}) => {
  const theme = useTheme();
  
  // Get appropriate icon for source type
  const getSourceTypeIcon = () => {
    switch (dataset.sourceType) {
      case DATASET_SOURCE_TYPES.S3:
      case DATASET_SOURCE_TYPES.AZURE_BLOB:
      case DATASET_SOURCE_TYPES.SHAREPOINT:
        return <CloudQueueIcon fontSize="small" />;
      case DATASET_SOURCE_TYPES.DATABASE:
        return <DatabaseIcon fontSize="small" />;
      case DATASET_SOURCE_TYPES.API:
        return <ApiIcon fontSize="small" />;
      case DATASET_SOURCE_TYPES.FILE:
        return <DescriptionIcon fontSize="small" />;
      case DATASET_SOURCE_TYPES.MANUAL:
        return <DataObjectIcon fontSize="small" />;
      default:
        return <StorageIcon fontSize="small" />;
    }
  };
  
  // Get status chip with appropriate color
  const getStatusChip = () => {
    const statusColor = getDatasetStatusColor(dataset.status);
    let label;
    
    switch (dataset.status) {
      case DATASET_STATUSES.ACTIVE:
        label = 'Active';
        break;
      case DATASET_STATUSES.DRAFT:
        label = 'Draft';
        break;
      case DATASET_STATUSES.DEPRECATED:
        label = 'Deprecated';
        break;
      case DATASET_STATUSES.ARCHIVED:
        label = 'Archived';
        break;
      case DATASET_STATUSES.ERROR:
        label = 'Error';
        break;
      default:
        label = dataset.status;
    }
    
    return (
      <StatusChip
        label={label}
        size="small"
        statuscolor={statusColor}
      />
    );
  };
  
  // Render a grid-style card (default)
  if (variant === 'grid') {
    return (
      <StyledCard status={dataset.status}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DatasetHeader>
            <Box>
              {getStatusChip()}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Favorite icon */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle(dataset.id, !isFavorite);
                }}
                color={isFavorite ? 'warning' : 'default'}
                sx={{ mr: 0.5 }}
              >
                {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
              </IconButton>
              
              {/* Menu button */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuOpen(e, dataset);
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </DatasetHeader>
          
          <DatasetTitle variant="subtitle1" component="h3">
            {dataset.name}
          </DatasetTitle>
          
          <DatasetDescription variant="body2" color="text.secondary">
            {dataset.description || 'No description provided'}
          </DatasetDescription>
          
          <Divider sx={{ my: 1 }} />
          
          <Box>
            <MetadataItem>
              <Tooltip title={getSourceTypeName(dataset.sourceType)}>
                <Box sx={{ mr: 1, color: 'primary.main' }}>
                  {getSourceTypeIcon()}
                </Box>
              </Tooltip>
              <Typography variant="body2">
                {getDatasetTypeName(dataset.type)}
              </Typography>
            </MetadataItem>
            
            {dataset.recordCount > 0 && (
              <MetadataItem>
                <StorageIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  {dataset.recordCount.toLocaleString()} records
                </Typography>
              </MetadataItem>
            )}
            
            {dataset.size > 0 && (
              <MetadataItem>
                <DataObjectIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  {formatFileSize(dataset.size)}
                </Typography>
              </MetadataItem>
            )}
            
            {showApplications && dataset.applicationAssociations.length > 0 && (
              <MetadataItem>
                <LinkIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  {dataset.applicationAssociations.length} application
                  {dataset.applicationAssociations.length !== 1 ? 's' : ''}
                </Typography>
              </MetadataItem>
            )}
            
            {dataset.lastSyncedAt && (
              <MetadataItem>
                <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  Updated: {new Date(dataset.lastSyncedAt).toLocaleDateString()}
                </Typography>
              </MetadataItem>
            )}
          </Box>
          
          <CardFooter>
            {dataset.tags && dataset.tags.length > 0 && (
              <TagsContainer>
                {dataset.tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {dataset.tags.length > 3 && (
                  <Chip
                    label={`+${dataset.tags.length - 3}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </TagsContainer>
            )}
          </CardFooter>
        </CardContent>
      </StyledCard>
    );
  }
  
  // Render a list-style card
  return (
    <Card 
      variant="outlined" 
      sx={{
        mb: 1,
        borderLeft: `4px solid ${getDatasetStatusColor(dataset.status)}`,
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        }
      }}
    >
      <CardContent sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 1.5,
        '&:last-child': { pb: 1.5 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {/* Dataset type icon */}
          <Box sx={{ mr: 2, color: 'primary.main' }}>
            <Tooltip title={getSourceTypeName(dataset.sourceType)}>
              <Box>
                {getSourceTypeIcon()}
              </Box>
            </Tooltip>
          </Box>
          
          {/* Dataset details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
                {dataset.name}
              </Typography>
              <Box sx={{ ml: 1 }}>
                {getStatusChip()}
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" noWrap>
              {dataset.description || 'No description provided'}
            </Typography>
          </Box>
          
          {/* Middle section - metadata */}
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 2, minWidth: 200 }}>
            <Chip
              label={getDatasetTypeName(dataset.type)}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            
            {dataset.recordCount > 0 && (
              <Tooltip title={`${dataset.recordCount.toLocaleString()} records`}>
                <Chip
                  icon={<StorageIcon fontSize="small" />}
                  label={dataset.recordCount.toLocaleString()}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
              </Tooltip>
            )}
            
            {dataset.size > 0 && (
              <Tooltip title="Dataset size">
                <Chip
                  icon={<DataObjectIcon fontSize="small" />}
                  label={formatFileSize(dataset.size)}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Box>
          
          {/* Applications section */}
          {showApplications && (
            <Box sx={{ minWidth: 120 }}>
              {dataset.applicationAssociations.length > 0 ? (
                <Tooltip title={dataset.applicationAssociations.map(a => a.applicationName).join(', ')}>
                  <Chip
                    icon={<LinkIcon fontSize="small" />}
                    label={`${dataset.applicationAssociations.length} app${dataset.applicationAssociations.length !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              ) : (
                <Chip
                  label="No apps"
                  size="small"
                  variant="outlined"
                  sx={{ opacity: 0.5 }}
                />
              )}
            </Box>
          )}
          
          {/* Actions section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              {dataset.lastSyncedAt && new Date(dataset.lastSyncedAt).toLocaleDateString()}
            </Typography>
            
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(dataset.id, !isFavorite);
              }}
              color={isFavorite ? 'warning' : 'default'}
            >
              {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
            
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuOpen(e, dataset);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

DatasetCard.propTypes = {
  /**
   * Dataset object to display
   */
  dataset: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string.isRequired,
    sourceType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    size: PropTypes.number,
    recordCount: PropTypes.number,
    lastSyncedAt: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    applicationAssociations: PropTypes.arrayOf(
      PropTypes.shape({
        applicationId: PropTypes.string.isRequired,
        applicationName: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  
  /**
   * Callback when the menu button is clicked
   */
  onMenuOpen: PropTypes.func.isRequired,
  
  /**
   * Callback when the favorite button is clicked
   */
  onFavoriteToggle: PropTypes.func.isRequired,
  
  /**
   * Whether the dataset is marked as a favorite
   */
  isFavorite: PropTypes.bool,
  
  /**
   * Whether to show the applications associated with the dataset
   */
  showApplications: PropTypes.bool,
  
  /**
   * Variant of the card to display
   */
  variant: PropTypes.oneOf(['grid', 'list']),
};

export default DatasetCard;