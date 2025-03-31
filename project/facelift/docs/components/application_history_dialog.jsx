import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  History as HistoryIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  CompareArrows as CompareArrowsIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material';
import ApplicationStatusBadge from './ApplicationStatusBadge';

// Styled components
const StyledTimelineItem = styled(TimelineItem)(({ theme }) => ({
  '&:before': {
    flex: 0,
    padding: 0,
  },
}));

const ChangeDetail = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(1),
}));

/**
 * ApplicationHistoryDialog component
 * 
 * Displays the version history and lifecycle events for an application,
 * showing status changes, edits, and user actions in a timeline format.
 */
const ApplicationHistoryDialog = ({ open, onClose, applicationId, fetchHistory }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Load history data when dialog opens
  useEffect(() => {
    if (open && applicationId) {
      loadHistoryData();
    }
  }, [open, applicationId]);

  // Load history data from API
  const loadHistoryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const historyData = await fetchHistory(applicationId);
      setHistory(historyData);
      if (historyData.length > 0) {
        setSelectedVersion(historyData[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load application history');
    } finally {
      setIsLoading(false);
    }
  };

  // Get the selected version details
  const selectedVersionDetails = useMemo(() => {
    return history.find(item => item.id === selectedVersion) || null;
  }, [history, selectedVersion]);

  // Get action icon based on event type
  const getActionIcon = (eventType) => {
    const iconMap = {
      'created': <AddIcon color="success" />,
      'edited': <EditIcon color="primary" />,
      'published': <PublishIcon color="success" />,
      'unpublished': <UnpublishedIcon color="warning" />,
      'deleted': <DeleteIcon color="error" />,
      'restored': <RestoreIcon color="success" />,
      'status_changed': <CompareArrowsIcon color="info" />,
    };
    
    return iconMap[eventType] || <InfoIcon color="action" />;
  };

  // Get timeline dot color based on event type
  const getTimelineDotColor = (eventType) => {
    const colorMap = {
      'created': 'success',
      'edited': 'primary',
      'published': 'success',
      'unpublished': 'warning',
      'deleted': 'error',
      'restored': 'success',
      'status_changed': 'info',
    };
    
    return colorMap[eventType] || 'grey';
  };

  // Render loading state
  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Application History</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Render error state
  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Application History</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={loadHistoryData} startIcon={<RefreshIcon />}>
            Retry
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1 }} />
            Application History
          </Typography>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {history.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No history records found for this application.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', height: '450px' }}>
            {/* Left panel: Timeline */}
            <Box sx={{ width: '100%', mr: 2, overflowY: 'auto' }}>
              <Timeline position="right">
                {history.map((item) => (
                  <StyledTimelineItem key={item.id}>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                    </TimelineOppositeContent>
                    
                    <TimelineSeparator>
                      <TimelineDot color={getTimelineDotColor(item.event_type)}>
                        {getActionIcon(item.event_type)}
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    
                    <TimelineContent>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          cursor: 'pointer',
                          backgroundColor: selectedVersion === item.id ? 'action.selected' : 'background.paper',
                          border: selectedVersion === item.id ? '1px solid' : 'none',
                          borderColor: 'primary.main'
                        }}
                        onClick={() => setSelectedVersion(item.id)}
                      >
                        <Typography variant="subtitle1" component="div">
                          {item.event_type === 'created' && 'Application Created'}
                          {item.event_type === 'edited' && 'Application Edited'}
                          {item.event_type === 'published' && 'Application Published'}
                          {item.event_type === 'unpublished' && 'Application Unpublished'}
                          {item.event_type === 'deleted' && 'Application Deleted'}
                          {item.event_type === 'restored' && 'Application Restored'}
                          {item.event_type === 'status_changed' && 'Status Changed'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          {item.user ? `By ${item.user.name}` : 'System action'}
                        </Typography>
                        
                        {item.status && (
                          <Box sx={{ mt: 1 }}>
                            <ApplicationStatusBadge status={item.status} />
                          </Box>
                        )}
                        
                        {item.event_type === 'status_changed' && item.previous_status && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <ApplicationStatusBadge status={item.previous_status} size="small" />
                            <ArrowForwardIcon sx={{ mx: 1 }} fontSize="small" />
                            <ApplicationStatusBadge status={item.status} size="small" />
                          </Box>
                        )}
                      </Paper>
                    </TimelineContent>
                  </StyledTimelineItem>
                ))}
              </Timeline>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      {selectedVersionDetails && (
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle1" gutterBottom>
            Version Details
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <Chip 
              label={`Version ${selectedVersionDetails.version || 1}`} 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={`${selectedVersionDetails.event_type}`} 
              color={getTimelineDotColor(selectedVersionDetails.event_type)} 
              size="small" 
            />
            {selectedVersionDetails.user && (
              <Chip 
                label={selectedVersionDetails.user.name} 
                variant="outlined" 
                size="small" 
                avatar={<Avatar>{selectedVersionDetails.user.name.charAt(0)}</Avatar>}
              />
            )}
          </Stack>
          
          {selectedVersionDetails.changes && Object.keys(selectedVersionDetails.changes).length > 0 && (
            <ChangeDetail>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Changes in this version:
              </Typography>
              <List dense>
                {Object.entries(selectedVersionDetails.changes).map(([field, change]) => (
                  <ListItem key={field}>
                    <ListItemText 
                      primary={<Typography variant="body2">{field}</Typography>}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {change.from !== undefined && (
                            <>
                              From: <Typography component="span" variant="caption" color="text.primary">{String(change.from)}</Typography>
                              <ArrowForwardIcon sx={{ mx: 0.5, fontSize: 10 }} />
                              To: <Typography component="span" variant="caption" color="text.primary">{String(change.to)}</Typography>
                            </>
                          )}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </ChangeDetail>
          )}
          
          {selectedVersionDetails.comment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Comment:
              </Typography>
              <Typography variant="body2">
                {selectedVersionDetails.comment}
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

ApplicationHistoryDialog.propTypes = {
  /**
   * Whether the dialog is open
   */
  open: PropTypes.bool.isRequired,
  
  /**
   * Callback function called when the dialog is closed
   */
  onClose: PropTypes.func.isRequired,
  
  /**
   * ID of the application to display history for
   */
  applicationId: PropTypes.string,
  
  /**
   * Function to fetch application history from the API
   * @param {string} applicationId - ID of the application
   * @returns {Promise<Array>} Promise resolving to an array of history entries
   */
  fetchHistory: PropTypes.func.isRequired,
};

export default ApplicationHistoryDialog;