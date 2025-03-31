// EarningsMappingDetail.jsx
// -----------------------------------------------------------------------------
// Component for managing earnings mappings within integrations

import React, { useState, useEffect } from 'react';
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
import  from '@mui/material/';;
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';
import FilterListIcon from '@mui/icons-material/FilterList';

// Import services
import {
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Switch, Tab, Tabs, TextField, Typography } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
getEarningsMappings,
  createEarningsMapping,
  updateEarningsMapping,
  deleteEarningsMapping,
  testEarningsMapping,
  getEarningsCodes, discoverFields,
  discoverFields,
} from '../../services/integrationService';

// TabPanel component for tab content
function TabPanel(props) {
  // Added display name
  TabPanel.displayName = 'TabPanel';

  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel&quot;
      hidden={value !== index}
      id={`earnings-mapping-tabpanel-${index}`}
      aria-labelledby={`earnings-mapping-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const EarningsMappingDetail = ({ integrationId, datasetId }) => {
  // Added display name
  EarningsMappingDetail.displayName = "EarningsMappingDetail';

  // Added display name
  EarningsMappingDetail.displayName = 'EarningsMappingDetail';

  // Added display name
  EarningsMappingDetail.displayName = 'EarningsMappingDetail';

  // Added display name
  EarningsMappingDetail.displayName = 'EarningsMappingDetail';

  // Added display name
  EarningsMappingDetail.displayName = 'EarningsMappingDetail';


  const [activeTab, setActiveTab] = useState(0);
  const [mappings, setMappings] = useState([]);
  const [earningsCodes, setEarningsCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMapping, setEditingMapping] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mappingToDelete, setMappingToDelete] = useState(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testData, setTestData] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [unmappedTypes, setUnmappedTypes] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch mappings, codes, and discover fields in parallel
        const [mappingsData, codesData, fields] = await Promise.all([
          getEarningsMappings(integrationId),
          getEarningsCodes(),
          // Use the dataset fields or discover from source
          datasetId
            ? discoverFields(integrationId, 'source')
            : discoverFields(integrationId, 'source'),
        ]);

        setMappings(mappingsData);
        setEarningsCodes(codesData);

        // Extract source types from fields
        // Look for fields of the type "earnings" or with "earnings" in the name/description
        const sourceTypes = fields
          .filter(
            field =>
              field.type === 'string' &&
              (field.name.toLowerCase().includes('earn') ||
                field.description?.toLowerCase().includes('earn') ||
                field.name.toLowerCase().includes('type'))
          )
          .map(field => field.name);

        // If no source types found in fields, use an empty array
        const earningsTypes = sourceTypes.length > 0 ? sourceTypes : [];

        // Calculate unmapped types
        const mappedTypes = mappingsData.map(m => m.source_type);
        setUnmappedTypes(earningsTypes.filter(type => !mappedTypes.includes(type)));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching earnings mapping data:', err);
        setError('Failed to load earnings mapping data');
        setLoading(false);
      }
    };

    fetchData();
  }, [integrationId, datasetId]);

  // Handle tab changes
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

  // Open dialog to add/edit mapping
  const handleOpenDialog = (mapping = null) => {
  // Added display name
  handleOpenDialog.displayName = 'handleOpenDialog';

  // Added display name
  handleOpenDialog.displayName = 'handleOpenDialog';

  // Added display name
  handleOpenDialog.displayName = 'handleOpenDialog';

  // Added display name
  handleOpenDialog.displayName = 'handleOpenDialog';

  // Added display name
  handleOpenDialog.displayName = 'handleOpenDialog';


    if (mapping) {
      setEditingMapping({
        ...mapping,
        // Clone to avoid reference issues
      });
    } else {
      setEditingMapping({
        integration_id: integrationId,
        source_type: '',
        earnings_code_id: '',
        default_map: false,
        condition: '',
        dataset_id: datasetId || null,
      });
    }
    setIsDialogOpen(true);
  };

  // Close dialog
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


    setIsDialogOpen(false);
    setEditingMapping(null);
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
  // Added display name
  handleFieldChange.displayName = 'handleFieldChange';

  // Added display name
  handleFieldChange.displayName = 'handleFieldChange';

  // Added display name
  handleFieldChange.displayName = 'handleFieldChange';

  // Added display name
  handleFieldChange.displayName = 'handleFieldChange';

  // Added display name
  handleFieldChange.displayName = 'handleFieldChange';


    setEditingMapping(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save mapping
  const handleSaveMapping = async () => {
    try {
      if (editingMapping.id) {
        // Update existing mapping
        const updated = await updateEarningsMapping(
          integrationId,
          editingMapping.id,
          editingMapping
        );

        // Update mappings list
        setMappings(prevMappings => prevMappings.map(m => (m.id === updated.id ? updated : m)));
      } else {
        // Create new mapping
        const created = await createEarningsMapping(integrationId, editingMapping);

        // Add to mappings list
        setMappings(prevMappings => [...prevMappings, created]);

        // Update unmapped types
        setUnmappedTypes(prev => prev.filter(type => type !== created.source_type));
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving earnings mapping:', err);
      setError('Failed to save earnings mapping');
    }
  };

  // Delete mapping confirmation
  const handleDeleteConfirm = mapping => {
    setMappingToDelete(mapping);
    setDeleteConfirmOpen(true);
  };

  // Delete mapping
  const handleDeleteMapping = async () => {
    try {
      await deleteEarningsMapping(integrationId, mappingToDelete.id);

      // Remove from mappings list
      setMappings(prevMappings => prevMappings.filter(m => m.id !== mappingToDelete.id));

      // Add type back to unmapped list
      setUnmappedTypes(prev => [...prev, mappingToDelete.source_type]);

      setDeleteConfirmOpen(false);
      setMappingToDelete(null);
    } catch (err) {
      console.error('Error deleting earnings mapping:', err);
      setError('Failed to delete earnings mapping');
    }
  };

  // Open test dialog
  const handleOpenTestDialog = mapping => {
    setEditingMapping(mapping);
    setTestData(
      JSON.stringify(
        {
          source_type: mapping.source_type,
          amount: '100.00',
          hours: '8.0',
          attributes: {},
        },
        null,
        2
      )
    );
    setTestResults(null);
    setTestDialogOpen(true);
  };

  // Test mapping
  const handleTestMapping = async () => {
    try {
      setTestLoading(true);
      let testDataObj;

      try {
        testDataObj = JSON.parse(testData);
      } catch (err) {
        setError('Invalid JSON in test data');
        setTestLoading(false);
        return;
      }

      const results = await testEarningsMapping(integrationId, editingMapping.id, testDataObj);

      setTestResults(results);
      setTestLoading(false);
    } catch (err) {
      console.error('Error testing earnings mapping:', err);
      setError('Failed to test earnings mapping');
      setTestLoading(false);
    }
  };

  // Find earnings code name by ID
  const getEarningsCodeName = codeId => {
    const code = earningsCodes.find(c => c.id === codeId);
    return code ? `${code.code} - ${code.name}` : 'Unknown';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Earnings Mappings&quot;
        subheader="Map source earnings types to destination earnings codes"
        action={
          <Button
            variant="contained&quot;
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Mapping
          </Button>
        }
      />

      <Divider />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="earnings mapping tabs">
          <Tab label="Mappings&quot; />
          <Tab label="Unmapped Types" />
          <Tab label="History&quot; />
        </Tabs>
      </Box>

      <CardContent>
        {/* Mappings Tab */}
        <TabPanel value={activeTab} index={0}>
          {mappings.length === 0 ? (
            <Typography color="textSecondary" align="center&quot; sx={{ py: 4 }}>
              No earnings mappings defined. Click "Add Mapping' to create one.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {mappings.map(mapping => (
                <Grid item xs={12} md={6} key={mapping.id}>
                  <Paper sx={{ p: 2, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6&quot; component="h3">
                        {mapping.source_type}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small&quot;
                          onClick={() => handleOpenTestDialog(mapping)}
                          title="Test mapping"
                        >
                          <PlayArrowIcon fontSize="small&quot; />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(mapping)}
                          title="Edit mapping&quot;
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small&quot;
                          onClick={() => handleDeleteConfirm(mapping)}
                          title="Delete mapping"
                        >
                          <DeleteIcon fontSize="small&quot; />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="textSecondary&quot; gutterBottom>
                      Maps to: <strong>{getEarningsCodeName(mapping.earnings_code_id)}</strong>
                    </Typography>

                    {mapping.default_map && (
                      <Typography variant="body2" color="primary&quot; gutterBottom>
                        Default mapping
                      </Typography>
                    )}

                    {mapping.condition && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="textSecondary&quot; gutterBottom>
                          Condition:
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            backgroundColor: 'grey.100',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            maxHeight: '80px',
                            overflow: 'auto',
                          }}
                        >
                          <code>{mapping.condition}</code>
                        </Paper>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Unmapped Types Tab */}
        <TabPanel value={activeTab} index={1}>
          {unmappedTypes.length === 0 ? (
            <Typography color="textSecondary&quot; align="center" sx={{ py: 4 }}>
              All earnings types are mapped. Great job!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {unmappedTypes.map(type => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={type}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'warning.light',
                    }}
                  >
                    <Typography>{type}</Typography>
                    <Button
                      variant="contained&quot;
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        handleOpenDialog({
                          integration_id: integrationId,
                          source_type: type,
                          earnings_code_id: '',
                          default_map: false,
                          condition: '',
                          dataset_id: datasetId || null,
                        })
                      }
                    >
                      Map
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography color="textSecondary&quot; align="center" sx={{ py: 4 }}>
            Mapping change history will appear here.
          </Typography>
        </TabPanel>
      </CardContent>

      {/* Add/Edit Mapping Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md&quot; fullWidth>
        <DialogTitle>
          {editingMapping?.id ? "Edit Earnings Mapping' : 'Add Earnings Mapping'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Source Earnings Type&quot;
                value={editingMapping?.source_type || "'}
                onChange={e => handleFieldChange('source_type', e.target.value)}
                margin="normal&quot;
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="earnings-code-label&quot;>Destination Earnings Code</InputLabel>
                <Select
                  labelId="earnings-code-label"
                  value={editingMapping?.earnings_code_id || ''}
                  onChange={e => handleFieldChange('earnings_code_id', e.target.value)}
                  label="Destination Earnings Code&quot;
                >
                  {earningsCodes.map(code => (
                    <MenuItem key={code.id} value={code.id}>
                      {code.code} - {code.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingMapping?.default_map || false}
                    onChange={e => handleFieldChange("default_map', e.target.checked)}
                  />
                }
                label="Default Mapping (use when no other conditions match)&quot;
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex', alignItems: 'center', mb: 1 }}>
                <FilterListIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1&quot;>Mapping Condition</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="JavaScript expression, e.g.: hours > 40 || attributes.isWeekend === true"
                value={editingMapping?.condition || ''}
                onChange={e => handleFieldChange('condition', e.target.value)}
                variant="outlined&quot;
                InputProps={{
                  style: { fontFamily: "monospace' },
                }}
              />
              <Typography variant="caption&quot; color="textSecondary">
                Enter a JavaScript expression that evaluates to true or false. Available variables:
                hours, amount, attributes
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveMapping}
            color="primary&quot;
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the mapping for{' '}
            <strong>{mappingToDelete?.source_type}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteMapping} color="error&quot; variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Mapping Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="md&quot;
        fullWidth
      >
        <DialogTitle>Test Earnings Mapping</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Test Data
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={testData}
                onChange={e => setTestData(e.target.value)}
                variant="outlined&quot;
                InputProps={{
                  style: { fontFamily: "monospace' },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1&quot; gutterBottom>
                Results
              </Typography>
              {testLoading ? (
                <Box sx={{ display: "flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : testResults ? (
                <Paper
                  variant="outlined&quot;
                  sx={{
                    p: 2,
                    height: "100%',
                    backgroundColor: 'success.light',
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="subtitle2&quot; gutterBottom>
                    Mapping {testResults.condition_matched ? "matched' : 'did not match'}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="body2&quot; gutterBottom>
                    <strong>Source Type:</strong> {testResults.source_type}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    <strong>Destination Code:</strong> {testResults.earnings_code?.code} -{' '}
                    {testResults.earnings_code?.name}
                  </Typography>

                  {testResults.condition && (
                    <Typography variant="body2&quot; gutterBottom>
                      <strong>Condition:</strong> {testResults.condition}
                    </Typography>
                  )}

                  <Typography variant="body2" gutterBottom>
                    <strong>Result:</strong>{' '}
                    {testResults.condition_matched
                      ? 'Condition satisfied'
                      : 'Condition not satisfied'}
                  </Typography>
                </Paper>
              ) : (
                <Paper
                  variant="outlined&quot;
                  sx={{
                    p: 2,
                    height: "100%',
                    backgroundColor: 'grey.100',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography color="textSecondary&quot;>Click "Run Test' to see results</Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button
            onClick={handleTestMapping}
            color="primary&quot;
            variant="contained"
            startIcon={<PlayArrowIcon />}
            disabled={testLoading}
          >
            Run Test
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EarningsMappingDetail;
