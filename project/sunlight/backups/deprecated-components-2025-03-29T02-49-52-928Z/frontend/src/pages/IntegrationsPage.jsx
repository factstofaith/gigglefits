// IntegrationsPage.jsx
// -----------------------------------------------------------------------------
// Integrations page with improved architecture

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {MuiBox as MuiBox, Typography, Button, Card, Chip, TextField, Select, Menu, Grid, Table, Dialog, useTheme} from '../design-system';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  ContentCopy as CloneIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  Sort as SortIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Import our context and components
import { useIntegration } from '@contexts/IntegrationContext';
import { useTenant } from '@contexts/TenantContext';
import ResourceLoader from '@components/common/ResourceLoader';
import IntegrationCreationDialog from '@components/integration/IntegrationCreationDialog';
import IntegrationHealthBar from '@components/common/IntegrationHealthBar';
import IntegrationStatsBar from '@components/common/IntegrationStatsBar';
import { MuiBox, Tab } from '../design-system';
// Design system import already exists;
;
;

// Integration status chip component
const StatusChip = ({ status }) => {
  // Added display name
  StatusChip.displayName = 'StatusChip';

  // Added display name
  StatusChip.displayName = 'StatusChip';

  // Added display name
  StatusChip.displayName = 'StatusChip';

  // Added display name
  StatusChip.displayName = 'StatusChip';

  // Added display name
  StatusChip.displayName = 'StatusChip';


  const getStatusColor = () => {
  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';

  // Added display name
  getStatusColor.displayName = 'getStatusColor';


    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={status || 'Unknown'} 
      color={getStatusColor()} 
      size="small&quot; 
      variant="outlined" 
    />
  );
};

// Integration card view item
const IntegrationCard = ({ integration, onAction }) => {
  // Added display name
  IntegrationCard.displayName = 'IntegrationCard';

  // Added display name
  IntegrationCard.displayName = 'IntegrationCard';

  // Added display name
  IntegrationCard.displayName = 'IntegrationCard';

  // Added display name
  IntegrationCard.displayName = 'IntegrationCard';

  // Added display name
  IntegrationCard.displayName = 'IntegrationCard';


  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
  // Added display name
  handleCloseMenu.displayName = 'handleCloseMenu';

  // Added display name
  handleCloseMenu.displayName = 'handleCloseMenu';

  // Added display name
  handleCloseMenu.displayName = 'handleCloseMenu';

  // Added display name
  handleCloseMenu.displayName = 'handleCloseMenu';

  // Added display name
  handleCloseMenu.displayName = 'handleCloseMenu';


    setAnchorEl(null);
  };

  const handleAction = action => {
    handleCloseMenu();
    onAction(action, integration);
  };

  // Calculate last run time display
  const getLastRunDisplay = () => {
  // Added display name
  getLastRunDisplay.displayName = 'getLastRunDisplay';

  // Added display name
  getLastRunDisplay.displayName = 'getLastRunDisplay';

  // Added display name
  getLastRunDisplay.displayName = 'getLastRunDisplay';

  // Added display name
  getLastRunDisplay.displayName = 'getLastRunDisplay';

  // Added display name
  getLastRunDisplay.displayName = 'getLastRunDisplay';


    if (!integration.lastRun) return 'Never';

    const lastRunDate = new Date(integration.lastRun);
    const now = new Date();
    const diffMs = now - lastRunDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Recently';
    }
  };

  return (
    <Card
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <MuiBox padding="lg&quot; display="flex" flexDirection="column&quot; flexGrow={1}>
        <MuiBox display="flex" justifyContent="space-between&quot; marginBottom="md">
          <Typography 
            variant="h6&quot; 
            style={{ 
              flexGrow: 1,
              whiteSpace: "nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {integration.name}
          </Typography>
          <StatusChip status={integration.status} />
        </MuiBox>

        <Typography
          variant="body2&quot;
          color="textSecondary"
          marginBottom="md&quot;
          style={{
            height: "60px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {integration.description || 'No description provided.'}
        </Typography>

        <MuiBox marginTop="md&quot;>
          <IntegrationHealthBar health={integration.health || 0} size="small" />
        </MuiBox>

        <MuiBox display="flex&quot; justifyContent="space-between" marginTop="md&quot;>
          <Typography variant="caption" color="textSecondary&quot;>
            Last run: {getLastRunDisplay()}
          </Typography>
          <Typography variant="caption" color="textSecondary&quot;>
            Success rate: {integration.successRate || 0}%
          </Typography>
        </MuiBox>
      </MuiBox>

      <MuiBox 
        padding="md" 
        display="flex&quot; 
        alignItems="center" 
        borderTop="1px solid&quot; 
        borderColor="gray.100"
      >
        <Button 
          size="small&quot; 
          variant="secondary" 
          startIcon={<EditIcon />} 
          onClick={() => handleAction('edit')}
          marginRight="xs&quot;
        >
          Edit
        </Button>
        <Button 
          size="small" 
          variant="secondary&quot; 
          startIcon={<RunIcon />} 
          onClick={() => handleAction("run')}
        >
          Run
        </Button>
        
        <MuiBox flexGrow={1} />
        
        <MuiBox 
          as="button&quot;
          onClick={handleOpenMenu}
          aria-label="More actions"
          display="flex&quot;
          alignItems="center"
          justifyContent="center&quot;
          padding="xs"
          borderRadius="50%&quot;
          bgcolor="transparent"
          border="none&quot;
          cursor="pointer"
          style={{ 
            width: '32px', 
            height: '32px',
            ':hover': { bgcolor: 'gray.100' } 
          }}
        >
          <MoreVertIcon fontSize="small&quot; />
        </MuiBox>

        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleCloseMenu}
        >
          <Menu.Item onClick={() => handleAction("history')}>
            <MuiBox display="flex&quot; alignItems="center">
              <MuiBox marginRight="sm&quot;>
                <HistoryIcon fontSize="small" />
              </MuiBox>
              <Typography>View History</Typography>
            </MuiBox>
          </Menu.Item>
          
          <Menu.Item onClick={() => handleAction('schedule')}>
            <MuiBox display="flex&quot; alignItems="center">
              <MuiBox marginRight="sm&quot;>
                <ScheduleIcon fontSize="small" />
              </MuiBox>
              <Typography>Configure Schedule</Typography>
            </MuiBox>
          </Menu.Item>
          
          <MuiBox height="1px&quot; bgcolor="gray.200" width="100%&quot; margin="xs 0" />
          
          <Menu.Item onClick={() => handleAction('clone')}>
            <MuiBox display="flex&quot; alignItems="center">
              <MuiBox marginRight="sm&quot;>
                <CloneIcon fontSize="small" />
              </MuiBox>
              <Typography>Clone</Typography>
            </MuiBox>
          </Menu.Item>
          
          <Menu.Item onClick={() => handleAction('delete')}>
            <MuiBox display="flex&quot; alignItems="center">
              <MuiBox marginRight="sm&quot;>
                <DeleteIcon fontSize="small" />
              </MuiBox>
              <Typography>Delete</Typography>
            </MuiBox>
          </Menu.Item>
        </Menu>
      </MuiBox>
    </Card>
  );
};

/**
 * Integrations page with improved architecture
 */
const IntegrationsPage = () => {
  // Added display name
  IntegrationsPage.displayName = 'IntegrationsPage';

  // Added display name
  IntegrationsPage.displayName = 'IntegrationsPage';

  // Added display name
  IntegrationsPage.displayName = 'IntegrationsPage';

  // Added display name
  IntegrationsPage.displayName = 'IntegrationsPage';

  // Added display name
  IntegrationsPage.displayName = 'IntegrationsPage';


  const navigate = useNavigate();

  // Get integration context
  const { loadAvailableNodeTypes, createIntegration, loadIntegration, runIntegration } =
    useIntegration();

  // Get tenant context
  const { selectedTenant } = useTenant();

  // Local state
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState('desc');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // Mock data for integrations (would be loaded from API in real implementation)
  const fetchIntegrations = useCallback(async () => {
  // Added display name
  fetchIntegrations.displayName = 'fetchIntegrations';

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the API
      // const response = await integrationApi.get('/api/integrations');

      // Mock data for demonstration
      const mockIntegrations = [
        {
          id: '1',
          name: 'Salesforce to Azure Integration',
          description: 'Syncs customer data from Salesforce CRM to Azure SQL Database hourly',
          status: 'Active',
          health: 92,
          successRate: 98,
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          tenantId: '1',
          createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: '2',
          name: 'Employee Data Sync',
          description: 'Synchronizes employee data between HR system and payroll system daily',
          status: 'Active',
          health: 85,
          successRate: 90,
          lastRun: new Date(Date.now() - 3600000 * 12).toISOString(),
          tenantId: '1',
          createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        },
        {
          id: '3',
          name: 'Inventory Update',
          description: 'Updates inventory levels across all systems when stock changes',
          status: 'Error',
          health: 35,
          successRate: 45,
          lastRun: new Date(Date.now() - 3600000 * 2).toISOString(),
          tenantId: '1',
          createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: '4',
          name: 'Weekly Financial Report',
          description: 'Generates and distributes weekly financial reports from accounting system',
          status: 'Inactive',
          health: 0,
          successRate: 0,
          lastRun: null,
          tenantId: '1',
          createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        },
        {
          id: '5',
          name: 'Customer Feedback Analysis',
          description: 'Analyzes customer feedback from various channels and generates insights',
          status: 'Warning',
          health: 68,
          successRate: 75,
          lastRun: new Date(Date.now() - 3600000 * 36).toISOString(),
          tenantId: '1',
          createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        },
      ];

      // Filter by tenant if selected
      let filteredIntegrations = mockIntegrations;
      if (selectedTenant) {
        filteredIntegrations = mockIntegrations.filter(
          integration => integration.tenantId === selectedTenant.id
        );
      }

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredIntegrations = filteredIntegrations.filter(
          integration =>
            integration.name.toLowerCase().includes(term) ||
            (integration.description && integration.description.toLowerCase().includes(term))
        );
      }

      // Apply status filter
      if (filterBy !== 'all') {
        filteredIntegrations = filteredIntegrations.filter(
          integration => integration.status.toLowerCase() === filterBy.toLowerCase()
        );
      }

      // Sort integrations
      filteredIntegrations.sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];

        // Handle different data types
        if (valueA instanceof Date && valueB instanceof Date) {
          return sortDirection === 'asc'
            ? valueA.getTime() - valueB.getTime()
            : valueB.getTime() - valueA.getTime();
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        // Default numeric sort
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      });

      setIntegrations(filteredIntegrations);
      return filteredIntegrations;
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [selectedTenant, searchTerm, filterBy, sortBy, sortDirection]);

  // Load integrations on mount and when dependencies change
  useEffect(() => {
    fetchIntegrations();

    // Also load available node types for creation dialog
    loadAvailableNodeTypes();
  }, [
    fetchIntegrations,
    loadAvailableNodeTypes,
    selectedTenant,
    searchTerm,
    filterBy,
    sortBy,
    sortDirection,
  ]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';


    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view mode change
  const handleViewModeChange = mode => {
    setViewMode(mode);
  };

  // Handle search change
  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle filter change
  const handleFilterChange = event => {
    setFilterBy(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  // Handle sort change
  const handleSortChange = column => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc'); // Default to descending for new column
    }
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';

  // Added display name
  handleOpenCreateDialog.displayName = 'handleOpenCreateDialog';


    setCreateDialogOpen(true);
  };

  // Close create dialog
  const handleCloseCreateDialog = () => {
  // Added display name
  handleCloseCreateDialog.displayName = 'handleCloseCreateDialog';

  // Added display name
  handleCloseCreateDialog.displayName = 'handleCloseCreateDialog';

  // Added display name
  handleCloseCreateDialog.displayName = 'handleCloseCreateDialog';

  // Added display name
  handleCloseCreateDialog.displayName = 'handleCloseCreateDialog';

  // Added display name
  handleCloseCreateDialog.displayName = 'handleCloseCreateDialog';


    setCreateDialogOpen(false);
  };

  // Handle integration creation
  const handleCreateIntegration = async integrationData => {
    try {
      const newIntegration = await createIntegration(integrationData);

      if (newIntegration) {
        // Refresh the list
        fetchIntegrations();

        // Navigate to the integration editor
        navigate(`/integrations/${newIntegration.id}/edit`);
      }
    } catch (err) {
      console.error('Error creating integration:', err);
    }

    // Close the dialog
    handleCloseCreateDialog();
  };

  // Handle integration action
  const handleIntegrationAction = (action, integration) => {
  // Added display name
  handleIntegrationAction.displayName = 'handleIntegrationAction';

  // Added display name
  handleIntegrationAction.displayName = 'handleIntegrationAction';

  // Added display name
  handleIntegrationAction.displayName = 'handleIntegrationAction';

  // Added display name
  handleIntegrationAction.displayName = 'handleIntegrationAction';

  // Added display name
  handleIntegrationAction.displayName = 'handleIntegrationAction';


    switch (action) {
      case 'edit':
        navigate(`/integrations/${integration.id}/edit`);
        break;
      case 'run':
        handleRunIntegration(integration);
        break;
      case 'history':
        navigate(`/integrations/${integration.id}/history`);
        break;
      case 'schedule':
        navigate(`/integrations/${integration.id}/schedule`);
        break;
      case 'clone':
        // Set up clone operation
        handleCloneIntegration(integration);
        break;
      case 'delete':
        // Open delete confirmation dialog
        setSelectedIntegration(integration);
        setDeleteDialogOpen(true);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  // Handle integration run
  const handleRunIntegration = async integration => {
    try {
      // Load the integration first
      await loadIntegration(integration.id);

      // Then run it
      await runIntegration();

      // Refresh the list
      fetchIntegrations();
    } catch (err) {
      console.error(`Error running integration ${integration.id}:`, err);
    }
  };

  // Handle integration clone
  const handleCloneIntegration = integration => {
    // In a real implementation, this would clone the integration
  };

  // Handle integration delete
  const handleDeleteIntegration = async () => {
    if (!selectedIntegration) return;

    try {
      // In a real implementation, this would delete the integration

      // Refresh the list
      fetchIntegrations();
    } catch (err) {
      console.error(`Error deleting integration ${selectedIntegration.id}:`, err);
    }

    // Close the dialog
    setDeleteDialogOpen(false);
    setSelectedIntegration(null);
  };

  // Calculate pagination
  const displayedIntegrations =
    viewMode === 'grid'
      ? integrations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : integrations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <MuiBox>
      {/* Header */}
      <MuiBox marginBottom="xl&quot;>
        <Typography variant="h4" marginBottom="sm&quot;>
          Integrations
        </Typography>
        <Typography variant="body1" color="textSecondary&quot;>
          Create, manage, and monitor your data integrations
        </Typography>
      </MuiBox>

      {/* Control bar */}
      <MuiBox
        padding="md"
        marginBottom="lg&quot;
        display="flex"
        flexWrap="wrap&quot;
        alignItems="center"
        gap="md&quot;
        borderRadius="4px"
        boxShadow="0 1px 3px rgba(0,0,0,0.1)&quot;
        bgcolor="white"
      >
        {/* Search field */}
        <TextField
          placeholder="Search integrations...&quot;
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ flexGrow: 1, minWidth: '200px' }}
          startIcon={<SearchIcon />}
        />

        {/* Filter dropdown */}
        <MuiBox minWidth="150px&quot;>
          <Select 
            value={filterBy} 
            onChange={handleFilterChange}
            placeholder="Status"
            size="small&quot;
          >
            <Select.Option value="all">All Statuses</Select.Option>
            <Select.Option value="active&quot;>Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
            <Select.Option value="error&quot;>Error</Select.Option>
            <Select.Option value="warning">Warning</Select.Option>
          </Select>
        </MuiBox>

        {/* View mode toggle */}
        <MuiBox display="flex&quot; alignItems="center">
          <MuiBox
            as="button&quot;
            onClick={() => handleViewModeChange("list')}
            padding="xs&quot;
            borderRadius="4px"
            bgcolor={viewMode === 'list' ? 'primary.100' : 'transparent'}
            color={viewMode === 'list' ? 'primary' : 'gray.700'}
            border="none&quot;
            cursor="pointer"
            display="flex&quot;
            alignItems="center"
            justifyContent="center&quot;
            marginRight="xs"
            title="List view&quot;
            style={{ width: "32px', height: '32px' }}
          >
            <ListViewIcon />
          </MuiBox>
          
          <MuiBox
            as="button&quot;
            onClick={() => handleViewModeChange("grid')}
            padding="xs&quot;
            borderRadius="4px"
            bgcolor={viewMode === 'grid' ? 'primary.100' : 'transparent'}
            color={viewMode === 'grid' ? 'primary' : 'gray.700'}
            border="none&quot;
            cursor="pointer"
            display="flex&quot;
            alignItems="center"
            justifyContent="center&quot;
            title="Grid view"
            style={{ width: '32px', height: '32px' }}
          >
            <GridViewIcon />
          </MuiBox>
        </MuiBox>

        {/* Refresh button */}
        <MuiBox
          as="button&quot;
          onClick={() => fetchIntegrations()}
          padding="xs"
          borderRadius="4px&quot;
          bgcolor="transparent"
          border="none&quot;
          cursor="pointer"
          display="flex&quot;
          alignItems="center"
          justifyContent="center&quot;
          title="Refresh"
          style={{ width: '32px', height: '32px' }}
        >
          <RefreshIcon />
        </MuiBox>

        {/* Create button */}
        <Button
          variant="primary&quot;
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          New Integration
        </Button>
      </MuiBox>

      {/* Integrations list/grid */}
      <ResourceLoader
        isLoading={isLoading}
        error={error}
        isEmpty={integrations.length === 0}
        onRetry={fetchIntegrations}
        emptyMessage="No integrations found. Click 'New Integration' to create one."
      >
        {viewMode === 'grid' ? (
          // Grid view
          <Grid.Container spacing="md&quot;>
            {displayedIntegrations.map(integration => (
              <Grid.Item xs={12} sm={6} md={4} lg={3} key={integration.id}>
                <IntegrationCard integration={integration} onAction={handleIntegrationAction} />
              </Grid.Item>
            ))}
          </Grid.Container>
        ) : (
          // List view
          <MuiBox 
            borderRadius="4px" 
            boxShadow="0 1px 3px rgba(0,0,0,0.1)&quot; 
            overflow="hidden"
            bgcolor="white&quot;
          >
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Cell>
                    <MuiBox
                      display="flex"
                      alignItems="center&quot;
                      cursor="pointer"
                      onClick={() => handleSortChange('name')}
                    >
                      Name
                      {sortBy === 'name' && (
                        <SortIcon
                          fontSize="small&quot;
                          style={{
                            marginLeft: "4px',
                            transform: sortDirection === 'desc' ? 'none' : 'rotate(180deg)',
                          }}
                        />
                      )}
                    </MuiBox>
                  </Table.Cell>
                  <Table.Cell>Status</Table.Cell>
                  <Table.Cell>Health</Table.Cell>
                  <Table.Cell>
                    <MuiBox
                      display="flex&quot;
                      alignItems="center"
                      cursor="pointer&quot;
                      onClick={() => handleSortChange("lastRun')}
                    >
                      Last Run
                      {sortBy === 'lastRun' && (
                        <SortIcon
                          fontSize="small&quot;
                          style={{
                            marginLeft: "4px',
                            transform: sortDirection === 'desc' ? 'none' : 'rotate(180deg)',
                          }}
                        />
                      )}
                    </MuiBox>
                  </Table.Cell>
                  <Table.Cell align="right&quot;>Actions</Table.Cell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {displayedIntegrations.map(integration => (
                  <Table.Row key={integration.id}>
                    <Table.Cell>
                      <MuiBox>
                        <Typography variant="body1">{integration.name}</Typography>
                        <Typography 
                          variant="body2&quot; 
                          color="textSecondary" 
                          style={{ 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '300px'
                          }}
                        >
                          {integration.description}
                        </Typography>
                      </MuiBox>
                    </Table.Cell>
                    <Table.Cell>
                      <StatusChip status={integration.status} />
                    </Table.Cell>
                    <Table.Cell>
                      <IntegrationHealthBar health={integration.health || 0} />
                    </Table.Cell>
                    <Table.Cell>
                      {integration.lastRun
                        ? new Date(integration.lastRun).toLocaleString()
                        : 'Never'}
                    </Table.Cell>
                    <Table.Cell align="right&quot;>
                      <MuiBox display="flex" justifyContent="flex-end&quot;>
                        <MuiBox
                          as="button"
                          title="Edit&quot;
                          onClick={() => handleIntegrationAction("edit', integration)}
                          padding="xs&quot;
                          borderRadius="4px"
                          bgcolor="transparent&quot;
                          border="none"
                          cursor="pointer&quot;
                          display="flex"
                          alignItems="center&quot;
                          justifyContent="center"
                          style={{ width: '28px', height: '28px' }}
                        >
                          <EditIcon fontSize="small&quot; />
                        </MuiBox>
                        
                        <MuiBox
                          as="button"
                          title="Run&quot;
                          onClick={() => handleIntegrationAction("run', integration)}
                          padding="xs&quot;
                          borderRadius="4px"
                          bgcolor="transparent&quot;
                          border="none"
                          cursor="pointer&quot;
                          display="flex"
                          alignItems="center&quot;
                          justifyContent="center"
                          style={{ width: '28px', height: '28px' }}
                        >
                          <RunIcon fontSize="small&quot; />
                        </MuiBox>
                        
                        <MuiBox
                          as="button"
                          title="More actions&quot;
                          onClick={e => {
                            setSelectedIntegration(integration);
                            const menu = e.currentTarget;
                            setAnchorEl(menu);
                          }}
                          padding="xs"
                          borderRadius="4px&quot;
                          bgcolor="transparent"
                          border="none&quot;
                          cursor="pointer"
                          display="flex&quot;
                          alignItems="center"
                          justifyContent="center&quot;
                          style={{ width: "28px', height: '28px' }}
                        >
                          <MoreVertIcon fontSize="small&quot; />
                        </MuiBox>
                      </MuiBox>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </MuiBox>
        )}

        {/* Pagination */}
        <MuiBox 
          display="flex" 
          justifyContent="flex-end&quot; 
          marginTop="md" 
          padding="sm&quot;
        >
          <MuiBox display="flex" alignItems="center&quot; gap="sm">
            <Typography variant="body2&quot;>
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage.toString()}
              onChange={(e) => handleChangeRowsPerPage({ target: { value: e.target.value } })}
              size="small"
              style={{ width: '80px' }}
            >
              <Select.Option value="5&quot;>5</Select.Option>
              <Select.Option value="10">10</Select.Option>
              <Select.Option value="25&quot;>25</Select.Option>
              <Select.Option value="50">50</Select.Option>
            </Select>
            
            <MuiBox marginLeft="lg&quot;>
              <Typography variant="body2">
                {page * rowsPerPage + 1}-
                {Math.min(page * rowsPerPage + rowsPerPage, integrations.length)} of {integrations.length}
              </Typography>
            </MuiBox>
            
            <MuiBox display="flex&quot; gap="xs" marginLeft="md&quot;>
              <MuiBox
                as="button"
                onClick={(e) => handleChangePage(e, page - 1)}
                disabled={page === 0}
                padding="xs&quot;
                borderRadius="4px"
                bgcolor="transparent&quot;
                border="none"
                cursor={page === 0 ? 'default' : 'pointer'}
                display="flex&quot;
                alignItems="center"
                justifyContent="center&quot;
                style={{ 
                  width: "28px', 
                  height: '28px',
                  opacity: page === 0 ? 0.5 : 1 
                }}
              >
                <MuiBox as="span&quot; fontSize="16px">{'<'}</MuiBox>
              </MuiBox>
              
              <MuiBox
                as="button&quot;
                onClick={(e) => handleChangePage(e, page + 1)}
                disabled={page >= Math.ceil(integrations.length / rowsPerPage) - 1}
                padding="xs"
                borderRadius="4px&quot;
                bgcolor="transparent"
                border="none&quot;
                cursor={page >= Math.ceil(integrations.length / rowsPerPage) - 1 ? "default' : 'pointer'}
                display="flex&quot;
                alignItems="center"
                justifyContent="center&quot;
                style={{ 
                  width: "28px', 
                  height: '28px',
                  opacity: page >= Math.ceil(integrations.length / rowsPerPage) - 1 ? 0.5 : 1 
                }}
              >
                <MuiBox as="span&quot; fontSize="16px">{'>'}</MuiBox>
              </MuiBox>
            </MuiBox>
          </MuiBox>
        </MuiBox>
      </ResourceLoader>

      {/* Integration creation dialog */}
      <IntegrationCreationDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onCreate={handleCreateIntegration}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <MuiBox padding="lg&quot;>
          <Typography variant="h6" marginBottom="md&quot;>
            Delete Integration
          </Typography>
          
          <Typography variant="body1" marginBottom="lg&quot;>
            Are you sure you want to delete the integration "{selectedIntegration?.name}"? This
            action cannot be undone.
          </Typography>
          
          <MuiBox display="flex&quot; justifyContent="flex-end" gap="sm&quot;>
            <Button 
              variant="secondary" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            
            <Button 
              variant="danger" 
              onClick={handleDeleteIntegration}
            >
              Delete
            </Button>
          </MuiBox>
        </MuiBox>
      </Dialog>
    </MuiBox>
  );
};

export default IntegrationsPage;