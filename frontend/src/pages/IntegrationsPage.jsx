// IntegrationsPage.jsx
// -----------------------------------------------------------------------------
// Main page for managing integrations with a table view and an interactive flow editor

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Drawer, 
  IconButton, 
  Typography, 
  Box, 
  Tabs, 
  Tab 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Common components
import Button from '../components/common/Button';
import ChatSupportPanel from '../components/common/ChatSupportPanel';
import IntegrationStatsBar from '../components/common/IntegrationStatsBar';

// Integration specific components
import IntegrationTable from '../components/integration/IntegrationTable';
import IntegrationCreationDialog from '../components/integration/IntegrationCreationDialog';
import IntegrationDetailView from '../components/integration/IntegrationDetailView';
import UserRoleSwitcher from '../components/integration/UserRoleSwitcher';
import { useNavigate } from 'react-router-dom';

// Services (for future backend integration)
import { 
  getIntegrations, 
  createIntegration, 
  updateIntegration, 
  deleteIntegration 
} from '../services/integrationService';

function IntegrationsPage() {
  const navigate = useNavigate();
  
  // State for integration list view
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'canvas'
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'Employee Demo',
      type: 'API-based',
      source: 'Workday (HR)',
      destination: 'Kronos (Time)',
      schedule: 'Daily @ 2am',
      health: 'healthy'
    },
    {
      id: 2,
      name: 'Time to Payroll',
      type: 'API-based',
      source: '7Shifts (Time)',
      destination: 'Paylocity (Payroll)',
      schedule: 'Weekly on Fridays',
      health: 'warning'
    },
    {
      id: 3,
      name: 'File-based Blob Demo',
      type: 'File-based',
      source: 'Azure Blob Container /employees',
      destination: 'Email: hr-dept@company.com',
      schedule: 'Once daily @ 6am',
      health: 'healthy'
    }
  ]);
  
  // State for canvas flow editor
  const [selectedTab, setSelectedTab] = useState(null);
  const [diagramData, setDiagramData] = useState({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State for the creation dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Load integrations on component mount
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        // In a production app, this would use the real API
        // const data = await getIntegrations();
        // setIntegrations(data);
      } catch (error) {
        console.error('Error fetching integrations:', error);
      }
    };
    
    fetchIntegrations();
  }, []);

  // Switch to canvas view for a specific integration
  const handleEditCanvas = (integrationId) => {
    setSelectedTab(integrationId);
    
    // Initialize diagram data if needed
    if (!diagramData[integrationId]) {
      setDiagramData(prev => ({
        ...prev,
        [integrationId]: { nodes: [], edges: [] }
      }));
    }
    
    // Load diagram data
    const { nodes = [], edges = [] } = diagramData[integrationId] || {};
    setNodes(nodes);
    setEdges(edges);
    
    // Switch to canvas view
    setViewMode('canvas');
  };

  // Handle integration actions
  const handleFieldMapping = (integrationId) => {
    // Navigate to the integration detail page with field mappings tab active
    navigate(`/integrations/${integrationId}`);
  };

  const handleModifyIntegration = (integrationId) => {
    handleEditCanvas(integrationId);
  };

  const handleViewRunLog = (integrationId) => {
    // Navigate to the integration detail page with history tab active
    // We'll pass the tab info in the URL state (this would be implemented in the detail page)
    navigate(`/integrations/${integrationId}`, { state: { tab: 'history' } });
  };

  // Canvas event handlers
  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({ ...params, label: 'Flow' }, edges);
      updateDiagramData(nodes, newEdges);
    },
    [nodes, edges]
  );

  const updateDiagramData = (newNodes, newEdges) => {
    setNodes(newNodes);
    setEdges(newEdges);
    setDiagramData(prev => ({ 
      ...prev, 
      [selectedTab]: { nodes: newNodes, edges: newEdges } 
    }));
  };

  // Selection and drawer logic
  const [selection, setSelection] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handlePaneClick = (evt) => {
    const isInsideNoDrag = !!evt.target.closest('.nodrag');
    if (!isInsideNoDrag) setSelection(null);
  };

  const onNodeClick = (evt, node) => {
    evt.stopPropagation();
    setSelection({ type: 'node', id: node.id });
  };

  const onEdgeClick = (evt, edge) => {
    evt.stopPropagation();
    setSelection({ type: 'edge', id: edge.id });
  };

  useEffect(() => {
    setDrawerOpen(!!selection);
  }, [selection]);

  const handleCloseDrawer = () => setSelection(null);

  // Create new integration
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateIntegration = (integrationData) => {
    // In a real app, this would call the backend API
    const newIntegration = {
      id: Date.now(), // temporary ID
      name: integrationData.name,
      type: integrationData.type,
      source: integrationData.source,
      destination: integrationData.destination,
      schedule: integrationData.schedule || 'On demand',
      health: 'healthy'
    };
    
    setIntegrations(prev => [...prev, newIntegration]);
    setCreateDialogOpen(false);
  };

  // Return to table view
  const handleBackToTable = () => {
    setViewMode('table');
    setSelectedTab(null);
  };

  // Handle user role changes
  const handleRoleChange = (role) => {
    console.log(`User role changed to: ${role}`);
    // In a real app, this would update permissions throughout the app
  };

  // Render different views
  const renderTableView = () => (
    <div style={{ padding: '2rem' }}>
      {/* Development helper to switch between roles */}
      <UserRoleSwitcher onRoleChange={handleRoleChange} />
      
      <IntegrationStatsBar 
        total={integrations.length}
        healthy={integrations.filter(i => i.health === 'healthy').length}
        warnings={integrations.filter(i => i.health === 'warning').length}
        errors={integrations.filter(i => i.health === 'error').length}
      />
      
      <div style={{ marginBottom: '1rem' }}>
        <Button 
          style={{ backgroundColor: '#48C2C5' }}
          onClick={handleOpenCreateDialog}
        >
          Create New Integration
        </Button>
      </div>
      
      <IntegrationTable 
        integrations={integrations}
        onFieldMapping={handleFieldMapping}
        onModify={handleModifyIntegration}
        onViewRunLog={handleViewRunLog}
      />
    </div>
  );

  const renderCanvasView = () => {
    const currentIntegration = integrations.find(i => i.id === selectedTab);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ 
          padding: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <div>
            <Button 
              style={{ backgroundColor: '#999', marginRight: '1rem' }}
              onClick={handleBackToTable}
            >
              Back to Integrations
            </Button>
            
            <span style={{ fontWeight: 'bold' }}>
              Editing: {currentIntegration?.name}
            </span>
          </div>
          
          <Button 
            style={{ backgroundColor: '#48C2C5' }}
            onClick={() => console.log('Saving integration...')}
          >
            Save Changes
          </Button>
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onPaneClick={handlePaneClick}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
              style={{ width: '100%', height: '100%' }}
            >
              <MiniMap />
              <Controls />
              <Background color="#eee" gap={16} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div style={{ height: 'calc(100vh - 120px)' }}>
      {viewMode === 'table' ? renderTableView() : renderCanvasView()}
      
      <ChatSupportPanel />
      
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 320, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selection?.type === 'node' ? 'Node Properties' : 'Connection Properties'}
            </Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography sx={{ mt: 2 }}>
            {selection?.type === 'node' 
              ? 'Configure node properties here...' 
              : 'Configure connection properties here...'}
          </Typography>
        </Box>
      </Drawer>
      
      <IntegrationCreationDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onCreate={handleCreateIntegration}
      />
    </div>
  );
}

export default IntegrationsPage;