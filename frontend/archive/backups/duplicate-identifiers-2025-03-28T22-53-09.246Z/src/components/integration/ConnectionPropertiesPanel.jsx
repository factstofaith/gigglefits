/**
 * @component ConnectionPropertiesPanel
 * @description Component for configuring node connections in the integration flow.
 * Allows users to add, edit, and remove input and output connections with type-based 
 * configuration (data, control, event, reference).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Import design system components from adapter
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Select, 
  Chip, 
  Card, 
  CircularProgress, 
  Alert, 
  Dialog, 
  useTheme 
} from '../../design-system/adapter';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DataIcon from '@mui/icons-material/Storage';
import ControlIcon from '@mui/icons-material/SettingsRemote';
import EventIcon from '@mui/icons-material/Notifications';
import ReferenceIcon from '@mui/icons-material/Link';

// Import connection types from BaseNode
import { CONNECTION_TYPES } from '@components/integration/nodes/BaseNode';
import Box from '@mui/material/Box';
// Connection type icons mapping
const CONNECTION_TYPE_ICONS = {
  [CONNECTION_TYPES.DATA.id]: DataIcon,
  [CONNECTION_TYPES.CONTROL.id]: ControlIcon,
  [CONNECTION_TYPES.EVENT.id]: EventIcon,
  [CONNECTION_TYPES.REFERENCE.id]: ReferenceIcon
};

// Connection type options for select
const connectionTypeOptions = Object.values(CONNECTION_TYPES).map(type => ({
  value: type.id,
  label: type.name
}));

// Input/Output positions
const POSITION_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' }
];

// Connection card component to display a single connection
const ConnectionCard = ({ 
  connection, 
  onEdit, 
  onDelete, 
  direction = 'input',
  isConnected = false
}) => {
  // Added display name
  ConnectionCard.displayName = 'ConnectionCard';

  // Added display name
  ConnectionCard.displayName = 'ConnectionCard';

  // Added display name
  ConnectionCard.displayName = 'ConnectionCard';


  const { theme } = useTheme();
  const connectionType = CONNECTION_TYPES[connection.connectionType?.id] || CONNECTION_TYPES.DATA;
  const TypeIcon = CONNECTION_TYPE_ICONS[connectionType.id] || DataIcon;
  
  return (
    <Card
      sx={{
        p: 1.5,
        mb: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: `1px solid ${theme.colors.divider}`,
        borderLeft: `4px solid ${connectionType.color}`,
        position: 'relative',
        '&:hover': {
          boxShadow: theme.shadows[1]
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box 
          sx={{ 
            mr: 1.5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: `${connectionType.color}20`
          }}
        >
          <TypeIcon style={{ color: connectionType.color, fontSize: '1.2rem' }} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2">{connection.label || connection.id}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Chip 
              label={direction === 'input' ? 'Input' : 'Output'} 
              size="small" 
              sx={{ mr: 1, textTransform: 'uppercase', fontSize: '0.65rem', height: 20 }}
              color={direction === 'input' ? 'primary' : 'secondary'}
              variant="outlined"
            />
            <Chip 
              label={connectionType.name} 
              size="small" 
              sx={{ 
                textTransform: 'uppercase', 
                fontSize: '0.65rem', 
                height: 20,
                backgroundColor: `${connectionType.color}20`,
                color: connectionType.color,
                border: `1px solid ${connectionType.color}`
              }}
            />
            {isConnected && (
              <Chip 
                label="Connected" 
                size="small" 
                sx={{ ml: 1, textTransform: 'uppercase', fontSize: '0.65rem', height: 20 }}
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      </Box>
      
      <Box>
        <Button 
          variant="text" 
          color="primary" 
          size="small" 
          startIcon={<EditIcon />} 
          onClick={() => onEdit(connection)}
          sx={{ minWidth: 'auto', p: 0.5, mr: 0.5 }}
        >
          Edit
        </Button>
        <Button 
          variant="text" 
          color="error" 
          size="small" 
          startIcon={<DeleteIcon />} 
          onClick={() => onDelete(connection.id)}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          Delete
        </Button>
      </Box>
    </Card>
  );
};

// Connection edit dialog component
const ConnectionEditDialog = ({ 
  open, 
  onClose, 
  connection, 
  onSave, 
  isNewConnection = false,
  direction = 'input'
}) => {
  // Added display name
  ConnectionEditDialog.displayName = 'ConnectionEditDialog';

  // Added display name
  ConnectionEditDialog.displayName = 'ConnectionEditDialog';

  // Added display name
  ConnectionEditDialog.displayName = 'ConnectionEditDialog';


  const { theme } = useTheme();
  const [form, setForm] = useState({
    id: '',
    label: '',
    position: direction === 'input' ? 'left' : 'right',
    connectionType: CONNECTION_TYPES.DATA.id,
    validator: null
  });
  
  // Initialize form when connection changes
  useEffect(() => {
    if (connection) {
      setForm({
        id: connection.id || '',
        label: connection.label || '',
        position: connection.position || (direction === 'input' ? 'left' : 'right'),
        connectionType: connection.connectionType?.id || CONNECTION_TYPES.DATA.id,
        validator: connection.validator || null
      });
    }
  }, [connection, direction]);
  
  // Handle form field changes
  const handleChange = (field, value) => {
  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';


    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle save button click
  const handleSave = () => {
  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';

  // Added display name
  handleSave.displayName = 'handleSave';


    // Create connection object with correct connectionType reference
    const connectionTypeObj = Object.values(CONNECTION_TYPES).find(type => type.id === form.connectionType);
    
    onSave({
      ...form,
      connectionType: connectionTypeObj
    });
    
    onClose();
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${isNewConnection ? 'Add' : 'Edit'} ${direction === 'input' ? 'Input' : 'Output'} Connection`}
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            disabled={!form.id || !form.label}
            startIcon={<SaveIcon />}
          >
            Save Connection
          </Button>
        </>
      }
    >
      <Box sx={{ pt: 1, pb: 2 }}>
        <TextField
          label="Connection ID"
          value={form.id}
          onChange={(e) => handleChange('id', e.target.value)}
          fullWidth
          required
          disabled={!isNewConnection}
          helperText={isNewConnection ? "Unique identifier for this connection" : "Connection ID cannot be changed"}
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="Connection Label"
          value={form.label}
          onChange={(e) => handleChange('label', e.target.value)}
          fullWidth
          required
          helperText="User-friendly name for this connection"
          sx={{ mb: 2 }}
        />
        
        <Select
          label="Connection Type"
          value={form.connectionType}
          onChange={(e) => handleChange('connectionType', e.target.value)}
          options={connectionTypeOptions}
          fullWidth
          required
          helperText="Data type that flows through this connection"
          sx={{ mb: 2 }}
        />
        
        <Select
          label="Position"
          value={form.position}
          onChange={(e) => handleChange('position', e.target.value)}
          options={POSITION_OPTIONS}
          fullWidth
          required
          helperText="Position of the connection handle on the node"
          sx={{ mb: 2 }}
        />
        
        <Alert 
          severity="info" 
          sx={{ mt: 1 }}
        >
          <Typography variant="body2">
            {isNewConnection 
              ? "New connections will appear in the node's property panel and can be connected in the flow canvas." 
              : "Changes will update this connection in the flow canvas and node properties."}
          </Typography>
        </Alert>
      </Box>
    </Dialog>
  );
};

// Main component
const ConnectionPropertiesPanel = ({ 
  nodeData,
  onSaveConnectionConfig,
  nodeType = 'Node',
  readOnly = false,
  loading = false,
  error = null
}) => {
  // Added display name
  ConnectionPropertiesPanel.displayName = 'ConnectionPropertiesPanel';

  // Added display name
  ConnectionPropertiesPanel.displayName = 'ConnectionPropertiesPanel';

  // Added display name
  ConnectionPropertiesPanel.displayName = 'ConnectionPropertiesPanel';


  const { theme } = useTheme();
  
  // Initialize state from node data
  const [inputConnections, setInputConnections] = useState([]);
  const [outputConnections, setOutputConnections] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentConnection, setCurrentConnection] = useState(null);
  const [currentDirection, setCurrentDirection] = useState('input');
  const [isNewConnection, setIsNewConnection] = useState(false);
  
  // Initialize from node data
  useEffect(() => {
    if (nodeData) {
      // Convert connection types from strings to objects if needed
      const processConnections = (connections) => {
  // Added display name
  processConnections.displayName = 'processConnections';

  // Added display name
  processConnections.displayName = 'processConnections';

  // Added display name
  processConnections.displayName = 'processConnections';


        if (!connections) return [];
        
        return connections.map(conn => {
          // If connectionType is a string ID, convert to full object
          if (typeof conn.connectionType === 'string') {
            const connectionTypeObj = Object.values(CONNECTION_TYPES)
              .find(type => type.id === conn.connectionType);
            
            return {
              ...conn,
              connectionType: connectionTypeObj || CONNECTION_TYPES.DATA
            };
          }
          // If already has connectionType object
          else if (conn.connectionType && conn.connectionType.id) {
            return conn;
          }
          // Default to DATA type
          else {
            return {
              ...conn,
              connectionType: CONNECTION_TYPES.DATA
            };
          }
        });
      };
      
      setInputConnections(processConnections(nodeData.inputConnections) || []);
      setOutputConnections(processConnections(nodeData.outputConnections) || []);
    }
  }, [nodeData]);
  
  // Check if connections are currently in use
  const getConnectionStates = useCallback(() => {
  // Added display name
  getConnectionStates.displayName = 'getConnectionStates';

    const inputs = {};
    const outputs = {};
    
    // Process connection states from nodeData if available
    if (nodeData && nodeData.connections) {
      if (nodeData.connections.inputs) {
        Object.keys(nodeData.connections.inputs).forEach(id => {
          inputs[id] = nodeData.connections.inputs[id] || [];
        });
      }
      
      if (nodeData.connections.outputs) {
        Object.keys(nodeData.connections.outputs).forEach(id => {
          outputs[id] = nodeData.connections.outputs[id] || [];
        });
      }
    }
    
    return { inputs, outputs };
  }, [nodeData]);
  
  const connectionStates = useMemo(() => getConnectionStates(), [getConnectionStates]);
  
  // Handle opening add/edit dialog
  const handleAddConnection = (direction) => {
  // Added display name
  handleAddConnection.displayName = 'handleAddConnection';

  // Added display name
  handleAddConnection.displayName = 'handleAddConnection';

  // Added display name
  handleAddConnection.displayName = 'handleAddConnection';


    setCurrentDirection(direction);
    setCurrentConnection({
      id: '',
      label: '',
      position: direction === 'input' ? 'left' : 'right',
      connectionType: CONNECTION_TYPES.DATA
    });
    setIsNewConnection(true);
    setEditDialogOpen(true);
  };
  
  const handleEditConnection = (connection, direction) => {
  // Added display name
  handleEditConnection.displayName = 'handleEditConnection';

  // Added display name
  handleEditConnection.displayName = 'handleEditConnection';

  // Added display name
  handleEditConnection.displayName = 'handleEditConnection';


    setCurrentDirection(direction);
    setCurrentConnection(connection);
    setIsNewConnection(false);
    setEditDialogOpen(true);
  };
  
  // Handle saving connection changes
  const handleSaveConnection = (connection) => {
  // Added display name
  handleSaveConnection.displayName = 'handleSaveConnection';

  // Added display name
  handleSaveConnection.displayName = 'handleSaveConnection';

  // Added display name
  handleSaveConnection.displayName = 'handleSaveConnection';


    if (currentDirection === 'input') {
      if (isNewConnection) {
        setInputConnections(prev => [...prev, connection]);
      } else {
        setInputConnections(prev => 
          prev.map(conn => conn.id === connection.id ? connection : conn)
        );
      }
    } else {
      if (isNewConnection) {
        setOutputConnections(prev => [...prev, connection]);
      } else {
        setOutputConnections(prev => 
          prev.map(conn => conn.id === connection.id ? connection : conn)
        );
      }
    }
  };
  
  // Handle deleting a connection
  const handleDeleteConnection = (id, direction) => {
  // Added display name
  handleDeleteConnection.displayName = 'handleDeleteConnection';

  // Added display name
  handleDeleteConnection.displayName = 'handleDeleteConnection';

  // Added display name
  handleDeleteConnection.displayName = 'handleDeleteConnection';


    if (direction === 'input') {
      setInputConnections(prev => prev.filter(conn => conn.id !== id));
    } else {
      setOutputConnections(prev => prev.filter(conn => conn.id !== id));
    }
  };
  
  // Handle saving the full connection configuration
  const handleSaveConfig = () => {
  // Added display name
  handleSaveConfig.displayName = 'handleSaveConfig';

  // Added display name
  handleSaveConfig.displayName = 'handleSaveConfig';

  // Added display name
  handleSaveConfig.displayName = 'handleSaveConfig';


    onSaveConnectionConfig({
      inputConnections,
      outputConnections
    });
  };
  
  // Check if connection is in use
  const isConnectionInUse = (id, direction) => {
  // Added display name
  isConnectionInUse.displayName = 'isConnectionInUse';

  // Added display name
  isConnectionInUse.displayName = 'isConnectionInUse';

  // Added display name
  isConnectionInUse.displayName = 'isConnectionInUse';


    const connections = direction === 'input' 
      ? connectionStates.inputs 
      : connectionStates.outputs;
      
    return connections[id] && connections[id].length > 0;
  };
  
  // Render the component
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.colors.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">
          {nodeType} Connection Configuration
        </Typography>
        
        {!readOnly && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveConfig}
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Configuration'}
          </Button>
        )}
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Input Connections */}
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1.5
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Input Connections
            </Typography>
            
            {!readOnly && (
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => handleAddConnection('input')}
              >
                Add Input
              </Button>
            )}
          </Box>
          
          {inputConnections.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No input connections configured. {!readOnly && 'Click "Add Input" to create one.'}
            </Alert>
          ) : (
            inputConnections.map(connection => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                direction="input"
                onEdit={() => handleEditConnection(connection, 'input')}
                onDelete={() => handleDeleteConnection(connection.id, 'input')}
                isConnected={isConnectionInUse(connection.id, 'input')}
              />
            ))
          )}
        </Box>
        
        {/* Output Connections */}
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1.5
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Output Connections
            </Typography>
            
            {!readOnly && (
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => handleAddConnection('output')}
              >
                Add Output
              </Button>
            )}
          </Box>
          
          {outputConnections.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No output connections configured. {!readOnly && 'Click "Add Output" to create one.'}
            </Alert>
          ) : (
            outputConnections.map(connection => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                direction="output"
                onEdit={() => handleEditConnection(connection, 'output')}
                onDelete={() => handleDeleteConnection(connection.id, 'output')}
                isConnected={isConnectionInUse(connection.id, 'output')}
              />
            ))
          )}
        </Box>
        
        {/* Connection Type Legend */}
        <Box sx={{ mt: 4, p: 2, border: `1px solid ${theme.colors.divider}`, borderRadius: theme.shape.borderRadius }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Connection Types
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {Object.values(CONNECTION_TYPES).map(type => {
              const TypeIcon = CONNECTION_TYPE_ICONS[type.id] || DataIcon;
              return (
                <Box 
                  key={type.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 1,
                    borderRadius: theme.shape.borderRadius,
                    border: `1px solid ${type.color}20`,
                    backgroundColor: `${type.color}10`,
                    flex: '1 1 45%'
                  }}
                >
                  <TypeIcon sx={{ color: type.color, mr: 1 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: type.color }}>
                      {type.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {type.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
      
      {/* Connection Edit Dialog */}
      <ConnectionEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        connection={currentConnection}
        onSave={handleSaveConnection}
        isNewConnection={isNewConnection}
        direction={currentDirection}
      />
    </Box>
  );
};

export default ConnectionPropertiesPanel;