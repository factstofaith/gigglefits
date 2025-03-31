import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;;
import {
  NotificationsActive as NotificationsActiveIcon,
  PlayArrow as PlayIcon,
  PlayCircle as TriggerIcon,
  Schedule as ScheduleIcon,
  WatchLater as DelayIcon,
  FilterList as FilterIcon,
  AddCircle as AddTriggerIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Done as DoneIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  Sync as SyncIcon,
  ContentPaste as ClipboardIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
;

import FileMonitoringSystem from './FileMonitoringSystem';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, Grid, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Paper, Select, Switch, TextField, Tooltip, Typography, alpha, styled } from '../../design-system';
// Design system import already exists;
// Styled components
const TriggerContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`
}));

const TriggerHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const TriggerContent = styled(Box)({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column'
});

const TriggerSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const TriggerItem = styled(Box)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.light
  }
}));

const EmptyStateContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: 40,
  height: '100%'
});

const StyledChip = styled(Chip)(({ theme, chipColor }) => ({
  backgroundColor: chipColor ? theme.palette[chipColor].main : theme.palette.primary.main,
  color: chipColor ? theme.palette.getContrastText(theme.palette[chipColor].main) : theme.palette.primary.contrastText
}));

/**
 * File Trigger Mechanism Component
 * Allows creating and managing file-based triggers for integration workflows
 * Integrates with FileMonitoringSystem for event detection
 */
const FileTriggerMechanism = ({
  storageType = 's3',
  containerName = '',
  resourcePath = '',
  credentials = {},
  onChange = null,
  height = 500,
  initialTriggers = [],
  onTriggerActivated = null
}) => {
  // Added display name
  FileTriggerMechanism.displayName = 'FileTriggerMechanism';

  // Added display name
  FileTriggerMechanism.displayName = 'FileTriggerMechanism';

  // Added display name
  FileTriggerMechanism.displayName = 'FileTriggerMechanism';

  // Added display name
  FileTriggerMechanism.displayName = 'FileTriggerMechanism';

  // Added display name
  FileTriggerMechanism.displayName = 'FileTriggerMechanism';


  // State for triggers
  const [triggers, setTriggers] = useState(initialTriggers);
  
  // State for current trigger being edited
  const [currentTrigger, setCurrentTrigger] = useState(null);
  
  // State for trigger edit dialog
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for file monitoring panel
  const [monitoringPanelOpen, setMonitoringPanelOpen] = useState(false);
  
  // State for monitoring config
  const [monitoringConfig, setMonitoringConfig] = useState({
    enabled: false,
    pollingInterval: 60,
    filePatterns: '*.*',
    includeSubfolders: true,
    monitorCreated: true,
    monitorModified: true,
    monitorDeleted: true,
    notifyOnChanges: true,
    triggerWorkflowOnChanges: false
  });
  
  // Default trigger template
  const defaultTrigger = {
    id: null,
    name: '',
    description: '',
    type: 'file_created', // file_created, file_modified, file_deleted, scheduled
    enabled: true,
    filePatterns: '*.*',
    source: {
      type: storageType,
      containerName: containerName,
      path: resourcePath
    },
    schedule: {
      frequency: 'hourly', // hourly, daily, weekly, monthly, custom
      customInterval: 60, // in minutes, for custom frequency
      startTime: null,
      daysOfWeek: [1, 2, 3, 4, 5] // 0 = Sunday, 1 = Monday, etc.
    },
    conditions: [],
    actions: {
      triggerFlow: true,
      sendNotification: false,
      executeScript: false
    },
    lastTriggered: null,
    nextTrigger: null,
    created: new Date(),
    modified: new Date()
  };
  
  // Handle file monitoring config change
  const handleMonitoringConfigChange = useCallback((newConfig) => {
  // Added display name
  handleMonitoringConfigChange.displayName = 'handleMonitoringConfigChange';

    setMonitoringConfig(newConfig);
    
    // Notify parent of change if callback provided
    if (onChange) {
      onChange({
        triggers,
        monitoringConfig: newConfig
      });
    }
  }, [triggers, onChange]);
  
  // Handle file events from the monitoring system
  const handleFileEvents = useCallback((events) => {
  // Added display name
  handleFileEvents.displayName = 'handleFileEvents';

    // Process each event
    events.forEach(event => {
      // Check if any triggers match this event
      const matchingTriggers = triggers.filter(trigger => {
        // Check if trigger is enabled
        if (!trigger.enabled) return false;
        
        // Check if trigger type matches event type
        if (
          (event.type === 'created' && trigger.type === 'file_created') ||
          (event.type === 'modified' && trigger.type === 'file_modified') ||
          (event.type === 'deleted' && trigger.type === 'file_deleted')
        ) {
          // Check if file pattern matches
          // In a real implementation, this would use a more sophisticated
          // pattern matching algorithm like minimatch or glob
          if (trigger.filePatterns === '*.*') return true;
          
          // Simple check if file extension matches
          const fileExt = event.file.extension.toLowerCase();
          const patterns = trigger.filePatterns.split(',').map(p => p.trim().toLowerCase());
          
          return patterns.some(pattern => {
            if (pattern === `*.${fileExt}`) return true;
            if (pattern === event.file.name.toLowerCase()) return true;
            return false;
          });
        }
        
        return false;
      });
      
      // Execute matching triggers
      matchingTriggers.forEach(trigger => {
        
        // Update trigger last triggered time
        setTriggers(prev => prev.map(t => {
          if (t.id === trigger.id) {
            return {
              ...t,
              lastTriggered: new Date()
            };
          }
          return t;
        }));
        
        // Call the callback if provided
        if (onTriggerActivated) {
          onTriggerActivated({
            trigger,
            event,
            timestamp: new Date()
          });
        }
      });
    });
  }, [triggers, onTriggerActivated]);
  
  // Open the trigger dialog to create a new trigger
  const handleCreateTrigger = useCallback(() => {
  // Added display name
  handleCreateTrigger.displayName = 'handleCreateTrigger';

    setCurrentTrigger({
      ...defaultTrigger,
      id: Date.now(),
      name: `Trigger ${triggers.length + 1}`
    });
    setTriggerDialogOpen(true);
  }, [triggers, defaultTrigger]);
  
  // Open the trigger dialog to edit an existing trigger
  const handleEditTrigger = useCallback((trigger) => {
  // Added display name
  handleEditTrigger.displayName = 'handleEditTrigger';

    setCurrentTrigger({...trigger});
    setTriggerDialogOpen(true);
  }, []);
  
  // Handle changes to the current trigger being edited
  const handleTriggerChange = useCallback((field, value) => {
  // Added display name
  handleTriggerChange.displayName = 'handleTriggerChange';

    setCurrentTrigger(prev => {
      // Handle nested fields
      if (field.includes('.')) {
        const [section, subfield] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subfield]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  }, []);
  
  // Save the current trigger
  const handleSaveTrigger = useCallback(() => {
  // Added display name
  handleSaveTrigger.displayName = 'handleSaveTrigger';

    // Validate trigger
    if (!currentTrigger.name) {
      setError('Trigger name is required');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedTrigger = {
        ...currentTrigger,
        modified: new Date()
      };
      
      // Update the triggers list
      setTriggers(prev => {
        const existingIndex = prev.findIndex(t => t.id === updatedTrigger.id);
        if (existingIndex >= 0) {
          // Update existing trigger
          const newTriggers = [...prev];
          newTriggers[existingIndex] = updatedTrigger;
          return newTriggers;
        } else {
          // Add new trigger
          return [...prev, updatedTrigger];
        }
      });
      
      // Close the dialog
      setTriggerDialogOpen(false);
      setCurrentTrigger(null);
      setLoading(false);
      
      // Notify parent of change if callback provided
      if (onChange) {
        onChange({
          triggers: [...triggers, updatedTrigger],
          monitoringConfig
        });
      }
    }, 500);
  }, [currentTrigger, triggers, monitoringConfig, onChange]);
  
  // Toggle a trigger's enabled state
  const handleToggleTrigger = useCallback((triggerId) => {
  // Added display name
  handleToggleTrigger.displayName = 'handleToggleTrigger';

    setTriggers(prev => prev.map(trigger => {
      if (trigger.id === triggerId) {
        return {
          ...trigger,
          enabled: !trigger.enabled,
          modified: new Date()
        };
      }
      return trigger;
    }));
    
    // Notify parent of change if callback provided
    if (onChange) {
      const updatedTriggers = triggers.map(trigger => {
        if (trigger.id === triggerId) {
          return {
            ...trigger,
            enabled: !trigger.enabled,
            modified: new Date()
          };
        }
        return trigger;
      });
      
      onChange({
        triggers: updatedTriggers,
        monitoringConfig
      });
    }
  }, [triggers, monitoringConfig, onChange]);
  
  // Delete a trigger
  const handleDeleteTrigger = useCallback((triggerId) => {
  // Added display name
  handleDeleteTrigger.displayName = 'handleDeleteTrigger';

    setTriggers(prev => prev.filter(trigger => trigger.id !== triggerId));
    
    // Notify parent of change if callback provided
    if (onChange) {
      onChange({
        triggers: triggers.filter(trigger => trigger.id !== triggerId),
        monitoringConfig
      });
    }
  }, [triggers, monitoringConfig, onChange]);
  
  // Manually execute a trigger
  const handleExecuteTrigger = useCallback((trigger) => {
  // Added display name
  handleExecuteTrigger.displayName = 'handleExecuteTrigger';

    
    // Update trigger last triggered time
    setTriggers(prev => prev.map(t => {
      if (t.id === trigger.id) {
        return {
          ...t,
          lastTriggered: new Date()
        };
      }
      return t;
    }));
    
    // Call the callback if provided
    if (onTriggerActivated) {
      onTriggerActivated({
        trigger,
        manual: true,
        timestamp: new Date()
      });
    }
  }, [onTriggerActivated]);
  
  // Format date for display
  const formatDate = useCallback((date) => {
  // Added display name
  formatDate.displayName = 'formatDate';

    if (!date) return 'Never';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }, []);
  
  // Get trigger type label
  const getTriggerTypeLabel = useCallback((type) => {
  // Added display name
  getTriggerTypeLabel.displayName = 'getTriggerTypeLabel';

    switch (type) {
      case 'file_created':
        return 'File Created';
      case 'file_modified':
        return 'File Modified';
      case 'file_deleted':
        return 'File Deleted';
      case 'scheduled':
        return 'Scheduled';
      default:
        return type;
    }
  }, []);
  
  // Get trigger type color
  const getTriggerTypeColor = useCallback((type) => {
  // Added display name
  getTriggerTypeColor.displayName = 'getTriggerTypeColor';

    switch (type) {
      case 'file_created':
        return 'success';
      case 'file_modified':
        return 'info';
      case 'file_deleted':
        return 'warning';
      case 'scheduled':
        return 'secondary';
      default:
        return 'default';
    }
  }, []);
  
  // Get schedule description
  const getScheduleDescription = useCallback((schedule) => {
  // Added display name
  getScheduleDescription.displayName = 'getScheduleDescription';

    if (!schedule) return '';
    
    switch (schedule.frequency) {
      case 'hourly':
        return 'Every hour';
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Every week';
      case 'monthly':
        return 'Every month';
      case 'custom':
        return `Every ${schedule.customInterval} minutes`;
      default:
        return schedule.frequency;
    }
  }, []);
  
  // Initialize monitoring configuration if no triggers exist
  useEffect(() => {
    if (triggers.length === 0 && !monitoringConfig.enabled) {
      // If we don't have any triggers, enable file monitoring for created files by default
      setMonitoringConfig(prev => ({
        ...prev,
        enabled: true,
        monitorCreated: true,
        monitorModified: false,
        monitorDeleted: false
      }));
    }
  }, [triggers.length, monitoringConfig.enabled]);
  
  return (
    <TriggerContainer elevation={1} style={{ height }}>
      <TriggerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TriggerIcon sx={{ mr: 1 }} />
          <Typography variant="h6&quot;>
            File Triggers
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Configure File Monitoring">
            <IconButton
              onClick={() => setMonitoringPanelOpen(true)}
              size="small&quot;
              color={monitoringConfig.enabled ? "primary" : "default"}
            >
              <NotificationsActiveIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add Trigger&quot;>
            <IconButton
              onClick={handleCreateTrigger}
              size="small"
              color="primary&quot;
            >
              <AddTriggerIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TriggerHeader>
      
      <TriggerContent>
        <TriggerSection>
          <Box sx={{ display: "flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1&quot;>
              Active Triggers
            </Typography>
            
            <Box>
              <Chip 
                label={`${triggers.filter(t => t.enabled).length} Active`} 
                size="small" 
                color="primary&quot;
                variant="outlined"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`${triggers.length} Total`}

                size="small&quot;
                color="default"
                variant="outlined&quot;
              />
            </Box>
          </Box>
          
          {triggers.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No triggers configured. Click the "+" button to create a new trigger.
            </Alert>
          ) : (
            <Box>
              {triggers.map(trigger => (
                <TriggerItem key={trigger.id} selected={trigger.enabled}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Switch
                        checked={trigger.enabled}
                        onChange={() => handleToggleTrigger(trigger.id)}
                        size="small&quot;
                        sx={{ ml: -1, mr: 0.5 }}
                      />
                      <Typography variant="subtitle1">
                        {trigger.name}
                      </Typography>
                    </Box>
                    
                    <StyledChip
                      label={getTriggerTypeLabel(trigger.type)}
                      size="small&quot;
                      chipColor={getTriggerTypeColor(trigger.type)}
                    />
                  </Box>
                  
                  {trigger.description && (
                    <Typography variant="body2" color="textSecondary&quot; sx={{ mb: 1 }}>
                      {trigger.description}
                    </Typography>
                  )}
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary&quot;>
                        File Pattern: {trigger.filePatterns}
                      </Typography>
                      <Typography variant="body2" color="textSecondary&quot;>
                        Source: {trigger.source.containerName || "N/A'} {trigger.source.path ? `(${trigger.source.path})` : ''}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2&quot; color="textSecondary">
                        Last Triggered: {formatDate(trigger.lastTriggered)}
                      </Typography>
                      {trigger.type === 'scheduled' && (
                        <Typography variant="body2&quot; color="textSecondary">
                          Schedule: {getScheduleDescription(trigger.schedule)}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      size="small&quot;
                      startIcon={<PlayIcon />}
                      onClick={() => handleExecuteTrigger(trigger)}
                      sx={{ mr: 1 }}
                    >
                      Execute Now
                    </Button>
                    
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditTrigger(trigger)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    
                    <Button
                      size="small&quot;
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => handleDeleteTrigger(trigger.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </TriggerItem>
              ))}
            </Box>
          )}
        </TriggerSection>
        
        <TriggerSection>
          <Typography variant="subtitle1&quot; gutterBottom>
            Available Trigger Types
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StorageIcon color="success&quot; sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">
                    File Created
                  </Typography>
                </Box>
                <Typography variant="body2&quot; color="textSecondary">
                  Triggers when a new file is created in the storage location.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant="outlined&quot; sx={{ p: 2, height: "100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EditIcon color="info&quot; sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">
                    File Modified
                  </Typography>
                </Box>
                <Typography variant="body2&quot; color="textSecondary">
                  Triggers when an existing file is modified in the storage location.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant="outlined&quot; sx={{ p: 2, height: "100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DeleteIcon color="warning&quot; sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">
                    File Deleted
                  </Typography>
                </Box>
                <Typography variant="body2&quot; color="textSecondary">
                  Triggers when a file is deleted from the storage location.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant="outlined&quot; sx={{ p: 2, height: "100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon color="secondary&quot; sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">
                    Scheduled
                  </Typography>
                </Box>
                <Typography variant="body2&quot; color="textSecondary">
                  Triggers on a scheduled basis (hourly, daily, weekly, etc.).
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TriggerSection>
      </TriggerContent>
      
      {/* Trigger Edit Dialog */}
      <Dialog
        open={triggerDialogOpen}
        onClose={() => setTriggerDialogOpen(false)}
        maxWidth="md&quot;
        fullWidth
      >
        <DialogTitle>
          {currentTrigger?.id ? `Edit Trigger: ${currentTrigger.name}` : "Create New Trigger'}
        </DialogTitle>
        
        <DialogContent dividers>
          {error && (
            <Alert severity="error&quot; sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {currentTrigger && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Trigger Name"
                  value={currentTrigger.name}
                  onChange={(e) => handleTriggerChange('name', e.target.value)}
                  fullWidth
                  required
                  margin="dense&quot;
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={currentTrigger.type}
                    onChange={(e) => handleTriggerChange('type', e.target.value)}
                    label="Trigger Type&quot;
                  >
                    <MenuItem value="file_created">File Created</MenuItem>
                    <MenuItem value="file_modified&quot;>File Modified</MenuItem>
                    <MenuItem value="file_deleted">File Deleted</MenuItem>
                    <MenuItem value="scheduled&quot;>Scheduled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={currentTrigger.description}
                  onChange={(e) => handleTriggerChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  margin="dense&quot;
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Source Configuration
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense&quot;>
                  <InputLabel>Storage Type</InputLabel>
                  <Select
                    value={currentTrigger.source.type}
                    onChange={(e) => handleTriggerChange("source.type', e.target.value)}
                    label="Storage Type&quot;
                  >
                    <MenuItem value="s3">AWS S3</MenuItem>
                    <MenuItem value="azure&quot;>Azure Blob Storage</MenuItem>
                    <MenuItem value="sharepoint">SharePoint</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Container Name&quot;
                  value={currentTrigger.source.containerName}
                  onChange={(e) => handleTriggerChange("source.containerName', e.target.value)}
                  fullWidth
                  margin="dense&quot;
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Path"
                  value={currentTrigger.source.path}
                  onChange={(e) => handleTriggerChange('source.path', e.target.value)}
                  fullWidth
                  margin="dense&quot;
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="File Patterns"
                  value={currentTrigger.filePatterns}
                  onChange={(e) => handleTriggerChange('filePatterns', e.target.value)}
                  fullWidth
                  margin="dense&quot;
                  helperText="Use wildcards like *.csv or data_*.json (comma-separated)"
                />
              </Grid>
              
              {currentTrigger.type === 'scheduled' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1&quot; gutterBottom>
                      Schedule Configuration
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Frequency</InputLabel>
                      <Select
                        value={currentTrigger.schedule.frequency}
                        onChange={(e) => handleTriggerChange('schedule.frequency', e.target.value)}
                        label="Frequency&quot;
                      >
                        <MenuItem value="hourly">Hourly</MenuItem>
                        <MenuItem value="daily&quot;>Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly&quot;>Monthly</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {currentTrigger.schedule.frequency === 'custom' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Interval (minutes)&quot;
                        value={currentTrigger.schedule.customInterval}
                        onChange={(e) => handleTriggerChange("schedule.customInterval', parseInt(e.target.value, 10) || 60)}
                        fullWidth
                        margin="dense&quot;
                        type="number"
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                  )}
                </>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1&quot; gutterBottom>
                  Actions
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentTrigger.actions.triggerFlow}
                      onChange={(e) => handleTriggerChange("actions.triggerFlow', e.target.checked)}
                    />
                  }
                  label="Trigger Flow Execution&quot;
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentTrigger.actions.sendNotification}
                      onChange={(e) => handleTriggerChange("actions.sendNotification', e.target.checked)}
                    />
                  }
                  label="Send Notification&quot;
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentTrigger.actions.executeScript}
                      onChange={(e) => handleTriggerChange("actions.executeScript', e.target.checked)}
                    />
                  }
                  label="Execute Script&quot;
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setTriggerDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTrigger}
            variant="contained"
            color="primary&quot;
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            Save Trigger
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* File Monitoring Panel */}
      <Dialog
        open={monitoringPanelOpen}
        onClose={() => setMonitoringPanelOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, height: 600 }}>
          <FileMonitoringSystem
            storageType={storageType}
            containerName={containerName}
            resourcePath={resourcePath}
            credentials={credentials}
            height="100%&quot;
            initialConfig={monitoringConfig}
            onChange={handleMonitoringConfigChange}
            onEventsDetected={handleFileEvents}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMonitoringPanelOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </TriggerContainer>
  );
};

FileTriggerMechanism.propTypes = {
  storageType: PropTypes.oneOf(["s3', 'azure', 'sharepoint']),
  containerName: PropTypes.string,
  resourcePath: PropTypes.string,
  credentials: PropTypes.object,
  onChange: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  initialTriggers: PropTypes.array,
  onTriggerActivated: PropTypes.func
};

export default FileTriggerMechanism;