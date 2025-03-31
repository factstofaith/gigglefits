import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {Typography, MuiBox as MuiBox, Grid, Card, CardContent, Chip, CircularProgress, MuiLinearProgress as MuiLinearProgress, Tabs, MuiTab as MuiTab, Button, IconButton, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Badge, Tooltip} from '../../design-system/legacy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FilterListIcon from '@mui/icons-material/FilterList';
import MuiLinearProgress from '@mui/material/LinearProgress';
import MuiTab from '@mui/material/Tab';
import MuiBox from '@mui/material/Box';

/**
 * Component for monitoring and managing active integrations
 * 
 * This dashboard provides real-time monitoring of active integration flows,
 * including statistics, execution status, and management controls.
 */
const IntegrationMonitoringDashboard = ({
  integrations,
  onRefresh,
  onStart,
  onStop,
  onPause,
  onViewDetails,
  onViewLogs,
  loading = false
}) => {
  // Added display name
  IntegrationMonitoringDashboard.displayName = 'IntegrationMonitoringDashboard';

  // Added display name
  IntegrationMonitoringDashboard.displayName = 'IntegrationMonitoringDashboard';

  // Added display name
  IntegrationMonitoringDashboard.displayName = 'IntegrationMonitoringDashboard';

  // Added display name
  IntegrationMonitoringDashboard.displayName = 'IntegrationMonitoringDashboard';

  // Added display name
  IntegrationMonitoringDashboard.displayName = 'IntegrationMonitoringDashboard';


  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuIntegrationId, setMenuIntegrationId] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    status: {
      running: true,
      paused: true,
      failed: true,
      completed: true,
      inactive: false
    }
  });
  
  // Handle integration selection
  const handleIntegrationSelect = (integration) => {
  // Added display name
  handleIntegrationSelect.displayName = 'handleIntegrationSelect';

  // Added display name
  handleIntegrationSelect.displayName = 'handleIntegrationSelect';

  // Added display name
  handleIntegrationSelect.displayName = 'handleIntegrationSelect';

  // Added display name
  handleIntegrationSelect.displayName = 'handleIntegrationSelect';

  // Added display name
  handleIntegrationSelect.displayName = 'handleIntegrationSelect';


    setSelectedIntegration(integration);
    setActiveTab('details');
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setActiveTab(newValue);
  };
  
  // Handle menu open
  const handleMenuOpen = (event, integrationId) => {
  // Added display name
  handleMenuOpen.displayName = 'handleMenuOpen';

  // Added display name
  handleMenuOpen.displayName = 'handleMenuOpen';

  // Added display name
  handleMenuOpen.displayName = 'handleMenuOpen';

  // Added display name
  handleMenuOpen.displayName = 'handleMenuOpen';

  // Added display name
  handleMenuOpen.displayName = 'handleMenuOpen';


    setMenuAnchorEl(event.currentTarget);
    setMenuIntegrationId(integrationId);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';

  // Added display name
  handleMenuClose.displayName = 'handleMenuClose';


    setMenuAnchorEl(null);
    setMenuIntegrationId(null);
  };
  
  // Handle filter menu
  const handleFilterMenuOpen = (event) => {
  // Added display name
  handleFilterMenuOpen.displayName = 'handleFilterMenuOpen';

  // Added display name
  handleFilterMenuOpen.displayName = 'handleFilterMenuOpen';

  // Added display name
  handleFilterMenuOpen.displayName = 'handleFilterMenuOpen';

  // Added display name
  handleFilterMenuOpen.displayName = 'handleFilterMenuOpen';

  // Added display name
  handleFilterMenuOpen.displayName = 'handleFilterMenuOpen';


    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
  // Added display name
  handleFilterMenuClose.displayName = 'handleFilterMenuClose';

  // Added display name
  handleFilterMenuClose.displayName = 'handleFilterMenuClose';

  // Added display name
  handleFilterMenuClose.displayName = 'handleFilterMenuClose';

  // Added display name
  handleFilterMenuClose.displayName = 'handleFilterMenuClose';

  // Added display name
  handleFilterMenuClose.displayName = 'handleFilterMenuClose';


    setFilterAnchorEl(null);
  };
  
  // Toggle status filter
  const handleToggleStatusFilter = (status) => {
  // Added display name
  handleToggleStatusFilter.displayName = 'handleToggleStatusFilter';

  // Added display name
  handleToggleStatusFilter.displayName = 'handleToggleStatusFilter';

  // Added display name
  handleToggleStatusFilter.displayName = 'handleToggleStatusFilter';

  // Added display name
  handleToggleStatusFilter.displayName = 'handleToggleStatusFilter';

  // Added display name
  handleToggleStatusFilter.displayName = 'handleToggleStatusFilter';


    setFilters(prev => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: !prev.status[status]
      }
    }));
  };
  
  // Get filtered integrations
  const filteredIntegrations = useMemo(() => {
  // Added display name
  filteredIntegrations.displayName = 'filteredIntegrations';

    if (!integrations) return [];
    
    return integrations.filter(integration => {
      // Status filter
      if (!filters.status[integration.status]) {
        return false;
      }
      
      return true;
    });
  }, [integrations, filters]);
  
  // Get statistics
  const statistics = useMemo(() => {
  // Added display name
  statistics.displayName = 'statistics';

    if (!integrations) {
      return {
        total: 0,
        running: 0,
        paused: 0,
        failed: 0,
        completed: 0,
        inactive: 0,
        successRate: 0,
        averageDuration: 0
      };
    }
    
    const stats = {
      total: integrations.length,
      running: integrations.filter(i => i.status === 'running').length,
      paused: integrations.filter(i => i.status === 'paused').length,
      failed: integrations.filter(i => i.status === 'failed').length,
      completed: integrations.filter(i => i.status === 'completed').length,
      inactive: integrations.filter(i => i.status === 'inactive').length
    };
    
    // Calculate success rate
    const completed = stats.completed + stats.failed;
    stats.successRate = completed > 0 ? (stats.completed / completed) * 100 : 0;
    
    // Calculate average duration
    const durationsMs = integrations
      .filter(i => i.lastRun && i.lastRun.duration)
      .map(i => i.lastRun.duration);
      
    stats.averageDuration = durationsMs.length > 0 
      ? durationsMs.reduce((sum, duration) => sum + duration, 0) / durationsMs.length
      : 0;
    
    return stats;
  }, [integrations]);
  
  // Get status chip
  const getStatusChip = (status) => {
  // Added display name
  getStatusChip.displayName = 'getStatusChip';

  // Added display name
  getStatusChip.displayName = 'getStatusChip';

  // Added display name
  getStatusChip.displayName = 'getStatusChip';

  // Added display name
  getStatusChip.displayName = 'getStatusChip';

  // Added display name
  getStatusChip.displayName = 'getStatusChip';


    switch (status) {
      case 'running':
        return <Chip size="small&quot; color="primary" label="Running&quot; />;
      case "paused':
        return <Chip size="small&quot; color="warning" label="Paused&quot; />;
      case "failed':
        return <Chip size="small&quot; color="error" label="Failed&quot; />;
      case "completed':
        return <Chip size="small&quot; color="success" label="Completed&quot; />;
      case "inactive':
        return <Chip size="small&quot; color="default" label="Inactive&quot; />;
      default:
        return <Chip size="small" label={status} />;
    }
  };
  
  // Format duration
  const formatDuration = (ms) => {
  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';

  // Added display name
  formatDuration.displayName = 'formatDuration';


    if (!ms) return '—';
    
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };
  
  // Format date
  const formatDate = (dateString) => {
  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';


    if (!dateString) return '—';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Render statistics
  const renderStatistics = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
              Total Integrations
            </Typography>
            <Typography variant="h4&quot;>
              {statistics.total}
            </Typography>
            <MuiBox sx={{ mt: 1 }}>
              <Chip 
                size="small" 
                label={`${statistics.running} Running`} 
                color="primary&quot;
                sx={{ mr: 0.5 }}
              />
              {statistics.failed > 0 && (
                <Chip 
                  size="small" 
                  label={`${statistics.failed} Failed`} 
                  color="error&quot;
                />
              )}
            </MuiBox>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary&quot; gutterBottom>
              Success Rate
            </Typography>
            <MuiBox sx={{ display: "flex', alignItems: 'flex-end' }}>
              <Typography variant="h4&quot;>
                {statistics.successRate.toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary&quot; sx={{ mb: 0.5, ml: 1 }}>
                of {statistics.completed + statistics.failed} runs
              </Typography>
            </MuiBox>
            <MuiBox sx={{ mt: 1 }}>
              <MuiLinearProgress
                variant="determinate"
                value={statistics.successRate}
                sx={{ height: 8, borderRadius: 1 }}
                color="success&quot;
              />
            </MuiBox>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary&quot; gutterBottom>
              Avg. Execution Time
            </Typography>
            <Typography variant="h4">
              {formatDuration(statistics.averageDuration)}
            </Typography>
            <Typography variant="body2&quot; color="text.secondary" sx={{ mt: 1 }}>
              Based on {integrations?.filter(i => i.lastRun?.duration).length || 0} executions
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
              Status
            </Typography>
            <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Chip 
                size="small&quot; 
                label={`${statistics.running} Running`} 
                color="primary"
              />
              <Chip 
                size="small&quot; 
                label={`${statistics.paused} Paused`} 
                color="warning"
              />
              <Chip 
                size="small&quot; 
                label={`${statistics.failed} Failed`} 
                color="error"
              />
              <Chip 
                size="small&quot; 
                label={`${statistics.completed} Completed`} 
                color="success"
              />
              {statistics.inactive > 0 && (
                <Chip 
                  size="small&quot; 
                  label={`${statistics.inactive} Inactive`} 
                  color="default"
                />
              )}
            </MuiBox>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  // Render filter menu
  const renderFilterMenu = () => (
    <Menu
      anchorEl={filterAnchorEl}
      open={Boolean(filterAnchorEl)}
      onClose={handleFilterMenuClose}
    >
      <Typography variant="subtitle2&quot; sx={{ p: 2, pb: 1 }}>
        Filter by Status
      </Typography>
      
      <MenuItem 
        onClick={() => handleToggleStatusFilter("running')}
        dense
      >
        <Chip 
          size="small&quot; 
          label="Running" 
          color={filters.status.running ? 'primary' : 'default'}
          sx={{ mr: 1 }}
        />
        <ToggleOnIcon 
          color={filters.status.running ? 'primary' : 'disabled'} 
          fontSize="small&quot;
        />
      </MenuItem>
      
      <MenuItem 
        onClick={() => handleToggleStatusFilter("paused')}
        dense
      >
        <Chip 
          size="small&quot; 
          label="Paused" 
          color={filters.status.paused ? 'warning' : 'default'}
          sx={{ mr: 1 }}
        />
        <ToggleOnIcon 
          color={filters.status.paused ? 'warning' : 'disabled'} 
          fontSize="small&quot;
        />
      </MenuItem>
      
      <MenuItem 
        onClick={() => handleToggleStatusFilter("failed')}
        dense
      >
        <Chip 
          size="small&quot; 
          label="Failed" 
          color={filters.status.failed ? 'error' : 'default'}
          sx={{ mr: 1 }}
        />
        <ToggleOnIcon 
          color={filters.status.failed ? 'error' : 'disabled'} 
          fontSize="small&quot;
        />
      </MenuItem>
      
      <MenuItem 
        onClick={() => handleToggleStatusFilter("completed')}
        dense
      >
        <Chip 
          size="small&quot; 
          label="Completed" 
          color={filters.status.completed ? 'success' : 'default'}
          sx={{ mr: 1 }}
        />
        <ToggleOnIcon 
          color={filters.status.completed ? 'success' : 'disabled'} 
          fontSize="small&quot;
        />
      </MenuItem>
      
      <MenuItem 
        onClick={() => handleToggleStatusFilter("inactive')}
        dense
      >
        <Chip 
          size="small&quot; 
          label="Inactive" 
          color={filters.status.inactive ? 'default' : 'default'}
          sx={{ mr: 1 }}
        />
        <ToggleOnIcon 
          color={filters.status.inactive ? 'primary' : 'disabled'} 
          fontSize="small&quot;
        />
      </MenuItem>
    </Menu>
  );
  
  // Render integrations table
  const renderIntegrationsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Run</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Errors</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <CircularProgress size={24} sx={{ my: 2 }} />
              </TableCell>
            </TableRow>
          ) : filteredIntegrations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center&quot;>
                <Typography color="text.secondary">
                  No integrations found matching the current filters
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredIntegrations.map(integration => (
              <TableRow 
                key={integration.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleIntegrationSelect(integration)}
              >
                <TableCell>
                  <Typography variant="body2&quot; fontWeight="medium">
                    {integration.name}
                  </Typography>
                  <Typography variant="caption&quot; color="text.secondary">
                    {integration.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(integration.status)}
                </TableCell>
                <TableCell>
                  {integration.lastRun ? (
                    <Typography variant="body2&quot;>
                      {formatDate(integration.lastRun.timestamp)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary&quot;>
                      Never run
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {integration.lastRun?.duration ? (
                    <Typography variant="body2">
                      {formatDuration(integration.lastRun.duration)}
                    </Typography>
                  ) : (
                    <Typography variant="body2&quot; color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {integration.errorCount > 0 ? (
                    <Chip 
                      size="small&quot; 
                      color="error" 
                      icon={<ErrorIcon />} 
                      label={integration.errorCount} 
                    />
                  ) : (
                    <Chip 
                      size="small&quot; 
                      color="success" 
                      icon={<CheckCircleIcon />} 
                      label="0&quot; 
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <MuiBox sx={{ display: 'flex' }}>
                    {integration.status === 'running' ? (
                      <Tooltip title="Pause Integration&quot;>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPause && onPause(integration.id);
                          }}
                        >
                          <PauseIcon fontSize="small&quot; />
                        </IconButton>
                      </Tooltip>
                    ) : integration.status === "paused' ? (
                      <Tooltip title="Resume Integration&quot;>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStart && onStart(integration.id);
                          }}
                        >
                          <PlayArrowIcon fontSize="small&quot; />
                        </IconButton>
                      </Tooltip>
                    ) : integration.status !== "inactive' ? (
                      <Tooltip title="Stop Integration&quot;>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStop && onStop(integration.id);
                          }}
                        >
                          <StopIcon fontSize="small&quot; />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Start Integration">
                        <IconButton 
                          size="small&quot;
                          onClick={(e) => {
                            e.stopPropagation();
                            onStart && onStart(integration.id);
                          }}
                        >
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="View Logs&quot;>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewLogs && onViewLogs(integration.id);
                        }}
                      >
                        <TimelineIcon fontSize="small&quot; />
                      </IconButton>
                    </Tooltip>
                    
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, integration.id);
                      }}
                    >
                      <MoreVertIcon fontSize="small&quot; />
                    </IconButton>
                  </MuiBox>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // Render integration details
  const renderIntegrationDetails = () => {
  // Added display name
  renderIntegrationDetails.displayName = "renderIntegrationDetails';

  // Added display name
  renderIntegrationDetails.displayName = 'renderIntegrationDetails';

  // Added display name
  renderIntegrationDetails.displayName = 'renderIntegrationDetails';

  // Added display name
  renderIntegrationDetails.displayName = 'renderIntegrationDetails';

  // Added display name
  renderIntegrationDetails.displayName = 'renderIntegrationDetails';


    if (!selectedIntegration) {
      return (
        <MuiBox sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary&quot;>
            Select an integration to view details
          </Typography>
        </MuiBox>
      );
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MuiBox sx={{ display: "flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <MuiBox>
              <Typography variant="h5&quot; gutterBottom>
                {selectedIntegration.name}
              </Typography>
              <Typography variant="body2" color="text.secondary&quot; paragraph>
                {selectedIntegration.description}
              </Typography>
              
              <MuiBox sx={{ display: "flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {getStatusChip(selectedIntegration.status)}
                
                {selectedIntegration.tags?.map(tag => (
                  <Chip 
                    key={tag}
                    size="small&quot; 
                    label={tag} 
                    variant="outlined"
                  />
                ))}
              </MuiBox>
            </MuiBox>
            
            <MuiBox>
              <Button 
                variant="outlined&quot;
                startIcon={<OpenInNewIcon />}
                onClick={() => onViewDetails && onViewDetails(selectedIntegration.id)}
                sx={{ mr: 1 }}
              >
                View Details
              </Button>
              
              {selectedIntegration.status === "running' ? (
                <Button 
                  variant="contained&quot;
                  color="warning"
                  startIcon={<PauseIcon />}
                  onClick={() => onPause && onPause(selectedIntegration.id)}
                >
                  Pause
                </Button>
              ) : selectedIntegration.status === 'paused' ? (
                <Button 
                  variant="contained&quot;
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => onStart && onStart(selectedIntegration.id)}
                >
                  Resume
                </Button>
              ) : selectedIntegration.status !== 'inactive' ? (
                <Button 
                  variant="contained&quot;
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={() => onStop && onStop(selectedIntegration.id)}
                >
                  Stop
                </Button>
              ) : (
                <Button 
                  variant="contained&quot;
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => onStart && onStart(selectedIntegration.id)}
                >
                  Start
                </Button>
              )}
            </MuiBox>
          </MuiBox>
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1&quot; gutterBottom>
                Execution Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary&quot; gutterBottom>
                    Last Run
                  </Typography>
                  <Typography variant="body2">
                    {selectedIntegration.lastRun ? 
                      formatDate(selectedIntegration.lastRun.timestamp) : 
                      'Never'
                    }
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
                    Last Duration
                  </Typography>
                  <Typography variant="body2&quot;>
                    {selectedIntegration.lastRun?.duration ? 
                      formatDuration(selectedIntegration.lastRun.duration) : 
                      "—'
                    }
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="body2&quot;>
                    {selectedIntegration.successRate ? 
                      `${selectedIntegration.successRate.toFixed(0)}%` : 
                      "—'
                    }
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
                    Errors
                  </Typography>
                  <Typography variant="body2&quot;>
                    {selectedIntegration.errorCount || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary&quot; gutterBottom>
                    Total Runs
                  </Typography>
                  <Typography variant="body2">
                    {selectedIntegration.runCount || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
                    Avg. Duration
                  </Typography>
                  <Typography variant="body2&quot;>
                    {selectedIntegration.avgDuration ? 
                      formatDuration(selectedIntegration.avgDuration) : 
                      "—'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1&quot; gutterBottom>
                Configuration
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary&quot; gutterBottom>
                    Type
                  </Typography>
                  <Typography variant="body2">
                    {selectedIntegration.type || '—'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
                    Schedule
                  </Typography>
                  <Typography variant="body2&quot;>
                    {selectedIntegration.schedule || "Manual'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
                    Created
                  </Typography>
                  <Typography variant="body2&quot;>
                    {formatDate(selectedIntegration.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary&quot; gutterBottom>
                    Modified
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedIntegration.updatedAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
                    Source
                  </Typography>
                  <Typography variant="body2&quot;>
                    {selectedIntegration.source || "—'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2&quot; color="text.secondary" gutterBottom>
                    Destination
                  </Typography>
                  <Typography variant="body2&quot;>
                    {selectedIntegration.destination || "—'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1&quot; gutterBottom>
                Recent Execution History
              </Typography>
              
              {selectedIntegration.history?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Records</TableCell>
                        <TableCell>Errors</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedIntegration.history.map((run, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(run.timestamp)}</TableCell>
                          <TableCell>{getStatusChip(run.status)}</TableCell>
                          <TableCell>{formatDuration(run.duration)}</TableCell>
                          <TableCell>
                            {run.recordCount !== undefined ? run.recordCount : '—'}
                          </TableCell>
                          <TableCell>
                            {run.errorCount > 0 ? (
                              <Chip 
                                size="small&quot; 
                                color="error" 
                                label={run.errorCount} 
                              />
                            ) : (
                              <Chip 
                                size="small&quot; 
                                color="success" 
                                label="0&quot; 
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <MuiBox sx={{ textAlign: 'center', py: 2 }}>
                  <Typography color="text.secondary&quot;>
                    No execution history available
                  </Typography>
                </MuiBox>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  return (
    <div>
      <MuiBox sx={{ mb: 3, display: "flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5&quot;>
          Integration Monitoring Dashboard
        </Typography>
        
        <MuiBox>
          <Button 
            startIcon={<FilterListIcon />}
            variant="outlined"
            onClick={handleFilterMenuOpen}
            sx={{ mr: 1 }}
          >
            Filter
          </Button>
          <Button 
            startIcon={<RefreshIcon />}
            variant="outlined&quot;
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </MuiBox>
      </MuiBox>
      
      <MuiBox sx={{ mb: 3 }}>
        {renderStatistics()}
      </MuiBox>
      
      <MuiBox sx={{ borderBottom: 1, borderColor: "divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <MuiTab label="Overview&quot; value="overview" />
          <MuiTab 
            label="Details&quot; 
            value="details" 
            disabled={!selectedIntegration}
          />
        </Tabs>
      </MuiBox>
      
      <MuiBox>
        {activeTab === 'overview' && renderIntegrationsTable()}
        {activeTab === 'details' && renderIntegrationDetails()}
      </MuiBox>
      
      {/* Integration action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            onViewDetails && onViewDetails(menuIntegrationId);
            handleMenuClose();
          }}
        >
          View Details
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onViewLogs && onViewLogs(menuIntegrationId);
            handleMenuClose();
          }}
        >
          View Logs
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            handleMenuClose();
          }}
        >
          Edit Configuration
        </MenuItem>
      </Menu>
      
      {renderFilterMenu()}
    </div>
  );
};

IntegrationMonitoringDashboard.propTypes = {
  integrations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.oneOf(['running', 'paused', 'failed', 'completed', 'inactive']).isRequired,
      type: PropTypes.string,
      source: PropTypes.string,
      destination: PropTypes.string,
      schedule: PropTypes.string,
      lastRun: PropTypes.shape({
        timestamp: PropTypes.string,
        status: PropTypes.string,
        duration: PropTypes.number,
        recordCount: PropTypes.number,
        errorCount: PropTypes.number
      }),
      runCount: PropTypes.number,
      errorCount: PropTypes.number,
      successRate: PropTypes.number,
      avgDuration: PropTypes.number,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
      history: PropTypes.arrayOf(
        PropTypes.shape({
          timestamp: PropTypes.string,
          status: PropTypes.string,
          duration: PropTypes.number,
          recordCount: PropTypes.number,
          errorCount: PropTypes.number
        })
      )
    })
  ),
  onRefresh: PropTypes.func,
  onStart: PropTypes.func,
  onStop: PropTypes.func,
  onPause: PropTypes.func,
  onViewDetails: PropTypes.func,
  onViewLogs: PropTypes.func,
  loading: PropTypes.bool
};

export default IntegrationMonitoringDashboard;