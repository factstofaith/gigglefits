// ReleasesManager.jsx
import React, { useState, useEffect } from 'react';
import { Box } from '../../design-system';
import { Typography, Button } from '../../design-system';
import { TextField, Select } from '../../design-system';
import { Table } from '../../design-system';
import { Chip } from '../../design-system';
import { Dialog, CircularProgress, LinearProgress, Alert } from '../../design-system';
import { useTheme } from '@design-system/foundations/theme';
import { Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Grid, Tooltip, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Stepper, Step, StepLabel, StepContent, Divider, Stack, Switch, FormControlLabel, CardContent, Card } from '../../design-system';
;
;
;
;;
import {
  DialogLegacy,
  InputFieldLegacy,
  SelectLegacy,
  ButtonLegacy
} from '../../design-system/legacy';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  LocalShipping as ReleaseIcon,
  Visibility as VisibilityIcon,
  Apps as AppsIcon,
  Storage as StorageIcon,
  PlayArrow as StartIcon,
  Restore as RollbackIcon,
  ExpandMore as ExpandMoreIcon,
  Business as TenantIcon,
  DateRange as DateIcon,
  Tag as VersionIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useNotification from '@hooks/useNotification';
;
import {
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, LinearProgress, Tab } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
;
;
  getReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
  executeRelease,
  getTenants,
  getApplications,
  getDatasets
} from '../../services/adminService';

// Sample release data
const sampleReleases = [;
  {
    id: 1,
    name: 'March 2025 Release',
    description: 'New Salesforce and Azure integrations',
    version: '1.0.0',
    release_date: '2025-03-15T12:00:00.000Z',
    status: 'completed',
    items: [
      { item_type: 'application', item_id: 1, action: 'add', name: 'Salesforce' },
      { item_type: 'application', item_id: 2, action: 'add', name: 'Azure Blob Storage' },
      { item_type: 'dataset', item_id: 1, action: 'add', name: 'Salesforce Contacts' },
      { item_type: 'dataset', item_id: 2, action: 'add', name: 'Azure Blob Files' },
    ],
    tenants: ['tenant1', 'tenant2'],
    created_at: '2025-01-20T10:00:00.000Z',
    completed_at: '2025-03-15T12:30:00.000Z',
  },
  {
    id: 2,
    name: 'April 2025 Release',
    description: 'Updates to Salesforce integration',
    version: '1.1.0',
    release_date: '2025-04-15T12:00:00.000Z',
    status: 'draft',
    items: [
      { item_type: 'application', item_id: 1, action: 'update', name: 'Salesforce' },
      { item_type: 'dataset', item_id: 1, action: 'update', name: 'Salesforce Contacts' },
    ],
    tenants: ['tenant1'],
    created_at: '2025-02-10T14:00:00.000Z',
    completed_at: null,
  },
  {
    id: 3,
    name: 'May 2025 Release',
    description: 'New database integrations',
    version: '1.2.0',
    release_date: '2025-05-10T12:00:00.000Z',
    status: 'scheduled',
    items: [
      { item_type: 'application', item_id: 3, action: 'add', name: 'MySQL Database' },
      { item_type: 'dataset', item_id: 3, action: 'add', name: 'Customer Data' },
    ],
    tenants: ['tenant1', 'tenant2', 'tenant3'],
    created_at: '2025-03-05T09:00:00.000Z',
    completed_at: null,
  },
];

// Sample applications for selection
const sampleApplications = [;
  { id: 1, name: 'Salesforce', status: 'active' },
  { id: 2, name: 'Azure Blob Storage', status: 'active' },
  { id: 3, name: 'MySQL Database', status: 'draft' },
  { id: 4, name: 'Slack', status: 'active' },
  { id: 5, name: 'Google Sheets', status: 'deprecated' },
];

// Sample datasets for selection
const sampleDatasets = [;
  { id: 1, name: 'Salesforce Contacts', status: 'active' },
  { id: 2, name: 'Azure Blob Files', status: 'active' },
  { id: 3, name: 'Customer Data', status: 'draft' },
  { id: 4, name: 'Slack Messages', status: 'active' },
];

// Sample tenants for selection
const sampleTenants = [;
  { id: 'tenant1', name: 'Enterprise Corp' },
  { id: 'tenant2', name: 'Small Business LLC' },
  { id: 'tenant3', name: 'Medium Organization' },
];

// Tenants will be fetched from the API

// Status chip color mapping
const statusColors = {
  draft: 'info',
  scheduled: 'warning',
  in_progress: 'info',
  completed: 'success',
  failed: 'error',
  rolled_back: 'error',
};

// ReleasesManager component
const ReleasesManager = () => {
  // Added display name
  ReleasesManager.displayName = 'ReleasesManager';

  // Added display name
  ReleasesManager.displayName = 'ReleasesManager';

  // Added display name
  ReleasesManager.displayName = 'ReleasesManager';

  // Added display name
  ReleasesManager.displayName = 'ReleasesManager';

  // Added display name
  ReleasesManager.displayName = 'ReleasesManager';


  const { showToast, addNotification } = useNotification();
  const [releases, setReleases] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [datasetsList, setDatasetsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState(');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [currentRelease, setCurrentRelease] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: ',
    version: '',
    release_date: null,
    items: [],
    tenants: [],
    status: 'draft',
  });
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [releaseProgress, setReleaseProgress] = useState(0);
  const [releasing, setReleasing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load releases and reference data
  useEffect(() => {
    fetchReleases();
    fetchTenants();
    fetchApplications();
    fetchDatasets();
  }, []);

  // Fetch releases from the API
  const fetchReleases = async () => {
    setLoading(true);
    try {
      const data = await getReleases();
      setReleases(data);
    } catch (error) {
      console.error('Error fetching releases:', error);
      showToast('Failed to fetch releases', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenants for release assignment
  const fetchTenants = async () => {
    try {
      const data = await getTenants();
      setTenantsList(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  // Fetch applications for release configuration
  const fetchApplications = async () => {
    try {
      const data = await getApplications();
      setApplicationsList(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Fetch datasets for release configuration
  const fetchDatasets = async () => {
    try {
      const data = await getDatasets();
      setDatasetsList(data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  // Handle search input
  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  // Filter releases based on search term
  const filteredReleases = releases.filter(
    release =>
      release.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.version.toLowerCase().includes(searchTerm.toLowerCase());
  );

  // Handle dialog open for new release
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


    setCurrentRelease(null);
    setFormData({
      name: ',
      description: '',
      version: ',
      release_date: null,
      items: [],
      tenants: [],
      status: 'draft',
    });
    setSelectedApplications([]);
    setSelectedDatasets([]);
    setSelectedTenants([]);
    setActiveStep(0);
    setOpenDialog(true);
  };

  // Handle dialog open for editing
  const handleOpenEditDialog = release => {
    setCurrentRelease(release);
    setFormData({
      name: release.name,
      description: release.description,
      version: release.version,
      release_date: new Date(release.release_date),
      items: [...release.items],
      tenants: [...release.tenants],
      status: release.status,
    });

    // Set selected items based on release items
    const apps = release.items
      .filter(item => item.item_type === 'application');
      .map(item => ({
        id: item.item_id,
        name: item.name,
        action: item.action,
      }));

    const datasets = release.items
      .filter(item => item.item_type === 'dataset');
      .map(item => ({
        id: item.item_id,
        name: item.name,
        action: item.action,
      }));

    setSelectedApplications(apps);
    setSelectedDatasets(datasets);
    setSelectedTenants(
      release.tenants.map(id => ({
        id,
        name: sampleTenants.find(t => t.id === id)?.name || id,
      }))
    );

    setActiveStep(0);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';

  // Added display name
  handleCloseDialog.displayName = 'handleCloseDialog';


    setOpenDialog(false);
  };

  // Handle form input change
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date change
  const handleDateChange = newDate => {
    setFormData({
      ...formData,
      release_date: newDate,
    });
  };

  // Next step in wizard
  const handleNext = () => {
  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';

  // Added display name
  handleNext.displayName = 'handleNext';


    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  // Back step in wizard
  const handleBack = () => {
  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';

  // Added display name
  handleBack.displayName = 'handleBack';


    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  // Handle application toggle
  const handleApplicationToggle = application => {
    const currentIndex = selectedApplications.findIndex(app => app.id === application.id);
    const newSelectedApplications = [...selectedApplications];

    if (currentIndex === -1) {
      // Add with 'add' action by default
      newSelectedApplications.push({ ...application, action: 'add' });
    } else {
      // Remove
      newSelectedApplications.splice(currentIndex, 1);
    }

    setSelectedApplications(newSelectedApplications);
  };

  // Handle application action change
  const handleApplicationActionChange = (applicationId, newAction) => {
  // Added display name
  handleApplicationActionChange.displayName = 'handleApplicationActionChange';

  // Added display name
  handleApplicationActionChange.displayName = 'handleApplicationActionChange';

  // Added display name
  handleApplicationActionChange.displayName = 'handleApplicationActionChange';

  // Added display name
  handleApplicationActionChange.displayName = 'handleApplicationActionChange';

  // Added display name
  handleApplicationActionChange.displayName = 'handleApplicationActionChange';


    const newSelectedApplications = selectedApplications.map(app =>;
      app.id === applicationId ? { ...app, action: newAction } : app
    );
    setSelectedApplications(newSelectedApplications);
  };

  // Handle dataset toggle
  const handleDatasetToggle = dataset => {
    const currentIndex = selectedDatasets.findIndex(ds => ds.id === dataset.id);
    const newSelectedDatasets = [...selectedDatasets];

    if (currentIndex === -1) {
      // Add with 'add' action by default
      newSelectedDatasets.push({ ...dataset, action: 'add' });
    } else {
      // Remove
      newSelectedDatasets.splice(currentIndex, 1);
    }

    setSelectedDatasets(newSelectedDatasets);
  };

  // Handle dataset action change
  const handleDatasetActionChange = (datasetId, newAction) => {
  // Added display name
  handleDatasetActionChange.displayName = 'handleDatasetActionChange';

  // Added display name
  handleDatasetActionChange.displayName = 'handleDatasetActionChange';

  // Added display name
  handleDatasetActionChange.displayName = 'handleDatasetActionChange';

  // Added display name
  handleDatasetActionChange.displayName = 'handleDatasetActionChange';

  // Added display name
  handleDatasetActionChange.displayName = 'handleDatasetActionChange';


    const newSelectedDatasets = selectedDatasets.map(ds =>;
      ds.id === datasetId ? { ...ds, action: newAction } : ds
    );
    setSelectedDatasets(newSelectedDatasets);
  };

  // Handle tenant toggle
  const handleTenantToggle = tenant => {
    const currentIndex = selectedTenants.findIndex(t => t.id === tenant.id);
    const newSelectedTenants = [...selectedTenants];

    if (currentIndex === -1) {
      newSelectedTenants.push(tenant);
    } else {
      newSelectedTenants.splice(currentIndex, 1);
    }

    setSelectedTenants(newSelectedTenants);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Prepare items array from selected applications and datasets
    const items = [;
      ...selectedApplications.map(app => ({
        item_type: 'application',
        item_id: app.id,
        action: app.action,
        name: app.name,
      })),
      ...selectedDatasets.map(ds => ({
        item_type: 'dataset',
        item_id: ds.id,
        action: ds.action,
        name: ds.name,
      })),
    ];

    // Prepare tenants array
    const tenants = selectedTenants.map(t => t.id);

    const formattedData = {
      ...formData,
      items,
      tenants,
    };

    setIsSubmitting(true);

    try {
      if (currentRelease) {
        // Update existing release via API
        await updateRelease(currentRelease.id, formattedData);
        // Refresh the releases list
        await fetchReleases();
      } else {
        // Create new release via API
        await createRelease(formattedData);
        // Refresh the releases list
        await fetchReleases();
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving release:', error);
      showToast('Failed to save release', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete release
  const handleDeleteRelease = async id => {
    try {
      await deleteRelease(id);
      await fetchReleases(); // Refresh the list
      showToast('Release deleted successfully', 'success', {
        title: 'Success',
      });
    } catch (error) {
      console.error(`Error deleting release with ID ${id}:', error);
      showToast('Failed to delete release', 'error');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';

  // Added display name
  handleRefresh.displayName = 'handleRefresh';


    fetchReleases();
    showToast('Releases refreshed', 'info');
  };

  // Handle execute release
  const handleExecuteRelease = release => {
    setCurrentRelease(release);
    setExecuteDialogOpen(true);
  };

  // Handle execute confirmation
  const handleConfirmExecute = async () => {
    if (!currentRelease) return;

    setReleasing(true);
    setReleaseProgress(0);

    try {
      // Start a simulated progress indicator
      const interval = setInterval(() => {
        setReleaseProgress(prev => Math.min(prev + 5, 90)); // Only go up to 90% until API response
      }, 200);

      // Call the actual API
      await executeRelease(currentRelease.id);

      // Complete the progress
      clearInterval(interval);
      setReleaseProgress(100);

      // Show completion notification
      showToast('Release executed successfully', 'success', {
        title: 'Release Complete',
      });

      addNotification({
        title: 'Release Execution Started',
        message: 'Release ${currentRelease.name} (v${currentRelease.version}) execution has been initiated.',
        type: 'success',
      });

      // Refresh the release list
      await fetchReleases();

      // Close dialog after a short delay
      setTimeout(() => {
        setExecuteDialogOpen(false);
        setReleasing(false);
      }, 1000);
    } catch (error) {
      console.error('Error executing release with ID ${currentRelease.id}:', error);
      showToast('Failed to execute release', 'error');
      setReleasing(false);
    }
  };

  // Handle rollback release
  const handleRollbackRelease = release => {
    // In a real app, this would be an API call
    const updatedReleases = releases.map(r =>
      r.id === release.id;
        ? {
            ...r,
            status: 'rolled_back',
          }
        : r
    );
    setReleases(updatedReleases);

    showToast('Release rolled back successfully', 'warning', {
      title: 'Rollback Complete',
    });
  };

  const { theme } = useTheme();
  
  return (
    <Box>
      {/* Header with actions */}
      <Box 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}
      >
        <Typography variant="heading2&quot;>Manage Releases</Typography>

        <Box style={{ display: "flex', gap: '16px' }}>
          <Button 
            variant="secondary&quot; 
            onClick={handleRefresh}
            style={{
              display: "flex', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshIcon fontSize="small&quot; />
            Refresh
          </Button>

          <Button 
            variant="primary" 
            onClick={handleOpenCreateDialog}
            style={{
              display: 'flex', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AddIcon fontSize="small&quot; />
            New Release
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search releases..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '24px' }}
        startAdornment={<SearchIcon />}
      />

      {/* Releases table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Release Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Tenants</TableCell>
              <TableCell align="right&quot;>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ padding: '24px' }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : filteredReleases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center&quot; style={{ padding: "24px' }}>
                  <Typography 
                    variant="body1&quot; 
                    style={{ color: theme?.colors?.text?.secondary || "#666666' }}
                  >
                    No releases found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReleases.map(release => (
                <TableRow key={release.id}>
                  <TableCell>
                    <Box 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    >
                      <ReleaseIcon 
                        style={{ 
                          marginRight: '8px',
                          color: theme?.colors?.success?.main || '#4caf50'
                        }} 
                      />
                      <Typography variant="body1&quot;>{release.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>v{release.version}</TableCell>
                  <TableCell>{new Date(release.release_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                      color={statusColors[release.status]}
                      size="small"
                      variant="outlined&quot;
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={"${release.items.length} item(s)'}>
                      <Box 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px' 
                        }}
                      >
                        <Typography variant="body2&quot;>{release.items.length}</Typography>
                        <Box style={{ display: "flex' }}>
                          <AppsIcon fontSize="small&quot; />
                          <StorageIcon fontSize="small" />
                        </Box>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={'${release.tenants.length} tenant(s)'}>
                      <Chip
                        label={release.tenants.length}
                        size="small&quot;
                        color="info"
                        icon={<TenantIcon fontSize="small&quot; />}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Box 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end' 
                      }}
                    >
                      {release.status === 'draft' && (
                        <Tooltip title="Edit&quot;>
                          <Box
                            as="button"
                            onClick={() => handleOpenEditDialog(release)}
                            aria-label="Edit release"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              padding: '4px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginLeft: '4px',
                            }}
                          >
                            <EditIcon fontSize="small&quot; />
                          </Box>
                        </Tooltip>
                      )}

                      {(release.status === "draft' || release.status === 'scheduled') && (
                        <Tooltip title="Execute Release&quot;>
                          <Box
                            as="button"
                            onClick={() => handleExecuteRelease(release)}
                            aria-label="Execute release"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              padding: '4px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginLeft: '4px',
                              color: theme?.colors?.success?.main || '#4caf50'
                            }}
                          >
                            <StartIcon fontSize="small&quot; />
                          </Box>
                        </Tooltip>
                      )}

                      {release.status === "completed' && (
                        <Tooltip title="Rollback Release&quot;>
                          <Box
                            as="button"
                            onClick={() => handleRollbackRelease(release)}
                            aria-label="Rollback release"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              padding: '4px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginLeft: '4px',
                              color: theme?.colors?.warning?.main || '#ff9800'
                            }}
                          >
                            <RollbackIcon fontSize="small&quot; />
                          </Box>
                        </Tooltip>
                      )}

                      <Tooltip title="View Details">
                        <Box
                          as="button&quot;
                          aria-label="View release details"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            padding: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '4px'
                          }}
                        >
                          <VisibilityIcon fontSize="small&quot; />
                        </Box>
                      </Tooltip>

                      {release.status === "draft' && (
                        <Tooltip title="Delete&quot;>
                          <Box
                            as="button"
                            onClick={() => handleDeleteRelease(release.id)}
                            aria-label="Delete release"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              padding: '4px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginLeft: '4px',
                              color: theme?.colors?.error?.main || '#f44336'
                            }}
                          >
                            <DeleteIcon fontSize="small&quot; />
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <DialogLegacy open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentRelease ? 'Edit Release' : 'Create New Release'}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical&quot;>
            <Step>
              <StepLabel>Basic Information</StepLabel>
              <StepContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <InputFieldLegacy
                      name="name"
                      label="Release Name&quot;
                      fullWidth
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InputFieldLegacy
                      name="description"
                      label="Description&quot;
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputFieldLegacy
                      name="version"
                      label="Version (Semantic Versioning)&quot;
                      fullWidth
                      value={formData.version}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 1.0.0"
                      helperText="Use semantic versioning format: x.y.z&quot;
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label="Release Date"
                        value={formData.release_date}
                        onChange={handleDateChange}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained&quot;
                        onClick={handleNext}
                        disabled={!formData.name || !formData.version}
                      >
                        Next
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Select Applications & Datasets</StepLabel>
              <StepContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Applications
                    </Typography>
                    <Paper variant="outlined&quot; sx={{ maxHeight: 300, overflow: "auto', p: 1 }}>
                      <List dense>
                        {sampleApplications.map(app => {
                          const isSelected = selectedApplications.some(a => a.id === app.id);
                          const action =
                            selectedApplications.find(a => a.id === app.id)?.action || 'add';

                          return (
                            <ListItem key={app.id} divider>
                              <ListItemIcon>
                                <IconButton
                                  size="small&quot;
                                  onClick={() => handleApplicationToggle(app)}
                                  color={isSelected ? "primary' : 'default'}
                                >
                                  {isSelected ? <CheckCircleIcon /> : <AppsIcon />}
                                </IconButton>
                              </ListItemIcon>
                              <ListItemText
                                primary={app.name}
                                secondary={
                                  <Chip
                                    size="small&quot;
                                    label={app.status}
                                    color={statusColors[app.status]}
                                    variant="outlined"
                                  />
                                }
                              />
                              {isSelected && (
                                <ListItemSecondaryAction>
                                  <SelectLegacy
                                    size="small&quot;
                                    value={action}
                                    onChange={e =>
                                      handleApplicationActionChange(app.id, e.target.value)
                                    }
                                    options={[
                                      { value: "add', label: 'Add' },
                                      { value: 'update', label: 'Update' },
                                      { value: 'remove', label: 'Remove' },
                                    ]}
                                    sx={{ minWidth: 120 }}
                                  />
                                </ListItemSecondaryAction>
                              )}
                            </ListItem>
                          );
                        })}
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1&quot; gutterBottom>
                      Datasets
                    </Typography>
                    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                      <List dense>
                        {sampleDatasets.map(dataset => {
                          const isSelected = selectedDatasets.some(d => d.id === dataset.id);
                          const action =
                            selectedDatasets.find(d => d.id === dataset.id)?.action || 'add';

                          return (
                            <ListItem key={dataset.id} divider>
                              <ListItemIcon>
                                <IconButton
                                  size="small&quot;
                                  onClick={() => handleDatasetToggle(dataset)}
                                  color={isSelected ? "secondary' : 'default'}
                                >
                                  {isSelected ? <CheckCircleIcon /> : <StorageIcon />}
                                </IconButton>
                              </ListItemIcon>
                              <ListItemText
                                primary={dataset.name}
                                secondary={
                                  <Chip
                                    size="small&quot;
                                    label={dataset.status}
                                    color={statusColors[dataset.status]}
                                    variant="outlined"
                                  />
                                }
                              />
                              {isSelected && (
                                <ListItemSecondaryAction>
                                  <SelectLegacy
                                    size="small&quot;
                                    value={action}
                                    onChange={e =>
                                      handleDatasetActionChange(dataset.id, e.target.value)
                                    }
                                    options={[
                                      { value: "add', label: 'Add' },
                                      { value: 'update', label: 'Update' },
                                      { value: 'remove', label: 'Remove' },
                                    ]}
                                    sx={{ minWidth: 120 }}
                                  />
                                </ListItemSecondaryAction>
                              )}
                            </ListItem>
                          );
                        })}
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert
                      severity={
                        selectedApplications.length === 0 && selectedDatasets.length === 0
                          ? 'warning'
                          : 'info'
                      }
                      sx={{ mt: 2 }}
                    >
                      {selectedApplications.length === 0 && selectedDatasets.length === 0
                        ? 'Please select at least one application or dataset for this release.'
                        : 'Selected ${selectedApplications.length} application(s) and ${selectedDatasets.length} dataset(s).'}
                    </Alert>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button onClick={handleBack}>Back</Button>
                      <Button
                        variant="contained&quot;
                        onClick={handleNext}
                        disabled={
                          selectedApplications.length === 0 && selectedDatasets.length === 0
                        }
                      >
                        Next
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Select Tenants</StepLabel>
              <StepContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Choose tenants to receive this release
                    </Typography>
                    <Paper variant="outlined&quot; sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        {tenantsList.map(tenant => {
                          const isSelected = selectedTenants.some(t => t.id === tenant.id);

                          return (
                            <Grid item xs={12} sm={6} key={tenant.id}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={isSelected}
                                    onChange={() => handleTenantToggle(tenant)}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TenantIcon
                                      sx={{ mr: 1, fontSize: 'small', color: 'info.main' }}
                                    />
                                    <Typography variant="body2&quot;>{tenant.name}</Typography>
                                  </Box>
                                }
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert
                      severity={selectedTenants.length === 0 ? "warning' : 'info'}
                      sx={{ mt: 2 }}
                    >
                      {selectedTenants.length === 0
                        ? 'Please select at least one tenant to receive this release.'
                        : 'This release will be deployed to ${selectedTenants.length} tenant(s).'}
                    </Alert>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button onClick={handleBack}>Back</Button>
                      <Button
                        variant="contained&quot;
                        onClick={handleNext}
                        disabled={selectedTenants.length === 0}
                      >
                        Next
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Review & Confirm</StepLabel>
              <StepContent>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Release Summary
                  </Typography>

                  <Card variant="outlined&quot; sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex', alignItems: 'center', mb: 1 }}>
                            <ReleaseIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Typography variant="subtitle1&quot;>{formData.name}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary&quot; paragraph>
                            {formData.description || "No description provided.'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<VersionIcon />}
                              label={'v${formData.version}'}
                              color="primary&quot;
                              variant="outlined"
                            />
                            <Chip
                              icon={<DateIcon />}
                              label={
                                formData.release_date
                                  ? new Date(formData.release_date).toLocaleDateString()
                                  : 'Not scheduled'
                              }
                              color="info&quot;
                              variant="outlined"
                            />
                            <Chip
                              icon={<TenantIcon />}
                              label={'${selectedTenants.length} tenant(s)'}
                              color="success&quot;
                              variant="outlined"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AppsIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1&quot;>
                          Applications ({selectedApplications.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {selectedApplications.length === 0 ? (
                        <Typography variant="body2" color="text.secondary&quot;>
                          No applications selected.
                        </Typography>
                      ) : (
                        <List dense>
                          {selectedApplications.map(app => (
                            <ListItem key={app.id} divider>
                              <ListItemText
                                primary={app.name}
                                secondary={"Action: ${app.action.charAt(0).toUpperCase() + app.action.slice(1)}'}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StorageIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="subtitle1&quot;>
                          Datasets ({selectedDatasets.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {selectedDatasets.length === 0 ? (
                        <Typography variant="body2" color="text.secondary&quot;>
                          No datasets selected.
                        </Typography>
                      ) : (
                        <List dense>
                          {selectedDatasets.map(dataset => (
                            <ListItem key={dataset.id} divider>
                              <ListItemText
                                primary={dataset.name}
                                secondary={"Action: ${dataset.action.charAt(0).toUpperCase() + dataset.action.slice(1)}'}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TenantIcon sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="subtitle1&quot;>
                          Tenants ({selectedTenants.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {selectedTenants.map(tenant => (
                          <ListItem key={tenant.id} divider>
                            <ListItemText primary={tenant.name} secondary={tenant.id} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  <Alert severity="warning" sx={{ mt: 3 }}>
                    <Typography variant="body2&quot;>
                      <strong>Important:</strong> You are creating a new release. Releases need to
                      be executed manually after creation to deploy applications and datasets to
                      tenants.
                    </Typography>
                  </Alert>

                  <Box sx={{ display: "flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button
                      variant="contained&quot;
                      onClick={handleSubmit}
                      color="primary"
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : currentRelease
                          ? 'Save Changes'
                          : 'Create Release'}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
      </DialogLegacy>

      {/* Execute Release Dialog */}
      <DialogLegacy
        open={executeDialogOpen}
        onClose={() => !releasing && setExecuteDialogOpen(false)}
        maxWidth="sm&quot;
        fullWidth
      >
        <DialogTitle>Execute Release</DialogTitle>
        <DialogContent>
          {releasing ? (
            <Box sx={{ textAlign: "center', py: 2 }}>
              <Typography variant="h6&quot; gutterBottom>
                Executing Release...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={releaseProgress}
                sx={{ my: 3, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2&quot; color="text.secondary">
                {releaseProgress < 100
                  ? 'Deploying to tenants (${Math.round(releaseProgress)}% complete)'
                  : 'Deployment complete!'}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Alert severity="warning&quot; sx={{ mb: 3 }}>
                <Typography variant="body1">
                  <strong>Warning:</strong> You are about to execute release{' '}
                  <strong>{currentRelease?.name}</strong> (v{currentRelease?.version}).
                </Typography>
                <Typography variant="body2&quot; sx={{ mt: 1 }}>
                  This will deploy {currentRelease?.items.length} item(s) to{" '}
                  {currentRelease?.tenants.length} tenant(s). This action cannot be easily undone.
                </Typography>
              </Alert>

              <Typography variant="subtitle1&quot; gutterBottom>
                Release Details:
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <VersionIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Version&quot; secondary={"v${currentRelease?.version}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DateIcon color="info&quot; />
                  </ListItemIcon>
                  <ListItemText
                    primary="Release Date"
                    secondary={
                      currentRelease?.release_date
                        ? new Date(currentRelease.release_date).toLocaleString()
                        : 'Not scheduled'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TenantIcon color="success&quot; />
                  </ListItemIcon>
                  <ListItemText
                    primary="Target Tenants"
                    secondary={currentRelease?.tenants.join(', ')}
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        {!releasing && (
          <DialogActions>
            <Button onClick={() => setExecuteDialogOpen(false)} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button
              variant="contained&quot;
              color="warning"
              onClick={handleConfirmExecute}
              startIcon={<StartIcon />}
            >
              Execute Release
            </Button>
          </DialogActions>
        )}
      </DialogLegacy>
    </Box>
  );
};

export default ReleasesManager;
