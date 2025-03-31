/**
 * @component DatasetNodePropertiesPanel
 * @description Specialized properties panel for Dataset nodes that allows selection and configuration
 * of datasets, showing schema information and connection options.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Import design system components from adapter
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Select, 
  Chip, 
  Switch,
  Slider,
  CircularProgress, 
  Alert, 
  Card, 
  Stack,
  Tabs,
  Dialog, 
  useTheme 
} from '../../design-system/adapter';

// Import icons
import StorageIcon from '@mui/icons-material/Storage';
import SchemaIcon from '@mui/icons-material/Schema';
import RefreshIcon from '@mui/icons-material/Refresh';
import DatasetIcon from '@mui/icons-material/Dataset';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CodeIcon from '@mui/icons-material/Code';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DataObjectIcon from '@mui/icons-material/DataObject';

// Import services
import { getDatasets, associateDataset } from '@services/integrationService';

// Import schema discovery utility
import { discoverSchema, formatSchema } from '@utils/schemaDiscovery';
import { Tab } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
;
// Removed duplicate import
/**
 * Field Display Component
 */
const FieldDisplay = ({ field }) => {
  // Added display name
  FieldDisplay.displayName = 'FieldDisplay';

  // Added display name
  FieldDisplay.displayName = 'FieldDisplay';

  // Added display name
  FieldDisplay.displayName = 'FieldDisplay';

  // Added display name
  FieldDisplay.displayName = 'FieldDisplay';

  // Added display name
  FieldDisplay.displayName = 'FieldDisplay';


  const { theme } = useTheme();
  
  const getTypeColor = (type) => {
  // Added display name
  getTypeColor.displayName = 'getTypeColor';

  // Added display name
  getTypeColor.displayName = 'getTypeColor';

  // Added display name
  getTypeColor.displayName = 'getTypeColor';

  // Added display name
  getTypeColor.displayName = 'getTypeColor';

  // Added display name
  getTypeColor.displayName = 'getTypeColor';


    switch (type.toLowerCase()) {
      case 'string': return theme.colors.primary.main;
      case 'number': return theme.colors.success.main;
      case 'boolean': return theme.colors.warning.main;
      case 'date': case 'datetime': return theme.colors.info.main;
      case 'object': return theme.colors.secondary.main;
      case 'array': return theme.colors.error.main;
      default: return theme.colors.text.secondary;
    }
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: 0.75,
        borderBottom: `1px solid ${theme.colors.divider}`,
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2&quot; sx={{ fontWeight: field.required ? "bold' : 'normal' }}>
          {field.name}
          {field.required && <span style={{ color: theme.colors.error.main }}> *</span>}
        </Typography>
      </Box>
      
      <Chip 
        label={field.type} 
        size="small&quot;
        sx={{ 
          bgcolor: `${getTypeColor(field.type)}20`,
          color: getTypeColor(field.type),
          fontFamily: "monospace',
          fontSize: '0.7rem',
          height: '20px'
        }}
      />
    </Box>
  );
};

/**
 * Dataset Card Component
 */
/**
 * Schema Discovery Dialog Component
 */
const SchemaDiscoveryDialog = ({ open, onClose, onApplySchema }) => {
  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';

  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';

  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';

  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';

  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';


  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sampleData, setSampleData] = useState('');
  const [discoveredSchema, setDiscoveredSchema] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState(null);
  const [schemaFormat, setSchemaFormat] = useState('standard');
  const [discoveryOptions, setDiscoveryOptions] = useState({
    typeInferenceThreshold: 0.7,
    detectRelationships: true,
    inferRequired: true,
    detectPrimaryKeys: true
  });
  
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
  
  // Handle file upload
  const handleFileUpload = (event) => {
  // Added display name
  handleFileUpload.displayName = 'handleFileUpload';

  // Added display name
  handleFileUpload.displayName = 'handleFileUpload';

  // Added display name
  handleFileUpload.displayName = 'handleFileUpload';

  // Added display name
  handleFileUpload.displayName = 'handleFileUpload';

  // Added display name
  handleFileUpload.displayName = 'handleFileUpload';


    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Try to parse as JSON
        const content = e.target.result;
        setSampleData(content);
      } catch (err) {
        setError('Invalid file format. Please upload a valid JSON file.');
      }
    };
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
  // Added display name
  handleUploadClick.displayName = 'handleUploadClick';

  // Added display name
  handleUploadClick.displayName = 'handleUploadClick';

  // Added display name
  handleUploadClick.displayName = 'handleUploadClick';

  // Added display name
  handleUploadClick.displayName = 'handleUploadClick';

  // Added display name
  handleUploadClick.displayName = 'handleUploadClick';


    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle discovery options change
  const handleOptionChange = (option, value) => {
  // Added display name
  handleOptionChange.displayName = 'handleOptionChange';

  // Added display name
  handleOptionChange.displayName = 'handleOptionChange';

  // Added display name
  handleOptionChange.displayName = 'handleOptionChange';

  // Added display name
  handleOptionChange.displayName = 'handleOptionChange';

  // Added display name
  handleOptionChange.displayName = 'handleOptionChange';


    setDiscoveryOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  // Handle discover button click
  const handleDiscover = () => {
  // Added display name
  handleDiscover.displayName = 'handleDiscover';

  // Added display name
  handleDiscover.displayName = 'handleDiscover';

  // Added display name
  handleDiscover.displayName = 'handleDiscover';

  // Added display name
  handleDiscover.displayName = 'handleDiscover';

  // Added display name
  handleDiscover.displayName = 'handleDiscover';


    setIsDiscovering(true);
    setError(null);
    
    try {
      // Parse sample data
      let parsedData;
      try {
        parsedData = JSON.parse(sampleData);
      } catch (err) {
        throw new Error('Invalid JSON format. Please check your sample data.');
      }
      
      // Discover schema
      const schema = discoverSchema(parsedData, discoveryOptions);
      
      // Format schema
      const formattedSchema = formatSchema(schema, {
        format: schemaFormat,
        includeConfidenceScores: true,
        includeAnalysis: true
      });
      
      setDiscoveredSchema(schema);
      setIsDiscovering(false);
    } catch (err) {
      setError(err.message);
      setIsDiscovering(false);
    }
  };
  
  // Handle apply schema button click
  const handleApplySchema = () => {
  // Added display name
  handleApplySchema.displayName = 'handleApplySchema';

  // Added display name
  handleApplySchema.displayName = 'handleApplySchema';

  // Added display name
  handleApplySchema.displayName = 'handleApplySchema';

  // Added display name
  handleApplySchema.displayName = 'handleApplySchema';

  // Added display name
  handleApplySchema.displayName = 'handleApplySchema';


    if (!discoveredSchema) return;
    
    // Format the schema for the dataset
    const formattedSchema = formatSchema(discoveredSchema, {
      format: 'standard',
      simplifyTypes: true
    });
    
    onApplySchema(formattedSchema);
    onClose();
  };
  
  // Handle schema format change
  const handleFormatChange = (event) => {
  // Added display name
  handleFormatChange.displayName = 'handleFormatChange';

  // Added display name
  handleFormatChange.displayName = 'handleFormatChange';

  // Added display name
  handleFormatChange.displayName = 'handleFormatChange';

  // Added display name
  handleFormatChange.displayName = 'handleFormatChange';

  // Added display name
  handleFormatChange.displayName = 'handleFormatChange';


    setSchemaFormat(event.target.value);
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Discover Dataset Schema&quot;
      maxWidth="md"
      fullWidth
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="body2&quot; color="text.secondary" sx={{ mb: 3 }}>
          Upload a sample data file or paste JSON data to automatically discover the dataset schema.
          The schema discovery tool will analyze your data and generate a structured schema definition.
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="Schema discovery tabs"
          sx={{ mb: 2 }}
        >
          <Tabs.Tab label="Upload Data&quot; icon={<UploadFileIcon />} value={0} />
          <Tabs.Tab label="Paste JSON" icon={<CodeIcon />} value={1} />
          <Tabs.Tab label="Options&quot; icon={<AutoFixHighIcon />} value={2} />
        </Tabs>
        
        {activeTab === 0 && (
          <Box>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json,.csv&quot;
              onChange={handleFileUpload}
            />
            
            <Box 
              sx={{ 
                border: "2px dashed', 
                borderColor: 'divider',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover'
                }
              }}
              onClick={handleUploadClick}
            >
              <UploadFileIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1&quot; sx={{ mb: 1 }}>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" color="text.secondary&quot;>
                Supported formats: JSON, CSV (up to 10MB)
              </Typography>
            </Box>
            
            {sampleData && (
              <Alert severity="success" sx={{ mt: 2 }}>
                File uploaded successfully. Click "Discover Schema" to analyze.
              </Alert>
            )}
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <TextField
              multiline
              rows={10}
              fullWidth
              placeholder="Paste JSON data here. For example: [{&quot;id": 1, "name": "Sample Product", "price": 29.99}]'
              value={sampleData}
              onChange={(e) => setSampleData(e.target.value)}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle2&quot; sx={{ mb: 2 }}>
              Discovery Options
            </Typography>
            
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Type Inference Threshold: {discoveryOptions.typeInferenceThreshold}
                </Typography>
                <Slider
                  value={discoveryOptions.typeInferenceThreshold}
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  onChange={(e, value) => handleOptionChange('typeInferenceThreshold', value)}
                  valueLabelDisplay="auto&quot;
                  sx={{ width: "100%' }}
                />
                <Typography variant="caption&quot; color="text.secondary">
                  Higher values require more confidence in type detection
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Switch
                    checked={discoveryOptions.detectRelationships}
                    onChange={(e) => handleOptionChange('detectRelationships', e.target.checked)}
                  />
                  <Typography variant="body2&quot;>
                    Detect Relationships
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex', alignItems: 'center' }}>
                  <Switch
                    checked={discoveryOptions.inferRequired}
                    onChange={(e) => handleOptionChange('inferRequired', e.target.checked)}
                  />
                  <Typography variant="body2&quot;>
                    Infer Required Fields
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex', alignItems: 'center' }}>
                  <Switch
                    checked={discoveryOptions.detectPrimaryKeys}
                    onChange={(e) => handleOptionChange('detectPrimaryKeys', e.target.checked)}
                  />
                  <Typography variant="body2&quot;>
                    Detect Primary Keys
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  Schema Format
                </Typography>
                <Select
                  value={schemaFormat}
                  onChange={handleFormatChange}
                  options={[
                    { value: 'standard', label: 'Standard (TAP Format)' },
                    { value: 'json-schema', label: 'JSON Schema' },
                    { value: 'graphql', label: 'GraphQL' },
                    { value: 'mongoose', label: 'Mongoose Schema' }
                  ]}
                  fullWidth
                />
              </Box>
            </Stack>
          </Box>
        )}
        
        {error && (
          <Alert severity="error&quot; sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {discoveredSchema && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Discovered Schema ({discoveredSchema.fields.length} fields)
            </Typography>
            
            <Box 
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                mt: 1,
                maxHeight: 200,
                overflow: 'auto'
              }}
            >
              {discoveredSchema.fields.map((field, index) => (
                <FieldDisplay key={index} field={field} />
              ))}
            </Box>
            
            {discoveredSchema.analysis && discoveredSchema.analysis.relationships && discoveredSchema.analysis.relationships.length > 0 && (
              <Alert severity="info&quot; sx={{ mt: 2 }}>
                <Typography variant="caption">
                  {discoveredSchema.analysis.relationships.length} potential relationship{discoveredSchema.analysis.relationships.length !== 1 ? 's' : ''} detected.
                </Typography>
              </Alert>
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined&quot; onClick={onClose}>
            Cancel
          </Button>
          
          <Box>
            <Button 
              variant="outlined" 
              color="primary&quot; 
              onClick={handleDiscover} 
              disabled={!sampleData || isDiscovering}
              startIcon={isDiscovering ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
              sx={{ mr: 2 }}
            >
              {isDiscovering ? "Discovering...' : 'Discover Schema'}
            </Button>
            
            <Button 
              variant="contained&quot; 
              color="primary" 
              onClick={handleApplySchema}
              disabled={!discoveredSchema}
            >
              Apply Schema
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

/**
 * Dataset Card Component
 */
const DatasetCard = ({ dataset, onSelect, isSelected }) => {
  // Added display name
  DatasetCard.displayName = 'DatasetCard';

  // Added display name
  DatasetCard.displayName = 'DatasetCard';

  // Added display name
  DatasetCard.displayName = 'DatasetCard';

  // Added display name
  DatasetCard.displayName = 'DatasetCard';

  // Added display name
  DatasetCard.displayName = 'DatasetCard';


  const { theme } = useTheme();
  
  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        cursor: 'pointer',
        border: isSelected ? `2px solid ${theme.colors.primary.main}` : '1px solid',
        borderColor: 'divider',
        boxShadow: isSelected ? 2 : 0,
        '&:hover': {
          boxShadow: 1,
          borderColor: 'primary.main',
        },
        position: 'relative'
      }}
      onClick={() => onSelect(dataset.id)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <DatasetIcon 
          sx={{ 
            mr: 1, 
            color: isSelected ? 'primary.main' : 'text.secondary',
            fontSize: '1.5rem'
          }} 
        />
        <Box>
          <Typography variant="subtitle1&quot; sx={{ fontWeight: "medium' }}>
            {dataset.name}
          </Typography>
          <Typography variant="caption&quot; color="text.secondary">
            {dataset.description || 'No description available'}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Chip 
          size="small&quot; 
          label={`${dataset.fields?.length || 0} fields`} 
          sx={{ mr: 1, height: "20px' }}
        />
        <Typography variant="caption&quot; color="text.secondary">
          {new Date(dataset.updatedAt || dataset.createdAt || Date.now()).toLocaleDateString()}
        </Typography>
      </Box>
      
      {isSelected && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            bgcolor: 'primary.main' 
          }}
        />
      )}
    </Card>
  );
};

/**
 * Main Dataset Node Properties Panel Component
 */
const DatasetNodePropertiesPanel = ({ 
  nodeData, 
  onUpdateNode, 
  integrationId,
  readOnly = false,
  isAdmin = false
}) => {
  // Added display name
  DatasetNodePropertiesPanel.displayName = 'DatasetNodePropertiesPanel';

  // Added display name
  DatasetNodePropertiesPanel.displayName = 'DatasetNodePropertiesPanel';

  // Added display name
  DatasetNodePropertiesPanel.displayName = 'DatasetNodePropertiesPanel';

  // Added display name
  DatasetNodePropertiesPanel.displayName = 'DatasetNodePropertiesPanel';

  // Added display name
  DatasetNodePropertiesPanel.displayName = 'DatasetNodePropertiesPanel';


  const { theme } = useTheme();
  
  // State variables
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState(nodeData.datasetId || '');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSchema, setShowSchema] = useState(true);
  const [isSchemaDiscoveryOpen, setIsSchemaDiscoveryOpen] = useState(false);
  const [isCreatingDataset, setIsCreatingDataset] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newDatasetDescription, setNewDatasetDescription] = useState('');
  
  // Fetch datasets when component mounts
  useEffect(() => {
    fetchDatasets();
  }, [integrationId]);
  
  // Update selected dataset whenever we get new datasets or the ID changes
  useEffect(() => {
    if (datasets.length > 0 && selectedDatasetId) {
      const dataset = datasets.find(d => d.id === selectedDatasetId);
      setSelectedDataset(dataset || null);
    } else {
      setSelectedDataset(null);
    }
  }, [datasets, selectedDatasetId]);
  
  // Initialize from node data
  useEffect(() => {
    if (nodeData && nodeData.datasetId) {
      setSelectedDatasetId(nodeData.datasetId);
    }
  }, [nodeData]);
  
  // Fetch datasets from the API
  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getDatasets();
      setDatasets(data || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError('Failed to load datasets. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle dataset selection
  const handleSelectDataset = (datasetId) => {
  // Added display name
  handleSelectDataset.displayName = 'handleSelectDataset';

  // Added display name
  handleSelectDataset.displayName = 'handleSelectDataset';

  // Added display name
  handleSelectDataset.displayName = 'handleSelectDataset';

  // Added display name
  handleSelectDataset.displayName = 'handleSelectDataset';

  // Added display name
  handleSelectDataset.displayName = 'handleSelectDataset';


    if (readOnly) return;
    
    setSelectedDatasetId(datasetId);
    
    // Update node data with selected dataset
    onUpdateNode({
      ...nodeData,
      datasetId,
      label: datasets.find(d => d.id === datasetId)?.name || 'Dataset'
    });
  };
  
  // Handle schema discovery dialog
  const handleOpenSchemaDiscovery = () => {
  // Added display name
  handleOpenSchemaDiscovery.displayName = 'handleOpenSchemaDiscovery';

  // Added display name
  handleOpenSchemaDiscovery.displayName = 'handleOpenSchemaDiscovery';

  // Added display name
  handleOpenSchemaDiscovery.displayName = 'handleOpenSchemaDiscovery';

  // Added display name
  handleOpenSchemaDiscovery.displayName = 'handleOpenSchemaDiscovery';

  // Added display name
  handleOpenSchemaDiscovery.displayName = 'handleOpenSchemaDiscovery';


    setIsSchemaDiscoveryOpen(true);
  };
  
  const handleCloseSchemaDiscovery = () => {
  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';


    setIsSchemaDiscoveryOpen(false);
  };
  
  // Handle applying discovered schema
  const handleApplyDiscoveredSchema = (schema) => {
  // Added display name
  handleApplyDiscoveredSchema.displayName = 'handleApplyDiscoveredSchema';

  // Added display name
  handleApplyDiscoveredSchema.displayName = 'handleApplyDiscoveredSchema';

  // Added display name
  handleApplyDiscoveredSchema.displayName = 'handleApplyDiscoveredSchema';

  // Added display name
  handleApplyDiscoveredSchema.displayName = 'handleApplyDiscoveredSchema';

  // Added display name
  handleApplyDiscoveredSchema.displayName = 'handleApplyDiscoveredSchema';


    if (!selectedDataset) return;
    
    // Clone the selected dataset
    const updatedDataset = { ...selectedDataset, fields: schema.fields };
    
    // Update the datasets list
    const updatedDatasets = datasets.map(d => 
      d.id === selectedDataset.id ? updatedDataset : d
    );
    
    setDatasets(updatedDatasets);
    setSelectedDataset(updatedDataset);
    
    // In a real application, you would also save this to the backend
    // For now, we'll just update the local state
  };
  
  // Handle creating a new dataset
  const handleCreateDataset = () => {
  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';


    setIsCreatingDataset(true);
    setNewDatasetName('');
    setNewDatasetDescription('');
  };
  
  const handleCancelCreateDataset = () => {
  // Added display name
  handleCancelCreateDataset.displayName = 'handleCancelCreateDataset';

  // Added display name
  handleCancelCreateDataset.displayName = 'handleCancelCreateDataset';

  // Added display name
  handleCancelCreateDataset.displayName = 'handleCancelCreateDataset';

  // Added display name
  handleCancelCreateDataset.displayName = 'handleCancelCreateDataset';

  // Added display name
  handleCancelCreateDataset.displayName = 'handleCancelCreateDataset';


    setIsCreatingDataset(false);
  };
  
  const handleSaveNewDataset = () => {
  // Added display name
  handleSaveNewDataset.displayName = 'handleSaveNewDataset';

  // Added display name
  handleSaveNewDataset.displayName = 'handleSaveNewDataset';

  // Added display name
  handleSaveNewDataset.displayName = 'handleSaveNewDataset';

  // Added display name
  handleSaveNewDataset.displayName = 'handleSaveNewDataset';

  // Added display name
  handleSaveNewDataset.displayName = 'handleSaveNewDataset';


    if (!newDatasetName.trim()) return;
    
    // Generate a mock dataset ID for now
    const newDataset = {
      id: `ds-${Date.now()}`,
      name: newDatasetName.trim(),
      description: newDatasetDescription.trim(),
      fields: [],
      createdAt: new Date().toISOString()
    };
    
    // Add to the datasets list
    setDatasets([...datasets, newDataset]);
    
    // Select the new dataset
    handleSelectDataset(newDataset.id);
    
    // Close the creation dialog and open the schema discovery dialog
    setIsCreatingDataset(false);
    setIsSchemaDiscoveryOpen(true);
  };
  
  // Filter datasets based on search term
  const filteredDatasets = datasets.filter(dataset => 
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dataset.description && dataset.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header section */}
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Typography variant="h6&quot;>Dataset Configuration</Typography>
        <Typography variant="body2" color="text.secondary&quot; sx={{ mb: 2 }}>
          Select a dataset to use in your integration flow. Datasets define the structure of data 
          that can be shared between applications.
        </Typography>
        
        <TextField
          placeholder="Search datasets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          disabled={loading}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2&quot;>
            {filteredDatasets.length} Dataset{filteredDatasets.length !== 1 ? "s' : ''}
          </Typography>
          
          <Box>
            <Button 
              variant="text&quot; 
              size="small" 
              startIcon={<RefreshIcon />} 
              onClick={fetchDatasets}
              disabled={loading}
            >
              Refresh
            </Button>
            
            {isAdmin && (
              <Button 
                variant="outlined&quot; 
                size="small" 
                startIcon={<AddIcon />} 
                sx={{ ml: 1 }}
                disabled={loading || readOnly}
                onClick={handleCreateDataset}
              >
                Create New
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Datasets list (scrollable) */}
      <Box 
        sx={{ 
          flex: selectedDataset ? 0.4 : 1,
          overflow: 'auto', 
          px: 2, 
          pb: 2,
          transition: 'flex 0.3s ease'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error&quot; 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small&quot; onClick={fetchDatasets}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : filteredDatasets.length === 0 ? (
          <Box sx={{ textAlign: "center', py: 4 }}>
            <Typography color="text.secondary&quot;>
              {searchTerm 
                ? "No datasets match your search term' 
                : 'No datasets available. Create a dataset first.'}
            </Typography>
            {searchTerm && (
              <Button 
                variant="text&quot; 
                sx={{ mt: 1 }} 
                onClick={() => setSearchTerm("')}
              >
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          <>
            {filteredDatasets.map(dataset => (
              <DatasetCard 
                key={dataset.id}
                dataset={dataset}
                onSelect={handleSelectDataset}
                isSelected={selectedDatasetId === dataset.id}
              />
            ))}
          </>
        )}
      </Box>
      
      {/* Selected dataset details */}
      {selectedDataset && (
        <>
          <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1&quot; sx={{ fontWeight: "medium' }}>
                Selected Dataset
              </Typography>
              
              <Box>
                <Button 
                  size="small&quot; 
                  variant="text" 
                  startIcon={<AutoFixHighIcon />}
                  disabled={readOnly}
                  onClick={handleOpenSchemaDiscovery}
                  sx={{ mr: 1 }}
                >
                  Discover Schema
                </Button>
                
                <Button 
                  size="small&quot; 
                  variant="text" 
                  startIcon={<EditIcon />}
                  disabled={readOnly}
                >
                  Edit Schema
                </Button>
              </Box>
            </Box>
            
            <Typography variant="body2&quot;>
              {selectedDataset.name}
            </Typography>
            
            <Switch
              label="Show Schema"
              checked={showSchema}
              onChange={(e) => setShowSchema(e.target.checked)}
              sx={{ mt: 1 }}
            />
          </Box>
          
          {showSchema && (
            <Box 
              sx={{ 
                flex: 0.6, 
                overflow: 'auto', 
                px: 2, 
                pb: 2,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center', 
                  py: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchemaIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle2&quot;>
                    Dataset Schema
                  </Typography>
                </Box>
                
                {selectedDataset.fields && selectedDataset.fields.length > 0 && (
                  <Chip 
                    size="small" 
                    label={`${selectedDataset.fields.length} fields`} 
                    sx={{ height: '20px' }}
                  />
                )}
              </Box>
              
              <Box 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                {selectedDataset.fields && selectedDataset.fields.length > 0 ? (
                  <Box sx={{ p: 1 }}>
                    {selectedDataset.fields.map((field, index) => (
                      <FieldDisplay key={index} field={field} />
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                    <DataObjectIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2&quot; color="text.secondary">
                      No fields defined for this dataset
                    </Typography>
                    <Button 
                      variant="outlined&quot; 
                      startIcon={<AutoFixHighIcon />} 
                      sx={{ mt: 2 }}
                      onClick={handleOpenSchemaDiscovery}
                      disabled={readOnly}
                    >
                      Discover Schema
                    </Button>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: "flex', mt: 2 }}>
                <InfoIcon fontSize="small&quot; sx={{ color: "info.main', mr: 1, flexShrink: 0, mt: 0.5 }} />
                <Typography variant="caption&quot; color="text.secondary">
                  This dataset can be connected to multiple applications, allowing data to flow 
                  between systems while maintaining a consistent structure.
                </Typography>
              </Box>
            </Box>
          )}
        </>
      )}
      
      {/* Schema Discovery Dialog */}
      <SchemaDiscoveryDialog 
        open={isSchemaDiscoveryOpen}
        onClose={handleCloseSchemaDiscovery}
        onApplySchema={handleApplyDiscoveredSchema}
      />
      
      {/* Create Dataset Dialog */}
      <Dialog
        open={isCreatingDataset}
        onClose={handleCancelCreateDataset}
        title="Create New Dataset&quot;
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <TextField
            label="Dataset Name&quot;
            value={newDatasetName}
            onChange={(e) => setNewDatasetName(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Description"
            value={newDatasetDescription}
            onChange={(e) => setNewDatasetDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined&quot; 
              onClick={handleCancelCreateDataset} 
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveNewDataset}
              disabled={!newDatasetName.trim()}
            >
              Create & Configure Schema
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default DatasetNodePropertiesPanel;