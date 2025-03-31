import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  List,
  ListItem,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MoreVert as MoreVertIcon,
  Apps as AppsIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { FixedSizeList as VirtualList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ApplicationStatusBadge from './application_status_badge';

// Styled components
const StyledCard = styled(Card)(({ theme, status }) => ({
  position: 'relative',
  transition: 'transform 0.2s, box-shadow 0.2s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  borderLeft: status === 'active' 
    ? `4px solid ${theme.palette.success.main}` 
    : status === 'draft' 
      ? `4px solid ${theme.palette.info.main}` 
      : status === 'deprecated' 
        ? `4px solid ${theme.palette.warning.main}` 
        : status === 'inactive' 
          ? `4px solid ${theme.palette.error.main}` 
          : `4px solid ${theme.palette.grey[400]}`
}));

const ListItemCard = styled(Card)(({ theme, status }) => ({
  width: '100%',
  marginBottom: theme.spacing(1),
  borderLeft: status === 'active' 
    ? `4px solid ${theme.palette.success.main}` 
    : status === 'draft' 
      ? `4px solid ${theme.palette.info.main}` 
      : status === 'deprecated' 
        ? `4px solid ${theme.palette.warning.main}` 
        : status === 'inactive' 
          ? `4px solid ${theme.palette.error.main}` 
          : `4px solid ${theme.palette.grey[400]}`,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

/**
 * VirtualizedApplicationList component
 * 
 * A high-performance list component for displaying applications using virtualization
 * for optimal rendering performance with large datasets.
 */
const VirtualizedApplicationList = ({
  applications = [],
  isLoading = false,
  error = null,
  viewMode = 'grid',
  onViewModeChange,
  onAppClick,
  onAppMenuOpen,
  emptyState,
}) => {
  const theme = useTheme();

  // Memoize the VirtualizedRow component to avoid re-renders
  const VirtualizedRow = useCallback(({ index, style }) => {
    const app = applications[index];
    
    return (
      <div style={{ ...style, paddingRight: 16 }}>
        <ListItemCard status={app.status}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{app.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {app.description || 'No description provided'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ApplicationStatusBadge status={app.status} />
                {app.type && (
                  <Chip 
                    label={app.type.replace('_', ' ')} 
                    size="small" 
                    variant="outlined" 
                    sx={{ ml: 1 }} 
                  />
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mx: 2 }}>
                  Updated: {new Date(app.updated_at).toLocaleDateString()}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => onAppMenuOpen(e, app)}
                  aria-label="application actions"
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </ListItemCard>
      </div>
    );
  }, [applications, onAppMenuOpen]);

  // Render grid or list view based on the viewMode
  const renderGridView = () => (
    <Grid container spacing={3}>
      {applications.map((app) => (
        <Grid item xs={12} sm={6} md={4} key={app.id}>
          <StyledCard 
            status={app.status}
            onClick={() => onAppClick(app)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" noWrap title={app.name}>
                  {app.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppMenuOpen(e, app);
                  }}
                  aria-label="application actions"
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {app.description || 'No description provided'}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <ApplicationStatusBadge status={app.status} />
                <Typography variant="caption" color="text.secondary">
                  Updated: {new Date(app.updated_at).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );

  const renderVirtualizedListView = () => (
    <Box sx={{ height: 'calc(100vh - 250px)', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <VirtualList
            height={height}
            width={width}
            itemCount={applications.length}
            itemSize={100} // Height of each row
          >
            {VirtualizedRow}
          </VirtualList>
        )}
      </AutoSizer>
    </Box>
  );

  // Display loading, error, or empty state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error.message || 'An error occurred'}</Typography>
      </Box>
    );
  }

  if (applications.length === 0 && emptyState) {
    return emptyState;
  }

  return (
    <Box>
      <HeaderRow>
        <Typography variant="subtitle1">
          {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
        </Typography>
        <Box>
          <Tooltip title="Grid view">
            <IconButton 
              size="small" 
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('grid')}
              aria-label="grid view"
            >
              <AppsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List view">
            <IconButton 
              size="small" 
              color={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('list')}
              aria-label="list view"
              sx={{ ml: 1 }}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </HeaderRow>
      <Box sx={{ mt: 2 }}>
        {viewMode === 'grid' ? renderGridView() : renderVirtualizedListView()}
      </Box>
    </Box>
  );
};

VirtualizedApplicationList.propTypes = {
  /**
   * Array of application objects to display
   */
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      type: PropTypes.string,
      status: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      updated_at: PropTypes.string.isRequired,
    })
  ).isRequired,
  
  /**
   * Whether the applications are currently loading
   */
  isLoading: PropTypes.bool,
  
  /**
   * Error object if an error occurred
   */
  error: PropTypes.object,
  
  /**
   * The current view mode ('grid' or 'list')
   */
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
  
  /**
   * Callback function when the view mode is changed
   */
  onViewModeChange: PropTypes.func.isRequired,
  
  /**
   * Callback function when an application is clicked
   */
  onAppClick: PropTypes.func.isRequired,
  
  /**
   * Callback function when an application's menu is opened
   */
  onAppMenuOpen: PropTypes.func.isRequired,
  
  /**
   * Component to display when no applications are available
   */
  emptyState: PropTypes.node,
};

export default VirtualizedApplicationList;