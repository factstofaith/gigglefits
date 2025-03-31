/**
 * Integration Flow Canvas
 *
 * A complete integration flow canvas that combines the flow canvas with
 * a node panel and properties panel.
 *
 * @component
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Paper, Tabs, Tab, Divider, IconButton, Tooltip } from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as RunIcon,
  SettingsBackupRestore as ResetIcon,
  History as HistoryIcon,
  Code as CodeIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';

// Import flow components
import FlowCanvas from './FlowCanvas';
import NodePanel from './NodePanel';

/**
 * Integration Flow Canvas component
 */
const IntegrationFlowCanvas = ({
  initialElements = [],
  readOnly = false,
  userPermissions = [],
  onSave,
  onRun,
  onChange,
}) => {
  // State for flow elements
  const [elements, setElements] = useState(initialElements);
  
  // State for selected node/edge
  const [selectedElement, setSelectedElement] = useState(null);
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // State for sidebar tabs
  const [sidebarTab, setSidebarTab] = useState(0);
  
  // Handle flow elements change
  const handleElementsChange = useCallback((newElements) => {
    setElements(newElements);
    if (onChange) {
      onChange(newElements);
    }
  }, [onChange]);
  
  // Handle node selection
  const handleNodeSelect = useCallback((node) => {
    setSelectedElement({ ...node, type: 'node' });
    setSidebarTab(1); // Switch to properties tab
  }, []);
  
  // Handle edge selection
  const handleEdgeSelect = useCallback((edge) => {
    setSelectedElement({ ...edge, type: 'edge' });
    setSidebarTab(1); // Switch to properties tab
  }, []);
  
  // Handle flow validation
  const handleValidate = useCallback((flowElements) => {
    // Simple validation: ensure there's at least one source and one destination
    const sourceNodes = flowElements.filter(
      el => el.type === 'sourceNode'
    );
    
    const destinationNodes = flowElements.filter(
      el => el.type === 'destinationNode'
    );
    
    const edges = flowElements.filter(el => el.source && el.target);
    
    const errors = {};
    const isValid = sourceNodes.length > 0 && 
                   destinationNodes.length > 0 && 
                   edges.length > 0;
    
    if (!isValid) {
      if (sourceNodes.length === 0) {
        errors.general = 'Flow must include at least one source node';
      } else if (destinationNodes.length === 0) {
        errors.general = 'Flow must include at least one destination node';
      } else if (edges.length === 0) {
        errors.general = 'Nodes must be connected';
      }
    }
    
    setValidationErrors(errors);
    return isValid;
  }, []);
  
  // Handle flow save
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(elements);
    }
  }, [elements, onSave]);
  
  // Handle flow run
  const handleRun = useCallback(() => {
    const isValid = handleValidate(elements);
    if (isValid && onRun) {
      onRun(elements);
    }
  }, [elements, handleValidate, onRun]);
  
  // Handle reset flow
  const handleReset = useCallback(() => {
    setElements(initialElements);
    setSelectedElement(null);
  }, [initialElements]);
  
  // Render node properties panel
  const renderNodeProperties = () => {
    if (!selectedElement || selectedElement.type !== 'node') {
      return (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          Select a node to view properties
        </Box>
      );
    }
    
    // In a real implementation, this would show a form for editing the node
    return (
      <Box sx={{ p: 2 }}>
        <h3>Node Properties</h3>
        <p>ID: {selectedElement.id}</p>
        <p>Type: {selectedElement.type}</p>
        {/* More properties would go here */}
      </Box>
    );
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper elevation={1} sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', p: 1, alignItems: 'center' }}>
          <Tooltip title="Save Flow">
            <IconButton onClick={handleSave} disabled={readOnly}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Run Flow">
            <IconButton onClick={handleRun} color="primary">
              <RunIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reset Flow">
            <IconButton onClick={handleReset} disabled={readOnly}>
              <ResetIcon />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <Tooltip title="View History">
            <IconButton>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="View JSON">
            <IconButton>
              <CodeIcon />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Tooltip title="Fullscreen">
            <IconButton>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <Grid container spacing={1} sx={{ height: '100%' }}>
          {/* Node panel (left sidebar) */}
          <Grid item xs={2} sx={{ height: '100%' }}>
            <NodePanel 
              userPermissions={userPermissions} 
              onRefresh={() => {}} // Placeholder for refresh functionality
            />
          </Grid>
          
          {/* Flow canvas (center) */}
          <Grid item xs={8} sx={{ height: '100%' }}>
            <Paper 
              elevation={2} 
              sx={{ height: '100%', overflow: 'hidden' }}
            >
              <FlowCanvas
                initialElements={elements}
                readOnly={readOnly}
                onChange={handleElementsChange}
                onSave={handleSave}
                onNodeSelect={handleNodeSelect}
                onEdgeSelect={handleEdgeSelect}
                onValidate={handleValidate}
                validationErrors={validationErrors}
              />
            </Paper>
          </Grid>
          
          {/* Properties panel (right sidebar) */}
          <Grid item xs={2} sx={{ height: '100%' }}>
            <Paper 
              elevation={2} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={sidebarTab}
                onChange={(_, newValue) => setSidebarTab(newValue)}
                variant="fullWidth"
              >
                <Tab label="Info" />
                <Tab label="Properties" />
              </Tabs>
              
              <Divider />
              
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {sidebarTab === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <h3>Flow Information</h3>
                    <p>Nodes: {elements.filter(el => !el.source).length}</p>
                    <p>Connections: {elements.filter(el => el.source).length}</p>
                    {Object.keys(validationErrors).length > 0 && (
                      <Box sx={{ color: 'error.main', mt: 2 }}>
                        <h4>Validation Errors</h4>
                        {Object.entries(validationErrors).map(([key, error]) => (
                          <p key={key}>{error}</p>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : renderNodeProperties()}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

IntegrationFlowCanvas.propTypes = {
  initialElements: PropTypes.array,
  readOnly: PropTypes.bool,
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  onSave: PropTypes.func,
  onRun: PropTypes.func,
  onChange: PropTypes.func,
};

export default IntegrationFlowCanvas;