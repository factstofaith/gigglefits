import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography, Switch, FormControlLabel, TextField, Button, Divider, Grid, Chip, Alert, CircularProgress, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, List, ListItem, ListItemText, ListItemIcon, Card, CardContent, CardActions, LinearProgress } from '../../design-system';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';;
import {
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Folder as FolderIcon,
  Link as LinkIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { styled, alpha } from '../../design-system';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
// Styled components
const MonitoringContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`
}));

const MonitoringHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const MonitoringContent = styled(Box)({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column'
});

const ConfigurationSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5)
}));

const StatusSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const EventList = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItem-root': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const EventCard = styled(Card)(({ theme, severity }) => ({
  margin: theme.spacing(1),
  borderLeft: `4px solid ${
    severity === 'error' ? theme.palette.error.main :
    severity === 'warning' ? theme.palette.warning.main :
    severity === 'info' ? theme.palette.info.main :
    theme.palette.success.main
  }`
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'running' ? theme.palette.success.main :
    status === 'paused' ? theme.palette.warning.main :
    status === 'stopped' ? theme.palette.error.main :
    status === 'error' ? theme.palette.error.main :
    theme.palette.grey[500],
  color: theme.palette.getContrastText(
    status === 'running' ? theme.palette.success.main :
    status === 'paused' ? theme.palette.warning.main :
    status === 'stopped' ? theme.palette.error.main :
    status === 'error' ? theme.palette.error.main :
    theme.palette.grey[500]
  )
}));

const EmptyStateContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: 40,
  height: '100%'
});

/**
 * Component for monitoring files in storage systems with configurable polling
 * 
 * Features:
 * - Configure monitoring intervals
 * - Set file pattern matching
 * - Control monitoring status (start/pause/stop)
 * - View file change events
 * - Configure notifications for changes
 */
const FileMonitoringSystem = ({
  storageType = 's3',
  containerName = '',
  resourcePath = '',
  credentials = {},
  onChange = null,
  height = 500,
  initialConfig = {},
  onEventsDetected = null
}) => {
  // Added display name
  FileMonitoringSystem.displayName = 'FileMonitoringSystem';

  // Added display name
  FileMonitoringSystem.displayName = 'FileMonitoringSystem';

  // Added display name
  FileMonitoringSystem.displayName = 'FileMonitoringSystem';


  // Reference to the monitoring interval
  const monitoringInterval = useRef(null);
  
  // State for monitoring configuration
  const [monitoringConfig, setMonitoringConfig] = useState({
    enabled: false,
    pollingInterval: 60, // in seconds
    filePatterns: '*.*', // file patterns to match
    includeSubfolders: true,
    monitorCreated: true,
    monitorModified: true,
    monitorDeleted: true,
    notifyOnChanges: true,
    triggerWorkflowOnChanges: false,
    maxEventsToKeep: 100,
    ...initialConfig
  });
  
  // State for monitoring status
  const [monitoringStatus, setMonitoringStatus] = useState({
    status: 'stopped', // stopped, running, paused, error
    lastCheck: null,
    nextCheck: null,
    error: null,
    checksCompleted: 0,
    changesDetected: 0
  });
  
  // State for tracking events
  const [events, setEvents] = useState([]);
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // Mock function to check for file changes
  const checkForChanges = useCallback(() => {
  // Added display name
  checkForChanges.displayName = 'checkForChanges';

    
    // Update monitoring status
    setMonitoringStatus(prev => ({
      ...prev,
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + monitoringConfig.pollingInterval * 1000),
      checksCompleted: prev.checksCompleted + 1
    }));
    
    // Approximately 30% of checks will find changes (for demo purposes)
    if (Math.random() < 0.3) {
      // Generate a mock event
      const eventTypes = ['created', 'modified', 'deleted'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      // Only generate events for types that are being monitored
      if (
        (eventType === 'created' && monitoringConfig.monitorCreated) ||
        (eventType === 'modified' && monitoringConfig.monitorModified) ||
        (eventType === 'deleted' && monitoringConfig.monitorDeleted)
      ) {
        // Create a mock file event
        const fileExtensions = ['csv', 'json', 'xlsx', 'txt', 'pdf'];
        const extension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
        const fileName = `sample_${Math.floor(Math.random() * 1000)}.${extension}`;
        const filePath = resourcePath ? `${resourcePath}/${fileName}` : fileName;
        
        const newEvent = {
          id: Date.now(),
          type: eventType,
          timestamp: new Date(),
          file: {
            name: fileName,
            path: filePath,
            extension: extension
          },
          severity: 
            eventType === 'deleted' ? 'warning' :
            eventType === 'modified' ? 'info' :
            'success'
        };
        
        // Add the event to the list
        setEvents(prev => {
          const newEvents = [newEvent, ...prev];
          // Limit the number of events
          return newEvents.slice(0, monitoringConfig.maxEventsToKeep);
        });
        
        // Update monitoring status
        setMonitoringStatus(prev => ({
          ...prev,
          changesDetected: prev.changesDetected + 1
        }));
        
        // Call the events detected callback if provided
        if (onEventsDetected) {
          onEventsDetected([newEvent]);
        }
      }
    }
  }, [containerName, resourcePath, monitoringConfig, onEventsDetected]);
  
  // Start monitoring
  const startMonitoring = useCallback(() => {
  // Added display name
  startMonitoring.displayName = 'startMonitoring';

    // Clear any existing interval
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }
    
    // Set monitoring status to running
    setMonitoringStatus(prev => ({
      ...prev,
      status: 'running',
      error: null,
      nextCheck: new Date(Date.now() + monitoringConfig.pollingInterval * 1000)
    }));
    
    // Perform an initial check
    checkForChanges();
    
    // Start the interval
    monitoringInterval.current = setInterval(
      checkForChanges,
      monitoringConfig.pollingInterval * 1000
    );
    
    // Update the config
    if (onChange) {
      onChange({
        ...monitoringConfig,
        enabled: true
      });
    }
  }, [monitoringConfig, checkForChanges, onChange]);
  
  // Pause monitoring
  const pauseMonitoring = useCallback(() => {
  // Added display name
  pauseMonitoring.displayName = 'pauseMonitoring';

    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
    
    setMonitoringStatus(prev => ({
      ...prev,
      status: 'paused'
    }));
  }, []);
  
  // Stop monitoring
  const stopMonitoring = useCallback(() => {
  // Added display name
  stopMonitoring.displayName = 'stopMonitoring';

    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
    
    setMonitoringStatus({
      status: 'stopped',
      lastCheck: null,
      nextCheck: null,
      error: null,
      checksCompleted: 0,
      changesDetected: 0
    });
    
    // Clear events
    setEvents([]);
    
    // Update the config
    if (onChange) {
      onChange({
        ...monitoringConfig,
        enabled: false
      });
    }
  }, [monitoringConfig, onChange]);
  
  // Handle monitoring config changes
  const handleConfigChange = useCallback((key, value) => {
  // Added display name
  handleConfigChange.displayName = 'handleConfigChange';

    setMonitoringConfig(prev => {
      const newConfig = {
        ...prev,
        [key]: value
      };
      
      // If we're changing the polling interval and monitoring is active,
      // restart the monitoring with the new interval
      if (key === 'pollingInterval' && monitoringStatus.status === 'running') {
        if (monitoringInterval.current) {
          clearInterval(monitoringInterval.current);
        }
        
        monitoringInterval.current = setInterval(
          checkForChanges,
          value * 1000
        );
        
        setMonitoringStatus(prevStatus => ({
          ...prevStatus,
          nextCheck: new Date(Date.now() + value * 1000)
        }));
      }
      
      // Notify the parent of the change if callback provided
      if (onChange) {
        onChange(newConfig);
      }
      
      return newConfig;
    });
  }, [monitoringStatus, checkForChanges, onChange]);
  
  // Save edited config
  const saveConfig = useCallback(() => {
  // Added display name
  saveConfig.displayName = 'saveConfig';

    setEditMode(false);
    
    // If monitoring is running, restart it with the new config
    if (monitoringStatus.status === 'running') {
      pauseMonitoring();
      startMonitoring();
    }
  }, [monitoringStatus, pauseMonitoring, startMonitoring]);
  
  // Format dates for display
  const formatDate = useCallback((date) => {
  // Added display name
  formatDate.displayName = 'formatDate';

    if (!date) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }, []);
  
  // Calculate time until next check
  const calculateTimeUntilNextCheck = useCallback(() => {
  // Added display name
  calculateTimeUntilNextCheck.displayName = 'calculateTimeUntilNextCheck';

    if (!monitoringStatus.nextCheck) return 'N/A';
    
    const now = new Date();
    const nextCheck = new Date(monitoringStatus.nextCheck);
    const diff = Math.max(0, nextCheck - now);
    
    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60));
    
    return `${minutes}m ${seconds}s`;
  }, [monitoringStatus.nextCheck]);
  
  // Clean up the interval when the component unmounts
  useEffect(() => {
    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, []);
  
  // Start monitoring if enabled in the initial config
  useEffect(() => {
    if (monitoringConfig.enabled && monitoringStatus.status === 'stopped') {
      startMonitoring();
    }
  }, [monitoringConfig.enabled, monitoringStatus.status, startMonitoring]);
  
  // Get icon based on event type
  const getEventIcon = (event) => {
  // Added display name
  getEventIcon.displayName = 'getEventIcon';

  // Added display name
  getEventIcon.displayName = 'getEventIcon';

  // Added display name
  getEventIcon.displayName = 'getEventIcon';


    switch (event.type) {
      case 'created':
        return <SuccessIcon color="success" />;
      case 'modified':
        return <InfoIcon color="info" />;
      case 'deleted':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon />;
    }
  };
  
  // Get color based on event type
  const getEventColor = (event) => {
  // Added display name
  getEventColor.displayName = 'getEventColor';

  // Added display name
  getEventColor.displayName = 'getEventColor';

  // Added display name
  getEventColor.displayName = 'getEventColor';


    switch (event.type) {
      case 'created':
        return 'success';
      case 'modified':
        return 'info';
      case 'deleted':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Get label text based on event type
  const getEventLabel = (event) => {
  // Added display name
  getEventLabel.displayName = 'getEventLabel';

  // Added display name
  getEventLabel.displayName = 'getEventLabel';

  // Added display name
  getEventLabel.displayName = 'getEventLabel';


    switch (event.type) {
      case 'created':
        return 'Created';
      case 'modified':
        return 'Modified';
      case 'deleted':
        return 'Deleted';
      default:
        return event.type;
    }
  };
  
  return (
    <MonitoringContainer elevation={1} style={{ height }}>
      <MonitoringHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsActiveIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            File Monitoring System
          </Typography>
          
          {monitoringStatus.status === 'running' && (
            <StatusChip 
              label="Running" 
              size="small" 
              status="running"
              sx={{ ml: 2 }}
            />
          )}
          
          {monitoringStatus.status === 'paused' && (
            <StatusChip 
              label="Paused" 
              size="small" 
              status="paused"
              sx={{ ml: 2 }}
            />
          )}
          
          {monitoringStatus.status === 'stopped' && (
            <StatusChip 
              label="Stopped" 
              size="small" 
              status="stopped"
              sx={{ ml: 2 }}
            />
          )}
          
          {monitoringStatus.status === 'error' && (
            <StatusChip 
              label="Error" 
              size="small" 
              status="error"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        <Box>
          {!editMode ? (
            <Tooltip title="Edit Configuration">
              <IconButton onClick={() => setEditMode(true)} size="small">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Save Configuration">
              <IconButton onClick={saveConfig} size="small" color="primary">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {monitoringStatus.status === 'stopped' && (
            <Tooltip title="Start Monitoring">
              <IconButton onClick={startMonitoring} size="small" color="success">
                <PlayIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {monitoringStatus.status === 'running' && (
            <Tooltip title="Pause Monitoring">
              <IconButton onClick={pauseMonitoring} size="small" color="warning">
                <PauseIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {monitoringStatus.status === 'paused' && (
            <Tooltip title="Resume Monitoring">
              <IconButton onClick={startMonitoring} size="small" color="success">
                <PlayIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {monitoringStatus.status !== 'stopped' && (
            <Tooltip title="Stop Monitoring">
              <IconButton onClick={stopMonitoring} size="small" color="error">
                <StopIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </MonitoringHeader>
      
      <MonitoringContent>
        <ConfigurationSection>
          <Typography variant="subtitle1" gutterBottom>
            Monitoring Configuration
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoringConfig.enabled}
                    onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                    disabled={!editMode && monitoringStatus.status !== 'stopped'}
                  />
                }
                label={monitoringConfig.enabled ? "Monitoring Enabled" : "Monitoring Disabled"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ width: '100%' }}>
                <Typography id="polling-interval-slider" gutterBottom>
                  Polling Interval: {monitoringConfig.pollingInterval} seconds
                </Typography>
                <Slider
                  value={monitoringConfig.pollingInterval}
                  onChange={(e, value) => handleConfigChange('pollingInterval', value)}
                  aria-labelledby="polling-interval-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={5}
                  max={300}
                  disabled={!editMode}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="File Patterns"
                value={monitoringConfig.filePatterns}
                onChange={(e) => handleConfigChange('filePatterns', e.target.value)}
                fullWidth
                size="small"
                helperText="Use wildcards like *.csv or data_*.json"
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoringConfig.includeSubfolders}
                    onChange={(e) => handleConfigChange('includeSubfolders', e.target.checked)}
                    disabled={!editMode}
                  />
                }
                label="Include Subfolders"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Monitor Events
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={monitoringConfig.monitorCreated}
                      onChange={(e) => handleConfigChange('monitorCreated', e.target.checked)}
                      disabled={!editMode}
                      size="small"
                    />
                  }
                  label="Created"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={monitoringConfig.monitorModified}
                      onChange={(e) => handleConfigChange('monitorModified', e.target.checked)}
                      disabled={!editMode}
                      size="small"
                    />
                  }
                  label="Modified"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={monitoringConfig.monitorDeleted}
                      onChange={(e) => handleConfigChange('monitorDeleted', e.target.checked)}
                      disabled={!editMode}
                      size="small"
                    />
                  }
                  label="Deleted"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoringConfig.notifyOnChanges}
                    onChange={(e) => handleConfigChange('notifyOnChanges', e.target.checked)}
                    disabled={!editMode}
                  />
                }
                label="Send Notifications on Changes"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoringConfig.triggerWorkflowOnChanges}
                    onChange={(e) => handleConfigChange('triggerWorkflowOnChanges', e.target.checked)}
                    disabled={!editMode}
                  />
                }
                label="Trigger Workflow on Changes"
              />
            </Grid>
          </Grid>
        </ConfigurationSection>
        
        {monitoringStatus.status !== 'stopped' && (
          <StatusSection>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">
                  Last Check
                </Typography>
                <Typography variant="body1">
                  {formatDate(monitoringStatus.lastCheck)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">
                  Next Check
                </Typography>
                <Typography variant="body1">
                  {monitoringStatus.status === 'running' 
                    ? `In ${calculateTimeUntilNextCheck()}`
                    : 'Monitoring paused'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">
                  Statistics
                </Typography>
                <Typography variant="body1">
                  {monitoringStatus.checksCompleted} checks, 
                  {monitoringStatus.changesDetected} changes
                </Typography>
              </Grid>
              
              {monitoringStatus.status === 'running' && (
                <Grid item xs={12}>
                  <LinearProgress 
                    variant="determinate" 
                    value={
                      monitoringStatus.nextCheck ? 
                      (1 - (new Date(monitoringStatus.nextCheck) - new Date()) / 
                      (monitoringConfig.pollingInterval * 1000)) * 100 : 0
                    }
                    sx={{ mt: 1 }}
                  />
                </Grid>
              )}
            </Grid>
          </StatusSection>
        )}
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1">
              File Change Events
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {events.length === 0 ? (
              <EmptyStateContainer>
                <NotificationsOffIcon fontSize="large" color="disabled" sx={{ mb: 2 }} />
                <Typography variant="h6">No events detected</Typography>
                <Typography variant="body2" color="textSecondary">
                  {monitoringStatus.status === 'stopped' 
                    ? 'Start monitoring to detect file changes'
                    : 'Waiting for file changes...'}
                </Typography>
              </EmptyStateContainer>
            ) : (
              <Box sx={{ p: 1 }}>
                {events.map(event => (
                  <EventCard key={event.id} severity={event.severity}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 1.5 }}>
                          {getEventIcon(event)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1">
                              {getEventLabel(event)} - {event.file.name}
                            </Typography>
                            <Chip 
                              label={getEventLabel(event)} 
                              size="small" 
                              color={getEventColor(event)}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                            Path: {event.file.path}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(event.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      {event.type !== 'deleted' && (
                        <Button size="small" startIcon={<LinkIcon />}>
                          View File
                        </Button>
                      )}
                      {monitoringConfig.triggerWorkflowOnChanges && (
                        <Button size="small" color="primary">
                          Trigger Workflow
                        </Button>
                      )}
                    </CardActions>
                  </EventCard>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </MonitoringContent>
    </MonitoringContainer>
  );
};

FileMonitoringSystem.propTypes = {
  storageType: PropTypes.oneOf(['s3', 'azure', 'sharepoint']),
  containerName: PropTypes.string,
  resourcePath: PropTypes.string,
  credentials: PropTypes.object,
  onChange: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  initialConfig: PropTypes.object,
  onEventsDetected: PropTypes.func
};

export default FileMonitoringSystem;